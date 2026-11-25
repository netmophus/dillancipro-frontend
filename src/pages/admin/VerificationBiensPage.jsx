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
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Tabs,
  Tab,
  InputAdornment,
  Stack,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Refresh,
  ArrowBack,
  Visibility,
  Close,
  Search,
  VerifiedUser,
  PendingActions,
  AttachMoney,
  AttachFile,
  Delete,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";

// En-tête de dialogue moderne, coloré, réutilisable
const DialogHeader = ({ icon: Icon, title, subtitle, color, onClose }) => (
  <Box
    sx={{
      p: 3,
      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      color: "white",
      position: "relative",
    }}
  >
    <IconButton
      onClick={onClose}
      sx={{ position: "absolute", top: 12, right: 12, color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}
    >
      <Close />
    </IconButton>
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.22)", width: 52, height: 52 }}>
        <Icon fontSize="large" />
      </Avatar>
      <Box>
        <Typography variant="h6" fontWeight="bold">{title}</Typography>
        {subtitle && <Typography variant="body2" sx={{ opacity: 0.9 }}>{subtitle}</Typography>}
      </Box>
    </Stack>
  </Box>
);

// Bloc récapitulatif du bien sélectionné
const BienInfoBox = ({ bien }) => (
  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f7f9fc", border: "1px solid #eef2f7", mb: 2.5 }}>
    <Typography variant="subtitle1" fontWeight="bold">{bien?.titre}</Typography>
    <Stack direction="row" alignItems="center" spacing={0.75} mt={0.5}>
      <Person sx={{ fontSize: 16, color: "text.secondary" }} />
      <Typography variant="body2" color="text.secondary">
        {bien?.clientId?.fullName || "N/A"}
        {bien?.clientId?.phone ? ` · ${bien.clientId.phone}` : ""}
      </Typography>
    </Stack>
  </Box>
);

const FIELD_SX = { "& .MuiOutlinedInput-root": { borderRadius: 2.5 } };

const VerificationBiensPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [stats, setStats] = useState({
    nonVerifies: 0,
    enCours: 0,
    verifies: 0,
    rejetes: 0,
    total: 0,
  });

  const [biens, setBiens] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialogs
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [validerDialog, setValiderDialog] = useState(false);
  const [rejeterDialog, setRejeterDialog] = useState(false);
  const [selectedBien, setSelectedBien] = useState(null);

  const [notesVerification, setNotesVerification] = useState("");
  const [motifRejet, setMotifRejet] = useState("");
  const [validerPaiementDialog, setValiderPaiementDialog] = useState(false);
  const [validerAbonnementDialog, setValiderAbonnementDialog] = useState(false);
  const [documentsVerification, setDocumentsVerification] = useState([]); // Pour stocker les fichiers à uploader
  const [uploadingDocs, setUploadingDocs] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBiens();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/patrimoine/verifications/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Erreur stats:", err);
    }
  };

  const fetchBiens = async () => {
    setLoading(true);
    try {
      const statuts = ["non_verifie", "en_cours", "verifie", "rejete"];
      const statutFilter = statuts[activeTab];
      
      const res = await api.get(`/admin/patrimoine/verifications?statutVerification=${statutFilter}`);
      setBiens(res.data);
    } catch (err) {
      console.error("Erreur chargement biens:", err);
      setError("Erreur lors du chargement des biens");
    } finally {
      setLoading(false);
    }
  };

  const openDetailsDialog = (bien) => {
    setSelectedBien(bien);
    setDetailsDialog(true);
  };

  const openValiderDialog = (bien) => {
    setSelectedBien(bien);
    setNotesVerification("");
    setDocumentsVerification([]);
    setValiderDialog(true);
  };

  const openRejeterDialog = (bien) => {
    setSelectedBien(bien);
    setMotifRejet("");
    setRejeterDialog(true);
  };

  const handleMarquerEnCours = async (bienId) => {
    try {
      await api.put(`/admin/patrimoine/verifications/${bienId}/en-cours`);
      setSuccess("✅ Bien marqué en cours de vérification");
      fetchStats();
      fetchBiens();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({ file, description: "", url: null }));
    setDocumentsVerification([...documentsVerification, ...newFiles]);
  };

  const removeDocument = (index) => {
    const newDocs = documentsVerification.filter((_, i) => i !== index);
    setDocumentsVerification(newDocs);
  };

  const updateDocumentDescription = (index, description) => {
    const newDocs = [...documentsVerification];
    newDocs[index].description = description;
    setDocumentsVerification(newDocs);
  };

  const handleValider = async () => {
    try {
      setUploadingDocs(true);
      
      // Uploader les documents vers Cloudinary si il y en a
      let documentsWithDescriptions = [];
      
      if (documentsVerification.length > 0) {
        const uploadPromises = documentsVerification.map(async ({ file, description }) => {
          const formData = new FormData();
          formData.append('file', file);
          
          // Envoyer avec le type de dossier Cloudinary
          const res = await api.post('/upload?type=verification-documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          return {
            url: res.data.url,
            description: description.trim() || file.name // Utilise le nom du fichier si pas de description
          };
        });
        
        documentsWithDescriptions = await Promise.all(uploadPromises);
      }

      // Envoyer la requête avec les documents et notes
      await api.put(`/admin/patrimoine/verifications/${selectedBien._id}/valider`, {
        notesVerification,
        documentsVerification: documentsWithDescriptions,
      });
      
      setSuccess(`✅ Bien "${selectedBien.titre}" vérifié avec succès`);
      setValiderDialog(false);
      setDocumentsVerification([]);
      fetchStats();
      fetchBiens();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleRejeter = async () => {
    try {
      if (!motifRejet) {
        setError("Motif de rejet requis");
        return;
      }

      await api.put(`/admin/patrimoine/verifications/${selectedBien._id}/rejeter`, {
        motifRejetVerification: motifRejet,
      });
      setSuccess(`❌ Vérification rejetée pour "${selectedBien.titre}"`);
      setRejeterDialog(false);
      fetchStats();
      fetchBiens();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du rejet");
    }
  };

  const openValiderPaiementDialog = (bien) => {
    setSelectedBien(bien);
    setValiderPaiementDialog(true);
  };

  const handleValiderPaiement = async () => {
    try {
      await api.put(`/admin/patrimoine/verifications/${selectedBien._id}/paiement-enregistrement-valider`);
      setSuccess(`💰 Paiement d'enregistrement validé pour "${selectedBien.titre}"`);
      setValiderPaiementDialog(false);
      fetchStats();
      fetchBiens();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la validation du paiement");
    }
  };

  const openValiderAbonnementDialog = (bien) => {
    setSelectedBien(bien);
    setValiderAbonnementDialog(true);
  };

  const handleValiderAbonnement = async () => {
    try {
      await api.put(`/admin/patrimoine/abonnements/${selectedBien._id}/abonnement-valider`);
      setSuccess(`✅ Abonnement activé pour "${selectedBien.titre}"`);
      setValiderAbonnementDialog(false);
      fetchStats();
      fetchBiens();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'activation de l'abonnement");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const filteredBiens = biens.filter(
    (bien) =>
      bien.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.clientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const KPICard = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid #e3e8ef",
        transition: "all 0.25s ease",
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 24px ${color}22`,
          borderColor: onClick ? color : "#e3e8ef",
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}15`, color, width: 48, height: 48, ml: 2 }}>
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/admin/dashboard")} sx={{ mb: 2 }}>
            Retour au dashboard
          </Button>

          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "info.main", width: 64, height: 64 }}>
              <VerifiedUser fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Vérification des Biens
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Validez les biens pour attribuer le badge "Vérifié ✓"
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
              title="Non vérifiés"
              value={stats.nonVerifies}
              subtitle="À traiter"
              icon={PendingActions}
              color="#ff9800"
              onClick={() => setActiveTab(0)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="En cours"
              value={stats.enCours}
              subtitle="En vérification"
              icon={HourglassEmpty}
              color="#2196f3"
              onClick={() => setActiveTab(1)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Vérifiés"
              value={stats.verifies}
              subtitle="Badge ✓"
              icon={CheckCircle}
              color="#4caf50"
              onClick={() => setActiveTab(2)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Rejetés"
              value={stats.rejetes}
              subtitle="Non conformes"
              icon={Cancel}
              color="#f44336"
              onClick={() => setActiveTab(3)}
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
            <Tab label={`Non vérifiés (${stats.nonVerifies})`} />
            <Tab label={`En cours (${stats.enCours})`} />
            <Tab label={`Vérifiés (${stats.verifies})`} />
            <Tab label={`Rejetés (${stats.rejetes})`} />
          </Tabs>
        </Paper>

        {/* Recherche */}
        <TextField
          fullWidth
          placeholder="Rechercher par titre, propriétaire ou type..."
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
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                📋 Liste des biens ({filteredBiens.length})
              </Typography>
              <Button startIcon={<Refresh />} onClick={fetchBiens} variant="outlined" size="small">
                Actualiser
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : filteredBiens.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography color="text.secondary">Aucun bien dans cette catégorie</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bien</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Propriétaire</TableCell>
                      <TableCell>Date ajout</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBiens.map((bien) => (
                      <TableRow key={bien._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {bien.titre}
                          </Typography>
                          {bien.statutVerification === "verifie" && (
                            <Chip
                              label="Vérifié ✓"
                              size="small"
                              color="success"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={bien.type} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {bien.clientId?.fullName || "Propriétaire non renseigné"}
                          </Typography>
                          {bien.clientId?.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {bien.clientId.phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(bien.createdAt)}</TableCell>
                        <TableCell>
                          {bien.statutVerification === "non_verifie" && (
                            <Chip label="Non vérifié" size="small" color="warning" />
                          )}
                          {bien.statutVerification === "en_cours" && (
                            <Chip label="En cours" size="small" color="info" />
                          )}
                          {bien.statutVerification === "verifie" && (
                            <Chip label="Vérifié ✓" size="small" color="success" />
                          )}
                          {bien.statutVerification === "rejete" && (
                            <Chip label="Rejeté" size="small" color="error" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Voir détails">
                              <IconButton size="small" color="info" onClick={() => openDetailsDialog(bien)}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>

                            {bien.statutVerification === "non_verifie" && (
                              <Tooltip title="Marquer en cours">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleMarquerEnCours(bien._id)}
                                >
                                  <HourglassEmpty />
                                </IconButton>
                              </Tooltip>
                            )}

                            {(bien.statutVerification === "non_verifie" ||
                              bien.statutVerification === "en_cours") && (
                              <>
                                <Tooltip title="Valider">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => openValiderDialog(bien)}
                                  >
                                    <CheckCircle />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Rejeter">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => openRejeterDialog(bien)}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            
                            {/* Bouton pour valider le paiement d'enregistrement en espèces */}
                            {bien.enregistrementStatut === "en_attente" && (
                              <Tooltip title="Valider paiement espèces">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => openValiderPaiementDialog(bien)}
                                >
                                  <AttachMoney />
                                </IconButton>
                              </Tooltip>
                            )}

                            {/* Bouton pour valider l'abonnement en espèces */}
                            {bien.abonnementStatut === "en_attente" && bien.enregistrementStatut === "paye" && (
                              <Tooltip title="Activer abonnement">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => openValiderAbonnementDialog(bien)}
                                >
                                  ✓
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
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogHeader
          icon={Visibility}
          title="Détails du bien"
          subtitle={selectedBien?.titre}
          color="#0288d1"
          onClose={() => setDetailsDialog(false)}
        />
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedBien && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedBien.titre}
                </Typography>
                <Chip label={selectedBien.type} color="primary" sx={{ mr: 1 }} />
                {selectedBien.statutVerification === "verifie" && (
                  <Chip label="Vérifié ✓" color="success" />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Propriétaire
                </Typography>
                <Typography variant="body1">{selectedBien.clientId?.fullName}</Typography>
                <Typography variant="caption">{selectedBien.clientId?.phone}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Date d'ajout
                </Typography>
                <Typography variant="body1">{formatDate(selectedBien.createdAt)}</Typography>
              </Grid>

              {selectedBien.description && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">{selectedBien.description}</Typography>
                </Grid>
              )}

              {selectedBien.superficie && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Superficie
                  </Typography>
                  <Typography variant="body1">{selectedBien.superficie} m²</Typography>
                </Grid>
              )}

              {selectedBien.valeurEstimee && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Valeur estimée
                  </Typography>
                  <Typography variant="body1">
                    {new Intl.NumberFormat("fr-FR").format(selectedBien.valeurEstimee)} FCFA
                  </Typography>
                </Grid>
              )}

              {selectedBien.localisation?.ville && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Localisation
                  </Typography>
                  <Typography variant="body2">
                    {selectedBien.localisation.ville}
                    {selectedBien.localisation.quartier && `, ${selectedBien.localisation.quartier}`}
                  </Typography>
                </Grid>
              )}

              {selectedBien.photos && selectedBien.photos.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Photos ({selectedBien.photos.length})
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {selectedBien.photos.slice(0, 4).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}

              {selectedBien.documents && selectedBien.documents.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Documents ({selectedBien.documents.length})
                  </Typography>
                  <Typography variant="body2">Documents joints disponibles</Typography>
                </Grid>
              )}

              {selectedBien.documentsVerification && selectedBien.documentsVerification.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: "bold" }}>
                    📄 Documents de vérification ({selectedBien.documentsVerification.length})
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {selectedBien.documentsVerification.map((doc, index) => (
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
                        <Box display="flex" alignItems="center" gap={1} flex={1}>
                          <AttachFile color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {doc.description || `Document ${index + 1}`}
                            </Typography>
                          </Box>
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

              {selectedBien.notesVerification && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    📝 Notes de vérification
                  </Typography>
                  <Typography variant="body2">{selectedBien.notesVerification}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button onClick={() => setDetailsDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Valider */}
      <Dialog
        open={validerDialog}
        onClose={() => setValiderDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogHeader
          icon={CheckCircle}
          title="Valider la vérification"
          subtitle={'Le bien recevra le badge « Vérifié ✓ »'}
          color="#2e7d32"
          onClose={() => setValiderDialog(false)}
        />
        <DialogContent sx={{ p: 3 }}>
          <BienInfoBox bien={selectedBien} />

          <TextField
            label="Notes de vérification (optionnel)"
            value={notesVerification}
            onChange={(e) => setNotesVerification(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Remarques ou observations..."
            sx={{ ...FIELD_SX, mb: 3 }}
          />

          {/* Upload de documents */}
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Documents de vérification (optionnel)
          </Typography>

          <input
            accept="image/*,.pdf,.doc,.docx"
            style={{ display: "none" }}
            id="upload-docs"
            multiple
            type="file"
            onChange={handleFileChange}
          />
          
          <label htmlFor="upload-docs">
            <Button
              variant="outlined"
              component="span"
              startIcon={<AttachFile />}
              fullWidth
              sx={{ mb: 2, borderRadius: 2, borderStyle: "dashed", py: 1.25 }}
            >
              Attacher des documents
            </Button>
          </label>

          {/* Liste des documents attachés */}
          {documentsVerification.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {documentsVerification.map((doc, index) => (
                <Box
                  key={index}
                  sx={{ 
                    border: '1px solid #ddd', 
                    borderRadius: 1, 
                    mb: 2,
                    p: 2,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AttachFile color="primary" />
                    <Typography variant="body2" fontWeight="bold" flex={1}>
                      {doc.file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      {(doc.file.size / 1024).toFixed(2)} KB
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => removeDocument(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Description du document (optionnel)"
                    value={doc.description}
                    onChange={(e) => updateDocumentDescription(index, e.target.value)}
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          )}

          {uploadingDocs && (
            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <CircularProgress size={20} />
              <Typography variant="body2">Upload en cours...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button onClick={() => setValiderDialog(false)} disabled={uploadingDocs} color="inherit" sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button
            onClick={handleValider}
            variant="contained"
            startIcon={<CheckCircle />}
            disabled={uploadingDocs}
            sx={{ borderRadius: 2, px: 3, bgcolor: "#2e7d32", boxShadow: "none", "&:hover": { bgcolor: "#1b5e20", boxShadow: "none" } }}
          >
            {uploadingDocs ? "Envoi..." : "Valider"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Rejeter */}
      <Dialog
        open={rejeterDialog}
        onClose={() => setRejeterDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogHeader
          icon={Cancel}
          title="Rejeter la vérification"
          subtitle="Le bien ne recevra pas le badge vérifié"
          color="#e53935"
          onClose={() => setRejeterDialog(false)}
        />
        <DialogContent sx={{ p: 3 }}>
          <BienInfoBox bien={selectedBien} />

          <TextField
            label="Motif du rejet"
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            placeholder="Expliquez pourquoi ce bien ne peut pas être vérifié..."
            helperText="Communiqué au propriétaire"
            sx={FIELD_SX}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button onClick={() => setRejeterDialog(false)} color="inherit" sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button
            onClick={handleRejeter}
            variant="contained"
            startIcon={<Cancel />}
            sx={{ borderRadius: 2, px: 3, bgcolor: "#e53935", boxShadow: "none", "&:hover": { bgcolor: "#c62828", boxShadow: "none" } }}
          >
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Valider paiement en espèces */}
      <Dialog
        open={validerPaiementDialog}
        onClose={() => setValiderPaiementDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogHeader
          icon={AttachMoney}
          title="Valider le paiement d'enregistrement"
          subtitle="Paiement en espèces"
          color="#f57c00"
          onClose={() => setValiderPaiementDialog(false)}
        />
        <DialogContent sx={{ p: 3 }}>
          <BienInfoBox bien={selectedBien} />
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Cette action confirme que le propriétaire a payé en espèces le montant d'enregistrement.
            Le bien sera marqué comme <strong>« payé »</strong> et visible.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button onClick={() => setValiderPaiementDialog(false)} color="inherit" sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button
            onClick={handleValiderPaiement}
            variant="contained"
            startIcon={<AttachMoney />}
            sx={{ borderRadius: 2, px: 3, bgcolor: "#f57c00", boxShadow: "none", "&:hover": { bgcolor: "#ef6c00", boxShadow: "none" } }}
          >
            Valider
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG : Valider abonnement en espèces */}
      <Dialog
        open={validerAbonnementDialog}
        onClose={() => setValiderAbonnementDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogHeader
          icon={CheckCircle}
          title="Activer l'abonnement"
          subtitle="Abonnement annuel — 1 an"
          color="#2e7d32"
          onClose={() => setValiderAbonnementDialog(false)}
        />
        <DialogContent sx={{ p: 3 }}>
          <BienInfoBox bien={selectedBien} />
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Cette action active l'abonnement annuel du bien (expiration dans <strong>1 an</strong>).
            Le bien pourra alors être soumis à la vente.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button onClick={() => setValiderAbonnementDialog(false)} color="inherit" sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button
            onClick={handleValiderAbonnement}
            variant="contained"
            startIcon={<CheckCircle />}
            sx={{ borderRadius: 2, px: 3, bgcolor: "#2e7d32", boxShadow: "none", "&:hover": { bgcolor: "#1b5e20", boxShadow: "none" } }}
          >
            Activer
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default VerificationBiensPage;

