import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Divider,
} from "@mui/material";
import {
  Home,
  AttachMoney,
  CheckCircle,
  HourglassEmpty,
  LocationOn,
  Receipt,
  TrendingUp,
  ShoppingCart,
  Landscape,
  Refresh,
  Visibility,
  AccountBalance,
} from "@mui/icons-material";
import PageLayout from "../../components/shared/PageLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const MesAchatsAgencePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [achats, setAchats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAchats();
  }, []);

  const fetchAchats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📝 [MES_ACHATS] Chargement des achats...");
      
      const response = await api.get("/client/mes-achats-agence");
      console.log("✅ [MES_ACHATS] Données reçues:", response.data);
      
      setStats(response.data.stats);
      setAchats(response.data.achats);
    } catch (err) {
      console.error("❌ [MES_ACHATS] Erreur:", err);
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  // Composant KPI Card
  const KPICard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card elevation={3} sx={{ height: "100%", borderLeft: `4px solid ${color}` }}>
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
          <Icon sx={{ fontSize: 48, color, opacity: 0.7 }} />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <PageLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} />
          </Box>
        </Container>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchAchats} startIcon={<Refresh />}>
            Réessayer
          </Button>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* En-tête */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              🛒 Mes Achats via Agence
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Suivez vos achats de parcelles et biens immobiliers
            </Typography>
          </Box>
          <Tooltip title="Actualiser">
            <IconButton onClick={fetchAchats} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Statistiques */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          📊 Vue d'ensemble
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Achats"
              value={stats?.totalAchats || 0}
              subtitle="Parcelles & Biens"
              icon={ShoppingCart}
              color="#2196f3"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Payés Complètement"
              value={stats?.achatsPayes || 0}
              subtitle="Dans votre patrimoine"
              icon={CheckCircle}
              color="#4caf50"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="En Cours"
              value={stats?.achatsEnCours || 0}
              subtitle="Paiements partiels"
              icon={HourglassEmpty}
              color="#ff9800"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Montant Restant"
              value={formatMoney(stats?.montantRestant || 0)}
              subtitle="À payer"
              icon={AttachMoney}
              color="#f44336"
            />
          </Grid>
        </Grid>

        {/* Liste des achats */}
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                📋 Liste de mes achats ({achats.length})
              </Typography>
              <Chip
                label={`${stats?.dansPatrimoine || 0} dans patrimoine`}
                color="success"
                icon={<Landscape />}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {achats.length === 0 ? (
              <Box textAlign="center" py={8}>
                <ShoppingCart sx={{ fontSize: 80, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun achat via agence
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vos achats de parcelles et biens immobiliers apparaîtront ici
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: "grey.100" }}>
                    <TableRow>
                      <TableCell><strong>Bien</strong></TableCell>
                      <TableCell><strong>Agence</strong></TableCell>
                      <TableCell align="right"><strong>Prix Total</strong></TableCell>
                      <TableCell align="right"><strong>Payé</strong></TableCell>
                      <TableCell align="right"><strong>Restant</strong></TableCell>
                      <TableCell align="center"><strong>Statut</strong></TableCell>
                      <TableCell align="center"><strong>Patrimoine</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {achats.map((achat) => (
                      <TableRow key={achat._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {achat.type === "parcelle" 
                                ? `Parcelle ${achat.bien?.numeroParcelle}` 
                                : achat.bien?.titre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {achat.type === "parcelle" 
                                ? `Îlot ${achat.bien?.ilot?.numeroIlot || 'N/A'}` 
                                : achat.bien?.adresse}
                            </Typography>
                            {achat.bien?.localisation?.lat && (
                              <Chip
                                icon={<LocationOn />}
                                label="Géolocalisé"
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={<AccountBalance />}
                            label={achat.agence?.nom || "Agence"}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatMoney(achat.paiement.montantTotal)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {formatMoney(achat.paiement.montantPaye)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({achat.paiement.pourcentagePaye}%)
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color={achat.paiement.montantRestant > 0 ? "error.main" : "text.secondary"}>
                            {formatMoney(achat.paiement.montantRestant)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          {achat.paiement.statut === "paid" ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Payé"
                              size="small"
                              color="success"
                            />
                          ) : (
                            <Box>
                              <Chip
                                icon={<HourglassEmpty />}
                                label="En cours"
                                size="small"
                                color="warning"
                              />
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(achat.paiement.pourcentagePaye)}
                                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {achat.dansPatrimoine ? (
                            <Tooltip title="Ajouté à votre patrimoine">
                              <Chip
                                icon={<Landscape />}
                                label="Dans patrimoine"
                                size="small"
                                color="success"
                                onClick={() => navigate("/user/mon-patrimoine")}
                                sx={{ cursor: "pointer" }}
                              />
                            </Tooltip>
                          ) : (
                            <Chip
                              label="En attente"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Tooltip title="Voir détails">
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {achat.paiement.recuUrl && (
                            <Tooltip title="Voir reçu">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => window.open(achat.paiement.recuUrl, "_blank")}
                              >
                                <Receipt />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Info sur le transfert au patrimoine */}
        {stats?.achatsEnCours > 0 && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              ℹ️ Information sur le patrimoine
            </Typography>
            <Typography variant="body2">
              Vos achats seront automatiquement ajoutés à votre patrimoine foncier une fois le paiement complet effectué. 
              Vous pourrez alors les géolocaliser et gérer leur abonnement annuel.
            </Typography>
          </Alert>
        )}
      </Container>
    </PageLayout>
  );
};

export default MesAchatsAgencePage;

