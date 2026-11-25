import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  GridLegacy as Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Avatar,
  Stack,
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
  Close,
  Map as FIMap,
  MarkunreadMailbox as FIMailbox,
  Notes as FINotes,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import PageLayout from "../../components/admin/AdminLayout";
import SectionCard from "../../components/admin/SectionCard";
import api from "../../api";

// En-tête de dialogue moderne, coloré, réutilisable
const DialogHeader = ({ icon: Icon, title, subtitle, color, onClose }) => (
  <Box
    sx={{
      p: 3,
      bgcolor: color,
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

// Métadonnées d'affichage par niveau géographique
const TAB_META = {
  villes: { color: "#0A7C4F", icon: LocationCity, singular: "ville" },
  quartiers: { color: "#3030F9", icon: Home, singular: "quartier" },
  zones: { color: "#0e1133", icon: Business, singular: "zone / cité" },
};

const FIELD_SX = { "& .MuiOutlinedInput-root": { borderRadius: 2.5 }, "& legend": { display: "none" } };

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
        <Paper elevation={0} sx={{ bgcolor: "#3030F9", p: 4, mb: 4, borderRadius: 3, color: "white" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", width: 60, height: 60 }}>
              <LocationCity fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
                Découpage géographique
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Gérez les villes, quartiers et zones / cités du système
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {["villes", "quartiers", "zones"].map((tab) => {
              const meta = TAB_META[tab];
              const isActive = activeTab === tab;
              return (
                <Grid item key={tab}>
                  <Button
                    variant={isActive ? "contained" : "outlined"}
                    startIcon={getTabIcon(tab)}
                    onClick={() => setActiveTab(tab)}
                    sx={{
                      minWidth: 150,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      ...(isActive
                        ? { bgcolor: meta.color, boxShadow: "none", "&:hover": { bgcolor: meta.color, filter: "brightness(0.92)", boxShadow: "none" } }
                        : { color: meta.color, borderColor: `${meta.color}55`, "&:hover": { borderColor: meta.color, bgcolor: `${meta.color}0d` } }),
                    }}
                  >
                    {getTabTitle(tab)}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Data Table */}
        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: TAB_META[activeTab].color }}>
                {getTabTitle(activeTab)} ({getCurrentData().length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAdd}
                sx={{
                  bgcolor: TAB_META[activeTab].color,
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { bgcolor: TAB_META[activeTab].color, filter: "brightness(0.92)", boxShadow: "none" },
                }}
              >
                Ajouter {activeTab === "zones" ? "Zone/Cité" : getTabTitle(activeTab).slice(0, -1)}
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid rgba(15,23,42,0.08)", "& .MuiTableHead-root .MuiTableCell-root": { bgcolor: "#f5f7fa", fontWeight: 700, color: "#0e1133" } }}>
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
                          {item.region && <Chip label={item.region} size="small" sx={{ bgcolor: "rgba(10,124,79,0.12)", color: "#0A7C4F", fontWeight: 600 }} />}
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
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
        >
          <DialogHeader
            icon={TAB_META[activeTab].icon}
            title={`${editingItem ? "Modifier" : "Ajouter"} ${TAB_META[activeTab].singular}`}
            subtitle={editingItem ? editingItem.nom : "Nouvel élément géographique"}
            color={TAB_META[activeTab].color}
            onClose={() => setOpenDialog(false)}
          />
          <DialogContent sx={{ p: 3 }}>
            <SectionCard
              title={TAB_META[activeTab].singular.charAt(0).toUpperCase() + TAB_META[activeTab].singular.slice(1)}
              color={TAB_META[activeTab].color}
              icon="info"
              sx={{ mb: 0 }}
            >
              {getFormFields().map((field) => (
                <Box key={field.name} sx={{ mb: 2.5 }}>
                  {field.select ? (
                    <FormControl fullWidth required={field.required} sx={FIELD_SX}>
                      <Select
                        value={formData[field.name] || ""}
                        displayEmpty
                        inputProps={{ "aria-label": field.label, title: field.label }}
                        startAdornment={
                          <InputAdornment position="start">
                            {field.name === "ville" ? <LocationCity color="action" /> : <Home color="action" />}
                          </InputAdornment>
                        }
                        renderValue={(v) =>
                          v
                            ? field.options?.find((o) => o._id === v)?.nom
                            : <Typography component="span" color="text.secondary">{field.label}{field.required ? " *" : ""}</Typography>
                        }
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
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
                      placeholder={field.label + (field.required ? " *" : "")}
                      inputProps={{ "aria-label": field.label, title: field.label }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={field.multiline ? { alignSelf: "flex-start", mt: 1.5 } : undefined}>
                            {field.name === "region" ? <FIMap color="action" />
                              : field.name === "codePostal" ? <FIMailbox color="action" />
                              : field.name === "description" ? <FINotes color="action" />
                              : (() => { const I = TAB_META[activeTab].icon; return <I color="action" />; })()}
                          </InputAdornment>
                        ),
                      }}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      multiline={field.multiline}
                      rows={field.multiline ? 3 : 1}
                      required={field.required}
                      sx={FIELD_SX}
                    />
                  )}
                </Box>
              ))}
            </SectionCard>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit" startIcon={<Cancel />} sx={{ borderRadius: 2 }}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              startIcon={<Save />}
              variant="contained"
              sx={{ borderRadius: 2, px: 3, bgcolor: TAB_META[activeTab].color, boxShadow: "none", "&:hover": { bgcolor: TAB_META[activeTab].color, filter: "brightness(0.92)", boxShadow: "none" } }}
            >
              {editingItem ? "Enregistrer" : "Créer"}
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
