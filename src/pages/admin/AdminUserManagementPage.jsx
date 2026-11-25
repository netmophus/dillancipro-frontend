import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Switch,
  Stack,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  Card,
  CardContent,
  GridLegacy as Grid,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  TableContainer,
  Badge,
  Divider,
} from "@mui/material";
import {
  PersonAdd,
  Search,
  Business,
  AccountBalance,
  AccountBalanceWallet,
  CheckCircle,
  Cancel,
  Delete,
  Visibility,
  Edit,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Lock,
  People,
  ArrowBack,
  Settings,
  AttachMoney,
  Gavel,
  Person,
} from "@mui/icons-material";
import { AdminPanelSettings as FIAdminPanelSettings, Email as FIEmail } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import API from '../../api';
import AdminLayout from "../../components/admin/AdminLayout";
import FormSection from "../../components/admin/SectionCard";

// Tous les rôles disponibles pour l'admin
const roles = ["Admin", "Banque", "Agence", "Ministere", "Commercial", "Notaire", "User"];

const AdminUserManagementPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    role: "Agence",
  });

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const USERS_PER_PAGE = 10;

  const fetchUsers = async (page = 1) => {
    try {
      const res = await API.get(`/admin?page=${page}&limit=${USERS_PER_PAGE}`);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Helper pour obtenir le nom du rôle
  const getRoleName = (role) => {
    if (typeof role === 'string') return role;
    return role?.name || 'User';
  };

  // Helper pour obtenir l'icône du rôle
  const getRoleIcon = (role) => {
    const roleName = getRoleName(role);
    switch (roleName) {
      case "Admin":
        return <Settings />;
      case "Agence":
        return <Business />;
      case "Banque":
        return <AccountBalance />;
      case "Ministere":
        return <AccountBalanceWallet />;
      case "Commercial":
        return <AttachMoney />;
      case "Notaire":
        return <Gavel />;
      case "User":
      case "Client":
        return <Person />;
      default:
        return <People />;
    }
  };

  // Helper pour obtenir la couleur du rôle
  const getRoleColor = (role) => {
    const roleName = getRoleName(role);
    switch (roleName) {
      case "Admin":
        return "#0e1133";
      case "Agence":
        return "#3030F9";
      case "Banque":
        return "#0A7C4F";
      case "Ministere":
        return "#0e1133";
      case "Commercial":
        return "#3030F9";
      case "Notaire":
        return "#0A7C4F";
      case "User":
      case "Client":
        return "#607d8b";
      default:
        return "#607d8b";
    }
  };

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = users.length;
    const actifs = users.filter(u => u.isActive).length;
    const inactifs = total - actifs;
    const byRole = {
      Admin: users.filter(u => getRoleName(u.role) === "Admin").length,
      Agence: users.filter(u => getRoleName(u.role) === "Agence").length,
      Banque: users.filter(u => getRoleName(u.role) === "Banque").length,
      Ministere: users.filter(u => getRoleName(u.role) === "Ministere").length,
      Commercial: users.filter(u => getRoleName(u.role) === "Commercial").length,
      Notaire: users.filter(u => getRoleName(u.role) === "Notaire").length,
      User: users.filter(u => getRoleName(u.role) === "User").length,
      Client: users.filter(u => getRoleName(u.role) === "Client").length,
    };
    return { total, actifs, inactifs, byRole };
  }, [users]);

  // Filtrage
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      const roleValue = getRoleName(user.role);
      const matchRole = roleFilter === "Tous" || roleValue === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleCreate = async () => {
    // Validation
    if (!formData.fullName || !formData.password || !formData.role) {
      setMessage("Veuillez remplir tous les champs obligatoires");
      setSnackSeverity("warning");
      setSnackOpen(true);
      return;
    }

    // Vérifier qu'au moins phone ou email est fourni
    const phoneProvided = formData.phone && formData.phone.trim() !== "";
    const emailProvided = formData.email && formData.email.trim() !== "";
    
    if (!phoneProvided && !emailProvided) {
      setMessage("Veuillez fournir au moins un numéro de téléphone ou un email");
      setSnackSeverity("warning");
      setSnackOpen(true);
      return;
    }

    // Validation du téléphone si fourni
    if (phoneProvided && formData.phone.replace(/\D/g, "").length < 8) {
      setMessage("Le numéro de téléphone doit contenir au moins 8 chiffres");
      setSnackSeverity("warning");
      setSnackOpen(true);
      return;
    }

    // Validation de l'email si fourni
    if (emailProvided) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setMessage("Veuillez entrer une adresse email valide");
        setSnackSeverity("warning");
        setSnackOpen(true);
        return;
      }
    }

    if (formData.password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères");
      setSnackSeverity("warning");
      setSnackOpen(true);
      return;
    }

    try {
      const dataToSend = {
        fullName: formData.fullName.trim(),
        password: formData.password,
        role: formData.role,
      };
      
      // Ajouter phone ou email selon ce qui est fourni
      if (phoneProvided) {
        dataToSend.phone = formData.phone.trim();
      }
      if (emailProvided) {
        dataToSend.email = formData.email.trim();
      }
      
      await API.post("/admin/create-admin", dataToSend);
      setMessage("Utilisateur créé avec succès");
      setSnackSeverity("success");
      setSnackOpen(true);
      setFormData({ fullName: "", phone: "", email: "", password: "", role: "Agence" });
      fetchUsers(currentPage);
      // Basculer vers l'onglet liste
      setActiveTab(1);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur lors de la création");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await API.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      setMessage(currentStatus ? "Utilisateur désactivé" : "Utilisateur activé");
      setSnackSeverity("success");
      setSnackOpen(true);
      fetchUsers(currentPage);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors du changement de statut");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  return (
    <AdminLayout>
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Bouton retour */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/admin/dashboard")}
        sx={{
          mb: 2,
          color: "text.secondary",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.05)",
          },
        }}
      >
        Retour au Dashboard
      </Button>

      {/* En-tête moderne */}
      <Paper
        elevation={0}
        sx={{
          background: "#3030F9",
          p: 4,
          mb: 4,
          borderRadius: 3,
          color: "white",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 60,
              height: 60,
              backdropFilter: "blur(10px)",
            }}
          >
            <People sx={{ fontSize: 35 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Gestion des Utilisateurs
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Créez et gérez les comptes Agence, Banque et Ministère
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Total Utilisateurs", value: stats.total, color: "#3030F9", icon: People },
          { label: "Actifs", value: stats.actifs, color: "#0A7C4F", icon: CheckCircle },
          { label: "Inactifs", value: stats.inactifs, color: "#e53935", icon: Cancel },
        ].map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.label}>
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
                    <Typography variant="body2" color="text.secondary">
                      {kpi.label}
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: kpi.color, mt: 1 }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${kpi.color}15`, color: kpi.color, width: 52, height: 52 }}>
                    <kpi.icon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef", height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                Par rôle
              </Typography>
              <Stack spacing={1}>
                {[
                  { label: "Agences", value: stats.byRole.Agence, color: "#3030F9" },
                  { label: "Banques", value: stats.byRole.Banque, color: "#0A7C4F" },
                  { label: "Ministères", value: stats.byRole.Ministere, color: "#0e1133" },
                ].map((r) => (
                  <Box key={r.label} display="flex" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: r.color }} />
                      <Typography variant="body2">{r.label}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight="bold">{r.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenu principal avec onglets */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e3e8ef" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "grey.50" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                minHeight: 64,
                fontSize: "1rem",
                fontWeight: 600,
              },
            }}
          >
            <Tab icon={<PersonAdd />} iconPosition="start" label="Créer un utilisateur" />
            <Tab icon={<People />} iconPosition="start" label="Liste des utilisateurs" />
          </Tabs>
        </Box>

        {/* Onglet 1: Créer un utilisateur */}
        {activeTab === 0 && (
          <Box sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 }, "& legend": { display: "none" }, display: "flex", flexDirection: "column", gap: 3 }}>
              <FormSection icon="person" sx={{ mb: 0 }} title="Identité" color="#3030F9">
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      inputProps={{ "aria-label": "Nom complet", title: "Nom complet" }}
                      placeholder="Nom complet *"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <People color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Le nom complet de l'utilisateur"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      inputProps={{ "aria-label": "Numéro de téléphone", title: "Numéro de téléphone" }}
                      placeholder="Téléphone (+227 XX XX XX XX)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Au moins un téléphone ou un email doit être fourni"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      inputProps={{ "aria-label": "Email", title: "Email" }}
                      placeholder="Email (exemple@email.com)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIEmail color="action" />
                          </InputAdornment>
                        ),
                      }}
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      fullWidth
                      variant="outlined"
                      helperText="Au moins un téléphone ou un email doit être fourni"
                    />
                  </Grid>
                </Grid>
              </FormSection>

              <FormSection icon="lock" sx={{ mb: 0 }} title="Accès et rôle" color="#0A7C4F">
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      inputProps={{ "aria-label": "Mot de passe", title: "Mot de passe" }}
                      placeholder="Mot de passe"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Minimum 6 caractères"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      inputProps={{ "aria-label": "Rôle", title: "Rôle" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIAdminPanelSettings color="action" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Rôle</Typography>
                          </InputAdornment>
                        ),
                      }}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      fullWidth
                      variant="outlined"
                      helperText="Sélectionnez le type de compte"
                    >
                      {roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getRoleIcon(role)}
                            {role}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </FormSection>

              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCreate}
                  startIcon={<PersonAdd />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: "#3030F9",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#2020C8", boxShadow: "none" },
                  }}
                >
                  Créer l'utilisateur
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Onglet 2: Liste des utilisateurs */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Barre de recherche et filtres */}
            <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}>
              <TextField
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                label="Filtrer par rôle"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="Tous">Tous les rôles</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Tableau */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #eef2f7" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell><strong>Contact</strong></TableCell>
                    <TableCell><strong>Nom complet</strong></TableCell>
                    <TableCell><strong>Rôle</strong></TableCell>
                    <TableCell align="center"><strong>Statut</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Aucun utilisateur trouvé
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          "&:hover": { bgcolor: "grey.50" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>
                          <Box>
                            {user.phone && (
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2">{user.phone}</Typography>
                              </Box>
                            )}
                            {user.email && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {user.email}
                                </Typography>
                              </Box>
                            )}
                            {!user.phone && !user.email && (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{user.fullName || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={getRoleName(user.role)}
                            size="small"
                            sx={{
                              bgcolor: getRoleColor(user.role),
                              color: "white",
                              fontWeight: "bold",
                              "& .MuiChip-icon": { color: "white" },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {user.isActive ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Actif"
                              size="small"
                              color="success"
                              sx={{ fontWeight: "bold" }}
                            />
                          ) : (
                            <Chip
                              icon={<Cancel />}
                              label="Inactif"
                              size="small"
                              color="error"
                              sx={{ fontWeight: "bold" }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip
                            title={user.isActive ? "Désactiver" : "Activer"}
                          >
                            <Switch
                              checked={user.isActive}
                              onChange={() => toggleStatus(user._id, user.isActive)}
                              color={user.isActive ? "success" : "default"}
                            />
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Divider sx={{ my: 3 }} />
            <Box display="flex" justifyContent="center" alignItems="center">
              <Button
                variant="outlined"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                ← Précédent
              </Button>

              <Chip
                label={`Page ${currentPage} / ${totalPages}`}
                sx={{ mx: 2, fontWeight: "bold", bgcolor: "#3030F915", color: "#3030F9" }}
              />

              <Button
                variant="outlined"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                Suivant →
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackSeverity}
          onClose={() => setSnackOpen(false)}
          variant="filled"
          sx={{ minWidth: 300 }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Container>
    </AdminLayout>
  );
};

export default AdminUserManagementPage;
