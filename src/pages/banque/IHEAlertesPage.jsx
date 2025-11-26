import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  Alert,
  Stack,
  Container,
  Avatar,
  Tooltip,
  Badge,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  CalendarToday,
  LocationOn,
  AttachMoney,
  Home,
  Nature,
  Business,
  Warehouse,
  Square,
  Apartment,
  Villa,
  Refresh,
  Visibility,
  TrendingUp,
  AccessTime,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const IHEAlertesPage = () => {
  const navigate = useNavigate();
  const [ihesARisque, setIhesARisque] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    depasse: 0,
    urgent: 0,
    attention: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAlerte, setFilterAlerte] = useState(""); // "", "depasse", "urgent", "attention"
  const [tabValue, setTabValue] = useState(0);
  const [ihesDisplayed, setIhesDisplayed] = useState(3); // Nombre d'IHE affichées initialement

  useEffect(() => {
    fetchIHEsARisque();
  }, [filterAlerte]);

  const fetchIHEsARisque = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterAlerte) {
        params.append("niveauAlerte", filterAlerte);
      }

      const response = await api.get(
        `/banque/ihe/alertes-reglementaires?${params.toString()}`
      );
      setIhesARisque(response.data.ihes || []);
      setStats(response.data.stats || { total: 0, depasse: 0, urgent: 0, attention: 0 });
    } catch (err) {
      console.error("Erreur chargement IHE à risque:", err);
      setError("Erreur lors du chargement des IHE à risque");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // 0: tous, 1: dépassées, 2: urgentes, 3: attention
    const filters = ["", "depasse", "urgent", "attention"];
    setFilterAlerte(filters[newValue]);
    // Réinitialiser l'affichage quand on change d'onglet
    setIhesDisplayed(3);
  };

  // Fonction pour afficher plus d'IHE
  const handleShowMoreIHEs = () => {
    setIhesDisplayed((prev) => Math.min(prev + 3, ihesARisque.length));
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAlerteColor = (statut) => {
    switch (statut) {
      case "depasse":
        return "error";
      case "urgent":
        return "warning";
      case "attention":
        return "info";
      default:
        return "success";
    }
  };

  const getAlerteIcon = (statut) => {
    switch (statut) {
      case "depasse":
        return <Error />;
      case "urgent":
        return <Warning />;
      case "attention":
        return <Info />;
      default:
        return <CheckCircle />;
    }
  };

  const getAlerteLabel = (statut) => {
    switch (statut) {
      case "depasse":
        return "Dépassée";
      case "urgent":
        return "Urgente";
      case "attention":
        return "Attention";
      default:
        return "OK";
    }
  };

  const TYPE_ICONS = {
    terrain: Square,
    jardin: Nature,
    maison: Home,
    appartement: Apartment,
    villa: Villa,
    bureau: Business,
    entrepot: Warehouse,
    autre: Home,
  };

  const TYPE_COLORS = {
    terrain: "#795548",
    jardin: "#4caf50",
    maison: "#2196f3",
    appartement: "#f44336",
    villa: "#9c27b0",
    bureau: "#00bcd4",
    entrepot: "#ff9800",
    autre: "#607d8b",
  };

  const TYPE_LABELS = {
    terrain: "Terrain",
    jardin: "Jardin",
    maison: "Maison",
    appartement: "Appartement",
    villa: "Villa",
    bureau: "Bureau",
    entrepot: "Entrepôt",
    autre: "Autre",
  };

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                ⚠️ Suivi réglementaire des IHE
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Suivez les IHE approchant ou dépassant leur date limite de cession
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchIHEsARisque}
              disabled={loading}
            >
              Actualiser
            </Button>
          </Box>

          {/* Statistiques */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total IHE à risque
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Error />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Dépassées
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.depasse}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                  color: "#333",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Warning />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Urgentes (&lt; 3 mois)
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.urgent}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                  color: "#333",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Info />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Attention (3-6 mois)
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.attention}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Alertes critiques */}
          {stats.depasse > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                ⚠️ {stats.depasse} IHE ont dépassé leur date limite de cession !
              </Typography>
              <Typography variant="body2">
                Une action immédiate est requise pour éviter les sanctions réglementaires.
              </Typography>
            </Alert>
          )}
          {stats.urgent > 0 && stats.depasse === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                ⚠️ {stats.urgent} IHE approchent de leur date limite (&lt; 3 mois)
              </Typography>
              <Typography variant="body2">
                Préparez les plans de cession dès maintenant.
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Tabs pour filtrer */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                minHeight: 64,
              },
            }}
          >
            <Tab
              icon={<TrendingUp />}
              label={`Toutes (${stats.total})`}
              iconPosition="start"
            />
            <Tab
              icon={<Error />}
              label={
                <Badge badgeContent={stats.depasse} color="error">
                  Dépassées
                </Badge>
              }
              iconPosition="start"
            />
            <Tab
              icon={<Warning />}
              label={
                <Badge badgeContent={stats.urgent} color="warning">
                  Urgentes
                </Badge>
              }
              iconPosition="start"
            />
            <Tab
              icon={<Info />}
              label={
                <Badge badgeContent={stats.attention} color="info">
                  Attention
                </Badge>
              }
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Liste des IHE */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography color="text.secondary">Chargement des IHE à risque...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : ihesARisque.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center" }}>
            <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Aucune IHE à risque
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toutes vos IHE respectent les délais réglementaires.
            </Typography>
          </Card>
        ) : (
          <>
            <Grid 
              container 
              spacing={3}
              sx={{
                width: "100%",
                margin: 0,
              }}
            >
              {ihesARisque.slice(0, ihesDisplayed).map((ihe) => {
              const TypeIcon = TYPE_ICONS[ihe.type] || Home;
              const alerteColor = getAlerteColor(ihe.statutAlerteReglementaire);
              const AlerteIcon = getAlerteIcon(ihe.statutAlerteReglementaire);

              return (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4}
                  key={ihe._id}
                  sx={{
                    display: "flex",
                    flexBasis: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                    maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                    flexGrow: 0,
                    flexShrink: 0,
                  }}
                >
                  <Card
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 3,
                      border: `2px solid ${
                        ihe.statutAlerteReglementaire === "depasse"
                          ? "#f44336"
                          : ihe.statutAlerteReglementaire === "urgent"
                          ? "#ff9800"
                          : "#2196f3"
                      }`,
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        justifyContent: "flex-start",
                        p: { xs: 2, sm: 2.5, md: 3 },
                      }}
                    >
                      {/* En-tête avec alerte */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            sx={{
                              bgcolor: TYPE_COLORS[ihe.type] || "#607d8b",
                              width: 40,
                              height: 40,
                            }}
                          >
                            <TypeIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {ihe.reference}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {TYPE_LABELS[ihe.type]}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          icon={AlerteIcon}
                          label={getAlerteLabel(ihe.statutAlerteReglementaire)}
                          color={alerteColor}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </Box>

                      {/* Titre */}
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        gutterBottom
                        sx={{
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          hyphens: "auto",
                          whiteSpace: "normal",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {ihe.titre}
                      </Typography>

                      {/* Localisation */}
                      {ihe.localisation?.ville && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {ihe.localisation.ville}
                            {ihe.localisation.quartier && `, ${ihe.localisation.quartier}`}
                          </Typography>
                        </Box>
                      )}

                      {/* Valeur comptable */}
                      {ihe.valeurComptable && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <AttachMoney fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="bold">
                            {formatMoney(ihe.valeurComptable)}
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />

                      {/* Informations réglementaires */}
                      <Stack spacing={1}>
                        {ihe.dateReclassement && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Date de reclassement
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatDate(ihe.dateReclassement)}
                            </Typography>
                          </Box>
                        )}
                        {ihe.dateLimiteCession && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Date limite de cession
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color={
                                ihe.statutAlerteReglementaire === "depasse"
                                  ? "error.main"
                                  : ihe.statutAlerteReglementaire === "urgent"
                                  ? "warning.main"
                                  : "text.primary"
                              }
                            >
                              {formatDate(ihe.dateLimiteCession)}
                            </Typography>
                          </Box>
                        )}
                        {ihe.joursRestants !== undefined && (
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor:
                                ihe.statutAlerteReglementaire === "depasse"
                                  ? "error.50"
                                  : ihe.statutAlerteReglementaire === "urgent"
                                  ? "warning.50"
                                  : "info.50",
                              border: `1px solid ${
                                ihe.statutAlerteReglementaire === "depasse"
                                  ? "error.main"
                                  : ihe.statutAlerteReglementaire === "urgent"
                                  ? "warning.main"
                                  : "info.main"
                              }`,
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <AccessTime fontSize="small" />
                              <Typography variant="body2" fontWeight="bold">
                                {ihe.estDepasse
                                  ? `Dépassé de ${Math.abs(ihe.joursRestants)} jour(s)`
                                  : `${ihe.joursRestants} jour(s) restant(s)`}
                              </Typography>
                            </Box>
                            {ihe.moisRestants !== undefined && ihe.moisRestants > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                                ({ihe.moisRestants} mois)
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Stack>

                      {/* Actions */}
                      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/banque/ihe/${ihe._id}`)}
                        >
                          Voir détails
                        </Button>
                        {ihe.statut !== "vendu" && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/banque/ihe/${ihe._id}/modifier`)}
                          >
                            Modifier
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            </Grid>

            {/* Bouton "Afficher la suite" */}
            {ihesDisplayed < ihesARisque.length && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleShowMoreIHEs}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    fontWeight: 600,
                    borderRadius: 3,
                    textTransform: "none",
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                    },
                  }}
                >
                  Afficher la suite
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </PageLayout>
  );
};

export default IHEAlertesPage;

