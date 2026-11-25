import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  GridLegacy as Grid,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  LinearProgress,
  Stack,
  Paper,
  Tooltip,
  CircularProgress,
  Badge,
} from "@mui/material";
import {
  Person,
  Email,
  LocationOn,
  Work,
  Phone,
  Edit,
  Save,
  Cancel,
  CameraAlt,
  CheckCircle,
  VerifiedUser,
} from "@mui/icons-material";
import PageLayout from "../../components/shared/PageLayout";
import SectionCard from "../../components/admin/SectionCard";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const ProfilePage = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    region: "",
    ville: "",
    fonction: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/profile");
      // S'assurer que tous les champs sont des strings (pas undefined)
      setProfile({
        fullName: res.data?.fullName || "",
        email: res.data?.email || "",
        region: res.data?.region || "",
        ville: res.data?.ville || "",
        fonction: res.data?.fonction || "",
        photoUrl: res.data?.photoUrl || "",
      });
      setPhotoPreview(res.data?.photoUrl || null); // Charger la photo existante
      setIsEditing(true);
    } catch (err) {
      console.error("Erreur chargement profil:", err);
      setIsEditing(false); // Pas encore de profil
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation de la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("❌ La photo ne doit pas dépasser 5MB");
        return;
      }

      // Validation du type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("❌ Format non supporté. Utilisez JPG, PNG ou WEBP");
        return;
      }

      setPhotoFile(file);
      
      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setError(""); // Clear error
    }
  };

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      
      // Ajouter les données du profil
      Object.keys(profile).forEach((key) => {
        if (profile[key]) {
          formData.append(key, profile[key]);
        }
      });

      // Ajouter la photo si une nouvelle photo est sélectionnée
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      if (isEditing) {
        await api.put("/user/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("✅ Profil mis à jour avec succès !");
      } else {
        await api.post("/user/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("✅ Profil créé avec succès !");
        setIsEditing(true);
      }
      
      setEditMode(false);
      setPhotoFile(null); // Reset le fichier photo
      fetchProfile(); // Recharger le profil avec la nouvelle photo
    } catch (err) {
      console.error("Erreur de profil :", err);
      setError(err.response?.data?.message || "❌ Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchProfile(); // Recharger les données originales
  };

  // Calculer le taux de complétion du profil
  const calculateCompletion = () => {
    const fields = ["fullName", "email", "region", "ville", "fonction"];
    const completed = fields.filter(field => profile[field] && profile[field].trim()).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionRate = calculateCompletion();

  if (loading) {
    return (
      <PageLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} />
          </Box>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* En-tête avec avatar */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            bgcolor: "#3030F9",
            color: "white",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={3}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="photo-upload"
                  type="file"
                  onChange={handlePhotoChange}
                  disabled={!editMode}
                />
                <label htmlFor="photo-upload">
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      editMode && (
                        <Tooltip title="Changer la photo">
                          <IconButton
                            component="span"
                            size="small"
                            sx={{
                              bgcolor: "white",
                              color: "primary.main",
                              "&:hover": { bgcolor: "grey.200" },
                            }}
                          >
                            <CameraAlt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <Avatar
                      src={photoPreview}
                      sx={{
                        width: 100,
                        height: 100,
                        border: "4px solid white",
                        bgcolor: "white",
                        color: "primary.main",
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        cursor: editMode ? "pointer" : "default",
                      }}
                    >
                      {!photoPreview && (profile.fullName || user?.fullName || "U").charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </label>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {profile.fullName || user?.fullName || "Utilisateur"}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      icon={<Phone />}
                      label={user?.phone}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                    <Chip
                      icon={<VerifiedUser />}
                      label={user?.role}
                      size="small"
                      sx={{ bgcolor: "#0A7C4F", color: "white", "& .MuiChip-icon": { color: "white" } }}
                    />
                  </Stack>
                  {editMode && photoFile && (
                    <Chip
                      label="Nouvelle photo sélectionnée"
                      size="small"
                      icon={<CheckCircle />}
                      sx={{ mt: 1, bgcolor: "#0A7C4F", color: "white", "& .MuiChip-icon": { color: "white" } }}
                    />
                  )}
                </Box>
              </Box>

              {!editMode && (
                <Button
                  variant="contained"
                  color="inherit"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                >
                  Modifier
                </Button>
              )}
            </Box>

            {/* Barre de complétion du profil */}
            <Box sx={{ mt: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="bold">
                  Complétion du profil
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {completionRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    backgroundColor: "#0A7C4F",
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Formulaire de profil */}
        <SectionCard
          title={isEditing ? "Informations personnelles" : "Créer votre profil"}
          color="#3030F9"
          icon="person"
          sx={{ mb: 0, "& legend": { display: "none" } }}
          action={
            !isEditing && (
              <Chip
                label="Nouveau profil"
                color="primary"
                icon={<Person />}
              />
            )
          }
        >
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Nom complet */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    inputProps={{ "aria-label": "Nom complet", title: "Nom complet" }}
                    placeholder="Nom complet *"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    disabled={!editMode}
                    required
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: "action.active" }} />,
                      endAdornment: profile.fullName && (
                        <CheckCircle sx={{ color: "success.main" }} />
                      ),
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    inputProps={{ "aria-label": "Email", title: "Email" }}
                    placeholder="Email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: "action.active" }} />,
                      endAdornment: profile.email && (
                        <CheckCircle sx={{ color: "success.main" }} />
                      ),
                    }}
                    helperText="Votre adresse email pour les notifications"
                  />
                </Grid>

                {/* Région et Ville */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    inputProps={{ "aria-label": "Région", title: "Région" }}
                    placeholder="Région"
                    name="region"
                    value={profile.region}
                    onChange={handleChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: "action.active" }} />,
                      endAdornment: profile.region && (
                        <CheckCircle sx={{ color: "success.main" }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    inputProps={{ "aria-label": "Ville", title: "Ville" }}
                    placeholder="Ville"
                    name="ville"
                    value={profile.ville}
                    onChange={handleChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: "action.active" }} />,
                      endAdornment: profile.ville && (
                        <CheckCircle sx={{ color: "success.main" }} />
                      ),
                    }}
                  />
                </Grid>

                {/* Fonction */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    inputProps={{ "aria-label": "Fonction / Profession", title: "Fonction / Profession" }}
                    placeholder="Fonction / Profession"
                    name="fonction"
                    value={profile.fonction}
                    onChange={handleChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Work sx={{ mr: 1, color: "action.active" }} />,
                      endAdornment: profile.fonction && (
                        <CheckCircle sx={{ color: "success.main" }} />
                      ),
                    }}
                    helperText="Votre fonction ou profession actuelle"
                  />
                </Grid>
              </Grid>

              {/* Boutons d'action */}
              {editMode && (
                <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    disabled={saving}
                  >
                    {saving ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer mon profil"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                </Box>
              )}
            </Box>
        </SectionCard>

        {/* Informations supplémentaires */}
        {isEditing && !editMode && (
          <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 4, bgcolor: "rgba(48,48,249,0.07)", border: "1.5px solid rgba(48,48,249,0.3)" }}>
            <Typography variant="body2" sx={{ color: "#0e1133" }}>
              <strong>Astuce :</strong> Gardez votre profil à jour pour une meilleure expérience. 
              Un profil complet facilite la communication et les transactions.
            </Typography>
          </Paper>
        )}

        {/* Snackbar pour les messages */}
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" onClose={() => setSuccess("")} sx={{ width: "100%" }}>
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error" onClose={() => setError("")} sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </PageLayout>
  );
};

export default ProfilePage;
