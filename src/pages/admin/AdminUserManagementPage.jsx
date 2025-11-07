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
  Grid,
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
  Lock,
  People,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import API from '../../api';

const roles = ["Agence", "Banque", "Ministere"];

const AdminUserManagementPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
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
      case "Agence":
        return <Business />;
      case "Banque":
        return <AccountBalance />;
      case "Ministere":
        return <AccountBalanceWallet />;
      default:
        return <People />;
    }
  };

  // Helper pour obtenir la couleur du rôle
  const getRoleColor = (role) => {
    const roleName = getRoleName(role);
    switch (roleName) {
      case "Agence":
        return "#2196f3";
      case "Banque":
        return "#4caf50";
      case "Ministere":
        return "#ff9800";
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
      Agence: users.filter(u => getRoleName(u.role) === "Agence").length,
      Banque: users.filter(u => getRoleName(u.role) === "Banque").length,
      Ministere: users.filter(u => getRoleName(u.role) === "Ministere").length,
    };
    return { total, actifs, inactifs, byRole };
  }, [users]);

  // Filtrage
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      const roleValue = getRoleName(user.role);
      const matchRole = roleFilter === "Tous" || roleValue === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleCreate = async () => {
    // Validation
    if (!formData.fullName || !formData.phone || !formData.password || !formData.role) {
      setMessage("Veuillez remplir tous les champs");
      setSnackSeverity("warning");
      setSnackOpen(true);
      return;
    }

    if (formData.phone.length < 8) {
      setMessage("Le numéro de téléphone doit contenir au moins 8 chiffres");
      setSnackSeverity("warning");
      setSnackOpen(true);
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères");
      setSnackSeverity("warning");
      setSnackOpen(true);
      return;
    }

    try {
      await API.post("/admin/create-admin", formData);
      setMessage("✅ Utilisateur créé avec succès");
      setSnackSeverity("success");
      setSnackOpen(true);
      setFormData({ fullName: "", phone: "", password: "", role: "Agence" });
      fetchUsers(currentPage);
      // Basculer vers l'onglet liste
      setActiveTab(1);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Erreur lors de la création");
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 3,
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Utilisateurs
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" mt={1}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <People sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              color: "white",
              borderRadius: 3,
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Actifs
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" mt={1}>
                    {stats.actifs}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <CheckCircle sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
              color: "white",
              borderRadius: 3,
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Inactifs
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" mt={1}>
                    {stats.inactifs}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <Cancel sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%, #2BFF88 100%)",
              color: "white",
              borderRadius: 3,
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Par Rôle
                </Typography>
                <Stack spacing={0.5}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption">Agences</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {stats.byRole.Agence}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption">Banques</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {stats.byRole.Banque}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption">Ministères</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {stats.byRole.Ministere}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenu principal avec onglets */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
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
          <Box sx={{ p: 4 }}>
            <Stack spacing={3} maxWidth={600}>
              <Typography variant="h6" color="primary" gutterBottom>
                📝 Nouveau compte utilisateur
              </Typography>

              <TextField
                label="Nom complet"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                fullWidth
                variant="outlined"
                placeholder="Ex: Jean Dupont"
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

              <TextField
                label="Numéro de téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
                variant="outlined"
                placeholder="+227 XX XX XX XX"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                helperText="Format international recommandé (ex: +227 90123456)"
              />

              <TextField
                label="Mot de passe"
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

              <TextField
                select
                label="Rôle"
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

              <Button
                variant="contained"
                size="large"
                onClick={handleCreate}
                startIcon={<PersonAdd />}
                sx={{
                  py: 1.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                Créer l'utilisateur
              </Button>
            </Stack>
          </Box>
        )}

        {/* Onglet 2: Liste des utilisateurs */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Barre de recherche et filtres */}
            <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                placeholder="Rechercher par téléphone..."
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell><strong>Téléphone</strong></TableCell>
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
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            {user.phone}
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
                sx={{ mx: 1 }}
              >
                ← Précédent
              </Button>

              <Chip
                label={`Page ${currentPage} / ${totalPages}`}
                color="primary"
                sx={{ mx: 2, fontWeight: "bold" }}
              />

              <Button
                variant="outlined"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                sx={{ mx: 1 }}
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
  );
};

export default AdminUserManagementPage;
