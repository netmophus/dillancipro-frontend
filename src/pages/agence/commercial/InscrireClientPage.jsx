import React, { useState, useMemo, useEffect } from "react";
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
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
  Chip,
  Paper,
  CircularProgress,
  Fade,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PersonAdd,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Person,
  Phone,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Home as HomeIcon,
  LocationCity,
  Badge as BadgeIcon,
  AccountCircle,
  Edit,
  Delete,
  Add,
  People,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../../components/shared/PageLayout";
import api from "../../../services/api";

const InscrireClientPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    dateNaissance: "",
    profession: "",
    typeIdentite: "",
    numeroIdentite: "",
    adresse: "",
    ville: "",
    quartier: "",
    codePostal: "",
  });

  // Liste des clients
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // Modal d'édition
  const [editDialog, setEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const steps = ["Identité", "Informations", "Adresse", "Confirmation"];

  useEffect(() => {
    if (activeTab === 1) {
      fetchClients();
    }
  }, [activeTab]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await api.get("/agence/clients");
      setClients(res.data || []);
    } catch (err) {
      console.error("Erreur chargement clients:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validation du mot de passe
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;

    const percent = (score / 6) * 100;
    let label = "Très faible";
    let color = "error";

    if (score >= 5) {
      label = "Excellente";
      color = "success";
    } else if (score >= 4) {
      label = "Bonne";
      color = "success";
    } else if (score >= 3) {
      label = "Moyenne";
      color = "warning";
    } else if (score >= 2) {
      label = "Faible";
      color = "warning";
    }

    return { score, percent, label, color };
  }, [formData.password]);

  // Validation par étape
  const stepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        const emailValid = !formData.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        return (
          formData.fullName.trim() !== "" &&
          formData.phone.trim() !== "" &&
          emailValid &&
          formData.password.length >= 6
        );
      case 1:
      case 2:
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: "Client",
      });

      setSuccess("✅ Client inscrit avec succès !");
      
      // Reset form
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        dateNaissance: "",
        profession: "",
        typeIdentite: "",
        numeroIdentite: "",
        adresse: "",
        ville: "",
        quartier: "",
        codePostal: "",
      });
      setCurrentStep(0);
      
      // Basculer vers l'onglet liste
      setTimeout(() => {
        setActiveTab(1);
        fetchClients();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (client) => {
    setEditingClient(client);
    setEditFormData({
      fullName: client.fullName || "",
      phone: client.phone || "",
      email: client.email || "",
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/agence/clients/${editingClient._id}`, editFormData);
      setSuccess("✅ Client modifié avec succès");
      setEditDialog(false);
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification");
    }
  };

  const handleToggleActive = async (clientId, currentStatus) => {
    try {
      await api.patch(`/agence/clients/${clientId}/toggle-active`);
      setSuccess(`✅ Client ${currentStatus ? "désactivé" : "activé"} avec succès`);
      fetchClients();
    } catch (err) {
      setError("Erreur lors de la modification du statut");
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce client ?")) return;

    try {
      await api.delete(`/agence/clients/${clientId}`);
      setSuccess("✅ Client supprimé avec succès");
      fetchClients();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/agence/commercial/dashboard")}
            sx={{ mb: 2 }}
          >
            Retour au dashboard
          </Button>
          
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
              <People fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestion des Clients
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inscrivez et gérez vos clients
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
            <Tab icon={<Add />} label="Inscrire un client" iconPosition="start" />
            <Tab icon={<People />} label={`Mes clients (${clients.length})`} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* ONGLET 1 : Inscription */}
        {activeTab === 0 && (
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
                {/* ÉTAPE 1 : Identité */}
                {currentStep === 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                      <AccountCircle sx={{ verticalAlign: "middle", mr: 1 }} />
                      Informations d'identification
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          label="Nom complet"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          fullWidth
                          required
                          placeholder="Ex: Jean Dupont"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Téléphone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          fullWidth
                          required
                          placeholder="+22790210027"
                          helperText="Format: +XXX ou numéro local"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Email (optionnel)"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          fullWidth
                          placeholder="client@exemple.com"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Mot de passe"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          fullWidth
                          required
                          helperText="Minimum 6 caractères"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title={showPassword ? "Masquer" : "Afficher"}>
                                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            ),
                          }}
                        />
                        
                        {formData.password && (
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={passwordStrength.percent}
                              color={passwordStrength.color}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                              Force du mot de passe : <strong>{passwordStrength.label}</strong>
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* ÉTAPE 2 : Informations complémentaires */}
                {currentStep === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                      <BadgeIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                      Informations complémentaires (optionnel)
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Date de naissance"
                          name="dateNaissance"
                          type="date"
                          value={formData.dateNaissance}
                          onChange={handleChange}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Profession"
                          name="profession"
                          value={formData.profession}
                          onChange={handleChange}
                          fullWidth
                          placeholder="Ex: Enseignant, Commerçant..."
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          label="Type de pièce d'identité"
                          name="typeIdentite"
                          value={formData.typeIdentite}
                          onChange={handleChange}
                          fullWidth
                        >
                          <MenuItem value="">Non spécifié</MenuItem>
                          <MenuItem value="CNI">Carte Nationale d'Identité</MenuItem>
                          <MenuItem value="PASSPORT">Passeport</MenuItem>
                          <MenuItem value="PERMIS">Permis de conduire</MenuItem>
                          <MenuItem value="AUTRE">Autre</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Numéro de pièce"
                          name="numeroIdentite"
                          value={formData.numeroIdentite}
                          onChange={handleChange}
                          fullWidth
                          placeholder="Ex: CI123456789"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* ÉTAPE 3 : Adresse */}
                {currentStep === 2 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                      <LocationCity sx={{ verticalAlign: "middle", mr: 1 }} />
                      Adresse (optionnel)
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          label="Adresse complète"
                          name="adresse"
                          value={formData.adresse}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Rue, numéro, bâtiment..."
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <HomeIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Ville"
                          name="ville"
                          value={formData.ville}
                          onChange={handleChange}
                          fullWidth
                          placeholder="Ex: Niamey"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationCity color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Quartier"
                          name="quartier"
                          value={formData.quartier}
                          onChange={handleChange}
                          fullWidth
                          placeholder="Ex: Zone 1"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Code postal"
                          name="codePostal"
                          value={formData.codePostal}
                          onChange={handleChange}
                          fullWidth
                          placeholder="Ex: 01 BP 1234"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* ÉTAPE 4 : Confirmation */}
                {currentStep === 3 && (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                      <CheckCircle sx={{ verticalAlign: "middle", mr: 1, color: "success.main" }} />
                      Vérification des informations
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 3, bgcolor: "grey.50" }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">Nom complet</Typography>
                          <Typography variant="body1" fontWeight="bold">{formData.fullName || "-"}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                          <Typography variant="body1" fontWeight="bold">{formData.phone || "-"}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{formData.email || "-"}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Alert severity="info" sx={{ mt: 3 }}>
                      Vérifiez les informations avant de confirmer l'inscription.
                    </Alert>
                  </Box>
                )}

                {/* Navigation */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={prevStep}
                    disabled={currentStep === 0 || submitting}
                  >
                    Précédent
                  </Button>

                  <Box display="flex" gap={2}>
                    {currentStep < steps.length - 1 ? (
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward />}
                        onClick={nextStep}
                        disabled={!stepValid}
                      >
                        Suivant
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={submitting || !stepValid}
                        startIcon={
                          submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />
                        }
                        sx={{ minWidth: 180, py: 1.5, fontSize: "1rem", fontWeight: "bold" }}
                      >
                        {submitting ? "Inscription..." : "Confirmer l'inscription"}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ONGLET 2 : Liste des clients */}
        {activeTab === 1 && (
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  👥 Mes Clients ({clients.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setActiveTab(0)}
                >
                  Nouveau client
                </Button>
              </Box>

              {loadingClients ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead sx={{ bgcolor: "grey.100" }}>
                        <TableRow>
                          <TableCell><strong>Client</strong></TableCell>
                          <TableCell><strong>Téléphone</strong></TableCell>
                          <TableCell><strong>Email</strong></TableCell>
                          <TableCell><strong>Statut</strong></TableCell>
                          <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                              <Typography color="text.secondary">
                                Aucun client inscrit
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          clients
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((client) => (
                              <TableRow key={client._id} hover>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                      {(client.fullName || "?").charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight="bold">
                                      {client.fullName || "Sans nom"}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip label={client.phone} size="small" variant="outlined" icon={<Phone />} />
                                </TableCell>
                                <TableCell>{client.email || "-"}</TableCell>
                                <TableCell>
                                  <Switch
                                    checked={client.isActive}
                                    onChange={() => handleToggleActive(client._id, client.isActive)}
                                    color="success"
                                  />
                                  <Chip
                                    label={client.isActive ? "Actif" : "Inactif"}
                                    size="small"
                                    color={client.isActive ? "success" : "default"}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip title="Modifier">
                                    <IconButton size="small" color="primary" onClick={() => openEditDialog(client)}>
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Supprimer">
                                    <IconButton size="small" color="error" onClick={() => handleDelete(client._id)}>
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
                    count={clients.length}
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

      {/* DIALOG D'ÉDITION */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Edit color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Modifier le client
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 2 }}>
            <TextField
              label="Nom complet"
              name="fullName"
              value={editFormData.fullName}
              onChange={handleEditChange}
              fullWidth
              required
            />
            <TextField
              label="Téléphone"
              name="phone"
              value={editFormData.phone}
              onChange={handleEditChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              value={editFormData.email}
              onChange={handleEditChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditDialog(false)} variant="outlined">
            Annuler
          </Button>
          <Button onClick={handleUpdate} variant="contained" startIcon={<CheckCircle />}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default InscrireClientPage;
