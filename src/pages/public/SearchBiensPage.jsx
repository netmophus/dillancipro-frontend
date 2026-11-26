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
  Garage,
  Pool,
  Nature,
  Weekend,
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
  ErrorOutline,
  SearchOff,
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
  const [error, setError] = useState(false);
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
      setError(false);
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
      setError(true);
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

  const GREEN = "#008557";
  const GREEN_DEEP = "#005C48";
  const GREEN_DARK = "#004D40";
  const LIME = "#84CC16";
  const NIGHT = "#101C36";
  const MUTED = "#475569";
  const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";
  const fmtN = (n) => Number(n).toLocaleString("fr-FR").replace(/[  ]/g, " ");
  const closeSeg = () => setSegMenu({ key: null, el: null });
  const optNom = (list, id) => list.find((o) => o.id === id)?.nom || id;
  const prixActif = Boolean(filters.prixMin || filters.prixMax);
  const prixLabel = prixActif
    ? `Prix : ${filters.prixMin ? fmtN(filters.prixMin) : "0"} - ${filters.prixMax ? fmtN(filters.prixMax) : "max"}`
    : "Prix";
  const segments = [
    { key: "ville", Icon: FILocationCity, all: "Toutes les villes", options: filterOptions.villes.map((v) => ({ id: v.nom, nom: v.nom })) },
    { key: "type", Icon: Home, all: "Tous les types", options: filterOptions.types.map((t) => ({ id: t.nom, nom: t.nom })) },
  ];
  const segSx = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: 1.25,
    height: 52,
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    bgcolor: "#fff",
    font: "inherit",
    fontFamily: FONT,
    textAlign: "left",
    transition: "border-color 0.2s ease",
    "&:hover": { borderColor: GREEN },
    "&:focus-visible": { outline: `2px solid ${GREEN}`, outlineOffset: 2 },
  };
  const panelField = { flex: "1 1 200px", minWidth: { xs: "100%", sm: 180 } };
  const chips = [
    filters.ville && { key: "ville", label: filters.ville, Icon: FILocationCity },
    filters.type && { key: "type", label: filters.type, Icon: Home },
    filters.quartier && { key: "quartier", label: filters.quartier, Icon: FIPlace },
    filters.agence && { key: "agence", label: `Agence: ${optNom(filterOptions.agences, filters.agence)}`, Icon: Business },
    filters.prixMin && { key: "prixMin", label: `Prix > ${fmtN(filters.prixMin)}`, Icon: FIPayments },
    filters.prixMax && { key: "prixMax", label: `Prix < ${fmtN(filters.prixMax)}`, Icon: FIPayments },
    filters.superficieMin && { key: "superficieMin", label: `Sup > ${filters.superficieMin} m²`, Icon: FISquareFoot },
    filters.superficieMax && { key: "superficieMax", label: `Sup < ${filters.superficieMax} m²`, Icon: FISquareFoot },
  ].filter(Boolean);
  const popSx = { borderRadius: 3, mt: 0.5, p: 2, width: 300, maxWidth: "calc(100vw - 32px)", "& .MuiOutlinedInput-root": { borderRadius: "10px" }, "& legend": { display: "none" } };
  const totalDispo = stats?.totalBiens;

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#F1F4F7", fontFamily: FONT }}>
      <Navbar />

      {/* Bannière : photo à droite, voile vert profond à gauche */}
      <Box
        component="section"
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          bgcolor: GREEN_DEEP,
          backgroundImage: "url(/images/hero-biens.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: {
              xs: `linear-gradient(180deg, rgba(0,77,64,0.94) 0%, rgba(0,92,72,0.86) 100%)`,
              md: `linear-gradient(90deg, rgba(0,77,64,0.98) 0%, rgba(0,92,72,0.92) 38%, rgba(0,92,72,0.45) 62%, rgba(0,92,72,0) 85%)`,
            },
          },
        }}
      >
        <Box component="svg" viewBox="0 0 300 200" aria-hidden="true" sx={{ display: { xs: "none", md: "block" }, position: "absolute", right: 0, top: 0, width: 280, height: 190, pointerEvents: "none", zIndex: 1 }}>
          <path d="M300 0 V120 C 250 110, 190 60, 170 0 Z" fill={LIME} fillOpacity="0.55" />
          <path d="M300 0 V70 C 270 62, 230 30, 220 0 Z" fill="#fff" fillOpacity="0.18" />
        </Box>
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            boxSizing: "border-box",
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 2, sm: 3, md: 5 },
            pt: { xs: 4, md: 6 },
            pb: { xs: 10, md: 13 },
            minHeight: { md: 280 },
          }}
        >
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.75, py: 0.75, mb: 2, borderRadius: "999px", bgcolor: GREEN, border: "1px solid rgba(255,255,255,0.28)" }}>
            <Home sx={{ fontSize: 18, color: "#fff" }} />
            <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1 }}>Biens au Niger</Typography>
          </Box>
          <Typography
            variant="h1"
            sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(28px, 3.2vw, 48px)", lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff" }}
          >
            Biens immobiliers <Box component="span" sx={{ color: LIME }}>à vendre</Box>
          </Typography>
          <Box component="svg" viewBox="0 0 96 14" aria-hidden="true" sx={{ display: "block", width: 96, height: 14, mt: 1, mb: 1.5 }}>
            <path d="M3 9 C 18 2, 32 2, 46 8 S 76 14, 93 5" fill="none" stroke={LIME} strokeWidth="4" strokeLinecap="round" />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: { xs: 16, md: 18 }, color: "#fff", lineHeight: 1.5, maxWidth: 620 }}>
            {typeof totalDispo === "number" ? (
              <>
                Trouvez le bien idéal parmi <Box component="strong" sx={{ color: LIME }}>{totalDispo}</Box> bien{totalDispo > 1 ? "s" : ""} disponible{totalDispo > 1 ? "s" : ""}.
              </>
            ) : (
              "Trouvez le bien idéal parmi les biens disponibles."
            )}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ boxSizing: "border-box", width: "100%", maxWidth: 1440, mx: "auto", px: { xs: 2, sm: 3, md: 5 }, pb: 6 }}>
        {/* Barre de filtres, à cheval sur la bannière */}
        <Box sx={{ position: "relative", zIndex: 3, mt: { xs: -7, md: -8 }, mb: 3 }}>
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(16,28,54,0.12)",
              p: "16px",
              display: "grid",
              gap: "12px",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              "@media (min-width:1024px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr)) auto" },
              alignItems: "center",
            }}
          >
            {segments.map(({ key, Icon, all, options }) => (
              <Box key={key} component="button" type="button" aria-label={all} title={all} onClick={(e) => setSegMenu({ key, el: e.currentTarget })} sx={segSx}>
                <Icon sx={{ color: GREEN }} />
                <Typography noWrap sx={{ flex: 1, fontFamily: FONT, fontSize: 15, color: filters[key] ? NIGHT : MUTED, fontWeight: filters[key] ? 600 : 500 }}>
                  {filters[key] ? optNom(options, filters[key]) : all}
                </Typography>
                <FIExpandMore sx={{ color: MUTED }} />
              </Box>
            ))}
            <Box component="button" type="button" aria-label="Prix" title="Prix" onClick={(e) => setSegMenu({ key: "prix", el: e.currentTarget })} sx={segSx}>
              <FIPayments sx={{ color: GREEN }} />
              <Typography noWrap sx={{ flex: 1, fontFamily: FONT, fontSize: 15, color: prixActif ? NIGHT : MUTED, fontWeight: prixActif ? 600 : 500 }}>{prixLabel}</Typography>
              <FIExpandMore sx={{ color: MUTED }} />
            </Box>
            <Button
              variant="contained"
              disableElevation
              startIcon={<FITune />}
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              sx={{ height: 52, px: 3, borderRadius: "12px", bgcolor: GREEN_DEEP, color: "#fff", fontFamily: FONT, textTransform: "none", fontWeight: 700, fontSize: 15, "&:hover": { bgcolor: GREEN_DARK } }}
            >
              Filtres{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
            </Button>
          </Box>

          {segments.map(({ key, options, all }) => (
            <Menu
              key={key}
              anchorEl={segMenu.el}
              open={segMenu.key === key && Boolean(segMenu.el)}
              onClose={closeSeg}
              slotProps={{ paper: { sx: { borderRadius: 3, mt: 0.5, minWidth: 220, maxHeight: 360 } } }}
            >
              <MenuItem selected={!filters[key]} onClick={() => { handleFilterChange(key, ""); closeSeg(); }}>
                <em>{all}</em>
              </MenuItem>
              {options.map((o) => (
                <MenuItem key={o.id} selected={filters[key] === o.id} onClick={() => { handleFilterChange(key, o.id); closeSeg(); }}>
                  {o.nom}
                </MenuItem>
              ))}
            </Menu>
          ))}
          <Popover
            anchorEl={segMenu.el}
            open={segMenu.key === "prix" && Boolean(segMenu.el)}
            onClose={closeSeg}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            slotProps={{ paper: { sx: popSx } }}
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
                  InputProps={{ startAdornment: <InputAdornment position="start"><FIPayments fontSize="small" sx={{ color: GREEN }} /></InputAdornment> }}
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
                borderRadius: "16px",
                bgcolor: "#fff",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#ffffff" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: GREEN },
                "& legend": { display: "none" },
              }}
            >
              <FormControl size="small" sx={panelField}>
                <Select
                  value={filters.quartier || ""}
                  onChange={(e) => handleFilterChange("quartier", e.target.value)}
                  displayEmpty
                  inputProps={{ "aria-label": "Quartier", title: "Quartier" }}
                  startAdornment={<InputAdornment position="start"><FIPlace fontSize="small" sx={{ color: GREEN }} /></InputAdornment>}
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
                  startAdornment={<InputAdornment position="start"><Business fontSize="small" sx={{ color: GREEN }} /></InputAdornment>}
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
                  InputProps={{ startAdornment: <InputAdornment position="start"><FISquareFoot fontSize="small" sx={{ color: GREEN }} /></InputAdornment> }}
                  sx={panelField}
                />
              ))}
            </Box>
          )}

          {/* Filtres actifs + réinitialisation */}
          {(chips.length > 0 || activeFiltersCount > 0) && (
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 1.5 }}>
              {chips.map(({ key, label, Icon }) => (
                <Chip
                  key={key}
                  label={label}
                  size="small"
                  icon={<Icon sx={{ color: "white !important", fontSize: 16 }} />}
                  deleteIcon={<Close sx={{ color: "white !important", fontSize: 16 }} />}
                  onDelete={() => handleFilterChange(key, "")}
                  sx={{ bgcolor: GREEN, color: "white", fontWeight: 600, "&:hover": { bgcolor: GREEN_DEEP } }}
                />
              ))}
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="outlined"
                size="small"
                startIcon={<FIRefresh />}
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0}
                sx={{ borderColor: GREEN, color: GREEN, borderRadius: "10px", textTransform: "none", fontWeight: 600, "&:hover": { borderColor: GREEN_DEEP, bgcolor: "rgba(0,133,87,0.06)" } }}
              >
                Réinitialiser
              </Button>
            </Box>
          )}
        </Box>

        {/* Barre de résultats : compteur + tri + carte */}
        {!loading && !error && biens.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: { xs: 1.5, md: 2 }, mb: 2.5 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, color: NIGHT }}>
              <Box component="strong" sx={{ color: GREEN, fontWeight: 800 }}>{pagination.total}</Box>{" "}
              bien{pagination.total > 1 ? "s" : ""} trouvé{pagination.total > 1 ? "s" : ""}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: { xs: "wrap", md: "nowrap" },
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
                width: { xs: "100%", md: "auto" },
                "& .MuiOutlinedInput-root": { height: 44, borderRadius: "10px", bgcolor: "#fff", fontFamily: FONT, fontSize: 14, color: NIGHT, boxShadow: "0 1px 2px rgba(16,28,54,0.05)", "& fieldset": { borderColor: "#D5DCE3" }, "&:hover fieldset": { borderColor: "#B7C2CD" }, "&.Mui-focused fieldset": { borderColor: GREEN } },
                "& legend": { display: "none" },
              }}
            >
              <FormControl size="small" sx={{ flex: { xs: "1 1 140px", md: "0 0 180px" }, minWidth: 0 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  inputProps={{ "aria-label": "Trier par", title: "Trier par" }}
                  startAdornment={<InputAdornment position="start"><FISort sx={{ fontSize: 20, color: GREEN }} /></InputAdornment>}
                >
                  <MenuItem value="createdAt">Date d'ajout</MenuItem>
                  <MenuItem value="prix">Prix</MenuItem>
                  <MenuItem value="superficie">Superficie</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: { xs: "1 1 140px", md: "0 0 180px" }, minWidth: 0 }}>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  inputProps={{ "aria-label": "Ordre", title: "Ordre" }}
                  startAdornment={<InputAdornment position="start"><FISwapVert sx={{ fontSize: 20, color: GREEN }} /></InputAdornment>}
                >
                  <MenuItem value="asc">Croissant</MenuItem>
                  <MenuItem value="desc">Décroissant</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                disableElevation
                startIcon={<MapIcon sx={{ fontSize: "22px !important" }} />}
                onClick={() => setShowMap(!showMap)}
                sx={{ flex: { xs: "1 1 100%", md: "0 0 auto" }, whiteSpace: "nowrap", height: 44, px: 2.25, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 14, border: `1px solid ${GREEN}`, bgcolor: showMap ? GREEN : "#fff", color: showMap ? "#fff" : GREEN, boxShadow: "0 1px 2px rgba(16,28,54,0.05)", "&:hover": { border: `1px solid ${GREEN_DEEP}`, bgcolor: showMap ? GREEN_DEEP : "rgba(0,133,87,0.06)" } }}
              >
                {showMap ? "Masquer la carte" : "Afficher sur la carte"}
              </Button>
            </Box>
          </Box>
        )}

        {/* Liste des biens */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
            <CircularProgress sx={{ color: GREEN }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 6, px: 2, bgcolor: "#fff", borderRadius: "18px" }}>
            <ErrorOutline sx={{ fontSize: 48, color: "#d32f2f" }} />
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NIGHT, mt: 1 }}>Impossible de charger les biens.</Typography>
            <Typography sx={{ fontFamily: FONT, color: MUTED, mb: 2 }}>Vérifiez votre connexion puis réessayez.</Typography>
            <Button variant="contained" disableElevation onClick={searchBiens} sx={{ bgcolor: GREEN, textTransform: "none", fontWeight: 600, borderRadius: "10px", "&:hover": { bgcolor: GREEN_DEEP } }}>
              Réessayer
            </Button>
          </Box>
        ) : biens.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, px: 2, bgcolor: "#fff", borderRadius: "18px" }}>
            <SearchOff sx={{ fontSize: 48, color: GREEN }} />
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NIGHT, mt: 1 }}>
              {activeFiltersCount > 0 ? "Aucun bien trouvé avec ces critères de recherche." : "Aucun bien n'est actuellement disponible à la vente."}
            </Typography>
            <Typography sx={{ fontFamily: FONT, color: MUTED, mt: 0.5, maxWidth: 480, mx: "auto" }}>
              {activeFiltersCount > 0 ? "Modifiez ou réinitialisez vos filtres pour élargir la recherche." : "Revenez bientôt : de nouveaux biens seront publiés prochainement."}
            </Typography>
            {activeFiltersCount > 0 && (
              <Button onClick={handleClearFilters} sx={{ mt: 1.5, color: GREEN, textTransform: "none", fontWeight: 600 }}>Réinitialiser les filtres</Button>
            )}
          </Box>
        ) : (
          <>
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
                                  background: "linear-gradient(135deg, #008557 0%, #005C48 100%)",
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
                                        background: "linear-gradient(135deg, #008557 0%, #005C48 100%)",
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

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                "@media (min-width:768px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
                "@media (min-width:1024px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
                gap: "24px",
                alignItems: "stretch",
              }}
            >
              {biens.slice(0, biensDisplayed).map((bien) => {
                const firstImg = bien.images && bien.images.length > 0 ? bien.images[0] : null;
                const photoUrl = firstImg ? fixImageUrl(typeof firstImg === "string" ? firstImg : firstImg.url || firstImg) : null;
                const bienVille = bien.localisation?.ville;
                const bienQuartier = bien.localisation?.quartier;
                const localite = [bienQuartier, bienVille].filter(Boolean).join(", ");
                const bienStatut = STATUTS_BIEN[bien.statut];
                const dispoOk = bien.statut === "disponible";
                const nbPhotos = bien.images?.length || 0;
                const carac = bien.caracteristiques || {};
                const nbChambres = carac.nbChambres;
                const nbSallesBain = carac.nbSallesBain;
                const sup = Number(bien.superficie);
                const nbSalons = carac.nbSalons;
                const features = [
                  nbChambres > 0 && { key: "ch", Icon: Bed, text: `${nbChambres} ${nbChambres > 1 ? "chambres" : "chambre"}` },
                  nbSallesBain > 0 && { key: "sdb", Icon: Bathtub, text: `${nbSallesBain} ${nbSallesBain > 1 ? "salles de bain" : "salle de bain"}` },
                  nbSalons > 0 && { key: "sal", Icon: Weekend, text: `${nbSalons} ${nbSalons > 1 ? "salons" : "salon"}` },
                  sup > 0 && { key: "sup", Icon: FISquareFoot, text: `${fmtN(sup)} m²` },
                  carac.jardin && { key: "jar", Icon: Nature, text: "Jardin" },
                  carac.garage && { key: "gar", Icon: Garage, text: "Garage" },
                  carac.piscine && { key: "pis", Icon: Pool, text: "Piscine" },
                ].filter(Boolean).slice(0, 6);
                return (
                  <Card
                    key={bien._id}
                    elevation={0}
                    onClick={() => handleOpenBienDetails(bien)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                      cursor: "pointer",
                      borderRadius: "16px",
                      overflow: "hidden",
                      bgcolor: "#fff",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 2px 8px rgba(16,28,54,0.06)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(16,28,54,0.10)" },
                    }}
                  >
                    {/* Photographie (réelle ou image illustrative) */}
                    <Box sx={{ height: 200, position: "relative", overflow: "hidden", bgcolor: GREEN_DEEP }}>
                      <Box sx={{ position: "absolute", inset: 0, backgroundImage: "url(/images/bien-placeholder.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
                      {photoUrl ? (
                        <Box
                          component="img"
                          src={photoUrl}
                          alt={bien.titre}
                          onError={(e) => { e.target.style.display = "none"; }}
                          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <Box sx={{ position: "absolute", left: 12, bottom: 10, px: 1, py: 0.25, borderRadius: "6px", bgcolor: "rgba(16,28,54,0.6)", color: "#fff", fontSize: 11, fontFamily: FONT }}>
                          Image illustrative
                        </Box>
                      )}
                      <Box sx={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, minWidth: 0 }}>
                          <Box sx={{ bgcolor: GREEN_DEEP, color: "#fff", px: 1.5, py: 0.5, borderRadius: "8px", fontSize: 12, fontWeight: 800, letterSpacing: 0.4, fontFamily: FONT, whiteSpace: "nowrap" }}>
                            À VENDRE
                          </Box>
                          {bien.type && (
                            <Box sx={{ bgcolor: "#fff", color: NIGHT, px: 1.5, py: 0.5, borderRadius: "8px", fontSize: 12, fontWeight: 700, fontFamily: FONT, textTransform: "capitalize", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {bien.type}
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.75, flexShrink: 0 }}>
                          {bienStatut && (
                            <Box sx={{ bgcolor: dispoOk ? "#E5F3EC" : "#fff", color: dispoOk ? GREEN_DEEP : bienStatut.color, px: 1.5, py: 0.5, borderRadius: "8px", fontSize: 12, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap" }}>
                              {bienStatut.label}
                            </Box>
                          )}
                          {bien.verified && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#fff", color: GREEN, px: 1.1, py: 0.35, borderRadius: "8px", fontSize: 11.5, fontWeight: 700, fontFamily: FONT }}>
                              <VerifiedUser sx={{ fontSize: 14 }} />
                              Vérifié
                            </Box>
                          )}
                        </Box>
                      </Box>
                      {nbPhotos > 0 && (
                        <Box sx={{ position: "absolute", bottom: 10, right: 10, display: "flex", alignItems: "center", gap: 0.5, bgcolor: NIGHT, color: "#fff", px: 1.1, py: 0.3, borderRadius: "999px", fontSize: 12, fontWeight: 600, fontFamily: FONT }}>
                          <PhotoCamera sx={{ fontSize: 15 }} />
                          {nbPhotos}
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ p: "16px", "&:last-child": { pb: "16px" }, display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                      {/* Titre (deux lignes réservées) */}
                      <Typography
                        title={bien.titre}
                        sx={{
                          fontFamily: FONT, fontSize: 19, fontWeight: 700, color: NIGHT, lineHeight: 1.3, overflowWrap: "anywhere",
                          minHeight: "calc(2 * 1.3em)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}
                      >
                        {bien.titre}
                      </Typography>

                      {/* Localisation | type */}
                      {(localite || bien.type) && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 1.25, rowGap: 0.25, mt: "-4px", fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: NIGHT }}>
                          {localite && (
                            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                              <LocationOn sx={{ fontSize: 17, color: GREEN, flexShrink: 0 }} />
                              <Box component="span" sx={{ overflowWrap: "anywhere" }}>{localite}</Box>
                            </Box>
                          )}
                          {bien.type && (
                            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, textTransform: "capitalize", whiteSpace: "nowrap" }}>
                              {localite && <Box component="span" aria-hidden="true" sx={{ color: "#CBD5E1", mr: 0.75 }}>|</Box>}
                              <Home sx={{ fontSize: 17, color: GREEN, flexShrink: 0 }} />
                              {bien.type}
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Prix de vente */}
                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", columnGap: 1.5, rowGap: 0.25, bgcolor: "#F1F4F7", borderRadius: "8px", p: "10px 12px" }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: MUTED }}>Prix de vente</Typography>
                        {bien.prix > 0 ? (
                          <Typography sx={{ fontFamily: FONT, fontSize: 23, fontWeight: 800, color: GREEN_DEEP, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                            <Box component="span" sx={{ whiteSpace: "nowrap" }}>{fmtN(bien.prix).replace(/ /g, " ")}</Box>{" "}
                            <Box component="span" sx={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>FCFA</Box>
                          </Typography>
                        ) : (
                          <Typography sx={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: GREEN_DEEP }}>Prix sur demande</Typography>
                        )}
                      </Box>

                      {/* Caractéristiques : grille 2 colonnes */}
                      {features.length > 0 && (
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                          {features.map(({ key, Icon, text }) => (
                            <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 38, px: 1.25, py: 0.5, borderRadius: "8px", bgcolor: "#E5F3EC", minWidth: 0 }}>
                              <Icon sx={{ fontSize: 20, color: GREEN, flexShrink: 0 }} />
                              <Box sx={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: NIGHT, lineHeight: 1.2, overflowWrap: "anywhere", minWidth: 0 }}>{text}</Box>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Agence + référence + bouton (alignés en bas de carte) */}
                      <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 1.5, rowGap: 0.5, pt: "12px", borderTop: "1px solid #E2E8F0", minHeight: 52 }}>
                          {bien.agenceId && bien.agenceId.nom && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: "1 1 150px", minWidth: 0 }}>
                              <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#E5F3EC", color: GREEN_DEEP, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Business sx={{ fontSize: 21 }} />
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: NIGHT, lineHeight: 1.3, overflowWrap: "anywhere" }}>{bien.agenceId.nom}</Typography>
                                {bien.agenceId.telephone && (
                                  <Box
                                    component="a"
                                    href={`tel:${String(bien.agenceId.telephone).replace(/\s+/g, "")}`}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: GREEN, textDecoration: "none", fontFamily: FONT, fontSize: 13.5, fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                                  >
                                    <Phone sx={{ fontSize: 16 }} />
                                    {bien.agenceId.telephone}
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          )}
                          {bien.reference && (
                            <Typography sx={{ fontFamily: FONT, fontSize: 11.5, color: MUTED, overflowWrap: "anywhere", flex: "0 1 auto", ml: "auto", maxWidth: "100%", textAlign: "right" }}>Réf : {bien.reference}</Typography>
                          )}
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          disableElevation
                          endIcon={<ArrowForward />}
                          sx={{ height: 44, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 15, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}
                        >
                          Voir le bien
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            {biensDisplayed < biens.length && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleShowMoreBiens}
                  sx={{ px: 4, height: 48, fontFamily: FONT, fontSize: 15.5, fontWeight: 600, borderRadius: "12px", textTransform: "none", borderWidth: 2, borderColor: GREEN, color: GREEN, "&:hover": { borderWidth: 2, borderColor: GREEN_DEEP, bgcolor: "rgba(0,133,87,0.06)" } }}
                >
                  Afficher la suite
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
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

