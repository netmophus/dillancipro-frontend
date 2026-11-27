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
  Paper,
  IconButton,
  Drawer,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Menu,
  Popover,
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
  LocationCity as FILocationCity,
  Place as FIPlace,
  Payments as FIPayments,
  SquareFoot as FISquareFoot,
  Sort as FISort,
  SwapVert as FISwapVert,
  Chair as FIChair,
  Tune as FITune,
  ExpandMore as FIExpandMore,
  Refresh as FIRefresh,
  ArrowForward,
  ErrorOutline,
  SearchOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import LocationDetailDrawer from "../../components/locations/LocationDetailDrawer";
import api from "../../services/api";
import { BASE_SERVER_URL } from "../../config/config";

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

      const response = await api.get("/public/locations/search", { params });
      setLocations(response.data.locations || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Erreur recherche locations:", error);
      setLocations([]);
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
    return `${BASE_SERVER_URL}/${correctedPath}`;
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

  const GREEN = "#008557";
  const GREEN_DEEP = "#005C48";
  const GREEN_DARK = "#004D40";
  const LIME = "#84CC16";
  const NIGHT = "#101C36";
  const MUTED = "#475569";
  const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

  // Panneau déroulant des listes de tri, aux couleurs Dillanci
  const SORT_MENU_PROPS = {
    slotProps: {
      paper: {
        elevation: 0,
        sx: {
          mt: 0.75,
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 12px 28px rgba(16,28,54,0.14)",
          "& .MuiMenu-list": { p: 0.75 },
          "& .MuiMenuItem-root": {
            fontFamily: FONT,
            fontSize: 14.5,
            fontWeight: 600,
            color: NIGHT,
            minHeight: 42,
            borderRadius: "8px",
            "&:hover": { bgcolor: "#F1F4F7" },
            "&.Mui-selected": { bgcolor: "#E5F3EC", color: GREEN, "&:hover": { bgcolor: "#E5F3EC" } },
            "&.Mui-focusVisible": { outline: `2px solid ${GREEN}`, outlineOffset: -2 },
          },
        },
      },
    },
  };

  const fmtN = (n) => Number(n).toLocaleString("fr-FR").replace(/[  ]/g, " ");
  const closeSeg = () => setSegMenu({ key: null, el: null });
  const optNom = (list, id) => list.find((o) => o.id === id)?.nom || id;
  const prixActif = Boolean(filters.prixMin || filters.prixMax);
  const prixLabel = prixActif
    ? `Prix : ${filters.prixMin ? fmtN(filters.prixMin) : "0"} - ${filters.prixMax ? fmtN(filters.prixMax) : "max"}`
    : "Prix";
  const segments = [
    { key: "ville", Icon: FILocationCity, all: "Toutes les villes", options: filterOptions.villes.map((v) => ({ id: v.nom, nom: v.nom })) },
    { key: "type", Icon: Home, all: "Tous les types", options: filterOptions.types.map((t) => ({ id: t.id, nom: t.nom })) },
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
    filters.type && { key: "type", label: optNom(filterOptions.types, filters.type), Icon: Home },
    filters.quartier && { key: "quartier", label: filters.quartier, Icon: FIPlace },
    filters.agence && { key: "agence", label: `Agence: ${optNom(filterOptions.agences, filters.agence)}`, Icon: Business },
    filters.prixMin && { key: "prixMin", label: `Prix > ${fmtN(filters.prixMin)}`, Icon: FIPayments },
    filters.prixMax && { key: "prixMax", label: `Prix < ${fmtN(filters.prixMax)}`, Icon: FIPayments },
    filters.superficieMin && { key: "superficieMin", label: `Sup > ${filters.superficieMin} m²`, Icon: FISquareFoot },
    filters.superficieMax && { key: "superficieMax", label: `Sup < ${filters.superficieMax} m²`, Icon: FISquareFoot },
    filters.chambres && { key: "chambres", label: `${filters.chambres} chambre${Number(filters.chambres) > 1 ? "s" : ""}`, Icon: Bed },
    filters.meuble && { key: "meuble", label: filters.meuble === "true" ? "Meublé" : "Non meublé", Icon: FIChair },
  ].filter(Boolean);
  const rangeFields = (fields, Icon) => (
    <Stack spacing={1.5}>
      {fields.map(({ key, ph }) => (
        <TextField
          key={key}
          size="small"
          type="number"
          placeholder={ph}
          value={filters[key]}
          onChange={(e) => handleFilterChange(key, e.target.value)}
          inputProps={{ "aria-label": ph, title: ph }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Icon fontSize="small" sx={{ color: GREEN }} /></InputAdornment> }}
        />
      ))}
    </Stack>
  );
  const popSx = { borderRadius: 3, mt: 0.5, p: 2, width: 300, maxWidth: "calc(100vw - 32px)", "& .MuiOutlinedInput-root": { borderRadius: "10px" }, "& legend": { display: "none" } };
  const totalDispo = stats?.totalLocations;

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
          backgroundImage: "url(/images/hero-locations.webp)",
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
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.75, py: 0.75, mb: 2, borderRadius: "999px", bgcolor: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)" }}>
            <Home sx={{ fontSize: 18, color: "#fff" }} />
            <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1 }}>Locations au Niger</Typography>
          </Box>
          <Typography
            variant="h1"
            sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(28px, 3.2vw, 48px)", lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff" }}
          >
            Recherche de <Box component="span" sx={{ color: LIME }}>Locations</Box>
          </Typography>
          <Box component="svg" viewBox="0 0 96 14" aria-hidden="true" sx={{ display: "block", width: 96, height: 14, mt: 1, mb: 1.5 }}>
            <path d="M3 9 C 18 2, 32 2, 46 8 S 76 14, 93 5" fill="none" stroke={LIME} strokeWidth="4" strokeLinecap="round" />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: { xs: 16, md: 18 }, color: "#fff", lineHeight: 1.5, maxWidth: 620 }}>
            {typeof totalDispo === "number" ? (
              <>
                Trouvez le logement idéal parmi <Box component="strong" sx={{ color: LIME }}>{totalDispo}</Box> location{totalDispo > 1 ? "s" : ""} disponible{totalDispo > 1 ? "s" : ""}
              </>
            ) : (
              "Trouvez le logement idéal parmi les locations disponibles"
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
              sx={{
                height: 52,
                px: 3,
                borderRadius: "12px",
                bgcolor: GREEN_DEEP,
                color: "#fff",
                fontFamily: FONT,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 15,
                gridColumn: { xs: "auto", sm: "auto" },
                "&:hover": { bgcolor: GREEN_DARK },
              }}
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
            {rangeFields([{ key: "prixMin", ph: "Prix min (FCFA)" }, { key: "prixMax", ph: "Prix max (FCFA)" }], FIPayments)}
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

              <TextField
                size="small"
                type="number"
                placeholder="Nbre de chambres"
                value={filters.chambres}
                onChange={(e) => handleFilterChange("chambres", e.target.value)}
                inputProps={{ min: 0, "aria-label": "Nombre de chambres", title: "Nombre de chambres" }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Bed fontSize="small" sx={{ color: GREEN }} /></InputAdornment> }}
                sx={panelField}
              />

              <FormControl size="small" sx={panelField}>
                <Select
                  value={filters.meuble || ""}
                  onChange={(e) => handleFilterChange("meuble", e.target.value)}
                  displayEmpty
                  inputProps={{ "aria-label": "Meublé", title: "Meublé" }}
                  startAdornment={<InputAdornment position="start"><FIChair fontSize="small" sx={{ color: GREEN }} /></InputAdornment>}
                  renderValue={(selected) =>
                    !selected ? <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>Meublé : tous</span> : selected === "true" ? "Meublé" : "Non meublé"
                  }
                >
                  <MenuItem value=""><em>Tous</em></MenuItem>
                  <MenuItem value="true">Meublé</MenuItem>
                  <MenuItem value="false">Non meublé</MenuItem>
                </Select>
              </FormControl>
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
                  deleteIcon={<CloseIcon sx={{ color: "white !important", fontSize: 16 }} />}
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

        {/* Barre de résultats : compteur + tri */}
        {!loading && !error && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 2.5 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: 17, color: NIGHT }}>
              <Box component="strong" sx={{ color: GREEN, fontWeight: 800 }}>{pagination.total}</Box>{" "}
              location{pagination.total > 1 ? "s" : ""} trouvée{pagination.total > 1 ? "s" : ""}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "center", gap: 1, width: { xs: "100%", sm: "auto" }, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" }, "& legend": { display: "none" } }}>
              <FormControl size="small" sx={{ flex: { xs: "1 1 0", sm: "0 0 190px" }, minWidth: 0 }}>
                <Select
                  value={sortBy}
                  MenuProps={SORT_MENU_PROPS}
                  onChange={(e) => setSortBy(e.target.value)}
                  inputProps={{ "aria-label": "Trier par", title: "Trier par" }}
                  startAdornment={<InputAdornment position="start"><FISort fontSize="small" sx={{ color: GREEN }} /></InputAdornment>}
                >
                  <MenuItem value="createdAt">Date d'ajout</MenuItem>
                  <MenuItem value="prixMensuel">Prix mensuel</MenuItem>
                  <MenuItem value="superficie">Superficie</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: { xs: "1 1 0", sm: "0 0 190px" }, minWidth: 0 }}>
                <Select
                  value={sortOrder}
                  MenuProps={SORT_MENU_PROPS}
                  onChange={(e) => setSortOrder(e.target.value)}
                  inputProps={{ "aria-label": "Ordre", title: "Ordre" }}
                  startAdornment={<InputAdornment position="start"><FISwapVert fontSize="small" sx={{ color: GREEN }} /></InputAdornment>}
                >
                  <MenuItem value="asc">Croissant</MenuItem>
                  <MenuItem value="desc">Décroissant</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {/* Liste des locations */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
            <CircularProgress sx={{ color: GREEN }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 8, px: 2, bgcolor: "#fff", borderRadius: "18px" }}>
            <ErrorOutline sx={{ fontSize: 48, color: "#d32f2f" }} />
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NIGHT, mt: 1 }}>Impossible de charger les locations.</Typography>
            <Typography sx={{ fontFamily: FONT, color: MUTED, mb: 2 }}>Vérifiez votre connexion puis réessayez.</Typography>
            <Button variant="contained" disableElevation onClick={searchLocations} sx={{ bgcolor: GREEN, textTransform: "none", fontWeight: 600, borderRadius: "10px", "&:hover": { bgcolor: GREEN_DEEP } }}>
              Réessayer
            </Button>
          </Box>
        ) : locations.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 2, bgcolor: "#fff", borderRadius: "18px" }}>
            <SearchOff sx={{ fontSize: 48, color: GREEN }} />
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NIGHT, mt: 1 }}>Aucune location trouvée avec ces critères de recherche.</Typography>
            {activeFiltersCount > 0 && (
              <Button onClick={handleClearFilters} sx={{ mt: 1.5, color: GREEN, textTransform: "none", fontWeight: 600 }}>Réinitialiser les filtres</Button>
            )}
          </Box>
        ) : (
          <>
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
              {locations.slice(0, locationsDisplayed).map((location) => {
                const firstImg = location.images && location.images.length > 0 ? location.images[0] : null;
                const photoUrl = firstImg ? fixImageUrl(firstImg.url || firstImg) : null;
                const dispo = location.statut ? String(location.statut) : "";
                const dispoOk = dispo.toLowerCase() === "disponible";
                const localite = [location.quartier, location.ville].filter(Boolean).join(", ");
                const metas = [
                  localite && { key: "loc", Icon: LocationOn, text: localite },
                  location.type && { key: "type", Icon: Home, text: location.type },
                  location.superficie > 0 && { key: "sup", Icon: FISquareFoot, text: `${fmtN(location.superficie)} m²` },
                  location.chambres !== undefined && location.chambres !== null && { key: "ch", Icon: Bed, text: `${location.chambres} chambre${location.chambres > 1 ? "s" : ""}` },
                  location.meuble && { key: "meu", Icon: FIChair, text: "Meublé" },
                ].filter(Boolean);
                return (
                  <Card
                    key={location._id}
                    elevation={0}
                    onClick={() => handleLocationClick(location)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      borderRadius: "18px",
                      overflow: "hidden",
                      bgcolor: "#fff",
                      boxShadow: "0 4px 16px rgba(16,28,54,0.08)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 26px rgba(16,28,54,0.14)" },
                    }}
                  >
                    {/* Photographie (réelle ou image illustrative) */}
                    <Box sx={{ height: 205, position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}>
                      <Box sx={{ position: "absolute", inset: 0, backgroundImage: "url(/images/location-placeholder.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
                      {photoUrl ? (
                        <Box
                          component="img"
                          src={photoUrl}
                          alt={location.titre}
                          onError={(e) => { e.target.style.display = "none"; }}
                          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <Box sx={{ position: "absolute", left: 12, bottom: 10, px: 1, py: 0.25, borderRadius: "6px", bgcolor: "rgba(16,28,54,0.55)", color: "#fff", fontSize: 11, fontFamily: FONT }}>
                          Image illustrative
                        </Box>
                      )}
                      <Box sx={{ position: "absolute", top: 12, left: 12, bgcolor: GREEN, color: "#fff", px: 1.5, py: 0.5, borderRadius: "999px", fontSize: 12, fontWeight: 700, letterSpacing: 0.4, fontFamily: FONT }}>
                        LOCATION
                      </Box>
                      {dispo && (
                        <Box sx={{ position: "absolute", top: 12, right: 12, bgcolor: dispoOk ? "#E3F5EC" : "#fff", color: dispoOk ? GREEN_DEEP : "#B45309", px: 1.5, py: 0.5, borderRadius: "999px", fontSize: 12, fontWeight: 700, fontFamily: FONT, textTransform: "capitalize" }}>
                          {dispo}
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ p: "20px", "&:last-child": { pb: "20px" }, display: "flex", flexDirection: "column", gap: 1.75, flex: 1 }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: 21, fontWeight: 700, color: NIGHT, lineHeight: 1.25, overflowWrap: "anywhere" }}>
                        {location.titre}
                      </Typography>

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {metas.map(({ key, Icon, text }) => (
                          <Box key={key} sx={{ display: "grid", gridTemplateColumns: "20px minmax(0, 1fr)", alignItems: "start", columnGap: 1 }}>
                            <Icon sx={{ fontSize: 19, color: GREEN }} />
                            <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: NIGHT, overflowWrap: "anywhere" }}>{text}</Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Prix + agence */}
                      <Box sx={{ mt: "auto", pt: 1.75, borderTop: "1px solid #E8EDF3", display: "flex", flexWrap: "wrap", columnGap: 2, rowGap: 1.5, alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: MUTED }}>Loyer mensuel</Typography>
                          {location.prixMensuel ? (
                            <Typography sx={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: GREEN_DEEP, lineHeight: 1.2 }}>
                              {fmtN(location.prixMensuel)}{" "}
                              <Box component="span" sx={{ fontSize: 13, fontWeight: 700 }}>FCFA / mois</Box>
                            </Typography>
                          ) : (
                            <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: MUTED }}>Prix sur demande</Typography>
                          )}
                        </Box>
                        {location.agenceId && location.agenceId.nom && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: "1 1 170px", minWidth: 0 }}>
                            <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#E3F5EC", color: GREEN_DEEP, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Business sx={{ fontSize: 21 }} />
                            </Box>
                            <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                              <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: NIGHT, lineHeight: 1.3 }}>{location.agenceId.nom}</Typography>
                              {location.agenceId.telephone && (
                                <Box
                                  component="a"
                                  href={`tel:${String(location.agenceId.telephone).replace(/\s+/g, "")}`}
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: GREEN, textDecoration: "none", fontFamily: FONT, fontSize: 13.5, fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                                >
                                  <Phone sx={{ fontSize: 15 }} />
                                  {location.agenceId.telephone}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        endIcon={<ArrowForward />}
                        sx={{ height: 46, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 600, fontSize: 15.5, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}
                      >
                        Voir le logement
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            {locationsDisplayed < locations.length && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleShowMoreLocations}
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

      {/* Drawer détails location */}
      <LocationDetailDrawer
        open={openLocationsDrawer}
        onClose={handleCloseLocationDetails}
        selectedLocation={selectedLocation}
      />
    </Box>
  );
};

export default SearchLocationsPage;

