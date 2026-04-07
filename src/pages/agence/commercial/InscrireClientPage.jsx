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
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
        {/* En-tête modernisé */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            py: 6,
            mb: 4,
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              filter: "blur(80px)",
            }}
          />
          <Container maxWidth="xl">
            <Box display="flex" alignItems="center" gap={3} position="relative" zIndex={1}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/agence/commercial/dashboard")}
                sx={{
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Retour au dashboard
              </Button>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <People sx={{ fontSize: 48, color: "white" }} />
              </Box>
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={700}
                  sx={{
                    color: "white",
                    mb: 1,
                  }}
                >
                  Gestion des Clients
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: 400,
                  }}
                >
                  Inscrivez et gérez vos clients
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ mb: 4 }}>

        {/* Alertes */}
        {success && (
          <Fade in={!!success}>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.15)",
              }} 
              onClose={() => setSuccess("")}
            >
              {success}
            </Alert>
          </Fade>
        )}
        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.15)",
              }} 
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Onglets */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            borderRadius: 3,
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                minHeight: 64,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              },
            }}
          >
            <Tab icon={<Add />} label="Inscrire un client" iconPosition="start" />
            <Tab icon={<People />} label={`Mes clients (${clients.length})`} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* ONGLET 1 : Inscription */}
        {activeTab === 0 && (
          <Box
            sx={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
              borderRadius: 3,
              p: 3,
            }}
          >
            <Card 
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(102, 126, 234, 0.2)",
                background: "white",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Stepper */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 4,
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                    borderRadius: 2,
                    border: "1px solid rgba(102, 126, 234, 0.15)",
                  }}
                >
                  <Stepper 
                    activeStep={currentStep} 
                    sx={{
                      "& .MuiStepLabel-root .Mui-completed": {
                        color: "success.main",
                      },
                      "& .MuiStepLabel-root .Mui-active": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>

                <Box component="form" onSubmit={handleSubmit}>
                {/* ÉTAPE 1 : Identité */}
                {currentStep === 0 && (
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      fontWeight={700} 
                      gutterBottom 
                      mb={3}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <AccountCircle sx={{ fontSize: 32 }} />
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      fontWeight={700} 
                      gutterBottom 
                      mb={3}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <BadgeIcon sx={{ fontSize: 32 }} />
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* ÉTAPE 3 : Adresse */}
                {currentStep === 2 && (
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      fontWeight={700} 
                      gutterBottom 
                      mb={3}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <LocationCity sx={{ fontSize: 32 }} />
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* ÉTAPE 4 : Confirmation */}
                {currentStep === 3 && (
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      fontWeight={700} 
                      gutterBottom 
                      mb={3}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 32, color: "success.main" }} />
                      Vérification des informations
                    </Typography>

                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        background: "white",
                        borderRadius: 2,
                        border: "1px solid rgba(102, 126, 234, 0.15)",
                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.1)",
                      }}
                    >
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
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, pt: 3, borderTop: 1, borderColor: "rgba(102, 126, 234, 0.1)" }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={prevStep}
                    disabled={currentStep === 0 || submitting}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                    }}
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
                        sx={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                          px: 4,
                          "&:hover": {
                            background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                            transform: "translateY(-2px)",
                          },
                          "&:disabled": {
                            background: "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
                          },
                          transition: "all 0.3s ease",
                        }}
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
                        sx={{ 
                          minWidth: 180, 
                          py: 1.5, 
                          fontSize: "1rem", 
                          fontWeight: 700,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                          borderRadius: 2,
                          textTransform: "none",
                          "&:hover": {
                            background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                            transform: "translateY(-2px)",
                          },
                          "&:disabled": {
                            background: "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        {submitting ? "Inscription..." : "Confirmer l'inscription"}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
          </Box>
        )}

        {/* ONGLET 2 : Liste des clients */}
        {activeTab === 1 && (
          <Card 
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              background: "white",
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography 
                  variant="h5" 
                  fontWeight={700}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  👥 Mes Clients ({clients.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setActiveTab(0)}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
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
                  <TableContainer 
                    component={Paper} 
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
                          }}
                        >
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
                              <TableRow 
                                key={client._id} 
                                hover
                                sx={{
                                  "&:hover": {
                                    background: "rgba(102, 126, 234, 0.04)",
                                  },
                                  transition: "background 0.2s ease",
                                }}
                              >
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <Avatar 
                                      sx={{ 
                                        width: 40, 
                                        height: 40, 
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {(client.fullName || "?").charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={600}>
                                      {client.fullName || "Sans nom"}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={client.phone} 
                                    size="small" 
                                    variant="outlined" 
                                    icon={<Phone />}
                                    sx={{
                                      fontWeight: 500,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={500}>
                                    {client.email || "-"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Switch
                                      checked={client.isActive}
                                      onChange={() => handleToggleActive(client._id, client.isActive)}
                                      color="success"
                                    />
                                    <Chip
                                      label={client.isActive ? "Actif" : "Inactif"}
                                      size="small"
                                      color={client.isActive ? "success" : "default"}
                                      sx={{
                                        fontWeight: 600,
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                      }}
                                    />
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip title="Modifier">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => openEditDialog(client)}
                                      sx={{
                                        color: "primary.main",
                                        "&:hover": {
                                          background: "rgba(102, 126, 234, 0.1)",
                                          transform: "scale(1.1)",
                                        },
                                        transition: "all 0.2s ease",
                                      }}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Supprimer">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleDelete(client._id)}
                                      sx={{
                                        color: "error.main",
                                        "&:hover": {
                                          background: "rgba(211, 47, 47, 0.1)",
                                          transform: "scale(1.1)",
                                        },
                                        transition: "all 0.2s ease",
                                      }}
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

        {/* DIALOG D'ÉDITION */}
        <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              }}
            >
              <Edit sx={{ color: "primary.main" }} />
            </Box>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              label="Téléphone"
              name="phone"
              value={editFormData.phone}
              onChange={handleEditChange}
              fullWidth
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              label="Email"
              name="email"
              value={editFormData.email}
              onChange={handleEditChange}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setEditDialog(false)} 
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained" 
            startIcon={<CheckCircle />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
        </Dialog>
        </Container>
      </Box>
    </PageLayout>
  );
};

export default InscrireClientPage;
