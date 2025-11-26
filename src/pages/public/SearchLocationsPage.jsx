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
  Drawer,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  ImageList,
  ImageListItem,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
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
  Kitchen,
  Balcony,
  Close as CloseIcon,
  Home,
  Image as ImageIcon,
  VideoLibrary,
  Description,
  Download,
  Garage,
  Pool,
  AcUnit,
  Wifi,
  Elevator,
  LocalParking,
  CalendarToday,
  Map as MapIcon,
  OpenInNew,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import api from "../../services/api";

const SearchLocationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    ville: "",
    quartier: "",
    type: "",
    agence: "",
    prixMin: "",
    prixMax: "",
    superficieMin: "",
    superficieMax: "",
    chambres: "",
    meuble: "",
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
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [openLocationsDrawer, setOpenLocationsDrawer] = useState(false);
  
  // État pour l'affichage progressif des locations (initialement 3)
  const [locationsDisplayed, setLocationsDisplayed] = useState(3);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Charger les options de filtres et les stats au montage
  useEffect(() => {
    const loadData = async () => {
      await fetchFilterOptions();
      await fetchStats();
    };
    loadData();
  }, []);

  // Rechercher les locations quand les filtres changent
  useEffect(() => {
    // Rechercher une fois que les options sont chargées
    if (filterOptions.villes.length > 0 || Object.keys(filterOptions).length > 0) {
      searchLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, sortBy, sortOrder]);

  // Réinitialiser l'affichage progressif quand les locations changent
  useEffect(() => {
    setLocationsDisplayed(3);
  }, [locations]);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get("/public/locations/filters");
      const filtersData = response.data.filters;
      setFilterOptions(filtersData);
      // Les filtres restent vides par défaut (sera interprété comme "Tous")
    } catch (error) {
      console.error("Erreur chargement options filtres:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/public/locations/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const searchLocations = async () => {
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

      const response = await api.get("/public/locations/search", { params });
      setLocations(response.data.locations || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Erreur recherche locations:", error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    // Réinitialiser à "Tous" (valeurs vides)
    setFilters({
      ville: "",
      quartier: "",
      type: "",
      agence: "",
      prixMin: "",
      prixMax: "",
      superficieMin: "",
      superficieMax: "",
      chambres: "",
      meuble: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fonction pour afficher plus de locations
  const handleShowMoreLocations = () => {
    setLocationsDisplayed((prev) => Math.min(prev + 3, locations.length));
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setOpenLocationsDrawer(true);
  };

  const handleCloseLocationDetails = () => {
    setSelectedLocation(null);
    setOpenLocationsDrawer(false);
  };

  // Fonction pour corriger les URLs d'images
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

  // Fonction pour convertir une URL YouTube/Vimeo en URL embed
  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Si ce n'est ni YouTube ni Vimeo, retourner l'URL originale
    return url;
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
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
            Recherche de Locations
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.9)" sx={{ mb: 3 }}>
            Trouvez le logement idéal parmi {stats?.totalLocations || 0} locations disponibles
          </Typography>

          {/* Statistiques rapides */}
          {stats && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
                  <Typography variant="caption">Prix minimum</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.prix.prixMin?.toLocaleString() || 0} FCFA/mois
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
                  <Typography variant="caption">Prix maximum</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.prix.prixMax?.toLocaleString() || 0} FCFA/mois
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
                  <Typography variant="caption">Prix moyen</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {Math.round(stats.prix.prixMoyen || 0).toLocaleString()} FCFA/mois
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
                <Select
                  value={filters.ville || ""}
                  onChange={(e) => handleFilterChange("ville", e.target.value)}
                  label="Ville"
                >
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
                <Select
                  value={filters.quartier || ""}
                  onChange={(e) => handleFilterChange("quartier", e.target.value)}
                  label="Quartier"
                >
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
                <InputLabel>Type de logement</InputLabel>
                <Select
                  value={filters.type || ""}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  label="Type de logement"
                >
                  <MenuItem value="">Tous les types</MenuItem>
                  {filterOptions.types.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Agence Immobilière</InputLabel>
                <Select
                  value={filters.agence || ""}
                  onChange={(e) => handleFilterChange("agence", e.target.value)}
                  label="Agence Immobilière"
                >
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
                label="Prix Min (FCFA/mois)"
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
                label="Prix Max (FCFA/mois)"
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

            {/* Ligne 3: Chambres et Meublé */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Nombre de chambres"
                type="number"
                value={filters.chambres}
                onChange={(e) => handleFilterChange("chambres", e.target.value)}
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Meublé</InputLabel>
                <Select
                  value={filters.meuble || ""}
                  onChange={(e) => handleFilterChange("meuble", e.target.value)}
                  label="Meublé"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="true">Meublé</MenuItem>
                  <MenuItem value="false">Non meublé</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Ligne 3: Tri */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trier par</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Trier par"
                >
                  <MenuItem value="createdAt">Date d'ajout</MenuItem>
                  <MenuItem value="prixMensuel">Prix mensuel</MenuItem>
                  <MenuItem value="superficie">Superficie</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Ordre</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  label="Ordre"
                >
                  <MenuItem value="asc">Croissant</MenuItem>
                  <MenuItem value="desc">Décroissant</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Clear />}
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0}
                sx={{ height: "40px" }}
              >
                Réinitialiser les filtres
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Liste des locations */}
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress />
            </Box>
          ) : locations.length === 0 ? (
            <Alert severity="info">
              Aucune location trouvée avec ces critères de recherche.
            </Alert>
          ) : (
            <>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  {pagination.total} location{pagination.total > 1 ? "s" : ""} trouvée
                  {pagination.total > 1 ? "s" : ""}
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
                  {locations.slice(0, locationsDisplayed).map((location) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={6} 
                      md={4}
                      key={location._id}
                      sx={{
                        display: "flex",
                        flexBasis: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                        maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                    >
                      <Card
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: 4,
                          },
                        }}
                        onClick={() => handleLocationClick(location)}
                      >
                      {location.images && location.images.length > 0 ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={location.images[0].url}
                          alt={location.titre}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 200,
                            bgcolor: "grey.200",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 60, color: "grey.400" }} />
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {location.titre}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <LocationOn color="primary" fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {location.quartier}, {location.ville}
                          </Typography>
                        </Box>
                        {location.prixMensuel && (
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <AttachMoney color="success" fontSize="small" />
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                              {location.prixMensuel.toLocaleString()} FCFA/mois
                            </Typography>
                          </Box>
                        )}
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          {location.superficie && (
                            <Grid item xs={6}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Square color="info" fontSize="small" />
                                <Typography variant="caption">
                                  {location.superficie} m²
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {location.chambres !== undefined && (
                            <Grid item xs={6}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Bed color="info" fontSize="small" />
                                <Typography variant="caption">
                                  {location.chambres} chambre{location.chambres > 1 ? "s" : ""}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {location.salleDeBain !== undefined && (
                            <Grid item xs={6}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Bathtub color="info" fontSize="small" />
                                <Typography variant="caption">
                                  {location.salleDeBain} salle{location.salleDeBain > 1 ? "s" : ""} de bain
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {location.meuble && (
                            <Grid item xs={6}>
                              <Chip label="Meublé" size="small" color="warning" />
                            </Grid>
                          )}
                        </Grid>
                        {location.agenceId && (
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <Business color="warning" fontSize="small" />
                            <Typography variant="caption" color="text.secondary">
                              {location.agenceId.nom}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Bouton "Afficher la suite" */}
                {locationsDisplayed < locations.length && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 4,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleShowMoreLocations}
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

      {/* Drawer détails location */}
      <Drawer
        anchor="right"
        open={openLocationsDrawer}
        onClose={handleCloseLocationDetails}
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
                {selectedLocation ? `🏠 ${selectedLocation.titre}` : "🏠 Détails de la Location"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedLocation ? `${selectedLocation.type} à ${selectedLocation.ville}` : "Informations complètes"}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseLocationDetails}
              sx={{
                bgcolor: "grey.100",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenu du drawer */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {selectedLocation ? (
              <Grid container spacing={3}>
                {/* Photos de la location */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    📸 Photos de la location
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    {/* Photo principale */}
                    <Box
                      component="img"
                      src={selectedLocation.images?.[0]?.url || selectedLocation.images?.[0] || ""}
                      alt={selectedLocation.titre}
                      sx={{
                        width: "100%",
                        height: 400,
                        objectFit: "cover",
                        borderRadius: 2,
                        mb: 2
                      }}
                    />
                    
                    {/* Galerie des autres photos */}
                    {selectedLocation.images && selectedLocation.images.length > 1 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" mb={1}>
                          Autres photos ({selectedLocation.images.length - 1})
                        </Typography>
                        <Grid container spacing={1}>
                          {selectedLocation.images.slice(1).map((image, index) => (
                            <Grid item xs={3} key={index}>
                            <Box
                              component="img"
                              src={fixImageUrl(image.url || image)}
                              alt={`${selectedLocation.titre} - Photo ${index + 2}`}
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
                                const newImages = [...selectedLocation.images];
                                [newImages[0], newImages[index + 1]] = [newImages[index + 1], newImages[0]];
                                setSelectedLocation({
                                  ...selectedLocation,
                                  images: newImages
                                });
                              }}
                            />
                          </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    
                    {/* Si pas d'autres photos, afficher un message */}
                    {(!selectedLocation.images || selectedLocation.images.length <= 1) && (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucune photo supplémentaire disponible
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

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
                            {selectedLocation.type}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Disponibilité */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(76, 175, 80, 0.1)",
                          border: "1px solid rgba(76, 175, 80, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            DISPONIBILITÉ
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                            {selectedLocation.disponibilite || selectedLocation.statut || "Disponible"}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Meublé */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(255, 152, 0, 0.1)",
                          border: "1px solid rgba(255, 152, 0, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            MEUBLÉ
                          </Typography>
                          <Chip 
                            label={selectedLocation.meuble ? "Meublé" : "Non meublé"} 
                            color={selectedLocation.meuble ? "success" : "warning"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
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
                            {selectedLocation.description || "Aucune description disponible"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Informations pratiques */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" mb={3} sx={{ 
                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.5rem"
                  }}>
                    📅 Informations pratiques
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(79, 172, 254, 0.1)",
                    border: "1px solid rgba(79, 172, 254, 0.1)"
                  }}>
                    <Grid container spacing={3}>
                      {/* Date de disponibilité */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          color: "white",
                          textAlign: "center"
                        }}>
                          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontSize: "0.8rem", fontWeight: 600 }}>
                            DATE DE DISPONIBILITÉ
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                            {selectedLocation.dateDisponibilite ? 
                              new Date(selectedLocation.dateDisponibilite).toLocaleDateString('fr-FR') : 
                              "Immédiate"
                            }
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Durée minimale */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(156, 39, 176, 0.1)",
                          border: "1px solid rgba(156, 39, 176, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            DURÉE MINIMALE
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="secondary.main" sx={{ mt: 1 }}>
                            {selectedLocation.dureeMinimale || "Non spécifiée"}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Charges incluses */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: selectedLocation.chargesIncluses ? 
                            "rgba(76, 175, 80, 0.1)" : "rgba(255, 152, 0, 0.1)",
                          border: `1px solid ${selectedLocation.chargesIncluses ? 
                            "rgba(76, 175, 80, 0.3)" : "rgba(255, 152, 0, 0.3)"}`
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            CHARGES INCLUSES
                          </Typography>
                          <Chip 
                            label={selectedLocation.chargesIncluses ? "Oui" : "Non"} 
                            color={selectedLocation.chargesIncluses ? "success" : "warning"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>

                      {/* Référence du bien */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            RÉFÉRENCE DU BIEN
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                            {selectedLocation.reference || "Non spécifiée"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Caractéristiques */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" mb={3} sx={{ 
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.5rem"
                  }}>
                    🏠 Caractéristiques détaillées
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)",
                    border: "1px solid rgba(102, 126, 234, 0.1)"
                  }}>
                    <Grid container spacing={3}>
                      {/* Superficie */}
                      <Grid item xs={6} sm={4}>
                        <Box sx={{ 
                          textAlign: "center",
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                          color: "white"
                        }}>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedLocation.superficie || "N/A"}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            m²
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Superficie
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Chambres */}
                      <Grid item xs={6} sm={4}>
                        <Box sx={{ 
                          textAlign: "center",
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          color: "white"
                        }}>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedLocation.chambres || "N/A"}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            🛏️
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Chambres
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Salles de bain */}
                      <Grid item xs={6} sm={4}>
                        <Box sx={{ 
                          textAlign: "center",
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          color: "white"
                        }}>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedLocation.salleDeBain || "N/A"}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            🚿
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Salles de bain
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Statut */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: selectedLocation.statut === "disponible" ? 
                            "rgba(76, 175, 80, 0.1)" : "rgba(255, 152, 0, 0.1)",
                          border: `1px solid ${selectedLocation.statut === "disponible" ? 
                            "rgba(76, 175, 80, 0.3)" : "rgba(255, 152, 0, 0.3)"}`
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            STATUT
                          </Typography>
                          <Chip 
                            label={selectedLocation.statut || "Disponible"} 
                            color={selectedLocation.statut === "disponible" ? "success" : "warning"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>

                      {/* Durée minimale */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(156, 39, 176, 0.1)",
                          border: "1px solid rgba(156, 39, 176, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            DURÉE MINIMALE
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="secondary.main">
                            {selectedLocation.dureeMinimale || "Non spécifiée"}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Équipements */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid rgba(0, 0, 0, 0.1)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 2 }}>
                            ÉQUIPEMENTS INCLUS
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {(() => {
                              const features = [];
                              if (selectedLocation.meuble) features.push("Meublé");
                              if (selectedLocation.balcon) features.push("Balcon");
                              if (selectedLocation.garage) features.push("Garage");
                              if (selectedLocation.parking) features.push("Parking");
                              if (selectedLocation.jardin) features.push("Jardin");
                              if (selectedLocation.climatisation) features.push("Climatisation");
                              if (selectedLocation.chauffage) features.push("Chauffage");
                              if (selectedLocation.internet) features.push("Internet");
                              if (selectedLocation.ascenseur) features.push("Ascenseur");
                              if (selectedLocation.cuisine) features.push("Cuisine");
                              if (selectedLocation.salon) features.push("Salon");
                              return features.length > 0 ? features.map((feature, index) => (
                                <Chip 
                                  key={index} 
                                  label={feature} 
                                  size="small" 
                                  sx={{ 
                                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                    color: "white",
                                    fontWeight: "bold",
                                    "&:hover": {
                                      transform: "translateY(-2px)",
                                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                                    },
                                    transition: "all 0.3s ease"
                                  }} 
                                />
                              )) : (
                                <Typography variant="body2" color="text.secondary">
                                  Aucun équipement spécifié
                                </Typography>
                              );
                            })()}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Prix de location */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    💰 Informations financières
                  </Typography>
                  <Paper sx={{ p: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" fontWeight="bold" sx={{ color: "white" }}>
                            {formatMoney(selectedLocation.prixMensuel || selectedLocation.prix || 0)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Prix mensuel
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                            {formatMoney(selectedLocation.caution || 0)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Caution
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                            {formatMoney(selectedLocation.charges || 0)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Charges {selectedLocation.chargesIncluses ? "(incluses)" : "(non incluses)"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                            {formatMoney((selectedLocation.prixMensuel || selectedLocation.prix || 0) + (selectedLocation.charges || 0))}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Total mensuel
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                      <Button
                        variant="contained"
                        size="large"
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
                        📞 Contacter l'agence
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
                                {selectedLocation.ville}
                              </Typography>
                            </Box>
                          </Box>

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
                                {selectedLocation.quartier || "Quartier non spécifié"}
                              </Typography>
                            </Box>
                          </Box>

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
                                {selectedLocation.adresse || "Adresse non spécifiée"}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Coordonnées GPS */}
                          {selectedLocation.coordonnees && (
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
                                  Lat: {selectedLocation.coordonnees.latitude || "N/A"}<br/>
                                  Lng: {selectedLocation.coordonnees.longitude || "N/A"}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  if (selectedLocation.coordonnees?.latitude && selectedLocation.coordonnees?.longitude) {
                                    const navigationUrl = `https://www.google.com/maps?q=${selectedLocation.coordonnees.latitude},${selectedLocation.coordonnees.longitude}`;
                                    window.open(navigationUrl, "_blank");
                                  } else {
                                    alert("Coordonnées GPS non disponibles");
                                  }
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
                                  if (selectedLocation.coordonnees?.latitude && selectedLocation.coordonnees?.longitude) {
                                    const lat = selectedLocation.coordonnees.latitude;
                                    const lng = selectedLocation.coordonnees.longitude;
                                    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                                    window.open(googleMapsUrl, "_blank");
                                  } else {
                                    const searchQuery = selectedLocation.adresse || selectedLocation.ville;
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
                                  if (selectedLocation.coordonnees?.latitude && selectedLocation.coordonnees?.longitude) {
                                    const lat = selectedLocation.coordonnees.latitude;
                                    const lng = selectedLocation.coordonnees.longitude;
                                    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
                                    window.open(osmUrl, "_blank");
                                  } else {
                                    const searchQuery = selectedLocation.adresse || selectedLocation.ville;
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
                  Aucune location sélectionnée
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SearchLocationsPage;

