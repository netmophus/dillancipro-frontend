import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  Stack,
} from "@mui/material";
import {
  TrendingUp,
  Home,
  CheckCircle,
  HourglassEmpty,
  Block,
  AccountBalance,
  Euro,
  Assessment,
  Speed,
  Add,
  List,
  Map,
  Share,
  PendingActions,
  Warning,
  Error,
  Info,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const BanqueDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/banque/ihe/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Erreur chargement statistiques IHE:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ width: "100%", mt: 4 }}>
          <LinearProgress />
          <Typography align="center" sx={{ mt: 2 }}>
            Chargement des statistiques...
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  if (!stats) {
    return (
      <PageLayout>
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="h6" color="error">
            Impossible de charger les statistiques
          </Typography>
          <Button onClick={fetchStats} sx={{ mt: 2 }}>
            Réessayer
          </Button>
        </Box>
      </PageLayout>
    );
  }

  // Formatage monétaire
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  // Calculs pour les pourcentages
  const totalIHE = stats.totalIHE || 0;
  const enAttente = stats.parStatut?.en_attente_validation?.count || 0;
  const validees = stats.parStatut?.valide?.count || 0;
  const rejetees = stats.parStatut?.rejete?.count || 0;
  const enVente = stats.parStatut?.en_vente?.count || 0;

  const tauxValidees = totalIHE > 0 ? ((validees / totalIHE) * 100).toFixed(1) : 0;
  const tauxEnAttente = totalIHE > 0 ? ((enAttente / totalIHE) * 100).toFixed(1) : 0;

  // 🎨 Composant KPI Card
  const KPICard = ({ title, value, subtitle, icon: Icon, color, action, progress }) => (
    <Card
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
          borderLeftWidth: "6px",
        },
      }}
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
            {progress !== undefined && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#f0f0f0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: color,
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  {progress}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56, ml: 2 }}>
            <Icon fontSize="large" />
          </Avatar>
        </Box>
        {action && (
          <Box mt={2}>
            <Button size="small" endIcon={<ArrowForward />} onClick={action.onClick} sx={{ color }}>
              {action.label}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const ArrowForward = () => <span>→</span>;

  // Couleurs et labels des statuts
  const STATUT_COLORS = {
    en_attente_validation: "warning",
    valide: "success",
    rejete: "error",
    en_vente: "info",
    vendu: "success",
    en_location: "primary",
    loue: "success",
  };

  const STATUT_LABELS = {
    en_attente_validation: "En attente",
    valide: "Validée",
    rejete: "Rejetée",
    en_vente: "En vente",
    vendu: "Vendue",
    en_location: "En location",
    loue: "Louée",
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        {/* En-tête */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏦 Tableau de bord - Banque
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bonjour {user?.fullName || user?.phone}, voici un aperçu de votre portefeuille d'IHE.
          </Typography>
        </Box>

        {/* 🔢 KPIs Principaux */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          📊 Immobilisations Hors Exploitation (IHE)
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total IHE"
              value={totalIHE}
              subtitle={`${formatMoney(stats.totalValeurComptable)} valeur totale`}
              icon={Home}
              color="#2196f3"
              action={{
                label: "Voir toutes",
                onClick: () => navigate("/banque/ihe"),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Validées"
              value={validees}
              subtitle={`${tauxValidees}% du total`}
              icon={CheckCircle}
              color="#4caf50"
              progress={parseFloat(tauxValidees)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="En attente"
              value={enAttente}
              subtitle="Validation requise"
              icon={PendingActions}
              color="#ff9800"
              progress={parseFloat(tauxEnAttente)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="En vente"
              value={enVente}
              subtitle="Proposées aux agences"
              icon={TrendingUp}
              color="#00bcd4"
            />
          </Grid>
        </Grid>

        {/* ⚠️ Alertes réglementaires */}
        {stats.alertesReglementaires && (
          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              ⚠️ Alertes réglementaires
            </Typography>
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate("/banque/ihe/alertes-reglementaires")}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Suivi des dates limites de cession
                    </Typography>
                    <Grid container spacing={2} mt={1}>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Error />
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Dépassées
                            </Typography>
                          </Box>
                          <Typography variant="h5" fontWeight="bold">
                            {stats.alertesReglementaires.depasse?.count || 0}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Warning />
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Urgentes
                            </Typography>
                          </Box>
                          <Typography variant="h5" fontWeight="bold">
                            {stats.alertesReglementaires.urgent?.count || 0}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Info />
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Attention
                            </Typography>
                          </Box>
                          <Typography variant="h5" fontWeight="bold">
                            {stats.alertesReglementaires.attention?.count || 0}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Total à risque
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {(stats.alertesReglementaires.depasse?.count || 0) +
                              (stats.alertesReglementaires.urgent?.count || 0) +
                              (stats.alertesReglementaires.attention?.count || 0)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/banque/ihe/alertes-reglementaires");
                    }}
                  >
                    Voir détails
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 💰 Valeur totale */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderLeft: "4px solid #9c27b0" }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalance sx={{ color: "#9c27b0", mr: 1, fontSize: 40 }} />
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Valeur totale du portefeuille
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                      {formatMoney(stats.totalValeurComptable)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderLeft: "4px solid #607d8b" }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assessment sx={{ color: "#607d8b", mr: 1, fontSize: 40 }} />
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Répartition par type
                    </Typography>
                    <Stack spacing={1} mt={1}>
                      {stats.parType && stats.parType.length > 0 ? (
                        stats.parType.slice(0, 3).map((item) => (
                          <Box key={item._id} display="flex" justifyContent="space-between">
                            <Typography variant="body2" textTransform="capitalize">
                              {item._id}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {item.count}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Aucune IHE enregistrée
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 📋 IHE Récentes */}
        {stats.ihesRecentes && stats.ihesRecentes.length > 0 && (
          <>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 4 }}>
              📋 IHE Récentes
            </Typography>
            <Card elevation={3} sx={{ mb: 4 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Dernières immobilisations saisies
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/banque/ihe")}
                  >
                    Voir tout
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Référence</strong></TableCell>
                        <TableCell><strong>Titre</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell align="right"><strong>Valeur</strong></TableCell>
                        <TableCell align="center"><strong>Statut</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.ihesRecentes.map((ihe) => (
                        <TableRow key={ihe._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {ihe.reference}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{ihe.titre}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" textTransform="capitalize">
                              {ihe.type}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {formatMoney(ihe.valeurComptable)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={STATUT_LABELS[ihe.statut] || ihe.statut}
                              color={STATUT_COLORS[ihe.statut] || "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {formatDate(ihe.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* 🎯 Actions Rapides */}
        <Card sx={{ bgcolor: "primary.main", color: "white" }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Speed /> Actions Rapides
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  onClick={() => navigate("/banque/ihe/nouvelle")}
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                  startIcon={<Add />}
                >
                  ➕ Nouvelle IHE
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  onClick={() => navigate("/banque/ihe")}
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                  startIcon={<List />}
                >
                  📋 Liste IHE
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/banque/ihe/carte")}
                  sx={{ borderColor: "white", color: "white" }}
                  startIcon={<Map />}
                >
                  🗺️ Carte
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/banque/ihe/partagees")}
                  sx={{ borderColor: "white", color: "white" }}
                  startIcon={<Share />}
                >
                  🤝 Partagées
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/banque/ihe?statut=en_attente_validation")}
                  sx={{ borderColor: "white", color: "white" }}
                  startIcon={<PendingActions />}
                >
                  ⏳ À valider
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 🏛️ Workflow Banque-Notaire : Crédits avec Garantie Hypothécaire */}
        <Box mb={4} mt={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              📋 Formalisation Notariale : Workflow Banque-Notaire
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/banque/demandes-credit-hypothecaire/nouvelle")}
              sx={{ textTransform: "none" }}
            >
              Nouveau dossier
            </Button>
          </Box>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
            onClick={() => navigate("/banque/demandes-credit-hypothecaire")}
          >
            <CardContent>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                Workflow de formalisation des documents (titre foncier, convention d'ouverture de crédit, acte hypothécaire) 
                chez le notaire partenaire dans le cadre d'un crédit avec garantie hypothécaire selon les procédures UMEMOA.
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Processus : Banque soumet → Notaire formalise → Inscription hypothécaire
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      mt: 1,
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/banque/demandes-credit-hypothecaire");
                    }}
                  >
                    Voir toutes les demandes
                  </Button>
                </Box>
                <AccountBalance sx={{ fontSize: 80, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default BanqueDashboardPage;
