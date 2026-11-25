import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  GridLegacy as Grid,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  Stack,
  FormControlLabel,
  Checkbox,
  Paper,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  AddPhotoAlternate,
  Delete,
  LocationOn,
  AttachMoney,
  Bed,
  Bathroom,
  SquareFoot,
  DirectionsCar,
  HomeWork,
  Wifi,
  LocalLaundryService,
  AcUnit,
  Bathtub,
  Balcony,
  Shield,
  Elevator,
  CheckCircle,
} from "@mui/icons-material";
import { Business as FIBusiness, Chair as FIChair, HomeWork as FIHomeWork, Info as FIInfo, LocationCity as FILocationCity, LocationOn as FILocationOn, Notes as FINotes, Place as FIPlace, Title as FITitle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PageLayout from "../../components/admin/AdminLayout";
import SectionCard from "../../components/admin/SectionCard";
import api from "../../services/api";

// Couleur et icône de la carte, une par étape
const STEP_STYLES = [
  { color: "#3030F9", icon: "info" },
  { color: "#0A7C4F", icon: "tune" },
  { color: "#0e1133", icon: "checklist" },
  { color: "#3030F9", icon: "photo" },
];

const StepCard = ({ step, title, children }) => {
  const s = STEP_STYLES[step] || STEP_STYLES[0];
  return (
    <SectionCard title={title} color={s.color} icon={s.icon} sx={{ mb: 0 }}>
      {children}
    </SectionCard>
  );
};

const steps = [
  "Informations de base",
  "Caractéristiques",
  "Services et équipements",
  "Photos et localisation",
];

const EditLocationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [agences, setAgences] = useState([]);

  // Formulaire principal
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    typeBien: "Appartement",
    ville: "",
    quartier: "",
    adresse: "",
    superficie: "",
    prixMensuel: "",
    depotGarantie: "",
    nombreChambres: "",
    nombreSalons: "",
    nombreSallesDeBain: "",
    meuble: false,
    statut: "disponible",
    agenceId: user?.role === "Admin" ? "" : user?.agenceId || "",
  });

  // Services et équipements
  const [services, setServices] = useState({
    wifi: false,
    climatisation: false,
    laveLinge: false,
    parking: false,
    ascenseur: false,
    gardiennage: false,
    balcon: false,
    terrasse: false,
  });

  // Photos
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Géolocalisation
  const [coordinates, setCoordinates] = useState({
    latitude: "",
    longitude: "",
  });

  // Charger les données de la location
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoadingData(true);
        const response = await api.get(`/agence/locations/${id}`);
        const location = response.data;
        
        console.log("📍 [EDIT_LOCATION] Données chargées:", location);
        
        // Mapper les données de la location vers le formulaire
        setFormData({
          titre: location.titre || "",
          description: location.description || "",
          typeBien: location.type || "Appartement",
          ville: location.ville || "",
          quartier: location.quartier || "",
          adresse: location.adresse || "",
          superficie: location.superficie?.toString() || "",
          prixMensuel: location.prixMensuel?.toString() || "",
          depotGarantie: location.caution?.toString() || "",
          nombreChambres: location.chambres?.toString() || "",
          nombreSalons: location.salon ? "1" : "0",
          nombreSallesDeBain: location.salleDeBain?.toString() || "",
          meuble: location.meuble || false,
          statut: location.statut || "disponible",
          agenceId: location.agenceId?._id || "",
        });

        // Mapper les services
        setServices({
          wifi: location.internet || false,
          climatisation: location.climatisation || false,
          laveLinge: false, // Pas dans le modèle
          parking: location.parking || false,
          ascenseur: location.ascenseur || false,
          gardiennage: location.garage || false,
          balcon: location.balcon || false,
          terrasse: false, // Pas dans le modèle
        });

        // Mapper les coordonnées
        if (location.coordonnees) {
          setCoordinates({
            latitude: location.coordonnees.latitude?.toString() || "",
            longitude: location.coordonnees.longitude?.toString() || "",
          });
        }

        // Mapper les images existantes
        if (location.images && location.images.length > 0) {
          setExistingImages(location.images);
        }

      } catch (error) {
        console.error("Erreur lors du chargement de la location:", error);
        setError("Erreur lors du chargement de la location");
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchLocationData();
    }
  }, [id]);

  // Charger les agences pour les Admins
  useEffect(() => {
    if (user?.role === "Admin") {
      const fetchAgences = async () => {
        try {
          const response = await api.get("/admin/agences");
          setAgences(response.data || []);
        } catch (error) {
          console.error("Erreur lors du chargement des agences:", error);
        }
      };
      fetchAgences();
    }
  }, [user?.role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServiceChange = (e) => {
    const { name, checked } = e.target;
    setServices((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photoFiles.length + files.length > 8) {
      setError("Maximum 8 photos autorisées");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoFiles((prev) => [...prev, file]);
        setPhotoPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Fonctions de géolocalisation
  const handleCoordinateChange = (field, value) => {
    setCoordinates((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ latitude: lat.toString(), longitude: lng.toString() });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setError("Impossible d'obtenir votre position actuelle");
        }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par ce navigateur");
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeStep !== steps.length - 1) {
      handleNext();
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Validation des champs requis
      if (!formData.titre || !formData.description || !formData.ville || !formData.quartier) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }

      if (photoFiles.length + existingImages.length < 2) {
        setError("Veuillez ajouter au moins 2 photos");
        setActiveStep(3);
        return;
      }

      // Créer FormData
      const data = new FormData();

      // Données de base
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      // Services
      data.append("services", JSON.stringify(services));

      // Coordonnées GPS
      if (coordinates.latitude && coordinates.longitude) {
        data.append("latitude", coordinates.latitude);
        data.append("longitude", coordinates.longitude);
      }

      // Photos nouvelles
      photoFiles.forEach((file) => {
        data.append("images", file);
      });

      // Images existantes à conserver
      data.append("existingImages", JSON.stringify(existingImages));

      const res = await api.put(`/agence/locations/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Location modifiée avec succès !");
      setTimeout(() => {
        navigate("/admin/locations");
      }, 1500);
    } catch (err) {
      console.error("Erreur modification location:", err);
      setError(err.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Titre de l'annonce", title: "Titre de l'annonce" }}
                placeholder="Titre de l'annonce *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FITitle color="action" />
                    </InputAdornment>
                  ),
                }}
                name="titre"
                value={formData.titre}
                onChange={handleChange}
              />
            </Grid>

            {user?.role === "Admin" && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Select
                    name="agenceId"
                    startAdornment={<InputAdornment position="start"><FIBusiness color="action" /></InputAdornment>}
                    value={formData.agenceId}
                    onChange={handleChange}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <span style={{ color: "#9aa4b2" }}>Sélectionnez une agence</span>;
                      }
                      const ag = agences.find((a) => a._id === selected);
                      return ag ? `${ag.nom} - ${ag.ville}` : selected;
                    }}
                  >
                    <MenuItem value="" disabled>
                      Sélectionnez une agence
                    </MenuItem>
                    {agences.length === 0 ? (
                      <MenuItem value="" disabled>
                        Aucune agence disponible
                      </MenuItem>
                    ) : (
                      agences.map((agence) => (
                        <MenuItem key={agence._id} value={agence._id}>
                          {agence.nom} - {agence.ville}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                inputProps={{ "aria-label": "Description", title: "Description" }}
                placeholder="Description *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                      <FINotes color="action" />
                    </InputAdornment>
                  ),
                }}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Select
                  name="typeBien"
                  startAdornment={<InputAdornment position="start"><FIHomeWork color="action" /><Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Type de bien</Typography></InputAdornment>}
                  value={formData.typeBien}
                  onChange={handleChange}
                >
                  <MenuItem value="Villa">Villa</MenuItem>
                  <MenuItem value="Appartement">Appartement</MenuItem>
                  <MenuItem value="Studio">Studio</MenuItem>
                  <MenuItem value="Maison">Maison</MenuItem>
                  <MenuItem value="Duplex">Duplex</MenuItem>
                  <MenuItem value="Chambre">Chambre</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Select
                  name="statut"
                  startAdornment={<InputAdornment position="start"><FIInfo color="action" /><Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Statut</Typography></InputAdornment>}
                  value={formData.statut}
                  onChange={handleChange}
                >
                  <MenuItem value="disponible">Disponible</MenuItem>
                  <MenuItem value="loue">Loué</MenuItem>
                  <MenuItem value="indisponible">Indisponible</MenuItem>
                  <MenuItem value="en_attente">En attente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Ville", title: "Ville" }}
                placeholder="Ville (ex. Niamey) *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FILocationCity color="action" />
                    </InputAdornment>
                  ),
                }}
                name="ville"
                value={formData.ville}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Quartier", title: "Quartier" }}
                placeholder="Quartier (ex. Plateau) *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIPlace color="action" />
                    </InputAdornment>
                  ),
                }}
                name="quartier"
                value={formData.quartier}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Adresse", title: "Adresse" }}
                placeholder="Adresse *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FILocationOn color="action" />
                    </InputAdornment>
                  ),
                }}
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ "aria-label": "Superficie (m²)", title: "Superficie (m²)" }}
                placeholder="Superficie (m²) *"
                name="superficie"
                value={formData.superficie}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ "aria-label": "Nombre de chambres", title: "Nombre de chambres" }}
                placeholder="Nbre de chambres *"
                name="nombreChambres"
                value={formData.nombreChambres}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Bed />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ "aria-label": "Nombre de salons", title: "Nombre de salons" }}
                placeholder="Nbre de salons"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIChair color="action" />
                    </InputAdornment>
                  ),
                }}
                name="nombreSalons"
                value={formData.nombreSalons}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ "aria-label": "Nombre de salles de bain", title: "Nombre de salles de bain" }}
                placeholder="Nbre de salles de bain *"
                name="nombreSallesDeBain"
                value={formData.nombreSallesDeBain}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Bathroom />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ "aria-label": "Prix mensuel (FCFA)", title: "Prix mensuel (FCFA)" }}
                placeholder="Prix mensuel (FCFA) *"
                name="prixMensuel"
                value={formData.prixMensuel}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ "aria-label": "Dépôt de garantie (FCFA)", title: "Dépôt de garantie (FCFA)" }}
                placeholder="Dépôt de garantie (FCFA) *"
                name="depotGarantie"
                value={formData.depotGarantie}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="meuble"
                    checked={formData.meuble}
                    onChange={handleChange}
                  />
                }
                label="Bien meublé"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sélectionnez les équipements disponibles
              </Typography>
            </Grid>

            {[
              { name: "wifi", label: "WiFi", icon: Wifi },
              { name: "climatisation", label: "Climatisation", icon: AcUnit },
              { name: "laveLinge", label: "Lave-linge", icon: LocalLaundryService },
              { name: "parking", label: "Parking", icon: DirectionsCar },
              { name: "ascenseur", label: "Ascenseur", icon: Elevator },
              { name: "gardiennage", label: "Gardiennage", icon: Shield },
              { name: "balcon", label: "Balcon", icon: Balcony },
              { name: "terrasse", label: "Terrasse", icon: HomeWork },
            ].map((service) => {
              const Icon = service.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={service.name}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      borderRadius: 2.5,
                      transition: "all 0.2s",
                      border: services[service.name] ? "2px solid #3030F9" : "1px solid #e3e8ef",
                      bgcolor: services[service.name] ? "rgba(48,48,249,0.06)" : "transparent",
                      "&:hover": { transform: "translateY(-3px)", borderColor: "#3030F9" },
                    }}
                    onClick={() => handleServiceChange({
                      target: { name: service.name, checked: !services[service.name] }
                    })}
                  >
                    <Icon
                      sx={{
                        fontSize: 32,
                        color: services[service.name] ? "#3030F9" : "text.secondary",
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={services[service.name] ? "bold" : "normal"}
                      color={services[service.name] ? "#3030F9" : "text.secondary"}
                    >
                      {service.label}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Photos du bien
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ajoutez au moins 2 photos (maximum 8)
              </Typography>
            </Grid>

            {/* Images existantes */}
            {existingImages.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Images actuelles
                </Typography>
                <Grid container spacing={2}>
                  {existingImages.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box
                        sx={{
                          position: "relative",
                          border: "1px solid #ddd",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={image.url}
                          alt={image.alt}
                          style={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "error.main",
                            color: "white",
                            "&:hover": { bgcolor: "error.dark" },
                          }}
                          onClick={() => removeExistingImage(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="upload-photos"
                multiple
                type="file"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="upload-photos">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AddPhotoAlternate />}
                  fullWidth
                  sx={{ py: 2, mb: 3, borderRadius: 2.5, borderStyle: "dashed", borderColor: "#3030F9", color: "#3030F9", "&:hover": { borderColor: "#2020C8", bgcolor: "rgba(48,48,249,0.06)" } }}
                >
                  {photoFiles.length === 0
                    ? "Ajouter des photos"
                    : `Ajouter plus de photos (${photoFiles.length}/8)`}
                </Button>
              </label>
            </Grid>

            {photoPreviews.length > 0 && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {photoPreviews.map((preview, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box
                        sx={{
                          position: "relative",
                          border: "1px solid #ddd",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "error.main",
                            color: "white",
                            "&:hover": { bgcolor: "error.dark" },
                          }}
                          onClick={() => removePhoto(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            {/* Section Géolocalisation */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: "text-bottom" }} />Géolocalisation du bien
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Indiquez les coordonnées GPS du bien pour permettre aux clients de le localiser facilement
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Latitude", title: "Latitude" }}
                placeholder="Latitude (ex. 13.5116)"
                type="number"
                value={coordinates.latitude}
                onChange={(e) => handleCoordinateChange("latitude", e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">°</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Longitude", title: "Longitude" }}
                placeholder="Longitude (ex. 2.1254)"
                type="number"
                value={coordinates.longitude}
                onChange={(e) => handleCoordinateChange("longitude", e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">°</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={getCurrentLocation}
                startIcon={<LocationOn />}
                sx={{ mb: 2, color: "#3030F9", borderColor: "#3030F9", "&:hover": { borderColor: "#2020C8", bgcolor: "rgba(48,48,249,0.06)" } }}
              >
                Utiliser ma position actuelle
              </Button>
            </Grid>

            {coordinates.latitude && coordinates.longitude && (
              <Grid item xs={12}>
                <Card sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: "text-bottom" }} />Coordonnées sélectionnées
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latitude: {coordinates.latitude}° | Longitude: {coordinates.longitude}°
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ces coordonnées permettront aux clients de localiser précisément votre bien
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  if (loadingData) {
    return (
      <PageLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Chargement de la location...
            </Typography>
          </Box>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/admin/locations")}
            sx={{ mb: 2 }}
          >
            Retour
          </Button>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: "#3030F9",
              color: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                }}
              >
                <AddPhotoAlternate fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Modifier la location
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Modifiez les informations de votre annonce
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Stepper */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: "1px solid #e3e8ef",
            "& .MuiStepIcon-root.Mui-active": { color: "#3030F9" },
            "& .MuiStepIcon-root.Mui-completed": { color: "#3030F9" },
            "& .MuiStepLabel-label.Mui-active": { fontWeight: 700 },
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Formulaire */}
        <Box component="form" onSubmit={handleSubmit} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 }, "& legend": { display: "none" } }}>
          <Paper elevation={0} sx={{ p: 0, bgcolor: "transparent" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <StepCard step={activeStep} title={steps[activeStep]}>
{renderStepContent()}
</StepCard>

            <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
                color="inherit"
                sx={{ borderRadius: 2 }}
              >
                Précédent
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={<CheckCircle />}
                  sx={{ borderRadius: 2, px: 3, bgcolor: "#3030F9", boxShadow: "none", "&:hover": { bgcolor: "#2020C8", boxShadow: "none" } }}
                >
                  {loading ? "Modification en cours..." : "Modifier la location"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowBack sx={{ transform: "scaleX(-1)" }} />}
                  sx={{ borderRadius: 2, px: 3, bgcolor: "#3030F9", boxShadow: "none", "&:hover": { bgcolor: "#2020C8", boxShadow: "none" } }}
                >
                  Suivant
                </Button>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={success || error}
        />
      </Container>
    </PageLayout>
  );
};

export default EditLocationPage;
