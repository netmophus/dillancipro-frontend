import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Button,
  GridLegacy as Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Alert,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Badge,
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  LocationOn,
  Square,
  AttachMoney,
  Home,
  CheckCircle,
  Assignment,
  Person,
  VideoLibrary,
} from "@mui/icons-material";
import { AttachMoney as FIAttachMoney } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AgenceLayout from "../../components/agence/AgenceLayout";
import Star from "@mui/icons-material/Star";
import Whatshot from "@mui/icons-material/Whatshot";
import KingBed from "@mui/icons-material/KingBed";
import Bathtub from "@mui/icons-material/Bathtub";
import Construction from "@mui/icons-material/Construction";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SellIcon from "@mui/icons-material/Sell";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import api from "../../services/api";

const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";
const NIGHT = "#101C36";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const PRIMARY = "#008557";

// Thème local : palette Dillanci, uniquement sur cette page
const mesBiensTheme = createTheme({
  palette: {
    primary: { main: PRIMARY, dark: "#005C48", contrastText: "#ffffff" },
    secondary: { main: "#1859C9" },
    success: { main: PRIMARY },
    warning: { main: "#C26716" },
    info: { main: "#1859C9" },
    error: { main: "#C62828" },
    text: { primary: NIGHT, secondary: MUTED },
  },
  typography: { fontFamily: FONT },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 700, borderRadius: 10 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 14 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

const MesBiensPage = () => {
  const navigate = useNavigate();
  const [biens, setBiens] = useState([]);
  const [filteredBiens, setFilteredBiens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterMinPrix, setFilterMinPrix] = useState("");
  const [filterMaxPrix, setFilterMaxPrix] = useState("");

  // Modal détails
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedBien, setSelectedBien] = useState(null);

  // Modal affectation
  const [affectDialog, setAffectDialog] = useState(false);
  const [bienToAffect, setBienToAffect] = useState(null);
  const [commerciaux, setCommerciaux] = useState([]);
  const [selectedCommercial, setSelectedCommercial] = useState("");

  useEffect(() => {
    fetchBiens();
    fetchCommerciaux();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, filterStatut, filterMinPrix, filterMaxPrix, biens]);

  const fetchBiens = async () => {
    setLoading(true);
    try {
      const res = await api.get("/agence/biens");
      setBiens(res.data);
      setFilteredBiens(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommerciaux = async () => {
    try {
      const res = await api.get("/agence/commerciaux");
      setCommerciaux(res.data || []);
    } catch (err) {
      console.error("Erreur chargement commerciaux:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...biens];

    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(
        (bien) =>
          bien.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bien.localisation?.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bien.localisation?.quartier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (filterType) {
      filtered = filtered.filter((bien) => bien.type === filterType);
    }

    // Filtre par statut
    if (filterStatut) {
      filtered = filtered.filter((bien) => bien.statut === filterStatut);
    }

    // Filtre par prix
    if (filterMinPrix) {
      filtered = filtered.filter((bien) => bien.prix >= parseFloat(filterMinPrix));
    }
    if (filterMaxPrix) {
      filtered = filtered.filter((bien) => bien.prix <= parseFloat(filterMaxPrix));
    }

    setFilteredBiens(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce bien ?")) return;

    try {
      await api.delete(`/agence/biens/${id}`);
      setSuccess("Bien supprimé avec succès");
      fetchBiens();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  const openDetailDialog = async (bien) => {
    try {
      console.log("🔵 [FRONTEND] openDetailDialog appelé avec bien:", bien._id);
      console.log("🔵 [FRONTEND] Données du bien reçues:", {
        situationGeographique: bien.situationGeographique,
        descriptionPhysique: bien.descriptionPhysique,
        atoutsMajeurs: bien.atoutsMajeurs
      });
      
      const res = await api.get(`/agence/biens/${bien._id}`);
      console.log("📋 [FRONTEND] Données du bien chargées depuis API:", res.data);
      console.log("📍 [FRONTEND] situationGeographique:", res.data.situationGeographique, "Type:", typeof res.data.situationGeographique, "Truthy:", !!res.data.situationGeographique);
      console.log("🏗️ [FRONTEND] descriptionPhysique:", res.data.descriptionPhysique, "Type:", typeof res.data.descriptionPhysique, "Truthy:", !!res.data.descriptionPhysique);
      console.log("⭐ [FRONTEND] atoutsMajeurs:", res.data.atoutsMajeurs, "Type:", typeof res.data.atoutsMajeurs, "IsArray:", Array.isArray(res.data.atoutsMajeurs), "Length:", res.data.atoutsMajeurs?.length);
      
      // Forcer la mise à jour avec les données complètes
      const bienData = { ...res.data };
      console.log("✅ [FRONTEND] Données à afficher:", {
        situationGeographique: bienData.situationGeographique,
        descriptionPhysique: bienData.descriptionPhysique,
        atoutsMajeurs: bienData.atoutsMajeurs
      });
      
      setSelectedBien(bienData);
      setDetailDialog(true);
    } catch (err) {
      console.error("❌ [FRONTEND] Erreur lors du chargement:", err);
      setError("Erreur lors du chargement des détails");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setFilterStatut("");
    setFilterMinPrix("");
    setFilterMaxPrix("");
  };

  const openAffectDialog = (bien) => {
    setBienToAffect(bien);
    setSelectedCommercial(bien.affecteeA?._id || "");
    setAffectDialog(true);
  };

  const handleAffectBien = async () => {
    try {
      await api.put(`/agence/biens/${bienToAffect._id}/affecter`, {
        commercialId: selectedCommercial,
      });
      setSuccess("Bien affecté au commercial avec succès");
      setAffectDialog(false);
      fetchBiens();
    } catch (err) {
      setError("Erreur lors de l'affectation");
    }
  };

  // Fonction pour convertir les URLs YouTube/Vimeo en URLs d'embed
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

  const typesLabels = {
    maison: "Maison",
    villa: "Villa",
    duplex: "Duplex",
    appartement: "Appartement",
    jardin: "Jardin",
    terrain: "Terrain",
    autre: "Autre",
  };

  const statutColors = {
    disponible: "success",
    vendu: "primary",
    reserve: "warning",
  };

  const statutLabels = {
    disponible: "Disponible",
    vendu: "Vendu",
    reserve: "Réservé",
  };

  return (
    <AgenceLayout>
      <ThemeProvider theme={mesBiensTheme}>
      <Box sx={{ fontFamily: FONT }}>
        {/* Bandeau de la page */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 2.5,
            p: { xs: "18px 16px", sm: "24px" },
            minHeight: 110,
            bgcolor: "#005C48",
            color: "#fff",
            borderRadius: "14px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0, flex: "1 1 260px" }}>
            <Box sx={{ width: { xs: 48, sm: 60 }, height: { xs: 48, sm: 60 }, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Home sx={{ fontSize: { xs: 26, sm: 32 } }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h1" sx={{ fontFamily: FONT, fontSize: { xs: 22, sm: 30 }, fontWeight: 700, lineHeight: 1.2 }}>
                Mes biens immobiliers
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 15, color: "#CFE9E0", mt: 0.5 }}>
                {`Gérez votre catalogue de biens (${filteredBiens.length} bien${filteredBiens.length > 1 ? "s" : ""})`}
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<Add />}
            onClick={() => navigate("/agence/create-bien")}
            sx={{ height: 44, px: 2.5, bgcolor: "#fff", color: "#005C48", "&:hover": { bgcolor: "#E5F3EC" } }}
          >
            Nouveau bien
          </Button>
        </Box>

        {/* Alertes */}
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          </Fade>
        )}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Statistiques du catalogue */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            { label: "Total biens", value: biens.length, icon: ApartmentIcon, color: "#1859C9" },
            { label: "Disponibles", value: biens.filter((b) => b.statut === "disponible").length, icon: CheckCircle, color: "#008557" },
            { label: "Vendus", value: biens.filter((b) => b.statut === "vendu").length, icon: SellIcon, color: "#101C36" },
            { label: "Valeur catalogue", value: new Intl.NumberFormat("fr-FR").format(biens.reduce((s, b) => s + (b.prix || 0), 0)) + " FCFA", icon: TrendingUpIcon, color: "#C26716" },
          ].map((kpi) => (
            <Grid item xs={6} md={3} key={kpi.label} sx={{ "@media (max-width:374px)": { flexBasis: "100%", maxWidth: "100%" } }}>
              <Card elevation={0} sx={{ height: "100%", borderRadius: "14px", border: `1px solid ${BORDER}`, boxShadow: "0 1px 3px rgba(16,28,54,0.05)" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: { xs: 18, sm: 24 }, fontWeight: 800, color: kpi.color, lineHeight: 1.25, overflowWrap: "break-word" }}>{kpi.value}</Typography>
                    </Box>
                    <Avatar variant="rounded" sx={{ bgcolor: `${kpi.color}1A`, color: kpi.color, width: 44, height: 44, borderRadius: "12px", ml: 1, flexShrink: 0 }}>
                      <kpi.icon />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filtres */}
        <Card elevation={0} sx={{ mb: 3, borderRadius: "14px", border: `1px solid ${BORDER}`, boxShadow: "0 1px 3px rgba(16,28,54,0.05)" }}>
          <CardContent sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#ffffff" }, "& legend": { display: "none" } }}>
            <Box display="flex" alignItems="center" gap={1} mb={2.5}>
              <FilterList color="primary" />
              <Typography variant="h6" fontWeight="bold" sx={{ color: NIGHT }}>
                Filtres
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  inputProps={{ "aria-label": "Recherche", title: "Recherche" }}
                  placeholder="Titre, référence, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6} md={4}>
                <TextField
                  select
                  fullWidth
                  inputProps={{ "aria-label": "Type de bien", title: "Type de bien" }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Tous les types</MenuItem>
                  {Object.keys(typesLabels).map((type) => (
                    <MenuItem key={type} value={type}>
                      {typesLabels[type]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6} md={4}>
                <TextField
                  select
                  fullWidth
                  inputProps={{ "aria-label": "Statut", title: "Statut" }}
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="disponible">Disponible</MenuItem>
                  <MenuItem value="vendu">Vendu</MenuItem>
                  <MenuItem value="reserve">Réservé</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6} md={5}>
                <TextField
                  fullWidth
                  inputProps={{ "aria-label": "Prix min (FCFA)", title: "Prix min (FCFA)" }}
                  placeholder="Prix min (FCFA)"
                  type="number"
                  value={filterMinPrix}
                  onChange={(e) => setFilterMinPrix(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FIAttachMoney color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6} md={5}>
                <TextField
                  fullWidth
                  inputProps={{ "aria-label": "Prix max (FCFA)", title: "Prix max (FCFA)" }}
                  placeholder="Prix max (FCFA)"
                  type="number"
                  value={filterMaxPrix}
                  onChange={(e) => setFilterMaxPrix(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FIAttachMoney color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={resetFilters}
                  startIcon={<RestartAltIcon />}
                  sx={{ height: "100%", minHeight: 56 }}
                >
                  Réinitialiser
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Liste des biens */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : filteredBiens.length === 0 ? (
          <Card elevation={0} sx={{ borderRadius: "14px", border: `1px solid ${BORDER}` }}>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Home sx={{ fontSize: 56, color: "#A8B3C1", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun bien trouvé
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/agence/create-bien")}
                sx={{ mt: 2 }}
              >
                Créer votre premier bien
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredBiens.map((bien) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={bien._id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: "14px",
                    border: `1px solid ${BORDER}`,
                    boxShadow: "0 1px 3px rgba(16,28,54,0.05)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Image */}
                  <Box position="relative">
                    <CardMedia
                      component="img"
                      height="200"
                      image={bien.images?.[0] || "/images/bien-placeholder.webp"}
                      alt={bien.titre}
                    />
                    
                    {/* Badges */}
                    <Box position="absolute" top={8} right={8} display="flex" gap={1}>
                      {bien.featured && (
                        <Chip icon={<Star />} label="Vedette" size="small" color="warning" />
                      )}
                      {bien.urgent && (
                        <Chip icon={<Whatshot />} label="Urgent" size="small" color="error" />
                      )}
                    </Box>

                    {/* Statut */}
                    <Chip
                      label={statutLabels[bien.statut]}
                      size="small"
                      color={statutColors[bien.statut]}
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        ...(bien.statut === "disponible" && { bgcolor: "#008557", color: "white" }),
                      }}
                    />
                  </Box>

                  {/* Contenu */}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip label={typesLabels[bien.type]} size="small" sx={{ mb: 1 }} />
                    
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                      {bien.titre}
                    </Typography>

                    <Stack spacing={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {bien.prix.toLocaleString()} FCFA
                        </Typography>
                      </Box>

                      {bien.superficie && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Square fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {bien.superficie} m²
                          </Typography>
                        </Box>
                      )}

                      {bien.localisation?.ville && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {bien.localisation.ville}
                            {bien.localisation.quartier && `, ${bien.localisation.quartier}`}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Caractéristiques */}
                    {bien.caracteristiques && (
                      <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                        {bien.caracteristiques.nbChambres && (
                          <Chip icon={<KingBed />} label={`${bien.caracteristiques.nbChambres}`} size="small" variant="outlined" />
                        )}
                        {bien.caracteristiques.nbSallesBain && (
                          <Chip icon={<Bathtub />} label={`${bien.caracteristiques.nbSallesBain}`} size="small" variant="outlined" />
                        )}
                      </Stack>
                    )}
                  </CardContent>

                  {/* Commercial affecté */}
                  {bien.affecteeA && (
                    <Box sx={{ px: 2, pb: 1 }}>
                      <Chip
                        icon={<Person />}
                        label={bien.affecteeA.fullName || bien.affecteeA.phone}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  {/* Actions */}
                  <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                    <Tooltip title="Voir détails">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => {
                          console.log("🟢 CLIC SUR VOIR DÉTAILS - Bien ID:", bien._id);
                          openDetailDialog(bien);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Box>
                      <Tooltip title="Affecter à un commercial">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => openAffectDialog(bien)}
                        >
                          <Assignment />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/agence/edit-bien/${bien._id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(bien._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* DIALOG AFFECTATION */}
      <Dialog
        open={affectDialog}
        onClose={() => setAffectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Assignment color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Affecter un commercial
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {bienToAffect && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Bien : <strong>{bienToAffect.titre}</strong>
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <TextField
                select
                label="Sélectionnez un commercial"
                value={selectedCommercial}
                onChange={(e) => setSelectedCommercial(e.target.value)}
                fullWidth
                required
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">
                  <em>-- Aucun (libérer l'affectation) --</em>
                </MenuItem>
                {commerciaux.map((commercial) => (
                  <MenuItem key={commercial._id} value={commercial._id}>
                    {commercial.fullName || "Sans nom"} ({commercial.phone})
                  </MenuItem>
                ))}
              </TextField>

              {bienToAffect.affecteeA && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Commercial actuel : <strong>{bienToAffect.affecteeA.fullName || bienToAffect.affecteeA.phone}</strong>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAffectDialog(false)} variant="outlined">
            Annuler
          </Button>
          <Button
            onClick={handleAffectBien}
            variant="contained"
            startIcon={<CheckCircle />}
            disabled={!selectedCommercial && selectedCommercial !== ""}
          >
            Affecter
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG DÉTAILS */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBien && (
          <>
            <DialogTitle>
              <Typography variant="h5" fontWeight="bold">
                {selectedBien.titre}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip label={typesLabels[selectedBien.type]} color="primary" size="small" />
                <Chip
                  label={statutLabels[selectedBien.statut]}
                  color={statutColors[selectedBien.statut]}
                  size="small"
                />
                {selectedBien.reference && (
                  <Chip label={`Réf: ${selectedBien.reference}`} size="small" variant="outlined" />
                )}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {/* Debug info - à retirer après */}
              {process.env.NODE_ENV === 'development' && (
                <Box sx={{ p: 2, bgcolor: 'info.light', mb: 2, borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight="bold">DEBUG:</Typography>
                  <Typography variant="caption" display="block">situationGeographique: {selectedBien.situationGeographique ? 'Présent' : 'Absent'}</Typography>
                  <Typography variant="caption" display="block">descriptionPhysique: {selectedBien.descriptionPhysique ? 'Présent' : 'Absent'}</Typography>
                  <Typography variant="caption" display="block">atoutsMajeurs: {selectedBien.atoutsMajeurs && Array.isArray(selectedBien.atoutsMajeurs) ? `Présent (${selectedBien.atoutsMajeurs.length})` : 'Absent'}</Typography>
                </Box>
              )}
              <Grid container spacing={3}>
                {/* Images */}
                {selectedBien.images?.length > 0 && (
                  <Grid item xs={12}>
                    <Box display="flex" gap={1} overflow="auto">
                      {selectedBien.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Image ${idx + 1}`}
                          style={{ height: 150, borderRadius: 8 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Vidéos */}
                {selectedBien.videos?.length > 0 && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 1 }}>
                      <VideoLibrary fontSize="small" color="action" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Vidéos
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {selectedBien.videos.map((videoUrl, index) => {
                        const embedUrl = getVideoEmbedUrl(videoUrl);
                        const isYouTube = embedUrl && embedUrl.includes('youtube.com/embed');
                        const isVimeo = embedUrl && embedUrl.includes('vimeo.com/video');
                        
                        return (
                          <Grid item xs={12} md={6} key={index}>
                            {embedUrl && (isYouTube || isVimeo) ? (
                              <Box
                                component="iframe"
                                src={embedUrl}
                                sx={{
                                  width: "100%",
                                  height: 250,
                                  border: "none",
                                  borderRadius: 2,
                                  display: "block",
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 250,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "primary.main",
                                  color: "white",
                                  borderRadius: 2,
                                  p: 2,
                                }}
                              >
                                <VideoLibrary sx={{ fontSize: 40, mb: 2 }} />
                                <Typography variant="body1" fontWeight="bold" mb={1}>
                                  Vidéo {index + 1}
                                </Typography>
                                <Button
                                  variant="contained"
                                  color="inherit"
                                  href={videoUrl}
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
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                )}

                {/* Informations */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prix
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {selectedBien.prix.toLocaleString()} FCFA
                  </Typography>
                </Grid>

                {selectedBien.superficie && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Superficie
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedBien.superficie} m²
                    </Typography>
                  </Grid>
                )}

                {/* Description */}
                {selectedBien.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2">{selectedBien.description}</Typography>
                  </Grid>
                )}

                {/* Situation géographique du terrain - AFFICHAGE FORCÉ */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 0.5 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Situation géographique du terrain
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", bgcolor: selectedBien.situationGeographique ? "success.light" : "error.light", p: 1 }}>
                    {selectedBien.situationGeographique || "Non renseigné"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Debug: {selectedBien.situationGeographique ? "Présent" : "Absent"} | Type: {typeof selectedBien.situationGeographique}
                  </Typography>
                </Grid>

                {/* Description physique - AFFICHAGE FORCÉ */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 0.5 }}>
                    <Construction fontSize="small" color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Description physique
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", bgcolor: selectedBien.descriptionPhysique ? "success.light" : "error.light", p: 1 }}>
                    {selectedBien.descriptionPhysique || "Non renseigné"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Debug: {selectedBien.descriptionPhysique ? "Présent" : "Absent"} | Type: {typeof selectedBien.descriptionPhysique}
                  </Typography>
                </Grid>

                {/* Atouts majeurs - AFFICHAGE FORCÉ */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 0.5 }}>
                    <Star fontSize="small" color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Atouts majeurs
                    </Typography>
                  </Box>
                  {selectedBien.atoutsMajeurs && Array.isArray(selectedBien.atoutsMajeurs) && selectedBien.atoutsMajeurs.length > 0 ? (
                    <Stack spacing={1}>
                      {selectedBien.atoutsMajeurs
                        .filter(atout => atout)
                        .map((atout, index) => (
                          <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{
                              p: 1.5,
                              bgcolor: "success.light",
                              borderRadius: 1,
                              borderLeft: 3,
                              borderColor: "success.main",
                            }}
                          >
                            <CheckCircle fontSize="small" sx={{ color: "#008557" }} />
                            <Typography variant="body2">{String(atout)}</Typography>
                          </Box>
                        ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                      Non renseigné
                    </Typography>
                  )}
                </Grid>

                {/* Localisation */}
                {selectedBien.localisation && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 0.5 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Localisation
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {selectedBien.localisation.adresse && `${selectedBien.localisation.adresse}, `}
                      {selectedBien.localisation.quartier && `${selectedBien.localisation.quartier}, `}
                      {selectedBien.localisation.ville}
                    </Typography>
                  </Grid>
                )}

                {/* Caractéristiques */}
                {selectedBien.caracteristiques && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Caractéristiques
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selectedBien.caracteristiques.nbChambres && (
                        <Chip label={`${selectedBien.caracteristiques.nbChambres} chambres`} />
                      )}
                      {selectedBien.caracteristiques.garage && <Chip label="Garage" sx={{ bgcolor: "#008557", color: "white" }} />}
                      {selectedBien.caracteristiques.piscine && <Chip label="Piscine" sx={{ bgcolor: "#101C36", color: "white" }} />}
                      {selectedBien.caracteristiques.jardin && <Chip label="Jardin" sx={{ bgcolor: "#008557", color: "white" }} />}
                      {selectedBien.caracteristiques.climatisation && (
                        <Chip label="Climatisation" color="primary" />
                      )}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setDetailDialog(false)} variant="outlined">
                Fermer
              </Button>
              <Button
                onClick={() => navigate(`/agence/edit-bien/${selectedBien._id}`)}
                variant="contained"
                startIcon={<Edit />}
              >
                Modifier
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      </ThemeProvider>
    </AgenceLayout>
  );
};

export default MesBiensPage;

