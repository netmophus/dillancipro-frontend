import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Button,
  Stack,
} from "@mui/material";
import {
  Close,
  Map as MapIcon,
  VideoLibrary,
  Description,
  Dashboard as DashboardIcon,
  GridOn,
  Apartment,
  LocationOn,
  GpsFixed,
  Directions,
  Business,
  Phone,
  PictureAsPdf,
  OpenInNew,
  Notes,
  Videocam,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BASE_SERVER_URL } from "../../config/config";

// Charte
const BLUE = "#3030F9";
const BLUE_DARK = "#2020C8";
const GREEN = "#0A7C4F";
const GREEN_DARK = "#065F3D";
const GREEN_LIGHT = "#E3F5EC";
const NIGHT = "#0e1133";
const SKY = "#EAF0FF";
const GREY_BG = "#f5f7fa";
const BORDER = "#e5e7eb";

// Statut de la parcelle : vert charte si à vendre, couleurs fonctionnelles sinon
const STATUTS = {
  avendre: { label: "À vendre", color: GREEN },
  vendue: { label: "Vendue", color: "#d32f2f" },
  reserved: { label: "Réservée", color: "#B45309" },
  reservee: { label: "Réservée", color: "#B45309" },
};

// Fix pour les icônes Leaflet par défaut
if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Fonction utilitaire pour corriger les URLs d'images
const fixImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Corriger les séparateurs de chemin
  const correctedPath = imageUrl.replace(/\\/g, '/');

  // Si l'URL commence déjà par http, la retourner telle quelle
  if (correctedPath.startsWith('http')) {
    return correctedPath;
  }

  // Sinon, construire l'URL complète
  return `${BASE_SERVER_URL}/${correctedPath}`;
};

// Conversion degrés décimaux -> degrés/minutes/secondes
const decimalToDMS = (value, type) => {
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  const abs = Math.abs(n);
  const d = Math.floor(abs);
  const mf = (abs - d) * 60;
  const m = Math.floor(mf);
  const s = ((mf - m) * 60).toFixed(1);
  const dir = type === "lat" ? (n >= 0 ? "N" : "S") : n >= 0 ? "E" : "O";
  return `${d}° ${m}' ${s}" ${dir}`;
};

// Fonction pour obtenir l'URL d'embed vidéo
const getVideoEmbedUrl = (videoUrl) => {
  if (!videoUrl) return null;

  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = videoUrl.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const vimeoMatch = videoUrl.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
};

// Fonction pour obtenir l'URL de navigation
const getNavigationUrl = (latitude, longitude) => {
  if (!latitude || !longitude) return null;
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
};

// Fonction pour extraire le nom de fichier d'une URL
const getFileNameFromUrl = (url) => {
  if (!url) return "Document";

  try {
    // Si c'est une URL complète, extraire le nom de fichier
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      // Si ce n'est pas une URL valide, essayer d'ajouter http://
      urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    }

    const pathname = urlObj.pathname;
    let fileName = pathname.split('/').pop() || pathname.split('\\').pop();

    // Si le nom de fichier est vide ou ne contient pas d'extension, essayer de le récupérer autrement
    if (!fileName || !fileName.includes('.')) {
      // Pour Cloudinary, le nom peut être dans le chemin avant les transformations
      const pathParts = pathname.split('/');
      for (let i = pathParts.length - 1; i >= 0; i--) {
        if (pathParts[i] && pathParts[i].includes('.')) {
          fileName = pathParts[i];
          break;
        }
      }
    }

    // Décoder les caractères encodés et retirer les paramètres de requête
    fileName = decodeURIComponent(fileName.split('?')[0].split('#')[0]);

    // Si toujours pas de nom valide, utiliser un nom générique avec l'extension
    if (!fileName || fileName === '') {
      // Essayer de détecter le type depuis l'URL ou les paramètres
      const extension = url.match(/\.([a-zA-Z0-9]+)(\?|$)/)?.[1] || 'pdf';
      fileName = `document.${extension}`;
    }

    return fileName || "Document";
  } catch (e) {
    // Si tout échoue, essayer d'extraire le nom depuis le chemin directement
    try {
      const parts = url.split('/');
      let fileName = parts[parts.length - 1];
      if (fileName && fileName.includes('.')) {
        fileName = decodeURIComponent(fileName.split('?')[0].split('#')[0]);
        return fileName || "Document";
      }
      // Si pas de nom trouvé, utiliser l'extension détectée
      const extension = url.match(/\.([a-zA-Z0-9]+)(\?|$)/)?.[1] || 'pdf';
      return `document.${extension}`;
    } catch (err) {
      return "Document";
    }
  }
};

// Titre de section (hors cartes à en-tête coloré)
const SectionTitle = ({ icon: Icon, children, color = NIGHT }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, color }}>
    <Icon sx={{ fontSize: 20 }} />
    <Typography component="h3" sx={{ fontSize: 15, fontWeight: 700, color }}>
      {children}
    </Typography>
  </Box>
);

const ParcelleDetailDrawer = ({ open, onClose, selectedParcelle, onParcelleUpdate }) => {
  const [localParcelle, setLocalParcelle] = useState(selectedParcelle);

  // Normaliser les données de la parcelle pour gérer les deux structures
  const normalizeParcelle = (parcelle) => {
    if (!parcelle) return null;

    return {
      ...parcelle,
      // Gérer les deux structures : ref ou numeroParcelle
      ref: parcelle.ref || parcelle.numeroParcelle || "N/A",
      // Gérer les deux structures : ilot (string) ou ilot.numeroIlot
      ilot: typeof parcelle.ilot === 'string'
        ? parcelle.ilot
        : (parcelle.ilot?.numeroIlot || "N/A"),
      // Lotissement de l'îlot (facultatif : les anciens îlots n'en ont pas)
      lotissementNom: parcelle.lotissementNom || parcelle.ilot?.lotissement?.nom || "",
      // Cité / quartier de l'îlot
      zoneNom: parcelle.ilot?.zone?.nom || "",
      quartierNom: parcelle.ilot?.zone?.quartier?.nom || parcelle.ilot?.quartier?.nom || "",
      // Gérer les images/photos
      images: parcelle.images || parcelle.photos || [],
      // Gérer la ville
      ville: parcelle.ville ||
             parcelle.ilot?.quartier?.ville?.nom ||
             parcelle.ilot?.zone?.quartier?.ville?.nom ||
             "Ville non spécifiée",
      // Gérer les coordonnées GPS
      latitude: parcelle.latitude || parcelle.localisation?.lat || parcelle.localisation?.latitude || null,
      longitude: parcelle.longitude || parcelle.localisation?.lng || parcelle.localisation?.longitude || null,
      // Gérer l'agence
      agenceNom: parcelle.agenceNom || parcelle.agenceId?.nom || "",
      agenceTelephone: parcelle.agenceTelephone || parcelle.agenceId?.telephone || "",
    };
  };

  // Mettre à jour la parcelle locale quand selectedParcelle change
  React.useEffect(() => {
    setLocalParcelle(normalizeParcelle(selectedParcelle));
  }, [selectedParcelle]);

  const handleImageClick = (index) => {
    if (!localParcelle || !localParcelle.images || localParcelle.images.length <= 1) return;

    // Remplacer la photo principale par celle cliquée
    const newImages = [...localParcelle.images];
    newImages[0] = localParcelle.images[index + 1];
    newImages[index + 1] = localParcelle.images[0];

    const updatedParcelle = {
      ...localParcelle,
      images: newImages
    };

    setLocalParcelle(updatedParcelle);
    if (onParcelleUpdate) {
      onParcelleUpdate(updatedParcelle);
    }
  };

  const hasGps = !!(localParcelle?.latitude && localParcelle?.longitude);
  const villeConnue = localParcelle && localParcelle.ville !== "Ville non spécifiée";
  const ilotConnu = localParcelle && localParcelle.ilot && localParcelle.ilot !== "N/A";
  const statut = localParcelle ? STATUTS[localParcelle.statut] : null;
  const quartierVille = localParcelle
    ? [localParcelle.zoneNom, localParcelle.quartierNom, villeConnue ? localParcelle.ville : ""].filter(Boolean).join(", ")
    : "";
  const hasDocs = !!(localParcelle?.documents && localParcelle.documents.length > 0);
  const hasVideos = !!(localParcelle?.videos && localParcelle.videos.length > 0);

  // Bouton "Carte" : OpenStreetMap sur la position, ou recherche textuelle sans GPS
  const handleVoirCarte = () => {
    if (hasGps) {
      const osmUrl = getNavigationUrl(localParcelle.latitude, localParcelle.longitude);
      if (osmUrl) window.open(osmUrl, "_blank");
      return;
    }
    const searchUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${localParcelle.ville} Îlot ${localParcelle.ilot}, Parcelle ${localParcelle.ref}`)}`;
    window.open(searchUrl, "_blank");
  };

  // Bouton "Itinéraire" : depuis la position de l'utilisateur, avec repli sur la recherche
  const handleItineraire = () => {
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${localParcelle.latitude},${localParcelle.longitude}`;
    try {
      if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par votre navigateur");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${localParcelle.latitude},${localParcelle.longitude}`;
          window.open(googleMapsUrl, "_blank");
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          let errorMsg = "Impossible d'obtenir votre position. ";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += "Veuillez autoriser l'accès à votre position dans les paramètres du navigateur.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += "Votre position n'est pas disponible.";
              break;
            case error.TIMEOUT:
              errorMsg += "La demande de position a expiré.";
              break;
            default:
              errorMsg += "Une erreur est survenue lors de la récupération de votre position.";
              break;
          }
          alert(errorMsg);
          window.open(fallbackUrl, "_blank");
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Erreur:", error);
      window.open(fallbackUrl, "_blank");
    }
  };

  const openGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/@${localParcelle.latitude},${localParcelle.longitude},18z`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: "90%", md: 600, lg: 700 },
          bgcolor: GREY_BG,
        },
      }}
    >
      {/* Tout défile d'un seul bloc : en-tête, contenu et documents */}
      <Box sx={{ minHeight: "100%", bgcolor: GREY_BG }}>
        {/* 1. En-tête bleu nuit */}
        <Box sx={{ bgcolor: NIGHT, color: "#fff", p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MapIcon sx={{ fontSize: 24, color: "#fff" }} />
              </Box>
              <Typography
                component="h2"
                sx={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.25, wordBreak: "break-word" }}
              >
                {localParcelle ? `Parcelle ${localParcelle.ref}` : "Détails de la parcelle"}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              aria-label="Fermer"
              sx={{
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#fff",
                flexShrink: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {localParcelle && (
            <>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                <Box
                  sx={{
                    bgcolor: BLUE,
                    color: "#fff",
                    px: 1.4,
                    py: 0.5,
                    borderRadius: "999px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Parcelle
                </Box>
                {statut && (
                  <Box
                    sx={{
                      bgcolor: "#fff",
                      color: statut.color,
                      px: 1.4,
                      py: 0.5,
                      borderRadius: "999px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}
                  >
                    {statut.label}
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 2 }}>
                <Box sx={{ bgcolor: BLUE, borderRadius: "12px", p: 1.75 }}>
                  <Typography sx={{ fontSize: 10, color: "#fff", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Prix
                  </Typography>
                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.3, mt: 0.25 }}>
                    {localParcelle.prix > 0 ? (
                      <>
                        {new Intl.NumberFormat("fr-FR").format(localParcelle.prix)}{" "}
                        <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                          FCFA
                        </Box>
                      </>
                    ) : (
                      "Sur demande"
                    )}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: GREEN, borderRadius: "12px", p: 1.75 }}>
                  <Typography sx={{ fontSize: 10, color: "#fff", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Surface
                  </Typography>
                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.3, mt: 0.25 }}>
                    {localParcelle.superficie > 0 ? (
                      <>
                        {localParcelle.superficie}{" "}
                        <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                          m²
                        </Box>
                      </>
                    ) : (
                      "Non renseignée"
                    )}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {localParcelle ? (
          <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.25 }}>
            {/* 2. Photos */}
            {localParcelle.images && localParcelle.images.length > 0 && (
              <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", p: 1.5 }}>
                <SectionTitle icon={MapIcon}>Photos de la parcelle</SectionTitle>
                <Box sx={{ height: { xs: 220, sm: 260 }, borderRadius: "12px", overflow: "hidden", bgcolor: "#d9e2ec", mb: 1.5 }}>
                  <Box
                    component="img"
                    src={fixImageUrl(localParcelle.images[0])}
                    alt={localParcelle.ref}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='16'%3EImage%20non%20disponible%3C/text%3E%3C/svg%3E";
                      e.target.onerror = null;
                    }}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                {localParcelle.images.length > 1 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {localParcelle.images.slice(1).map((img, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={fixImageUrl(img)}
                        alt={`${localParcelle.ref} - Image ${idx + 2}`}
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='10'%3EN/A%3C/text%3E%3C/svg%3E";
                          e.target.onerror = null;
                        }}
                        onClick={() => handleImageClick(idx)}
                        sx={{
                          width: 66,
                          height: 66,
                          objectFit: "cover",
                          borderRadius: "10px",
                          cursor: "pointer",
                          border: "2px solid transparent",
                          bgcolor: "#d9e2ec",
                          "&:hover": { borderColor: BLUE },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* 3. Localisation : cartes blanches en grille sur fond bleu ciel */}
            <Box sx={{ bgcolor: SKY, borderRadius: "14px", p: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: BLUE_DARK, mb: 1.25 }}>
                <LocationOn sx={{ fontSize: 20 }} />
                <Typography component="h3" sx={{ fontSize: 15, fontWeight: 700, color: BLUE_DARK }}>
                  Localisation
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: "8px",
                }}
              >
                {[
                  localParcelle.lotissementNom && { key: "lot", icon: DashboardIcon, label: "Lotissement", value: localParcelle.lotissementNom },
                  ilotConnu && { key: "ilot", icon: GridOn, label: "Îlot", value: localParcelle.ilot },
                  quartierVille && { key: "loc", icon: Apartment, label: "Localité", value: quartierVille },
                  localParcelle.adresse && { key: "adr", icon: MapIcon, label: "Adresse", value: localParcelle.adresse },
                  hasGps && {
                    key: "gps",
                    icon: GpsFixed,
                    label: "Coordonnées GPS",
                    value: (
                      <>
                        <Box component="span" sx={{ display: "block" }}>
                          Lat: {localParcelle.latitude} / Lng: {localParcelle.longitude}
                        </Box>
                        {decimalToDMS(localParcelle.latitude, "lat") && decimalToDMS(localParcelle.longitude, "lon") && (
                          <Box component="span" sx={{ display: "block", fontSize: 11.5, fontWeight: 500, color: "#5b6573", mt: 0.25 }}>
                            {decimalToDMS(localParcelle.latitude, "lat")} / {decimalToDMS(localParcelle.longitude, "lon")}
                          </Box>
                        )}
                      </>
                    ),
                  },
                ]
                  .filter(Boolean)
                  .map((info, idx, arr) => (
                    <Box
                      key={info.key}
                      sx={{
                        bgcolor: "#fff",
                        borderRadius: "9px",
                        p: "9px 11px",
                        minWidth: 0,
                        // Une info seule, ou la dernière d'un nombre impair : pleine largeur
                        gridColumn: arr.length % 2 === 1 && idx === arr.length - 1 ? { xs: "auto", sm: "1 / -1" } : "auto",
                      }}
                    >
                      <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 10, fontWeight: 600, color: "#5b6573", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        <info.icon sx={{ fontSize: 14, color: BLUE }} />
                        {info.label}
                      </Typography>
                      <Typography component="div" sx={{ fontSize: 13.5, fontWeight: 700, color: NIGHT, mt: 0.25, wordBreak: "break-word" }}>
                        {info.value}
                      </Typography>
                    </Box>
                  ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1, mt: 1.25 }}>
                <Button
                  fullWidth
                  disableElevation
                  startIcon={<MapIcon />}
                  onClick={handleVoirCarte}
                  sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#fff", color: BLUE_DARK, "&:hover": { bgcolor: "#f5f7fa" } }}
                >
                  Carte
                </Button>
                {hasGps && (
                  <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    startIcon={<Directions />}
                    onClick={handleItineraire}
                    sx={{ textTransform: "none", fontWeight: 700, bgcolor: BLUE, color: "#fff", "&:hover": { bgcolor: BLUE_DARK } }}
                  >
                    Itinéraire
                  </Button>
                )}
              </Box>
            </Box>

            {/* 4. Carte interactive */}
            {hasGps && (
              <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: "14px", overflow: "hidden", bgcolor: "#fff" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, px: 2, py: 1.25, bgcolor: NIGHT }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#fff" }}>
                    <MapIcon sx={{ fontSize: 20 }} />
                    <Typography component="h3" sx={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                      Sur la carte
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                    onClick={openGoogleMaps}
                    sx={{ textTransform: "none", fontWeight: 700, color: "#B5D4F4", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
                  >
                    Google Maps
                  </Button>
                </Box>
                <Box sx={{ height: 360 }}>
                  <MapContainer
                    center={[localParcelle.latitude, localParcelle.longitude]}
                    zoom={18}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                    minZoom={10}
                    maxZoom={19}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                    />
                    <Marker
                      position={[localParcelle.latitude, localParcelle.longitude]}
                      icon={L.icon({
                        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                        shadowSize: [41, 41],
                        shadowAnchor: [12, 41]
                      })}
                    >
                      <Popup>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Parcelle {localParcelle.ref}
                        </Typography>
                        <Typography variant="body2">
                          Îlot {localParcelle.ilot}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {localParcelle.latitude}, {localParcelle.longitude}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          disableElevation
                          sx={{ mt: 1, display: "flex", textTransform: "none", bgcolor: BLUE, "&:hover": { bgcolor: BLUE_DARK } }}
                          onClick={openGoogleMaps}
                        >
                          Voir sur Google Maps
                        </Button>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              </Box>
            )}

            {/* 5. Description */}
            {localParcelle.description && (
              <Box sx={{ bgcolor: GREEN_LIGHT, borderRadius: "14px", p: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: GREEN_DARK, mb: 1 }}>
                  <Notes sx={{ fontSize: 20 }} />
                  <Typography component="h3" sx={{ fontSize: 15, fontWeight: 700, color: GREEN_DARK }}>
                    Description
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 14, lineHeight: 1.65, color: NIGHT }}>
                  {localParcelle.description}
                </Typography>
              </Box>
            )}

            {/* 6. Agence */}
            {localParcelle.agenceNom && (
              <Box sx={{ bgcolor: NIGHT, borderRadius: "14px", p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Business sx={{ fontSize: 22 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#fff", opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Agence
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff", wordBreak: "break-word" }}>
                    {localParcelle.agenceNom}
                  </Typography>
                  {localParcelle.agenceTelephone && (
                    <Typography sx={{ fontSize: 12.5, color: "#fff", opacity: 0.85 }}>
                      {localParcelle.agenceTelephone}
                    </Typography>
                  )}
                </Box>
                {localParcelle.agenceTelephone && (
                  <Button
                    component="a"
                    href={`tel:${String(localParcelle.agenceTelephone).replace(/[^\d+]/g, "")}`}
                    variant="contained"
                    disableElevation
                    startIcon={<Phone />}
                    sx={{ flexShrink: 0, textTransform: "none", fontWeight: 700, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DARK } }}
                  >
                    Appeler
                  </Button>
                )}
              </Box>
            )}

            {/* 7. Documents et médias */}
            {hasVideos && (
              <Box sx={{ bgcolor: SKY, borderRadius: "14px", p: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: BLUE_DARK, mb: 1.25 }}>
                  <Videocam sx={{ fontSize: 20 }} />
                  <Typography component="h3" sx={{ fontSize: 15, fontWeight: 700, color: BLUE_DARK }}>
                    Vidéos ({localParcelle.videos.length})
                  </Typography>
                </Box>
                    <Stack spacing={2}>
                      {localParcelle.videos.map((videoUrl, idx) => {
                        const embedUrl = getVideoEmbedUrl(videoUrl);
                        return (
                          <Box key={idx}>
                            {embedUrl && embedUrl.startsWith('http') ? (
                              <Box
                                sx={{
                                  position: "relative",
                                  width: "100%",
                                  paddingTop: "56.25%", // 16:9 aspect ratio
                                  borderRadius: "12px",
                                  overflow: "hidden",
                                  bgcolor: "#000",
                                }}
                              >
                                <iframe
                                  src={embedUrl}
                                  title={`Vidéo ${idx + 1}`}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                  }}
                                />
                              </Box>
                            ) : (
                              <Button
                                component="a"
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<VideoLibrary />}
                                fullWidth
                                disableElevation
                                sx={{ py: 1.25, textTransform: "none", fontWeight: 700, bgcolor: SKY, color: BLUE_DARK, "&:hover": { bgcolor: "#D9E4FF" } }}
                              >
                                Voir la vidéo {idx + 1}
                              </Button>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                )}


            {hasDocs && (
              <Box sx={{ bgcolor: SKY, borderRadius: "14px", p: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: BLUE_DARK, mb: 1.25 }}>
                  <Description sx={{ fontSize: 20 }} />
                  <Typography component="h3" sx={{ fontSize: 15, fontWeight: 700, color: BLUE_DARK }}>
                    Documents ({localParcelle.documents.length})
                  </Typography>
                </Box>
                <Stack spacing={0.75}>
                  {localParcelle.documents.map((docUrl, idx) => {
                    const fileName = getFileNameFromUrl(docUrl);
                    const fullUrl = fixImageUrl(docUrl);

                    return (
                      <Box
                        key={idx}
                        component="a"
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={fileName}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          px: 1.5,
                          py: 1.1,
                          bgcolor: "#fff",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: NIGHT,
                          "&:hover": { bgcolor: "#f5f7fa" },
                        }}
                      >
                        <PictureAsPdf sx={{ fontSize: 22, color: "#d32f2f", flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: NIGHT, wordBreak: "break-word", flex: 1, minWidth: 0 }}>
                          {fileName}
                        </Typography>
                        <OpenInNew sx={{ fontSize: 18, color: BLUE_DARK, flexShrink: 0 }} />
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Typography variant="h6" color="text.secondary">
              Aucune parcelle sélectionnée
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default ParcelleDetailDrawer;
