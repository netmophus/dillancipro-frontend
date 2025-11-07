import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  CalendarToday,
  CheckCircle,
  Schedule,
  Warning,
  AttachMoney,
  Visibility,
  Edit,
} from "@mui/icons-material";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const EcheancierDrawer = ({ open, onClose, paiement }) => {
  const { user } = useAuth();
  const [echeancier, setEcheancier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [marquerPayeeOpen, setMarquerPayeeOpen] = useState(false);
  const [echeanceASelectionner, setEcheanceASelectionner] = useState(null);
  const [modifierDateOpen, setModifierDateOpen] = useState(false);
  const [echeanceAModifier, setEcheanceAModifier] = useState(null);
  const [nouvelleDate, setNouvelleDate] = useState("");

  useEffect(() => {
    if (open && paiement?._id) {
      fetchEcheancier();
    }
  }, [open, paiement]);

  const fetchEcheancier = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get(`/agence/echeanciers/paiement/${paiement._id}`);
      setEcheancier(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setEcheancier(null); // Pas d'échéancier créé
      } else {
        setError("Erreur lors du chargement de l'échéancier");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut) => {
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

  const getStatutLabel = (statut) => {
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

  const getStatutIcon = (statut) => {
    switch (statut) {
      case "payee":
        return <CheckCircle fontSize="small" />;
      case "en_retard":
        return <Warning fontSize="small" />;
      case "a_venir":
        return <Schedule fontSize="small" />;
      default:
        return null;
    }
  };

  const handleMarquerPayee = async (echeanceId) => {
    setEcheanceASelectionner(echeanceId);
    setMarquerPayeeOpen(true);
  };

  const confirmerMarquerPayee = async () => {
    if (!echeancier || !echeanceASelectionner) return;

    try {
      await api.put(
        `/agence/echeanciers/${echeancier._id}/echeance/${echeanceASelectionner}/payer`,
        {}
      );
      await fetchEcheancier();
      setMarquerPayeeOpen(false);
      setEcheanceASelectionner(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du marquage de l'échéance");
    }
  };

  const ouvrirModifierDate = (echeance) => {
    setEcheanceAModifier(echeance);
    setNouvelleDate(echeance.dateEcheance ? new Date(echeance.dateEcheance).toISOString().split('T')[0] : "");
    setModifierDateOpen(true);
  };

  const confirmerModifierDate = async () => {
    if (!echeancier || !echeanceAModifier || !nouvelleDate) return;

    try {
      // Mettre à jour la date de l'échéance via l'API de modification de l'échéancier
      const echeancesMisesAJour = echeancier.echeances.map((e) => {
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

      await api.put(`/agence/echeanciers/${echeancier._id}`, {
        echeances: echeancesMisesAJour,
      });

      await fetchEcheancier();
      setModifierDateOpen(false);
      setEcheanceAModifier(null);
      setNouvelleDate("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification de la date");
    }
  };

  const peutModifierDates = user?.role === "Agence" || user?.role === "Admin";

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box sx={{ width: 500, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📅 Échéancier – Parcelle {paiement?.parcelle?.numeroParcelle}
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : !echeancier ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Aucun échéancier créé pour ce paiement
            </Alert>
          ) : (
            <>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Montant total:</strong>{" "}
                  {echeancier.montantTotal?.toLocaleString()} FCFA
                </Typography>
                <Typography variant="body2">
                  <strong>Montant payé:</strong>{" "}
                  {echeancier.montantPaye?.toLocaleString()} FCFA
                </Typography>
                <Typography variant="body2">
                  <strong>Montant restant:</strong>{" "}
                  {echeancier.montantRestant?.toLocaleString()} FCFA
                </Typography>
                <Chip
                  label={echeancier.statut === "termine" ? "Terminé" : "En cours"}
                  color={echeancier.statut === "termine" ? "success" : "warning"}
                  size="small"
                  sx={{ width: "fit-content" }}
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Échéances ({echeancier.echeances?.length || 0})
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {echeancier.echeances?.map((echeance, index) => (
                      <TableRow key={echeance._id || index}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {new Date(echeance.dateEcheance).toLocaleDateString("fr-FR")}
                            </Typography>
                            {peutModifierDates && echeance.statut !== "payee" && (
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
                          <Typography variant="body2" fontWeight="medium">
                            {echeance.montant?.toLocaleString()} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={getStatutIcon(echeance.statut)}
                            label={getStatutLabel(echeance.statut)}
                            color={getStatutColor(echeance.statut)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            {echeance.statut !== "payee" && (
                              <Tooltip title="Marquer comme payée">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleMarquerPayee(echeance._id)}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            )}
                            {peutModifierDates && echeance.statut !== "payee" && (
                              <Tooltip title="Modifier la date">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => ouvrirModifierDate(echeance)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      </Drawer>

      <Dialog open={marquerPayeeOpen} onClose={() => setMarquerPayeeOpen(false)}>
        <DialogTitle>Marquer l'échéance comme payée</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir marquer cette échéance comme payée ?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarquerPayeeOpen(false)}>Annuler</Button>
          <Button variant="contained" color="success" onClick={confirmerMarquerPayee}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default EcheancierDrawer;

