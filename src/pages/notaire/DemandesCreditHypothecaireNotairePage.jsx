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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  ArrowBack,
  Visibility,
  CheckCircle,
  HourglassEmpty,
  Description,
  Upload,
  Cancel,
  AttachMoney,
  Person,
  Home,
  AccountBalance,
  Download,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const DemandesCreditHypothecaireNotairePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ statut: "" });
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState(null); // "accepter", "formaliser", "inscrire", "finaliser", "rejeter"

  useEffect(() => {
    fetchDemandes();
  }, [filters]);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.statut) params.append("statut", filters.statut);

      const response = await api.get(`/notaire/demandes-credit-hypothecaire?${params.toString()}`);
      setDemandes(response.data.demandes || []);
    } catch (err) {
      console.error("Erreur chargement dossiers:", err);
      setError("Erreur lors du chargement des dossiers");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDemande = async (demandeId) => {
    try {
      const response = await api.get(`/notaire/demandes-credit-hypothecaire/${demandeId}`);
      setSelectedDemande(response.data.demande);
      setOpenDialog(true);
    } catch (err) {
      console.error("Erreur chargement demande:", err);
      setError("Erreur lors du chargement du dossier");
    }
  };

  const handleAccepter = async () => {
    try {
      await api.put(`/notaire/demandes-credit-hypothecaire/${selectedDemande._id}/accepter`);
      setOpenDialog(false);
      fetchDemandes();
    } catch (err) {
      console.error("Erreur acceptation:", err);
      setError(err.response?.data?.message || "Erreur lors de l'acceptation");
    }
  };

  const handleFormaliserConvention = async (conventionData) => {
    try {
      const response = await api.put(`/notaire/demandes-credit-hypothecaire/${selectedDemande._id}/formaliser-convention`, conventionData);
      // Rafraîchir les données de la demande pour avoir le statut à jour
      if (selectedDemande) {
        const updatedDemande = await api.get(`/notaire/demandes-credit-hypothecaire/${selectedDemande._id}`);
        setSelectedDemande(updatedDemande.data.demande);
      }
      setOpenDialog(false);
      fetchDemandes();
    } catch (err) {
      console.error("Erreur formalisation:", err);
      setError(err.response?.data?.message || "Erreur lors de la formalisation");
    }
  };

  const handleEnregistrerInscription = async (inscriptionData) => {
    try {
      await api.put(`/notaire/demandes-credit-hypothecaire/${selectedDemande._id}/enregistrer-inscription`, inscriptionData);
      setOpenDialog(false);
      fetchDemandes();
    } catch (err) {
      console.error("Erreur enregistrement:", err);
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleFinaliserInscription = async (finalisationData) => {
    try {
      await api.put(`/notaire/demandes-credit-hypothecaire/${selectedDemande._id}/finaliser-inscription`, finalisationData);
      setOpenDialog(false);
      fetchDemandes();
    } catch (err) {
      console.error("Erreur finalisation:", err);
      setError(err.response?.data?.message || "Erreur lors de la finalisation");
    }
  };

  const handleRejeter = async (motif) => {
    try {
      await api.put(`/notaire/demandes-credit-hypothecaire/${selectedDemande._id}/rejeter`, { motifRejet: motif });
      setOpenDialog(false);
      fetchDemandes();
    } catch (err) {
      console.error("Erreur rejet:", err);
      setError(err.response?.data?.message || "Erreur lors du rejet");
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
    en_traitement_notaire: "En traitement",
    convention_formalisee: "Convention formalisée",
    inscription_hypothecaire_en_cours: "Inscription en cours",
    inscription_hypothecaire_terminee: "Inscription terminée",
    rejete: "Rejeté",
    annule: "Annulé",
  };

  const getActionsDisponibles = (demande) => {
    const actions = [];
    if (demande.statut === "soumis_par_banque") {
      actions.push({ type: "accepter", label: "Accepter la demande", color: "success" });
      actions.push({ type: "rejeter", label: "Rejeter", color: "error" });
    }
    if (demande.statut === "en_traitement_notaire") {
      actions.push({ type: "formaliser", label: "Formaliser la convention", color: "primary" });
      actions.push({ type: "rejeter", label: "Rejeter", color: "error" });
    }
    if (demande.statut === "convention_formalisee") {
      actions.push({ type: "inscrire", label: "Enregistrer inscription", color: "warning" });
    }
    if (demande.statut === "inscription_hypothecaire_en_cours") {
      actions.push({ type: "finaliser", label: "Finaliser inscription", color: "success" });
    }
    return actions;
  };

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* En-tête */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <IconButton onClick={() => navigate("/notaire/dashboard")}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">
              📋 Formalisation Notariale
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Formalisez les documents (titre foncier, convention d'ouverture de crédit, acte hypothécaire) 
            pour les dossiers soumis par les banques partenaires selon les procédures UMEMOA
          </Typography>
        </Box>

        {/* Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtres */}
        <Box mb={3} display="flex" justifyContent="flex-end">
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
        ) : demandes.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Aucun dossier trouvé
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Référence</strong></TableCell>
                  <TableCell><strong>Banque</strong></TableCell>
                  <TableCell><strong>Emprunteur</strong></TableCell>
                  <TableCell><strong>Montant</strong></TableCell>
                  <TableCell><strong>Statut</strong></TableCell>
                  <TableCell><strong>Date soumission</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {demandes.map((demande) => {
                  const actions = getActionsDisponibles(demande);
                  return (
                    <TableRow key={demande._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {demande.reference}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {demande.banqueId?.fullName || "N/A"}
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
                          onClick={() => handleOpenDemande(demande._id)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialog de détails et actions */}
        <DemandeDetailsDialog
          open={openDialog}
          demande={selectedDemande}
          onClose={() => {
            setOpenDialog(false);
            setSelectedDemande(null);
            setActionType(null);
          }}
          onAccepter={handleAccepter}
          onFormaliser={handleFormaliserConvention}
          onEnregistrerInscription={handleEnregistrerInscription}
          onFinaliser={handleFinaliserInscription}
          onRejeter={handleRejeter}
          formatMoney={formatMoney}
          formatDate={formatDate}
          STATUT_LABELS={STATUT_LABELS}
          STATUT_COLORS={STATUT_COLORS}
          onError={setError}
        />
      </Container>
    </PageLayout>
  );
};

// Composant Dialog pour les détails et actions
const DemandeDetailsDialog = ({
  open,
  demande,
  onClose,
  onAccepter,
  onFormaliser,
  onEnregistrerInscription,
  onFinaliser,
  onRejeter,
  formatMoney,
  formatDate,
  STATUT_LABELS,
  STATUT_COLORS,
  onError,
}) => {
  const [actionType, setActionType] = useState(null);
  const [formData, setFormData] = useState({
    conventionOuvertureCredit: { url: "", nom: "" },
    acteHypothecaire: { url: "", nom: "" },
    numeroConvention: "",
    numeroActe: "",
    dateInscription: "",
    commentairesNotaire: "",
    motifRejet: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (demande) {
      setFormData({
        conventionOuvertureCredit: demande.documentsNotaire?.conventionOuvertureCredit?.url
          ? {
              url: demande.documentsNotaire.conventionOuvertureCredit.url,
              nom: demande.documentsNotaire.conventionOuvertureCredit.nom || "Convention",
            }
          : { url: "", nom: "" },
        acteHypothecaire: demande.documentsNotaire?.acteHypothecaire?.url
          ? {
              url: demande.documentsNotaire.acteHypothecaire.url,
              nom: demande.documentsNotaire.acteHypothecaire.nom || "Acte hypothécaire",
            }
          : { url: "", nom: "" },
        numeroConvention: demande.documentsNotaire?.conventionOuvertureCredit?.numeroConvention || "",
        numeroActe: demande.documentsNotaire?.acteHypothecaire?.numeroActe || "",
        dateInscription: demande.dateInscriptionHypothecaire
          ? new Date(demande.dateInscriptionHypothecaire).toISOString().split("T")[0]
          : "",
        commentairesNotaire: "", // Toujours initialiser à vide pour permettre de nouveaux commentaires
        motifRejet: "",
      });
    } else {
      // Initialiser avec des valeurs par défaut si pas de demande
      setFormData({
        conventionOuvertureCredit: { url: "", nom: "" },
        acteHypothecaire: { url: "", nom: "" },
        numeroConvention: "",
        numeroActe: "",
        dateInscription: "",
        commentairesNotaire: "",
        motifRejet: "",
      });
    }
  }, [demande]);

  // Réinitialiser le commentaire quand on change d'action
  useEffect(() => {
    if (actionType) {
      setFormData((prev) => ({
        ...prev,
        commentairesNotaire: "",
        motifRejet: "",
      }));
    }
  }, [actionType]);

  const handleFileUpload = async (file, documentType) => {
    if (!file) return;
    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await api.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = response.data.url || response.data.file?.url;
      if (url) {
        setFormData((prev) => ({
          ...prev,
          [documentType]: {
            url,
            nom: file.name,
          },
        }));
      }
    } catch (err) {
      console.error("Erreur upload:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Erreur téléchargement:", err);
      // Fallback: ouvrir dans un nouvel onglet
      window.open(url, "_blank");
    }
  };

  const handleSubmit = () => {
    if (actionType === "accepter") {
      onAccepter();
    } else if (actionType === "formaliser") {
      if (!formData.conventionOuvertureCredit?.url) {
        alert("Veuillez uploader la convention d'ouverture de crédit");
        return;
      }
      onFormaliser({
        conventionOuvertureCredit: {
          url: formData.conventionOuvertureCredit.url,
          nom: formData.conventionOuvertureCredit.nom,
          numeroConvention: formData.numeroConvention || undefined,
        },
        commentairesNotaire: formData.commentairesNotaire || undefined,
      });
    } else if (actionType === "inscrire") {
      // Vérifier que le statut est bien "convention_formalisee" avant d'enregistrer l'inscription
      if (demande.statut !== "convention_formalisee") {
        if (onError) {
          onError("La convention doit être formalisée avant d'enregistrer l'inscription hypothécaire. Veuillez rafraîchir la page.");
        } else {
          alert("La convention doit être formalisée avant d'enregistrer l'inscription hypothécaire. Veuillez rafraîchir la page.");
        }
        return;
      }
      onEnregistrerInscription({
        acteHypothecaire: formData.acteHypothecaire?.url ? formData.acteHypothecaire : undefined,
        dateInscription: formData.dateInscription || new Date(),
        commentairesNotaire: formData.commentairesNotaire,
      });
    } else if (actionType === "finaliser") {
      onFinaliser({
        numeroActe: formData.numeroActe,
        dateFinalisation: formData.dateInscription || new Date(),
        commentairesNotaire: formData.commentairesNotaire,
      });
    } else if (actionType === "rejeter") {
      if (!formData.motifRejet) {
        alert("Veuillez indiquer le motif du rejet");
        return;
      }
      onRejeter(formData.motifRejet);
    }
  };

  if (!demande) return null;

  const steps = [
    { label: "Soumis par banque", status: "soumis_par_banque" },
    { label: "En traitement", status: "en_traitement_notaire" },
    { label: "Convention formalisée", status: "convention_formalisee" },
    { label: "Inscription en cours", status: "inscription_hypothecaire_en_cours" },
    { label: "Inscription terminée", status: "inscription_hypothecaire_terminee" },
  ];

  const currentStep = steps.findIndex((step) => step.status === demande.statut);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Demande {demande.reference}
          </Typography>
          <Chip
            label={STATUT_LABELS[demande.statut]}
            color={STATUT_COLORS[demande.statut]}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={currentStep >= 0 ? currentStep : 0} orientation="horizontal">
            {steps.map((step) => (
              <Step key={step.status}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Banque
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {demande.banqueId?.fullName || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Montant du crédit
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {formatMoney(demande.montantCredit)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Emprunteur
                </Typography>
                <Typography variant="body1">
                  {demande.emprunteur?.nom} {demande.emprunteur?.prenom}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {demande.emprunteur?.telephone} {demande.emprunteur?.email && `• ${demande.emprunteur.email}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Documents de la banque */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Documents soumis par la banque
        </Typography>
        <Stack spacing={2} sx={{ mb: 2 }}>
          {demande.documentsBanque?.titrePropriete?.url ? (
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Description color="primary" />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Titre de propriété
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {demande.documentsBanque.titrePropriete.nom || "Document"}
                  </Typography>
                </Box>
              </Box>
              <Button
                startIcon={<Download />}
                onClick={() => handleDownload(
                  demande.documentsBanque.titrePropriete.url,
                  demande.documentsBanque.titrePropriete.nom || "titre-propriete"
                )}
                variant="outlined"
                size="small"
              >
                Télécharger
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Titre de propriété - Non fourni
              </Typography>
            </Box>
          )}
          {demande.documentsBanque?.notificationCredit?.url ? (
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Description color="primary" />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Notification de crédit
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {demande.documentsBanque.notificationCredit.nom || "Document"}
                  </Typography>
                </Box>
              </Box>
              <Button
                startIcon={<Download />}
                onClick={() => handleDownload(
                  demande.documentsBanque.notificationCredit.url,
                  demande.documentsBanque.notificationCredit.nom || "notification-credit"
                )}
                variant="outlined"
                size="small"
              >
                Télécharger
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Notification de crédit - Non fournie
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Documents générés par le notaire */}
        {(demande.documentsNotaire?.conventionOuvertureCredit?.url || demande.documentsNotaire?.acteHypothecaire?.url) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Documents générés par le notaire
            </Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
              {demande.documentsNotaire?.conventionOuvertureCredit?.url ? (
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "success.main",
                    borderRadius: 1,
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Convention d'ouverture de crédit
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {demande.documentsNotaire.conventionOuvertureCredit.nom || "Convention"}
                      </Typography>
                      {demande.documentsNotaire.conventionOuvertureCredit.numeroConvention && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          N° {demande.documentsNotaire.conventionOuvertureCredit.numeroConvention}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Button
                    startIcon={<Download />}
                    onClick={() => handleDownload(
                      demande.documentsNotaire.conventionOuvertureCredit.url,
                      demande.documentsNotaire.conventionOuvertureCredit.nom || "convention-ouverture-credit"
                    )}
                    variant="outlined"
                    size="small"
                    color="success"
                  >
                    Télécharger
                  </Button>
                </Box>
              ) : null}
              {demande.documentsNotaire?.acteHypothecaire?.url ? (
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "success.main",
                    borderRadius: 1,
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Acte hypothécaire
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {demande.documentsNotaire.acteHypothecaire.nom || "Acte hypothécaire"}
                      </Typography>
                      {demande.documentsNotaire.acteHypothecaire.numeroActe && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          N° {demande.documentsNotaire.acteHypothecaire.numeroActe}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Button
                    startIcon={<Download />}
                    onClick={() => handleDownload(
                      demande.documentsNotaire.acteHypothecaire.url,
                      demande.documentsNotaire.acteHypothecaire.nom || "acte-hypothecaire"
                    )}
                    variant="outlined"
                    size="small"
                    color="success"
                  >
                    Télécharger
                  </Button>
                </Box>
              ) : null}
            </Stack>
          </>
        )}

        {/* Actions selon le statut */}
        {demande.statut === "soumis_par_banque" && !actionType && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Actions disponibles
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => setActionType("accepter")}
              >
                Accepter la demande et commencer le traitement
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => setActionType("rejeter")}
              >
                Rejeter la demande
              </Button>
            </Stack>
          </Box>
        )}

        {demande.statut === "en_traitement_notaire" && !actionType && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Formaliser la convention d'ouverture de crédit
            </Typography>
            <Stack spacing={2}>
              <input
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                id="convention-upload"
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0], "conventionOuvertureCredit")}
                disabled={uploading}
              />
              <label htmlFor="convention-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  fullWidth
                  disabled={uploading}
                >
                  {formData.conventionOuvertureCredit.url
                    ? formData.conventionOuvertureCredit.nom
                    : "Uploader la convention"}
                </Button>
              </label>
              <TextField
                fullWidth
                label="Numéro de convention (optionnel)"
                value={formData.numeroConvention}
                onChange={(e) => setFormData({ ...formData, numeroConvention: e.target.value })}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Commentaires"
                value={formData.commentairesNotaire}
                onChange={(e) => setFormData({ ...formData, commentairesNotaire: e.target.value })}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => setActionType("formaliser")}
                disabled={!formData.conventionOuvertureCredit?.url}
              >
                Formaliser la convention
              </Button>
            </Stack>
          </Box>
        )}

        {demande.statut === "convention_formalisee" && !actionType && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Enregistrer l'inscription hypothécaire
            </Typography>
            <Stack spacing={2}>
              <input
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                id="acte-upload"
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0], "acteHypothecaire")}
                disabled={uploading}
              />
              <label htmlFor="acte-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  fullWidth
                  disabled={uploading}
                >
                  {formData.acteHypothecaire?.url ? formData.acteHypothecaire.nom : "Uploader l'acte hypothécaire"}
                </Button>
              </label>
              <TextField
                fullWidth
                type="date"
                label="Date d'inscription"
                value={formData.dateInscription ? new Date(formData.dateInscription).toISOString().split("T")[0] : ""}
                onChange={(e) => setFormData({ ...formData, dateInscription: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Commentaires"
                value={formData.commentairesNotaire}
                onChange={(e) => setFormData({ ...formData, commentairesNotaire: e.target.value })}
              />
              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={() => setActionType("inscrire")}
              >
                Enregistrer l'inscription hypothécaire
              </Button>
            </Stack>
          </Box>
        )}

        {demande.statut === "inscription_hypothecaire_en_cours" && !actionType && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Finaliser l'inscription hypothécaire
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Numéro d'acte hypothécaire"
                value={formData.numeroActe}
                onChange={(e) => setFormData({ ...formData, numeroActe: e.target.value })}
                required
              />
              <TextField
                fullWidth
                type="date"
                label="Date de finalisation"
                value={formData.dateInscription ? new Date(formData.dateInscription).toISOString().split("T")[0] : ""}
                onChange={(e) => setFormData({ ...formData, dateInscription: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Commentaires"
                value={formData.commentairesNotaire}
                onChange={(e) => setFormData({ ...formData, commentairesNotaire: e.target.value })}
              />
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => setActionType("finaliser")}
                disabled={!formData.numeroActe}
              >
                Finaliser l'inscription hypothécaire
              </Button>
            </Stack>
          </Box>
        )}

        {actionType === "rejeter" && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="error">
              Motif du rejet
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Indiquez le motif du rejet"
              value={formData.motifRejet}
              onChange={(e) => setFormData({ ...formData, motifRejet: e.target.value })}
              required
            />
          </Box>
        )}

        {actionType && actionType !== "rejeter" && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              Êtes-vous sûr de vouloir {actionType === "accepter" && "accepter"}
              {actionType === "formaliser" && "formaliser la convention"}
              {actionType === "inscrire" && "enregistrer l'inscription"}
              {actionType === "finaliser" && "finaliser l'inscription"} cette demande ?
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        {actionType && (
          <>
            <Button onClick={() => setActionType(null)}>Annuler</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color={actionType === "rejeter" ? "error" : "primary"}
            >
              Confirmer
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DemandesCreditHypothecaireNotairePage;

