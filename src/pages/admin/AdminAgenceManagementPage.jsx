import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  GridLegacy as Grid,
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
import { BASE_SERVER_URL } from "../../config/config";
import PageLayout from "../../components/admin/AdminLayout";
import FormSection from "../../components/admin/SectionCard";
import { Badge as FIBadge, Business as FIBusiness, CalendarMonth as FICalendarMonth, Explore as FIExplore, Gavel as FIGavel, LocationCity as FILocationCity, Mail as FIMail, MyLocation as FIMyLocation, Notes as FINotes, Numbers as FINumbers, Person as FIPerson, Public as FIPublic } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LinkAdminToAgenceModal from "../../components/admin/LinkAdminToAgenceModal";

// En-tête de dialogue moderne, coloré, réutilisable
const DialogHeader = ({ icon: Icon, title, subtitle, color, onClose }) => (
  <Box
    sx={{
      p: 3,
      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      color: "white",
      position: "relative",
    }}
  >
    <IconButton
      onClick={onClose}
      sx={{ position: "absolute", top: 12, right: 12, color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}
    >
      <Close />
    </IconButton>
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.22)", width: 52, height: 52 }}>
        <Icon fontSize="large" />
      </Avatar>
      <Box>
        <Typography variant="h6" fontWeight="bold">{title}</Typography>
        {subtitle && <Typography variant="body2" sx={{ opacity: 0.9 }}>{subtitle}</Typography>}
      </Box>
    </Stack>
  </Box>
);

const FIELD_SX = { "& .MuiOutlinedInput-root": { borderRadius: 2.5 } };

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
      return `${BASE_SERVER_URL}/${normalizedPath}`;
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
            <Avatar sx={{ bgcolor: "#1976d215", color: "#1976d2", width: 60, height: 60 }}>
              <Business fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestion des agences immobilières
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
          {[
            { label: "Total Agences", value: stats.total, color: "#1976d2", icon: Business },
            { label: "Avec Admin", value: stats.avecAdmin, color: "#2e7d32", icon: CheckCircle },
            { label: "Sans Admin", value: stats.sansAdmin, color: "#ff9800", icon: Warning },
          ].map((kpi) => (
            <Grid item xs={12} md={4} key={kpi.label}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e3e8ef",
                  transition: "all 0.25s ease",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: `0 8px 24px ${kpi.color}22` },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {kpi.label}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: kpi.color }}>
                        {kpi.value}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${kpi.color}15`, color: kpi.color, width: 48, height: 48 }}>
                      <kpi.icon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
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
          <Card elevation={0} sx={{ bgcolor: "transparent", border: "none", boxShadow: "none" }}>
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Box component="form" onSubmit={editingAgence ? handleUpdateAgence : handleSubmit} sx={{ ...FIELD_SX, "& legend": { display: "none" } }}>
                <FormSection
                  icon="business" title={editingAgence ? "Modifier l'agence" : "Informations générales"}
                  color="#3030F9"
                  action={editingAgence && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 2 }}
                      onClick={() => {
                        setEditingAgence(null);
                        resetForm();
                        setActiveTab(1);
                      }}
                    >
                      Annuler
                    </Button>
                  )}
                >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="nom"
                      inputProps={{ "aria-label": "Nom de l'agence", title: "Nom de l'agence" }}
                      placeholder="Nom de l'agence *"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIBusiness color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.nom}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="promoteur"
                      inputProps={{ "aria-label": "Nom du promoteur", title: "Nom du promoteur" }}
                      placeholder="Nom du promoteur"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIPerson color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.promoteur}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="nif"
                      inputProps={{ "aria-label": "NIF", title: "NIF" }}
                      placeholder="NIF"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIBadge color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.nif}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="rccm"
                      inputProps={{ "aria-label": "RCCM", title: "RCCM" }}
                      placeholder="RCCM"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FINumbers color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.rccm}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="statutJuridique"
                      inputProps={{ "aria-label": "Statut juridique", title: "Statut juridique" }}
                      placeholder="Statut juridique"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIGavel color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.statutJuridique}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="dateCreation"
                      inputProps={{ "aria-label": "Date de création", title: "Date de création" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FICalendarMonth color="action" />
                          </InputAdornment>
                        ),
                      }}
                      type="date"
                      value={formData.dateCreation}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                </FormSection>

                <FormSection
                  icon="location" title="Coordonnées"
                  color="#0A7C4F"
                >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      name="adresse"
                      inputProps={{ "aria-label": "Adresse complète", title: "Adresse complète" }}
                      placeholder="Adresse complète"
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

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="ville"
                      inputProps={{ "aria-label": "Ville", title: "Ville" }}
                      placeholder="Ville *"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FILocationCity color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.ville}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="pays"
                      inputProps={{ "aria-label": "Pays", title: "Pays" }}
                      placeholder="Pays *"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIPublic color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.pays}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="bp"
                      inputProps={{ "aria-label": "Boîte Postale (optionnel)", title: "Boîte Postale (optionnel)" }}
                      placeholder="Boîte Postale (optionnel)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIMail color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.bp}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="telephone"
                      inputProps={{ "aria-label": "Téléphone", title: "Téléphone" }}
                      placeholder="Téléphone *"
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

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="email"
                      inputProps={{ "aria-label": "Email", title: "Email" }}
                      placeholder="Email *"
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

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="latitude"
                      inputProps={{ "aria-label": "Latitude", title: "Latitude" }}
                      placeholder="Latitude (ex. 13.5116)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIMyLocation color="action" />
                          </InputAdornment>
                        ),
                      }}
                      type="number"
                      value={formData.latitude}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name="longitude"
                      inputProps={{ "aria-label": "Longitude", title: "Longitude" }}
                      placeholder="Longitude (ex. 2.1254)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIExplore color="action" />
                          </InputAdornment>
                        ),
                      }}
                      type="number"
                      value={formData.longitude}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      inputProps={{ "aria-label": "Description", title: "Description" }}
                      placeholder="Description"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                            <FINotes color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.description}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
                </FormSection>

                <FormSection
                  icon="description" title="Documents"
                  color="#0e1133"
                >
                <Grid container spacing={3} sx={{ "& > .MuiGrid-root > .MuiPaper-root": { width: "100%", height: "100%" } }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2, borderStyle: "dashed", borderRadius: 3, borderColor: "#cdd7e3", transition: "all 0.2s", "&:hover": { borderColor: "#1976d2", bgcolor: "#f7f9fc" } }}>
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

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2, borderStyle: "dashed", borderRadius: 3, borderColor: "#cdd7e3", transition: "all 0.2s", "&:hover": { borderColor: "#1976d2", bgcolor: "#f7f9fc" } }}>
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

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2, borderStyle: "dashed", borderRadius: 3, borderColor: "#cdd7e3", transition: "all 0.2s", "&:hover": { borderColor: "#1976d2", bgcolor: "#f7f9fc" } }}>
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

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2, borderStyle: "dashed", borderRadius: 3, borderColor: "#cdd7e3", transition: "all 0.2s", "&:hover": { borderColor: "#1976d2", bgcolor: "#f7f9fc" } }}>
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
                </FormSection>

                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={resetForm} color="inherit" sx={{ borderRadius: 2 }}>
                    Réinitialiser
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    sx={{ minWidth: 200, borderRadius: 2, bgcolor: "#3030F9", boxShadow: "none", "&:hover": { bgcolor: "#2020C8", boxShadow: "none" } }}
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
              placeholder="Rechercher une agence..."
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

            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Liste des agences ({filteredAgences.length})
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
                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #eef2f7" }}>
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
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogHeader
          icon={Delete}
          title="Confirmer la suppression"
          subtitle="Action irréversible"
          color="#e53935"
          onClose={() => setDeleteDialog(false)}
        />
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2">
            Voulez-vous vraiment supprimer l'agence <strong>{selectedAgence?.nom}</strong> ?
          </Typography>
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            Cette action est irréversible.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button onClick={() => setDeleteDialog(false)} color="inherit" sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            startIcon={<Delete />}
            sx={{ borderRadius: 2, px: 3, bgcolor: "#e53935", boxShadow: "none", "&:hover": { bgcolor: "#c62828", boxShadow: "none" } }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
}

export default AdminAgenceManagementPage;
