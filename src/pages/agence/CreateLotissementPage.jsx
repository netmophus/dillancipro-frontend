import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
  CircularProgress,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Apartment,
  Search,
  CloudUpload,
  VideoLibrary,
  Close,
  PhotoCamera,
  Landscape,
  Square,
  MyLocation,
} from "@mui/icons-material";
import AgenceLayout from "../../components/agence/AgenceLayout";
import AgencePageHeader from "../../components/agence/AgencePageHeader";
import api from "../../services/api";

const EMPTY_FORM = {
  nom: "",
  zone: "",
  surfaceTotale: "",
  description: "",
  lat: "",
  lng: "",
};

const isValidUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const CreateLotissementPage = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoInput, setVideoInput] = useState("");

  const [lotissements, setLotissements] = useState([]);
  const [zones, setZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modale d'édition
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchLotissements();
    fetchZones();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return lotissements.filter(
      (l) =>
        l.nom?.toLowerCase().includes(q) ||
        l.zone?.nom?.toLowerCase().includes(q) ||
        l.quartier?.nom?.toLowerCase().includes(q)
    );
  }, [lotissements, searchTerm]);

  const fetchLotissements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/agence/lotissements");
      setLotissements(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const res = await api.get("/agence/zones");
      setZones(res.data);
    } catch (err) {
      console.error("Erreur chargement zones :", err);
    }
  };

  const zoneLabel = (zone) => {
    const ville = zone.quartier?.ville?.nom;
    return ville ? `${zone.nom} (${ville})` : zone.nom;
  };

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleEditChange = (e) => setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addVideo = () => {
    const url = videoInput.trim();
    if (!url) return;
    if (!isValidUrl(url)) {
      setError("L'URL de la vidéo doit commencer par http:// ou https://");
      return;
    }
    setVideos((prev) => [...prev, url]);
    setVideoInput("");
  };

  const buildFormData = (data, vids, files) => {
    const fd = new FormData();
    fd.append("nom", data.nom);
    fd.append("zone", data.zone);
    fd.append("description", data.description || "");
    if (data.surfaceTotale !== "") fd.append("surfaceTotale", data.surfaceTotale);
    if (data.lat !== "" && data.lng !== "") {
      fd.append("lat", data.lat);
      fd.append("lng", data.lng);
    }
    fd.append("videos", JSON.stringify(vids));
    files.forEach((f) => fd.append("images", f));
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if ((formData.lat === "") !== (formData.lng === "")) {
      setError("Renseignez la latitude et la longitude ensemble.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/agence/lotissements", buildFormData(formData, videos, imageFiles), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Lotissement créé avec succès !");
      setFormData(EMPTY_FORM);
      setImageFiles([]);
      setImagePreviews([]);
      setVideos([]);
      fetchLotissements();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (lot) => {
    setEditing(lot);
    setEditForm({
      nom: lot.nom || "",
      zone: lot.zone?._id || "",
      surfaceTotale: lot.surfaceTotale ?? "",
      description: lot.description || "",
      lat: lot.localisation?.lat ?? "",
      lng: lot.localisation?.lng ?? "",
    });
  };

  const handleSaveEdit = async () => {
    setError("");
    if (!editForm.nom.trim()) {
      setError("Le nom du lotissement est requis.");
      return;
    }
    setSavingEdit(true);
    try {
      const fd = new FormData();
      fd.append("nom", editForm.nom);
      fd.append("zone", editForm.zone);
      fd.append("description", editForm.description || "");
      if (editForm.surfaceTotale !== "") fd.append("surfaceTotale", editForm.surfaceTotale);
      if (editForm.lat !== "" && editForm.lng !== "") {
        fd.append("lat", editForm.lat);
        fd.append("lng", editForm.lng);
      }
      await api.put(`/agence/lotissements/${editing._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Lotissement mis à jour");
      setEditing(null);
      fetchLotissements();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (lot) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le lotissement « ${lot.nom} » ?`)) return;
    try {
      await api.delete(`/agence/lotissements/${lot._id}`);
      setSuccess("Lotissement supprimé avec succès");
      fetchLotissements();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  return (
    <AgenceLayout>
      <Container maxWidth="xl" sx={{ mb: 4 }}>
        <AgencePageHeader
          icon={Landscape}
          title="Gestion des Lotissements"
          subtitle="Regroupez vos îlots par lotissement au sein d'une zone"
        />

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

        <Grid container spacing={3}>
          {/* Formulaire de création */}
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ position: "sticky", top: 20, borderRadius: 3, border: "1px solid #e3e8ef" }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Add sx={{ color: "#3030F9" }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#0e1133" }}>
                    Nouveau lotissement
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Nom du lotissement"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Landscape color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      select
                      label="Zone"
                      name="zone"
                      value={formData.zone}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Apartment color="action" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {zones.length === 0 ? (
                        <MenuItem disabled>Aucune zone disponible</MenuItem>
                      ) : (
                        zones.map((z) => (
                          <MenuItem key={z._id} value={z._id}>
                            {zoneLabel(z)}
                          </MenuItem>
                        ))
                      )}
                    </TextField>

                    <TextField
                      label="Surface totale"
                      name="surfaceTotale"
                      type="number"
                      value={formData.surfaceTotale}
                      onChange={handleChange}
                      fullWidth
                      inputProps={{ min: 0 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Square color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      minRows={2}
                    />

                    <Stack direction="row" spacing={1.5}>
                      <TextField
                        label="Latitude"
                        name="lat"
                        type="number"
                        value={formData.lat}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: "any", min: -90, max: 90 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MyLocation color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Longitude"
                        name="lng"
                        type="number"
                        value={formData.lng}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ step: "any", min: -180, max: 180 }}
                      />
                    </Stack>

                    <Divider />

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhotoCamera fontSize="small" color="action" />
                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                        Photos et vidéos (facultatif)
                      </Typography>
                    </Stack>

                    <Box>
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        id="lotissement-image-upload"
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="lotissement-image-upload">
                        <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth>
                          Ajouter des photos
                        </Button>
                      </label>
                      {imagePreviews.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                          {imagePreviews.map((preview, index) => (
                            <Box key={index} sx={{ position: "relative", width: 72, height: 72 }}>
                              <Box
                                component="img"
                                src={preview}
                                alt={`Photo ${index + 1}`}
                                sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 1.5 }}
                              />
                              <IconButton
                                size="small"
                                aria-label="Retirer la photo"
                                onClick={() => removeImage(index)}
                                sx={{ position: "absolute", top: -8, right: -8, bgcolor: "#fff", boxShadow: 1, p: 0.25 }}
                              >
                                <Close fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          placeholder="URL de vidéo (YouTube, Vimeo...)"
                          value={videoInput}
                          onChange={(e) => setVideoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addVideo();
                            }
                          }}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <VideoLibrary fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button variant="outlined" onClick={addVideo}>
                          Ajouter
                        </Button>
                      </Stack>
                      {videos.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                          {videos.map((v, i) => (
                            <Chip
                              key={i}
                              size="small"
                              label={v.length > 30 ? `${v.substring(0, 30)}...` : v}
                              onDelete={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      sx={{ bgcolor: "#3030F9", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#2020C8" } }}
                    >
                      {submitting ? <CircularProgress size={22} color="inherit" /> : "Créer le lotissement"}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Liste */}
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} mb={2}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#0e1133" }}>
                    Mes lotissements ({lotissements.length})
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>

                {loading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                  </Box>
                ) : filtered.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={6}>
                    Aucun lotissement.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid rgba(15,23,42,0.08)", borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ "& .MuiTableCell-root": { bgcolor: "#f5f7fa", fontWeight: 700, color: "#0e1133" } }}>
                          <TableCell>Nom</TableCell>
                          <TableCell>Zone</TableCell>
                          <TableCell>Quartier</TableCell>
                          <TableCell align="right">Surface (m²)</TableCell>
                          <TableCell align="center">Médias</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filtered.map((lot) => (
                          <TableRow key={lot._id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{lot.nom}</TableCell>
                            <TableCell>{lot.zone?.nom || "-"}</TableCell>
                            <TableCell>{lot.quartier?.nom || "-"}</TableCell>
                            <TableCell align="right">{lot.surfaceTotale ? Number(lot.surfaceTotale).toLocaleString("fr-FR") : "-"}</TableCell>
                            <TableCell align="center">
                              <Chip size="small" label={`${lot.images?.length || 0} photo(s)`} sx={{ bgcolor: "rgba(48,48,249,0.08)", color: "#3030F9", fontWeight: 600 }} />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Modifier">
                                <IconButton size="small" aria-label="Modifier" onClick={() => openEdit(lot)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton size="small" aria-label="Supprimer" onClick={() => handleDelete(lot)}>
                                  <Delete fontSize="small" color="error" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Modale d'édition */}
        <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Modifier le lotissement</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Nom du lotissement" name="nom" value={editForm.nom} onChange={handleEditChange} fullWidth required />
              <TextField select label="Zone" name="zone" value={editForm.zone} onChange={handleEditChange} fullWidth>
                {zones.map((z) => (
                  <MenuItem key={z._id} value={z._id}>
                    {zoneLabel(z)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Surface totale (m²)"
                name="surfaceTotale"
                type="number"
                value={editForm.surfaceTotale}
                onChange={handleEditChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField label="Description" name="description" value={editForm.description} onChange={handleEditChange} fullWidth multiline minRows={2} />
              <Stack direction="row" spacing={1.5}>
                <TextField label="Latitude" name="lat" type="number" value={editForm.lat} onChange={handleEditChange} fullWidth inputProps={{ step: "any" }} />
                <TextField label="Longitude" name="lng" type="number" value={editForm.lng} onChange={handleEditChange} fullWidth inputProps={{ step: "any" }} />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditing(null)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={handleSaveEdit}
              disabled={savingEdit}
              sx={{ bgcolor: "#3030F9", textTransform: "none", "&:hover": { bgcolor: "#2020C8" } }}
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AgenceLayout>
  );
};

export default CreateLotissementPage;
