import React, { useState, useEffect } from "react";
import {
  Box,
  GridLegacy as Grid,
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
  LinearProgress,
  Divider,
  Stack,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  Home,
  CheckCircle,
  HourglassEmpty,
  Block,
  People,
  LocationCity,
  Euro,
  Receipt,
  ArrowForward,
  Assessment,
  Speed,
  Gavel,
  Visibility,
  Person,
  CalendarToday,
  Apartment,
  AccountBalanceWallet,
  Refresh,
  EmojiEvents,
  Landscape,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AgenceLayout from "../../components/agence/AgenceLayout";
import Phone from "@mui/icons-material/Phone";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { BASE_SERVER_URL } from "../../config/config";

// Normalise une URL de fichier (logo) renvoyée par le serveur
const fixFileUrl = (path) => {
  if (!path) return undefined;
  const norm = String(path).replace(/\\/g, "/");
  return norm.startsWith("http") ? norm : `${BASE_SERVER_URL}/${norm}`;
};

const formatMoney = (amount) =>
  new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

// Couleurs de statut en charte (orange = attente, rouge = annulée)
const STATUT_CHIP_SX = {
  en_cours_notariat: { bgcolor: "#0e1133", color: "white" },
  formalites_completes: { bgcolor: "#3030F9", color: "white" },
  signee: { bgcolor: "#0A7C4F", color: "white" },
  finalisee: { bgcolor: "#0A7C4F", color: "white" },
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

// Carte KPI au style de l'espace admin (plat, bordé, hover relevé)
const KPICard = ({ label, value, sub, icon: Icon, color, progress, action }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 4,
      border: "1px solid rgba(15,23,42,0.08)",
      boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
      transition: "all 0.25s",
      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(15,23,42,0.10)" },
    }}
  >
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ minWidth: 0 }}>
          <Typography color="text.secondary" variant="body2">{label}</Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ color }} noWrap>{value}</Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary">{sub}</Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}15`, color, width: 46, height: 46 }}>
          <Icon />
        </Avatar>
      </Stack>
      {progress !== undefined && (
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 5,
              bgcolor: "#eef2f7",
              "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 5 },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            {progress}%
          </Typography>
        </Box>
      )}
      {action && (
        <Box mt={1.5}>
          <Button size="small" endIcon={<ArrowForward />} onClick={action.onClick} sx={{ color }}>
            {action.label}
          </Button>
        </Box>
      )}
    </CardContent>
  </Card>
);

// Conteneur de panneau (titre + icône) au style admin
const PanelCard = ({ title, icon: Icon, color, action, children }) => (
  <Card elevation={0} sx={{ height: "100%", borderRadius: 4, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: `${color}15`, color, width: 40, height: 40 }}>
            <Icon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" sx={{ color }}>{title}</Typography>
        </Stack>
        {action}
      </Stack>
      {children}
    </CardContent>
  </Card>
);

// Titre de section
const SectionTitle = ({ icon: Icon, color, children }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, mt: 1 }}>
    <Avatar sx={{ bgcolor: `${color}1f`, color, width: 36, height: 36 }}>
      <Icon fontSize="small" />
    </Avatar>
    <Typography variant="h6" fontWeight="bold" sx={{ color }}>{children}</Typography>
  </Stack>
);

const AgenceDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [agenceInfo, setAgenceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ventesEnCours, setVentesEnCours] = useState([]);
  const [loadingVentes, setLoadingVentes] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/agence/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Erreur chargement statistiques:", err);
      setError("Impossible de charger les statistiques. Vérifiez que le serveur est démarré.");
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
      const ventesNonFinalisees = response.data.filter(
        (v) => v.statut !== "finalisee" && v.statut !== "annulee"
      );
      setVentesEnCours(ventesNonFinalisees);
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

  // Pourcentages parcelles
  const tauxVente = stats && stats.totalParcelles > 0
    ? ((stats.parcellesVendues / stats.totalParcelles) * 100).toFixed(1) : 0;
  const tauxDisponible = stats && stats.totalParcelles > 0
    ? ((stats.parcellesDisponibles / stats.totalParcelles) * 100).toFixed(1) : 0;
  const tauxReserve = stats && stats.totalParcelles > 0
    ? ((stats.parcellesReservees / stats.totalParcelles) * 100).toFixed(1) : 0;

  return (
    <AgenceLayout>
      {/* Bandeau de bienvenue / profil agence */}
      <Card
        elevation={0}
        sx={{
          mb: 3.5,
          borderRadius: 4,
          background: "#3030F9",
          color: "white",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack direction="row" alignItems="center" spacing={2.5} sx={{ minWidth: 0 }}>
              <Avatar
                src={fixFileUrl(agenceInfo?.logo)}
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "3px solid rgba(255,255,255,0.4)",
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                }}
              >
                {agenceInfo?.logo ? null : agenceInfo?.nom?.charAt(0) || "A"}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h4" fontWeight="bold" noWrap>
                  {agenceInfo?.nom || "Tableau de bord"}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Bonjour {user?.fullName || user?.phone} • Vue d'ensemble de votre activité
                </Typography>
                {agenceInfo && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label="Agence active"
                      sx={{ bgcolor: "#0A7C4F", color: "white", fontWeight: 600 }}
                    />
                    {agenceInfo.telephone && (
                      <Chip size="small" icon={<Phone sx={{ color: "white !important", fontSize: 16 }} />} label={agenceInfo.telephone}
                        sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }} />
                    )}
                    {agenceInfo.nif && (
                      <Chip size="small" label={`NIF ${agenceInfo.nif}`}
                        sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }} />
                    )}
                    {agenceInfo.rccm && (
                      <Chip size="small" label={`RCCM ${agenceInfo.rccm}`}
                        sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }} />
                    )}
                  </Stack>
                )}
              </Box>
            </Stack>
            <Tooltip title="Rafraîchir">
              <IconButton onClick={refreshAll} sx={{ color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Parcelles */}
      <SectionTitle icon={Landscape} color="#3030F9">Parcelles</SectionTitle>
      <Grid container spacing={2.5} mb={2}>
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                label="Total parcelles"
                value={stats.totalParcelles}
                sub={`${stats.superficieTotale?.toFixed(2) || 0} m² au total`}
                icon={Home}
                color="#3030F9"
                action={{ label: "Voir tout", onClick: () => navigate("/agence/mes-biens") }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                label="Parcelles vendues"
                value={stats.parcellesVendues}
                sub={`${stats.superficieVendue?.toFixed(2) || 0} m² vendus`}
                icon={CheckCircle}
                color="#0A7C4F"
                progress={parseFloat(tauxVente)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                label="Disponibles"
                value={stats.parcellesDisponibles}
                sub={`${((stats.superficieTotale || 0) - (stats.superficieVendue || 0)).toFixed(2)} m² restants`}
                icon={HourglassEmpty}
                color="#0e1133"
                progress={parseFloat(tauxDisponible)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                label="Réservées"
                value={stats.parcellesReservees}
                sub="En attente de vente"
                icon={Block}
                color="#f44336"
                progress={parseFloat(tauxReserve)}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Biens immobiliers */}
      {!loading && stats?.biens && (
        <>
          <SectionTitle icon={Apartment} color="#0A7C4F">Biens immobiliers</SectionTitle>
          <Grid container spacing={2.5} mb={2}>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                label="Total biens"
                value={stats.biens.total}
                sub={`${stats.biens.superficieTotale?.toFixed(2) || 0} m² au total`}
                icon={Home}
                color="#0A7C4F"
                action={{ label: "Voir tout", onClick: () => navigate("/agence/mes-biens") }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                label="Biens vendus"
                value={stats.biens.vendus}
                sub={`${stats.biens.superficieVendue?.toFixed(2) || 0} m² vendus`}
                icon={CheckCircle}
                color="#3030F9"
                progress={stats.biens.total > 0 ? parseFloat(((stats.biens.vendus / stats.biens.total) * 100).toFixed(1)) : 0}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                label="Disponibles"
                value={stats.biens.disponibles}
                sub={`${((stats.biens.superficieTotale || 0) - (stats.biens.superficieVendue || 0)).toFixed(2)} m² restants`}
                icon={HourglassEmpty}
                color="#0e1133"
                progress={stats.biens.total > 0 ? parseFloat(((stats.biens.disponibles / stats.biens.total) * 100).toFixed(1)) : 0}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                label="CA biens"
                value={formatMoney(stats.biens.ca)}
                sub="Chiffre d'affaires"
                icon={TrendingUp}
                color="#0A7C4F"
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Finances */}
      {!loading && stats && (
        <>
          <SectionTitle icon={AccountBalanceWallet} color="#0e1133">Finances</SectionTitle>
          <Grid container spacing={2.5} mb={2}>
            <Grid item xs={12} sm={6} md={4}>
              <KPICard
                label="Chiffre d'affaires"
                value={formatMoney(stats.chiffreAffaires)}
                sub="Ventes totales"
                icon={TrendingUp}
                color="#3030F9"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <KPICard
                label="Encaissements"
                value={formatMoney(stats.totalEncaissements)}
                sub={`${stats.totalPaiementsEnCours} paiement(s) en cours`}
                icon={Receipt}
                color="#0A7C4F"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <KPICard
                label="Montant restant"
                value={formatMoney(stats.montantRestantTotal)}
                sub={`${stats.paiementsPartiels} paiement(s) partiel(s)`}
                icon={Euro}
                color="#0e1133"
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Équipe, géographie & répartition */}
      {!loading && stats && (
        <Grid container spacing={2.5} mt={0}>
          <Grid item xs={12} md={4}>
            <PanelCard title="Équipe commerciale" icon={People} color="#3030F9">
              <Stack alignItems="center" spacing={1} sx={{ py: 1 }}>
                <Typography variant="h3" fontWeight="bold" color="#3030F9">
                  {stats.totalCommerciaux || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.totalCommerciaux > 0 ? "Commerciaux actifs" : "Aucun commercial enrôlé"}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/agence/enroller-commercial")}
                  sx={{ mt: 1 }}
                >
                  {stats.totalCommerciaux > 0 ? "Gérer l'équipe" : "Enrôler le premier"}
                </Button>
              </Stack>
            </PanelCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <PanelCard title="Zones géographiques" icon={LocationCity} color="#0A7C4F">
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                Villes, quartiers et zones sont partagés entre toutes les agences.
              </Typography>
              <Stack spacing={1.25}>
                {[
                  { label: "Villes (partagées)", value: stats.statistiquesGeographiques?.villes },
                  { label: "Quartiers (partagés)", value: stats.statistiquesGeographiques?.quartiers },
                  { label: "Zones (partagées)", value: stats.statistiquesGeographiques?.zones },
                  { label: "Îlots (votre agence)", value: stats.statistiquesGeographiques?.ilots },
                ].map((row) => (
                  <Stack key={row.label} direction="row" justifyContent="space-between">
                    <Typography variant="body2">{row.label}</Typography>
                    <Typography variant="body2" fontWeight="bold" color={row.value > 0 ? "text.primary" : "text.secondary"}>
                      {row.value || 0}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              {stats.statistiquesGeographiques?.ilots === 0 && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: "#f6f8fb", borderRadius: 2, textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Commencez par créer vos premiers îlots pour développer votre activité.
                  </Typography>
                </Box>
              )}
            </PanelCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <PanelCard title="Répartition des parcelles" icon={Assessment} color="#0e1133">
              <Box display="flex" height={40} borderRadius={2} overflow="hidden" mb={2}>
                {stats.parcellesVendues > 0 && (
                  <Box sx={{ width: `${tauxVente}%`, bgcolor: "#0A7C4F", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: "bold" }}>
                    {tauxVente}%
                  </Box>
                )}
                {stats.parcellesDisponibles > 0 && (
                  <Box sx={{ width: `${tauxDisponible}%`, bgcolor: "#3030F9", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: "bold" }}>
                    {tauxDisponible}%
                  </Box>
                )}
                {stats.parcellesReservees > 0 && (
                  <Box sx={{ width: `${tauxReserve}%`, bgcolor: "#f44336", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: "bold" }}>
                    {tauxReserve}%
                  </Box>
                )}
              </Box>
              <Stack spacing={0.75}>
                {[
                  { c: "#0A7C4F", label: "Vendues", v: stats.parcellesVendues },
                  { c: "#3030F9", label: "Disponibles", v: stats.parcellesDisponibles },
                  { c: "#f44336", label: "Réservées", v: stats.parcellesReservees },
                ].map((row) => (
                  <Box key={row.label} display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 14, height: 14, bgcolor: row.c, borderRadius: 1 }} />
                    <Typography variant="caption">{row.label} ({row.v || 0})</Typography>
                  </Box>
                ))}
              </Stack>
              {stats.totalParcelles === 0 && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: "#f6f8fb", borderRadius: 2, textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Aucune parcelle. Commencez par créer votre première parcelle.
                  </Typography>
                </Box>
              )}
            </PanelCard>
          </Grid>
        </Grid>
      )}

      {/* Top commerciaux & ventes récentes */}
      {!loading && stats && (
        <Grid container spacing={2.5} mt={0}>
          {stats.topCommerciaux && stats.topCommerciaux.length > 0 && (
            <Grid item xs={12} md={6}>
              <PanelCard title="Top commerciaux" icon={EmojiEvents} color="#3030F9">
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
                      <TableRow
                        key={commercial.commercialId}
                        sx={{ "&:hover": { bgcolor: "action.hover" }, bgcolor: index === 0 ? "action.selected" : "inherit" }}
                      >
                        <TableCell>
                          <Chip
                            label={index + 1}
                            size="small"
                            color={index === 0 ? "primary" : index === 1 ? "secondary" : "default"}
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={index === 0 ? "bold" : "normal"}>
                            {commercial.nom || commercial.phone}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {commercial.totalVentes}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {formatMoney(commercial.totalCA)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </PanelCard>
            </Grid>
          )}

          {stats.ventesRecentes && stats.ventesRecentes.length > 0 && (
            <Grid item xs={12} md={6}>
              <PanelCard title="Ventes récentes" icon={Receipt} color="#0A7C4F">
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
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
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {formatMoney(vente.montant || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={vente.typePaiement === "total" ? "Total" : "Partiel"}
                              size="small"
                              color={vente.typePaiement === "total" ? "success" : "warning"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </PanelCard>
            </Grid>
          )}
        </Grid>
      )}

      {/* Ventes en cours avec les notaires */}
      <Box mt={3.5}>
        <PanelCard
          title="Ventes en cours chez les notaires"
          icon={Gavel}
          color="#3030F9"
          action={
            <Button variant="outlined" size="small" endIcon={<ArrowForward />} onClick={() => navigate("/agence/mes-ventes")}>
              Voir tout
            </Button>
          }
        >
          {loadingVentes ? (
            <Box py={3}><LinearProgress /></Box>
          ) : ventesEnCours.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Gavel sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
              <Typography variant="body1" color="text.secondary">
                Aucune vente en cours avec les notaires
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Les ventes initiées par vos commerciaux apparaîtront ici.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ "& .MuiTableCell-head": { color: "#3030F9", fontWeight: 700 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Bien</strong></TableCell>
                    <TableCell><strong>Client</strong></TableCell>
                    <TableCell><strong>Commercial</strong></TableCell>
                    <TableCell><strong>Notaire</strong></TableCell>
                    <TableCell align="right"><strong>Prix</strong></TableCell>
                    <TableCell align="center"><strong>Statut</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventesEnCours.slice(0, 10).map((vente) => (
                    <TableRow
                      key={vente._id}
                      hover
                      sx={{ bgcolor: vente.statut === "en_attente_signature" ? "action.selected" : "inherit" }}
                    >
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
                        {vente.commercialId?.phone && (
                          <Typography variant="caption" color="text.secondary">{vente.commercialId.phone}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Gavel fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">{vente.notaireId?.fullName || "N/A"}</Typography>
                            {vente.notaireId?.cabinetName && (
                              <Typography variant="caption" color="text.secondary">{vente.notaireId.cabinetName}</Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">{formatMoney(vente.prixVente)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={STATUT_LABELS[vente.statut] || vente.statut}
                          color={STATUT_COLORS[vente.statut] || "default"}
                          sx={STATUT_CHIP_SX[vente.statut]}
                          size="small"
                        />
                        {vente.statut === "en_attente_signature" && vente.signatures && (
                          <Box mt={0.5}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Commercial: {vente.signatures.commercial ? <CheckCircle sx={{ fontSize: 13, color: "#0A7C4F", verticalAlign: "middle" }} /> : <HourglassEmpty sx={{ fontSize: 13, color: "text.disabled", verticalAlign: "middle" }} />}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Client: {vente.signatures.client ? <CheckCircle sx={{ fontSize: 13, color: "#0A7C4F", verticalAlign: "middle" }} /> : <HourglassEmpty sx={{ fontSize: 13, color: "text.disabled", verticalAlign: "middle" }} />}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Agence: {vente.signatures.agence ? <CheckCircle sx={{ fontSize: 13, color: "#0A7C4F", verticalAlign: "middle" }} /> : <HourglassEmpty sx={{ fontSize: 13, color: "text.disabled", verticalAlign: "middle" }} />}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{formatDate(vente.dateVente)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => navigate("/agence/mes-ventes")}
                        >
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
              <Button variant="outlined" endIcon={<ArrowForward />} onClick={() => navigate("/agence/mes-ventes")}>
                Voir les {ventesEnCours.length - 10} autres ventes
              </Button>
            </Box>
          )}
        </PanelCard>
      </Box>

      {/* Actions rapides */}
      <Card
        elevation={0}
        sx={{
          mt: 3.5,
          borderRadius: 3,
          background: "#0e1133",
          color: "white",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Speed />
            <Typography variant="h6" fontWeight="bold">Actions rapides</Typography>
          </Stack>
          <Grid container spacing={2}>
            {[
              { label: "Créer un îlot", route: "/agence/create-ilot", filled: true },
              { label: "Ajouter une parcelle", route: "/agence/create-parcelle", filled: true },
              { label: "Ajouter un bien", route: "/agence/create-bien", filled: true },
              { label: "Enrôler un commercial", route: "/agence/enroller-commercial", filled: true },
              { label: "Voir mes biens", route: "/agence/mes-biens", filled: false },
              { label: "Mes ventes", route: "/agence/mes-ventes", filled: false, icon: <Gavel /> },
              { label: "Échéanciers", route: "/agence/echeanciers", filled: false, icon: <CalendarToday /> },
              { label: "Locations", route: "/agence/locations", filled: false },
            ].map((a) => (
              <Grid item xs={12} sm={6} md={3} key={a.route}>
                <Button
                  fullWidth
                  variant={a.filled ? "contained" : "outlined"}
                  color="inherit"
                  startIcon={a.icon}
                  onClick={() => navigate(a.route)}
                  sx={
                    a.filled
                      ? { bgcolor: "white", color: "#0e1133", fontWeight: "bold", "&:hover": { bgcolor: "#e3e8ef" } }
                      : { borderColor: "rgba(255,255,255,0.6)", color: "white", fontWeight: 600 }
                  }
                >
                  {a.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </AgenceLayout>
  );
};

export default AgenceDashboardPage;
