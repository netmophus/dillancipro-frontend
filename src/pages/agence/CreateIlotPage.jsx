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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
  CircularProgress,
  Avatar,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  MenuItem,
  FormControlLabel,
  Switch,
  Badge,
} from "@mui/material";
import {
  GridView,
  Add,
  Edit,
  Delete,
  Apartment,
  Domain,
  Description,
  Search,
  CheckCircle,
  Person,
  Square,
  Assignment,
  Visibility,
  CloudUpload,
  Image as ImageIcon,
  VideoLibrary,
  Close,
  PhotoCamera,
  Assessment,
  FormatListBulleted,
  Landscape,
} from "@mui/icons-material";
import AgenceLayout from "../../components/agence/AgenceLayout";
import AgencePageHeader from "../../components/agence/AgencePageHeader";
import api from "../../services/api";

const CreateIlotPage = () => {
  const [formData, setFormData] = useState({
    numeroIlot: "",
    zone: "",
    quartier: "",
    lotissement: "",
    surfaceTotale: "",
  });

  // États pour les médias (photos/vidéos) partagés par toutes les parcelles de l'îlot
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([]);

  const [ilots, setIlots] = useState([]);
  const [zones, setZones] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [lotissements, setLotissements] = useState([]);
  const [filteredQuartiers, setFilteredQuartiers] = useState([]);
  const [commerciaux, setCommerciaux] = useState([]);
  const [filteredIlots, setFilteredIlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);

  // Modal parcelles
  const [openParcelles, setOpenParcelles] = useState(false);
  const [parcellesIlot, setParcellesIlot] = useState([]);
  const [ilotEnCours, setIlotEnCours] = useState(null);

  // Modal affectation
  const [openAffecter, setOpenAffecter] = useState(false);
  const [selectedIlotId, setSelectedIlotId] = useState(null);
  const [selectedCommercial, setSelectedCommercial] = useState("");
  const [propagerParcelles, setPropagerParcelles] = useState(false);
  const [savingAffect, setSavingAffect] = useState(false);

  // Modal édition
  const [editDialog, setEditDialog] = useState(false);
  const [editingIlot, setEditingIlot] = useState(null);
  const [editFormData, setEditFormData] = useState({
    numeroIlot: "",
    zone: "",
    quartier: "",
    lotissement: "",
    surfaceTotale: "",
  });
  const [filteredEditQuartiers, setFilteredEditQuartiers] = useState([]);

  useEffect(() => {
    fetchIlots();
    fetchZones();
    fetchQuartiers();
    fetchLotissements();
  }, []);

  // Filtrer les quartiers selon la zone sélectionnée
  useEffect(() => {
    if (formData.zone && zones.length > 0 && quartiers.length > 0) {
      const selectedZone = zones.find((z) => z._id === formData.zone);
      if (selectedZone && selectedZone.quartier && selectedZone.quartier.ville) {
        const villeId = selectedZone.quartier.ville._id || selectedZone.quartier.ville;
        const filtered = quartiers.filter((q) => {
          const quartierVilleId = q.ville?._id || q.ville;
          return quartierVilleId && quartierVilleId.toString() === villeId.toString();
        });
        setFilteredQuartiers(filtered);
        // Réinitialiser le quartier si celui sélectionné n'est plus dans la liste filtrée
        if (formData.quartier && !filtered.find((q) => q._id === formData.quartier)) {
          setFormData((prev) => ({ ...prev, quartier: "" }));
        }
      } else {
        setFilteredQuartiers(quartiers);
      }
    } else {
      setFilteredQuartiers(quartiers);
    }
  }, [formData.zone, zones, quartiers]);

  useEffect(() => {
    const filtered = ilots.filter(
      (ilot) =>
        ilot.numeroIlot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ilot.zone?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ilot.quartier?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIlots(filtered);
    setPage(0);
  }, [searchTerm, ilots]);

  const fetchIlots = async () => {
    setLoading(true);
    try {
      const res = await api.get("/agence/ilots");
      setIlots(res.data);
      setFilteredIlots(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const res = await api.get("/agence/zones");
      setZones(res.data);
    } catch (err) {
      console.error("Erreur chargement zones :", err);
    }
  };

  const fetchQuartiers = async () => {
    try {
      const res = await api.get("/agence/quartiers");
      setQuartiers(res.data);
    } catch (err) {
      console.error("Erreur chargement quartiers :", err);
    }
  };

  const fetchLotissements = async () => {
    try {
      const res = await api.get("/agence/lotissements");
      setLotissements(res.data || []);
    } catch (err) {
      console.error("Erreur chargement lotissements :", err);
    }
  };

  // Lotissements de la zone choisie (sélecteur en cascade zone -> lotissement)
  const lotissementsDeLaZone = lotissements.filter(
    (l) => (l.zone?._id || l.zone) === formData.zone
  );

  // Lotissements de la zone de l'îlot en cours de modification
  const lotissementsDeLaZoneEdit = lotissements.filter(
    (l) => (l.zone?._id || l.zone) === editFormData.zone
  );

  const fetchCommerciaux = async () => {
    try {
      const res = await api.get("/agence/commerciaux");
      setCommerciaux(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur chargement commerciaux");
    }
  };

  // Gestion des images avec prévisualisation
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
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

  const handleVideoAdd = () => {
    const videoUrl = prompt("Entrez l'URL de la vidéo (YouTube ou Vimeo):");
    if (videoUrl && videoUrl.trim()) {
      setVideos((prev) => [...prev, videoUrl.trim()]);
    }
  };

  const removeVideo = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("numeroIlot", formData.numeroIlot);
      formDataToSend.append("zone", formData.zone);
      formDataToSend.append("quartier", formData.quartier);
      if (formData.lotissement) {
        formDataToSend.append("lotissement", formData.lotissement);
      }
      if (formData.surfaceTotale) {
        formDataToSend.append("surfaceTotale", formData.surfaceTotale);
      }
      
      // Ajouter les images
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });
      
      // Ajouter les vidéos
      if (videos.length > 0) {
        formDataToSend.append("videos", JSON.stringify(videos));
      }

      await api.post("/agence/ilots", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setSuccess("Îlot créé avec succès !");
      setFormData({ numeroIlot: "", zone: "", quartier: "", lotissement: "", surfaceTotale: "" });
      setImageFiles([]);
      setImagePreviews([]);
      setVideos([]);
      fetchIlots();
    } catch (err) {
      setError(err.response?.data?.message || " Erreur lors de la création");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Si on change la zone, réinitialiser le quartier et le lotissement
      if (name === "zone") {
        return { ...prev, zone: value, quartier: "", lotissement: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => {
      // Si on change la zone, réinitialiser le quartier et le lotissement
      if (name === "zone") {
        return { ...prev, zone: value, quartier: "", lotissement: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  // Filtrer les quartiers pour le dialog d'édition
  useEffect(() => {
    if (editDialog && editFormData.zone && zones.length > 0 && quartiers.length > 0) {
      const selectedZone = zones.find((z) => z._id === editFormData.zone);
      if (selectedZone && selectedZone.quartier && selectedZone.quartier.ville) {
        const villeId = selectedZone.quartier.ville._id || selectedZone.quartier.ville;
        const filtered = quartiers.filter((q) => {
          const quartierVilleId = q.ville?._id || q.ville;
          return quartierVilleId && quartierVilleId.toString() === villeId.toString();
        });
        setFilteredEditQuartiers(filtered);
        // Réinitialiser le quartier si celui sélectionné n'est plus dans la liste filtrée
        if (editFormData.quartier && !filtered.find((q) => q._id === editFormData.quartier)) {
          setEditFormData((prev) => ({ ...prev, quartier: "" }));
        }
      } else {
        setFilteredEditQuartiers(quartiers);
      }
    } else if (editDialog) {
      setFilteredEditQuartiers(quartiers);
    }
  }, [editFormData.zone, zones, quartiers, editDialog]);

  const showParcelles = async (ilotId) => {
    try {
      const res = await api.get(`/agence/ilots/${ilotId}/parcelles`);
      setParcellesIlot(res.data || []);
      setIlotEnCours(ilots.find((i) => i._id === ilotId) || null);
      setOpenParcelles(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur chargement parcelles");
    }
  };

  const openAffecterModal = async (ilotId) => {
    setSelectedIlotId(ilotId);
    setSelectedCommercial("");
    setPropagerParcelles(false);
    await fetchCommerciaux();
    setOpenAffecter(true);
  };

  const submitAffectation = async () => {
    if (!selectedIlotId || !selectedCommercial) {
      setError("Sélectionnez un commercial.");
      return;
    }
    setSavingAffect(true);
    try {
      await api.put(`/agence/commerciaux/${selectedCommercial}/affecter-ilots`, {
        ilots: [selectedIlotId],
        propagerParcelles,
      });
      setSuccess("Îlot affecté avec succès !");
      setOpenAffecter(false);
      fetchIlots();
    } catch (err) {
      setError(err.response?.data?.message || " Erreur lors de l'affectation");
    } finally {
      setSavingAffect(false);
    }
  };

  const openEditDialog = (ilot) => {
    setEditingIlot(ilot);
    setEditFormData({
      numeroIlot: ilot.numeroIlot || "",
      zone: ilot.zone?._id || "",
      quartier: ilot.quartier?._id || "",
      lotissement: ilot.lotissement?._id || "",
      surfaceTotale: ilot.surfaceTotale || "",
    });
    setFilteredEditQuartiers(quartiers);
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/agence/ilots/${editingIlot._id}`, editFormData);
      setSuccess("Îlot modifié avec succès !");
      setEditDialog(false);
      fetchIlots();
    } catch (err) {
      setError(err.response?.data?.message || " Erreur lors de la modification");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet îlot ?")) return;

    try {
      await api.delete(`/agence/ilots/${id}`);
      setSuccess("Îlot supprimé avec succès");
      fetchIlots();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  return (
    <AgenceLayout>
      <Container maxWidth="xl" sx={{ mb: 4 }}>
        {/* En-tête */}
        <AgencePageHeader
          icon={GridView}
          title="Gestion des Îlots"
          subtitle="Organisez vos îlots par zone et quartier"
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

        <Grid container spacing={3}>
          {/* FORMULAIRE DE CRÉATION */}
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ position: "sticky", top: 20, borderRadius: 3, border: "1px solid #e3e8ef" }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Add color="warning" />
                  <Typography variant="h6" fontWeight="bold">
                    Nouvel Îlot
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Numéro de l'îlot"
                      name="numeroIlot"
                      value={formData.numeroIlot}
                      onChange={handleChange}
                      fullWidth
                      required
                      helperText="Le préfixe de votre agence sera ajouté automatiquement (ex: AIG-INY001)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GridView color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      select
                      label="Zone"
                      name="zone"
                      value={formData.zone}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Apartment color="action" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {zones.length === 0 ? (
                        <MenuItem disabled>Aucune zone disponible</MenuItem>
                      ) : (
                        zones.map((zone) => {
                          const villeNom = zone.quartier?.ville?.nom || "";
                          const displayText = villeNom 
                            ? `${zone.nom} (${villeNom})`
                            : zone.nom;
                          return (
                            <MenuItem key={zone._id} value={zone._id}>
                              {displayText}
                            </MenuItem>
                          );
                        })
                      )}
                    </TextField>

                    <TextField
                      select
                      label="Lotissement (facultatif)"
                      name="lotissement"
                      value={formData.lotissement}
                      onChange={handleChange}
                      fullWidth
                      disabled={!formData.zone}
                      helperText={
                        !formData.zone
                          ? "Sélectionnez d'abord une zone"
                          : lotissementsDeLaZone.length === 0
                          ? "Aucun lotissement dans cette zone"
                          : ""
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Landscape color="action" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">
                        <em>Aucun lotissement</em>
                      </MenuItem>
                      {lotissementsDeLaZone.map((lot) => (
                        <MenuItem key={lot._id} value={lot._id}>
                          {lot.nom}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Quartier"
                      name="quartier"
                      value={formData.quartier}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={!formData.zone || filteredQuartiers.length === 0}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Domain color="action" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {filteredQuartiers.length === 0 ? (
                        <MenuItem disabled>
                          {formData.zone ? "Aucun quartier disponible pour cette zone" : "Sélectionnez d'abord une zone"}
                        </MenuItem>
                      ) : (
                        filteredQuartiers.map((quartier) => (
                          <MenuItem key={quartier._id} value={quartier._id}>
                            {quartier.nom}
                          </MenuItem>
                        ))
                      )}
                    </TextField>

                    <TextField
                      label="Surface totale"
                      name="surfaceTotale"
                      type="number"
                      value={formData.surfaceTotale}
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

                    <Divider sx={{ my: 2 }} />

                    {/* Section Photos et Vidéos (partagées par toutes les parcelles) */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <PhotoCamera fontSize="small" color="action" />
                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                        Photos et Vidéos (partagées par toutes les parcelles de cet îlot)
                      </Typography>
                    </Stack>

                    {/* Upload Images */}
                    <Box>
                      <input
                        accept="image/*"
                        id="ilot-image-upload"
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="ilot-image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          fullWidth
                          sx={{ mb: 2 }}
                        >
                          Ajouter des photos
                        </Button>
                      </label>

                      {/* Prévisualisations des images */}
                      {imagePreviews.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                          {imagePreviews.map((preview, index) => (
                            <Box
                              key={index}
                              sx={{
                                position: "relative",
                                width: 100,
                                height: 100,
                                borderRadius: 1,
                                overflow: "hidden",
                                border: "1px solid #ddd",
                              }}
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removeImage(index)}
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  bgcolor: "rgba(0,0,0,0.5)",
                                  color: "white",
                                  "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                                }}
                              >
                                <Close fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>

                    {/* Vidéos */}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<VideoLibrary />}
                        onClick={handleVideoAdd}
                        fullWidth
                        sx={{ mb: 1 }}
                      >
                        Ajouter une vidéo (URL YouTube/Vimeo)
                      </Button>

                      {videos.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {videos.map((video, index) => (
                            <Chip
                              key={index}
                              label={video.length > 30 ? `${video.substring(0, 30)}...` : video}
                              onDelete={() => removeVideo(index)}
                              sx={{ m: 0.5 }}
                              color="primary"
                            />
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Button
                      variant="contained"
                      color="warning"
                      type="submit"
                      size="large"
                      startIcon={<CheckCircle />}
                      fullWidth
                      disabled={zones.length === 0 || filteredQuartiers.length === 0 || !formData.zone || !formData.quartier}
                      sx={{
                        py: 1.5,
                        fontWeight: "bold",
                        fontSize: "1rem",
                      }}
                    >
                      Créer l'îlot
                    </Button>

                    {(zones.length === 0 || quartiers.length === 0) && (
                      <Typography variant="caption" color="error" textAlign="center">
                        Veuillez d'abord créer une zone et un quartier
                      </Typography>
                    )}
                    {formData.zone && filteredQuartiers.length === 0 && (
                      <Typography variant="caption" color="warning.main" textAlign="center">
                        Aucun quartier disponible pour la ville de cette zone
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card elevation={0} sx={{ mt: 3, borderRadius: 3, border: "1px solid #e3e8ef" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Assessment fontSize="small" color="action" />
                  <Typography variant="h6" fontWeight="bold">
                    Statistiques
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Total des îlots
                    </Typography>
                    <Chip label={ilots.length} color="warning" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Zones disponibles
                    </Typography>
                    <Chip label={zones.length} color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Résultats filtrés
                    </Typography>
                    <Chip label={filteredIlots.length} color="info" size="small" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* LISTE DES ÎLOTS */}
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FormatListBulleted color="action" />
                    <Typography variant="h6" fontWeight="bold">
                      Liste des Îlots ({filteredIlots.length})
                    </Typography>
                  </Stack>

                  {/* Barre de recherche */}
                  <TextField
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table>
                        <TableHead sx={{ bgcolor: "grey.100" }}>
                          <TableRow>
                            <TableCell><strong>Numéro</strong></TableCell>
                            <TableCell><strong>Zone</strong></TableCell>
                            <TableCell><strong>Quartier</strong></TableCell>
                            <TableCell><strong>Surface</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredIlots.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                <Typography color="text.secondary">
                                  {searchTerm ? "Aucun résultat trouvé" : "Aucun îlot enregistré"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredIlots
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((ilot) => (
                                <TableRow key={ilot._id} hover>
                                  <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <GridView color="warning" fontSize="small" />
                                      <Typography variant="body2" fontWeight="bold">
                                        {ilot.numeroIlot}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={ilot.zone?.nom || "-"}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={ilot.quartier?.nom || "-"}
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {ilot.surfaceTotale ? `${ilot.surfaceTotale} m²` : "-"}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Tooltip title="Voir parcelles">
                                      <IconButton
                                        size="small"
                                        color="info"
                                        onClick={() => showParcelles(ilot._id)}
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Affecter">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => openAffecterModal(ilot._id)}
                                      >
                                        <Assignment fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Modifier">
                                      <IconButton
                                        size="small"
                                        color="warning"
                                        onClick={() => openEditDialog(ilot)}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(ilot._id)}
                                      >
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
                      count={filteredIlots.length}
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
          </Grid>
        </Grid>
      </Container>

      {/* DIALOG PARCELLES */}
      <Dialog open={openParcelles} onClose={() => setOpenParcelles(false)} fullWidth maxWidth="md">
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Visibility color="info" />
            <Typography variant="h6" fontWeight="bold">
              Parcelles de l'îlot {ilotEnCours?.numeroIlot || ""}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {parcellesIlot.length === 0 ? (
            <Typography textAlign="center" py={4} color="text.secondary">
              Aucune parcelle trouvée pour cet îlot.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead sx={{ bgcolor: "grey.100" }}>
                <TableRow>
                  <TableCell><strong>Numéro</strong></TableCell>
                  <TableCell><strong>Superficie</strong></TableCell>
                  <TableCell><strong>Prix</strong></TableCell>
                  <TableCell><strong>Statut</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parcellesIlot.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell fontWeight="bold">{p.numeroParcelle}</TableCell>
                    <TableCell>{p.superficie ?? "-"} m²</TableCell>
                    <TableCell>
                      {p.prix
                        ? new Intl.NumberFormat("fr-FR").format(p.prix) + " FCFA"
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip label={p.statut} size="small" color="primary" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenParcelles(false)} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG AFFECTATION */}
      <Dialog open={openAffecter} onClose={() => setOpenAffecter(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Assignment color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Affecter l'îlot à un commercial
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 2 }}>
            <TextField
              select
              label="Commercial"
              value={selectedCommercial}
              onChange={(e) => setSelectedCommercial(e.target.value)}
              fullWidth
              required
            >
              {commerciaux.length === 0 ? (
                <MenuItem disabled>Aucun commercial disponible</MenuItem>
              ) : (
                commerciaux.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.fullName || c.phone}
                  </MenuItem>
                ))
              )}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={propagerParcelles}
                  onChange={(e) => setPropagerParcelles(e.target.checked)}
                />
              }
              label="Aussi affecter toutes les parcelles de cet îlot"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenAffecter(false)} variant="outlined">
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={submitAffectation}
            disabled={savingAffect}
            startIcon={savingAffect ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
          >
            {savingAffect ? "En cours..." : "Affecter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG ÉDITION */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Edit color="warning" />
            <Typography variant="h6" fontWeight="bold">
              Modifier l'îlot
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 2 }}>
            <TextField
              label="Numéro de l'îlot"
              name="numeroIlot"
              value={editFormData.numeroIlot}
              onChange={handleEditChange}
              fullWidth
              required
              helperText="Le préfixe de votre agence sera ajouté automatiquement si absent"
            />
            <TextField
              select
              label="Zone"
              name="zone"
              value={editFormData.zone}
              onChange={handleEditChange}
              fullWidth
              required
            >
              {zones.map((zone) => {
                const villeNom = zone.quartier?.ville?.nom || "";
                const displayText = villeNom 
                  ? `${zone.nom} (${villeNom})`
                  : zone.nom;
                return (
                  <MenuItem key={zone._id} value={zone._id}>
                    {displayText}
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              select
              label="Lotissement (facultatif)"
              name="lotissement"
              value={editFormData.lotissement}
              onChange={handleEditChange}
              fullWidth
              disabled={!editFormData.zone}
              helperText={
                !editFormData.zone
                  ? "Sélectionnez d'abord une zone"
                  : lotissementsDeLaZoneEdit.length === 0
                  ? "Aucun lotissement dans cette zone"
                  : "Videz le champ pour détacher l'îlot de son lotissement"
              }
            >
              <MenuItem value="">
                <em>Aucun lotissement</em>
              </MenuItem>
              {lotissementsDeLaZoneEdit.map((lot) => (
                <MenuItem key={lot._id} value={lot._id}>
                  {lot.nom}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Quartier"
              name="quartier"
              value={editFormData.quartier}
              onChange={handleEditChange}
              fullWidth
              required
              disabled={!editFormData.zone || filteredEditQuartiers.length === 0}
            >
              {filteredEditQuartiers.length === 0 ? (
                <MenuItem disabled>
                  {editFormData.zone ? "Aucun quartier disponible pour cette zone" : "Sélectionnez d'abord une zone"}
                </MenuItem>
              ) : (
                filteredEditQuartiers.map((quartier) => (
                  <MenuItem key={quartier._id} value={quartier._id}>
                    {quartier.nom}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              label="Surface totale"
              name="surfaceTotale"
              type="number"
              value={editFormData.surfaceTotale}
              onChange={handleEditChange}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">m²</InputAdornment>,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditDialog(false)} variant="outlined">
            Annuler
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            color="warning"
            startIcon={<CheckCircle />}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </AgenceLayout>
  );
};

export default CreateIlotPage;
