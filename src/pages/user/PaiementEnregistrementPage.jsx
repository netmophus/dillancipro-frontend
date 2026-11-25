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
  Stack,
  Chip,
} from "@mui/material";
import {
  AttachMoney,
  ArrowBack,
  CheckCircle,
  CreditCard,
  Phone,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import ClientLayout from "../../components/client/ClientLayout";
import api from "../../services/api";

const PaiementEnregistrementPage = () => {
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
      // Récupérer le bien
      const bienRes = await api.get(`/client/patrimoine/${id}`);
      setBien(bienRes.data);

      // Récupérer le tarif
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
      const res = await api.post("/patrimoine/paiements/initier", {
        patrimoineId: id,
        methodePaiement,
      });

      setSuccess(`Paiement initié ! Référence : ${res.data.paiement.reference}`);

      // TODO: Intégrer API paiement mobile (CinetPay, etc.)
      // Rediriger vers page de paiement

      setTimeout(() => {
        navigate("/user/mon-patrimoine");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'initiation du paiement");
    } finally {
      setProcessing(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  if (loading) {
    return (
      <ClientLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} />
        </Box>
      </ClientLayout>
    );
  }

  if (!bien || !tarif) {
    return (
      <ClientLayout>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="error">Bien ou tarif non trouvé</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/user/mon-patrimoine")} sx={{ mt: 2 }}>
            Retour
          </Button>
        </Container>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/user/mon-patrimoine")} sx={{ mb: 3 }}>
          Retour à mon patrimoine
        </Button>

        {/* Alertes */}
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

        {/* Card principale */}
        <Card
          elevation={3}
          sx={{
            background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 55%, #27AE60 165%)",
            color: "white",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ bgcolor: "white", color: "primary.main", width: 64, height: 64 }}>
                <AttachMoney fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Paiement d'enregistrement
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Paiement unique pour ajouter votre bien
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Informations du bien */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Informations du bien
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Titre
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {bien.titre}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1">
                  <Chip label={bien.type} size="small" color="primary" />
                </Typography>
              </Grid>

              {bien.superficie && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Superficie
                  </Typography>
                  <Typography variant="body1">{bien.superficie} m²</Typography>
                </Grid>
              )}

              {bien.valeurEstimee && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Valeur estimée
                  </Typography>
                  <Typography variant="body1">{formatMoney(bien.valeurEstimee)}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Montant à payer */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 3,
            bgcolor: "success.light",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Montant à payer
          </Typography>
          <Typography variant="h3" fontWeight="bold" color="success.main">
            {formatMoney(tarif.montantEnregistrement)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Paiement UNIQUE - Pas de renouvellement
          </Typography>
        </Paper>

        {/* Méthode de paiement */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Méthode de paiement
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Choisissez votre mode de paiement
            </Typography>

            <TextField
              select
              label="Méthode de paiement"
              value={methodePaiement}
              onChange={(e) => setMethodePaiement(e.target.value)}
              fullWidth
            >
              <MenuItem value="orange_money">Orange Money</MenuItem>
              <MenuItem value="moov_money">Moov Money</MenuItem>
              <MenuItem value="airtel_money">Airtel Money</MenuItem>
              <MenuItem value="zamani">Zamani</MenuItem>
              <MenuItem value="especes">Espèces</MenuItem>
            </TextField>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Instructions :</strong>
              </Typography>
              <Typography variant="body2">
                1. Cliquez sur "Payer maintenant"
              </Typography>
              <Typography variant="body2">
                2. Suivez les instructions de paiement mobile
              </Typography>
              <Typography variant="body2">
                3. Votre bien sera activé après validation
              </Typography>
            </Alert>
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
            background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 55%, #27AE60 165%)",
          }}
        >
          {processing ? "Traitement en cours..." : `Payer ${formatMoney(tarif.montantEnregistrement)}`}
        </Button>
      </Container>
    </ClientLayout>
  );
};

export default PaiementEnregistrementPage;

