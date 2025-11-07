import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Divider,
  Fade,
} from "@mui/material";
import {
  Home,
  Visibility,
  LocationOn,
  Square,
  AttachMoney,
  CheckCircle,
  Sell,
  Person,
  ArrowBack,
  VideoLibrary,
  Gavel,
  HourglassEmpty,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../../components/shared/PageLayout";
import api from "../../../services/api";

const MesBiensCommercialPage = () => {
  const navigate = useNavigate();
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modal vente
  const [venteDialog, setVenteDialog] = useState(false);
  const [bienToSell, setBienToSell] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [notaires, setNotaires] = useState([]);
  const [selectedNotaire, setSelectedNotaire] = useState("");
  const [prixVente, setPrixVente] = useState("");

  // Modal détails
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedBien, setSelectedBien] = useState(null);

  useEffect(() => {
    fetchBiens();
    fetchClients();
    fetchNotaires();
  }, []);

  const fetchBiens = async () => {
    setLoading(true);
    try {
      const res = await api.get("/commercial/biens/mes-biens");
      console.log("✅ [FRONTEND] Biens affectés:", res.data);
      setBiens(res.data);
    } catch (err) {
      console.error("❌ [FRONTEND] Erreur:", err);
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get("/agence/clients");
      setClients(res.data || []);
    } catch (err) {
      console.error("Erreur chargement clients:", err);
    }
  };

  const fetchNotaires = async () => {
    try {
      const res = await api.get("/agence/notaires/actifs");
      setNotaires(res.data || []);
    } catch (err) {
      console.error("Erreur chargement notaires:", err);
    }
  };

  const openVenteDialog = (bien) => {
    setBienToSell(bien);
    setSelectedClient("");
    setSelectedNotaire("");
    setPrixVente(bien.prix?.toString() || "");
    setVenteDialog(true);
  };

  const handleVendre = async () => {
    if (!selectedClient) {
      setError("Veuillez sélectionner un client");
      return;
    }
    if (!selectedNotaire) {
      setError("Veuillez sélectionner un notaire");
      return;
    }
    if (!prixVente || parseFloat(prixVente) <= 0) {
      setError("Veuillez saisir un prix de vente valide");
      return;
    }

    try {
      const response = await api.put(`/commercial/biens/${bienToSell._id}/vendre`, {
        clientId: selectedClient,
        notaireId: selectedNotaire,
        prixVente: parseFloat(prixVente),
      });
      setSuccess(
        `✅ Vente initiée avec succès ! Le bien est maintenant "En cours de vente". ` +
        `Vous pouvez suivre l'avancement avec le notaire dans la page "Mes Ventes".`
      );
      setVenteDialog(false);
      fetchBiens();
      
      // Optionnel : rediriger vers la page des ventes après quelques secondes
      setTimeout(() => {
        if (window.confirm("Souhaitez-vous voir vos ventes en cours ?")) {
          navigate("/commercial/mes-ventes");
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Erreur lors de la vente");
    }
  };

  const openDetailDialog = async (bien) => {
    try {
      const res = await api.get(`/commercial/biens/${bien._id}`);
      setSelectedBien(res.data);
      setDetailDialog(true);
    } catch (err) {
      setError("Erreur lors du chargement des détails");
    }
  };

  const typesLabels = {
    maison: "Maison",
    villa: "Villa",
    duplex: "Duplex",
    appartement: "Appartement",
    jardin: "Jardin",
    terrain: "Terrain",
    autre: "Autre",
  };

  const statutColors = {
    disponible: "success",
    en_cours_de_vente: "warning",
    vendu: "primary",
    reserve: "warning",
  };

  const statutLabels = {
    disponible: "Disponible",
    en_cours_de_vente: "En cours de vente",
    vendu: "Vendu",
    reserve: "Réservé",
  };

  const biensDisponibles = biens.filter(b => b.statut === "disponible");
  const biensEnCours = biens.filter(b => b.statut === "en_cours_de_vente");
  const biensVendus = biens.filter(b => b.statut === "vendu");

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              🏡 Mes Biens Affectés
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gérez et vendez les biens qui vous sont confiés
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/agence/commercial/dashboard")}
          >
            Retour au dashboard
          </Button>
        </Box>

        {/* Alertes */}
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          </Fade>
        )}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Statistiques rapides */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: "primary.main", color: "white" }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Biens
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {biens.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: "success.main", color: "white" }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Disponibles
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {biensDisponibles.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: "warning.main", color: "white" }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  En cours
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {biensEnCours.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: "info.main", color: "white" }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Vendus
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {biensVendus.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: "primary.dark", color: "white" }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  CA Total
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {(biensVendus.reduce((sum, b) => sum + (b.prix || 0), 0)).toLocaleString()} FCFA
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Liste des biens */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : biens.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Home sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun bien ne vous est affecté
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contactez votre agence pour qu'elle vous affecte des biens
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {biens.map((bien) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={bien._id}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s",
                    "&:hover": { transform: "translateY(-8px)", boxShadow: 6 },
                  }}
                >
                  {/* Image */}
                  <Box position="relative">
                    <CardMedia
                      component="img"
                      height="200"
                      image={bien.images?.[0] || "https://via.placeholder.com/400x200?text=Pas+d'image"}
                      alt={bien.titre}
                    />
                    
                    {/* Badges */}
                    <Box position="absolute" top={8} right={8} display="flex" gap={1} flexDirection="column">
                      {bien.featured && (
                        <Chip label="⭐ Vedette" size="small" color="warning" />
                      )}
                      {bien.urgent && (
                        <Chip label="🔥 Urgent" size="small" color="error" />
                      )}
                    </Box>

                    {/* Statut */}
                    <Chip
                      label={statutLabels[bien.statut]}
                      size="small"
                      color={statutColors[bien.statut]}
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                      }}
                    />
                  </Box>

                  {/* Contenu */}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip label={typesLabels[bien.type]} size="small" sx={{ mb: 1 }} />
                    
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                      {bien.titre}
                    </Typography>

                    <Stack spacing={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {bien.prix.toLocaleString()} FCFA
                        </Typography>
                      </Box>

                      {bien.superficie && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Square fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {bien.superficie} m²
                          </Typography>
                        </Box>
                      )}

                      {bien.localisation?.ville && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {bien.localisation.ville}
                            {bien.localisation.quartier && `, ${bien.localisation.quartier}`}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                    <Tooltip title="Voir détails">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => openDetailDialog(bien)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {bien.statut === "disponible" && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Sell />}
                        onClick={() => openVenteDialog(bien)}
                      >
                        Vendre
                      </Button>
                    )}
                    {bien.statut === "en_cours_de_vente" && (
                      <Tooltip title="Voir le suivi de cette vente">
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          startIcon={<HourglassEmpty />}
                          onClick={() => navigate("/commercial/mes-ventes")}
                        >
                          En cours
                        </Button>
                      </Tooltip>
                    )}
                    {bien.statut === "vendu" && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Vendu"
                        color="primary"
                        size="small"
                      />
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* DIALOG VENTE */}
      <Dialog
        open={venteDialog}
        onClose={() => setVenteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Sell color="success" />
            <Typography variant="h6" fontWeight="bold">
              Vendre le bien
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {bienToSell && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="bold">
                  {bienToSell.titre}
                </Typography>
                <Typography variant="caption">
                  Prix : {bienToSell.prix.toLocaleString()} FCFA
                </Typography>
              </Alert>
              
              <TextField
                select
                label="Sélectionnez le client"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">
                  <em>-- Sélectionnez un client --</em>
                </MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.fullName || "Sans nom"} ({client.phone})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Sélectionnez le notaire"
                value={selectedNotaire}
                onChange={(e) => setSelectedNotaire(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Gavel />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">
                  <em>-- Sélectionnez un notaire --</em>
                </MenuItem>
                {notaires.map((notaire) => (
                  <MenuItem key={notaire._id} value={notaire._id}>
                    {notaire.fullName} - {notaire.cabinetName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Prix de vente (FCFA)"
                type="number"
                value={prixVente}
                onChange={(e) => setPrixVente(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
                helperText={`Prix suggéré: ${bienToSell.prix?.toLocaleString()} FCFA`}
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  📋 Processus de vente :
                </Typography>
                <Box component="ol" sx={{ pl: 2, m: 0 }}>
                  <li>Le bien sera marqué comme "En cours de vente" (pas encore vendu)</li>
                  <li>Le notaire recevra la vente et préparera les documents</li>
                  <li>Une fois les documents prêts, vous devrez signer (vous, le client et l'agence)</li>
                  <li>Après toutes les signatures, l'argent sera transféré à l'agence</li>
                  <li>Le bien sera alors marqué comme "Vendu"</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                  Vous pouvez suivre l'avancement dans la page "Mes Ventes"
                </Typography>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setVenteDialog(false)} variant="outlined">
            Annuler
          </Button>
          <Button
            onClick={handleVendre}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            disabled={!selectedClient || !selectedNotaire || !prixVente}
          >
            Confirmer la vente
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG DÉTAILS */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBien && (
          <>
            <DialogTitle>
              <Typography variant="h5" fontWeight="bold">
                {selectedBien.titre}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip label={typesLabels[selectedBien.type]} color="primary" size="small" />
                <Chip
                  label={statutLabels[selectedBien.statut]}
                  color={statutColors[selectedBien.statut]}
                  size="small"
                />
                {selectedBien.reference && (
                  <Chip label={`Réf: ${selectedBien.reference}`} size="small" variant="outlined" />
                )}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Images */}
                {selectedBien.images?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Photos
                    </Typography>
                    <Box display="flex" gap={1} overflow="auto">
                      {selectedBien.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Image ${idx + 1}`}
                          style={{ height: 150, borderRadius: 8 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Vidéos */}
                {selectedBien.videos?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      <VideoLibrary sx={{ verticalAlign: "middle", mr: 1 }} />
                      Vidéos
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedBien.videos.map((videoUrl, index) => {
                        // Fonction pour convertir les URLs YouTube/Vimeo en URLs d'embed
                        const getVideoEmbedUrl = (url) => {
                          if (!url) return null;
                          
                          // YouTube
                          const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                          const youtubeMatch = url.match(youtubeRegex);
                          if (youtubeMatch) {
                            return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                          }
                          
                          // Vimeo
                          const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
                          const vimeoMatch = url.match(vimeoRegex);
                          if (vimeoMatch) {
                            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                          }
                          
                          return url;
                        };
                        
                        const embedUrl = getVideoEmbedUrl(videoUrl);
                        const isYouTube = embedUrl && embedUrl.includes('youtube.com/embed');
                        const isVimeo = embedUrl && embedUrl.includes('vimeo.com/video');
                        
                        return (
                          <Grid item xs={12} md={6} key={index}>
                            {embedUrl && (isYouTube || isVimeo) ? (
                              <Box
                                component="iframe"
                                src={embedUrl}
                                sx={{
                                  width: "100%",
                                  height: 250,
                                  border: "none",
                                  borderRadius: 2,
                                  display: "block",
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 250,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "primary.main",
                                  color: "white",
                                  borderRadius: 2,
                                  p: 2,
                                }}
                              >
                                <VideoLibrary sx={{ fontSize: 40, mb: 2 }} />
                                <Typography variant="body1" fontWeight="bold" mb={1}>
                                  Vidéo {index + 1}
                                </Typography>
                                <Button
                                  variant="contained"
                                  color="inherit"
                                  href={videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    bgcolor: "white",
                                    color: "primary.main",
                                    "&:hover": {
                                      bgcolor: "grey.100",
                                    },
                                  }}
                                >
                                  Voir la vidéo
                                </Button>
                              </Box>
                            )}
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                )}

                {/* Informations */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prix
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {selectedBien.prix.toLocaleString()} FCFA
                  </Typography>
                </Grid>

                {selectedBien.superficie && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Superficie
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedBien.superficie} m²
                    </Typography>
                  </Grid>
                )}

                {/* Description */}
                {selectedBien.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2">{selectedBien.description}</Typography>
                  </Grid>
                )}

                {/* Localisation */}
                {selectedBien.localisation && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      📍 Localisation
                    </Typography>
                    <Typography variant="body2">
                      {selectedBien.localisation.adresse && `${selectedBien.localisation.adresse}, `}
                      {selectedBien.localisation.quartier && `${selectedBien.localisation.quartier}, `}
                      {selectedBien.localisation.ville}
                    </Typography>
                  </Grid>
                )}

                {/* Client (si vendu) */}
                {selectedBien.statut === "vendu" && selectedBien.vendueA && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      <Typography variant="body2">
                        <strong>Vendu à :</strong> {selectedBien.vendueA.fullName || selectedBien.vendueA.phone}
                      </Typography>
                      {selectedBien.dateVente && (
                        <Typography variant="caption">
                          Date: {new Date(selectedBien.dateVente).toLocaleDateString("fr-FR")}
                        </Typography>
                      )}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setDetailDialog(false)} variant="outlined">
                Fermer
              </Button>
              {selectedBien.statut === "disponible" && (
                <Button
                  onClick={() => {
                    setDetailDialog(false);
                    openVenteDialog(selectedBien);
                  }}
                  variant="contained"
                  color="success"
                  startIcon={<Sell />}
                >
                  Vendre ce bien
                </Button>
              )}
              {selectedBien.statut === "en_cours_de_vente" && (
                <Button
                  onClick={() => {
                    setDetailDialog(false);
                    navigate("/commercial/mes-ventes");
                  }}
                  variant="outlined"
                  color="warning"
                  startIcon={<HourglassEmpty />}
                >
                  Voir le suivi de cette vente
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </PageLayout>
  );
};

export default MesBiensCommercialPage;

