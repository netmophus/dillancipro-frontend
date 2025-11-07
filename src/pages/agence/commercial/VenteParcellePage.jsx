
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Alert,
  Paper,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from "@mui/material";
import {
  AttachMoney,
  Person,
  Home,
  Map,
  Receipt,
  CheckCircle,
  Warning,
  Info,
  Phone,
  AccountBalance,
  TrendingUp,
  Schedule,
  LocationOn,
  PhotoCamera,
  Upload,
  Close,
  Refresh,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import PageLayout from "../../../components/shared/PageLayout";
import { useAuth } from "../../../contexts/AuthContext";

const VenteParcellePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { parcelleId: urlParcelleId } = useParams();

  // États principaux
  const [clientPhone, setClientPhone] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [ilotId, setIlotId] = useState("");
  const [parcelleId, setParcelleId] = useState(urlParcelleId || "");
  const [ilots, setIlots] = useState([]);
  const [parcelles, setParcelles] = useState([]);
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [typePaiement, setTypePaiement] = useState("total");
  const [montant, setMontant] = useState("");
  const [recu, setRecu] = useState(null);
  const [recuPreview, setRecuPreview] = useState(null);
  
  // États UI
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [clientSearching, setClientSearching] = useState(false);
  const [clientFound, setClientFound] = useState(false);
  const [showParcelleDetails, setShowParcelleDetails] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Étapes du processus
  const steps = [
    "Informations client",
    "Sélection parcelle", 
    "Paiement",
    "Confirmation"
  ];

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 [VENTE_PARCELLE] Début chargement des données");
        console.log("🔄 [VENTE_PARCELLE] User:", user);
        console.log("🔄 [VENTE_PARCELLE] URL Parcelle ID:", urlParcelleId);
        
        // Vérifier l'authentification
        if (!user) {
          console.error("❌ [VENTE_PARCELLE] Utilisateur non connecté");
          setError("Vous devez être connecté pour accéder à cette page");
          navigate("/login");
          return;
        }

        // Charger les îlots
        console.log("🔄 [VENTE_PARCELLE] Chargement des îlots...");
        const ilotsRes = await api.get("/agence/ilots");
        console.log("✅ [VENTE_PARCELLE] Îlots chargés:", ilotsRes.data.length);
        setIlots(ilotsRes.data);

        // Si une parcelle est spécifiée dans l'URL, la charger mais rester à l'étape 0 pour sélectionner le client
        if (urlParcelleId) {
          console.log("🔄 [VENTE_PARCELLE] Chargement de la parcelle:", urlParcelleId);
          const parcelleRes = await api.get(`/agence/parcelles/parcelle/${urlParcelleId}`);
          console.log("✅ [VENTE_PARCELLE] Parcelle chargée:", parcelleRes.data);
          const parcelle = parcelleRes.data;
          setSelectedParcelle(parcelle);
          setParcelleId(parcelle._id);
          setIlotId(parcelle.ilot._id);
          // Garder à l'étape 0 pour permettre la sélection du client
          setActiveStep(0);
        }
        
        console.log("✅ [VENTE_PARCELLE] Chargement terminé avec succès");
        setInitialLoading(false);
      } catch (err) {
        console.error("❌ [VENTE_PARCELLE] Erreur lors du chargement:", err);
        console.error("❌ [VENTE_PARCELLE] Détails erreur:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        
        if (err.response?.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.");
          navigate("/login");
        } else if (err.response?.status === 403) {
          setError("Accès refusé. Vous n'avez pas les permissions nécessaires.");
        } else {
          setError(`Erreur lors du chargement des données: ${err.message}`);
        }
        setInitialLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    } else {
      setInitialLoading(false);
    }
  }, [urlParcelleId, user, navigate]);

  // Recherche de client par téléphone
  const handlePhoneBlur = async () => {
    if (!clientPhone || clientPhone.length < 8) return;
    
    setClientSearching(true);
    setError("");
    
    try {
      const res = await api.get(`/auth/client/by-phone/${clientPhone}`);
      console.log("📧 [CLIENT_RECHERCHÉ] Données client:", res.data);
      
      // Récupérer l'email s'il existe
      const email = res.data.email || res.data.userProfile?.email || "";
      
      setClientName(res.data.fullName || res.data.nom || "");
      setClientEmail(email);
      setClientFound(true);
      
      // Message de succès avec indication de l'email
      if (email) {
        setSuccess(`✅ Client trouvé ! Email: ${email}`);
      } else {
        setSuccess("✅ Client trouvé !");
      }
    } catch (err) {
      console.error("❌ [CLIENT_INTROUVABLE] Erreur:", err);
      setClientName("");
      setClientEmail("");
      setClientFound(false);
      setError("Client introuvable. Vérifiez le numéro ou créez un nouveau client.");
    } finally {
      setClientSearching(false);
    }
  };

  // Charger les parcelles d'un îlot
  const handleIlotChange = async (e) => {
    const id = e.target.value;
    setIlotId(id);
    setParcelleId("");
    setSelectedParcelle(null);
    
    try {
      const res = await api.get(`/agence/commerciaux/ilots/${id}/parcelles-disponibles`);
      setParcelles(res.data);
    } catch {
      setParcelles([]);
      setError("Erreur lors du chargement des parcelles");
    }
  };

  // Sélection d'une parcelle
  const handleParcelleSelect = (parcelle) => {
    setSelectedParcelle(parcelle);
    setParcelleId(parcelle._id);
    setMontant(parcelle.prix?.toString() || "");
  };

  // Gestion du fichier reçu
  const handleRecuChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRecu(file);
      const reader = new FileReader();
      reader.onload = (e) => setRecuPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Navigation entre étapes
  const handleNext = () => {
    if (activeStep === 0 && (!clientPhone || !clientName)) {
      setError("Veuillez saisir le téléphone et le nom du client");
      return;
    }
    if (activeStep === 1 && !selectedParcelle) {
      setError("Veuillez sélectionner une parcelle");
      return;
    }
    if (activeStep === 2 && (!montant || !typePaiement)) {
      setError("Veuillez saisir le montant et le type de paiement");
      return;
    }
    setActiveStep((prev) => prev + 1);
    setError("");
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  // Soumission finale
  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("telephone", clientPhone);
      formData.append("nom", clientName);
      formData.append("email", clientEmail);
      formData.append("ilot", ilotId);
      formData.append("parcelle", parcelleId);
      formData.append("typePaiement", typePaiement);
      formData.append("montant", montant);
      if (recu) formData.append("recu", recu);

      await api.post(`/agence/paiements/vendre/${parcelleId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("✅ Vente enregistrée avec succès !");
      setTimeout(() => navigate("/commercial/parcelles-vendues"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  // Écran de chargement initial
  if (initialLoading) {
    return (
      <PageLayout>
        <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
          <Box sx={{ mt: 8 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Chargement des données...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Veuillez patienter pendant que nous récupérons les informations nécessaires.
            </Typography>
          </Box>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏡 Vente de Parcelle
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Processus de vente simplifié et sécurisé
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Messages */}
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

        {/* Contenu des étapes */}
        <Grid container spacing={4}>
          {/* Étape 1: Informations client */}
          {activeStep === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <Person />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Informations du client
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Téléphone du client"
                        fullWidth
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        onBlur={handlePhoneBlur}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                        helperText="Le système recherchera automatiquement le client"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Nom complet"
                        fullWidth
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Email (optionnel)"
                        fullWidth
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        type="email"
                        disabled={clientFound && clientEmail !== ""}
                        helperText={
                          clientFound && clientEmail
                            ? "Email trouvé automatiquement pour ce client"
                            : clientFound && !clientEmail
                            ? "Aucun email enregistré pour ce client"
                            : ""
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              📧
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {clientSearching && (
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <CircularProgress size={20} />
                          <Typography variant="body2">Recherche du client...</Typography>
                        </Box>
                      </Grid>
                    )}

                    {clientFound && (
                      <Grid item xs={12}>
                        <Alert severity="success" icon={<CheckCircle />}>
                          Client trouvé dans la base de données
                        </Alert>
                      </Grid>
                    )}

                    {/* Afficher la parcelle pré-sélectionnée si arrivée depuis l'URL */}
                    {selectedParcelle && urlParcelleId && (
                      <Grid item xs={12}>
                        <Alert severity="info" icon={<Info />}>
                          <Typography variant="body2" gutterBottom>
                            <strong>ℹ️ Parcelle pré-sélectionnée:</strong> {selectedParcelle.numeroParcelle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Vous pourrez confirmer cette sélection à l'étape suivante après avoir renseigné les informations client.
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Étape 2: Sélection parcelle */}
          {activeStep === 1 && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <Home />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Sélection de la parcelle
                    </Typography>
                  </Box>

                  {/* Alerte si parcelle déjà sélectionnée */}
                  {selectedParcelle && (
                    <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        <strong>✅ Parcelle déjà sélectionnée:</strong> {selectedParcelle.numeroParcelle} - {selectedParcelle.superficie} m²
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vous pouvez continuer à l'étape de paiement ou sélectionner une autre parcelle ci-dessous.
                      </Typography>
                    </Alert>
                  )}

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        label="Îlot"
                        fullWidth
                        required
                        value={ilotId}
                        onChange={handleIlotChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Map />
                            </InputAdornment>
                          ),
                        }}
                      >
                        {ilots.map((ilot) => (
                          <MenuItem key={ilot._id} value={ilot._id}>
                            {ilot.numeroIlot}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {selectedParcelle && (
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ bgcolor: "success.light", p: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            📍 Parcelle sélectionnée
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Numéro: <strong>{selectedParcelle.numeroParcelle}</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Superficie: <strong>{selectedParcelle.superficie} m²</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Prix: <strong>{selectedParcelle.prix?.toLocaleString()} FCFA</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Chip
                                label={selectedParcelle.statut}
                                color="success"
                                size="small"
                              />
                            </Grid>
                          </Grid>
                        </Card>
                      </Grid>
                    )}

                    {parcelles.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Parcelles disponibles ({parcelles.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {parcelles.map((parcelle) => (
                            <Grid item xs={12} sm={6} md={4} key={parcelle._id}>
                              <Card
                                sx={{
                                  cursor: "pointer",
                                  border: selectedParcelle?._id === parcelle._id ? 2 : 1,
                                  borderColor: selectedParcelle?._id === parcelle._id ? "primary.main" : "divider",
                                  "&:hover": { borderColor: "primary.main" },
                                }}
                                onClick={() => handleParcelleSelect(parcelle)}
                              >
                                <CardContent sx={{ p: 2 }}>
                                  <Typography variant="h6" gutterBottom>
                                    {parcelle.numeroParcelle}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {parcelle.superficie} m²
                                  </Typography>
                                  <Typography variant="h6" color="primary">
                                    {parcelle.prix?.toLocaleString()} FCFA
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Étape 3: Paiement */}
          {activeStep === 2 && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: "warning.main" }}>
                      <AttachMoney />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Informations de paiement
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormLabel component="legend">Type de paiement</FormLabel>
                      <RadioGroup
                        row
                        value={typePaiement}
                        onChange={(e) => setTypePaiement(e.target.value)}
                        sx={{ mt: 1 }}
                      >
                        <FormControlLabel
                          value="total"
                          control={<Radio />}
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              <CheckCircle color="success" />
                              <Typography>Paiement total</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="partiel"
                          control={<Radio />}
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Schedule color="warning" />
                              <Typography>Paiement partiel</Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Montant payé"
                        type="number"
                        fullWidth
                        required
                        value={montant}
                        onChange={(e) => setMontant(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                        }}
                        helperText={
                          selectedParcelle
                            ? `Prix de la parcelle: ${selectedParcelle.prix?.toLocaleString()} FCFA`
                            : ""
                        }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<Upload />}
                        sx={{ py: 2 }}
                      >
                        📎 Joindre le reçu signé
                        <input
                          type="file"
                          hidden
                          accept="image/*,application/pdf"
                          onChange={handleRecuChange}
                        />
                      </Button>

                      {recu && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="success.main">
                            ✅ Fichier sélectionné: {recu.name}
                          </Typography>
                          {recuPreview && (
                            <Box sx={{ mt: 1 }}>
                              <img
                                src={recuPreview}
                                alt="Aperçu du reçu"
                                style={{ maxWidth: "200px", maxHeight: "200px" }}
                              />
                            </Box>
                          )}
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Étape 4: Confirmation */}
          {activeStep === 3 && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: "info.main" }}>
                      <CheckCircle />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Confirmation de la vente
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          👤 Informations client
                        </Typography>
                        <Typography variant="body2">
                          <strong>Nom:</strong> {clientName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Téléphone:</strong> {clientPhone}
                        </Typography>
                        {clientEmail && (
                          <Typography variant="body2">
                            <strong>Email:</strong> {clientEmail}
                          </Typography>
                        )}
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          🏡 Parcelle
                        </Typography>
                        <Typography variant="body2">
                          <strong>Numéro:</strong> {selectedParcelle?.numeroParcelle}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Superficie:</strong> {selectedParcelle?.superficie} m²
                        </Typography>
                        <Typography variant="body2">
                          <strong>Prix:</strong> {selectedParcelle?.prix?.toLocaleString()} FCFA
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          💰 Paiement
                        </Typography>
                        <Typography variant="body2">
                          <strong>Type:</strong> {typePaiement === "total" ? "Paiement total" : "Paiement partiel"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Montant:</strong> {parseInt(montant).toLocaleString()} FCFA
                        </Typography>
                        {recu && (
                          <Typography variant="body2" color="success.main">
                            ✅ Reçu joint: {recu.name}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Navigation */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<Close />}
          >
            Retour
          </Button>

          {activeStep < 3 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<CheckCircle />}
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
              color="success"
            >
              {loading ? "Enregistrement..." : "Finaliser la vente"}
            </Button>
          )}
        </Box>
      </Container>
    </PageLayout>
  );
};

export default VenteParcellePage;
