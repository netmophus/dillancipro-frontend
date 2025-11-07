import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  Chip,
  MenuItem,
  Avatar,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  InputAdornment,
  Fade,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Home,
  Euro,
  Badge as BadgeIcon,
  CloudUpload,
  CheckCircle,
  Phone,
  Search,
  LocationCity,
  Visibility,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../../components/shared/PageLayout";
import api from "../../../services/api";

const CommercialProfilPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Recherche
  const [phoneSearch, setPhoneSearch] = useState("");
  const [commercialLoaded, setCommercialLoaded] = useState(false);
  const [commercialId, setCommercialId] = useState(id || "");

  // Données du commercial
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [adresse, setAdresse] = useState({
    ligne1: "",
    ligne2: "",
    ville: "",
    region: "",
    codePostal: "",
    pays: "",
  });

  // Commission
  const [commission, setCommission] = useState({
    mode: "pourcentage",
    valeur: 0,
    devise: "XOF",
    actif: true,
  });

  // Photo
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // Pièce d'identité
  const [pieceIdentite, setPieceIdentite] = useState({
    typePiece: "AUTRE",
    numero: "",
    dateDelivrance: "",
    dateExpiration: "",
    fichierUrl: "",
  });
  const [pieceFile, setPieceFile] = useState(null);

  // Si un ID est fourni dans l'URL, charger directement
  useEffect(() => {
    if (id) {
      loadCommercialById(id);
    }
  }, [id]);

  // Rechercher et charger le commercial par téléphone
  const searchByPhone = async () => {
    if (!phoneSearch.trim()) {
      setError("Veuillez saisir un numéro de téléphone");
      return;
    }

    setSearching(true);
    setError("");

    try {
      // Récupérer tous les commerciaux
      const res = await api.get("/agence/commerciaux");
      const found = res.data.find((c) => c.phone === phoneSearch.trim());

      if (found) {
        // Commercial trouvé → charger ses infos
        await loadCommercialById(found._id);
        setSuccess(`✅ Commercial trouvé : ${found.fullName || found.phone}`);
      } else {
        setError("❌ Aucun commercial trouvé avec ce numéro");
      }
    } catch (err) {
      setError("Erreur lors de la recherche");
    } finally {
      setSearching(false);
    }
  };

  // Charger toutes les infos du commercial + profil
  const loadCommercialById = async (userId) => {
    try {
      // 1) Récupérer les infos de base du User (phone, fullName)
      const userRes = await api.get("/agence/commerciaux");
      const user = userRes.data.find((c) => c._id === userId);

      if (user) {
        setPhone(user.phone || "");
        setFullName(user.fullName || "");
        setCommercialId(userId);
      }

      // 2) Récupérer le profil (peut ne pas exister encore)
      try {
        const profilRes = await api.get(`/agence/commerciaux/${userId}/profil`);
        const p = profilRes.data || {};

        // Mettre à jour avec les données du profil
        if (p.fullName) setFullName(p.fullName);

        setAdresse({
          ligne1: p.adresse?.ligne1 || "",
          ligne2: p.adresse?.ligne2 || "",
          ville: p.adresse?.ville || "",
          region: p.adresse?.region || "",
          codePostal: p.adresse?.codePostal || "",
          pays: p.adresse?.pays || "",
        });

        setCommission({
          mode: p.commission?.mode || "pourcentage",
          valeur: typeof p.commission?.valeur === "number" ? p.commission.valeur : 0,
          devise: p.commission?.devise || "XOF",
          actif: typeof p.commission?.actif === "boolean" ? p.commission.actif : true,
        });

        setPhotoUrl(p.photoUrl || "");
        setPhotoPreview(p.photoUrl || "");

        setPieceIdentite({
          typePiece: p.pieceIdentite?.typePiece || "AUTRE",
          numero: p.pieceIdentite?.numero || "",
          dateDelivrance: p.pieceIdentite?.dateDelivrance
            ? p.pieceIdentite.dateDelivrance.substring(0, 10)
            : "",
          dateExpiration: p.pieceIdentite?.dateExpiration
            ? p.pieceIdentite.dateExpiration.substring(0, 10)
            : "",
          fichierUrl: p.pieceIdentite?.fichierUrl || "",
        });
      } catch (e) {
        // Profil pas encore créé, c'est normal
        if (e.response?.status !== 404) {
          console.error("Erreur chargement profil:", e);
        }
      }

      setCommercialLoaded(true);
    } catch (err) {
      setError("Erreur lors du chargement du commercial");
    }
  };

  const handleAdresseChange = (field, value) => {
    setAdresse((prev) => ({ ...prev, [field]: value }));
  };

  const handlePieceChange = (field, value) => {
    setPieceIdentite((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePieceFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPieceFile(file);
    }
  };

  const handleSave = async () => {
    if (!commercialId) {
      setError("Aucun commercial sélectionné");
      return;
    }

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      // 1) Upsert profil de base + commission
      await api.put(`/agence/commerciaux/${commercialId}/profil`, {
        fullName,
        adresse,
        commission,
      });

      // 2) Upload photo si modifiée
      if (photoFile) {
        const fdPhoto = new FormData();
        fdPhoto.append("photo", photoFile);
        await api.patch(`/agence/commerciaux/${commercialId}/profil/photo`, fdPhoto);
      }

      // 3) Upload/maj pièce d'identité
      const fdPiece = new FormData();
      fdPiece.append("typePiece", pieceIdentite.typePiece);
      fdPiece.append("numero", pieceIdentite.numero);
      if (pieceIdentite.dateDelivrance)
        fdPiece.append("dateDelivrance", pieceIdentite.dateDelivrance);
      if (pieceIdentite.dateExpiration)
        fdPiece.append("dateExpiration", pieceIdentite.dateExpiration);
      if (pieceFile) fdPiece.append("pieceFichier", pieceFile);
      await api.patch(`/agence/commerciaux/${commercialId}/profil/piece`, fdPiece);

      setSuccess("✅ Profil enregistré avec succès !");
      
      // Recharger pour voir les nouvelles infos
      await loadCommercialById(commercialId);
      setPhotoFile(null);
      setPieceFile(null);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "❌ Erreur lors de l'enregistrement du profil"
      );
    } finally {
      setSaving(false);
    }
  };

  const pieceTypes = [
    { value: "CNI", label: "Carte Nationale d'Identité" },
    { value: "PASSPORT", label: "Passeport" },
    { value: "PERMIS", label: "Permis de conduire" },
    { value: "AUTRE", label: "Autre" },
  ];

  const pieceIsExpired = useMemo(() => {
    if (!pieceIdentite.dateExpiration) return null;
    const exp = new Date(pieceIdentite.dateExpiration);
    return exp < new Date();
  }, [pieceIdentite.dateExpiration]);

  // Si pas encore de commercial chargé (et pas d'ID dans l'URL)
  if (!id && !commercialLoaded) {
    return (
      <PageLayout>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/agence/enroller-commercial")}
              sx={{ mb: 2 }}
            >
              Retour à la liste
            </Button>

            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
                <Search fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Remplir le Profil Commercial
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recherchez le commercial par son numéro de téléphone
                </Typography>
              </Box>
            </Box>
          </Box>

          {error && (
            <Fade in={!!error}>
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                {error}
              </Alert>
            </Fade>
          )}

          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
                <Typography variant="h6" gutterBottom>
                  🔍 Recherche du commercial
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={4}>
                  Saisissez le numéro de téléphone du commercial enrôlé
                </Typography>

                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} md={7}>
                    <TextField
                      label="Numéro de téléphone"
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      fullWidth
                      autoFocus
                      placeholder="+22790123456"
                      size="large"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") searchByPhone();
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md="auto">
                    <Button
                      variant="contained"
                      size="large"
                      onClick={searchByPhone}
                      disabled={searching || !phoneSearch.trim()}
                      startIcon={
                        searching ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Search />
                        )
                      }
                      sx={{ height: "100%", px: 4 }}
                    >
                      {searching ? "Recherche..." : "Rechercher"}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </CardContent>
          </Card>
        </Container>
      </PageLayout>
    );
  }

  // Commercial chargé → Afficher le formulaire complet
  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/agence/enroller-commercial")}
            sx={{ mb: 2 }}
          >
            Retour à la liste
          </Button>

          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={photoPreview || photoUrl}
              sx={{ bgcolor: "primary.main", width: 80, height: 80 }}
            >
              {(fullName || "U").charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Profil de {fullName || "Commercial"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📞 {phone} • Complétez les informations manquantes
              </Typography>
            </Box>
          </Box>
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

        <Grid container spacing={3}>
          {/* SECTION 1 : Identité & Photo */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  <Person sx={{ verticalAlign: "middle", mr: 1 }} />
                  Identité & Photo
                </Typography>

                <Grid container spacing={3}>
                  {/* Photo */}
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Avatar
                        src={photoPreview || photoUrl}
                        sx={{ width: 150, height: 150, margin: "0 auto", mb: 2 }}
                      >
                        {(fullName || "U").charAt(0).toUpperCase()}
                      </Avatar>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="photo-upload"
                        type="file"
                        onChange={handlePhotoChange}
                      />
                      <label htmlFor="photo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          fullWidth
                        >
                          Changer la photo
                        </Button>
                      </label>
                      {photoFile && (
                        <Chip
                          label="✓ Photo sélectionnée"
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Informations */}
                  <Grid item xs={12} md={9}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Téléphone (identifiant)"
                          value={phone}
                          fullWidth
                          disabled
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="action" />
                              </InputAdornment>
                            ),
                          }}
                          helperText="Numéro saisi lors de l'enrôlement"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Nom complet"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                          helperText="Nom saisi lors de l'enrôlement (modifiable)"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* SECTION 2 : Adresse */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  <Home sx={{ verticalAlign: "middle", mr: 1 }} />
                  Adresse
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Adresse ligne 1"
                      value={adresse.ligne1}
                      onChange={(e) => handleAdresseChange("ligne1", e.target.value)}
                      fullWidth
                      placeholder="Rue, numéro..."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Adresse ligne 2"
                      value={adresse.ligne2}
                      onChange={(e) => handleAdresseChange("ligne2", e.target.value)}
                      fullWidth
                      placeholder="Complément d'adresse"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Ville"
                      value={adresse.ville}
                      onChange={(e) => handleAdresseChange("ville", e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationCity color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Région"
                      value={adresse.region}
                      onChange={(e) => handleAdresseChange("region", e.target.value)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Code postal"
                      value={adresse.codePostal}
                      onChange={(e) => handleAdresseChange("codePostal", e.target.value)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Pays"
                      value={adresse.pays}
                      onChange={(e) => handleAdresseChange("pays", e.target.value)}
                      fullWidth
                      placeholder="Burkina Faso"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* SECTION 3 : Commission */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  <Euro sx={{ verticalAlign: "middle", mr: 1 }} />
                  Commission
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Mode de commission"
                      value={commission.mode}
                      onChange={(e) =>
                        setCommission((c) => ({ ...c, mode: e.target.value }))
                      }
                      fullWidth
                    >
                      <MenuItem value="pourcentage">Pourcentage sur ventes</MenuItem>
                      <MenuItem value="fixe">Montant fixe par vente</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={commission.mode === "fixe" ? 8 : 12}>
                    <TextField
                      type="number"
                      label={commission.mode === "fixe" ? "Montant par vente" : "Pourcentage"}
                      value={commission.valeur}
                      onChange={(e) =>
                        setCommission((c) => ({ ...c, valeur: Number(e.target.value) }))
                      }
                      fullWidth
                      inputProps={{
                        min: 0,
                        max: commission.mode === "pourcentage" ? 100 : undefined,
                        step: 0.01,
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {commission.mode === "pourcentage" ? "%" : commission.devise}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {commission.mode === "fixe" && (
                    <Grid item xs={12} md={4}>
                      <TextField
                        select
                        label="Devise"
                        value={commission.devise}
                        onChange={(e) =>
                          setCommission((c) => ({ ...c, devise: e.target.value }))
                        }
                        fullWidth
                      >
                        <MenuItem value="XOF">XOF</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                        <MenuItem value="USD">USD</MenuItem>
                      </TextField>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={commission.actif}
                          onChange={(e) =>
                            setCommission((c) => ({ ...c, actif: e.target.checked }))
                          }
                          color="success"
                        />
                      }
                      label="Commission active"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" icon={<Euro />}>
                      {commission.mode === "pourcentage" ? (
                        <>
                          Commission : <strong>{commission.valeur}%</strong> du prix de vente
                          <br />
                          Ex: 1M FCFA → {(1000000 * commission.valeur / 100).toLocaleString()} FCFA
                        </>
                      ) : (
                        <>
                          Commission : <strong>{commission.valeur.toLocaleString()} {commission.devise}</strong> par vente
                        </>
                      )}
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* SECTION 4 : Pièce d'identité */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                  <BadgeIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                  Pièce d'identité
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Type de pièce"
                      value={pieceIdentite.typePiece}
                      onChange={(e) => handlePieceChange("typePiece", e.target.value)}
                      fullWidth
                    >
                      {pieceTypes.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Numéro"
                      value={pieceIdentite.numero}
                      onChange={(e) => handlePieceChange("numero", e.target.value)}
                      fullWidth
                      placeholder="CI123456789"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      type="date"
                      label="Date de délivrance"
                      value={pieceIdentite.dateDelivrance}
                      onChange={(e) => handlePieceChange("dateDelivrance", e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      type="date"
                      label="Date d'expiration"
                      value={pieceIdentite.dateExpiration}
                      onChange={(e) => handlePieceChange("dateExpiration", e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={pieceIsExpired === true}
                      helperText={
                        pieceIsExpired !== null
                          ? pieceIsExpired
                            ? "⚠️ Expirée"
                            : "✓ Valide"
                          : ""
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        📄 Fichier de la pièce
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <input
                          accept="image/*,application/pdf"
                          style={{ display: "none" }}
                          id="piece-upload"
                          type="file"
                          onChange={handlePieceFileChange}
                        />
                        <label htmlFor="piece-upload">
                          <Button variant="outlined" component="span" size="small" startIcon={<CloudUpload />}>
                            Uploader
                          </Button>
                        </label>

                        {pieceFile && (
                          <Chip label={pieceFile.name} color="success" size="small" />
                        )}

                        {pieceIdentite.fichierUrl && !pieceFile && (
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            href={pieceIdentite.fichierUrl}
                            target="_blank"
                          >
                            Voir
                          </Button>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bouton Enregistrer */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button variant="outlined" onClick={() => navigate("/agence/enroller-commercial")}>
            Annuler
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />
            }
            sx={{ minWidth: 200, py: 1.5, fontWeight: "bold" }}
          >
            {saving ? "Enregistrement..." : "Enregistrer le profil"}
          </Button>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default CommercialProfilPage;
