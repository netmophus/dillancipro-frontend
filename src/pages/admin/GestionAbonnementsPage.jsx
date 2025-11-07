import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Tabs,
  Tab,
  InputAdornment,
  MenuItem,
  Stack,
  LinearProgress,
} from "@mui/material";
import {
  Warning,
  CheckCircle,
  Cancel,
  Refresh,
  Phone,
  Block,
  RestartAlt,
  AttachMoney,
  Search,
  Timer,
  ArrowBack,
  Assignment,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const GestionAbonnementsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    expires: 0,
    expireSous30jours: 0,
    desactives: 0,
  });

  const [biensExpires, setBiensExpires] = useState([]);
  const [biensExpireBientot, setBiensExpireBientot] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialogs
  const [desactiverDialog, setDesactiverDialog] = useState(false);
  const [reactiverDialog, setReactiverDialog] = useState(false);
  const [paiementDialog, setPaiementDialog] = useState(false);
  const [selectedBien, setSelectedBien] = useState(null);

  // Form data
  const [motifDesactivation, setMotifDesactivation] = useState("");
  const [paiementData, setPaiementData] = useState({
    montant: "",
    methodePaiement: "orange_money",
    transactionId: "",
  });

  const [validerAbonnementDialog, setValiderAbonnementDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Stats
      const statsRes = await api.get("/admin/patrimoine/abonnements/stats");
      setStats(statsRes.data);

      // Biens expirés
      if (activeTab === 0) {
        const expiresRes = await api.get("/admin/patrimoine/abonnements/expires");
        setBiensExpires(expiresRes.data);
      }

      // Biens expire bientôt
      if (activeTab === 1) {
        const bientotRes = await api.get("/admin/patrimoine/abonnements/expire-bientot?jours=30");
        setBiensExpireBientot(bientotRes.data);
      }
    } catch (err) {
      console.error("Erreur chargement:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const openDesactiverDialog = (bien) => {
    setSelectedBien(bien);
    setMotifDesactivation("Abonnement annuel non renouvelé");
    setDesactiverDialog(true);
  };

  const openReactiverDialog = (bien) => {
    setSelectedBien(bien);
    setReactiverDialog(true);
  };

  const openPaiementDialog = (bien) => {
    setSelectedBien(bien);
    setPaiementData({
      montant: "",
      methodePaiement: "orange_money",
      transactionId: "",
    });
    setPaiementDialog(true);
  };

  const handleDesactiver = async () => {
    try {
      await api.post(`/admin/patrimoine/abonnements/${selectedBien._id}/desactiver`, {
        motifDesactivation,
      });

      setSuccess(`✅ Bien "${selectedBien.titre}" désactivé avec succès`);
      setDesactiverDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la désactivation");
    }
  };

  const handleReactiver = async () => {
    try {
      await api.post(`/admin/patrimoine/abonnements/${selectedBien._id}/reactiver`);

      setSuccess(`✅ Bien "${selectedBien.titre}" réactivé avec succès`);
      setReactiverDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la réactivation");
    }
  };

  const handlePaiementAbonnement = async () => {
    try {
      if (!paiementData.montant) {
        setError("Montant requis");
        return;
      }

      await api.post(`/admin/patrimoine/abonnements/${selectedBien._id}/payer-abonnement`, {
        montant: parseFloat(paiementData.montant),
        methodePaiement: paiementData.methodePaiement,
        transactionId: paiementData.transactionId,
      });

      setSuccess(`✅ Paiement d'abonnement enregistré pour "${selectedBien.titre}"`);
      setPaiementDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement du paiement");
    }
  };

  const openValiderAbonnementDialog = (bien) => {
    setSelectedBien(bien);
    setValiderAbonnementDialog(true);
  };

  const handleValiderAbonnement = async () => {
    try {
      await api.put(`/admin/patrimoine/abonnements/${selectedBien._id}/abonnement-valider`);
      setSuccess(`✅ Abonnement activé pour "${selectedBien.titre}"`);
      setValiderAbonnementDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'activation de l'abonnement");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const joursRestants = (dateExpiration) => {
    if (!dateExpiration) return 0;
    const diff = new Date(dateExpiration) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredExpires = biensExpires.filter(
    (bien) =>
      bien.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.clientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.clientId?.phone?.includes(searchTerm)
  );

  const filteredBientot = biensExpireBientot.filter(
    (bien) =>
      bien.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.clientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.clientId?.phone?.includes(searchTerm)
  );

  const KPICard = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        transition: "all 0.3s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color} sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56, ml: 2 }}>
            <Icon fontSize="large" />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && activeTab === 0 && biensExpires.length === 0) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/admin/dashboard")} sx={{ mb: 2 }}>
            Retour au dashboard
          </Button>

          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "warning.main", width: 64, height: 64 }}>
              <Timer fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestion des Abonnements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gérez les renouvellements et désactivations manuelles
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Alertes */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* KPIs */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard title="Total Biens" value={stats.total} icon={Assignment} color="#2196f3" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard
              title="Actifs"
              value={stats.actifs}
              subtitle="Abonnement valide"
              icon={CheckCircle}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard
              title="Expirés"
              value={stats.expires}
              subtitle="À traiter"
              icon={Warning}
              color="#f44336"
              onClick={() => setActiveTab(0)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard
              title="Expire < 30j"
              value={stats.expireSous30jours}
              subtitle="Relancer"
              icon={Timer}
              color="#ff9800"
              onClick={() => setActiveTab(1)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard
              title="Désactivés"
              value={stats.desactives}
              subtitle="Invisibles"
              icon={Cancel}
              color="#9e9e9e"
            />
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
            <Tab icon={<Warning />} label={`Expirés (${stats.expires})`} iconPosition="start" />
            <Tab icon={<Timer />} label={`Expire bientôt (${stats.expireSous30jours})`} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Barre de recherche */}
        <TextField
          fullWidth
          placeholder="Rechercher par titre, propriétaire ou téléphone..."
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

        {/* ONGLET 1 : Biens expirés */}
        {activeTab === 0 && (
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  ⚠️ Abonnements expirés ({filteredExpires.length})
                </Typography>
                <Button startIcon={<Refresh />} onClick={fetchData} variant="outlined">
                  Actualiser
                </Button>
              </Box>

              {filteredExpires.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
                  <Typography color="text.secondary">Aucun abonnement expiré !</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bien</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Propriétaire</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Date expiration</TableCell>
                        <TableCell>Jours écoulés</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredExpires.map((bien) => (
                        <TableRow key={bien._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {bien.titre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={bien.type} size="small" color="primary" />
                          </TableCell>
                          <TableCell>{bien.clientId?.fullName || "N/A"}</TableCell>
                          <TableCell>
                            <Typography variant="caption">{bien.clientId?.phone}</Typography>
                          </TableCell>
                          <TableCell>{formatDate(bien.dateExpirationAbonnement)}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${Math.abs(joursRestants(bien.dateExpirationAbonnement))} jours`}
                              size="small"
                              color="error"
                            />
                          </TableCell>
                          <TableCell>
                            {bien.visible ? (
                              <Chip label="Visible" size="small" color="success" />
                            ) : (
                              <Chip label="Désactivé" size="small" color="default" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="Contacter le client">
                                <IconButton
                                  size="small"
                                  color="info"
                                  href={`tel:${bien.clientId?.phone}`}
                                >
                                  <Phone />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Enregistrer paiement en ligne">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => openPaiementDialog(bien)}
                                >
                                  <AttachMoney />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Valider paiement en espèces">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => openValiderAbonnementDialog(bien)}
                                >
                                  ✓
                                </IconButton>
                              </Tooltip>
                              {bien.visible ? (
                                <Tooltip title="Désactiver">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => openDesactiverDialog(bien)}
                                  >
                                    <Block />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Réactiver">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => openReactiverDialog(bien)}
                                  >
                                    <RestartAlt />
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
        )}

        {/* ONGLET 2 : Expire bientôt */}
        {activeTab === 1 && (
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  ⏰ Expire sous 30 jours ({filteredBientot.length})
                </Typography>
                <Button startIcon={<Refresh />} onClick={fetchData} variant="outlined">
                  Actualiser
                </Button>
              </Box>

              {filteredBientot.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
                  <Typography color="text.secondary">Aucun abonnement proche de l'expiration</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bien</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Propriétaire</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Date expiration</TableCell>
                        <TableCell>Jours restants</TableCell>
                        <TableCell>Urgence</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBientot.map((bien) => {
                        const jours = joursRestants(bien.dateExpirationAbonnement);
                        const urgence = jours <= 7 ? "error" : jours <= 15 ? "warning" : "info";

                        return (
                          <TableRow key={bien._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {bien.titre}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={bien.type} size="small" color="primary" />
                            </TableCell>
                            <TableCell>{bien.clientId?.fullName || "N/A"}</TableCell>
                            <TableCell>
                              <Typography variant="caption">{bien.clientId?.phone}</Typography>
                            </TableCell>
                            <TableCell>{formatDate(bien.dateExpirationAbonnement)}</TableCell>
                            <TableCell>
                              <Chip label={`${jours} jours`} size="small" color={urgence} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ width: 100 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={((30 - jours) / 30) * 100}
                                  color={urgence}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Contacter le client">
                                <IconButton
                                  size="small"
                                  color="info"
                                  href={`tel:${bien.clientId?.phone}`}
                                >
                                  <Phone />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      {/* DIALOG : Désactiver */}
      <Dialog open={desactiverDialog} onClose={() => setDesactiverDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚠️ Désactiver le bien</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Vous êtes sur le point de désactiver :
          </Typography>
          <Typography variant="h6" gutterBottom>
            {selectedBien?.titre}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Propriétaire : {selectedBien?.clientId?.fullName} ({selectedBien?.clientId?.phone})
          </Typography>

          <TextField
            label="Motif de désactivation"
            value={motifDesactivation}
            onChange={(e) => setMotifDesactivation(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDesactiverDialog(false)}>Annuler</Button>
          <Button
            onClick={handleDesactiver}
            variant="contained"
            color="error"
            startIcon={<Block />}
          >
            Désactiver
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Réactiver */}
      <Dialog open={reactiverDialog} onClose={() => setReactiverDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>✅ Réactiver le bien</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Réactiver le bien suivant :
          </Typography>
          <Typography variant="h6">{selectedBien?.titre}</Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            Le bien redeviendra visible après réactivation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReactiverDialog(false)}>Annuler</Button>
          <Button
            onClick={handleReactiver}
            variant="contained"
            color="success"
            startIcon={<RestartAlt />}
          >
            Réactiver
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Paiement abonnement */}
      <Dialog open={paiementDialog} onClose={() => setPaiementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>💰 Enregistrer paiement d'abonnement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Bien : <strong>{selectedBien?.titre}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Propriétaire : {selectedBien?.clientId?.fullName}
          </Typography>

          <TextField
            label="Montant"
            type="number"
            value={paiementData.montant}
            onChange={(e) => setPaiementData({ ...paiementData, montant: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
            }}
          />

          <TextField
            select
            label="Méthode de paiement"
            value={paiementData.methodePaiement}
            onChange={(e) => setPaiementData({ ...paiementData, methodePaiement: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="orange_money">Orange Money</MenuItem>
            <MenuItem value="moov_money">Moov Money</MenuItem>
            <MenuItem value="airtel_money">Airtel Money</MenuItem>
            <MenuItem value="zamani">Zamani</MenuItem>
            <MenuItem value="especes">Espèces</MenuItem>
            <MenuItem value="virement">Virement</MenuItem>
          </TextField>

          <TextField
            label="ID Transaction (optionnel)"
            value={paiementData.transactionId}
            onChange={(e) => setPaiementData({ ...paiementData, transactionId: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaiementDialog(false)}>Annuler</Button>
          <Button
            onClick={handlePaiementAbonnement}
            variant="contained"
            color="success"
            startIcon={<AttachMoney />}
          >
            Enregistrer paiement
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Valider abonnement en espèces */}
      <Dialog open={validerAbonnementDialog} onClose={() => setValiderAbonnementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>💰 Valider le paiement d'abonnement en espèces</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Bien : <strong>{selectedBien?.titre}</strong>
          </Typography>
          <Typography variant="body2" mb={2}>
            Propriétaire : <strong>{selectedBien?.clientId?.fullName}</strong>
          </Typography>
          <Typography variant="body2" color="success.main" mb={2}>
            L'abonnement sera activé pour 1 an à partir de maintenant.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Cette action valide que le propriétaire a payé l'abonnement annuel en espèces.
              L'abonnement sera actif pendant 1 an.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValiderAbonnementDialog(false)}>Annuler</Button>
          <Button onClick={handleValiderAbonnement} variant="contained" color="success" startIcon={<CheckCircle />}>
            Valider le paiement
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default GestionAbonnementsPage;

