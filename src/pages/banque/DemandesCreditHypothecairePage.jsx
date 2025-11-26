import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import {
  Add,
  Visibility,
  Edit,
  Cancel,
  CheckCircle,
  HourglassEmpty,
  AccountBalance,
  AttachMoney,
  CalendarToday,
  Person,
  Home,
  Description,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const DemandesCreditHypothecairePage = () => {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    statut: "",
  });

  useEffect(() => {
    fetchDemandes();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.statut) {
        params.append("statut", filters.statut);
      } else {
        // Exclure les dossiers avec le statut "credit_octroye" car cette page concerne uniquement la formalisation notariale
        // Ne pas exclure si un statut spécifique est déjà sélectionné
        params.append("excludeStatut", "credit_octroye");
      }

      const response = await api.get(
        `/banque/demandes-credit-hypothecaire?${params.toString()}`
      );
      // Filtrer également côté client pour être sûr
      const demandesFiltered = (response.data.demandes || []).filter(
        (d) => d.statut !== "credit_octroye"
      );
      setDemandes(demandesFiltered);
    } catch (err) {
      console.error("Erreur chargement dossiers:", err);
      setError("Erreur lors du chargement des dossiers");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/banque/demandes-credit-hypothecaire/stats");
      setStats(response.data.stats);
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const STATUT_COLORS = {
    soumis_par_banque: "info",
    en_traitement_notaire: "warning",
    convention_formalisee: "success",
    inscription_hypothecaire_en_cours: "warning",
    inscription_hypothecaire_terminee: "success",
    rejete: "error",
    annule: "default",
  };

  const STATUT_LABELS = {
    soumis_par_banque: "Soumis par banque",
    en_traitement_notaire: "En traitement notaire",
    convention_formalisee: "Convention formalisée",
    inscription_hypothecaire_en_cours: "Inscription en cours",
    inscription_hypothecaire_terminee: "Inscription terminée",
    rejete: "Rejeté",
    annule: "Annulé",
  };

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* En-tête */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <IconButton onClick={() => navigate("/banque/dashboard")}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">
              📋 Formalisation Notariale
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Workflow de formalisation des documents (titre foncier, convention d'ouverture de crédit, acte hypothécaire) 
            chez le notaire partenaire dans le cadre d'un crédit avec garantie hypothécaire selon les procédures UMEMOA.
          </Typography>
        </Box>

        {/* Statistiques */}
        {stats && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total dossiers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {stats.total || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Montant total
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {formatMoney(stats.totalMontant || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    En traitement
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.parStatut?.en_traitement_notaire?.count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Formalisation terminée
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.parStatut?.inscription_hypothecaire_terminee?.count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Actions et filtres */}
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/banque/demandes-credit-hypothecaire/nouvelle")}
            sx={{ textTransform: "none" }}
          >
            Nouveau dossier
          </Button>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrer par statut</InputLabel>
            <Select
              value={filters.statut}
              label="Filtrer par statut"
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            >
              <MenuItem value="">Tous</MenuItem>
              {Object.entries(STATUT_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Liste des demandes */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : demandes.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun dossier trouvé
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/banque/demandes-credit-hypothecaire/nouvelle")}
                sx={{ mt: 2, textTransform: "none" }}
              >
                Créer un nouveau dossier
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Référence</strong></TableCell>
                  <TableCell><strong>Emprunteur</strong></TableCell>
                  <TableCell><strong>Montant</strong></TableCell>
                  <TableCell><strong>Notaire</strong></TableCell>
                  <TableCell><strong>Statut</strong></TableCell>
                  <TableCell><strong>Date soumission</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {demandes.map((demande) => (
                  <TableRow key={demande._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {demande.reference}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {demande.emprunteur?.nom} {demande.emprunteur?.prenom}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {demande.emprunteur?.telephone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatMoney(demande.montantCredit)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {demande.dureeRemboursement} mois
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {demande.notaireId?.fullName || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {demande.notaireId?.cabinetName || ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUT_LABELS[demande.statut] || demande.statut}
                        color={STATUT_COLORS[demande.statut] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(demande.dateSoumission)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          navigate(`/banque/demandes-credit-hypothecaire/${demande._id}`)
                        }
                      >
                        <Visibility />
                      </IconButton>
                      {demande.statut === "soumis_par_banque" && (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() =>
                            navigate(`/banque/demandes-credit-hypothecaire/${demande._id}/modifier`)
                          }
                        >
                          <Edit />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </PageLayout>
  );
};

export default DemandesCreditHypothecairePage;

