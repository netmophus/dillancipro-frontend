import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Paper,
  Avatar,
  Stack,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Fade,
} from "@mui/material";
import {
  Home,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  CloudUpload,
  Close,
  LocationOn,
  AttachMoney,
  Square,
  VideoLibrary,
  Description,
  Park,
  Apartment,
  Villa,
  Add,
  Delete,
  Nature,
} from "@mui/icons-material";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const CreateBienPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "",
    titre: "",
    description: "",
    prix: "",
    superficie: "",
    statut: "disponible",
    featured: false,
    urgent: false,
  });

  const [localisation, setLocalisation] = useState({
    adresse: "",
    ville: "",
    quartier: "",
    latitude: "",
    longitude: "",
  });

  const [caracteristiques, setCaracteristiques] = useState({
    nbChambres: "",
    nbSallesBain: "",
    nbSalons: "",
    garage: false,
    piscine: false,
    jardin: false,
    climatisation: false,
    cuisine: "",
    irrigation: false,
    cloture: false,
    arbore: false,
    potager: false,
    etage: "",
    ascenseur: false,
    balcon: false,
    anneeConstruction: "",
    etatGeneral: "",
    acces: "",
    electricite: false,
    eau: false,
    securite: false,
    // Champs spécifiques pour jardin
    typesArbres: [], // [{ type: "Manguier", nombre: 5 }, ...]
    elementsJardin: "", // Description de ce qu'il y a dans le jardin
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [videos, setVideos] = useState([""]);
  const [visite360, setVisite360] = useState("");

  const steps = ["Type de bien", "Informations générales", "Localisation", "Caractéristiques", "Médias"];

  const typesLabels = {
    maison: { label: "Maison", icon: Home, color: "#2196f3" },
    villa: { label: "Villa", icon: Villa, color: "#9c27b0" },
    duplex: { label: "Duplex", icon: Home, color: "#ff9800" },
    appartement: { label: "Appartement", icon: Apartment, color: "#f44336" },
    jardin: { label: "Jardin", icon: Park, color: "#4caf50" },
    terrain: { label: "Terrain", icon: Square, color: "#795548" },
    autre: { label: "Autre", icon: Home, color: "#607d8b" },
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocalisationChange = (e) => {
    const { name, value } = e.target;
    setLocalisation((prev) => ({ ...prev, [name]: value }));
  };

  // Fonctions pour gérer les types d'arbres dans le jardin
  const handleAddArbre = () => {
    setCaracteristiques((prev) => ({
      ...prev,
      typesArbres: [...(prev.typesArbres || []), { type: "", nombre: "" }],
    }));
  };

  const handleRemoveArbre = (index) => {
    setCaracteristiques((prev) => ({
      ...prev,
      typesArbres: prev.typesArbres.filter((_, i) => i !== index),
    }));
  };

  const handleArbreChange = (index, field, value) => {
    setCaracteristiques((prev) => {
      const newTypesArbres = [...(prev.typesArbres || [])];
      newTypesArbres[index] = { ...newTypesArbres[index], [field]: value };
      return { ...prev, typesArbres: newTypesArbres };
    });
  };

  const handleCaracteristiquesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCaracteristiques((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Vérifier qu'on ne dépasse pas 5 photos
    if (imageFiles.length + files.length > 5) {
      setError("Vous ne pouvez ajouter que 5 photos maximum");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocumentFiles((prev) => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addVideoField = () => {
    if (videos.length < 5) {
      setVideos([...videos, ""]);
    } else {
      setError("Vous ne pouvez ajouter que 5 vidéos maximum");
    }
  };

  const handleVideoChange = (index, value) => {
    const newVideos = [...videos];
    newVideos[index] = value;
    setVideos(newVideos);
  };

  const removeVideo = (index) => {
    if (videos.length > 1) {
      setVideos(videos.filter((_, i) => i !== index));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    // Vérifier qu'on ne dépasse pas 5 photos
    if (imageFiles.length + files.length > 5) {
      setError("Vous ne pouvez ajouter que 5 photos maximum");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation des photos (minimum 2, maximum 5)
      if (imageFiles.length < 2) {
        setError("Veuillez ajouter au moins 2 photos de votre bien");
        setLoading(false);
        return;
      }
      if (imageFiles.length > 5) {
        setError("Vous ne pouvez ajouter que 5 photos maximum");
        setLoading(false);
        return;
      }

      // Validation des vidéos (minimum 1 URL)
      const filteredVideos = videos.filter((v) => v.trim() !== "");
      if (filteredVideos.length < 1) {
        setError("Veuillez ajouter au moins 1 lien vidéo (Vimeo, YouTube, etc.)");
        setLoading(false);
        return;
      }

      const data = new FormData();

      // Données de base
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Localisation
      data.append("localisation", JSON.stringify(localisation));

      // Caractéristiques
      data.append("caracteristiques", JSON.stringify(caracteristiques));

      // Vidéos (URLs)
      filteredVideos.forEach((video) => data.append("videos", video));

      // Visite 360
      if (visite360) data.append("visite360", visite360);

      // Images
      imageFiles.forEach((file) => data.append("images", file));

      // Documents
      documentFiles.forEach((file) => data.append("documents", file));

      await api.post("/agence/biens", data);

      setSuccess("✅ Bien immobilier créé avec succès !");
      
      // Reset form
      setFormData({
        type: "",
        titre: "",
        description: "",
        prix: "",
        superficie: "",
        statut: "disponible",
        featured: false,
        urgent: false,
      });
      setLocalisation({
        adresse: "",
        ville: "",
        quartier: "",
        latitude: "",
        longitude: "",
      });
      setCaracteristiques({
        nbChambres: "",
        nbSallesBain: "",
        nbSalons: "",
        garage: false,
        piscine: false,
        jardin: false,
        climatisation: false,
        cuisine: "",
        irrigation: false,
        cloture: false,
        arbore: false,
        potager: false,
        etage: "",
        ascenseur: false,
        balcon: false,
        anneeConstruction: "",
        etatGeneral: "",
        acces: "",
        electricite: false,
        eau: false,
        securite: false,
        typesArbres: [],
        elementsJardin: "",
      });
      setImageFiles([]);
      setImagePreviews([]);
      setDocumentFiles([]);
      setVideos([""]);
      setVisite360("");
      setCurrentStep(0);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Champs spécifiques selon le type
  const showHouseFields = ["maison", "villa", "duplex", "appartement"].includes(formData.type);
  const showGardenFields = formData.type === "jardin";
  const showApartmentFields = formData.type === "appartement";

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Avatar sx={{ bgcolor: "success.main", width: 56, height: 56 }}>
              <Home fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Créer un Bien Immobilier
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ajoutez des maisons, jardins, terrains et plus à votre catalogue
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Alertes */}
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          </Fade>
        )}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          </Fade>
        )}

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            {/* Stepper */}
            <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box component="form" onSubmit={handleSubmit}>
              {/* ÉTAPE 1 : Type de bien */}
              {currentStep === 0 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                    Sélectionnez le type de bien
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.keys(typesLabels).map((type) => {
                      const TypeIcon = typesLabels[type].icon;
                      return (
                        <Grid item xs={6} md={4} key={type}>
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: "pointer",
                              border: formData.type === type ? 2 : 1,
                              borderColor: formData.type === type ? typesLabels[type].color : "divider",
                              transition: "all 0.3s",
                              "&:hover": { boxShadow: 3, transform: "translateY(-4px)" },
                            }}
                            onClick={() => setFormData({ ...formData, type })}
                          >
                            <CardContent sx={{ textAlign: "center" }}>
                              <Avatar
                                sx={{
                                  bgcolor: typesLabels[type].color,
                                  width: 56,
                                  height: 56,
                                  margin: "0 auto",
                                  mb: 2,
                                }}
                              >
                                <TypeIcon fontSize="large" />
                              </Avatar>
                              <Typography variant="h6" fontWeight="bold">
                                {typesLabels[type].label}
                              </Typography>
                              {formData.type === type && (
                                <CheckCircle color="success" sx={{ mt: 1 }} />
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* ÉTAPE 2 : Informations générales */}
              {currentStep === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                    Informations générales
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Titre de l'annonce"
                        name="titre"
                        value={formData.titre}
                        onChange={handleChange}
                        fullWidth
                        required
                        placeholder="Ex: Belle villa moderne avec piscine"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Prix"
                        name="prix"
                        type="number"
                        value={formData.prix}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />FCFA
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Superficie"
                        name="superficie"
                        type="number"
                        value={formData.superficie}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{
                          endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        label="Statut"
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        fullWidth
                      >
                        <MenuItem value="disponible">Disponible</MenuItem>
                        <MenuItem value="vendu">Vendu</MenuItem>
                        <MenuItem value="reserve">Réservé</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="featured"
                              checked={formData.featured}
                              onChange={handleChange}
                            />
                          }
                          label="En vedette ⭐"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="urgent"
                              checked={formData.urgent}
                              onChange={handleChange}
                            />
                          }
                          label="Urgent 🔥"
                        />
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={5}
                        placeholder="Décrivez le bien en détail..."
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* ÉTAPE 3 : Localisation */}
              {currentStep === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                    <LocationOn sx={{ verticalAlign: "middle", mr: 1 }} />
                    Localisation du bien
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Adresse complète"
                        name="adresse"
                        value={localisation.adresse}
                        onChange={handleLocalisationChange}
                        fullWidth
                        placeholder="Ex: Rue 123, Zone Industrielle"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Ville"
                        name="ville"
                        value={localisation.ville}
                        onChange={handleLocalisationChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Quartier"
                        name="quartier"
                        value={localisation.quartier}
                        onChange={handleLocalisationChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Latitude"
                        name="latitude"
                        type="number"
                        value={localisation.latitude}
                        onChange={handleLocalisationChange}
                        fullWidth
                        placeholder="12.3456"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Longitude"
                        name="longitude"
                        type="number"
                        value={localisation.longitude}
                        onChange={handleLocalisationChange}
                        fullWidth
                        placeholder="-1.2345"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* ÉTAPE 4 : Caractéristiques */}
              {currentStep === 3 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                    Caractéristiques du bien
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Champs pour Maison/Villa/Duplex/Appartement */}
                    {showHouseFields && (
                      <>
                        <Grid item xs={6} md={4}>
                          <TextField
                            label="Nombre de chambres"
                            name="nbChambres"
                            type="number"
                            value={caracteristiques.nbChambres}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <TextField
                            label="Salles de bain"
                            name="nbSallesBain"
                            type="number"
                            value={caracteristiques.nbSallesBain}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <TextField
                            label="Salons"
                            name="nbSalons"
                            type="number"
                            value={caracteristiques.nbSalons}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Stack direction="row" flexWrap="wrap" gap={2}>
                            <FormControlLabel
                              control={<Checkbox name="garage" checked={caracteristiques.garage} onChange={handleCaracteristiquesChange} />}
                              label="Garage"
                            />
                            <FormControlLabel
                              control={<Checkbox name="piscine" checked={caracteristiques.piscine} onChange={handleCaracteristiquesChange} />}
                              label="Piscine"
                            />
                            <FormControlLabel
                              control={<Checkbox name="jardin" checked={caracteristiques.jardin} onChange={handleCaracteristiquesChange} />}
                              label="Jardin"
                            />
                            <FormControlLabel
                              control={<Checkbox name="climatisation" checked={caracteristiques.climatisation} onChange={handleCaracteristiquesChange} />}
                              label="Climatisation"
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            label="Cuisine"
                            name="cuisine"
                            value={caracteristiques.cuisine}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          >
                            <MenuItem value="">Non spécifié</MenuItem>
                            <MenuItem value="equipee">Équipée</MenuItem>
                            <MenuItem value="moderne">Moderne</MenuItem>
                            <MenuItem value="standard">Standard</MenuItem>
                            <MenuItem value="aucune">Aucune</MenuItem>
                          </TextField>
                        </Grid>
                      </>
                    )}

                    {/* Champs spécifiques Appartement */}
                    {showApartmentFields && (
                      <>
                        <Grid item xs={6} md={4}>
                          <TextField
                            label="Étage"
                            name="etage"
                            type="number"
                            value={caracteristiques.etage}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <FormControlLabel
                            control={<Checkbox name="ascenseur" checked={caracteristiques.ascenseur} onChange={handleCaracteristiquesChange} />}
                            label="Ascenseur"
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <FormControlLabel
                            control={<Checkbox name="balcon" checked={caracteristiques.balcon} onChange={handleCaracteristiquesChange} />}
                            label="Balcon"
                          />
                        </Grid>
                      </>
                    )}

                    {/* Champs spécifiques Jardin */}
                    {showGardenFields && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }}>
                            <Chip label="Caractéristiques du jardin" icon={<Nature />} color="primary" />
                          </Divider>
                        </Grid>

                        <Grid item xs={12}>
                          <Stack direction="row" flexWrap="wrap" gap={2}>
                            <FormControlLabel
                              control={<Checkbox name="irrigation" checked={caracteristiques.irrigation} onChange={handleCaracteristiquesChange} />}
                              label="Irrigation"
                            />
                            <FormControlLabel
                              control={<Checkbox name="cloture" checked={caracteristiques.cloture} onChange={handleCaracteristiquesChange} />}
                              label="Clôture"
                            />
                            <FormControlLabel
                              control={<Checkbox name="arbore" checked={caracteristiques.arbore} onChange={handleCaracteristiquesChange} />}
                              label="Arboré"
                            />
                            <FormControlLabel
                              control={<Checkbox name="potager" checked={caracteristiques.potager} onChange={handleCaracteristiquesChange} />}
                              label="Potager"
                            />
                          </Stack>
                        </Grid>

                        {/* Types d'arbres et leur nombre */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2, mb: 1 }}>
                            🌳 Types d'arbres présents
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                            {(caracteristiques.typesArbres || []).length > 0 ? (
                              <Stack spacing={2}>
                                {(caracteristiques.typesArbres || []).map((arbre, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: "flex",
                                      gap: 2,
                                      alignItems: "flex-start",
                                      p: 2,
                                      bgcolor: "white",
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <TextField
                                      label="Type d'arbre"
                                      value={arbre.type || ""}
                                      onChange={(e) => handleArbreChange(index, "type", e.target.value)}
                                      placeholder="Ex: Manguier, Oranger, Citronnier..."
                                      fullWidth
                                      size="small"
                                    />
                                    <TextField
                                      label="Nombre"
                                      type="number"
                                      value={arbre.nombre || ""}
                                      onChange={(e) => handleArbreChange(index, "nombre", e.target.value)}
                                      placeholder="Quantité"
                                      InputProps={{
                                        inputProps: { min: 0 },
                                      }}
                                      sx={{ width: 150 }}
                                      size="small"
                                    />
                                    <IconButton
                                      color="error"
                                      onClick={() => handleRemoveArbre(index)}
                                      sx={{ mt: 0.5 }}
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Box>
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Aucun arbre ajouté pour le moment
                              </Typography>
                            )}
                            <Button
                              variant="outlined"
                              startIcon={<Add />}
                              onClick={handleAddArbre}
                              fullWidth
                              sx={{ mt: 2 }}
                            >
                              Ajouter un type d'arbre
                            </Button>
                          </Paper>
                        </Grid>

                        {/* Éléments présents dans le jardin */}
                        <Grid item xs={12}>
                          <TextField
                            label="Éléments présents dans le jardin"
                            name="elementsJardin"
                            value={caracteristiques.elementsJardin || ""}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Décrivez ce qu'il y a dans le jardin (ex: piscine, cabane, allées, pergola, fontaine, barbecue, espace de jeux, etc.)"
                            helperText="Décrivez tous les éléments, aménagements et installations présents dans le jardin"
                          />
                        </Grid>
                      </>
                    )}

                    {/* Caractéristiques communes */}
                    <Grid item xs={12}><Divider /></Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Année de construction"
                        name="anneeConstruction"
                        type="number"
                        value={caracteristiques.anneeConstruction}
                        onChange={handleCaracteristiquesChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        label="État général"
                        name="etatGeneral"
                        value={caracteristiques.etatGeneral}
                        onChange={handleCaracteristiquesChange}
                        fullWidth
                      >
                        <MenuItem value="">Non spécifié</MenuItem>
                        <MenuItem value="neuf">Neuf</MenuItem>
                        <MenuItem value="bon">Bon</MenuItem>
                        <MenuItem value="moyen">Moyen</MenuItem>
                        <MenuItem value="a_renover">À rénover</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        label="Type d'accès"
                        name="acces"
                        value={caracteristiques.acces}
                        onChange={handleCaracteristiquesChange}
                        fullWidth
                      >
                        <MenuItem value="">Non spécifié</MenuItem>
                        <MenuItem value="goudron">Goudron</MenuItem>
                        <MenuItem value="pave">Pavé</MenuItem>
                        <MenuItem value="terre">Terre</MenuItem>
                        <MenuItem value="autre">Autre</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <Stack direction="row" flexWrap="wrap" gap={2}>
                        <FormControlLabel
                          control={<Checkbox name="electricite" checked={caracteristiques.electricite} onChange={handleCaracteristiquesChange} />}
                          label="Électricité"
                        />
                        <FormControlLabel
                          control={<Checkbox name="eau" checked={caracteristiques.eau} onChange={handleCaracteristiquesChange} />}
                          label="Eau courante"
                        />
                        <FormControlLabel
                          control={<Checkbox name="securite" checked={caracteristiques.securite} onChange={handleCaracteristiquesChange} />}
                          label="Sécurité"
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* ÉTAPE 5 : Médias */}
              {currentStep === 4 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                    Médias et documents
                  </Typography>
                  <Grid container spacing={4}>
                    {/* Images */}
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          📸 Images
                        </Typography>
                        <Chip 
                          label={`${imageFiles.length}/5`}
                          color={imageFiles.length >= 2 ? "success" : "error"}
                          size="small"
                        />
                        <Typography variant="caption" color="error">
                          (Minimum 2, Maximum 5) *
                        </Typography>
                      </Box>
                      <Paper
                        variant="outlined"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        sx={{
                          p: 3,
                          textAlign: "center",
                          borderStyle: "dashed",
                          borderWidth: 2,
                          borderColor: imageFiles.length >= 2 ? "success.main" : "primary.main",
                          cursor: "pointer",
                          mb: 2,
                          bgcolor: imageFiles.length >= 5 ? "grey.100" : "transparent",
                        }}
                      >
                        <input
                          accept="image/*"
                          style={{ display: "none" }}
                          id="image-upload"
                          type="file"
                          multiple
                          onChange={handleImageUpload}
                          disabled={imageFiles.length >= 5}
                        />
                        <label htmlFor="image-upload">
                          <Box sx={{ cursor: imageFiles.length >= 5 ? "not-allowed" : "pointer" }}>
                            <CloudUpload fontSize="large" color={imageFiles.length >= 5 ? "disabled" : "primary"} />
                            <Typography>
                              {imageFiles.length >= 5 
                                ? "Limite de 5 photos atteinte" 
                                : "Glissez vos images ou cliquez ici"}
                            </Typography>
                          </Box>
                        </label>
                      </Paper>

                      {imagePreviews.length > 0 && (
                        <Grid container spacing={2}>
                          {imagePreviews.map((preview, index) => (
                            <Grid item xs={6} md={3} key={index}>
                              <Box position="relative">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: 150,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  color="error"
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    bgcolor: "white",
                                  }}
                                  onClick={() => removeImage(index)}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Grid>

                    {/* Vidéos */}
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          🎥 Vidéos (URLs Vimeo, YouTube...)
                        </Typography>
                        <Chip 
                          label={`${videos.filter(v => v.trim() !== "").length}/5`}
                          color={videos.filter(v => v.trim() !== "").length >= 1 ? "success" : "error"}
                          size="small"
                        />
                        <Typography variant="caption" color="error">
                          (Minimum 1, Maximum 5) *
                        </Typography>
                      </Box>
                      {videos.map((video, index) => (
                        <Box key={index} display="flex" gap={1} mb={2}>
                          <TextField
                            fullWidth
                            value={video}
                            onChange={(e) => handleVideoChange(index, e.target.value)}
                            placeholder="https://vimeo.com/... ou https://youtube.com/watch?v=..."
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <VideoLibrary />
                                </InputAdornment>
                              ),
                            }}
                          />
                          {videos.length > 1 && (
                            <IconButton color="error" onClick={() => removeVideo(index)}>
                              <Close />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                      {videos.length < 5 && (
                        <Button 
                          variant="outlined" 
                          onClick={addVideoField} 
                          startIcon={<VideoLibrary />}
                        >
                          Ajouter une vidéo
                        </Button>
                      )}
                    </Grid>

                    {/* Visite 360 */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Visite virtuelle 360° (URL)"
                        value={visite360}
                        onChange={(e) => setVisite360(e.target.value)}
                        placeholder="https://..."
                      />
                    </Grid>

                    {/* Documents */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        📄 Documents
                      </Typography>
                      <input
                        accept=".pdf,.doc,.docx"
                        style={{ display: "none" }}
                        id="document-upload"
                        type="file"
                        multiple
                        onChange={handleDocumentUpload}
                      />
                      <label htmlFor="document-upload">
                        <Button variant="outlined" component="span" startIcon={<Description />}>
                          Ajouter des documents
                        </Button>
                      </label>
                      {documentFiles.length > 0 && (
                        <Stack spacing={1} mt={2}>
                          {documentFiles.map((file, index) => (
                            <Chip
                              key={index}
                              label={file.name}
                              onDelete={() => removeDocument(index)}
                              icon={<Description />}
                            />
                          ))}
                        </Stack>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Boutons de navigation */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Précédent
                </Button>

                <Box display="flex" gap={2}>
                  {currentStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={nextStep}
                      disabled={currentStep === 0 && !formData.type}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                      sx={{ minWidth: 150 }}
                    >
                      {loading ? "Enregistrement..." : "Créer le bien"}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  );
};

export default CreateBienPage;

