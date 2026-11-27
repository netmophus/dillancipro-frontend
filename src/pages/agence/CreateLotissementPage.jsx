import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  GridLegacy as Grid,
  Card,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
  CircularProgress,
  Stack,
  Tabs,
  Tab,
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
  Landscape,
  Square,
  MyLocation,
  LocationCity,
  LocationOn,
  Map as MapIcon,
  PhotoLibrary,
  Clear,
  ViewList,
  AddCircle,
  Info,
} from "@mui/icons-material";
import AgenceLayout from "../../components/agence/AgenceLayout";
import api from "../../services/api";

const BLUE = "#1859C9";
const PRIMARY = "#008557";
const PRIMARY_HOVER = "#005C48";
const GREEN = "#008557";
const NIGHT = "#101C36";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

// Section de formulaire (locale à cette page) : fond blanc, bordure fine, entête à pastille d'icône
const FORM_ICONS = { info: Info, location: LocationOn, photo: PhotoLibrary };
const FormSection = ({ title, icon = "info", children }) => {
  const Icon = FORM_ICONS[icon] || Info;
  return (
    <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", boxShadow: "0 1px 3px rgba(16,28,54,0.05)", p: "20px", mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2.5 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#E5F3EC", color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Typography component="h2" sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NIGHT }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  );
};

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

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR");

// Tuile de statistique en tête de page
const StatTile = ({ icon: Icon, label, value, color }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: { xs: 1.25, sm: 2 },
      p: { xs: 1.5, sm: 2.5 },
      bgcolor: "#fff",
      borderRadius: "14px",
      border: `1px solid ${BORDER}`,
      boxShadow: "0 1px 3px rgba(16,28,54,0.05)",
    }}
  >
    <Box
      sx={{
        width: { xs: 38, sm: 46 },
        height: { xs: 38, sm: 46 },
        borderRadius: "12px",
        bgcolor: `${color}1A`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontFamily: FONT, fontSize: { xs: 20, sm: 26 }, fontWeight: 800, color, lineHeight: 1.1, whiteSpace: "nowrap" }}>
        {value}
      </Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: 13.5, color: MUTED, lineHeight: 1.3 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

// Petit badge carré superposé sur l'image (indicateur d'information)
const IndicatorBadge = ({ active, color, label, icon: Icon }) => (
  <Tooltip title={label}>
    <Box
      role="img"
      aria-label={label}
      sx={{
        width: 30,
        height: 30,
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: active ? color : "#9aa5b4",
        color: "#fff",
        boxShadow: "0 1px 4px rgba(15,23,42,0.25)",
      }}
    >
      <Icon sx={{ fontSize: 18 }} />
    </Box>
  </Tooltip>
);

// Carte d'un lotissement dans la liste
const LotissementCard = ({ lot, onEdit, onDelete }) => {
  const cover = lot.images?.[0];
  const hasGps = lot.localisation?.lat !== undefined && lot.localisation?.lng !== undefined;
  const nbVideos = lot.videos?.length || 0;
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "14px",
        overflow: "hidden",
        bgcolor: "#fff",
        border: `1px solid ${BORDER}`,
        boxShadow: "0 1px 3px rgba(16,28,54,0.05)",
      }}
    >
      {/* 1. Image en bandeau : visible en entier (contain) sur fond neutre */}
      <Box
        sx={{
          position: "relative",
          height: 160,
          bgcolor: "#F1F4F7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {cover ? (
          <Box
            component="img"
            src={cover}
            alt={lot.nom}
            sx={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
          />
        ) : (
          <MapIcon sx={{ fontSize: 56, color: "#9aa5b4" }} />
        )}

        {/* Indicateurs en haut à droite de l'image */}
        <Stack direction="row" spacing={0.75} sx={{ position: "absolute", top: 10, right: 10 }}>
          <IndicatorBadge
            active={hasGps}
            color={GREEN}
            icon={LocationOn}
            label={hasGps ? "Position renseignée" : "Position non renseignée"}
          />
          <IndicatorBadge
            active={nbVideos > 0}
            color={BLUE}
            icon={VideoLibrary}
            label={nbVideos > 0 ? `${nbVideos} vidéo(s)` : "Aucune vidéo"}
          />
        </Stack>
      </Box>

      {/* 2. Corps */}
      <Box sx={{ p: "18px", display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: NIGHT, lineHeight: 1.25 }}>{lot.nom}</Typography>

        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {lot.zone?.nom && (
            <Chip
              size="small"
              icon={<Apartment sx={{ color: "#005C48 !important" }} />}
              label={lot.zone.nom}
              sx={{ bgcolor: "#E5F3EC", color: "#005C48", fontWeight: 600 }}
            />
          )}
          {lot.quartier?.nom && (
            <Chip
              size="small"
              icon={<LocationOn sx={{ color: "#5b6573 !important" }} />}
              label={lot.quartier.nom}
              sx={{ bgcolor: "#f1f3f7", color: "#5b6573", fontWeight: 600 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: "stretch" }}>
          <Box sx={{ flex: 1, minWidth: 0, bgcolor: "#E5F3EC", borderRadius: "10px", p: 1.25 }}>
            <Typography sx={{ fontSize: 12, color: "#005C48", fontWeight: 600 }}>Surface totale</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: GREEN, lineHeight: 1.3 }}>
              {lot.surfaceTotale > 0 ? `${fmt(lot.surfaceTotale)} m²` : "Non renseignée"}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, bgcolor: "#F1F4F7", borderRadius: "10px", p: 1.25 }}>
            <Typography sx={{ fontSize: 12, color: "#5b6573", fontWeight: 600 }}>Composition</Typography>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: NIGHT,
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {lot.description || "Non renseignée"}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {/* 3. Barre d'actions */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            pt: 1.5,
            borderTop: "1px solid #eef1f5",
          }}
        >
          <Button
            startIcon={<Edit fontSize="small" />}
            onClick={() => onEdit(lot)}
            sx={{ flex: 1, minWidth: 0, px: 1, bgcolor: "#E5F3EC", color: PRIMARY_HOVER, borderRadius: "8px", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#D3EBDD" } }}
          >
            Modifier
          </Button>
          <Button
            startIcon={<Delete fontSize="small" />}
            onClick={() => onDelete(lot)}
            sx={{ flex: 1, minWidth: 0, px: 1, bgcolor: "#FDECEC", color: "#C62828", borderRadius: "8px", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#FADADA" } }}
          >
            Supprimer
          </Button>
        </Box>
      </Box>
    </Card>
  );
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
  const [zoneFilter, setZoneFilter] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState(0); // 0 = Mes lotissements, 1 = Créer

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
        (!zoneFilter || l.zone?._id === zoneFilter) &&
        (l.nom?.toLowerCase().includes(q) ||
          l.zone?.nom?.toLowerCase().includes(q) ||
          l.quartier?.nom?.toLowerCase().includes(q))
    );
  }, [lotissements, searchTerm, zoneFilter]);

  const stats = useMemo(
    () => ({
      total: lotissements.length,
      zones: new Set(lotissements.map((l) => l.zone?._id).filter(Boolean)).size,
      surface: lotissements.reduce((s, l) => s + (Number(l.surfaceTotale) || 0), 0),
      photos: lotissements.reduce((s, l) => s + (l.images?.length || 0), 0),
    }),
    [lotissements]
  );

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

  // Libellé dans le champ (placeholder), accessible via aria-label et title
  const ph = (text, extra = {}) => ({
    placeholder: text,
    inputProps: { "aria-label": text, title: text, ...extra },
  });

  // Sélecteur de zone : le libellé s'affiche dans le champ tant que rien n'est choisi
  const zoneSelectProps = (text) => ({
    displayEmpty: true,
    renderValue: (v) => {
      const z = zones.find((x) => x._id === v);
      return z ? zoneLabel(z) : <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>{text}</span>;
    },
  });

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
      setTab(0);
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

  const iconAdornment = (Icon) => (
    <InputAdornment position="start">
      <Icon fontSize="small" color="action" />
    </InputAdornment>
  );

  return (
    <AgenceLayout>
      <Box sx={{ fontFamily: FONT, "& .MuiTypography-root, & .MuiButton-root, & .MuiInputBase-root, & .MuiTab-root, & .MuiChip-root": { fontFamily: "inherit" } }}>
        {/* Bandeau de la page */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2.5,
            p: { xs: "18px 16px", sm: "24px" },
            minHeight: 110,
            bgcolor: PRIMARY_HOVER,
            color: "#fff",
            borderRadius: "14px",
          }}
        >
          <Box sx={{ width: { xs: 48, sm: 60 }, height: { xs: 48, sm: 60 }, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Landscape sx={{ fontSize: { xs: 26, sm: 32 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" sx={{ fontFamily: FONT, fontSize: { xs: 22, sm: 30 }, fontWeight: 700, lineHeight: 1.2 }}>
              Gestion des lotissements
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 15, color: "#CFE9E0", mt: 0.5 }}>
              Regroupez vos îlots par lotissement au sein d'une zone
            </Typography>
          </Box>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: "10px" }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <StatTile icon={Landscape} label="Lotissements" value={stats.total} color={BLUE} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile icon={Apartment} label="Zones couvertes" value={stats.zones} color={NIGHT} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile icon={Square} label="Surface totale (m²)" value={fmt(stats.surface)} color={GREEN} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile icon={PhotoLibrary} label="Photos" value={stats.photos} color="#C26716" />
          </Grid>
        </Grid>

        {/* Onglets */}
        <Box
          sx={{
            mb: 2.5,
            bgcolor: "#fff",
            borderRadius: "14px",
            border: `1px solid ${BORDER}`,
            boxShadow: "0 1px 3px rgba(16,28,54,0.05)",
            px: 1,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Gestion des lotissements"
            TabIndicatorProps={{ sx: { bgcolor: PRIMARY, height: 3, borderRadius: 2 } }}
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, color: MUTED, minHeight: 52 },
              "& .MuiTab-root.Mui-selected": { color: PRIMARY },
            }}
          >
            <Tab
              icon={<ViewList />}
              iconPosition="start"
              label={`Mes lotissements (${lotissements.length})`}
              id="lot-tab-0"
              aria-controls="lot-panel-0"
            />
            <Tab
              icon={<AddCircle />}
              iconPosition="start"
              label="Créer un lotissement"
              id="lot-tab-1"
              aria-controls="lot-panel-1"
            />
          </Tabs>
        </Box>

        {/* Panneau 1 : formulaire (reste monté pour conserver la saisie) */}
        <Box role="tabpanel" hidden={tab !== 1} id="lot-panel-1" aria-labelledby="lot-tab-1" sx={{ maxWidth: 820, mx: "auto" }}>
          <Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ "& legend": { display: "none" }, "& .MuiOutlinedInput-root": { borderRadius: "10px" }, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY } }}>
              <FormSection title="Nouveau lotissement" icon="info">
                <Stack spacing={2.5}>
                  <TextField
                    {...ph("Nom du lotissement *")}
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputProps={{ startAdornment: iconAdornment(Landscape) }}
                  />
                  <TextField
                    select
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    fullWidth
                    required
                    inputProps={{ "aria-label": "Zone", title: "Zone" }}
                    SelectProps={zoneSelectProps("Zone *")}
                    InputProps={{ startAdornment: iconAdornment(Apartment) }}
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
                    {...ph("Surface totale", { min: 0 })}
                    name="surfaceTotale"
                    type="number"
                    value={formData.surfaceTotale}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: iconAdornment(Square),
                      endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                    }}
                  />
                  <TextField
                    {...ph("Description (facultatif)")}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Stack>
              </FormSection>

              <FormSection title="Localisation" icon="location">
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    {...ph("Latitude", { step: "any", min: -90, max: 90 })}
                    name="lat"
                    type="number"
                    value={formData.lat}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{ startAdornment: iconAdornment(MyLocation) }}
                  />
                  <TextField
                    {...ph("Longitude", { step: "any", min: -180, max: 180 })}
                    name="lng"
                    type="number"
                    value={formData.lng}
                    onChange={handleChange}
                    fullWidth
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Facultatif. Renseignez la latitude et la longitude ensemble.
                </Typography>
              </FormSection>

              <FormSection title="Photos et vidéos" icon="photo">
                <input
                  accept="image/jpeg,image/png,image/webp"
                  id="lotissement-image-upload"
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <label htmlFor="lotissement-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ bgcolor: "#fff", borderColor: PRIMARY, color: PRIMARY, borderRadius: "10px", textTransform: "none", fontWeight: 600, "&:hover": { borderColor: PRIMARY, bgcolor: "#E5F3EC" } }}
                  >
                    Ajouter des photos (JPEG, PNG, WebP)
                  </Button>
                </label>
                {imagePreviews.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, mt: 2 }}>
                    {imagePreviews.map((preview, index) => (
                      <Box key={index} sx={{ position: "relative", width: 76, height: 76 }}>
                        <Box component="img" src={preview} alt={`Photo ${index + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2 }} />
                        <IconButton
                          size="small"
                          aria-label="Retirer la photo"
                          onClick={() => removeImage(index)}
                          sx={{ position: "absolute", top: -8, right: -8, bgcolor: "#fff", boxShadow: 1, p: 0.25, "&:hover": { bgcolor: "#fff" } }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
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
                    inputProps={{ "aria-label": "URL de vidéo", title: "URL de vidéo" }}
                    fullWidth
                    InputProps={{ startAdornment: iconAdornment(VideoLibrary) }}
                  />
                  <Button
                    variant="outlined"
                    onClick={addVideo}
                    sx={{ bgcolor: "#fff", borderColor: PRIMARY, color: PRIMARY, borderRadius: "10px", textTransform: "none", fontWeight: 600, "&:hover": { borderColor: PRIMARY, bgcolor: "#E5F3EC" } }}
                  >
                    Ajouter
                  </Button>
                </Stack>
                {videos.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                    {videos.map((v, i) => (
                      <Chip
                        key={i}
                        size="small"
                        label={v.length > 32 ? `${v.substring(0, 32)}...` : v}
                        onDelete={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
                        sx={{ bgcolor: "#E5F3EC", color: "#005C48", fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                )}
              </FormSection>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={!submitting && <Add />}
                disabled={submitting}
                sx={{ bgcolor: PRIMARY, borderRadius: "10px", py: 1.4, minHeight: 48, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: PRIMARY_HOVER } }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : "Créer le lotissement"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Panneau 0 : liste */}
        <Box role="tabpanel" hidden={tab !== 0} id="lot-panel-0" aria-labelledby="lot-tab-0">
          <Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.5,
                p: 2,
                mb: 2.5,
                bgcolor: "#fff",
                borderRadius: "14px",
                border: `1px solid ${BORDER}`,
                boxShadow: "0 1px 3px rgba(16,28,54,0.05)",
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
              }}
            >
              <Typography component="h2" sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: NIGHT, mr: "auto" }}>
                Mes lotissements ({filtered.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                inputProps={{ "aria-label": "Rechercher un lotissement", title: "Rechercher un lotissement" }}
                sx={{ flex: "1 1 180px", minWidth: 160 }}
                InputProps={{ startAdornment: iconAdornment(Search) }}
              />
              <TextField
                select
                size="small"
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (v) => (v ? zones.find((z) => z._id === v)?.nom || "" : <span style={{ color: "rgba(0,0,0,0.6)" }}>Toutes les zones</span>),
                }}
                inputProps={{ "aria-label": "Filtrer par zone", title: "Filtrer par zone" }}
                sx={{ flex: "1 1 180px", minWidth: 160 }}
                InputProps={{ startAdornment: iconAdornment(LocationCity) }}
              >
                <MenuItem value="">
                  <em>Toutes les zones</em>
                </MenuItem>
                {zones.map((z) => (
                  <MenuItem key={z._id} value={z._id}>
                    {zoneLabel(z)}
                  </MenuItem>
                ))}
              </TextField>
              {(searchTerm || zoneFilter) && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={() => {
                    setSearchTerm("");
                    setZoneFilter("");
                  }}
                  sx={{ borderColor: PRIMARY, color: PRIMARY, borderRadius: "10px", textTransform: "none", fontWeight: 600, "&:hover": { borderColor: PRIMARY, bgcolor: "#E5F3EC" } }}
                >
                  Réinitialiser
                </Button>
              )}
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress sx={{ color: PRIMARY }} />
              </Box>
            ) : filtered.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  px: 3,
                  bgcolor: "#fff",
                  borderRadius: "14px",
                  border: `1px dashed ${BORDER}`,
                }}
              >
                <Landscape sx={{ fontSize: 48, color: "#A8B3C1" }} />
                <Typography sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NIGHT, mt: 1 }}>
                  {lotissements.length === 0 ? "Aucun lotissement pour le moment" : "Aucun résultat"}
                </Typography>
                <Typography sx={{ color: MUTED, fontSize: 14 }}>
                  {lotissements.length === 0
                    ? "Créez votre premier lotissement avec le formulaire."
                    : "Modifiez votre recherche ou réinitialisez les filtres."}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {filtered.map((lot) => (
                  <Grid item xs={12} sm={6} lg={4} key={lot._id}>
                    <LotissementCard lot={lot} onEdit={openEdit} onDelete={handleDelete} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>

        {/* Modale d'édition */}
        <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "14px", "& legend": { display: "none" }, "& .MuiOutlinedInput-root": { borderRadius: "10px" } } }}>
          <DialogTitle sx={{ fontWeight: "bold", color: NIGHT }}>Modifier le lotissement</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField {...ph("Nom du lotissement *")} name="nom" value={editForm.nom} onChange={handleEditChange} fullWidth required />
              <TextField select name="zone" value={editForm.zone} onChange={handleEditChange} fullWidth inputProps={{ "aria-label": "Zone", title: "Zone" }} SelectProps={zoneSelectProps("Zone *")}>
                {zones.map((z) => (
                  <MenuItem key={z._id} value={z._id}>
                    {zoneLabel(z)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                {...ph("Surface totale (m²)", { min: 0 })}
                name="surfaceTotale"
                type="number"
                value={editForm.surfaceTotale}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField {...ph("Description (facultatif)")} name="description" value={editForm.description} onChange={handleEditChange} fullWidth multiline minRows={2} />
              <Stack direction="row" spacing={1.5}>
                <TextField {...ph("Latitude", { step: "any" })} name="lat" type="number" value={editForm.lat} onChange={handleEditChange} fullWidth />
                <TextField {...ph("Longitude", { step: "any" })} name="lng" type="number" value={editForm.lng} onChange={handleEditChange} fullWidth />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setEditing(null)} sx={{ textTransform: "none", color: NIGHT }}>
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveEdit}
              disabled={savingEdit}
              sx={{ bgcolor: PRIMARY, borderRadius: "10px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: PRIMARY_HOVER } }}
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AgenceLayout>
  );
};

export default CreateLotissementPage;
