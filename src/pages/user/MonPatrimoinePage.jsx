import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  TextField,
  MenuItem,
  InputAdornment,
  Stack,
  Divider,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Add,
  Home,
  Villa,
  Apartment,
  Park,
  Square,
  ArrowBack,
  CheckCircle,
  Cancel,
  LocationOn,
  AttachMoney,
  Description,
  CloudUpload,
  Edit,
  Delete,
  Map as MapIcon,
  Close,
  Visibility,
  CalendarMonth,
  Gavel,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ClientLayout from "../../components/client/ClientLayout";
import AgencePageHeader from "../../components/agence/AgencePageHeader";
import LandscapeIcon from "@mui/icons-material/Landscape";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SellIcon from "@mui/icons-material/Sell";
import api from "../../services/api";

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Composant pour cliquer sur la carte et obtenir les coordonnées
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const MonPatrimoinePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "",
    reference: "",
    titre: "",
    description: "",
    superficie: "",
    valeurEstimee: "",
    statut: "possede",
    titreFoncier: "",
    numeroTitre: "",
    dateAcquisition: "",
    modeAcquisition: "",
    notes: "",
  });

  const [localisation, setLocalisation] = useState({
    adresse: "",
    ville: "",
    quartier: "",
    commune: "",
    latitude: "",
    longitude: "",
  });

  const [caracteristiques, setCaracteristiques] = useState({
    bornage: false,
    cloture: false,
    viabilise: false,
    accesBitume: false,
    electricite: false,
    eau: false,
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");

  const [biens, setBiens] = useState([]);
  const [contrePropositions, setContrePropositions] = useState([]);
  const [mapDialog, setMapDialog] = useState(false);
  const [mapPosition, setMapPosition] = useState({ lat: 13.5116, lng: 2.1254 }); // Niamey par défaut

  // Charger les biens au montage du composant et quand on change d'onglet
  useEffect(() => {
    fetchBiens();
    fetchContrePropositions();
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      fetchBiens();
    }
  }, [activeTab]);

  const fetchBiens = async () => {
    setLoading(true);
    try {
      const res = await api.get("/client/patrimoine");
      setBiens(res.data || []);
    } catch (err) {
      console.error("Erreur chargement patrimoine:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContrePropositions = async () => {
    try {
      const res = await api.get("/patrimoine/ventes/mes-ventes"); // Chemin correct
      console.log("📊 [CLIENT] Toutes les ventes:", res.data);
      const contreProps = res.data.filter(v => v.statut === "contre_propose");
      console.log("📊 [CLIENT] Contre-propositions trouvées:", contreProps);
      setContrePropositions(contreProps);
    } catch (err) {
      console.error("Erreur chargement contre-propositions:", err);
    }
  };

  const handleAccepterContreProposition = async (venteId) => {
    try {
      await api.put(`/patrimoine/ventes/${venteId}/accepter-contre-proposition`);
      setSuccess("Contre-proposition acceptée !");
      fetchContrePropositions();
      fetchBiens();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'acceptation");
    }
  };

  const handleRefuserContreProposition = async (venteId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir refuser cette contre-proposition ? La vente sera annulée.")) {
      return;
    }
    try {
      await api.put(`/patrimoine/ventes/${venteId}/refuser-contre-proposition`);
      setSuccess("Contre-proposition refusée. La vente a été annulée.");
      fetchContrePropositions();
      fetchBiens();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du refus");
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalisationChange = (e) => {
    const { name, value } = e.target;
    setLocalisation((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaracteristiquesChange = (e) => {
    const { name, checked } = e.target;
    setCaracteristiques((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validation : maximum 5 photos
    if (photoFiles.length + files.length > 5) {
      setError("Vous ne pouvez ajouter que 5 photos maximum");
      return;
    }
    
    setPhotoFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    
    setError(""); // Clear error
  };

  const removePhoto = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocumentFiles((prev) => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openMapPicker = () => {
    if (localisation.latitude && localisation.longitude) {
      setMapPosition({
        lat: parseFloat(localisation.latitude),
        lng: parseFloat(localisation.longitude),
      });
    }
    setMapDialog(true);
  };

  const handleMapClick = (latlng) => {
    setLocalisation((prev) => ({
      ...prev,
      latitude: latlng.lat.toFixed(6),
      longitude: latlng.lng.toFixed(6),
    }));
    setMapPosition(latlng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation des photos : minimum 2, maximum 5
      if (photoFiles.length < 2) {
        setError("Vous devez ajouter au moins 2 photos");
        setLoading(false);
        return;
      }
      
      if (photoFiles.length > 5) {
        setError("Vous ne pouvez ajouter que 5 photos maximum");
        setLoading(false);
        return;
      }

      const data = new FormData();

      // Données de base
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });

      // Localisation
      data.append("localisation", JSON.stringify(localisation));

      // Caractéristiques
      data.append("caracteristiques", JSON.stringify(caracteristiques));

      // Photos (2 à 5)
      photoFiles.forEach((file) => data.append("images", file));

      // Documents
      documentFiles.forEach((file) => data.append("documents", file));

      // Vidéo URL (optionnel)
      if (videoUrl && videoUrl.trim()) {
        data.append("videoUrl", videoUrl.trim());
      }

      const res = await api.post("/client/patrimoine", data);

      setSuccess("Bien ajouté ! Redirection vers le paiement...");
      
      // Actualiser immédiatement le compteur
      fetchBiens();
      
      // Rediriger vers le paiement
      setTimeout(() => {
        if (res.data.paiementRequis && res.data.patrimoine?._id) {
          navigate(`/user/paiement-enregistrement/${res.data.patrimoine._id}`);
        } else {
          resetForm();
          setActiveTab(1);
          fetchBiens(); // Actualiser à nouveau après le changement d'onglet
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
      reference: "",
      titre: "",
      description: "",
      superficie: "",
      valeurEstimee: "",
      statut: "possede",
      titreFoncier: "",
      numeroTitre: "",
      dateAcquisition: "",
      modeAcquisition: "",
      notes: "",
    });
    setLocalisation({
      adresse: "",
      ville: "",
      quartier: "",
      commune: "",
      latitude: "",
      longitude: "",
    });
    setCaracteristiques({
      bornage: false,
      cloture: false,
      viabilise: false,
      accesBitume: false,
      electricite: false,
      eau: false,
    });
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setDocumentFiles([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce bien de votre patrimoine ?")) return;

    try {
      await api.delete(`/client/patrimoine/${id}`);
      setSuccess("Bien supprimé avec succès");
      fetchBiens();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  const typesLabels = {
    parcelle: { label: "Parcelle", icon: Square, color: "#2196f3" },
    terrain: { label: "Terrain", icon: Square, color: "#795548" },
    maison: { label: "Maison", icon: Home, color: "#4caf50" },
    villa: { label: "Villa", icon: Villa, color: "#9c27b0" },
    appartement: { label: "Appartement", icon: Apartment, color: "#f44336" },
    jardin: { label: "Jardin", icon: Park, color: "#8bc34a" },
    autre: { label: "Autre", icon: Home, color: "#607d8b" },
  };

  return (
    <ClientLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <AgencePageHeader
          icon={Home}
          title="Mon Patrimoine Foncier"
          subtitle="Gérez l'ensemble de vos biens immobiliers"
          action={
            <Button startIcon={<ArrowBack />}
              onClick={() => navigate("/user/dashboard")}
              variant="outlined"
              sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white" }}>
              Retour au dashboard
            </Button>
          }
        />

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

        {/* Affichage des informations de vérification pour les biens */}
        {biens.filter(bien => bien.documentsVerification && bien.documentsVerification.length > 0).length > 0 && (
          <Card sx={{ mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vérification en cours
              </Typography>
              <Typography variant="body2" paragraph>
                Certains de vos biens sont en cours de vérification. Les documents de vérification sont disponibles ci-dessous.
              </Typography>
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                {biens
                  .filter(bien => bien.documentsVerification && bien.documentsVerification.length > 0)
                  .map(bien => (
                    <Box key={bien._id}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {bien.titre} - {bien.type}
                      </Typography>
                      {bien.notesVerification && (
                        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                          {bien.notesVerification}
                        </Typography>
                      )}
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {bien.documentsVerification.map((doc, index) => (
                          <Button
                            key={index}
                            size="small"
                            variant="outlined"
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ bgcolor: 'white', color: 'primary.main' }}
                          >
                            {doc.description || `Document ${index + 1}`}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Affichage des contre-propositions */}
        {contrePropositions.length > 0 && (
          <Card sx={{ mb: 3, bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contre-proposition reçue
              </Typography>
              <Typography variant="body2" paragraph>
                L'administration a proposé un prix différent pour votre bien. Veuillez accepter ou refuser cette proposition.
              </Typography>
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                {contrePropositions.map(vente => (
                  <Box
                    key={vente._id}
                    sx={{
                      border: '2px solid #ff9800',
                      borderRadius: 2,
                      p: 2,
                      bgcolor: 'white'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {vente.patrimoineId?.titre} - {vente.patrimoineId?.type}
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Votre prix demandé
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatMoney(vente.prixVente)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Prix proposé par l'administration
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {formatMoney(vente.contrePropositionPrix)}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleAccepterContreProposition(vente._id)}
                        startIcon={<CheckCircle />}
                      >
                        Accepter
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRefuserContreProposition(vente._id)}
                        startIcon={<Cancel />}
                      >
                        Refuser
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Onglets */}
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
            <Tab icon={<Add />} label="Ajouter un bien" iconPosition="start" />
            <Tab 
              icon={<Home />} 
              label={`Mes biens (${biens.length})`} 
              iconPosition="start"
              onClick={() => {
                // Actualiser les données quand on clique sur l'onglet
                fetchBiens();
              }}
            />
          </Tabs>
        </Paper>

        {/* ONGLET 1 : Ajouter un bien */}
        {activeTab === 0 && (
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                {/* Type de bien */}
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  Type de bien
                </Typography>
                <Grid container spacing={2} mb={4}>
                  {Object.keys(typesLabels).map((type) => {
                    const TypeIcon = typesLabels[type].icon;
                    return (
                      <Grid item xs={6} md={3} key={type}>
                        <Card
                          variant="outlined"
                          sx={{
                            cursor: "pointer",
                            border: formData.type === type ? 2 : 1,
                            borderColor: formData.type === type ? typesLabels[type].color : "divider",
                            transition: "all 0.3s",
                            "&:hover": { boxShadow: 3 },
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
                                mb: 1,
                              }}
                            >
                              <TypeIcon />
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {typesLabels[type].label}
                            </Typography>
                            {formData.type === type && <CheckCircle color="success" sx={{ mt: 1 }} />}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Informations de base */}
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  Informations générales
                </Typography>
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Titre du bien"
                      name="titre"
                      value={formData.titre}
                      onChange={handleChange}
                      fullWidth
                      required
                      placeholder="Ex: Ma parcelle familiale"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Référence personnelle"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Ex: PARCELLE-ZONE4-2020"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
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

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Valeur estimée"
                      name="valeurEstimee"
                      type="number"
                      value={formData.valeurEstimee}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Statut"
                      name="statut"
                      value={formData.statut}
                      onChange={handleChange}
                      fullWidth
                    >
                      <MenuItem value="possede">Je possède</MenuItem>
                      <MenuItem value="en_vente">En vente</MenuItem>
                      <MenuItem value="loue">Loué</MenuItem>
                      <MenuItem value="autre">Autre</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Décrivez votre bien..."
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Localisation */}
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  <LocationOn sx={{ verticalAlign: "middle", mr: 1 }} />
                  Localisation
                </Typography>
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12}>
                    <TextField
                      label="Adresse"
                      name="adresse"
                      value={localisation.adresse}
                      onChange={handleLocalisationChange}
                      fullWidth
                      placeholder="Rue, numéro..."
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Ville"
                      name="ville"
                      value={localisation.ville}
                      onChange={handleLocalisationChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Quartier"
                      name="quartier"
                      value={localisation.quartier}
                      onChange={handleLocalisationChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Commune"
                      name="commune"
                      value={localisation.commune}
                      onChange={handleLocalisationChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      label="Latitude"
                      name="latitude"
                      type="number"
                      value={localisation.latitude}
                      onChange={handleLocalisationChange}
                      fullWidth
                      placeholder="12.3714"
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      label="Longitude"
                      name="longitude"
                      type="number"
                      value={localisation.longitude}
                      onChange={handleLocalisationChange}
                      fullWidth
                      placeholder="-1.5197"
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<MapIcon />}
                      onClick={openMapPicker}
                      sx={{ height: "100%" }}
                    >
                      Carte
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Informations juridiques */}
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  Informations juridiques
                </Typography>
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Titre foncier"
                      name="titreFoncier"
                      value={formData.titreFoncier}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Ex: TF N°..."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Numéro du titre"
                      name="numeroTitre"
                      value={formData.numeroTitre}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Date d'acquisition"
                      name="dateAcquisition"
                      type="date"
                      value={formData.dateAcquisition}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Mode d'acquisition"
                      name="modeAcquisition"
                      value={formData.modeAcquisition}
                      onChange={handleChange}
                      fullWidth
                    >
                      <MenuItem value="">Non spécifié</MenuItem>
                      <MenuItem value="achat">Achat</MenuItem>
                      <MenuItem value="heritage">Héritage</MenuItem>
                      <MenuItem value="donation">Donation</MenuItem>
                      <MenuItem value="autre">Autre</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Caractéristiques */}
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  Caractéristiques
                </Typography>
                <Grid container spacing={2} mb={4}>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="bornage"
                          checked={caracteristiques.bornage}
                          onChange={handleCaracteristiquesChange}
                        />
                      }
                      label="Bornage effectué"
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="cloture"
                          checked={caracteristiques.cloture}
                          onChange={handleCaracteristiquesChange}
                        />
                      }
                      label="Clôturé"
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="viabilise"
                          checked={caracteristiques.viabilise}
                          onChange={handleCaracteristiquesChange}
                        />
                      }
                      label="Viabilisé"
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="accesBitume"
                          checked={caracteristiques.accesBitume}
                          onChange={handleCaracteristiquesChange}
                        />
                      }
                      label="Accès bitumé"
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="electricite"
                          checked={caracteristiques.electricite}
                          onChange={handleCaracteristiquesChange}
                        />
                      }
                      label="Électricité"
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="eau"
                          checked={caracteristiques.eau}
                          onChange={handleCaracteristiquesChange}
                        />
                      }
                      label="Eau courante"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Photos et documents */}
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  Photos et documents
                </Typography>
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 3, borderStyle: "dashed" }}>
                      {/* Indicateur de validation */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Photos du bien
                        </Typography>
                        <Chip
                          label={`${photoFiles.length}/5 photos`}
                          color={photoFiles.length >= 2 && photoFiles.length <= 5 ? "success" : photoFiles.length < 2 ? "error" : "warning"}
                          size="small"
                        />
                      </Box>
                      
                      <Alert severity={photoFiles.length < 2 ? "error" : "info"} sx={{ mb: 2 }}>
                        {photoFiles.length < 2 
                          ? `Minimum 2 photos requises (${2 - photoFiles.length} restante(s))`
                          : `Vous pouvez ajouter jusqu'à ${5 - photoFiles.length} photo(s) supplémentaire(s)`
                        }
                      </Alert>

                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="photo-upload"
                        type="file"
                        multiple
                        onChange={handlePhotoUpload}
                        disabled={photoFiles.length >= 5}
                      />
                      <label htmlFor="photo-upload">
                        <Box 
                          sx={{ 
                            textAlign: "center", 
                            cursor: photoFiles.length >= 5 ? "not-allowed" : "pointer",
                            opacity: photoFiles.length >= 5 ? 0.5 : 1
                          }}
                        >
                          <CloudUpload fontSize="large" color="primary" />
                          <Typography>
                            {photoFiles.length >= 5 
                              ? "Maximum de photos atteint" 
                              : "Cliquez pour ajouter des photos (2 min, 5 max)"}
                          </Typography>
                        </Box>
                      </label>

                      {photoPreviews.length > 0 && (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                          {photoPreviews.map((preview, index) => (
                            <Grid item xs={6} md={3} key={index}>
                              <Box position="relative">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
                                />
                                <Chip
                                  label={index + 1}
                                  size="small"
                                  color="primary"
                                  sx={{ position: "absolute", top: 4, left: 4 }}
                                />
                                <IconButton
                                  size="small"
                                  color="error"
                                  sx={{ position: "absolute", top: 4, right: 4, bgcolor: "white" }}
                                  onClick={() => removePhoto(index)}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Paper>
                  </Grid>

                  {/* Vidéo URL */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Lien vidéo (Vimeo, YouTube) - Optionnel"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      helperText="Ajoutez un lien vers une vidéo de présentation du bien (facultatif)"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"></InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
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
                        Ajouter des documents (titre foncier, etc.)
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

                  <Grid item xs={12}>
                    <TextField
                      label="Notes privées"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Notes personnelles sur ce bien..."
                    />
                  </Grid>
                </Grid>

                {/* Bouton */}
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={resetForm}>
                    Réinitialiser
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading || !formData.type || !formData.titre}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? "Enregistrement..." : "Ajouter à mon patrimoine"}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ONGLET 2 : Liste des biens */}
        {activeTab === 1 && (
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Mes biens ({biens.length})
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setActiveTab(0)}>
                  Ajouter un bien
                </Button>
              </Box>

              {biens.length > 0 && (
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                  {[
                    { label: "Total biens", value: biens.length, icon: LandscapeIcon, color: "#2e7d32" },
                    { label: "Vérifiés", value: biens.filter((b) => b.statutVerification === "verifie").length, icon: CheckCircleIcon, color: "#1976d2" },
                    { label: "Enregistrés", value: biens.filter((b) => b.enregistrementStatut === "paye").length, icon: AssignmentTurnedInIcon, color: "#00897b" },
                    { label: "En vente", value: biens.filter((b) => b.soumiseVente).length, icon: SellIcon, color: "#9c27b0" },
                  ].map((kpi) => (
                    <Grid item xs={6} md={3} key={kpi.label}>
                      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
                              <Typography variant="h5" fontWeight="bold" sx={{ color: kpi.color }} noWrap>{kpi.value}</Typography>
                            </Box>
                            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${kpi.color}15`, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <kpi.icon />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : biens.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Home sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
                  <Typography color="text.secondary">
                    Aucun bien dans votre patrimoine
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setActiveTab(0)}
                    sx={{ mt: 2 }}
                  >
                    Ajouter votre premier bien
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {biens.map((bien) => {
                    const TypeIcon = typesLabels[bien.type]?.icon || Home;
                    const typeColor = typesLabels[bien.type]?.color || "#607d8b";

                    return (
                      <Grid item xs={12} md={6} lg={4} key={bien._id}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Chip
                                icon={<TypeIcon />}
                                label={typesLabels[bien.type]?.label || "Autre"}
                                sx={{ bgcolor: typeColor, color: "white" }}
                              />
                              <Chip label={bien.statut} size="small" color="primary" />
                            </Box>

                            {/* BADGES DE STATUT */}
                            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                              {bien.enregistrementStatut === "paye" && (
                                <Chip label="Enregistré" size="small" color="success" />
                              )}
                              {bien.enregistrementStatut === "en_attente" && (
                                <Chip label="Paiement requis" size="small" color="warning" />
                              )}
                              {bien.abonnementStatut === "actif" && (
                                <Chip label="Abonnement OK" size="small" color="info" />
                              )}
                              {bien.abonnementStatut === "expire" && (
                                <Chip label="Abonnement expiré" size="small" color="error" />
                              )}
                              {bien.statutVerification === "verifie" && (
                                <Chip label="Vérifié" size="small" sx={{ bgcolor: "#4caf50", color: "white" }} />
                              )}
                              {bien.statutVerification === "en_cours" && (
                                <Chip label="En vérification..." size="small" color="info" />
                              )}
                              {bien.soumiseVente && (
                                <Chip label="En vente" size="small" sx={{ bgcolor: "#9c27b0", color: "white" }} />
                              )}
                              {!bien.visible && (
                                <Chip label="Désactivé" size="small" color="default" />
                              )}
                            </Stack>

                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {bien.titre}
                            </Typography>

                            <Stack spacing={1.5}>
                              {bien.superficie && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Superficie
                                  </Typography>
                                  <Typography variant="body2">{bien.superficie} m²</Typography>
                                </Box>
                              )}

                              {bien.valeurEstimee && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Valeur estimée
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" color="primary">
                                    {new Intl.NumberFormat("fr-FR").format(bien.valeurEstimee)} FCFA
                                  </Typography>
                                </Box>
                              )}

                              {bien.localisation?.ville && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Localisation
                                  </Typography>
                                  <Typography variant="body2">
                                    {bien.localisation.ville}
                                    {bien.localisation.quartier && `, ${bien.localisation.quartier}`}
                                  </Typography>
                                </Box>
                              )}

                              {bien.numeroTitre && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    N° Titre
                                  </Typography>
                                  <Typography variant="body2">{bien.numeroTitre}</Typography>
                                </Box>
                              )}
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            {/* Boutons d'action */}
                            <Stack spacing={1}>
                              {bien.enregistrementStatut === "en_attente" && (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  fullWidth
                                  startIcon={<AttachMoney />}
                                  onClick={() => navigate(`/user/paiement-enregistrement/${bien._id}`)}
                                >
                                  Payer l'enregistrement
                                </Button>
                              )}

                              {bien.abonnementStatut === "expire" && bien.enregistrementStatut === "paye" && (
                                <Button
                                  variant="contained"
                                  color="warning"
                                  size="small"
                                  fullWidth
                                  startIcon={<CalendarMonth />}
                                  onClick={() => navigate(`/user/renouveler-abonnement/${bien._id}`)}
                                >
                                  Renouveler abonnement
                                </Button>
                              )}

                              {bien.enregistrementStatut === "paye" &&
                                bien.abonnementStatut === "actif" &&
                                !bien.soumiseVente && (
                                  <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    fullWidth
                                    startIcon={<Gavel />}
                                    onClick={() => navigate(`/user/soumettre-vente/${bien._id}`)}
                                  >
                                    Soumettre à la vente
                                  </Button>
                                )}

                              <Box display="flex" gap={1}>
                                <Tooltip title="Modifier">
                                  <IconButton size="small" color="primary">
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                  <IconButton size="small" color="error" onClick={() => handleDelete(bien._id)}>
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      {/* DIALOG CARTE POUR SÉLECTIONNER LA POSITION */}
      <Dialog open={mapDialog} onClose={() => setMapDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Sélectionnez la position sur la carte
            </Typography>
            <IconButton onClick={() => setMapDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: 500 }}>
          <MapContainer
            center={[mapPosition.lat, mapPosition.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationPicker onLocationSelect={handleMapClick} />
            {localisation.latitude && localisation.longitude && (
              <Marker position={[parseFloat(localisation.latitude), parseFloat(localisation.longitude)]}>
                <Popup>
                  <Typography variant="body2" fontWeight="bold">
                    Position sélectionnée
                  </Typography>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Typography variant="body2" color="text.secondary" flex={1}>
            Cliquez sur la carte pour définir la position
          </Typography>
          <Button onClick={() => setMapDialog(false)} variant="contained">
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </ClientLayout>
  );
};

export default MonPatrimoinePage;

