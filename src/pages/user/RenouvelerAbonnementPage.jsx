import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  Divider,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  AttachMoney,
  ArrowBack,
  CheckCircle,
  CalendarMonth,
  History,
  Timer,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const RenouvelerAbonnementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bien, setBien] = useState(null);
  const [tarif, setTarif] = useState(null);
  const [methodePaiement, setMethodePaiement] = useState("orange_money");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bienRes = await api.get(`/client/patrimoine/${id}`);
      setBien(bienRes.data);

      const tarifRes = await api.get(`/admin/tarifs/${bienRes.data.type}`);
      setTarif(tarifRes.data);
    } catch (err) {
      setError("Erreur lors du chargement des informations");
    } finally {
      setLoading(false);
    }
  };

  const handlePaiement = async () => {
    setProcessing(true);
    setError("");
    try {
      // TODO: Intégrer API paiement mobile
      setSuccess(`✅ Paiement initié ! Contactez Softlink pour finaliser.`);

      setTimeout(() => {
        navigate("/user/mon-patrimoine");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    } finally {
      setProcessing(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const joursRestants = (dateExpiration) => {
    if (!dateExpiration) return 0;
    const diff = new Date(dateExpiration) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} />
        </Box>
      </PageLayout>
    );
  }

  if (!bien || !tarif) {
    return (
      <PageLayout>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="error">Bien ou tarif non trouvé</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/user/mon-patrimoine")} sx={{ mt: 2 }}>
            Retour
          </Button>
        </Container>
      </PageLayout>
    );
  }

  const jours = joursRestants(bien.dateExpirationAbonnement);
  const expire = jours < 0;

  return (
    <PageLayout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/user/mon-patrimoine")} sx={{ mb: 3 }}>
          Retour à mon patrimoine
        </Button>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* En-tête */}
        <Card
          elevation={3}
          sx={{
            background: expire
              ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "white", color: "primary.main", width: 64, height: 64 }}>
                <CalendarMonth fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Renouvellement d'abonnement annuel
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {expire ? "⚠️ Votre abonnement a expiré" : "Renouvelez pour 1 an"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Statut abonnement */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 Statut de l'abonnement
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Bien concerné
                </Typography>
                <Typography variant="h6">{bien.titre}</Typography>
                <Chip label={bien.type} size="small" color="primary" sx={{ mt: 1 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Statut actuel
                </Typography>
                <Box mt={1}>
                  {bien.abonnementStatut === "actif" && (
                    <Chip label="✓ Actif" color="success" />
                  )}
                  {bien.abonnementStatut === "expire" && (
                    <Chip label="⚠️ Expiré" color="error" />
                  )}
                  {bien.abonnementStatut === "en_attente" && (
                    <Chip label="En attente" color="warning" />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Date d'expiration
                </Typography>
                <Typography variant="body1" color={expire ? "error.main" : "text.primary"}>
                  {formatDate(bien.dateExpirationAbonnement)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  {expire ? "Expiré depuis" : "Jours restants"}
                </Typography>
                <Typography variant="h6" color={expire ? "error.main" : "success.main"}>
                  {Math.abs(jours)} jours
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Historique */}
        {bien.historiqueAbonnements && bien.historiqueAbonnements.length > 0 && (
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <History sx={{ verticalAlign: "middle", mr: 1 }} />
                Historique des paiements
              </Typography>
              <Divider sx={{ my: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bien.historiqueAbonnements.map((paiement, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(paiement.datePaiement)}</TableCell>
                        <TableCell align="right">{formatMoney(paiement.montant)}</TableCell>
                        <TableCell>
                          <Chip label="Payé ✓" size="small" color="success" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Montant à payer */}
        <Paper elevation={3} sx={{ p: 4, mb: 3, bgcolor: "warning.light", textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Montant du renouvellement
          </Typography>
          <Typography variant="h3" fontWeight="bold" color="warning.main">
            {formatMoney(tarif.montantAbonnementAnnuel)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Valable 1 an à partir du paiement
          </Typography>
        </Paper>

        {/* Méthode de paiement */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Méthode de paiement
            </Typography>

            <TextField
              select
              label="Choisissez votre méthode"
              value={methodePaiement}
              onChange={(e) => setMethodePaiement(e.target.value)}
              fullWidth
            >
              <MenuItem value="orange_money">🟠 Orange Money</MenuItem>
              <MenuItem value="moov_money">🔵 Moov Money</MenuItem>
              <MenuItem value="airtel_money">🔴 Airtel Money</MenuItem>
              <MenuItem value="zamani">🟢 Zamani</MenuItem>
              <MenuItem value="especes">💵 Espèces (à payer chez Softlink)</MenuItem>
            </TextField>
          </CardContent>
        </Card>

        {/* Bouton paiement */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
          onClick={handlePaiement}
          disabled={processing}
          sx={{
            py: 2,
            fontSize: "1.1rem",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          }}
        >
          {processing ? "Traitement..." : `Renouveler pour ${formatMoney(tarif.montantAbonnementAnnuel)}`}
        </Button>
      </Container>
    </PageLayout>
  );
};

export default RenouvelerAbonnementPage;

