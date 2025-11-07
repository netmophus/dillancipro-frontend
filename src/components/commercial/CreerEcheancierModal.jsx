import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  IconButton,
  Stack,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Grid,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import {
  Add,
  Delete,
  CalendarToday,
  AttachMoney,
  Autorenew,
  Edit,
  CheckCircle,
} from "@mui/icons-material";
import api from "../../services/api";

const CreerEcheancierModal = ({ open, onClose, paiement, onEcheancierCree }) => {
  const [mode, setMode] = useState("auto"); // "auto" ou "manuel"
  const [echeances, setEcheances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Paramètres pour génération automatique
  const [nombreEcheances, setNombreEcheances] = useState(3);
  const [frequence, setFrequence] = useState("mensuel"); // mensuel, trimestriel, semestriel, annuel
  const [datePremiereEcheance, setDatePremiereEcheance] = useState("");
  const [montantParEcheance, setMontantParEcheance] = useState("");
  const [valide, setValide] = useState(false);

  useEffect(() => {
    if (open && paiement) {
      // Initialiser avec des échéances vides
      setMode("auto");
      setEcheances([]);
      setError("");
      setSuccess("");
      setNombreEcheances(3);
      setFrequence("mensuel");
      setDatePremiereEcheance("");
      setMontantParEcheance("");
      setValide(false);
      
      // Calculer le montant par échéance automatiquement
      const montantTotal = paiement?.montantTotal || 0;
      const montantRestant = paiement?.montantRestant || montantTotal;
      if (montantRestant > 0 && nombreEcheances > 0) {
        const montant = Math.floor(montantRestant / nombreEcheances);
        setMontantParEcheance(montant.toString());
      }
    }
  }, [open, paiement]);

  useEffect(() => {
    // Recalculer le montant par échéance quand le nombre change
    if (mode === "auto" && paiement && nombreEcheances > 0) {
      const montantTotal = paiement?.montantTotal || 0;
      const montantRestant = paiement?.montantRestant || montantTotal;
      const montant = Math.floor(montantRestant / nombreEcheances);
      setMontantParEcheance(montant.toString());
    }
  }, [nombreEcheances, mode, paiement]);

  const genererEcheancesAutomatiques = () => {
    if (!paiement || !datePremiereEcheance || !montantParEcheance || nombreEcheances <= 0) {
      setError("Veuillez remplir tous les champs nécessaires pour la génération automatique");
      return;
    }

    const montantTotal = paiement.montantTotal || 0;
    const montantRestant = paiement.montantRestant || montantTotal;
    const montantParEcheanceNum = parseFloat(montantParEcheance);

    if (montantParEcheanceNum <= 0) {
      setError("Le montant par échéance doit être supérieur à 0");
      return;
    }

    const totalEcheances = montantParEcheanceNum * nombreEcheances;
    if (totalEcheances > montantRestant + 1) { // Tolérance de 1 FCFA pour arrondis
      setError(`Le total des échéances (${totalEcheances.toLocaleString()} FCFA) dépasse le montant restant (${montantRestant.toLocaleString()} FCFA)`);
      return;
    }

    // Calculer les dates selon la fréquence
    const dateDebut = new Date(datePremiereEcheance);
    const nouvellesEcheances = [];
    let montantTotalGenere = 0;

    // Calculer le nombre de mois entre chaque échéance
    const moisParEcheance = frequence === "mensuel" ? 1 : 
                            frequence === "trimestriel" ? 3 : 
                            frequence === "semestriel" ? 6 : 12;

    for (let i = 0; i < nombreEcheances; i++) {
      const dateEcheance = new Date(dateDebut);
      dateEcheance.setMonth(dateEcheance.getMonth() + (i * moisParEcheance));

      // Pour la dernière échéance, ajuster le montant pour que le total corresponde exactement
      let montant = montantParEcheanceNum;
      if (i === nombreEcheances - 1) {
        montant = montantRestant - montantTotalGenere;
      }

      nouvellesEcheances.push({
        dateEcheance: dateEcheance.toISOString().split('T')[0],
        montant: montant.toFixed(0),
        notes: "",
      });

      montantTotalGenere += montant;
    }

    setEcheances(nouvellesEcheances);
    setValide(true);
    setError("");
  };

  const ajouterEcheance = () => {
    const nouvelleEcheance = {
      dateEcheance: "",
      montant: "",
      notes: "",
    };
    setEcheances([...echeances, nouvelleEcheance]);
  };

  const supprimerEcheance = (index) => {
    setEcheances(echeances.filter((_, i) => i !== index));
  };

  const modifierEcheance = (index, champ, valeur) => {
    const nouvellesEcheances = [...echeances];
    nouvellesEcheances[index][champ] = valeur;
    setEcheances(nouvellesEcheances);
    setValide(false); // Réinitialiser la validation si modification manuelle
  };

  const calculerTotal = () => {
    return echeances.reduce((sum, e) => sum + parseFloat(e.montant || 0), 0);
  };

  const validerEcheances = () => {
    if (echeances.length === 0) {
      setError("Veuillez ajouter au moins une échéance");
      return false;
    }

    for (let i = 0; i < echeances.length; i++) {
      const e = echeances[i];
      if (!e.dateEcheance) {
        setError(`La date de l'échéance ${i + 1} est requise`);
        return false;
      }
      if (!e.montant || parseFloat(e.montant) <= 0) {
        setError(`Le montant de l'échéance ${i + 1} doit être supérieur à 0`);
        return false;
      }
    }

    const total = calculerTotal();
    const montantTotal = paiement?.montantTotal || 0;

    if (Math.abs(total - montantTotal) > 0.01) {
      setError(
        `Le total des échéances (${total.toLocaleString()} FCFA) ne correspond pas au montant total (${montantTotal.toLocaleString()} FCFA)`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!validerEcheances()) {
      return;
    }

    if (!paiement?._id) {
      setError("Paiement introuvable");
      return;
    }

    try {
      setLoading(true);

      const echeancesFormatees = echeances.map((e) => ({
        dateEcheance: new Date(e.dateEcheance),
        montant: parseFloat(e.montant),
        notes: e.notes || "",
      }));

      const response = await api.post("/agence/echeanciers", {
        paiementId: paiement._id,
        echeances: echeancesFormatees,
      });

      setSuccess("✅ Échéancier créé avec succès !");

      if (typeof onEcheancierCree === "function") {
        onEcheancierCree();
      }

      setTimeout(() => {
        onClose();
        setEcheances([]);
      }, 1500);
    } catch (err) {
      console.error("Erreur création échéancier:", err);
      setError(err.response?.data?.message || "Erreur lors de la création de l'échéancier");
    } finally {
      setLoading(false);
    }
  };

  const montantRestant = () => {
    const total = calculerTotal();
    const montantTotal = paiement?.montantTotal || 0;
    return montantTotal - total;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarToday color="primary" />
          <Typography variant="h6">Créer un échéancier</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Informations du paiement
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
            <Chip
              label={`Montant total: ${(paiement?.montantTotal || 0).toLocaleString()} FCFA`}
              color="primary"
            />
            <Chip
              label={`Montant payé: ${(paiement?.montantPaye || 0).toLocaleString()} FCFA`}
              color="info"
            />
            <Chip
              label={`Restant: ${(paiement?.montantRestant || 0).toLocaleString()} FCFA`}
              color="warning"
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Mode de création */}
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Mode de création</FormLabel>
            <RadioGroup
              row
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setEcheances([]);
                setValide(false);
                setError("");
              }}
            >
              <FormControlLabel value="auto" control={<Radio />} label="Génération automatique" />
              <FormControlLabel value="manuel" control={<Radio />} label="Saisie manuelle" />
            </RadioGroup>
          </FormControl>

          {/* Génération automatique */}
          {mode === "auto" && (
            <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Paramètres de génération
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre d'échéances"
                    type="number"
                    fullWidth
                    size="small"
                    value={nombreEcheances}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setNombreEcheances(Math.max(1, val));
                    }}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Fréquence</InputLabel>
                    <Select
                      value={frequence}
                      label="Fréquence"
                      onChange={(e) => setFrequence(e.target.value)}
                    >
                      <MenuItem value="mensuel">Mensuel</MenuItem>
                      <MenuItem value="trimestriel">Trimestriel</MenuItem>
                      <MenuItem value="semestriel">Semestriel</MenuItem>
                      <MenuItem value="annuel">Annuel</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date de la première échéance"
                    type="date"
                    fullWidth
                    size="small"
                    value={datePremiereEcheance}
                    onChange={(e) => setDatePremiereEcheance(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Montant par échéance (FCFA)"
                    type="number"
                    fullWidth
                    size="small"
                    value={montantParEcheance}
                    onChange={(e) => setMontantParEcheance(e.target.value)}
                    InputProps={{
                      endAdornment: <AttachMoney fontSize="small" />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" gap={1} alignItems="center">
                    <Button
                      variant="contained"
                      startIcon={<Autorenew />}
                      onClick={genererEcheancesAutomatiques}
                      disabled={!datePremiereEcheance || !montantParEcheance || nombreEcheances <= 0}
                    >
                      Générer les échéances
                    </Button>
                    {echeances.length > 0 && (
                      <Chip
                        label={`${echeances.length} échéance(s) générée(s)`}
                        color="success"
                        icon={<CheckCircle />}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Saisie manuelle */}
          {mode === "manuel" && (
            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={ajouterEcheance}
              >
                Ajouter une échéance
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Échéances ({echeances.length})
          </Typography>
          {mode === "manuel" && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={ajouterEcheance}
            >
              Ajouter une échéance
            </Button>
          )}
          {mode === "auto" && echeances.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit />}
              onClick={() => setValide(false)}
              color="warning"
            >
              Modifier
            </Button>
          )}
        </Box>

        {echeances.length === 0 ? (
          <Alert severity="info">
            Cliquez sur "Ajouter une échéance" pour commencer
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Date d'échéance</TableCell>
                  <TableCell align="right">Montant (FCFA)</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {echeances.map((echeance, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        fullWidth
                        value={echeance.dateEcheance}
                        onChange={(e) => modifierEcheance(index, "dateEcheance", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        label="Date d'échéance"
                        disabled={mode === "auto" && valide}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={echeance.montant}
                        onChange={(e) => modifierEcheance(index, "montant", e.target.value)}
                        inputProps={{ min: 0, step: 1000 }}
                        InputProps={{
                          endAdornment: <AttachMoney fontSize="small" />,
                        }}
                        label="Montant"
                        disabled={mode === "auto" && valide}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={echeance.notes}
                        onChange={(e) => modifierEcheance(index, "notes", e.target.value)}
                        placeholder="Notes optionnelles"
                        label="Notes"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => supprimerEcheance(index)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {echeances.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: valide ? "success.light" : "action.hover", borderRadius: 1 }}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Typography variant="body2">
                <strong>Total des échéances:</strong> {calculerTotal().toLocaleString()} FCFA
              </Typography>
              {valide && mode === "auto" && (
                <Chip
                  label="✅ Validé"
                  color="success"
                  icon={<CheckCircle />}
                />
              )}
              <Chip
                label={
                  montantRestant() === 0
                    ? "✅ Total correct"
                    : `Restant: ${montantRestant().toLocaleString()} FCFA`
                }
                color={montantRestant() === 0 ? "success" : "warning"}
              />
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        {mode === "auto" && echeances.length > 0 && !valide && (
          <Button
            variant="outlined"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => setValide(true)}
          >
            Valider les échéances
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || echeances.length === 0 || (mode === "auto" && !valide)}
        >
          {loading ? "Création..." : "Créer l'échéancier"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreerEcheancierModal;

