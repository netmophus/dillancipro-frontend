import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Share,
  Delete,
  CheckCircle,
  Cancel,
  Business,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const IHEPartagePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ihe, setIhe] = useState(null);
  const [agences, setAgences] = useState([]);
  const [agencesPartagees, setAgencesPartagees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedAgence, setSelectedAgence] = useState("");

  useEffect(() => {
    if (id) {
      fetchIHE();
    } else {
      fetchIHEsPartagees();
    }
    fetchAgences();
  }, [id]);

  const fetchIHE = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/banque/ihe/${id}`);
      setIhe(response.data.ihe);
      setAgencesPartagees(response.data.ihe.partageAvecAgences || []);
    } catch (err) {
      console.error("Erreur chargement IHE:", err);
      setError("Erreur lors du chargement de l'IHE");
    } finally {
      setLoading(false);
    }
  };

  const fetchIHEsPartagees = async () => {
    try {
      setLoading(true);
      const response = await api.get("/banque/ihe/partagees");
      setAgencesPartagees(response.data.ihes || []);
    } catch (err) {
      console.error("Erreur chargement IHE partagées:", err);
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgences = async () => {
    try {
      const response = await api.get("/banque/ihe/agences");
      console.log("📋 Agences récupérées:", response.data);
      setAgences(response.data.agences || []);
    } catch (err) {
      console.error("❌ Erreur chargement agences:", err);
      setError("Erreur lors du chargement des agences: " + (err.response?.data?.message || err.message));
    }
  };

  const handleShare = async () => {
    if (!selectedAgence) {
      setError("Veuillez sélectionner une agence");
      return;
    }

    try {
      await api.post(`/banque/ihe/${id}/partager/${selectedAgence}`);
      setSuccess("IHE proposée à l'agence avec succès");
      setShareDialogOpen(false);
      setSelectedAgence("");
      fetchIHE();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du partage");
    }
  };

  const handleRemoveShare = async (agenceId) => {
    if (!window.confirm("Retirer le partage avec cette agence ?")) return;

    try {
      await api.delete(`/banque/ihe/${id}/partage/${agenceId}`);
      setSuccess("Partage retiré");
      fetchIHE();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du retrait");
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

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ width: "100%", mt: 4 }}>
          <LinearProgress />
          <Typography align="center" sx={{ mt: 2 }}>
            Chargement...
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  // Si on est sur la page de liste des IHE partagées
  if (!id) {
    return (
      <PageLayout>
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Button startIcon={<ArrowBack />} onClick={() => navigate("/banque/ihe")}>
                Retour
              </Button>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                🤝 IHE Partagées avec les Agences
              </Typography>
            </Box>
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

          {agencesPartagees.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  Aucune IHE partagée
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>IHE</strong></TableCell>
                    <TableCell><strong>Agence</strong></TableCell>
                    <TableCell><strong>Statut</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agencesPartagees.map((ihe) =>
                    ihe.partageAvecAgences?.map((partage, idx) => (
                      <TableRow key={`${ihe._id}-${partage.agenceId._id}`}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {ihe.reference}
                          </Typography>
                          <Typography variant="caption">{ihe.titre}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {partage.agenceId?.nom || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={partage.statut === "propose" ? "Proposée" : partage.statut === "accepte" ? "Acceptée" : "Refusée"}
                            color={partage.statut === "accepte" ? "success" : partage.statut === "propose" ? "warning" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(partage.partageLe)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveShare(partage.agenceId._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </PageLayout>
    );
  }

  // Page de partage pour une IHE spécifique
  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(`/banque/ihe/${id}`)}>
              Retour
            </Button>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
              🤝 Partager l'IHE avec les Agences
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ihe?.reference} - {ihe?.titre}
            </Typography>
          </Box>
          {ihe?.statut === "valide" && (
            <Button
              variant="contained"
              startIcon={<Share />}
              onClick={() => setShareDialogOpen(true)}
            >
              Proposer à une agence
            </Button>
          )}
        </Box>

        {ihe?.statut !== "valide" && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Seules les IHE validées peuvent être partagées avec les agences.
          </Alert>
        )}

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

        {/* Liste des agences avec lesquelles l'IHE est partagée */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Agences partenaires ({agencesPartagees.length})
            </Typography>
            {agencesPartagees.length === 0 ? (
              <Alert severity="info">
                Cette IHE n'est partagée avec aucune agence pour le moment.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Agence</strong></TableCell>
                      <TableCell><strong>Statut</strong></TableCell>
                      <TableCell><strong>Date de partage</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {agencesPartagees.map((partage) => (
                      <TableRow key={partage.agenceId._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Business />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {partage.agenceId.nom}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {partage.agenceId.telephone}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={partage.statut === "propose" ? "Proposée" : partage.statut === "accepte" ? "Acceptée" : "Refusée"}
                            color={partage.statut === "accepte" ? "success" : partage.statut === "propose" ? "warning" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(partage.partageLe)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveShare(partage.agenceId._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Dialog Partage */}
        <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Proposer l'IHE à une agence</DialogTitle>
          <DialogContent>
            {agences.length === 0 ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Aucune agence active disponible pour le moment.
              </Alert>
            ) : (
              <>
                <TextField
                  select
                  label="Sélectionner une agence"
                  value={selectedAgence}
                  onChange={(e) => setSelectedAgence(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {agences
                    .filter((a) => !agencesPartagees.some((p) => p.agenceId._id === a._id))
                    .map((agence) => (
                      <MenuItem key={agence._id} value={agence._id}>
                        {agence.nom} - {agence.telephone}
                      </MenuItem>
                    ))}
                </TextField>
                {agences.filter((a) => !agencesPartagees.some((p) => p.agenceId._id === a._id)).length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Toutes les agences ont déjà été proposées pour cette IHE.
                  </Alert>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleShare} variant="contained" disabled={!selectedAgence || agences.length === 0}>
              Proposer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageLayout>
  );
};

export default IHEPartagePage;

