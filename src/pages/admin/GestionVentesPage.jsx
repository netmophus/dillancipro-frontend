import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Tabs,
  Tab,
  InputAdornment,
  Stack,
  Divider,
} from "@mui/material";
import {
  Gavel,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Refresh,
  ArrowBack,
  Visibility,
  Close,
  Search,
  AttachMoney,
  ShoppingCart,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const GestionVentesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [ventes, setVentes] = useState([]);
  const [toutesLesVentes, setToutesLesVentes] = useState([]); // Pour les stats
  const [searchTerm, setSearchTerm] = useState("");

  // Dialogs
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [validerDialog, setValiderDialog] = useState(false);
  const [rejeterDialog, setRejeterDialog] = useState(false);
  const [vendueDialog, setVendueDialog] = useState(false);
  const [contreProposerDialog, setContreProposerDialog] = useState(false);
  const [selectedVente, setSelectedVente] = useState(null);

  const [motifRejet, setMotifRejet] = useState("");
  const [prixPropose, setPrixPropose] = useState("");
  const [acheteurData, setAcheteurData] = useState({
    nom: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchAllVentes(); // Charger toutes les ventes pour les stats
  }, []);

  useEffect(() => {
    fetchVentes();
  }, [activeTab]);

  const fetchAllVentes = async () => {
    try {
      const res = await api.get(`/patrimoine/ventes/all`);
      setToutesLesVentes(res.data);
      console.log("✅ Toutes les ventes chargées:", res.data.length);
    } catch (err) {
      console.error("Erreur chargement toutes ventes:", err);
    }
  };

  const fetchVentes = async () => {
    setLoading(true);
    try {
      const statuts = ["soumise", "contre_propose", "approuvee", "vendue", "rejetee"];
      const res = await api.get(`/patrimoine/ventes/all?statut=${statuts[activeTab]}`);
      setVentes(res.data);
    } catch (err) {
      console.error("Erreur chargement ventes:", err);
      setError("Erreur lors du chargement des ventes");
    } finally {
      setLoading(false);
    }
  };

  const openDetailsDialog = (vente) => {
    setSelectedVente(vente);
    setDetailsDialog(true);
  };

  const openValiderDialog = (vente) => {
    setSelectedVente(vente);
    setValiderDialog(true);
  };

  const openRejeterDialog = (vente) => {
    setSelectedVente(vente);
    setMotifRejet("");
    setRejeterDialog(true);
  };

  const openVendueDialog = (vente) => {
    setSelectedVente(vente);
    setAcheteurData({ nom: "", phone: "", email: "" });
    setVendueDialog(true);
  };

  const openContreProposerDialog = (vente) => {
    setSelectedVente(vente);
    setPrixPropose(vente.prixVente.toString()); // Suggérer le prix actuel
    setContreProposerDialog(true);
  };

  const handleContreProposer = async () => {
    try {
      if (!prixPropose || parseFloat(prixPropose) <= 0) {
        setError("Prix invalide");
        return;
      }

      await api.put(`/patrimoine/ventes/${selectedVente._id}/contre-proposer`, {
        prixPropose: parseFloat(prixPropose),
      });

      setSuccess(`✅ Contre-proposition envoyée au client`);
      setContreProposerDialog(false);
      fetchVentes();
      fetchAllVentes();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la contre-proposition");
    }
  };

  const handleValider = async () => {
    try {
      await api.post(`/patrimoine/ventes/${selectedVente._id}/valider`);
      setSuccess(`✅ Vente validée pour "${selectedVente.patrimoineId?.titre}"`);
      setValiderDialog(false);
      fetchVentes();
      fetchAllVentes(); // Actualiser les stats
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la validation");
    }
  };

  const handleRejeter = async () => {
    try {
      if (!motifRejet) {
        setError("Motif de rejet requis");
        return;
      }

      await api.post(`/patrimoine/ventes/${selectedVente._id}/rejeter`, {
        motifRejet,
      });
      setSuccess(`❌ Vente rejetée`);
      setRejeterDialog(false);
      fetchVentes();
      fetchAllVentes(); // Actualiser les stats
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du rejet");
    }
  };

  const handleMarquerVendue = async () => {
    try {
      if (!acheteurData.nom) {
        setError("Nom de l'acheteur requis");
        return;
      }

      await api.post(`/patrimoine/ventes/${selectedVente._id}/marquer-vendue`, acheteurData);
      setSuccess(`✅ Vente marquée comme vendue`);
      setVendueDialog(false);
      fetchVentes();
      fetchAllVentes(); // Actualiser les stats
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const filteredVentes = ventes.filter(
    (vente) =>
      vente.patrimoineId?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vente.vendeurId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const KPICard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card elevation={3} sx={{ height: "100%", borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color} sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56, ml: 2 }}>
            <Icon fontSize="large" />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const stats = {
    soumises: toutesLesVentes.filter((v) => v.statut === "soumise").length,
    contreProposees: toutesLesVentes.filter((v) => v.statut === "contre_propose").length,
    approuvees: toutesLesVentes.filter((v) => v.statut === "approuvee").length,
    vendues: toutesLesVentes.filter((v) => v.statut === "vendue").length,
    rejetees: toutesLesVentes.filter((v) => v.statut === "rejetee").length,
  };

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/admin/dashboard")} sx={{ mb: 2 }}>
            Retour au dashboard
          </Button>

          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 64, height: 64 }}>
              <Gavel fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestion des Ventes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gérez les ventes soumises et les commissions
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Alertes */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* KPIs */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Soumises"
              value={stats.soumises}
              subtitle="En attente"
              icon={HourglassEmpty}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Approuvées"
              value={stats.approuvees}
              subtitle="En vente"
              icon={ShoppingCart}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Vendues"
              value={stats.vendues}
              subtitle="Terminées"
              icon={CheckCircle}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Rejetées"
              value={stats.rejetees}
              subtitle="Non validées"
              icon={Cancel}
              color="#f44336"
            />
          </Grid>
        </Grid>

        {/* Onglets */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": { fontWeight: "bold" },
            }}
          >
            <Tab label={`Soumises (${stats.soumises})`} />
            <Tab label={`Contre-proposées (${stats.contreProposees})`} />
            <Tab label={`Approuvées (${stats.approuvees})`} />
            <Tab label={`Vendues (${stats.vendues})`} />
            <Tab label={`Rejetées (${stats.rejetees})`} />
          </Tabs>
        </Paper>

        {/* Recherche */}
        <TextField
          fullWidth
          placeholder="Rechercher par bien ou propriétaire..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Tableau */}
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                📋 Liste des ventes ({filteredVentes.length})
              </Typography>
              <Button startIcon={<Refresh />} onClick={fetchVentes} variant="outlined" size="small">
                Actualiser
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : filteredVentes.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography color="text.secondary">Aucune vente dans cette catégorie</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bien</TableCell>
                      <TableCell>Propriétaire</TableCell>
                      <TableCell align="right">Prix de vente</TableCell>
                      <TableCell align="right">Commission</TableCell>
                      <TableCell>Date soumission</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVentes.map((vente) => (
                      <TableRow key={vente._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {vente.patrimoineId?.titre || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vente.patrimoineId?.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{vente.vendeurId?.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vente.vendeurId?.phone}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          {vente.statut === "contre_propose" && vente.contrePropositionPrix ? (
                            <Box>
                              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                          {formatMoney(vente.prixVente)}
                              </Typography>
                              <Typography variant="h6" color="warning.main">
                                {formatMoney(vente.contrePropositionPrix)}
                              </Typography>
                            </Box>
                          ) : (
                            formatMoney(vente.prixVente)
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {vente.commissionPourcentage}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatMoney(vente.commissionMontant)}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(vente.createdAt)}</TableCell>
                        <TableCell>
                          {vente.statut === "soumise" && (
                            <Chip label="Soumise" size="small" color="warning" />
                          )}
                          {vente.statut === "approuvee" && (
                            <Chip label="Approuvée" size="small" color="info" />
                          )}
                          {vente.statut === "contre_propose" && (
                            <Chip label="Contre-proposée" size="small" color="warning" />
                          )}
                          {vente.statut === "vendue" && (
                            <Chip label="Vendue ✓" size="small" color="success" />
                          )}
                          {vente.statut === "rejetee" && (
                            <Chip label="Rejetée" size="small" color="error" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Voir détails">
                              <IconButton size="small" color="info" onClick={() => openDetailsDialog(vente)}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>

                            {vente.statut === "soumise" && (
                              <>
                                <Tooltip title="Contre-proposer un prix">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => openContreProposerDialog(vente)}
                                  >
                                    💰
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Valider">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => openValiderDialog(vente)}
                                  >
                                    <CheckCircle />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Rejeter">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => openRejeterDialog(vente)}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}

                            {vente.statut === "approuvee" && (
                              <Tooltip title="Marquer comme vendue">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => openVendueDialog(vente)}
                                >
                                  <AttachMoney />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* DIALOG : Détails */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Détails complet du bien et de la vente</Typography>
            <IconButton onClick={() => setDetailsDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedVente && (
            <Grid container spacing={2}>
              {/* Informations générales */}
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }}>
                  <Chip label="Informations de la vente" color="primary" />
                </Divider>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Propriétaire
                </Typography>
                <Typography variant="body1">{selectedVente.vendeurId?.fullName}</Typography>
                <Typography variant="caption">{selectedVente.vendeurId?.phone}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Prix de vente
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatMoney(selectedVente.prixVente)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Commission
                </Typography>
                <Typography variant="body1">
                  {selectedVente.commissionPourcentage}% = {formatMoney(selectedVente.commissionMontant)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Statut
                </Typography>
                <Chip label={selectedVente.statut} color="primary" />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Date soumission
                </Typography>
                <Typography variant="body1">{formatDate(selectedVente.createdAt)}</Typography>
              </Grid>

              {/* Informations du bien */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }}>
                  <Chip label="Informations du bien" color="success" />
                </Divider>
              </Grid>

              {selectedVente.patrimoineId && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {selectedVente.patrimoineId.titre}
                    </Typography>
                    <Chip label={selectedVente.patrimoineId.type} color="primary" />
                  </Grid>

                  {selectedVente.patrimoineId.description && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {selectedVente.patrimoineId.description}
                      </Typography>
                    </Grid>
                  )}

                  {selectedVente.patrimoineId.superficie && (
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Superficie
                      </Typography>
                      <Typography variant="body1">{selectedVente.patrimoineId.superficie} m²</Typography>
                    </Grid>
                  )}

                  {selectedVente.patrimoineId.valeurEstimee && (
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Valeur estimée
                      </Typography>
                      <Typography variant="body1">
                        {new Intl.NumberFormat("fr-FR").format(selectedVente.patrimoineId.valeurEstimee)} FCFA
                      </Typography>
                    </Grid>
                  )}

                  {selectedVente.patrimoineId.reference && (
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Référence
                      </Typography>
                      <Typography variant="body1">{selectedVente.patrimoineId.reference}</Typography>
                    </Grid>
                  )}

                  {/* Localisation */}
                  {selectedVente.patrimoineId.localisation && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        📍 Localisation
                      </Typography>
                      <Typography variant="body2">
                        {selectedVente.patrimoineId.localisation.ville && `${selectedVente.patrimoineId.localisation.ville}`}
                        {selectedVente.patrimoineId.localisation.quartier && `, ${selectedVente.patrimoineId.localisation.quartier}`}
                        {selectedVente.patrimoineId.localisation.commune && `, ${selectedVente.patrimoineId.localisation.commune}`}
                      </Typography>
                      {selectedVente.patrimoineId.localisation.latitude && selectedVente.patrimoineId.localisation.longitude && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Coordonnées: {selectedVente.patrimoineId.localisation.latitude}, {selectedVente.patrimoineId.localisation.longitude}
                        </Typography>
                      )}
                    </Grid>
                  )}

                  {/* Photos */}
                  {selectedVente.patrimoineId.photos && selectedVente.patrimoineId.photos.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        📸 Photos ({selectedVente.patrimoineId.photos.length})
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {selectedVente.patrimoineId.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            style={{
                              width: 120,
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                            onClick={() => window.open(photo, "_blank")}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {/* Documents */}
                  {selectedVente.patrimoineId.documents && selectedVente.patrimoineId.documents.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        📄 Documents joints ({selectedVente.patrimoineId.documents.length})
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {selectedVente.patrimoineId.documents.map((doc, index) => (
                          <Button
                            key={index}
                            variant="outlined"
                            size="small"
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Document {index + 1}
                          </Button>
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {/* Vidéo */}
                  {selectedVente.patrimoineId.videoUrl && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        🎥 Vidéo
                      </Typography>
                      <Typography variant="body2" color="primary" component="a" href={selectedVente.patrimoineId.videoUrl} target="_blank">
                        {selectedVente.patrimoineId.videoUrl}
                      </Typography>
                    </Grid>
                  )}

                  {/* Documents de vérification */}
                  {selectedVente.patrimoineId.documentsVerification && selectedVente.patrimoineId.documentsVerification.length > 0 && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }}>
                        <Chip label="Documents de vérification" color="info" />
                      </Divider>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {selectedVente.patrimoineId.documentsVerification.map((doc, index) => (
                          <Box
                            key={index}
                            sx={{
                              border: "1px solid #ddd",
                              borderRadius: 1,
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                📄 {doc.description || `Document ${index + 1}`}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ouvrir
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {/* Notes de vérification */}
                  {selectedVente.patrimoineId.notesVerification && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        📝 Notes de vérification
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {selectedVente.patrimoineId.notesVerification}
                    </Typography>
                    </Grid>
                  )}
                </>
              )}

              {/* Informations acheteur (si vendu) */}
              {selectedVente.statut === "vendue" && selectedVente.acheteurNom && (
                <>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }}>
                      <Chip label="Informations acheteur" color="error" />
                    </Divider>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Nom
                    </Typography>
                    <Typography variant="body1">{selectedVente.acheteurNom}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Téléphone
                    </Typography>
                    <Typography variant="body1">{selectedVente.acheteurPhone}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Valider */}
      <Dialog open={validerDialog} onClose={() => setValiderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>✅ Valider la vente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Bien : <strong>{selectedVente?.patrimoineId?.titre}</strong>
          </Typography>
          <Typography variant="body2" mb={2}>
            Prix : {formatMoney(selectedVente?.prixVente)}
          </Typography>
          <Typography variant="body2" color="success.main" mb={2}>
            Commission : {selectedVente?.commissionPourcentage}% ={" "}
            {formatMoney(selectedVente?.commissionMontant)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Le bien sera mis en vente via Softlink.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValiderDialog(false)}>Annuler</Button>
          <Button onClick={handleValider} variant="contained" color="success" startIcon={<CheckCircle />}>
            Valider
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Rejeter */}
      <Dialog open={rejeterDialog} onClose={() => setRejeterDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>❌ Rejeter la vente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Bien : <strong>{selectedVente?.patrimoineId?.titre}</strong>
          </Typography>

          <TextField
            label="Motif du rejet"
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            placeholder="Expliquez pourquoi cette vente est rejetée..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejeterDialog(false)}>Annuler</Button>
          <Button onClick={handleRejeter} variant="contained" color="error" startIcon={<Cancel />}>
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Marquer comme vendue */}
      <Dialog open={vendueDialog} onClose={() => setVendueDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>💰 Marquer comme vendue</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Bien : <strong>{selectedVente?.patrimoineId?.titre}</strong>
          </Typography>
          <Typography variant="body2" color="success.main" mb={3}>
            Commission à prélever : {formatMoney(selectedVente?.commissionMontant)}
          </Typography>

          <Typography variant="subtitle2" fontWeight="bold" mb={2}>
            Informations de l'acheteur
          </Typography>

          <TextField
            label="Nom de l'acheteur"
            value={acheteurData.nom}
            onChange={(e) => setAcheteurData({ ...acheteurData, nom: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="Téléphone"
            value={acheteurData.phone}
            onChange={(e) => setAcheteurData({ ...acheteurData, phone: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Email (optionnel)"
            type="email"
            value={acheteurData.email}
            onChange={(e) => setAcheteurData({ ...acheteurData, email: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVendueDialog(false)}>Annuler</Button>
          <Button onClick={handleMarquerVendue} variant="contained" color="success" startIcon={<AttachMoney />}>
            Marquer comme vendue
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Contre-proposer */}
      <Dialog open={contreProposerDialog} onClose={() => setContreProposerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>💰 Contre-proposition de prix</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Bien : <strong>{selectedVente?.patrimoineId?.titre}</strong>
          </Typography>
          <Typography variant="body2" mb={2}>
            Prix actuel demandé par le client : <strong>{formatMoney(selectedVente?.prixVente)}</strong>
          </Typography>

          <TextField
            label="Nouveau prix proposé"
            type="number"
            value={prixPropose}
            onChange={(e) => setPrixPropose(e.target.value)}
            fullWidth
            required
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
            }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Le client sera notifié de votre contre-proposition. Il pourra l'accepter ou la refuser.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContreProposerDialog(false)}>Annuler</Button>
          <Button onClick={handleContreProposer} variant="contained" color="warning" startIcon={<AttachMoney />}>
            Envoyer la contre-proposition
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default GestionVentesPage;

