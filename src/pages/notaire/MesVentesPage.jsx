import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Gavel,
  Assignment,
  CheckCircle,
  Upload,
  Description,
  Delete,
  Edit,
  Visibility,
  Download,
  History,
  Person,
  Business,
  Home,
  AttachMoney,
  Close,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../services/api";

const STATUT_COLORS = {
  en_attente_notaire: "warning",
  en_cours_notariat: "info",
  formalites_completes: "success",
  finalisee: "success",
  annulee: "error",
};

const STATUT_LABELS = {
  en_attente_notaire: "En attente",
  en_cours_notariat: "En cours",
  formalites_completes: "Formalités complètes",
  finalisee: "Finalisée",
  annulee: "Annulée",
};

const DOCUMENT_TYPES = {
  acte_vente: "Acte de vente",
  acte_notarie: "Acte notarié",
  quittance: "Quittance",
  autre: "Autre",
};

const MesVentesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [ventes, setVentes] = useState([]);
  const [ventesParcelles, setVentesParcelles] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0 = biens immobiliers, 1 = parcelles
  const [loading, setLoading] = useState(true);
  const [loadingParcelles, setLoadingParcelles] = useState(true);
  const [error, setError] = useState("");
  const [selectedVente, setSelectedVente] = useState(null);
  const [isVenteParcelle, setIsVenteParcelle] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statutDialogOpen, setStatutDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [historiqueOpen, setHistoriqueOpen] = useState(false);
  
  const [newStatut, setNewStatut] = useState("");
  const [notes, setNotes] = useState("");
  const [documentNom, setDocumentNom] = useState("");
  const [documentType, setDocumentType] = useState("acte_vente");
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const currentStatut = searchParams.get("statut") || "all";

  useEffect(() => {
    fetchVentes();
    fetchVentesParcelles();
  }, [currentStatut]);

  const fetchVentes = async () => {
    setLoading(true);
    setError("");
    try {
      const params = currentStatut !== "all" ? { statut: currentStatut } : {};
      const res = await API.get("/notaire/ventes", { params });
      setVentes(res.data);
    } catch (err) {
      console.error("Erreur chargement ventes:", err);
      setError("Impossible de charger les ventes");
    } finally {
      setLoading(false);
    }
  };

  const fetchVentesParcelles = async () => {
    setLoadingParcelles(true);
    try {
      const params = currentStatut !== "all" ? { statut: currentStatut } : {};
      const res = await API.get("/notaire/ventes/parcelles", { params });
      setVentesParcelles(res.data);
    } catch (err) {
      console.error("Erreur chargement ventes parcelles:", err);
    } finally {
      setLoadingParcelles(false);
    }
  };

  const handleOpenDetails = async (venteId) => {
    try {
      setIsVenteParcelle(false);
      const res = await API.get(`/notaire/ventes/${venteId}`);
      setSelectedVente(res.data);
      setDetailsOpen(true);
    } catch (err) {
      console.error("Erreur chargement détails:", err);
      setError("Impossible de charger les détails de la vente");
    }
  };

  const handleOpenDetailsParcelle = async (venteId) => {
    try {
      setIsVenteParcelle(true);
      console.log(`🔍 [FRONTEND] Appel API pour parcelle: /notaire/ventes/parcelles/${venteId}`);
      const res = await API.get(`/notaire/ventes/parcelles/${venteId}`);
      console.log(`✅ [FRONTEND] Réponse reçue pour parcelle:`, res.data);
      setSelectedVente(res.data);
      setDetailsOpen(true);
    } catch (err) {
      console.error("❌ [FRONTEND] Erreur chargement détails parcelle:", err);
      console.error("❌ [FRONTEND] URL utilisée:", err.config?.url);
      setError(err.response?.data?.message || "Impossible de charger les détails de la vente de parcelle");
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedVente(null);
    setStatutDialogOpen(false);
    setDocumentDialogOpen(false);
    setHistoriqueOpen(false);
  };

  const handleUpdateStatut = async () => {
    if (!newStatut) {
      setError("Veuillez sélectionner un statut");
      return;
    }

    try {
      const endpoint = isVenteParcelle 
        ? `/notaire/ventes/parcelles/${selectedVente._id}/statut`
        : `/notaire/ventes/${selectedVente._id}/statut`;
      
      await API.put(endpoint, {
        statut: newStatut,
        notes: notes || undefined,
      });

      setStatutDialogOpen(false);
      setNewStatut("");
      setNotes("");
      fetchVentes();
      fetchVentesParcelles();
      
      // Rafraîchir les détails
      if (isVenteParcelle) {
        handleOpenDetailsParcelle(selectedVente._id);
      } else {
        handleOpenDetails(selectedVente._id);
      }
    } catch (err) {
      console.error("Erreur mise à jour statut:", err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile || !documentNom || !documentType) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", documentFile);
      formData.append("nom", documentNom);
      formData.append("type", documentType);

      await API.post(`/notaire/ventes/${selectedVente._id}/documents?type=notaire-documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDocumentDialogOpen(false);
      setDocumentFile(null);
      setDocumentNom("");
      setDocumentType("acte_vente");
      fetchVentes();
      handleOpenDetails(selectedVente._id); // Rafraîchir les détails
    } catch (err) {
      console.error("Erreur upload document:", err);
      setError(err.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return;
    }

    try {
      await API.delete(`/notaire/ventes/${selectedVente._id}/documents/${docId}`);
      fetchVentes();
      handleOpenDetails(selectedVente._id); // Rafraîchir les détails
    } catch (err) {
      console.error("Erreur suppression document:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleFinaliser = async () => {
    if (!window.confirm("Confirmer la finalisation de cette vente ? Les formalités seront marquées comme complètes.")) {
      return;
    }

    try {
      const endpoint = isVenteParcelle
        ? `/notaire/ventes/parcelles/${selectedVente._id}/finaliser`
        : `/notaire/ventes/${selectedVente._id}/finaliser`;
      
      await API.put(endpoint);
      fetchVentes();
      fetchVentesParcelles();
      
      // Rafraîchir les détails
      if (isVenteParcelle) {
        handleOpenDetailsParcelle(selectedVente._id);
      } else {
        handleOpenDetails(selectedVente._id);
      }
    } catch (err) {
      console.error("Erreur finalisation:", err);
      setError(err.response?.data?.message || "Erreur lors de la finalisation");
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount || 0) + " FCFA";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <PageLayout>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
        {/* En-tête modernisé */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            py: 6,
            mb: 4,
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              filter: "blur(80px)",
            }}
          />
          <Container maxWidth="xl">
            <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
              <Box display="flex" alignItems="center" gap={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Gavel sx={{ fontSize: 48, color: "white" }} />
                </Box>
                <Box>
                  <Typography 
                    variant="h3" 
                    fontWeight={700}
                    sx={{
                      color: "white",
                      mb: 1,
                    }}
                  >
                    Mes Ventes
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 400,
                    }}
                  >
                    Gérez les ventes qui vous sont assignées
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Assignment />}
                onClick={() => navigate("/notaire/dashboard")}
                sx={{
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Retour au dashboard
              </Button>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ mb: 4 }}>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.15)",
            }} 
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Onglets pour Biens Immobiliers / Parcelles */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            borderRadius: 3,
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => {
              setActiveTab(value);
            }}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                minHeight: 64,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              },
            }}
          >
            <Tab label="Biens Immobiliers" icon={<Home />} iconPosition="start" />
            <Tab label="Parcelles" icon={<AttachMoney />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Filtres par statut */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            background: "white",
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            p: 1,
          }}
        >
          <Tabs
            value={currentStatut}
            onChange={(_, value) => {
              setSearchParams(value === "all" ? {} : { statut: value });
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                minHeight: 48,
                borderRadius: 2,
                mx: 0.5,
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                },
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            <Tab label="Toutes" value="all" />
            <Tab label="En attente" value="en_attente_notaire" />
            <Tab label="En cours" value="en_cours_notariat" />
            <Tab label="Formalités complètes" value="formalites_completes" />
            <Tab label="Finalisées" value="finalisee" />
          </Tabs>
        </Paper>

        {/* Table des ventes */}
        {activeTab === 0 ? (
          // Onglet Biens Immobiliers
          loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : ventes.length === 0 ? (
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
              }}
            >
              <CardContent sx={{ py: 6 }}>
                <Typography align="center" color="text.secondary" variant="h6">
                  Aucune vente de bien immobilier trouvée
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer 
              component={Paper} 
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
                    }}
                  >
                    <TableCell><strong>Bien</strong></TableCell>
                    <TableCell><strong>Client</strong></TableCell>
                    <TableCell><strong>Prix de vente</strong></TableCell>
                    <TableCell><strong>Agence</strong></TableCell>
                    <TableCell><strong>Statut</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventes.map((vente) => (
                  <TableRow 
                    key={vente._id} 
                    hover
                    sx={{
                      "&:hover": {
                        background: "rgba(102, 126, 234, 0.04)",
                      },
                      transition: "background 0.2s ease",
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Home fontSize="small" sx={{ color: "primary.main" }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {vente.bienId?.titre || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vente.bienId?.type || ""}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">
                          {vente.clientId?.fullName || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight={700}
                        sx={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {formatMoney(vente.prixVente || vente.bienId?.prix || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business fontSize="small" color="action" />
                        <Typography variant="body2">
                          {vente.agenceId?.nom || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUT_LABELS[vente.statut] || vente.statut}
                        color={STATUT_COLORS[vente.statut] || "default"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(vente.dateVente)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir les détails">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetails(vente._id)}
                          sx={{
                            color: "primary.main",
                            "&:hover": {
                              background: "rgba(102, 126, 234, 0.1)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : (
          // Onglet Parcelles
          loadingParcelles ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : ventesParcelles.length === 0 ? (
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
              }}
            >
              <CardContent sx={{ py: 6 }}>
                <Typography align="center" color="text.secondary" variant="h6">
                  Aucune vente de parcelle trouvée
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer 
              component={Paper} 
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
                    }}
                  >
                    <TableCell><strong>Parcelle</strong></TableCell>
                    <TableCell><strong>Client</strong></TableCell>
                    <TableCell><strong>Prix</strong></TableCell>
                    <TableCell><strong>Commercial</strong></TableCell>
                    <TableCell><strong>Agence</strong></TableCell>
                    <TableCell><strong>Statut</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventesParcelles.map((vente) => (
                    <TableRow 
                      key={vente._id} 
                      hover
                      sx={{
                        "&:hover": {
                          background: "rgba(102, 126, 234, 0.04)",
                        },
                        transition: "background 0.2s ease",
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <AttachMoney fontSize="small" sx={{ color: "primary.main" }} />
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {vente.parcelle?.numeroParcelle || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Person fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {vente.clientId?.fullName || vente.acquereurNom || "N/A"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {vente.clientId?.phone || vente.acquereurTelephone || ""}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          fontWeight={700}
                          sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {formatMoney(vente.montantTotal)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {vente.commercialId?.fullName || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Business fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight={500}>
                            {vente.agenceId?.nom || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUT_LABELS[vente.statut] || vente.statut}
                          color={STATUT_COLORS[vente.statut] || "default"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(vente.dateVente)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir les détails">
                          <IconButton
                            size="small"
                            onClick={() => {
                              console.log("🔍 [FRONTEND] Clic sur œil pour parcelle:", vente._id);
                              setIsVenteParcelle(true);
                              handleOpenDetailsParcelle(vente._id);
                            }}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                background: "rgba(102, 126, 234, 0.1)",
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}

        {/* Dialog Détails de la vente */}
        {selectedVente && (
          <Dialog
            open={detailsOpen}
            onClose={handleCloseDetails}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Détails de la vente</Typography>
                <IconButton onClick={handleCloseDetails}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Informations générales */}
                {!isVenteParcelle && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          BIEN IMMOBILIER
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          {selectedVente.bienId?.titre || selectedVente.bienId?.reference || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Type: {selectedVente.bienId?.type || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Superficie: {selectedVente.bienId?.superficie ? `${selectedVente.bienId.superficie} m²` : "N/A"}
                        </Typography>
                        {selectedVente.bienId?.localisation && (
                          <Typography variant="body2" color="text.secondary">
                            Localisation: {selectedVente.bienId.localisation.adresse || selectedVente.bienId.localisation.ville || "N/A"}
                          </Typography>
                        )}
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          PRIX
                        </Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {formatMoney(selectedVente.prixVente || selectedVente.bienId?.prix || 0)}
                        </Typography>
                        {selectedVente.prixVente && selectedVente.prixVente !== selectedVente.bienId?.prix && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            Prix initial du bien: {formatMoney(selectedVente.bienId?.prix || 0)}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  </>
                )}

                {/* Informations pour les ventes de parcelles */}
                {isVenteParcelle && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          PARCELLE
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          {selectedVente.parcelle?.numeroParcelle || "N/A"}
                        </Typography>
                        {selectedVente.parcelle?.superficie && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Superficie: {selectedVente.parcelle.superficie} m²
                          </Typography>
                        )}
                        {selectedVente.parcelle?.localisation && (
                          <Typography variant="body2" color="text.secondary">
                            Localisation: {selectedVente.parcelle.localisation.adresse || selectedVente.parcelle.localisation.ville || "N/A"}
                          </Typography>
                        )}
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          PRIX
                        </Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {formatMoney(selectedVente.montantTotal || selectedVente.parcelle?.prix || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Montant payé: {formatMoney(selectedVente.montantPaye || 0)}
                        </Typography>
                      </Card>
                    </Grid>
                  </>
                )}

                {/* Client */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CLIENT (Acheteur)
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedVente.clientId?.fullName || selectedVente.acquereurNom || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedVente.clientId?.phone || selectedVente.acquereurTelephone || ""}
                    </Typography>
                    {selectedVente.clientId?.email && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedVente.clientId.email}
                      </Typography>
                    )}
                  </Card>
                </Grid>

                {/* Agence */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      AGENCE
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedVente.agenceId?.nom || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Commercial: {selectedVente.commercialId?.fullName || "N/A"}
                    </Typography>
                    {selectedVente.commercialId?.phone && (
                      <Typography variant="body2" color="text.secondary">
                        Téléphone: {selectedVente.commercialId.phone}
                      </Typography>
                    )}
                  </Card>
                </Grid>

                {/* Statut actuel */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        STATUT ACTUEL
                      </Typography>
                      <Chip
                        label={STATUT_LABELS[selectedVente.statut] || selectedVente.statut}
                        color={STATUT_COLORS[selectedVente.statut] || "default"}
                      />
                    </Box>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => {
                          setNewStatut(selectedVente.statut);
                          setStatutDialogOpen(true);
                        }}
                      >
                        Modifier le statut
                      </Button>
                      {selectedVente.statut !== "formalites_completes" && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={handleFinaliser}
                        >
                          Finaliser la vente
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>

                {/* Documents notariaux */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        DOCUMENTS NOTARIAUX
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Upload />}
                        onClick={() => setDocumentDialogOpen(true)}
                      >
                        Ajouter un document
                      </Button>
                    </Box>
                    {selectedVente.documentsNotariaux?.length > 0 ? (
                      <List>
                        {selectedVente.documentsNotariaux.map((doc, idx) => (
                          <ListItem key={idx} divider>
                            <ListItemIcon>
                              <Description />
                            </ListItemIcon>
                            <ListItemText
                              primary={doc.nom}
                              secondary={`${DOCUMENT_TYPES[doc.type] || doc.type} • ${formatDate(doc.uploadLe)}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => window.open(doc.url, "_blank")}
                              >
                                <Download />
                              </IconButton>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteDocument(doc._id)}
                              >
                                <Delete />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" align="center" py={2}>
                        Aucun document uploadé
                      </Typography>
                    )}
                  </Card>
                </Grid>

                {/* Historique */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        HISTORIQUE
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<History />}
                        onClick={() => setHistoriqueOpen(true)}
                      >
                        Voir l'historique complet
                      </Button>
                    </Box>
                    {selectedVente.historique?.length > 0 ? (
                      <List dense>
                        {selectedVente.historique
                          .slice(-5)
                          .reverse()
                          .map((entry, idx) => (
                            <ListItem key={idx} divider>
                              <ListItemText
                                primary={entry.description}
                                secondary={`${entry.acteurNom || "Système"} • ${formatDate(entry.date)}`}
                              />
                            </ListItem>
                          ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" align="center" py={2}>
                        Aucun historique
                      </Typography>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Fermer</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Dialog Modifier le statut */}
        <Dialog open={statutDialogOpen} onClose={() => setStatutDialogOpen(false)}>
          <DialogTitle>Modifier le statut</DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Nouveau statut"
              value={newStatut}
              onChange={(e) => setNewStatut(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            >
              <MenuItem value="en_attente_notaire">En attente</MenuItem>
              <MenuItem value="en_cours_notariat">En cours</MenuItem>
              <MenuItem value="formalites_completes">Formalités complètes</MenuItem>
              <MenuItem value="finalisee">Finalisée</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (optionnel)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes sur cette modification..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatutDialogOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleUpdateStatut}>
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Upload document */}
        <Dialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)}>
          <DialogTitle>Ajouter un document</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nom du document"
              value={documentNom}
              onChange={(e) => setDocumentNom(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
              required
            />
            <TextField
              select
              fullWidth
              label="Type de document"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              sx={{ mb: 2 }}
              required
            >
              <MenuItem value="acte_vente">Acte de vente</MenuItem>
              <MenuItem value="acte_notarie">Acte notarié</MenuItem>
              <MenuItem value="quittance">Quittance</MenuItem>
              <MenuItem value="autre">Autre</MenuItem>
            </TextField>
            <Button variant="outlined" component="label" fullWidth startIcon={<Upload />}>
              Choisir un fichier
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setDocumentFile(e.target.files[0])}
              />
            </Button>
            {documentFile && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {documentFile.name}
              </Typography>
            )}
            {uploading && <LinearProgress sx={{ mt: 2 }} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDocumentDialogOpen(false)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={handleUploadDocument}
              disabled={uploading || !documentFile || !documentNom}
            >
              {uploading ? "Upload..." : "Uploader"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Historique complet */}
        <Dialog
          open={historiqueOpen}
          onClose={() => setHistoriqueOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Historique complet</DialogTitle>
          <DialogContent>
            {selectedVente?.historique?.length > 0 ? (
              <List>
                {selectedVente.historique
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <ListItem key={idx} divider>
                      <ListItemText
                        primary={entry.description}
                        secondary={`${entry.acteurNom || "Système"} • ${formatDate(entry.date)}`}
                      />
                    </ListItem>
                  ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" py={2}>
                Aucun historique
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoriqueOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>
        </Container>
      </Box>
    </PageLayout>
  );
};

export default MesVentesPage;

