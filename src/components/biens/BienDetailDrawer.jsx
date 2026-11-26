import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Button,
} from "@mui/material";
import {
  LocationOn,
  Close,
  Home,
  Garage,
  Pool,
  Nature,
  AcUnit,
  Kitchen,
  PhotoCamera,
  Videocam,
  Map as MapIcon,
  Description,
  Star,
  CheckCircle,
  Bed,
  Bathtub,
  Weekend,
  Phone,
  Event,
  Tune,
  Straighten,
  Directions,
  Elevator,
  Balcony,
  ElectricBolt,
  WaterDrop,
  Security,
  Water,
  Fence,
  Park,
  Yard,
  VideoLibrary,
} from "@mui/icons-material";
import { decimalToDMS } from "../../utils/coordinateUtils";
import { BASE_SERVER_URL } from "../../config/config";

// Charte Dillanci
const BLUE = "#3030F9";
const BLUE_DARK = "#2020C8";
const GREEN = "#0A7C4F";
const GREEN_DARK = "#065F3D";
const NIGHT = "#0e1133";
const SKY = "#EAF0FF";
const GREEN_LIGHT = "#E3F5EC";
const GREY_BG = "#f5f7fa";
const BORDER = "#e5e7eb";

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

// Nombre formaté (le libellé FCFA est affiché à part)
const formatNumber = (amount) => new Intl.NumberFormat("fr-FR").format(amount);

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

// Statut fonctionnel du bien (seul endroit où des couleurs hors charte sont admises)
const STATUTS = {
  disponible: { label: "Disponible", bg: GREEN_LIGHT, color: GREEN },
  en_cours_de_vente: { label: "En cours de vente", bg: "#FFF3E0", color: "#B45309" },
  reserve: { label: "Réservé", bg: "#FFF3E0", color: "#B45309" },
  vendu: { label: "Vendu", bg: "#FDECEA", color: "#d32f2f" },
};

// Équipements affichés en petits chips compacts
const EQUIPEMENTS = [
  { key: "garage", label: "Garage", icon: Garage },
  { key: "piscine", label: "Piscine", icon: Pool },
  { key: "jardin", label: "Jardin", icon: Nature },
  { key: "climatisation", label: "Climatisation", icon: AcUnit },
  { key: "cuisine", label: (c) => `Cuisine: ${c.cuisine}`, icon: Kitchen, test: (c) => c.cuisine && c.cuisine !== "Non spécifiée" },
  { key: "ascenseur", label: "Ascenseur", icon: Elevator },
  { key: "balcon", label: "Balcon", icon: Balcony },
  { key: "electricite", label: "Électricité", icon: ElectricBolt },
  { key: "eau", label: "Eau courante", icon: WaterDrop },
  { key: "securite", label: "Sécurité", icon: Security },
  { key: "irrigation", label: "Irrigation", icon: Water },
  { key: "cloture", label: "Clôture", icon: Fence },
  { key: "arbore", label: "Arboré", icon: Park },
  { key: "potager", label: "Potager", icon: Yard },
];

// Nombre de miniatures visibles avant le "+N"
const MAX_THUMBS = 4;

// Titre de section avec icône
const SectionTitle = ({ icon: Icon, children, color = NIGHT }) => (
  <Typography
    component="h3"
    sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 16, fontWeight: 700, color, mb: 1.5 }}
  >
    <Icon sx={{ fontSize: 20 }} />
    {children}
  </Typography>
);

// Carte bordée
const Panel = ({ children, sx }) => (
  <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 3, p: 2.5, ...sx }}>{children}</Box>
);

// Ligne label / valeur sobre
const InfoRow = ({ label, children }) => (
  <Box sx={{ py: 1, borderBottom: `1px solid ${BORDER}`, "&:last-of-type": { borderBottom: "none" } }}>
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#5b6573", textTransform: "uppercase", letterSpacing: 0.3 }}>
      {label}
    </Typography>
    <Typography component="div" sx={{ fontSize: 15, fontWeight: 600, color: NIGHT, wordBreak: "break-word", mt: 0.25 }}>
      {children}
    </Typography>
  </Box>
);

// Contact WhatsApp (lien existant)
const openWhatsApp = () => {
  const whatsappUrl = `https://wa.me/22780648383`;
  window.open(whatsappUrl, "_blank");
};

const BienDetailDrawer = ({ open, onClose, selectedBien, onBienUpdate }) => {
  const [localBien, setLocalBien] = useState(selectedBien);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Mettre à jour le bien local quand selectedBien change
  React.useEffect(() => {
    setLocalBien(selectedBien);
    setShowAllPhotos(false);
  }, [selectedBien]);

  const handleImageClick = (index) => {
    if (!localBien || !localBien.images || localBien.images.length <= 1) return;

    // Remplacer la photo principale par celle cliquée
    const newImages = [...localBien.images];
    [newImages[0], newImages[index + 1]] = [newImages[index + 1], newImages[0]];

    const updatedBien = {
      ...localBien,
      image: fixImageUrl(newImages[0]),
      images: newImages
    };

    setLocalBien(updatedBien);
    if (onBienUpdate) {
      onBienUpdate(updatedBien);
    }
  };

  // Carte (coordonnées si disponibles, sinon recherche par adresse / ville)
  const handleVoirCarte = () => {
    if (localBien.latitude && localBien.longitude) {
      const googleMapsUrl = `https://www.google.com/maps/@${localBien.latitude},${localBien.longitude},18z`;
      window.open(googleMapsUrl, "_blank");
    } else {
      const searchQuery = localBien.adresse || localBien.ville;
      const fallbackUrl = `https://maps.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      window.open(fallbackUrl, "_blank");
    }
  };

  // Itinéraire depuis la position de l'utilisateur
  const handleItineraire = () => {
    const fallback = () => {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${localBien.latitude},${localBien.longitude}`;
      window.open(googleMapsUrl, "_blank");
    };
    try {
      if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par votre navigateur");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${localBien.latitude},${localBien.longitude}`;
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
          fallback();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Erreur:", error);
      fallback();
    }
  };

  const bien = localBien;
  const carac = bien?.caracteristiques || {};
  const hasCarac = bien?.caracteristiques && Object.keys(bien.caracteristiques).length > 0;
  const equipements = EQUIPEMENTS.filter((e) => (e.test ? e.test(carac) : carac[e.key]));
  const tuiles = [
    { value: carac.nbChambres, label: "Chambres", icon: Bed, bg: BLUE },
    { value: carac.nbSallesBain, label: "Salles de bain", icon: Bathtub, bg: GREEN },
    { value: carac.nbSalons, label: "Salons", icon: Weekend, bg: NIGHT },
  ].filter((t) => t.value);
  const infoRows = bien
    ? [
        { label: "Année de construction", value: carac.anneeConstruction },
        { label: "État général", value: carac.etatGeneral },
        { label: "Accès", value: carac.acces },
        { label: "Étage", value: carac.etage },
      ].filter((r) => r.value)
    : [];
  const hasInfos = infoRows.length > 0 || Boolean(bien?.description);
  const surface = bien && bien.superficie && String(bien.superficie) !== "0" ? bien.superficie : null;
  const statut = bien ? STATUTS[bien.statut] : null;
  const quartierVille = bien ? [bien.quartier, bien.ville].filter(Boolean).join(", ") : "";
  const hasGps = Boolean(bien?.latitude && bien?.longitude);
  const others = bien?.images && bien.images.length > 1 ? bien.images.slice(1) : [];
  const overflow = others.length > MAX_THUMBS;
  const visibleThumbs = overflow && !showAllPhotos ? others.slice(0, MAX_THUMBS - 1) : others;
  const hiddenCount = others.length - (MAX_THUMBS - 1);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: "80%", md: "70%", lg: "60%" },
          maxWidth: "1200px",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: GREY_BG }}>
        {/* 1. En-tête en aplat bleu nuit */}
        <Box sx={{ bgcolor: NIGHT, color: "#fff", p: { xs: 2, sm: 3 }, flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Home />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                component="h2"
                sx={{ fontSize: 19, fontWeight: 700, lineHeight: 1.3, wordBreak: "break-word" }}
              >
                {bien ? bien.titre : "Détails du Bien Immobilier"}
              </Typography>
              {bien && (
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 1 }}>
                  {bien.type && (
                    <Box sx={{ bgcolor: BLUE, color: "#fff", fontSize: 12, fontWeight: 700, px: 1.25, py: 0.4, borderRadius: "999px" }}>
                      {bien.type}
                    </Box>
                  )}
                  {quartierVille && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
                      <LocationOn sx={{ fontSize: 16 }} />
                      {quartierVille}
                    </Box>
                  )}
                  {statut && (
                    <Box sx={{ bgcolor: statut.bg, color: statut.color, fontSize: 12, fontWeight: 700, px: 1.25, py: 0.4, borderRadius: "999px" }}>
                      {statut.label}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            <IconButton
              onClick={onClose}
              aria-label="Fermer"
              sx={{
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {bien && (
            <Box sx={{ display: "grid", gridTemplateColumns: surface ? "1fr 1fr" : "1fr", gap: 1.5, mt: 2.5 }}>
              <Box sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2, p: 1.5 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase" }}>
                  Prix
                </Typography>
                <Typography sx={{ fontSize: { xs: 22, sm: 28 }, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                  {formatNumber(bien.prix)}{" "}
                  <Box component="span" sx={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                    FCFA
                  </Box>
                </Typography>
              </Box>
              {surface && (
                <Box sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2, p: 1.5 }}>
                  <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase" }}>
                    Surface
                  </Typography>
                  <Typography sx={{ fontSize: { xs: 22, sm: 28 }, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                    {surface}{" "}
                    <Box component="span" sx={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                      m²
                    </Box>
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Contenu défilant */}
        <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, sm: 3 } }}>
          {bien ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* 2. Galerie photos */}
              <Box>
                <SectionTitle icon={PhotoCamera}>Photos du bien</SectionTitle>
                <Box
                  sx={{
                    height: 180,
                    borderRadius: 3,
                    overflow: "hidden",
                    bgcolor: "#d9e2ec",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {bien.image ? (
                    <Box
                      component="img"
                      src={bien.image}
                      alt={bien.titre}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <PhotoCamera sx={{ fontSize: 48, color: "#9aa5b4" }} />
                  )}
                </Box>

                {others.length > 0 && (
                  <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${MAX_THUMBS}, 1fr)`, gap: 1, mt: 1 }}>
                    {visibleThumbs.map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={fixImageUrl(image)}
                        alt={`${bien.titre} - Photo ${index + 2}`}
                        onClick={() => handleImageClick(index)}
                        sx={{
                          width: "100%",
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 2,
                          cursor: "pointer",
                          border: `1px solid ${BORDER}`,
                          transition: "transform .2s ease",
                          "&:hover": { transform: "scale(1.04)" },
                        }}
                      />
                    ))}
                    {overflow && !showAllPhotos && (
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label={`Afficher ${hiddenCount} photos de plus`}
                        onClick={() => setShowAllPhotos(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setShowAllPhotos(true);
                        }}
                        sx={{
                          position: "relative",
                          height: 64,
                          borderRadius: 2,
                          overflow: "hidden",
                          cursor: "pointer",
                          bgcolor: NIGHT,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 18,
                        }}
                      >
                        +{hiddenCount}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* 3. Caractéristiques */}
              {hasCarac && (
                <Panel>
                  <SectionTitle icon={Tune}>Caractéristiques du bien</SectionTitle>

                  {tuiles.length > 0 && (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: `repeat(${tuiles.length}, 1fr)` }, gap: 1.5, mb: equipements.length > 0 ? 2 : 0 }}>
                      {tuiles.map((t) => (
                        <Box key={t.label} sx={{ bgcolor: t.bg, color: "#fff", borderRadius: 2, p: 1.5, textAlign: "center" }}>
                          <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{t.value}</Typography>
                          <Typography sx={{ fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 0.5, opacity: 0.95 }}>
                            <t.icon sx={{ fontSize: 17 }} />
                            {t.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {equipements.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {equipements.map((e) => (
                        <Box
                          key={e.key}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            bgcolor: SKY,
                            color: BLUE_DARK,
                            fontSize: 12.5,
                            fontWeight: 600,
                            px: 1.1,
                            py: 0.4,
                            borderRadius: "999px",
                          }}
                        >
                          <e.icon sx={{ fontSize: 15 }} />
                          {typeof e.label === "function" ? e.label(carac) : e.label}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Types d'arbres (pour jardin) */}
                  {carac.typesArbres && carac.typesArbres.length > 0 && (
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${BORDER}` }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#5b6573", textTransform: "uppercase", mb: 0.75 }}>
                        Types d'arbres
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {carac.typesArbres.map((arbre, index) => (
                          <Box
                            key={index}
                            sx={{ bgcolor: GREEN_LIGHT, color: GREEN, fontSize: 12.5, fontWeight: 600, px: 1.1, py: 0.4, borderRadius: "999px" }}
                          >
                            {`${arbre.type || arbre}: ${arbre.nombre || ""}`}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Éléments du jardin */}
                  {carac.elementsJardin && (
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${BORDER}` }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#5b6573", textTransform: "uppercase", mb: 0.75 }}>
                        Éléments du jardin
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: NIGHT }}>{carac.elementsJardin}</Typography>
                    </Box>
                  )}
                </Panel>
              )}

              {/* 4. Deux colonnes : Localisation / Informations */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: hasInfos ? "1fr 1fr" : "1fr" }, gap: 2.5, alignItems: "start" }}>
                <Panel>
                  <SectionTitle icon={LocationOn}>Localisation</SectionTitle>
                  {quartierVille && <InfoRow label="Quartier / Ville">{quartierVille}</InfoRow>}
                  {bien.adresse && <InfoRow label="Adresse">{bien.adresse}</InfoRow>}
                  {hasGps && (
                    <InfoRow label="Coordonnées GPS">
                      <Box component="span" sx={{ display: "block" }}>Lat: {bien.latitude}</Box>
                      <Box component="span" sx={{ display: "block" }}>Lng: {bien.longitude}</Box>
                      {decimalToDMS(bien.latitude, "lat") && decimalToDMS(bien.longitude, "lon") && (
                        <Box component="span" sx={{ display: "block", fontSize: 13, fontWeight: 500, color: "#5b6573", mt: 0.5 }}>
                          {decimalToDMS(bien.latitude, "lat")} / {decimalToDMS(bien.longitude, "lon")}
                        </Box>
                      )}
                    </InfoRow>
                  )}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<MapIcon />}
                      onClick={handleVoirCarte}
                      sx={{ textTransform: "none", fontWeight: 600, borderColor: BLUE, color: BLUE, "&:hover": { borderColor: BLUE_DARK, bgcolor: SKY } }}
                    >
                      Voir sur la carte
                    </Button>
                    {hasGps && (
                      <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        startIcon={<Directions />}
                        onClick={handleItineraire}
                        sx={{ textTransform: "none", fontWeight: 600, bgcolor: BLUE, "&:hover": { bgcolor: BLUE_DARK } }}
                      >
                        Itinéraire
                      </Button>
                    )}
                  </Box>
                </Panel>

                {hasInfos && (
                  <Panel>
                    <SectionTitle icon={Straighten}>Informations</SectionTitle>
                    {infoRows.map((r) => (
                      <InfoRow key={r.label} label={r.label}>{r.value}</InfoRow>
                    ))}
                    {bien.description && (
                      <InfoRow label="Description">
                        <Box component="span" sx={{ fontWeight: 500, lineHeight: 1.6 }}>{bien.description}</Box>
                      </InfoRow>
                    )}
                  </Panel>
                )}
              </Box>

              {/* 5. Sections descriptives */}
              {bien.situationGeographique && (
                <Box sx={{ bgcolor: GREEN_LIGHT, border: `1px solid ${BORDER}`, borderRadius: 3, p: 2.5 }}>
                  <SectionTitle icon={MapIcon} color={GREEN_DARK}>Situation géographique du Terrain</SectionTitle>
                  <Typography sx={{ lineHeight: 1.7, color: GREEN_DARK, fontSize: 14.5 }}>
                    {bien.situationGeographique}
                  </Typography>
                </Box>
              )}

              {bien.descriptionPhysique && (
                <Box sx={{ bgcolor: SKY, border: `1px solid ${BORDER}`, borderRadius: 3, p: 2.5 }}>
                  <SectionTitle icon={Description} color={BLUE_DARK}>Description physique</SectionTitle>
                  <Typography sx={{ lineHeight: 1.7, color: BLUE_DARK, fontSize: 14.5 }}>
                    {bien.descriptionPhysique}
                  </Typography>
                </Box>
              )}

              {bien.atoutsMajeurs && bien.atoutsMajeurs.length > 0 && (
                <Panel>
                  <SectionTitle icon={Star}>Atouts majeurs</SectionTitle>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                    {bien.atoutsMajeurs.map((atout, index) => (
                      <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 20, color: GREEN, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 14.5, color: NIGHT }}>
                          {typeof atout === "string" ? atout : atout.nom || atout}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Panel>
              )}

              {/* 6. Vidéos */}
              {bien.videos && bien.videos.length > 0 && (
                <Box>
                  <SectionTitle icon={Videocam}>Vidéos du bien</SectionTitle>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                    {bien.videos.map((videoUrl, index) => {
                      const videoUrlStr = typeof videoUrl === "string" ? videoUrl : videoUrl.url || videoUrl;
                      const embedUrl = getVideoEmbedUrl(videoUrlStr);
                      const isYouTube = embedUrl && embedUrl.includes('youtube.com/embed');
                      const isVimeo = embedUrl && embedUrl.includes('vimeo.com/video');

                      return (
                        <Box key={index} sx={{ overflow: "hidden", borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: "#fff" }}>
                          {embedUrl && (isYouTube || isVimeo) ? (
                            <Box
                              component="iframe"
                              src={embedUrl}
                              title={`Vidéo ${index + 1}`}
                              sx={{ width: "100%", height: 220, border: "none", display: "block" }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <Box
                              sx={{
                                width: "100%",
                                height: 220,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: BLUE,
                                color: "#fff",
                                p: 3,
                              }}
                            >
                              <VideoLibrary sx={{ fontSize: 44, mb: 1.5 }} />
                              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>Vidéo {index + 1}</Typography>
                              <Button
                                variant="contained"
                                href={videoUrlStr}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ bgcolor: "#fff", color: BLUE, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: SKY } }}
                              >
                                Voir la vidéo
                              </Button>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <Typography variant="h6" color="text.secondary">
                Aucun bien immobilier sélectionné
              </Typography>
            </Box>
          )}
        </Box>

        {/* 7. Barre d'actions collée en bas */}
        {bien && (
          <Box
            sx={{
              flexShrink: 0,
              bgcolor: GREY_BG,
              borderTop: `1px solid ${BORDER}`,
              p: { xs: 1.5, sm: 2 },
              display: "flex",
              gap: 1.5,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              disableElevation
              startIcon={<Phone />}
              onClick={openWhatsApp}
              sx={{ py: 1.2, textTransform: "none", fontWeight: 700, bgcolor: GREEN, "&:hover": { bgcolor: GREEN_DARK } }}
            >
              Contacter
            </Button>
            <Button
              fullWidth
              variant="contained"
              disableElevation
              startIcon={<Event />}
              onClick={openWhatsApp}
              sx={{ py: 1.2, textTransform: "none", fontWeight: 700, bgcolor: BLUE, "&:hover": { bgcolor: BLUE_DARK } }}
            >
              Demander une visite
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default BienDetailDrawer;
