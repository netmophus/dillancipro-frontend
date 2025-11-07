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
} from "@mui/icons-material";

import API from "../../api";
import PageLayout from "../../components/shared/PageLayout";
import { useNavigate } from "react-router-dom";

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
      
      setSuccess("✅ Notaire créé avec succès !");
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
      setError(err.response?.data?.message || "❌ Erreur lors de la création");
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
      
      setSuccess("✅ Notaire mis à jour avec succès");
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
      setError(err.response?.data?.message || "❌ Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce notaire ?")) return;

    setLoading(true);
    try {
      await API.delete(`/admin/notaires/${id}`);
      setSuccess("✅ Notaire supprimé avec succès");
      fetchNotaires();
    } catch (err) {
      console.error("Erreur suppression notaire:", err);
      setError(err.response?.data?.message || "❌ Erreur lors de la suppression");
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
      setSuccess(`✅ Notaire ${newStatut === "actif" ? "activé" : "désactivé"} avec succès`);
      fetchNotaires();
    } catch (err) {
      console.error("Erreur changement statut:", err);
      setError(err.response?.data?.message || "❌ Erreur lors du changement de statut");
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
          
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
              <Gavel fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestion des Notaires Partenaires
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Créez et gérez les notaires partenaires de la plateforme
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
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom mb={3}>
                {editingNotaire ? "✏️ Modifier le notaire" : "➕ Créer un nouveau notaire"}
              </Typography>

              <Box component="form" onSubmit={editingNotaire ? handleUpdate : handleSubmit}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Informations personnelles
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="fullName"
                      label="Nom complet"
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
                      label="Email"
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
                      label="Téléphone"
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
                        label="Mot de passe (optionnel)"
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

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="cabinetName"
                      label="Nom du cabinet"
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

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Adresse du cabinet
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

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="ville"
                      label="Ville"
                      value={formData.ville}
                      onChange={handleChange}
                      fullWidth
                      defaultValue="Niamey"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="quartier"
                      label="Quartier"
                      value={formData.quartier}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Notes (optionnel)
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12}>
                    <TextField
                      name="notes"
                      label="Notes"
                      value={formData.notes}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Notes additionnelles sur ce notaire..."
                    />
                  </Grid>
                </Grid>

                <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
                  {editingNotaire && (
                    <Button
                      variant="outlined"
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
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                  >
                    {loading
                      ? "Enregistrement..."
                      : editingNotaire
                      ? "Enregistrer les modifications"
                      : "Créer le notaire"}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ONGLET 2 : Liste des notaires */}
        {activeTab === 1 && (
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  👥 Liste des Notaires ({filteredNotaires.length})
                </Typography>
                <Box display="flex" gap={2}>
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
                    sx={{ width: 300 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
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
                <TableContainer component={Paper} variant="outlined">
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
                                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
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
                                sx={{ cursor: "pointer" }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Modifier">
                                <IconButton
                                  size="small"
                                  color="primary"
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
      <Dialog open={credentialsDialog} onClose={() => setCredentialsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            <Typography variant="h6" fontWeight="bold">
              Notaire créé avec succès
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              ⚠️ Important : Identifiants temporaires
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
        <DialogActions>
          <Button onClick={() => setCredentialsDialog(false)} variant="contained">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default AdminNotaireManagementPage;

