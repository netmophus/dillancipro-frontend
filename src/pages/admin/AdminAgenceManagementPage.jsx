import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Grid,
  Button,
  Paper,
  Stack,
  Alert,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Fade,
} from "@mui/material";
import {
  Business,
  Add,
  Edit,
  Delete,
  Link as LinkIcon,
  LinkOff,
  Phone,
  Email,
  LocationOn,
  CheckCircle,
  Warning,
  ArrowBack,
  Refresh,
  Search,
  CloudUpload,
  Visibility,
  Close,
  PictureAsPdf,
  Image as ImageIcon,
} from "@mui/icons-material";

import API from "../../api";
import PageLayout from "../../components/shared/PageLayout";
import { useNavigate } from "react-router-dom";
import LinkAdminToAgenceModal from "../../components/admin/LinkAdminToAgenceModal";

const AdminAgenceManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nom: "",
    nif: "",
    rccm: "",
    statutJuridique: "",
    dateCreation: "",
    promoteur: "",
    adresse: "",
    bp: "",
    ville: "",
    pays: "",
    telephone: "",
    email: "",
    latitude: "",
    longitude: "",
    description: "",
  });

  const [files, setFiles] = useState({
    nifFile: null,
    rccmFile: null,
    statutFile: null,
    autresFichiers: [],
    logo: null,
  });

  // État pour stocker les fichiers existants (URLs)
  const [existingFiles, setExistingFiles] = useState({
    nifFile: null,
    rccmFile: null,
    statutFile: null,
    autresFichiers: [],
    logo: null,
  });

  const [agences, setAgences] = useState([]);
  const [selectedAgence, setSelectedAgence] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editingAgence, setEditingAgence] = useState(null);

  useEffect(() => {
    fetchAgences();
  }, []);

  const fetchAgences = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/agences");
      setAgences(res.data || []);
    } catch (err) {
      console.error("Erreur chargement agences:", err);
      setError("Erreur lors du chargement des agences");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: name === "autresFichiers" ? Array.from(selectedFiles) : selectedFiles[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      if (files.nifFile) data.append("nifFile", files.nifFile);
      if (files.rccmFile) data.append("rccmFile", files.rccmFile);
      if (files.statutFile) data.append("statutFile", files.statutFile);
      if (files.logo) data.append("logo", files.logo);
      if (files.autresFichiers.length > 0) {
        files.autresFichiers.forEach((file) => data.append("autresFichiers", file));
      }

      await API.post("/admin/create-agence", data);
      setSuccess("✅ Agence créée avec succès !");
      resetForm();
      setActiveTab(1);
      fetchAgences();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la création de l'agence");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      nif: "",
      rccm: "",
      statutJuridique: "",
      dateCreation: "",
      promoteur: "",
      adresse: "",
      bp: "",
      ville: "",
      pays: "",
      telephone: "",
      email: "",
      latitude: "",
      longitude: "",
      description: "",
    });
    setFiles({
      nifFile: null,
      rccmFile: null,
      statutFile: null,
      autresFichiers: [],
      logo: null,
    });
    setExistingFiles({
      nifFile: null,
      rccmFile: null,
      statutFile: null,
      autresFichiers: [],
      logo: null,
    });
    setEditingAgence(null);
  };

  const handleDelete = async () => {
    try {
      // await API.delete(`/admin/agences/${selectedAgence._id}`);
      setSuccess("✅ Agence supprimée (fonction à implémenter)");
      setDeleteDialog(false);
      fetchAgences();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  const handleUnlinkAdmin = async (agenceId) => {
    try {
      await API.put(`/admin/agences/${agenceId}/unlink-admin`);
      setSuccess("✅ Admin délié avec succès");
      fetchAgences();
    } catch (err) {
      setError("Erreur lors de la délégation");
    }
  };

  const handleEdit = (agence) => {
    setEditingAgence(agence);
    // Pré-remplir le formulaire avec les données de l'agence
    setFormData({
      nom: agence.nom || "",
      nif: agence.nif || "",
      rccm: agence.rccm || "",
      statutJuridique: agence.statutJuridique || "",
      dateCreation: agence.dateCreation ? new Date(agence.dateCreation).toISOString().split('T')[0] : "",
      promoteur: agence.promoteur || "",
      adresse: agence.adresse || "",
      bp: agence.bp || "",
      ville: agence.ville || "",
      pays: agence.pays || "",
      telephone: agence.telephone || "",
      email: agence.email || "",
      latitude: agence.localisation?.latitude || "",
      longitude: agence.localisation?.longitude || "",
      description: agence.description || "",
    });
    setFiles({
      nifFile: null,
      rccmFile: null,
      statutFile: null,
      autresFichiers: [],
      logo: null,
    });
    // Stocker les fichiers existants avec leurs URLs
    const fichiers = agence.fichiers || {};
    const getFileUrl = (filePath) => {
      if (!filePath) return null;
      // Si c'est déjà une URL complète (Cloudinary ou http), retourner tel quel
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
      }
      // Sinon, construire l'URL locale
      const normalizedPath = filePath.replace(/\\/g, '/');
      return `http://localhost:5000/${normalizedPath}`;
    };
    setExistingFiles({
      nifFile: fichiers.nifFile ? getFileUrl(fichiers.nifFile) : null,
      rccmFile: fichiers.rccmFile ? getFileUrl(fichiers.rccmFile) : null,
      statutFile: fichiers.statutFile ? getFileUrl(fichiers.statutFile) : null,
      autresFichiers: fichiers.autresFichiers?.map(getFileUrl) || [],
      logo: fichiers.logo ? getFileUrl(fichiers.logo) : null,
    });
    setActiveTab(0); // Afficher l'onglet de création qui servira aussi à l'édition
  };

  const handleUpdateAgence = async (e) => {
    e.preventDefault();
    if (!editingAgence) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      if (files.nifFile) data.append("nifFile", files.nifFile);
      if (files.rccmFile) data.append("rccmFile", files.rccmFile);
      if (files.statutFile) data.append("statutFile", files.statutFile);
      if (files.logo) data.append("logo", files.logo);
      if (files.autresFichiers.length > 0) {
        files.autresFichiers.forEach((file) => data.append("autresFichiers", file));
      }

      await API.put(`/admin/agences/${editingAgence._id}`, data);
      setSuccess("✅ Agence mise à jour avec succès !");
      setEditingAgence(null);
      resetForm();
      setActiveTab(1);
      fetchAgences();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de l'agence");
    } finally {
      setLoading(false);
    }
  };

  const filteredAgences = agences.filter(
    (agence) =>
      agence.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agence.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agence.telephone?.includes(searchTerm)
  );

  const stats = {
    total: agences.length,
    avecAdmin: agences.filter((a) => a.admin).length,
    sansAdmin: agences.filter((a) => !a.admin).length,
  };

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/admin/dashboard")} sx={{ mb: 2 }}>
            Retour au dashboard
          </Button>

          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
              <Business fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestion des Agences Immobilières
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Créez et gérez les agences partenaires
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

        {/* KPIs */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderLeft: "4px solid #2196f3" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Agences
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {stats.total}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#2196f3", width: 48, height: 48 }}>
                    <Business />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderLeft: "4px solid #4caf50" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Avec Admin
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {stats.avecAdmin}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#4caf50", width: 48, height: 48 }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderLeft: "4px solid #ff9800" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Sans Admin
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {stats.sansAdmin}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#ff9800", width: 48, height: 48 }}>
                    <Warning />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Onglets */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": { fontWeight: "bold", fontSize: "1rem" },
            }}
          >
            <Tab icon={<Add />} label="Créer une agence" iconPosition="start" />
            <Tab icon={<Business />} label={`Mes agences (${agences.length})`} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* ONGLET 1 : Créer agence */}
        {activeTab === 0 && (
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={editingAgence ? handleUpdateAgence : handleSubmit}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    {editingAgence ? "Modifier l'agence" : "Informations générales"}
                  </Typography>
                  {editingAgence && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setEditingAgence(null);
                        resetForm();
                        setActiveTab(1);
                      }}
                    >
                      Annuler
                    </Button>
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="nom"
                      label="Nom de l'agence"
                      value={formData.nom}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="promoteur"
                      label="Nom du promoteur"
                      value={formData.promoteur}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="nif"
                      label="NIF"
                      value={formData.nif}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="rccm"
                      label="RCCM"
                      value={formData.rccm}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="statutJuridique"
                      label="Statut juridique"
                      value={formData.statutJuridique}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="dateCreation"
                      label="Date de création"
                      type="date"
                      value={formData.dateCreation}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
                  Coordonnées
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12}>
                    <TextField
                      name="adresse"
                      label="Adresse complète"
                      value={formData.adresse}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="ville"
                      label="Ville"
                      value={formData.ville}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="pays"
                      label="Pays"
                      value={formData.pays}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="bp"
                      label="Boîte Postale (optionnel)"
                      value={formData.bp}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="telephone"
                      label="Téléphone"
                      value={formData.telephone}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="latitude"
                      label="Latitude"
                      type="number"
                      value={formData.latitude}
                      onChange={handleChange}
                      fullWidth
                      placeholder="12.3714"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="longitude"
                      label="Longitude"
                      type="number"
                      value={formData.longitude}
                      onChange={handleChange}
                      fullWidth
                      placeholder="-1.5197"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      label="Description"
                      value={formData.description}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
                  Documents
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2} mb={4}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderStyle: "dashed" }}>
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Box sx={{ textAlign: "center", cursor: "pointer" }}>
                          <CloudUpload color="primary" fontSize="large" />
                          <Typography variant="body2">Logo de l'agence</Typography>
                          {files.logo && (
                            <Chip label={`Nouveau: ${files.logo.name}`} size="small" color="primary" sx={{ mt: 1 }} />
                          )}
                        </Box>
                      </label>
                      {existingFiles.logo && !files.logo && (
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Fichier actuel :
                          </Typography>
                          <Box
                            component="img"
                            src={existingFiles.logo}
                            alt="Logo actuel"
                            sx={{
                              maxWidth: "100%",
                              maxHeight: 100,
                              objectFit: "contain",
                              border: 1,
                              borderColor: "divider",
                              borderRadius: 1,
                              p: 1,
                              cursor: "pointer",
                            }}
                            onClick={() => window.open(existingFiles.logo, "_blank")}
                          />
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => window.open(existingFiles.logo, "_blank")}
                            sx={{ mt: 1 }}
                          >
                            Voir
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderStyle: "dashed" }}>
                      <input
                        type="file"
                        name="nifFile"
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="nif-upload"
                      />
                      <label htmlFor="nif-upload">
                        <Box sx={{ textAlign: "center", cursor: "pointer" }}>
                          <CloudUpload color="action" fontSize="large" />
                          <Typography variant="body2">NIF (PDF)</Typography>
                          {files.nifFile && (
                            <Chip label={`Nouveau: ${files.nifFile.name}`} size="small" color="primary" sx={{ mt: 1 }} />
                          )}
                        </Box>
                      </label>
                      {existingFiles.nifFile && !files.nifFile && (
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Fichier actuel :
                          </Typography>
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            <PictureAsPdf color="error" />
                            <Typography variant="body2">NIF.pdf</Typography>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => window.open(existingFiles.nifFile, "_blank")}
                            >
                              Voir
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderStyle: "dashed" }}>
                      <input
                        type="file"
                        name="rccmFile"
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="rccm-upload"
                      />
                      <label htmlFor="rccm-upload">
                        <Box sx={{ textAlign: "center", cursor: "pointer" }}>
                          <CloudUpload color="action" fontSize="large" />
                          <Typography variant="body2">RCCM (PDF)</Typography>
                          {files.rccmFile && (
                            <Chip label={`Nouveau: ${files.rccmFile.name}`} size="small" color="primary" sx={{ mt: 1 }} />
                          )}
                        </Box>
                      </label>
                      {existingFiles.rccmFile && !files.rccmFile && (
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Fichier actuel :
                          </Typography>
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            <PictureAsPdf color="error" />
                            <Typography variant="body2">RCCM.pdf</Typography>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => window.open(existingFiles.rccmFile, "_blank")}
                            >
                              Voir
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderStyle: "dashed" }}>
                      <input
                        type="file"
                        name="statutFile"
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="statut-upload"
                      />
                      <label htmlFor="statut-upload">
                        <Box sx={{ textAlign: "center", cursor: "pointer" }}>
                          <CloudUpload color="action" fontSize="large" />
                          <Typography variant="body2">Statut juridique (PDF)</Typography>
                          {files.statutFile && (
                            <Chip label={`Nouveau: ${files.statutFile.name}`} size="small" color="primary" sx={{ mt: 1 }} />
                          )}
                        </Box>
                      </label>
                      {existingFiles.statutFile && !files.statutFile && (
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Fichier actuel :
                          </Typography>
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            <PictureAsPdf color="error" />
                            <Typography variant="body2">Statut.pdf</Typography>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => window.open(existingFiles.statutFile, "_blank")}
                            >
                              Voir
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>

                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={resetForm}>
                    Réinitialiser
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    sx={{ minWidth: 200 }}
                  >
                    {loading 
                      ? (editingAgence ? "Modification..." : "Création...") 
                      : (editingAgence ? "Mettre à jour l'agence" : "Créer l'agence")
                    }
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ONGLET 2 : Liste agences */}
        {activeTab === 1 && (
          <>
            {/* Recherche */}
            <TextField
              fullWidth
              placeholder="Rechercher par nom, ville ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <Card elevation={3}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    📋 Liste des agences ({filteredAgences.length})
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      startIcon={<Add />}
                      variant="contained"
                      onClick={() => setActiveTab(0)}
                      size="small"
                    >
                      Créer agence
                    </Button>
                    <Button startIcon={<Refresh />} onClick={fetchAgences} variant="outlined" size="small">
                      Actualiser
                    </Button>
                  </Stack>
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                  </Box>
                ) : filteredAgences.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <Business sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
                    <Typography color="text.secondary">Aucune agence enregistrée</Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setActiveTab(0)}
                      sx={{ mt: 2 }}
                    >
                      Créer la première agence
                    </Button>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom</TableCell>
                          <TableCell>Ville</TableCell>
                          <TableCell>Contact</TableCell>
                          <TableCell>Admin</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAgences.map((agence) => (
                          <TableRow key={agence._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {agence.nom}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {agence.promoteur}
                              </Typography>
                            </TableCell>
                            <TableCell>{agence.ville}</TableCell>
                            <TableCell>
                              <Typography variant="body2">{agence.telephone}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {agence.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={agence.admin ? "Admin lié ✓" : "Non lié"}
                                color={agence.admin ? "success" : "warning"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Tooltip title="Modifier">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEdit(agence)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setSelectedAgence(agence);
                                      setDeleteDialog(true);
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                                {agence.admin ? (
                                  <Tooltip title="Délier admin">
                                    <IconButton
                                      size="small"
                                      color="warning"
                                      onClick={() => handleUnlinkAdmin(agence._id)}
                                    >
                                      <LinkOff />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Lier un admin">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => {
                                        setSelectedAgence(agence._id);
                                        setOpenModal(true);
                                      }}
                                    >
                                      <LinkIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>

      {/* DIALOG : Lier admin */}
      <LinkAdminToAgenceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        agenceId={selectedAgence}
        onSuccess={() => {
          fetchAgences();
          setSuccess("✅ Admin lié avec succès");
        }}
      />

      {/* DIALOG : Confirmation suppression */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>⚠️ Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Voulez-vous vraiment supprimer l'agence <strong>{selectedAgence?.nom}</strong> ?
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: "block" }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained" startIcon={<Delete />}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
}

export default AdminAgenceManagementPage;
