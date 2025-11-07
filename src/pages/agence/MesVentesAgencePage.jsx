import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from "@mui/material";
import {
  Visibility,
  Home,
  Person,
  History,
  CheckCircle,
  Close,
  Business,
  Gavel,
  AttachMoney,
  Description,
  Download,
  PictureAsPdf,
  InsertDriveFile,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../services/api";

const STATUT_COLORS = {
  en_attente_notaire: "warning",
  en_cours_notariat: "info",
  formalites_completes: "info",
  en_attente_signature: "primary",
  signee: "success",
  finalisee: "success",
  annulee: "error",
};

const STATUT_LABELS = {
  en_attente_notaire: "En attente notaire",
  en_cours_notariat: "En cours notariat",
  formalites_completes: "Formalités complètes",
  en_attente_signature: "En attente signature",
  signee: "Signée",
  finalisee: "Finalisée",
  annulee: "Annulée",
};

const MesVentesAgencePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVente, setSelectedVente] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [historiqueOpen, setHistoriqueOpen] = useState(false);

  useEffect(() => {
    fetchVentes();
  }, []);

  const fetchVentes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/agence/ventes/agence");
      setVentes(res.data);
    } catch (err) {
      console.error("Erreur chargement ventes:", err);
      setError("Impossible de charger les ventes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (venteId) => {
    try {
      const res = await API.get(`/agence/ventes/${venteId}`);
      setSelectedVente(res.data);
      setDetailsOpen(true);
    } catch (err) {
      console.error("Erreur chargement détails:", err);
      setError("Impossible de charger les détails de la vente");
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedVente(null);
    setHistoriqueOpen(false);
  };

  const handleSigner = async () => {
    if (!window.confirm("Confirmer la signature de cette vente ?")) {
      return;
    }

    try {
      await API.post(`/agence/ventes/${selectedVente._id}/signature`, {
        signatureType: "agence",
      });
      setError("");
      fetchVentes();
      handleOpenDetails(selectedVente._id);
    } catch (err) {
      console.error("Erreur signature:", err);
      setError(err.response?.data?.message || "Erreur lors de la signature");
    }
  };

  const handleFinaliser = async () => {
    if (!window.confirm(`Confirmer la finalisation de cette vente ? L'argent de ${formatMoney(selectedVente.prixVente)} sera transféré à votre compte.`)) {
      return;
    }

    try {
      await API.post(`/agence/ventes/${selectedVente._id}/finaliser`);
      setError("");
      fetchVentes();
      handleOpenDetails(selectedVente._id);
    } catch (err) {
      console.error("Erreur finalisation:", err);
      setError(err.response?.data?.message || "Erreur lors de la finalisation");
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

  const peutSigner = (vente) => {
    return vente.statut === "en_attente_signature" && 
           !vente.signatures?.agence;
  };

  const peutFinaliser = (vente) => {
    return vente.statut === "signee" && !vente.argentTransfere;
  };

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Business sx={{ fontSize: 40, color: "primary.main" }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Ventes de l'Agence
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Suivez l'avancement de toutes les ventes avec le notaire
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              onClick={() => navigate("/agence/dashboard")}
            >
              Retour au dashboard
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : ventes.length === 0 ? (
          <Card>
            <CardContent>
              <Typography align="center" color="text.secondary">
                Aucune vente trouvée
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Bien</strong></TableCell>
                  <TableCell><strong>Client</strong></TableCell>
                  <TableCell><strong>Commercial</strong></TableCell>
                  <TableCell><strong>Prix</strong></TableCell>
                  <TableCell><strong>Notaire</strong></TableCell>
                  <TableCell><strong>Statut</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ventes.map((vente) => (
                  <TableRow key={vente._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Home fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {vente.bienId?.titre || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vente.bienId?.type || ""}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {vente.clientId?.fullName || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {vente.commercialId?.fullName || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        {formatMoney(vente.prixVente)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {vente.notaireId?.fullName || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUT_LABELS[vente.statut] || vente.statut}
                        color={STATUT_COLORS[vente.statut] || "default"}
                        size="small"
                      />
                      {peutSigner(vente) && (
                        <Chip
                          label="À signer"
                          color="warning"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                      {peutFinaliser(vente) && (
                        <Chip
                          label="À finaliser"
                          color="info"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(vente.dateVente)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir les détails">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetails(vente._id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialog Détails */}
        {selectedVente && (
          <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="lg" fullWidth>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Détails de la vente</Typography>
                <IconButton onClick={handleCloseDetails}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      BIEN VENDU
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {selectedVente.bienId?.titre || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {selectedVente.bienId?.type || "N/A"} • 
                      Superficie: {selectedVente.bienId?.superficie || "N/A"} m²
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      PRIX DE VENTE
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {formatMoney(selectedVente.prixVente)}
                    </Typography>
                    {selectedVente.argentTransfere && (
                      <Chip
                        label="Argent transféré"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CLIENT
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedVente.clientId?.fullName || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedVente.clientId?.phone || ""}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      COMMERCIAL
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedVente.commercialId?.fullName || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedVente.commercialId?.phone || ""}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      NOTAIRE
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedVente.notaireId?.fullName || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cabinet: {selectedVente.notaireId?.cabinetName || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Téléphone: {selectedVente.notaireId?.phone || "N/A"}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        STATUT ACTUEL
                      </Typography>
                      <Chip
                        label={STATUT_LABELS[selectedVente.statut] || selectedVente.statut}
                        color={STATUT_COLORS[selectedVente.statut] || "default"}
                      />
                    </Box>
                    
                    {selectedVente.signatures && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          SIGNATURES
                        </Typography>
                        <Box display="flex" gap={2} flexWrap="wrap">
                          <Chip
                            label={`Commercial: ${selectedVente.signatures.commercial ? "✓ Signé" : "En attente"}`}
                            color={selectedVente.signatures.commercial ? "success" : "warning"}
                            size="small"
                          />
                          <Chip
                            label={`Client: ${selectedVente.signatures.client ? "✓ Signé" : "En attente"}`}
                            color={selectedVente.signatures.client ? "success" : "warning"}
                            size="small"
                          />
                          <Chip
                            label={`Agence: ${selectedVente.signatures.agence ? "✓ Signé" : "En attente"}`}
                            color={selectedVente.signatures.agence ? "success" : "warning"}
                            size="small"
                          />
                        </Box>
                      </Box>
                    )}

                    <Box display="flex" gap={2} flexWrap="wrap">
                      {peutSigner(selectedVente) && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<CheckCircle />}
                          onClick={handleSigner}
                        >
                          Signer la vente
                        </Button>
                      )}
                      {peutFinaliser(selectedVente) && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<AttachMoney />}
                          onClick={handleFinaliser}
                        >
                          Finaliser et transférer l'argent
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<History />}
                        onClick={() => setHistoriqueOpen(true)}
                      >
                        Voir l'historique
                      </Button>
                    </Box>
                  </Card>
                </Grid>

                {/* Documents notariaux */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      📄 DOCUMENTS NOTARIAUX
                    </Typography>
                    {selectedVente.documentsNotariaux && selectedVente.documentsNotariaux.length > 0 ? (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {selectedVente.documentsNotariaux.map((doc, index) => {
                          const getDocIcon = () => {
                            if (doc.url?.includes('.pdf')) return <PictureAsPdf />;
                            return <InsertDriveFile />;
                          };
                          
                          const DOC_TYPE_LABELS = {
                            acte_vente: "Acte de vente",
                            acte_notarie: "Acte notarié",
                            quittance: "Quittance",
                            autre: "Autre",
                          };

                          return (
                            <Grid item xs={12} sm={6} md={4} key={doc._id || index}>
                              <Card 
                                variant="outlined" 
                                sx={{ 
                                  p: 1.5,
                                  transition: "all 0.3s",
                                  "&:hover": { bgcolor: "action.hover", transform: "translateY(-2px)" }
                                }}
                              >
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  {getDocIcon()}
                                  <Typography variant="body2" fontWeight="medium" noWrap sx={{ flex: 1 }}>
                                    {doc.nom}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={DOC_TYPE_LABELS[doc.type] || doc.type || "Autre"} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ mb: 1 }}
                                />
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(doc.uploadLe)}
                                  </Typography>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Download />}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(doc.url, '_blank');
                                    }}
                                  >
                                    Télécharger
                                  </Button>
                                </Box>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <Box textAlign="center" py={3}>
                        <Description sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Aucun document uploadé pour le moment
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                          Le notaire uploadera les documents lorsqu'ils seront prêts
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Fermer</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Dialog Historique */}
        <Dialog
          open={historiqueOpen}
          onClose={() => setHistoriqueOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Historique de la vente</DialogTitle>
          <DialogContent>
            {selectedVente?.historique?.length > 0 ? (
              <List>
                {selectedVente.historique
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem>
                        <ListItemText
                          primary={entry.description || entry.action}
                          secondary={`${entry.acteurNom || "Système"} • ${formatDate(entry.date)}`}
                        />
                        {entry.acteurType && (
                          <Chip label={entry.acteurType} size="small" color="primary" variant="outlined" />
                        )}
                      </ListItem>
                      {idx < selectedVente.historique.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" py={2}>
                Aucun historique
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoriqueOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageLayout>
  );
};

export default MesVentesAgencePage;

