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
  Grid,
  FormControl,
  InputLabel,
  Select,
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
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
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
                label="Titre de la location"
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
                label="Description détaillée"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez le logement, ses avantages, le quartier..."
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type de logement</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                >
                  {typesLogement.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.statut}
                  onChange={(e) => handleInputChange("statut", e.target.value)}
                >
                  <MenuItem value="disponible">Disponible</MenuItem>
                  <MenuItem value="indisponible">Indisponible</MenuItem>
                  <MenuItem value="en_attente">En attente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Ville</InputLabel>
                <Select
                  value={formData.ville}
                  onChange={(e) => handleInputChange("ville", e.target.value)}
                >
                  {villes.map((ville) => (
                    <MenuItem key={ville} value={ville}>
                      {ville}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quartier"
                value={formData.quartier}
                onChange={(e) => handleInputChange("quartier", e.target.value)}
                placeholder="Ex: Plateau, Cité, etc."
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse complète"
                value={formData.adresse}
                onChange={(e) => handleInputChange("adresse", e.target.value)}
                placeholder="Ex: Rue de la Paix, N°123"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code postal"
                value={formData.codePostal}
                onChange={(e) => handleInputChange("codePostal", e.target.value)}
                placeholder="Ex: 10000"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.latitude}
                onChange={(e) => handleInputChange("latitude", e.target.value)}
                placeholder="Ex: 13.5137"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.longitude}
                onChange={(e) => handleInputChange("longitude", e.target.value)}
                placeholder="Ex: 2.1098"
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
                label="Superficie (m²)"
                type="number"
                value={formData.superficie}
                onChange={(e) => handleInputChange("superficie", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Nombre de chambres"
                type="number"
                value={formData.chambres}
                onChange={(e) => handleInputChange("chambres", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Salles de bain"
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
                label="Prix mensuel (FCFA)"
                type="number"
                value={formData.prixMensuel}
                onChange={(e) => handleInputChange("prixMensuel", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Caution (FCFA)"
                type="number"
                value={formData.caution}
                onChange={(e) => handleInputChange("caution", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Charges mensuelles (FCFA)"
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
                label="Date de disponibilité"
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
                label="Durée minimale (mois)"
                type="number"
                value={formData.dureeMinimale}
                onChange={(e) => handleInputChange("dureeMinimale", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Durée maximale (mois)"
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
              <Typography variant="h6" gutterBottom>
                Médias et documents
              </Typography>
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
                label="Lien vidéo (YouTube, Vimeo...)"
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
            <Typography variant="h6" gutterBottom>
              Récapitulatif de votre location
            </Typography>
            
            <Card sx={{ mb: 3 }}>
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
    <PageLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏠 Créer une nouvelle location
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Ajoutez votre logement à la plateforme pour le proposer à la location
          </Typography>

          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
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
                {renderStepContent(activeStep)}
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
    </PageLayout>
  );
};

export default CreateLocationPage;
