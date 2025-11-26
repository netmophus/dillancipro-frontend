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
  Slider,
  Paper,
  IconButton,
  Drawer,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
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
  Map,
  Image as ImageIcon,
  Close as CloseIcon,
  VideoLibrary,
  Description,
  Landscape,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import api from "../../services/api";

const SearchParcellesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parcelles, setParcelles] = useState([]);
  const [filters, setFilters] = useState({
    ville: "",
    quartier: "",
    cite: "",
    agence: "",
    prixMin: "",
    prixMax: "",
    superficieMin: "",
    superficieMax: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    villes: [],
    quartiers: [],
    cites: [],
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
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [openParcelleDrawer, setOpenParcelleDrawer] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  // État pour l'affichage progressif des parcelles (initialement 3)
  const [parcellesDisplayed, setParcellesDisplayed] = useState(3);
  
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

  // Rechercher les parcelles quand les filtres changent (mais seulement si les options sont chargées)
  useEffect(() => {
    // Rechercher une fois que les options sont chargées
    if (filterOptions.villes.length > 0 || Object.keys(filterOptions).length > 0) {
      searchParcelles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, sortBy, sortOrder]);

  // Réinitialiser l'affichage progressif quand les parcelles changent
  useEffect(() => {
    setParcellesDisplayed(3);
  }, [parcelles]);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get("/public/parcelles/filters");
      const filtersData = response.data.filters;
      setFilterOptions(filtersData);
      // Les filtres restent vides par défaut (sera interprété comme "Tous")
    } catch (error) {
      console.error("Erreur chargement options filtres:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/public/parcelles/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const searchParcelles = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      // Nettoyer les paramètres vides (mais garder les valeurs par défaut des filtres)
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get("/public/parcelles/search", { params });
      setParcelles(response.data.parcelles || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Erreur recherche parcelles:", error);
      setParcelles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset à la page 1
  };

  const handleClearFilters = () => {
    // Réinitialiser à "Tous" (valeurs vides)
    setFilters({
      ville: "",
      quartier: "",
      cite: "",
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

  // Fonction pour afficher plus de parcelles
  const handleShowMoreParcelles = () => {
    setParcellesDisplayed((prev) => Math.min(prev + 3, parcelles.length));
  };

  const handleParcelleClick = (parcelle) => {
    setSelectedParcelle(parcelle);
    setOpenParcelleDrawer(true);
  };

  const handleCloseParcelleDetails = () => {
    setSelectedParcelle(null);
    setOpenParcelleDrawer(false);
  };


  // Fonction pour convertir une URL YouTube/Vimeo en URL embed
  const getVideoEmbedUrl = (url) => {
    if (!url) return "";
    
    // YouTube
    if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
      const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url;
    }
    
    // Vimeo
    if (url.includes("vimeo.com")) {
      const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : url;
    }
    
    return url;
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

  // Fonction pour extraire le nom du fichier depuis une URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Document";
    try {
      // Si c'est une URL complète, extraire le nom de fichier
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || pathname.split('\\').pop();
      // Décoder les caractères encodés et retirer les paramètres de requête
      return decodeURIComponent(fileName.split('?')[0]) || "Document";
    } catch (e) {
      // Si ce n'est pas une URL valide, essayer d'extraire le nom depuis le chemin
      const parts = url.split('/');
      const fileName = parts[parts.length - 1] || parts[parts.length - 1].split('\\').pop();
      return decodeURIComponent(fileName.split('?')[0]) || "Document";
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const getLocationString = (parcelle) => {
    if (!parcelle.ilot?.zone?.quartier?.ville) return "Localisation non disponible";
    const ville = parcelle.ilot.zone.quartier.ville.nom;
    const quartier = parcelle.ilot.zone.quartier.nom;
    const cite = parcelle.ilot.zone.nom;
    return `${cite}, ${quartier}, ${ville}`;
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== "").length;

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
            Recherche de Parcelles
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.9)" sx={{ mb: 3 }}>
            Trouvez la parcelle idéale parmi {stats?.totalParcelles || 0} parcelles disponibles
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
            {/* Ligne 1: Localisation */}
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
                  {filterOptions.quartiers
                    .filter((q) => !filters.ville || q.ville === filters.ville)
                    .map((quartier) => (
                      <MenuItem key={quartier.id} value={quartier.nom}>
                        {quartier.nom}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Cité/Zone</InputLabel>
                <Select
                  value={filters.cite || ""}
                  onChange={(e) => handleFilterChange("cite", e.target.value)}
                  label="Citée/Zone"
                >
                  <MenuItem value="">Toutes les cités</MenuItem>
                  {filterOptions.cites
                    .filter(
                      (cite) =>
                        (!filters.ville || cite.ville === filters.ville) &&
                        (!filters.quartier || cite.quartier === filters.quartier)
                    )
                    .map((cite) => (
                      <MenuItem key={cite.id} value={cite.nom}>
                        {cite.nom}
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
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Trier par"
                >
                  <MenuItem value="createdAt">Date d'ajout</MenuItem>
                  <MenuItem value="prix">Prix</MenuItem>
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

        {/* Liste des parcelles */}
        <Box>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
              </Box>
            ) : parcelles.length === 0 ? (
              <Alert severity="info">
                Aucune parcelle trouvée avec ces critères de recherche.
              </Alert>
            ) : (
              <>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    {pagination.total} parcelle{pagination.total > 1 ? "s" : ""} trouvée
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
                    {parcelles.slice(0, parcellesDisplayed).map((parcelle) => (
                      <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={4}
                        key={parcelle._id}
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
                          onClick={() => handleParcelleClick(parcelle)}
                        >
                        {parcelle.images && parcelle.images.length > 0 ? (
                          <CardMedia
                            component="img"
                            height="200"
                            image={parcelle.images[0]}
                            alt={parcelle.numeroParcelle}
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
                            Parcelle {parcelle.numeroParcelle}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <LocationOn color="primary" fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {getLocationString(parcelle)}
                            </Typography>
                          </Box>
                          {parcelle.prix && (
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <AttachMoney color="success" fontSize="small" />
                              <Typography variant="h6" color="success.main" fontWeight="bold">
                                {parcelle.prix.toLocaleString()} FCFA
                              </Typography>
                            </Box>
                          )}
                          {parcelle.superficie && (
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Square color="info" fontSize="small" />
                              <Typography variant="body2">
                                {parcelle.superficie} m²
                              </Typography>
                            </Box>
                          )}
                          {parcelle.agenceId && (
                            <Box mt={1}>
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Business color="warning" fontSize="small" />
                                <Typography variant="caption" color="text.secondary">
                                  {parcelle.agenceId.nom}
                                </Typography>
                              </Box>
                              {parcelle.agenceId.telephone && (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Phone color="primary" fontSize="small" />
                                  <Typography variant="caption" color="primary.main" fontWeight="medium">
                                    {parcelle.agenceId.telephone}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Bouton "Afficher la suite" */}
                  {parcellesDisplayed < parcelles.length && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={handleShowMoreParcelles}
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

      {/* Drawer pour les détails de la parcelle */}
      <Drawer
        anchor="right"
        open={openParcelleDrawer}
        onClose={handleCloseParcelleDetails}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "90%", md: 600, lg: 700 },
            bgcolor: "background.default",
          },
        }}
      >
        <Box sx={{ p: 3, height: "100%", overflowY: "auto" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                🏘️ {selectedParcelle?.numeroParcelle || "Détails de la parcelle"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Îlot {selectedParcelle?.ilot?.numeroIlot || ""}, Parcelle {selectedParcelle?.numeroParcelle || ""}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseParcelleDetails}>
              <CloseIcon />
            </IconButton>
          </Box>

          {selectedParcelle ? (
            <Grid container spacing={3}>
              {/* Photos de la parcelle */}
              {selectedParcelle.images && selectedParcelle.images.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      📸 Photos de la parcelle
                    </Typography>
                    <Box sx={{ position: "relative", height: 300, borderRadius: 2, overflow: "hidden", mb: 2 }}>
                      <Box
                        component="img"
                        src={fixImageUrl(selectedParcelle.images[0])}
                        alt={selectedParcelle.numeroParcelle}
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='16'%3EImage%20non%20disponible%3C/text%3E%3C/svg%3E";
                          e.target.onerror = null;
                        }}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          bgcolor: "#f0f0f0",
                        }}
                      />
                    </Box>
                    {selectedParcelle.images.length > 1 && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {selectedParcelle.images.slice(1).map((img, idx) => (
                          <Box
                            key={idx}
                            component="img"
                            src={fixImageUrl(img)}
                            alt={`${selectedParcelle.numeroParcelle} - Image ${idx + 2}`}
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='10'%3EN/A%3C/text%3E%3C/svg%3E";
                              e.target.onerror = null;
                            }}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 1,
                              cursor: "pointer",
                              border: "2px solid transparent",
                              bgcolor: "#f0f0f0",
                              "&:hover": {
                                borderColor: "primary.main",
                              },
                            }}
                            onClick={() => {
                              const newImages = [...selectedParcelle.images];
                              newImages[0] = img;
                              newImages[idx + 1] = selectedParcelle.images[0];
                              setSelectedParcelle({ ...selectedParcelle, images: newImages });
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* Informations principales */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "white", mb: 2 }}>
                    📋 Informations principales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          RÉFÉRENCE
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {selectedParcelle.numeroParcelle}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          ÎLOT
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {selectedParcelle.ilot?.numeroIlot || ""}, Parcelle {selectedParcelle.numeroParcelle}
                        </Typography>
                      </Paper>
                    </Grid>
                    {selectedParcelle.superficie && (
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            SUPERFICIE
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {selectedParcelle.superficie} m²
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    {selectedParcelle.prix && (
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            PRIX
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {selectedParcelle.prix > 0 ? formatMoney(selectedParcelle.prix) : "Prix sur demande"}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          VILLE
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          📍 {selectedParcelle.ilot?.zone?.quartier?.ville?.nom || selectedParcelle.ilot?.quartier?.ville?.nom || "Non disponible"}
                        </Typography>
                      </Paper>
                    </Grid>
                    {selectedParcelle.description && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            DESCRIPTION
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6 }}>
                            {selectedParcelle.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    {selectedParcelle.agenceId?.nom && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            AGENCE
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            🏢 {selectedParcelle.agenceId.nom}
                          </Typography>
                          {selectedParcelle.agenceId.telephone && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              📞 {selectedParcelle.agenceId.telephone}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Géolocalisation */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "white", mb: 3 }}>
                    🗺️ Localisation
                  </Typography>
                  
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
                      {selectedParcelle.ilot?.zone?.quartier?.ville?.nom || selectedParcelle.ilot?.quartier?.ville?.nom || "Non disponible"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                      Îlot {selectedParcelle.ilot?.numeroIlot || ""}, Parcelle {selectedParcelle.numeroParcelle}
                    </Typography>
                  </Box>

                  {/* Coordonnées GPS */}
                  {(selectedParcelle.localisation?.lat && selectedParcelle.localisation?.lng) ? (
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
                            Lat: {selectedParcelle.localisation.lat}<br/>
                            Lng: {selectedParcelle.localisation.lng}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Boutons de navigation */}
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<LocationOn />}
                          onClick={() => {
                            const googleMapsUrl = `https://www.google.com/maps?q=${selectedParcelle.localisation.lat},${selectedParcelle.localisation.lng}`;
                            window.open(googleMapsUrl, "_blank");
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
                            const osmUrl = `https://www.openstreetmap.org/?mlat=${selectedParcelle.localisation.lat}&mlon=${selectedParcelle.localisation.lng}&zoom=15`;
                            window.open(osmUrl, "_blank");
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
                          const ville = selectedParcelle.ilot?.zone?.quartier?.ville?.nom || selectedParcelle.ilot?.quartier?.ville?.nom || "";
                          const searchUrl = `https://maps.google.com/maps/search/${encodeURIComponent(`${ville} Îlot ${selectedParcelle.ilot?.numeroIlot || ""}, Parcelle ${selectedParcelle.numeroParcelle}`)}`;
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

              {/* Documents et vidéos */}
              {(selectedParcelle.documents && selectedParcelle.documents.length > 0) || 
               (selectedParcelle.videos && selectedParcelle.videos.length > 0) ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📄 Documents et médias
                    </Typography>
                    
                    {/* Section Vidéos */}
                    {selectedParcelle.videos && selectedParcelle.videos.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          🎥 Vidéos ({selectedParcelle.videos.length})
                        </Typography>
                        <Stack spacing={2}>
                          {selectedParcelle.videos.map((videoUrl, idx) => {
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
                    {selectedParcelle.documents && selectedParcelle.documents.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          📎 Documents ({selectedParcelle.documents.length})
                        </Typography>
                        <Stack spacing={1.5}>
                          {selectedParcelle.documents.map((docUrl, idx) => {
                            const fileName = getFileNameFromUrl(docUrl);
                            const fullUrl = fixImageUrl(docUrl);
                            return (
                              <Button
                                key={idx}
                                variant="outlined"
                                component="a"
                                href={fullUrl}
                                target="_blank"
                                download
                                startIcon={<Description />}
                                fullWidth
                                sx={{
                                  justifyContent: "flex-start",
                                  py: 1.5,
                                  textTransform: "none",
                                  textAlign: "left",
                                }}
                              >
                                <Box sx={{ flex: 1, textAlign: "left" }}>
                                  <Typography variant="body2" fontWeight="medium" noWrap>
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

    </Box>
  );
};

export default SearchParcellesPage;

