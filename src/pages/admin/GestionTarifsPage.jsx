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
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  InputAdornment,
  Chip,
  Stack,
  Divider,
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
  Close,
  Percent,
  Autorenew,
  Notes,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/admin/AdminLayout";
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
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid #e3e8ef",
                    overflow: "hidden",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      borderColor: color,
                      boxShadow: `0 12px 30px ${color}22`,
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Box sx={{ height: 5, bgcolor: color }} />
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: `${color}15`, color, width: 48, height: 48 }}>
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
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(tarif)}
                          sx={{ bgcolor: `${color}12`, color, "&:hover": { bgcolor: `${color}22` } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Stack spacing={1.25}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 2, bgcolor: "#f7f9fc", border: "1px solid #eef2f7" }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AttachMoney sx={{ fontSize: 18, color: "#1976d2" }} />
                          <Typography variant="body2" color="text.secondary">Enregistrement</Typography>
                        </Stack>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#1976d2" }}>
                          {formatMoney(tarif.montantEnregistrement)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 2, bgcolor: "#f7f9fc", border: "1px solid #eef2f7" }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Autorenew sx={{ fontSize: 18, color: "#2e7d32" }} />
                          <Typography variant="body2" color="text.secondary">Abonnement / an</Typography>
                        </Stack>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#2e7d32" }}>
                          {formatMoney(tarif.montantAbonnementAnnuel)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 2, bgcolor: "#f7f9fc", border: "1px solid #eef2f7" }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Percent sx={{ fontSize: 18, color: "#ff9800" }} />
                          <Typography variant="body2" color="text.secondary">Commission vente</Typography>
                        </Stack>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#ff9800" }}>
                          {tarif.commissionVente}%
                        </Typography>
                      </Box>
                    </Stack>
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
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        {(() => {
          const color = selectedTarif ? getColorByType(selectedTarif.typeBien) : "#27AE60";
          const DialogIcon = selectedTarif ? getIconByType(selectedTarif.typeBien) : AttachMoney;
          const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2.5 } };
          return (
            <>
              {/* En-tête coloré */}
              <Box
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                  color: "white",
                  position: "relative",
                }}
              >
                <IconButton
                  onClick={() => setEditDialog(false)}
                  sx={{ position: "absolute", top: 12, right: 12, color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}
                >
                  <Close />
                </IconButton>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.22)", width: 54, height: 54 }}>
                    <DialogIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Modifier le tarif</Typography>
                    <Chip
                      label={selectedTarif?.typeBien}
                      size="small"
                      sx={{ mt: 0.5, bgcolor: "rgba(255,255,255,0.22)", color: "white", textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </Box>
                </Stack>
              </Box>

              <DialogContent sx={{ p: 3 }}>
                <TextField
                  label="Montant d'enregistrement"
                  type="number"
                  value={formData.montantEnregistrement}
                  onChange={(e) => setFormData({ ...formData, montantEnregistrement: e.target.value })}
                  fullWidth
                  required
                  helperText="Paiement unique, à l'ajout du bien"
                  sx={{ ...fieldSx, mt: 1, mb: 2.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: "#1976d2" }} />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                  }}
                />

                <TextField
                  label="Abonnement annuel"
                  type="number"
                  value={formData.montantAbonnementAnnuel}
                  onChange={(e) => setFormData({ ...formData, montantAbonnementAnnuel: e.target.value })}
                  fullWidth
                  required
                  helperText="Facturé chaque année"
                  sx={{ ...fieldSx, mb: 2.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Autorenew sx={{ color: "#2e7d32" }} />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">FCFA/an</InputAdornment>,
                  }}
                />

                <TextField
                  label="Commission de vente"
                  type="number"
                  value={formData.commissionVente}
                  onChange={(e) => setFormData({ ...formData, commissionVente: e.target.value })}
                  fullWidth
                  required
                  helperText="% prélevé lors d'une vente via Softlink"
                  sx={{ ...fieldSx, mb: 2.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Percent sx={{ color: "#ff9800" }} />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />

                <Divider sx={{ mb: 2.5 }} />

                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                        <Notes sx={{ color: "#607d8b" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
                <Button onClick={() => setEditDialog(false)} color="inherit" sx={{ borderRadius: 2 }}>
                  Annuler
                </Button>
                <Button
                  onClick={handleUpdate}
                  variant="contained"
                  startIcon={<Save />}
                  sx={{ borderRadius: 2, px: 3, bgcolor: color, boxShadow: "none", "&:hover": { bgcolor: color, filter: "brightness(0.92)", boxShadow: "none" } }}
                >
                  Enregistrer
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </PageLayout>
  );
};

export default GestionTarifsPage;

