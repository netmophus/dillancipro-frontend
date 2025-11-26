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
  Paper,
  IconButton,
  Divider,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Home,
  AttachMoney,
  CalendarToday,
  Description,
  AccountBalance,
  LocationOn,
  Phone,
  Email,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Download,
  Refresh,
  Notifications,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const DetailsDemandeCreditHypothecairePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);

  useEffect(() => {
    fetchDemande(true);
    
    // Rafraîchissement automatique toutes les 30 secondes pour suivre les mises à jour du notaire
    const interval = setInterval(() => {
      fetchDemande(false); // Ne pas afficher le loading lors du rafraîchissement automatique
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDemande = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get(`/banque/demandes-credit-hypothecaire/${id}`);
      const newDemande = response.data.demande;
      
      // Détecter les nouvelles mises à jour
      if (demande && newDemande.updatedAt !== demande.updatedAt) {
        setHasNewUpdate(true);
        setTimeout(() => setHasNewUpdate(false), 5000); // Afficher pendant 5 secondes
      }
      
      setDemande(newDemande);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erreur chargement demande:", err);
      setError("Erreur lors du chargement de la demande");
    } finally {
      if (showLoading) setLoading(false);
    }
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
      hour: "2-digit",
      minute: "2-digit",
    });
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
    inscription_hypothecaire_en_cours: "Inscription hypothécaire en cours",
    inscription_hypothecaire_terminee: "Inscription hypothécaire terminée",
    rejete: "Rejeté",
    annule: "Annulé",
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

  if (error || !demande) {
    return (
      <PageLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || "Demande non trouvée"}</Alert>
          <Button onClick={() => navigate("/banque/demandes-credit-hypothecaire")} sx={{ mt: 2 }}>
            Retour à la liste
          </Button>
        </Container>
      </PageLayout>
    );
  }

  const steps = [
    { label: "Soumis par banque", status: "soumis_par_banque" },
    { label: "En traitement", status: "en_traitement_notaire" },
    { label: "Convention formalisée", status: "convention_formalisee" },
    { label: "Inscription en cours", status: "inscription_hypothecaire_en_cours" },
    { label: "Inscription terminée", status: "inscription_hypothecaire_terminee" },
  ];

  const currentStep = steps.findIndex((step) => step.status === demande.statut);

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* En-tête */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={() => navigate("/banque/demandes-credit-hypothecaire")}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h4" fontWeight="bold">
                Demande {demande.reference}
              </Typography>
              <Chip
                label={STATUT_LABELS[demande.statut]}
                color={STATUT_COLORS[demande.statut]}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              {hasNewUpdate && (
                <Chip
                  icon={<Notifications />}
                  label="Nouvelle mise à jour"
                  color="success"
                  size="small"
                />
              )}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={() => fetchDemande(true)}
                disabled={loading}
              >
                Actualiser
              </Button>
            </Box>
          </Box>
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              Dernière mise à jour : {formatDate(lastUpdate)}
            </Typography>
          )}
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={currentStep >= 0 ? currentStep : 0} alternativeLabel>
            {steps.map((step) => (
              <Step key={step.status}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Informations du crédit */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AttachMoney /> Informations du crédit
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Montant du crédit</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {formatMoney(demande.montantCredit)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Devise</Typography>
                    <Typography variant="body1">{demande.devise}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Durée de remboursement</Typography>
                    <Typography variant="body1">{demande.dureeRemboursement} mois</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Taux d'intérêt annuel</Typography>
                    <Typography variant="body1">{demande.tauxInteret}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Priorité</Typography>
                    <Chip
                      label={demande.priorite === "urgente" ? "Urgente" : demande.priorite === "tres_urgente" ? "Très urgente" : "Normale"}
                      color={demande.priorite === "urgente" || demande.priorite === "tres_urgente" ? "error" : "default"}
                      size="small"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person /> Emprunteur
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Nom complet</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {demande.emprunteur?.nom} {demande.emprunteur?.prenom}
                    </Typography>
                  </Box>
                  {demande.emprunteur?.telephone && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{demande.emprunteur.telephone}</Typography>
                    </Box>
                  )}
                  {demande.emprunteur?.email && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{demande.emprunteur.email}</Typography>
                    </Box>
                  )}
                  {demande.emprunteur?.adresse && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Adresse</Typography>
                      <Typography variant="body2">{demande.emprunteur.adresse}</Typography>
                    </Box>
                  )}
                  {demande.emprunteur?.profession && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Profession</Typography>
                      <Typography variant="body2">{demande.emprunteur.profession}</Typography>
                    </Box>
                  )}
                  {demande.emprunteur?.numeroCNI && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Numéro CNI</Typography>
                      <Typography variant="body2">{demande.emprunteur.numeroCNI}</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bien immobilier */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Home /> Bien immobilier
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body1" fontWeight="bold" textTransform="capitalize">
                    {demande.bienImmobilier?.type}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Valeur estimée</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {formatMoney(demande.bienImmobilier?.valeurEstimee)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body1" fontWeight="bold">
                    {demande.bienImmobilier?.adresse}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {demande.bienImmobilier?.quartier && `${demande.bienImmobilier.quartier}, `}
                  {demande.bienImmobilier?.ville}
                </Typography>
              </Grid>
              {demande.bienImmobilier?.superficie && (
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Superficie</Typography>
                    <Typography variant="body1">{demande.bienImmobilier.superficie} m²</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Notaire assigné */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountBalance /> Notaire assigné
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" fontWeight="bold">
                  {demande.notaireId?.fullName || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {demande.notaireId?.cabinetName || ""}
                </Typography>
              </Grid>
              {demande.notaireId?.phone && (
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">{demande.notaireId.phone}</Typography>
                  </Box>
                </Grid>
              )}
              {demande.notaireId?.email && (
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2">{demande.notaireId.email}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Documents */}
        <Grid container spacing={3} mb={4}>
          {/* Documents de la banque */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Description /> Documents soumis par la banque
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List>
                  {demande.documentsBanque?.titrePropriete?.url && (
                    <ListItem>
                      <ListItemIcon>
                        <Description color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Titre de propriété"
                        secondary={demande.documentsBanque.titrePropriete.nom || "Document"}
                      />
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownload(
                          demande.documentsBanque.titrePropriete.url,
                          demande.documentsBanque.titrePropriete.nom || "titre-propriete"
                        )}
                      >
                        Télécharger
                      </Button>
                    </ListItem>
                  )}
                  {demande.documentsBanque?.notificationCredit?.url && (
                    <ListItem>
                      <ListItemIcon>
                        <Description color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Notification de crédit"
                        secondary={demande.documentsBanque.notificationCredit.nom || "Document"}
                      />
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownload(
                          demande.documentsBanque.notificationCredit.url,
                          demande.documentsBanque.notificationCredit.nom || "notification-credit"
                        )}
                      >
                        Télécharger
                      </Button>
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Documents du notaire */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Description /> Documents générés par le notaire
                  </Typography>
                  {demande.statut === "en_traitement_notaire" || demande.statut === "convention_formalisee" || demande.statut === "inscription_hypothecaire_en_cours" ? (
                    <Chip
                      icon={<HourglassEmpty />}
                      label="En attente"
                      color="warning"
                      size="small"
                    />
                  ) : demande.statut === "inscription_hypothecaire_terminee" ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="Terminé"
                      color="success"
                      size="small"
                    />
                  ) : null}
                </Box>
                <Divider sx={{ my: 2 }} />
                <List>
                  {demande.documentsNotaire?.conventionOuvertureCredit?.url ? (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Convention d'ouverture de crédit"
                        secondary={
                          <>
                            {demande.documentsNotaire.conventionOuvertureCredit.nom || "Document"}
                            {demande.documentsNotaire.conventionOuvertureCredit.numeroConvention && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                N° {demande.documentsNotaire.conventionOuvertureCredit.numeroConvention}
                              </Typography>
                            )}
                            {demande.documentsNotaire.conventionOuvertureCredit.dateCreation && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {formatDate(demande.documentsNotaire.conventionOuvertureCredit.dateCreation)}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownload(
                          demande.documentsNotaire.conventionOuvertureCredit.url,
                          demande.documentsNotaire.conventionOuvertureCredit.nom || "convention-ouverture-credit"
                        )}
                      >
                        Télécharger
                      </Button>
                    </ListItem>
                  ) : (
                    <ListItem>
                      <ListItemIcon>
                        <HourglassEmpty color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Convention d'ouverture de crédit" secondary="En attente" />
                    </ListItem>
                  )}
                  {demande.documentsNotaire?.acteHypothecaire?.url ? (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Acte hypothécaire"
                        secondary={
                          <>
                            {demande.documentsNotaire.acteHypothecaire.nom || "Document"}
                            {demande.documentsNotaire.acteHypothecaire.numeroActe && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                N° {demande.documentsNotaire.acteHypothecaire.numeroActe}
                              </Typography>
                            )}
                            {demande.documentsNotaire.acteHypothecaire.dateCreation && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {formatDate(demande.documentsNotaire.acteHypothecaire.dateCreation)}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownload(
                          demande.documentsNotaire.acteHypothecaire.url,
                          demande.documentsNotaire.acteHypothecaire.nom || "acte-hypothecaire"
                        )}
                      >
                        Télécharger
                      </Button>
                    </ListItem>
                  ) : (
                    <ListItem>
                      <ListItemIcon>
                        <HourglassEmpty color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Acte hypothécaire" secondary="En attente" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dates importantes */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday /> Dates importantes
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Date de soumission</Typography>
                  <Typography variant="body1">{formatDate(demande.dateSoumission)}</Typography>
                </Box>
              </Grid>
              {demande.dateTraitementNotaire && (
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Date de traitement par le notaire</Typography>
                    <Typography variant="body1">{formatDate(demande.dateTraitementNotaire)}</Typography>
                  </Box>
                </Grid>
              )}
              {demande.dateConventionFormalisee && (
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Date de formalisation de la convention</Typography>
                    <Typography variant="body1">{formatDate(demande.dateConventionFormalisee)}</Typography>
                  </Box>
                </Grid>
              )}
              {demande.dateInscriptionHypothecaire && (
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Date d'inscription hypothécaire</Typography>
                    <Typography variant="body1">{formatDate(demande.dateInscriptionHypothecaire)}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Commentaires */}
        {(demande.commentairesBanque || demande.commentairesNotaire) && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Commentaires
              </Typography>
              <Divider sx={{ my: 2 }} />
              {demande.commentairesBanque && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Commentaires de la banque
                  </Typography>
                  <Typography variant="body2">{demande.commentairesBanque}</Typography>
                </Box>
              )}
              {demande.commentairesNotaire && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Commentaires du notaire
                  </Typography>
                  <Typography variant="body2">{demande.commentairesNotaire}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Motif de rejet */}
        {demande.motifRejet && (
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Motif du rejet
            </Typography>
            <Typography variant="body2">{demande.motifRejet}</Typography>
          </Alert>
        )}

        {/* Informations sur le processus */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            📋 Processus de formalisation notariale
          </Typography>
          <Typography variant="body2">
            Le notaire partenaire formalise les documents et les envoie à la banque. 
            Vous pouvez suivre l'avancement en temps réel ci-dessus. 
            Une fois l'inscription hypothécaire terminée, le processus de formalisation notariale est complété.
          </Typography>
        </Alert>

        {/* Boutons d'action */}
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button variant="outlined" onClick={() => navigate("/banque/demandes-credit-hypothecaire")}>
            Retour à la liste
          </Button>
          {demande.statut === "soumis_par_banque" || demande.statut === "rejete" ? (
            <Button
              variant="contained"
              onClick={() => navigate(`/banque/demandes-credit-hypothecaire/${id}/modifier`)}
            >
              Modifier
            </Button>
          ) : null}
        </Box>
      </Container>
    </PageLayout>
  );
};

export default DetailsDemandeCreditHypothecairePage;
