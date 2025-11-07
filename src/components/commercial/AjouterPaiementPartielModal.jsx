// import React, { useState } from "react";
// import {
//   Modal,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Alert,
// } from "@mui/material";
// import api from "../../services/api";
// import { useNavigate } from "react-router-dom";
// const AjouterPaiementPartielModal = ({ open, onClose, paiement, onPaiementAjoute }) => {
//   const [montant, setMontant] = useState("");
//   const [recu, setRecu] = useState(null);
//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     try {
//       const formData = new FormData();
//       formData.append("montant", montant);
//       if (recu) formData.append("recu", recu);

//       await api.post(`/agence/commerciaux/paiement-partiel/${paiement._id}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setSuccess("✅ Paiement partiel ajouté avec succès !");
//       setTimeout(() => {
//         // onClose();
//         // window.location.reload();
//         onPaiementAjoute(); // 🔄 rafraîchir le drawer
//         onClose();
//          navigate("/commercial/parcelles-vendues")
//       }, 2000);
//     } catch (err) {
//       setError("Erreur lors de l’ajout du paiement partiel");
//     }
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box sx={{ p: 4, backgroundColor: "white", width: 400, mx: "auto", mt: 10, borderRadius: 2 }}>
//         <Typography variant="h6" gutterBottom>
//           ➕ Ajouter un paiement partiel
//         </Typography>

//         {success && <Alert severity="success">{success}</Alert>}
//         {error && <Alert severity="error">{error}</Alert>}

//         <form onSubmit={handleSubmit}>
//           <TextField
//             label="Montant payé"
//             type="number"
//             fullWidth
//             required
//             value={montant}
//             onChange={(e) => setMontant(e.target.value)}
//             sx={{ my: 2 }}
//           />

//           <Button variant="outlined" component="label" fullWidth>
//             📎 Joindre un reçu
//             <input
//               type="file"
//               hidden
//               accept="image/*,application/pdf"
//               onChange={(e) => setRecu(e.target.files[0])}
//             />
//           </Button>

//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 2 }}
//           >
//             💾 Ajouter le paiement
//           </Button>
//         </form>
//       </Box>
//     </Modal>
//   );
// };

// export default AjouterPaiementPartielModal;




import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert as MuiAlert,
  Box as MuiBox,
} from "@mui/material";
import {
  AttachFile,
  Delete,
  PictureAsPdf,
  Image as ImageIcon,
  CalendarToday,
  Info,
} from "@mui/icons-material";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const AjouterPaiementPartielModal = ({ open, onClose, paiement, onPaiementAjoute }) => {
  const [montant, setMontant] = useState("");
  const [recu, setRecu] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [echeancier, setEcheancier] = useState(null);
  const [loadingEcheancier, setLoadingEcheancier] = useState(false);
  const [selectedEcheanceIndex, setSelectedEcheanceIndex] = useState(null);
  const navigate = useNavigate();

  // Charger l'échéancier quand le modal s'ouvre
  useEffect(() => {
    if (open && paiement?._id) {
      const fetchEcheancier = async () => {
        setLoadingEcheancier(true);
        try {
          const res = await api.get(`/agence/echeanciers/paiement/${paiement._id}`);
          setEcheancier(res.data);
          // Sélectionner la première échéance non payée par défaut
          if (res.data?.echeances) {
            const premiereEcheanceNonPayee = res.data.echeances.findIndex(
              e => e.statut !== "payee"
            );
            if (premiereEcheanceNonPayee !== -1) {
              setSelectedEcheanceIndex(premiereEcheanceNonPayee);
              const echeance = res.data.echeances[premiereEcheanceNonPayee];
              setMontant(echeance.montant?.toString() || "");
            }
          }
        } catch (err) {
          // Pas d'échéancier pour ce paiement
          setEcheancier(null);
        } finally {
          setLoadingEcheancier(false);
        }
      };
      fetchEcheancier();
    }
  }, [open, paiement]);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!open) {
      setMontant("");
      setRecu(null);
      setSuccess("");
      setError("");
      setEcheancier(null);
      setSelectedEcheanceIndex(null);
    }
  }, [open]);

  // Mettre à jour le montant quand une échéance est sélectionnée
  useEffect(() => {
    if (echeancier && selectedEcheanceIndex !== null && echeancier.echeances[selectedEcheanceIndex]) {
      const echeance = echeancier.echeances[selectedEcheanceIndex];
      setMontant(echeance.montant?.toString() || "");
    }
  }, [selectedEcheanceIndex, echeancier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!paiement?._id) {
      setError("Paiement introuvable.");
      return;
    }
    if (!montant || Number(montant) <= 0) {
      setError("Veuillez saisir un montant valide.");
      return;
    }

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("montant", montant);
      if (recu) formData.append("recu", recu);

      await api.post(
        `/agence/paiements/paiement-partiel/${paiement._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSuccess("✅ Paiement partiel ajouté avec succès !");
      
      // Réinitialiser le formulaire
      setMontant("");
      setRecu(null);
      
      // Rafraîchir les données
      if (typeof onPaiementAjoute === "function") {
        onPaiementAjoute();
      }

      // Fermer le modal après un délai
      setTimeout(() => {
        onClose();
        // Optionnel : naviguer vers la page
        // navigate("/commercial/parcelles-vendues");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l’ajout du paiement partiel");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, bgcolor: "white", width: 400, mx: "auto", mt: 10, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Ajouter un paiement partiel
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Affichage de l'échéancier si disponible */}
        {loadingEcheancier ? (
          <Alert severity="info" sx={{ mb: 2 }}>Chargement de l'échéancier...</Alert>
        ) : echeancier && echeancier.echeances && echeancier.echeances.length > 0 ? (
          <MuiBox sx={{ mb: 2, p: 2, bgcolor: "info.light", borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday fontSize="small" /> Échéancier disponible
            </Typography>
            <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
              <InputLabel>Sélectionner une échéance</InputLabel>
              <Select
                value={selectedEcheanceIndex !== null ? selectedEcheanceIndex : ""}
                label="Sélectionner une échéance"
                onChange={(e) => setSelectedEcheanceIndex(e.target.value)}
              >
                {echeancier.echeances.map((echeance, index) => {
                  const estPayee = echeance.statut === "payee";
                  const estEnRetard = echeance.statut === "en_retard";
                  return (
                    <MenuItem key={echeance._id || index} value={index} disabled={estPayee}>
                      <MuiBox sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                        <MuiBox>
                          <Typography variant="body2">
                            {new Date(echeance.dateEcheance).toLocaleDateString("fr-FR")}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {echeance.montant?.toLocaleString()} FCFA
                          </Typography>
                        </MuiBox>
                        {estPayee && <Chip label="Payée" color="success" size="small" />}
                        {estEnRetard && <Chip label="En retard" color="error" size="small" />}
                        {!estPayee && !estEnRetard && <Chip label="À venir" color="warning" size="small" />}
                      </MuiBox>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {selectedEcheanceIndex !== null && echeancier.echeances[selectedEcheanceIndex] && (
              <MuiAlert severity="info" sx={{ mt: 1 }}>
                Date d'échéance: {new Date(echeancier.echeances[selectedEcheanceIndex].dateEcheance).toLocaleDateString("fr-FR")}
              </MuiAlert>
            )}
          </MuiBox>
        ) : null}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Montant payé"
            type="number"
            fullWidth
            required
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ min: 1 }}
            helperText={echeancier && selectedEcheanceIndex !== null ? "Montant de l'échéance sélectionnée" : ""}
          />

          <Button 
            variant="outlined" 
            component="label" 
            fullWidth
            startIcon={<AttachFile />}
            sx={{ mb: 2 }}
          >
            {recu ? "Changer le reçu" : "📎 Joindre un reçu"}
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={(e) => setRecu(e.target.files?.[0] || null)}
            />
          </Button>

          {/* Afficher le fichier sélectionné */}
          {recu && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid",
                borderColor: "primary.main",
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {recu.type === "application/pdf" ? (
                  <PictureAsPdf color="error" />
                ) : (
                  <ImageIcon color="primary" />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {recu.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(recu.size / 1024).toFixed(2)} Ko
                  </Typography>
                </Box>
                <Button
                  size="small"
                  color="error"
                  onClick={() => setRecu(null)}
                  startIcon={<Delete />}
                >
                  Retirer
                </Button>
              </Stack>
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={sending || !paiement?._id}
          >
            {sending ? "Enregistrement..." : "Ajouter le paiement"}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AjouterPaiementPartielModal;
