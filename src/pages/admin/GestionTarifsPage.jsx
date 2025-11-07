import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  AttachMoney,
  Edit,
  Refresh,
  ArrowBack,
  Save,
  Home,
  Villa,
  Apartment,
  Park,
  Square,
  Landscape,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const GestionTarifsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tarifs, setTarifs] = useState([]);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState(null);

  const [formData, setFormData] = useState({
    montantEnregistrement: "",
    montantAbonnementAnnuel: "",
    commissionVente: "",
    description: "",
  });

  useEffect(() => {
    fetchTarifs();
  }, []);

  const fetchTarifs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/tarifs");
      setTarifs(res.data);
    } catch (err) {
      console.error("Erreur chargement tarifs:", err);
      setError("Erreur lors du chargement des tarifs");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (tarif) => {
    setSelectedTarif(tarif);
    setFormData({
      montantEnregistrement: tarif.montantEnregistrement || "",
      montantAbonnementAnnuel: tarif.montantAbonnementAnnuel || "",
      commissionVente: tarif.commissionVente || "",
      description: tarif.description || "",
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      await api.post("/admin/tarifs", {
        typeBien: selectedTarif.typeBien,
        montantEnregistrement: parseFloat(formData.montantEnregistrement),
        montantAbonnementAnnuel: parseFloat(formData.montantAbonnementAnnuel),
        commissionVente: parseFloat(formData.commissionVente),
        description: formData.description,
      });

      setSuccess(`✅ Tarif pour "${selectedTarif.typeBien}" mis à jour avec succès`);
      setEditDialog(false);
      fetchTarifs();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const getIconByType = (type) => {
    const icons = {
      parcelle: Square,
      terrain: Landscape,
      maison: Home,
      villa: Villa,
      appartement: Apartment,
      jardin: Park,
      autre: Home,
    };
    return icons[type] || Home;
  };

  const getColorByType = (type) => {
    const colors = {
      parcelle: "#2196f3",
      terrain: "#795548",
      maison: "#4caf50",
      villa: "#9c27b0",
      appartement: "#f44336",
      jardin: "#8bc34a",
      autre: "#607d8b",
    };
    return colors[type] || "#607d8b";
  };

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/admin/dashboard")} sx={{ mb: 2 }}>
            Retour au dashboard
          </Button>

          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "success.main", width: 64, height: 64 }}>
              <AttachMoney fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestion des Tarifs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paramétrez les montants d'enregistrement, abonnements et commissions
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

        {/* Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>3 types de paiements :</strong>
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>Enregistrement</strong> : Paiement UNIQUE lors de l'ajout du bien
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>Abonnement annuel</strong> : Paiement RÉCURRENT chaque année
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>Commission vente</strong> : % prélevé lors d'une vente via Softlink
          </Typography>
        </Alert>

        {/* Grille des tarifs */}
        <Grid container spacing={3} mb={4}>
          {tarifs.map((tarif) => {
            const Icon = getIconByType(tarif.typeBien);
            const color = getColorByType(tarif.typeBien);

            return (
              <Grid item xs={12} md={6} lg={4} key={tarif._id}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    borderTop: `4px solid ${color}`,
                    transition: "all 0.3s",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
                          <Icon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" textTransform="capitalize">
                            {tarif.typeBien}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tarif.description}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton color="primary" onClick={() => openEditDialog(tarif)}>
                        <Edit />
                      </IconButton>
                    </Box>

                    <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 2, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Enregistrement (1 fois)
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatMoney(tarif.montantEnregistrement)}
                      </Typography>
                    </Box>

                    <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 2, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Abonnement annuel
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {formatMoney(tarif.montantAbonnementAnnuel)}
                        <Typography variant="caption" color="text.secondary">
                          {" "}
                          / an
                        </Typography>
                      </Typography>
                    </Box>

                    <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Commission vente
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="warning.main">
                        {tarif.commissionVente}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Tableau récapitulatif */}
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                📊 Tableau récapitulatif
              </Typography>
              <Button startIcon={<Refresh />} onClick={fetchTarifs} variant="outlined" size="small">
                Actualiser
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type de bien</TableCell>
                    <TableCell align="right">Enregistrement</TableCell>
                    <TableCell align="right">Abonnement/an</TableCell>
                    <TableCell align="right">Commission</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tarifs.map((tarif) => (
                    <TableRow key={tarif._id} hover>
                      <TableCell>
                        <Chip
                          label={tarif.typeBien}
                          sx={{ bgcolor: getColorByType(tarif.typeBien), color: "white", textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {formatMoney(tarif.montantEnregistrement)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>
                        {formatMoney(tarif.montantAbonnementAnnuel)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "warning.main" }}>
                        {tarif.commissionVente}%
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Modifier">
                          <IconButton size="small" color="primary" onClick={() => openEditDialog(tarif)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* DIALOG : Modifier tarif */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          ✏️ Modifier le tarif : <strong style={{ textTransform: "capitalize" }}>{selectedTarif?.typeBien}</strong>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Montant d'enregistrement (paiement unique)"
            type="number"
            value={formData.montantEnregistrement}
            onChange={(e) => setFormData({ ...formData, montantEnregistrement: e.target.value })}
            fullWidth
            required
            sx={{ mt: 2, mb: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
            }}
          />

          <TextField
            label="Montant abonnement annuel (chaque année)"
            type="number"
            value={formData.montantAbonnementAnnuel}
            onChange={(e) => setFormData({ ...formData, montantAbonnementAnnuel: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">FCFA/an</InputAdornment>,
            }}
          />

          <TextField
            label="Commission de vente (si vente via Softlink)"
            type="number"
            value={formData.commissionVente}
            onChange={(e) => setFormData({ ...formData, commissionVente: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button onClick={handleUpdate} variant="contained" startIcon={<Save />} color="success">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default GestionTarifsPage;

