import React, { useState, useEffect } from "react";
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
  LocalOffer,
  SquareFoot,
  InsertDriveFileOutlined,
  ImageOutlined,
  TableChartOutlined,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BASE_SERVER_URL } from "../../config/config";

// Charte verte de la page /parcelles
const GREEN = "#008557";
const GREEN_DEEP = "#005C48";
const LIME = "#84CC16";
const GREEN_LIGHT = "#DCF5E5";
const GREEN_SOFT = "#E5F5EB";
const NIGHT = "#101C36";
const GREY_BG = "#F1F4F7";
const GREY_BLOCK = "#E9EEF3";
const MUTED = "#475569";
const BORDER = "#E2E8F0";
const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";
const PLACEHOLDER = "/images/parcelle-placeholder.webp";

// Statut de la parcelle : vert si à vendre, couleurs fonctionnelles sinon
const STATUTS = {
  avendre: { label: "À vendre", bg: GREEN_LIGHT, color: GREEN_DEEP },
  vendue: { label: "Vendue", bg: "#fff", color: "#d32f2f" },
  reserved: { label: "Réservée", bg: "#fff", color: "#B45309" },
  reservee: { label: "Réservée", bg: "#fff", color: "#B45309" },
};

// Marqueur vert (SVG, sans image externe)
const greenPin = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path d="M17 1C8.7 1 2 7.6 2 15.8 2 27 17 43 17 43s15-16 15-27.2C32 7.6 25.3 1 17 1z" fill="#008557" stroke="#fff" stroke-width="2"/><circle cx="17" cy="16" r="6" fill="#fff"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
  popupAnchor: [0, -40],
});

// Recalcule la taille de la carte après l'ouverture / l'animation du Drawer (évite zones grises et tuiles manquantes)
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timers = [100, 400, 900].map((ms) => setTimeout(() => map.invalidateSize(), ms));
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
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

const ParcelleDetailDrawer = ({ open, onClose, selectedParcelle, onParcelleUpdate }) => {
  const [localParcelle, setLocalParcelle] = useState(selectedParcelle);
  const [photoBroken, setPhotoBroken] = useState(false);

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
    setPhotoBroken(false);
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

  const realPhoto = localParcelle?.images?.length > 0 && !photoBroken;
  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n).replace(/[  ]/g, " ");

  // Icône selon le type de fichier
  const docIcon = (name) => {
    const ext = (name.split(".").pop() || "").toLowerCase();
    if (ext === "pdf") return <PictureAsPdf sx={{ fontSize: 26, color: "#d32f2f", flexShrink: 0 }} />;
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return <ImageOutlined sx={{ fontSize: 26, color: GREEN, flexShrink: 0 }} />;
    if (["xls", "xlsx", "csv"].includes(ext)) return <TableChartOutlined sx={{ fontSize: 26, color: GREEN, flexShrink: 0 }} />;
    if (["doc", "docx", "txt"].includes(ext)) return <Description sx={{ fontSize: 26, color: "#1859E8", flexShrink: 0 }} />;
    return <InsertDriveFileOutlined sx={{ fontSize: 26, color: MUTED, flexShrink: 0 }} />;
  };

  const sectionTitle = (Icon, text, color = NIGHT, extra = null) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color, mb: 1.5 }}>
      <Icon sx={{ fontSize: 24, color: color === NIGHT ? GREEN : color }} />
      <Typography component="h3" sx={{ fontFamily: FONT, fontSize: 19, fontWeight: 700, color, flex: 1 }}>
        {text}
      </Typography>
      {extra}
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "100%",
          "@media (min-width:768px)": { width: "min(92vw, 640px)" },
          "@media (min-width:1024px)": { width: 720 },
          height: "100dvh",
          maxHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          bgcolor: GREY_BG,
          fontFamily: FONT,
        },
      }}
    >
      {/* 1. En-tête fixe : reste visible pendant le défilement */}
      <Box
        sx={{
          position: "relative",
          flexShrink: 0,
          overflow: "hidden",
          bgcolor: GREEN_DEEP,
          color: "#fff",
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.75, sm: 2.25 },
        }}
      >
        <Box component="svg" viewBox="0 0 220 140" aria-hidden="true" sx={{ position: "absolute", top: 0, right: 0, width: { xs: 130, sm: 200 }, height: { xs: 84, sm: 128 }, pointerEvents: "none" }}>
          <path d="M220 0 V100 C 175 92, 130 50, 120 0 Z" fill={LIME} fillOpacity="0.5" />
          <path d="M220 0 V56 C 195 50, 170 28, 164 0 Z" fill="#fff" fillOpacity="0.16" />
        </Box>
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MapIcon sx={{ fontSize: 28, color: "#fff" }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h2" sx={{ fontFamily: FONT, fontSize: "clamp(21px, 5.6vw, 28px)", fontWeight: 800, color: "#fff", lineHeight: 1.2, wordBreak: "break-word" }}>
                {localParcelle ? `Parcelle ${localParcelle.ref}` : "Détails de la parcelle"}
              </Typography>
              {localParcelle && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.75 }}>
                  <Box sx={{ bgcolor: GREEN, color: "#fff", px: 1.4, py: 0.35, borderRadius: "999px", fontSize: 12, fontWeight: 700, letterSpacing: 0.4 }}>PARCELLE</Box>
                  {statut && (
                    <Box sx={{ bgcolor: statut.bg, color: statut.color, px: 1.4, py: 0.35, borderRadius: "999px", fontSize: 12, fontWeight: 700 }}>{statut.label}</Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Fermer"
            sx={{ width: 40, height: 40, bgcolor: "#fff", color: GREEN_DEEP, flexShrink: 0, "&:hover": { bgcolor: GREEN_LIGHT } }}
          >
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Contenu défilant */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
        {localParcelle ? (
          <Box sx={{ p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* 2. Photographie */}
            <Box>
              <Box sx={{ position: "relative", height: { xs: 175, sm: 210 }, borderRadius: "14px", overflow: "hidden", bgcolor: GREEN_DEEP }}>
                {realPhoto ? (
                  <Box
                    component="img"
                    src={fixImageUrl(localParcelle.images[0])}
                    alt={`Parcelle ${localParcelle.ref}`}
                    onError={() => setPhotoBroken(true)}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <>
                    <Box component="img" src={PLACEHOLDER} alt="Image illustrative de parcelle" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <Box sx={{ position: "absolute", left: 12, bottom: 10, px: 1, py: 0.25, borderRadius: "6px", bgcolor: "rgba(16,28,54,0.6)", color: "#fff", fontSize: 11.5, fontFamily: FONT }}>
                      Image illustrative
                    </Box>
                  </>
                )}
              </Box>
              {realPhoto && localParcelle.images.length > 1 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  {localParcelle.images.slice(1).map((img, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={fixImageUrl(img)}
                      alt={`Parcelle ${localParcelle.ref} - image ${idx + 2}`}
                      onError={(e) => { e.target.style.display = "none"; }}
                      onClick={() => handleImageClick(idx)}
                      sx={{ width: 64, height: 64, objectFit: "cover", borderRadius: "10px", cursor: "pointer", border: "2px solid transparent", bgcolor: "#d9e2ec", "&:hover": { borderColor: GREEN } }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* 3. Prix et superficie */}
            <Box sx={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr", "@media (min-width:420px)": { gridTemplateColumns: "1fr 1fr" } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: GREEN_DEEP, borderRadius: "14px", p: "14px 16px", minWidth: 0, minHeight: 84 }}>
                <LocalOffer sx={{ fontSize: 40, color: "#fff", flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#fff" }}>Prix</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: { xs: 21, sm: 26 }, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                    {localParcelle.prix > 0 ? (
                      <>
                        {fmt(localParcelle.prix)}{" "}
                        <Box component="span" sx={{ fontSize: 13, fontWeight: 700 }}>FCFA</Box>
                      </>
                    ) : (
                      <Box component="span" sx={{ fontSize: 16 }}>Sur demande</Box>
                    )}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: GREEN_LIGHT, borderRadius: "14px", p: "14px 16px", minWidth: 0, minHeight: 84 }}>
                <SquareFoot sx={{ fontSize: 40, color: GREEN, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NIGHT }}>Surface</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: { xs: 21, sm: 26 }, fontWeight: 800, color: NIGHT, lineHeight: 1.2 }}>
                    {localParcelle.superficie > 0 ? (
                      <>
                        {fmt(localParcelle.superficie)}{" "}
                        <Box component="span" sx={{ fontSize: 13, fontWeight: 700 }}>m²</Box>
                      </>
                    ) : (
                      <Box component="span" sx={{ fontSize: 16 }}>Non renseignée</Box>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 4. Localisation */}
            <Box sx={{ bgcolor: GREY_BLOCK, borderRadius: "14px", p: "14px" }}>
              {sectionTitle(LocationOn, "Localisation")}
              <Box sx={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr", "@media (min-width:420px)": { gridTemplateColumns: "1fr 1fr" } }}>
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
                          {localParcelle.latitude}, {localParcelle.longitude}
                        </Box>
                        {decimalToDMS(localParcelle.latitude, "lat") && decimalToDMS(localParcelle.longitude, "lon") && (
                          <Box component="span" sx={{ display: "block", fontSize: 12, fontWeight: 500, color: MUTED, mt: 0.25 }}>
                            {decimalToDMS(localParcelle.latitude, "lat")} / {decimalToDMS(localParcelle.longitude, "lon")}
                          </Box>
                        )}
                      </>
                    ),
                  },
                ]
                  .filter(Boolean)
                  .map((info) => (
                    <Box key={info.key} sx={{ bgcolor: "#fff", borderRadius: "12px", p: "12px", minWidth: 0, display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                      <info.icon sx={{ fontSize: 24, color: GREEN, flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, lineHeight: 1.3 }}>{info.label}</Typography>
                        <Typography component="div" sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: NIGHT, mt: 0.25, overflowWrap: "anywhere" }}>
                          {info.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Box>

              {/* 5. Boutons Carte et Itinéraire */}
              <Box sx={{ display: "flex", gap: 1.25, mt: 1.5, flexWrap: "wrap" }}>
                <Button
                  disableElevation
                  startIcon={<MapIcon />}
                  onClick={handleVoirCarte}
                  sx={{ flex: "1 1 140px", height: 46, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 15, bgcolor: "#fff", color: GREEN, border: `1.5px solid ${GREEN}`, "&:hover": { bgcolor: GREEN_SOFT } }}
                >
                  Carte
                </Button>
                {hasGps && (
                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={<Directions />}
                    onClick={handleItineraire}
                    sx={{ flex: "1 1 140px", height: 46, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 15, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}
                  >
                    Itinéraire
                  </Button>
                )}
              </Box>
            </Box>

            {/* 6. Carte interactive (marqueur seul : aucune limite de parcelle n'est enregistrée) */}
            {hasGps && (
              <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: "14px", overflow: "hidden", bgcolor: "#fff", boxShadow: "0 2px 8px rgba(16,28,54,0.06)" }}>
                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", gap: 1, px: 2, py: 1.25, bgcolor: GREY_BLOCK }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MapIcon sx={{ fontSize: 24, color: GREEN }} />
                    <Typography component="h3" sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NIGHT }}>Sur la carte</Typography>
                  </Box>
                  <Button
                    size="small"
                    endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                    onClick={openGoogleMaps}
                    sx={{ textTransform: "none", fontFamily: FONT, fontWeight: 700, color: GREEN, "&:hover": { bgcolor: GREEN_SOFT } }}
                  >
                    Ouvrir dans Google Maps
                  </Button>
                </Box>
                <Box sx={{ height: { xs: 240, sm: 280 }, p: 1 }}>
                  <MapContainer
                    center={[localParcelle.latitude, localParcelle.longitude]}
                    zoom={18}
                    style={{ height: "100%", width: "100%", borderRadius: 12 }}
                    scrollWheelZoom={true}
                    minZoom={10}
                    maxZoom={19}
                  >
                    <MapResizer />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                    />
                    <Marker position={[localParcelle.latitude, localParcelle.longitude]} icon={greenPin}>
                      <Popup>
                        <Typography variant="subtitle2" fontWeight="bold">Parcelle {localParcelle.ref}</Typography>
                        <Typography variant="body2">Îlot {localParcelle.ilot}</Typography>
                        <Typography variant="caption" color="text.secondary">{localParcelle.latitude}, {localParcelle.longitude}</Typography>
                        <Button
                          size="small"
                          variant="contained"
                          disableElevation
                          sx={{ mt: 1, display: "flex", textTransform: "none", bgcolor: GREEN, "&:hover": { bgcolor: GREEN_DEEP } }}
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

            {/* 7. Description */}
            {localParcelle.description && (
              <Box sx={{ bgcolor: GREEN_SOFT, borderRadius: "12px", p: "14px 16px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Notes sx={{ fontSize: 24, color: GREEN }} />
                  <Typography component="h3" sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: GREEN_DEEP }}>Description</Typography>
                </Box>
                <Typography sx={{ fontFamily: FONT, fontSize: 14.5, lineHeight: 1.65, color: NIGHT, overflowWrap: "anywhere" }}>
                  {localParcelle.description}
                </Typography>
              </Box>
            )}

            {/* 8. Agence immobilière */}
            {localParcelle.agenceNom && (
              <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(16,28,54,0.06)", borderRadius: "14px", p: "14px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: "1 1 180px" }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: GREEN_LIGHT, color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Business sx={{ fontSize: 26 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: MUTED }}>Agence</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: NIGHT, overflowWrap: "anywhere" }}>{localParcelle.agenceNom}</Typography>
                    {localParcelle.agenceTelephone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: GREEN }}>
                        <Phone sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: NIGHT }}>{localParcelle.agenceTelephone}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                {localParcelle.agenceTelephone && (
                  <Button
                    component="a"
                    href={`tel:${String(localParcelle.agenceTelephone).replace(/[^\d+]/g, "")}`}
                    variant="contained"
                    disableElevation
                    startIcon={<Phone />}
                    sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" }, height: 44, borderRadius: "10px", px: 2.5, textTransform: "none", fontFamily: FONT, fontWeight: 700, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}
                  >
                    Appeler
                  </Button>
                )}
              </Box>
            )}

            {/* 9. Vidéos */}
            {hasVideos && (
              <Box sx={{ bgcolor: GREEN_SOFT, borderRadius: "12px", p: "14px 16px" }}>
                {sectionTitle(Videocam, `Vidéos (${localParcelle.videos.length})`, GREEN_DEEP)}
                <Stack spacing={2}>
                  {localParcelle.videos.map((videoUrl, idx) => {
                    const embedUrl = getVideoEmbedUrl(videoUrl);
                    return (
                      <Box key={idx}>
                        {embedUrl && embedUrl.startsWith("http") ? (
                          <Box sx={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: "12px", overflow: "hidden", bgcolor: "#000" }}>
                            <iframe
                              src={embedUrl}
                              title={`Vidéo ${idx + 1}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
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
                            sx={{ height: 46, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, bgcolor: "#fff", color: GREEN, "&:hover": { bgcolor: GREEN_LIGHT } }}
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

            {/* 10. Documents */}
            {hasDocs && (
              <Box sx={{ bgcolor: GREY_BLOCK, borderRadius: "14px", p: "14px" }}>
                {sectionTitle(Description, "Documents", NIGHT, (
                  <Box sx={{ bgcolor: GREEN_LIGHT, color: GREEN_DEEP, fontFamily: FONT, fontSize: 13, fontWeight: 700, px: 1.25, py: 0.25, borderRadius: "999px" }}>
                    {localParcelle.documents.length}
                  </Box>
                ))}
                <Stack spacing={1}>
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
                        title={fileName}
                        sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1.25, bgcolor: "#fff", borderRadius: "10px", textDecoration: "none", color: NIGHT, transition: "background-color 0.2s ease", "&:hover": { bgcolor: GREEN_SOFT } }}
                      >
                        {docIcon(fileName)}
                        <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: NIGHT, overflowWrap: "anywhere", flex: 1, minWidth: 0 }}>
                          {fileName}
                        </Typography>
                        <OpenInNew sx={{ fontSize: 20, color: GREEN, flexShrink: 0 }} />
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
