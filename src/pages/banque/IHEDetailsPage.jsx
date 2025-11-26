import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Stack,
  Divider,
  ImageList,
  ImageListItem,
  Paper,
  Avatar,
  Container,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Add,
  Delete,
  Photo,
  VideoLibrary,
  Description,
  CloudUpload,
  CheckCircle,
  Cancel,
  LocationOn,
  AttachMoney,
  CalendarToday,
  Person,
  Map as MapIcon,
  Share,
  Home,
  Nature,
  Business,
  Warehouse,
  Square,
  Apartment,
  Villa,
  ChevronLeft,
  ChevronRight,
  Close,
  Download,
  OpenInNew,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const IHEDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ihe, setIhe] = useState(null);
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState(0); // 0: photos, 1: videos, 2: documents
  const [newMedias, setNewMedias] = useState([]); // Médias à ajouter
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0); // Index de la photo principale affichée
  

  useEffect(() => {
    fetchIHE();
  }, [id]);

  // Réinitialiser l'index de la photo principale quand les photos changent
  useEffect(() => {
    const photosCount = medias.filter((m) => m.type === "photo").length;
    if (photosCount > 0 && selectedPhotoIndex >= photosCount) {
      setSelectedPhotoIndex(0);
    }
  }, [medias, selectedPhotoIndex]);

  // Calculer les médias filtrés
  const photos = medias.filter((m) => m.type === "photo");
  const videos = medias.filter((m) => m.type === "video");
  const documents = medias.filter((m) => m.type === "document");

  // Fonction pour ouvrir le lightbox avec une photo
  const handleOpenLightbox = (index) => {
    setSelectedPhotoIndex(index);
    setLightboxOpen(true);
  };

  // Fonction pour naviguer dans le lightbox
  const handlePreviousPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

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

  // Gestion des touches clavier pour le lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowLeft" && photos.length > 1) {
        setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === "ArrowRight" && photos.length > 1) {
        setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, photos.length]);

  const fetchIHE = async () => {
    try {
      setLoading(true);
      // Récupérer l'IHE
      const response = await api.get(`/banque/ihe/${id}`);
      console.log("📋 IHE récupérée:", response.data.ihe);
      setIhe(response.data.ihe);
      
      // Récupérer les médias séparément pour être sûr qu'ils sont chargés
      try {
        console.log("📸 Tentative de récupération des médias pour IHE:", id);
        const mediasResponse = await api.get(`/banque/ihe/${id}/media`);
        console.log("📸 Réponse médias:", mediasResponse.data);
        const mediasArray = mediasResponse.data.medias || mediasResponse.data || [];
        console.log("📸 Médias extraits:", mediasArray);
        setMedias(mediasArray);
      } catch (mediaErr) {
        console.error("❌ Erreur chargement médias:", mediaErr);
        console.error("❌ Détails erreur:", {
          message: mediaErr.message,
          response: mediaErr.response?.data,
          status: mediaErr.response?.status,
        });
        // Utiliser les médias de l'IHE si disponibles
        const mediasFromIHE = response.data.ihe?.medias || [];
        console.log("📸 Utilisation des médias de l'IHE:", mediasFromIHE);
        setMedias(mediasFromIHE);
      }
    } catch (err) {
      console.error("❌ Erreur chargement IHE:", err);
      console.error("❌ Détails erreur:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError("Erreur lors du chargement de l'IHE");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, mediaType) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mediaType", mediaType); // 'photo' ou 'document'
      formData.append("iheId", id); // Pour organiser dans Cloudinary

      console.log("📤 [IHEDetails] Upload média:", {
        type: mediaType,
        fileName: file.name,
        iheId: id,
      });

      // Utiliser la route spécifique pour les médias IHE
      const uploadResponse = await api.post("/banque/ihe/upload-media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ [IHEDetails] Upload réussi:", uploadResponse.data);
      
      const url = uploadResponse.data.url;
      if (!url) {
        console.error("❌ [IHEDetails] URL manquante dans la réponse:", uploadResponse.data);
        throw new Error("URL non retournée par le serveur");
      }
      
      return url;
    } catch (err) {
      console.error("❌ [IHEDetails] Erreur upload:", err);
      console.error("❌ [IHEDetails] Détails:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw new Error(err.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
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

  const handleRemoveNewMedia = (id) => {
    setNewMedias(newMedias.filter((m) => m.id !== id));
  };

  const handleNewMediaChange = (id, field, value) => {
    setNewMedias(
      newMedias.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const handleNewFileChange = async (id, file) => {
    if (!file) return;
    let preview = null;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }
    handleNewMediaChange(id, "file", file);
    handleNewMediaChange(id, "preview", preview);
  };

  const handleSaveAllMedias = async () => {
    if (newMedias.length === 0) {
      setMediaDialogOpen(false);
      return;
    }

    try {
      setUploading(true);
      setError("");
      
      for (const media of newMedias) {
        try {
          let url = media.url;

          // Si c'est un fichier, l'uploader avec le type approprié
          if (media.file && (media.type === "photo" || media.type === "document")) {
            url = await handleFileUpload(media.file, media.type);
          }

          // Si on a une URL (uploadée ou fournie), créer le média
          if (url && media.titre) {
            console.log("📝 [IHEDetails] Création du média dans la DB:", {
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
            
            console.log("✅ [IHEDetails] Média créé dans la DB:", createResponse.data);
          } else {
            console.warn("⚠️ [IHEDetails] Média ignoré (URL ou titre manquant):", {
              url: !!url,
              titre: !!media.titre,
              type: media.type,
            });
          }
        } catch (mediaErr) {
          console.error("Erreur upload média:", mediaErr);
          setError(`Erreur lors de l'ajout du média "${media.titre || 'sans titre'}": ${mediaErr.response?.data?.message || mediaErr.message}`);
        }
      }

      setSuccess(`${newMedias.length} média${newMedias.length > 1 ? "x" : ""} ajouté${newMedias.length > 1 ? "s" : ""} avec succès`);
      setNewMedias([]);
      setMediaDialogOpen(false);
      fetchIHE();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout des médias");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm("Supprimer ce média ?")) return;

    try {
      await api.delete(`/banque/ihe/${id}/media/${mediaId}`);
      setSuccess("Média supprimé");
      fetchIHE();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const STATUT_COLORS = {
    en_attente_validation: "warning",
    a_corriger: "error",
    valide: "success",
    rejete: "error",
    en_vente: "info",
    vendu: "success",
  };

  const STATUT_LABELS = {
    en_attente_validation: "En attente de validation",
    a_corriger: "À corriger",
    valide: "Validée",
    rejete: "Rejetée",
    en_vente: "En vente",
    vendu: "Vendue",
  };

  const TYPE_ICONS = {
    terrain: Square,
    jardin: Nature,
    maison: Home,
    appartement: Apartment,
    villa: Villa,
    bureau: Business,
    entrepot: Warehouse,
    autre: Home,
  };

  const TYPE_COLORS = {
    terrain: "#795548",
    jardin: "#4caf50",
    maison: "#2196f3",
    appartement: "#f44336",
    villa: "#9c27b0",
    bureau: "#00bcd4",
    entrepot: "#ff9800",
    autre: "#607d8b",
  };

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ width: "100%", mt: 4 }}>
          <LinearProgress />
          <Typography align="center" sx={{ mt: 2 }}>
            Chargement...
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  if (!ihe) {
    return (
      <PageLayout>
        <Alert severity="error">IHE non trouvée</Alert>
      </PageLayout>
    );
  }

  const TypeIcon = TYPE_ICONS[ihe.type] || Home;
  const typeColor = TYPE_COLORS[ihe.type] || "#607d8b";

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* En-tête moderne */}
        <Box mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/banque/ihe")}
            sx={{ mb: 2 }}
          >
            Retour à la liste
          </Button>
          
          <Card
            elevation={4}
            sx={{
              background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%)`,
              color: "white",
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "200px",
                height: "200px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
                transform: "translate(50%, -50%)",
              },
            }}
          >
            <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        width: 64,
                        height: 64,
                        border: "3px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      <TypeIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {ihe.titre}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Référence: {ihe.reference}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign={{ xs: "left", md: "right" }}>
                    <Chip
                      label={STATUT_LABELS[ihe.statut] || ihe.statut}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: "bold",
                        mb: 2,
                        fontSize: "0.875rem",
                        height: 32,
                      }}
                    />
                    <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                      <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/banque/ihe/${id}/modifier`)}
                        sx={{ bgcolor: "rgba(255,255,255,0.9)", color: typeColor, "&:hover": { bgcolor: "white" } }}
                      >
                        Modifier
                      </Button>
                      {ihe.statut === "valide" && (
                        <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<Share />}
                          onClick={() => navigate(`/banque/ihe/${id}/partager`)}
                          sx={{ borderColor: "white", color: "white", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                        >
                          Partager
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Colonne principale */}
          <Grid item xs={12} md={8}>
            {/* Informations principales */}
            <Card sx={{ mb: 3 }} elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Home sx={{ color: typeColor }} />
                  <Typography variant="h6" fontWeight="bold">
                    Informations générales
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                        borderLeft: `4px solid ${typeColor}`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        Type
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" textTransform="capitalize" color={typeColor}>
                        {ihe.type}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                        borderLeft: "4px solid #2196f3",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        Valeur comptable
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatMoney(ihe.valeurComptable)}
                      </Typography>
                    </Box>
                  </Grid>
                  {ihe.valeurAcquisition && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Valeur d'acquisition
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatMoney(ihe.valeurAcquisition)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {ihe.dateAcquisition && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Date d'acquisition
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(ihe.dateAcquisition)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {ihe.superficie && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Superficie
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {ihe.superficie} {ihe.uniteSuperficie || "m²"}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {ihe.description && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={1}>
                          Description
                        </Typography>
                        <Typography variant="body1">{ihe.description}</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Localisation */}
            <Card sx={{ mb: 3 }} elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LocationOn sx={{ color: "#f44336" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Localisation
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {ihe.localisation?.adresse && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="flex-start" gap={1}>
                        <LocationOn sx={{ color: "text.secondary", mt: 0.5 }} fontSize="small" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Adresse complète
                          </Typography>
                          <Typography variant="body1">{ihe.localisation.adresse}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        Ville
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {ihe.localisation?.ville || "N/A"}
                      </Typography>
                    </Box>
                  </Grid>
                  {ihe.localisation?.quartier && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Quartier
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {ihe.localisation.quartier}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {ihe.localisation?.latitude && ihe.localisation?.longitude && (
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<MapIcon />}
                        onClick={() => navigate(`/banque/ihe/carte`)}
                        sx={{ mt: 1 }}
                      >
                        Voir sur la carte
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Caractéristiques */}
            {ihe.caracteristiques && Object.keys(ihe.caracteristiques).length > 0 && (
              <Card sx={{ mb: 3 }} elevation={2}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Home sx={{ color: "#9c27b0" }} />
                    <Typography variant="h6" fontWeight="bold">
                      Caractéristiques
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    {ihe.caracteristiques.nbChambres && (
                      <Grid item xs={6} sm={4}>
                        <Box textAlign="center" sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {ihe.caracteristiques.nbChambres}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Chambre{ihe.caracteristiques.nbChambres > 1 ? "s" : ""}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {ihe.caracteristiques.nbSallesBain && (
                      <Grid item xs={6} sm={4}>
                        <Box textAlign="center" sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {ihe.caracteristiques.nbSallesBain}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Salle{ihe.caracteristiques.nbSallesBain > 1 ? "s" : ""} de bain
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {ihe.caracteristiques.nbSalons && (
                      <Grid item xs={6} sm={4}>
                        <Box textAlign="center" sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {ihe.caracteristiques.nbSalons}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Salon{ihe.caracteristiques.nbSalons > 1 ? "s" : ""}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {/* Équipements */}
                    {[
                      { key: "garage", label: "Garage" },
                      { key: "piscine", label: "Piscine" },
                      { key: "jardin", label: "Jardin" },
                      { key: "climatisation", label: "Climatisation" },
                      { key: "electricite", label: "Électricité" },
                      { key: "eau", label: "Eau" },
                      { key: "securite", label: "Sécurité" },
                    ].map(
                      (equip) =>
                        ihe.caracteristiques[equip.key] && (
                          <Grid item xs={6} sm={4} key={equip.key}>
                            <Chip label={equip.label} color="success" size="small" />
                          </Grid>
                        )
                    )}
                    {/* Caractéristiques jardin */}
                    {ihe.type === "jardin" && (
                      <>
                        {ihe.caracteristiques.irrigation && (
                          <Grid item xs={6} sm={4}>
                            <Chip label="Irrigation" color="info" size="small" />
                          </Grid>
                        )}
                        {ihe.caracteristiques.cloture && (
                          <Grid item xs={6} sm={4}>
                            <Chip label="Clôture" color="info" size="small" />
                          </Grid>
                        )}
                        {ihe.caracteristiques.arbore && (
                          <Grid item xs={6} sm={4}>
                            <Chip label="Arboré" color="success" size="small" />
                          </Grid>
                        )}
                        {ihe.caracteristiques.potager && (
                          <Grid item xs={6} sm={4}>
                            <Chip label="Potager" color="success" size="small" />
                          </Grid>
                        )}
                        {ihe.caracteristiques.typesArbres && ihe.caracteristiques.typesArbres.length > 0 && (
                          <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                🌳 Types d'arbres présents
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                {ihe.caracteristiques.typesArbres.map((arbre, idx) => (
                                  <Chip
                                    key={idx}
                                    label={`${arbre.type} (${arbre.nombre})`}
                                    color="success"
                                    size="small"
                                  />
                                ))}
                              </Stack>
                            </Box>
                          </Grid>
                        )}
                        {ihe.caracteristiques.elementsJardin && (
                          <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Éléments présents
                              </Typography>
                              <Typography variant="body2">{ihe.caracteristiques.elementsJardin}</Typography>
                            </Box>
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Médias */}
            <Card elevation={2} sx={{ borderLeft: "4px solid #2196f3" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Photo sx={{ color: "#2196f3", fontSize: 28 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Médias et Documents
                    </Typography>
                    {medias.length > 0 && (
                      <Chip 
                        label={`${medias.length} média${medias.length > 1 ? "x" : ""}`} 
                        size="small" 
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setMediaDialogOpen(true);
                      setNewMedias([]);
                      setMediaTab(0);
                    }}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Ajouter des médias
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />

                {/* Photos - Affichage comme dans le drawer des biens immobiliers */}
                {photos.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      📸 Photos ({photos.length})
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                      {/* Photo principale */}
                      <Box
                        component="img"
                        src={photos[selectedPhotoIndex]?.url || photos[0]?.url}
                        alt={photos[selectedPhotoIndex]?.titre || photos[0]?.titre || "Photo principale"}
                        onClick={() => handleOpenLightbox(selectedPhotoIndex >= 0 ? selectedPhotoIndex : 0)}
                        sx={{
                          width: "100%",
                          height: 400,
                          objectFit: "cover",
                          borderRadius: 2,
                          mb: 2,
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: 4,
                          },
                        }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/800x400?text=Image";
                        }}
                      />
                      
                      {/* Galerie des autres photos */}
                      {photos.length > 1 && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" mb={1}>
                            Autres photos ({photos.length - 1})
                          </Typography>
                          <Grid container spacing={1}>
                            {photos.map((photo, index) => (
                              <Grid item xs={3} key={photo._id}>
                                <Box
                                  sx={{
                                    position: "relative",
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={photo.url}
                                    alt={photo.titre}
                                    onClick={() => {
                                      setSelectedPhotoIndex(index);
                                    }}
                                    sx={{
                                      width: "100%",
                                      height: 80,
                                      objectFit: "cover",
                                      borderRadius: 1,
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                      border: selectedPhotoIndex === index ? "3px solid" : "none",
                                      borderColor: selectedPhotoIndex === index ? "primary.main" : "transparent",
                                      "&:hover": { 
                                        transform: "scale(1.05)",
                                        boxShadow: 2
                                      },
                                    }}
                                    onError={(e) => {
                                      e.target.src = "https://via.placeholder.com/150?text=Image";
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 4,
                                      right: 4,
                                      bgcolor: "rgba(0,0,0,0.7)",
                                      borderRadius: "50%",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMedia(photo._id);
                                    }}
                                  >
                                    <IconButton size="small" sx={{ color: "white", p: 0.5 }}>
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                      
                      {/* Si une seule photo */}
                      {photos.length === 1 && (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Aucune photo supplémentaire disponible
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Vidéos */}
                {videos.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <VideoLibrary color="error" /> Vidéos ({videos.length})
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      {videos.map((video) => (
                        <Grid item xs={12} md={6} key={video._id}>
                          <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                            <Box sx={{ position: "relative", width: "100%", paddingTop: "56.25%" /* 16:9 */ }}>
                              <iframe
                                src={getVideoEmbedUrl(video.url)}
                                title={video.titre}
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
                                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                                    {video.titre}
                                  </Typography>
                                  {video.description && (
                                    <Typography variant="body2" color="text.secondary">
                                      {video.description}
                                    </Typography>
                                  )}
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    href={video.url}
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
                                  onClick={() => handleDeleteMedia(video._id)}
                                  sx={{ ml: 1 }}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Documents */}
                {documents.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Description color="warning" /> Documents ({documents.length})
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {documents.map((doc) => {
                        const fileName = getFileNameFromUrl(doc.url);
                        return (
                          <Grid item xs={12} sm={6} md={4} key={doc._id}>
                            <Card elevation={2} sx={{ borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <Avatar sx={{ bgcolor: "warning.main", width: 40, height: 40 }}>
                                    <Description />
                                  </Avatar>
                                  <Box flex={1}>
                                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                                      {doc.titre}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                      📄 {fileName}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteMedia(doc._id)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                                {doc.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {doc.description}
                                  </Typography>
                                )}
                                <Button
                                  variant="contained"
                                  fullWidth
                                  startIcon={<Download />}
                                  href={doc.url}
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
                    </Grid>
                  </Box>
                )}

                {medias.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.light",
                        width: 64,
                        height: 64,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <Photo sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucun média ajouté
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Ajoutez des photos, vidéos ou documents pour illustrer cette IHE
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => {
                        setMediaDialogOpen(true);
                        setNewMedias([]);
                        setMediaTab(0);
                      }}
                    >
                      Ajouter des médias
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Workflow */}
            <Card sx={{ mb: 3 }} elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CheckCircle sx={{ color: "#4caf50" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Workflow
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      borderLeft: "4px solid #2196f3",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                      Saisi par
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="medium">
                        {ihe.saisiPar?.fullName || ihe.saisiPar?.phone || "N/A"}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {formatDate(ihe.createdAt)}
                    </Typography>
                  </Box>
                  {ihe.validePar && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "success.50",
                        borderRadius: 2,
                        borderLeft: "4px solid #4caf50",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                        Validé par
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <CheckCircle fontSize="small" color="success" />
                        <Typography variant="body2" fontWeight="medium">
                          {ihe.validePar.fullName || ihe.validePar.phone}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        Le {formatDate(ihe.valideLe)}
                      </Typography>
                    </Box>
                  )}
                  {(ihe.rejetePar || ihe.statut === "a_corriger") && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: ihe.statut === "a_corriger" ? "warning.50" : "error.50",
                        borderRadius: 2,
                        borderLeft: `4px solid ${ihe.statut === "a_corriger" ? "#ff9800" : "#f44336"}`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                        {ihe.statut === "a_corriger" ? "À corriger - Rejeté par" : "Rejeté par"}
                      </Typography>
                      {ihe.rejetePar && (
                        <>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Cancel fontSize="small" color={ihe.statut === "a_corriger" ? "warning" : "error"} />
                            <Typography variant="body2" fontWeight="medium">
                              {ihe.rejetePar.fullName || ihe.rejetePar.phone}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            Le {formatDate(ihe.rejeteLe)}
                          </Typography>
                        </>
                      )}
                      {ihe.motifRejet && (
                        <Alert severity={ihe.statut === "a_corriger" ? "warning" : "error"} sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Motif de rejet :
                          </Typography>
                          <Typography variant="body2">{ihe.motifRejet}</Typography>
                          {ihe.statut === "a_corriger" && (
                            <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                              Veuillez corriger cette IHE et la resoumettre pour validation.
                            </Typography>
                          )}
                        </Alert>
                      )}
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Notes */}
            {ihe.notes && (
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Notes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    {ihe.notes}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Dialog Ajout Médias (avec onglets) */}
        <Dialog 
          open={mediaDialogOpen} 
          onClose={() => {
            setMediaDialogOpen(false);
            setNewMedias([]);
            setMediaTab(0);
          }} 
          fullWidth 
          maxWidth="md"
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Ajouter des médias
              </Typography>
              <Chip
                label={`${newMedias.length} nouveau${newMedias.length > 1 ? "x" : ""}`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </DialogTitle>
          <DialogContent>
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
                    <Badge badgeContent={newMedias.filter((m) => m.type === "photo").length} color="primary">
                      <Photo />
                    </Badge>
                  }
                  iconPosition="start"
                  label={`Photos${newMedias.filter((m) => m.type === "photo").length > 0 ? ` (${newMedias.filter((m) => m.type === "photo").length})` : ""}`}
                />
                <Tab
                  icon={
                    <Badge badgeContent={newMedias.filter((m) => m.type === "video").length} color="primary">
                      <VideoLibrary />
                    </Badge>
                  }
                  iconPosition="start"
                  label={`Vidéos${newMedias.filter((m) => m.type === "video").length > 0 ? ` (${newMedias.filter((m) => m.type === "video").length})` : ""}`}
                />
                <Tab
                  icon={
                    <Badge badgeContent={newMedias.filter((m) => m.type === "document").length} color="primary">
                      <Description />
                    </Badge>
                  }
                  iconPosition="start"
                  label={`Documents${newMedias.filter((m) => m.type === "document").length > 0 ? ` (${newMedias.filter((m) => m.type === "document").length})` : ""}`}
                />
              </Tabs>
            </Paper>

            <Box sx={{ minHeight: 400, maxHeight: 500, overflowY: "auto" }}>
              {/* Onglet Photos */}
              {mediaTab === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Photos à ajouter ({newMedias.filter((m) => m.type === "photo").length})
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

                  {newMedias.filter((m) => m.type === "photo").length === 0 ? (
                    <Alert severity="info">
                      Aucune photo ajoutée. Cliquez sur "Ajouter une photo" pour commencer.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {newMedias
                        .filter((m) => m.type === "photo")
                        .map((media, index) => (
                          <Grid item xs={12} md={6} key={media.id}>
                            <Card elevation={2}>
                              <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Photo #{index + 1}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveNewMedia(media.id)}
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
                                        height: 150,
                                        objectFit: "cover",
                                        display: "block",
                                      }}
                                    />
                                  </Box>
                                )}

                                <Stack spacing={2}>
                                  <TextField
                                    fullWidth
                                    label="Titre *"
                                    value={media.titre}
                                    onChange={(e) => handleNewMediaChange(media.id, "titre", e.target.value)}
                                    size="small"
                                    required
                                  />
                                  <TextField
                                    fullWidth
                                    label="Description"
                                    value={media.description}
                                    onChange={(e) => handleNewMediaChange(media.id, "description", e.target.value)}
                                    size="small"
                                    multiline
                                    rows={2}
                                  />
                                  <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    fullWidth
                                    size="small"
                                  >
                                    {media.file ? media.file.name : "Télécharger une photo"}
                                    <input
                                      type="file"
                                      hidden
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) handleNewFileChange(media.id, file);
                                      }}
                                    />
                                  </Button>
                                  <TextField
                                    fullWidth
                                    label="URL (optionnel)"
                                    value={media.url}
                                    onChange={(e) => handleNewMediaChange(media.id, "url", e.target.value)}
                                    size="small"
                                    helperText="Ou fournissez une URL directe de l'image"
                                  />
                                </Stack>
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
                      Vidéos à ajouter ({newMedias.filter((m) => m.type === "video").length})
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

                  {newMedias.filter((m) => m.type === "video").length === 0 ? (
                    <Alert severity="info">
                      Aucune vidéo ajoutée. Cliquez sur "Ajouter une vidéo" pour commencer.
                    </Alert>
                  ) : (
                    <Stack spacing={2}>
                      {newMedias
                        .filter((m) => m.type === "video")
                        .map((media, index) => (
                          <Card key={media.id} elevation={2}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Vidéo #{index + 1}
                                </Typography>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveNewMedia(media.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                              <Stack spacing={2}>
                                <TextField
                                  fullWidth
                                  label="Titre *"
                                  value={media.titre}
                                  onChange={(e) => handleNewMediaChange(media.id, "titre", e.target.value)}
                                  size="small"
                                  required
                                />
                                <TextField
                                  fullWidth
                                  label="Description"
                                  value={media.description}
                                  onChange={(e) => handleNewMediaChange(media.id, "description", e.target.value)}
                                  size="small"
                                  multiline
                                  rows={2}
                                />
                                <TextField
                                  fullWidth
                                  label="URL de la vidéo *"
                                  value={media.url}
                                  onChange={(e) => handleNewMediaChange(media.id, "url", e.target.value)}
                                  size="small"
                                  placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                                  helperText="Collez le lien de la vidéo (YouTube, Vimeo, etc.)"
                                  required
                                />
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                    </Stack>
                  )}
                </Box>
              )}

              {/* Onglet Documents */}
              {mediaTab === 2 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Documents à ajouter ({newMedias.filter((m) => m.type === "document").length})
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

                  {newMedias.filter((m) => m.type === "document").length === 0 ? (
                    <Alert severity="info">
                      Aucun document ajouté. Cliquez sur "Ajouter un document" pour commencer.
                    </Alert>
                  ) : (
                    <Stack spacing={2}>
                      {newMedias
                        .filter((m) => m.type === "document")
                        .map((media, index) => (
                          <Card key={media.id} elevation={2}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Document #{index + 1}
                                </Typography>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveNewMedia(media.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                              <Stack spacing={2}>
                                <TextField
                                  fullWidth
                                  label="Titre *"
                                  value={media.titre}
                                  onChange={(e) => handleNewMediaChange(media.id, "titre", e.target.value)}
                                  size="small"
                                  required
                                />
                                <TextField
                                  fullWidth
                                  label="Description"
                                  value={media.description}
                                  onChange={(e) => handleNewMediaChange(media.id, "description", e.target.value)}
                                  size="small"
                                  multiline
                                  rows={2}
                                />
                                <Button
                                  variant="outlined"
                                  component="label"
                                  startIcon={<CloudUpload />}
                                  fullWidth
                                  size="small"
                                >
                                  {media.file ? media.file.name : "Télécharger un document"}
                                  <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) handleNewFileChange(media.id, file);
                                    }}
                                  />
                                </Button>
                                {media.file && (
                                  <Chip
                                    label={`${(media.file.size / 1024 / 1024).toFixed(2)} MB`}
                                    size="small"
                                  />
                                )}
                                <TextField
                                  fullWidth
                                  label="URL (optionnel)"
                                  value={media.url}
                                  onChange={(e) => handleNewMediaChange(media.id, "url", e.target.value)}
                                  size="small"
                                  helperText="Ou fournissez une URL directe du document"
                                />
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                    </Stack>
                  )}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => {
                setMediaDialogOpen(false);
                setNewMedias([]);
                setMediaTab(0);
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveAllMedias} 
              variant="contained" 
              disabled={uploading || newMedias.length === 0 || newMedias.some(m => !m.titre || (m.type !== "video" && !m.file && !m.url) || (m.type === "video" && !m.url))}
            >
              {uploading ? "Enregistrement..." : `Enregistrer ${newMedias.length} média${newMedias.length > 1 ? "x" : ""}`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lightbox pour les photos */}
        <Dialog
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "rgba(0,0,0,0.9)",
              color: "white",
            },
          }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {photos[selectedPhotoIndex]?.titre || "Photo"}
            </Typography>
            <IconButton onClick={() => setLightboxOpen(false)} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ position: "relative", p: 0 }}>
            {photos[selectedPhotoIndex] && (
              <>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "black",
                  }}
                >
                  <img
                    src={photos[selectedPhotoIndex].url}
                    alt={photos[selectedPhotoIndex].titre}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "80vh",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/800x600?text=Image+non+disponible";
                    }}
                  />
                  {/* Bouton précédent */}
                  {photos.length > 1 && (
                    <IconButton
                      onClick={handlePreviousPhoto}
                      sx={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                      }}
                    >
                      <ChevronLeft fontSize="large" />
                    </IconButton>
                  )}
                  {/* Bouton suivant */}
                  {photos.length > 1 && (
                    <IconButton
                      onClick={handleNextPhoto}
                      sx={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                      }}
                    >
                      <ChevronRight fontSize="large" />
                    </IconButton>
                  )}
                </Box>
                {photos[selectedPhotoIndex].description && (
                  <Box sx={{ p: 2, bgcolor: "rgba(0,0,0,0.7)" }}>
                    <Typography variant="body2" color="white">
                      {photos[selectedPhotoIndex].description}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          {photos.length > 1 && (
            <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
              <Typography variant="caption" color="white">
                {selectedPhotoIndex + 1} / {photos.length}
              </Typography>
            </DialogActions>
          )}
        </Dialog>
      </Container>
    </PageLayout>
  );
};

export default IHEDetailsPage;
