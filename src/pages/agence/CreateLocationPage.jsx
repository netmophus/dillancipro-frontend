import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  GridLegacy as Grid,
  InputAdornment,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Divider,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Home,
  LocationOn,
  AttachMoney,
  PhotoCamera,
  Description,
  CheckCircle,
} from "@mui/icons-material";
import { AttachMoney as FIAttachMoney, Bathtub as FIBathtub, Bed as FIBed, CalendarMonth as FICalendarMonth, Explore as FIExplore, Flag as FIFlag, Home as FIHome, LocationCity as FILocationCity, LocationOn as FILocationOn, MarkunreadMailbox as FIMarkunreadMailbox, MyLocation as FIMyLocation, Notes as FINotes, Place as FIPlace, Receipt as FIReceipt, Savings as FISavings, Schedule as FISchedule, Square as FISquare, Title as FITitle, Videocam as FIVideocam } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AgenceLayout from "../../components/agence/AgenceLayout";
import SectionCard from "../../components/admin/SectionCard";
import AgencePageHeader from "../../components/agence/AgencePageHeader";
import api from "../../services/api";

const CreateLocationPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Informations de base
    titre: "",
    description: "",
    type: "Appartement",
    
    // Localisation
    ville: "",
    quartier: "",
    adresse: "",
    codePostal: "",
    latitude: "",
    longitude: "",
    
    // Caractéristiques
    superficie: "",
    chambres: "",
    salleDeBain: "",
    cuisine: true,
    salon: true,
    balcon: false,
    jardin: false,
    garage: false,
    parking: false,
    ascenseur: false,
    climatisation: false,
    chauffage: false,
    internet: false,
    meuble: false,
    
    // Prix et conditions
    prixMensuel: "",
    caution: "",
    charges: "",
    chargesIncluses: false,
    
    // Disponibilité
    statut: "disponible",
    dateDisponibilite: "",
    dureeMinimale: "1",
    dureeMaximale: "",
    
    // Médias
    images: [],
    videoUrl: "",
    
    // Documents
    documents: []
  });

  const steps = [
    "Informations de base",
    "Localisation",
    "Caractéristiques",
    "Prix et conditions",
    "Médias et documents",
    "Validation"
  ];

  const STEP_CARDS = [
    { title: "Informations de base", color: "#3030F9", icon: "info" },
    { title: "Localisation", color: "#0A7C4F", icon: "location" },
    { title: "Caractéristiques", color: "#0e1133", icon: "tune" },
    { title: "Prix et conditions", color: "#3030F9", icon: "description" },
    { title: "Médias et documents", color: "#0A7C4F", icon: "photo" },
    { title: "Validation", color: "#0e1133", icon: "checklist" },
  ];

  const typesLogement = [
    "Villa", "Appartement", "Studio", "Maison", "Duplex", "Chambre", "Autre"
  ];

  const villes = [
    "Niamey", "Maradi", "Zinder", "Tahoua", "Agadez", "Dosso", "Tillabéri", "Diffa"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      // Validation des champs obligatoires
      const requiredFields = [
        'titre', 'description', 'ville', 'quartier', 'adresse', 
        'superficie', 'chambres', 'salleDeBain', 'prixMensuel', 
        'caution', 'dateDisponibilite'
      ];

      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(`Le champ ${field} est obligatoire`);
        }
      }

      // Préparation des données
      const locationData = {
        ...formData,
        superficie: parseInt(formData.superficie),
        chambres: parseInt(formData.chambres),
        salleDeBain: parseInt(formData.salleDeBain),
        prixMensuel: parseInt(formData.prixMensuel),
        caution: parseInt(formData.caution),
        charges: parseInt(formData.charges) || 0,
        dureeMinimale: parseInt(formData.dureeMinimale),
        dureeMaximale: formData.dureeMaximale ? parseInt(formData.dureeMaximale) : null,
        coordonnees: {
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0
        },
        dateDisponibilite: new Date(formData.dateDisponibilite)
      };

      const response = await api.post("/agence/locations", locationData);
      
      console.log("✅ Location créée:", response.data);
      
      // Redirection vers la liste des locations
      navigate("/agence/locations", { 
        state: { message: "Location créée avec succès!" } 
      });
      
    } catch (error) {
      console.error("❌ Erreur création location:", error);
      setError(error.response?.data?.message || "Erreur lors de la création de la location");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Titre de la location", title: "Titre de la location" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FITitle color="action" />
                    </InputAdornment>
                  ),
                }}
                value={formData.titre}
                onChange={(e) => handleInputChange("titre", e.target.value)}
                placeholder="Ex: Villa moderne 3 chambres avec jardin"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                inputProps={{ "aria-label": "Description détaillée", title: "Description détaillée" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                      <FINotes color="action" />
                    </InputAdornment>
                  ),
                }}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez le logement, ses avantages, le quartier..."
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                inputProps={{ "aria-label": "Type de logement", title: "Type de logement" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIHome color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Type de logement *</Typography>
                    </InputAdornment>
                  ),
                }}
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
              >
                {typesLogement.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                inputProps={{ "aria-label": "Statut", title: "Statut" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIFlag color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Statut *</Typography>
                    </InputAdornment>
                  ),
                }}
                value={formData.statut}
                onChange={(e) => handleInputChange("statut", e.target.value)}
              >
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="indisponible">Indisponible</MenuItem>
                <MenuItem value="en_attente">En attente</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                inputProps={{ "aria-label": "Ville", title: "Ville" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FILocationCity color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Ville *</Typography>
                    </InputAdornment>
                  ),
                }}
                value={formData.ville}
                onChange={(e) => handleInputChange("ville", e.target.value)}
                SelectProps={{ displayEmpty: true }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="" disabled>
                  Sélectionnez une ville
                </MenuItem>
                {villes.map((ville) => (
                  <MenuItem key={ville} value={ville}>
                    {ville}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Quartier", title: "Quartier" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIPlace color="action" />
                    </InputAdornment>
                  ),
                }}
                value={formData.quartier}
                onChange={(e) => handleInputChange("quartier", e.target.value)}
                placeholder="Ex: Plateau, Cité, etc."
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Adresse complète", title: "Adresse complète" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FILocationOn color="action" />
                    </InputAdornment>
                  ),
                }}
                value={formData.adresse}
                onChange={(e) => handleInputChange("adresse", e.target.value)}
                placeholder="Ex: Rue de la Paix, N°123"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Code postal", title: "Code postal" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIMarkunreadMailbox color="action" />
                    </InputAdornment>
                  ),
                }}
                value={formData.codePostal}
                onChange={(e) => handleInputChange("codePostal", e.target.value)}
                placeholder="Ex: 10000"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Latitude", title: "Latitude" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIMyLocation color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.latitude}
                onChange={(e) => handleInputChange("latitude", e.target.value)}
                placeholder="Latitude (ex. 13.5137)"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Longitude", title: "Longitude" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIExplore color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.longitude}
                onChange={(e) => handleInputChange("longitude", e.target.value)}
                placeholder="Longitude (ex. 2.1098)"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Superficie (m²)", title: "Superficie (m²)" }}
                placeholder="Superficie (m²) *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FISquare color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.superficie}
                onChange={(e) => handleInputChange("superficie", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Nombre de chambres", title: "Nombre de chambres" }}
                placeholder="Nbre de chambres *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIBed color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.chambres}
                onChange={(e) => handleInputChange("chambres", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Salles de bain", title: "Salles de bain" }}
                placeholder="Nbre de salles de bain *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIBathtub color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.salleDeBain}
                onChange={(e) => handleInputChange("salleDeBain", e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Équipements et commodités
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.cuisine}
                      onChange={(e) => handleInputChange("cuisine", e.target.checked)}
                    />
                  }
                  label="Cuisine"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.salon}
                      onChange={(e) => handleInputChange("salon", e.target.checked)}
                    />
                  }
                  label="Salon"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.balcon}
                      onChange={(e) => handleInputChange("balcon", e.target.checked)}
                    />
                  }
                  label="Balcon"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.jardin}
                      onChange={(e) => handleInputChange("jardin", e.target.checked)}
                    />
                  }
                  label="Jardin"
                />
              </Stack>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.garage}
                      onChange={(e) => handleInputChange("garage", e.target.checked)}
                    />
                  }
                  label="Garage"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.parking}
                      onChange={(e) => handleInputChange("parking", e.target.checked)}
                    />
                  }
                  label="Parking"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.ascenseur}
                      onChange={(e) => handleInputChange("ascenseur", e.target.checked)}
                    />
                  }
                  label="Ascenseur"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.climatisation}
                      onChange={(e) => handleInputChange("climatisation", e.target.checked)}
                    />
                  }
                  label="Climatisation"
                />
              </Stack>
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.chauffage}
                      onChange={(e) => handleInputChange("chauffage", e.target.checked)}
                    />
                  }
                  label="Chauffage"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.internet}
                      onChange={(e) => handleInputChange("internet", e.target.checked)}
                    />
                  }
                  label="Internet"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.meuble}
                      onChange={(e) => handleInputChange("meuble", e.target.checked)}
                    />
                  }
                  label="Meublé"
                />
              </Stack>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Prix mensuel (FCFA)", title: "Prix mensuel (FCFA)" }}
                placeholder="Prix mensuel (FCFA) *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIAttachMoney color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.prixMensuel}
                onChange={(e) => handleInputChange("prixMensuel", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Caution (FCFA)", title: "Caution (FCFA)" }}
                placeholder="Caution (FCFA) *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FISavings color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.caution}
                onChange={(e) => handleInputChange("caution", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Charges mensuelles (FCFA)", title: "Charges mensuelles (FCFA)" }}
                placeholder="Charges mensuelles (FCFA)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIReceipt color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.charges}
                onChange={(e) => handleInputChange("charges", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.chargesIncluses}
                    onChange={(e) => handleInputChange("chargesIncluses", e.target.checked)}
                  />
                }
                label="Charges incluses dans le loyer"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Date de disponibilité", title: "Date de disponibilité" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FICalendarMonth color="action" />
                    </InputAdornment>
                  ),
                }}
                type="date"
                value={formData.dateDisponibilite}
                onChange={(e) => handleInputChange("dateDisponibilite", e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Durée minimale (mois)", title: "Durée minimale (mois)" }}
                placeholder="Durée minimale (mois) *"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FISchedule color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.dureeMinimale}
                onChange={(e) => handleInputChange("dureeMinimale", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Durée maximale (mois)", title: "Durée maximale (mois)" }}
                placeholder="Durée maximale (mois)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FISchedule color="action" />
                    </InputAdornment>
                  ),
                }}
                type="number"
                value={formData.dureeMaximale}
                onChange={(e) => handleInputChange("dureeMaximale", e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ajoutez des photos et documents pour présenter votre location
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                component="label"
                fullWidth
                sx={{ py: 2 }}
              >
                Ajouter des photos
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                />
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                inputProps={{ "aria-label": "Lien vidéo (YouTube, Vimeo...)", title: "Lien vidéo (YouTube, Vimeo...)" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FIVideocam color="action" />
                    </InputAdornment>
                  ),
                }}
                value={formData.videoUrl}
                onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<Description />}
                component="label"
                fullWidth
                sx={{ py: 2 }}
              >
                Ajouter des documents
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.doc,.docx"
                />
              </Button>
            </Grid>
          </Grid>
        );

      case 5:
        return (
          <Box>
            <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: "1px solid rgba(15,23,42,0.08)" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {formData.titre}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {formData.description}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Chip label={formData.type} color="primary" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Chip label={`${formData.superficie} m²`} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Chip label={`${formData.chambres} chambre${formData.chambres > 1 ? 's' : ''}`} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Chip label={`${formData.salleDeBain} SDB`} />
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {new Intl.NumberFormat('fr-FR').format(formData.prixMensuel)} FCFA/mois
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {formData.ville}, {formData.quartier}
                </Typography>
              </CardContent>
            </Card>
            
            <Alert severity="info">
              Vérifiez toutes les informations avant de publier votre location.
              Une fois publiée, elle sera visible par tous les utilisateurs de la plateforme.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <AgenceLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <AgencePageHeader
            icon={Home}
            title="Créer une nouvelle location"
            subtitle="Ajoutez votre logement à la plateforme pour le proposer à la location"
          />

          <Card elevation={0} sx={{ bgcolor: "transparent", border: "none", boxShadow: "none" }}>
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, "& .MuiOutlinedInput-root": { borderRadius: 2 }, "& legend": { display: "none" } }}>
              <Stepper
                activeStep={activeStep}
                sx={{
                  mb: 4,
                  "& .MuiStepLabel-label": { fontWeight: 600 },
                  "& .MuiStepIcon-root.Mui-active": { color: "#3030F9" },
                  "& .MuiStepIcon-root.Mui-completed": { color: "#0A7C4F" },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ minHeight: 400, mb: 4 }}>
                <SectionCard
                  title={STEP_CARDS[activeStep].title}
                  color={STEP_CARDS[activeStep].color}
                  icon={STEP_CARDS[activeStep].icon}
                  sx={{ mb: 0 }}
                >
                  {renderStepContent(activeStep)}
                </SectionCard>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Retour
                </Button>
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                    >
                      {loading ? "Création..." : "Créer la location"}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleNext}>
                      Suivant
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </AgenceLayout>
  );
};

export default CreateLocationPage;
