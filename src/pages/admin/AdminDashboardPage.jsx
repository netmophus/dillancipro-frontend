import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Stack,
  LinearProgress,
  Chip,
  Skeleton,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Business,
  AccountBalance,
  People,
  AttachMoney,
  Gavel,
  Landscape,
  Home,
  Apartment,
  Refresh,
  Assessment,
  CheckCircle,
  HourglassEmpty,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/admin/AdminLayout";
import API from "../../api";

const ROLE_COLORS = {
  Admin: "#9c27b0",
  Agence: "#1976d2",
  Banque: "#388e3c",
  Ministere: "#0288d1",
  Commercial: "#ff9800",
  Notaire: "#7b1fa2",
  User: "#607d8b",
  Client: "#607d8b",
};

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Erreur stats:", err);
      setError("Impossible de charger les statistiques. Vérifiez que le serveur est démarré.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Cartes KPI principales
  const kpis = stats
    ? [
        { label: "Utilisateurs", value: stats.utilisateurs.total, sub: `${stats.utilisateurs.actifs} actifs`, color: "#f57c00", icon: People },
        { label: "Agences", value: stats.agences.total, sub: `${stats.agences.actives} actives`, color: "#1976d2", icon: Business },
        { label: "Banques", value: stats.banques.total, sub: "partenaires", color: "#388e3c", icon: AccountBalance },
        { label: "Notaires", value: stats.notaires.total, sub: "partenaires", color: "#7b1fa2", icon: Gavel },
        { label: "Parcelles", value: stats.parcelles.total, sub: `${stats.parcelles.vendues} vendues`, color: "#2e7d32", icon: Landscape },
        { label: "Biens", value: stats.biens.total, sub: `${stats.biens.vendus} vendus`, color: "#5e35b1", icon: Apartment },
        { label: "Locations", value: stats.locations.total, sub: "offres", color: "#ff5722", icon: Home },
        { label: "Ventes patrimoine", value: stats.ventes.total, sub: "au total", color: "#c2185b", icon: AttachMoney },
      ]
    : [];

  // Barre de répartition réutilisable
  const DistroBar = ({ label, value, total, color }) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
      <Box mb={1.5}>
        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>{value}</strong> ({pct}%)
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 8,
            borderRadius: 5,
            bgcolor: "#eef2f7",
            "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 5 },
          }}
        />
      </Box>
    );
  };

  const PanelCard = ({ title, icon: Icon, color, children }) => (
    <Card elevation={0} sx={{ height: "100%", borderRadius: 3, border: "1px solid #e3e8ef" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
          <Avatar sx={{ bgcolor: `${color}15`, color, width: 40, height: 40 }}>
            <Icon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">{title}</Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );

  const rolesEntries = stats ? Object.entries(stats.utilisateurs.parRole || {}) : [];
  const ventesEntries = stats ? Object.entries(stats.ventes.parStatut || {}) : [];

  return (
    <AdminLayout>
      {/* Bandeau de bienvenue */}
      <Card
        elevation={0}
        sx={{
          mb: 3.5,
          borderRadius: 4,
          background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 55%, #27AE60 165%)",
          color: "white",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack direction="row" alignItems="center" spacing={2.5}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.4)" }}>
                <Assessment fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">Tableau de bord</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Bonjour {user?.fullName || user?.phone} • Vue d'ensemble de la plateforme
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="Rafraîchir">
              <IconButton onClick={fetchStats} sx={{ color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* KPIs principaux */}
      <Grid container spacing={2.5} mb={1}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Skeleton variant="rounded" height={118} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          : kpis.map((stat, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid #e3e8ef",
                    transition: "all 0.25s",
                    "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(13,43,78,0.08)" },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography color="text.secondary" variant="body2">{stat.label}</Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                        <Typography variant="caption" color="text.secondary">{stat.sub}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 46, height: 46 }}>
                        <stat.icon />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Répartitions */}
      <Grid container spacing={2.5} mt={1}>
        {/* Utilisateurs par rôle */}
        <Grid item xs={12} md={4}>
          <PanelCard title="Utilisateurs par rôle" icon={People} color="#f57c00">
            {loading ? (
              <Skeleton variant="rounded" height={180} />
            ) : rolesEntries.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Aucune donnée.</Typography>
            ) : (
              rolesEntries
                .sort((a, b) => b[1] - a[1])
                .map(([role, count]) => (
                  <DistroBar
                    key={role}
                    label={role}
                    value={count}
                    total={stats.utilisateurs.total}
                    color={ROLE_COLORS[role] || "#607d8b"}
                  />
                ))
            )}
          </PanelCard>
        </Grid>

        {/* Foncier */}
        <Grid item xs={12} md={4}>
          <PanelCard title="Foncier & immobilier" icon={Landscape} color="#2e7d32">
            {loading ? (
              <Skeleton variant="rounded" height={180} />
            ) : (
              <>
                <Typography variant="overline" color="text.secondary">Parcelles</Typography>
                <DistroBar label="Vendues" value={stats.parcelles.vendues} total={stats.parcelles.total} color="#2e7d32" />
                <DistroBar label="À vendre" value={stats.parcelles.aVendre} total={stats.parcelles.total} color="#66bb6a" />
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="overline" color="text.secondary">Biens immobiliers</Typography>
                <DistroBar label="Disponibles" value={stats.biens.disponibles} total={stats.biens.total} color="#5e35b1" />
                <DistroBar label="Vendus" value={stats.biens.vendus} total={stats.biens.total} color="#9575cd" />
              </>
            )}
          </PanelCard>
        </Grid>

        {/* Éléments à traiter + ventes */}
        <Grid item xs={12} md={4}>
          <PanelCard title="À traiter" icon={HourglassEmpty} color="#e53935">
            {loading ? (
              <Skeleton variant="rounded" height={180} />
            ) : (
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between"
                  sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff5f5", border: "1px solid #ffd6d6" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <HourglassEmpty sx={{ color: "#e53935" }} fontSize="small" />
                    <Typography variant="body2">Agences en attente</Typography>
                  </Stack>
                  <Chip label={stats.agences.enAttente} size="small" sx={{ bgcolor: "#e53935", color: "white", fontWeight: 700 }} />
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between"
                  sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff8ec", border: "1px solid #ffe2b3" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <HourglassEmpty sx={{ color: "#ff9800" }} fontSize="small" />
                    <Typography variant="body2">Parcelles non vérifiées</Typography>
                  </Stack>
                  <Chip label={stats.parcelles.nonVerifiees} size="small" sx={{ bgcolor: "#ff9800", color: "white", fontWeight: 700 }} />
                </Stack>

                <Divider sx={{ my: 0.5 }} />
                <Typography variant="overline" color="text.secondary">Ventes par statut</Typography>
                {ventesEntries.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Aucune vente.</Typography>
                ) : (
                  ventesEntries.map(([statut, count]) => (
                    <Stack key={statut} direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle sx={{ color: "#27AE60", fontSize: 16 }} />
                        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>{statut}</Typography>
                      </Stack>
                      <Chip label={count} size="small" variant="outlined" />
                    </Stack>
                  ))
                )}
              </Stack>
            )}
          </PanelCard>
        </Grid>
      </Grid>

      {stats?.generatedAt && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3, textAlign: "right" }}>
          Mis à jour le {new Date(stats.generatedAt).toLocaleString("fr-FR")}
        </Typography>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
