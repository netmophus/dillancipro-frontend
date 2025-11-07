import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Avatar,
  Stack,
  Divider,
  Badge,
  CircularProgress,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Home,
  Map,
  Image,
  Description,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  CloudUpload,
  Delete,
  Edit,
  Visibility,
  LocationOn,
  AttachMoney,
  Square,
  VideoLibrary,
  Close,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const CreateParcellePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // États du formulaire
  const [activeTab, setActiveTab] = useState(location.state?.showList ? 1 : 0);
  const [mode, setMode] = useState("single"); // single | multiple
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    numeroParcelle: "",
    ilot: "",
    superficie: "",
    prix: "",
    statut: "avendre",
    description: "",
    video: "",
  });

  const [numeroList, setNumeroList] = useState("");
  const [localisations, setLocalisations] = useState([{ lat: "", lng: "" }]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);

  // États de la liste
  const [parcelles, setParcelles] = useState([]);
  const [ilots, setIlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // États de la modal d'édition
  const [editDialog, setEditDialog] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState(null);
  const [editFormData, setEditFormData] = useState({
    numeroParcelle: "",
    ilot: "",
    superficie: "",
    prix: "",
    statut: "avendre",
    description: "",
    lat: "",
    lng: "",
    video: "",
  });
  
  // États pour les fichiers existants dans le dialog d'édition
  const [existingEditImages, setExistingEditImages] = useState([]);
  const [existingEditDocuments, setExistingEditDocuments] = useState([]);
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editDocumentFiles, setEditDocumentFiles] = useState([]);

  // Étapes du stepper
  const steps = ["Informations de base", "Localisation", "Médias & Documents"];

  useEffect(() => {
    fetchIlots();
    fetchParcelles();
  }, []);

  const fetchIlots = async () => {
    try {
      const res = await api.get("/agence/ilots");
      setIlots(res.data);
    } catch (err) {
      console.error("Erreur chargement ilots :", err);
      setError("Impossible de charger les îlots");
    }
  };

  const fetchParcelles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/agence/parcelles");
      setParcelles(res.data);
    } catch (err) {
      console.error("Erreur chargement parcelles :", err);
      setError("Impossible de charger les parcelles");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalisationChange = (index, field, value) => {
    setLocalisations((prev) => {
      const newLocs = [...prev];
      newLocs[index][field] = value;
      return newLocs;
    });
  };

  const addLocalisation = () => {
    setLocalisations([...localisations, { lat: "", lng: "" }]);
  };

  const removeLocalisation = (index) => {
    setLocalisations(localisations.filter((_, i) => i !== index));
  };

  // Gestion des images avec prévisualisation
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);

    // Créer des prévisualisations
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

  // Drag and Drop pour les images
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    
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
    e.stopPropagation();

    // ⚠️ VALIDATION : Ne soumettre QUE si on est à la dernière étape
    if (currentStep < steps.length - 1) {
      console.log("⚠️ [FRONTEND] Soumission bloquée - Pas à la dernière étape");
      return;
    }

    // Validation des champs obligatoires
    if (!formData.numeroParcelle || !formData.ilot) {
      setError("Veuillez remplir le numéro de parcelle et l'îlot");
      return;
    }

    setSuccess("");
    setError("");
    setLoading(true);

    try {
      // MODE UNIQUE seulement (le mode multiple redirige vers une autre page)
      const singleData = new FormData();
      singleData.set("numeroParcelle", formData.numeroParcelle.trim());
      singleData.set("ilot", formData.ilot);
      if (formData.superficie) singleData.set("superficie", String(formData.superficie));
      if (formData.prix) singleData.set("prix", String(formData.prix));
      singleData.set("statut", formData.statut);
      singleData.set("description", formData.description.trim());
      singleData.set("video", formData.video.trim());
      singleData.set("localisations", JSON.stringify(localisations));

      imageFiles.forEach((file) => singleData.append("images", file));
      documentFiles.forEach((file) => singleData.append("documents", file));

      console.log("📝 [FRONTEND] Création parcelle unique");
      await api.post("/agence/parcelles/parcelles", singleData);
      setSuccess("Parcelle créée avec succès ! 🎉");

      // Reset
      resetForm();
      fetchParcelles();
      setActiveTab(1); // Basculer vers la liste
    } catch (err) {
      console.error("❌ [FRONTEND] Erreur:", err);
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      numeroParcelle: "",
      ilot: "",
      superficie: "",
      prix: "",
      statut: "avendre",
      description: "",
      video: "",
    });
    setNumeroList("");
    setLocalisations([{ lat: "", lng: "" }]);
    setImageFiles([]);
    setImagePreviews([]);
    setDocumentFiles([]);
    setCurrentStep(0);
  };

  // Fonction pour corriger les URLs de fichiers
  const fixFileUrl = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return null;
    
    const trimmed = filePath.trim();
    if (!trimmed || trimmed === '') return null;
    
    const correctedPath = trimmed.replace(/\\/g, '/');
    
    // Si c'est déjà une URL complète (http/https), la retourner telle quelle
    if (correctedPath.startsWith('http://') || correctedPath.startsWith('https://')) {
      return correctedPath;
    }
    
    // Si c'est un chemin relatif, construire l'URL locale
    // Enlever le slash de début s'il existe pour éviter les doubles slashes
    const cleanPath = correctedPath.startsWith('/') ? correctedPath.slice(1) : correctedPath;
    return `http://localhost:5000/${cleanPath}`;
  };

  const openEditDialog = (parcelle) => {
    setEditingParcelle(parcelle);
    setEditFormData({
      numeroParcelle: parcelle.numeroParcelle || "",
      ilot: parcelle.ilot?._id || parcelle.ilot || "",
      superficie: parcelle.superficie || "",
      prix: parcelle.prix || "",
      statut: parcelle.statut || "avendre",
      description: parcelle.description || "",
      lat: parcelle.localisation?.lat || "",
      lng: parcelle.localisation?.lng || "",
      video: parcelle.video || "",
    });
    
    // Charger les fichiers existants
    const images = (parcelle.images || []).filter(img => img && img.trim() !== '');
    const documents = (parcelle.documents || []).filter(doc => doc && doc.trim() !== '');
    
    // Filtrer les URLs invalides après transformation
    setExistingEditImages(images.map(img => fixFileUrl(img)).filter(url => url !== null && url !== undefined));
    setExistingEditDocuments(documents.map(doc => fixFileUrl(doc)).filter(url => url !== null && url !== undefined));
    setEditImageFiles([]);
    setEditDocumentFiles([]);
    
    setEditDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setEditImageFiles((prev) => [...prev, ...files]);
  };

  const handleEditDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setEditDocumentFiles((prev) => [...prev, ...files]);
  };

  const removeEditImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingEditImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEditImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const removeEditDocument = (index, isExisting = false) => {
    if (isExisting) {
      setExistingEditDocuments((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEditDocumentFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = new FormData();
      updateData.set("numeroParcelle", editFormData.numeroParcelle);
      updateData.set("ilot", editFormData.ilot);
      if (editFormData.superficie) updateData.set("superficie", editFormData.superficie);
      if (editFormData.prix) updateData.set("prix", editFormData.prix);
      updateData.set("statut", editFormData.statut);
      updateData.set("description", editFormData.description);
      if (editFormData.lat) updateData.set("lat", editFormData.lat);
      if (editFormData.lng) updateData.set("lng", editFormData.lng);
      if (editFormData.video) updateData.set("video", editFormData.video);

      // Ajouter les nouveaux fichiers images
      editImageFiles.forEach((file) => {
        updateData.append("images", file);
      });

      // Ajouter les nouveaux fichiers documents
      editDocumentFiles.forEach((file) => {
        updateData.append("documents", file);
      });

      await api.put(`/agence/parcelles/${editingParcelle._id}`, updateData);
      setSuccess("✅ Parcelle modifiée avec succès !");
      setEditDialog(false);
      setEditImageFiles([]);
      setEditDocumentFiles([]);
      setExistingEditImages([]);
      setExistingEditDocuments([]);
      fetchParcelles();
    } catch (err) {
      setError(err.response?.data?.message || "❌ Erreur lors de la modification");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette parcelle ?")) return;
    
    try {
      await api.delete(`/agence/parcelles/${id}`);
      setSuccess("Parcelle supprimée avec succès");
      fetchParcelles();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  
  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const statusColors = {
    avendre: "success",
    vendue: "primary",
    reserved: "warning",
  };

  const statusLabels = {
    avendre: "À vendre",
    vendue: "Vendue",
    reserved: "Réservée",
  };

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏘️ Gestion des Parcelles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créez et gérez vos parcelles immobilières
          </Typography>
        </Box>

        {/* Onglets principaux */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                fontWeight: "bold",
                fontSize: "1rem",
              },
            }}
          >
            <Tab icon={<Add />} label="Créer" iconPosition="start" />
            <Tab icon={<Home />} label={`Liste (${parcelles.length})`} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* ONGLET 1 : Création */}
        {activeTab === 0 && (
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              {/* Mode de création */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  💡 Besoin de créer plusieurs parcelles ?
                </Typography>
                <Typography variant="caption">
                  Utilisez le mode "Parcelles multiples" pour ajouter des coordonnées GPS et photos spécifiques à chaque parcelle
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/agence/create-parcelle-multiple")}
                  sx={{ mt: 1 }}
                  startIcon={<Square />}
                >
                  Créer parcelles multiples
                </Button>
              </Alert>

              <Divider sx={{ my: 3 }} />

              {/* Stepper */}
              <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box 
                component="form" 
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  // Empêcher la soumission sur "Entrée" sauf sur le dernier bouton
                  if (e.key === 'Enter' && currentStep < steps.length - 1) {
                    e.preventDefault();
                  }
                }}
              >
                {/* ÉTAPE 1 : Informations de base */}
                {currentStep === 0 && (
                  <Box>
                    <Grid container spacing={3}>
                      {/* Numéro de parcelle */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Numéro de la parcelle"
                          name="numeroParcelle"
                          value={formData.numeroParcelle}
                          onChange={handleChange}
                          fullWidth
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Home color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {/* Îlot */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          label="Îlot"
                          name="ilot"
                          value={formData.ilot}
                          onChange={handleChange}
                          fullWidth
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Map color="action" />
                              </InputAdornment>
                            ),
                          }}
                        >
                          {ilots.map((ilot) => (
                            <MenuItem key={ilot._id} value={ilot._id}>
                              {ilot.numeroIlot}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* Superficie */}
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
                            startAdornment: (
                              <InputAdornment position="start">
                                <Square color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {/* Prix */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Prix"
                          name="prix"
                          type="number"
                          value={formData.prix}
                          onChange={handleChange}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney color="action" /> FCFA
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {/* Statut */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          label="Statut"
                          name="statut"
                          value={formData.statut}
                          onChange={handleChange}
                          fullWidth
                        >
                          <MenuItem value="avendre">À vendre</MenuItem>
                          <MenuItem value="vendue">Vendue</MenuItem>
                          <MenuItem value="reserved">Réservée</MenuItem>
                        </TextField>
                      </Grid>

                      {/* Description */}
                      <Grid item xs={12}>
                        <TextField
                          label="Description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Décrivez la parcelle..."
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Description color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* ÉTAPE 2 : Localisation */}
                {currentStep === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                      <LocationOn color="primary" sx={{ verticalAlign: "middle", mr: 1 }} />
                      Points de localisation
                    </Typography>
                    
                    {localisations.map((loc, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Point {index + 1}
                          </Typography>
                          {index > 0 && (
                            <IconButton color="error" onClick={() => removeLocalisation(index)}>
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Latitude"
                              type="number"
                              value={loc.lat}
                              onChange={(e) => handleLocalisationChange(index, "lat", e.target.value)}
                              fullWidth
                              placeholder="Ex: 12.3456"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Longitude"
                              type="number"
                              value={loc.lng}
                              onChange={(e) => handleLocalisationChange(index, "lng", e.target.value)}
                              fullWidth
                              placeholder="Ex: -1.2345"
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                    
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addLocalisation}
                      fullWidth
                    >
                      Ajouter un point
                    </Button>
                  </Box>
                )}

                {/* ÉTAPE 3 : Médias & Documents */}
                {currentStep === 2 && (
                  <Box>
                    <Grid container spacing={4}>
                      {/* Images */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          <Image color="primary" sx={{ verticalAlign: "middle", mr: 1 }} />
                          Images
                        </Typography>
                        
                        <Paper
                          variant="outlined"
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          sx={{
                            p: 3,
                            textAlign: "center",
                            borderStyle: "dashed",
                            borderWidth: 2,
                            borderColor: "primary.main",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <input
                            accept="image/*"
                            style={{ display: "none" }}
                            id="image-upload"
                            type="file"
                            multiple
                            onChange={handleImageUpload}
                          />
                          <label htmlFor="image-upload">
                            <Box sx={{ cursor: "pointer" }}>
                              <CloudUpload fontSize="large" color="primary" />
                              <Typography variant="body1" sx={{ mt: 1 }}>
                                Cliquez ou glissez vos images ici
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                JPG, PNG, GIF (max 5 MB par fichier)
                              </Typography>
                            </Box>
                          </label>
                        </Paper>

                        {/* Prévisualisations des images */}
                        {imagePreviews.length > 0 && (
                          <Grid container spacing={2} sx={{ mt: 2 }}>
                            {imagePreviews.map((preview, index) => (
                              <Grid item xs={6} md={4} key={index}>
                                <Box position="relative">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    style={{
                                      width: "100%",
                                      height: 120,
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
                                      "&:hover": { bgcolor: "error.light" },
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

                      {/* Documents & Vidéo */}
                      <Grid item xs={12} md={6}>
                        {/* Vidéo */}
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          <VideoLibrary color="primary" sx={{ verticalAlign: "middle", mr: 1 }} />
                          Vidéo (URL)
                        </Typography>
                        <TextField
                          label="Lien vidéo YouTube, Vimeo..."
                          name="video"
                          value={formData.video}
                          onChange={handleChange}
                          fullWidth
                          placeholder="https://youtube.com/watch?v=..."
                          sx={{ mb: 4 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                        />

                        {/* Documents */}
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          <Description color="primary" sx={{ verticalAlign: "middle", mr: 1 }} />
                          Documents
                        </Typography>
                        
                        <input
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          style={{ display: "none" }}
                          id="document-upload"
                          type="file"
                          multiple
                          onChange={handleDocumentUpload}
                        />
                        <label htmlFor="document-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUpload />}
                            fullWidth
                          >
                            Ajouter des documents
                          </Button>
                        </label>

                        {documentFiles.length > 0 && (
                          <Stack spacing={1} sx={{ mt: 2 }}>
                            {documentFiles.map((file, index) => (
                              <Paper key={index} variant="outlined" sx={{ p: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Description color="action" />
                                    <Box>
                                      <Typography variant="body2">{file.name}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {(file.size / 1024).toFixed(2)} KB
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <IconButton size="small" color="error" onClick={() => removeDocument(index)}>
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </Paper>
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
                    onClick={(e) => {
                      e.preventDefault();
                      prevStep(e);
                    }}
                    disabled={currentStep === 0}
                    type="button"
                  >
                    Précédent
                  </Button>
                  
                  <Box display="flex" gap={2}>
                    {currentStep < steps.length - 1 ? (
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward />}
                        onClick={(e) => {
                          e.preventDefault();
                          nextStep(e);
                        }}
                        type="button"
                      >
                        Suivant
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={loading || !formData.numeroParcelle || !formData.ilot}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                        sx={{ minWidth: 150 }}
                      >
                        {loading ? "Enregistrement..." : "Créer la parcelle"}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ONGLET 2 : Liste */}
        {activeTab === 1 && (
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  📋 Liste des Parcelles ({parcelles.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setActiveTab(0);
                    resetForm();
                  }}
                >
                  Nouvelle parcelle
                </Button>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead sx={{ bgcolor: "grey.100" }}>
                        <TableRow>
                          <TableCell><strong>Numéro</strong></TableCell>
                          <TableCell><strong>Îlot</strong></TableCell>
                          <TableCell><strong>Superficie</strong></TableCell>
                          <TableCell><strong>Prix</strong></TableCell>
                          <TableCell><strong>Statut</strong></TableCell>
                          <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parcelles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                Aucune parcelle enregistrée
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          parcelles
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((p) => (
                              <TableRow key={p._id} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="bold">
                                    {p.numeroParcelle}
                                  </Typography>
                                </TableCell>
                                <TableCell>{p.ilot?.numeroIlot || "-"}</TableCell>
                                <TableCell>
                                  {p.superficie ? `${p.superficie} m²` : "-"}
                                </TableCell>
                                <TableCell>
                                  {p.prix
                                    ? new Intl.NumberFormat("fr-FR").format(p.prix) + " FCFA"
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={statusLabels[p.statut]}
                                    color={statusColors[p.statut]}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip title="Modifier">
                                    <IconButton size="small" onClick={() => openEditDialog(p)}>
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Supprimer">
                                    <IconButton size="small" color="error" onClick={() => handleDelete(p._id)}>
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <TablePagination
                    component="div"
                    count={parcelles.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Dialog d'édition */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Edit color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Modifier la parcelle
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ pt: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Numéro de la parcelle"
                name="numeroParcelle"
                value={editFormData.numeroParcelle}
                onChange={handleEditChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Îlot"
                name="ilot"
                value={editFormData.ilot}
                onChange={handleEditChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Map color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                {ilots.map((ilot) => (
                  <MenuItem key={ilot._id} value={ilot._id}>
                    {ilot.numeroIlot}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Superficie"
                name="superficie"
                type="number"
                value={editFormData.superficie}
                onChange={handleEditChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Prix"
                name="prix"
                type="number"
                value={editFormData.prix}
                onChange={handleEditChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney /> FCFA
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Statut"
                name="statut"
                value={editFormData.statut}
                onChange={handleEditChange}
                fullWidth
              >
                <MenuItem value="avendre">À vendre</MenuItem>
                <MenuItem value="vendue">Vendue</MenuItem>
                <MenuItem value="reserved">Réservée</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                <LocationOn sx={{ verticalAlign: "middle", mr: 1 }} color="primary" />
                Coordonnées GPS
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Latitude"
                name="lat"
                type="number"
                value={editFormData.lat}
                onChange={handleEditChange}
                fullWidth
                placeholder="Ex: 13.5127"
                inputProps={{ step: "any" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Longitude"
                name="lng"
                type="number"
                value={editFormData.lng}
                onChange={handleEditChange}
                fullWidth
                placeholder="Ex: 2.1128"
                inputProps={{ step: "any" }}
              />
            </Grid>

            {/* Section Vidéo */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                <VideoLibrary sx={{ verticalAlign: "middle", mr: 1 }} color="primary" />
                Vidéo (URL)
              </Typography>
              <TextField
                label="Lien vidéo YouTube, Vimeo..."
                name="video"
                value={editFormData.video}
                onChange={handleEditChange}
                fullWidth
                placeholder="https://youtube.com/watch?v=..."
              />
            </Grid>

            {/* Section Images */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                <Image sx={{ verticalAlign: "middle", mr: 1 }} color="primary" />
                Images
              </Typography>
              
              {/* Images existantes */}
              {existingEditImages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Images actuelles :
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {existingEditImages
                      .filter(imgUrl => imgUrl !== null && imgUrl !== undefined) // Filtrer les URLs invalides
                      .map((imgUrl, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box sx={{ position: "relative" }}>
                          <Box
                            component="img"
                            src={imgUrl}
                            alt={`Image ${index + 1}`}
                            onError={(e) => {
                              // Si l'image ne se charge pas, afficher un placeholder
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3EImage%20manquante%3C/text%3E%3C/svg%3E";
                              e.target.onerror = null; // Empêcher la boucle infinie
                            }}
                            sx={{
                              width: "100%",
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 1,
                              border: 1,
                              borderColor: "divider",
                              bgcolor: "#f0f0f0",
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: "rgba(255, 255, 255, 0.9)",
                              "&:hover": { bgcolor: "white" },
                            }}
                            onClick={() => removeEditImage(index, true)}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Upload de nouvelles images */}
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="edit-image-upload"
                type="file"
                multiple
                onChange={handleEditImageUpload}
              />
              <label htmlFor="edit-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ mt: existingEditImages.length > 0 ? 1 : 0 }}
                >
                  {existingEditImages.length > 0 ? "Ajouter d'autres images" : "Ajouter des images"}
                </Button>
              </label>

              {/* Aperçu des nouvelles images */}
              {editImageFiles.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {editImageFiles.map((file, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Paper variant="outlined" sx={{ p: 1, position: "relative" }}>
                        <Box
                          component="img"
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          sx={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                          }}
                          onClick={() => removeEditImage(index, false)}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }} noWrap>
                          {file.name}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Section Documents */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                <Description sx={{ verticalAlign: "middle", mr: 1 }} color="primary" />
                Documents
              </Typography>

              {/* Documents existants */}
              {existingEditDocuments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Documents actuels :
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {existingEditDocuments.map((docUrl, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1} flex={1}>
                            <Description color="action" />
                            <Box flex={1} minWidth={0}>
                              <Typography variant="body2" noWrap>
                                Document {index + 1}
                              </Typography>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => window.open(docUrl, "_blank")}
                                sx={{ mt: 0.5 }}
                              >
                                Voir
                              </Button>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeEditDocument(index, true)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Upload de nouveaux documents */}
              <input
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                style={{ display: "none" }}
                id="edit-document-upload"
                type="file"
                multiple
                onChange={handleEditDocumentUpload}
              />
              <label htmlFor="edit-document-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ mt: existingEditDocuments.length > 0 ? 1 : 0 }}
                >
                  {existingEditDocuments.length > 0 ? "Ajouter d'autres documents" : "Ajouter des documents"}
                </Button>
              </label>

              {/* Liste des nouveaux documents */}
              {editDocumentFiles.length > 0 && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {editDocumentFiles.map((file, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Description color="action" />
                          <Box>
                            <Typography variant="body2">{file.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(file.size / 1024).toFixed(2)} KB
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeEditDocument(index, false)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => {
              setEditDialog(false);
              setEditImageFiles([]);
              setEditDocumentFiles([]);
              setExistingEditImages([]);
              setExistingEditDocuments([]);
              setEditingParcelle(null);
            }} 
            variant="outlined"
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            startIcon={<CheckCircle />}
            disabled={!editFormData.numeroParcelle || !editFormData.ilot}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default CreateParcellePage;
