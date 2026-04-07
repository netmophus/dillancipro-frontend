import React, { useState, useEffect } from "react";
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
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Home,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  LocationOn,
  AttachMoney,
  Square,
  Apartment,
  Villa,
  Business,
  Warehouse,
  Photo,
  VideoLibrary,
  Description,
  CloudUpload,
  Delete,
  Add,
  Nature,
  CalendarToday,
  ExpandMore,
  Person,
  Info,
  AccountBalance,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const CreateIHEPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "",
    titre: "",
    description: "",
    nomClient: "",
    // Nouveaux champs localisation dans bloc général
    pays: "",
    ville: "",
    quartier: "",
    referenceTitreFoncier: "",
    // Informations essentielles
    superficie: "",
    uniteSuperficie: "m²",
    dateEntreeIHE: "", // Date d'entrée en IHE (obligatoire)
    valeurComptableBruteEntree: "", // Renommé de valeurComptable
    // Informations financières
    origineIHE: "", // adjudication, dation, achat, autre
    valeurAdjudication: "",
    valeurDation: "",
    valeurAcquisition: "",
    dateAcquisition: "",
    valeurNetteComptable: "", // Calculée, en lecture seule
    valeurCession: "",
    // Champs réglementaires
    typeReglementaireIHE: "", // "reprise_garantie" ou "autre"
    dateEntreeIHEReglementaire: "", // Date d'entrée pour calcul 24 mois
    dateLimiteReglementaire: "", // Calculée automatiquement (24 mois)
    prorogationCommissionBancaire: false,
    dateDecisionProrogation: "",
    nouvelleDateLimiteCession: "",
    inclusDansPlafond15: true,
    motifExclusionPlafond: "",
    planCession: "",
    // Informations complémentaires
    referenceClientInterne: "",
    referencePretOrigine: "",
    referenceGarantie: "",
    notes: "",
    commentaires: "",
  });

  const [localisation, setLocalisation] = useState({
    adresse: "",
    ville: "",
    quartier: "",
    latitude: "",
    longitude: "",
  });

  const [caracteristiques, setCaracteristiques] = useState({
    nbChambres: "",
    nbSallesBain: "",
    nbSalons: "",
    garage: false,
    piscine: false,
    jardin: false,
    climatisation: false,
    anneeConstruction: "",
    etatGeneral: "",
    electricite: false,
    eau: false,
    securite: false,
    // Champs spécifiques pour jardin
    irrigation: false,
    cloture: false,
    arbore: false,
    potager: false,
    typesArbres: [],
    elementsJardin: "",
  });

  const [medias, setMedias] = useState([]);
  const [uploadingMedias, setUploadingMedias] = useState(false);
  const [mediaTab, setMediaTab] = useState(0);

  // Debug: afficher les médias quand ils changent
  useEffect(() => {
    console.log("📋 [CreateIHE] État médias mis à jour:", medias.map(m => ({
      id: m.id,
      type: m.type,
      titre: m.titre,
      hasFile: !!m.file,
      fileName: m.file?.name,
    })));
  }, [medias]);

  const steps = ["Type & Informations", "Localisation", "Caractéristiques", "Médias", "Résumé"];

  const typesLabels = {
    terrain: { label: "Terrain", icon: Square, color: "#795548" },
    jardin: { label: "Jardin", icon: Nature, color: "#4caf50" },
    maison: { label: "Maison", icon: Home, color: "#2196f3" },
    appartement: { label: "Appartement", icon: Apartment, color: "#f44336" },
    villa: { label: "Villa", icon: Villa, color: "#9c27b0" },
    bureau: { label: "Bureau", icon: Business, color: "#00bcd4" },
    entrepot: { label: "Entrepôt", icon: Warehouse, color: "#ff9800" },
    autre: { label: "Autre", icon: Home, color: "#607d8b" },
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

  const handleCaracteristiquesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCaracteristiques((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const handleAddMedia = (type) => {
    const newMedia = {
      id: Date.now(),
      type,
      titre: "",
      description: "",
      url: "",
      file: null,
      preview: null,
      ordre: medias.length,
    };
    setMedias([...medias, newMedia]);
  };

  const handleRemoveMedia = (id) => {
    setMedias(medias.filter((m) => m.id !== id));
  };

  const handleMediaChange = (id, field, value) => {
    setMedias(
      medias.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const handleFileChange = async (id, file) => {
    if (!file) return;

    console.log("📁 [CreateIHE] handleFileChange appelé:", {
      id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Créer une preview pour les images
    let preview = null;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }

    // Mettre à jour les deux champs en une seule fois pour éviter les problèmes de closure
    setMedias((prevMedias) =>
      prevMedias.map((m) =>
        m.id === id
          ? {
              ...m,
              file: file,
              preview: preview,
            }
          : m
      )
    );

    console.log("✅ [CreateIHE] État mis à jour pour média ID:", id);
  };

  // Mettre à jour la valeur comptable brute quand l'origine change
  useEffect(() => {
    let valeurCalculee = "";
    if (formData.origineIHE === "adjudication" && formData.valeurAdjudication) {
      valeurCalculee = formData.valeurAdjudication;
    } else if (formData.origineIHE === "dation" && formData.valeurDation) {
      valeurCalculee = formData.valeurDation;
    } else if (formData.origineIHE === "achat" && formData.valeurAcquisition) {
      valeurCalculee = formData.valeurAcquisition;
    }
    if (valeurCalculee && formData.origineIHE) {
      setFormData((prev) => ({ ...prev, valeurComptableBruteEntree: valeurCalculee }));
    }
  }, [formData.origineIHE, formData.valeurAdjudication, formData.valeurDation, formData.valeurAcquisition]);

  // Mettre à jour la date limite réglementaire
  useEffect(() => {
    let dateLimite = "";
    if (formData.dateEntreeIHEReglementaire && formData.typeReglementaireIHE === "reprise_garantie") {
      const dateEntree = new Date(formData.dateEntreeIHEReglementaire);
      dateEntree.setMonth(dateEntree.getMonth() + 24);
      dateLimite = dateEntree.toISOString().split('T')[0];
    }
    if (dateLimite) {
      setFormData((prev) => ({ ...prev, dateLimiteReglementaire: dateLimite }));
    }
  }, [formData.dateEntreeIHEReglementaire, formData.typeReglementaireIHE]);

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.type || !formData.titre || !formData.valeurComptableBruteEntree || !formData.dateEntreeIHE) {
        setError("Veuillez remplir tous les champs obligatoires (Type, Titre, Valeur comptable brute à l'entrée, Date d'entrée en IHE)");
        return;
      }
    }
    if (currentStep === 1) {
      if (!localisation.ville) {
        setError("La ville est obligatoire");
        return;
      }
    }
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Préparer les données
      const dataToSend = {
        ...formData,
        // Localisation et référence
        pays: formData.pays || undefined,
        ville: formData.ville || undefined,
        quartier: formData.quartier || undefined,
        referenceTitreFoncier: formData.referenceTitreFoncier || undefined,
        // Informations essentielles
        superficie: formData.superficie ? parseFloat(formData.superficie) : undefined,
        dateEntreeIHE: formData.dateEntreeIHE || undefined,
        // Mapper valeurComptableBruteEntree vers valeurComptable pour le backend
        valeurComptable: formData.valeurComptableBruteEntree ? parseFloat(formData.valeurComptableBruteEntree) : undefined,
        valeurComptableBruteEntree: formData.valeurComptableBruteEntree ? parseFloat(formData.valeurComptableBruteEntree) : undefined,
        // Informations financières
        origineIHE: formData.origineIHE || undefined,
        valeurAdjudication: formData.valeurAdjudication ? parseFloat(formData.valeurAdjudication) : undefined,
        valeurDation: formData.valeurDation ? parseFloat(formData.valeurDation) : undefined,
        valeurAcquisition: formData.valeurAcquisition ? parseFloat(formData.valeurAcquisition) : undefined,
        dateAcquisition: formData.dateAcquisition || undefined,
        valeurNetteComptable: formData.valeurNetteComptable ? parseFloat(formData.valeurNetteComptable) : undefined,
        valeurCession: formData.valeurCession ? parseFloat(formData.valeurCession) : undefined,
        // Champs réglementaires
        typeReglementaireIHE: formData.typeReglementaireIHE || undefined,
        dateEntreeIHEReglementaire: formData.dateEntreeIHEReglementaire || undefined,
        dateLimiteReglementaire: formData.dateLimiteReglementaire || undefined,
        prorogationCommissionBancaire: formData.prorogationCommissionBancaire || false,
        dateDecisionProrogation: formData.dateDecisionProrogation || undefined,
        nouvelleDateLimiteCession: formData.nouvelleDateLimiteCession || undefined,
        inclusDansPlafond15: formData.inclusDansPlafond15 !== undefined ? formData.inclusDansPlafond15 : true,
        motifExclusionPlafond: formData.motifExclusionPlafond || undefined,
        planCession: formData.planCession || undefined,
        // Informations complémentaires
        referenceClientInterne: formData.referenceClientInterne || undefined,
        referencePretOrigine: formData.referencePretOrigine || undefined,
        referenceGarantie: formData.referenceGarantie || undefined,
        nomClient: formData.nomClient || undefined,
        commentaires: formData.commentaires || undefined,
        localisation: {
          ...localisation,
          latitude: localisation.latitude ? parseFloat(localisation.latitude) : undefined,
          longitude: localisation.longitude ? parseFloat(localisation.longitude) : undefined,
        },
        caracteristiques: {
          ...caracteristiques,
          nbChambres: caracteristiques.nbChambres ? parseInt(caracteristiques.nbChambres) : undefined,
          nbSallesBain: caracteristiques.nbSallesBain ? parseInt(caracteristiques.nbSallesBain) : undefined,
          nbSalons: caracteristiques.nbSalons ? parseInt(caracteristiques.nbSalons) : undefined,
          anneeConstruction: caracteristiques.anneeConstruction ? parseInt(caracteristiques.anneeConstruction) : undefined,
          // Traiter les types d'arbres
          typesArbres: caracteristiques.typesArbres
            ? caracteristiques.typesArbres
                .filter((arbre) => arbre.type && arbre.nombre)
                .map((arbre) => ({
                  type: arbre.type,
                  nombre: parseInt(arbre.nombre) || 0,
                }))
            : undefined,
        },
      };

      // Créer l'IHE
      const response = await api.post("/banque/ihe", dataToSend);
      const iheId = response.data.ihe._id;

      // Uploader les médias si présents
      if (medias.length > 0) {
        setUploadingMedias(true);
        for (const media of medias) {
          try {
            let url = media.url;

            // Si c'est un fichier, l'uploader avec le type approprié
            // Note: Les vidéos ne sont pas uploadées (ce sont des URLs YouTube/Vimeo)
            if (media.file && (media.type === "photo" || media.type === "document")) {
              // Passer l'iheId pour organiser les fichiers dans Cloudinary
              const formData = new FormData();
              formData.append("file", media.file);
              formData.append("mediaType", media.type);
              formData.append("iheId", iheId);
              
              console.log("📤 [CreateIHE] Upload média:", {
                type: media.type,
                fileName: media.file.name,
                iheId,
              });
              
              const uploadResponse = await api.post("/banque/ihe/upload-media", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              
              console.log("✅ [CreateIHE] Upload réussi:", uploadResponse.data);
              url = uploadResponse.data.url;
              
              if (!url) {
                console.error("❌ [CreateIHE] URL manquante dans la réponse:", uploadResponse.data);
                throw new Error("URL non retournée par le serveur");
              }
            }

            // Si on a une URL (uploadée ou fournie), créer le média
            // Pour les vidéos, on utilise directement l'URL fournie
            if (url) {
              // Générer un titre par défaut si aucun titre n'est fourni
              const titreFinal = media.titre || (() => {
                const typeLabels = {
                  photo: "Photo",
                  video: "Vidéo",
                  document: "Document"
                };
                const index = medias.filter(m => m.type === media.type && m.id <= media.id).length;
                return `${typeLabels[media.type] || "Média"} ${index}`;
              })();
              
              console.log("📝 [CreateIHE] Création du média dans la DB:", {
                type: media.type,
                titre: titreFinal,
                url: url.substring(0, 50) + "...",
                iheId,
              });
              
              const createResponse = await api.post(`/banque/ihe/${iheId}/media`, {
                type: media.type,
                titre: titreFinal,
                description: media.description || "",
                url,
                ordre: media.ordre,
              });
              
              console.log("✅ [CreateIHE] Média créé dans la DB:", createResponse.data);
            } else {
              console.warn("⚠️ [CreateIHE] Média ignoré (URL manquante):", {
                url: !!url,
                type: media.type,
              });
            }
          } catch (mediaErr) {
            console.error("Erreur upload média:", mediaErr);
            setError(`Erreur lors de l'upload du média "${media.titre || 'sans titre'}": ${mediaErr.response?.data?.message || mediaErr.message}`);
            // Continuer avec les autres médias même en cas d'erreur
          }
        }
        setUploadingMedias(false);
      }

      setSuccess("✅ IHE créée avec succès ! En attente de validation.");
      
      setTimeout(() => {
        navigate("/banque/ihe");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'IHE");
      setUploadingMedias(false);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box>
            <Card 
              elevation={0}
              sx={{ 
                mb: 3, 
                borderLeft: "4px solid #667eea",
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(5px)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 30px rgba(102, 126, 234, 0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(102, 126, 234, 0.1)",
                      width: 48,
                      height: 48,
                      border: "2px solid #667eea",
                    }}
                  >
                  <Home sx={{ color: "#667eea", fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                    Type & Informations générales
                  </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sélectionnez le type de bien et renseignez les informations de base
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 3, fontSize: { xs: "1rem", md: "1.1rem" } }}>
                  Sélectionnez le type de bien IHE *
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {Object.entries(typesLabels).map(([key, { label, icon: Icon, color }]) => {
                    const isSelected = formData.type === key;
                    return (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <Card
                          elevation={0}
                        sx={{
                          cursor: "pointer",
                            border: isSelected ? `3px solid ${color}` : "2px solid rgba(0, 0, 0, 0.08)",
                            bgcolor: isSelected 
                              ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` 
                              : "rgba(255, 255, 255, 0.8)",
                            borderRadius: 3,
                            backdropFilter: "blur(5px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                            overflow: "hidden",
                            "&::before": isSelected ? {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: "4px",
                              background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                            } : {},
                          "&:hover": {
                            borderColor: color,
                              transform: "translateY(-6px) scale(1.02)",
                              boxShadow: `0 8px 25px ${color}40`,
                              bgcolor: isSelected 
                                ? `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)` 
                                : `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
                          },
                        }}
                        onClick={() => setFormData((prev) => ({ ...prev, type: key }))}
                      >
                          <CardContent sx={{ textAlign: "center", py: 3, px: 2 }}>
                            <Box
                              sx={{
                                display: "inline-flex",
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: isSelected ? `${color}20` : "rgba(0, 0, 0, 0.05)",
                                mb: 1.5,
                                transition: "all 0.3s ease",
                              }}
                            >
                              <Icon sx={{ fontSize: { xs: 36, md: 48 }, color }} />
                            </Box>
                            <Typography 
                              variant="body1" 
                              fontWeight={isSelected ? 700 : 600}
                              sx={{ 
                                fontSize: { xs: "0.875rem", md: "1rem" },
                                color: isSelected ? color : "text.primary",
                              }}
                            >
                            {label}
                          </Typography>
                            {isSelected && (
                              <Box sx={{ mt: 1 }}>
                                <CheckCircle 
                                  sx={{ 
                                    color, 
                                    fontSize: 24,
                                    animation: "scaleIn 0.3s ease",
                                    "@keyframes scaleIn": {
                                      from: { transform: "scale(0)", opacity: 0 },
                                      to: { transform: "scale(1)", opacity: 1 },
                                    },
                                  }} 
                                />
                              </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    );
                  })}
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Section Localisation et Référence */}
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: "rgba(102, 126, 234, 0.05)",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                      <LocationOn sx={{ color: "#667eea", fontSize: 24 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}>
                        Localisation et Référence
                      </Typography>
                      <Chip label="Obligatoire" size="small" color="error" sx={{ ml: "auto", fontWeight: 600 }} />
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Pays *"
                          name="pays"
                          value={formData.pays}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Pays où se trouve le bien immobilier. Cette information est essentielle pour le contrôle interne, l'audit et la conformité réglementaire. Exemple : Niger, Burkina Faso, etc."
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Ville *"
                          name="ville"
                          value={formData.ville}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Ville où se trouve le bien immobilier. Information obligatoire pour la localisation précise et le suivi géographique des IHE."
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Quartier *"
                          name="quartier"
                          value={formData.quartier}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Quartier, zone ou secteur où se trouve le bien. Permet une localisation précise pour les visites, évaluations et cessions."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Référence titre foncier *"
                          name="referenceTitreFoncier"
                          value={formData.referenceTitreFoncier}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Référence officielle du titre foncier (TF), lot ou parcelle. Cette référence est CRITIQUE pour le contrôle interne, l'audit et les vérifications réglementaires. Elle permet d'identifier de manière unique le bien et de vérifier sa légalité. Format : TF-2024-001, Lot 123, Parcelle 456, etc."
                          placeholder="Ex: TF-2024-001, Lot 123, Parcelle 456"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Section 1: Informations essentielles */}
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: "rgba(102, 126, 234, 0.05)",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                      <Info sx={{ color: "#667eea", fontSize: 24 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}>
                        Informations essentielles
                </Typography>
                      <Chip label="Obligatoire" size="small" color="error" sx={{ ml: "auto", fontWeight: 600 }} />
                    </Box>
                <Grid container spacing={3}>
                      <Grid item xs={12}>
                    <TextField
                      fullWidth
                          label="Titre de l'IHE *"
                      name="titre"
                      value={formData.titre}
                      onChange={handleChange}
                      required
                      variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Titre descriptif de l'immobilisation hors exploitation (IHE). Doit être clair et précis pour faciliter l'identification dans les rapports, audits et contrôles. Exemple : 'Maison villa - Zone 1 - Niamey' ou 'Terrain viabilisé - Lotissement ABC'"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Superficie *"
                      name="superficie"
                      type="number"
                      value={formData.superficie}
                      onChange={handleChange}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <TextField
                              select
                              value={formData.uniteSuperficie}
                              onChange={(e) => setFormData((prev) => ({ ...prev, uniteSuperficie: e.target.value }))}
                                  sx={{ width: 100 }}
                              variant="standard"
                            >
                              <MenuItem value="m²">m²</MenuItem>
                              <MenuItem value="ha">ha</MenuItem>
                              <MenuItem value="are">are</MenuItem>
                            </TextField>
                          </InputAdornment>
                        ),
                      }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Superficie totale du bien immobilier. Utilisez l'unité appropriée (m² pour les maisons/appartements, ha ou are pour les terrains). Cette information est essentielle pour l'évaluation et la valorisation du bien."
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date d'entrée en IHE *"
                      name="dateEntreeIHE"
                      type="date"
                      value={formData.dateEntreeIHE}
                      onChange={handleChange}
                      required
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                      helperText="Date pivot pour le calcul du délai réglementaire de 2 ans (24 mois). C'est la date à laquelle le bien est entré dans les comptes de la banque en tant qu'IHE. Cette date est CRITIQUE pour le suivi réglementaire BCEAO et détermine la date limite de cession pour les immeubles repris en garantie."
                    />
                  </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Valeur comptable brute à l'entrée *"
                          name="valeurComptableBruteEntree"
                          type="number"
                          value={formData.valeurComptableBruteEntree}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney sx={{ color: "#667eea" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Valeur comptable brute à l'entrée dans les comptes de la banque (en FCFA). Cette valeur correspond au prix d'adjudication, de dation en paiement ou d'achat direct selon l'origine de l'IHE. C'est la valeur d'entrée à l'actif, avant amortissements et provisions. La valeur nette comptable sera calculée automatiquement par la comptabilité."
                        />
                      </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={4}
                          placeholder="Décrivez l'IHE en détail (caractéristiques principales, état général, etc.)..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Description détaillée de l'immobilisation : caractéristiques physiques, état général, équipements, accessibilité, environnement, etc. Cette description est importante pour les évaluations, les visites et les documents de cession."
                    />
                  </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Section 2: Informations financières détaillées */}
                <Accordion
                  defaultExpanded={false}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: "none",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    "&:before": { display: "none" },
                    "&.Mui-expanded": {
                      margin: 0,
                      marginBottom: 3,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: "#667eea" }} />}
                    sx={{
                      borderRadius: 3,
                      px: 2,
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.05)",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <AccountBalance sx={{ color: "#667eea", fontSize: 24 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
                        Informations financières détaillées
                      </Typography>
                      <Chip label="Optionnel" size="small" color="info" sx={{ ml: 1, fontWeight: 600 }} />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          select
                          label="Origine de l'IHE *"
                          name="origineIHE"
                          value={formData.origineIHE}
                          onChange={handleChange}
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Origine de l'immobilisation hors exploitation. Cette information détermine les champs financiers à renseigner et impacte le traitement réglementaire. Les immeubles repris en garantie (adjudication ou dation) bénéficient d'une tolérance de 2 ans avant inclusion dans le plafond IHE."
                        >
                          <MenuItem value="">-- Sélectionner --</MenuItem>
                          <MenuItem value="adjudication">Reprise de garantie – Adjudication</MenuItem>
                          <MenuItem value="dation">Reprise de garantie – Dation en paiement</MenuItem>
                          <MenuItem value="achat">Achat direct</MenuItem>
                          <MenuItem value="autre">Autre</MenuItem>
                        </TextField>
                      </Grid>

                      {/* Champs selon l'origine */}
                      {formData.origineIHE === "adjudication" && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Valeur d'adjudication *"
                              name="valeurAdjudication"
                              type="number"
                              value={formData.valeurAdjudication}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney sx={{ color: "#667eea" }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                              helperText="Valeur lors de l'adjudication publique (en FCFA). C'est le montant pour lequel le bien a été adjugé lors de la vente aux enchères. Cette valeur sera automatiquement utilisée comme valeur comptable brute à l'entrée."
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Date d'acquisition / d'entrée"
                              name="dateAcquisition"
                              type="date"
                              value={formData.dateAcquisition}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarToday fontSize="small" color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                              helperText="Date de l'adjudication publique. Cette date peut être utilisée pour le calcul réglementaire si différente de la date d'entrée en IHE."
                            />
                          </Grid>
                        </>
                      )}

                      {formData.origineIHE === "dation" && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Valeur de dation *"
                              name="valeurDation"
                              type="number"
                              value={formData.valeurDation}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney sx={{ color: "#667eea" }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                              helperText="Valeur lors de la dation en paiement (en FCFA). C'est le montant pour lequel le bien a été accepté en paiement d'une créance. Cette valeur sera automatiquement utilisée comme valeur comptable brute à l'entrée."
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Date d'acquisition / d'entrée"
                              name="dateAcquisition"
                              type="date"
                              value={formData.dateAcquisition}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarToday fontSize="small" color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                              helperText="Date de la dation en paiement. Cette date peut être utilisée pour le calcul réglementaire si différente de la date d'entrée en IHE."
                            />
                          </Grid>
                        </>
                      )}

                      {formData.origineIHE === "achat" && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Valeur d'acquisition *"
                              name="valeurAcquisition"
                              type="number"
                              value={formData.valeurAcquisition}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney sx={{ color: "#667eea" }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                              helperText="Valeur d'achat direct (en FCFA). C'est le montant payé par la banque pour acquérir directement le bien. Cette valeur sera automatiquement utilisée comme valeur comptable brute à l'entrée."
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Date d'acquisition *"
                              name="dateAcquisition"
                              type="date"
                              value={formData.dateAcquisition}
                              onChange={handleChange}
                              required
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarToday fontSize="small" color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                              helperText="Date d'achat direct du bien. Cette date peut être utilisée pour le calcul réglementaire si différente de la date d'entrée en IHE."
                            />
                          </Grid>
                        </>
                      )}

                      {/* Valeur nette comptable (calculée, en lecture seule) */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Valeur nette comptable"
                          name="valeurNetteComptable"
                          type="number"
                          value={formData.valeurNetteComptable || ""}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney sx={{ color: "#667eea" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Valeur nette comptable calculée automatiquement par la comptabilité (valeur brute – amortissements – provisions). Ce champ est en lecture seule et ne doit PAS être saisi manuellement. La valeur nette est utilisée pour le calcul du plafond IHE et les états financiers."
                        />
                      </Grid>

                      {/* Valeur de cession (pour la sortie) */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Valeur de cession"
                          name="valeurCession"
                          type="number"
                          value={formData.valeurCession}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney sx={{ color: "#667eea" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Prix de vente ou valeur estimée de cession (en FCFA). Ce champ doit être rempli uniquement au moment de la vente ou lors de la mise à jour du plan de cession. Permet de suivre les plus-values/moins-values réalisées."
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Section 3: Suivi réglementaire et cession */}
                <Accordion
                  defaultExpanded={false}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: "none",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    "&:before": { display: "none" },
                    "&.Mui-expanded": {
                      margin: 0,
                      marginBottom: 3,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: "#667eea" }} />}
                    sx={{
                      borderRadius: 3,
                      px: 2,
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.05)",
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday sx={{ color: "#667eea" }} />
                      Suivi réglementaire et cession
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pb: 3 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Suivi réglementaire selon les règles BCEAO : tolérance de 2 ans (24 mois) pour les immeubles repris en garantie avant inclusion dans le plafond IHE.
                    </Alert>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          select
                          label="Type réglementaire d'IHE *"
                          name="typeReglementaireIHE"
                          value={formData.typeReglementaireIHE}
                          onChange={handleChange}
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Classification réglementaire selon les règles BCEAO. 'Immeuble repris en réalisation de garantie' bénéficie d'une tolérance de 2 ans (24 mois) avant inclusion dans le plafond IHE de 15%. 'Autre IHE' inclut les investissements, terrains, etc. et peut être soumis à d'autres règles."
                        >
                          <MenuItem value="">-- Sélectionner --</MenuItem>
                          <MenuItem value="reprise_garantie">Immeuble repris en réalisation de garantie</MenuItem>
                          <MenuItem value="autre">Autre IHE (investissement, terrain, etc.)</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Date d'entrée en IHE (réglementaire)"
                          name="dateEntreeIHEReglementaire"
                          type="date"
                          value={formData.dateEntreeIHEReglementaire}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Date d'entrée spécifique pour le calcul réglementaire BCEAO. Si différente de la date d'entrée principale, cette date sera utilisée pour calculer la date limite réglementaire de cession (24 mois pour les reprises de garantie)."
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Date limite réglementaire de cession"
                          name="dateLimiteReglementaire"
                          type="date"
                          value={formData.dateLimiteReglementaire}
                          disabled
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText={formData.typeReglementaireIHE === "reprise_garantie" 
                            ? "Date limite réglementaire de cession calculée automatiquement : Date d'entrée + 24 mois (non modifiable). Selon les règles BCEAO, les immeubles repris en garantie ont une tolérance de 2 ans avant inclusion dans le plafond IHE. Cette date déclenche les alertes réglementaires."
                            : "Non applicable pour ce type d'IHE. La date limite réglementaire de 24 mois ne s'applique qu'aux immeubles repris en réalisation de garantie."}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          Prorogation Commission bancaire
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.prorogationCommissionBancaire}
                              onChange={(e) => setFormData((prev) => ({ ...prev, prorogationCommissionBancaire: e.target.checked }))}
                            />
                          }
                          label="Prorogation accordée"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                          La Commission bancaire peut accorder une prorogation au-delà du délai réglementaire de 24 mois pour les immeubles repris en garantie. Cochez cette case si une prorogation a été accordée et renseignez les dates ci-dessous.
                        </Typography>
                      </Grid>

                      {formData.prorogationCommissionBancaire && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Date de décision"
                              name="dateDecisionProrogation"
                              type="date"
                              value={formData.dateDecisionProrogation}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                              helperText="Date à laquelle la Commission bancaire a pris la décision d'accorder la prorogation. Cette date doit être documentée et conservée pour justifier l'extension du délai réglementaire lors des contrôles."
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Nouvelle date limite de cession"
                              name="nouvelleDateLimiteCession"
                              type="date"
                              value={formData.nouvelleDateLimiteCession}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                              helperText="Nouvelle date limite de cession accordée par la Commission bancaire suite à la prorogation. Cette date remplace la date limite réglementaire initiale (24 mois) et devient la référence pour le suivi et les alertes."
                            />
                          </Grid>
                        </>
                      )}

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          Inclusion dans le plafond 15%
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.inclusDansPlafond15}
                              onChange={(e) => setFormData((prev) => ({ ...prev, inclusDansPlafond15: e.target.checked }))}
                            />
                          }
                          label="Inclus dans le calcul IHE (plafond 15%)"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                          Selon les règles BCEAO, les IHE sont soumises à un plafond de 15% des fonds propres. Les immeubles repris en garantie sont exclus du calcul pendant 2 ans. Décochez cette case si l'IHE est exclue du plafond et précisez le motif.
                        </Typography>
                      </Grid>

                      {!formData.inclusDansPlafond15 && (
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Motif d'exclusion"
                            name="motifExclusionPlafond"
                            value={formData.motifExclusionPlafond}
                            onChange={handleChange}
                            select
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          >
                            <MenuItem value="">-- Sélectionner --</MenuItem>
                            <MenuItem value="reprise_2_ans">Reprise de garantie &lt; 2 ans</MenuItem>
                            <MenuItem value="logement_personnel">Logement personnel</MenuItem>
                            <MenuItem value="autre">Autre</MenuItem>
                          </TextField>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                            Motif justifiant l'exclusion du calcul du plafond IHE de 15%. 'Reprise de garantie &lt; 2 ans' : exclusion automatique pendant la période de tolérance réglementaire. 'Logement personnel' : exclusion selon les règles spécifiques BCEAO. 'Autre' : préciser dans les commentaires.
                          </Typography>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Plan de cession"
                          name="planCession"
                          value={formData.planCession}
                          onChange={handleChange}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Plan de cession détaillé : stratégie de vente, marché cible, prix estimé, calendrier prévisionnel, obstacles potentiels, documents de référence (expertises, avis de valeur, etc.). Ce plan est essentiel pour le suivi et la réalisation de la cession dans les délais réglementaires."
                          placeholder="Décrivez le plan de cession prévu pour ce bien..."
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Section 4: Informations complémentaires */}
                <Accordion
                  defaultExpanded={false}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: "none",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    "&:before": { display: "none" },
                    "&.Mui-expanded": {
                      margin: 0,
                      marginBottom: 3,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: "#667eea" }} />}
                    sx={{
                      borderRadius: 3,
                      px: 2,
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.05)",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Person sx={{ color: "#667eea", fontSize: 24 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
                        Informations complémentaires
                      </Typography>
                      <Chip label="Optionnel" size="small" color="info" sx={{ ml: 1, fontWeight: 600 }} />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          Références obligatoires
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Référence client interne *"
                          name="referenceClientInterne"
                          value={formData.referenceClientInterne}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Référence client interne (ID client ou numéro de dossier). Cette référence est OBLIGATOIRE pour établir le lien avec le module crédit et permettre la traçabilité complète de l'IHE depuis son origine. Facilite les contrôles internes et les audits."
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Référence du prêt d'origine"
                          name="referencePretOrigine"
                          value={formData.referencePretOrigine}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Référence du prêt à l'origine de l'IHE (si l'IHE provient d'une garantie non honorée). Permet de faire le lien avec le module crédit et de comprendre le contexte de l'acquisition."
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Référence de la garantie"
                          name="referenceGarantie"
                          value={formData.referenceGarantie}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Référence de la garantie dans le module garanties (si applicable). Permet de tracer l'IHE depuis la garantie initiale jusqu'à sa reprise et sa cession. Essentiel pour la traçabilité complète."
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          Informations complémentaires
                        </Typography>
                      </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                          label="Nom du client"
                          name="nomClient"
                          value={formData.nomClient}
                      onChange={handleChange}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          helperText="Nom du client ou propriétaire d'origine du bien. Cette information permet de tracer l'origine de l'IHE et de comprendre le contexte de son acquisition (défaillance de paiement, dation en paiement, etc.). Utile pour les audits et la traçabilité."
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Notes internes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Notes internes pour la gestion..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                      helperText="Notes internes réservées à l'usage de la banque : informations confidentielles, stratégies de cession, contacts, négociations en cours, obstacles identifiés, etc. Ces notes ne sont pas destinées à être partagées avec des tiers."
                    />
                  </Grid>
                      <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Commentaires"
                      name="commentaires"
                      value={formData.commentaires}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Commentaires généraux sur l'IHE..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                      helperText="Commentaires généraux sur l'IHE : observations, contexte particulier, historique, informations complémentaires utiles pour le suivi et la gestion. Ces commentaires peuvent être partagés dans les rapports internes."
                    />
                  </Grid>
                </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Box>
        );

      case 1:
        return (
          <Card 
            elevation={0}
            sx={{ 
              borderLeft: "4px solid #f44336",
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(244, 67, 54, 0.2)",
              boxShadow: "0 4px 20px rgba(244, 67, 54, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 30px rgba(244, 67, 54, 0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(244, 67, 54, 0.1)",
                    width: 48,
                    height: 48,
                    border: "2px solid #f44336",
                  }}
                >
                <LocationOn sx={{ color: "#f44336", fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                  Localisation géographique
                </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Indiquez l'emplacement précis de l'IHE
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />

              {/* Section Adresse principale */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  background: "rgba(244, 67, 54, 0.05)",
                  border: "1px solid rgba(244, 67, 54, 0.2)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <LocationOn sx={{ color: "#f44336", fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
                      Adresse principale
                    </Typography>
                    <Chip label="Obligatoire" size="small" color="error" sx={{ ml: "auto", fontWeight: 600 }} />
                  </Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse complète"
                    name="adresse"
                    value={localisation.adresse}
                    onChange={handleLocalisationChange}
                    placeholder="Ex: Rue 123, Secteur..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                              <LocationOn sx={{ color: "#f44336" }} />
                        </InputAdornment>
                      ),
                    }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                        helperText="Adresse complète de l'IHE"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ville *"
                    name="ville"
                    value={localisation.ville}
                    onChange={handleLocalisationChange}
                    required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                    helperText="Ville où se trouve l'IHE"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quartier"
                    name="quartier"
                    value={localisation.quartier}
                    onChange={handleLocalisationChange}
                    placeholder="Nom du quartier"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                        helperText="Quartier ou secteur"
                  />
                </Grid>
                </Grid>
                </CardContent>
              </Card>

              {/* Section Coordonnées GPS */}
              <Accordion
                defaultExpanded={false}
                sx={{
                  borderRadius: 3,
                  boxShadow: "none",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": {
                    margin: 0,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "#f44336" }} />}
                  sx={{
                    borderRadius: 3,
                    px: 2,
                    "&:hover": {
                      bgcolor: "rgba(244, 67, 54, 0.05)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <LocationOn sx={{ color: "#f44336", fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
                      Coordonnées GPS
                    </Typography>
                    <Chip label="Optionnel" size="small" color="info" sx={{ ml: 1, fontWeight: 600 }} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Les coordonnées GPS permettent d'afficher l'IHE sur une carte interactive
                  </Typography>
                  <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    type="number"
                    value={localisation.latitude}
                    onChange={handleLocalisationChange}
                    helperText="Ex: 12.345678"
                    InputProps={{
                      inputProps: { step: "any" },
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn fontSize="small" sx={{ color: "#f44336" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    type="number"
                    value={localisation.longitude}
                    onChange={handleLocalisationChange}
                    helperText="Ex: -1.234567"
                    InputProps={{
                      inputProps: { step: "any" },
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn fontSize="small" sx={{ color: "#f44336" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                    }}
                  />
                </Grid>
              </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card 
            elevation={0}
            sx={{ 
              borderLeft: "4px solid #9c27b0",
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(156, 39, 176, 0.2)",
              boxShadow: "0 4px 20px rgba(156, 39, 176, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 30px rgba(156, 39, 176, 0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
                <Avatar
                  sx={{
                    bgcolor: "rgba(156, 39, 176, 0.1)",
                    width: 48,
                    height: 48,
                    border: "2px solid #9c27b0",
                  }}
                >
                <Home sx={{ color: "#9c27b0", fontSize: 28 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                  Caractéristiques du bien
                </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Détails supplémentaires sur les équipements et caractéristiques
                  </Typography>
                </Box>
                <Chip 
                  label="Optionnel" 
                  size="small" 
                  color="info" 
                  sx={{ 
                    fontWeight: 600,
                    borderRadius: 2,
                  }} 
                />
              </Box>
              <Divider sx={{ mb: 3 }} />

              {/* Section Informations sur les pièces (si applicable) */}
                {formData.type !== "terrain" && formData.type !== "jardin" && (
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: "rgba(156, 39, 176, 0.05)",
                    border: "1px solid rgba(156, 39, 176, 0.2)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Home sx={{ color: "#9c27b0", fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
                        Informations sur les pièces
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nombre de chambres"
                        name="nbChambres"
                        type="number"
                        value={caracteristiques.nbChambres}
                        onChange={handleCaracteristiquesChange}
                        InputProps={{
                          inputProps: { min: 0 },
                        }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nombre de salles de bain"
                        name="nbSallesBain"
                        type="number"
                        value={caracteristiques.nbSallesBain}
                        onChange={handleCaracteristiquesChange}
                        InputProps={{
                          inputProps: { min: 0 },
                        }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nombre de salons"
                        name="nbSalons"
                        type="number"
                        value={caracteristiques.nbSalons}
                        onChange={handleCaracteristiquesChange}
                        InputProps={{
                          inputProps: { min: 0 },
                        }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Année de construction"
                        name="anneeConstruction"
                        type="number"
                        value={caracteristiques.anneeConstruction}
                        onChange={handleCaracteristiquesChange}
                        InputProps={{
                          inputProps: { min: 1900, max: new Date().getFullYear() },
                        }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="État général"
                        name="etatGeneral"
                        value={caracteristiques.etatGeneral}
                        onChange={handleCaracteristiquesChange}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                      >
                        <MenuItem value="">Non spécifié</MenuItem>
                        <MenuItem value="neuf">Neuf</MenuItem>
                        <MenuItem value="bon">Bon</MenuItem>
                        <MenuItem value="moyen">Moyen</MenuItem>
                        <MenuItem value="a_renover">À rénover</MenuItem>
                      </TextField>
                    </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Section Équipements et services */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  background: "rgba(156, 39, 176, 0.05)",
                  border: "1px solid rgba(156, 39, 176, 0.2)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                    <Home sx={{ color: "#9c27b0", fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
                    Équipements et services
                  </Typography>
                  </Box>
                  <Grid container spacing={2}>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `2px solid ${caracteristiques.garage ? "#2196f3" : "rgba(0, 0, 0, 0.08)"}`,
                      borderRadius: 3,
                      cursor: "pointer",
                      bgcolor: caracteristiques.garage 
                        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)" 
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(5px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": caracteristiques.garage ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "linear-gradient(90deg, #2196f3 0%, #1976d2 100%)",
                      } : {},
                      "&:hover": { 
                        borderColor: "#2196f3",
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 20px rgba(33, 150, 243, 0.2)",
                        bgcolor: caracteristiques.garage 
                          ? "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%)" 
                          : "rgba(33, 150, 243, 0.05)",
                      },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, garage: !prev.garage }))}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={caracteristiques.garage} 
                          sx={{
                            color: "#2196f3",
                            "&.Mui-checked": {
                              color: "#2196f3",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography fontWeight={caracteristiques.garage ? 600 : 500}>
                          Garage
                        </Typography>
                      }
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `2px solid ${caracteristiques.piscine ? "#2196f3" : "rgba(0, 0, 0, 0.08)"}`,
                      borderRadius: 3,
                      cursor: "pointer",
                      bgcolor: caracteristiques.piscine 
                        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)" 
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(5px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&::before": caracteristiques.piscine ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "linear-gradient(90deg, #2196f3 0%, #1976d2 100%)",
                      } : {},
                      "&:hover": { 
                        borderColor: "#2196f3",
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 20px rgba(33, 150, 243, 0.2)",
                        bgcolor: caracteristiques.piscine 
                          ? "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%)" 
                          : "rgba(33, 150, 243, 0.05)",
                      },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, piscine: !prev.piscine }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.piscine} sx={{ color: "#2196f3", "&.Mui-checked": { color: "#2196f3" } }} />}
                      label={<Typography fontWeight={caracteristiques.piscine ? 600 : 500}>Piscine</Typography>}
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `2px solid ${caracteristiques.jardin ? "#2196f3" : "rgba(0, 0, 0, 0.08)"}`,
                      borderRadius: 3,
                      cursor: "pointer",
                      bgcolor: caracteristiques.jardin 
                        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)" 
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(5px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&::before": caracteristiques.jardin ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "linear-gradient(90deg, #2196f3 0%, #1976d2 100%)",
                      } : {},
                      "&:hover": { 
                        borderColor: "#2196f3",
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 20px rgba(33, 150, 243, 0.2)",
                        bgcolor: caracteristiques.jardin 
                          ? "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%)" 
                          : "rgba(33, 150, 243, 0.05)",
                      },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, jardin: !prev.jardin }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.jardin} sx={{ color: "#2196f3", "&.Mui-checked": { color: "#2196f3" } }} />}
                      label={<Typography fontWeight={caracteristiques.jardin ? 600 : 500}>Jardin</Typography>}
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `2px solid ${caracteristiques.climatisation ? "#2196f3" : "rgba(0, 0, 0, 0.08)"}`,
                      borderRadius: 3,
                      cursor: "pointer",
                      bgcolor: caracteristiques.climatisation 
                        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)" 
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(5px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&::before": caracteristiques.climatisation ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "linear-gradient(90deg, #2196f3 0%, #1976d2 100%)",
                      } : {},
                      "&:hover": { 
                        borderColor: "#2196f3",
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 20px rgba(33, 150, 243, 0.2)",
                        bgcolor: caracteristiques.climatisation 
                          ? "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%)" 
                          : "rgba(33, 150, 243, 0.05)",
                      },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, climatisation: !prev.climatisation }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.climatisation} sx={{ color: "#2196f3", "&.Mui-checked": { color: "#2196f3" } }} />}
                      label={<Typography fontWeight={caracteristiques.climatisation ? 600 : 500}>Climatisation</Typography>}
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `2px solid ${caracteristiques.electricite ? "#2196f3" : "rgba(0, 0, 0, 0.08)"}`,
                      borderRadius: 3,
                      cursor: "pointer",
                      bgcolor: caracteristiques.electricite 
                        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)" 
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(5px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&::before": caracteristiques.electricite ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "linear-gradient(90deg, #2196f3 0%, #1976d2 100%)",
                      } : {},
                      "&:hover": { 
                        borderColor: "#2196f3",
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 20px rgba(33, 150, 243, 0.2)",
                        bgcolor: caracteristiques.electricite 
                          ? "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%)" 
                          : "rgba(33, 150, 243, 0.05)",
                      },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, electricite: !prev.electricite }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.electricite} sx={{ color: "#2196f3", "&.Mui-checked": { color: "#2196f3" } }} />}
                      label={<Typography fontWeight={caracteristiques.electricite ? 600 : 500}>Électricité</Typography>}
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `2px solid ${caracteristiques.eau ? "#2196f3" : "rgba(0, 0, 0, 0.08)"}`,
                      borderRadius: 3,
                      cursor: "pointer",
                      bgcolor: caracteristiques.eau 
                        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)" 
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(5px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&::before": caracteristiques.eau ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "linear-gradient(90deg, #2196f3 0%, #1976d2 100%)",
                      } : {},
                      "&:hover": { 
                        borderColor: "#2196f3",
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 20px rgba(33, 150, 243, 0.2)",
                        bgcolor: caracteristiques.eau 
                          ? "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%)" 
                          : "rgba(33, 150, 243, 0.05)",
                      },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, eau: !prev.eau }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.eau} sx={{ color: "#2196f3", "&.Mui-checked": { color: "#2196f3" } }} />}
                      label={<Typography fontWeight={caracteristiques.eau ? 600 : 500}>Eau</Typography>}
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `2px solid ${caracteristiques.securite ? "#2196f3" : "rgba(0, 0, 0, 0.08)"}`,
                      borderRadius: 3,
                      cursor: "pointer",
                      bgcolor: caracteristiques.securite 
                        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)" 
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(5px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&::before": caracteristiques.securite ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "linear-gradient(90deg, #2196f3 0%, #1976d2 100%)",
                      } : {},
                      "&:hover": { 
                        borderColor: "#2196f3",
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 20px rgba(33, 150, 243, 0.2)",
                        bgcolor: caracteristiques.securite 
                          ? "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%)" 
                          : "rgba(33, 150, 243, 0.05)",
                      },
                    }}
                    onClick={() => setCaracteristiques((prev) => ({ ...prev, securite: !prev.securite }))}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={caracteristiques.securite} sx={{ color: "#2196f3", "&.Mui-checked": { color: "#2196f3" } }} />}
                      label={<Typography fontWeight={caracteristiques.securite ? 600 : 500}>Sécurité</Typography>}
                      sx={{ m: 0, width: "100%" }}
                    />
                  </Paper>
                </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Champs spécifiques Jardin */}
              {formData.type === "jardin" && (
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: "rgba(76, 175, 80, 0.05)",
                    border: "1px solid rgba(76, 175, 80, 0.2)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                      <Nature sx={{ color: "#4caf50", fontSize: 24 }} />
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
                        Caractéristiques spécifiques du jardin
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          {[
                            { key: "irrigation", label: "Irrigation" },
                            { key: "cloture", label: "Clôture" },
                            { key: "arbore", label: "Arboré" },
                            { key: "potager", label: "Potager" },
                          ].map(({ key, label }) => (
                            <Grid item xs={6} sm={3} key={key}>
                              <Paper
                                elevation={caracteristiques[key] ? 2 : 0}
                                sx={{
                                  p: 2,
                                  border: `2px solid ${caracteristiques[key] ? "#4caf50" : "#e0e0e0"}`,
                                  borderRadius: 2,
                                  cursor: "pointer",
                                  bgcolor: caracteristiques[key] ? "#e8f5e9" : "white",
                                  transition: "all 0.2s",
                                  "&:hover": { borderColor: "#4caf50" },
                                }}
                                onClick={() =>
                                  setCaracteristiques((prev) => ({ ...prev, [key]: !prev[key] }))
                                }
                              >
                                <FormControlLabel
                                  control={<Checkbox checked={caracteristiques[key]} />}
                                  label={label}
                                  sx={{ m: 0, width: "100%" }}
                                />
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>

                      {/* Types d'arbres et leur nombre */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2, mb: 1 }}>
                          🌳 Types d'arbres présents
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
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
                                    label="Type d'arbre"
                                    value={arbre.type || ""}
                                    onChange={(e) => handleArbreChange(index, "type", e.target.value)}
                                    placeholder="Ex: Manguier, Oranger, Citronnier..."
                                    fullWidth
                                    size="small"
                                  />
                                  <TextField
                                    label="Nombre"
                                    type="number"
                                    value={arbre.nombre || ""}
                                    onChange={(e) => handleArbreChange(index, "nombre", e.target.value)}
                                    placeholder="Quantité"
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
                          label="Éléments présents dans le jardin"
                          name="elementsJardin"
                          value={caracteristiques.elementsJardin || ""}
                          onChange={handleCaracteristiquesChange}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Décrivez ce qu'il y a dans le jardin (ex: piscine, cabane, allées, pergola, fontaine, barbecue, espace de jeux, etc.)"
                          helperText="Décrivez tous les éléments, aménagements et installations présents dans le jardin"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        const photos = medias.filter((m) => m.type === "photo");
        const videos = medias.filter((m) => m.type === "video");
        const documents = medias.filter((m) => m.type === "document");

        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255, 152, 0, 0.1)",
                    width: 48,
                    height: 48,
                    border: "2px solid #ff9800",
                  }}
                >
                  <Photo sx={{ color: "#ff9800", fontSize: 28 }} />
                </Avatar>
              <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                    Médias et Documents
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ajoutez des photos, vidéos ou documents pour illustrer votre IHE (optionnel)
                </Typography>
                </Box>
              </Box>
              <Chip
                label={`${medias.length} média${medias.length > 1 ? "x" : ""}`}
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderWidth: 2,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              />
            </Box>

            {/* Onglets */}
            <Paper 
              elevation={0}
              sx={{ 
                mb: 3,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(5px)",
                border: "1px solid rgba(255, 152, 0, 0.2)",
                overflow: "hidden",
              }}
            >
              <Tabs
                value={mediaTab}
                onChange={(e, newValue) => setMediaTab(newValue)}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                  },
                }}
              >
                <Tab
                  icon={
                    <Badge badgeContent={photos.length} color="primary">
                      <Photo />
                    </Badge>
                  }
                  iconPosition="start"
                  label={`Photos${photos.length > 0 ? ` (${photos.length})` : ""}`}
                />
                <Tab
                  icon={
                    <Badge badgeContent={videos.length} color="primary">
                      <VideoLibrary />
                    </Badge>
                  }
                  iconPosition="start"
                  label={`Vidéos${videos.length > 0 ? ` (${videos.length})` : ""}`}
                />
                <Tab
                  icon={
                    <Badge badgeContent={documents.length} color="primary">
                      <Description />
                    </Badge>
                  }
                  iconPosition="start"
                  label={`Documents${documents.length > 0 ? ` (${documents.length})` : ""}`}
                />
              </Tabs>
            </Paper>

            {/* Contenu des onglets */}
            <Box sx={{ minHeight: 400 }}>
              {/* Onglet Photos */}
              {mediaTab === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Photos ajoutées ({photos.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => handleAddMedia("photo")}
                      size="small"
                    >
                      Ajouter une photo
                    </Button>
                  </Box>

                  {photos.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Aucune photo ajoutée. Cliquez sur "Ajouter une photo" pour commencer.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {photos.map((media, index) => (
                        <Grid item xs={12} md={6} key={media.id}>
                          <Card
                            elevation={2}
                            sx={{
                              "&:hover": {
                                boxShadow: 4,
                              },
                            }}
                          >
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Photo color="primary" />
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Photo #{index + 1}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMedia(media.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>

                              {media.preview && (
                                <Box
                                  sx={{
                                    mb: 2,
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    border: "1px solid",
                                    borderColor: "divider",
                                  }}
                                >
                                  <img
                                    src={media.preview}
                                    alt="Preview"
                                    style={{
                                      width: "100%",
                                      height: 200,
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                </Box>
                              )}

                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Titre"
                                    value={media.titre}
                                    onChange={(e) => handleMediaChange(media.id, "titre", e.target.value)}
                                    size="small"
                                    placeholder="Titre optionnel"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Description"
                                    value={media.description}
                                    onChange={(e) => handleMediaChange(media.id, "description", e.target.value)}
                                    size="small"
                                    multiline
                                    rows={2}
                                    placeholder="Description optionnelle"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Box sx={{ mb: 2 }}>
                                    <Button
                                      variant="outlined"
                                      component="label"
                                      startIcon={<CloudUpload />}
                                      fullWidth
                                      size="small"
                                      sx={{ mb: 1 }}
                                      color={media.file ? "success" : "primary"}
                                    >
                                      {media.file ? `📷 ${media.file.name}` : "Télécharger une photo"}
                                      <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            console.log("📷 [CreateIHE] Fichier photo sélectionné:", file.name, file.size);
                                            handleFileChange(media.id, file);
                                          }
                                        }}
                                      />
                                    </Button>
                                    {media.file && (
                                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mb: 1 }}>
                                        {media.preview && (
                                          <Box
                                            component="img"
                                            src={media.preview}
                                            alt="Preview"
                                            sx={{
                                              width: 100,
                                              height: 100,
                                              objectFit: "cover",
                                              borderRadius: 1,
                                              border: "1px solid #e0e0e0",
                                            }}
                                          />
                                        )}
                                        <Chip
                                          icon={<Photo />}
                                          label={`${media.file.name}`}
                                          color="success"
                                          size="small"
                                          sx={{ maxWidth: "100%" }}
                                        />
                                        <Chip
                                          label={`${(media.file.size / 1024).toFixed(2)} KB`}
                                          size="small"
                                          variant="outlined"
                                        />
                                      </Box>
                                    )}
                                  </Box>
                                  <TextField
                                    fullWidth
                                    label="URL (optionnel)"
                                    value={media.url}
                                    onChange={(e) => handleMediaChange(media.id, "url", e.target.value)}
                                    size="small"
                                    helperText="Ou fournissez une URL directe de l'image (si vous n'avez pas téléchargé de fichier)"
                                    disabled={!!media.file}
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* Onglet Vidéos */}
              {mediaTab === 1 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Vidéos ajoutées ({videos.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => handleAddMedia("video")}
                      size="small"
                    >
                      Ajouter une vidéo
                    </Button>
                  </Box>

                  {videos.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Aucune vidéo ajoutée. Cliquez sur "Ajouter une vidéo" pour commencer.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {videos.map((media, index) => (
                        <Grid item xs={12} key={media.id}>
                          <Card
                            elevation={2}
                            sx={{
                              "&:hover": {
                                boxShadow: 4,
                              },
                            }}
                          >
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <VideoLibrary color="error" />
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Vidéo #{index + 1}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMedia(media.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Titre"
                                    value={media.titre}
                                    onChange={(e) => handleMediaChange(media.id, "titre", e.target.value)}
                                    size="small"
                                    placeholder="Titre optionnel"
                                  />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Description"
                                    value={media.description}
                                    onChange={(e) => handleMediaChange(media.id, "description", e.target.value)}
                                    size="small"
                                    multiline
                                    rows={2}
                                    placeholder="Description optionnelle"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="URL de la vidéo *"
                                    value={media.url}
                                    onChange={(e) => handleMediaChange(media.id, "url", e.target.value)}
                                    size="small"
                                    placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                                    helperText="Collez le lien de la vidéo (YouTube, Vimeo, etc.)"
                                    required
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* Onglet Documents */}
              {mediaTab === 2 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Documents ajoutés ({documents.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => handleAddMedia("document")}
                      size="small"
                    >
                      Ajouter un document
                    </Button>
                  </Box>

                  {documents.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Aucun document ajouté. Cliquez sur "Ajouter un document" pour commencer.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {documents.map((media, index) => (
                        <Grid item xs={12} key={media.id}>
                          <Card
                            elevation={2}
                            sx={{
                              "&:hover": {
                                boxShadow: 4,
                              },
                            }}
                          >
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Description color="warning" />
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Document #{index + 1}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMedia(media.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Titre"
                                    value={media.titre}
                                    onChange={(e) => handleMediaChange(media.id, "titre", e.target.value)}
                                    size="small"
                                    placeholder="Titre optionnel"
                                  />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Description"
                                    value={media.description}
                                    onChange={(e) => handleMediaChange(media.id, "description", e.target.value)}
                                    size="small"
                                    multiline
                                    rows={2}
                                    placeholder="Description optionnelle"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Box sx={{ mb: 2 }}>
                                    <Button
                                      variant="outlined"
                                      component="label"
                                      startIcon={<CloudUpload />}
                                      fullWidth
                                      size="small"
                                      sx={{ mb: 1 }}
                                      color={media.file ? "success" : "primary"}
                                    >
                                      {media.file ? `📄 ${media.file.name}` : "Télécharger un document"}
                                      <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            console.log("📄 [CreateIHE] Fichier document sélectionné:", file.name, file.size);
                                            handleFileChange(media.id, file);
                                          }
                                        }}
                                      />
                                    </Button>
                                    {media.file && (
                                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mt: 1 }}>
                                        <Chip
                                          icon={<Description />}
                                          label={media.file.name || "Fichier sélectionné"}
                                          color="success"
                                          size="small"
                                          sx={{ maxWidth: "100%", fontWeight: "bold" }}
                                        />
                                        <Chip
                                          label={`${(media.file.size / 1024).toFixed(2)} KB`}
                                          size="small"
                                          variant="outlined"
                                          color="success"
                                        />
                                        <Chip
                                          label={media.file.type || "Document"}
                                          size="small"
                                          variant="outlined"
                                          color="info"
                                        />
                                      </Box>
                                    )}
                                    {!media.file && (
                                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                        Aucun fichier sélectionné
                                      </Typography>
                                    )}
                                  </Box>
                                  <TextField
                                    fullWidth
                                    label="URL (optionnel)"
                                    value={media.url}
                                    onChange={(e) => handleMediaChange(media.id, "url", e.target.value)}
                                    size="small"
                                    helperText="Ou fournissez une URL directe du document (si vous n'avez pas téléchargé de fichier)"
                                    disabled={!!media.file}
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 4:
        const TypeIcon = typesLabels[formData.type]?.icon || Home;
        const typeColor = typesLabels[formData.type]?.color || "#607d8b";
        
        return (
          <Box>
            <Card
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%)`,
                backdropFilter: "blur(20px)",
                color: "white",
                mb: 3,
                overflow: "hidden",
                position: "relative",
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: "300px",
                  height: "300px",
                  background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                  borderRadius: "50%",
                  animation: "pulse 4s ease-in-out infinite",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: "200px",
                  height: "200px",
                  background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                  borderRadius: "50%",
                  animation: "pulse 5s ease-in-out infinite",
                },
                "@keyframes pulse": {
                  "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                  "50%": { transform: "scale(1.1)", opacity: 0.8 },
                },
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 }, position: "relative", zIndex: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      width: { xs: 56, md: 64 },
                      height: { xs: 56, md: 64 },
                      border: "3px solid rgba(255,255,255,0.4)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}
                  >
                    <TypeIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}>
                      Résumé de l'IHE
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.95, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                      Vérifiez les informations avant de créer
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: "100%",
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1rem", md: "1.1rem" } }}>
                      <Home /> Informations générales
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Type
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" textTransform="capitalize">
                          {typesLabels[formData.type]?.label || formData.type}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Titre
                        </Typography>
                        <Typography variant="body1">{formData.titre}</Typography>
                      </Box>
                      {formData.superficie && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Superficie
                          </Typography>
                          <Typography variant="body1">
                            {formData.superficie} {formData.uniteSuperficie}
                          </Typography>
                        </Box>
                      )}
                      {formData.description && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Description
                          </Typography>
                          <Typography variant="body2">{formData.description}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: "100%",
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1rem", md: "1.1rem" } }}>
                      <AttachMoney /> Valeurs financières
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "primary.50",
                          borderRadius: 2,
                          borderLeft: "4px solid",
                          borderColor: "primary.main",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Valeur comptable
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {new Intl.NumberFormat("fr-FR").format(formData.valeurComptable || 0)} FCFA
                        </Typography>
                      </Box>
                      {formData.valeurAcquisition && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Valeur d'acquisition
                          </Typography>
                          <Typography variant="body1">
                            {new Intl.NumberFormat("fr-FR").format(formData.valeurAcquisition)} FCFA
                          </Typography>
                        </Box>
                      )}
                      {formData.dateAcquisition && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Date d'acquisition
                          </Typography>
                          <Typography variant="body1">
                            {new Date(formData.dateAcquisition).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {formData.dateReclassement && (
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: "100%",
                      borderRadius: 3,
                      background: "rgba(255, 255, 255, 0.7)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1rem", md: "1.1rem" } }}>
                        <CalendarToday /> Suivi réglementaire
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        {formData.dateReclassement && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              Date de reclassement
                            </Typography>
                            <Typography variant="body1">
                              {new Date(formData.dateReclassement).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </Typography>
                          </Box>
                        )}
                        {formData.dureeMaximaleDetention && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              Durée maximale de détention
                            </Typography>
                            <Typography variant="body1">
                              {formData.dureeMaximaleDetention} mois ({Math.floor(parseInt(formData.dureeMaximaleDetention) / 12)} ans)
                            </Typography>
                          </Box>
                        )}
                        {formData.dateReclassement && formData.dureeMaximaleDetention && (
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "warning.50",
                              borderRadius: 2,
                              borderLeft: "4px solid",
                              borderColor: "warning.main",
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              Date limite de cession
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="warning.main">
                              {(() => {
                                const dateReclassement = new Date(formData.dateReclassement);
                                const dureeMois = parseInt(formData.dureeMaximaleDetention) || 60;
                                const dateLimite = new Date(dateReclassement);
                                dateLimite.setMonth(dateLimite.getMonth() + dureeMois);
                                return dateLimite.toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                });
                              })()}
                            </Typography>
                          </Box>
                        )}
                        {formData.planCession && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              Plan de cession
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {formData.planCession}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: "100%",
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1rem", md: "1.1rem" } }}>
                      <LocationOn /> Localisation
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1}>
                      {localisation.adresse && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Adresse
                          </Typography>
                          <Typography variant="body2">{localisation.adresse}</Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Ville
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {localisation.ville}
                        </Typography>
                      </Box>
                      {localisation.quartier && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Quartier
                          </Typography>
                          <Typography variant="body1">{localisation.quartier}</Typography>
                        </Box>
                      )}
                      {(localisation.latitude || localisation.longitude) && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Coordonnées GPS
                          </Typography>
                          <Typography variant="body2">
                            {localisation.latitude}, {localisation.longitude}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: "100%",
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1rem", md: "1.1rem" } }}>
                      <Photo /> Médias
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: medias.length > 0 ? "success.50" : "grey.50",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="h4" fontWeight="bold" color={medias.length > 0 ? "success.main" : "text.secondary"}>
                        {medias.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        média{medias.length > 1 ? "x" : ""} ajouté{medias.length > 1 ? "s" : ""}
                      </Typography>
                      {medias.length > 0 && (
                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                          <Chip
                            label={`${medias.filter((m) => m.type === "photo").length} photo${medias.filter((m) => m.type === "photo").length > 1 ? "s" : ""}`}
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label={`${medias.filter((m) => m.type === "video").length} vidéo${medias.filter((m) => m.type === "video").length > 1 ? "s" : ""}`}
                            size="small"
                            color="error"
                          />
                          <Chip
                            label={`${medias.filter((m) => m.type === "document").length} doc${medias.filter((m) => m.type === "document").length > 1 ? "s" : ""}`}
                            size="small"
                            color="warning"
                          />
                        </Stack>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }} icon={<CheckCircle />}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Prochaines étapes
              </Typography>
              L'IHE sera créée avec le statut <strong>"En attente de validation"</strong>. Un manager devra valider avant qu'elle ne soit visible dans le système.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <Box
        sx={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "100vh",
          py: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          {/* En-tête moderne avec glassmorphism */}
        <Card
            elevation={0}
          sx={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)",
              backdropFilter: "blur(20px)",
            color: "white",
            mb: 4,
            overflow: "hidden",
            position: "relative",
              borderRadius: 4,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            "&::before": {
              content: '""',
              position: "absolute",
                top: -50,
                right: -50,
                width: "400px",
                height: "400px",
                background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                borderRadius: "50%",
                animation: "pulse 4s ease-in-out infinite",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -30,
                left: -30,
              width: "300px",
              height: "300px",
                background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              borderRadius: "50%",
                animation: "pulse 5s ease-in-out infinite",
              },
              "@keyframes pulse": {
                "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                "50%": { transform: "scale(1.1)", opacity: 0.8 },
            },
          }}
        >
            <CardContent sx={{ p: { xs: 3, md: 5 }, position: "relative", zIndex: 1 }}>
              <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
              <Avatar
                sx={{
                    bgcolor: "rgba(255,255,255,0.25)",
                    width: { xs: 56, md: 80 },
                    height: { xs: 56, md: 80 },
                    border: "3px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.1) rotate(5deg)",
                    },
                  }}
                >
                  <Add sx={{ fontSize: { xs: 28, md: 40 } }} />
              </Avatar>
                <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "300px" } }}>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: "1.75rem", md: "2.125rem" },
                      textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    }}
                  >
                  Nouvelle Immobilisation Hors Exploitation
                </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.95,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      lineHeight: 1.6,
                    }}
                  >
                  Saisissez les informations de l'IHE. Elle sera en attente de validation par un manager.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

          {/* Stepper moderne avec animations */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, md: 4 }, 
              mb: 4, 
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
          <Stepper
            activeStep={currentStep}
            sx={{
              "& .MuiStepLabel-root": {
                "& .MuiStepLabel-label": {
                  fontWeight: 600,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    "&.Mui-active": {
                      color: "#667eea",
                      fontWeight: 700,
                },
                "&.Mui-completed": {
                  color: "#4caf50",
                },
                  },
                },
                "& .MuiStepConnector-root": {
                  top: 24,
                  left: "calc(-50% + 24px)",
                  right: "calc(50% + 24px)",
                },
                "& .MuiStepConnector-line": {
                  borderTopWidth: 3,
                  borderRadius: 1,
                },
            }}
          >
            {steps.map((label, index) => {
              const icons = [Home, LocationOn, Home, Photo, CheckCircle];
              const Icon = icons[index] || Home;
              return (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Avatar
                        sx={{
                            bgcolor: completed 
                              ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)" 
                              : active 
                              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                              : "rgba(0, 0, 0, 0.1)",
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            boxShadow: active || completed 
                              ? "0 4px 15px rgba(102, 126, 234, 0.4)" 
                              : "0 2px 8px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: active ? "scale(1.1)" : "scale(1)",
                            border: active || completed 
                              ? "3px solid rgba(255, 255, 255, 0.5)" 
                              : "2px solid rgba(0, 0, 0, 0.1)",
                            "&:hover": {
                              transform: "scale(1.15)",
                              boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                            },
                          }}
                        >
                          <Icon sx={{ color: completed || active ? "white" : "rgba(0, 0, 0, 0.5)", fontSize: { xs: 20, sm: 24 } }} />
                      </Avatar>
                    )}
                  >
                      <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    {label}
                      </Box>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Paper>

        {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(244, 67, 54, 0.2)",
                animation: "slideIn 0.3s ease-out",
                "@keyframes slideIn": {
                  from: { transform: "translateY(-10px)", opacity: 0 },
                  to: { transform: "translateY(0)", opacity: 1 },
                },
              }} 
              onClose={() => setError("")}
            >
            {error}
          </Alert>
        )}

        {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)",
                animation: "slideIn 0.3s ease-out",
              }}
            >
            {success}
          </Alert>
        )}

          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, md: 4 }, 
              borderRadius: 3, 
              mb: 3,
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
          {renderStepContent()}
        </Paper>

          {/* Navigation moderne */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, md: 3 }, 
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}>
            <Button
              disabled={currentStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              variant="outlined"
              size="large"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  borderWidth: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateX(-4px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                  "&:disabled": {
                    opacity: 0.4,
                  },
                }}
            >
              Précédent
            </Button>

            <Chip
              label={`Étape ${currentStep + 1} sur ${steps.length}`}
              color="primary"
              variant="outlined"
                sx={{
                  fontWeight: 600,
                  px: 1,
                  borderWidth: 2,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
            />

            {currentStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || uploadingMedias}
                startIcon={loading || uploadingMedias ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                size="large"
                  sx={{ 
                    minWidth: { xs: "100%", sm: 200 },
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                      transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                      background: "rgba(0, 0, 0, 0.12)",
                      boxShadow: "none",
                    },
                  }}
              >
                {loading || uploadingMedias ? (uploadingMedias ? "Upload des médias..." : "Création...") : "Créer l'IHE"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                size="large"
                  sx={{ 
                    minWidth: { xs: "100%", sm: 150 },
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                      transform: "translateX(4px)",
                    },
                  }}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
      </Box>
    </PageLayout>
  );
};

export default CreateIHEPage;

