import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  GridLegacy as Grid,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  LocationOn,
  Home,
  AttachMoney,
  CalendarToday,
  Person,
  Phone,
  Email,
  Search,
  FilterList,
  Refresh,
} from "@mui/icons-material";
import { Search as FISearch, Flag as FIFlag, Home as FIHome, LocationCity as FILocationCity } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AgenceLayout from "../../components/agence/AgenceLayout";
import AgencePageHeader from "../../components/agence/AgencePageHeader";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import api from "../../services/api";

const LocationsPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  
  // Filtres et recherche
  const [filters, setFilters] = useState({
    statut: "",
    type: "",
    ville: "",
    prixMin: "",
    prixMax: "",
    search: ""
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });
  
  // Menu contextuel
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Dialog de suppression
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  useEffect(() => {
    fetchLocations();
    fetchStats();
  }, [filters, pagination.current]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await api.get("/agence/locations", { params });
      setLocations(response.data.locations);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("❌ Erreur fetchLocations:", error);
      setError("Erreur lors du chargement des locations");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/agence/locations/stats");
      setStats(response.data);
    } catch (error) {
      console.error("❌ Erreur fetchStats:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleMenuOpen = (event, location) => {
    setAnchorEl(event.currentTarget);
    setSelectedLocation(location);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLocation(null);
  };

  const handleEdit = () => {
    navigate(`/agence/locations/edit/${selectedLocation._id}`);
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/agence/locations/${selectedLocation._id}`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setLocationToDelete(selectedLocation);
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/agence/locations/${locationToDelete._id}`);
      setDeleteDialog(false);
      setLocationToDelete(null);
      fetchLocations();
      fetchStats();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      setError("Erreur lors de la suppression");
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'disponible': return 'success';
      case 'loue': return 'primary';
      case 'indisponible': return 'error';
      case 'en_attente': return 'warning';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'disponible': return 'Disponible';
      case 'loue': return 'Loué';
      case 'indisponible': return 'Indisponible';
      case 'en_attente': return 'En attente';
      default: return statut;
    }
  };

  if (loading && locations.length === 0) {
    return (
      <AgenceLayout>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </AgenceLayout>
    );
  }

  return (
    <AgenceLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* En-tête */}
          <AgencePageHeader
            icon={Home}
            title="Gestion des locations"
            subtitle="Gérez vos offres de location immobilière"
            action={
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/agence/locations/create")}
                sx={{ bgcolor: "white", color: "#0D2B4E", fontWeight: "bold", "&:hover": { bgcolor: "#e3e8ef" } }}
              >
                Nouvelle location
              </Button>
            }
          />

          {/* Statistiques */}
          {stats && (
            <Grid container spacing={2.5} mb={4}>
              {[
                { label: "Total locations", value: stats.totalLocations, icon: Home, color: "#3030F9" },
                { label: "Disponibles", value: stats.locationsDisponibles, icon: CheckCircleIcon, color: "#0A7C4F" },
                { label: "Louées", value: stats.locationsLouees, icon: MeetingRoomIcon, color: "#0e1133" },
                { label: "Prix moyen", value: formatMoney(stats.prixMoyen || 0), icon: AttachMoney, color: "#3030F9" },
              ].map((kpi) => (
                <Grid item xs={6} md={3} key={kpi.label}>
                  <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
                          <Typography variant="h5" fontWeight="bold" sx={{ color: kpi.color }} noWrap>{kpi.value}</Typography>
                        </Box>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${kpi.color}15`, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <kpi.icon />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Filtres et recherche */}
          <Card elevation={0} sx={{ mb: 4, borderRadius: 4, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
            <CardContent sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#ffffff" }, "& legend": { display: "none" } }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    inputProps={{ "aria-label": "Recherche", title: "Recherche" }}
                    placeholder="Rechercher (titre, ville...)"
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FISearch color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    inputProps={{ "aria-label": "Statut", title: "Statut" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FIFlag color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Statut</Typography>
                        </InputAdornment>
                      ),
                    }}
                    value={filters.statut}
                    onChange={(e) => handleFilterChange("statut", e.target.value)}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">Tous les statuts</MenuItem>
                    <MenuItem value="disponible">Disponible</MenuItem>
                    <MenuItem value="loue">Loué</MenuItem>
                    <MenuItem value="indisponible">Indisponible</MenuItem>
                    <MenuItem value="en_attente">En attente</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    inputProps={{ "aria-label": "Type", title: "Type" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FIHome color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Type</Typography>
                        </InputAdornment>
                      ),
                    }}
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">Tous les types</MenuItem>
                    <MenuItem value="Villa">Villa</MenuItem>
                    <MenuItem value="Appartement">Appartement</MenuItem>
                    <MenuItem value="Studio">Studio</MenuItem>
                    <MenuItem value="Maison">Maison</MenuItem>
                    <MenuItem value="Duplex">Duplex</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    inputProps={{ "aria-label": "Ville", title: "Ville" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FILocationCity color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Ville</Typography>
                        </InputAdornment>
                      ),
                    }}
                    value={filters.ville}
                    onChange={(e) => handleFilterChange("ville", e.target.value)}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">Toutes les villes</MenuItem>
                    <MenuItem value="Niamey">Niamey</MenuItem>
                    <MenuItem value="Maradi">Maradi</MenuItem>
                    <MenuItem value="Zinder">Zinder</MenuItem>
                    <MenuItem value="Tahoua">Tahoua</MenuItem>
                    <MenuItem value="Agadez">Agadez</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchLocations}
                    fullWidth
                    sx={{ height: "100%", minHeight: 56, borderRadius: 2 }}
                  >
                    Actualiser
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Liste des locations */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {locations.length === 0 ? (
            <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
              <CardContent sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucune location trouvée
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Commencez par créer votre première location
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/agence/locations/create")}
                >
                  Créer une location
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {locations.map((location) => (
                <Grid item xs={12} sm={6} md={4} key={location._id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      overflow: "hidden",
                      border: "1px solid rgba(15,23,42,0.08)",
                      boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={location.images?.[0]?.url || "/api/placeholder/400/200"}
                      alt={location.titre}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                          {location.titre}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, location)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {location.description?.substring(0, 100)}...
                      </Typography>

                      <Stack spacing={1} mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2">
                            {location.ville}, {location.quartier}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Home fontSize="small" color="action" />
                          <Typography variant="body2">
                            {location.superficie} m² • {location.chambres} chambre{location.chambres > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {formatMoney(location.prixMensuel)}/mois
                        </Typography>
                        <Chip
                          label={getStatutLabel(location.statut)}
                          color={getStatutColor(location.statut)}
                          size="small"
                          sx={location.statut === "disponible" ? { bgcolor: "#0A7C4F", color: "white" } : undefined}
                        />
                      </Box>

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/agence/locations/${location._id}`)}
                      >
                        Voir les détails
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Stack direction="row" spacing={1}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.current ? "contained" : "outlined"}
                    onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                  >
                    {page}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}
        </Box>

        {/* Menu contextuel */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleView}>
            <Visibility sx={{ mr: 1 }} />
            Voir
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} />
            Modifier
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
            <Delete sx={{ mr: 1 }} />
            Supprimer
          </MenuItem>
        </Menu>

        {/* Dialog de suppression */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer la location "{locationToDelete?.titre}" ?
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Annuler</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AgenceLayout>
  );
};

export default LocationsPage;
