import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  LocationCity,
  Home,
  Business,
  Save,
  Cancel,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../api";

const AdminGeographicPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("villes");
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Form data based on active tab
  const getFormFields = () => {
    switch (activeTab) {
      case "villes":
        return [
          { name: "nom", label: "Nom de la ville", required: true },
          { name: "region", label: "Région", required: false },
          { name: "codePostal", label: "Code postal", required: false },
          { name: "description", label: "Description", required: false, multiline: true },
        ];
      case "quartiers":
        return [
          { name: "nom", label: "Nom du quartier", required: true },
          { name: "ville", label: "Ville", required: true, select: true, options: villes },
          { name: "description", label: "Description", required: false, multiline: true },
        ];
      case "zones":
        return [
          { name: "nom", label: "Nom de la zone/cité", required: true },
          { name: "quartier", label: "Quartier", required: true, select: true, options: quartiers },
          { name: "description", label: "Description", required: false, multiline: true },
        ];
      default:
        return [];
    }
  };

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [villesRes, quartiersRes, zonesRes] = await Promise.all([
        api.get("/admin/geographic/villes"),
        api.get("/admin/geographic/quartiers"),
        api.get("/admin/geographic/zones"),
      ]);
      
      setVilles(villesRes.data);
      setQuartiers(quartiersRes.data);
      setZones(zonesRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setSnackbar({ open: true, message: "Erreur lors du chargement des données", severity: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const endpoint = `/admin/geographic/${activeTab}`;
      const method = editingItem ? "put" : "post";
      const url = editingItem ? `${endpoint}/${editingItem._id}` : endpoint;

      await api[method](url, formData);
      
      setSnackbar({ 
        open: true, 
        message: `${activeTab === "villes" ? "Ville" : activeTab === "quartiers" ? "Quartier" : "Zone/Cité"} ${editingItem ? "modifié" : "créé"} avec succès`, 
        severity: "success" 
      });
      
      setOpenDialog(false);
      setEditingItem(null);
      setFormData({});
      loadData();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setSnackbar({ open: true, message: "Erreur lors de la sauvegarde", severity: "error" });
    }
  };

  // Handle delete
  const handleDelete = async (item) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${item.nom} ?`)) return;
    
    try {
      await api.delete(`/admin/geographic/${activeTab}/${item._id}`);
      setSnackbar({ open: true, message: "Supprimé avec succès", severity: "success" });
      loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setSnackbar({ open: true, message: "Erreur lors de la suppression", severity: "error" });
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nom: item.nom,
      region: item.region || "",
      codePostal: item.codePostal || "",
      description: item.description || "",
      ville: item.ville?._id || "",
      quartier: item.quartier?._id || "",
    });
    setOpenDialog(true);
  };

  // Handle add new
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setOpenDialog(true);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "villes": return villes;
      case "quartiers": return quartiers;
      case "zones": return zones;
      default: return [];
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "villes": return <LocationCity />;
      case "quartiers": return <Home />;
      case "zones": return <Business />;
      default: return null;
    }
  };

  const getTabTitle = (tab) => {
    switch (tab) {
      case "villes": return "Villes";
      case "quartiers": return "Quartiers";
      case "zones": return "Zones/Cités";
      default: return "";
    }
  };

  return (
    <PageLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            🏛️ Gestion Géographique
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez les villes, quartiers et zones/cités du système
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {["villes", "quartiers", "zones"].map((tab) => (
              <Grid item key={tab}>
                <Button
                  variant={activeTab === tab ? "contained" : "outlined"}
                  startIcon={getTabIcon(tab)}
                  onClick={() => setActiveTab(tab)}
                  sx={{ minWidth: 150 }}
                >
                  {getTabTitle(tab)}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Data Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">
                {getTabTitle(activeTab)} ({getCurrentData().length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAdd}
                sx={{ bgcolor: "#1976d2" }}
              >
                Ajouter {activeTab === "zones" ? "Zone/Cité" : getTabTitle(activeTab).slice(0, -1)}
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    {activeTab === "villes" && <TableCell>Région</TableCell>}
                    {activeTab === "quartiers" && <TableCell>Ville</TableCell>}
                    {activeTab === "zones" && <TableCell>Quartier</TableCell>}
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentData().map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {getTabIcon(activeTab)}
                          <Typography variant="body2" fontWeight="medium">
                            {item.nom}
                          </Typography>
                        </Box>
                      </TableCell>
                      {activeTab === "villes" && (
                        <TableCell>
                          {item.region && <Chip label={item.region} size="small" />}
                        </TableCell>
                      )}
                      {activeTab === "quartiers" && (
                        <TableCell>
                          {item.ville?.nom}
                        </TableCell>
                      )}
                      {activeTab === "zones" && (
                        <TableCell>
                          {item.quartier?.nom}
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.description || "Aucune description"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(item)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(item)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingItem ? "Modifier" : "Ajouter"} {getTabTitle(activeTab).slice(0, -1)}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {getFormFields().map((field) => (
                <Box key={field.name} sx={{ mb: 2 }}>
                  {field.select ? (
                    <FormControl fullWidth>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        label={field.label}
                      >
                        {field.options?.map((option) => (
                          <MenuItem key={option._id} value={option._id}>
                            {option.nom}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      label={field.label}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      multiline={field.multiline}
                      rows={field.multiline ? 3 : 1}
                      required={field.required}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} startIcon={<Save />} variant="contained">
              {editingItem ? "Modifier" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </PageLayout>
  );
};

export default AdminGeographicPage;
