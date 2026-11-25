import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  GridLegacy as Grid,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Collapse,
} from "@mui/material";
import {
  Add,
  Home,
  Map,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  CloudUpload,
  Delete,
  LocationOn,
  AttachMoney,
  Square,
  ExpandMore,
  ExpandLess,
  Close,
  Description,
} from "@mui/icons-material";
import { Flag as FIFlag, Notes as FINotes, AttachMoney as FIAttachMoney, MyLocation as FIMyLocation, Explore as FIExplore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AgenceLayout from "../../components/agence/AgenceLayout";
import SectionCard from "../../components/admin/SectionCard";
import AgencePageHeader from "../../components/agence/AgencePageHeader";
import api from "../../services/api";

const CreateParcelleMultiplePage = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Données communes à toutes les parcelles
  const [commonData, setCommonData] = useState({
    ilot: "",
    superficie: "",
    prix: "",
    statut: "avendre",
    description: "",
  });

  // Liste des numéros de parcelles
  const [numeroList, setNumeroList] = useState("");
  const [parcelles, setParcelles] = useState([]);
  
  // Îlots disponibles
  const [ilots, setIlots] = useState([]);

  const steps = ["Informations communes", "Liste des parcelles", "Coordonnées & Documents", "Confirmation"];

  useEffect(() => {
    fetchIlots();
  }, []);

  const fetchIlots = async () => {
    try {
      const res = await api.get("/agence/ilots");
      setIlots(res.data);
    } catch (err) {
      console.error("Erreur chargement îlots :", err);
    }
  };

  // Générer la liste de parcelles à partir des numéros saisis
  const generateParcelles = () => {
    const numeros = numeroList
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    if (numeros.length === 0) {
      setError("Veuillez saisir au moins un numéro de parcelle");
      return;
    }

    const newParcelles = numeros.map((num) => ({
      numeroParcelle: num,
      ...commonData,
      localisation: { lat: "", lng: "" },
      documentFiles: [],
      expanded: false,
    }));

    setParcelles(newParcelles);
    setError("");
    nextStep();
  };

  // Mettre à jour une parcelle spécifique
  const updateParcelle = (index, field, value) => {
    setParcelles((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Mettre à jour la localisation d'une parcelle
  const updateLocalisation = (index, field, value) => {
    setParcelles((prev) => {
      const updated = [...prev];
      updated[index].localisation[field] = value;
      return updated;
    });
  };

  // Upload de documents pour une parcelle spécifique
  const handleDocumentUpload = (parcelleIndex, e) => {
    const files = Array.from(e.target.files);
    
    setParcelles((prev) => {
      const updated = [...prev];
      updated[parcelleIndex].documentFiles = [...(updated[parcelleIndex].documentFiles || []), ...files];
      return updated;
    });
  };

  // Supprimer un document d'une parcelle
  const removeDocument = (parcelleIndex, docIndex) => {
    setParcelles((prev) => {
      const updated = [...prev];
      updated[parcelleIndex].documentFiles = updated[parcelleIndex].documentFiles.filter((_, i) => i !== docIndex);
      return updated;
    });
  };

  // Toggle expansion d'une parcelle
  const toggleExpand = (index) => {
    setParcelles((prev) => {
      const updated = [...prev];
      updated[index].expanded = !updated[index].expanded;
      return updated;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("📝 [FRONTEND] Début soumission batch individual");
      console.log("📝 [FRONTEND] Nombre de parcelles:", parcelles.length);

      const formData = new FormData();

      // Préparer les données pour chaque parcelle
      const parcellesData = parcelles.map((p, index) => ({
        numeroParcelle: p.numeroParcelle,
        ilot: p.ilot,
        superficie: p.superficie,
        prix: p.prix,
        statut: p.statut,
        description: p.description,
        localisation: p.localisation,
        documentCount: p.documentFiles?.length || 0,
      }));

      console.log("📝 [FRONTEND] Données parcelles:", parcellesData);
      formData.append("parcelles", JSON.stringify(parcellesData));

      // Ajouter tous les documents avec un préfixe indiquant à quelle parcelle ils appartiennent
      let totalDocuments = 0;
      
      parcelles.forEach((p, parcelleIndex) => {
        // Documents
        if (p.documentFiles && p.documentFiles.length > 0) {
          console.log(`📤 [FRONTEND] Ajout de ${p.documentFiles.length} documents pour parcelle ${parcelleIndex}`);
          p.documentFiles.forEach((file) => {
            formData.append(`documents_parcelle_${parcelleIndex}`, file);
            totalDocuments++;
          });
        }
      });

      console.log(`📤 [FRONTEND] Total documents à uploader: ${totalDocuments}`);

      const res = await api.post("/agence/parcelles/parcelles/batch-individual", formData);
      console.log("✅ [FRONTEND] Succès:", res.data);
      
      setSuccess(`${parcelles.length} parcelles créées avec succès ! Redirection...`);
      
      // Rediriger vers l'onglet liste de la page de création après 1.5 secondes
      setTimeout(() => {
        navigate("/agence/create-parcelle", { state: { showList: true } });
      }, 1500);

    } catch (err) {
      console.error("❌ [FRONTEND] Erreur création:", err);
      console.error("❌ [FRONTEND] Détails:", err.response?.data);
      console.error("❌ [FRONTEND] Stack:", err.stack);
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <AgenceLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <AgencePageHeader
          icon={Square}
          title="Créer Parcelles Multiples"
          subtitle="Créez plusieurs parcelles avec coordonnées et médias individuels"
        />

        {/* Alertes */}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Card elevation={0} sx={{ bgcolor: "transparent", border: "none", boxShadow: "none" }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, "& .MuiOutlinedInput-root": { borderRadius: 2 }, "& legend": { display: "none" } }}>
            {/* Stepper */}
            <Stepper
              activeStep={currentStep}
              sx={{
                mb: 4,
                "& .MuiStepLabel-label": { fontWeight: 600 },
                "& .MuiStepLabel-label.Mui-active": { color: "#3030F9" },
                "& .MuiStepIcon-root.Mui-active": { color: "#3030F9" },
                "& .MuiStepIcon-root.Mui-completed": { color: "#0A7C4F" },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* ÉTAPE 1 : Informations communes */}
            {currentStep === 0 && (
              <SectionCard title="Informations communes à toutes les parcelles" color="#3030F9" icon="info" sx={{ mb: 0 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      inputProps={{ "aria-label": "Îlot", title: "Îlot" }}
                      value={commonData.ilot}
                      onChange={(e) => setCommonData({ ...commonData, ilot: e.target.value })}
                      fullWidth
                      required
                      SelectProps={{ displayEmpty: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Map color="action" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="" disabled>
                        Sélectionnez un îlot *
                      </MenuItem>
                      {ilots.map((ilot) => (
                        <MenuItem key={ilot._id} value={ilot._id}>
                          {ilot.numeroIlot}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      inputProps={{ "aria-label": "Superficie commune", title: "Superficie commune" }}
                      placeholder="Superficie commune"
                      type="number"
                      value={commonData.superficie}
                      onChange={(e) => setCommonData({ ...commonData, superficie: e.target.value })}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Square color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                      }}
                      helperText="Laissez vide si différente pour chaque parcelle"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      inputProps={{ "aria-label": "Prix commun", title: "Prix commun" }}
                      placeholder="Prix commun"
                      type="number"
                      value={commonData.prix}
                      onChange={(e) => setCommonData({ ...commonData, prix: e.target.value })}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIAttachMoney color="action" />
                          </InputAdornment>
                        ),
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney /> FCFA
                          </InputAdornment>
                        ),
                      }}
                      helperText="Laissez vide si différent pour chaque parcelle"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      inputProps={{ "aria-label": "Statut", title: "Statut" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FIFlag color="action" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Statut</Typography>
                          </InputAdornment>
                        ),
                      }}
                      value={commonData.statut}
                      onChange={(e) => setCommonData({ ...commonData, statut: e.target.value })}
                      fullWidth
                    >
                      <MenuItem value="avendre">À vendre</MenuItem>
                      <MenuItem value="vendue">Vendue</MenuItem>
                      <MenuItem value="reserved">Réservée</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      inputProps={{ "aria-label": "Description commune", title: "Description commune" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                            <FINotes color="action" />
                          </InputAdornment>
                        ),
                      }}
                      value={commonData.description}
                      onChange={(e) => setCommonData({ ...commonData, description: e.target.value })}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Description commune à toutes les parcelles"
                    />
                  </Grid>
                </Grid>
              </SectionCard>
            )}

            {/* ÉTAPE 2 : Liste des numéros */}
            {currentStep === 1 && (
              <SectionCard title="Numéros des parcelles à créer" color="#0A7C4F" icon="checklist" sx={{ mb: 0 }}>
                <TextField
                  inputProps={{ "aria-label": "Liste des numéros", title: "Liste des numéros" }}
                  value={numeroList}
                  onChange={(e) => setNumeroList(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  placeholder="Ex: A1, A2, A3, B1, B2, C1, C2"
                  helperText={`Saisissez les numéros séparés par des virgules. ${numeroList.split(',').filter(n => n.trim()).length} parcelles seront créées`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Square color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                {numeroList && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Aperçu des parcelles :
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {numeroList.split(',').map((num, i) => num.trim() && (
                        <Chip key={i} label={num.trim()} color="primary" size="small" />
                      ))}
                    </Stack>
                  </Box>
                )}
              </SectionCard>
            )}

            {/* ÉTAPE 3 : Coordonnées & Documents par parcelle */}
            {currentStep === 2 && (
              <SectionCard title="Coordonnées & Documents pour chaque parcelle" color="#0e1133" icon="location" sx={{ mb: 0 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Pour chaque parcelle, vous pouvez ajouter ses coordonnées GPS et documents (tous optionnels). Les photos et vidéos sont déjà intégrées dans l'îlot.
                </Alert>

                <Stack spacing={2}>
                  {parcelles.map((parcelle, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Box 
                          display="flex" 
                          justifyContent="space-between" 
                          alignItems="center"
                          sx={{ cursor: "pointer" }}
                          onClick={() => toggleExpand(index)}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                              <Home />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                Parcelle {parcelle.numeroParcelle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {parcelle.documentFiles?.length || 0} doc(s) • 
                                GPS: {parcelle.localisation.lat && parcelle.localisation.lng ? "Oui" : "Non"}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton>
                            {parcelle.expanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Box>

                        <Collapse in={parcelle.expanded}>
                          <Divider sx={{ my: 2 }} />
                          
                          {/* Coordonnées GPS */}
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                            <LocationOn sx={{ verticalAlign: "middle", mr: 1 }} color="primary" />
                            Coordonnées GPS (optionnel)
                          </Typography>
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                type="number"
                                value={parcelle.localisation.lat}
                                onChange={(e) => updateLocalisation(index, "lat", e.target.value)}
                                fullWidth
                                placeholder="Latitude (ex. 13.5127)"
                                inputProps={{ step: "any", "aria-label": "Latitude", title: "Latitude" }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <FIMyLocation color="action" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                type="number"
                                value={parcelle.localisation.lng}
                                onChange={(e) => updateLocalisation(index, "lng", e.target.value)}
                                fullWidth
                                placeholder="Longitude (ex. 2.1128)"
                                inputProps={{ step: "any", "aria-label": "Longitude", title: "Longitude" }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <FIExplore color="action" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>

                          {/* Documents (optionnel) */}
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            <Description sx={{ verticalAlign: "middle", mr: 1 }} color="primary" />
                            Documents (optionnel)
                          </Typography>
                          
                          <input
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            style={{ display: "none" }}
                            id={`document-upload-${index}`}
                            type="file"
                            multiple
                            onChange={(e) => handleDocumentUpload(index, e)}
                          />
                          <label htmlFor={`document-upload-${index}`}>
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<CloudUpload />}
                              fullWidth
                              size="small"
                              sx={{ mb: 2 }}
                            >
                              Ajouter des documents
                            </Button>
                          </label>

                          {/* Liste des documents */}
                          {parcelle.documentFiles && parcelle.documentFiles.length > 0 && (
                            <Stack spacing={1}>
                              {parcelle.documentFiles.map((file, docIndex) => (
                                <Paper key={docIndex} variant="outlined" sx={{ p: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Description color="action" fontSize="small" />
                                      <Box>
                                        <Typography variant="caption" fontWeight="bold">
                                          {file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          {(file.size / 1024).toFixed(2)} KB
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <IconButton 
                                      size="small" 
                                      color="error" 
                                      onClick={() => removeDocument(index, docIndex)}
                                    >
                                      <Close fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Paper>
                              ))}
                            </Stack>
                          )}
                        </Collapse>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </SectionCard>
            )}

            {/* ÉTAPE 4 : Confirmation */}
            {currentStep === 3 && (
              <SectionCard title="Récapitulatif" color="#3030F9" icon="description" sx={{ mb: 0 }}>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  Vous allez créer <strong>{parcelles.length} parcelles</strong>
                </Alert>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead
                      sx={{
                        "& th": {
                          bgcolor: "#f6f8fb",
                          color: "text.secondary",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          borderBottom: "2px solid #e3e8ef",
                        },
                      }}
                    >
                      <TableRow>
                        <TableCell>Parcelle</TableCell>
                        <TableCell>Superficie</TableCell>
                        <TableCell>Prix</TableCell>
                        <TableCell>GPS</TableCell>
                        <TableCell>Docs</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parcelles.map((p, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip label={p.numeroParcelle} color="primary" size="small" />
                          </TableCell>
                          <TableCell>{p.superficie || commonData.superficie || "-"} m²</TableCell>
                          <TableCell>{p.prix || commonData.prix || "-"} FCFA</TableCell>
                          <TableCell>
                            {p.localisation.lat && p.localisation.lng ? (
                              <Chip icon={<CheckCircle />} label="Oui" color="success" size="small" />
                            ) : (
                              <Chip icon={<Close />} label="Non" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={p.documentFiles?.length || 0} 
                              color={p.documentFiles?.length > 0 ? "success" : "default"}
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SectionCard>
            )}

            {/* Boutons de navigation */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={prevStep}
                disabled={currentStep === 0 || loading}
              >
                Précédent
              </Button>

              <Box display="flex" gap={2}>
                {currentStep === 0 && (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={nextStep}
                    disabled={!commonData.ilot}
                  >
                    Suivant
                  </Button>
                )}
                {currentStep === 1 && (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={generateParcelles}
                    disabled={!numeroList.trim()}
                  >
                    Générer les parcelles
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={nextStep}
                  >
                    Voir le récapitulatif
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? "Création en cours..." : `Créer ${parcelles.length} parcelles`}
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </AgenceLayout>
  );
};

export default CreateParcelleMultiplePage;

