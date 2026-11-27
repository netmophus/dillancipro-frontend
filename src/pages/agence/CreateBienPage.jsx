import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  Button,
  GridLegacy as Grid,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Paper,
  Avatar,
  Stack,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Fade,
} from "@mui/material";
import {
  Home,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  CloudUpload,
  Close,
  LocationOn,
  AttachMoney,
  Square,
  VideoLibrary,
  Description,
  Park,
  Apartment,
  Villa,
  Add,
  Delete,
  Nature,
} from "@mui/icons-material";
import { AddRoad as FIAddRoad, Bathtub as FIBathtub, Bed as FIBed, CalendarMonth as FICalendarMonth, Chair as FIChair, Explore as FIExplore, Flag as FIFlag, Info as FIInfo, Kitchen as FIKitchen, Language as FILanguage, LocationCity as FILocationCity, LocationOn as FILocationOn, Map as FIMap, MyLocation as FIMyLocation, Notes as FINotes, Park as FIPark, Place as FIPlace, Stairs as FIStairs, Title as FITitle } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import AgenceLayout from "../../components/agence/AgenceLayout";
import Star from "@mui/icons-material/Star";
import api from "../../services/api";
import { parseDMSString, isDMSFormat, decimalToDMS } from "../../utils/coordinateUtils";
import CategoryIcon from "@mui/icons-material/Category";
import TuneIcon from "@mui/icons-material/Tune";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";
const NIGHT = "#101C36";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const PRIMARY = "#008557";

// Thème local : palette Dillanci, uniquement sur cette page
const bienTheme = createTheme({
  palette: {
    primary: { main: PRIMARY, dark: "#005C48", contrastText: "#ffffff" },
    secondary: { main: "#1859C9" },
    success: { main: PRIMARY },
    warning: { main: "#C26716" },
    info: { main: "#1859C9" },
    error: { main: "#C62828" },
    text: { primary: NIGHT, secondary: MUTED },
  },
  typography: { fontFamily: FONT },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 700, borderRadius: 10 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

const SECTION_ICONS = { inventory: Inventory2Icon, description: Description, location: LocationOn, tune: TuneIcon, photo: PhotoCameraIcon };

// Section de formulaire : fond blanc, bordure fine, entête à pastille d'icône
const SectionCard = ({ title, icon = "description", sx, children }) => {
  const Icon = SECTION_ICONS[icon] || Description;
  return (
    <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", boxShadow: "0 1px 3px rgba(16,28,54,0.05)", p: "20px", ...sx }}>
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

// En-tête d'étape uniforme (avatar-icône + titre + sous-titre)
const StepHeader = ({ icon: Icon, title, subtitle }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
    <Avatar sx={{ bgcolor: "#E5F3EC", color: "#008557", width: 42, height: 42 }}>
      <Icon />
    </Avatar>
    <Box>
      <Typography variant="h6" fontWeight="bold">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      )}
    </Box>
  </Stack>
);

const CreateBienPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "",
    titre: "",
    description: "",
    situationGeographique: "",
    descriptionPhysique: "",
    prix: "",
    superficie: "",
    statut: "disponible",
    featured: false,
    urgent: false,
  });

  const [localisation, setLocalisation] = useState({
    adresse: "",
    ville: "",
    quartier: "",
    latitude: "",
    longitude: "",
  });
  const [coordonneesDMS, setCoordonneesDMS] = useState("");

  const [caracteristiques, setCaracteristiques] = useState({
    nbChambres: "",
    nbSallesBain: "",
    nbSalons: "",
    garage: false,
    piscine: false,
    jardin: false,
    climatisation: false,
    cuisine: "",
    irrigation: false,
    cloture: false,
    arbore: false,
    potager: false,
    etage: "",
    ascenseur: false,
    balcon: false,
    anneeConstruction: "",
    etatGeneral: "",
    acces: "",
    electricite: false,
    eau: false,
    securite: false,
    // Champs spécifiques pour jardin
    typesArbres: [], // [{ type: "Manguier", nombre: 5 }, ...]
    elementsJardin: "", // Description de ce qu'il y a dans le jardin
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [videos, setVideos] = useState([""]);
  const [visite360, setVisite360] = useState("");
  const [atoutsMajeurs, setAtoutsMajeurs] = useState([""]);

  const steps = ["Type de bien", "Informations générales", "Localisation", "Caractéristiques", "Médias"];

  const typesLabels = {
    maison: { label: "Maison", icon: Home, color: "#1859C9" },
    villa: { label: "Villa", icon: Villa, color: "#008557" },
    duplex: { label: "Duplex", icon: Home, color: "#101C36" },
    appartement: { label: "Appartement", icon: Apartment, color: "#1859C9" },
    jardin: { label: "Jardin", icon: Park, color: "#008557" },
    terrain: { label: "Terrain", icon: Square, color: "#101C36" },
    autre: { label: "Autre", icon: Home, color: "#C26716" },
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocalisationChange = (e) => {
    const { name, value } = e.target;
    setLocalisation((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordonneesDMSChange = (e) => {
    const value = e.target.value;
    console.log("🔍 [DMS_CHANGE] Valeur saisie:", value);
    setCoordonneesDMS(value);

    // Si le format DMS est détecté, convertir automatiquement
    if (value && value.trim() !== "") {
      console.log("✅ [DMS_CHANGE] Chaîne non vide, vérification format...");
      if (value.includes("/")) {
        console.log("✅ [DMS_CHANGE] Format DMS détecté (contient '/')");
        const parsed = parseDMSString(value);
        console.log("📊 [DMS_CHANGE] Résultat parsing:", parsed);
        if (parsed && parsed.latitude !== null && parsed.longitude !== null) {
          console.log("✅ [DMS_CHANGE] Conversion réussie:", parsed);
          setLocalisation((prev) => {
            const newLoc = {
              ...prev,
              latitude: parsed.latitude.toString(),
              longitude: parsed.longitude.toString(),
            };
            console.log("📍 [DMS_CHANGE] Nouvelle localisation:", newLoc);
            return newLoc;
          });
        } else {
          console.warn("⚠️ [DMS_CHANGE] Conversion échouée pour:", value);
          console.warn("   Parsed:", parsed);
        }
      } else {
        console.log("ℹ️ [DMS_CHANGE] Format DMS incomplet (pas de '/')");
      }
    } else {
      console.log("ℹ️ [DMS_CHANGE] Chaîne vide");
    }
  };

  // Fonctions pour gérer les types d'arbres dans le jardin
  const handleAddArbre = () => {
    setCaracteristiques((prev) => ({
      ...prev,
      typesArbres: [...(prev.typesArbres || []), { type: "", nombre: "" }],
    }));
  };

  const handleRemoveArbre = (index) => {
    setCaracteristiques((prev) => ({
      ...prev,
      typesArbres: prev.typesArbres.filter((_, i) => i !== index),
    }));
  };

  const handleArbreChange = (index, field, value) => {
    setCaracteristiques((prev) => {
      const newTypesArbres = [...(prev.typesArbres || [])];
      newTypesArbres[index] = { ...newTypesArbres[index], [field]: value };
      return { ...prev, typesArbres: newTypesArbres };
    });
  };

  const handleCaracteristiquesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCaracteristiques((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Vérifier qu'on ne dépasse pas 5 photos
    if (imagePreviews.length + files.length > 5) {
      setError("Vous ne pouvez ajouter que 5 photos maximum");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    // Les nouvelles photos ont un aperçu "data:" (FileReader), les existantes une URL.
    // Seules les nouvelles ont un fichier correspondant dans imageFiles.
    const isNew = imagePreviews[index]?.startsWith("data:");
    if (isNew) {
      const fileIndex = imagePreviews
        .slice(0, index)
        .filter((p) => p.startsWith("data:")).length;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocumentFiles((prev) => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addVideoField = () => {
    if (videos.length < 5) {
      setVideos([...videos, ""]);
    } else {
      setError("Vous ne pouvez ajouter que 5 vidéos maximum");
    }
  };

  const handleVideoChange = (index, value) => {
    const newVideos = [...videos];
    newVideos[index] = value;
    setVideos(newVideos);
  };

  const removeVideo = (index) => {
    if (videos.length > 1) {
      setVideos(videos.filter((_, i) => i !== index));
    }
  };

  const addAtoutField = () => {
    if (atoutsMajeurs.length < 10) {
      setAtoutsMajeurs([...atoutsMajeurs, ""]);
    } else {
      setError("Vous ne pouvez ajouter que 10 atouts maximum");
    }
  };

  const handleAtoutChange = (index, value) => {
    const newAtouts = [...atoutsMajeurs];
    newAtouts[index] = value;
    setAtoutsMajeurs(newAtouts);
  };

  const removeAtout = (index) => {
    if (atoutsMajeurs.length > 1) {
      setAtoutsMajeurs(atoutsMajeurs.filter((_, i) => i !== index));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    // Vérifier qu'on ne dépasse pas 5 photos
    if (imagePreviews.length + files.length > 5) {
      setError("Vous ne pouvez ajouter que 5 photos maximum");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation des photos (minimum 2, maximum 5) - seulement en mode création
      if (!isEditMode) {
        if (imageFiles.length < 2) {
          setError("Veuillez ajouter au moins 2 photos de votre bien");
          setLoading(false);
          return;
        }
      }
      
      // Vérifier le total des photos (aperçus = total réel en création comme en édition)
      const totalImages = imagePreviews.length;
      if (totalImages > 5) {
        setError("Vous ne pouvez avoir que 5 photos maximum au total");
        setLoading(false);
        return;
      }

      // Vidéos optionnelles - filtrer les vides
      const filteredVideos = videos.filter((v) => v.trim() !== "");

      // Vérifier si les coordonnées DMS doivent être converties avant l'envoi
      let finalLatitude = localisation.latitude;
      let finalLongitude = localisation.longitude;

      // Toujours essayer de convertir le format DMS s'il est rempli
      if (coordonneesDMS && coordonneesDMS.trim() !== "") {
        // Vérifier si c'est le format DMS complet (avec /)
        if (coordonneesDMS.includes("/")) {
          const parsed = parseDMSString(coordonneesDMS);
          if (parsed && parsed.latitude !== null && parsed.longitude !== null) {
            finalLatitude = parsed.latitude.toString();
            finalLongitude = parsed.longitude.toString();
            console.log("✅ [SUBMIT] Coordonnées DMS converties:", parsed);
            console.log("   Latitude:", finalLatitude, "Longitude:", finalLongitude);
          } else {
            console.warn("⚠️ [SUBMIT] Échec conversion DMS:", coordonneesDMS);
            console.warn("   Parsed result:", parsed);
          }
        } else {
          // Si pas de /, peut-être juste latitude ou longitude seule
          console.warn("⚠️ [SUBMIT] Format DMS incomplet (manque /):", coordonneesDMS);
        }
      }
      
      // Si les champs décimaux sont remplis mais pas le DMS, les utiliser
      // (déjà fait avec finalLatitude et finalLongitude ci-dessus)

      const data = new FormData();

      // Données de base
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Localisation - Convertir les coordonnées vides en null et les numériques en nombres
      const latStr = finalLatitude ? finalLatitude.toString().trim() : "";
      const lngStr = finalLongitude ? finalLongitude.toString().trim() : "";
      
      const latNum = latStr !== "" ? parseFloat(latStr) : null;
      const lngNum = lngStr !== "" ? parseFloat(lngStr) : null;
      
      const localisationToSend = {
        adresse: localisation.adresse || undefined,
        ville: localisation.ville || undefined,
        quartier: localisation.quartier || undefined,
        latitude: (latNum !== null && !isNaN(latNum)) ? latNum : null,
        longitude: (lngNum !== null && !isNaN(lngNum)) ? lngNum : null,
      };
      
      console.log("📤 [SUBMIT] Coordonnées DMS originales:", coordonneesDMS);
      console.log("📤 [SUBMIT] Final latitude string:", finalLatitude, "→ number:", localisationToSend.latitude);
      console.log("📤 [SUBMIT] Final longitude string:", finalLongitude, "→ number:", localisationToSend.longitude);
      console.log("📤 [SUBMIT] Localisation complète:", JSON.stringify(localisationToSend, null, 2));
      data.append("localisation", JSON.stringify(localisationToSend));

      // Caractéristiques
      data.append("caracteristiques", JSON.stringify(caracteristiques));

      // Vidéos (URLs) - Toujours envoyer comme JSON pour permettre la suppression
      // En mode édition, on remplace toutes les vidéos par celles-ci (même si vide)
      data.append("videos", JSON.stringify(filteredVideos));

      // Visite 360
      if (visite360) data.append("visite360", visite360);

      // Atouts majeurs - Toujours envoyer comme JSON pour permettre la suppression
      const filteredAtouts = atoutsMajeurs.filter((atout) => atout.trim() !== "");
      data.append("atoutsMajeurs", JSON.stringify(filteredAtouts));

      // Images
      imageFiles.forEach((file) => data.append("images", file));

      // Documents
      documentFiles.forEach((file) => data.append("documents", file));

      // En mode édition, faire un PUT au lieu d'un POST
      if (isEditMode) {
        await api.put(`/agence/biens/${id}`, data);
        setSuccess("Bien immobilier modifié avec succès !");
      } else {
        await api.post("/agence/biens", data);
        setSuccess("Bien immobilier créé avec succès !");
      }
      
      // Reset form
      setFormData({
        type: "",
        titre: "",
        description: "",
        situationGeographique: "",
        descriptionPhysique: "",
        prix: "",
        superficie: "",
        statut: "disponible",
        featured: false,
        urgent: false,
      });
      setLocalisation({
        adresse: "",
        ville: "",
        quartier: "",
        latitude: "",
        longitude: "",
      });
      setCoordonneesDMS("");
      setCaracteristiques({
        nbChambres: "",
        nbSallesBain: "",
        nbSalons: "",
        garage: false,
        piscine: false,
        jardin: false,
        climatisation: false,
        cuisine: "",
        irrigation: false,
        cloture: false,
        arbore: false,
        potager: false,
        etage: "",
        ascenseur: false,
        balcon: false,
        anneeConstruction: "",
        etatGeneral: "",
        acces: "",
        electricite: false,
        eau: false,
        securite: false,
        typesArbres: [],
        elementsJardin: "",
      });
      setImageFiles([]);
      setImagePreviews([]);
      setDocumentFiles([]);
      setVideos([""]);
      setVisite360("");
      setAtoutsMajeurs([""]);
      setCurrentStep(0);
      
      // Rediriger après succès
      if (isEditMode) {
        setTimeout(() => {
          navigate("/agence/mes-biens");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || (isEditMode ? "Erreur lors de la modification" : "Erreur lors de la création"));
    } finally {
      setLoading(false);
    }
  };

  // Charger les données du bien en mode édition
  useEffect(() => {
    const fetchBien = async () => {
      if (!isEditMode) return;
      
      setLoadingData(true);
      try {
        const response = await api.get(`/agence/biens/${id}`);
        const bien = response.data;
        
        // Remplir le formulaire avec les données du bien
        setFormData({
          type: bien.type || "",
          titre: bien.titre || "",
          description: bien.description || "",
          situationGeographique: bien.situationGeographique || "",
          descriptionPhysique: bien.descriptionPhysique || "",
          prix: bien.prix || "",
          superficie: bien.superficie || "",
          statut: bien.statut || "disponible",
          featured: bien.featured || false,
          urgent: bien.urgent || false,
        });
        
        // Localisation
        if (bien.localisation) {
          const loc = bien.localisation;
          setLocalisation({
            adresse: loc.adresse || "",
            ville: loc.ville || "",
            quartier: loc.quartier || "",
            latitude: loc.latitude ? loc.latitude.toString() : "",
            longitude: loc.longitude ? loc.longitude.toString() : "",
          });
          
          // Convertir les coordonnées décimales en DMS si disponibles
          if (loc.latitude && loc.longitude) {
            const dmsLat = decimalToDMS(loc.latitude, "lat");
            const dmsLng = decimalToDMS(loc.longitude, "lng");
            setCoordonneesDMS(`${dmsLat} / ${dmsLng}`);
          }
        }
        
        // Caractéristiques
        if (bien.caracteristiques) {
          setCaracteristiques(bien.caracteristiques);
        }
        
        // Vidéos
        if (bien.videos && bien.videos.length > 0) {
          setVideos(bien.videos);
        }
        
        // Visite 360
        if (bien.visite360) {
          setVisite360(bien.visite360);
        }
        
        // Atouts majeurs
        if (bien.atoutsMajeurs && bien.atoutsMajeurs.length > 0) {
          setAtoutsMajeurs(bien.atoutsMajeurs);
        }
        
        // Images existantes (prévisualisation uniquement)
        if (bien.images && bien.images.length > 0) {
          setImagePreviews(bien.images);
        }
        
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors du chargement du bien");
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchBien();
  }, [id, isEditMode]);
  
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Champs spécifiques selon le type
  const showHouseFields = ["maison", "villa", "duplex", "appartement"].includes(formData.type);
  const showGardenFields = formData.type === "jardin";
  const showApartmentFields = formData.type === "appartement";

  // Afficher un loader pendant le chargement des données en mode édition
  if (loadingData) {
    return (
      <AgenceLayout>
        <ThemeProvider theme={bienTheme}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
            <Box textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Chargement des données du bien...
              </Typography>
            </Box>
          </Box>
        </ThemeProvider>
      </AgenceLayout>
    );
  }

  return (
    <AgenceLayout>
      <ThemeProvider theme={bienTheme}>
      <Box sx={{ fontFamily: FONT }}>
        {/* Bandeau de la page */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2.5,
            p: { xs: "18px 16px", sm: "24px" },
            minHeight: 110,
            bgcolor: "#005C48",
            color: "#fff",
            borderRadius: "14px",
          }}
        >
          <Box sx={{ width: { xs: 48, sm: 60 }, height: { xs: 48, sm: 60 }, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Home sx={{ fontSize: { xs: 26, sm: 32 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" sx={{ fontFamily: FONT, fontSize: { xs: 22, sm: 30 }, fontWeight: 700, lineHeight: 1.2 }}>
              {isEditMode ? "Modifier un bien immobilier" : "Créer un bien immobilier"}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 15, color: "#CFE9E0", mt: 0.5 }}>
              {isEditMode
                ? "Modifiez les informations de votre bien immobilier"
                : "Ajoutez des maisons, jardins, terrains et plus à votre catalogue"}
            </Typography>
          </Box>
        </Box>

        {/* Alertes */}
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          </Fade>
        )}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>
              {error}
            </Alert>
          </Fade>
        )}

        <Card elevation={0} sx={{ bgcolor: "transparent", border: "none", boxShadow: "none" }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, "& .MuiOutlinedInput-root": { borderRadius: 2 }, "& legend": { display: "none" } }}>
            {/* Stepper */}
            <Stepper
              activeStep={currentStep}
              sx={{
                mb: 4,
                "& .MuiStepLabel-label": { fontWeight: 600 },
                "& .MuiStepLabel-label:not(.Mui-active)": { display: { xs: "none", sm: "block" } },
                "& .MuiStepConnector-root": { display: { xs: "none", sm: "block" } },
                "& .MuiStep-root": { px: { xs: 0.25, sm: 1 } },
                "& .MuiStepLabel-label.Mui-active": { color: PRIMARY },
                "& .MuiStepIcon-root.Mui-active": { color: PRIMARY },
                "& .MuiStepIcon-root.Mui-completed": { color: "#005C48" },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box component="form" onSubmit={(e) => {
              e.preventDefault();
              // Empêcher la soumission automatique
            }}>
              {/* ÉTAPE 1 : Type de bien */}
              {currentStep === 0 && (
                <SectionCard title="Type de bien" icon="inventory" sx={{ mb: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, mb: 3 }}>Sélectionnez la catégorie du bien à publier</Typography>
                  <Grid container spacing={2}>
                    {Object.keys(typesLabels).map((type) => {
                      const TypeIcon = typesLabels[type].icon;
                      return (
                        <Grid item xs={6} md={4} key={type}>
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: "pointer",
                              borderRadius: "14px",
                              border: formData.type === type ? 2 : 1,
                              borderColor: formData.type === type ? typesLabels[type].color : BORDER,
                              bgcolor: formData.type === type ? `${typesLabels[type].color}0a` : "transparent",
                              transition: "all 0.25s",
                              "&:hover": { boxShadow: "0 2px 8px rgba(16,28,54,0.10)" },
                            }}
                            onClick={() => setFormData({ ...formData, type })}
                          >
                            <CardContent sx={{ textAlign: "center" }}>
                              <Avatar
                                sx={{
                                  bgcolor: typesLabels[type].color,
                                  width: 56,
                                  height: 56,
                                  margin: "0 auto",
                                  mb: 2,
                                }}
                              >
                                <TypeIcon fontSize="large" />
                              </Avatar>
                              <Typography variant="h6" fontWeight="bold">
                                {typesLabels[type].label}
                              </Typography>
                              {formData.type === type && (
                                <CheckCircle color="success" sx={{ mt: 1 }} />
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </SectionCard>
              )}

              {/* ÉTAPE 2 : Informations générales */}
              {currentStep === 1 && (
                <SectionCard title="Informations générales" icon="description" sx={{ mb: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, mb: 3 }}>Titre, prix, description et atouts du bien</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ "aria-label": "Titre de l'annonce", title: "Titre de l'annonce" }}
                        placeholder="Titre de l'annonce *"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FITitle color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="titre"
                        value={formData.titre}
                        onChange={handleChange}
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        inputProps={{ "aria-label": "Prix", title: "Prix" }}
                        placeholder="Prix *"
                        name="prix"
                        type="number"
                        value={formData.prix}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />FCFA
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        inputProps={{ "aria-label": "Superficie", title: "Superficie" }}
                        placeholder="Superficie"
                        name="superficie"
                        type="number"
                        value={formData.superficie}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{
                          endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                        }}
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
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        fullWidth
                      >
                        <MenuItem value="disponible">Disponible</MenuItem>
                        <MenuItem value="vendu">Vendu</MenuItem>
                        <MenuItem value="reserve">Réservé</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="featured"
                              checked={formData.featured}
                              onChange={handleChange}
                            />
                          }
                          label="En vedette"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="urgent"
                              checked={formData.urgent}
                              onChange={handleChange}
                            />
                          }
                          label="Urgent"
                        />
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ "aria-label": "Description", title: "Description" }}
                        placeholder="Description"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                              <FINotes color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={5}
                      />
                    </Grid>

                    {/* Situation géographique du Terrain */}
                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ "aria-label": "Situation géographique du Terrain", title: "Situation géographique du Terrain" }}
                        placeholder="Situation géographique"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                              <FIMap color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="situationGeographique"
                        value={formData.situationGeographique}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        helperText="Optionnel - Décrivez l'environnement et la localisation du terrain"
                      />
                    </Grid>

                    {/* Description physique */}
                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ "aria-label": "Description physique", title: "Description physique" }}
                        placeholder="Description physique"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                              <FINotes color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="descriptionPhysique"
                        value={formData.descriptionPhysique}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={4}
                        helperText="Optionnel - Décrivez les aspects physiques et matériels du bien"
                      />
                    </Grid>

                    {/* Atouts majeurs */}
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Star fontSize="small" color="warning" />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Atouts majeurs
                        </Typography>
                        <Chip 
                          label={`${atoutsMajeurs.filter(a => a.trim() !== "").length}`}
                          color="primary"
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          (Optionnel - Maximum 10)
                        </Typography>
                      </Box>
                      {atoutsMajeurs.map((atout, index) => (
                        <Box key={index} display="flex" gap={1} mb={2}>
                          <TextField
                            fullWidth
                            value={atout}
                            onChange={(e) => handleAtoutChange(index, e.target.value)}
                            placeholder={`Atout ${index + 1} (ex: Proche des commerces, Vue panoramique, Sécurisé, etc.)`}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CheckCircle color="success" />
                                </InputAdornment>
                              ),
                            }}
                          />
                          {atoutsMajeurs.length > 1 && (
                            <IconButton color="error" onClick={() => removeAtout(index)}>
                              <Close />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                      {atoutsMajeurs.length < 10 && (
                        <Button 
                          variant="outlined" 
                          onClick={addAtoutField} 
                          startIcon={<Add />}
                          sx={{ mt: 1 }}
                        >
                          Ajouter un atout
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </SectionCard>
              )}

              {/* ÉTAPE 3 : Localisation */}
              {currentStep === 2 && (
                <SectionCard title="Localisation du bien" icon="location" sx={{ mb: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, mb: 3 }}>Adresse et coordonnées GPS</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ "aria-label": "Adresse complète", title: "Adresse complète" }}
                        placeholder="Adresse complète"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FILocationOn color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="adresse"
                        value={localisation.adresse}
                        onChange={handleLocalisationChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        inputProps={{ "aria-label": "Ville", title: "Ville" }}
                        placeholder="Ville"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FILocationCity color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="ville"
                        value={localisation.ville}
                        onChange={handleLocalisationChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        inputProps={{ "aria-label": "Quartier", title: "Quartier" }}
                        placeholder="Quartier"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FIPlace color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="quartier"
                        value={localisation.quartier}
                        onChange={handleLocalisationChange}
                        fullWidth
                      />
                    </Grid>

                    {/* Coordonnées GPS - Format DMS ou Décimal */}
                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ "aria-label": "Coordonnées GPS (Format DMS ou Décimal)", title: "Coordonnées GPS (Format DMS ou Décimal)" }}
                        placeholder="Coordonnées GPS (DMS ou décimal)"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FIMyLocation color="action" />
                            </InputAdornment>
                          ),
                        }}
                        value={coordonneesDMS}
                        onChange={handleCoordonneesDMSChange}
                        fullWidth
                        helperText="Vous pouvez saisir au format DMS (N 13°34'02.2 / E 2°04'59.3) ou utiliser les champs décimaux ci-dessous"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        inputProps={{ "aria-label": "Latitude (Décimal)", title: "Latitude (Décimal)" }}
                        placeholder="Latitude (ex. 13.567)"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FIMyLocation color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="latitude"
                        type="number"
                        value={localisation.latitude}
                        onChange={handleLocalisationChange}
                        fullWidth
                        helperText="Ou saisissez directement en décimal"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        inputProps={{ "aria-label": "Longitude (Décimal)", title: "Longitude (Décimal)" }}
                        placeholder="Longitude (ex. 2.083)"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FIExplore color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="longitude"
                        type="number"
                        value={localisation.longitude}
                        onChange={handleLocalisationChange}
                        fullWidth
                        helperText="Ou saisissez directement en décimal"
                      />
                    </Grid>
                  </Grid>
                </SectionCard>
              )}

              {/* ÉTAPE 4 : Caractéristiques */}
              {currentStep === 3 && (
                <SectionCard title="Caractéristiques du bien" icon="tune" sx={{ mb: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, mb: 3 }}>Optionnel — renseignez les caractéristiques pertinentes pour votre bien</Typography>
                  <Grid container spacing={3}>
                    {/* Champs pour Maison/Villa/Duplex/Appartement */}
                    {showHouseFields && (
                      <>
                        <Grid item xs={6} md={4}>
                          <TextField
                            inputProps={{ "aria-label": "Nombre de chambres", title: "Nombre de chambres" }}
                            placeholder="Nbre de chambres"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FIBed color="action" />
                                </InputAdornment>
                              ),
                            }}
                            name="nbChambres"
                            type="number"
                            value={caracteristiques.nbChambres}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <TextField
                            inputProps={{ "aria-label": "Salles de bain", title: "Salles de bain" }}
                            placeholder="Salles de bain"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FIBathtub color="action" />
                                </InputAdornment>
                              ),
                            }}
                            name="nbSallesBain"
                            type="number"
                            value={caracteristiques.nbSallesBain}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <TextField
                            inputProps={{ "aria-label": "Salons", title: "Salons" }}
                            placeholder="Salons"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FIChair color="action" />
                                </InputAdornment>
                              ),
                            }}
                            name="nbSalons"
                            type="number"
                            value={caracteristiques.nbSalons}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Stack direction="row" flexWrap="wrap" gap={2}>
                            <FormControlLabel
                              control={<Checkbox name="garage" checked={caracteristiques.garage} onChange={handleCaracteristiquesChange} />}
                              label="Garage"
                            />
                            <FormControlLabel
                              control={<Checkbox name="piscine" checked={caracteristiques.piscine} onChange={handleCaracteristiquesChange} />}
                              label="Piscine"
                            />
                            <FormControlLabel
                              control={<Checkbox name="jardin" checked={caracteristiques.jardin} onChange={handleCaracteristiquesChange} />}
                              label="Jardin"
                            />
                            <FormControlLabel
                              control={<Checkbox name="climatisation" checked={caracteristiques.climatisation} onChange={handleCaracteristiquesChange} />}
                              label="Climatisation"
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            inputProps={{ "aria-label": "Cuisine", title: "Cuisine" }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FIKitchen color="action" />
                                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Cuisine</Typography>
                                </InputAdornment>
                              ),
                            }}
                            name="cuisine"
                            value={caracteristiques.cuisine}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          >
                            <MenuItem value="">Non spécifié</MenuItem>
                            <MenuItem value="equipee">Équipée</MenuItem>
                            <MenuItem value="moderne">Moderne</MenuItem>
                            <MenuItem value="standard">Standard</MenuItem>
                            <MenuItem value="aucune">Aucune</MenuItem>
                          </TextField>
                        </Grid>
                      </>
                    )}

                    {/* Champs spécifiques Appartement */}
                    {showApartmentFields && (
                      <>
                        <Grid item xs={6} md={4}>
                          <TextField
                            inputProps={{ "aria-label": "Étage", title: "Étage" }}
                            placeholder="Étage"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FIStairs color="action" />
                                </InputAdornment>
                              ),
                            }}
                            name="etage"
                            type="number"
                            value={caracteristiques.etage}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <FormControlLabel
                            control={<Checkbox name="ascenseur" checked={caracteristiques.ascenseur} onChange={handleCaracteristiquesChange} />}
                            label="Ascenseur"
                          />
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <FormControlLabel
                            control={<Checkbox name="balcon" checked={caracteristiques.balcon} onChange={handleCaracteristiquesChange} />}
                            label="Balcon"
                          />
                        </Grid>
                      </>
                    )}

                    {/* Champs spécifiques Jardin */}
                    {showGardenFields && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }}>
                            <Chip label="Caractéristiques du jardin" icon={<Nature />} color="primary" />
                          </Divider>
                        </Grid>

                        <Grid item xs={12}>
                          <Stack direction="row" flexWrap="wrap" gap={2}>
                            <FormControlLabel
                              control={<Checkbox name="irrigation" checked={caracteristiques.irrigation} onChange={handleCaracteristiquesChange} />}
                              label="Irrigation"
                            />
                            <FormControlLabel
                              control={<Checkbox name="cloture" checked={caracteristiques.cloture} onChange={handleCaracteristiquesChange} />}
                              label="Clôture"
                            />
                            <FormControlLabel
                              control={<Checkbox name="arbore" checked={caracteristiques.arbore} onChange={handleCaracteristiquesChange} />}
                              label="Arboré"
                            />
                            <FormControlLabel
                              control={<Checkbox name="potager" checked={caracteristiques.potager} onChange={handleCaracteristiquesChange} />}
                              label="Potager"
                            />
                          </Stack>
                        </Grid>

                        {/* Types d'arbres et leur nombre */}
                        <Grid item xs={12}>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2, mb: 1 }}>
                            <Park fontSize="small" color="success" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Types d'arbres présents
                            </Typography>
                          </Box>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                            {(caracteristiques.typesArbres || []).length > 0 ? (
                              <Stack spacing={2}>
                                {(caracteristiques.typesArbres || []).map((arbre, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: "flex",
                                      gap: 2,
                                      alignItems: "flex-start",
                                      p: 2,
                                      bgcolor: "white",
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <TextField
                                      inputProps={{ "aria-label": "Type d'arbre", title: "Type d'arbre" }}
                                      placeholder="Type d'arbre"
                                      InputProps={{
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            <FIPark color="action" />
                                          </InputAdornment>
                                        ),
                                      }}
                                      value={arbre.type || ""}
                                      onChange={(e) => handleArbreChange(index, "type", e.target.value)}
                                      fullWidth
                                      size="small"
                                    />
                                    <TextField
                                      inputProps={{ "aria-label": "Nombre", title: "Nombre" }}
                                      placeholder="Nombre"
                                      type="number"
                                      value={arbre.nombre || ""}
                                      onChange={(e) => handleArbreChange(index, "nombre", e.target.value)}
                                      InputProps={{
                                        inputProps: { min: 0 },
                                      }}
                                      sx={{ width: 150 }}
                                      size="small"
                                    />
                                    <IconButton
                                      color="error"
                                      onClick={() => handleRemoveArbre(index)}
                                      sx={{ mt: 0.5 }}
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Box>
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Aucun arbre ajouté pour le moment
                              </Typography>
                            )}
                            <Button
                              variant="outlined"
                              startIcon={<Add />}
                              onClick={handleAddArbre}
                              fullWidth
                              sx={{ mt: 2 }}
                            >
                              Ajouter un type d'arbre
                            </Button>
                          </Paper>
                        </Grid>

                        {/* Éléments présents dans le jardin */}
                        <Grid item xs={12}>
                          <TextField
                            inputProps={{ "aria-label": "Éléments présents dans le jardin", title: "Éléments présents dans le jardin" }}
                            placeholder="Éléments du jardin"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                                  <FIPark color="action" />
                                </InputAdornment>
                              ),
                            }}
                            name="elementsJardin"
                            value={caracteristiques.elementsJardin || ""}
                            onChange={handleCaracteristiquesChange}
                            fullWidth
                            multiline
                            rows={4}
                            helperText="Décrivez tous les éléments, aménagements et installations présents dans le jardin"
                          />
                        </Grid>
                      </>
                    )}

                    {/* Caractéristiques communes */}
                    <Grid item xs={12}><Divider /></Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        inputProps={{ "aria-label": "Année de construction", title: "Année de construction" }}
                        placeholder="Année de construction"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FICalendarMonth color="action" />
                            </InputAdornment>
                          ),
                        }}
                        name="anneeConstruction"
                        type="number"
                        value={caracteristiques.anneeConstruction}
                        onChange={handleCaracteristiquesChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        inputProps={{ "aria-label": "État général", title: "État général" }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FIInfo color="action" />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>État général</Typography>
                            </InputAdornment>
                          ),
                        }}
                        name="etatGeneral"
                        value={caracteristiques.etatGeneral}
                        onChange={handleCaracteristiquesChange}
                        fullWidth
                      >
                        <MenuItem value="">Non spécifié</MenuItem>
                        <MenuItem value="neuf">Neuf</MenuItem>
                        <MenuItem value="bon">Bon</MenuItem>
                        <MenuItem value="moyen">Moyen</MenuItem>
                        <MenuItem value="a_renover">À rénover</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        inputProps={{ "aria-label": "Type d'accès", title: "Type d'accès" }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FIAddRoad color="action" />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Type d'accès</Typography>
                            </InputAdornment>
                          ),
                        }}
                        name="acces"
                        value={caracteristiques.acces}
                        onChange={handleCaracteristiquesChange}
                        fullWidth
                      >
                        <MenuItem value="">Non spécifié</MenuItem>
                        <MenuItem value="goudron">Goudron</MenuItem>
                        <MenuItem value="pave">Pavé</MenuItem>
                        <MenuItem value="terre">Terre</MenuItem>
                        <MenuItem value="autre">Autre</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <Stack direction="row" flexWrap="wrap" gap={2}>
                        <FormControlLabel
                          control={<Checkbox name="electricite" checked={caracteristiques.electricite} onChange={handleCaracteristiquesChange} />}
                          label="Électricité"
                        />
                        <FormControlLabel
                          control={<Checkbox name="eau" checked={caracteristiques.eau} onChange={handleCaracteristiquesChange} />}
                          label="Eau courante"
                        />
                        <FormControlLabel
                          control={<Checkbox name="securite" checked={caracteristiques.securite} onChange={handleCaracteristiquesChange} />}
                          label="Sécurité"
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </SectionCard>
              )}

              {/* ÉTAPE 5 : Médias */}
              {currentStep === 4 && (
                <SectionCard title="Médias et documents" icon="photo" sx={{ mb: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, mb: 3 }}>Photos, vidéos et documents du bien</Typography>
                  <Grid container spacing={4}>
                    {/* Images */}
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Images
                        </Typography>
                        <Chip 
                          label={`${imagePreviews.length}/5`}
                          color={imagePreviews.length >= 2 ? "success" : "error"}
                          size="small"
                        />
                        <Typography variant="caption" color="error">
                          (Minimum 2, Maximum 5) *
                        </Typography>
                      </Box>
                      <Paper
                        variant="outlined"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        sx={{
                          p: 3,
                          textAlign: "center",
                          borderStyle: "dashed",
                          borderWidth: 2,
                          borderColor: imagePreviews.length >= 2 ? "success.main" : "primary.main",
                          cursor: "pointer",
                          mb: 2,
                          bgcolor: imagePreviews.length >= 5 ? "grey.100" : "transparent",
                        }}
                      >
                        <input
                          accept="image/*"
                          style={{ display: "none" }}
                          id="image-upload"
                          type="file"
                          multiple
                          onChange={handleImageUpload}
                          disabled={imagePreviews.length >= 5}
                        />
                        <label htmlFor="image-upload">
                          <Box sx={{ cursor: imagePreviews.length >= 5 ? "not-allowed" : "pointer" }}>
                            <CloudUpload fontSize="large" color={imagePreviews.length >= 5 ? "disabled" : "primary"} />
                            <Typography>
                              {imagePreviews.length >= 5 
                                ? "Limite de 5 photos atteinte" 
                                : "Glissez vos images ou cliquez ici"}
                            </Typography>
                          </Box>
                        </label>
                      </Paper>

                      {imagePreviews.length > 0 && (
                        <Grid container spacing={2}>
                          {imagePreviews.map((preview, index) => (
                            <Grid item xs={6} md={3} key={index}>
                              <Box position="relative">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: 150,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  color="error"
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    bgcolor: "white",
                                  }}
                                  onClick={() => removeImage(index)}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Grid>

                    {/* Vidéos */}
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <VideoLibrary fontSize="small" color="action" />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Vidéos (URLs Vimeo, YouTube...)
                        </Typography>
                        <Chip 
                          label={`${videos.filter(v => v.trim() !== "").length}/5`}
                          color="primary"
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          (Optionnel - Maximum 5)
                        </Typography>
                      </Box>
                      {videos.map((video, index) => (
                        <Box key={index} display="flex" gap={1} mb={2}>
                          <TextField
                            fullWidth
                            value={video}
                            onChange={(e) => handleVideoChange(index, e.target.value)}
                            onKeyDown={(e) => {
                              // Empêcher la soumission du formulaire avec Enter
                              if (e.key === 'Enter') {
                                e.preventDefault();
                              }
                            }}
                            placeholder="https://vimeo.com/... ou https://youtube.com/watch?v=..."
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <VideoLibrary />
                                </InputAdornment>
                              ),
                            }}
                          />
                          {videos.length > 1 && (
                            <IconButton color="error" onClick={() => removeVideo(index)}>
                              <Close />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                      {videos.length < 5 && (
                        <Button 
                          variant="outlined" 
                          onClick={addVideoField} 
                          startIcon={<VideoLibrary />}
                        >
                          Ajouter une vidéo
                        </Button>
                      )}
                    </Grid>

                    {/* Visite 360 */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        inputProps={{ "aria-label": "Visite virtuelle 360° (URL)", title: "Visite virtuelle 360° (URL)" }}
                        placeholder="Visite virtuelle 360° (URL)"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FILanguage color="action" />
                            </InputAdornment>
                          ),
                        }}
                        value={visite360}
                        onChange={(e) => setVisite360(e.target.value)}
                        onKeyDown={(e) => {
                          // Empêcher la soumission du formulaire avec Enter
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
                      />
                    </Grid>

                    {/* Documents */}
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Description fontSize="small" color="action" />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Documents
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          (Optionnel)
                        </Typography>
                      </Box>
                      <input
                        accept=".pdf,.doc,.docx"
                        style={{ display: "none" }}
                        id="document-upload"
                        type="file"
                        multiple
                        onChange={handleDocumentUpload}
                      />
                      <label htmlFor="document-upload">
                        <Button variant="outlined" component="span" startIcon={<Description />}>
                          Ajouter des documents
                        </Button>
                      </label>
                      {documentFiles.length > 0 && (
                        <Stack spacing={1} mt={2}>
                          {documentFiles.map((file, index) => (
                            <Chip
                              key={index}
                              label={file.name}
                              onDelete={() => removeDocument(index)}
                              icon={<Description />}
                            />
                          ))}
                        </Stack>
                      )}
                    </Grid>
                  </Grid>
                </SectionCard>
              )}

              {/* Boutons de navigation */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Précédent
                </Button>

                <Box display="flex" gap={2}>
                  {currentStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={nextStep}
                      disabled={currentStep === 0 && !formData.type}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        // Confirmation avant soumission
                        const confirmMessage = isEditMode 
                          ? "Êtes-vous sûr de vouloir enregistrer les modifications ?"
                          : "Êtes-vous sûr de vouloir créer ce bien ?";
                        
                        if (window.confirm(confirmMessage)) {
                          await handleSubmit(e);
                        }
                      }}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                      sx={{ minWidth: 150 }}
                    >
                      {loading ? "Enregistrement..." : (isEditMode ? "Enregistrer les modifications" : "Créer le bien")}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      </ThemeProvider>
    </AgenceLayout>
  );
};

export default CreateBienPage;

