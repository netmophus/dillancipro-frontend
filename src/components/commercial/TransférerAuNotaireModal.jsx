import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  MenuItem,
  Box,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import { Gavel, CheckCircle } from "@mui/icons-material";
import api from "../../services/api";

const TransférerAuNotaireModal = ({ open, onClose, paiement, onTransfertRéussi }) => {
  const [notaires, setNotaires] = useState([]);
  const [loadingNotaires, setLoadingNotaires] = useState(false);
  const [selectedNotaireId, setSelectedNotaireId] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setSelectedNotaireId("");
      setSuccess("");
      setError("");
      fetchNotaires();
    }
  }, [open]);

  const fetchNotaires = async () => {
    setLoadingNotaires(true);
    try {
      const response = await api.get("/agence/notaires/actifs");
      setNotaires(response.data || []);
    } catch (err) {
      console.error("Erreur chargement notaires:", err);
      setError("Erreur lors du chargement des notaires");
    } finally {
      setLoadingNotaires(false);
    }
  };

  const handleTransfert = async () => {
    if (!selectedNotaireId) {
      setError("Veuillez sélectionner un notaire");
      return;
    }

    if (!paiement?.vente?._id) {
      setError("Vente introuvable. Veuillez réessayer.");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/agence/paiements/vente/${paiement.vente._id}/transferer-notaire`,
        { notaireId: selectedNotaireId }
      );

      setSuccess("✅ Vente transférée au notaire avec succès !");
      
      if (typeof onTransfertRéussi === "function") {
        onTransfertRéussi();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du transfert au notaire");
    } finally {
      setSending(false);
    }
  };

  const selectedNotaire = notaires.find((n) => n._id === selectedNotaireId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Gavel color="primary" />
          <Typography variant="h6">⚖️ Transférer au notaire</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Parcelle: <strong>{paiement?.parcelle?.numeroParcelle || "N/A"}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Client: <strong>{paiement?.client?.fullName || paiement?.client?.phone || "N/A"}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Montant payé: <strong>{paiement?.montantPaye?.toLocaleString() || 0} FCFA</strong>
          </Typography>
          <Chip
            label="Paiement complet"
            color="success"
            size="small"
            sx={{ mt: 1 }}
            icon={<CheckCircle />}
          />
        </Box>

        <TextField
          select
          fullWidth
          label="Sélectionner un notaire"
          value={selectedNotaireId}
          onChange={(e) => setSelectedNotaireId(e.target.value)}
          sx={{ mb: 2 }}
          disabled={sending || loadingNotaires}
          required
        >
          {loadingNotaires ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Chargement des notaires...
            </MenuItem>
          ) : notaires.length === 0 ? (
            <MenuItem disabled>Aucun notaire disponible</MenuItem>
          ) : (
            notaires.map((notaire) => (
              <MenuItem key={notaire._id} value={notaire._id}>
                <Stack spacing={0.5} sx={{ py: 0.5 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {notaire.fullName}
                  </Typography>
                  {notaire.cabinetName && (
                    <Typography variant="caption" color="text.secondary">
                      Cabinet: {notaire.cabinetName}
                    </Typography>
                  )}
                  {notaire.phone && (
                    <Typography variant="caption" color="text.secondary">
                      Téléphone: {notaire.phone}
                    </Typography>
                  )}
                </Stack>
              </MenuItem>
            ))
          )}
        </TextField>

        {selectedNotaire && (
          <Box
            sx={{
              p: 2,
              mt: 2,
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 2,
              bgcolor: "action.hover",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Notaire sélectionné:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight="medium">
                {selectedNotaire.fullName}
              </Typography>
              {selectedNotaire.cabinetName && (
                <Typography variant="body2" color="text.secondary">
                  Cabinet: {selectedNotaire.cabinetName}
                </Typography>
              )}
              {selectedNotaire.phone && (
                <Typography variant="body2" color="text.secondary">
                  📞 {selectedNotaire.phone}
                </Typography>
              )}
              {selectedNotaire.email && (
                <Typography variant="body2" color="text.secondary">
                  📧 {selectedNotaire.email}
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Une fois transféré, le notaire recevra le dossier pour les formalités. Vous pourrez suivre l'avancement dans la page des ventes.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          Annuler
        </Button>
        <Button
          onClick={handleTransfert}
          variant="contained"
          disabled={!selectedNotaireId || sending || loadingNotaires}
          startIcon={sending ? <CircularProgress size={20} /> : <Gavel />}
        >
          {sending ? "Transfert en cours..." : "Transférer au notaire"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransférerAuNotaireModal;

