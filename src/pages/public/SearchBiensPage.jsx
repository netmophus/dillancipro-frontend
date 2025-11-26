import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Pagination,
  Stack,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  ImageList,
  ImageListItem,
  Tabs,
  Tab,
  Drawer,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LocationOn,
  Business,
  AttachMoney,
  Square,
  FilterList,
  Clear,
  Phone,
  Email,
  Bed,
  Bathtub,
  Close,
  Home,
  Image as ImageIcon,
  VideoLibrary,
  Description,
  Download,
  ChevronLeft,
  ChevronRight,
  Nature,
  Garage,
  Pool,
  AcUnit,
  Kitchen,
  Apartment,
  Villa,
  Warehouse,
  Map as MapIcon,
  OpenInNew,
  ArrowForward,
  VerifiedUser,
  ContentCopy,
  WhatsApp,
} from "@mui/icons-material";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import api from "../../services/api";

const SearchBiensPage = () => {
  const [loading, setLoading] = useState(false);
  const [biens, setBiens] = useState([]);
  const [filters, setFilters] = useState({
    ville: "",
    quartier: "",
    type: "",
    agence: "",
    prixMin: "",
    prixMax: "",
    superficieMin: "",
    superficieMax: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    villes: [],
    quartiers: [],
    types: [],
    agences: [],
  });
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedBien, setSelectedBien] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openBiensDrawer, setOpenBiensDrawer] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [mediaTab, setMediaTab] = useState(0); // 0: photos, 1: videos, 2: documents
  
  // État pour l'affichage progressif des biens (initialement 3)
  const [biensDisplayed, setBiensDisplayed] = useState(3);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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

  // Charger les options de filtres et les stats au montage
  useEffect(() => {
    const loadData = async () => {
      await fetchFilterOptions();
      await fetchStats();
    };
    loadData();
  }, []);

  // Rechercher les biens quand les filtres changent
  useEffect(() => {
    // Rechercher une fois que les options sont chargées
    if (filterOptions.villes.length > 0 || Object.keys(filterOptions).length > 0) {
      searchBiens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, sortBy, sortOrder]);

  // Réinitialiser l'affichage progressif quand les biens changent
  useEffect(() => {
    setBiensDisplayed(3);
  }, [biens]);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get("/public/biens/filters");
      const filtersData = response.data.filters;
      setFilterOptions(filtersData);
    } catch (error) {
      console.error("Erreur chargement options filtres:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/public/biens/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const searchBiens = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      // Nettoyer les paramètres vides
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get("/public/biens/search", { params });
      setBiens(response.data.biens || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Erreur recherche biens:", error);
      setBiens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      ville: "",
      quartier: "",
      type: "",
      agence: "",
      prixMin: "",
      prixMax: "",
      superficieMin: "",
      superficieMax: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fonction pour afficher plus de biens
  const handleShowMoreBiens = () => {
    setBiensDisplayed((prev) => Math.min(prev + 3, biens.length));
  };

  // Fonction pour transformer les données du bien pour correspondre à la structure de HomePage
  const transformBienForDrawer = (bien) => {
    if (!bien) return null;
    
    return {
      ...bien,
      image: bien.images && bien.images.length > 0 && bien.images[0] 
        ? fixImageUrl(typeof bien.images[0] === "string" ? bien.images[0] : bien.images[0].url || bien.images[0])
        : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=90",
      images: bien.images || [],
      videos: bien.videos || [],
      documents: bien.documents || [],
      ville: bien.localisation?.ville || "Ville non spécifiée",
      quartier: bien.localisation?.quartier,
      adresse: bien.localisation?.adresse,
      latitude: bien.localisation?.latitude,
      longitude: bien.localisation?.longitude,
      superficie: bien.superficie?.toString() || "0",
      prix: bien.prix || 0,
      type: bien.type || "Bien immobilier",
      description: bien.description || "",
    };
  };

  const handleOpenBienDetails = (bien) => {
    const transformedBien = transformBienForDrawer(bien);
    setSelectedBien(transformedBien);
    setOpenBiensDrawer(true);
  };

  const handleCloseBienDetails = () => {
    setOpenBiensDrawer(false);
    setSelectedBien(null);
  };

  const handleBienClick = (bien) => {
    handleOpenBienDetails(bien);
  };

  // Fonction pour ouvrir le lightbox avec une photo
  const handleOpenLightbox = (index) => {
    setSelectedPhotoIndex(index);
    setLightboxOpen(true);
  };

  // Fonction pour naviguer dans le lightbox
  const handlePreviousPhoto = () => {
    if (!selectedBien?.images || selectedBien.images.length === 0) return;
    setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : selectedBien.images.length - 1));
  };

  const handleNextPhoto = () => {
    if (!selectedBien?.images || selectedBien.images.length === 0) return;
    setSelectedPhotoIndex((prev) => (prev < selectedBien.images.length - 1 ? prev + 1 : 0));
  };

  // Fonction pour convertir une URL YouTube/Vimeo en URL embed
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
    
    // Si ce n'est ni YouTube ni Vimeo, retourner l'URL originale
    return videoUrl;
  };

  // Fonction pour extraire le nom du fichier depuis une URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Document";
    try {
      if (url.includes("cloudinary.com")) {
        const urlParts = url.split("/");
        const fileNameWithExt = urlParts[urlParts.length - 1].split("?")[0];
        const cleanName = fileNameWithExt
          .replace(/_\d{13}_[a-z0-9]{8}\./, ".")
          .replace(/_[a-z0-9]{8}_\d{13}\./, ".")
          .replace(/_v\d+/, "");
        return cleanName || fileNameWithExt;
      }
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      return pathParts[pathParts.length - 1] || "document";
    } catch (e) {
      const parts = url.split("/");
      return parts[parts.length - 1].split("?")[0] || "document";
    }
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== "" && v !== false).length;

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#e3f2fd" }}>
      <Navbar />
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 6,
          mb: 4,
          width: "100%",
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
            Biens Immobiliers à Vendre
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.9)" sx={{ mb: 3 }}>
            Trouvez le bien idéal parmi {stats?.totalBiens || 0} biens disponibles
          </Typography>

          {/* Statistiques rapides */}
          {stats && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
                  <Typography variant="caption">Prix minimum</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.prix.prixMin?.toLocaleString() || 0} FCFA
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
                  <Typography variant="caption">Prix maximum</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.prix.prixMax?.toLocaleString() || 0} FCFA
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
                  <Typography variant="caption">Prix moyen</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {Math.round(stats.prix.prixMoyen || 0).toLocaleString()} FCFA
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ width: "100%", mb: 4 }}>
        {/* Barre de recherche horizontale */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterList />
              Filtres de recherche
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} filtre${activeFiltersCount > 1 ? "s" : ""} actif${activeFiltersCount > 1 ? "s" : ""}`}
                color="primary"
                size="small"
                onClick={handleClearFilters}
                deleteIcon={<Clear />}
                onDelete={handleClearFilters}
                sx={{ cursor: "pointer" }}
              />
            )}
          </Box>

          <Grid container spacing={2}>
            {/* Ligne 1: Localisation et Type */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Ville</InputLabel>
                <Select value={filters.ville || ""} onChange={(e) => handleFilterChange("ville", e.target.value)} label="Ville">
                  <MenuItem value="">Toutes les villes</MenuItem>
                  {filterOptions.villes.map((ville) => (
                    <MenuItem key={ville.id} value={ville.nom}>
                      {ville.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Quartier</InputLabel>
                <Select value={filters.quartier || ""} onChange={(e) => handleFilterChange("quartier", e.target.value)} label="Quartier">
                  <MenuItem value="">Tous les quartiers</MenuItem>
                  {filterOptions.quartiers.map((quartier) => (
                    <MenuItem key={quartier.id} value={quartier.nom}>
                      {quartier.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type de bien</InputLabel>
                <Select value={filters.type || ""} onChange={(e) => handleFilterChange("type", e.target.value)} label="Type de bien">
                  <MenuItem value="">Tous les types</MenuItem>
                  {filterOptions.types.map((type) => (
                    <MenuItem key={type.id || type.nom} value={type.nom}>
                      {type.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Agence Immobilière</InputLabel>
                <Select value={filters.agence || ""} onChange={(e) => handleFilterChange("agence", e.target.value)} label="Agence Immobilière">
                  <MenuItem value="">Toutes les agences</MenuItem>
                  {filterOptions.agences.map((agence) => (
                    <MenuItem key={agence.id} value={agence.id}>
                      {agence.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Ligne 2: Prix */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Prix Min (FCFA)"
                type="number"
                value={filters.prixMin}
                onChange={(e) => handleFilterChange("prixMin", e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Prix Max (FCFA)"
                type="number"
                value={filters.prixMax}
                onChange={(e) => handleFilterChange("prixMax", e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                }}
              />
            </Grid>

            {/* Ligne 2: Superficie */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Superficie Min (m²)"
                type="number"
                value={filters.superficieMin}
                onChange={(e) => handleFilterChange("superficieMin", e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">m²</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Superficie Max (m²)"
                type="number"
                value={filters.superficieMax}
                onChange={(e) => handleFilterChange("superficieMax", e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">m²</InputAdornment>,
                }}
              />
            </Grid>

            {/* Ligne 3: Tri */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trier par</InputLabel>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Trier par">
                  <MenuItem value="createdAt">Date d'ajout</MenuItem>
                  <MenuItem value="prix">Prix</MenuItem>
                  <MenuItem value="superficie">Superficie</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Ordre</InputLabel>
                <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} label="Ordre">
                  <MenuItem value="asc">Croissant</MenuItem>
                  <MenuItem value="desc">Décroissant</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Button variant="outlined" fullWidth startIcon={<Clear />} onClick={handleClearFilters} disabled={activeFiltersCount === 0} sx={{ height: "40px" }}>
                Réinitialiser les filtres
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Liste des biens */}
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress />
            </Box>
          ) : biens.length === 0 ? (
            <Alert severity="info">Aucun bien trouvé avec ces critères de recherche.</Alert>
          ) : (
            <>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  {pagination.total} bien{pagination.total > 1 ? "s" : ""} trouvé{pagination.total > 1 ? "s" : ""}
                </Typography>
              </Box>

              {/* Conteneur Grid avec 3 cartes par ligne */}
              <Box
                sx={{
                  mx: "auto",
                  maxWidth: 1200,
                  width: "100%",
                }}
              >
                <Grid 
                  container 
                  spacing={3}
                  sx={{
                    width: "100%",
                    margin: 0,
                  }}
                >
                  {biens.slice(0, biensDisplayed).map((bien) => {
                    // Transformer les données pour correspondre à la structure de HomePage
                    const bienImage = bien.images && bien.images.length > 0 && bien.images[0] 
                      ? fixImageUrl(typeof bien.images[0] === "string" ? bien.images[0] : bien.images[0].url || bien.images[0])
                      : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=90";
                    const bienVille = bien.localisation?.ville || "Ville non spécifiée";
                    const bienSuperficie = bien.superficie?.toString() || "0";
                    
                    return (
                      <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={4}
                        key={bien._id}
                        sx={{
                          display: "flex",
                          flexBasis: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                          maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                          flexGrow: 0,
                          flexShrink: 0,
                        }}
                      >
                        <Card
                          elevation={3}
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: 3,
                            overflow: "hidden",
                            boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
                            transition: "transform 0.25s ease, box-shadow 0.25s ease",
                            "&:hover": {
                              transform: { xs: "none", md: "translateY(-6px)" },
                              boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
                            },
                          }}
                        >
                        {/* Image */}
                        <Box
                          sx={{
                            height: { xs: 200, sm: 210, md: 220 },
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            component="img"
                            src={bienImage}
                            alt={bien.titre}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease",
                              "&:hover": { transform: "scale(1.05)" },
                            }}
                          />

                          {/* Tags en haut à droite */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.75,
                              alignItems: "flex-end",
                            }}
                          >
                            <Box
                              sx={{
                                px: 1.4,
                                py: 0.6,
                                borderRadius: 999,
                                bgcolor: "rgba(15,23,42,0.85)",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "white",
                                  fontWeight: 600,
                                  fontSize: { xs: "0.68rem", sm: "0.72rem" },
                                  textTransform: "uppercase",
                                  letterSpacing: 0.4,
                                }}
                              >
                                {bien.type || "Bien immobilier"}
                              </Typography>
                            </Box>

                            {bien.verified && (
                              <Chip
                                icon={
                                  <VerifiedUser
                                    sx={{ fontSize: "0.85rem !important" }}
                                  />
                                }
                                label="Vérifié"
                                size="small"
                                color="success"
                                sx={{
                                  bgcolor: "rgba(255,255,255,0.95)",
                                  fontWeight: 600,
                                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                  height: 22,
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Contenu carte */}
                        <CardContent
                          sx={{
                            p: { xs: 2.2, sm: 2.5, md: 3 },
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                              mb: 1.5,
                              fontSize: {
                                xs: "1.05rem",
                                sm: "1.15rem",
                                md: "1.2rem",
                              },
                              lineHeight: 1.3,
                            }}
                          >
                            {bien.titre}
                          </Typography>

                          <Stack spacing={1.1} mb={2.2}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LocationOn fontSize="small" color="primary" />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontSize: {
                                    xs: "0.85rem",
                                    sm: "0.9rem",
                                  },
                                }}
                              >
                                {bienVille}
                              </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                              <Home fontSize="small" color="primary" />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontSize: {
                                    xs: "0.85rem",
                                    sm: "0.9rem",
                                  },
                                }}
                              >
                                {bienSuperficie} m²
                              </Typography>
                            </Box>

                            {bien.reference && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontSize: {
                                    xs: "0.8rem",
                                    sm: "0.9rem",
                                  },
                                }}
                              >
                                Réf : {bien.reference}
                              </Typography>
                            )}
                          </Stack>

                          <Divider sx={{ my: 1.5 }} />

                          <Typography
                            variant="h5"
                            color="primary"
                            fontWeight="bold"
                            sx={{
                              mb: 1.8,
                              fontSize: {
                                xs: "1.35rem",
                                sm: "1.45rem",
                                md: "1.6rem",
                              },
                            }}
                          >
                            {formatMoney(bien.prix || 0)}
                          </Typography>

                          <Button
                            fullWidth
                            variant="contained"
                            endIcon={<ArrowForward />}
                            onClick={() => handleOpenBienDetails(bien)}
                            sx={{
                              mt: "auto",
                              py: { xs: 1.1, sm: 1.2 },
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: {
                                xs: "0.9rem",
                                sm: "0.95rem",
                              },
                              background:
                                "linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)",
                                transform: { xs: "none", md: "translateY(-2px)" },
                              },
                            }}
                          >
                            Voir le bien
                          </Button>
                        </CardContent>
                      </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Bouton "Afficher la suite" */}
                {biensDisplayed < biens.length && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 4,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleShowMoreBiens}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        fontWeight: 600,
                        borderRadius: 3,
                        textTransform: "none",
                        borderWidth: 2,
                        "&:hover": {
                          borderWidth: 2,
                        },
                      }}
                    >
                      Afficher la suite
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </Container>
      <Footer />

      {/* Drawer détails bien */}
      <Drawer
        anchor="right"
        open={openBiensDrawer}
        onClose={handleCloseBienDetails}
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
                {selectedBien ? `🏠 ${selectedBien.titre}` : "🏠 Détails du Bien Immobilier"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedBien ? `${selectedBien.type} à ${selectedBien.ville}` : "Informations complètes"}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseBienDetails}
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
            {selectedBien ? (
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
                      src={selectedBien.image}
                      alt={selectedBien.titre}
                      sx={{
                        width: "100%",
                        height: 400,
                        objectFit: "cover",
                        borderRadius: 2,
                        mb: 2
                      }}
                    />
                    
                    {/* Galerie des autres photos */}
                    {selectedBien.images && selectedBien.images.length > 1 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" mb={1}>
                          Autres photos ({selectedBien.images.length - 1})
                        </Typography>
                        <Grid container spacing={1}>
                          {selectedBien.images.slice(1).map((image, index) => (
                            <Grid item xs={3} key={index}>
                              <Box
                                component="img"
                                src={fixImageUrl(image)}
                                alt={`${selectedBien.titre} - Photo ${index + 2}`}
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
                                onClick={() => {
                                  // Remplacer la photo principale par celle cliquée
                                  const newImages = [...selectedBien.images];
                                  [newImages[0], newImages[index + 1]] = [newImages[index + 1], newImages[0]];
                                  setSelectedBien({
                                    ...selectedBien,
                                    image: fixImageUrl(newImages[0]),
                                    images: newImages
                                  });
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    
                    {/* Si pas d'autres photos */}
                    {(!selectedBien.images || selectedBien.images.length <= 1) && (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucune photo supplémentaire disponible
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Vidéos du bien */}
                {selectedBien.videos && selectedBien.videos.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      🎥 Vidéos du bien
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                      <Grid container spacing={3}>
                        {selectedBien.videos.map((videoUrl, index) => {
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
                            {selectedBien.type}
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
                            {selectedBien.ville}
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
                            {selectedBien.superficie} m²
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
                            {selectedBien.description}
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
                            {formatMoney(selectedBien.prix)}
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
                                {selectedBien.ville}
                              </Typography>
                            </Box>
                          </Box>

                          {selectedBien.quartier && (
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
                                  {selectedBien.quartier}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {selectedBien.adresse && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Box sx={{ 
                                bgcolor: "success.main", 
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
                                  ADRESSE
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                  {selectedBien.adresse}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* Coordonnées GPS */}
                          {selectedBien.latitude && selectedBien.longitude && (
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
                                <Typography variant="body2" fontWeight="bold" color="warning.main">
                                  Lat: {selectedBien.latitude}<br/>
                                  Lng: {selectedBien.longitude}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  const navigationUrl = `https://www.google.com/maps?q=${selectedBien.latitude},${selectedBien.longitude}`;
                                  window.open(navigationUrl, "_blank");
                                }}
                                sx={{ 
                                  minWidth: "auto",
                                  px: 1,
                                  py: 0.5,
                                  fontSize: "0.7rem"
                                }}
                              >
                                Naviguer
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
                                  if (selectedBien.latitude && selectedBien.longitude) {
                                    const lat = selectedBien.latitude;
                                    const lng = selectedBien.longitude;
                                    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                                    window.open(googleMapsUrl, "_blank");
                                  } else {
                                    const searchQuery = selectedBien.adresse || selectedBien.ville;
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
                                Google Maps
                              </Button>
                              
                              <Button
                                variant="outlined"
                                size="large"
                                startIcon={<LocationOn />}
                                onClick={() => {
                                  if (selectedBien.latitude && selectedBien.longitude) {
                                    const lat = selectedBien.latitude;
                                    const lng = selectedBien.longitude;
                                    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
                                    window.open(osmUrl, "_blank");
                                  } else {
                                    const searchQuery = selectedBien.adresse || selectedBien.ville;
                                    const fallbackUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(searchQuery)}`;
                                    window.open(fallbackUrl, "_blank");
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
                                OpenStreetMap
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

      {/* Lightbox pour les photos */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.9)",
            color: "white",
          },
        }}
      >
        {selectedBien?.images && selectedBien.images.length > 0 && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="white">
                  Photo {selectedPhotoIndex + 1} sur {selectedBien.images.length}
                </Typography>
                <IconButton onClick={() => setLightboxOpen(false)} sx={{ color: "white" }}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ position: "relative", width: "100%", minHeight: 500 }}>
                <img
                  src={typeof selectedBien.images[selectedPhotoIndex] === "string" 
                    ? selectedBien.images[selectedPhotoIndex] 
                    : selectedBien.images[selectedPhotoIndex].url || selectedBien.images[selectedPhotoIndex]}
                  alt={`Photo ${selectedPhotoIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "70vh",
                    objectFit: "contain",
                  }}
                />
                {selectedBien.images.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePreviousPhoto}
                      sx={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={handleNextPhoto}
                      sx={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SearchBiensPage;

