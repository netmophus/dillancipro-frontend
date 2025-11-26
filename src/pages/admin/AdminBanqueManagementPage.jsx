import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Grid,
  Button,
  Paper,
  Stack,
  Alert,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Snackbar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  AccountBalance,
  Add,
  Edit,
  Delete,
  Phone,
  Email,
  Business,
  CheckCircle,
  Cancel,
  ArrowBack,
  Search,
  Visibility,
  Star,
  Close,
  LocationOn,
  Map as MapIcon,
} from "@mui/icons-material";

import api from "../../services/api";
import PageLayout from "../../components/shared/PageLayout";
import { useNavigate } from "react-router-dom";

const AdminBanqueManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanque, setEditingBanque] = useState(null);

  const [formData, setFormData] = useState({
    nom: "",
    services: "",
    description: "",
    produits: [],
    avantages: [],
    contact: {
      telephone: "",
      email: "",
      siteWeb: "",
    },
    adresse: "",
    localisation: {
      latitude: "",
      longitude: "",
    },
    logo: "",
    ordre: 0,
    actif: true,
  });

  const [banques, setBanques] = useState([]);
  const [newProduit, setNewProduit] = useState("");
  const [newAvantage, setNewAvantage] = useState("");

  useEffect(() => {
    fetchBanques();
  }, []);

  const fetchBanques = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/banques");
      setBanques(res.data.banques || []);
    } catch (err) {
      console.error("Erreur chargement banques:", err);
      setError("Erreur lors du chargement des banques");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (banque = null) => {
    if (banque) {
      setEditingBanque(banque);
      setFormData({
        nom: banque.nom || "",
        services: banque.services || "",
        description: banque.description || "",
        produits: banque.produits || [],
        avantages: banque.avantages || [],
        contact: {
          telephone: banque.contact?.telephone || "",
          email: banque.contact?.email || "",
          siteWeb: banque.contact?.siteWeb || "",
        },
        adresse: banque.adresse || "",
        localisation: {
          latitude: banque.localisation?.latitude || "",
          longitude: banque.localisation?.longitude || "",
        },
        logo: banque.logo || "",
        ordre: banque.ordre || 0,
        actif: banque.actif !== undefined ? banque.actif : true,
      });
    } else {
      setEditingBanque(null);
      setFormData({
        nom: "",
        services: "",
        description: "",
        produits: [],
        avantages: [],
        contact: {
          telephone: "",
          email: "",
          siteWeb: "",
        },
        adresse: "",
        localisation: {
          latitude: "",
          longitude: "",
        },
        logo: "",
        ordre: 0,
        actif: true,
      });
    }
    setNewProduit("");
    setNewAvantage("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBanque(null);
    setError("");
  };

  const handleAddProduit = () => {
    if (newProduit.trim()) {
      setFormData({
        ...formData,
        produits: [...formData.produits, newProduit.trim()],
      });
      setNewProduit("");
    }
  };

  const handleRemoveProduit = (index) => {
    setFormData({
      ...formData,
      produits: formData.produits.filter((_, i) => i !== index),
    });
  };

  const handleAddAvantage = () => {
    if (newAvantage.trim()) {
      setFormData({
        ...formData,
        avantages: [...formData.avantages, newAvantage.trim()],
      });
      setNewAvantage("");
    }
  };

  const handleRemoveAvantage = (index) => {
    setFormData({
      ...formData,
      avantages: formData.avantages.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (editingBanque) {
        await api.put(`/admin/banques/${editingBanque._id}`, formData);
        setSuccess("Banque mise à jour avec succès");
      } else {
        await api.post("/admin/banques", formData);
        setSuccess("Banque créée avec succès");
      }
      
      fetchBanques();
      handleCloseDialog();
    } catch (err) {
      console.error("Erreur sauvegarde banque:", err);
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette banque ?")) return;
    
    try {
      setLoading(true);
      await api.delete(`/admin/banques/${id}`);
      setSuccess("Banque supprimée avec succès");
      fetchBanques();
    } catch (err) {
      console.error("Erreur suppression banque:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const filteredBanques = banques.filter((banque) =>
    banque.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/admin/dashboard")}
            sx={{ mb: 2 }}
          >
            Retour au tableau de bord
          </Button>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏦 Gestion des Banques Partenaires
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez les informations des banques partenaires affichées sur la page d'accueil
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Snackbar
            open={!!success}
            autoHideDuration={6000}
            onClose={() => setSuccess("")}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert severity="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          </Snackbar>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              placeholder="Rechercher une banque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Ajouter une banque
            </Button>
          </Box>

          {loading && !banques.length ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : filteredBanques.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? "Aucune banque trouvée" : "Aucune banque enregistrée"}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Services</TableCell>
                    <TableCell>Produits</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Ordre</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBanques.map((banque) => (
                    <TableRow key={banque._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccountBalance sx={{ color: "primary.main" }} />
                          <Typography fontWeight="bold">{banque.nom}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{banque.services}</TableCell>
                      <TableCell>
                        <Chip label={`${banque.produits?.length || 0} produit(s)`} size="small" />
                      </TableCell>
                      <TableCell>
                        <Box>
                          {banque.contact?.telephone && (
                            <Typography variant="caption" display="block">
                              📞 {banque.contact.telephone}
                            </Typography>
                          )}
                          {banque.contact?.email && (
                            <Typography variant="caption" display="block">
                              ✉️ {banque.contact.email}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={banque.actif ? "Actif" : "Inactif"}
                          color={banque.actif ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{banque.ordre}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(banque)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(banque._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Dialog pour créer/modifier une banque */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { maxHeight: "90vh" },
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                {editingBanque ? "Modifier la banque" : "Nouvelle banque"}
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nom de la banque *"
                    fullWidth
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Services (description courte) *"
                    fullWidth
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    required
                    placeholder="Ex: Financement immobilier"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description *"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Grid>

                {/* Produits */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    💼 Produits et Services
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <TextField
                      placeholder="Ajouter un produit..."
                      size="small"
                      value={newProduit}
                      onChange={(e) => setNewProduit(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddProduit();
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button variant="outlined" onClick={handleAddProduit}>
                      Ajouter
                    </Button>
                  </Box>
                  <Stack spacing={1}>
                    {formData.produits.map((produit, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                        }}
                      >
                        <CheckCircle sx={{ color: "primary.main", fontSize: 20 }} />
                        <Typography sx={{ flex: 1 }}>{produit}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveProduit(index)}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Grid>

                {/* Avantages */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    ✨ Avantages
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <TextField
                      placeholder="Ajouter un avantage..."
                      size="small"
                      value={newAvantage}
                      onChange={(e) => setNewAvantage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAvantage();
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button variant="outlined" onClick={handleAddAvantage}>
                      Ajouter
                    </Button>
                  </Box>
                  <Stack spacing={1}>
                    {formData.avantages.map((avantage, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1,
                          bgcolor: "success.50",
                          borderRadius: 1,
                        }}
                      >
                        <Star sx={{ color: "success.main", fontSize: 20 }} />
                        <Typography sx={{ flex: 1 }}>{avantage}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAvantage(index)}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Grid>

                {/* Contact */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                    📞 Contact
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Téléphone"
                        fullWidth
                        value={formData.contact.telephone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, telephone: e.target.value },
                          })
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Email"
                        fullWidth
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, email: e.target.value },
                          })
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Site Web"
                        fullWidth
                        value={formData.contact.siteWeb}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: { ...formData.contact, siteWeb: e.target.value },
                          })
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business />
                            </InputAdornment>
                          ),
                        }}
                        placeholder="www.exemple.com"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Adresse et Géolocalisation */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                    📍 Adresse et Géolocalisation
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Adresse complète"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn />
                            </InputAdornment>
                          ),
                        }}
                        placeholder="Ex: Avenue de la République, Niamey, Niger"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Latitude"
                        fullWidth
                        type="number"
                        value={formData.localisation.latitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            localisation: {
                              ...formData.localisation,
                              latitude: e.target.value ? parseFloat(e.target.value) : "",
                            },
                          })
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapIcon />
                            </InputAdornment>
                          ),
                        }}
                        placeholder="Ex: 13.5139"
                        helperText="Coordonnée GPS latitude"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Longitude"
                        fullWidth
                        type="number"
                        value={formData.localisation.longitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            localisation: {
                              ...formData.localisation,
                              longitude: e.target.value ? parseFloat(e.target.value) : "",
                            },
                          })
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapIcon />
                            </InputAdornment>
                          ),
                        }}
                        placeholder="Ex: 2.1098"
                        helperText="Coordonnée GPS longitude"
                      />
                    </Grid>
                    {formData.localisation.latitude && formData.localisation.longitude && (
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          startIcon={<MapIcon />}
                          href={`https://www.google.com/maps?q=${formData.localisation.latitude},${formData.localisation.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                        >
                          Voir sur Google Maps
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* Autres champs */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Logo (URL)"
                    fullWidth
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ordre d'affichage"
                    fullWidth
                    type="number"
                    value={formData.ordre}
                    onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
                    helperText="Plus le nombre est petit, plus la banque apparaît en premier"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.actif}
                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                      />
                    }
                    label="Banque active (affichée sur la page d'accueil)"
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formData.nom || !formData.services || !formData.description}
            >
              {loading ? "Enregistrement..." : editingBanque ? "Modifier" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageLayout>
  );
};

export default AdminBanqueManagementPage;

