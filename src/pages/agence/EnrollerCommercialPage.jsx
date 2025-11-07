import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Stack,
  Divider,
  InputAdornment,
  CircularProgress,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PersonAdd,
  Person,
  Phone,
  Edit,
  Delete,
  Visibility,
  Map,
  Assignment,
  CheckCircle,
  Search,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const EnrollerCommercialPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: "", phone: "" });
  const [commerciaux, setCommerciaux] = useState([]);
  const [filteredCommerciaux, setFilteredCommerciaux] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal de confirmation de suppression
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [commercialToDelete, setCommercialToDelete] = useState(null);

  useEffect(() => {
    fetchCommerciaux();
  }, []);

  useEffect(() => {
    const filtered = commerciaux.filter(
      (com) =>
        com.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        com.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCommerciaux(filtered);
    setPage(0);
  }, [searchTerm, commerciaux]);

  const fetchCommerciaux = async () => {
    console.log("📝 [FRONTEND] Début fetchCommerciaux");
    setLoading(true);
    try {
      const res = await api.get("/agence/commerciaux");
      console.log("✅ [FRONTEND] Réponse API reçue:", res);
      console.log("✅ [FRONTEND] Données:", res.data);
      console.log("✅ [FRONTEND] Nombre de commerciaux:", res.data?.length || 0);
      setCommerciaux(res.data || []);
      setFilteredCommerciaux(res.data || []);
    } catch (err) {
      console.error("❌ [FRONTEND] Erreur chargement commerciaux :", err);
      console.error("❌ [FRONTEND] Détails erreur:", err.response?.data);
      setError("Impossible de charger les commerciaux");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log("📝 [FRONTEND] Soumission formulaire commercial:", formData);

    try {
      const res = await api.post("/agence/commerciaux", formData);
      console.log("✅ [FRONTEND] Commercial créé:", res.data);
      setSuccess("✅ Commercial enrôlé avec succès !");
      setFormData({ fullName: "", phone: "" });
      
      console.log("📝 [FRONTEND] Rechargement de la liste...");
      await fetchCommerciaux();
    } catch (err) {
      console.error("❌ [FRONTEND] Erreur enrôlement:", err);
      console.error("❌ [FRONTEND] Détails:", err.response?.data);
      setError(err.response?.data?.message || "❌ Erreur lors de l'enrôlement");
    }
  };

  const openDeleteDialog = (commercial) => {
    setCommercialToDelete(commercial);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/agence/commerciaux/${commercialToDelete._id}`);
      setSuccess("✅ Commercial supprimé avec succès");
      setDeleteDialog(false);
      fetchCommerciaux();
    } catch (err) {
      setError("❌ Erreur lors de la suppression");
      setDeleteDialog(false);
    }
  };

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              <PersonAdd fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestion des Commerciaux
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enrôlez et gérez votre équipe de vente
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Alertes */}
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          </Fade>
        )}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          </Fade>
        )}

        <Grid container spacing={3}>
          {/* FORMULAIRE D'ENRÔLEMENT */}
          <Grid item xs={12} lg={4}>
            <Card elevation={3} sx={{ position: "sticky", top: 20 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <PersonAdd color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Nouveau Commercial
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Nom complet"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      fullWidth
                      required
                      placeholder="Ex: Jean Dupont"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      label="Téléphone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      required
                      placeholder="+22790123456"
                      helperText="Ce numéro servira d'identifiant de connexion"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                      <strong>Mot de passe par défaut :</strong> 1234
                      <br />
                      Le commercial pourra le modifier après sa première connexion.
                    </Alert>

                    <Button
                      variant="contained"
                      type="submit"
                      size="large"
                      startIcon={<CheckCircle />}
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontWeight: "bold",
                        fontSize: "1rem",
                      }}
                    >
                      Enrôler le commercial
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card elevation={2} sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Statistiques
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Total des commerciaux
                    </Typography>
                    <Chip label={commerciaux.length} color="primary" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Résultats filtrés
                    </Typography>
                    <Chip label={filteredCommerciaux.length} color="secondary" size="small" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* LISTE DES COMMERCIAUX */}
          <Grid item xs={12} lg={8}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    👥 Liste des Commerciaux ({filteredCommerciaux.length})
                  </Typography>

                  {/* Barre de recherche */}
                  <TextField
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table>
                        <TableHead sx={{ bgcolor: "grey.100" }}>
                          <TableRow>
                            <TableCell><strong>Commercial</strong></TableCell>
                            <TableCell><strong>Téléphone</strong></TableCell>
                            <TableCell><strong>Statut</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredCommerciaux.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                <Typography color="text.secondary">
                                  {searchTerm ? "Aucun résultat trouvé" : "Aucun commercial enrôlé"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredCommerciaux
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((com) => (
                                <TableRow key={com._id} hover>
                                  <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                        {(com.fullName || "?").charAt(0).toUpperCase()}
                                      </Avatar>
                                      <Typography variant="body2" fontWeight="bold">
                                        {com.fullName || "Sans nom"}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={com.phone} size="small" variant="outlined" icon={<Phone />} />
                                  </TableCell>
                                  <TableCell>
                                    <Chip label="Actif" size="small" color="success" />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Tooltip title="Voir son profil">
                                      <IconButton
                                        size="small"
                                        color="info"
                                        onClick={() => navigate(`/agence/commerciaux/${com._id}/profil`)}
                                      >
                                        <BadgeIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Voir ses parcelles">
                                      <IconButton
                                        size="small"
                                        color="secondary"
                                        onClick={() => navigate(`/agence/commerciaux/${com._id}/parcelles`)}
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Voir ses îlots">
                                      <IconButton
                                        size="small"
                                        color="warning"
                                        onClick={() => navigate(`/agence/affectations/ilots?commercial=${com._id}`)}
                                      >
                                        <Map fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Affecter des parcelles">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() => navigate(`/agence/affecter-commercial/${com._id}`)}
                                      >
                                        <Assignment fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Supprimer">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => openDeleteDialog(com)}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TablePagination
                      component="div"
                      count={filteredCommerciaux.length}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      rowsPerPageOptions={[]}
                      labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* DIALOG DE CONFIRMATION DE SUPPRESSION */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Delete color="error" />
            <Typography variant="h6" fontWeight="bold">
              Confirmer la suppression
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous vraiment supprimer le commercial{" "}
            <strong>{commercialToDelete?.fullName}</strong> ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Cette action est irréversible. Les parcelles et îlots affectés seront libérés.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialog(false)} variant="outlined">
            Annuler
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" startIcon={<Delete />}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default EnrollerCommercialPage;
