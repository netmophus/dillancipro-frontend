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
  Tabs,
  Tab,
  InputAdornment,
  Stack,
  Checkbox,
  FormControlLabel,
  Pagination,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Refresh,
  Visibility,
  Close,
  Search,
  VerifiedUser,
  PendingActions,
  Business,
  Landscape,
  Home,
  CheckBox,
  CheckBoxOutlineBlank,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const AdminVerificationAgencesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0: Parcelles, 1: Biens

  // États pour les parcelles
  const [parcelles, setParcelles] = useState([]);
  const [parcellesPage, setParcellesPage] = useState(1);
  const [parcellesTotalPages, setParcellesTotalPages] = useState(1);
  const [selectedParcelles, setSelectedParcelles] = useState([]);
  const [searchParcelles, setSearchParcelles] = useState("");

  // États pour les biens
  const [biens, setBiens] = useState([]);
  const [biensPage, setBiensPage] = useState(1);
  const [biensTotalPages, setBiensTotalPages] = useState(1);
  const [selectedBiens, setSelectedBiens] = useState([]);
  const [searchBiens, setSearchBiens] = useState("");

  // Dialog de détails
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null); // "parcelle" ou "bien"

  useEffect(() => {
    if (activeTab === 0) {
      fetchParcelles();
    } else {
      fetchBiens();
    }
  }, [activeTab, parcellesPage, biensPage]);

  const fetchParcelles = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/parcelles/pending?page=${parcellesPage}&limit=20`);
      setParcelles(response.data.parcelles || []);
      setParcellesTotalPages(response.data.totalPages || 1);
      setError("");
    } catch (err) {
      console.error("Erreur récupération parcelles:", err);
      setError("Erreur lors du chargement des parcelles");
      setParcelles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBiens = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/biens/pending?page=${biensPage}&limit=20`);
      setBiens(response.data.biens || []);
      setBiensTotalPages(response.data.totalPages || 1);
      setError("");
    } catch (err) {
      console.error("Erreur récupération biens:", err);
      setError("Erreur lors du chargement des biens");
      setBiens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyParcelle = async (parcelleId) => {
    try {
      await api.put(`/admin/parcelles/${parcelleId}/verify`);
      setSuccess("Parcelle vérifiée avec succès");
      fetchParcelles();
      setSelectedParcelles(selectedParcelles.filter(id => id !== parcelleId));
    } catch (err) {
      setError("Erreur lors de la vérification de la parcelle");
    }
  };

  const handleUnverifyParcelle = async (parcelleId) => {
    try {
      await api.put(`/admin/parcelles/${parcelleId}/unverify`);
      setSuccess("Vérification de la parcelle annulée");
      fetchParcelles();
    } catch (err) {
      setError("Erreur lors de l'annulation de la vérification");
    }
  };

  const handleVerifyBien = async (bienId) => {
    try {
      await api.put(`/admin/biens/${bienId}/verify`);
      setSuccess("Bien vérifié avec succès");
      fetchBiens();
      setSelectedBiens(selectedBiens.filter(id => id !== bienId));
    } catch (err) {
      setError("Erreur lors de la vérification du bien");
    }
  };

  const handleUnverifyBien = async (bienId) => {
    try {
      await api.put(`/admin/biens/${bienId}/unverify`);
      setSuccess("Vérification du bien annulée");
      fetchBiens();
    } catch (err) {
      setError("Erreur lors de l'annulation de la vérification");
    }
  };

  const handleBulkVerifyParcelles = async () => {
    if (selectedParcelles.length === 0) {
      setError("Veuillez sélectionner au moins une parcelle");
      return;
    }
    try {
      await api.put("/admin/parcelles/bulk-verify", { parcelleIds: selectedParcelles });
      setSuccess(`${selectedParcelles.length} parcelle(s) vérifiée(s) avec succès`);
      setSelectedParcelles([]);
      fetchParcelles();
    } catch (err) {
      setError("Erreur lors de la vérification en masse");
    }
  };

  const handleBulkVerifyBiens = async () => {
    if (selectedBiens.length === 0) {
      setError("Veuillez sélectionner au moins un bien");
      return;
    }
    try {
      await api.put("/admin/biens/bulk-verify", { bienIds: selectedBiens });
      setSuccess(`${selectedBiens.length} bien(s) vérifié(s) avec succès`);
      setSelectedBiens([]);
      fetchBiens();
    } catch (err) {
      setError("Erreur lors de la vérification en masse");
    }
  };

  const handleSelectAllParcelles = (event) => {
    if (event.target.checked) {
      setSelectedParcelles(parcelles.map(p => p._id));
    } else {
      setSelectedParcelles([]);
    }
  };

  const handleSelectAllBiens = (event) => {
    if (event.target.checked) {
      setSelectedBiens(biens.map(b => b._id));
    } else {
      setSelectedBiens([]);
    }
  };

  const handleSelectParcelle = (parcelleId) => {
    setSelectedParcelles(prev =>
      prev.includes(parcelleId)
        ? prev.filter(id => id !== parcelleId)
        : [...prev, parcelleId]
    );
  };

  const handleSelectBien = (bienId) => {
    setSelectedBiens(prev =>
      prev.includes(bienId)
        ? prev.filter(id => id !== bienId)
        : [...prev, bienId]
    );
  };

  const handleOpenDetails = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setDetailsDialog(true);
  };

  const filteredParcelles = parcelles.filter(p =>
    p.numeroParcelle?.toLowerCase().includes(searchParcelles.toLowerCase()) ||
    p.agenceId?.nom?.toLowerCase().includes(searchParcelles.toLowerCase()) ||
    p.ilot?.numeroIlot?.toLowerCase().includes(searchParcelles.toLowerCase())
  );

  const filteredBiens = biens.filter(b =>
    b.titre?.toLowerCase().includes(searchBiens.toLowerCase()) ||
    b.reference?.toLowerCase().includes(searchBiens.toLowerCase()) ||
    b.agenceId?.nom?.toLowerCase().includes(searchBiens.toLowerCase())
  );

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ✅ Vérification des Parcelles et Biens des Agences
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vérifiez les parcelles et biens immobiliers publiés par les agences avant leur publication publique
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* Onglets */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Landscape />
                  <Typography>Parcelles ({parcelles.length})</Typography>
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Home />
                  <Typography>Biens Immobiliers ({biens.length})</Typography>
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* Contenu selon l'onglet */}
        {activeTab === 0 ? (
          // Onglet Parcelles
          <Box>
            {/* Barre d'actions */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
              <TextField
                placeholder="Rechercher parcelles..."
                size="small"
                value={searchParcelles}
                onChange={(e) => setSearchParcelles(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                {selectedParcelles.length > 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={handleBulkVerifyParcelles}
                  >
                    Vérifier ({selectedParcelles.length})
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchParcelles}
                >
                  Actualiser
                </Button>
              </Box>
            </Box>

            {/* Table des parcelles */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredParcelles.length === 0 ? (
              <Alert severity="info">Aucune parcelle en attente de vérification</Alert>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedParcelles.length > 0 && selectedParcelles.length < filteredParcelles.length}
                            checked={filteredParcelles.length > 0 && selectedParcelles.length === filteredParcelles.length}
                            onChange={handleSelectAllParcelles}
                          />
                        </TableCell>
                        <TableCell><strong>Référence</strong></TableCell>
                        <TableCell><strong>Agence</strong></TableCell>
                        <TableCell><strong>Îlot</strong></TableCell>
                        <TableCell><strong>Superficie</strong></TableCell>
                        <TableCell><strong>Prix</strong></TableCell>
                        <TableCell><strong>Statut</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredParcelles.map((parcelle) => (
                        <TableRow key={parcelle._id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedParcelles.includes(parcelle._id)}
                              onChange={() => handleSelectParcelle(parcelle._id)}
                            />
                          </TableCell>
                          <TableCell>{parcelle.numeroParcelle || `P-${parcelle._id.slice(-6)}`}</TableCell>
                          <TableCell>
                            <Chip
                              icon={<Business />}
                              label={parcelle.agenceId?.nom || "N/A"}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>Îlot {parcelle.ilot?.numeroIlot || "N/A"}</TableCell>
                          <TableCell>{parcelle.superficie || 0} m²</TableCell>
                          <TableCell>
                            {parcelle.prix ? new Intl.NumberFormat("fr-FR").format(parcelle.prix) + " FCFA" : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={parcelle.statut || "avendre"}
                              size="small"
                              color={parcelle.statut === "avendre" ? "primary" : "default"}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Voir détails">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDetails(parcelle, "parcelle")}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Vérifier">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleVerifyParcelle(parcelle._id)}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {parcellesTotalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                      count={parcellesTotalPages}
                      page={parcellesPage}
                      onChange={(e, value) => setParcellesPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        ) : (
          // Onglet Biens
          <Box>
            {/* Barre d'actions */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
              <TextField
                placeholder="Rechercher biens..."
                size="small"
                value={searchBiens}
                onChange={(e) => setSearchBiens(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                {selectedBiens.length > 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={handleBulkVerifyBiens}
                  >
                    Vérifier ({selectedBiens.length})
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchBiens}
                >
                  Actualiser
                </Button>
              </Box>
            </Box>

            {/* Table des biens */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredBiens.length === 0 ? (
              <Alert severity="info">Aucun bien en attente de vérification</Alert>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedBiens.length > 0 && selectedBiens.length < filteredBiens.length}
                            checked={filteredBiens.length > 0 && selectedBiens.length === filteredBiens.length}
                            onChange={handleSelectAllBiens}
                          />
                        </TableCell>
                        <TableCell><strong>Titre</strong></TableCell>
                        <TableCell><strong>Agence</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Superficie</strong></TableCell>
                        <TableCell><strong>Prix</strong></TableCell>
                        <TableCell><strong>Statut</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBiens.map((bien) => (
                        <TableRow key={bien._id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedBiens.includes(bien._id)}
                              onChange={() => handleSelectBien(bien._id)}
                            />
                          </TableCell>
                          <TableCell>{bien.titre || "Sans titre"}</TableCell>
                          <TableCell>
                            <Chip
                              icon={<Business />}
                              label={bien.agenceId?.nom || "N/A"}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label={bien.type || "N/A"} size="small" />
                          </TableCell>
                          <TableCell>{bien.superficie || 0} m²</TableCell>
                          <TableCell>
                            {bien.prix ? new Intl.NumberFormat("fr-FR").format(bien.prix) + " FCFA" : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={bien.statut || "disponible"}
                              size="small"
                              color={bien.statut === "disponible" ? "success" : "default"}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Voir détails">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDetails(bien, "bien")}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Vérifier">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleVerifyBien(bien._id)}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {biensTotalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                      count={biensTotalPages}
                      page={biensPage}
                      onChange={(e, value) => setBiensPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {/* Dialog de détails */}
        <Dialog
          open={detailsDialog}
          onClose={() => setDetailsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">
                Détails {itemType === "parcelle" ? "de la Parcelle" : "du Bien"}
              </Typography>
              <IconButton onClick={() => setDetailsDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box>
                {itemType === "parcelle" ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Référence</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedItem.numeroParcelle}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Agence</Typography>
                      <Typography variant="body1">{selectedItem.agenceId?.nom || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Îlot</Typography>
                      <Typography variant="body1">Îlot {selectedItem.ilot?.numeroIlot || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Superficie</Typography>
                      <Typography variant="body1">{selectedItem.superficie || 0} m²</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Prix</Typography>
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        {selectedItem.prix ? new Intl.NumberFormat("fr-FR").format(selectedItem.prix) + " FCFA" : "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                      <Chip label={selectedItem.statut || "avendre"} size="small" />
                    </Grid>
                    {selectedItem.description && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                        <Typography variant="body2">{selectedItem.description}</Typography>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Titre</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedItem.titre}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Agence</Typography>
                      <Typography variant="body1">{selectedItem.agenceId?.nom || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                      <Typography variant="body1">{selectedItem.type || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Référence</Typography>
                      <Typography variant="body1">{selectedItem.reference || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Superficie</Typography>
                      <Typography variant="body1">{selectedItem.superficie || 0} m²</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Prix</Typography>
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        {selectedItem.prix ? new Intl.NumberFormat("fr-FR").format(selectedItem.prix) + " FCFA" : "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                      <Chip label={selectedItem.statut || "disponible"} size="small" />
                    </Grid>
                    {selectedItem.localisation?.ville && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Ville</Typography>
                        <Typography variant="body1">{selectedItem.localisation.ville}</Typography>
                      </Grid>
                    )}
                    {selectedItem.description && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                        <Typography variant="body2">{selectedItem.description}</Typography>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog(false)}>Fermer</Button>
            {selectedItem && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => {
                  if (itemType === "parcelle") {
                    handleVerifyParcelle(selectedItem._id);
                  } else {
                    handleVerifyBien(selectedItem._id);
                  }
                  setDetailsDialog(false);
                }}
              >
                Vérifier
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </PageLayout>
  );
};

export default AdminVerificationAgencesPage;

