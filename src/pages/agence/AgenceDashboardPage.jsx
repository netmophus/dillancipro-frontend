import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Skeleton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp,
  Home,
  CheckCircle,
  HourglassEmpty,
  Bookmark,
  People,
  LocationCity,
  Receipt,
  ArrowForward,
  Assessment,
  Gavel,
  Visibility,
  Person,
  CalendarToday,
  Apartment,
  AccountBalanceWallet,
  Refresh,
  EmojiEvents,
  Landscape,
  Phone,
  Payments,
  Bolt,
  AddLocationAlt,
  Layers,
  PersonAdd,
  MeetingRoom,
  Storefront,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AgenceLayout from "../../components/agence/AgenceLayout";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { BASE_SERVER_URL } from "../../config/config";

const NIGHT = "#101C36";
const GREEN = "#008557";
const GREEN_DEEP = "#005C48";
const GREEN_DARK = "#004D40";
const BLUE = "#1859C9";
const ORANGE = "#C26716";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

// Normalise une URL de fichier (logo) renvoyée par le serveur
const fixFileUrl = (path) => {
  if (!path) return undefined;
  const norm = String(path).replace(/\\/g, "/");
  return norm.startsWith("http") ? norm : `${BASE_SERVER_URL}/${norm}`;
};

const nf = (n) => Number(n || 0).toLocaleString("fr-FR").replace(/[  ]/g, " ");
const formatMoney = (amount) => nf(amount) + " FCFA";
const m2 = (n) => Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 }).replace(/[  ]/g, " ") + " m²";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

const STATUT_COLORS = {
  en_attente_notaire: "warning",
  en_cours_notariat: "default",
  formalites_completes: "default",
  en_attente_signature: "warning",
  signee: "default",
  finalisee: "default",
  annulee: "error",
};

const STATUT_CHIP_SX = {
  en_cours_notariat: { bgcolor: NIGHT, color: "white" },
  formalites_completes: { bgcolor: BLUE, color: "white" },
  signee: { bgcolor: GREEN, color: "white" },
  finalisee: { bgcolor: GREEN, color: "white" },
};

const STATUT_LABELS = {
  en_attente_notaire: "En attente notaire",
  en_cours_notariat: "En cours notariat",
  formalites_completes: "Formalités complètes",
  en_attente_signature: "En attente signature",
  signee: "Signée",
  finalisee: "Finalisée",
  annulee: "Annulée",
};

const pct = (value, total) => (total > 0 ? Math.round((Number(value || 0) / total) * 1000) / 10 : 0);

// Grilles pilotées par la largeur réelle de la zone principale (container queries)
// (uniquement des media queries ici : mélanger @media et @container ferait gagner le dernier déclaré)
const gridCols = (small, mid, big, bigAt = 1024, midAt = 600) => ({
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "minmax(0, 1fr)",
  "@media (min-width: 375px)": { gridTemplateColumns: `repeat(${small}, minmax(0, 1fr))` },
  ...(mid ? { [`@media (min-width: ${midAt}px)`]: { gridTemplateColumns: `repeat(${mid}, minmax(0, 1fr))`, "& > :last-child:nth-child(odd)": { gridColumn: "1 / -1" } } } : {}),
  [`@media (min-width: ${bigAt}px)`]: { gridTemplateColumns: `repeat(${big}, minmax(0, 1fr))`, "& > :last-child:nth-child(odd)": { gridColumn: "auto" } },
});

// Carte statistique commune : libellé, icône, valeur, info, barre ou lien
const StatCard = ({ label, value, sub, icon: Icon, color, progress, action, unit }) => (
  <Box
    sx={{
      containerType: "inline-size",
      bgcolor: "#fff",
      border: `1px solid ${BORDER}`,
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,28,54,0.05)",
      p: "16px",
      minHeight: 132,
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      minWidth: 0,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
      <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: MUTED, lineHeight: 1.3 }}>{label}</Typography>
      <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: `${color}1A`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon sx={{ fontSize: 26 }} />
      </Box>
    </Box>
    <Typography sx={{ fontFamily: FONT, fontSize: "clamp(22px, 11cqw, 31px)", fontWeight: 800, color, lineHeight: 1.15, overflowWrap: "anywhere" }}>
      {value}
      {unit && <Box component="span" sx={{ fontSize: 13, fontWeight: 700, ml: 0.75, color: MUTED, whiteSpace: "nowrap", display: "inline-block" }}>{unit}</Box>}
    </Typography>
    {sub && <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, lineHeight: 1.35, overflowWrap: "anywhere" }}>{sub}</Typography>}
    {progress !== undefined && (
      <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 1 }}>
        <Box role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} sx={{ flex: 1, height: 8, borderRadius: "999px", bgcolor: "#E8EDF2", overflow: "hidden" }}>
          <Box sx={{ width: `${Math.min(100, progress)}%`, height: "100%", bgcolor: color, borderRadius: "999px" }} />
        </Box>
        <Typography sx={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: NIGHT, whiteSpace: "nowrap" }}>{progress} %</Typography>
      </Box>
    )}
    {action && (
      <Box
        component="button"
        type="button"
        onClick={action.onClick}
        sx={{ mt: "auto", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 0.5, p: 0, border: "none", bgcolor: "transparent", cursor: "pointer", fontFamily: FONT, fontSize: 13.5, fontWeight: 700, color, "&:hover": { textDecoration: "underline" } }}
      >
        {action.label}
        <ArrowForward sx={{ fontSize: 16 }} />
      </Box>
    )}
  </Box>
);

// Carte financière : grand montant et devise réduite
const FinanceCard = ({ label, amount, sub, icon: Icon, color }) => (
  <Box
    sx={{
      containerType: "inline-size",
      bgcolor: "#fff",
      border: `1px solid ${BORDER}`,
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,28,54,0.05)",
      p: "18px 20px",
      minHeight: 124,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1.5,
      minWidth: 0,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: MUTED }}>{label}</Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: "clamp(21px, 8.5cqw, 30px)", fontWeight: 800, color, lineHeight: 1.2, mt: 0.5, overflowWrap: "anywhere" }}>
        {nf(amount)}
        <Box component="span" sx={{ fontSize: 13, fontWeight: 700, ml: 0.75, color: MUTED, whiteSpace: "nowrap", display: "inline-block" }}>FCFA</Box>
      </Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, mt: 0.5 }}>{sub}</Typography>
    </Box>
    <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: `${color}1A`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 28 }} />
    </Box>
  </Box>
);

const SectionTitle = ({ icon: Icon, children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "14px" }}>
    <Icon sx={{ fontSize: 26, color: GREEN }} />
    <Typography component="h2" sx={{ fontFamily: FONT, fontSize: 21, fontWeight: 700, color: NIGHT }}>{children}</Typography>
  </Box>
);

const Panel = ({ title, icon: Icon, action, children }) => (
  <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", boxShadow: "0 1px 3px rgba(16,28,54,0.05)", p: "20px", minWidth: 0, display: "flex", flexDirection: "column" }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap", mb: "16px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#E5F3EC", color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Typography component="h3" sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NIGHT }}>{title}</Typography>
      </Box>
      {action}
    </Box>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);

const outlineBtn = {
  height: 40,
  px: 2,
  borderRadius: "10px",
  textTransform: "none",
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 14,
  color: GREEN,
  bgcolor: "#fff",
  border: `1.5px solid ${GREEN}`,
  "&:hover": { bgcolor: "#E5F3EC", border: `1.5px solid ${GREEN}` },
};

// Anneau de répartition (SVG), anneau gris neutre quand tout est à zéro
const Donut = ({ parts, total }) => {
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <Box sx={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
      <Box component="svg" viewBox="0 0 140 140" role="img" aria-label={`Répartition de ${total} parcelle(s)`} sx={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="#E8EDF2" strokeWidth="18" />
        {total > 0 &&
          parts.map((p) => {
            if (!p.v) return null;
            const len = (p.v / total) * C;
            const el = (
              <circle key={p.label} cx="70" cy="70" r={R} fill="none" stroke={p.c} strokeWidth="18" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />
            );
            offset += len;
            return el;
          })}
      </Box>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: NIGHT, lineHeight: 1 }}>{nf(total)}</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: 12, color: MUTED }}>parcelles</Typography>
      </Box>
    </Box>
  );
};

const emptyBox = { p: "12px 14px", bgcolor: "#F1F4F7", borderRadius: "10px", textAlign: "center" };

const AgenceDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [agenceInfo, setAgenceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ventesEnCours, setVentesEnCours] = useState([]);
  const [loadingVentes, setLoadingVentes] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/agence/stats");
      setStats(response.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erreur chargement statistiques:", err);
      setError(
        err?.response?.status === 401
          ? "Votre session a expiré. Veuillez vous reconnecter."
          : "Impossible de charger les statistiques. Vérifiez que le serveur est démarré."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAgenceInfo = async () => {
    try {
      const response = await api.get("/agence/profile");
      setAgenceInfo(response.data);
    } catch (err) {
      console.error("Erreur chargement infos agence:", err);
    }
  };

  const fetchVentesEnCours = async () => {
    try {
      setLoadingVentes(true);
      const response = await api.get("/agence/ventes/agence");
      setVentesEnCours(response.data.filter((v) => v.statut !== "finalisee" && v.statut !== "annulee"));
    } catch (err) {
      console.error("Erreur chargement ventes:", err);
    } finally {
      setLoadingVentes(false);
    }
  };

  const refreshAll = () => {
    fetchStats();
    fetchAgenceInfo();
    fetchVentesEnCours();
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tauxVente = stats ? pct(stats.parcellesVendues, stats.totalParcelles) : 0;
  const tauxDisponible = stats ? pct(stats.parcellesDisponibles, stats.totalParcelles) : 0;
  const tauxReserve = stats ? pct(stats.parcellesReservees, stats.totalParcelles) : 0;

  const badge = { display: "inline-flex", alignItems: "center", gap: 0.5, height: 26, px: 1.25, borderRadius: "999px", bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontFamily: FONT, fontSize: 12.5, fontWeight: 600, maxWidth: "100%" };

  const actions = [
    { label: "Créer un îlot", route: "/agence/create-ilot", filled: true, icon: Layers },
    { label: "Ajouter une parcelle", route: "/agence/create-parcelle", filled: true, icon: AddLocationAlt },
    { label: "Ajouter un bien", route: "/agence/create-bien", filled: true, icon: Apartment },
    { label: "Enrôler un commercial", route: "/agence/enroller-commercial", filled: true, icon: PersonAdd },
    { label: "Voir mes biens", route: "/agence/mes-biens", filled: false, icon: Home },
    { label: "Mes ventes", route: "/agence/mes-ventes", filled: false, icon: Gavel },
    { label: "Échéanciers", route: "/agence/echeanciers", filled: false, icon: CalendarToday },
    { label: "Locations", route: "/agence/locations", filled: false, icon: MeetingRoom },
  ];

  const geo = stats?.statistiquesGeographiques;

  return (
    <AgenceLayout lastUpdate={lastUpdate}>
      <Box sx={{ containerType: "inline-size", fontFamily: FONT }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          {/* Bandeau de l'agence */}
          <Box sx={{ position: "relative", overflow: "hidden", bgcolor: GREEN_DEEP, color: "#fff", borderRadius: "14px", p: { xs: "18px 16px", sm: "24px" }, minHeight: 140 }}>
            <Box
              aria-hidden="true"
              sx={{
                display: "none",
                "@container (min-width: 760px)": { display: "block" },
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "36%",
                backgroundImage: "url(/images/hero-biens.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 45%)",
                maskImage: "linear-gradient(to right, transparent 0%, #000 45%)",
              }}
            />
            <Box sx={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2.5 }, minWidth: 0, flex: "1 1 280px" }}>
                <Box
                  sx={{ width: { xs: 64, sm: 84 }, height: { xs: 64, sm: 84 }, borderRadius: "50%", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, color: GREEN_DEEP, fontWeight: 800, fontSize: 30, fontFamily: FONT }}
                >
                  {agenceInfo?.logo ? (
                    <Box component="img" src={fixFileUrl(agenceInfo.logo)} alt={`Logo ${agenceInfo?.nom || "de l'agence"}`} sx={{ width: "100%", height: "100%", objectFit: "contain", p: "6px", boxSizing: "border-box" }} />
                  ) : agenceInfo?.nom ? (
                    agenceInfo.nom.charAt(0).toUpperCase()
                  ) : (
                    <Storefront sx={{ fontSize: 36 }} />
                  )}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="h1" sx={{ fontFamily: FONT, fontSize: { xs: 22, sm: 30 }, fontWeight: 700, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                    {agenceInfo?.nom || "Tableau de bord"}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: 15, mt: 0.5, overflowWrap: "anywhere" }}>Bonjour {user?.fullName || user?.phone}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: 14, color: "#CFE9E0", mt: 0.25 }}>Vue d'ensemble de votre activité</Typography>
                </Box>
              </Box>
              <Button
                onClick={refreshAll}
                disabled={loading}
                aria-label="Actualiser les statistiques"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh sx={{ fontSize: "22px !important" }} />}
                sx={{ height: 44, px: 2, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 14.5, color: "#fff", border: "1px solid rgba(255,255,255,0.45)", bgcolor: GREEN_DEEP, "&:hover": { bgcolor: "#0A6B55", border: "1px solid #fff" }, "&.Mui-disabled": { color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.3)" } }}
              >
                {loading ? "Actualisation…" : "Actualiser"}
              </Button>
            </Box>
            {agenceInfo && (
              <Box sx={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                <Box sx={{ ...badge, bgcolor: GREEN }}>
                  <CheckCircle sx={{ fontSize: 15 }} />
                  Agence active
                </Box>
                {agenceInfo.telephone && (
                  <Box sx={badge}>
                    <Phone sx={{ fontSize: 15 }} />
                    {agenceInfo.telephone}
                  </Box>
                )}
                {agenceInfo.nif && <Box sx={badge}>NIF {agenceInfo.nif}</Box>}
                {agenceInfo.rccm && <Box sx={badge}>RCCM {agenceInfo.rccm}</Box>}
              </Box>
            )}
          </Box>

          {error && (
            <Alert severity="warning" sx={{ borderRadius: "10px", fontFamily: FONT }} action={<Button color="inherit" size="small" onClick={refreshAll} sx={{ textTransform: "none", fontWeight: 700 }}>Réessayer</Button>}>
              {error}
            </Alert>
          )}

          {/* Parcelles */}
          <Box>
            <SectionTitle icon={Landscape}>Parcelles</SectionTitle>
            <Box sx={gridCols(2, null, 4)}>
              {loading && !stats ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" height={132} sx={{ borderRadius: "14px" }} />)
              ) : stats ? (
                <>
                  <StatCard label="Total parcelles" value={nf(stats.totalParcelles)} sub={`${m2(stats.superficieTotale)} au total`} icon={Landscape} color={BLUE} action={{ label: "Voir tout", onClick: () => navigate("/agence/mes-biens") }} />
                  <StatCard label="Parcelles vendues" value={nf(stats.parcellesVendues)} sub={`${m2(stats.superficieVendue)} vendus`} icon={CheckCircle} color={GREEN} progress={tauxVente} />
                  <StatCard label="Disponibles" value={nf(stats.parcellesDisponibles)} sub={`${m2((stats.superficieTotale || 0) - (stats.superficieVendue || 0))} restants`} icon={HourglassEmpty} color={NIGHT} progress={tauxDisponible} />
                  <StatCard label="Réservées" value={nf(stats.parcellesReservees)} sub="En attente de vente" icon={Bookmark} color={ORANGE} progress={tauxReserve} />
                </>
              ) : null}
            </Box>
          </Box>

          {/* Biens immobiliers */}
          {!loading && stats?.biens && (
            <Box>
              <SectionTitle icon={Apartment}>Biens immobiliers</SectionTitle>
              <Box sx={gridCols(2, null, 4)}>
                <StatCard label="Total biens" value={nf(stats.biens.total)} sub={`${m2(stats.biens.superficieTotale)} au total`} icon={Home} color={GREEN} action={{ label: "Voir tout", onClick: () => navigate("/agence/mes-biens") }} />
                <StatCard label="Biens vendus" value={nf(stats.biens.vendus)} sub={`${m2(stats.biens.superficieVendue)} vendus`} icon={CheckCircle} color={BLUE} progress={pct(stats.biens.vendus, stats.biens.total)} />
                <StatCard label="Disponibles" value={nf(stats.biens.disponibles)} sub={`${m2((stats.biens.superficieTotale || 0) - (stats.biens.superficieVendue || 0))} restants`} icon={HourglassEmpty} color={NIGHT} progress={pct(stats.biens.disponibles, stats.biens.total)} />
                <StatCard label="CA biens" value={nf(stats.biens.ca)} unit="FCFA" sub="Chiffre d'affaires" icon={TrendingUp} color={GREEN} />
              </Box>
            </Box>
          )}

          {/* Finances */}
          {!loading && stats && (
            <Box>
              <SectionTitle icon={AccountBalanceWallet}>Finances</SectionTitle>
              <Box sx={gridCols(1, 2, 3, 1280)}>
                <FinanceCard label="Chiffre d'affaires" amount={stats.chiffreAffaires} sub="Ventes totales" icon={TrendingUp} color={GREEN_DEEP} />
                <FinanceCard label="Encaissements" amount={stats.totalEncaissements} sub={`${stats.totalPaiementsEnCours} paiement(s) en cours`} icon={Payments} color={GREEN} />
                <FinanceCard label="Montant restant" amount={stats.montantRestantTotal} sub={`${stats.paiementsPartiels} paiement(s) partiel(s)`} icon={Receipt} color={NIGHT} />
              </Box>
            </Box>
          )}

          {/* Équipe, zones géographiques et répartition */}
          {!loading && stats && (
            <Box
              sx={{
                display: "grid",
                gap: "20px",
                alignItems: "stretch",
                gridTemplateColumns: "minmax(0, 1fr)",
                "@container (min-width: 640px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", "& > :last-child": { gridColumn: "1 / -1" } },
                "@container (min-width: 900px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))", "& > :last-child": { gridColumn: "auto" } },
              }}
            >
              <Panel title="Équipe commerciale" icon={People}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, py: 1 }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: 44, fontWeight: 800, color: GREEN, lineHeight: 1 }}>{nf(stats.totalCommerciaux)}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED }}>
                    {stats.totalCommerciaux > 0 ? "Commerciaux actifs" : "Aucun commercial enrôlé"}
                  </Typography>
                  <Button onClick={() => navigate("/agence/enroller-commercial")} endIcon={<ArrowForward />} sx={{ ...outlineBtn, mt: 1 }}>
                    {stats.totalCommerciaux > 0 ? "Gérer l'équipe" : "Enrôler le premier"}
                  </Button>
                </Box>
              </Panel>

              <Panel title="Zones géographiques" icon={LocationCity}>
                <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, mb: 1 }}>
                  Villes, quartiers et zones sont partagés entre toutes les agences.
                </Typography>
                <Box>
                  {[
                    { label: "Villes (partagées)", value: geo?.villes },
                    { label: "Quartiers (partagés)", value: geo?.quartiers },
                    { label: "Zones (partagées)", value: geo?.zones },
                    { label: "Îlots (votre agence)", value: geo?.ilots },
                  ].map((row) => (
                    <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, py: "9px", borderBottom: `1px solid ${BORDER}`, "&:last-of-type": { borderBottom: "none" } }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: 14, color: NIGHT }}>{row.label}</Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: NIGHT }}>{nf(row.value)}</Typography>
                    </Box>
                  ))}
                </Box>
                {geo?.ilots === 0 && (
                  <Box sx={{ ...emptyBox, mt: 1.5 }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, fontStyle: "italic" }}>
                      Commencez par créer vos premiers îlots pour développer votre activité.
                    </Typography>
                  </Box>
                )}
              </Panel>

              <Panel title="Répartition des parcelles" icon={Assessment}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2.5, flexWrap: "wrap" }}>
                  <Donut
                    total={stats.totalParcelles || 0}
                    parts={[
                      { c: GREEN, label: "Vendues", v: stats.parcellesVendues },
                      { c: BLUE, label: "Disponibles", v: stats.parcellesDisponibles },
                      { c: ORANGE, label: "Réservées", v: stats.parcellesReservees },
                    ]}
                  />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 140 }}>
                    {[
                      { c: GREEN, label: "Vendues", v: stats.parcellesVendues },
                      { c: BLUE, label: "Disponibles", v: stats.parcellesDisponibles },
                      { c: ORANGE, label: "Réservées", v: stats.parcellesReservees },
                    ].map((row) => (
                      <Box key={row.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: row.c, borderRadius: "3px", flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: 13.5, color: NIGHT }}>
                          {row.label} <Box component="strong">({nf(row.v)})</Box>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                {stats.totalParcelles === 0 && (
                  <Box sx={{ ...emptyBox, mt: 1.5 }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, fontStyle: "italic" }}>
                      Aucune parcelle. Commencez par créer votre première parcelle.
                    </Typography>
                  </Box>
                )}
              </Panel>
            </Box>
          )}

          {/* Top commerciaux et ventes récentes */}
          {!loading && stats && ((stats.topCommerciaux && stats.topCommerciaux.length > 0) || (stats.ventesRecentes && stats.ventesRecentes.length > 0)) && (
            <Box sx={{ display: "grid", gap: "20px", gridTemplateColumns: "minmax(0, 1fr)", "@container (min-width: 900px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } }}>
              {stats.topCommerciaux && stats.topCommerciaux.length > 0 && (
                <Panel title="Top commerciaux" icon={EmojiEvents}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Rang</TableCell>
                          <TableCell>Nom</TableCell>
                          <TableCell align="right">Ventes</TableCell>
                          <TableCell align="right">CA</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.topCommerciaux.map((commercial, index) => (
                          <TableRow key={commercial.commercialId} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                            <TableCell>
                              <Chip label={index + 1} size="small" sx={{ fontWeight: "bold", bgcolor: index === 0 ? GREEN : "#E8EDF2", color: index === 0 ? "#fff" : NIGHT }} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={index === 0 ? "bold" : "normal"}>{commercial.nom || commercial.phone}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" sx={{ color: BLUE }}>{commercial.totalVentes}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" sx={{ color: GREEN, whiteSpace: "nowrap" }}>{formatMoney(commercial.totalCA)}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Panel>
              )}

              {stats.ventesRecentes && stats.ventesRecentes.length > 0 && (
                <Panel title="Ventes récentes" icon={Receipt}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Parcelle</TableCell>
                          <TableCell>Acheteur</TableCell>
                          <TableCell align="right">Montant</TableCell>
                          <TableCell align="center">Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.ventesRecentes.slice(0, 5).map((vente) => (
                          <TableRow key={vente._id} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">{vente.parcelleNumero}</Typography>
                              <Typography variant="caption" color="text.secondary">Îlot {vente.ilotNumero}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{vente.acquereur}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" sx={{ color: GREEN, whiteSpace: "nowrap" }}>{formatMoney(vente.montant || 0)}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={vente.typePaiement === "total" ? "Total" : "Partiel"} size="small" sx={vente.typePaiement === "total" ? { bgcolor: GREEN, color: "#fff" } : { bgcolor: "#FFF0DF", color: ORANGE, fontWeight: 600 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Panel>
              )}
            </Box>
          )}

          {/* Ventes en cours chez les notaires */}
          <Panel
            title="Ventes en cours chez les notaires"
            icon={Gavel}
            action={
              <Button onClick={() => navigate("/agence/mes-ventes")} endIcon={<ArrowForward />} sx={outlineBtn}>
                Voir tout
              </Button>
            }
          >
            {loadingVentes ? (
              <Box py={3}><LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: GREEN }, bgcolor: "#E5F3EC" }} /></Box>
            ) : ventesEnCours.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 2.5, minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Gavel sx={{ fontSize: 40, color: "#A8B3C1", mb: 1 }} />
                <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: MUTED }}>Aucune vente en cours avec les notaires</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: 13, color: MUTED, mt: 0.5 }}>Les ventes initiées par vos commerciaux apparaîtront ici.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ "& .MuiTableCell-head": { color: GREEN_DEEP, fontWeight: 700 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bien</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Commercial</TableCell>
                      <TableCell>Notaire</TableCell>
                      <TableCell align="right">Prix</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ventesEnCours.slice(0, 10).map((vente) => (
                      <TableRow key={vente._id} hover sx={{ bgcolor: vente.statut === "en_attente_signature" ? "action.selected" : "inherit" }}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Home fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">{vente.bienId?.titre || "N/A"}</Typography>
                              <Typography variant="caption" color="text.secondary">{vente.bienId?.type || ""}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2">{vente.clientId?.fullName || "N/A"}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{vente.commercialId?.fullName || "N/A"}</Typography>
                          {vente.commercialId?.phone && <Typography variant="caption" color="text.secondary">{vente.commercialId.phone}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Gavel fontSize="small" sx={{ color: GREEN }} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">{vente.notaireId?.fullName || "N/A"}</Typography>
                              {vente.notaireId?.cabinetName && <Typography variant="caption" color="text.secondary">{vente.notaireId.cabinetName}</Typography>}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" sx={{ color: GREEN_DEEP, whiteSpace: "nowrap" }}>{formatMoney(vente.prixVente)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={STATUT_LABELS[vente.statut] || vente.statut} color={STATUT_COLORS[vente.statut] || "default"} sx={STATUT_CHIP_SX[vente.statut]} size="small" />
                          {vente.statut === "en_attente_signature" && vente.signatures && (
                            <Box mt={0.5}>
                              {[["Commercial", vente.signatures.commercial], ["Client", vente.signatures.client], ["Agence", vente.signatures.agence]].map(([lbl, ok]) => (
                                <Typography key={lbl} variant="caption" color="text.secondary" display="block">
                                  {lbl}: {ok ? <CheckCircle sx={{ fontSize: 13, color: GREEN, verticalAlign: "middle" }} /> : <HourglassEmpty sx={{ fontSize: 13, color: "text.disabled", verticalAlign: "middle" }} />}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{formatDate(vente.dateVente)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => navigate("/agence/mes-ventes")} sx={{ textTransform: "none", color: GREEN, borderColor: GREEN }}>
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {ventesEnCours.length > 10 && (
              <Box mt={2} textAlign="center">
                <Button onClick={() => navigate("/agence/mes-ventes")} endIcon={<ArrowForward />} sx={outlineBtn}>
                  Voir les {ventesEnCours.length - 10} autres ventes
                </Button>
              </Box>
            )}
          </Panel>

          {/* Actions rapides */}
          <Box sx={{ bgcolor: GREEN_DARK, color: "#fff", borderRadius: "14px", p: "20px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Bolt sx={{ fontSize: 24 }} />
              <Typography component="h2" sx={{ fontFamily: FONT, fontSize: 19, fontWeight: 700, color: "#fff" }}>Actions rapides</Typography>
            </Box>
            <Box sx={gridCols(2, null, 4)}>
              {actions.map((a) => (
                <Box
                  key={a.route}
                  component="button"
                  type="button"
                  onClick={() => navigate(a.route)}
                  sx={{
                    minHeight: a.filled ? 52 : 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 1.25,
                    px: 1.75,
                    py: 0.75,
                    borderRadius: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: FONT,
                    fontSize: 14.5,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    minWidth: 0,
                    ...(a.filled
                      ? { bgcolor: "#fff", color: NIGHT, border: "1px solid #fff", "&:hover": { bgcolor: "#E5F3EC" } }
                      : { bgcolor: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.45)", "&:hover": { bgcolor: "rgba(255,255,255,0.10)" } }),
                    "&:focus-visible": { outline: "2px solid #8DDBC0", outlineOffset: 2 },
                  }}
                >
                  <a.icon sx={{ fontSize: 22, flexShrink: 0, color: a.filled ? GREEN : "#fff" }} />
                  <Box component="span" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{a.label}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </AgenceLayout>
  );
};

export default AgenceDashboardPage;
