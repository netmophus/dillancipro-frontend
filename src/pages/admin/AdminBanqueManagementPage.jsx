import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  GridLegacy as Grid,
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
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Snackbar,
  Switch,
  FormControlLabel,
  Avatar,
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
import { AccountBalance as FIAccountBalance, Checklist as FIChecklist, Image as FIImage, Notes as FINotes, Numbers as FINumbers } from "@mui/icons-material";

import api from "../../services/api";
import PageLayout from "../../components/admin/AdminLayout";
import FormSection from "../../components/admin/SectionCard";
import { useNavigate } from "react-router-dom";

// En-tête de dialogue moderne, coloré, réutilisable
const DialogHeader = ({ icon: Icon, title, subtitle, color, onClose }) => (
  <Box
    sx={{
      p: 3,
      background: color,
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

const FIELD_SX = { "& .MuiOutlinedInput-root": { borderRadius: 2.5 } };

const AdminBanqueManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanque, setEditingBanque] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      await api.delete(`/admin/banques/${deleteTarget._id}`);
      setSuccess("Banque supprimée avec succès");
      setDeleteTarget(null);
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
          <Paper elevation={0} sx={{ background: "#3030F9", p: 4, borderRadius: 3, color: "white" }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", width: 60, height: 60 }}>
                <AccountBalance fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Gestion des banques partenaires
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Gérez les banques partenaires affichées sur la page d'accueil
                </Typography>
              </Box>
            </Box>
          </Paper>
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

        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e3e8ef" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap">
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
              sx={{ width: 300, ...FIELD_SX }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ borderRadius: 2, bgcolor: "#3030F9", boxShadow: "none", "&:hover": { bgcolor: "#2020C8", boxShadow: "none" } }}
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
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #eef2f7" }}>
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
                            <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                              <Phone sx={{ fontSize: 14 }} /> {banque.contact.telephone}
                            </Typography>
                          )}
                          {banque.contact?.email && (
                            <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                              <Email sx={{ fontSize: 14 }} /> {banque.contact.email}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={banque.actif ? "Actif" : "Inactif"}
                          color={banque.actif ? "success" : "default"}
                          size="small"
                          sx={banque.actif ? { bgcolor: "#0A7C4F", color: "white" } : undefined}
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
                            onClick={() => setDeleteTarget(banque)}
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
            sx: { maxHeight: "90vh", borderRadius: 4, overflow: "hidden" },
          }}
        >
          <DialogHeader
            icon={AccountBalance}
            title={editingBanque ? "Modifier la banque" : "Nouvelle banque"}
            subtitle={editingBanque ? editingBanque.nom : "Banque partenaire"}
            color="#3030F9"
            onClose={handleCloseDialog}
          />
          <DialogContent dividers sx={{ p: 3 }}>
            <Stack spacing={3} sx={{ ...FIELD_SX, "& legend": { display: "none" } }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
<FormSection icon="info" sx={{ mb: 0, minWidth: 0, gridColumn: { md: "1 / -1" } }} title="Informations" color="#3030F9">
<Grid container spacing={2}>
<Grid item xs={12} md={6}>
<TextField
inputProps={{ "aria-label": "Nom de la banque", title: "Nom de la banque" }}
placeholder="Nom de la banque *"
InputProps={{
  startAdornment: (
    <InputAdornment position="start">
      <FIAccountBalance color="action" />
    </InputAdornment>
  ),
}}
                    fullWidth
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    inputProps={{ "aria-label": "Services", title: "Services" }}
                    placeholder="Services (ex. Crédit immobilier) *"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FIChecklist color="action" />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    inputProps={{ "aria-label": "Description", title: "Description" }}
                    placeholder="Description *"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                          <FINotes color="action" />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Grid>
</Grid>
</FormSection>

{/* Produits */}
<FormSection icon="inventory" sx={{ mb: 0, minWidth: 0 }} title="Produits et services" color="#0A7C4F">
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
                    <Button variant="outlined" onClick={handleAddProduit} sx={{ borderRadius: 2 }}>
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
                          p: 1.25,
                          bgcolor: "rgba(10,124,79,0.06)",
                          border: "1px solid rgba(10,124,79,0.2)",
                          borderRadius: 2,
                        }}
                      >
                        <CheckCircle sx={{ color: "#0A7C4F", fontSize: 20 }} />
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
</FormSection>

{/* Avantages */}
<FormSection icon="star" sx={{ mb: 0, minWidth: 0 }} title="Avantages" color="#0A7C4F">
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
                    <Button variant="outlined" onClick={handleAddAvantage} sx={{ borderRadius: 2 }}>
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
                          p: 1.25,
                          bgcolor: "rgba(10,124,79,0.06)",
                          border: "1px solid rgba(10,124,79,0.2)",
                          borderRadius: 2,
                        }}
                      >
                        <Star sx={{ color: "#0A7C4F", fontSize: 20 }} />
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
</FormSection>

{/* Contact */}
<FormSection icon="phone" sx={{ mb: 0, minWidth: 0, gridColumn: { md: "1 / -1" } }} title="Contact" color="#0e1133">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        inputProps={{ "aria-label": "Téléphone", title: "Téléphone" }}
                        placeholder="Téléphone"
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
                        inputProps={{ "aria-label": "Email", title: "Email" }}
                        placeholder="Email"
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
                        inputProps={{ "aria-label": "Site Web", title: "Site Web" }}
                        placeholder="Site Web (www.exemple.com)"
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
                      />
                    </Grid>
</Grid>
</FormSection>

{/* Adresse et Géolocalisation */}
<FormSection icon="location" sx={{ mb: 0, minWidth: 0, gridColumn: { md: "1 / -1" } }} title="Adresse et géolocalisation" color="#3030F9">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ "aria-label": "Adresse complète", title: "Adresse complète" }}
                        placeholder="Adresse complète (ex. Niamey, Niger)"
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
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        inputProps={{ "aria-label": "Latitude", title: "Latitude" }}
                        placeholder="Latitude (ex. 13.5139)"
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
                        helperText="Coordonnée GPS latitude"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        inputProps={{ "aria-label": "Longitude", title: "Longitude" }}
                        placeholder="Longitude (ex. 2.1098)"
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
</FormSection>

{/* Autres champs */}
<FormSection icon="visibility" sx={{ mb: 0, minWidth: 0, gridColumn: { md: "1 / -1" } }} title="Affichage" color="#0e1133">
<Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    inputProps={{ "aria-label": "Logo (URL)", title: "Logo (URL)" }}
                    placeholder="Logo (URL, ex. https://...)"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FIImage color="action" />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    inputProps={{ "aria-label": "Ordre d'affichage", title: "Ordre d'affichage" }}
                    placeholder="Ordre d'affichage"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FINumbers color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Ordre d'affichage</Typography>
                        </InputAdornment>
                      ),
                    }}
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
</FormSection>
</Box>
</Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2.5 }}>
            <Button onClick={handleCloseDialog} color="inherit" sx={{ borderRadius: 2 }}>
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formData.nom || !formData.services || !formData.description}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
              sx={{ borderRadius: 2, px: 3, bgcolor: "#3030F9", boxShadow: "none", "&:hover": { bgcolor: "#2020C8", boxShadow: "none" } }}
            >
              {loading ? "Enregistrement..." : editingBanque ? "Enregistrer" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog : confirmation suppression */}
        <Dialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
        >
          <DialogHeader
            icon={Delete}
            title="Confirmer la suppression"
            subtitle="Action irréversible"
            color="#e53935"
            onClose={() => setDeleteTarget(null)}
          />
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2">
              Voulez-vous vraiment supprimer la banque <strong>{deleteTarget?.nom}</strong> ?
            </Typography>
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              Cette action est irréversible.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
            <Button onClick={() => setDeleteTarget(null)} color="inherit" sx={{ borderRadius: 2 }}>
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              startIcon={<Delete />}
              disabled={loading}
              sx={{ borderRadius: 2, px: 3, bgcolor: "#e53935", boxShadow: "none", "&:hover": { bgcolor: "#c62828", boxShadow: "none" } }}
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageLayout>
  );
};

export default AdminBanqueManagementPage;

