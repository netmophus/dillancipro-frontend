import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  Map as MapIcon,
  Home,
  MyLocation,
  Directions,
  Visibility,
  CheckCircle,
  ShoppingCart,
  AttachMoney,
  LocationOn,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

// Icône personnalisée pour IHE (bleue)
const iheIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  // Fallback vers l'icône par défaut si l'URL ne charge pas
  errorTileUrl: require("leaflet/dist/images/marker-icon.png"),
});

// Composant pour centrer la carte
const MapCenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [map, center, zoom]);
  return null;
};

// Composant pour un seul Marker IHE
const IHEMarker = ({ ihe, position, iheIcon, formatMoney, STATUT_LABELS, STATUT_COLORS, navigate }) => {
  // Utiliser useEffect pour forcer la mise à jour du Marker
  useEffect(() => {
    console.log(`✅ IHEMarker monté dans le DOM: ${ihe.titre} à [${position[0]}, ${position[1]}]`);
  }, [ihe.titre, position]);
  
  return (
    <Marker
      position={position}
      icon={iheIcon}
    >
      <Popup maxWidth={300}>
        <Box sx={{ minWidth: 280, p: 0.5 }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: 2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: "1rem" }}>
              {ihe.titre}
            </Typography>
            <Chip
              label={STATUT_LABELS[ihe.statut] || ihe.statut}
              color={STATUT_COLORS[ihe.statut] || "default"}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
          </Box>

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}>
                Référence
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                {ihe.reference}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}>
                Type
              </Typography>
              <Chip
                label={ihe.type}
                size="small"
                sx={{ mt: 0.5, textTransform: "capitalize" }}
              />
            </Box>

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
                Valeur comptable
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary" sx={{ mt: 0.5 }}>
                {formatMoney(ihe.valeurComptable)}
              </Typography>
            </Box>

            <Box>
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}>
                  Localisation
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ pl: 2.5 }}>
                {ihe.adresse && `${ihe.adresse}, `}
                {ihe.ville}
                {ihe.quartier && `, ${ihe.quartier}`}
              </Typography>
            </Box>

            <Divider />

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<Visibility />}
                onClick={() => navigate(`/banque/ihe/${ihe.id}`)}
                fullWidth
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                Détails
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Directions />}
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps?q=${ihe.latitude},${ihe.longitude}`,
                    "_blank"
                  );
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Itinéraire
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popup>
    </Marker>
  );
};

// Composant pour afficher tous les Marker
const IHEMarkers = ({ ihes, iheIcon, formatMoney, STATUT_LABELS, STATUT_COLORS, navigate }) => {
  console.log("=== IHEMarkers Component ===");
  console.log("Type de ihes:", Array.isArray(ihes) ? "Array ✅" : typeof ihes);
  console.log("Nombre d'IHE reçues:", ihes?.length || 0);
  console.log("Contenu de ihes:", ihes);
  
  const validIhes = (Array.isArray(ihes) ? ihes : []).filter(ihe => {
    if (!ihe || typeof ihe !== 'object') return false;
    const lat = Number(ihe.latitude);
    const lng = Number(ihe.longitude);
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });
  
  console.log("IHE valides après filtrage:", validIhes.length);

  // Grouper les IHE par coordonnées pour détecter les doublons
  const coordinatesMap = new Map();
  validIhes.forEach(ihe => {
    const lat = Number(ihe.latitude);
    const lng = Number(ihe.longitude);
    const key = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
    if (!coordinatesMap.has(key)) {
      coordinatesMap.set(key, []);
    }
    coordinatesMap.get(key).push(ihe);
  });

  console.log(`=== RENDERING MARKERS ===`);
  console.log(`Total IHE: ${ihes.length}`);
  console.log(`IHE avec coordonnées valides: ${validIhes.length}`);
  console.log(`Coordonnées uniques: ${coordinatesMap.size}`);
  
  // Afficher les groupes de coordonnées identiques
  let hasDuplicates = false;
  coordinatesMap.forEach((ihesAtSameLocation, coords) => {
    if (ihesAtSameLocation.length > 1) {
      hasDuplicates = true;
      console.warn(`⚠️ ${ihesAtSameLocation.length} IHE ont les mêmes coordonnées (${coords}):`, 
        ihesAtSameLocation.map(i => `${i.titre} (${i.id})`));
    }
  });
  
  if (!hasDuplicates && validIhes.length < ihes.length) {
    console.warn(`⚠️ ${ihes.length - validIhes.length} IHE n'ont pas de coordonnées valides`);
  }

  // Fonction pour décaler légèrement les coordonnées si plusieurs IHE sont au même endroit
  const getOffsetPosition = (lat, lng, index, total) => {
    if (total <= 1) return [lat, lng];
    // Décalage en spirale pour éviter la superposition
    // Augmenter le rayon pour mieux séparer les points
    const angle = (index * 2 * Math.PI) / total;
    const radius = 0.005; // ~500 mètres (augmenté pour mieux séparer visuellement les points)
    const offsetLat = lat + radius * Math.cos(angle);
    const offsetLng = lng + radius * Math.sin(angle);
    
    console.log(`Décalage IHE ${index + 1}/${total}:`, {
      original: [lat, lng],
      offset: [offsetLat, offsetLng],
      angle: (angle * 180 / Math.PI).toFixed(2) + '°'
    });
    
    return [offsetLat, offsetLng];
  };

  // S'assurer que tous les Marker sont créés même s'ils ont les mêmes coordonnées
  const markersToRender = validIhes.map((ihe, index) => {
    const lat = Number(ihe.latitude);
    const lng = Number(ihe.longitude);
    const uniqueKey = ihe.id || ihe._id || `ihe-${index}-${lat}-${lng}`;
    
    // Trouver combien d'IHE ont les mêmes coordonnées
    const coordsKey = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
    const ihesAtSameLocation = coordinatesMap.get(coordsKey) || [];
    const indexInGroup = ihesAtSameLocation.findIndex(i => 
      (i.id || i._id) === (ihe.id || ihe._id)
    );
    
    // Décaler la position si plusieurs IHE sont au même endroit
    const [finalLat, finalLng] = getOffsetPosition(
      lat, 
      lng, 
      indexInGroup >= 0 ? indexInGroup : index, 
      ihesAtSameLocation.length > 0 ? ihesAtSameLocation.length : 1
    );

    return {
      ihe,
      key: uniqueKey,
      position: [finalLat, finalLng],
      originalPosition: [lat, lng],
      indexInGroup: indexInGroup >= 0 ? indexInGroup : index,
      sameLocationCount: ihesAtSameLocation.length > 0 ? ihesAtSameLocation.length : 1
    };
  });

  console.log(`Création de ${markersToRender.length} Marker(s)`);
  markersToRender.forEach((marker, idx) => {
    console.log(`Marker ${idx + 1}:`, {
      titre: marker.ihe.titre,
      key: marker.key,
      originalCoords: marker.originalPosition,
      finalCoords: marker.position,
      sameLocationCount: marker.sameLocationCount,
      indexInGroup: marker.indexInGroup
    });
  });

  // Utiliser useEffect pour s'assurer que tous les Marker sont rendus
  useEffect(() => {
    console.log(`🔄 IHEMarkers: ${markersToRender.length} Marker(s) à rendre`);
  }, [markersToRender.length]);

  return (
    <>
      {markersToRender.map((markerData, idx) => {
        console.log(`📍 Rendu Marker ${idx + 1}/${markersToRender.length}: ${markerData.ihe.titre} à [${markerData.position[0]}, ${markerData.position[1]}]`);
        return (
          <IHEMarker
            key={`marker-${markerData.key}-${idx}`}
            ihe={markerData.ihe}
            position={markerData.position}
            iheIcon={iheIcon}
            formatMoney={formatMoney}
            STATUT_LABELS={STATUT_LABELS}
            STATUT_COLORS={STATUT_COLORS}
            navigate={navigate}
          />
        );
      })}
    </>
  );
};

const IHECartePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ihes, setIhes] = useState([]);
  const [mapCenter, setMapCenter] = useState([13.5127, 2.1126]); // Niamey par défaut
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    fetchIHEs();
  }, []);

  const fetchIHEs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/banque/ihe/carte");
      
      console.log("=== DEBUG API RESPONSE ===");
      console.log("Response complète:", response.data);
      console.log("Type de response.data.ihes:", Array.isArray(response.data.ihes) ? "Array ✅" : typeof response.data.ihes);
      
      // S'assurer que c'est bien un tableau
      let ihesData = [];
      if (Array.isArray(response.data.ihes)) {
        ihesData = response.data.ihes;
      } else if (response.data.ihes && typeof response.data.ihes === 'object') {
        // Si c'est un objet, essayer de le convertir en tableau
        console.warn("⚠️ response.data.ihes est un objet, tentative de conversion");
        ihesData = Object.values(response.data.ihes);
      } else {
        console.error("❌ response.data.ihes n'est ni un tableau ni un objet:", response.data.ihes);
        ihesData = [];
      }
      
      console.log("Total IHE après traitement:", ihesData.length);
      console.log("Première IHE:", ihesData[0]);
      
      // Filtrer et valider les IHE avec coordonnées valides
      const validIhes = ihesData.filter(ihe => {
        if (!ihe || typeof ihe !== 'object') {
          console.warn("IHE invalide (pas un objet):", ihe);
          return false;
        }
        const lat = Number(ihe.latitude);
        const lng = Number(ihe.longitude);
        const isValid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        if (!isValid) {
          console.warn(`IHE sans coordonnées valides: ${ihe.titre || ihe.id}`, {
            latitude: ihe.latitude,
            longitude: ihe.longitude,
            latNumber: lat,
            lngNumber: lng
          });
        }
        return isValid;
      });
      
      console.log("=== RÉSULTAT FINAL ===");
      console.log("Total IHE reçues:", ihesData.length);
      console.log("IHE avec coordonnées valides:", validIhes.length);
      
      // Log détaillé de chaque IHE valide
      validIhes.forEach((ihe, idx) => {
        console.log(`✅ IHE ${idx + 1}/${validIhes.length}:`, {
          id: ihe.id,
          titre: ihe.titre,
          latitude: ihe.latitude,
          longitude: ihe.longitude,
          coords: [Number(ihe.latitude), Number(ihe.longitude)]
        });
      });
      
      console.log("========================");
      
      setIhes(validIhes);

      // Centrer la carte sur la première IHE ou Niamey
      if (validIhes.length > 0) {
        const firstIhe = validIhes[0];
        setMapCenter([Number(firstIhe.latitude), Number(firstIhe.longitude)]);
        // Ajuster le zoom pour mieux voir tous les points
        if (validIhes.length > 1) {
          setMapZoom(14); // Zoom plus proche pour mieux voir les points séparés
        }
      }
    } catch (err) {
      console.error("Erreur chargement IHE:", err);
      setError("Erreur lors du chargement des IHE");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(15);
        },
        (error) => {
          console.error("Erreur géolocalisation:", error);
        }
      );
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const STATUT_COLORS = {
    en_attente_validation: "warning",
    valide: "success",
    rejete: "error",
    en_vente: "info",
    vendu: "success",
  };

  const STATUT_LABELS = {
    en_attente_validation: "En attente",
    valide: "Validée",
    rejete: "Rejetée",
    en_vente: "En vente",
    vendu: "Vendue",
  };

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* En-tête moderne */}
        <Card
          elevation={4}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            mb: 4,
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: "300px",
              height: "300px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)",
            },
          }}
        >
          <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: 64,
                    height: 64,
                    border: "3px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <MapIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Carte des Immobilisations Hors Exploitation
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Visualisez géographiquement toutes vos IHE et explorez leur localisation
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<MyLocation />}
                  onClick={getUserLocation}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  Ma position
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate("/banque/ihe")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Retour
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Statistiques modernisées */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Total IHE sur carte
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {ihes.length}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Home sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                color: "white",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Validées
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {ihes.filter((i) => i.statut === "valide").length}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                color: "white",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      En vente
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {ihes.filter((i) => i.statut === "en_vente").length}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <ShoppingCart sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                color: "white",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Valeur totale
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                      {formatMoney(ihes.reduce((sum, i) => sum + (i.valeurComptable || 0), 0))}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <AttachMoney sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Carte */}
        <Card elevation={4} sx={{ overflow: "hidden", borderRadius: 2 }}>
          <Box sx={{ height: "70vh", position: "relative", overflow: "hidden" }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Chargement de la carte...
                </Typography>
              </Box>
            ) : ihes.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  p: 4,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.light",
                    width: 80,
                    height: 80,
                    mb: 2,
                  }}
                >
                  <MapIcon sx={{ fontSize: 48 }} />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                  Aucune IHE avec coordonnées géographiques
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 500 }}>
                  Ajoutez des coordonnées GPS lors de la création ou la modification des IHE pour les visualiser sur la carte
                </Typography>
              </Box>
            ) : (
            <MapContainer
              key={`map-${ihes.length}`}
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenter center={mapCenter} zoom={mapZoom} />
              <IHEMarkers 
                ihes={ihes}
                iheIcon={iheIcon}
                formatMoney={formatMoney}
                STATUT_LABELS={STATUT_LABELS}
                STATUT_COLORS={STATUT_COLORS}
                navigate={navigate}
              />
            </MapContainer>
            )}
          </Box>
        </Card>

        {/* Liste des IHE sans coordonnées */}
        {ihes.filter((i) => !i.latitude || !i.longitude).length > 0 && (
          <Card
            elevation={2}
            sx={{
              mt: 3,
              borderLeft: "4px solid",
              borderColor: "info.main",
              bgcolor: "info.50",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <LocationOn />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    IHE sans coordonnées géographiques
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ihes.filter((i) => !i.latitude || !i.longitude).length} IHE n'ont pas de coordonnées GPS.
                    Vous pouvez les modifier pour les ajouter et les voir sur la carte.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => navigate("/banque/ihe")}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Voir la liste
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </PageLayout>
  );
};

export default IHECartePage;

