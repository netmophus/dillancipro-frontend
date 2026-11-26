import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  GridLegacy as Grid,
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
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Menu,
  Popover,
  ImageList,
  ImageListItem,
  Tabs,
  Tab,
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
  PhotoCamera,
  Close,
  Home,
  Image as ImageIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  Apartment,
  Villa,
  Warehouse,
  Map as MapIcon,
  OpenInNew,
  ArrowForward,
  VerifiedUser,
  ContentCopy,
  WhatsApp,
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { createRoot } from "react-dom/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import BienDetailDrawer from "../../components/biens/BienDetailDrawer";
import api from "../../services/api";
import { BASE_SERVER_URL } from "../../config/config";

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Icône personnalisée pour les biens immobiliers
const bienIcon = L.icon({
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
});

// Statut du bien : vert charte si disponible, couleurs fonctionnelles sinon
const STATUTS_BIEN = {
  disponible: { label: "Disponible", color: "#0A7C4F" },
  en_cours_de_vente: { label: "En cours de vente", color: "#B45309" },
  reserve: { label: "Réservé", color: "#B45309" },
  vendu: { label: "Vendu", color: "#d32f2f" },
};

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
  // Affichage uniquement : panneau avancé et menu des segments de la barre
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [segMenu, setSegMenu] = useState({ key: null, el: null });
  const [selectedBien, setSelectedBien] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openBiensDrawer, setOpenBiensDrawer] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [mediaTab, setMediaTab] = useState(0); // 0: photos, 1: videos, 2: documents
  
  // État pour l'affichage progressif des biens (initialement 3)
  const [biensDisplayed, setBiensDisplayed] = useState(3);
  
  // État pour la carte
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([13.5125, 2.1098]); // Niamey par défaut
  const [mapZoom, setMapZoom] = useState(12);
  
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
    return `${BASE_SERVER_URL}/${correctedPath}`;
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
      caracteristiques: bien.caracteristiques || {},
      situationGeographique: bien.situationGeographique || null,
      descriptionPhysique: bien.descriptionPhysique || null,
      atoutsMajeurs: Array.isArray(bien.atoutsMajeurs) ? bien.atoutsMajeurs : (bien.atoutsMajeurs ? [bien.atoutsMajeurs] : []),
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
          py: 4,
          mb: 4,
          width: "100%",
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
            Biens Immobiliers à Vendre
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.9)">
            Trouvez le bien idéal parmi {stats?.totalBiens || 0} biens disponibles
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ width: "100%", mb: 4 }}>
        {/* Barre de filtres unifiée */}
        {(() => {
          const optNom = (list, id) => list.find((o) => o.id === id)?.nom || id;
          const fmt = (n) => Number(n).toLocaleString("fr-FR");
          const prixActif = Boolean(filters.prixMin || filters.prixMax);
          const prixLabel = prixActif
            ? `Prix : ${filters.prixMin ? fmt(filters.prixMin) : "0"} - ${filters.prixMax ? fmt(filters.prixMax) : "max"}`
            : "Prix";
          const segments = [
            { key: "ville", Icon: FILocationCity, color: "#3030F9", all: "Toutes les villes", options: filterOptions.villes.map((v) => ({ id: v.nom, nom: v.nom })) },
            { key: "type", Icon: Home, color: "#0A7C4F", all: "Tous les types", options: filterOptions.types.map((t) => ({ id: t.nom, nom: t.nom })) },
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
            filters.type && { key: "type", label: filters.type, Icon: Home, bg: "#3030F9" },
            filters.quartier && { key: "quartier", label: filters.quartier, Icon: FIPlace, bg: "#0A7C4F" },
            filters.agence && { key: "agence", label: `Agence: ${optNom(filterOptions.agences, filters.agence)}`, Icon: Business, bg: "#0e1133" },
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
                {segments.map(({ key, Icon, color, all, options }) => (
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
                      {filters[key] ? optNom(options, filters[key]) : all}
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
                  <Typography noWrap sx={{ flex: 1, color: prixActif ? "#0e1133" : "text.secondary", fontWeight: prixActif ? 600 : 400 }}>
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
                  {options.map((o) => (
                    <MenuItem
                      key={o.id}
                      selected={filters[key] === o.id}
                      onClick={() => { handleFilterChange(key, o.id); setSegMenu({ key: null, el: null }); }}
                    >
                      {o.nom}
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
                      value={filters.quartier || ""}
                      onChange={(e) => handleFilterChange("quartier", e.target.value)}
                      displayEmpty
                      inputProps={{ "aria-label": "Quartier", title: "Quartier" }}
                      startAdornment={<InputAdornment position="start"><FIPlace fontSize="small" sx={{ color: "#0A7C4F" }} /></InputAdornment>}
                      renderValue={(selected) => (!selected ? <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>Tous les quartiers</span> : selected)}
                    >
                      <MenuItem value=""><em>Tous les quartiers</em></MenuItem>
                      {filterOptions.quartiers.map((quartier) => (
                        <MenuItem key={quartier.id} value={quartier.nom}>{quartier.nom}</MenuItem>
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
                        !selected ? <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>Toutes les agences</span> : optNom(filterOptions.agences, selected)
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
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 1.5 }}>
                {chips.map(({ key, label, Icon, bg }) => (
                  <Chip
                    key={key}
                    label={label}
                    size="small"
                    icon={<Icon sx={{ color: "white !important", fontSize: 16 }} />}
                    deleteIcon={<Close sx={{ color: "white !important", fontSize: 16 }} />}
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
            </Box>
          );
        })()}

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
              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {pagination.total} bien{pagination.total > 1 ? "s" : ""} trouvé{pagination.total > 1 ? "s" : ""}
                </Typography>
                <Button
                  variant={showMap ? "contained" : "outlined"}
                  startIcon={<MapIcon />}
                  onClick={() => setShowMap(!showMap)}
                  size="small"
                >
                  {showMap ? "Masquer la carte" : "Afficher sur la carte"}
                </Button>
              </Box>

              {/* Carte avec marqueurs */}
              {showMap && (
                <Box sx={{ mb: 4, height: "500px", borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {biens
                      .filter((bien) => bien.localisation?.latitude && bien.localisation?.longitude)
                      .map((bien) => (
                        <Marker
                          key={bien._id}
                          position={[parseFloat(bien.localisation.latitude), parseFloat(bien.localisation.longitude)]}
                          icon={bienIcon}
                        >
                          <Popup maxWidth={400}>
                            <Box sx={{ minWidth: 350, p: 0 }}>
                              {/* Photo du bien */}
                              {bien.images && bien.images.length > 0 && (
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 180,
                                    backgroundImage: `url(${fixImageUrl(bien.images[0])})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    borderRadius: "4px 4px 0 0",
                                  }}
                                />
                              )}
                              
                              {/* En-tête avec nom et type */}
                              <Box
                                sx={{
                                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  color: "white",
                                  p: 2,
                                  borderRadius: bien.images && bien.images.length > 0 ? 0 : "4px 4px 0 0",
                                }}
                              >
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: "1rem" }}>
                                  {bien.titre}
                                </Typography>
                                <Chip
                                  label={bien.type}
                                  size="small"
                                  sx={{
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    color: "white",
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                  }}
                                />
                              </Box>

                              {/* Informations */}
                              <Box sx={{ p: 2 }}>
                                <Stack spacing={1.5}>
                                  {/* Prix */}
                                  <Box
                                    sx={{
                                      p: 1.5,
                                      bgcolor: "primary.50",
                                      borderRadius: 1,
                                      borderLeft: "3px solid",
                                      borderColor: "primary.main",
                                    }}
                                  >
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}>
                                      Prix
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="primary" sx={{ mt: 0.5 }}>
                                      {formatMoney(bien.prix)}
                                    </Typography>
                                  </Box>

                                  {/* Superficie */}
                                  {bien.superficie && (
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Square fontSize="small" color="action" />
                                      <Typography variant="body2">
                                        <strong>{bien.superficie}</strong> m²
                                      </Typography>
                                    </Box>
                                  )}

                                  {/* Localisation */}
                                  <Box>
                                    <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                      <LocationOn fontSize="small" color="action" />
                                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}>
                                        Localisation
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ pl: 2.5 }}>
                                      {bien.localisation?.adresse && `${bien.localisation.adresse}, `}
                                      {bien.localisation?.ville}
                                      {bien.localisation?.quartier && `, ${bien.localisation.quartier}`}
                                    </Typography>
                                  </Box>

                                  {/* Caractéristiques */}
                                  {bien.caracteristiques && (
                                    <>
                                      {(bien.caracteristiques.nbChambres || bien.caracteristiques.nbSallesBain) && (
                                        <Box display="flex" gap={2}>
                                          {bien.caracteristiques.nbChambres && (
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                              <Bed fontSize="small" color="action" />
                                              <Typography variant="body2">{bien.caracteristiques.nbChambres}</Typography>
                                            </Box>
                                          )}
                                          {bien.caracteristiques.nbSallesBain && (
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                              <Bathtub fontSize="small" color="action" />
                                              <Typography variant="body2">{bien.caracteristiques.nbSallesBain}</Typography>
                                            </Box>
                                          )}
                                        </Box>
                                      )}
                                    </>
                                  )}

                                  <Divider />

                                  {/* Boutons d'action */}
                                  <Stack spacing={1} sx={{ mt: 1 }}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<Home />}
                                      onClick={() => {
                                        setSelectedBien(bien);
                                        setOpenBiensDrawer(true);
                                      }}
                                      fullWidth
                                      sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                      }}
                                    >
                                      Voir détails
                                    </Button>
                                    <Box 
                                      sx={{ 
                                        display: "flex", 
                                        gap: 0.5, 
                                        width: "100%",
                                        "& > *": {
                                          flex: 1,
                                        }
                                      }}
                                    >
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const lat = bien.localisation?.latitude;
                                          const lng = bien.localisation?.longitude;
                                          if (lat && lng) {
                                            window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                                          }
                                        }}
                                        sx={{
                                          textTransform: "none",
                                          fontWeight: 600,
                                          fontSize: "0.65rem",
                                          minWidth: 0,
                                          px: 0.5,
                                          py: 0.5,
                                        }}
                                      >
                                        Google Maps
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const lat = bien.localisation?.latitude;
                                          const lng = bien.localisation?.longitude;
                                          if (lat && lng) {
                                            window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`, "_blank");
                                          }
                                        }}
                                        sx={{
                                          textTransform: "none",
                                          fontWeight: 600,
                                          fontSize: "0.65rem",
                                          minWidth: 0,
                                          px: 0.5,
                                          py: 0.5,
                                        }}
                                      >
                                        OpenStreetMap
                                      </Button>
                                    </Box>
                                  </Stack>
                                </Stack>
                              </Box>
                            </Box>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                </Box>
              )}

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
                    const bienQuartier = bien.localisation?.quartier;
                    const villeEtQuartier = bienQuartier ? `${bienVille}, ${bienQuartier}` : bienVille;
                    const bienSuperficie = bien.superficie?.toString() || "0";
                    const bienStatut = STATUTS_BIEN[bien.statut];
                    const nbPhotos = bien.images?.length || 0;
                    const nbChambres = bien.caracteristiques?.nbChambres;
                    const nbSallesBain = bien.caracteristiques?.nbSallesBain;
                    const indicateurs = [
                      nbChambres ? { key: "ch", icon: Bed, label: `${nbChambres} ${nbChambres > 1 ? "chambres" : "chambre"}` } : null,
                      nbSallesBain ? { key: "sdb", icon: Bathtub, label: `${nbSallesBain} ${nbSallesBain > 1 ? "salles de bain" : "salle de bain"}` } : null,
                      Number(bienSuperficie) > 0 ? { key: "sup", icon: FISquareFoot, label: `${bienSuperficie} m²` } : null,
                    ].filter(Boolean);

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
                          elevation={0}
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "16px",
                            overflow: "hidden",
                            bgcolor: "#fff",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 2px 12px rgba(15,23,42,0.08)",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            "&:hover": {
                              transform: { xs: "none", md: "translateY(-2px)" },
                              boxShadow: "0 8px 22px rgba(15,23,42,0.14)",
                            },
                          }}
                        >
                        {/* Image */}
                        <Box sx={{ height: 190, position: "relative", overflow: "hidden", bgcolor: "#d9e2ec" }}>
                          <Box
                            component="img"
                            src={bienImage}
                            alt={bien.titre}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />

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
                              maxWidth: "55%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {bien.type || "Bien immobilier"}
                          </Box>

                          {/* Badges statut / vérifié, en haut à droite */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: 0.75,
                            }}
                          >
                            {bienStatut && (
                              <Box
                                sx={{
                                  bgcolor: "#fff",
                                  color: bienStatut.color,
                                  px: 1.4,
                                  py: 0.5,
                                  borderRadius: "999px",
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  boxShadow: "0 1px 4px rgba(15,23,42,0.18)",
                                }}
                              >
                                {bienStatut.label}
                              </Box>
                            )}
                            {bien.verified && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  bgcolor: "#fff",
                                  color: "#0A7C4F",
                                  px: 1.1,
                                  py: 0.3,
                                  borderRadius: "999px",
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  boxShadow: "0 1px 4px rgba(15,23,42,0.18)",
                                }}
                              >
                                <VerifiedUser sx={{ fontSize: 14 }} />
                                Vérifié
                              </Box>
                            )}
                          </Box>

                          {/* Compteur de photos, en bas à droite */}
                          {nbPhotos > 0 && (
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 10,
                                right: 10,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor: "rgba(14,17,51,0.75)",
                                color: "#fff",
                                px: 1,
                                py: 0.3,
                                borderRadius: "999px",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                              }}
                            >
                              <PhotoCamera sx={{ fontSize: 14 }} />
                              {nbPhotos}
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
                            flex: 1,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: 16, fontWeight: 700, color: "#0e1133", lineHeight: 1.3, mb: 1 }}
                          >
                            {bien.titre}
                          </Typography>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
                            <LocationOn sx={{ fontSize: 18, color: "#3030F9" }} />
                            <Typography sx={{ fontSize: 14, color: "#5b6573" }}>
                              {villeEtQuartier}
                            </Typography>
                          </Box>

                          {indicateurs.length > 0 && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
                              {indicateurs.map((ind) => (
                                <Box
                                  key={ind.key}
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    bgcolor: "#EAF0FF",
                                    color: "#2020C8",
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    px: 1.1,
                                    py: 0.4,
                                    borderRadius: "999px",
                                  }}
                                >
                                  <ind.icon sx={{ fontSize: 16 }} />
                                  {ind.label}
                                </Box>
                              ))}
                            </Box>
                          )}

                          <Box sx={{ borderTop: "1px solid #eef1f5", pt: 1.5, mb: 1.75, mt: "auto" }}>
                            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 1 }}>
                              <Box>
                                <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#5b6573", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                  Prix
                                </Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0e1133", lineHeight: 1.25 }}>
                                  {new Intl.NumberFormat("fr-FR").format(bien.prix || 0)}{" "}
                                  <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "#5b6573" }}>
                                    FCFA
                                  </Box>
                                </Typography>
                              </Box>
                              {bien.reference && (
                                <Typography sx={{ fontSize: 11.5, color: "#5b6573", textAlign: "right", wordBreak: "break-all" }}>
                                  Réf : {bien.reference}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          <Button
                            fullWidth
                            variant="contained"
                            disableElevation
                            endIcon={<ArrowForward />}
                            onClick={() => handleOpenBienDetails(bien)}
                            sx={{
                              py: { xs: 1.1, sm: 1.2 },
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: { xs: "0.9rem", sm: "0.95rem" },
                              bgcolor: "#3030F9",
                              color: "#fff",
                              "&:hover": { bgcolor: "#2020C8" },
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
      <BienDetailDrawer
        open={openBiensDrawer}
        onClose={handleCloseBienDetails}
        selectedBien={selectedBien}
        onBienUpdate={setSelectedBien}
      />

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

