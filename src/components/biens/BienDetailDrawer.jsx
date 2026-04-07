import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Drawer,
  Button,
  Chip,
  Stack,
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
  VideoLibrary,
} from "@mui/icons-material";
import { decimalToDMS } from "../../utils/coordinateUtils";

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

const BienDetailDrawer = ({ open, onClose, selectedBien, onBienUpdate }) => {
  const [localBien, setLocalBien] = useState(selectedBien);

  // Mettre à jour le bien local quand selectedBien change
  React.useEffect(() => {
    setLocalBien(selectedBien);
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
      <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* En-tête du drawer */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {localBien ? `🏠 ${localBien.titre}` : "🏠 Détails du Bien Immobilier"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {localBien ? `${localBien.type} à ${localBien.ville}` : "Informations complètes"}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: "grey.100",
              "&:hover": { bgcolor: "grey.200" },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Contenu du drawer */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {localBien ? (
            <Grid container spacing={3}>
              {/* Photos du bien */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  📸 Photos du bien
                </Typography>
                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                  {/* Photo principale */}
                  <Box
                    component="img"
                    src={localBien.image}
                    alt={localBien.titre}
                    sx={{
                      width: "100%",
                      height: 400,
                      objectFit: "cover",
                      borderRadius: 2,
                      mb: 2
                    }}
                  />
                  
                  {/* Galerie des autres photos */}
                  {localBien.images && localBien.images.length > 1 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" mb={1}>
                        Autres photos ({localBien.images.length - 1})
                      </Typography>
                      <Grid container spacing={1}>
                        {localBien.images.slice(1).map((image, index) => (
                          <Grid item xs={3} key={index}>
                            <Box
                              component="img"
                              src={fixImageUrl(image)}
                              alt={`${localBien.titre} - Photo ${index + 2}`}
                              sx={{
                                width: "100%",
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 1,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                "&:hover": { 
                                  transform: "scale(1.05)",
                                  boxShadow: 2
                                }
                              }}
                              onClick={() => handleImageClick(index)}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Si pas d'autres photos */}
                  {(!localBien.images || localBien.images.length <= 1) && (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucune photo supplémentaire disponible
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Vidéos du bien */}
              {localBien.videos && localBien.videos.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    🎥 Vidéos du bien
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Grid container spacing={3}>
                      {localBien.videos.map((videoUrl, index) => {
                        const videoUrlStr = typeof videoUrl === "string" ? videoUrl : videoUrl.url || videoUrl;
                        const embedUrl = getVideoEmbedUrl(videoUrlStr);
                        const isYouTube = embedUrl && embedUrl.includes('youtube.com/embed');
                        const isVimeo = embedUrl && embedUrl.includes('vimeo.com/video');
                        
                        return (
                          <Grid item xs={12} md={6} key={index}>
                            <Paper
                              elevation={3}
                              sx={{
                                overflow: "hidden",
                                borderRadius: 2,
                                position: "relative",
                                "&:hover": {
                                  boxShadow: 6,
                                },
                              }}
                            >
                              {embedUrl && (isYouTube || isVimeo) ? (
                                <Box
                                  component="iframe"
                                  src={embedUrl}
                                  sx={{
                                    width: "100%",
                                    height: 300,
                                    border: "none",
                                    display: "block",
                                  }}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 300,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "primary.main",
                                    color: "white",
                                    p: 3,
                                  }}
                                >
                                  <VideoLibrary sx={{ fontSize: 48, mb: 2 }} />
                                  <Typography variant="h6" fontWeight="bold" mb={1}>
                                    Vidéo {index + 1}
                                  </Typography>
                                  <Button
                                    variant="contained"
                                    color="inherit"
                                    href={videoUrlStr}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                      bgcolor: "white",
                                      color: "primary.main",
                                      "&:hover": {
                                        bgcolor: "grey.100",
                                      },
                                    }}
                                  >
                                    Voir la vidéo
                                  </Button>
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Grid>
              )}

              {/* Situation géographique du Terrain */}
              {localBien.situationGeographique && (
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    🗺️ Situation géographique du Terrain
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(76, 175, 80, 0.1)",
                    border: "1px solid rgba(76, 175, 80, 0.2)"
                  }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: "text.primary" }}>
                      {localBien.situationGeographique}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Description physique */}
              {localBien.descriptionPhysique && (
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    📋 Description physique
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(255, 152, 0, 0.1)",
                    border: "1px solid rgba(255, 152, 0, 0.2)"
                  }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: "text.primary" }}>
                      {localBien.descriptionPhysique}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Atouts majeurs */}
              {localBien.atoutsMajeurs && localBien.atoutsMajeurs.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    ⭐ Atouts majeurs
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(156, 39, 176, 0.1)",
                    border: "1px solid rgba(156, 39, 176, 0.2)"
                  }}>
                    <Grid container spacing={2}>
                      {localBien.atoutsMajeurs.map((atout, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ 
                            p: 2,
                            borderRadius: 2,
                            background: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid rgba(156, 39, 176, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(156, 39, 176, 0.2)"
                            }
                          }}>
                            <Box sx={{ 
                              bgcolor: "secondary.main", 
                              color: "white", 
                              borderRadius: "50%", 
                              p: 0.8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 32,
                              height: 32
                            }}>
                              <Typography variant="body2" fontWeight="bold">
                                ✓
                              </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight={500} sx={{ flex: 1 }}>
                              {typeof atout === "string" ? atout : atout.nom || atout}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Caractéristiques du bien */}
              {localBien.caracteristiques && Object.keys(localBien.caracteristiques).length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    🏠 Caractéristiques du bien
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)",
                    border: "1px solid rgba(102, 126, 234, 0.1)"
                  }}>
                    <Grid container spacing={2}>
                      {/* Chambres */}
                      {localBien.caracteristiques.nbChambres && (
                        <Grid item xs={6} sm={4} md={3}>
                          <Box sx={{ 
                            textAlign: "center",
                            p: 2,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                            color: "white"
                          }}>
                            <Typography variant="h4" fontWeight="bold">
                              {localBien.caracteristiques.nbChambres}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                              🛏️ Chambres
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {/* Salles de bain */}
                      {localBien.caracteristiques.nbSallesBain && (
                        <Grid item xs={6} sm={4} md={3}>
                          <Box sx={{ 
                            textAlign: "center",
                            p: 2,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            color: "white"
                          }}>
                            <Typography variant="h4" fontWeight="bold">
                              {localBien.caracteristiques.nbSallesBain}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                              🚿 Salles de bain
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {/* Salons */}
                      {localBien.caracteristiques.nbSalons && (
                        <Grid item xs={6} sm={4} md={3}>
                          <Box sx={{ 
                            textAlign: "center",
                            p: 2,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                            color: "white"
                          }}>
                            <Typography variant="h4" fontWeight="bold">
                              {localBien.caracteristiques.nbSalons}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                              🛋️ Salons
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {/* Équipements */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid rgba(0, 0, 0, 0.1)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 2 }}>
                            ÉQUIPEMENTS ET AMÉNAGEMENTS
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {localBien.caracteristiques.garage && (
                              <Chip 
                                icon={<Garage />}
                                label="Garage" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.piscine && (
                              <Chip 
                                icon={<Pool />}
                                label="Piscine" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.jardin && (
                              <Chip 
                                icon={<Nature />}
                                label="Jardin" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.climatisation && (
                              <Chip 
                                icon={<AcUnit />}
                                label="Climatisation" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.cuisine && localBien.caracteristiques.cuisine !== "Non spécifiée" && (
                              <Chip 
                                icon={<Kitchen />}
                                label={`Cuisine: ${localBien.caracteristiques.cuisine}`} 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.ascenseur && (
                              <Chip 
                                label="Ascenseur" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.balcon && (
                              <Chip 
                                label="Balcon" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.electricite && (
                              <Chip 
                                label="Électricité" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.eau && (
                              <Chip 
                                label="Eau courante" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.securite && (
                              <Chip 
                                label="Sécurité" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.irrigation && (
                              <Chip 
                                label="Irrigation" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.cloture && (
                              <Chip 
                                label="Clôture" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.arbore && (
                              <Chip 
                                label="Arboré" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                            {localBien.caracteristiques.potager && (
                              <Chip 
                                label="Potager" 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                }} 
                              />
                            )}
                          </Box>

                          {/* Informations supplémentaires */}
                          {(localBien.caracteristiques.anneeConstruction || localBien.caracteristiques.etatGeneral || localBien.caracteristiques.acces || localBien.caracteristiques.etage) && (
                            <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
                              <Grid container spacing={2}>
                                {localBien.caracteristiques.anneeConstruction && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                                      Année de construction
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {localBien.caracteristiques.anneeConstruction}
                                    </Typography>
                                  </Grid>
                                )}
                                {localBien.caracteristiques.etatGeneral && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                                      État général
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {localBien.caracteristiques.etatGeneral}
                                    </Typography>
                                  </Grid>
                                )}
                                {localBien.caracteristiques.acces && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                                      Accès
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {localBien.caracteristiques.acces}
                                    </Typography>
                                  </Grid>
                                )}
                                {localBien.caracteristiques.etage && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                                      Étage
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {localBien.caracteristiques.etage}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          )}

                          {/* Types d'arbres (pour jardin) */}
                          {localBien.caracteristiques.typesArbres && localBien.caracteristiques.typesArbres.length > 0 && (
                            <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1 }}>
                                TYPES D'ARBRES
                              </Typography>
                              <Grid container spacing={1}>
                                {localBien.caracteristiques.typesArbres.map((arbre, index) => (
                                  <Grid item xs={12} sm={6} key={index}>
                                    <Chip 
                                      label={`${arbre.type || arbre}: ${arbre.nombre || ""}`} 
                                      size="small" 
                                      sx={{ 
                                        background: "rgba(76, 175, 80, 0.1)",
                                        color: "success.main",
                                        border: "1px solid rgba(76, 175, 80, 0.3)",
                                        fontWeight: "bold",
                                      }} 
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}

                          {/* Éléments du jardin */}
                          {localBien.caracteristiques.elementsJardin && (
                            <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1 }}>
                                ÉLÉMENTS DU JARDIN
                              </Typography>
                              <Typography variant="body2">
                                {localBien.caracteristiques.elementsJardin}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Informations principales */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" mb={3} sx={{ 
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "1.5rem"
                }}>
                  ℹ️ Informations principales
                </Typography>
                <Paper sx={{ 
                  p: 3, 
                  background: "linear-gradient(135deg, #fff5f8 0%, #ffeef2 100%)",
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(240, 147, 251, 0.1)",
                  border: "1px solid rgba(240, 147, 251, 0.1)"
                }}>
                  <Grid container spacing={3}>
                    {/* Type de bien */}
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        color: "white",
                        textAlign: "center"
                      }}>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9, fontSize: "0.8rem", fontWeight: 600 }}>
                          TYPE DE BIEN
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                          {localBien.type}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Ville */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2,
                        borderRadius: 2,
                        background: "rgba(76, 175, 80, 0.1)",
                        border: "1px solid rgba(76, 175, 80, 0.2)"
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                          VILLE
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                          {localBien.ville}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Superficie */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2,
                        borderRadius: 2,
                        background: "rgba(255, 152, 0, 0.1)",
                        border: "1px solid rgba(255, 152, 0, 0.2)"
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                          SUPERFICIE
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ mt: 1 }}>
                          {localBien.superficie} m²
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2,
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(0, 0, 0, 0.1)"
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 2 }}>
                          DESCRIPTION
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {localBien.description}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Informations financières */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" mb={3} sx={{ 
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "1.5rem"
                }}>
                  💰 Informations financières
                </Typography>
                <Paper sx={{ 
                  p: 3, 
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  color: "white",
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)"
                }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box textAlign="center">
                        <Typography variant="h3" fontWeight="bold" sx={{ color: "white" }}>
                          {formatMoney(localBien.prix)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                          Valeur estimée
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => {
                        const whatsappUrl = `https://wa.me/22780648383`;
                        window.open(whatsappUrl, "_blank");
                      }}
                      sx={{
                        background: "rgba(255, 255, 255, 0.9)",
                        color: "primary.main",
                        px: 4,
                        fontWeight: "bold",
                        "&:hover": {
                          background: "white",
                          transform: "translateY(-2px)"
                        }
                      }}
                    >
                      📞 Contacter le propriétaire
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        const whatsappUrl = `https://wa.me/22780648383`;
                        window.open(whatsappUrl, "_blank");
                      }}
                      sx={{ 
                        px: 4,
                        borderColor: "white",
                        color: "white",
                        fontWeight: "bold",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.1)",
                          borderColor: "white"
                        }
                      }}
                    >
                      🏠 Demander une visite
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Localisation */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  📍 Localisation et géolocalisation
                </Typography>
                <Paper sx={{ p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={3}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box sx={{ 
                            bgcolor: "primary.main", 
                            color: "white", 
                            borderRadius: "50%", 
                            p: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <LocationOn />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                              VILLE
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                              {localBien.ville}
                            </Typography>
                          </Box>
                        </Box>

                        {localBien.quartier && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ 
                              bgcolor: "secondary.main", 
                              color: "white", 
                              borderRadius: "50%", 
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <Home />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                QUARTIER
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="secondary.main">
                                {localBien.quartier}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {localBien.adresse && (
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <Box sx={{ 
                              bgcolor: "success.main", 
                              color: "white", 
                              borderRadius: "50%", 
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              mt: 0.5
                            }}>
                              <LocationOn />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1 }}>
                                ADRESSE
                              </Typography>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                color="success.main"
                                sx={{
                                  wordBreak: "break-word",
                                  overflowWrap: "break-word",
                                  whiteSpace: "normal",
                                  lineHeight: 1.5
                                }}
                              >
                                {localBien.adresse}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Coordonnées GPS */}
                        {localBien.latitude && localBien.longitude && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ 
                              bgcolor: "warning.main", 
                              color: "white", 
                              borderRadius: "50%", 
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <LocationOn />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                COORDONNÉES GPS
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
                                Format décimal:<br/>
                                Lat: {localBien.latitude}<br/>
                                Lng: {localBien.longitude}
                              </Typography>
                              {decimalToDMS(localBien.latitude, "lat") && decimalToDMS(localBien.longitude, "lon") && (
                                <Typography variant="body2" fontWeight="bold" color="warning.dark" sx={{ mt: 1, fontSize: "0.85rem" }}>
                                  Format DMS:<br/>
                                  {decimalToDMS(localBien.latitude, "lat")} / {decimalToDMS(localBien.longitude, "lon")}
                                </Typography>
                              )}
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
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
                                      const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${localBien.latitude},${localBien.longitude}`;
                                      window.open(googleMapsUrl, "_blank");
                                    },
                                    (error) => {
                                      console.error("Erreur de géolocalisation:", error);
                                      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${localBien.latitude},${localBien.longitude}`;
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
                                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${localBien.latitude},${localBien.longitude}`;
                                  window.open(googleMapsUrl, "_blank");
                                }
                              }}
                              sx={{ 
                                minWidth: "auto",
                                px: 1,
                                py: 0.5,
                                fontSize: "0.7rem"
                              }}
                            >
                              Itinéraire
                            </Button>
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        height: 350, 
                        borderRadius: 3, 
                        overflow: "hidden",
                        position: "relative",
                        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {/* Overlay avec effet de verre */}
                        <Box sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(10px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column"
                        }}>
                          <Box sx={{ 
                            bgcolor: "rgba(255, 255, 255, 0.9)", 
                            borderRadius: "50%", 
                            p: 3,
                            mb: 2,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                          }}>
                            <LocationOn sx={{ fontSize: 40, color: "primary.main" }} />
                          </Box>
                          <Typography variant="h6" fontWeight="bold" color="white" mb={1}>
                            🗺️ Géolocalisation Interactive
                          </Typography>
                          <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={2} textAlign="center">
                            Visualisez l'emplacement exact sur la carte
                          </Typography>
                          
                          {/* Boutons de géolocalisation */}
                          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={<LocationOn />}
                              onClick={() => {
                                if (localBien.latitude && localBien.longitude) {
                                  const lat = localBien.latitude;
                                  const lng = localBien.longitude;
                                  const googleMapsUrl = `https://www.google.com/maps/@${lat},${lng},18z`;
                                  window.open(googleMapsUrl, "_blank");
                                } else {
                                  const searchQuery = localBien.adresse || localBien.ville;
                                  const fallbackUrl = `https://maps.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
                                  window.open(fallbackUrl, "_blank");
                                }
                              }}
                              sx={{
                                background: "rgba(255, 255, 255, 0.9)",
                                color: "primary.main",
                                fontWeight: "bold",
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: "none",
                                "&:hover": {
                                  background: "white",
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
                                },
                                transition: "all 0.3s ease"
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
                                      const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${localBien.latitude},${localBien.longitude}`;
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
                                      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${localBien.latitude},${localBien.longitude}`;
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
                                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${localBien.latitude},${localBien.longitude}`;
                                  window.open(googleMapsUrl, "_blank");
                                }
                              }}
                              sx={{
                                borderColor: "rgba(255, 255, 255, 0.8)",
                                color: "white",
                                fontWeight: "bold",
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: "none",
                                "&:hover": {
                                  background: "rgba(255, 255, 255, 0.1)",
                                  borderColor: "white"
                                },
                                transition: "all 0.3s ease"
                              }}
                            >
                              Itinéraire depuis ma position
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <Typography variant="h6" color="text.secondary">
                Aucun bien immobilier sélectionné
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default BienDetailDrawer;

