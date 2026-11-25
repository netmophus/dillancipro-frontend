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
  MenuItem,
  Snackbar,
} from "@mui/material";
import {
  Gavel,
  Add,
  Edit,
  Delete,
  Phone,
  Email,
  LocationOn,
  Business,
  CheckCircle,
  Cancel,
  ArrowBack,
  Search,
  Visibility,
  ContentCopy,
  Close,
} from "@mui/icons-material";
import { LocationCity as FILocationCity, Notes as FINotes, Place as FIPlace } from "@mui/icons-material";

import API from "../../api";
import PageLayout from "../../components/admin/AdminLayout";
import FormSection from "../../components/admin/SectionCard";
import { useNavigate } from "react-router-dom";

// En-tête de dialogue moderne, coloré, réutilisable
const DialogHeader = ({ icon: Icon, title, subtitle, color, onClose }) => (
  <Box
    sx={{
      p: 3,
      background: color,
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

const AdminNotaireManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [credentialsDialog, setCredentialsDialog] = useState(false);
  const [tempCredentials, setTempCredentials] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "", // Mot de passe personnalisé (optionnel)
    cabinetName: "",
    adresse: "",
    ville: "Niamey",
    quartier: "",
    notes: "",
  });

  const [notaires, setNotaires] = useState([]);
  const [editingNotaire, setEditingNotaire] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (activeTab === 1) {
      fetchNotaires();
    }
  }, [activeTab]);

  const fetchNotaires = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/notaires");
      setNotaires(res.data || []);
    } catch (err) {
      console.error("Erreur chargement notaires:", err);
      setError("Erreur lors du chargement des notaires");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/admin/notaires", formData);
      
      setSuccess("Notaire créé avec succès !");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        cabinetName: "",
        adresse: "",
        ville: "Niamey",
        quartier: "",
        notes: "",
      });
      
      // Afficher les identifiants temporaires
      if (res.data.credentials) {
        setTempCredentials(res.data.credentials);
        setCredentialsDialog(true);
      }
      
      // Basculer vers l'onglet liste
      setTimeout(() => {
        setActiveTab(1);
        fetchNotaires();
      }, 1500);
    } catch (err) {
      console.error("Erreur création notaire:", err);
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notaire) => {
    setEditingNotaire(notaire);
    setFormData({
      fullName: notaire.fullName || "",
      email: notaire.email || "",
      phone: notaire.phone || "",
      cabinetName: notaire.cabinetName || "",
      adresse: notaire.adresse || "",
      ville: notaire.ville || "Niamey",
      quartier: notaire.quartier || "",
      notes: notaire.notes || "",
    });
    setActiveTab(0);
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingNotaire) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.put(`/admin/notaires/${editingNotaire._id}`, {
        ...formData,
        statut: formData.statut || editingNotaire.statut,
      });
      
      setSuccess("Notaire mis à jour avec succès");
      setEditingNotaire(null);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        cabinetName: "",
        adresse: "",
        ville: "Niamey",
        quartier: "",
        notes: "",
      });
      
      setTimeout(() => {
        setActiveTab(1);
        fetchNotaires();
      }, 1500);
    } catch (err) {
      console.error("Erreur mise à jour notaire:", err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await API.delete(`/admin/notaires/${deleteTarget._id}`);
      setSuccess("Notaire supprimé avec succès");
      setDeleteTarget(null);
      fetchNotaires();
    } catch (err) {
      console.error("Erreur suppression notaire:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (notaire) => {
    const newStatut = notaire.statut === "actif" ? "inactif" : "actif";
    setLoading(true);
    try {
      await API.put(`/admin/notaires/${notaire._id}`, {
        statut: newStatut,
      });
      setSuccess(`Notaire ${newStatut === "actif" ? "activé" : "désactivé"} avec succès`);
      fetchNotaires();
    } catch (err) {
      console.error("Erreur changement statut:", err);
      setError(err.response?.data?.message || "Erreur lors du changement de statut");
    } finally {
      setLoading(false);
    }
  };

  const filteredNotaires = notaires.filter(
    (notaire) =>
      notaire.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notaire.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notaire.phone?.includes(searchTerm) ||
      notaire.cabinetName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copié dans le presse-papiers");
  };

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/admin/dashboard")}
            sx={{ mb: 2 }}
          >
            Retour au dashboard
          </Button>
          
          <Paper elevation={0} sx={{ background: "#3030F9", p: 4, borderRadius: 3, color: "white" }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", width: 60, height: 60 }}>
                <Gavel fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Gestion des notaires partenaires
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Créez et gérez les notaires partenaires de la plateforme
                </Typography>
              </Box>
            </Box>
          </Paper>
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
            <Tab
              icon={<Add />}
              label={editingNotaire ? "Modifier un notaire" : "Créer un notaire"}
              iconPosition="start"
            />
            <Tab
              icon={<Gavel />}
              label={`Liste des notaires (${notaires.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* ONGLET 1 : Création/Modification */}
        {activeTab === 0 && (
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef", overflow: "visible" }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#0e1133", lineHeight: 1.3, pt: 0.5, mb: 3 }}>
                {editingNotaire ? "Modifier le notaire" : "Créer un nouveau notaire"}
              </Typography>

              <Box component="form" onSubmit={editingNotaire ? handleUpdate : handleSubmit} sx={{ ...FIELD_SX, "& legend": { display: "none" }, display: "flex", flexDirection: "column", gap: 3 }}>
                <FormSection icon="person" sx={{ mb: 0 }} title="Informations personnelles" color="#3030F9">
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="fullName"
                      inputProps={{ "aria-label": "Nom complet", title: "Nom complet" }}
                      placeholder="Nom complet *"
                      value={formData.fullName}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Gavel />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="email"
                      inputProps={{ "aria-label": "Email", title: "Email" }}
                      placeholder="Email *"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={!!editingNotaire}
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
                      name="phone"
                      inputProps={{ "aria-label": "Téléphone", title: "Téléphone" }}
                      placeholder="Téléphone *"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={!!editingNotaire}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {!editingNotaire && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="password"
                        inputProps={{ "aria-label": "Mot de passe (optionnel)", title: "Mot de passe (optionnel)" }}
                        placeholder="Mot de passe (optionnel)"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        helperText="Laissez vide pour utiliser le mot de passe par défaut : Notaire123!"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CheckCircle />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} md={editingNotaire ? 6 : 12}>
                    <TextField
                      name="cabinetName"
                      inputProps={{ "aria-label": "Nom du cabinet", title: "Nom du cabinet" }}
                      placeholder="Nom du cabinet *"
                      value={formData.cabinetName}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                </FormSection>

                <FormSection icon="location" sx={{ mb: 0 }} title="Adresse du cabinet" color="#0A7C4F">
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="adresse"
                      inputProps={{ "aria-label": "Adresse complète", title: "Adresse complète" }}
                      placeholder="Adresse complète"
                      value={formData.adresse}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="ville"
                      inputProps={{ "aria-label": "Ville", title: "Ville" }}
                      placeholder="Ville"
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
                      defaultValue="Niamey"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="quartier"
                      inputProps={{ "aria-label": "Quartier", title: "Quartier" }}
                      placeholder="Quartier"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIPlace color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.quartier}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                </FormSection>

                <FormSection icon="description" sx={{ mb: 0 }} title="Notes (optionnel)" color="#0e1133">
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="notes"
                      inputProps={{ "aria-label": "Notes", title: "Notes" }}
                      placeholder="Notes (optionnel)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                            <FINotes color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={formData.notes}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
                </FormSection>

                <Box display="flex" gap={2} justifyContent="flex-end">
                  {editingNotaire && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      sx={{ borderRadius: 2 }}
                      onClick={() => {
                        setEditingNotaire(null);
                        setFormData({
                          fullName: "",
                          email: "",
                          phone: "",
                          cabinetName: "",
                          adresse: "",
                          ville: "Niamey",
                          quartier: "",
                          notes: "",
                        });
                      }}
                    >
                      Annuler
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    sx={{ borderRadius: 2, px: 3, bgcolor: "#3030F9", boxShadow: "none", "&:hover": { bgcolor: "#2020C8", boxShadow: "none" } }}
                  >
                    {loading
                      ? "Enregistrement..."
                      : editingNotaire
                      ? "Enregistrer"
                      : "Créer le notaire"}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ONGLET 2 : Liste des notaires */}
        {activeTab === 1 && (
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2} flexWrap="wrap">
                <Typography variant="h6" fontWeight="bold">
                  Liste des notaires ({filteredNotaires.length})
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    placeholder="Rechercher..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 300, ...FIELD_SX }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{ borderRadius: 2, bgcolor: "#3030F9", boxShadow: "none", "&:hover": { bgcolor: "#2020C8", boxShadow: "none" } }}
                    onClick={() => {
                      setEditingNotaire(null);
                      setFormData({
                        fullName: "",
                        email: "",
                        phone: "",
                        password: "",
                        cabinetName: "",
                        adresse: "",
                        ville: "Niamey",
                        quartier: "",
                        notes: "",
                      });
                      setActiveTab(0);
                    }}
                  >
                    Nouveau notaire
                  </Button>
                </Box>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #eef2f7" }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "grey.100" }}>
                      <TableRow>
                        <TableCell><strong>Notaire</strong></TableCell>
                        <TableCell><strong>Cabinet</strong></TableCell>
                        <TableCell><strong>Contact</strong></TableCell>
                        <TableCell><strong>Ville</strong></TableCell>
                        <TableCell><strong>Statut</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredNotaires.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">
                              {searchTerm ? "Aucun notaire trouvé" : "Aucun notaire inscrit"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNotaires.map((notaire) => (
                          <TableRow key={notaire._id} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: "#3030F9" }}>
                                  {notaire.fullName?.charAt(0).toUpperCase() || "N"}
                                </Avatar>
                                <Typography variant="body2" fontWeight="bold">
                                  {notaire.fullName || "Sans nom"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{notaire.cabinetName || "-"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Chip
                                  label={notaire.phone}
                                  size="small"
                                  variant="outlined"
                                  icon={<Phone />}
                                  sx={{ fontSize: "0.7rem" }}
                                />
                                <Chip
                                  label={notaire.email}
                                  size="small"
                                  variant="outlined"
                                  icon={<Email />}
                                  sx={{ fontSize: "0.7rem" }}
                                />
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {notaire.ville || "Niamey"}
                                {notaire.quartier && ` - ${notaire.quartier}`}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={notaire.statut === "actif" ? "Actif" : "Inactif"}
                                color={notaire.statut === "actif" ? "success" : "default"}
                                size="small"
                                onClick={() => handleToggleStatus(notaire)}
                                sx={{ cursor: "pointer", ...(notaire.statut === "actif" && { bgcolor: "#0A7C4F", color: "white", "&:hover": { bgcolor: "#086640" } }) }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Modifier">
                                <IconButton
                                  size="small"
                                  sx={{ color: "#3030F9" }}
                                  onClick={() => handleEdit(notaire)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(notaire._id)}
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
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Dialog des identifiants temporaires */}
      <Dialog
        open={credentialsDialog}
        onClose={() => setCredentialsDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogHeader
          icon={CheckCircle}
          title="Notaire créé avec succès"
          subtitle="Identifiants de connexion"
          color="#3030F9"
          onClose={() => setCredentialsDialog(false)}
        />
        <DialogContent dividers sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Identifiants temporaires
            </Typography>
            <Typography variant="body2">
              Ces identifiants doivent être communiqués au notaire. Il est recommandé de les changer à la première connexion.
            </Typography>
          </Alert>

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Email
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  value={tempCredentials?.email || ""}
                  fullWidth
                  size="small"
                  disabled
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(tempCredentials?.email || "")}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Mot de passe temporaire
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  value={tempCredentials?.password || ""}
                  fullWidth
                  size="small"
                  disabled
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(tempCredentials?.password || "")}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={() => setCredentialsDialog(false)}
            variant="contained"
            sx={{ borderRadius: 2, px: 3, bgcolor: "#3030F9", boxShadow: "none", "&:hover": { bgcolor: "#2020C8", boxShadow: "none" } }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default AdminNotaireManagementPage;

