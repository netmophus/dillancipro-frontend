import React, { useEffect, useState } from "react";
import { Typography, Box, Skeleton, Alert, Button, CircularProgress } from "@mui/material";
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
  Dashboard as DashboardIcon,
  HourglassEmpty,
  NotificationsActive,
  CheckCircle,
  ChevronRight,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/admin/AdminLayout";
import API from "../../api";

const NIGHT = "#101C36";
const GREEN = "#008557";
const GREEN_DEEP = "#005C48";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

// Une couleur sobre par rôle
const ROLE_COLORS = {
  Admin: "#101C36",
  Agence: "#1859C9",
  Banque: "#008557",
  Ministere: "#0E7490",
  Commercial: "#C26716",
  Notaire: "#7041A5",
  User: "#64748B",
  Client: "#64748B",
};

const fmt = (n) => Number(n ?? 0).toLocaleString("fr-FR").replace(/[  ]/g, " ");

// Barre de répartition : libellé à gauche, nombre et pourcentage à droite, barre dessous
const DistroBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box sx={{ mb: "14px", "&:last-child": { mb: 0 } }}>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 0.75 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: NIGHT, overflowWrap: "anywhere" }}>{label}</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: 13.5, color: MUTED, whiteSpace: "nowrap" }}>
          <Box component="strong" sx={{ color: NIGHT }}>{fmt(value)}</Box> · {pct} %
        </Typography>
      </Box>
      <Box role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} sx={{ height: 9, borderRadius: "999px", bgcolor: "#E8EDF2", overflow: "hidden" }}>
        <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: color, borderRadius: "999px" }} />
      </Box>
    </Box>
  );
};

// Panneau statistique : entête homogène + contenu
const Panel = ({ title, icon: Icon, children }) => (
  <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", display: "flex", flexDirection: "column", minWidth: 0, boxShadow: "0 1px 3px rgba(16,28,54,0.04)" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, p: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
      <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#E5F3EC", color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon sx={{ fontSize: 21 }} />
      </Box>
      <Typography component="h2" sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NIGHT }}>{title}</Typography>
    </Box>
    <Box sx={{ p: "18px 20px 20px", flex: 1 }}>{children}</Box>
  </Box>
);

const GroupTitle = ({ children }) => (
  <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED, mb: 1.5 }}>{children}</Typography>
);

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
      setError(
        err?.response?.status === 401
          ? "Votre session a expiré. Veuillez vous reconnecter."
          : "Impossible de charger les statistiques. Vérifiez que le serveur est démarré."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Cartes KPI : quatre par ligne sur deux lignes
  const kpis = stats
    ? [
        { label: "Utilisateurs", value: stats.utilisateurs?.total, sub: `${fmt(stats.utilisateurs?.actifs)} actifs`, color: "#C26716", bg: "#FFF0DF", icon: People },
        { label: "Agences", value: stats.agences?.total, sub: `${fmt(stats.agences?.actives)} actives`, color: "#1859C9", bg: "#E8F0FD", icon: Business },
        { label: "Banques", value: stats.banques?.total, sub: "partenaires", color: "#008557", bg: "#E5F3EC", icon: AccountBalance },
        { label: "Notaires", value: stats.notaires?.total, sub: "partenaires", color: "#7041A5", bg: "#F1EAF8", icon: Gavel },
        { label: "Parcelles", value: stats.parcelles?.total, sub: `${fmt(stats.parcelles?.vendues)} vendues`, color: "#397B35", bg: "#EAF3E7", icon: Landscape },
        { label: "Biens immobiliers", value: stats.biens?.total, sub: `${fmt(stats.biens?.vendus)} vendus`, color: "#3659A2", bg: "#E8EEF9", icon: Apartment },
        { label: "Locations", value: stats.locations?.total, sub: "offres", color: "#C75232", bg: "#FCEDE7", icon: Home },
        { label: "Ventes patrimoine", value: stats.ventes?.total, sub: "au total", color: "#A62C55", bg: "#F9E8EF", icon: AttachMoney },
      ]
    : [];

  const rolesEntries = stats ? Object.entries(stats.utilisateurs?.parRole || {}).sort((a, b) => b[1] - a[1]) : [];
  const ventesEntries = stats ? Object.entries(stats.ventes?.parStatut || {}) : [];

  const kpiGrid = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
    "@media (min-width:375px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    "@media (min-width:1024px)": { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
  };

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: FONT }}>
        {/* Bandeau Tableau de bord */}
        <Box
          sx={{
            bgcolor: GREEN_DEEP,
            color: "#fff",
            borderRadius: "14px",
            p: { xs: "18px 16px", sm: "24px" },
            minHeight: { sm: 120 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, minWidth: 0, flex: "1 1 260px" }}>
            <Box sx={{ width: { xs: 48, sm: 60 }, height: { xs: 48, sm: 60 }, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <DashboardIcon sx={{ fontSize: { xs: 26, sm: 32 }, color: "#fff" }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h1" sx={{ fontFamily: FONT, fontSize: { xs: 24, sm: 30 }, fontWeight: 700, lineHeight: 1.2, color: "#fff" }}>
                Tableau de bord
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 15, color: "#fff", mt: 0.5, overflowWrap: "anywhere" }}>
                Bonjour {user?.fullName || user?.phone || ""}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 14, color: "#CFE9E0", mt: 0.25 }}>
                Vue d'ensemble de la plateforme Dillanci
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={fetchStats}
            disabled={loading}
            aria-label="Actualiser les statistiques"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh sx={{ fontSize: "22px !important" }} />}
            sx={{ height: 44, px: 2, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 14.5, color: "#fff", border: "1px solid rgba(255,255,255,0.45)", "&:hover": { bgcolor: "rgba(255,255,255,0.12)", border: "1px solid #fff" }, "&.Mui-disabled": { color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.3)" } }}
          >
            {loading ? "Actualisation…" : "Actualiser"}
          </Button>
        </Box>

        {error && (
          <Alert
            severity="warning"
            sx={{ borderRadius: "10px", fontFamily: FONT }}
            action={<Button color="inherit" size="small" onClick={fetchStats} sx={{ textTransform: "none", fontWeight: 700 }}>Réessayer</Button>}
          >
            {error}
          </Alert>
        )}

        {/* Huit indicateurs : 4 + 4 */}
        <Box sx={kpiGrid}>
          {loading && !stats
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="rounded" height={118} sx={{ borderRadius: "14px" }} />)
            : kpis.map((k) => (
                <Box
                  key={k.label}
                  sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", boxShadow: "0 1px 3px rgba(16,28,54,0.05)", p: { xs: "14px", sm: "16px 20px" }, minHeight: 118, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, minWidth: 0 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: MUTED, lineHeight: 1.25 }}>{k.label}</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: { xs: 28, sm: 32 }, fontWeight: 800, color: k.color, lineHeight: 1.2, mt: 0.25 }}>{fmt(k.value)}</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, mt: 0.25 }}>{k.sub}</Typography>
                  </Box>
                  <Box sx={{ width: { xs: 44, sm: 54 }, height: { xs: 44, sm: 54 }, borderRadius: "14px", bgcolor: k.bg, color: k.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <k.icon sx={{ fontSize: { xs: 26, sm: 30 } }} />
                  </Box>
                </Box>
              ))}
        </Box>

        {/* Trois panneaux statistiques */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "20px",
            alignItems: "stretch",
            "@media (min-width:768px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", "& > :last-child": { gridColumn: "1 / -1" } },
            "@media (min-width:1280px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))", "& > :last-child": { gridColumn: "auto" } },
          }}
        >
          <Panel title="Utilisateurs par rôle" icon={People}>
            {loading && !stats ? (
              <Skeleton variant="rounded" height={180} />
            ) : rolesEntries.length === 0 ? (
              <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED }}>Aucune donnée.</Typography>
            ) : (
              rolesEntries.map(([role, count]) => (
                <DistroBar key={role} label={role} value={count} total={stats.utilisateurs?.total || 0} color={ROLE_COLORS[role] || "#64748B"} />
              ))
            )}
          </Panel>

          <Panel title="Foncier & immobilier" icon={Landscape}>
            {loading && !stats ? (
              <Skeleton variant="rounded" height={180} />
            ) : stats ? (
              <>
                <GroupTitle>Parcelles</GroupTitle>
                <DistroBar label="Parcelles vendues" value={stats.parcelles?.vendues ?? 0} total={stats.parcelles?.total ?? 0} color="#3659A2" />
                <DistroBar label="Parcelles à vendre" value={stats.parcelles?.aVendre ?? 0} total={stats.parcelles?.total ?? 0} color={GREEN} />
                <Box sx={{ my: 2.25, borderTop: `1px solid ${BORDER}` }} />
                <GroupTitle>Biens immobiliers</GroupTitle>
                <DistroBar label="Biens disponibles" value={stats.biens?.disponibles ?? 0} total={stats.biens?.total ?? 0} color={GREEN} />
                <DistroBar label="Biens vendus" value={stats.biens?.vendus ?? 0} total={stats.biens?.total ?? 0} color="#3659A2" />
              </>
            ) : (
              <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED }}>Aucune donnée.</Typography>
            )}
          </Panel>

          <Panel title="À traiter" icon={NotificationsActive}>
            {loading && !stats ? (
              <Skeleton variant="rounded" height={180} />
            ) : stats ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box
                  component={RouterLink}
                  to="/admin/verification-agences"
                  sx={{ display: "flex", alignItems: "center", gap: 1.25, p: "12px 14px", borderRadius: "10px", bgcolor: "#FDECEC", border: "1px solid #F8CACA", color: "#9B1C1C", textDecoration: "none", "&:hover": { bgcolor: "#FBE0E0" }, "&:focus-visible": { outline: "2px solid #9B1C1C", outlineOffset: 2 } }}
                >
                  <HourglassEmpty sx={{ fontSize: 22, flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 600, flex: 1, minWidth: 0, color: "inherit" }}>Agences en attente</Typography>
                  <Box sx={{ minWidth: 30, height: 30, px: 0.75, borderRadius: "999px", bgcolor: "#D92D20", color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
                    {fmt(stats.agences?.enAttente)}
                  </Box>
                  <ChevronRight sx={{ fontSize: 20, flexShrink: 0 }} />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, p: "12px 14px", borderRadius: "10px", bgcolor: "#FFF4E5", border: "1px solid #FFE0B2", color: "#9A5B00" }}>
                  <HourglassEmpty sx={{ fontSize: 22, flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 600, flex: 1, minWidth: 0, color: "inherit" }}>Parcelles non vérifiées</Typography>
                  <Box sx={{ minWidth: 30, height: 30, px: 0.75, borderRadius: "999px", bgcolor: "#E8890C", color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
                    {fmt(stats.parcelles?.nonVerifiees)}
                  </Box>
                </Box>

                <Box sx={{ mt: 0.5, pt: 2, borderTop: `1px solid ${BORDER}` }}>
                  <GroupTitle>Ventes par statut</GroupTitle>
                  {ventesEntries.length === 0 ? (
                    <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED }}>Aucune vente enregistrée</Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {ventesEntries.map(([statut, count]) => (
                        <Box key={statut} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                            <CheckCircle sx={{ fontSize: 18, color: GREEN, flexShrink: 0 }} />
                            <Typography sx={{ fontFamily: FONT, fontSize: 14, color: NIGHT, textTransform: "capitalize", overflowWrap: "anywhere" }}>{String(statut).replace(/_/g, " ")}</Typography>
                          </Box>
                          <Box sx={{ minWidth: 28, height: 26, px: 1, borderRadius: "999px", bgcolor: "#E5F3EC", color: GREEN_DEEP, fontFamily: FONT, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
                            {fmt(count)}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED }}>Aucune donnée.</Typography>
            )}
          </Panel>
        </Box>

        {stats?.generatedAt && (
          <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, textAlign: "right" }}>
            Dernière actualisation : {new Date(stats.generatedAt).toLocaleString("fr-FR")}
          </Typography>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
