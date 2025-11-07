import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Alert,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp,
  Home,
  CheckCircle,
  HourglassEmpty,
  Person,
  Map,
  Euro,
  Notifications,
  ArrowForward,
  Speed,
  Inventory2,
  Sell,
  Assessment,
  LocationOn,
  Refresh,
  Edit,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../../components/shared/PageLayout";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";

const CommercialDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    vendues: 0,
    disponibles: 0,
    reserved: 0,
    ilots: 0,
    ca: 0,
    superficieVendue: 0,
    superficieDisponible: 0,
    paiementsPartiels: { count: 0, paye: 0, restant: 0 },
    biens: {
      total: 0,
      vendus: 0,
      disponibles: 0,
      reserves: 0,
      ca: 0,
      superficieVendue: 0,
      superficieDisponible: 0,
    }
  });

  const [profil, setProfil] = useState(null);
  const [parcelles, setParcelles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingParcelles, setLoadingParcelles] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, profilRes, parcellesRes, notifRes] = await Promise.all([
        api.get("/agence/commerciaux/stats"),
        api.get("/agence/commerciaux/me/profil").catch(() => ({ data: null })),
        api.get(`/agence/commerciaux/${user?._id}/parcelles`).catch(() => ({ data: [] })),
        api.get("/agence/commerciaux/notifications", { params: { limit: 5 } }).catch(() => ({ data: { items: [] } })),
      ]);

      // Debug: voir ce que retourne l'API
      console.log("📊 Stats du commercial:", statsRes.data);

      // Mapper correctement les données des paiements partiels et biens
      setStats({
        ...statsRes.data,
        paiementsPartiels: {
          count: statsRes.data.partielsCount || 0,
          paye: statsRes.data.partielsMontantPaye || 0,
          restant: statsRes.data.partielsMontantRestant || 0,
        },
        biens: statsRes.data.biens || {
          total: 0,
          vendus: 0,
          disponibles: 0,
          reserves: 0,
          ca: 0,
          superficieVendue: 0,
          superficieDisponible: 0,
        }
      });

      console.log("✅ Paiements partiels mappés:", {
        count: statsRes.data.partielsCount,
        paye: statsRes.data.partielsMontantPaye,
        restant: statsRes.data.partielsMontantRestant,
      });
      setProfil(profilRes.data);
      setParcelles(parcellesRes.data || []);
      setNotifications((notifRes.data?.items || []).slice(0, 5));
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
      setLoadingParcelles(false);
    }
  };

  const commissionCfg = useMemo(() => {
    const c = profil?.commission || {};
    const mode = c.mode || "pourcentage";
    const valeur = Number(c.valeur ?? 0);
    const baseCA = Number(stats.ca || 0);
    const ventesCount = Number(stats.vendues || 0);

    const commissionDue =
      mode === "pourcentage"
        ? Math.round(baseCA * (valeur / 100))
        : Math.round(valeur * ventesCount);

    return {
      actif: !!c.actif,
      mode,
      valeur,
      commissionDue,
      ventesCount,
      baseCA,
    };
  }, [profil, stats]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const tauxVente = stats.total > 0 ? ((stats.vendues / stats.total) * 100).toFixed(1) : 0;
  const tauxDispo = stats.total > 0 ? ((stats.disponibles / stats.total) * 100).toFixed(1) : 0;

  // Composant KPI Card
  const KPICard = ({ title, value, subtitle, icon: Icon, color, progress, onClick }) => (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        transition: "all 0.3s",
        cursor: onClick ? "pointer" : "default",
        "&:hover": { 
          transform: "translateY(-4px)", 
          boxShadow: 6,
          ...(onClick && { bgcolor: "action.hover" })
        },
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
            {progress !== undefined && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#f0f0f0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: color,
                      borderRadius: 3,
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
      </CardContent>
    </Card>
  );

  if (loading) {
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
        {/* En-tête avec profil */}
        <Card
          elevation={3}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  src={profil?.photoUrl}
                  sx={{ width: 80, height: 80, border: "4px solid white" }}
                >
                  {(profil?.fullName || user?.fullName || "U").slice(0, 1).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Bonjour, {profil?.fullName || user?.fullName || "Commercial"} 👋
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                    📞 {user?.phone} • 
                    💰 Commission: {commissionCfg.mode === "pourcentage" ? `${commissionCfg.valeur}%` : `${formatMoney(commissionCfg.valeur)}`}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={2}>
                <Tooltip title="Actualiser">
                  <IconButton onClick={fetchAll} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  color="inherit"
                  startIcon={<Edit />}
                  onClick={() => navigate("/commercial/mon-profil")}
                  sx={{ color: "#667eea" }}
                >
                  Mon profil
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* KPIs Principaux - Parcelles */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          🏘️ Parcelles - Vue d'ensemble
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Parcelles"
              value={stats.total}
              subtitle="Affectées à vous"
              icon={Inventory2}
              color="#2196f3"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Vendues"
              value={stats.vendues}
              subtitle={`${stats.superficieVendue || 0} m²`}
              icon={CheckCircle}
              color="#4caf50"
              progress={parseFloat(tauxVente)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Disponibles"
              value={stats.disponibles}
              subtitle={`${stats.superficieDisponible || 0} m²`}
              icon={HourglassEmpty}
              color="#ff9800"
              progress={parseFloat(tauxDispo)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Îlots"
              value={stats.ilots}
              subtitle="Zones gérées"
              icon={Map}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        {/* KPIs Biens Immobiliers */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          🏠 Biens Immobiliers - Vue d'ensemble
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Biens"
              value={stats.biens.total}
              subtitle="Affectés à vous"
              icon={Home}
              color="#673ab7"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Vendus"
              value={stats.biens.vendus}
              subtitle={`${stats.biens.superficieVendue || 0} m²`}
              icon={CheckCircle}
              color="#4caf50"
              progress={stats.biens.total > 0 ? parseFloat(((stats.biens.vendus / stats.biens.total) * 100).toFixed(1)) : 0}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Disponibles"
              value={stats.biens.disponibles}
              subtitle={`${stats.biens.superficieDisponible || 0} m²`}
              icon={HourglassEmpty}
              color="#ff9800"
              progress={stats.biens.total > 0 ? parseFloat(((stats.biens.disponibles / stats.biens.total) * 100).toFixed(1)) : 0}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="CA Biens"
              value={formatMoney(stats.biens.ca)}
              subtitle="Chiffre d'affaires"
              icon={TrendingUp}
              color="#00bcd4"
            />
          </Grid>
        </Grid>

        {/* Finances & Commission */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          💰 Finances & Commission
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <KPICard
              title="Chiffre d'Affaires"
              value={formatMoney(stats.ca)}
              subtitle="Total des ventes"
              icon={TrendingUp}
              color="#00bcd4"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <KPICard
              title="Commission Due"
              value={formatMoney(commissionCfg.commissionDue)}
              subtitle={`${commissionCfg.ventesCount} vente(s) • ${commissionCfg.mode === "pourcentage" ? `${commissionCfg.valeur}%` : "Fixe"}`}
              icon={Euro}
              color="#ff5722"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Tooltip title="Cliquer pour voir le détail">
              <Box>
                <KPICard
                  title="Paiements Partiels 🔍"
                  value={stats.paiementsPartiels?.count || 0}
                  subtitle={`Encaissé: ${formatMoney(stats.paiementsPartiels?.paye || 0)} • Reste: ${formatMoney(stats.paiementsPartiels?.restant || 0)}`}
                  icon={Sell}
                  color="#ff9800"
                  onClick={() => navigate("/commercial/paiements-partiels")}
                />
              </Box>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Actions rapides */}
        <Card elevation={2} sx={{ mb: 4, bgcolor: "primary.main", color: "white" }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Speed />
              <Typography variant="h6" fontWeight="bold">
                Actions rapides
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  onClick={() => navigate("/commercial/inscrire-client")}
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                >
                  ➕ Inscrire Client
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/commercial/parcelles-non-vendues")}
                  sx={{ borderColor: "white", color: "white" }}
                >
                  🏘️ Parcelles à vendre
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/commercial/parcelles-vendues")}
                  sx={{ borderColor: "white", color: "white" }}
                >
                  ✅ Parcelles vendues
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/commercial/mes-ilots")}
                  sx={{ borderColor: "white", color: "white" }}
                >
                  🗺️ Mes îlots
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  onClick={() => navigate("/commercial/mes-biens")}
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                >
                  🏡 Mes biens
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/commercial/mes-ventes")}
                  sx={{ borderColor: "white", color: "white", fontWeight: "bold" }}
                  startIcon={<Sell />}
                >
                  📋 Mes ventes de biens
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Notifications */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Badge badgeContent={notifications.filter((n) => !n.read).length} color="error">
                      <Notifications color="primary" />
                    </Badge>
                    <Typography variant="h6" fontWeight="bold">
                      Notifications
                    </Typography>
                  </Box>
                  <Chip label={`${notifications.length} message(s)`} size="small" />
                </Box>
                <Divider sx={{ mb: 2 }} />

                {notifications.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography color="text.secondary">Aucune notification</Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {notifications.map((notif, index) => (
                      <Paper
                        key={notif._id || index}
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: notif.link ? "pointer" : "default",
                          opacity: notif.read ? 0.7 : 1,
                          transition: "all 0.3s",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => notif.link && navigate(notif.link)}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {notif.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notif.message}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Statistiques visuelles - Parcelles */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Assessment color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    🏘️ Parcelles
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                {/* Barre de progression composée */}
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" height={50} borderRadius={2} overflow="hidden">
                    {stats.vendues > 0 && (
                      <Tooltip title={`${stats.vendues} vendues (${tauxVente}%)`}>
                        <Box
                          sx={{
                            width: `${tauxVente}%`,
                            bgcolor: "#4caf50",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          }}
                        >
                          {tauxVente}%
                        </Box>
                      </Tooltip>
                    )}
                    {stats.disponibles > 0 && (
                      <Tooltip title={`${stats.disponibles} disponibles (${tauxDispo}%)`}>
                        <Box
                          sx={{
                            width: `${tauxDispo}%`,
                            bgcolor: "#ff9800",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          }}
                        >
                          {tauxDispo}%
                        </Box>
                      </Tooltip>
                    )}
                    {stats.reserved > 0 && (
                      <Tooltip title={`${stats.reserved} réservées`}>
                        <Box
                          sx={{
                            width: `${((stats.reserved / stats.total) * 100).toFixed(1)}%`,
                            bgcolor: "#f44336",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          }}
                        >
                          {((stats.reserved / stats.total) * 100).toFixed(0)}%
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {/* Légende */}
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 20, height: 20, bgcolor: "#4caf50", borderRadius: 1 }} />
                      <Typography variant="body2">Vendues</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {stats.vendues}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 20, height: 20, bgcolor: "#ff9800", borderRadius: 1 }} />
                      <Typography variant="body2">Disponibles</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      {stats.disponibles}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 20, height: 20, bgcolor: "#f44336", borderRadius: 1 }} />
                      <Typography variant="body2">Réservées</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="error.main">
                      {stats.reserved}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistiques visuelles - Biens */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Home color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    🏠 Biens Immobiliers
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                {/* Barre de progression composée pour biens */}
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" height={50} borderRadius={2} overflow="hidden">
                    {stats.biens.vendus > 0 && (
                      <Tooltip title={`${stats.biens.vendus} vendus`}>
                        <Box
                          sx={{
                            width: `${stats.biens.total > 0 ? ((stats.biens.vendus / stats.biens.total) * 100).toFixed(1) : 0}%`,
                            bgcolor: "#4caf50",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          }}
                        >
                          {stats.biens.total > 0 ? ((stats.biens.vendus / stats.biens.total) * 100).toFixed(0) : 0}%
                        </Box>
                      </Tooltip>
                    )}
                    {stats.biens.disponibles > 0 && (
                      <Tooltip title={`${stats.biens.disponibles} disponibles`}>
                        <Box
                          sx={{
                            width: `${stats.biens.total > 0 ? ((stats.biens.disponibles / stats.biens.total) * 100).toFixed(1) : 0}%`,
                            bgcolor: "#ff9800",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          }}
                        >
                          {stats.biens.total > 0 ? ((stats.biens.disponibles / stats.biens.total) * 100).toFixed(0) : 0}%
                        </Box>
                      </Tooltip>
                    )}
                    {stats.biens.reserves > 0 && (
                      <Tooltip title={`${stats.biens.reserves} réservés`}>
                        <Box
                          sx={{
                            width: `${stats.biens.total > 0 ? ((stats.biens.reserves / stats.biens.total) * 100).toFixed(1) : 0}%`,
                            bgcolor: "#f44336",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          }}
                        >
                          {stats.biens.total > 0 ? ((stats.biens.reserves / stats.biens.total) * 100).toFixed(0) : 0}%
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {/* Légende pour biens */}
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 20, height: 20, bgcolor: "#4caf50", borderRadius: 1 }} />
                      <Typography variant="body2">Vendus</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {stats.biens.vendus}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 20, height: 20, bgcolor: "#ff9800", borderRadius: 1 }} />
                      <Typography variant="body2">Disponibles</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      {stats.biens.disponibles}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 20, height: 20, bgcolor: "#f44336", borderRadius: 1 }} />
                      <Typography variant="body2">Réservés</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="error.main">
                      {stats.biens.reserves}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Mes parcelles récentes */}
        {parcelles.length > 0 && (
          <Card elevation={3} sx={{ mt: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  🏘️ Mes parcelles récentes ({parcelles.length})
                </Typography>
                <Button endIcon={<ArrowForward />} onClick={() => navigate("/commercial/parcelles-non-vendues")}>
                  Voir tout
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "grey.100" }}>
                    <TableRow>
                      <TableCell><strong>Numéro</strong></TableCell>
                      <TableCell><strong>Îlot</strong></TableCell>
                      <TableCell><strong>Superficie</strong></TableCell>
                      <TableCell><strong>Prix</strong></TableCell>
                      <TableCell><strong>Statut</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parcelles.slice(0, 5).map((p) => (
                      <TableRow key={p._id} hover sx={{ cursor: "pointer" }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {p.numeroParcelle}
                          </Typography>
                        </TableCell>
                        <TableCell>{p.ilot?.numeroIlot || "-"}</TableCell>
                        <TableCell>{p.superficie ? `${p.superficie} m²` : "-"}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatMoney(p.prix || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={p.statut === "vendue" ? "Vendue" : p.statut === "avendre" ? "À vendre" : "Réservée"}
                            size="small"
                            color={
                              p.statut === "vendue" ? "success" : p.statut === "avendre" ? "warning" : "error"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>
    </PageLayout>
  );
};

export default CommercialDashboardPage;
