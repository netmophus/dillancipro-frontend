import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  Upload,
  Delete,
  Home,
  Person,
  Description,
  AttachMoney,
  CalendarToday,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const CreateDemandeCreditHypothecairePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [notaires, setNotaires] = useState([]);
  const [loadingNotaires, setLoadingNotaires] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    notaireId: "",
    montantCredit: "",
    devise: "FCFA",
    dureeRemboursement: "",
    tauxInteret: "",
    bienImmobilier: {
      type: "",
      adresse: "",
      ville: "",
      quartier: "",
      superficie: "",
      valeurEstimee: "",
      iheId: "",
    },
    emprunteur: {
      nom: "",
      prenom: "",
      telephone: "",
      email: "",
      adresse: "",
      profession: "",
      numeroCNI: "",
    },
    documentsBanque: {
      titrePropriete: {
        url: "",
        nom: "",
      },
      notificationCredit: {
        url: "",
        nom: "",
      },
      autresDocuments: [],
    },
    commentairesBanque: "",
    priorite: "normale",
  });

  const [uploadingFiles, setUploadingFiles] = useState({
    titrePropriete: false,
    notificationCredit: false,
  });

  useEffect(() => {
    fetchNotaires();
    if (isEdit) {
      fetchDemande();
    }
  }, [id]);

  const fetchNotaires = async () => {
    try {
      setLoadingNotaires(true);
      const response = await api.get("/agence/notaires/actifs");
      // La réponse peut être un tableau directement ou un objet avec une propriété notaires
      const notairesData = Array.isArray(response.data) ? response.data : (response.data.notaires || []);
      setNotaires(notairesData);
    } catch (err) {
      console.error("Erreur chargement notaires:", err);
      // En cas d'erreur, essayer la route publique
      try {
        const publicResponse = await api.get("/agence/notaires/public");
        const notairesData = publicResponse.data.notaires || [];
        setNotaires(notairesData);
      } catch (publicErr) {
        console.error("Erreur chargement notaires publics:", publicErr);
        setError("Erreur lors du chargement des notaires");
      }
    } finally {
      setLoadingNotaires(false);
    }
  };

  const fetchDemande = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/banque/demandes-credit-hypothecaire/${id}`);
      const demande = response.data.demande;

      setFormData({
        notaireId: demande.notaireId?._id || "",
        montantCredit: demande.montantCredit || "",
        devise: demande.devise || "FCFA",
        dureeRemboursement: demande.dureeRemboursement || "",
        tauxInteret: demande.tauxInteret || "",
        bienImmobilier: {
          type: demande.bienImmobilier?.type || "",
          adresse: demande.bienImmobilier?.adresse || "",
          ville: demande.bienImmobilier?.ville || "",
          quartier: demande.bienImmobilier?.quartier || "",
          superficie: demande.bienImmobilier?.superficie || "",
          valeurEstimee: demande.bienImmobilier?.valeurEstimee || "",
          iheId: demande.bienImmobilier?.iheId?._id || "",
        },
        emprunteur: {
          nom: demande.emprunteur?.nom || "",
          prenom: demande.emprunteur?.prenom || "",
          telephone: demande.emprunteur?.telephone || "",
          email: demande.emprunteur?.email || "",
          adresse: demande.emprunteur?.adresse || "",
          profession: demande.emprunteur?.profession || "",
          numeroCNI: demande.emprunteur?.numeroCNI || "",
        },
        documentsBanque: {
          titrePropriete: demande.documentsBanque?.titrePropriete || { url: "", nom: "" },
          notificationCredit: demande.documentsBanque?.notificationCredit || { url: "", nom: "" },
          autresDocuments: demande.documentsBanque?.autresDocuments || [],
        },
        commentairesBanque: demande.commentairesBanque || "",
        priorite: demande.priorite || "normale",
      });
    } catch (err) {
      console.error("Erreur chargement demande:", err);
      setError("Erreur lors du chargement de la demande");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, documentType) => {
    if (!file) return;

    try {
      setUploadingFiles((prev) => ({ ...prev, [documentType]: true }));
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await api.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = response.data.url || response.data.file?.url;
      if (url) {
        setFormData((prev) => ({
          ...prev,
          documentsBanque: {
            ...prev.documentsBanque,
            [documentType]: {
              url,
              nom: file.name,
            },
          },
        }));
      }
    } catch (err) {
      console.error("Erreur upload fichier:", err);
      setError(`Erreur lors de l'upload du ${documentType}`);
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  const handleRemoveFile = (documentType) => {
    setFormData((prev) => ({
      ...prev,
      documentsBanque: {
        ...prev.documentsBanque,
        [documentType]: { url: "", nom: "" },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.notaireId) {
      setError("Veuillez sélectionner un notaire");
      return;
    }

    if (!formData.montantCredit || !formData.dureeRemboursement || !formData.tauxInteret) {
      setError("Veuillez remplir tous les champs du crédit");
      return;
    }

    if (!formData.bienImmobilier.adresse || !formData.bienImmobilier.ville) {
      setError("Veuillez remplir l'adresse complète du bien immobilier");
      return;
    }

    if (!formData.emprunteur.nom || !formData.emprunteur.prenom || !formData.emprunteur.telephone) {
      setError("Veuillez remplir les informations de l'emprunteur");
      return;
    }

    if (!formData.documentsBanque.titrePropriete.url) {
      setError("Veuillez uploader le titre de propriété");
      return;
    }

    if (!formData.documentsBanque.notificationCredit.url) {
      setError("Veuillez uploader la notification de crédit");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        montantCredit: parseFloat(formData.montantCredit),
        dureeRemboursement: parseInt(formData.dureeRemboursement),
        tauxInteret: parseFloat(formData.tauxInteret),
        bienImmobilier: {
          ...formData.bienImmobilier,
          superficie: formData.bienImmobilier.superficie
            ? parseFloat(formData.bienImmobilier.superficie)
            : undefined,
          valeurEstimee: parseFloat(formData.bienImmobilier.valeurEstimee),
          iheId: formData.bienImmobilier.iheId || undefined,
        },
      };

      if (isEdit) {
        await api.put(`/banque/demandes-credit-hypothecaire/${id}`, payload);
        setSuccess("Demande mise à jour avec succès");
      } else {
        await api.post("/banque/demandes-credit-hypothecaire", payload);
        setSuccess("Demande créée avec succès");
      }

      setTimeout(() => {
        navigate("/banque/demandes-credit-hypothecaire");
      }, 1500);
    } catch (err) {
      console.error("Erreur sauvegarde demande:", err);
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const steps = ["Informations crédit", "Bien immobilier", "Emprunteur", "Documents"];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  if (loading) {
    return (
      <PageLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* En-tête */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <IconButton onClick={() => navigate("/banque/demandes-credit-hypothecaire")}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">
              {isEdit ? "✏️ Modifier le dossier" : "➕ Nouveau dossier de formalisation notariale"}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Créer une demande de crédit avec garantie hypothécaire selon les procédures UMEMOA
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Étape 1: Informations crédit */}
          {activeStep === 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AttachMoney /> Informations du crédit
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Notaire partenaire</InputLabel>
                      <Select
                        value={formData.notaireId}
                        label="Notaire partenaire"
                        onChange={(e) => setFormData({ ...formData, notaireId: e.target.value })}
                        disabled={loadingNotaires}
                      >
                        {notaires.map((notaire) => (
                          <MenuItem key={notaire._id} value={notaire._id}>
                            {notaire.fullName} - {notaire.cabinetName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priorité</InputLabel>
                      <Select
                        value={formData.priorite}
                        label="Priorité"
                        onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                      >
                        <MenuItem value="normale">Normale</MenuItem>
                        <MenuItem value="urgente">Urgente</MenuItem>
                        <MenuItem value="tres_urgente">Très urgente</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Montant du crédit"
                      type="number"
                      required
                      value={formData.montantCredit}
                      onChange={(e) => setFormData({ ...formData, montantCredit: e.target.value })}
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Devise</InputLabel>
                      <Select
                        value={formData.devise}
                        label="Devise"
                        onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
                      >
                        <MenuItem value="FCFA">FCFA</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Durée de remboursement (mois)"
                      type="number"
                      required
                      value={formData.dureeRemboursement}
                      onChange={(e) => setFormData({ ...formData, dureeRemboursement: e.target.value })}
                      InputProps={{
                        startAdornment: <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Taux d'intérêt annuel (%)"
                      type="number"
                      required
                      value={formData.tauxInteret}
                      onChange={(e) => setFormData({ ...formData, tauxInteret: e.target.value })}
                      inputProps={{ step: "0.01", min: "0", max: "100" }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Étape 2: Bien immobilier */}
          {activeStep === 1 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Home /> Bien immobilier
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Type de bien</InputLabel>
                      <Select
                        value={formData.bienImmobilier.type}
                        label="Type de bien"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bienImmobilier: { ...formData.bienImmobilier, type: e.target.value },
                          })
                        }
                      >
                        <MenuItem value="maison">Maison</MenuItem>
                        <MenuItem value="appartement">Appartement</MenuItem>
                        <MenuItem value="terrain">Terrain</MenuItem>
                        <MenuItem value="villa">Villa</MenuItem>
                        <MenuItem value="bureau">Bureau</MenuItem>
                        <MenuItem value="autre">Autre</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ville"
                      required
                      value={formData.bienImmobilier.ville}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bienImmobilier: { ...formData.bienImmobilier, ville: e.target.value },
                        })
                      }
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse complète"
                      required
                      multiline
                      rows={2}
                      value={formData.bienImmobilier.adresse}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bienImmobilier: { ...formData.bienImmobilier, adresse: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Quartier"
                      value={formData.bienImmobilier.quartier}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bienImmobilier: { ...formData.bienImmobilier, quartier: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Superficie (m²)"
                      type="number"
                      value={formData.bienImmobilier.superficie}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bienImmobilier: { ...formData.bienImmobilier, superficie: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valeur estimée"
                      type="number"
                      required
                      value={formData.bienImmobilier.valeurEstimee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bienImmobilier: { ...formData.bienImmobilier, valeurEstimee: e.target.value },
                        })
                      }
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ mr: 1, color: "text.secondary" }} />,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Étape 3: Emprunteur */}
          {activeStep === 2 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person /> Informations de l'emprunteur
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      required
                      value={formData.emprunteur.nom}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emprunteur: { ...formData.emprunteur, nom: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      required
                      value={formData.emprunteur.prenom}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emprunteur: { ...formData.emprunteur, prenom: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      required
                      value={formData.emprunteur.telephone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emprunteur: { ...formData.emprunteur, telephone: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.emprunteur.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emprunteur: { ...formData.emprunteur, email: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      multiline
                      rows={2}
                      value={formData.emprunteur.adresse}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emprunteur: { ...formData.emprunteur, adresse: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Profession"
                      value={formData.emprunteur.profession}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emprunteur: { ...formData.emprunteur, profession: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Numéro CNI"
                      value={formData.emprunteur.numeroCNI}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emprunteur: { ...formData.emprunteur, numeroCNI: e.target.value },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Étape 4: Documents */}
          {activeStep === 3 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Description /> Documents requis
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  {/* Titre de propriété */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Titre de propriété *
                      </Typography>
                      {formData.documentsBanque.titrePropriete.url ? (
                        <Box display="flex" alignItems="center" gap={2} mt={1}>
                          <Chip
                            label={formData.documentsBanque.titrePropriete.nom}
                            onDelete={() => handleRemoveFile("titrePropriete")}
                            color="success"
                          />
                          <Button
                            size="small"
                            href={formData.documentsBanque.titrePropriete.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Voir le document
                          </Button>
                        </Box>
                      ) : (
                        <Box mt={1}>
                          <input
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            style={{ display: "none" }}
                            id="titre-propriete-upload"
                            type="file"
                            onChange={(e) => handleFileUpload(e.target.files[0], "titrePropriete")}
                            disabled={uploadingFiles.titrePropriete}
                          />
                          <label htmlFor="titre-propriete-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<Upload />}
                              disabled={uploadingFiles.titrePropriete}
                            >
                              {uploadingFiles.titrePropriete ? "Upload en cours..." : "Uploader le titre de propriété"}
                            </Button>
                          </label>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Notification de crédit */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Notification de crédit *
                      </Typography>
                      {formData.documentsBanque.notificationCredit.url ? (
                        <Box display="flex" alignItems="center" gap={2} mt={1}>
                          <Chip
                            label={formData.documentsBanque.notificationCredit.nom}
                            onDelete={() => handleRemoveFile("notificationCredit")}
                            color="success"
                          />
                          <Button
                            size="small"
                            href={formData.documentsBanque.notificationCredit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Voir le document
                          </Button>
                        </Box>
                      ) : (
                        <Box mt={1}>
                          <input
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            style={{ display: "none" }}
                            id="notification-credit-upload"
                            type="file"
                            onChange={(e) => handleFileUpload(e.target.files[0], "notificationCredit")}
                            disabled={uploadingFiles.notificationCredit}
                          />
                          <label htmlFor="notification-credit-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<Upload />}
                              disabled={uploadingFiles.notificationCredit}
                            >
                              {uploadingFiles.notificationCredit ? "Upload en cours..." : "Uploader la notification de crédit"}
                            </Button>
                          </label>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Commentaires */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Commentaires (optionnel)"
                      multiline
                      rows={4}
                      value={formData.commentairesBanque}
                      onChange={(e) => setFormData({ ...formData, commentairesBanque: e.target.value })}
                      placeholder="Ajoutez des commentaires ou notes supplémentaires..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Précédent
            </Button>
            <Box>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={saving}
                  sx={{ textTransform: "none" }}
                >
                  {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer la demande"}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Container>
    </PageLayout>
  );
};

export default CreateDemandeCreditHypothecairePage;

