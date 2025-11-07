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
  Paper,
  InputAdornment,
  Chip,
  Stack,
} from "@mui/material";
import {
  Gavel,
  ArrowBack,
  CheckCircle,
  AttachMoney,
  Calculate,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const SoumettreVentePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bien, setBien] = useState(null);
  const [tarif, setTarif] = useState(null);
  const [prixVente, setPrixVente] = useState("");
  const [commissionMontant, setCommissionMontant] = useState(0);
  const [commissionPourcentage, setCommissionPourcentage] = useState(0);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (prixVente && commissionPourcentage) {
      const montant = (parseFloat(prixVente) * commissionPourcentage) / 100;
      setCommissionMontant(montant);
    } else {
      setCommissionMontant(0);
    }
  }, [prixVente, commissionPourcentage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bienRes = await api.get(`/client/patrimoine/${id}`);
      setBien(bienRes.data);

      const tarifRes = await api.get(`/admin/tarifs/${bienRes.data.type}`);
      setTarif(tarifRes.data);
      setCommissionPourcentage(tarifRes.data.commissionVente);
    } catch (err) {
      setError("Erreur lors du chargement des informations");
    } finally {
      setLoading(false);
    }
  };

  const handleSoumettre = async () => {
    if (!prixVente || parseFloat(prixVente) <= 0) {
      setError("Prix de vente requis");
      return;
    }

    setProcessing(true);
    setError("");
    try {
      await api.post("/patrimoine/ventes/soumettre", {
        patrimoineId: id,
        prixVente: parseFloat(prixVente),
      });

      setSuccess(`✅ Vente soumise avec succès ! En attente de validation par Softlink.`);

      setTimeout(() => {
        navigate("/user/mon-patrimoine");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la soumission");
    } finally {
      setProcessing(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
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

  if (bien.soumiseVente) {
    return (
      <PageLayout>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="warning">Ce bien est déjà soumis à la vente.</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/user/mon-patrimoine")} sx={{ mt: 2 }}>
            Retour
          </Button>
        </Container>
      </PageLayout>
    );
  }

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
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "white", color: "primary.main", width: 64, height: 64 }}>
                <Gavel fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Soumettre à la vente via Softlink
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Confiez la vente de votre bien à notre équipe
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
              <Grid item xs={12}>
                <Typography variant="h6">{bien.titre}</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={bien.type} size="small" color="primary" />
                  {bien.statutVerification === "verifie" && (
                    <Chip label="✓ Vérifié" size="small" color="success" />
                  )}
                </Stack>
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

              {bien.localisation?.ville && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Localisation
                  </Typography>
                  <Typography variant="body1">
                    {bien.localisation.ville}
                    {bien.localisation.quartier && `, ${bien.localisation.quartier}`}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Prix de vente */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Prix de vente souhaité
            </Typography>
            <Divider sx={{ my: 2 }} />

            <TextField
              label="Prix de vente"
              type="number"
              value={prixVente}
              onChange={(e) => setPrixVente(e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
              }}
              placeholder="Ex: 5000000"
            />

            {bien.valeurEstimee && prixVente && (
              <Alert severity={parseFloat(prixVente) < bien.valeurEstimee ? "warning" : "info"} sx={{ mt: 2 }}>
                {parseFloat(prixVente) < bien.valeurEstimee
                  ? "⚠️ Prix inférieur à votre estimation"
                  : "✓ Prix cohérent avec votre estimation"}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Calcul commission */}
        {prixVente && (
          <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: "info.light" }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <Calculate sx={{ verticalAlign: "middle", mr: 1 }} />
                  Calcul de la commission
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">
                  Prix de vente
                </Typography>
                <Typography variant="h6">{formatMoney(prixVente)}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">
                  Commission Softlink
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {commissionPourcentage}%
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">
                  Montant commission
                </Typography>
                <Typography variant="h6" color="error.main">
                  {formatMoney(commissionMontant)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Vous recevrez
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {formatMoney(parseFloat(prixVente) - commissionMontant)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Processus de vente :</strong>
          </Typography>
          <Typography variant="body2">1. Vous soumettez votre bien avec le prix souhaité</Typography>
          <Typography variant="body2">2. Softlink valide votre soumission</Typography>
          <Typography variant="body2">3. Nous trouvons un acheteur</Typography>
          <Typography variant="body2">4. Commission prélevée automatiquement</Typography>
          <Typography variant="body2">5. Vous recevez le montant net</Typography>
        </Alert>

        {/* Bouton */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <Gavel />}
          onClick={handleSoumettre}
          disabled={processing || !prixVente}
          sx={{
            py: 2,
            fontSize: "1.1rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {processing ? "Soumission en cours..." : "Soumettre à la vente"}
        </Button>
      </Container>
    </PageLayout>
  );
};

export default SoumettreVentePage;

