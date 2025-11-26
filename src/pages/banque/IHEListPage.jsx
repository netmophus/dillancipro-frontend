import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  InputAdornment,
  Container,
  Avatar,
  Tooltip,
  Badge,
  Divider,
} from "@mui/material";
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  FilterList,
  Map,
  Share,
  Home,
  LocationOn,
  AttachMoney,
  CalendarToday,
  Nature,
  Business,
  Warehouse,
  Square,
  Apartment,
  Villa,
  Clear,
  Warning,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const IHEListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ihes, setIhes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: searchParams.get("statut") || "",
    type: "",
    search: "",
  });
  const [selectedIHE, setSelectedIHE] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectMotif, setRejectMotif] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchIHEs();
  }, [filters]);

  const fetchIHEs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.statut) params.append("statut", filters.statut);
      if (filters.type) params.append("type", filters.type);
      if (filters.search) params.append("search", filters.search);

      const response = await api.get(`/banque/ihe?${params.toString()}`);
      setIhes(response.data.ihes || []);
    } catch (err) {
      console.error("Erreur chargement IHE:", err);
      setError("Erreur lors du chargement des IHE");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ statut: "", type: "", search: "" });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/banque/ihe/${selectedIHE._id}`);
      setSuccess("IHE supprimée avec succès");
      setDeleteDialogOpen(false);
      setSelectedIHE(null);
      fetchIHEs();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleValidate = async () => {
    try {
      await api.post(`/banque/ihe/${selectedIHE._id}/valider`);
      setSuccess("IHE validée avec succès");
      setValidateDialogOpen(false);
      setSelectedIHE(null);
      fetchIHEs();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la validation");
    }
  };

  const handleReject = async () => {
    if (!rejectMotif.trim()) {
      setError("Veuillez indiquer le motif de rejet");
      return;
    }
    try {
      await api.post(`/banque/ihe/${selectedIHE._id}/rejeter`, {
        motifRejet: rejectMotif,
      });
      setSuccess("IHE rejetée");
      setRejectDialogOpen(false);
      setSelectedIHE(null);
      setRejectMotif("");
      fetchIHEs();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du rejet");
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const STATUT_COLORS = {
    en_attente_validation: "warning",
    a_corriger: "error",
    valide: "success",
    rejete: "error",
    en_vente: "info",
    vendu: "success",
    en_location: "primary",
    loue: "success",
  };

  const STATUT_LABELS = {
    en_attente_validation: "En attente",
    a_corriger: "À corriger",
    valide: "Validée",
    rejete: "Rejetée",
    en_vente: "En vente",
    vendu: "Vendue",
    en_location: "En location",
    loue: "Louée",
  };

  const TYPE_ICONS = {
    terrain: Square,
    jardin: Nature,
    maison: Home,
    appartement: Apartment,
    villa: Villa,
    bureau: Business,
    entrepot: Warehouse,
    autre: Home,
  };

  const TYPE_COLORS = {
    terrain: "#795548",
    jardin: "#4caf50",
    maison: "#2196f3",
    appartement: "#f44336",
    villa: "#9c27b0",
    bureau: "#00bcd4",
    entrepot: "#ff9800",
    autre: "#607d8b",
  };

  const TYPES = [
    { value: "", label: "Tous les types" },
    { value: "terrain", label: "Terrain" },
    { value: "jardin", label: "Jardin" },
    { value: "maison", label: "Maison" },
    { value: "appartement", label: "Appartement" },
    { value: "villa", label: "Villa" },
    { value: "bureau", label: "Bureau" },
    { value: "entrepot", label: "Entrepôt" },
    { value: "autre", label: "Autre" },
  ];

  const STATUTS = [
    { value: "", label: "Tous les statuts" },
    { value: "en_attente_validation", label: "En attente" },
    { value: "a_corriger", label: "À corriger" },
    { value: "valide", label: "Validée" },
    { value: "rejete", label: "Rejetée" },
    { value: "en_vente", label: "En vente" },
    { value: "vendu", label: "Vendue" },
  ];

  const hasActiveFilters = filters.statut || filters.type || filters.search;

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* En-tête moderne */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📋 Liste des IHE
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Gérez votre portefeuille d'Immobilisations Hors Exploitation
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Badge badgeContent={ihes.length} color="primary">
              <Chip
                icon={<Home />}
                label={`${ihes.length} IHE${ihes.length > 1 ? "s" : ""}`}
                color="primary"
                variant="outlined"
              />
            </Badge>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<Warning />}
                onClick={() => navigate("/banque/ihe/alertes-reglementaires")}
                sx={{ fontWeight: "bold" }}
              >
                Alertes réglementaires
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/banque/ihe/nouvelle")}
                sx={{ fontWeight: "bold" }}
              >
                Nouvelle IHE
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* Filtres modernes */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FilterList color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Filtres
              </Typography>
              {hasActiveFilters && (
                <Button
                  size="small"
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  sx={{ ml: "auto" }}
                >
                  Réinitialiser
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Rechercher"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Titre, référence, description..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  value={filters.statut}
                  onChange={(e) => handleFilterChange("statut", e.target.value)}
                >
                  {STATUTS.map((statut) => (
                    <MenuItem key={statut.value} value={statut.value}>
                      {statut.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Type"
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                >
                  {TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Liste en cartes */}
        {loading ? (
          <Box sx={{ width: "100%", mt: 4 }}>
            <LinearProgress />
            <Typography align="center" sx={{ mt: 2 }}>
              Chargement...
            </Typography>
          </Box>
        ) : ihes.length === 0 ? (
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Home sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Aucune IHE trouvée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {hasActiveFilters
                  ? "Aucune IHE ne correspond à vos critères de recherche"
                  : "Commencez par créer votre première Immobilisation Hors Exploitation"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/banque/ihe/nouvelle")}
                size="large"
              >
                Créer votre première IHE
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {ihes.map((ihe) => {
              const TypeIcon = TYPE_ICONS[ihe.type] || Home;
              const typeColor = TYPE_COLORS[ihe.type] || "#607d8b";
              
              return (
                <Grid item xs={12} sm={6} md={4} key={ihe._id}>
                  <Card
                    elevation={3}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s ease",
                      borderTop: `4px solid ${typeColor}`,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* En-tête de la carte */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              bgcolor: `${typeColor}20`,
                              color: typeColor,
                              width: 40,
                              height: 40,
                            }}
                          >
                            <TypeIcon />
                          </Avatar>
                          <Box>
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase">
                                {ihe.reference}
                              </Typography>
                              {ihe.partageAvecAgences && ihe.partageAvecAgences.length > 0 && (
                                <Tooltip 
                                  title={
                                    <Box>
                                      <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                                        Partagée avec {ihe.partageAvecAgences.length} agence(s):
                                      </Typography>
                                      {ihe.partageAvecAgences.map((partage, idx) => (
                                        <Typography key={idx} variant="caption" display="block">
                                          • {partage.agenceId?.nom || "Agence inconnue"}
                                          {partage.statut === "accepte" && " ✓"}
                                          {partage.statut === "refuse" && " ✗"}
                                        </Typography>
                                      ))}
                                    </Box>
                                  }
                                  arrow
                                >
                                  <Chip
                                    icon={<Share sx={{ fontSize: "0.75rem !important" }} />}
                                    label={
                                      ihe.partageAvecAgences.length === 1
                                        ? ihe.partageAvecAgences[0].agenceId?.nom || "1 agence"
                                        : `${ihe.partageAvecAgences.length} agences`
                                    }
                                    size="small"
                                    color="success"
                                    sx={{ 
                                      height: 20,
                                      fontSize: "0.65rem",
                                      maxWidth: "200px",
                                      "& .MuiChip-label": {
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                      },
                                      "& .MuiChip-icon": {
                                        fontSize: "0.75rem"
                                      }
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                            <Chip
                              label={STATUT_LABELS[ihe.statut] || ihe.statut}
                              color={STATUT_COLORS[ihe.statut] || "default"}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      {/* Titre */}
                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                        {ihe.titre}
                      </Typography>

                      {/* Informations */}
                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {ihe.localisation?.ville || "N/A"}
                            {ihe.localisation?.quartier && `, ${ihe.localisation.quartier}`}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoney fontSize="small" color="primary" />
                          <Typography variant="body1" fontWeight="bold" color="primary">
                            {formatMoney(ihe.valeurComptable)}
                          </Typography>
                        </Box>
                        {ihe.superficie && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Home fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {ihe.superficie} {ihe.uniteSuperficie || "m²"}
                            </Typography>
                          </Box>
                        )}
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(ihe.createdAt)}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Motif de rejet si IHE à corriger */}
                      {ihe.statut === "a_corriger" && ihe.motifRejet && (
                        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                          <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                            Motif de rejet :
                          </Typography>
                          <Typography variant="body2">{ihe.motifRejet}</Typography>
                          {ihe.rejeteLe && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                              Rejetée le {formatDate(ihe.rejeteLe)}
                            </Typography>
                          )}
                        </Alert>
                      )}

                      {/* Actions */}
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        <Tooltip title="Voir détails">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/banque/ihe/${ihe._id}`)}
                            sx={{ border: "1px solid", borderColor: "divider" }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {(ihe.statut === "en_attente_validation" || ihe.statut === "a_corriger") && (
                          <>
                            <Tooltip title="Valider">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setSelectedIHE(ihe);
                                  setValidateDialogOpen(true);
                                }}
                                sx={{ border: "1px solid", borderColor: "divider" }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {ihe.statut === "en_attente_validation" && (
                              <Tooltip title="Rejeter">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedIHE(ihe);
                                    setRejectDialogOpen(true);
                                  }}
                                  sx={{ border: "1px solid", borderColor: "divider" }}
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {ihe.statut === "a_corriger" && (
                              <Tooltip title="Modifier pour corriger">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => navigate(`/banque/ihe/${ihe._id}/modifier`)}
                                  sx={{ border: "1px solid", borderColor: "divider" }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        )}
                        {ihe.statut === "valide" && (
                          <Tooltip 
                            title={
                              ihe.partageAvecAgences && ihe.partageAvecAgences.length > 0 ? (
                                <Box>
                                  <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                                    Partagée avec {ihe.partageAvecAgences.length} agence(s):
                                  </Typography>
                                  {ihe.partageAvecAgences.map((partage, idx) => (
                                    <Typography key={idx} variant="caption" display="block">
                                      • {partage.agenceId?.nom || "Agence inconnue"}
                                      {partage.statut === "accepte" && " ✓"}
                                      {partage.statut === "refuse" && " ✗"}
                                    </Typography>
                                  ))}
                                </Box>
                              ) : (
                                "Partager avec agence"
                              )
                            }
                            arrow
                          >
                            <Badge
                              badgeContent={
                                ihe.partageAvecAgences && ihe.partageAvecAgences.length > 0
                                  ? ihe.partageAvecAgences.length
                                  : 0
                              }
                              color="success"
                              invisible={!ihe.partageAvecAgences || ihe.partageAvecAgences.length === 0}
                            >
                              <IconButton
                                size="small"
                                color={ihe.partageAvecAgences && ihe.partageAvecAgences.length > 0 ? "success" : "info"}
                                onClick={() => navigate(`/banque/ihe/${ihe._id}/partager`)}
                                sx={{ 
                                  border: "1px solid", 
                                  borderColor: ihe.partageAvecAgences && ihe.partageAvecAgences.length > 0 ? "success.main" : "divider",
                                  bgcolor: ihe.partageAvecAgences && ihe.partageAvecAgences.length > 0 ? "success.50" : "transparent"
                                }}
                              >
                                <Share fontSize="small" />
                              </IconButton>
                            </Badge>
                          </Tooltip>
                        )}
                        {ihe.statut !== "valide" && ihe.statut !== "vendu" && (
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedIHE(ihe);
                                setDeleteDialogOpen(true);
                              }}
                              sx={{ border: "1px solid", borderColor: "divider" }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Dialog Suppression */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer l'IHE <strong>{selectedIHE?.reference}</strong> ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Validation */}
        <Dialog open={validateDialogOpen} onClose={() => setValidateDialogOpen(false)}>
          <DialogTitle>Valider l'IHE</DialogTitle>
          <DialogContent>
            <Typography>
              Valider l'IHE <strong>{selectedIHE?.reference}</strong> ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setValidateDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleValidate} color="success" variant="contained" startIcon={<CheckCircle />}>
              Valider
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Rejet */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth>
          <DialogTitle>Rejeter l'IHE</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Rejeter l'IHE <strong>{selectedIHE?.reference}</strong> ?
            </Typography>
            <TextField
              fullWidth
              label="Motif du rejet *"
              multiline
              rows={4}
              value={rejectMotif}
              onChange={(e) => setRejectMotif(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Indiquez la raison du rejet..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleReject} color="error" variant="contained" startIcon={<Cancel />}>
              Rejeter
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageLayout>
  );
};

export default IHEListPage;
