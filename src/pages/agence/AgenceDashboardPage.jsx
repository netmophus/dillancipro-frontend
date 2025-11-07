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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

// juste avant le composant (après les imports)
const fixFileUrl = (path) => {
  if (!path) return undefined;
  const norm = String(path).replace(/\\/g, '/');
  return norm.startsWith('http') ? norm : `http://localhost:5000/${norm}`;
};

const AgenceDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [agenceInfo, setAgenceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ventesEnCours, setVentesEnCours] = useState([]);
  const [loadingVentes, setLoadingVentes] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAgenceInfo();
    fetchVentesEnCours();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/agence/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Erreur chargement statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgenceInfo = async () => {
    try {
      const response = await api.get("/agence/profile");
      setAgenceInfo(response.data);
    } catch (error) {
      console.error("Erreur chargement infos agence:", error);
    }
  };

  const fetchVentesEnCours = async () => {
    try {
      setLoadingVentes(true);
      const response = await api.get("/agence/ventes/agence");
      // Filtrer pour n'afficher que les ventes non finalisées
      const ventesNonFinalisees = response.data.filter(
        (v) => v.statut !== "finalisee" && v.statut !== "annulee"
      );
      setVentesEnCours(ventesNonFinalisees);
    } catch (error) {
      console.error("Erreur chargement ventes:", error);
    } finally {
      setLoadingVentes(false);
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

  // Calculs pour les pourcentages
  const tauxVente = stats.totalParcelles > 0 
    ? ((stats.parcellesVendues / stats.totalParcelles) * 100).toFixed(1) 
    : 0;
  const tauxDisponible = stats.totalParcelles > 0 
    ? ((stats.parcellesDisponibles / stats.totalParcelles) * 100).toFixed(1) 
    : 0;
  const tauxReserve = stats.totalParcelles > 0 
    ? ((stats.parcellesReservees / stats.totalParcelles) * 100).toFixed(1) 
    : 0;

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
          borderLeftWidth: "6px"
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
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: color,
                      borderRadius: 4,
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
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
            <Button
              size="small"
              endIcon={<ArrowForward />}
              onClick={action.onClick}
              sx={{ color }}
            >
              {action.label}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Formatage monétaire
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Couleurs et labels des statuts de vente
  const STATUT_COLORS = {
    en_attente_notaire: "warning",
    en_cours_notariat: "info",
    formalites_completes: "info",
    en_attente_signature: "primary",
    signee: "success",
    finalisee: "success",
    annulee: "error",
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

  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        {/* En-tête */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Tableau de bord - Agence Immobilière
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bonjour {user?.fullName || user?.phone}, voici un aperçu de votre activité.
          </Typography>
        </Box>

        {/* Informations de l'agence */}
        {agenceInfo && (
          <Card 
            elevation={4}
            sx={{ 
              mb: 4, 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "200px",
                height: "200px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
                transform: "translate(50%, -50%)",
              }
            }}
          >
            <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={2}>
             <Avatar
  src={fixFileUrl(agenceInfo.logo)}
  sx={{
    width: 100,
    height: 100,
    bgcolor: "rgba(255,255,255,0.2)",
    border: "3px solid rgba(255,255,255,0.3)",
    fontSize: "2rem",
    fontWeight: "bold",
  }}
>
                    {agenceInfo.logo ? null : agenceInfo.nom?.charAt(0) || "A"}
                  </Avatar>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {agenceInfo.nom || "Nom de l'agence"}
                    {agenceInfo.description && (
                      <Typography
                        component="span"
                        sx={{ ml: 1, fontWeight: 500, fontSize: { xs: "1rem", md: "1.125rem" }, opacity: 0.9 }}
                      >
                        {`  -  ${agenceInfo.description} `}
                      </Typography>
                    )}
                  </Typography>

                  
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9, minWidth: "80px" }}>
                        📞 Téléphone:
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {agenceInfo.telephone || "Non renseigné"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9, minWidth: "80px" }}>
                        🏢 NIF:
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {agenceInfo.nif || "Non renseigné"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9, minWidth: "80px" }}>
                        📋 RCCM:
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {agenceInfo.rccm || "Non renseigné"}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign={{ xs: "left", md: "right" }}>
                    <Chip
                      label="Agence Active"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: "bold",
                        mb: 2,
                      }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Membre depuis {new Date(agenceInfo.createdAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* 🔢 KPIs Principaux - Parcelles */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          🏘️ Parcelles
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Parcelles"
              value={stats.totalParcelles}
              subtitle={`${stats.superficieTotale.toFixed(2)} m² au total`}
              icon={Home}
              color="#2196f3"
              action={{
                label: "Voir tout",
                onClick: () => navigate("/agence/mes-parcelles"),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Parcelles Vendues"
              value={stats.parcellesVendues}
              subtitle={`${stats.superficieVendue.toFixed(2)} m² vendus`}
              icon={CheckCircle}
              color="#4caf50"
              progress={parseFloat(tauxVente)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Disponibles"
              value={stats.parcellesDisponibles}
              subtitle={`${(stats.superficieTotale - stats.superficieVendue).toFixed(2)} m² restants`}
              icon={HourglassEmpty}
              color="#ff9800"
              progress={parseFloat(tauxDisponible)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Réservées"
              value={stats.parcellesReservees}
              subtitle="En attente de vente"
              icon={Block}
              color="#f44336"
              progress={parseFloat(tauxReserve)}
            />
          </Grid>
        </Grid>

        {/* 🏠 KPIs Biens Immobiliers */}
        {stats.biens && (
          <>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              🏠 Biens Immobiliers
            </Typography>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Total Biens"
                  value={stats.biens.total}
                  subtitle={`${stats.biens.superficieTotale?.toFixed(2) || 0} m² au total`}
                  icon={Home}
                  color="#673ab7"
                  action={{
                    label: "Voir tout",
                    onClick: () => navigate("/agence/mes-biens"),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Biens Vendus"
                  value={stats.biens.vendus}
                  subtitle={`${stats.biens.superficieVendue?.toFixed(2) || 0} m² vendus`}
                  icon={CheckCircle}
                  color="#4caf50"
                  progress={stats.biens.total > 0 ? parseFloat(((stats.biens.vendus / stats.biens.total) * 100).toFixed(1)) : 0}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Disponibles"
                  value={stats.biens.disponibles}
                  subtitle={`${((stats.biens.superficieTotale || 0) - (stats.biens.superficieVendue || 0)).toFixed(2)} m² restants`}
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
          </>
        )}

        {/* 💰 KPIs Financiers */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          💰 Finances
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <KPICard
              title="Chiffre d'Affaires"
              value={formatMoney(stats.chiffreAffaires)}
              subtitle="Ventes totales"
              icon={TrendingUp}
              color="#9c27b0"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <KPICard
              title="Encaissements"
              value={formatMoney(stats.totalEncaissements)}
              subtitle={`${stats.totalPaiementsEnCours} paiement(s) en cours`}
              icon={Receipt}
              color="#00bcd4"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <KPICard
              title="Montant Restant"
              value={formatMoney(stats.montantRestantTotal)}
              subtitle={`${stats.paiementsPartiels} paiement(s) partiel(s)`}
              icon={Euro}
              color="#ff5722"
            />
          </Grid>
        </Grid>

        {/* 👥 Équipe & Géographie */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          👥 Équipe & 📍 Géographie
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <KPICard
              title="Commerciaux Actifs"
              value={stats.totalCommerciaux || 0}
              subtitle={stats.totalCommerciaux > 0 ? "Équipe de vente" : "Aucun commercial enrôlé"}
              icon={People}
              color="#3f51b5"
              action={{
                label: stats.totalCommerciaux > 0 ? "Gérer l'équipe" : "Enrôler le premier",
                onClick: () => navigate("/agence/enroller-commercial"),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%", borderLeft: "4px solid #607d8b" }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationCity sx={{ color: "#607d8b", mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="#607d8b">
                    Zones géographiques
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  🌐 Villes, quartiers et zones sont partagés entre toutes les agences
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">🏙️ Villes (partagées)</Typography>
                    <Typography variant="body2" fontWeight="bold" color={stats.statistiquesGeographiques.villes > 0 ? "text.primary" : "text.secondary"}>
                      {stats.statistiquesGeographiques.villes || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">🏘️ Quartiers (partagés)</Typography>
                    <Typography variant="body2" fontWeight="bold" color={stats.statistiquesGeographiques.quartiers > 0 ? "text.primary" : "text.secondary"}>
                      {stats.statistiquesGeographiques.quartiers || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">📍 Zones (partagées)</Typography>
                    <Typography variant="body2" fontWeight="bold" color={stats.statistiquesGeographiques.zones > 0 ? "text.primary" : "text.secondary"}>
                      {stats.statistiquesGeographiques.zones || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">🟦 Îlots (votre agence)</Typography>
                    <Typography variant="body2" fontWeight="bold" color={stats.statistiquesGeographiques.ilots > 0 ? "text.primary" : "text.secondary"}>
                      {stats.statistiquesGeographiques.ilots || 0}
                    </Typography>
                  </Box>
                </Stack>
                
                {/* Message d'encouragement pour nouvelle agence */}
                {stats.statistiquesGeographiques.ilots === 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      🚀 Commencez par créer vos premiers îlots pour développer votre activité !
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Graphique visuel simple - Répartition des parcelles */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", borderLeft: "4px solid #795548" }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assessment sx={{ color: "#795548", mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="#795548">
                    Répartition
                  </Typography>
                </Box>
                
                {/* Barre de progression composée */}
                <Box sx={{ mb: 2 }}>
                  <Box display="flex" height={40} borderRadius={2} overflow="hidden">
                    {stats.parcellesVendues > 0 && (
                      <Box 
                        sx={{ 
                          width: `${tauxVente}%`, 
                          bgcolor: '#4caf50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {tauxVente}%
                      </Box>
                    )}
                    {stats.parcellesDisponibles > 0 && (
                      <Box 
                        sx={{ 
                          width: `${tauxDisponible}%`, 
                          bgcolor: '#ff9800',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {tauxDisponible}%
                      </Box>
                    )}
                    {stats.parcellesReservees > 0 && (
                      <Box 
                        sx={{ 
                          width: `${tauxReserve}%`, 
                          bgcolor: '#f44336',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {tauxReserve}%
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Légende */}
                <Stack spacing={0.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: 1 }} />
                    <Typography variant="caption">Vendues ({stats.parcellesVendues || 0})</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: 1 }} />
                    <Typography variant="caption">Disponibles ({stats.parcellesDisponibles || 0})</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: 1 }} />
                    <Typography variant="caption">Réservées ({stats.parcellesReservees || 0})</Typography>
                  </Box>
                </Stack>
                
                {/* Message pour nouvelle agence sans parcelles */}
                {stats.totalParcelles === 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      📍 Aucune parcelle ajoutée. Commencez par créer votre première parcelle !
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 🏆 Top Commerciaux & 📋 Ventes Récentes */}
        <Grid container spacing={3} mb={4}>
          {/* Top Commerciaux */}
          {stats.topCommerciaux && stats.topCommerciaux.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🏆 Top Commerciaux
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
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
                          sx={{
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: index === 0 ? 'action.selected' : 'inherit'
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={index + 1}
                              size="small"
                              color={index === 0 ? "primary" : index === 1 ? "secondary" : "default"}
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={index === 0 ? 'bold' : 'normal'}>
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
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Ventes Récentes */}
          {stats.ventesRecentes && stats.ventesRecentes.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📋 Ventes Récentes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
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
                          <TableRow key={vente._id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {vente.parcelleNumero}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Îlot {vente.ilotNumero}
                              </Typography>
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
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* 📋 Ventes en cours avec les notaires */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 4 }}>
          ⚖️ Processus de vente avec les notaires
        </Typography>
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Gavel /> Ventes en cours chez les notaires
              </Typography>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/agence/mes-ventes")}
              >
                Voir tout
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loadingVentes ? (
              <Box display="flex" justifyContent="center" py={4}>
                <LinearProgress sx={{ width: "100%" }} />
              </Box>
            ) : ventesEnCours.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Gavel sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Aucune vente en cours avec les notaires
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Les ventes initiées par vos commerciaux apparaîtront ici
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
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
                        sx={{
                          bgcolor: vente.statut === "en_attente_signature" ? "action.selected" : "inherit"
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Home fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {vente.bienId?.titre || "N/A"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {vente.bienId?.type || ""}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2">
                              {vente.clientId?.fullName || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {vente.commercialId?.fullName || "N/A"}
                          </Typography>
                          {vente.commercialId?.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {vente.commercialId.phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Gavel fontSize="small" color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {vente.notaireId?.fullName || "N/A"}
                              </Typography>
                              {vente.notaireId?.cabinetName && (
                                <Typography variant="caption" color="text.secondary">
                                  {vente.notaireId.cabinetName}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatMoney(vente.prixVente)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={STATUT_LABELS[vente.statut] || vente.statut}
                            color={STATUT_COLORS[vente.statut] || "default"}
                            size="small"
                          />
                          {vente.statut === "en_attente_signature" && vente.signatures && (
                            <Box mt={0.5}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Commercial: {vente.signatures.commercial ? "✓" : "⏳"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Client: {vente.signatures.client ? "✓" : "⏳"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Agence: {vente.signatures.agence ? "✓" : "⏳"}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(vente.dateVente)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => navigate(`/agence/mes-ventes`)}
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
                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/agence/mes-ventes")}
                >
                  Voir les {ventesEnCours.length - 10} autres ventes
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* 🎯 Actions Rapides */}
        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed /> Actions Rapides
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  onClick={() => navigate("/agence/create-parcelle")}
                  sx={{ color: 'primary.main', fontWeight: 'bold' }}
                >
                  ➕ Ajouter Parcelle
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  onClick={() => navigate("/agence/create-bien")}
                  sx={{ color: 'primary.main', fontWeight: 'bold' }}
                >
                  🏠 Ajouter Bien
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  onClick={() => navigate("/agence/enroller-commercial")}
                  sx={{ color: 'primary.main', fontWeight: 'bold' }}
                >
                  👥 Enrôler Commercial
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/agence/affecter-commercial")}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  📋 Affecter
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/agence/mes-biens")}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  👁️ Voir Biens
                </Button>
              </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/agence/mes-ventes")}
                sx={{ borderColor: 'white', color: 'white', fontWeight: 'bold' }}
                startIcon={<Gavel />}
              >
                ⚖️ Mes Ventes
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/agence/echeanciers")}
                sx={{ borderColor: 'white', color: 'white', fontWeight: 'bold' }}
                startIcon={<CalendarToday />}
              >
                📅 Échéanciers
              </Button>
            </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </PageLayout>
  );
};

export default AgenceDashboardPage;
