import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  GridLegacy as Grid,
  Card,
  CardContent,
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
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Menu,
  Popover,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  LocationOn,
  Business,
  ArrowForward,
  Dashboard as FIDashboard,
  GridOn as FIGridOn,
  FilterList,
  Clear,
  Phone,
  Email,
  Map,
  Close as CloseIcon,
  Landscape,
  LocationCity as FILocationCity,
  Place as FIPlace,
  Payments as FIPayments,
  SquareFoot as FISquareFoot,
  Sort as FISort,
  SwapVert as FISwapVert,
  Tune as FITune,
  ExpandMore as FIExpandMore,
  Refresh as FIRefresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import ParcelleDetailDrawer from "../../components/parcelles/ParcelleDetailDrawer";
import api from "../../services/api";
import { BASE_SERVER_URL } from "../../config/config";

// Statut de la parcelle : vert charte si à vendre, couleurs fonctionnelles sinon
const STATUTS_PARCELLE = {
  avendre: { label: "À vendre", color: "#0A7C4F" },
  vendue: { label: "Vendue", color: "#d32f2f" },
  reserved: { label: "Réservée", color: "#B45309" },
  reservee: { label: "Réservée", color: "#B45309" },
};

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
  // Affichage uniquement : panneau avancé et menu des segments de la barre
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [segMenu, setSegMenu] = useState({ key: null, el: null });
  
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
    return `${BASE_SERVER_URL}/${correctedPath}`;
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
      <Box sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", py: 4, mb: 4, width: "100%" }}>
        <Container maxWidth="xl">
          <Typography variant="h3" fontWeight="bold" color="white" gutterBottom sx={{ lineHeight: 1.3 }}>
            Recherche de Parcelles
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)" }}>
            Trouvez la parcelle idéale parmi {stats?.totalParcelles || 0} parcelles disponibles
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ width: "100%", mb: 4 }}>
        {/* Barre de filtres unifiée */}
        {(() => {
          const quartierOptions = filterOptions.quartiers.filter((q) => !filters.ville || q.ville === filters.ville);
          const citeOptions = filterOptions.cites.filter(
            (c) => (!filters.ville || c.ville === filters.ville) && (!filters.quartier || c.quartier === filters.quartier)
          );
          const fmt = (n) => Number(n).toLocaleString("fr-FR");
          const prixLabel =
            filters.prixMin || filters.prixMax
              ? `Prix : ${filters.prixMin ? fmt(filters.prixMin) : "0"} - ${filters.prixMax ? fmt(filters.prixMax) : "max"}`
              : "Prix";
          const segments = [
            { key: "ville", Icon: FILocationCity, color: "#3030F9", label: filters.ville || "Toutes les villes", options: filterOptions.villes.map((v) => v.nom), all: "Toutes les villes" },
            { key: "quartier", Icon: Map, color: "#0A7C4F", label: filters.quartier || "Tous les quartiers", options: quartierOptions.map((q) => q.nom), all: "Tous les quartiers" },
          ];
          const segSx = {
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.4,
            flex: "1 1 170px",
            minWidth: 0,
            cursor: "pointer",
            border: 0,
            bgcolor: "transparent",
            font: "inherit",
            textAlign: "left",
            borderRight: { xs: "none", sm: "1px solid rgba(48,48,249,0.15)" },
            borderBottom: { xs: "1px solid rgba(48,48,249,0.15)", sm: "none" },
            "&:hover": { bgcolor: "rgba(48,48,249,0.04)" },
          };
          const panelField = { flex: "1 1 200px", minWidth: { xs: "100%", sm: 180 } };
          const chips = [
            filters.ville && { key: "ville", label: filters.ville, Icon: FILocationCity, bg: "#3030F9" },
            filters.quartier && { key: "quartier", label: filters.quartier, Icon: FIPlace, bg: "#3030F9" },
            filters.cite && { key: "cite", label: filters.cite, Icon: Map, bg: "#0A7C4F" },
            filters.agence && { key: "agence", label: `Agence: ${filterOptions.agences.find((a) => a.id === filters.agence)?.nom || filters.agence}`, Icon: Business, bg: "#0e1133" },
            filters.prixMin && { key: "prixMin", label: `Prix > ${fmt(filters.prixMin)}`, Icon: FIPayments, bg: "#3030F9" },
            filters.prixMax && { key: "prixMax", label: `Prix < ${fmt(filters.prixMax)}`, Icon: FIPayments, bg: "#3030F9" },
            filters.superficieMin && { key: "superficieMin", label: `Sup > ${filters.superficieMin} m²`, Icon: FISquareFoot, bg: "#0A7C4F" },
            filters.superficieMax && { key: "superficieMax", label: `Sup < ${filters.superficieMax} m²`, Icon: FISquareFoot, bg: "#0A7C4F" },
          ].filter(Boolean);
          return (
            <Box sx={{ mb: 3 }}>
              {/* Barre principale */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "stretch",
                  bgcolor: "#ffffff",
                  border: "1.5px solid #3030F9",
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                  overflow: "hidden",
                }}
              >
                {segments.map(({ key, Icon, color, label, all }) => (
                  <Box
                    key={key}
                    component="button"
                    type="button"
                    aria-label={all}
                    title={all}
                    onClick={(e) => setSegMenu({ key, el: e.currentTarget })}
                    sx={segSx}
                  >
                    <Icon sx={{ color }} />
                    <Typography noWrap sx={{ flex: 1, color: filters[key] ? "#0e1133" : "text.secondary", fontWeight: filters[key] ? 600 : 400 }}>
                      {label}
                    </Typography>
                    <FIExpandMore sx={{ color: "text.secondary" }} />
                  </Box>
                ))}
                <Box
                  component="button"
                  type="button"
                  aria-label="Prix"
                  title="Prix"
                  onClick={(e) => setSegMenu({ key: "prix", el: e.currentTarget })}
                  sx={segSx}
                >
                  <FIPayments sx={{ color: "#3030F9" }} />
                  <Typography noWrap sx={{ flex: 1, color: filters.prixMin || filters.prixMax ? "#0e1133" : "text.secondary", fontWeight: filters.prixMin || filters.prixMax ? 600 : 400 }}>
                    {prixLabel}
                  </Typography>
                  <FIExpandMore sx={{ color: "text.secondary" }} />
                </Box>
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<FITune />}
                  onClick={() => setShowAdvanced((v) => !v)}
                  aria-expanded={showAdvanced}
                  sx={{
                    bgcolor: "#3030F9",
                    color: "white",
                    borderRadius: 0,
                    px: 3,
                    py: 1.4,
                    textTransform: "none",
                    fontWeight: 700,
                    flex: { xs: "1 1 100%", sm: "0 0 auto" },
                    "&:hover": { bgcolor: "#2020C8" },
                  }}
                >
                  Filtres{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
                </Button>
              </Box>

              {/* Menus des segments */}
              {segments.map(({ key, options, all }) => (
                <Menu
                  key={key}
                  anchorEl={segMenu.el}
                  open={segMenu.key === key && Boolean(segMenu.el)}
                  onClose={() => setSegMenu({ key: null, el: null })}
                  slotProps={{ paper: { sx: { borderRadius: 3, mt: 0.5, minWidth: 220, maxHeight: 360 } } }}
                >
                  <MenuItem
                    selected={!filters[key]}
                    onClick={() => { handleFilterChange(key, ""); setSegMenu({ key: null, el: null }); }}
                  >
                    <em>{all}</em>
                  </MenuItem>
                  {options.map((nom) => (
                    <MenuItem
                      key={nom}
                      selected={filters[key] === nom}
                      onClick={() => { handleFilterChange(key, nom); setSegMenu({ key: null, el: null }); }}
                    >
                      {nom}
                    </MenuItem>
                  ))}
                </Menu>
              ))}
              <Popover
                anchorEl={segMenu.el}
                open={segMenu.key === "prix" && Boolean(segMenu.el)}
                onClose={() => setSegMenu({ key: null, el: null })}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                slotProps={{ paper: { sx: { borderRadius: 3, mt: 0.5, p: 2, width: 300, "& .MuiOutlinedInput-root": { borderRadius: "10px" }, "& legend": { display: "none" } } } }}
              >
                <Stack spacing={1.5}>
                  {[
                    { key: "prixMin", ph: "Prix min (FCFA)" },
                    { key: "prixMax", ph: "Prix max (FCFA)" },
                  ].map(({ key, ph }) => (
                    <TextField
                      key={key}
                      size="small"
                      type="number"
                      placeholder={ph}
                      value={filters[key]}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      inputProps={{ "aria-label": ph, title: ph }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><FIPayments fontSize="small" sx={{ color: "#3030F9" }} /></InputAdornment> }}
                    />
                  ))}
                </Stack>
              </Popover>

              {/* Panneau avancé */}
              {showAdvanced && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: { xs: 2, md: 2.5 },
                    borderRadius: "14px",
                    bgcolor: "rgba(48,48,249,0.05)",
                    border: "1.5px solid rgba(48,48,249,0.25)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#ffffff" },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3030F9" },
                    "& legend": { display: "none" },
                  }}
                >
                  <FormControl size="small" sx={panelField}>
                    <Select
                      value={filters.cite || ""}
                      onChange={(e) => handleFilterChange("cite", e.target.value)}
                      displayEmpty
                      inputProps={{ "aria-label": "Citée/Zone", title: "Citée/Zone" }}
                      startAdornment={<InputAdornment position="start"><Map fontSize="small" sx={{ color: "#0A7C4F" }} /></InputAdornment>}
                      renderValue={(selected) => (!selected ? <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>Toutes les cités</span> : selected)}
                    >
                      <MenuItem value=""><em>Toutes les cités</em></MenuItem>
                      {citeOptions.map((cite) => (
                        <MenuItem key={cite.id} value={cite.nom}>{cite.nom}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={panelField}>
                    <Select
                      value={filters.agence || ""}
                      onChange={(e) => handleFilterChange("agence", e.target.value)}
                      displayEmpty
                      inputProps={{ "aria-label": "Agence Immobilière", title: "Agence Immobilière" }}
                      startAdornment={<InputAdornment position="start"><Business fontSize="small" sx={{ color: "#0e1133" }} /></InputAdornment>}
                      renderValue={(selected) =>
                        !selected ? <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>Toutes les agences</span> : filterOptions.agences.find((a) => a.id === selected)?.nom || selected
                      }
                    >
                      <MenuItem value=""><em>Toutes les agences</em></MenuItem>
                      {filterOptions.agences.map((agence) => (
                        <MenuItem key={agence.id} value={agence.id}>{agence.nom}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {[
                    { key: "superficieMin", ph: "Superficie min (m²)" },
                    { key: "superficieMax", ph: "Superficie max (m²)" },
                  ].map(({ key, ph }) => (
                    <TextField
                      key={key}
                      size="small"
                      type="number"
                      placeholder={ph}
                      value={filters[key]}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      inputProps={{ "aria-label": ph, title: ph }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><FISquareFoot fontSize="small" sx={{ color: "#0A7C4F" }} /></InputAdornment> }}
                      sx={panelField}
                    />
                  ))}

                  <FormControl size="small" sx={panelField}>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      inputProps={{ "aria-label": "Trier par", title: "Trier par" }}
                      startAdornment={<InputAdornment position="start"><FISort fontSize="small" sx={{ color: "#3030F9" }} /></InputAdornment>}
                    >
                      <MenuItem value="createdAt">Date d'ajout</MenuItem>
                      <MenuItem value="prix">Prix</MenuItem>
                      <MenuItem value="superficie">Superficie</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={panelField}>
                    <Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      inputProps={{ "aria-label": "Ordre", title: "Ordre" }}
                      startAdornment={<InputAdornment position="start"><FISwapVert fontSize="small" sx={{ color: "#3030F9" }} /></InputAdornment>}
                    >
                      <MenuItem value="asc">Croissant</MenuItem>
                      <MenuItem value="desc">Décroissant</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Filtres actifs + réinitialisation */}
              {(
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 1.5 }}>
                  {chips.map(({ key, label, Icon, bg }) => (
                    <Chip
                      key={key}
                      label={label}
                      size="small"
                      icon={<Icon sx={{ color: "white !important", fontSize: 16 }} />}
                      deleteIcon={<CloseIcon sx={{ color: "white !important", fontSize: 16 }} />}
                      onDelete={() => handleFilterChange(key, "")}
                      sx={{ bgcolor: bg, color: "white", fontWeight: 600, "&:hover": { bgcolor: bg, filter: "brightness(1.1)" } }}
                    />
                  ))}
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FIRefresh />}
                    onClick={handleClearFilters}
                    disabled={activeFiltersCount === 0}
                    sx={{ borderColor: "#3030F9", color: "#3030F9", borderRadius: "10px", textTransform: "none", fontWeight: 600, "&:hover": { borderColor: "#2020C8", bgcolor: "rgba(48,48,249,0.06)" } }}
                  >
                    Réinitialiser
                  </Button>
                </Box>
              )}
            </Box>
          );
        })()}

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
                          elevation={0}
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            cursor: "pointer",
                            borderRadius: "16px",
                            overflow: "hidden",
                            bgcolor: "#fff",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 2px 12px rgba(15,23,42,0.08)",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 22px rgba(15,23,42,0.14)",
                            },
                          }}
                          onClick={() => handleParcelleClick(parcelle)}
                        >
                        {/* Image */}
                        <Box sx={{ height: 175, position: "relative", overflow: "hidden", bgcolor: "#d9e2ec" }}>
                          {parcelle.images && parcelle.images.length > 0 ? (
                            <Box
                              component="img"
                              src={parcelle.images[0]}
                              alt={parcelle.numeroParcelle}
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Map sx={{ fontSize: 56, color: "#9aa5b4" }} />
                            </Box>
                          )}

                          {/* Badge type, en haut à gauche */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              bgcolor: "#3030F9",
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

                          {/* Badge statut, en haut à droite */}
                          {STATUTS_PARCELLE[parcelle.statut] && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                bgcolor: "#fff",
                                color: STATUTS_PARCELLE[parcelle.statut].color,
                                px: 1.4,
                                py: 0.5,
                                borderRadius: "999px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                boxShadow: "0 1px 4px rgba(15,23,42,0.18)",
                              }}
                            >
                              {STATUTS_PARCELLE[parcelle.statut].label}
                            </Box>
                          )}
                        </Box>

                        {/* Contenu carte */}
                        <CardContent
                          sx={{
                            p: "16px",
                            "&:last-child": { pb: "16px" },
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            flex: 1,
                          }}
                        >
                          {/* Titre + surface */}
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#0e1133", lineHeight: 1.3 }}>
                              Parcelle {parcelle.numeroParcelle}
                            </Typography>
                            {parcelle.superficie > 0 && (
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  flexShrink: 0,
                                  bgcolor: "#EAF0FF",
                                  color: "#2020C8",
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  px: 1.1,
                                  py: 0.4,
                                  borderRadius: "999px",
                                }}
                              >
                                <FISquareFoot sx={{ fontSize: 16 }} />
                                {parcelle.superficie} m²
                              </Box>
                            )}
                          </Box>

                          {/* Hiérarchie : lotissement / îlot / localité */}
                          <Box sx={{ bgcolor: "#f5f7fa", borderRadius: "10px", p: "10px 12px", display: "flex", flexDirection: "column", gap: 0.9 }}>
                            {[
                              { key: "lot", icon: FIDashboard, label: "Lotissement", value: parcelle.ilot?.lotissement?.nom },
                              { key: "ilot", icon: FIGridOn, label: "Îlot", value: parcelle.ilot?.numeroIlot },
                              {
                                key: "loc",
                                icon: LocationOn,
                                label: "Localité",
                                value: parcelle.ilot?.zone?.quartier?.ville ? getLocationString(parcelle) : null,
                              },
                            ]
                              .filter((l) => l.value)
                              .map((l) => (
                                <Box key={l.key} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                  <l.icon sx={{ fontSize: 18, color: "#3030F9", mt: "1px", flexShrink: 0 }} />
                                  <Typography sx={{ fontSize: 12.5, color: "#5b6573", width: 76, flexShrink: 0, mt: "1px" }}>
                                    {l.label}
                                  </Typography>
                                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0e1133", wordBreak: "break-word", minWidth: 0 }}>
                                    {l.value}
                                  </Typography>
                                </Box>
                              ))}
                          </Box>

                          {/* Prix */}
                          {parcelle.prix > 0 && (
                            <Box sx={{ borderTop: "1px solid #eef1f5", pt: 1.5, mt: "auto" }}>
                              <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#5b6573", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Prix
                              </Typography>
                              <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#0e1133", lineHeight: 1.25 }}>
                                {parcelle.prix.toLocaleString()}{" "}
                                <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "#5b6573" }}>
                                  FCFA
                                </Box>
                              </Typography>
                            </Box>
                          )}

                          {/* Agence */}
                          {parcelle.agenceId && (
                            <Box sx={{ bgcolor: "#f5f7fa", borderRadius: "10px", p: "10px 12px", display: "flex", alignItems: "center", gap: 1.25 }}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "8px",
                                  bgcolor: "#0e1133",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Business sx={{ fontSize: 18 }} />
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0e1133", lineHeight: 1.3, wordBreak: "break-word" }}>
                                  {parcelle.agenceId.nom}
                                </Typography>
                                {parcelle.agenceId.telephone && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Phone sx={{ fontSize: 14, color: "#3030F9" }} />
                                    <Typography sx={{ fontSize: 12.5, color: "#3030F9", fontWeight: 600 }}>
                                      {parcelle.agenceId.telephone}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          )}

                          {/* Le clic remonte à la carte : handleParcelleClick n'est appelé qu'une fois */}
                          <Button
                            fullWidth
                            variant="contained"
                            disableElevation
                            endIcon={<ArrowForward />}
                            sx={{
                              py: 1.2,
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              bgcolor: "#3030F9",
                              color: "#fff",
                              "&:hover": { bgcolor: "#2020C8" },
                            }}
                          >
                            Voir la parcelle
                          </Button>
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
      <ParcelleDetailDrawer
        open={openParcelleDrawer}
        onClose={handleCloseParcelleDetails}
        selectedParcelle={selectedParcelle}
        onParcelleUpdate={setSelectedParcelle}
      />

    </Box>
  );
};

export default SearchParcellesPage;

