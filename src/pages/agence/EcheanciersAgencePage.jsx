import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  CalendarToday,
  Edit,
  CheckCircle,
  Warning,
  Schedule,
  AttachMoney,
  Visibility,
  Refresh,
  Cancel,
  Home,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AgenceLayout from "../../components/agence/AgenceLayout";
import AgencePageHeader from "../../components/agence/AgencePageHeader";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const EcheanciersAgencePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [echeanciers, setEcheanciers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEcheancier, setSelectedEcheancier] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [modifierDateOpen, setModifierDateOpen] = useState(false);
  const [modifierMontantOpen, setModifierMontantOpen] = useState(false);
  const [rembourserOpen, setRembourserOpen] = useState(false);
  const [echeanceAModifier, setEcheanceAModifier] = useState(null);
  const [nouvelleDate, setNouvelleDate] = useState("");
  const [nouveauMontant, setNouveauMontant] = useState("");
  const [statutFiltre, setStatutFiltre] = useState("all"); // all, en_cours, termine, en_retard

  useEffect(() => {
    fetchEcheanciers();
  }, [statutFiltre]);

  const fetchEcheanciers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/agence/echeanciers/agence");
      setEcheanciers(response.data || []);
    } catch (err) {
      console.error("Erreur chargement échéanciers:", err);
      setError("Erreur lors du chargement des échéanciers");
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "termine":
        return "success";
      case "en_cours":
        return "warning";
      case "annule":
        return "error";
      default:
        return "default";
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case "termine":
        return "Terminé";
      case "en_cours":
        return "En cours";
      case "annule":
        return "Annulé";
      default:
        return statut;
    }
  };

  const getEcheanceStatutColor = (statut) => {
    switch (statut) {
      case "payee":
        return "success";
      case "en_retard":
        return "error";
      case "a_venir":
        return "warning";
      default:
        return "default";
    }
  };

  const getEcheanceStatutLabel = (statut) => {
    switch (statut) {
      case "payee":
        return "Payée";
      case "en_retard":
        return "En retard";
      case "a_venir":
        return "À venir";
      default:
        return statut;
    }
  };

  const ouvrirDetails = async (echeancier) => {
    try {
      const res = await api.get(`/agence/echeanciers/${echeancier._id}`);
      setSelectedEcheancier(res.data);
      setDetailsOpen(true);
    } catch (err) {
      setError("Erreur lors du chargement des détails de l'échéancier");
    }
  };

  const ouvrirModifierDate = (echeance) => {
    setEcheanceAModifier(echeance);
    setNouvelleDate(echeance.dateEcheance ? new Date(echeance.dateEcheance).toISOString().split('T')[0] : "");
    setModifierDateOpen(true);
  };

  const ouvrirModifierMontant = (echeance) => {
    setEcheanceAModifier(echeance);
    setNouveauMontant(echeance.montant?.toString() || "");
    setModifierMontantOpen(true);
  };

  const confirmerModifierDate = async () => {
    if (!selectedEcheancier || !echeanceAModifier || !nouvelleDate) return;

    try {
      const echeancesMisesAJour = selectedEcheancier.echeances.map((e) => {
        if (e._id.toString() === echeanceAModifier._id.toString()) {
          return {
            _id: e._id,
            dateEcheance: nouvelleDate,
            montant: e.montant,
            statut: e.statut,
            notes: e.notes || "",
          };
        }
        return {
          _id: e._id,
          dateEcheance: e.dateEcheance,
          montant: e.montant,
          statut: e.statut,
          notes: e.notes || "",
        };
      });

      await api.put(`/agence/echeanciers/${selectedEcheancier._id}`, {
        echeances: echeancesMisesAJour,
      });

      await fetchEcheanciers();
      await ouvrirDetails(selectedEcheancier);
      setModifierDateOpen(false);
      setEcheanceAModifier(null);
      setNouvelleDate("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification de la date");
    }
  };

  const confirmerModifierMontant = async () => {
    if (!selectedEcheancier || !echeanceAModifier || !nouveauMontant || parseFloat(nouveauMontant) <= 0) {
      setError("Le montant doit être supérieur à 0");
      return;
    }

    try {
      const echeancesMisesAJour = selectedEcheancier.echeances.map((e) => {
        if (e._id.toString() === echeanceAModifier._id.toString()) {
          return {
            _id: e._id,
            dateEcheance: e.dateEcheance,
            montant: parseFloat(nouveauMontant),
            statut: e.statut,
            notes: e.notes || "",
          };
        }
        return {
          _id: e._id,
          dateEcheance: e.dateEcheance,
          montant: e.montant,
          statut: e.statut,
          notes: e.notes || "",
        };
      });

      // Recalculer le total
      const nouveauTotal = echeancesMisesAJour.reduce((sum, e) => sum + parseFloat(e.montant || 0), 0);
      
      // Mettre à jour le montant total de l'échéancier si nécessaire
      await api.put(`/agence/echeanciers/${selectedEcheancier._id}`, {
        echeances: echeancesMisesAJour,
        montantTotal: nouveauTotal, // Permettre l'ajustement du total
      });

      await fetchEcheanciers();
      await ouvrirDetails(selectedEcheancier);
      setModifierMontantOpen(false);
      setEcheanceAModifier(null);
      setNouveauMontant("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification du montant");
    }
  };

  const ouvrirRembourser = (echeancier) => {
    setSelectedEcheancier(echeancier);
    setRembourserOpen(true);
  };

  const confirmerRembourser = async () => {
    if (!selectedEcheancier) return;

    try {
      // Appeler l'API de remboursement
      const response = await api.post(`/agence/echeanciers/${selectedEcheancier._id}/rembourser`);
      
      await fetchEcheanciers();
      setRembourserOpen(false);
      setDetailsOpen(false);
      setSelectedEcheancier(null);
      
      // Afficher un message de succès
      alert(response.data.message || "Remboursement effectué avec succès !");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du remboursement");
    }
  };

  // Filtrer les échéanciers selon le statut
  const echeanciersFiltres = echeanciers.filter((e) => {
    if (statutFiltre === "all") return true;
    if (statutFiltre === "en_retard") {
      return e.echeances?.some(ech => ech.statut === "en_retard");
    }
    return e.statut === statutFiltre;
  });

  return (
    <AgenceLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <AgencePageHeader
          icon={CalendarMonth}
          title="Gestion des Échéanciers"
          subtitle="Suivez les paiements et échéances de vos ventes"
          action={
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchEcheanciers}
              sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white" }}
            >
              Actualiser
            </Button>
          }
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {!loading && echeanciers.length > 0 && (
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {[
              { label: "Total échéanciers", value: echeanciers.length, icon: CalendarMonth, color: "#00bcd4" },
              { label: "En cours", value: echeanciers.filter((e) => e.statut === "en_cours").length, icon: HourglassEmptyIcon, color: "#ff9800" },
              { label: "Terminés", value: echeanciers.filter((e) => e.statut === "termine").length, icon: CheckCircle, color: "#2e7d32" },
            ].map((kpi) => (
              <Grid item xs={12} sm={4} key={kpi.label}>
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: kpi.color }} noWrap>{kpi.value}</Typography>
                      </Box>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${kpi.color}15`, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <kpi.icon />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Filtres */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            select
            size="small"
            label="Statut"
            value={statutFiltre}
            onChange={(e) => setStatutFiltre(e.target.value)}
            sx={{ minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          >
            <MenuItem value="all">Tous les statuts</MenuItem>
            <MenuItem value="en_cours">En cours</MenuItem>
            <MenuItem value="en_retard">Avec retards</MenuItem>
            <MenuItem value="termine">Terminés</MenuItem>
          </TextField>
          <Chip
            label={`Total: ${echeanciers.length}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Filtrés: ${echeanciersFiltres.length}`}
            color="info"
            variant="outlined"
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : echeanciersFiltres.length === 0 ? (
          <Alert severity="info">Aucun échéancier trouvé</Alert>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Parcelle</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Commercial</TableCell>
                    <TableCell>Montant total</TableCell>
                    <TableCell>Montant payé</TableCell>
                    <TableCell>Montant restant</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Échéances</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {echeanciersFiltres.map((echeancier) => {
                    const echeancesEnRetard = echeancier.echeances?.filter(e => e.statut === "en_retard") || [];
                    const echeancesPayees = echeancier.echeances?.filter(e => e.statut === "payee") || [];
                    
                    return (
                      <TableRow key={echeancier._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Home fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight="medium">
                              {echeancier.parcelle?.numeroParcelle || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {echeancier.client?.fullName || "N/A"}
                          </Typography>
                          {echeancier.client?.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {echeancier.client.phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {echeancier.commercial?.fullName || "N/A"}
                          </Typography>
                          {echeancier.commercial?.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {echeancier.commercial.phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {echeancier.montantTotal?.toLocaleString()} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main" fontWeight="medium">
                            {echeancier.montantPaye?.toLocaleString()} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="warning.main" fontWeight="medium">
                            {echeancier.montantRestant?.toLocaleString()} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatutLabel(echeancier.statut)}
                            color={getStatutColor(echeancier.statut)}
                            size="small"
                          />
                          {echeancesEnRetard.length > 0 && (
                            <Chip
                              label={`${echeancesEnRetard.length} retard(s)`}
                              color="error"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {echeancesPayees.length} / {echeancier.echeances?.length || 0} payées
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <Tooltip title="Voir les détails">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => ouvrirDetails(echeancier)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {echeancier.statut === "en_cours" && (
                              <Tooltip title="Rembourser et remettre en vente">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => ouvrirRembourser(echeancier)}
                                  disabled={echeancier.montantPaye <= 0}
                                >
                                  <Refresh />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Dialog Détails */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday color="primary" />
              <Typography variant="h6">
                Échéancier – Parcelle {selectedEcheancier?.parcelle?.numeroParcelle}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedEcheancier && (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Montant total
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {selectedEcheancier.montantTotal?.toLocaleString()} FCFA
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Montant payé
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {selectedEcheancier.montantPaye?.toLocaleString()} FCFA
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Montant restant
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          {selectedEcheancier.montantRestant?.toLocaleString()} FCFA
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Échéances ({selectedEcheancier.echeances?.length || 0})
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Montant</TableCell>
                        <TableCell align="center">Statut</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedEcheancier.echeances?.map((echeance, index) => (
                        <TableRow key={echeance._id || index}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {new Date(echeance.dateEcheance).toLocaleDateString("fr-FR")}
                              </Typography>
                              {echeance.statut !== "payee" && (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => ouvrirModifierDate(echeance)}
                                  sx={{ p: 0.5 }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            {echeance.datePaiementReelle && (
                              <Typography variant="caption" color="text.secondary">
                                Payé le: {new Date(echeance.datePaiementReelle).toLocaleDateString("fr-FR")}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                              <Typography variant="body2" fontWeight="medium">
                                {echeance.montant?.toLocaleString()} FCFA
                              </Typography>
                              {echeance.statut !== "payee" && (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => ouvrirModifierMontant(echeance)}
                                  sx={{ p: 0.5 }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getEcheanceStatutLabel(echeance.statut)}
                              color={getEcheanceStatutColor(echeance.statut)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {/* Actions pour les échéances non payées */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>
          <DialogActions>
            {selectedEcheancier && selectedEcheancier.statut === "en_cours" && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Refresh />}
                onClick={() => {
                  setDetailsOpen(false);
                  ouvrirRembourser(selectedEcheancier);
                }}
                disabled={selectedEcheancier.montantPaye <= 0}
              >
                Rembourser et remettre en vente
              </Button>
            )}
            <Button onClick={() => setDetailsOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Modifier Date */}
        <Dialog open={modifierDateOpen} onClose={() => setModifierDateOpen(false)}>
          <DialogTitle>Modifier la date de l'échéance</DialogTitle>
          <DialogContent>
            {echeanceAModifier && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Modifier la date de l'échéance de {new Date(echeanceAModifier.dateEcheance).toLocaleDateString("fr-FR")}
                </Alert>
                <TextField
                  type="date"
                  label="Nouvelle date d'échéance"
                  fullWidth
                  value={nouvelleDate}
                  onChange={(e) => setNouvelleDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mt: 2 }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setModifierDateOpen(false);
              setEcheanceAModifier(null);
              setNouvelleDate("");
            }}>
              Annuler
            </Button>
            <Button variant="contained" color="primary" onClick={confirmerModifierDate} disabled={!nouvelleDate}>
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Modifier Montant */}
        <Dialog open={modifierMontantOpen} onClose={() => setModifierMontantOpen(false)}>
          <DialogTitle>Modifier le montant de l'échéance</DialogTitle>
          <DialogContent>
            {echeanceAModifier && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Modifier le montant de l'échéance du {new Date(echeanceAModifier.dateEcheance).toLocaleDateString("fr-FR")}
                </Alert>
                <TextField
                  type="number"
                  label="Nouveau montant (FCFA)"
                  fullWidth
                  value={nouveauMontant}
                  onChange={(e) => setNouveauMontant(e.target.value)}
                  InputProps={{
                    endAdornment: <AttachMoney fontSize="small" />,
                  }}
                  sx={{ mt: 2 }}
                  inputProps={{ min: 0, step: 1000 }}
                  helperText="Le total des échéances sera recalculé automatiquement"
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setModifierMontantOpen(false);
              setEcheanceAModifier(null);
              setNouveauMontant("");
            }}>
              Annuler
            </Button>
            <Button variant="contained" color="primary" onClick={confirmerModifierMontant} disabled={!nouveauMontant || parseFloat(nouveauMontant) <= 0}>
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Rembourser */}
        <Dialog open={rembourserOpen} onClose={() => setRembourserOpen(false)}>
          <DialogTitle>Rembourser le client et remettre en vente</DialogTitle>
          <DialogContent>
            {selectedEcheancier && (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Attention : Cette action va :
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2, mt: 1 }}>
                    <li>Rembourser complètement le client (Montant payé: {selectedEcheancier.montantPaye?.toLocaleString()} FCFA)</li>
                    <li>Annuler l'échéancier</li>
                    <li>Remettre la parcelle en vente</li>
                    <li>Supprimer le paiement associé</li>
                  </Typography>
                </Alert>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Client:</strong> {selectedEcheancier.client?.fullName || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Parcelle:</strong> {selectedEcheancier.parcelle?.numeroParcelle || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Montant à rembourser:</strong> {selectedEcheancier.montantPaye?.toLocaleString()} FCFA
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setRembourserOpen(false);
              setSelectedEcheancier(null);
            }}>
              Annuler
            </Button>
            <Button variant="contained" color="error" onClick={confirmerRembourser}>
              Confirmer le remboursement
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AgenceLayout>
  );
};

export default EcheanciersAgencePage;

