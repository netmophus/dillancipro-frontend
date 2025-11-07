import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Home,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  LocationOn,
  AttachMoney,
  Bed,
  SquareFoot,
  CheckCircle,
  Cancel,
  Refresh,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import PageLayout from "../../components/shared/PageLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AdminLocationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

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
    return `http://localhost:5000/${correctedPath}`;
  };
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/agence/locations");
      console.log("📋 [ADMIN_LOCATIONS] Réponse API:", response.data);
      // L'API retourne { locations, pagination }
      setLocations(response.data.locations || response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des locations:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des locations",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette location ?")) {
      try {
        await api.delete(`/agence/locations/${locationId}`);
        setLocations(locations.filter((loc) => loc._id !== locationId));
        setSnackbar({
          open: true,
          message: "Location supprimée avec succès",
          severity: "success",
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        setSnackbar({
          open: true,
          message: "Erreur lors de la suppression",
          severity: "error",
        });
      }
    }
  };

  const handleViewLocation = (location) => {
    setSelectedLocation(location);
    setOpenDialog(true);
  };

  const filteredLocations = locations.filter((location) => {
    const matchesSearch = location.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.ville.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || location.typeBien === filterType;
    const matchesStatus = filterStatus === "all" || location.statut === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "disponible": return "success";
      case "loue": return "error";
      case "maintenance": return "warning";
      default: return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "disponible": return "Disponible";
      case "loue": return "Loué";
      case "maintenance": return "Maintenance";
      default: return status;
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Card
          elevation={3}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #ff5722 0%, #ff7043 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    border: "4px solid white",
                    bgcolor: "white",
                    color: "primary.main",
                  }}
                >
                  <Home fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    🏠 Gestion des Locations
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Gérez toutes les offres de location de la plateforme
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/admin/locations/create")}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                Nouvelle Location
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <Grid container spacing={3} mb={4}>
          {[
            { label: "Total Locations", value: locations.length, color: "#ff5722", icon: Home },
            { label: "Disponibles", value: locations.filter(l => l.statut === "disponible").length, color: "#4caf50", icon: CheckCircle },
            { label: "Louées", value: locations.filter(l => l.statut === "loue").length, color: "#f44336", icon: Cancel },
            { label: "En Maintenance", value: locations.filter(l => l.statut === "maintenance").length, color: "#ff9800", icon: FilterList },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={3}
                sx={{
                  borderLeft: `4px solid ${stat.color}`,
                  transition: "all 0.3s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color={stat.color}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                      <stat.icon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filtres et recherche */}
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par titre ou ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type de bien</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type de bien"
                  >
                    <MenuItem value="all">Tous les types</MenuItem>
                    <MenuItem value="Villa">Villa</MenuItem>
                    <MenuItem value="Appartement">Appartement</MenuItem>
                    <MenuItem value="Studio">Studio</MenuItem>
                    <MenuItem value="Maison">Maison</MenuItem>
                    <MenuItem value="Duplex">Duplex</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Statut"
                  >
                    <MenuItem value="all">Tous les statuts</MenuItem>
                    <MenuItem value="disponible">Disponible</MenuItem>
                    <MenuItem value="loue">Loué</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchLocations}
                >
                  Actualiser
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Liste des locations */}
        <Grid container spacing={3}>
          {filteredLocations.map((location) => (
            <Grid item xs={12} md={6} lg={4} key={location._id}>
              <Card
                elevation={4}
                sx={{
                  height: "100%",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 8,
                  },
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: location.images?.[0]?.url 
                      ? `url(${fixImageUrl(location.images[0].url)})` 
                      : "linear-gradient(135deg, #ff5722 0%, #ff7043 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0,0,0,0.3)",
                    }
                  }}
                >
                  <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 2 }}>
                    <Chip
                      label={location.typeBien}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: "#ff5722",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                  <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
                    <Chip
                      label={getStatusLabel(location.statut)}
                      color={getStatusColor(location.statut)}
                      variant="filled"
                    />
                  </Box>
                </Box>

                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {location.titre}
                  </Typography>
                  
                  <Stack spacing={1} mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">{location.ville}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SquareFoot fontSize="small" color="action" />
                      <Typography variant="body2">{location.superficie} m²</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Bed fontSize="small" color="action" />
                      <Typography variant="body2">{location.nombreChambres} chambre{location.nombreChambres > 1 ? 's' : ''}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AttachMoney fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatMoney(location.prixMensuel)}/mois
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Agence: {location.agenceId?.nom || "Non spécifiée"}
                    </Typography>
                    <Box>
                      <Tooltip title="Test image">
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (location.images?.[0]?.url) {
                              const fixedUrl = fixImageUrl(location.images[0].url);
                              window.open(fixedUrl, '_blank');
                            }
                          }}
                          sx={{ color: "info.main" }}
                        >
                          🖼️
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Voir détails">
                        <IconButton
                          size="small"
                          onClick={() => handleViewLocation(location)}
                          sx={{ color: "primary.main" }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/agence/locations/edit/${location._id}`)}
                          sx={{ color: "warning.main" }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLocation(location._id)}
                          sx={{ color: "error.main" }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredLocations.length === 0 && (
          <Card elevation={3} sx={{ mt: 4 }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Home sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune location trouvée
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par créer votre première location"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/admin/locations/create")}
              >
                Créer une location
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dialog de détail */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Home color="primary" />
              <Typography variant="h6">{selectedLocation?.titre}</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedLocation && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedLocation.description}
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" fontWeight="bold">Ville</Typography>
                    <Typography variant="body2">{selectedLocation.ville}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" fontWeight="bold">Superficie</Typography>
                    <Typography variant="body2">{selectedLocation.superficie} m²</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" fontWeight="bold">Chambres</Typography>
                    <Typography variant="body2">{selectedLocation.nombreChambres}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" fontWeight="bold">Prix mensuel</Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {formatMoney(selectedLocation.prixMensuel)}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
            <Button
              variant="contained"
              onClick={() => {
                setOpenDialog(false);
                navigate(`/agence/locations/edit/${selectedLocation?._id}`);
              }}
            >
              Modifier
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </PageLayout>
  );
};

export default AdminLocationsPage;
