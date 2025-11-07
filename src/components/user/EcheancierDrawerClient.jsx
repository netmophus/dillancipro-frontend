import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  CalendarToday,
  CheckCircle,
  Schedule,
  Warning,
  AttachMoney,
} from "@mui/icons-material";
import api from "../../services/api";

const EcheancierDrawerClient = ({ open, onClose, echeancierId }) => {
  const [echeancier, setEcheancier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && echeancierId) {
      fetchEcheancier();
    }
  }, [open, echeancierId]);

  const fetchEcheancier = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get(`/agence/echeanciers/${echeancierId}`);
      setEcheancier(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Échéancier non trouvé");
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

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 500, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          📅 Échéancier – Parcelle {echeancier?.parcelle?.numeroParcelle || "N/A"}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !echeancier ? (
          <Alert severity="info">Échéancier non trouvé</Alert>
        ) : (
          <>
            {/* Résumé */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Montant total
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {echeancier.montantTotal?.toLocaleString()} FCFA
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Montant payé
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {echeancier.montantPaye?.toLocaleString()} FCFA
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Montant restant
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {echeancier.montantRestant?.toLocaleString()} FCFA
                </Typography>
              </Box>
              <Chip
                label={echeancier.statut === "termine" ? "Terminé" : echeancier.statut === "en_cours" ? "En cours" : "Annulé"}
                color={echeancier.statut === "termine" ? "success" : echeancier.statut === "en_cours" ? "warning" : "error"}
                size="medium"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Liste des échéances */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Échéances ({echeancier.echeances?.length || 0})
            </Typography>

            {echeancier.echeances && echeancier.echeances.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell align="center">Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {echeancier.echeances.map((echeance, index) => (
                      <TableRow key={echeance._id || index}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getStatutIcon(echeance.statut)}
                            <Typography variant="body2">
                              {new Date(echeance.dateEcheance).toLocaleDateString("fr-FR")}
                            </Typography>
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
                            label={getStatutLabel(echeance.statut)}
                            color={getStatutColor(echeance.statut)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">Aucune échéance définie</Alert>
            )}
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default EcheancierDrawerClient;

