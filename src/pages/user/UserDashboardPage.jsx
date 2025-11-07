import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Home,
  AttachMoney,
  CheckCircle,
  HourglassEmpty,
  LocationOn,
  Receipt,
  ExpandMore,
  TrendingUp,
  Assessment,
  Map as MapIcon,
  Refresh,
  Directions,
  MyLocation,
  Close,
  Add,
  Landscape,
  AccountBalance,
  Gavel,
  Visibility,
  Person,
  ArrowForward,
  CalendarToday,
  Schedule,
  Warning,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import PageLayout from "../../components/shared/PageLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import EcheancierDrawerClient from "../../components/user/EcheancierDrawerClient";

// Fixer les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Composant pour ajouter l'itinéraire sur la carte
const RoutingMachine = ({ userPosition, parcellePosition }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!map || !userPosition || !parcellePosition) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition.lat, userPosition.lng),
        L.latLng(parcellePosition.lat, parcellePosition.lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "#6366f1", weight: 4 }],
      },
      show: true,
      createMarker: () => null, // On utilise nos propres markers
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, userPosition, parcellePosition]);

  return null;
};

const UserDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Rediriger les notaires vers leur dashboard
  useEffect(() => {
    if (user?.role === "Notaire") {
      navigate("/notaire/dashboard");
    }
  }, [user, navigate]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [ventesEnCours, setVentesEnCours] = useState([]);
  const [loadingVentes, setLoadingVentes] = useState(false);
  const [echeanciers, setEcheanciers] = useState([]);
  const [loadingEcheanciers, setLoadingEcheanciers] = useState(false);
  const [echeancierDrawerOpen, setEcheancierDrawerOpen] = useState(false);
  const [selectedEcheancier, setSelectedEcheancier] = useState(null);
  
  // État pour la carte
  const [mapDialog, setMapDialog] = useState(false);
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [loadingPosition, setLoadingPosition] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  // État pour le dialog des détails de parcelle
  const [parcelleDetailsDialog, setParcelleDetailsDialog] = useState(false);
  const [selectedParcelleDetails, setSelectedParcelleDetails] = useState(null);

  useEffect(() => {
    fetchDashboard();
    fetchVentesEnCours();
    fetchEcheanciers();
  }, []);

  const fetchVentesEnCours = async () => {
    try {
      setLoadingVentes(true);
      const response = await api.get("/agence/ventes/client");
      // Filtrer pour n'afficher que les ventes non finalisées
      const ventesNonFinalisees = response.data.filter(
        (v) => v.statut !== "finalisee" && v.statut !== "annulee"
      );
      setVentesEnCours(ventesNonFinalisees);
    } catch (error) {
      console.error("Erreur chargement ventes:", error);
    } finally {
      setLoadingVentes(false);
    }
  };

  const fetchEcheanciers = async () => {
    try {
      setLoadingEcheanciers(true);
      const response = await api.get("/agence/echeanciers/client");
      setEcheanciers(response.data || []);
    } catch (error) {
      console.error("Erreur chargement échéanciers:", error);
      setEcheanciers([]);
    } finally {
      setLoadingEcheanciers(false);
    }
  };

  const openParcelleDetails = async (parcelle) => {
    try {
      // Essayer de récupérer les détails complets de la parcelle
      try {
        const detailResponse = await api.get(`/client/parcelles/${parcelle._id}`);
        setSelectedParcelleDetails(detailResponse.data);
      } catch (err) {
        // Si l'API spécifique n'existe pas, utiliser les données du dashboard
        setSelectedParcelleDetails(parcelle);
      }
      setParcelleDetailsDialog(true);
    } catch (err) {
      console.error('Erreur chargement détails parcelle:', err);
      setSelectedParcelleDetails(parcelle);
      setParcelleDetailsDialog(true);
    }
  };

  const fixImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBaseUrl = api.defaults.baseURL || 'http://localhost:5000';
    return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const openMap = (parcelle) => {
    setSelectedParcelle(parcelle);
    setMapDialog(true);
    setShowRoute(false);
    setUserPosition(null);
  };

  const getUserLocation = () => {
    setLoadingPosition(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowRoute(true);
          setLoadingPosition(false);
        },
        (error) => {
          console.error("Erreur géolocalisation:", error);
          alert("Impossible d'obtenir votre position. Vérifiez les autorisations de localisation.");
          setLoadingPosition(false);
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      setLoadingPosition(false);
    }
  };

  const fetchDashboard = async () => {
    // Ne pas faire d'appel API si l'utilisateur est un notaire (il sera redirigé)
    if (user?.role === "Notaire") {
      return;
    }
    
    setLoading(true);
    try {
      const [dashboardRes, profileRes] = await Promise.all([
        api.get("/client/dashboard"),
        api.get("/user/profile").catch(() => ({ data: null })),
      ]);
      
      setDashboardData(dashboardRes.data);
      setProfilePhoto(profileRes.data?.photoUrl || null);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
      setError("Impossible de charger vos informations");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const KPICard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        transition: "all 0.3s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color} sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56, ml: 2 }}>
            <Icon fontSize="large" />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} />
        </Box>
      </PageLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <PageLayout>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">{error || "Erreur de chargement"}</Alert>
        </Container>
      </PageLayout>
    );
  }

  const { stats, parcelles, paiements } = dashboardData;
  const pourcentagePaye = stats.totalPaiements > 0 
    ? ((stats.totalPaye / stats.totalPaiements) * 100).toFixed(1)
    : 0;

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Card
          elevation={3}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar 
                  src={profilePhoto}
                  sx={{ width: 80, height: 80, border: "4px solid white", bgcolor: "white", color: "primary.main" }}
                >
                  {!profilePhoto && (user?.fullName || "C").charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Bonjour, {user?.fullName || "Client"} 👋
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                    📞 {user?.phone} • 🏡 {stats.totalParcelles} parcelle(s)
                  </Typography>
                </Box>
              </Box>

              <Tooltip title="Actualiser">
                <IconButton onClick={fetchDashboard} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        {/* KPIs */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          📊 Aperçu de vos acquisitions
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Mes Parcelles"
              value={stats.totalParcelles}
              subtitle="Propriétés acquises"
              icon={Home}
              color="#2196f3"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Montant Total"
              value={formatMoney(stats.totalPaiements)}
              subtitle="Prix d'achat total"
              icon={TrendingUp}
              color="#9c27b0"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Montant Payé"
              value={formatMoney(stats.totalPaye)}
              subtitle={`${pourcentagePaye}% du total`}
              icon={CheckCircle}
              color="#4caf50"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Montant Restant"
              value={formatMoney(stats.totalRestant)}
              subtitle={`${stats.paiementsEnCours} paiement(s) en cours`}
              icon={HourglassEmpty}
              color="#ff9800"
            />
          </Grid>
        </Grid>

        {/* Accès rapide aux achats agence */}
        <Card elevation={3} sx={{ mb: 4, bgcolor: "primary.main", color: "white" }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🛒 Mes Achats via Agence
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Consultez vos achats de parcelles et biens immobiliers via les agences
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="inherit"
                onClick={() => navigate("/user/mes-achats-agence")}
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                Voir mes achats
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Achats de biens en cours avec les notaires */}
        {ventesEnCours.length > 0 && (
          <Card elevation={3} sx={{ mb: 4, bgcolor: "warning.light", borderLeft: "4px solid #ff9800" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Gavel /> Mes Achats de Biens en Cours ({ventesEnCours.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/user/mes-ventes")}
                >
                  Voir tout
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {loadingVentes ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {ventesEnCours.slice(0, 3).map((vente) => {
                    const STATUT_COLORS = {
                      en_attente_notaire: "warning",
                      en_cours_notariat: "info",
                      formalites_completes: "info",
                      en_attente_signature: "primary",
                      signee: "success",
                    };
                    const STATUT_LABELS = {
                      en_attente_notaire: "En attente notaire",
                      en_cours_notariat: "En cours notariat",
                      formalites_completes: "Formalités complètes",
                      en_attente_signature: "En attente signature",
                      signee: "Signée",
                    };

                    return (
                      <Grid item xs={12} sm={6} md={4} key={vente._id}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            transition: "all 0.3s",
                            "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
                            cursor: "pointer"
                          }}
                          onClick={() => navigate("/user/mes-ventes")}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Home fontSize="small" color="primary" />
                              <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ flex: 1 }}>
                                {vente.bienId?.titre || "N/A"}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              {vente.bienId?.type || ""}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                {new Intl.NumberFormat("fr-FR").format(vente.prixVente || 0)} FCFA
                              </Typography>
                              <Chip
                                label={STATUT_LABELS[vente.statut] || vente.statut}
                                color={STATUT_COLORS[vente.statut] || "default"}
                                size="small"
                              />
                            </Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Person fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                Commercial: {vente.commercialId?.fullName || "N/A"}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Gavel fontSize="small" color="primary" />
                              <Typography variant="caption" color="text.secondary">
                                Notaire: {vente.notaireId?.fullName || "N/A"}
                              </Typography>
                            </Box>
                            {vente.statut === "en_attente_signature" && vente.signatures && (
                              <Box mt={1} pt={1} borderTop="1px solid #e0e0e0">
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Signatures:
                                </Typography>
                                <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                                  <Chip
                                    label={`Vous: ${vente.signatures.client ? "✓" : "⏳"}`}
                                    size="small"
                                    color={vente.signatures.client ? "success" : "warning"}
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={`Com.: ${vente.signatures.commercial ? "✓" : "⏳"}`}
                                    size="small"
                                    color={vente.signatures.commercial ? "success" : "warning"}
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={`Ag.: ${vente.signatures.agence ? "✓" : "⏳"}`}
                                    size="small"
                                    color={vente.signatures.agence ? "success" : "warning"}
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                            )}
                            <Button
                              fullWidth
                              size="small"
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/user/mes-ventes");
                              }}
                              sx={{ mt: 2 }}
                            >
                              Voir détails
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {ventesEnCours.length > 3 && (
                <Box mt={2} textAlign="center">
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate("/user/mes-ventes")}
                  >
                    Voir les {ventesEnCours.length - 3} autres achats
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mes Échéanciers */}
        {echeanciers.length > 0 && (
          <Card elevation={3} sx={{ mb: 4, bgcolor: "info.light", borderLeft: "4px solid #2196f3" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday /> Mes Échéanciers ({echeanciers.length})
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {loadingEcheanciers ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {echeanciers.slice(0, 3).map((echeancier) => {
                    const echeancesAvenir = echeancier.echeances?.filter(e => e.statut === "a_venir") || [];
                    const echeancesEnRetard = echeancier.echeances?.filter(e => e.statut === "en_retard") || [];
                    const prochaineEcheance = [...echeancesAvenir, ...echeancesEnRetard]
                      .sort((a, b) => new Date(a.dateEcheance) - new Date(b.dateEcheance))[0];

                    return (
                      <Grid item xs={12} sm={6} md={4} key={echeancier._id}>
                        <Card
                          variant="outlined"
                          sx={{
                            transition: "all 0.3s",
                            "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
                            borderLeft: echeancesEnRetard.length > 0 ? "4px solid #f44336" : "4px solid #2196f3",
                          }}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <CalendarToday fontSize="small" color="primary" />
                              <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ flex: 1 }}>
                                Parcelle {echeancier.parcelle?.numeroParcelle || "N/A"}
                              </Typography>
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Montant total: {echeancier.montantTotal?.toLocaleString()} FCFA
                            </Typography>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                Payé: {echeancier.montantPaye?.toLocaleString()} FCFA
                              </Typography>
                              <Chip
                                label={echeancier.statut === "termine" ? "Terminé" : "En cours"}
                                color={echeancier.statut === "termine" ? "success" : "warning"}
                                size="small"
                              />
                            </Box>

                            {prochaineEcheance && (
                              <Box mt={1} pt={1} borderTop="1px solid #e0e0e0">
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Prochaine échéance:
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                  {prochaineEcheance.statut === "en_retard" ? (
                                    <Warning fontSize="small" color="error" />
                                  ) : (
                                    <Schedule fontSize="small" color="warning" />
                                  )}
                                  <Typography variant="body2" fontWeight="medium">
                                    {new Date(prochaineEcheance.dateEcheance).toLocaleDateString("fr-FR")}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" color="primary">
                                    {prochaineEcheance.montant?.toLocaleString()} FCFA
                                  </Typography>
                                </Box>
                                <Chip
                                  label={prochaineEcheance.statut === "en_retard" ? "En retard" : "À venir"}
                                  color={prochaineEcheance.statut === "en_retard" ? "error" : "warning"}
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            )}

                            <Button
                              fullWidth
                              size="small"
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() => {
                                setSelectedEcheancier(echeancier);
                                setEcheancierDrawerOpen(true);
                              }}
                              sx={{ mt: 2 }}
                            >
                              Voir l'échéancier
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {echeanciers.length > 3 && (
                <Box mt={2} textAlign="center">
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    onClick={() => {
                      // TODO: Naviguer vers une page de liste complète des échéanciers
                      console.log("Voir tous les échéanciers");
                    }}
                  >
                    Voir les {echeanciers.length - 3} autres échéanciers
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Barre de progression du paiement */}
        {stats.totalPaiements > 0 && (
          <Card elevation={2} sx={{ mb: 4, bgcolor: "info.light" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  📈 Progression des paiements
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {pourcentagePaye}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={parseFloat(pourcentagePaye)}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "white",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 6,
                    background: "linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)",
                  },
                }}
              />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="caption">
                  Payé : {formatMoney(stats.totalPaye)}
                </Typography>
                <Typography variant="caption">
                  Total : {formatMoney(stats.totalPaiements)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Section Patrimoine Consolidé */}
        <Card elevation={3} sx={{ mb: 4, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🏡 Mon Patrimoine Foncier
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Gérez l'ensemble de vos biens immobiliers
                </Typography>
              </Box>
              <Landscape fontSize="large" />
            </Box>

            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />

            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", p: 2, borderRadius: 2 }}>
                  <Typography variant="caption">Total biens</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.totalBiensConsolides || (stats.totalParcelles + (stats.totalPatrimoinePersonnel || 0))}
                  </Typography>
                  <Typography variant="caption">
                    {stats.totalParcelles} agence • {stats.totalPatrimoinePersonnel || 0} personnel
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", p: 2, borderRadius: 2 }}>
                  <Typography variant="caption">Superficie totale</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {new Intl.NumberFormat("fr-FR").format(stats.superficieTotaleConsolidee || 0)} m²
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", p: 2, borderRadius: 2 }}>
                  <Typography variant="caption">Valeur patrimoine personnel</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatMoney(stats.valeurPatrimoine || 0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ bgcolor: "white", color: "#f5576c", "&:hover": { bgcolor: "rgba(255,255,255,0.9)" } }}
                onClick={() => navigate("/user/mon-patrimoine")}
                fullWidth
              >
                Ajouter un bien
              </Button>
              <Button
                variant="outlined"
                startIcon={<MapIcon />}
                sx={{ color: "white", borderColor: "white", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                onClick={() => navigate("/user/carte-patrimoine")}
                fullWidth
              >
                Carte globale
              </Button>
              <Button
                variant="outlined"
                startIcon={<AccountBalance />}
                sx={{ color: "white", borderColor: "white", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                onClick={() => navigate("/user/mon-patrimoine")}
                fullWidth
              >
                Gérer mon patrimoine
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Mes Parcelles */}
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🏘️ Mes Parcelles ({parcelles.length})
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {parcelles.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Home sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
                <Typography color="text.secondary">
                  Vous n'avez pas encore de parcelle
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                {parcelles.map((parcelle) => (
                  <Box
                    key={parcelle._id}
                    sx={{
                      width: { xs: '100%', sm: 'calc(50% - 8px)' },
                      flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 8px)' },
                    }}
                  >
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" fontWeight="bold">
                            {parcelle.numeroParcelle}
                          </Typography>
                          <Chip label={parcelle.statut === "vendue" ? "Vendue" : "Propriété"} color="success" size="small" />
                        </Box>

                        <Stack spacing={1.5}>
                          {parcelle.ilot && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Îlot</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {parcelle.ilot.numeroIlot}
                              </Typography>
                            </Box>
                          )}

                          {parcelle.ilot?.quartier && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Quartier</Typography>
                              <Typography variant="body2">
                                {parcelle.ilot.quartier.nom}
                              </Typography>
                            </Box>
                          )}

                          {parcelle.superficie && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Superficie</Typography>
                              <Typography variant="body2">{parcelle.superficie} m²</Typography>
                            </Box>
                          )}

                          {parcelle.prix && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Prix</Typography>
                              <Typography variant="h6" color="primary" fontWeight="bold">
                                {formatMoney(parcelle.prix)}
                              </Typography>
                            </Box>
                          )}

                          {parcelle.localisation && (parcelle.localisation.lat || parcelle.localisation.lng) && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Localisation</Typography>
                              <Typography variant="body2">
                                <LocationOn fontSize="small" sx={{ verticalAlign: "middle" }} />
                                {parcelle.localisation.lat}, {parcelle.localisation.lng}
                              </Typography>
                            </Box>
                          )}

                          {parcelle.description && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Description</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {parcelle.description}
                              </Typography>
                            </Box>
                          )}

                          {/* Boutons d'action */}
                          <Box display="flex" gap={1} mt={2}>
                            {parcelle.localisation && (parcelle.localisation.lat || parcelle.localisation.lng) && (
                              <Button
                                variant="contained"
                                fullWidth
                                startIcon={<MapIcon />}
                                onClick={() => openMap(parcelle)}
                                sx={{ flex: 1 }}
                              >
                                Voir sur la carte
                              </Button>
                            )}
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<Visibility />}
                              onClick={() => openParcelleDetails(parcelle)}
                              color="primary"
                              sx={{ flex: 1 }}
                            >
                              Voir détails
                            </Button>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Mes Paiements */}
        {paiements.length > 0 && (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                💳 Mes Paiements ({paiements.length})
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2}>
                {paiements.map((paiement) => (
                  <Accordion key={paiement._id} elevation={2}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Parcelle {paiement.parcelle?.numeroParcelle || "N/A"}
                            {paiement.parcelle?.ilot && ` - Îlot ${paiement.parcelle.ilot.numeroIlot}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(paiement.datePaiement).toLocaleDateString("fr-FR")}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} mr={2}>
                          <Chip
                            label={paiement.typePaiement === "total" ? "Paiement total" : "Paiement partiel"}
                            size="small"
                            color={paiement.typePaiement === "total" ? "success" : "warning"}
                          />
                          <Chip
                            label={paiement.statut === "paid" ? "Soldé" : "En cours"}
                            size="small"
                            color={paiement.statut === "paid" ? "success" : "error"}
                          />
                        </Stack>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">Montant total</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatMoney(paiement.montantTotal)}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">Montant payé</Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            {formatMoney(paiement.montantPaye)}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">Montant restant</Typography>
                          <Typography variant="h6" fontWeight="bold" color="warning.main">
                            {formatMoney(paiement.montantRestant)}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ mt: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={
                                paiement.montantTotal > 0
                                  ? (paiement.montantPaye / paiement.montantTotal) * 100
                                  : 0
                              }
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: "#f0f0f0",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: paiement.statut === "paid" ? "#4caf50" : "#ff9800",
                                  borderRadius: 5,
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                              {((paiement.montantPaye / paiement.montantTotal) * 100).toFixed(1)}% payé
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Historique des versements partiels */}
                        {paiement.typePaiement === "partiel" && paiement.versements && paiement.versements.length > 0 && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              📋 Historique des versements ({paiement.versements.length})
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                              <Table size="small">
                                <TableHead sx={{ bgcolor: "grey.100" }}>
                                  <TableRow>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell align="right"><strong>Montant</strong></TableCell>
                                    <TableCell><strong>Reçu</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {paiement.versements.map((versement, idx) => (
                                    <TableRow key={versement._id} hover>
                                      <TableCell>
                                        {new Date(versement.datePaiement).toLocaleDateString("fr-FR")}
                                      </TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold" color="success.main">
                                          {formatMoney(versement.montant)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        {versement.recuUrl ? (
                                          <Chip
                                            label="Disponible"
                                            size="small"
                                            color="success"
                                            icon={<Receipt />}
                                            onClick={() => window.open(versement.recuUrl, "_blank")}
                                            sx={{ cursor: "pointer" }}
                                          />
                                        ) : (
                                          <Typography variant="caption" color="text.secondary">
                                            -
                                          </Typography>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                        )}

                        {/* Reçu principal (paiement total) */}
                        {paiement.typePaiement === "total" && paiement.recuUrl && (
                          <Grid item xs={12}>
                            <Chip
                              label="Voir le reçu de paiement"
                              color="primary"
                              icon={<Receipt />}
                              onClick={() => window.open(paiement.recuUrl, "_blank")}
                              sx={{ cursor: "pointer" }}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Message si aucun achat */}
        {stats.totalParcelles === 0 && (
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Home sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Vous n'avez pas encore de parcelle
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contactez un commercial pour acquérir votre parcelle
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* DIALOG CARTE */}
      <Dialog
        open={mapDialog}
        onClose={() => setMapDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <MapIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Localisation - {selectedParcelle?.numeroParcelle}
              </Typography>
            </Box>
            <IconButton onClick={() => setMapDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: 600 }}>
          {selectedParcelle && selectedParcelle.localisation && (
            <Box sx={{ height: "100%", position: "relative" }}>
              {/* Boutons de contrôle */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {!showRoute && (
                  <Button
                    variant="contained"
                    startIcon={loadingPosition ? <CircularProgress size={20} color="inherit" /> : <Directions />}
                    onClick={getUserLocation}
                    disabled={loadingPosition}
                    sx={{ boxShadow: 4 }}
                  >
                    {loadingPosition ? "Localisation..." : "Calculer l'itinéraire"}
                  </Button>
                )}
                {showRoute && userPosition && (
                  <Alert severity="success" sx={{ boxShadow: 4 }}>
                    <Typography variant="body2" fontWeight="bold">
                      ✓ Itinéraire calculé
                    </Typography>
                  </Alert>
                )}
              </Box>

              {/* Carte */}
              <MapContainer
                center={[
                  selectedParcelle.localisation.lat || 12.3714,
                  selectedParcelle.localisation.lng || -1.5197,
                ]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marker de la parcelle */}
                {selectedParcelle.localisation.lat && selectedParcelle.localisation.lng && (
                  <Marker
                    position={[
                      selectedParcelle.localisation.lat,
                      selectedParcelle.localisation.lng,
                    ]}
                  >
                    <Popup>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Parcelle {selectedParcelle.numeroParcelle}
                        </Typography>
                        <Typography variant="body2">
                          Superficie : {selectedParcelle.superficie} m²
                        </Typography>
                        <Typography variant="body2">
                          Prix : {formatMoney(selectedParcelle.prix)}
                        </Typography>
                        {selectedParcelle.description && (
                          <Typography variant="caption" color="text.secondary">
                            {selectedParcelle.description}
                          </Typography>
                        )}
                      </Box>
                    </Popup>
                  </Marker>
                )}

                {/* Marker de la position de l'utilisateur */}
                {userPosition && (
                  <Marker position={[userPosition.lat, userPosition.lng]}>
                    <Popup>
                      <Typography variant="body2" fontWeight="bold">
                        📍 Votre position
                      </Typography>
                    </Popup>
                  </Marker>
                )}

                {/* Itinéraire */}
                {showRoute && userPosition && selectedParcelle.localisation.lat && selectedParcelle.localisation.lng && (
                  <RoutingMachine
                    userPosition={userPosition}
                    parcellePosition={{
                      lat: selectedParcelle.localisation.lat,
                      lng: selectedParcelle.localisation.lng,
                    }}
                  />
                )}
              </MapContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              <LocationOn fontSize="small" sx={{ verticalAlign: "middle" }} />
              {selectedParcelle?.localisation?.lat}, {selectedParcelle?.localisation?.lng}
            </Typography>
            <Button onClick={() => setMapDialog(false)} variant="outlined">
              Fermer
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Dialog Détails Parcelle */}
      <Dialog
        open={parcelleDetailsDialog}
        onClose={() => {
          setParcelleDetailsDialog(false);
          setSelectedParcelleDetails(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Détails - {selectedParcelleDetails?.numeroParcelle}
            </Typography>
            <IconButton onClick={() => {
              setParcelleDetailsDialog(false);
              setSelectedParcelleDetails(null);
            }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedParcelleDetails && (
            <Box>
              {/* Photos */}
              {selectedParcelleDetails.images && selectedParcelleDetails.images.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📸 Photos ({selectedParcelleDetails.images.length})
                  </Typography>
                  <Box
                    component="img"
                    src={fixImageUrl(selectedParcelleDetails.images[0])}
                    alt={selectedParcelleDetails.numeroParcelle}
                    sx={{
                      width: "100%",
                      height: 300,
                      objectFit: "cover",
                      borderRadius: 2,
                      mb: 2,
                    }}
                  />
                  {selectedParcelleDetails.images.length > 1 && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {selectedParcelleDetails.images.slice(1).map((img, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={fixImageUrl(img)}
                          alt={`${selectedParcelleDetails.numeroParcelle} - Image ${idx + 2}`}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 1,
                            cursor: "pointer",
                            border: "2px solid transparent",
                            "&:hover": {
                              borderColor: "primary.main",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* Informations principales */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      ÎLOT
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedParcelleDetails.ilot?.numeroIlot || "N/A"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      QUARTIER
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedParcelleDetails.ilot?.quartier?.nom || "N/A"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      SUPERFICIE
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedParcelleDetails.superficie || "N/A"} m²
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      PRIX
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      {formatMoney(selectedParcelleDetails.prix)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Description */}
              {selectedParcelleDetails.description && (
                <Box mb={3}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedParcelleDetails.description}
                  </Typography>
                </Box>
              )}

              {/* Documents et vidéos */}
              {(selectedParcelleDetails.documents && selectedParcelleDetails.documents.length > 0) ||
               (selectedParcelleDetails.videos && selectedParcelleDetails.videos.length > 0) ? (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📄 Documents et médias
                  </Typography>
                  
                  {selectedParcelleDetails.documents && selectedParcelleDetails.documents.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Documents ({selectedParcelleDetails.documents.length})
                      </Typography>
                      <Stack spacing={1}>
                        {selectedParcelleDetails.documents.map((doc, idx) => (
                          <Chip
                            key={idx}
                            label={`Document ${idx + 1}`}
                            component="a"
                            href={fixImageUrl(doc)}
                            target="_blank"
                            clickable
                            sx={{ justifyContent: "flex-start" }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {selectedParcelleDetails.videos && selectedParcelleDetails.videos.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Vidéos ({selectedParcelleDetails.videos.length})
                      </Typography>
                      <Stack spacing={1}>
                        {selectedParcelleDetails.videos.map((video, idx) => (
                          <Chip
                            key={idx}
                            label={`Vidéo ${idx + 1}`}
                            component="a"
                            href={video}
                            target="_blank"
                            clickable
                            color="primary"
                            sx={{ justifyContent: "flex-start" }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              ) : null}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setParcelleDetailsDialog(false);
              setSelectedParcelleDetails(null);
            }}
            variant="outlined"
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer pour afficher les détails de l'échéancier */}
      {selectedEcheancier && (
        <EcheancierDrawerClient
          open={echeancierDrawerOpen}
          onClose={() => {
            setEcheancierDrawerOpen(false);
            setSelectedEcheancier(null);
          }}
          echeancierId={selectedEcheancier._id}
        />
      )}
    </PageLayout>
  );
};

export default UserDashboardPage;
