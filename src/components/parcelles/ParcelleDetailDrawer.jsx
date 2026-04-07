import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Drawer,
  Button,
  Stack,
} from "@mui/material";
import {
  LocationOn,
  Close,
  VideoLibrary,
  Description,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  return `http://localhost:5000/${correctedPath}`;
};

// Fonction pour formater l'argent
const formatMoney = (amount) => {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
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

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: "90%", md: 600, lg: 700 },
          background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #f0fdf4 60%, #ffffff 100%)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(5, 150, 105, 0.05) 0%, transparent 50%)",
            pointerEvents: "none",
            zIndex: 0,
          },
        },
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 }, height: "100%", overflowY: "auto", position: "relative", zIndex: 1 }}>
        {/* Header moderne */}
        <Box 
          sx={{ 
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.08) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            backdropFilter: "blur(10px)",
            position: "relative",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box flex={1}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    fontSize: { xs: 24, sm: 28 },
                  }}
                >
                  🏘️
                </Box>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{
                    fontSize: {
                      xs: "clamp(1.3rem, 4vw, 1.6rem)",
                      sm: "clamp(1.5rem, 3vw, 1.8rem)",
                      md: "1.9rem",
                    },
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {localParcelle?.ref || "Détails de la parcelle"}
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{
                  color: "rgba(0, 0, 0, 0.7)",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  fontWeight: 500,
                }}
              >
                Îlot {localParcelle?.ilot}, Parcelle {localParcelle?.ref}
              </Typography>
            </Box>
            <IconButton 
              onClick={onClose}
              sx={{
                bgcolor: "rgba(16, 185, 129, 0.1)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                "&:hover": {
                  bgcolor: "rgba(16, 185, 129, 0.2)",
                  transform: "rotate(90deg)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>

        {localParcelle ? (
          <Grid container spacing={3}>
            {/* Photos de la parcelle - Moderne */}
            {localParcelle.images && localParcelle.images.length > 0 && (
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.98) 100%)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box
                      sx={{
                        fontSize: { xs: 20, sm: 24 },
                      }}
                    >
                      📸
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      sx={{
                        fontSize: {
                          xs: "clamp(1rem, 3vw, 1.2rem)",
                          sm: "1.3rem",
                        },
                        color: "#10b981",
                      }}
                    >
                      Photos de la parcelle
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      position: "relative", 
                      height: { xs: 250, sm: 300 }, 
                      borderRadius: 3, 
                      overflow: "hidden", 
                      mb: 2,
                      boxShadow: "0 4px 16px rgba(16, 185, 129, 0.15)",
                      border: "2px solid rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    <Box
                      component="img"
                      src={fixImageUrl(localParcelle.images[0])}
                      alt={localParcelle.ref}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='16'%3EImage%20non%20disponible%3C/text%3E%3C/svg%3E";
                        e.target.onerror = null;
                      }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        bgcolor: "#f0f0f0",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />
                  </Box>
                  {localParcelle.images.length > 1 && (
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
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
                          sx={{
                            width: { xs: 70, sm: 80 },
                            height: { xs: 70, sm: 80 },
                            objectFit: "cover",
                            borderRadius: 2,
                            cursor: "pointer",
                            border: "2px solid transparent",
                            bgcolor: "#f0f0f0",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: "#10b981",
                              transform: "scale(1.1)",
                              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                            },
                          }}
                          onClick={() => handleImageClick(idx)}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Informations principales - Moderne */}
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: { xs: 2.5, sm: 3 }, 
                  borderRadius: 3,
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.08) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                  <Box
                    sx={{
                      fontSize: { xs: 20, sm: 24 },
                    }}
                  >
                    📋
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    sx={{
                      fontSize: {
                        xs: "clamp(1rem, 3vw, 1.2rem)",
                        sm: "1.3rem",
                      },
                      color: "#10b981",
                    }}
                  >
                    Informations principales
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: "rgba(255,255,255,0.95)", 
                        borderRadius: 2,
                        border: "1px solid rgba(16, 185, 129, 0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                        },
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.7rem" }}>
                        RÉFÉRENCE
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#10b981", fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                        {localParcelle.ref}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: "rgba(255,255,255,0.95)", 
                        borderRadius: 2,
                        border: "1px solid rgba(16, 185, 129, 0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                        },
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.7rem" }}>
                        ÎLOT
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#10b981", fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                        {localParcelle.ilot}, Parcelle {localParcelle.ref}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: "rgba(255,255,255,0.95)", 
                        borderRadius: 2,
                        border: "1px solid rgba(16, 185, 129, 0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                        },
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.7rem" }}>
                        SUPERFICIE
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#10b981", fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                        {localParcelle.superficie} m²
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: "rgba(255,255,255,0.95)", 
                        borderRadius: 2,
                        border: "1px solid rgba(16, 185, 129, 0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                        },
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.7rem" }}>
                        PRIX
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#10b981", fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                        {localParcelle.prix > 0 ? formatMoney(localParcelle.prix) : "Prix sur demande"}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: "rgba(255,255,255,0.95)", 
                        borderRadius: 2,
                        border: "1px solid rgba(16, 185, 129, 0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                        },
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.7rem" }}>
                        VILLE
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" sx={{ color: "#10b981", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                        📍 {localParcelle.ville}
                      </Typography>
                    </Paper>
                  </Grid>
                  {localParcelle.description && (
                    <Grid item xs={12}>
                      <Paper 
                        sx={{ 
                          p: { xs: 1.5, sm: 2 }, 
                          bgcolor: "rgba(255,255,255,0.95)", 
                          borderRadius: 2,
                          border: "1px solid rgba(16, 185, 129, 0.1)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.7rem" }}>
                          DESCRIPTION
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6, color: "rgba(0, 0, 0, 0.8)" }}>
                          {localParcelle.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  {localParcelle.agenceNom && (
                    <Grid item xs={12}>
                      <Paper 
                        sx={{ 
                          p: { xs: 1.5, sm: 2 }, 
                          bgcolor: "rgba(255,255,255,0.95)", 
                          borderRadius: 2,
                          border: "1px solid rgba(16, 185, 129, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                          },
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.7rem" }}>
                          AGENCE
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" sx={{ color: "#10b981", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                          🏢 {localParcelle.agenceNom}
                        </Typography>
                        {localParcelle.agenceTelephone && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>
                            📞 {localParcelle.agenceTelephone}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Géolocalisation - Moderne */}
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: { xs: 2.5, sm: 3 }, 
                  borderRadius: 3,
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.08) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                  <Box
                    sx={{
                      fontSize: { xs: 20, sm: 24 },
                    }}
                  >
                    🗺️
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    sx={{
                      fontSize: {
                        xs: "clamp(1rem, 3vw, 1.2rem)",
                        sm: "1.3rem",
                      },
                      color: "#10b981",
                    }}
                  >
                    Localisation
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  height: 350, 
                  borderRadius: 3, 
                  overflow: "hidden",
                  position: "relative",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  mb: 2
                }}>
                  <Box sx={{ 
                    bgcolor: "rgba(255, 255, 255, 0.9)", 
                    borderRadius: "50%", 
                    p: 3,
                    mb: 2
                  }}>
                    <LocationOn sx={{ fontSize: 60, color: "primary.main" }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "white", mb: 1 }}>
                    {localParcelle.ville}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Îlot {localParcelle.ilot}, Parcelle {localParcelle.ref}
                  </Typography>
                </Box>

                {/* Carte interactive Leaflet */}
                {(localParcelle.latitude && localParcelle.longitude) ? (
                  <Grid item xs={12} sx={{ mb: 3 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255, 255, 255, 0.95)" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          🗺️ Localisation sur la carte
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            const googleMapsUrl = `https://www.google.com/maps/@${localParcelle.latitude},${localParcelle.longitude},18z`;
                            window.open(googleMapsUrl, "_blank");
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          Voir sur Google Maps
                        </Button>
                      </Box>
                      <Box sx={{ height: 400, borderRadius: 2, overflow: "hidden", border: "2px solid #e0e0e0" }}>
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
                                sx={{ mt: 1 }}
                                onClick={() => {
                                  const googleMapsUrl = `https://www.google.com/maps/@${localParcelle.latitude},${localParcelle.longitude},18z`;
                                  window.open(googleMapsUrl, "_blank");
                                }}
                              >
                                Voir sur Google Maps
                              </Button>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </Box>
                    </Paper>
                  </Grid>
                ) : null}

                {/* Coordonnées GPS */}
                {(localParcelle.latitude && localParcelle.longitude) ? (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        bgcolor: "rgba(255, 255, 255, 0.9)", 
                        borderRadius: "50%", 
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <LocationOn sx={{ color: "warning.main" }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontSize: "0.8rem", fontWeight: 600, color: "white" }}>
                          COORDONNÉES GPS
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: "rgba(255,255,255,0.95)" }}>
                          Lat: {localParcelle.latitude}<br/>
                          Lng: {localParcelle.longitude}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Boutons de navigation modernisés */}
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<LocationOn />}
                        onClick={() => {
                          const osmUrl = getNavigationUrl(localParcelle.latitude, localParcelle.longitude);
                          if (osmUrl) window.open(osmUrl, "_blank");
                        }}
                        sx={{
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "white",
                          fontWeight: "bold",
                          px: { xs: 2.5, sm: 3 },
                          py: { xs: 1.2, sm: 1.5 },
                          borderRadius: "50px",
                          textTransform: "none",
                          boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: "-100%",
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                            transition: "left 0.5s ease",
                          },
                          "&:hover": {
                            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                            boxShadow: "0 6px 24px rgba(16, 185, 129, 0.4)",
                            transform: "translateY(-2px)",
                            "&::before": {
                              left: "100%",
                            },
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Voir sur la carte
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<LocationOn />}
                        onClick={async () => {
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
                                switch(error.code) {
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
                                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${localParcelle.latitude},${localParcelle.longitude}`;
                                window.open(googleMapsUrl, "_blank");
                              },
                              {
                                enableHighAccuracy: true,
                                timeout: 15000,
                                maximumAge: 0
                              }
                            );
                          } catch (error) {
                            console.error("Erreur:", error);
                            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${localParcelle.latitude},${localParcelle.longitude}`;
                            window.open(googleMapsUrl, "_blank");
                          }
                        }}
                        sx={{
                          borderColor: "#10b981",
                          color: "#10b981",
                          fontWeight: "bold",
                          px: { xs: 2.5, sm: 3 },
                          py: { xs: 1.2, sm: 1.5 },
                          borderRadius: "50px",
                          textTransform: "none",
                          borderWidth: 2,
                          bgcolor: "rgba(16, 185, 129, 0.05)",
                          "&:hover": {
                            bgcolor: "rgba(16, 185, 129, 0.1)",
                            borderColor: "#059669",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Itinéraire depuis ma position
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}>
                      Coordonnées GPS non disponibles
                    </Typography>
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<LocationOn />}
                      onClick={() => {
                        const searchUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${localParcelle.ville} Îlot ${localParcelle.ilot}, Parcelle ${localParcelle.ref}`)}`;
                        window.open(searchUrl, "_blank");
                      }}
                      sx={{
                        borderColor: "rgba(255, 255, 255, 0.8)",
                        color: "white",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.1)",
                          borderColor: "white"
                        }
                      }}
                    >
                      Rechercher sur Google Maps
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Documents et vidéos - Moderne */}
            {(localParcelle.documents && localParcelle.documents.length > 0) || 
             (localParcelle.videos && localParcelle.videos.length > 0) ? (
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: { xs: 2.5, sm: 3 }, 
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.98) 100%)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <Box
                      sx={{
                        fontSize: { xs: 20, sm: 24 },
                      }}
                    >
                      📄
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      sx={{
                        fontSize: {
                          xs: "clamp(1rem, 3vw, 1.2rem)",
                          sm: "1.3rem",
                        },
                        color: "#10b981",
                      }}
                    >
                      Documents et médias
                    </Typography>
                  </Box>
                  
                  {/* Section Vidéos */}
                  {localParcelle.videos && localParcelle.videos.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                        🎥 Vidéos ({localParcelle.videos.length})
                      </Typography>
                      <Stack spacing={2}>
                        {localParcelle.videos.map((videoUrl, idx) => {
                          const embedUrl = getVideoEmbedUrl(videoUrl);
                          return (
                            <Box key={idx} sx={{ mb: 2 }}>
                              {embedUrl && embedUrl.startsWith('http') ? (
                                <Box
                                  sx={{
                                    position: "relative",
                                    width: "100%",
                                    paddingTop: "56.25%", // 16:9 aspect ratio
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    bgcolor: "#000",
                                    mb: 1,
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
                                  variant="outlined"
                                  component="a"
                                  href={videoUrl}
                                  target="_blank"
                                  startIcon={<VideoLibrary />}
                                  fullWidth
                                  sx={{ py: 1.5 }}
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

                  {/* Section Documents */}
                  {localParcelle.documents && localParcelle.documents.length > 0 && (
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          mb: 2, 
                          fontWeight: 600,
                          color: "#10b981",
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        📎 Documents ({localParcelle.documents.length})
                      </Typography>
                      <Stack spacing={1.5}>
                        {localParcelle.documents.map((docUrl, idx) => {
                          const fileName = getFileNameFromUrl(docUrl);
                          const fullUrl = fixImageUrl(docUrl);
                          // Extraire l'extension pour l'icône
                          const extension = fileName.split('.').pop()?.toLowerCase() || 'file';
                          
                          return (
                            <Button
                              key={idx}
                              variant="outlined"
                              component="a"
                              href={fullUrl}
                              target="_blank"
                              download={fileName}
                              startIcon={<Description />}
                              fullWidth
                              sx={{
                                justifyContent: "flex-start",
                                py: { xs: 1.2, sm: 1.5 },
                                px: { xs: 1.5, sm: 2 },
                                textTransform: "none",
                                textAlign: "left",
                                borderRadius: 2,
                                borderColor: "rgba(16, 185, 129, 0.3)",
                                color: "#10b981",
                                bgcolor: "rgba(16, 185, 129, 0.05)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  bgcolor: "rgba(16, 185, 129, 0.1)",
                                  borderColor: "#10b981",
                                  transform: "translateX(4px)",
                                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                                },
                              }}
                            >
                              <Box sx={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="medium"
                                  sx={{
                                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                    whiteSpace: "normal",
                                    color: "#10b981",
                                  }}
                                >
                                  {fileName}
                                </Typography>
                              </Box>
                            </Button>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ) : null}
          </Grid>
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

