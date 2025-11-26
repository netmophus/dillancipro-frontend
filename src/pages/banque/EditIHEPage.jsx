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
  Stack,
  Divider,
  CircularProgress,
  IconButton,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  Avatar,
} from "@mui/material";
import {
  Home,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  LocationOn,
  AttachMoney,
  Square,
  Apartment,
  Villa,
  Business,
  Warehouse,
  Photo,
  VideoLibrary,
  Description,
  CloudUpload,
  Delete,
  Add,
  Nature,
  Save,
  CalendarToday,
  Edit,
  OpenInNew,
  Download,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const EditIHEPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "",
    titre: "",
    description: "",
    nomClient: "",
    valeurAdjudication: "",
    valeurDation: "",
    valeurNetteComptable: "",
    valeurComptable: "",
    valeurAcquisition: "",
    valeurCession: "",
    dateAcquisition: "",
    superficie: "",
    uniteSuperficie: "m²",
    notes: "",
    commentaires: "",
    // Champs réglementaires
    dateReclassement: "",
    dureeMaximaleDetention: "60", // 5 ans par défaut (60 mois)
    planCession: "",
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
    anneeConstruction: "",
    etatGeneral: "",
    electricite: false,
    eau: false,
    securite: false,
    irrigation: false,
    cloture: false,
    arbore: false,
    potager: false,
    typesArbres: [],
    elementsJardin: "",
  });

  const [existingMedias, setExistingMedias] = useState([]);
  const [newMedias, setNewMedias] = useState([]);
  const [uploadingMedias, setUploadingMedias] = useState(false);
  const [mediaTab, setMediaTab] = useState(0);

  const steps = ["Type & Informations", "Localisation", "Caractéristiques", "Médias", "Résumé"];

  const typesLabels = {
    terrain: { label: "Terrain", icon: Square, color: "#795548" },
    jardin: { label: "Jardin", icon: Nature, color: "#4caf50" },
    maison: { label: "Maison", icon: Home, color: "#2196f3" },
    appartement: { label: "Appartement", icon: Apartment, color: "#f44336" },
    villa: { label: "Villa", icon: Villa, color: "#9c27b0" },
    bureau: { label: "Bureau", icon: Business, color: "#00bcd4" },
    entrepot: { label: "Entrepôt", icon: Warehouse, color: "#ff9800" },
    autre: { label: "Autre", icon: Home, color: "#607d8b" },
  };

  useEffect(() => {
    fetchIHE();
  }, [id]);

  const fetchIHE = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/banque/ihe/${id}`);
      const ihe = response.data.ihe;

      // Pré-remplir les données du formulaire
      setFormData({
        type: ihe.type || "",
        titre: ihe.titre || "",
        description: ihe.description || "",
        nomClient: ihe.nomClient || "",
        valeurAdjudication: ihe.valeurAdjudication || "",
        valeurDation: ihe.valeurDation || "",
        valeurNetteComptable: ihe.valeurNetteComptable || "",
        valeurComptable: ihe.valeurComptable || "",
        valeurAcquisition: ihe.valeurAcquisition || "",
        valeurCession: ihe.valeurCession || "",
        dateAcquisition: ihe.dateAcquisition ? ihe.dateAcquisition.split("T")[0] : "",
        superficie: ihe.superficie || "",
        uniteSuperficie: ihe.uniteSuperficie || "m²",
        notes: ihe.notes || "",
        commentaires: ihe.commentaires || "",
        // Champs réglementaires
        dateReclassement: ihe.dateReclassement ? ihe.dateReclassement.split("T")[0] : "",
        dureeMaximaleDetention: ihe.dureeMaximaleDetention ? ihe.dureeMaximaleDetention.toString() : "60",
        planCession: ihe.planCession || "",
      });

      setLocalisation({
        adresse: ihe.localisation?.adresse || "",
        ville: ihe.localisation?.ville || "",
        quartier: ihe.localisation?.quartier || "",
        latitude: ihe.localisation?.latitude?.toString() || "",
        longitude: ihe.localisation?.longitude?.toString() || "",
      });

      if (ihe.caracteristiques) {
        setCaracteristiques({
          nbChambres: ihe.caracteristiques.nbChambres || "",
          nbSallesBain: ihe.caracteristiques.nbSallesBain || "",
          nbSalons: ihe.caracteristiques.nbSalons || "",
          garage: ihe.caracteristiques.garage || false,
          piscine: ihe.caracteristiques.piscine || false,
          jardin: ihe.caracteristiques.jardin || false,
          climatisation: ihe.caracteristiques.climatisation || false,
          anneeConstruction: ihe.caracteristiques.anneeConstruction || "",
          etatGeneral: ihe.caracteristiques.etatGeneral || "",
          electricite: ihe.caracteristiques.electricite || false,
          eau: ihe.caracteristiques.eau || false,
          securite: ihe.caracteristiques.securite || false,
          irrigation: ihe.caracteristiques.irrigation || false,
          cloture: ihe.caracteristiques.cloture || false,
          arbore: ihe.caracteristiques.arbore || false,
          potager: ihe.caracteristiques.potager || false,
          typesArbres: ihe.caracteristiques.typesArbres || [],
          elementsJardin: ihe.caracteristiques.elementsJardin || "",
        });
      }

      setExistingMedias(ihe.medias || []);
    } catch (err) {
      console.error("Erreur chargement IHE:", err);
      setError("Erreur lors du chargement de l'IHE");
    } finally {
      setLoadingData(false);
    }
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

  const handleCaracteristiquesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCaracteristiques((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handleAddMedia = (type) => {
    const newMedia = {
      id: Date.now(),
      type,
      titre: "",
      description: "",
      url: "",
      file: null,
      preview: null,
      ordre: newMedias.length,
    };
    setNewMedias([...newMedias, newMedia]);
  };

  const handleRemoveMedia = (id) => {
    setNewMedias(newMedias.filter((m) => m.id !== id));
  };

  const handleMediaChange = (id, field, value) => {
    setNewMedias(
      newMedias.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const handleFileChange = async (id, file) => {
    if (!file) return;
    let preview = null;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }
    handleMediaChange(id, "file", file);
    handleMediaChange(id, "preview", preview);
  };

  const handleDeleteExistingMedia = async (mediaId) => {
    if (!window.confirm("Supprimer ce média ?")) return;
    try {
      await api.delete(`/banque/ihe/${id}/media/${mediaId}`);
      setExistingMedias(existingMedias.filter((m) => m._id !== mediaId));
      setSuccess("Média supprimé");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const uploadFile = async (file, mediaType = "photo") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", mediaType); // 'photo' ou 'document'
    
    // Utiliser la route spécifique pour les médias IHE
    const response = await api.post("/banque/ihe/upload-media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    return response.data.url;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.type || !formData.titre || !formData.valeurComptable) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }
    }
    if (currentStep === 1) {
      if (!localisation.ville) {
        setError("La ville est obligatoire");
        return;
      }
    }
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const dataToSend = {
        ...formData,
        nomClient: formData.nomClient || undefined,
        valeurAdjudication: formData.valeurAdjudication ? parseFloat(formData.valeurAdjudication) : undefined,
        valeurDation: formData.valeurDation ? parseFloat(formData.valeurDation) : undefined,
        valeurNetteComptable: formData.valeurNetteComptable ? parseFloat(formData.valeurNetteComptable) : undefined,
        valeurComptable: parseFloat(formData.valeurComptable),
        valeurAcquisition: formData.valeurAcquisition ? parseFloat(formData.valeurAcquisition) : undefined,
        valeurCession: formData.valeurCession ? parseFloat(formData.valeurCession) : undefined,
        superficie: formData.superficie ? parseFloat(formData.superficie) : undefined,
        dateAcquisition: formData.dateAcquisition || undefined,
        commentaires: formData.commentaires || undefined,
        // Champs réglementaires
        dateReclassement: formData.dateReclassement || undefined,
        dureeMaximaleDetention: formData.dureeMaximaleDetention ? parseInt(formData.dureeMaximaleDetention) : undefined,
        planCession: formData.planCession || undefined,
        localisation: {
          ...localisation,
          latitude: localisation.latitude ? parseFloat(localisation.latitude) : undefined,
          longitude: localisation.longitude ? parseFloat(localisation.longitude) : undefined,
        },
        caracteristiques: {
          ...caracteristiques,
          nbChambres: caracteristiques.nbChambres ? parseInt(caracteristiques.nbChambres) : undefined,
          nbSallesBain: caracteristiques.nbSallesBain ? parseInt(caracteristiques.nbSallesBain) : undefined,
          nbSalons: caracteristiques.nbSalons ? parseInt(caracteristiques.nbSalons) : undefined,
          anneeConstruction: caracteristiques.anneeConstruction ? parseInt(caracteristiques.anneeConstruction) : undefined,
          typesArbres: caracteristiques.typesArbres
            ? caracteristiques.typesArbres
                .filter((arbre) => arbre.type && arbre.nombre)
                .map((arbre) => ({
                  type: arbre.type,
                  nombre: parseInt(arbre.nombre) || 0,
                }))
            : undefined,
        },
      };

      // Mettre à jour l'IHE
      await api.put(`/banque/ihe/${id}`, dataToSend);

      // Uploader les nouveaux médias
      if (newMedias.length > 0) {
        setUploadingMedias(true);
        for (const media of newMedias) {
          try {
            let url = media.url;
            
            // Si c'est un fichier, l'uploader avec le type approprié
            // Note: Les vidéos ne sont pas uploadées (ce sont des URLs YouTube/Vimeo)
            if (media.file && (media.type === "photo" || media.type === "document")) {
              // Passer l'iheId pour organiser les fichiers dans Cloudinary
              const formData = new FormData();
              formData.append("file", media.file);
              formData.append("mediaType", media.type);
              formData.append("iheId", id);
              
              console.log("📤 [EditIHE] Upload média:", {
                type: media.type,
                fileName: media.file.name,
                iheId: id,
              });
              
              const uploadResponse = await api.post("/banque/ihe/upload-media", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              
              console.log("✅ [EditIHE] Upload réussi:", uploadResponse.data);
              url = uploadResponse.data.url;
              
              if (!url) {
                console.error("❌ [EditIHE] URL manquante dans la réponse:", uploadResponse.data);
                throw new Error("URL non retournée par le serveur");
              }
            }
            
            // Si on a une URL (uploadée ou fournie), créer le média
            // Pour les vidéos, on utilise directement l'URL fournie
            if (url && media.titre) {
              console.log("📝 [EditIHE] Création du média dans la DB:", {
                type: media.type,
                titre: media.titre,
                url: url.substring(0, 50) + "...",
                iheId: id,
              });
              
              const createResponse = await api.post(`/banque/ihe/${id}/media`, {
                type: media.type,
                titre: media.titre,
                description: media.description || "",
                url,
                ordre: media.ordre,
              });
              
              console.log("✅ [EditIHE] Média créé dans la DB:", createResponse.data);
            } else {
              console.warn("⚠️ [EditIHE] Média ignoré (URL ou titre manquant):", {
                url: !!url,
                titre: !!media.titre,
                type: media.type,
              });
            }
          } catch (mediaErr) {
            console.error("Erreur upload média:", mediaErr);
            setError(`Erreur lors de l'upload du média "${media.titre || 'sans titre'}": ${mediaErr.response?.data?.message || mediaErr.message}`);
            // Continuer avec les autres médias même en cas d'erreur
          }
        }
        setUploadingMedias(false);
      }

      setSuccess("✅ IHE modifiée avec succès !");
      
      setTimeout(() => {
        navigate(`/banque/ihe/${id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification de l'IHE");
      setUploadingMedias(false);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box>
            <Card elevation={2} sx={{ mb: 3, borderLeft: "4px solid #f5576c" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Home sx={{ color: "#f5576c", fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Type & Informations générales
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Sélectionnez le type de bien IHE *
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {Object.entries(typesLabels).map(([key, { label, icon: Icon, color }]) => (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <Card
                        elevation={formData.type === key ? 4 : 1}
                        sx={{
                          cursor: "pointer",
                          border: formData.type === key ? `3px solid ${color}` : "1px solid #e0e0e0",
                          bgcolor: formData.type === key ? `${color}10` : "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: color,
                            transform: "translateY(-4px)",
                            boxShadow: 4,
                          },
                        }}
                        onClick={() => setFormData((prev) => ({ ...prev, type: key }))}
                      >
                        <CardContent sx={{ textAlign: "center", py: 2.5 }}>
                          <Icon sx={{ fontSize: 48, color, mb: 1 }} />
                          <Typography variant="body1" fontWeight={formData.type === key ? "bold" : "medium"}>
                            {label}
                          </Typography>
                          {formData.type === key && (
                            <CheckCircle sx={{ color, fontSize: 20, mt: 0.5 }} />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Informations détaillées
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Titre *"
                      name="titre"
                      value={formData.titre}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nom du client"
                      name="nomClient"
                      value={formData.nomClient}
                      onChange={handleChange}
                      variant="outlined"
                      helperText="Nom du client/propriétaire d'origine"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Superficie"
                      name="superficie"
                      type="number"
                      value={formData.superficie}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <TextField
                              select
                              value={formData.uniteSuperficie}
                              onChange={(e) => setFormData((prev) => ({ ...prev, uniteSuperficie: e.target.value }))}
                              sx={{ width: 80 }}
                              variant="standard"
                            >
                              <MenuItem value="m²">m²</MenuItem>
                              <MenuItem value="ha">ha</MenuItem>
                              <MenuItem value="are">are</MenuItem>
                            </TextField>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      placeholder="Décrivez l'IHE en détail..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                      Informations financières
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valeur d'adjudication"
                      name="valeurAdjudication"
                      type="number"
                      value={formData.valeurAdjudication}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: "primary.main" }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Valeur lors de l'adjudication (FCFA)"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valeur de dation"
                      name="valeurDation"
                      type="number"
                      value={formData.valeurDation}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: "primary.main" }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Valeur lors d'une dation en paiement (FCFA)"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valeur nette comptable"
                      name="valeurNetteComptable"
                      type="number"
                      value={formData.valeurNetteComptable}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: "primary.main" }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Valeur comptable nette après amortissements (FCFA)"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valeur comptable *"
                      name="valeurComptable"
                      type="number"
                      value={formData.valeurComptable}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: "primary.main" }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Valeur comptable brute de l'IHE (FCFA)"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valeur d'acquisition"
                      name="valeurAcquisition"
                      type="number"
                      value={formData.valeurAcquisition}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: "primary.main" }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Valeur d'achat initiale (FCFA)"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valeur de cession"
                      name="valeurCession"
                      type="number"
                      value={formData.valeurCession}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney sx={{ color: "primary.main" }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Prix de vente ou valeur estimée de cession (FCFA)"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date d'acquisition"
                      name="dateAcquisition"
                      type="date"
                      value={formData.dateAcquisition}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Notes internes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Notes internes pour la gestion..."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Commentaires"
                      name="commentaires"
                      value={formData.commentaires}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Commentaires généraux sur l'IHE..."
                    />
                  </Grid>

                  {/* Section Suivi réglementaire */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday sx={{ color: "#667eea" }} />
                      Suivi réglementaire et cession
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date de reclassement en IHE"
                      name="dateReclassement"
                      type="date"
                      value={formData.dateReclassement}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Date à laquelle le bien a été reclassé en IHE"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Durée maximale de détention"
                      name="dureeMaximaleDetention"
                      type="number"
                      value={formData.dureeMaximaleDetention}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2" color="text.secondary">
                              mois
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                      helperText="Durée maximale autorisée de détention (par défaut: 60 mois = 5 ans)"
                      inputProps={{ min: 1, max: 120 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Plan de cession"
                      name="planCession"
                      value={formData.planCession}
                      onChange={handleChange}
                      helperText="Stratégie de cession, notes, documents de référence..."
                      placeholder="Décrivez le plan de cession prévu pour ce bien..."
                    />
                  </Grid>
                  {formData.dateReclassement && formData.dureeMaximaleDetention && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2" fontWeight="bold">
                          Date limite de cession calculée :
                        </Typography>
                        <Typography variant="body1">
                          {(() => {
                            const dateReclassement = new Date(formData.dateReclassement);
                            const dureeMois = parseInt(formData.dureeMaximaleDetention) || 60;
                            const dateLimite = new Date(dateReclassement);
                            dateLimite.setMonth(dateLimite.getMonth() + dureeMois);
                            return dateLimite.toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            });
                          })()}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 1:
        return (
          <Card elevation={2} sx={{ borderLeft: "4px solid #f44336" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <LocationOn sx={{ color: "#f44336", fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">
                  Localisation géographique
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse complète"
                    name="adresse"
                    value={localisation.adresse}
                    onChange={handleLocalisationChange}
                    placeholder="Ex: Rue 123, Secteur..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ville *"
                    name="ville"
                    value={localisation.ville}
                    onChange={handleLocalisationChange}
                    required
                    helperText="Ville où se trouve l'IHE"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quartier"
                    name="quartier"
                    value={localisation.quartier}
                    onChange={handleLocalisationChange}
                    placeholder="Nom du quartier"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Coordonnées GPS (optionnel - pour affichage sur la carte)
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    type="number"
                    value={localisation.latitude}
                    onChange={handleLocalisationChange}
                    helperText="Ex: 12.345678"
                    InputProps={{
                      inputProps: { step: "any" },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    type="number"
                    value={localisation.longitude}
                    onChange={handleLocalisationChange}
                    helperText="Ex: -1.234567"
                    InputProps={{
                      inputProps: { step: "any" },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card elevation={2} sx={{ borderLeft: "4px solid #ff9800" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Home sx={{ color: "#ff9800", fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">
                  Caractéristiques du bien
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {formData.type !== "terrain" && formData.type !== "jardin" && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Informations de base
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nombre de chambres"
                        name="nbChambres"
                        type="number"
                        value={caracteristiques.nbChambres}
                        onChange={handleCaracteristiquesChange}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nombre de salles de bain"
                        name="nbSallesBain"
                        type="number"
                        value={caracteristiques.nbSallesBain}
                        onChange={handleCaracteristiquesChange}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nombre de salons"
                        name="nbSalons"
                        type="number"
                        value={caracteristiques.nbSalons}
                        onChange={handleCaracteristiquesChange}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Année de construction"
                        name="anneeConstruction"
                        type="number"
                        value={caracteristiques.anneeConstruction}
                        onChange={handleCaracteristiquesChange}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="État général"
                        name="etatGeneral"
                        value={caracteristiques.etatGeneral}
                        onChange={handleCaracteristiquesChange}
                      >
                        <MenuItem value="">Non spécifié</MenuItem>
                        <MenuItem value="neuf">Neuf</MenuItem>
                        <MenuItem value="bon">Bon</MenuItem>
                        <MenuItem value="moyen">Moyen</MenuItem>
                        <MenuItem value="a_renover">À rénover</MenuItem>
                      </TextField>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Équipements et services
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={caracteristiques.garage ? 2 : 0}
                    sx={{
                      p: 2,
                      border: `2px solid ${caracteristiques.garage ? "#2196f3" : "#e0e0e0"}`,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: caracteristiques.garage ? "#e3f2fd" : "white",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "#2196f3" },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, garage: !prev.garage }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.garage} />}
                      label="Garage"
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={caracteristiques.piscine ? 2 : 0}
                    sx={{
                      p: 2,
                      border: `2px solid ${caracteristiques.piscine ? "#2196f3" : "#e0e0e0"}`,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: caracteristiques.piscine ? "#e3f2fd" : "white",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "#2196f3" },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, piscine: !prev.piscine }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.piscine} />}
                      label="Piscine"
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={caracteristiques.jardin ? 2 : 0}
                    sx={{
                      p: 2,
                      border: `2px solid ${caracteristiques.jardin ? "#2196f3" : "#e0e0e0"}`,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: caracteristiques.jardin ? "#e3f2fd" : "white",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "#2196f3" },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, jardin: !prev.jardin }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.jardin} />}
                      label="Jardin"
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={caracteristiques.climatisation ? 2 : 0}
                    sx={{
                      p: 2,
                      border: `2px solid ${caracteristiques.climatisation ? "#2196f3" : "#e0e0e0"}`,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: caracteristiques.climatisation ? "#e3f2fd" : "white",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "#2196f3" },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, climatisation: !prev.climatisation }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.climatisation} />}
                      label="Climatisation"
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={caracteristiques.electricite ? 2 : 0}
                    sx={{
                      p: 2,
                      border: `2px solid ${caracteristiques.electricite ? "#2196f3" : "#e0e0e0"}`,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: caracteristiques.electricite ? "#e3f2fd" : "white",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "#2196f3" },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, electricite: !prev.electricite }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.electricite} />}
                      label="Électricité"
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={caracteristiques.eau ? 2 : 0}
                    sx={{
                      p: 2,
                      border: `2px solid ${caracteristiques.eau ? "#2196f3" : "#e0e0e0"}`,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: caracteristiques.eau ? "#e3f2fd" : "white",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "#2196f3" },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, eau: !prev.eau }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.eau} />}
                      label="Eau"
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={caracteristiques.securite ? 2 : 0}
                    sx={{
                      p: 2,
                      border: `2px solid ${caracteristiques.securite ? "#2196f3" : "#e0e0e0"}`,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: caracteristiques.securite ? "#e3f2fd" : "white",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "#2196f3" },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, securite: !prev.securite }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.securite} />}
                      label="Sécurité"
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                {/* Champs spécifiques Jardin */}
                {formData.type === "jardin" && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 3 }} />
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Nature sx={{ color: "#4caf50", fontSize: 24 }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Caractéristiques spécifiques du jardin
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        {[
                          { key: "irrigation", label: "Irrigation" },
                          { key: "cloture", label: "Clôture" },
                          { key: "arbore", label: "Arboré" },
                          { key: "potager", label: "Potager" },
                        ].map(({ key, label }) => (
                          <Grid item xs={6} sm={3} key={key}>
                            <Paper
                              elevation={caracteristiques[key] ? 2 : 0}
                              sx={{
                                p: 2,
                                border: `2px solid ${caracteristiques[key] ? "#4caf50" : "#e0e0e0"}`,
                                borderRadius: 2,
                                cursor: "pointer",
                                bgcolor: caracteristiques[key] ? "#e8f5e9" : "white",
                                transition: "all 0.2s",
                                "&:hover": { borderColor: "#4caf50" },
                              }}
                              onClick={() =>
                                setCaracteristiques((prev) => ({ ...prev, [key]: !prev[key] }))
                              }
                            >
                              <FormControlLabel
                                control={<Checkbox checked={caracteristiques[key]} />}
                                label={label}
                                sx={{ m: 0, width: "100%" }}
                              />
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>

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
                              placeholder="Ex: Manguier, Oranger..."
                              fullWidth
                              size="small"
                            />
                            <TextField
                              label="Nombre"
                              type="number"
                              value={arbre.nombre || ""}
                              onChange={(e) => handleArbreChange(index, "nombre", e.target.value)}
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

                <Grid item xs={12}>
                  <TextField
                    label="Éléments présents dans le jardin"
                    name="elementsJardin"
                    value={caracteristiques.elementsJardin || ""}
                    onChange={handleCaracteristiquesChange}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Décrivez ce qu'il y a dans le jardin..."
                  />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        );

      case 3:
        const existingPhotos = existingMedias.filter((m) => m.type === "photo");
        const existingVideos = existingMedias.filter((m) => m.type === "video");
        const existingDocuments = existingMedias.filter((m) => m.type === "document");
        const newPhotos = newMedias.filter((m) => m.type === "photo");
        const newVideos = newMedias.filter((m) => m.type === "video");
        const newDocuments = newMedias.filter((m) => m.type === "document");
        const totalPhotos = existingPhotos.length + newPhotos.length;
        const totalVideos = existingVideos.length + newVideos.length;
        const totalDocuments = existingDocuments.length + newDocuments.length;

        // Fonction pour convertir une URL YouTube/Vimeo en URL embed
        const getVideoEmbedUrl = (url) => {
          if (!url) return "";
          
          // YouTube
          if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
            const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
            return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url;
          }
          
          // Vimeo
          if (url.includes("vimeo.com")) {
            const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
            return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : url;
          }
          
          return url;
        };

        // Fonction pour extraire le nom du fichier depuis une URL
        const getFileNameFromUrl = (url) => {
          if (!url) return "";
          
          try {
            // Pour les URLs Cloudinary, extraire le nom depuis le chemin
            if (url.includes("cloudinary.com")) {
              const urlParts = url.split("/");
              const fileNameWithExt = urlParts[urlParts.length - 1].split("?")[0];
              // Retirer les suffixes Cloudinary (timestamp, uuid, etc.)
              const cleanName = fileNameWithExt
                .replace(/_\d{13}_[a-z0-9]{8}\./, ".") // Format: nom_1234567890_abc12345.ext
                .replace(/_[a-z0-9]{8}_\d{13}\./, ".") // Format alternatif
                .replace(/_v\d+/, ""); // Retirer les versions Cloudinary
              return cleanName || fileNameWithExt;
            }
            
            // Pour les autres URLs, utiliser le dernier segment du chemin
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split("/");
            const fileName = pathParts[pathParts.length - 1];
            return fileName || "document";
          } catch (e) {
            // Si ce n'est pas une URL valide, essayer d'extraire depuis le chemin simple
            const parts = url.split("/");
            return parts[parts.length - 1].split("?")[0] || "document";
          }
        };

        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📸 Médias et Documents
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gérez les médias existants et ajoutez-en de nouveaux pour illustrer votre IHE
                </Typography>
              </Box>
              <Chip
                label={`${existingMedias.length + newMedias.length} média${existingMedias.length + newMedias.length > 1 ? "x" : ""}`}
                color="primary"
                variant="outlined"
              />
            </Box>

            {/* Onglets */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={mediaTab}
                onChange={(e, newValue) => setMediaTab(newValue)}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                  },
                }}
              >
                <Tab
                  icon={
                    <Badge badgeContent={totalPhotos} color="primary">
                      <Photo />
                    </Badge>
                  }
                  iconPosition="start"
                  label={`Photos${totalPhotos > 0 ? ` (${totalPhotos})` : ""}`}
                />
                <Tab
                  icon={
                    <Badge badgeContent={totalVideos} color="primary">
                      <VideoLibrary />
                    </Badge>
                  }
                  iconPosition="start"
                  label={`Vidéos${totalVideos > 0 ? ` (${totalVideos})` : ""}`}
                />
                <Tab
                  icon={
                    <Badge badgeContent={totalDocuments} color="primary">
                      <Description />
                    </Badge>
                  }
                  iconPosition="start"
                  label={`Documents${totalDocuments > 0 ? ` (${totalDocuments})` : ""}`}
                />
              </Tabs>
            </Paper>

            {/* Contenu des onglets */}
            <Box sx={{ minHeight: 400 }}>
              {/* Onglet Photos */}
              {mediaTab === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Photos ({totalPhotos})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => handleAddMedia("photo")}
                      size="small"
                    >
                      Ajouter une photo
                    </Button>
                  </Box>

                  {totalPhotos === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Aucune photo. Cliquez sur "Ajouter une photo" pour commencer.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {/* Photos existantes */}
                      {existingPhotos.map((media) => (
                        <Grid item xs={12} md={6} key={media._id}>
                          <Card elevation={2} sx={{ borderLeft: "4px solid #2196f3" }}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Photo color="primary" />
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {media.titre}
                                  </Typography>
                                  <Chip label="Existant" size="small" color="success" />
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteExistingMedia(media._id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                              {media.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {media.description}
                                </Typography>
                              )}
                              <Box
                                sx={{
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                <img
                                  src={media.url}
                                  alt={media.titre}
                                  style={{
                                    width: "100%",
                                    height: 200,
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                      {/* Nouvelles photos */}
                      {newPhotos.map((media, index) => (
                        <Grid item xs={12} md={6} key={media.id}>
                          <Card elevation={2} sx={{ borderLeft: "4px solid #4caf50" }}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Photo color="primary" />
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Nouvelle Photo #{index + 1}
                                  </Typography>
                                  <Chip label="Nouveau" size="small" color="info" />
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMedia(media.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                              {media.preview && (
                                <Box
                                  sx={{
                                    mb: 2,
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    border: "1px solid",
                                    borderColor: "divider",
                                  }}
                                >
                                  <img
                                    src={media.preview}
                                    alt="Preview"
                                    style={{
                                      width: "100%",
                                      height: 200,
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                </Box>
                              )}
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Titre *"
                                    value={media.titre}
                                    onChange={(e) => handleMediaChange(media.id, "titre", e.target.value)}
                                    size="small"
                                    required
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Description"
                                    value={media.description}
                                    onChange={(e) => handleMediaChange(media.id, "description", e.target.value)}
                                    size="small"
                                    multiline
                                    rows={2}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 1 }}
                                  >
                                    {media.file ? media.file.name : "Télécharger une photo"}
                                    <input
                                      type="file"
                                      hidden
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) handleFileChange(media.id, file);
                                      }}
                                    />
                                  </Button>
                                  <TextField
                                    fullWidth
                                    label="URL (optionnel)"
                                    value={media.url}
                                    onChange={(e) => handleMediaChange(media.id, "url", e.target.value)}
                                    size="small"
                                    helperText="Ou fournissez une URL directe de l'image"
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* Onglet Vidéos */}
              {mediaTab === 1 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Vidéos ({totalVideos})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => handleAddMedia("video")}
                      size="small"
                    >
                      Ajouter une vidéo
                    </Button>
                  </Box>

                  {totalVideos === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Aucune vidéo. Cliquez sur "Ajouter une vidéo" pour commencer.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {/* Vidéos existantes */}
                      {existingVideos.map((media) => (
                        <Grid item xs={12} md={6} key={media._id}>
                          <Card elevation={2} sx={{ borderLeft: "4px solid #f44336", borderRadius: 2, overflow: "hidden" }}>
                            <Box sx={{ position: "relative", width: "100%", paddingTop: "56.25%" /* 16:9 */ }}>
                              <iframe
                                src={getVideoEmbedUrl(media.url)}
                                title={media.titre}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  border: "none",
                                }}
                              />
                            </Box>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box flex={1}>
                                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <VideoLibrary color="error" />
                                    <Typography variant="subtitle1" fontWeight="bold">
                                      {media.titre}
                                    </Typography>
                                    <Chip label="Existant" size="small" color="success" />
                                  </Box>
                                  {media.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                      {media.description}
                                    </Typography>
                                  )}
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    href={media.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<OpenInNew />}
                                    sx={{ mt: 1 }}
                                  >
                                    Ouvrir dans un nouvel onglet
                                  </Button>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteExistingMedia(media._id)}
                                  sx={{ ml: 1 }}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                      {/* Nouvelles vidéos */}
                      {newVideos.map((media, index) => (
                        <Grid item xs={12} md={6} key={media.id}>
                          <Card elevation={2} sx={{ borderLeft: "4px solid #4caf50", borderRadius: 2, overflow: "hidden" }}>
                            {/* Aperçu de la vidéo si URL fournie */}
                            {media.url && getVideoEmbedUrl(media.url) && (
                              <Box sx={{ position: "relative", width: "100%", paddingTop: "56.25%" /* 16:9 */ }}>
                                <iframe
                                  src={getVideoEmbedUrl(media.url)}
                                  title={media.titre || `Nouvelle Vidéo ${index + 1}`}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                  }}
                                />
                              </Box>
                            )}
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <VideoLibrary color="error" />
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Nouvelle Vidéo #{index + 1}
                                  </Typography>
                                  <Chip label="Nouveau" size="small" color="info" />
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMedia(media.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Titre *"
                                    value={media.titre}
                                    onChange={(e) => handleMediaChange(media.id, "titre", e.target.value)}
                                    size="small"
                                    required
                                  />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Description"
                                    value={media.description}
                                    onChange={(e) => handleMediaChange(media.id, "description", e.target.value)}
                                    size="small"
                                    multiline
                                    rows={2}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="URL de la vidéo *"
                                    value={media.url}
                                    onChange={(e) => handleMediaChange(media.id, "url", e.target.value)}
                                    size="small"
                                    placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                                    helperText="Collez le lien de la vidéo (YouTube, Vimeo, etc.)"
                                    required
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* Onglet Documents */}
              {mediaTab === 2 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Documents ({totalDocuments})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => handleAddMedia("document")}
                      size="small"
                    >
                      Ajouter un document
                    </Button>
                  </Box>

                  {totalDocuments === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Aucun document. Cliquez sur "Ajouter un document" pour commencer.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {/* Documents existants */}
                      {existingDocuments.map((media) => {
                        const fileName = getFileNameFromUrl(media.url);
                        return (
                          <Grid item xs={12} sm={6} md={4} key={media._id}>
                            <Card 
                              elevation={2} 
                              sx={{ 
                                borderLeft: "4px solid #ff9800", 
                                borderRadius: 2, 
                                height: "100%",
                                display: "flex",
                                flexDirection: "column"
                              }}
                            >
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <Avatar sx={{ bgcolor: "warning.main", width: 40, height: 40 }}>
                                    <Description />
                                  </Avatar>
                                  <Box flex={1}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                      {media.titre}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                      📄 {fileName}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteExistingMedia(media._id)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                                <Chip label="Existant" size="small" color="success" sx={{ mb: 1 }} />
                                {media.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {media.description}
                                  </Typography>
                                )}
                                <Button
                                  variant="contained"
                                  fullWidth
                                  startIcon={<Download />}
                                  href={media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ textTransform: "none" }}
                                >
                                  Télécharger le document
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                      {/* Nouveaux documents */}
                      {newDocuments.map((media, index) => (
                        <Grid item xs={12} sm={6} md={4} key={media.id}>
                          <Card 
                            elevation={2} 
                            sx={{ 
                              borderLeft: "4px solid #4caf50",
                              borderRadius: 2,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column"
                            }}
                          >
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Avatar sx={{ bgcolor: "info.main", width: 40, height: 40 }}>
                                  <Description />
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Nouveau Document #{index + 1}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMedia(media.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                              <Chip label="Nouveau" size="small" color="info" sx={{ mb: 2 }} />
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Titre *"
                                    value={media.titre}
                                    onChange={(e) => handleMediaChange(media.id, "titre", e.target.value)}
                                    size="small"
                                    required
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Description"
                                    value={media.description}
                                    onChange={(e) => handleMediaChange(media.id, "description", e.target.value)}
                                    size="small"
                                    multiline
                                    rows={2}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Box sx={{ mb: 2 }}>
                                    <Button
                                      variant="outlined"
                                      component="label"
                                      startIcon={<CloudUpload />}
                                      fullWidth
                                      size="small"
                                      sx={{ mb: 1 }}
                                      color={media.file ? "success" : "primary"}
                                    >
                                      {media.file ? `📄 ${media.file.name}` : "Télécharger un document"}
                                      <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) handleFileChange(media.id, file);
                                        }}
                                      />
                                    </Button>
                                    {media.file && (
                                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mt: 1 }}>
                                        <Chip
                                          icon={<Description />}
                                          label={media.file.name}
                                          color="success"
                                          size="small"
                                          sx={{ maxWidth: "100%" }}
                                        />
                                        <Chip
                                          label={`${(media.file.size / 1024).toFixed(2)} KB`}
                                          size="small"
                                          variant="outlined"
                                          color="success"
                                        />
                                      </Box>
                                    )}
                                  </Box>
                                  <TextField
                                    fullWidth
                                    label="URL (optionnel)"
                                    value={media.url}
                                    onChange={(e) => handleMediaChange(media.id, "url", e.target.value)}
                                    size="small"
                                    helperText="Ou fournissez une URL directe du document (si vous n'avez pas téléchargé de fichier)"
                                    disabled={!!media.file}
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Card elevation={2} sx={{ mb: 3, borderLeft: "4px solid #4caf50" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <CheckCircle sx={{ color: "#4caf50", fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Résumé des modifications
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Vérifiez les informations avant de sauvegarder les modifications.
                </Typography>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Home /> Informations générales
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Type
                        </Typography>
                        <Chip
                          label={typesLabels[formData.type]?.label || formData.type}
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Titre
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formData.titre}
                        </Typography>
                      </Box>
                      {formData.superficie && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Superficie
                          </Typography>
                          <Typography variant="body1">
                            {formData.superficie} {formData.uniteSuperficie}
                          </Typography>
                        </Box>
                      )}
                      {formData.description && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Description
                          </Typography>
                          <Typography variant="body2">{formData.description}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AttachMoney /> Valeurs financières
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "primary.50",
                          borderRadius: 2,
                          borderLeft: "4px solid",
                          borderColor: "primary.main",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Valeur comptable
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {new Intl.NumberFormat("fr-FR").format(formData.valeurComptable || 0)} FCFA
                        </Typography>
                      </Box>
                      {formData.valeurAcquisition && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Valeur d'acquisition
                          </Typography>
                          <Typography variant="body1">
                            {new Intl.NumberFormat("fr-FR").format(formData.valeurAcquisition)} FCFA
                          </Typography>
                        </Box>
                      )}
                      {formData.dateAcquisition && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Date d'acquisition
                          </Typography>
                          <Typography variant="body1">
                            {new Date(formData.dateAcquisition).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOn /> Localisation
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1}>
                      {localisation.adresse && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Adresse
                          </Typography>
                          <Typography variant="body2">{localisation.adresse}</Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Ville
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {localisation.ville}
                        </Typography>
                      </Box>
                      {localisation.quartier && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Quartier
                          </Typography>
                          <Typography variant="body2">{localisation.quartier}</Typography>
                        </Box>
                      )}
                      {(localisation.latitude || localisation.longitude) && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Coordonnées GPS
                          </Typography>
                          <Typography variant="body2">
                            {localisation.latitude && localisation.longitude
                              ? `${localisation.latitude}, ${localisation.longitude}`
                              : "Non renseignées"}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Photo /> Médias
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Médias existants
                        </Typography>
                        <Typography variant="body1">
                          {existingMedias.length} média{existingMedias.length > 1 ? "x" : ""}
                        </Typography>
                      </Box>
                      {newMedias.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Nouveaux médias à ajouter
                          </Typography>
                          <Typography variant="body1" color="success.main">
                            + {newMedias.length} nouveau{newMedias.length > 1 ? "x" : ""}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={`Total: ${existingMedias.length + newMedias.length} média${existingMedias.length + newMedias.length > 1 ? "x" : ""}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loadingData) {
    return (
      <PageLayout>
        <Box sx={{ width: "100%", mt: 4 }}>
          <LinearProgress />
          <Typography align="center" sx={{ mt: 2 }}>
            Chargement des données...
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* En-tête moderne */}
        <Card
          elevation={4}
          sx={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
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
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: 64,
                  height: 64,
                  border: "3px solid rgba(255,255,255,0.3)",
                }}
              >
                <Edit sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Modifier l'Immobilisation Hors Exploitation
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Modifiez les informations de l'IHE. Les changements seront sauvegardés immédiatement.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stepper moderne */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Stepper
            activeStep={currentStep}
            sx={{
              "& .MuiStepLabel-root": {
                "& .MuiStepLabel-label": {
                  fontWeight: 600,
                },
              },
              "& .MuiStepIcon-root": {
                fontSize: "2rem",
                "&.Mui-completed": {
                  color: "#4caf50",
                },
                "&.Mui-active": {
                  color: "#f5576c",
                },
              },
            }}
          >
            {steps.map((label, index) => {
              const icons = [Home, LocationOn, Home, Photo, CheckCircle];
              const Icon = icons[index] || Home;
              return (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Avatar
                        sx={{
                          bgcolor: completed ? "#4caf50" : active ? "#f5576c" : "grey.300",
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Icon sx={{ color: "white" }} />
                      </Avatar>
                    )}
                  >
                    {label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          {renderStepContent()}
        </Paper>

        {/* Navigation moderne */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mt: 4,
            borderRadius: 2,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button
              variant="outlined"
              disabled={currentStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{
                minWidth: 150,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Précédent
            </Button>

            <Chip
              label={`Étape ${currentStep + 1} sur ${steps.length}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />

            {currentStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || uploadingMedias}
                startIcon={loading || uploadingMedias ? <CircularProgress size={20} /> : <Save />}
                sx={{
                  minWidth: 200,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                  },
                }}
              >
                {loading || uploadingMedias
                  ? uploadingMedias
                    ? "Upload des médias..."
                    : "Sauvegarde..."
                  : "Enregistrer les modifications"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{
                  minWidth: 150,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                  },
                }}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </PageLayout>
  );
};

export default EditIHEPage;

