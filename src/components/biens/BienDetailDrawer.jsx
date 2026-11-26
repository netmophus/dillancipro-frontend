import React, { useState } from "react";
import { Box, Typography, IconButton, Drawer, Button } from "@mui/material";
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
  Map as MapIcon,
  Description,
  Star,
  Check,
  CheckCircle,
  Bed,
  Bathtub,
  Weekend,
  Phone,
  Event,
  Tune,
  Info,
  Apartment,
  GpsFixed,
  CalendarMonth,
  Route,
  Stairs,
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
  PlayArrow,
  Payments,
  SquareFoot,
  ChevronLeft,
  ChevronRight,
  Business,
  VerifiedUser,
  Villa,
} from "@mui/icons-material";
import { decimalToDMS } from "../../utils/coordinateUtils";
import { BASE_SERVER_URL } from "../../config/config";

// Charte Dillanci
const NIGHT = "#101C36";
const GREEN = "#008557";
const GREEN_DEEP = "#005C48";
const GREEN_LIGHT = "#E5F3EC";
const GREY = "#F1F4F7";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

// Fonction utilitaire pour corriger les URLs d'images
const fixImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Corriger les séparateurs de chemin
  const correctedPath = imageUrl.replace(/\\/g, "/");

  // Si l'URL commence déjà par http, la retourner telle quelle
  if (correctedPath.startsWith("http")) {
    return correctedPath;
  }

  // Sinon, construire l'URL complète
  return `${BASE_SERVER_URL}/${correctedPath}`;
};

// Les photos peuvent être des chaînes ou des objets { url }
const photoSrc = (image) => fixImageUrl(typeof image === "string" ? image : image?.url);

// Nombre formaté (le libellé FCFA est affiché à part), espaces insécables
const formatNumber = (amount) => new Intl.NumberFormat("fr-FR").format(amount).replace(/[  \s]/g, " ");

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
  disponible: { label: "Disponible", bg: GREEN_LIGHT, color: GREEN_DEEP },
  en_cours_de_vente: { label: "En cours de vente", bg: "#FFF3E0", color: "#B45309" },
  reserve: { label: "Réservé", bg: "#FFF3E0", color: "#B45309" },
  vendu: { label: "Vendu", bg: "#FDECEA", color: "#d32f2f" },
};

// Équipements affichés en petits badges sobres
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
const MAX_THUMBS = 5;

// Bloc blanc bordé
const Panel = ({ children, sx }) => (
  <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "12px", p: 2, minWidth: 0, ...sx }}>{children}</Box>
);

// Titre de section avec icône verte
const SectionTitle = ({ icon: Icon, children }) => (
  <Typography
    component="h3"
    sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NIGHT, mb: 1.5 }}
  >
    <Icon sx={{ fontSize: 22, color: GREEN }} />
    {children}
  </Typography>
);

// Ligne d'information : icône + libellé à gauche, valeur à droite, séparateur discret
const InfoRow = ({ icon: Icon, label, children }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      columnGap: 1.5,
      rowGap: 0.25,
      py: 1.25,
      borderBottom: `1px solid ${BORDER}`,
      "&:last-of-type": { borderBottom: "none" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: "1 1 130px", minWidth: 0 }}>
      <Icon sx={{ fontSize: 20, color: GREEN, flexShrink: 0 }} />
      <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED }}>{label}</Typography>
    </Box>
    <Typography component="div" sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: NIGHT, textAlign: "right", overflowWrap: "anywhere", flex: "0 1 auto", ml: "auto" }}>
      {children}
    </Typography>
  </Box>
);

// Vidéo : miniature + lecture au clic (jamais de lecture automatique au chargement)
const VideoCard = ({ videoUrl, index }) => {
  const [playing, setPlaying] = useState(false);
  const url = typeof videoUrl === "string" ? videoUrl : videoUrl?.url || "";
  const embedUrl = getVideoEmbedUrl(url);
  const youTubeId = embedUrl && embedUrl.includes("youtube.com/embed/") ? embedUrl.split("/embed/")[1] : null;
  const embeddable = Boolean(embedUrl);

  return (
    <Box sx={{ position: "relative", overflow: "hidden", borderRadius: "12px", border: `1px solid ${BORDER}`, bgcolor: NIGHT, aspectRatio: "16 / 9", width: "100%", maxWidth: 560 }}>
      {embeddable && playing ? (
        <Box
          component="iframe"
          src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
          title={`Vidéo ${index + 1}`}
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {youTubeId && (
            <Box
              component="img"
              src={`https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`}
              alt=""
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}
          <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, bgcolor: youTubeId ? "rgba(16,28,54,0.25)" : "transparent", color: "#fff", p: 2, textAlign: "center" }}>
            {embeddable ? (
              <IconButton
                onClick={() => setPlaying(true)}
                aria-label={`Lire la vidéo ${index + 1}`}
                sx={{ width: 60, height: 60, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}
              >
                <PlayArrow sx={{ fontSize: 34 }} />
              </IconButton>
            ) : (
              <>
                <VideoLibrary sx={{ fontSize: 40 }} />
                <Button
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  disableElevation
                  variant="contained"
                  sx={{ bgcolor: "#fff", color: GREEN_DEEP, textTransform: "none", fontFamily: FONT, fontWeight: 700, "&:hover": { bgcolor: GREEN_LIGHT } }}
                >
                  Voir la vidéo
                </Button>
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

// Contact WhatsApp (lien existant)
const openWhatsApp = () => {
  const whatsappUrl = `https://wa.me/22780648383`;
  window.open(whatsappUrl, "_blank");
};

const BienDetailDrawer = ({ open, onClose, selectedBien }) => {
  const [localBien, setLocalBien] = useState(selectedBien);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Mettre à jour le bien local quand selectedBien change
  React.useEffect(() => {
    setLocalBien(selectedBien);
    setPhotoIndex(0);
    setShowAllPhotos(false);
  }, [selectedBien]);

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
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error("Erreur:", error);
      fallback();
    }
  };

  const bien = localBien;
  const carac = bien?.caracteristiques || {};
  const equipements = EQUIPEMENTS.filter((e) => (e.test ? e.test(carac) : carac[e.key]));
  const surface = bien && bien.superficie && String(bien.superficie) !== "0" ? bien.superficie : null;
  const tuiles = [
    { value: carac.nbChambres, label: carac.nbChambres > 1 ? "Chambres" : "Chambre", icon: Bed },
    { value: carac.nbSallesBain, label: carac.nbSallesBain > 1 ? "Salles de bain" : "Salle de bain", icon: Bathtub },
    { value: carac.nbSalons, label: carac.nbSalons > 1 ? "Salons" : "Salon", icon: Weekend },
    surface && { value: `${surface} m²`, label: "Superficie", icon: SquareFoot },
  ].filter((t) => t && t.value);
  const hasArbres = carac.typesArbres && carac.typesArbres.length > 0;
  const hasCaracBlock = tuiles.length > 0 || equipements.length > 0 || hasArbres || Boolean(carac.elementsJardin);
  const infoRows = bien
    ? [
        { label: "Année de construction", value: carac.anneeConstruction, icon: CalendarMonth },
        { label: "État général", value: carac.etatGeneral, icon: CheckCircle, badge: true },
        { label: "Type de bien", value: bien.type, icon: Home, capitalize: true },
        { label: "Accès", value: carac.acces, icon: Route },
        { label: "Étage", value: carac.etage, icon: Stairs },
      ].filter((r) => r.value)
    : [];
  const hasInfos = infoRows.length > 0 || Boolean(bien?.description);
  const statut = bien ? STATUTS[bien.statut] : null;
  const quartierVille = bien ? [bien.quartier, bien.ville].filter(Boolean).join(", ") : "";
  const hasGps = Boolean(bien?.latitude && bien?.longitude);
  const photos = bien?.images || [];
  const nbPhotos = photos.length;
  const currentPhoto = nbPhotos > 0 ? photoSrc(photos[Math.min(photoIndex, nbPhotos - 1)]) : null;
  const overflow = nbPhotos > MAX_THUMBS;
  const visibleThumbs = overflow && !showAllPhotos ? photos.slice(0, MAX_THUMBS - 1) : photos;
  const hiddenCount = nbPhotos - (MAX_THUMBS - 1);
  const agence = bien?.agenceId && bien.agenceId.nom ? bien.agenceId : null;
  const hasAgenceBlock = Boolean(agence || bien?.reference);
  const videos = bien?.videos || [];
  const atouts = bien?.atoutsMajeurs || [];

  const goPhoto = (delta) => {
    if (nbPhotos < 2) return;
    setPhotoIndex((i) => (i + delta + nbPhotos) % nbPhotos);
  };

  // Grille à deux colonnes quand la largeur réelle du contenu le permet
  const twoCols = (cols) => ({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
    alignItems: "stretch",
    "@container (min-width: 760px)": { gridTemplateColumns: cols },
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: "min(92vw, 1100px)" },
          maxWidth: "1100px",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          bgcolor: GREY,
          fontFamily: FONT,
        },
      }}
    >
      {/* 1. En-tête fixe : bleu nuit, titre, méta, prix et surface */}
      <Box sx={{ bgcolor: NIGHT, color: "#fff", flexShrink: 0, containerType: "inline-size", p: { xs: "14px 16px 16px", sm: "18px 20px 20px" } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Box sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Home sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="h2" sx={{ fontFamily: FONT, fontSize: { xs: 20, sm: 24 }, fontWeight: 700, lineHeight: 1.25, overflowWrap: "anywhere", color: "#fff" }}>
              {bien ? bien.titre : "Détails du bien immobilier"}
            </Typography>
            {bien && (
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 1.5, rowGap: 0.75, mt: 1, fontFamily: FONT, fontSize: 13.5, color: "rgba(255,255,255,0.88)" }}>
                {bien.type && (
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, textTransform: "capitalize" }}>
                    <Villa sx={{ fontSize: 17 }} />
                    {bien.type}
                  </Box>
                )}
                {quartierVille && (
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOn sx={{ fontSize: 17 }} />
                    {quartierVille}
                  </Box>
                )}
                {statut && (
                  <Box component="span" sx={{ bgcolor: statut.bg, color: statut.color, fontSize: 12, fontWeight: 700, px: 1.25, py: 0.35, borderRadius: "8px" }}>
                    {statut.label}
                  </Box>
                )}
                {bien.verified && (
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "#fff", color: GREEN, fontSize: 12, fontWeight: 700, px: 1.1, py: 0.35, borderRadius: "8px" }}>
                    <VerifiedUser sx={{ fontSize: 15 }} />
                    Vérifié
                  </Box>
                )}
              </Box>
            )}
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Fermer"
            sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: "rgba(255,255,255,0.14)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.26)" } }}
          >
            <Close />
          </IconButton>
        </Box>

        {bien && (
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              borderRadius: "10px",
              bgcolor: "rgba(255,255,255,0.08)",
              overflow: "hidden",
              "@container (min-width: 480px)": { gridTemplateColumns: surface ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "12px 16px", minWidth: 0 }}>
              <Payments sx={{ fontSize: 26, color: "#8DDBC0", flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Prix de vente</Typography>
                {bien.prix > 0 ? (
                  <Typography sx={{ fontFamily: FONT, fontSize: { xs: 22, sm: 27 }, fontWeight: 800, color: "#fff", lineHeight: 1.2, overflowWrap: "anywhere" }}>
                    {formatNumber(bien.prix)}{" "}
                    <Box component="span" sx={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>FCFA</Box>
                  </Typography>
                ) : (
                  <Typography sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: "#fff" }}>Prix sur demande</Typography>
                )}
              </Box>
            </Box>
            {surface && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: "12px 16px",
                  minWidth: 0,
                  borderTop: "1px solid rgba(255,255,255,0.16)",
                  "@container (min-width: 480px)": { borderTop: "none", borderLeft: "1px solid rgba(255,255,255,0.16)" },
                }}
              >
                <SquareFoot sx={{ fontSize: 26, color: "#8DDBC0", flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Surface</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: { xs: 22, sm: 27 }, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                    {surface}{" "}
                    <Box component="span" sx={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>m²</Box>
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* 2. Contenu : défilement interne */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain" }}>
        <Box sx={{ containerType: "inline-size", p: { xs: "16px", sm: "20px" }, pb: { xs: "24px", sm: "28px" } }}>
          {bien ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Galerie + caractéristiques */}
              <Box sx={twoCols(hasCaracBlock ? "minmax(0, 65fr) minmax(0, 35fr)" : "minmax(0, 1fr)")}>
                <Panel sx={{ p: 1.5 }}>
                  <Box sx={{ position: "relative", height: { xs: 240, sm: 300 }, borderRadius: "12px", overflow: "hidden", bgcolor: GREEN_DEEP }}>
                    <Box sx={{ position: "absolute", inset: 0, backgroundImage: "url(/images/bien-placeholder.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
                    {currentPhoto ? (
                      <Box component="img" src={currentPhoto} alt={bien.titre} sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <Box sx={{ position: "absolute", left: 12, bottom: 12, px: 1, py: 0.25, borderRadius: "6px", bgcolor: "rgba(16,28,54,0.6)", color: "#fff", fontSize: 11.5, fontFamily: FONT }}>
                        Image illustrative
                      </Box>
                    )}
                    {nbPhotos > 1 && (
                      <>
                        <IconButton
                          onClick={() => goPhoto(-1)}
                          aria-label="Photo précédente"
                          sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, bgcolor: "#fff", color: NIGHT, "&:hover": { bgcolor: GREEN_LIGHT } }}
                        >
                          <ChevronLeft />
                        </IconButton>
                        <IconButton
                          onClick={() => goPhoto(1)}
                          aria-label="Photo suivante"
                          sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, bgcolor: "#fff", color: NIGHT, "&:hover": { bgcolor: GREEN_LIGHT } }}
                        >
                          <ChevronRight />
                        </IconButton>
                      </>
                    )}
                    {nbPhotos > 0 && (
                      <Box sx={{ position: "absolute", right: 10, bottom: 10, display: "flex", alignItems: "center", gap: 0.5, bgcolor: NIGHT, color: "#fff", px: 1.25, py: 0.4, borderRadius: "999px", fontFamily: FONT, fontSize: 12.5, fontWeight: 600 }}>
                        <PhotoCamera sx={{ fontSize: 16 }} />
                        {Math.min(photoIndex, nbPhotos - 1) + 1} / {nbPhotos}
                      </Box>
                    )}
                  </Box>

                  {nbPhotos > 1 && (
                    <Box sx={{ display: "flex", gap: "8px", mt: 1, overflowX: "auto", pb: 0.5, scrollbarWidth: "thin" }}>
                      {visibleThumbs.map((image, index) => {
                        const selected = index === Math.min(photoIndex, nbPhotos - 1);
                        return (
                          <Box
                            key={index}
                            component="button"
                            type="button"
                            onClick={() => setPhotoIndex(index)}
                            aria-label={`Afficher la photo ${index + 1}`}
                            aria-current={selected ? "true" : undefined}
                            sx={{ flex: "0 0 auto", width: 84, height: 60, p: 0, borderRadius: "8px", overflow: "hidden", cursor: "pointer", bgcolor: GREY, border: `2px solid ${selected ? GREEN : "transparent"}`, outline: "none", "&:focus-visible": { boxShadow: `0 0 0 2px ${GREEN}` } }}
                          >
                            <Box component="img" src={photoSrc(image)} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </Box>
                        );
                      })}
                      {overflow && !showAllPhotos && (
                        <Box
                          component="button"
                          type="button"
                          onClick={() => setShowAllPhotos(true)}
                          aria-label={`Afficher ${hiddenCount} photos de plus`}
                          sx={{ flex: "0 0 auto", width: 84, height: 60, p: 0, border: "none", borderRadius: "8px", cursor: "pointer", bgcolor: NIGHT, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 17 }}
                        >
                          +{hiddenCount}
                        </Box>
                      )}
                    </Box>
                  )}
                </Panel>

                {hasCaracBlock && (
                  <Panel>
                    <SectionTitle icon={Tune}>Caractéristiques du bien</SectionTitle>

                    {tuiles.length > 0 && (
                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", mb: equipements.length > 0 ? 2 : 0 }}>
                        {tuiles.map((t) => (
                          <Box key={t.label} sx={{ bgcolor: GREEN_LIGHT, borderRadius: "12px", p: "12px 14px", minWidth: 0 }}>
                            <t.icon sx={{ fontSize: 26, color: GREEN }} />
                            <Typography sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: NIGHT, lineHeight: 1.2, mt: 0.5, overflowWrap: "anywhere" }}>{t.value}</Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>{t.label}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {equipements.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {equipements.map((e) => (
                          <Box key={e.key} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: GREY, color: NIGHT, fontFamily: FONT, fontSize: 13, fontWeight: 600, px: 1.25, py: 0.6, borderRadius: "8px" }}>
                            <e.icon sx={{ fontSize: 17, color: GREEN }} />
                            {typeof e.label === "function" ? e.label(carac) : e.label}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Types d'arbres (pour jardin) */}
                    {hasArbres && (
                      <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${BORDER}` }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", mb: 0.75 }}>Types d'arbres</Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                          {carac.typesArbres.map((arbre, index) => (
                            <Box key={index} sx={{ bgcolor: GREEN_LIGHT, color: GREEN_DEEP, fontFamily: FONT, fontSize: 13, fontWeight: 600, px: 1.25, py: 0.5, borderRadius: "8px" }}>
                              {`${arbre.type || arbre}: ${arbre.nombre || ""}`}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Éléments du jardin */}
                    {carac.elementsJardin && (
                      <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${BORDER}` }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", mb: 0.75 }}>Éléments du jardin</Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: 14, color: NIGHT }}>{carac.elementsJardin}</Typography>
                      </Box>
                    )}
                  </Panel>
                )}
              </Box>

              {/* Localisation + informations */}
              <Box sx={twoCols(hasInfos ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)")}>
                <Panel sx={{ display: "flex", flexDirection: "column" }}>
                  <SectionTitle icon={LocationOn}>Localisation</SectionTitle>
                  <Box sx={{ flex: 1 }}>
                    {quartierVille && <InfoRow icon={Apartment} label="Quartier / Ville">{quartierVille}</InfoRow>}
                    {bien.adresse && <InfoRow icon={MapIcon} label="Adresse">{bien.adresse}</InfoRow>}
                    {hasGps && (
                      <InfoRow icon={GpsFixed} label="Coordonnées GPS">
                        <Box component="span" sx={{ display: "block" }}>Lat : {bien.latitude} / Lng : {bien.longitude}</Box>
                        {decimalToDMS(bien.latitude, "lat") && decimalToDMS(bien.longitude, "lon") && (
                          <Box component="span" sx={{ display: "block", fontSize: 12.5, fontWeight: 500, color: MUTED, mt: 0.25 }}>
                            {decimalToDMS(bien.latitude, "lat")} / {decimalToDMS(bien.longitude, "lon")}
                          </Box>
                        )}
                      </InfoRow>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                    <Button
                      disableElevation
                      startIcon={<MapIcon />}
                      onClick={handleVoirCarte}
                      sx={{ flex: "1 1 140px", height: 44, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 14.5, bgcolor: GREY, color: GREEN, "&:hover": { bgcolor: GREEN_LIGHT } }}
                    >
                      Voir sur la carte
                    </Button>
                    {hasGps && (
                      <Button
                        variant="contained"
                        disableElevation
                        startIcon={<Directions />}
                        onClick={handleItineraire}
                        sx={{ flex: "1 1 140px", height: 44, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 14.5, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}
                      >
                        Itinéraire
                      </Button>
                    )}
                  </Box>
                </Panel>

                {hasInfos && (
                  <Panel>
                    <SectionTitle icon={Info}>Informations</SectionTitle>
                    {infoRows.map((r) => (
                      <InfoRow key={r.label} icon={r.icon} label={r.label}>
                        {r.badge ? (
                          <Box component="span" sx={{ display: "inline-block", bgcolor: GREEN_LIGHT, color: GREEN_DEEP, fontSize: 13, fontWeight: 700, px: 1.25, py: 0.3, borderRadius: "8px" }}>{r.value}</Box>
                        ) : r.capitalize ? (
                          <Box component="span" sx={{ textTransform: "capitalize" }}>{r.value}</Box>
                        ) : (
                          r.value
                        )}
                      </InfoRow>
                    ))}
                    {bien.description && (
                      <Box sx={{ mt: 1, pt: 1.5, borderTop: `1px solid ${BORDER}` }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, mb: 0.5 }}>Description</Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: 14.5, lineHeight: 1.6, color: NIGHT, overflowWrap: "anywhere" }}>{bien.description}</Typography>
                      </Box>
                    )}
                  </Panel>
                )}
              </Box>

              {/* Situation géographique + description physique */}
              {(bien.situationGeographique || bien.descriptionPhysique) && (
                <Box sx={twoCols(bien.situationGeographique && bien.descriptionPhysique ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)")}>
                  {bien.situationGeographique && (
                    <Panel sx={{ bgcolor: GREEN_LIGHT }}>
                      <SectionTitle icon={MapIcon}>Situation géographique du terrain</SectionTitle>
                      <Typography sx={{ fontFamily: FONT, lineHeight: 1.65, color: NIGHT, fontSize: 14.5, overflowWrap: "anywhere" }}>{bien.situationGeographique}</Typography>
                    </Panel>
                  )}
                  {bien.descriptionPhysique && (
                    <Panel>
                      <SectionTitle icon={Description}>Description physique</SectionTitle>
                      <Typography sx={{ fontFamily: FONT, lineHeight: 1.65, color: "#334155", fontSize: 14.5, overflowWrap: "anywhere" }}>{bien.descriptionPhysique}</Typography>
                    </Panel>
                  )}
                </Box>
              )}

              {/* Atouts majeurs + agence */}
              {(atouts.length > 0 || hasAgenceBlock) && (
                <Box sx={twoCols(atouts.length > 0 && hasAgenceBlock ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)")}>
                  {atouts.length > 0 && (
                    <Panel>
                      <SectionTitle icon={Star}>Atouts majeurs</SectionTitle>
                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 16px" }}>
                        {atouts.map((atout, index) => (
                          <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                            <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Check sx={{ fontSize: 15, color: "#fff" }} />
                            </Box>
                            <Typography sx={{ fontFamily: FONT, fontSize: 14.5, color: NIGHT, overflowWrap: "anywhere" }}>
                              {typeof atout === "string" ? atout : atout.nom || atout}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Panel>
                  )}

                  {hasAgenceBlock && (
                    <Panel>
                      <SectionTitle icon={Business}>{agence ? "Agence vendeuse" : "Référence du bien"}</SectionTitle>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                        {agence && (
                          <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: GREEN_LIGHT, color: GREEN_DEEP, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Business sx={{ fontSize: 26 }} />
                          </Box>
                        )}
                        <Box sx={{ minWidth: 0 }}>
                          {agence && <Typography sx={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: NIGHT, overflowWrap: "anywhere" }}>{agence.nom}</Typography>}
                          {agence?.telephone && (
                            <Box
                              component="a"
                              href={`tel:${String(agence.telephone).replace(/\s+/g, "")}`}
                              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: GREEN, textDecoration: "none", fontFamily: FONT, fontSize: 14.5, fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                            >
                              <Phone sx={{ fontSize: 17 }} />
                              {agence.telephone}
                            </Box>
                          )}
                          {bien.reference && (
                            <Typography sx={{ fontFamily: FONT, fontSize: 13, color: MUTED, overflowWrap: "anywhere" }}>Réf. : {bien.reference}</Typography>
                          )}
                        </Box>
                      </Box>
                    </Panel>
                  )}
                </Box>
              )}

              {/* Vidéo(s) */}
              {videos.length > 0 && (
                <Panel>
                  <SectionTitle icon={VideoLibrary}>{videos.length > 1 ? "Vidéos du bien" : "Vidéo du bien"}</SectionTitle>
                  <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "12px", "@container (min-width: 760px)": { gridTemplateColumns: videos.length > 1 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)" } }}>
                    {videos.map((videoUrl, index) => (
                      <VideoCard key={index} videoUrl={videoUrl} index={index} />
                    ))}
                  </Box>
                </Panel>
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
      </Box>

      {/* 3. Barre d'actions fixe */}
      {bien && (
        <Box sx={{ flexShrink: 0, bgcolor: "#fff", borderTop: `1px solid ${BORDER}`, boxShadow: "0 -2px 8px rgba(16,28,54,0.06)", p: { xs: "12px 16px", sm: "14px 20px" }, display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Button
            variant="outlined"
            disableElevation
            startIcon={<Phone />}
            onClick={openWhatsApp}
            sx={{ flex: "1 1 180px", height: 46, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 15, border: `1.5px solid ${GREEN}`, color: GREEN, bgcolor: "#fff", "&:hover": { border: `1.5px solid ${GREEN_DEEP}`, bgcolor: GREEN_LIGHT } }}
          >
            Contacter l'agence
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<Event />}
            onClick={openWhatsApp}
            sx={{ flex: "1 1 180px", height: 46, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 15, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}
          >
            Demander une visite
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default BienDetailDrawer;
