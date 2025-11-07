import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
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
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

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

      setSuccess("✅ Location modifiée avec succès !");
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
                label="Titre de l'annonce *"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Appartement moderne 2 chambres à Ouaga 2000"
              />
            </Grid>

            {user?.role === "Admin" && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Agence *</InputLabel>
                  <Select
                    name="agenceId"
                    value={formData.agenceId}
                    onChange={handleChange}
                    label="Agence *"
                  >
                    {agences.map((agence) => (
                      <MenuItem key={agence._id} value={agence._id}>
                        {agence.nom} - {agence.ville}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre bien en détail..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type de bien *</InputLabel>
                <Select
                  name="typeBien"
                  value={formData.typeBien}
                  onChange={handleChange}
                  label="Type de bien *"
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
                <InputLabel>Statut *</InputLabel>
                <Select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  label="Statut *"
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
                label="Ville *"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                placeholder="Ex: Ouagadougou"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quartier *"
                name="quartier"
                value={formData.quartier}
                onChange={handleChange}
                placeholder="Ex: Ouaga 2000"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Adresse *"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Ex: Rue 12.34, Secteur 15"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Caractéristiques principales
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Superficie (m²) *"
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
                label="Nombre de chambres *"
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
                label="Nombre de salons"
                name="nombreSalons"
                value={formData.nombreSalons}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Nombre de salles de bain *"
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
                label="Prix mensuel (FCFA) *"
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
                label="Dépôt de garantie (FCFA) *"
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
              <Typography variant="h6" gutterBottom>
                Services et équipements
              </Typography>
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
                    elevation={services[service.name] ? 4 : 1}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      border: services[service.name] ? "2px solid #ff5722" : "2px solid transparent",
                      bgcolor: services[service.name] ? "rgba(255, 87, 34, 0.1)" : "background.paper",
                    }}
                    onClick={() => handleServiceChange({
                      target: { name: service.name, checked: !services[service.name] }
                    })}
                  >
                    <Icon
                      sx={{
                        fontSize: 32,
                        color: services[service.name] ? "#ff5722" : "text.secondary",
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={services[service.name] ? "bold" : "normal"}
                      color={services[service.name] ? "#ff5722" : "text.secondary"}
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
                  variant="contained"
                  component="span"
                  startIcon={<AddPhotoAlternate />}
                  fullWidth
                  sx={{ py: 2, mb: 3 }}
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
                📍 Géolocalisation du bien
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Indiquez les coordonnées GPS du bien pour permettre aux clients de le localiser facilement
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={coordinates.latitude}
                onChange={(e) => handleCoordinateChange("latitude", e.target.value)}
                placeholder="Ex: 12.3714"
                InputProps={{
                  endAdornment: <InputAdornment position="end">°</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={coordinates.longitude}
                onChange={(e) => handleCoordinateChange("longitude", e.target.value)}
                placeholder="Ex: -1.5197"
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
                sx={{ mb: 2 }}
              >
                Utiliser ma position actuelle
              </Button>
            </Grid>

            {coordinates.latitude && coordinates.longitude && (
              <Grid item xs={12}>
                <Card sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📍 Coordonnées sélectionnées
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
            elevation={3}
            sx={{
              p: 4,
              background: "linear-gradient(135deg, #ff5722 0%, #ff7043 100%)",
              color: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "white",
                  color: "#ff5722",
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
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <Paper elevation={3} sx={{ p: 4 }}>
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

            {renderStepContent()}

            <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
              >
                Précédent
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={<CheckCircle />}
                >
                  {loading ? "Modification en cours..." : "Modifier la location"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowBack sx={{ transform: "scaleX(-1)" }} />}
                >
                  Suivant
                </Button>
              )}
            </Box>
          </Paper>
        </form>

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
