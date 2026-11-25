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
import CommercialLayout from "../../../components/commercial/CommercialLayout";
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
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid #e3e8ef",
        transition: "all 0.25s",
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(13,43,78,0.10)",
          ...(onClick && { borderColor: color }),
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1} sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color, mb: 1 }} noWrap>
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
          <Avatar sx={{ bgcolor: `${color}15`, color, width: 48, height: 48, ml: 2 }}>
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <CommercialLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} />
        </Box>
      </CommercialLayout>
    );
  }

  return (
    <CommercialLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête avec profil */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 55%, #27AE60 165%)",
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
                    Bonjour, {profil?.fullName || user?.fullName || "Commercial"}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {user?.phone} • Commission: {commissionCfg.mode === "pourcentage" ? `${commissionCfg.valeur}%` : `${formatMoney(commissionCfg.valeur)}`}
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
                  sx={{ color: "#0D2B4E" }}
                >
                  Mon profil
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* KPIs Principaux - Parcelles */}
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <Inventory2 color="action" />
          <Typography variant="h6" fontWeight="bold">
            Parcelles - Vue d'ensemble
          </Typography>
        </Box>
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
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <Home color="action" />
          <Typography variant="h6" fontWeight="bold">
            Biens Immobiliers - Vue d'ensemble
          </Typography>
        </Box>
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
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <Euro color="action" />
          <Typography variant="h6" fontWeight="bold">
            Finances & Commission
          </Typography>
        </Box>
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
                  title="Paiements Partiels"
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
        <Card elevation={0} sx={{ mb: 4, borderRadius: 3, background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 100%)", color: "white" }}>
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
                  Inscrire Client
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
                  Parcelles à vendre
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
                  Parcelles vendues
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
                  Mes îlots
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
                  Mes biens
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
                  Mes ventes de biens
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Notifications */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: "100%", borderRadius: 3, border: "1px solid #e3e8ef" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Badge badgeContent={notifications.filter((n) => !n.read).length} color="error">
                      <Avatar sx={{ bgcolor: "#5b6ee815", color: "#5b6ee8", width: 40, height: 40 }}>
                        <Notifications />
                      </Avatar>
                    </Badge>
                    <Typography variant="h6" fontWeight="bold">
                      Notifications
                    </Typography>
                  </Stack>
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
            <Card elevation={0} sx={{ height: "100%", borderRadius: 3, border: "1px solid #e3e8ef" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                  <Avatar sx={{ bgcolor: "#2e7d3215", color: "#2e7d32", width: 40, height: 40 }}>
                    <Assessment />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Parcelles
                  </Typography>
                </Stack>
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
            <Card elevation={0} sx={{ height: "100%", borderRadius: 3, border: "1px solid #e3e8ef" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                  <Avatar sx={{ bgcolor: "#673ab715", color: "#673ab7", width: 40, height: 40 }}>
                    <Home />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Biens Immobiliers
                  </Typography>
                </Stack>
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
          <Card elevation={0} sx={{ mt: 3, borderRadius: 3, border: "1px solid #e3e8ef" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: "#2196f315", color: "#2196f3", width: 40, height: 40 }}>
                    <Inventory2 />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Mes parcelles récentes ({parcelles.length})
                  </Typography>
                </Stack>
                <Button endIcon={<ArrowForward />} onClick={() => navigate("/commercial/parcelles-non-vendues")}>
                  Voir tout
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table>
                  <TableHead
                    sx={{
                      "& th": {
                        bgcolor: "#f6f8fb",
                        color: "text.secondary",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        borderBottom: "2px solid #e3e8ef",
                      },
                    }}
                  >
                    <TableRow>
                      <TableCell>Numéro</TableCell>
                      <TableCell>Îlot</TableCell>
                      <TableCell>Superficie</TableCell>
                      <TableCell>Prix</TableCell>
                      <TableCell>Statut</TableCell>
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
    </CommercialLayout>
  );
};

export default CommercialDashboardPage;
