import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
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
  ErrorOutline,
  SearchOff,
  LandscapeOutlined,
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
  const [error, setError] = useState(false);
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
      setError(false);
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
    } catch (err) {
      console.error("Erreur recherche parcelles:", err);
      setError(true);
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

  const GREEN = "#008557";
  const GREEN_DEEP = "#005C48";
  const GREEN_DARK = "#004D40";
  const LIME = "#84CC16";
  const NIGHT = "#101C36";
  const MUTED = "#475569";
  const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";
  const fmt = (n) => Number(n).toLocaleString("fr-FR").replace(/[  ]/g, " ");

  const quartierOptions = filterOptions.quartiers.filter((q) => !filters.ville || q.ville === filters.ville);
  const citeOptions = filterOptions.cites.filter(
    (c) => (!filters.ville || c.ville === filters.ville) && (!filters.quartier || c.quartier === filters.quartier)
  );
  const prixLabel =
    filters.prixMin || filters.prixMax
      ? `Prix : ${filters.prixMin ? fmt(filters.prixMin) : "0"} - ${filters.prixMax ? fmt(filters.prixMax) : "max"}`
      : "Prix";
  const superficieLabel =
    filters.superficieMin || filters.superficieMax
      ? `${filters.superficieMin ? fmt(filters.superficieMin) : "0"} - ${filters.superficieMax ? fmt(filters.superficieMax) : "max"} m²`
      : "Superficie";
  const segments = [
    { key: "ville", Icon: FILocationCity, label: filters.ville || "Toutes les villes", options: filterOptions.villes.map((v) => v.nom), all: "Toutes les villes" },
    { key: "quartier", Icon: FIPlace, label: filters.quartier || "Tous les quartiers", options: quartierOptions.map((q) => q.nom), all: "Tous les quartiers" },
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
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "&:hover": { borderColor: GREEN },
    "&:focus-visible": { outline: `2px solid ${GREEN}`, outlineOffset: 2 },
  };
  const panelField = { flex: "1 1 200px", minWidth: { xs: "100%", sm: 180 } };
  const chips = [
    filters.ville && { key: "ville", label: filters.ville, Icon: FILocationCity },
    filters.quartier && { key: "quartier", label: filters.quartier, Icon: FIPlace },
    filters.cite && { key: "cite", label: filters.cite, Icon: Map },
    filters.agence && { key: "agence", label: `Agence: ${filterOptions.agences.find((a) => a.id === filters.agence)?.nom || filters.agence}`, Icon: Business },
    filters.prixMin && { key: "prixMin", label: `Prix > ${fmt(filters.prixMin)}`, Icon: FIPayments },
    filters.prixMax && { key: "prixMax", label: `Prix < ${fmt(filters.prixMax)}`, Icon: FIPayments },
    filters.superficieMin && { key: "superficieMin", label: `Sup > ${filters.superficieMin} m²`, Icon: FISquareFoot },
    filters.superficieMax && { key: "superficieMax", label: `Sup < ${filters.superficieMax} m²`, Icon: FISquareFoot },
  ].filter(Boolean);

  const closeSeg = () => setSegMenu({ key: null, el: null });
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
          backgroundImage: "url(/images/hero-parcelles.webp)",
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
        {/* Courbes décoratives (SVG) */}
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
            <LandscapeOutlined sx={{ fontSize: 18, color: "#fff" }} />
            <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1 }}>Parcelles au Niger</Typography>
          </Box>
          <Typography
            variant="h1"
            sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(28px, 3.2vw, 48px)", lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff" }}
          >
            Recherche de <Box component="span" sx={{ color: LIME }}>Parcelles</Box>
          </Typography>
          <Box component="svg" viewBox="0 0 96 14" aria-hidden="true" sx={{ display: "block", width: 96, height: 14, mt: 1, mb: 1.5 }}>
            <path d="M3 9 C 18 2, 32 2, 46 8 S 76 14, 93 5" fill="none" stroke={LIME} strokeWidth="4" strokeLinecap="round" />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: { xs: 16, md: 18 }, color: "#fff", lineHeight: 1.5, maxWidth: 560 }}>
            Trouvez la parcelle idéale parmi les annonces disponibles.
          </Typography>
          {stats?.totalParcelles > 0 && (
            <Typography sx={{ fontFamily: FONT, mt: 1, fontSize: 14.5, color: "#E2E8E5" }}>
              <Box component="strong" sx={{ color: LIME }}>{stats.totalParcelles}</Box> parcelle{stats.totalParcelles > 1 ? "s" : ""} disponible{stats.totalParcelles > 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ boxSizing: "border-box", width: "100%", maxWidth: 1440, mx: "auto", px: { xs: 2, sm: 3, md: 5 }, pb: 6 }}>
        {/* Barre de recherche, à cheval sur la bannière */}
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
              // Disposition adaptative : 1 colonne, 2 colonnes, 3 colonnes (Filtres sur 2), puis une seule ligne
              "@media (min-width:768px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
              "@media (min-width:1280px)": { gridTemplateColumns: "repeat(4, minmax(0, 1fr)) auto" },
              alignItems: "center",
            }}
          >
            {segments.map(({ key, Icon, label, all }) => (
              <Box key={key} component="button" type="button" aria-label={all} title={all} onClick={(e) => setSegMenu({ key, el: e.currentTarget })} sx={segSx}>
                <Icon sx={{ color: GREEN }} />
                <Typography noWrap sx={{ flex: 1, fontFamily: FONT, fontSize: 15, color: filters[key] ? NIGHT : MUTED, fontWeight: filters[key] ? 600 : 500 }}>{label}</Typography>
                <FIExpandMore sx={{ color: MUTED }} />
              </Box>
            ))}
            <Box component="button" type="button" aria-label="Superficie" title="Superficie" onClick={(e) => setSegMenu({ key: "superficie", el: e.currentTarget })} sx={segSx}>
              <FISquareFoot sx={{ color: GREEN }} />
              <Typography noWrap sx={{ flex: 1, fontFamily: FONT, fontSize: 15, color: filters.superficieMin || filters.superficieMax ? NIGHT : MUTED, fontWeight: filters.superficieMin || filters.superficieMax ? 600 : 500 }}>{superficieLabel}</Typography>
              <FIExpandMore sx={{ color: MUTED }} />
            </Box>
            <Box component="button" type="button" aria-label="Prix" title="Prix" onClick={(e) => setSegMenu({ key: "prix", el: e.currentTarget })} sx={segSx}>
              <FIPayments sx={{ color: GREEN }} />
              <Typography noWrap sx={{ flex: 1, fontFamily: FONT, fontSize: 15, color: filters.prixMin || filters.prixMax ? NIGHT : MUTED, fontWeight: filters.prixMin || filters.prixMax ? 600 : 500 }}>{prixLabel}</Typography>
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
                gridColumn: { xs: "auto", sm: "1 / -1" },
                "@media (min-width:768px)": { gridColumn: "span 2" },
                "@media (min-width:1280px)": { gridColumn: "auto" },
                "&:hover": { bgcolor: GREEN_DARK },
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
              onClose={closeSeg}
              slotProps={{ paper: { sx: { borderRadius: 3, mt: 0.5, minWidth: 220, maxHeight: 360 } } }}
            >
              <MenuItem selected={!filters[key]} onClick={() => { handleFilterChange(key, ""); closeSeg(); }}>
                <em>{all}</em>
              </MenuItem>
              {options.map((nom) => (
                <MenuItem key={nom} selected={filters[key] === nom} onClick={() => { handleFilterChange(key, nom); closeSeg(); }}>
                  {nom}
                </MenuItem>
              ))}
            </Menu>
          ))}
          <Popover
            anchorEl={segMenu.el}
            open={segMenu.key === "prix" && Boolean(segMenu.el)}
            onClose={closeSeg}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            slotProps={{ paper: { sx: { borderRadius: 3, mt: 0.5, p: 2, width: 300, maxWidth: "calc(100vw - 32px)", "& .MuiOutlinedInput-root": { borderRadius: "10px" }, "& legend": { display: "none" } } } }}
          >
            {rangeFields([{ key: "prixMin", ph: "Prix min (FCFA)" }, { key: "prixMax", ph: "Prix max (FCFA)" }], FIPayments)}
          </Popover>
          <Popover
            anchorEl={segMenu.el}
            open={segMenu.key === "superficie" && Boolean(segMenu.el)}
            onClose={closeSeg}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            slotProps={{ paper: { sx: { borderRadius: 3, mt: 0.5, p: 2, width: 300, maxWidth: "calc(100vw - 32px)", "& .MuiOutlinedInput-root": { borderRadius: "10px" }, "& legend": { display: "none" } } } }}
          >
            {rangeFields([{ key: "superficieMin", ph: "Superficie min (m²)" }, { key: "superficieMax", ph: "Superficie max (m²)" }], FISquareFoot)}
          </Popover>

          {/* Panneau avancé : cité et agence */}
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
                  value={filters.cite || ""}
                  onChange={(e) => handleFilterChange("cite", e.target.value)}
                  displayEmpty
                  inputProps={{ "aria-label": "Citée/Zone", title: "Citée/Zone" }}
                  startAdornment={<InputAdornment position="start"><Map fontSize="small" sx={{ color: GREEN }} /></InputAdornment>}
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
                  startAdornment={<InputAdornment position="start"><Business fontSize="small" sx={{ color: GREEN }} /></InputAdornment>}
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
              parcelle{pagination.total > 1 ? "s" : ""} trouvée{pagination.total > 1 ? "s" : ""}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, width: { xs: "100%", sm: "auto" }, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" }, "& legend": { display: "none" } }}>
              <FormControl size="small" sx={{ flex: { xs: "1 1 140px", sm: "0 0 170px" }, minWidth: 0 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  inputProps={{ "aria-label": "Trier par", title: "Trier par" }}
                  startAdornment={<InputAdornment position="start"><FISort fontSize="small" sx={{ color: GREEN }} /></InputAdornment>}
                >
                  <MenuItem value="createdAt">Date d'ajout</MenuItem>
                  <MenuItem value="prix">Prix</MenuItem>
                  <MenuItem value="superficie">Superficie</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: { xs: "1 1 140px", sm: "0 0 168px" }, minWidth: 0 }}>
                <Select
                  value={sortOrder}
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

        {/* Liste des parcelles */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
            <CircularProgress sx={{ color: GREEN }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 8, px: 2, bgcolor: "#fff", borderRadius: "18px" }}>
            <ErrorOutline sx={{ fontSize: 48, color: "#d32f2f" }} />
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NIGHT, mt: 1 }}>Impossible de charger les parcelles.</Typography>
            <Typography sx={{ fontFamily: FONT, color: MUTED, mb: 2 }}>Vérifiez votre connexion puis réessayez.</Typography>
            <Button variant="contained" disableElevation onClick={searchParcelles} sx={{ bgcolor: GREEN, textTransform: "none", fontWeight: 600, borderRadius: "10px", "&:hover": { bgcolor: GREEN_DEEP } }}>
              Réessayer
            </Button>
          </Box>
        ) : parcelles.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 2, bgcolor: "#fff", borderRadius: "18px" }}>
            <SearchOff sx={{ fontSize: 48, color: GREEN }} />
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NIGHT, mt: 1 }}>Aucune parcelle trouvée avec ces critères de recherche.</Typography>
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
              {parcelles.slice(0, parcellesDisplayed).map((parcelle) => {
                const statut = STATUTS_PARCELLE[parcelle.statut];
                const aVendre = parcelle.statut === "avendre";
                const hasPhoto = parcelle.images && parcelle.images.length > 0;
                return (
                  <Card
                    key={parcelle._id}
                    elevation={0}
                    onClick={() => handleParcelleClick(parcelle)}
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
                    <Box
                      sx={{
                        height: 205,
                        position: "relative",
                        overflow: "hidden",
                        background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
                      }}
                    >
                      {hasPhoto ? (
                        <Box component="img" src={parcelle.images[0]} alt={`Parcelle ${parcelle.numeroParcelle}`} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <>
                          <Box
                            sx={{ position: "absolute", inset: 0, backgroundImage: "url(/images/parcelle-placeholder.webp)", backgroundSize: "cover", backgroundPosition: "center" }}
                          />
                          <Box sx={{ position: "absolute", left: 12, bottom: 10, px: 1, py: 0.25, borderRadius: "6px", bgcolor: "rgba(16,28,54,0.55)", color: "#fff", fontSize: 11, fontFamily: FONT }}>
                            Image illustrative
                          </Box>
                        </>
                      )}
                      <Box sx={{ position: "absolute", top: 12, left: 12, bgcolor: GREEN, color: "#fff", px: 1.5, py: 0.5, borderRadius: "999px", fontSize: 12, fontWeight: 700, letterSpacing: 0.4, fontFamily: FONT }}>
                        PARCELLE
                      </Box>
                      {statut && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            bgcolor: aVendre ? "#E3F5EC" : "#fff",
                            color: aVendre ? GREEN_DEEP : statut.color,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "999px",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: FONT,
                          }}
                        >
                          {statut.label}
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ p: "20px", "&:last-child": { pb: "20px" }, display: "flex", flexDirection: "column", gap: 1.75, flex: 1 }}>
                      {/* Titre + superficie */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 21, fontWeight: 700, color: NIGHT, lineHeight: 1.25 }}>
                          Parcelle {parcelle.numeroParcelle}
                        </Typography>
                        {parcelle.superficie > 0 && (
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "#E3F5EC", color: GREEN_DEEP, fontSize: 13.5, fontWeight: 700, px: 1.25, py: 0.5, borderRadius: "999px", fontFamily: FONT }}>
                            <FISquareFoot sx={{ fontSize: 16 }} />
                            {fmt(parcelle.superficie)} m²
                          </Box>
                        )}
                      </Box>

                      {/* Lotissement / îlot / localité */}
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {[
                          { key: "lot", icon: FIDashboard, label: "Lotissement", value: parcelle.ilot?.lotissement?.nom },
                          { key: "ilot", icon: FIGridOn, label: "Îlot", value: parcelle.ilot?.numeroIlot },
                          { key: "loc", icon: LocationOn, label: "Localité", value: parcelle.ilot?.zone?.quartier?.ville ? getLocationString(parcelle) : null },
                        ]
                          .filter((l) => l.value)
                          .map((l) => (
                            <Box key={l.key} sx={{ display: "grid", gridTemplateColumns: "20px 86px minmax(0, 1fr)", alignItems: "start", columnGap: 1 }}>
                              <l.icon sx={{ fontSize: 19, color: GREEN }} />
                              <Typography sx={{ fontFamily: FONT, fontSize: 13.5, color: MUTED }}>{l.label}</Typography>
                              <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: NIGHT, wordBreak: "break-word" }}>{l.value}</Typography>
                            </Box>
                          ))}
                      </Box>

                      {/* Prix + agence */}
                      <Box
                        sx={{
                          mt: "auto",
                          pt: 1.75,
                          borderTop: "1px solid #E8EDF3",
                          display: "flex",
                          flexWrap: "wrap",
                          columnGap: 2,
                          rowGap: 1.5,
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: MUTED }}>Prix</Typography>
                          {parcelle.prix > 0 ? (
                            <Typography sx={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: GREEN_DEEP, lineHeight: 1.2 }}>
                              {fmt(parcelle.prix)}{" "}
                              <Box component="span" sx={{ fontSize: 13, fontWeight: 700 }}>FCFA</Box>
                            </Typography>
                          ) : (
                            <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: MUTED }}>Prix sur demande</Typography>
                          )}
                        </Box>
                        {parcelle.agenceId && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: "1 1 170px", minWidth: 0 }}>
                            <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#E3F5EC", color: GREEN_DEEP, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Business sx={{ fontSize: 21 }} />
                            </Box>
                            <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                              <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: NIGHT, lineHeight: 1.3 }}>
                                {parcelle.agenceId.nom}
                              </Typography>
                              {parcelle.agenceId.telephone && (
                                <Box
                                  component="a"
                                  href={`tel:${String(parcelle.agenceId.telephone).replace(/\s+/g, "")}`}
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: GREEN, textDecoration: "none", fontFamily: FONT, fontSize: 13.5, fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                                >
                                  <Phone sx={{ fontSize: 15 }} />
                                  {parcelle.agenceId.telephone}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Le clic remonte à la carte : handleParcelleClick n'est appelé qu'une fois */}
                      <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        endIcon={<ArrowForward />}
                        sx={{ height: 46, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 600, fontSize: 15.5, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}
                      >
                        Voir la parcelle
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            {/* Bouton "Afficher la suite" */}
            {parcellesDisplayed < parcelles.length && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleShowMoreParcelles}
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

