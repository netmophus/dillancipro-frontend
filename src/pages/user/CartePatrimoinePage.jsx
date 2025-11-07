import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  Map as MapIcon,
  Home,
  MyLocation,
  Directions,
  FilterList,
  Layers,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Icône personnalisée pour patrimoine personnel (verte)
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Composant Itinéraire
const RoutingMachine = ({ userPosition, destination }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!map || !userPosition || !destination) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition.lat, userPosition.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "#6366f1", weight: 4 }],
      },
      createMarker: () => null,
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, userPosition, destination]);

  return null;
};

const CartePatrimoinePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [parcellesAgence, setParcellesAgence] = useState([]);
  const [patrimoinePersonnel, setPatrimoinePersonnel] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [filter, setFilter] = useState("all"); // all, agence, personnel

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/client/dashboard");
      setParcellesAgence(res.data.parcelles || []);
      setPatrimoinePersonnel(res.data.patrimoinePersonnel || []);
    } catch (err) {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Erreur géolocalisation:", error);
          alert("Impossible d'obtenir votre position.");
        }
      );
    } else {
      alert("Géolocalisation non supportée.");
    }
  };

  const calculateRoute = (destination) => {
    if (!userPosition) {
      getUserLocation();
    }
    setSelectedDestination(destination);
    setShowRoute(true);
  };

  const resetRoute = () => {
    setShowRoute(false);
    setSelectedDestination(null);
  };

  // Filtrer les biens selon le toggle
  const filteredParcellesAgence = filter === "all" || filter === "agence" ? parcellesAgence : [];
  const filteredPatrimoinePersonnel = filter === "all" || filter === "personnel" ? patrimoinePersonnel : [];

  // Calculer le centre de la carte
  const allBiens = [
    ...parcellesAgence.map((p) => ({ lat: p.localisation?.lat, lng: p.localisation?.lng })),
    ...patrimoinePersonnel.map((p) => ({ lat: p.localisation?.latitude, lng: p.localisation?.longitude })),
  ].filter((b) => b.lat && b.lng);

  const centerLat = allBiens.length > 0
    ? allBiens.reduce((sum, b) => sum + b.lat, 0) / allBiens.length
    : 12.3714;
  const centerLng = allBiens.length > 0
    ? allBiens.reduce((sum, b) => sum + b.lng, 0) / allBiens.length
    : -1.5197;

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/user/dashboard")}
            sx={{ mb: 2 }}
          >
            Retour au dashboard
          </Button>

          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
              <MapIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Carte Globale de Mon Patrimoine
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualisez tous vos biens sur une seule carte
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Statistiques rapides */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: "primary.light", color: "primary.contrastText" }}>
              <Typography variant="subtitle2">Parcelles Agence</Typography>
              <Typography variant="h5" fontWeight="bold">{parcellesAgence.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: "success.light", color: "success.contrastText" }}>
              <Typography variant="subtitle2">Patrimoine Personnel</Typography>
              <Typography variant="h5" fontWeight="bold">{patrimoinePersonnel.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: "secondary.light", color: "secondary.contrastText" }}>
              <Typography variant="subtitle2">Total</Typography>
              <Typography variant="h5" fontWeight="bold">
                {parcellesAgence.length + patrimoinePersonnel.length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Carte */}
        <Card elevation={3}>
          <CardContent sx={{ p: 2 }}>
            {/* Contrôles */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={(_, value) => value && setFilter(value)}
                size="small"
              >
                <ToggleButton value="all">
                  <Layers fontSize="small" sx={{ mr: 0.5 }} /> Tous
                </ToggleButton>
                <ToggleButton value="agence">
                  <Home fontSize="small" sx={{ mr: 0.5 }} /> Agence
                </ToggleButton>
                <ToggleButton value="personnel">
                  <MapIcon fontSize="small" sx={{ mr: 0.5 }} /> Personnel
                </ToggleButton>
              </ToggleButtonGroup>

              <Stack direction="row" spacing={1}>
                {!userPosition && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MyLocation />}
                    onClick={getUserLocation}
                  >
                    Ma position
                  </Button>
                )}
                {showRoute && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={resetRoute}
                  >
                    Réinitialiser
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Légende */}
            <Box display="flex" gap={2} mb={2}>
              <Chip label="🔵 Acheté via agence" size="small" variant="outlined" />
              <Chip label="🟢 Patrimoine personnel" size="small" variant="outlined" />
              {userPosition && <Chip label="🔴 Votre position" size="small" color="error" />}
            </Box>

            {/* Carte */}
            <Box sx={{ height: 600, borderRadius: 2, overflow: "hidden" }}>
              <MapContainer
                center={[centerLat, centerLng]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />

                {/* Markers parcelles agence (bleu) */}
                {filteredParcellesAgence.map((parcelle) => {
                  if (!parcelle.localisation?.lat || !parcelle.localisation?.lng) return null;
                  return (
                    <Marker
                      key={`agence-${parcelle._id}`}
                      position={[parcelle.localisation.lat, parcelle.localisation.lng]}
                    >
                      <Popup>
                        <Box sx={{ minWidth: 200 }}>
                          <Chip label="Acheté via agence" size="small" color="primary" sx={{ mb: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold">
                            {parcelle.numeroParcelle}
                          </Typography>
                          <Typography variant="caption">
                            Îlot : {parcelle.ilot?.numeroIlot || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            {parcelle.superficie} m² • {formatMoney(parcelle.prix)}
                          </Typography>
                          <Button
                            size="small"
                            fullWidth
                            variant="outlined"
                            startIcon={<Directions />}
                            onClick={() =>
                              calculateRoute({
                                lat: parcelle.localisation.lat,
                                lng: parcelle.localisation.lng,
                              })
                            }
                            sx={{ mt: 1 }}
                          >
                            Itinéraire
                          </Button>
                        </Box>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Markers patrimoine personnel (vert) */}
                {filteredPatrimoinePersonnel.map((bien) => {
                  if (!bien.localisation?.latitude || !bien.localisation?.longitude) return null;
                  return (
                    <Marker
                      key={`perso-${bien._id}`}
                      position={[bien.localisation.latitude, bien.localisation.longitude]}
                      icon={greenIcon}
                    >
                      <Popup>
                        <Box sx={{ minWidth: 200 }}>
                          <Chip label="Patrimoine personnel" size="small" color="success" sx={{ mb: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold">
                            {bien.titre}
                          </Typography>
                          <Typography variant="caption">Type : {bien.type}</Typography>
                          <Typography variant="body2">
                            {bien.superficie && `${bien.superficie} m²`}
                            {bien.valeurEstimee && ` • ${formatMoney(bien.valeurEstimee)}`}
                          </Typography>
                          <Button
                            size="small"
                            fullWidth
                            variant="outlined"
                            startIcon={<Directions />}
                            onClick={() =>
                              calculateRoute({
                                lat: bien.localisation.latitude,
                                lng: bien.localisation.longitude,
                              })
                            }
                            sx={{ mt: 1 }}
                          >
                            Itinéraire
                          </Button>
                        </Box>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Marker position utilisateur */}
                {userPosition && (
                  <Marker position={[userPosition.lat, userPosition.lng]}>
                    <Popup>
                      <Typography variant="body2" fontWeight="bold">
                        📍 Votre position actuelle
                      </Typography>
                    </Popup>
                  </Marker>
                )}

                {/* Itinéraire */}
                {showRoute && userPosition && selectedDestination && (
                  <RoutingMachine
                    userPosition={userPosition}
                    destination={selectedDestination}
                  />
                )}
              </MapContainer>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  );
};

export default CartePatrimoinePage;

