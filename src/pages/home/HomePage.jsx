import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { BASE_SERVER_URL } from "../../config/config";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Drawer,
  Pagination,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Business,
  AccountBalance,
  Landscape,
  TrendingUp,
  Security,
  Speed,
  Groups,
  CheckCircle,
  ArrowForward,
  LocationOn,
  AttachMoney,
  Star,
  Phone,
  Close as CloseIcon,
  SquareFoot,
  Email,
  Login,
  AppRegistration,
  KeyboardArrowRight,
  Support,
  Dashboard,
  Notifications,
  Person,
  Call,
  WhatsApp,
  ContentCopy,
  Description,
  ChevronRight,
  AutoAwesome,
  Gavel,
  HourglassEmpty,
  Mail,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";

// Fix pour les icônes Leaflet par défaut
if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const HomePage = () => {
  const navigate = useNavigate();
  const [openPartenaireDialog, setOpenPartenaireDialog] = useState(false);
  
  // États pour les locations dynamiques de la page d'accueil
  
  // États pour les biens immobiliers dynamiques de la page d'accueil
  const [homepageAgences, setHomepageAgences] = useState([]);
  const [loadingHomepageAgences, setLoadingHomepageAgences] = useState(false);
  const [selectedBanque, setSelectedBanque] = useState(null);
  const [openBanqueDrawer, setOpenBanqueDrawer] = useState(false);
  const parcellesPerAgence = 6; // Nombre de parcelles à afficher par agence sur la homepage
  const [homepageNotaires, setHomepageNotaires] = useState([]);
  const [loadingHomepageNotaires, setLoadingHomepageNotaires] = useState(false);
  
  // État pour le carrousel des biens immobiliers
  
  // État pour le carrousel des parcelles
  
  // État pour le carrousel des locations
  
  // État pour le carrousel des banques
  const [banquesCarouselIndex, setBanquesCarouselIndex] = useState(0);
  
  // État pour le carrousel des agences
  const [agencesCarouselIndex, setAgencesCarouselIndex] = useState(0);
  
  // État pour l'affichage progressif des features (initialement 3)
  const [featuresDisplayed, setFeaturesDisplayed] = useState(3);
  
  // État pour l'affichage progressif des agences (initialement 3)
  const [agencesDisplayed, setAgencesDisplayed] = useState(3);
  
  // État pour l'affichage progressif des banques (initialement 3)
  const [banquesDisplayed, setBanquesDisplayed] = useState(3);
  
  // État pour l'affichage progressif des locations (initialement 3)
  
  // État pour l'affichage progressif des parcelles par agence (initialement 3 par agence)
  
  // État pour l'affichage progressif des biens par agence
  
  // Ref pour le conteneur scrollable des agences
  const agencesScrollContainerRef = useRef(null);
  
  // Ref pour le conteneur scrollable des banques
  const banquesScrollContainerRef = useRef(null);
  
  // Refs pour les conteneurs scrollables des parcelles par agence
  
  // Refs pour les conteneurs scrollables des biens par agence
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Fonction pour ouvrir le drawer avec les détails d'une banque
  const handleOpenBanqueDetails = (banque) => {
    setSelectedBanque(banque);
    setOpenBanqueDrawer(true);
  };

  // Fonction pour fermer le drawer des détails de banque
  const handleCloseBanqueDetails = () => {
    setSelectedBanque(null);
    setOpenBanqueDrawer(false);
  };

  // Fonction utilitaire pour corriger les URLs d'images
  const fixImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Corriger les séparateurs de chemin
    const correctedPath = imageUrl.replace(/\\/g, '/');
    
    // Si l'URL commence déjà par http, la retourner telle quelle
    if (correctedPath.startsWith('http')) {
      return correctedPath;
    }
    
    // Sinon, construire l'URL complète
    return `${BASE_SERVER_URL}/${correctedPath}`;
  };


  const fetchHomepageAgences = async () => {
    setLoadingHomepageAgences(true);
    try {
      const response = await api.get("/admin/agences");
      const agences = Array.isArray(response.data) ? response.data : [];
      const transformed = agences.map((a, i) => ({
        id: a._id,
        nom: a.nom,
        ville: a.ville || "-",
        adresse: a.adresse || "-",
        telephone: a.telephone || "-",
        email: a.email || "-",
        description: a.description || "",
        statutJuridique: a.statutJuridique || "",
        statut: a.statut || "",
        promoteur: a.promoteur || "",
        bp: a.bp || "",
        pays: a.pays || "",
        logo: a.fichiers?.logo ? fixImageUrl(a.fichiers.logo) : null,
        createdAt: a.createdAt,
      }));
      setHomepageAgences(transformed);
    } catch (error) {
      setHomepageAgences([]);
    } finally {
      setLoadingHomepageAgences(false);
    }
  };

  // Fonction pour récupérer les notaires partenaires pour la page d'accueil
  const fetchHomepageNotaires = async () => {
    setLoadingHomepageNotaires(true);
    try {
      // Utiliser la route publique pour les notaires
      const response = await api.get("/agence/notaires/public").catch(() => ({ data: { notaires: [] } }));
      const notaires = response.data.notaires || response.data || [];
      setHomepageNotaires(notaires);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des notaires:", error);
      setHomepageNotaires([]);
    } finally {
      setLoadingHomepageNotaires(false);
    }
  };

  // Charger les locations au montage du composant
  useEffect(() => {
    fetchHomepageAgences();
    fetchHomepageNotaires();
    fetchHomepageBanques();
  }, []);

  // Données statiques pour la démonstration
  const stats = {
    agences: 12,
    banques: 5,
    parcelles: 450,
    biens: 128,
    clients: 1850,
    transactions: 340,
  };


  

  const [banquesPartenaires, setBanquesPartenaires] = useState([]);
  const [loadingBanques, setLoadingBanques] = useState(false);

  // Fonction pour charger les banques partenaires depuis l'API
  const fetchHomepageBanques = async () => {
    setLoadingBanques(true);
    try {
      const response = await api.get("/admin/banques/actives").catch(() => ({ data: { banques: [] } }));
      const banquesData = response.data.banques || response.data || [];
      setBanquesPartenaires(banquesData);
    } catch (err) {
      console.error("Erreur chargement banques:", err);
      // En cas d'erreur, utiliser des données par défaut
      setBanquesPartenaires([
        { 
          nom: "BOA Niger", 
          services: "Financement immobilier",
          description: "Banque Ouest Africaine, leader du financement immobilier au Niger",
          produits: ["Prêt immobilier jusqu'à 80% du bien", "Prêt terrain viabilisé", "Prêt construction", "Rachat de crédit"],
          avantages: ["Taux compétitifs", "Délai de remboursement jusqu'à 20 ans", "Dossier simplifié", "Accompagnement personnalisé"],
          contact: { telephone: "+227 20 73 20 00", email: "contact@boa-niger.com", siteWeb: "www.boa-niger.com" }
        },
        { 
          nom: "BIA Niger", 
          services: "Prêts fonciers",
          description: "Banque Internationale pour l'Afrique, spécialisée dans le financement foncier",
          produits: ["Prêt foncier classique", "Prêt terrain agricole", "Prêt terrain commercial", "Financement de lotissement"],
          avantages: ["Taux préférentiels pour projets agricoles", "Financement jusqu'à 70%", "Délai de grâce possible", "Expertise foncière"],
          contact: { telephone: "+227 20 73 25 00", email: "info@bia-niger.ne", siteWeb: "www.bia-niger.ne" }
        },
        { 
          nom: "Ecobank", 
          services: "Crédit habitat",
          description: "Banque panafricaine offrant des solutions de crédit habitat adaptées",
          produits: ["Crédit habitat classique", "Crédit relais", "Prêt travaux et rénovation", "Crédit auto-logement"],
          avantages: ["Réseau panafricain", "Solutions digitales innovantes", "Taux compétitifs", "Service client 24/7"],
          contact: { telephone: "+227 20 72 20 00", email: "contact@ecobank.com", siteWeb: "www.ecobank.com" }
        },
        { 
          nom: "SONIBANK", 
          services: "Financement terrain",
          description: "Société Nigérienne de Banque, partenaire de confiance pour vos projets fonciers",
          produits: ["Prêt acquisition terrain", "Prêt viabilisation", "Prêt lotissement", "Crédit-bail immobilier"],
          avantages: ["Expertise locale", "Accompagnement de A à Z", "Conditions flexibles", "Rapidité de traitement"],
          contact: { telephone: "+227 20 73 30 00", email: "contact@sonibank.ne", siteWeb: "www.sonibank.ne" }
        },
      ]);
    } finally {
      setLoadingBanques(false);
    }
  };



  const features = [
    {
      icon: <Security fontSize="large" />,
      title: "Transactions sécurisées",
      description: "Vérification renforcée des biens et meilleure sécurisation des opérations immobilières.",
      color: "#0A7C4F",
      gradient: ["#0A7C4F", "#065F3D"],
    },
    {
      icon: <LocationOn fontSize="large" />,
      title: "Biens géolocalisés",
      description: "Localisez les biens avec précision pour mieux apprécier leur emplacement et leur environnement.",
      color: "#3030F9",
      gradient: ["#3030F9", "#2020C8"],
    },
    {
      icon: <Speed fontSize="large" />,
      title: "Parcours simplifié",
      description: "Publication, consultation et mise en relation facilitées pour accélérer vos démarches immobilières.",
      color: "#0A7C4F",
      gradient: ["#0A7C4F", "#065F3D"],
    },
    {
      icon: <Groups fontSize="large" />,
      title: "Écosystème connecté",
      description: "Agences, banques, notaires, services compétents et particuliers réunis sur une même plateforme.",
      color: "#3030F9",
      gradient: ["#3030F9", "#2020C8"],
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: "Suivi en temps réel",
      description: "Accédez à l'historique complet des transactions et suivez l'évolution de vos biens instantanément.",
      color: "#0A7C4F",
      gradient: ["#0A7C4F", "#065F3D"],
    },
    {
      icon: <Support fontSize="large" />,
      title: "Accompagnement professionnel",
      description: "Bénéficiez d'un support dédié et de conseils d'experts pour toutes vos démarches immobilières.",
      color: "#0A7C4F",
      gradient: ["#0A7C4F", "#065F3D"],
    },
  ];

  // Fonctions de navigation du carrousel des banques avec scroll-snap
  const handleBanqueCarouselPrev = () => {
    if (!banquesScrollContainerRef.current) return;
    
    const container = banquesScrollContainerRef.current;
    const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
    
    // Trouver toutes les cartes dans le conteneur
    const cards = container.querySelectorAll('[data-banque-card]');
    if (cards.length === 0) return;
    
    // Trouver la carte actuellement visible (la plus proche du centre)
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    
    let currentIndex = 0;
    let minDistance = Infinity;
    
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = index;
      }
    });
    
    // Calculer l'index de la carte cible
    const targetIndex = Math.max(0, currentIndex - itemsPerView);
    
    // Faire défiler vers la carte cible
    if (cards[targetIndex]) {
      cards[targetIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    
    setBanquesCarouselIndex((prev) => Math.max(0, prev - itemsPerView));
  };

  const handleBanqueCarouselNext = () => {
    if (!banquesScrollContainerRef.current) return;
    
    const container = banquesScrollContainerRef.current;
    const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
    
    // Trouver toutes les cartes dans le conteneur
    const cards = container.querySelectorAll('[data-banque-card]');
    if (cards.length === 0) return;
    
    // Trouver la carte actuellement visible (la plus proche du centre)
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    
    let currentIndex = 0;
    let minDistance = Infinity;
    
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = index;
      }
    });
    
    // Calculer l'index de la carte cible
    const targetIndex = Math.min(cards.length - 1, currentIndex + itemsPerView);
    
    // Faire défiler vers la carte cible
    if (cards[targetIndex]) {
      cards[targetIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    
    setBanquesCarouselIndex((prev) => Math.min(banquesPartenaires.length - itemsPerView, prev + itemsPerView));
  };

  // Fonctions de navigation du carrousel des agences partenaires avec scroll-snap
  const handleAgencesCarouselPrev = () => {
    if (!agencesScrollContainerRef.current) return;
    
    const container = agencesScrollContainerRef.current;
    const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
    
    // Trouver toutes les cartes dans le conteneur
    const cards = container.querySelectorAll('[data-agence-card]');
    if (cards.length === 0) return;
    
    // Trouver la carte actuellement visible (la plus proche du centre)
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    
    let currentIndex = 0;
    let minDistance = Infinity;
    
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = index;
      }
    });
    
    // Calculer l'index de la carte cible
    const targetIndex = Math.max(0, currentIndex - itemsPerView);
    
    // Faire défiler vers la carte cible
    if (cards[targetIndex]) {
      cards[targetIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    
    setAgencesCarouselIndex((prev) => Math.max(0, prev - itemsPerView));
  };

  const handleAgencesCarouselNext = () => {
    if (!agencesScrollContainerRef.current) return;
    
    const container = agencesScrollContainerRef.current;
    const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
    
    // Trouver toutes les cartes dans le conteneur
    const cards = container.querySelectorAll('[data-agence-card]');
    if (cards.length === 0) return;
    
    // Trouver la carte actuellement visible (la plus proche du centre)
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    
    let currentIndex = 0;
    let minDistance = Infinity;
    
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = index;
      }
    });
    
    // Calculer l'index de la carte cible
    const targetIndex = Math.min(cards.length - 1, currentIndex + itemsPerView);
    
    // Faire défiler vers la carte cible
    if (cards[targetIndex]) {
      cards[targetIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    
    setAgencesCarouselIndex((prev) => Math.min(homepageAgences.length - itemsPerView, prev + itemsPerView));
  };

  // Fonctions de navigation du carrousel des features
  // Fonctions de navigation du carrousel des features avec scroll-snap
  // Fonction pour afficher 3 cartes supplémentaires
  const handleShowMoreFeatures = () => {
    setFeaturesDisplayed((prev) => Math.min(prev + 3, features.length));
  };

  const handleShowMoreAgences = () => {
    setAgencesDisplayed((prev) => Math.min(prev + 3, homepageAgences.length));
  };

  const handleShowMoreBanques = () => {
    setBanquesDisplayed((prev) => Math.min(prev + 3, banquesPartenaires.length));
  };


  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f5f7fa" }}>
      <Navbar />
      {/* Hero Section - Design Moderne */}
      <Box
        sx={{
          background: "#3030F9",
          backgroundImage: "url(/images/hero-immo.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          pt: 0,
          pb: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
          width: "100%",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(48,48,249,0.82)",
            pointerEvents: "none",
          },
        }}
      >
      <Container
  maxWidth="xl"
  sx={{
    px: { xs: 1.5, sm: 3, md: 4 },
    position: "relative",
    zIndex: 1,
    pt: { xs: 2, sm: 3, md: 4 },
    pb: { xs: 4, sm: 6, md: 8 },
    width: "100%",
  }}
>
  <Grid
    container
    spacing={{ xs: 4, md: 6 }}
    alignItems="center"
    justifyContent="space-between"
    // Sur mobile, on affiche d'abord le texte puis la carte stats
    direction={{ xs: "column", md: "row" }}
  >
    {/* Colonne texte */}
    <Grid
      item
      xs={12}
      md={6}
      sx={{
        textAlign: { xs: "center", md: "left" },
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        fontWeight={800}
        sx={{
          // h1 conservé pour le SEO / l'accessibilité, masqué visuellement (aucun espace occupé)
          position: "absolute",
          width: "1px",
          height: "1px",
          m: "-1px",
          p: 0,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Dillanci
      </Typography>

      {/* Espaceur invisible : garde la hauteur de l'ancien titre pour ne pas remonter le hero (le logo déborde dessous) */}
      <Typography
        variant="h2"
        component="div"
        aria-hidden="true"
        fontWeight={800}
        gutterBottom
        sx={{
          visibility: "hidden",
          fontSize: {
            xs: "2rem",
            sm: "2.3rem",
            md: "2.8rem",
            lg: "3.1rem",
          },
          lineHeight: { xs: 1.15, md: 1.2 },
          letterSpacing: { xs: 0.5, md: 1 },
        }}
      >
        &nbsp;
      </Typography>

      <Typography
        variant="h5"
        sx={{
          mb: 1.5,
          opacity: 0.95,
          fontWeight: 600,
          fontSize: {
            xs: "1rem",
            sm: "1.15rem",
            md: "1.25rem",
          },
          lineHeight: 1.4,
        }}
      >
        La plateforme des acteurs de l'immobilier au Niger
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          mb: 2.5,
          opacity: 0.85,
          fontSize: {
            xs: "0.9rem",
            sm: "1rem",
          },
          fontStyle: "italic",
        }}
      >
        Gérez, achetez et vendez vos biens en toute confiance
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 4,
          fontSize: {
            xs: "0.9rem",
            sm: "1rem",
          },
          opacity: 0.88,
          maxWidth: { xs: "100%", md: 520 },
          mx: { xs: "auto", md: 0 },
          lineHeight: 1.7,
        }}
      >
        Une plateforme intégrée reliant agences immobilières, banques partenaires, notaires, services compétents et particuliers pour sécuriser, vérifier et faciliter les transactions immobilières.
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          width: { xs: "100%", sm: "auto" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: { sm: "flex-start" },
        }}
      >
      <Button
  variant="contained"
  size="large"
  onClick={() => navigate("/register")}
  sx={{
    bgcolor: "white",
    color: "#3030F9",
    fontWeight: "bold",
    px: { xs: 2.4, md: 4 },
    py: { xs: 1.15, md: 1.4 },
    width: { xs: "100%", sm: "auto" },
    fontSize: {
      xs: "0.85rem",
      md: "0.95rem",
    },
    borderRadius: 2,
    boxShadow: "0 8px 24px rgba(15,23,42,0.45)",
    textTransform: "uppercase",
    "&:hover": {
      bgcolor: "#f9fafb",
      transform: { xs: "none", md: "translateY(-2px)" },
      boxShadow: "0 12px 32px rgba(15,23,42,0.55)",
    },
    transition: "all 0.25s ease",
    // 🔽 Spécial très petits écrans (< 350px)
    "@media (max-width:350px)": {
      fontSize: "0.7rem",
      px: 1.8,
      py: 0.9,
    },
  }}
  endIcon={<Dashboard sx={{ fontSize: "1.1rem" }} />}
>
  S&apos;INSCRIRE GRATUITEMENT
</Button>

<Button
  variant="outlined"
  size="large"
  onClick={() => navigate("/login")}
  sx={{
    borderColor: "rgba(255,255,255,0.8)",
    borderWidth: 2,
    color: "white",
    fontWeight: "bold",
    px: { xs: 2.4, md: 4 },
    py: { xs: 1.15, md: 1.4 },
    width: { xs: "100%", sm: "auto" },
    fontSize: {
      xs: "0.85rem",
      md: "0.95rem",
    },
    borderRadius: 2,
    bgcolor: "rgba(15,23,42,0.35)",
    backdropFilter: "blur(10px)",
    textTransform: "uppercase",
    "&:hover": {
      borderColor: "white",
      bgcolor: "rgba(15,23,42,0.6)",
      transform: { xs: "none", md: "translateY(-2px)" },
      boxShadow: "0 10px 30px rgba(15,23,42,0.55)",
    },
    transition: "all 0.25s ease",
    // 🔽 Spécial très petits écrans (< 350px)
    "@media (max-width:350px)": {
      fontSize: "0.7rem",
      px: 1.8,
      py: 0.9,
    },
  }}
  endIcon={<ArrowForward sx={{ fontSize: "1.1rem" }} />}
>
  SE CONNECTER
</Button>

      </Stack>
    </Grid>

    {/* Colonne stats / carte droite */}
    <Grid item xs={12} md={6}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: { xs: 3, md: 4 },
          bgcolor: "rgba(15,23,42,0.7)",
          backdropFilter: "blur(22px)",
          border: "1px solid rgba(148,163,184,0.5)",
          boxShadow: "0 18px 45px rgba(15,23,42,0.65)",
          maxWidth: { xs: "100%", md: 480 },
          mx: { xs: "auto", md: "unset" },
          transition: "all 0.3s ease",
          "&:hover": {
            transform: { xs: "none", md: "translateY(-4px)" },
            boxShadow: "0 22px 55px rgba(15,23,42,0.75)",
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 1.2,
            fontSize: "0.75rem",
            mb: 1.5,
            color: "white",
            fontWeight: 600,
          }}
        >
          EN UN COUP D&apos;ŒIL
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            color: "white",
            opacity: 0.95,
          }}
        >
          Un écosystème complet pour structurer la gestion foncière et immobilière.
        </Typography>

        <Grid container spacing={2}>
          {[
            { label: "Agences", value: stats.agences, color: "#3030F9" },
            { label: "Parcelles", value: stats.parcelles, color: "#0A7C4F" },
            { label: "Biens", value: stats.biens, color: "#0A7C4F" },
            { label: "Clients", value: stats.clients, color: "#ef4444" },
          ].map((item) => (
            <Grid key={item.label} item xs={6}>
              <Box
                sx={{
                  textAlign: "left",
                  p: { xs: 1.5, sm: 1.75 },
                  borderRadius: 2,
                  bgcolor: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(51,65,85,0.9)",
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
                    color: item.color,
                    mb: 0.5,
                  }}
                >
                  {item.value}+
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    letterSpacing: 0.4,
                    fontWeight: 500,
                    color: item.color,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Grid>
  </Grid>
</Container>


  {/* Forme décorative entre le hero et la section suivante */}
<Box
  sx={{
    position: "absolute",
    bottom: { xs: -30, sm: -50 },
    left: 0,
    right: 0,
    height: { xs: 70, sm: 100 },
    bgcolor: "#f5f7fa",
    clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)",
    pointerEvents: "none",
  }}
/>
</Box>

{/* Features Section */}
<Container
  maxWidth="xl"
  sx={{
    py: { xs: 5, sm: 6, md: 8 },
    px: { xs: 1.5, sm: 3 },
  }}
>
  {/* Section moderne "Pourquoi choisir Dillanci" */}
  <Box
    sx={{
      position: "relative",
      mb: { xs: 4, md: 6 },
      textAlign: "center",
    }}
  >
    {/* Badge moderne au-dessus du titre */}
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: { xs: 2, sm: 2.5 },
        py: { xs: 0.8, sm: 1 },
        mb: { xs: 2, md: 3 },
        borderRadius: "50px",
        background: "rgba(48, 48, 249, 0.08)",
        border: "1px solid rgba(48, 48, 249, 0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Star sx={{ fontSize: { xs: 18, md: 20 }, color: "#0A7C4F" }} />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          fontSize: { xs: "0.75rem", sm: "0.85rem" },
          color: "#3030F9",
        }}
      >
        Pourquoi nous choisir ?
      </Typography>
    </Box>

    {/* Titre principal avec effet de gradient */}
    <Typography
      variant="h3"
      fontWeight="bold"
      sx={{
        fontSize: {
          xs: "clamp(1.8rem, 5vw, 2.5rem)",
          sm: "clamp(2.2rem, 4.5vw, 3rem)",
          md: "clamp(2.5rem, 3.5vw, 3.5rem)",
        },
        mb: { xs: 2, md: 3 },
        color: "#0e1133",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      }}
    >
      Pourquoi choisir Dillanci ?
    </Typography>

    {/* Sous-titre moderne */}
    <Typography
      variant="h6"
      sx={{
        mb: { xs: 5, md: 7 },
        maxWidth: 800,
        mx: "auto",
        fontSize: {
          xs: "clamp(1rem, 3vw, 1.15rem)",
          sm: "clamp(1.1rem, 2.5vw, 1.25rem)",
          md: "1.3rem",
        },
        color: "text.secondary",
        lineHeight: { xs: 1.6, md: 1.7 },
        px: { xs: 2, sm: 3 },
        fontWeight: 400,
      }}
    >
      La solution pensée pour rendre l'immobilier plus fiable, plus accessible et mieux organisé au Niger.
    </Typography>

    {/* Grille moderne des features */}
    <Box
      sx={{
        mx: "auto",
        maxWidth: 1400,
        width: "100%",
        position: "relative",
      }}
    >
      <Grid 
        container 
        spacing={{ xs: 3, sm: 4, md: 5 }}
        sx={{
          width: "100%",
          margin: 0,
        }}
      >
        {features.slice(0, featuresDisplayed).map((feature, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4}
            key={index}
            sx={{
              display: "flex",
              flexBasis: { xs: "100%", sm: "calc(50% - 16px)", md: "calc(33.333% - 27px)" },
              maxWidth: { xs: "100%", sm: "calc(50% - 16px)", md: "calc(33.333% - 27px)" },
              flexGrow: 0,
              flexShrink: 0,
            }}
          >
            <Card
              elevation={0}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                borderRadius: { xs: 3, md: 4 },
                background: feature.color,
                border: "none",
                boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "5px",
                  background: "rgba(255,255,255,0.5)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: 1,
                },
                "&:hover": {
                  transform: { xs: "none", md: "translateY(-12px) scale(1.02)" },
                  boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
                  background: feature.color === "#3030F9" ? "#2020C8" : "#065F3D",
                  "&::before": {
                    transform: "scaleX(1)",
                  },
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3, sm: 3.5, md: 4 },
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: { xs: 2, md: 2.5 },
                  width: "100%",
                  boxSizing: "border-box",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Icône avec effet de glow */}
                <Box
                  sx={{
                    width: { xs: 64, sm: 72, md: 80 },
                    height: { xs: 64, sm: 72, md: 80 },
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                    position: "relative",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "scale(1.1) rotate(5deg)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: "white",
                      fontSize: { xs: "2rem", sm: "2.4rem", md: "2.8rem" },
                      position: "relative",
                      zIndex: 1,
                      transition: "transform 0.4s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                </Box>

                {/* Titre avec effet moderne */}
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    fontSize: {
                      xs: "clamp(1.15rem, 3vw, 1.3rem)",
                      sm: "clamp(1.25rem, 2.5vw, 1.4rem)",
                      md: "1.5rem",
                    },
                    mb: 0.5,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {feature.title}
                </Typography>

                {/* Description moderne */}
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: {
                      xs: "clamp(0.9rem, 2.5vw, 1rem)",
                      sm: "clamp(0.95rem, 2vw, 1.05rem)",
                      md: "1.1rem",
                    },
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: { xs: 1.6, md: 1.7 },
                    maxWidth: "90%",
                    fontWeight: 500,
                  }}
                >
                  {feature.description}
                </Typography>

                {/* Ligne décorative en bas */}
                <Box
                  sx={{
                    width: 60,
                    height: 3,
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.5)",
                    mt: "auto",
                    transition: "all 0.4s ease",
                    "&:hover": {
                      width: 80,
                      opacity: 1,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>

    {/* Bouton "Afficher la suite" moderne */}
    {featuresDisplayed < features.length && (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: { xs: 5, md: 6 },
        }}
      >
        <Button
          variant="outlined"
          onClick={handleShowMoreFeatures}
          sx={{
            px: { xs: 4, md: 5 },
            py: { xs: 1.2, md: 1.5 },
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            fontWeight: 600,
            borderRadius: "50px",
            textTransform: "none",
            borderWidth: 2,
            borderColor: "primary.main",
            color: "primary.main",
            background: "rgba(102, 126, 234, 0.05)",
            backdropFilter: "blur(10px)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "none",
              transition: "left 0.5s ease",
            },
            "&:hover": {
              borderWidth: 2,
              transform: { xs: "none", md: "translateY(-3px)" },
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.25)",
              background: "rgba(102, 126, 234, 0.1)",
              "&::before": {
                left: "100%",
              },
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          Afficher la suite
        </Button>
      </Box>
    )}
  </Box>
</Container>

     























<Box sx={{ 
  background: "#ffffff",
  py: { xs: 6, md: 8 },
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "none",
    pointerEvents: "none",
    zIndex: 0,
  },
}}>
  <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, width: "100%", position: "relative", zIndex: 1 }}>
    {/* En-tête moderne */}
    <Box
      sx={{
        mb: { xs: 4, md: 6 },
        textAlign: "center",
      }}
    >
      {/* Badge moderne */}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: { xs: 2, sm: 2.5 },
          py: { xs: 0.8, sm: 1 },
          mb: { xs: 2, md: 3 },
          borderRadius: "50px",
          background: "rgba(48, 48, 249, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Business sx={{ fontSize: { xs: 18, md: 20 }, color: "#1B5285" }} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            color: "#3030F9",
          }}
        >
          Nos partenaires
        </Typography>
      </Box>

      {/* Titre principal avec effet de gradient */}
      <Typography
        variant="h3"
        fontWeight="bold"
        sx={{
          fontSize: {
            xs: "clamp(1.8rem, 5vw, 2.5rem)",
            sm: "clamp(2.2rem, 4.5vw, 3rem)",
            md: "clamp(2.5rem, 3.5vw, 3.5rem)",
          },
          mb: { xs: 2, md: 3 },
          color: "#0e1133",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        Agences Partenaires
      </Typography>

      {/* Sous-titre moderne */}
      <Typography
        variant="h6"
        sx={{
          mb: { xs: 3, md: 4 },
          maxWidth: 800,
          mx: "auto",
          fontSize: {
            xs: "clamp(1rem, 3vw, 1.15rem)",
            sm: "clamp(1.1rem, 2.5vw, 1.25rem)",
            md: "1.3rem",
          },
          color: "text.secondary",
          lineHeight: { xs: 1.6, md: 1.7 },
          px: { xs: 2, sm: 3 },
          fontWeight: 400,
        }}
      >
        Des professionnels certifiés à votre service
      </Typography>

      {/* Bouton moderne */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 3, md: 4 } }}>
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={() => setOpenPartenaireDialog(true)}
          sx={{
            px: { xs: 4, md: 5 },
            py: { xs: 1.2, md: 1.5 },
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            fontWeight: 600,
            borderRadius: "50px",
            textTransform: "none",
            background: "#3030F9",
            boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "none",
              transition: "left 0.5s ease",
            },
            "&:hover": {
              transform: { xs: "none", md: "translateY(-3px)" },
              boxShadow: "0 12px 32px rgba(59, 130, 246, 0.4)",
              "&::before": {
                left: "100%",
              },
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          Devenir partenaire
        </Button>
      </Box>
    </Box>

    {/* Conteneur Grid avec 3 cartes par ligne */}
    <Box
      sx={{
        mx: "auto",
        maxWidth: 1200,
        width: "100%",
      }}
    >
      {loadingHomepageAgences ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 160,
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Chargement des agences…
          </Typography>
        </Box>
      ) : homepageAgences.length === 0 ? (
        <Alert severity="info">Aucune agence trouvée pour le moment.</Alert>
      ) : (
        <Grid 
          container 
          spacing={3}
          sx={{
            width: "100%",
            margin: 0,
          }}
        >
          {homepageAgences.slice(0, agencesDisplayed).map((agence, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4}
              key={agence.id || index}
              sx={{
                display: "flex",
                flexBasis: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                flexGrow: 0,
                flexShrink: 0,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: { xs: 3, md: 4 },
                  background: agence.statut === "en_attente"
                    ? "#1e1e28"
                    : "#ffffff",
                  backdropFilter: "blur(20px)",
                  border: agence.statut === "en_attente"
                    ? "2px solid rgba(255, 255, 255, 0.2)"
                    : "2px solid rgba(59, 130, 246, 0.25)",
                  boxShadow: agence.statut === "en_attente"
                    ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)",
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    background: agence.statut === "en_attente"
                      ? "#f59e0b"
                      : "#3030F9",
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    zIndex: 1,
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: -80,
                    right: -80,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: agence.statut === "en_attente"
                      ? "none"
                      : "none",
                    opacity: 0.6,
                    transition: "all 0.4s ease",
                    filter: "blur(20px)",
                  },
                  "&:hover": {
                    transform: { xs: "none", md: "translateY(-12px) scale(1.02)" },
                    boxShadow: agence.statut === "en_attente"
                      ? "0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
                      : "0 20px 60px rgba(59, 130, 246, 0.3), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                    borderColor: agence.statut === "en_attente"
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(59, 130, 246, 0.4)",
                    background: agence.statut === "en_attente"
                      ? "#1e1e28"
                      : "#ffffff",
                    "&::before": {
                      transform: "scaleX(1)",
                    },
                    "&::after": {
                      opacity: 1,
                      transform: "scale(1.2)",
                    },
                  },
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: { xs: 3, sm: 3.5, md: 4 },
                    gap: { xs: 2, md: 2.5 },
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {/* En-tête avec logo et nom */}
                  <Box
                    display="flex"
                    alignItems="flex-start"
                    gap={{ xs: 1.5, md: 2 }}
                    mb={{ xs: 1.5, md: 2 }}
                  >
                    <Avatar
                      src={agence.logo || undefined}
                      sx={{
                        background: agence.statut === "en_attente"
                          ? "#f59e0b"
                          : "#3030F9",
                        width: { xs: 60, md: 70 },
                        height: { xs: 60, md: 70 },
                        boxShadow: agence.statut === "en_attente"
                          ? "0 8px 24px rgba(255, 167, 38, 0.4), 0 4px 12px rgba(251, 140, 0, 0.3)"
                          : "0 8px 24px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(139, 92, 246, 0.2)",
                        border: "3px solid rgba(255, 255, 255, 0.5)",
                        transition: "all 0.4s ease",
                        "&:hover": {
                          transform: "scale(1.1) rotate(5deg)",
                          boxShadow: agence.statut === "en_attente"
                            ? "0 12px 32px rgba(255, 167, 38, 0.5), 0 6px 16px rgba(251, 140, 0, 0.4)"
                            : "0 12px 32px rgba(59, 130, 246, 0.4), 0 6px 16px rgba(139, 92, 246, 0.3)",
                        },
                      }}
                    >
                      <Business sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" }, color: "white" }} />
                    </Avatar>
                    <Box flex={1} minWidth={0} sx={{ width: "100%", maxWidth: "100%" }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                          fontSize: {
                            xs: "clamp(1.05rem, 2.5vw, 1.15rem)",
                            sm: "clamp(1.1rem, 2vw, 1.2rem)",
                            md: "1.3rem",
                          },
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          hyphens: "auto",
                          whiteSpace: "normal",
                          width: "100%",
                          maxWidth: "100%",
                          color: agence.statut === "en_attente" ? "#ffffff" : "#3b82f6",
                          textShadow: agence.statut === "en_attente"
                            ? "0 2px 8px rgba(0, 0, 0, 0.5)"
                            : "0 2px 8px rgba(59, 130, 246, 0.15)",
                          "@media (max-width:350px)": {
                            fontSize: "1rem",
                          },
                        }}
                      >
                        {agence.nom}
                      </Typography>
                      {agence.statutJuridique && (
                        <Chip
                          label={agence.statutJuridique}
                          size="small"
                          sx={{
                            mb: 0.5,
                            fontSize: {
                              xs: "0.68rem",
                              md: "0.72rem",
                            },
                            bgcolor: agence.statut === "en_attente" 
                              ? "rgba(139, 92, 246, 0.3)" 
                              : "rgba(16, 185, 129, 0.15)",
                            color: agence.statut === "en_attente"
                              ? "#a78bfa"
                              : "#10b981",
                            border: agence.statut === "en_attente"
                              ? "1px solid rgba(139, 92, 246, 0.4)"
                              : "1px solid rgba(16, 185, 129, 0.3)",
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {agence.statut && (
                        <Chip
                          label={
                            agence.statut === "actif"
                              ? <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}><CheckCircle fontSize="inherit" />Actif</Box>
                              : agence.statut === "en_attente"
                              ? <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}><HourglassEmpty fontSize="inherit" />En attente</Box>
                              : agence.statut
                          }
                          size="small"
                          color={
                            agence.statut === "actif"
                              ? "success"
                              : agence.statut === "en_attente"
                              ? "warning"
                              : "default"
                          }
                          sx={{
                            ml: 0.5,
                            fontSize: {
                              xs: "0.62rem",
                              md: "0.68rem",
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      width: "100%",
                      height: 2,
                      borderRadius: "2px",
                      background: agence.statut === "en_attente"
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(48, 48, 249, 0.3)",
                      my: 1.5,
                    }}
                  />

                  {/* Informations principales */}
                  <Box flex={1}>
                    {agence.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          mb: { xs: 1.5, md: 2 },
                          lineHeight: { xs: 1.45, md: 1.55 },
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          hyphens: "auto",
                          whiteSpace: "normal",
                          width: "100%",
                          maxWidth: "100%",
                          color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.9)" : "text.secondary",
                          "@media (max-width:350px)": {
                            fontSize: "0.8rem",
                          },
                        }}
                      >
                        {agence.description}
                      </Typography>
                    )}

                    {/* Adresse */}
                    {(agence.adresse || agence.ville) && (
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        gap={1}
                        mb={{ xs: 1.2, md: 1.5 }}
                      >
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ minWidth: "18px" }}
                        >
                          <LocationOn fontSize="inherit" />
                        </Typography>
                        <Box flex={1}>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{
                              fontSize: {
                                xs: "0.9rem",
                                md: "1.02rem",
                              },
                              maxWidth: "18ch",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                              color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.95)" : "text.primary",
                              "@media (max-width:350px)": {
                                fontSize: "0.85rem",
                              },
                            }}
                          >
                            {agence.adresse && agence.adresse !== "-"
                              ? agence.adresse
                              : ""}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: {
                                xs: "0.7rem",
                                md: "0.75rem",
                              },
                              color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                            }}
                          >
                            {agence.ville}{" "}
                            {agence.pays && agence.pays !== "-"
                              ? `, ${agence.pays}`
                              : ""}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Boîte postale */}
                    {agence.bp && agence.bp !== "-" && (
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={1.5}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.8)" : "text.secondary",
                          }}
                        >
                          <Mail fontSize="inherit" />
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.8)" : "text.secondary",
                          }}
                        >
                          {agence.bp}
                        </Typography>
                      </Box>
                    )}

                    {/* Promoteur */}
                    {agence.promoteur &&
                      agence.promoteur !== "-" && (
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mb={1.5}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.8)" : "text.secondary",
                            }}
                          >
                            <Person fontSize="inherit" />
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.8)" : "text.secondary",
                            }}
                          >
                            {agence.promoteur}
                          </Typography>
                        </Box>
                      )}

                    {/* Contact */}
                    <Box
                      sx={{
                        width: "100%",
                        height: 2,
                        borderRadius: "2px",
                        background: agence.statut === "en_attente"
                          ? "rgba(255, 255, 255, 0.2)"
                          : "rgba(48, 48, 249, 0.3)",
                        my: 1.5,
                      }}
                    />
                    <Box>
                      {agence.telephone &&
                        agence.telephone !== "-" && (
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.8)" : "text.secondary",
                              }}
                            >
                              <Phone fontSize="inherit" />
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              sx={{
                                color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.95)" : "text.primary",
                              }}
                            >
                              {agence.telephone}
                            </Typography>
                          </Box>
                        )}
                      {agence.email && agence.email !== "-" && (
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.8)" : "text.secondary",
                            }}
                          >
                            <Email fontSize="inherit" />
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: agence.statut === "en_attente" ? "rgba(255, 255, 255, 0.95)" : "primary.main",
                              wordBreak: "break-word",
                              textDecoration: "none",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                            component="a"
                            href={`mailto:${agence.email}`}
                          >
                            {agence.email}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Bouton "Afficher la suite" pour les agences */}
      {!loadingHomepageAgences && agencesDisplayed < homepageAgences.length && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleShowMoreAgences}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontWeight: 600,
              borderRadius: 3,
              textTransform: "none",
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
              },
            }}
          >
            Afficher la suite
          </Button>
        </Box>
      )}
    </Box>

   
  </Container>
</Box>



























{/* Banques Partenaires Section - Moderne */}
<Box
  component="section"
  sx={{
    background: "#f5f7fa",
    py: { xs: 6, md: 8 },
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "none",
      pointerEvents: "none",
      zIndex: 0,
    },
  }}
>
  <Container maxWidth="xl" sx={{ width: "100%", position: "relative", zIndex: 1 }}>
    {/* En-tête moderne */}
    <Box
      sx={{
        mb: { xs: 4, md: 6 },
        textAlign: "center",
      }}
    >
      {/* Badge moderne */}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: { xs: 2, sm: 2.5 },
          py: { xs: 0.8, sm: 1 },
          mb: { xs: 2, md: 3 },
          borderRadius: "50px",
          background: "rgba(10, 124, 79, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <AccountBalance sx={{ fontSize: { xs: 18, md: 20 }, color: "#27AE60" }} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            color: "#3030F9",
          }}
        >
          Nos partenaires financiers
        </Typography>
      </Box>

      {/* Titre principal avec effet de gradient */}
      <Typography
        variant="h3"
        fontWeight="bold"
        sx={{
          fontSize: {
            xs: "clamp(1.8rem, 5vw, 2.5rem)",
            sm: "clamp(2.2rem, 4.5vw, 3rem)",
            md: "clamp(2.5rem, 3.5vw, 3.5rem)",
          },
          mb: { xs: 2, md: 3 },
          color: "#0e1133",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        Banques Partenaires
      </Typography>

      {/* Sous-titre moderne */}
      <Typography
        variant="h6"
        sx={{
          mb: { xs: 3, md: 4 },
          maxWidth: 800,
          mx: "auto",
          fontSize: {
            xs: "clamp(1rem, 3vw, 1.15rem)",
            sm: "clamp(1.1rem, 2.5vw, 1.25rem)",
            md: "1.3rem",
          },
          color: "text.secondary",
          lineHeight: { xs: 1.6, md: 1.7 },
          px: { xs: 2, sm: 3 },
          fontWeight: 400,
        }}
      >
        Financez votre projet immobilier avec nos partenaires financiers
      </Typography>
    </Box>

    {/* Conteneur Grid avec 3 cartes par ligne */}
    <Box
      sx={{
        mx: "auto",
        maxWidth: 1200,
        width: "100%",
      }}
    >
      <Grid 
        container 
        spacing={3}
        sx={{
          width: "100%",
          margin: 0,
        }}
      >
        {banquesPartenaires.slice(0, banquesDisplayed).map((banque, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4}
            key={index}
            sx={{
              display: "flex",
              flexBasis: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
              maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
              flexGrow: 0,
              flexShrink: 0,
            }}
          >
            <Card
              elevation={0}
              onClick={() => handleOpenBanqueDetails(banque)}
              sx={{
                width: "100%",
                height: "100%",
                minHeight: { xs: 240, sm: 260, md: 280 },
                borderRadius: { xs: 3, md: 4 },
                background: "#ffffff",
                backdropFilter: "blur(20px)",
                border: "2px solid rgba(16, 185, 129, 0.25)",
                boxShadow: "0 8px 32px rgba(16, 185, 129, 0.15), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                overflow: "hidden",
                position: "relative",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "5px",
                  background: "#3030F9",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: 1,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -80,
                  right: -80,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "none",
                  opacity: 0.6,
                  transition: "all 0.4s ease",
                  filter: "blur(20px)",
                },
                "&:hover": {
                  transform: { xs: "none", md: "translateY(-12px) scale(1.02)" },
                  boxShadow: "0 20px 60px rgba(16, 185, 129, 0.3), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                  borderColor: "rgba(16, 185, 129, 0.4)",
                  background: "#ffffff",
                  "&::before": {
                    transform: "scaleX(1)",
                  },
                  "&::after": {
                    opacity: 1,
                    transform: "scale(1.2)",
                  },
                },
              }}
            >
            <CardContent
              sx={{
                py: { xs: 3, sm: 3.5, md: 4 },
                px: { xs: 3, sm: 3.5, md: 4 },
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: { xs: 2, md: 2.5 },
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Icône banque moderne */}
              <Box
                sx={{
                  position: "relative",
                  mb: { xs: 0.5, md: 1 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 56, sm: 64, md: 72 },
                    height: { xs: 56, sm: 64, md: 72 },
                    borderRadius: "50%",
                    background: "#3030F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 12px 40px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(59, 130, 246, 0.2)",
                    border: "3px solid rgba(255, 255, 255, 0.5)",
                    transition: "all 0.4s ease",
                    "&:hover": {
                      transform: "scale(1.1) rotate(5deg)",
                      boxShadow: "0 16px 50px rgba(16, 185, 129, 0.4), 0 6px 16px rgba(59, 130, 246, 0.3)",
                    },
                  }}
                >
                  <AccountBalance
                    sx={{
                      color: "white",
                      fontSize: { xs: "1.6rem", sm: "1.8rem", md: "2rem" },
                    }}
                  />
                </Box>
              </Box>

              {/* Nom banque */}
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  fontSize: {
                    xs: "clamp(1.05rem, 2.5vw, 1.15rem)",
                    sm: "clamp(1.1rem, 2vw, 1.2rem)",
                    md: "1.3rem",
                  },
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  hyphens: "auto",
                  width: "100%",
                  maxWidth: "100%",
                  color: "#27AE60",
                  textShadow: "0 2px 8px rgba(16, 185, 129, 0.15)",
                }}
              >
                {banque.nom}
              </Typography>

              {/* Type de financement */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: {
                    xs: "clamp(0.9rem, 2.5vw, 1rem)",
                    sm: "clamp(0.95rem, 2vw, 1.05rem)",
                    md: "1.1rem",
                  },
                  lineHeight: 1.6,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  hyphens: "auto",
                  whiteSpace: "normal",
                  width: "100%",
                  maxWidth: "100%",
                  color: "rgba(0, 0, 0, 0.75)",
                  fontWeight: 500,
                }}
              >
                {banque.services}
              </Typography>
            </CardContent>
          </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bouton "Afficher la suite" pour les banques */}
      {banquesDisplayed < banquesPartenaires.length && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleShowMoreBanques}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontWeight: 600,
              borderRadius: 3,
              textTransform: "none",
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
              },
            }}
          >
            Afficher la suite
          </Button>
        </Box>
      )}
    </Box>
  </Container>
</Box>
















{/* Notaires Partenaires Section - Moderne */}
<Box
  component="section"
  sx={{
    background: "#ffffff",
    py: { xs: 6, md: 8 },
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "none",
      pointerEvents: "none",
      zIndex: 0,
    },
  }}
>
  <Container maxWidth="xl" sx={{ width: "100%", position: "relative", zIndex: 1 }}>
    {/* En-tête moderne */}
    <Box
      sx={{
        mb: { xs: 4, md: 6 },
        textAlign: "center",
      }}
    >
      {/* Badge moderne */}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: { xs: 2, sm: 2.5 },
          py: { xs: 0.8, sm: 1 },
          mb: { xs: 2, md: 3 },
          borderRadius: "50px",
          background: "rgba(48, 48, 249, 0.1)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: { xs: 18, md: 20 },
          }}
        >
          <Gavel fontSize="inherit" />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            color: "#3030F9",
          }}
        >
          Nos partenaires notaires
        </Typography>
      </Box>

      {/* Titre principal avec effet de gradient */}
      <Typography
        variant="h3"
        fontWeight="bold"
        sx={{
          fontSize: {
            xs: "clamp(1.8rem, 5vw, 2.5rem)",
            sm: "clamp(2.2rem, 4.5vw, 3rem)",
            md: "clamp(2.5rem, 3.5vw, 3.5rem)",
          },
          mb: { xs: 2, md: 3 },
          color: "#0e1133",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        Notaires partenaires
      </Typography>

      {/* Sous-titre moderne */}
      <Typography
        variant="h6"
        sx={{
          mb: { xs: 3, md: 4 },
          maxWidth: 900,
          mx: "auto",
          fontSize: {
            xs: "clamp(1rem, 3vw, 1.15rem)",
            sm: "clamp(1.1rem, 2.5vw, 1.25rem)",
            md: "1.3rem",
          },
          color: "text.secondary",
          lineHeight: { xs: 1.6, md: 1.7 },
          px: { xs: 2, sm: 3 },
          fontWeight: 400,
        }}
      >
        Un réseau sélectionné de notaires pour sécuriser vos transactions immobilières : promesse de vente, hypothèque, acte définitif et formalités administratives.
      </Typography>

      {/* Chips modernes */}
      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="center"
        sx={{
          flexWrap: "wrap",
          rowGap: 1.5,
        }}
      >
        <Chip
          label="Réseau vérifié"
          size="small"
          sx={{
            borderRadius: "50px",
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            bgcolor: "rgba(16, 185, 129, 0.15)",
            color: "#27AE60",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        />
        <Chip
          label={`${homepageNotaires?.length || 0} études partenaires`}
          size="small"
          sx={{
            borderRadius: "50px",
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            bgcolor: "rgba(139, 92, 246, 0.15)",
            color: "#1B5285",
            border: "1px solid rgba(139, 92, 246, 0.3)",
          }}
        />
      </Stack>
    </Box>

    {/* Conteneur Grid avec cartes modernes */}
    <Box
      sx={{
        mx: "auto",
        maxWidth: 1200,
        width: "100%",
      }}
    >
      {loadingHomepageNotaires ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 180,
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Chargement des notaires…
          </Typography>
        </Box>
      ) : homepageNotaires.length === 0 ? (
        <Alert severity="info">
          Aucun notaire partenaire disponible pour le moment.
        </Alert>
      ) : (
        <Grid
          container
          spacing={{ xs: 2, sm: 3 }}
          sx={{
            width: "100%",
            margin: 0,
            justifyContent: "center",
          }}
        >
          {homepageNotaires.map((notaire, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={notaire._id || index}
              sx={{
                display: "flex",
                flexBasis: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                flexGrow: 0,
                flexShrink: 0,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: { xs: 3, md: 4 },
                  background: "#ffffff",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(139, 92, 246, 0.25)",
                  boxShadow: "0 8px 32px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)",
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    background: "#3030F9",
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    zIndex: 1,
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: -80,
                    right: -80,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "none",
                    opacity: 0.6,
                    transition: "all 0.4s ease",
                    filter: "blur(20px)",
                  },
                  "&:hover": {
                    transform: { xs: "none", md: "translateY(-12px) scale(1.02)" },
                    boxShadow: "0 20px 60px rgba(139, 92, 246, 0.3), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                    borderColor: "rgba(139, 92, 246, 0.4)",
                    background: "#ffffff",
                    "&::before": {
                      transform: "scaleX(1)",
                    },
                    "&::after": {
                      opacity: 1,
                      transform: "scale(1.2)",
                    },
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 3, sm: 3.5, md: 4 },
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 2, md: 2.5 },
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {/* En-tête avec avatar et nom */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: { xs: 1.5, md: 2 },
                      mb: { xs: 1, md: 1.5 },
                    }}
                  >
                    <Avatar
                      sx={{
                        background: "#3030F9",
                        width: { xs: 60, md: 70 },
                        height: { xs: 60, md: 70 },
                        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3), 0 4px 12px rgba(99, 102, 241, 0.2)",
                        border: "3px solid rgba(255, 255, 255, 0.5)",
                        transition: "all 0.4s ease",
                        "&:hover": {
                          transform: "scale(1.1) rotate(5deg)",
                          boxShadow: "0 12px 32px rgba(139, 92, 246, 0.4), 0 6px 16px rgba(99, 102, 241, 0.3)",
                        },
                        fontSize: { xs: "1.8rem", md: "2.2rem" },
                      }}
                    >
                      <Gavel fontSize="inherit" />
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          fontSize: {
                            xs: "clamp(1.05rem, 2.5vw, 1.15rem)",
                            sm: "clamp(1.1rem, 2vw, 1.2rem)",
                            md: "1.3rem",
                          },
                          color: "#1B5285",
                          textShadow: "0 2px 8px rgba(139, 92, 246, 0.15)",
                          wordBreak: "break-word",
                          mb: 0.5,
                        }}
                      >
                        {notaire.fullName || "Notaire"}
                      </Typography>
                      {notaire.cabinetName && (
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: {
                              xs: "clamp(0.85rem, 2.5vw, 0.95rem)",
                              sm: "1rem",
                            },
                            color: "rgba(0, 0, 0, 0.7)",
                            fontWeight: 500,
                            wordBreak: "break-word",
                            mb: 0.5,
                          }}
                        >
                          {notaire.cabinetName}
                        </Typography>
                      )}
                      <Chip
                        label="CERTIFIÉ"
                        size="small"
                        sx={{
                          mt: 0.5,
                          borderRadius: "50px",
                          fontSize: { xs: "0.65rem", md: "0.7rem" },
                          fontWeight: 700,
                          bgcolor: "rgba(16, 185, 129, 0.15)",
                          color: "#27AE60",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Séparateur moderne */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 2,
                      borderRadius: "2px",
                      background: "rgba(48, 48, 249, 0.3)",
                      my: 0.5,
                    }}
                  />

                  {/* Informations */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 } }}>
                    {notaire.ville && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: { xs: 1, sm: 1.5 },
                        }}
                      >
                        <LocationOn
                          sx={{
                            color: "#1B5285",
                            fontSize: { xs: 20, sm: 22 },
                            mt: 0.2,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: {
                              xs: "clamp(0.9rem, 2.5vw, 1rem)",
                              sm: "1.05rem",
                            },
                            color: "rgba(0, 0, 0, 0.75)",
                            fontWeight: 500,
                            wordBreak: "break-word",
                          }}
                        >
                          {notaire.ville}
                          {notaire.quartier && `, ${notaire.quartier}`}
                        </Typography>
                      </Box>
                    )}

                    {notaire.phone && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: { xs: 1, sm: 1.5 },
                        }}
                      >
                        <Phone
                          sx={{
                            color: "#1B5285",
                            fontSize: { xs: 20, sm: 22 },
                            mt: 0.2,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: {
                              xs: "clamp(0.9rem, 2.5vw, 1rem)",
                              sm: "1.05rem",
                            },
                            color: "rgba(0, 0, 0, 0.75)",
                            fontWeight: 500,
                            wordBreak: "break-word",
                          }}
                        >
                          {notaire.phone}
                        </Typography>
                      </Box>
                    )}

                    {notaire.email && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: { xs: 1, sm: 1.5 },
                        }}
                      >
                        <Email
                          sx={{
                            color: "#1B5285",
                            fontSize: { xs: 20, sm: 22 },
                            mt: 0.2,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: {
                              xs: "clamp(0.9rem, 2.5vw, 1rem)",
                              sm: "1.05rem",
                            },
                            color: "rgba(0, 0, 0, 0.75)",
                            fontWeight: 500,
                            wordBreak: "break-word",
                          }}
                        >
                          {notaire.email}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  </Container>
</Box>





      {/* Qui peut s'inscrire Section – DESIGN MODERNE */}
      <Box 
        component="section"
        sx={{ 
          position: "relative",
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3 },
          background: "#ffffff",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "none",
            pointerEvents: "none",
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, width: "100%" }}>
          {/* En-tête moderne */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            {/* Badge moderne */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: { xs: 2, sm: 2.5 },
                py: { xs: 0.8, sm: 1 },
                mb: { xs: 2, md: 3 },
                borderRadius: "50px",
                background: "rgba(48, 48, 249, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: { xs: 18, md: 20 },
                }}
              >
                <Groups fontSize="inherit" />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  color: "#3030F9",
                }}
              >
                Acteurs du secteur
              </Typography>
            </Box>

            {/* Titre principal avec effet de gradient */}
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              sx={{
                fontSize: {
                  xs: "clamp(1.8rem, 5vw, 2.5rem)",
                  sm: "clamp(2.2rem, 4.5vw, 3rem)",
                  md: "clamp(2.5rem, 3.5vw, 3.5rem)",
                },
                mb: { xs: 2, md: 3 },
                color: "#0e1133",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Qui peut rejoindre la plateforme ?
            </Typography>

            {/* Sous-titre moderne */}
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 3, md: 4 },
                maxWidth: 900,
                mx: "auto",
                fontSize: {
                  xs: "clamp(1rem, 3vw, 1.15rem)",
                  sm: "clamp(1.1rem, 2.5vw, 1.25rem)",
                  md: "1.3rem",
                },
                color: "text.secondary",
                lineHeight: { xs: 1.6, md: 1.7 },
                px: { xs: 2, sm: 3 },
                fontWeight: 400,
              }}
            >
              Dillanci est ouvert à tous les acteurs du secteur foncier et immobilier
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(2, 1fr)",
              },
              columnGap: { xs: 4, md: 6 },
              rowGap: { xs: 6, md: 10 },
              maxWidth: 1200,
              mx: "auto",
            }}
          >
            {/* Agences */}
            <Card 
              elevation={0}
              sx={{ 
                p: { xs: 1.5, md: 2 },
                mb: { xs: 6, md: 8 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                border: "2px solid transparent",
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "#3030F9",
                },
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
                  borderColor: "primary.main",
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                <Box
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 2,
                    background: "#3030F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <Business sx={{ fontSize: { xs: 24, md: 30 }, color: "white" }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.05rem", md: "1.25rem" } }}>
                    Agences Immobilières
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
                    Créez et gérez vos annonces, valorisez vos biens et suivez vos opportunités commerciales sur une plateforme dédiée aux professionnels de l'immobilier.
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Stack spacing={0.5} mt={0.75}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Gestion de vos annonces et biens
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Suivi des prospects et transactions
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Valorisation de votre portefeuille immobilier
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Banques */}
            <Card 
              elevation={0}
              sx={{ 
                p: { xs: 1.5, md: 2 },
                mb: { xs: 6, md: 8 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                border: "2px solid transparent",
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "#0A7C4F",
                },
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)",
                  borderColor: "success.main",
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                <Box
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 2,
                    background: "#0A7C4F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <AccountBalance sx={{ fontSize: { xs: 24, md: 30 }, color: "white" }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.05rem", md: "1.25rem" } }}>
                    Banques Partenaires
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
                    Accédez à des informations utiles pour le financement immobilier et utilisez la plateforme pour mieux exposer à la vente les biens immobiliers hors exploitation ou reçus en réalisation de garanties.
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Stack spacing={0.5} mt={0.75}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Analyse des garanties immobilières
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Mise en vente des biens hors exploitation
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Appui à la cession des immeubles reçus en garantie
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* État/Ministère */}
            <Card 
              elevation={0}
              sx={{ 
                p: { xs: 1.5, md: 2 },
                mb: { xs: 6, md: 8 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                border: "2px solid transparent",
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "#0A7C4F",
                },
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(10, 124, 79, 0.15)",
                  borderColor: "#0A7C4F",
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                <Box
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 2,
                    background: "#0A7C4F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(10, 124, 79, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <Landscape sx={{ fontSize: { xs: 24, md: 30 }, color: "white" }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.05rem", md: "1.25rem" } }}>
                    Notaires et services compétents
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
                    Intervenez dans le processus de sécurisation des opérations immobilières à travers la vérification, l'authentification et l'accompagnement des transactions.
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Stack spacing={0.5} mt={0.75}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Vérification de certaines informations
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Appui à la sécurisation des transactions
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Accompagnement des opérations de vente
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Particuliers */}
            <Card 
              elevation={0}
              sx={{ 
                p: { xs: 1.5, md: 2 },
                mb: { xs: 6, md: 8 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                border: "2px solid transparent",
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "#3030F9",
                },
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(14, 165, 233, 0.15)",
                  borderColor: "info.main",
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                <Box
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 2,
                    background: "#3030F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(14, 165, 233, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <Groups sx={{ fontSize: { xs: 24, md: 30 }, color: "white" }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.05rem", md: "1.25rem" } }}>
                    Particuliers / Clients
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
                    Consultez les offres, mettez en valeur vos biens et entrez en relation avec les acteurs de confiance pour vos projets immobiliers.
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Stack spacing={0.5} mt={0.75}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Publication de vos biens
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Consultation des offres disponibles
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Mise en relation avec les professionnels
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
    {/* CTA Section – modernisée & ultra responsive */}
<Container
  maxWidth="xl"
  sx={{
    py: { xs: 6, sm: 8, md: 10 },
    px: { xs: 1.5, sm: 2.5, md: 3 }, // 🔽 moins de padding sur les côtés en mobile
    width: "100%",
  }}
>
  <Paper
    elevation={10}
    sx={{
      mx: "auto",
      maxWidth: 800,
      p: { xs: 3, sm: 4, md: 5 },
      borderRadius: { xs: 3, md: 4 },
      background:
        "#0e1133",
      color: "white",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        background:
          "none",
        pointerEvents: "none",
      },
    }}
  >
    {/* Contenu interne pour éviter que le ::before ne gêne */}
    <Box sx={{ position: "relative", zIndex: 1 }}>
      {/* Petit badge au-dessus du titre */}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 1.8,
          py: 0.6,
          mb: { xs: 2.5, md: 3 },
          borderRadius: 999,
          bgcolor: "rgba(15,23,42,0.7)",
          border: "1px solid rgba(148,163,184,0.7)",
          mx: "auto",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: {
              xs: "0.7rem",
              sm: "0.8rem",
            },
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: "rgb(209,213,219)",
          }}
        >
          Plateforme sécurisée Dillanci
        </Typography>
      </Box>

      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        sx={{
          fontSize: {
            xs: "clamp(1.6rem, 6vw, 2.2rem)",
            sm: "clamp(1.9rem, 5.5vw, 2.6rem)",
            md: "clamp(2.2rem, 4vw, 2.8rem)",
          },
          mb: { xs: 1.8, md: 2.2 },
        }}
      >
        Prêt à commencer ?
      </Typography>

      <Typography
        variant="h6"
        sx={{
          mb: { xs: 3, md: 4 },
          opacity: 0.9,
          fontSize: {
            xs: "clamp(0.95rem, 3.5vw, 1.05rem)",
            sm: "clamp(1.05rem, 3vw, 1.15rem)",
            md: "clamp(1.1rem, 2.2vw, 1.2rem)",
          },
          lineHeight: { xs: 1.5, md: 1.6 },
          maxWidth: 620,
          mx: "auto",
          px: { xs: 1, sm: 1.5, md: 0 },
        }}
      >
        Rejoignez Dillanci dès aujourd&apos;hui et digitalisez votre
        activité foncière et immobilière en toute confiance.
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
        justifyContent="center"
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{
          width: "100%",
          maxWidth: 520,
          mx: "auto",
        }}
      >
        {/* Bouton créer compte */}
        <Button
          variant="contained"
          size={isMobile ? "medium" : "large"}
          onClick={() => navigate("/register")}
          sx={{
            bgcolor: "white",
            color: "#0D2B4E",
            fontWeight: "bold",
            px: { xs: 2.8, sm: 3.5, md: 4 },
            py: { xs: 1.1, sm: 1.3, md: 1.4 },
            width: { xs: "100%", sm: "auto" },
            fontSize: {
              xs: "clamp(0.85rem, 2.8vw, 0.95rem)",
              sm: "clamp(0.9rem, 2.2vw, 1rem)",
              md: "clamp(0.95rem, 1.8vw, 1.05rem)",
            },
            borderRadius: 999,
            boxShadow: "0 10px 30px rgba(15,23,42,0.6)",
            "&:hover": {
              bgcolor: "#f9fafb",
              transform: { xs: "none", md: "translateY(-2px)" },
              boxShadow: "0 14px 40px rgba(15,23,42,0.75)",
            },
            transition: "all 0.25s ease",
            "& .MuiButton-endIcon": {
              ml: { xs: 0.6, md: 1 },
            },
            // 🔽 Extra petit écran
            "@media (max-width:350px)": {
              fontSize: "0.75rem",
              px: 2.2,
              py: 0.9,
            },
          }}
          endIcon={<AppRegistration />}
        >
          Créer mon compte
        </Button>

        {/* Bouton se connecter */}
        <Button
          variant="outlined"
          size={isMobile ? "medium" : "large"}
          onClick={() => navigate("/login")}
          sx={{
            borderColor: "rgba(255,255,255,0.9)",
            color: "white",
            borderWidth: { xs: 1.5, md: 2 },
            fontWeight: "bold",
            px: { xs: 2.8, sm: 3.5, md: 4 },
            py: { xs: 1.1, sm: 1.3, md: 1.4 },
            width: { xs: "100%", sm: "auto" },
            fontSize: {
              xs: "clamp(0.85rem, 2.8vw, 0.95rem)",
              sm: "clamp(0.9rem, 2.2vw, 1rem)",
              md: "clamp(0.95rem, 1.8vw, 1.05rem)",
            },
            borderRadius: 999,
            bgcolor: "rgba(15,23,42,0.35)",
            backdropFilter: "blur(10px)",
            "&:hover": {
              borderColor: "white",
              bgcolor: "rgba(15,23,42,0.7)",
              transform: { xs: "none", md: "translateY(-2px)" },
              boxShadow: "0 10px 30px rgba(15,23,42,0.7)",
            },
            transition: "all 0.25s ease",
            "& .MuiButton-endIcon": {
              ml: { xs: 0.6, md: 1 },
            },
            "@media (max-width:350px)": {
              fontSize: "0.75rem",
              px: 2.2,
              py: 0.9,
            },
          }}
          endIcon={<Login />}
        >
          Se connecter
        </Button>
      </Stack>
    </Box>
  </Paper>
</Container>


      {/* Dialogue Devenir Partenaire - Moderne et Responsive */}
      <Dialog
        open={openPartenaireDialog}
        onClose={() => setOpenPartenaireDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 4 },
            background: "#3030F9",
            color: "white",
            overflow: "hidden",
            position: "relative",
            maxHeight: { xs: "100vh", sm: "90vh" },
            margin: { xs: 0, sm: 2 },
            "&::before": {
              content: '""',
              position: "absolute",
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              background: "none",
              borderRadius: "50%",
              zIndex: 0,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -80,
              left: -80,
              width: 250,
              height: 250,
              background: "none",
              borderRadius: "50%",
              zIndex: 0,
            },
          }
        }}
      >
        {/* Bouton de fermeture moderne */}
        <IconButton
          onClick={() => setOpenPartenaireDialog(false)}
          sx={{
            position: "absolute",
            top: { xs: 8, sm: 16 },
            right: { xs: 8, sm: 16 },
            zIndex: 10,
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.3)",
              transform: "rotate(90deg)",
            },
            transition: "all 0.3s ease",
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogTitle 
          sx={{ 
            textAlign: "center", 
            pb: { xs: 2, sm: 3 }, 
            pt: { xs: 4, sm: 5 },
            px: { xs: 2, sm: 4 },
            position: "relative", 
            zIndex: 1 
          }}
        >
          <Box 
            display="flex" 
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems="center" 
            justifyContent="center" 
            gap={{ xs: 2, sm: 2.5 }}
            mb={{ xs: 1, sm: 2 }}
          >
            <Avatar 
              sx={{ 
                bgcolor: "rgba(255,255,255,0.25)", 
                width: { xs: 70, sm: 80 },
                height: { xs: 70, sm: 80 },
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                border: "3px solid rgba(255,255,255,0.3)",
              }}
            >
              <Business sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }} />
            </Avatar>
            <Box textAlign={{ xs: "center", sm: "left" }}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                sx={{ 
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  fontSize: {
                    xs: "clamp(1.5rem, 5vw, 1.8rem)",
                    sm: "clamp(1.8rem, 3vw, 2rem)",
                    md: "2.2rem",
                  },
                }}
              >
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}><Business fontSize="inherit" />Devenir Partenaire</Box>
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.95, 
                  mt: { xs: 0.5, sm: 1 },
                  fontSize: {
                    xs: "clamp(0.9rem, 3vw, 1rem)",
                    sm: "1.05rem",
                  },
                }}
              >
                Rejoignez notre réseau d'agences immobilières
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent 
          sx={{ 
            textAlign: "center", 
            position: "relative", 
            zIndex: 1,
            px: { xs: 2, sm: 4 },
            pb: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ 
            bgcolor: "rgba(255,255,255,0.18)", 
            borderRadius: { xs: 2.5, sm: 3 }, 
            p: { xs: 2.5, sm: 3.5 }, 
            mb: { xs: 2.5, sm: 3 },
            backdropFilter: "blur(15px)",
            border: "2px solid rgba(255,255,255,0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              sx={{ 
                mb: { xs: 1.5, sm: 2 }, 
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                fontSize: {
                  xs: "clamp(1.5rem, 6vw, 1.8rem)",
                  sm: "clamp(1.8rem, 4vw, 2.2rem)",
                  md: "2.5rem",
                },
                wordBreak: "break-word",
              }}
            >
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}><Phone fontSize="inherit" />+227 80 64 83 83</Box>
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.95, 
                mb: { xs: 2, sm: 2.5 },
                fontSize: {
                  xs: "clamp(0.9rem, 3vw, 1rem)",
                  sm: "1.05rem",
                },
                lineHeight: 1.6,
              }}
            >
              Appelez-nous pour discuter de votre intégration
            </Typography>
            
            <Stack 
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.5, sm: 2 }} 
              justifyContent="center"
              alignItems="stretch"
              sx={{ width: "100%" }}
            >
              <Button
                variant="contained"
                startIcon={<Call />}
                onClick={() => window.open("tel:+22780648383")}
                fullWidth={isMobile}
                sx={{
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "white",
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.2, sm: 1.5 },
                  fontSize: {
                    xs: "clamp(0.85rem, 2.5vw, 0.95rem)",
                    sm: "1rem",
                  },
                  borderRadius: { xs: 2, sm: 2.5 },
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.35)",
                    transform: { xs: "none", sm: "translateY(-2px) scale(1.02)" },
                    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Appeler
              </Button>
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                onClick={() => window.open("https://wa.me/22780648383")}
                fullWidth={isMobile}
                sx={{
                  bgcolor: "#25D366",
                  color: "white",
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.2, sm: 1.5 },
                  fontSize: {
                    xs: "clamp(0.85rem, 2.5vw, 0.95rem)",
                    sm: "1rem",
                  },
                  borderRadius: { xs: 2, sm: 2.5 },
                  boxShadow: "0 4px 16px rgba(37, 211, 102, 0.3)",
                  "&:hover": {
                    bgcolor: "#128C7E",
                    transform: { xs: "none", sm: "translateY(-2px) scale(1.02)" },
                    boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                WhatsApp
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={() => {
                  navigator.clipboard.writeText("+22780648383");
                }}
                fullWidth={isMobile}
                sx={{
                  borderColor: "rgba(255,255,255,0.4)",
                  borderWidth: 2,
                  color: "white",
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.2, sm: 1.5 },
                  fontSize: {
                    xs: "clamp(0.85rem, 2.5vw, 0.95rem)",
                    sm: "1rem",
                  },
                  borderRadius: { xs: 2, sm: 2.5 },
                  backdropFilter: "blur(10px)",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.6)",
                    bgcolor: "rgba(255,255,255,0.2)",
                    transform: { xs: "none", sm: "translateY(-2px) scale(1.02)" },
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Copier
              </Button>
            </Stack>
          </Box>

          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.85, 
              fontStyle: "italic",
              fontSize: {
                xs: "clamp(0.8rem, 2.5vw, 0.9rem)",
                sm: "0.95rem",
              },
              px: { xs: 1, sm: 2 },
            }}
          >
            Nos équipes sont disponibles du lundi au vendredi, de 8h à 18h
          </Typography>
        </DialogContent>

        <DialogActions 
          sx={{ 
            justifyContent: "center", 
            pb: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 4 },
            position: "relative", 
            zIndex: 1 
          }}
        >
          <Button
            onClick={() => setOpenPartenaireDialog(false)}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              borderColor: "rgba(255,255,255,0.4)",
              borderWidth: 2,
              color: "white",
              fontWeight: 600,
              px: { xs: 3, sm: 4 },
              py: { xs: 1.2, sm: 1.5 },
              fontSize: {
                xs: "clamp(0.9rem, 2.5vw, 1rem)",
                sm: "1.05rem",
              },
              borderRadius: { xs: 2, sm: 2.5 },
              backdropFilter: "blur(10px)",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.6)",
                bgcolor: "rgba(255,255,255,0.2)",
                transform: { xs: "none", sm: "translateY(-2px)" },
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer des banques partenaires - Moderne et Responsive */}
      <Drawer
        anchor="right"
        open={openBanqueDrawer}
        onClose={handleCloseBanqueDetails}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "85%", md: "70%", lg: "60%" },
            maxWidth: "1200px",
            background: "#f5f7fa",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "none",
              pointerEvents: "none",
              zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ 
          height: "100%", 
          display: "flex", 
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}>
          {/* En-tête moderne du drawer */}
          <Box 
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: { xs: 2, sm: 0 },
              borderBottom: "2px solid",
              borderColor: "rgba(48, 48, 249, 0.3)",
              flexShrink: 0,
            }}
          >
            <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }} flex={1}>
              <Box
                sx={{
                  width: { xs: 56, sm: 64, md: 72 },
                  height: { xs: 56, sm: 64, md: 72 },
                  borderRadius: "50%",
                  background: "#3030F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 40px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(59, 130, 246, 0.2)",
                  border: "3px solid rgba(255, 255, 255, 0.5)",
                  flexShrink: 0,
                }}
              >
                <AccountBalance sx={{ color: "white", fontSize: { xs: "1.6rem", sm: "2rem", md: "2.4rem" } }} />
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{
                    fontSize: {
                      xs: "clamp(1.5rem, 5vw, 1.8rem)",
                      sm: "clamp(1.8rem, 3vw, 2rem)",
                      md: "2.2rem",
                    },
                    color: "#27AE60",
                    textShadow: "0 2px 8px rgba(16, 185, 129, 0.15)",
                    wordBreak: "break-word",
                  }}
                >
                  {selectedBanque ? selectedBanque.nom : "Détails de la Banque"}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{
                    color: "text.secondary",
                    fontSize: {
                      xs: "clamp(0.9rem, 2.5vw, 1rem)",
                      sm: "1.05rem",
                    },
                    mt: 0.5,
                  }}
                >
                  {selectedBanque ? selectedBanque.services : "Informations complètes"}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseBanqueDetails}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                color: "text.primary",
                "&:hover": { 
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  transform: "rotate(90deg)",
                },
                transition: "all 0.3s ease",
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 },
                flexShrink: 0,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenu du drawer moderne */}
          <Box sx={{ 
            flex: 1, 
            overflowY: "auto", 
            overflowX: "hidden",
            p: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 2, sm: 3 },
            pb: { xs: 3, sm: 4 },
            minHeight: 0,
          }}>
            {selectedBanque ? (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Description moderne */}
                <Grid item xs={12}>
                  <Paper 
                    sx={{ 
                      p: { xs: 2.5, sm: 3, md: 3.5 }, 
                      borderRadius: { xs: 2.5, sm: 3 }, 
                      background: "#ffffff",
                      backdropFilter: "blur(20px)",
                      border: "2px solid rgba(16, 185, 129, 0.15)",
                      boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1), 0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      mb={2} 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1,
                        fontSize: {
                          xs: "clamp(1.1rem, 3vw, 1.25rem)",
                          sm: "1.3rem",
                        },
                        color: "#27AE60",
                      }}
                    >
                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}><Description fontSize="inherit" />À propos</Box>
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.8,
                        color: "rgba(0, 0, 0, 0.75)",
                        fontSize: {
                          xs: "clamp(0.9rem, 2.5vw, 1rem)",
                          sm: "1.05rem",
                        },
                      }}
                    >
                      {selectedBanque.description}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Produits modernes */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: { xs: 2.5, sm: 3, md: 3.5 }, 
                      borderRadius: { xs: 2.5, sm: 3 }, 
                      background: "#ffffff",
                      backdropFilter: "blur(20px)",
                      border: "2px solid rgba(59, 130, 246, 0.15)",
                      boxShadow: "0 8px 32px rgba(59, 130, 246, 0.1), 0 2px 8px rgba(0,0,0,0.04)",
                      height: { xs: "auto", md: "100%" },
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      mb={{ xs: 2, sm: 2.5 }} 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1,
                        fontSize: {
                          xs: "clamp(1.1rem, 3vw, 1.25rem)",
                          sm: "1.3rem",
                        },
                        color: "#1B5285",
                      }}
                    >
                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}><Business fontSize="inherit" />Produits et Services</Box>
                    </Typography>
                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                      {selectedBanque.produits && selectedBanque.produits.map((produit, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: { xs: 1.5, sm: 2 },
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: { xs: 2, sm: 2.5 },
                            background: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.9)",
                              transform: { xs: "none", md: "translateX(6px)" },
                              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.15)",
                            },
                          }}
                        >
                          <CheckCircle sx={{ color: "#1B5285", mt: 0.5, fontSize: { xs: 20, sm: 22 }, flexShrink: 0 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flex: 1,
                              fontSize: {
                                xs: "clamp(0.875rem, 2.5vw, 0.95rem)",
                                sm: "1rem",
                              },
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              color: "rgba(0, 0, 0, 0.8)",
                              fontWeight: 500,
                            }}
                          >
                            {produit}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Avantages modernes */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: { xs: 2.5, sm: 3, md: 3.5 }, 
                      borderRadius: { xs: 2.5, sm: 3 }, 
                      background: "#ffffff",
                      backdropFilter: "blur(20px)",
                      border: "2px solid rgba(16, 185, 129, 0.15)",
                      boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1), 0 2px 8px rgba(0,0,0,0.04)",
                      height: { xs: "auto", md: "100%" },
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      mb={{ xs: 2, sm: 2.5 }} 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1,
                        fontSize: {
                          xs: "clamp(1.1rem, 3vw, 1.25rem)",
                          sm: "1.3rem",
                        },
                        color: "#27AE60",
                      }}
                    >
                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}><AutoAwesome fontSize="inherit" />Avantages</Box>
                    </Typography>
                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                      {selectedBanque.avantages && selectedBanque.avantages.map((avantage, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: { xs: 1.5, sm: 2 },
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: { xs: 2, sm: 2.5 },
                            background: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.9)",
                              transform: { xs: "none", md: "translateX(6px)" },
                              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.15)",
                            },
                          }}
                        >
                          <Star sx={{ color: "#27AE60", mt: 0.5, fontSize: { xs: 20, sm: 22 }, flexShrink: 0 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flex: 1,
                              fontSize: {
                                xs: "clamp(0.875rem, 2.5vw, 0.95rem)",
                                sm: "1rem",
                              },
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              color: "rgba(0, 0, 0, 0.8)",
                              fontWeight: 500,
                            }}
                          >
                            {avantage}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Contact */}
                {selectedBanque.contact && (
                  <Grid item xs={12} sx={{ mt: { xs: 2, sm: 3 } }}>
                    <Paper 
                      sx={{ 
                        p: { xs: 2.5, sm: 3, md: 3.5 }, 
                        borderRadius: { xs: 2.5, sm: 3 }, 
                        background: "#ffffff",
                        backdropFilter: "blur(20px)",
                        border: "2px solid rgba(16, 185, 129, 0.15)",
                        boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1), 0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        mb={{ xs: 2, sm: 2.5 }} 
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 1,
                          fontSize: {
                            xs: "clamp(1.1rem, 3vw, 1.25rem)",
                            sm: "1.3rem",
                          },
                          color: "#27AE60",
                        }}
                      >
                        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}><Phone fontSize="inherit" />Contact</Box>
                      </Typography>
                      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                        {selectedBanque.contact.telephone && (
                          <Grid item xs={12} sm={4}>
                            <Box
                              sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: { xs: 2, sm: 2.5 },
                                background: "#ffffff",
                                backdropFilter: "blur(10px)",
                                border: "2px solid rgba(59, 130, 246, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1.5, sm: 2 },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                "&:hover": {
                                  background: "#ffffff",
                                  transform: { xs: "none", sm: "translateY(-4px)" },
                                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.2)",
                                },
                              }}
                              onClick={() => window.open(`tel:${selectedBanque.contact.telephone}`)}
                            >
                              <Box
                                sx={{
                                  width: { xs: 40, sm: 44 },
                                  height: { xs: 40, sm: 44 },
                                  borderRadius: "50%",
                                  background: "#3030F9",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Phone sx={{ color: "white", fontSize: { xs: 20, sm: 22 } }} />
                              </Box>
                              <Box flex={1} minWidth={0}>
                                <Typography 
                                  variant="caption" 
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                  }}
                                >
                                  Téléphone
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold"
                                  sx={{
                                    fontSize: {
                                      xs: "clamp(0.85rem, 2.5vw, 0.95rem)",
                                      sm: "1rem",
                                    },
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {selectedBanque.contact.telephone}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}
                        {selectedBanque.contact.email && (
                          <Grid item xs={12} sm={4}>
                            <Box
                              sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: { xs: 2, sm: 2.5 },
                                background: "#ffffff",
                                backdropFilter: "blur(10px)",
                                border: "2px solid rgba(16, 185, 129, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1.5, sm: 2 },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                "&:hover": {
                                  background: "#ffffff",
                                  transform: { xs: "none", sm: "translateY(-4px)" },
                                  boxShadow: "0 8px 24px rgba(16, 185, 129, 0.2)",
                                },
                              }}
                              onClick={() => window.open(`mailto:${selectedBanque.contact.email}`)}
                            >
                              <Box
                                sx={{
                                  width: { xs: 40, sm: 44 },
                                  height: { xs: 40, sm: 44 },
                                  borderRadius: "50%",
                                  background: "#0A7C4F",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Email sx={{ color: "white", fontSize: { xs: 20, sm: 22 } }} />
                              </Box>
                              <Box flex={1} minWidth={0}>
                                <Typography 
                                  variant="caption" 
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                  }}
                                >
                                  Email
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold"
                                  sx={{
                                    fontSize: {
                                      xs: "clamp(0.85rem, 2.5vw, 0.95rem)",
                                      sm: "1rem",
                                    },
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {selectedBanque.contact.email}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}
                        {selectedBanque.contact.siteWeb && (
                          <Grid item xs={12} sm={4}>
                            <Box
                              sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: { xs: 2, sm: 2.5 },
                                background: "#ffffff",
                                backdropFilter: "blur(10px)",
                                border: "2px solid rgba(139, 92, 246, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1.5, sm: 2 },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                "&:hover": {
                                  background: "#ffffff",
                                  transform: { xs: "none", sm: "translateY(-4px)" },
                                  boxShadow: "0 8px 24px rgba(139, 92, 246, 0.2)",
                                },
                              }}
                              onClick={() => window.open(`https://${selectedBanque.contact.siteWeb.replace(/^https?:\/\//, '')}`, '_blank')}
                            >
                              <Box
                                sx={{
                                  width: { xs: 40, sm: 44 },
                                  height: { xs: 40, sm: 44 },
                                  borderRadius: "50%",
                                  background: "#0e1133",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <AccountBalance sx={{ color: "white", fontSize: { xs: 20, sm: 22 } }} />
                              </Box>
                              <Box flex={1} minWidth={0}>
                                <Typography 
                                  variant="caption" 
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                  }}
                                >
                                  Site Web
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold"
                                  sx={{
                                    fontSize: {
                                      xs: "clamp(0.85rem, 2.5vw, 0.95rem)",
                                      sm: "1rem",
                                    },
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {selectedBanque.contact.siteWeb}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Adresse et Géolocalisation */}
                {(selectedBanque.adresse || (selectedBanque.localisation?.latitude && selectedBanque.localisation?.longitude)) && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 2, bgcolor: "white" }}>
                      <Typography variant="h6" fontWeight="bold" mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}><LocationOn fontSize="inherit" />Adresse et Localisation</Box>
                      </Typography>
                      <Stack spacing={2}>
                        {selectedBanque.adresse && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: "grey.50",
                            }}
                          >
                            <LocationOn sx={{ color: "primary.main", mt: 0.5, flexShrink: 0 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={0.5}>
                                Adresse
                              </Typography>
                              <Typography variant="body2">
                                {selectedBanque.adresse}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        {selectedBanque.localisation?.latitude && selectedBanque.localisation?.longitude && (
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: "primary.50",
                              border: "1px solid",
                              borderColor: "primary.200",
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={1}>
                              Coordonnées GPS
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" mb={2}>
                              Latitude: {selectedBanque.localisation.latitude}<br />
                              Longitude: {selectedBanque.localisation.longitude}
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<LocationOn />}
                              href={`https://www.google.com/maps?q=${selectedBanque.localisation.latitude},${selectedBanque.localisation.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              fullWidth
                              sx={{
                                bgcolor: "primary.main",
                                "&:hover": { bgcolor: "primary.dark" },
                                textTransform: "none",
                                fontWeight: "bold",
                              }}
                            >
                              Voir sur Google Maps
                            </Button>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {/* Boutons d'action */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {selectedBanque.contact?.telephone && (
                      <Button
                        variant="contained"
                        startIcon={<Phone />}
                        href={`tel:${selectedBanque.contact.telephone.replace(/\s/g, "")}`}
                        sx={{
                          bgcolor: "primary.main",
                          "&:hover": { bgcolor: "primary.dark" },
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: "bold",
                        }}
                      >
                        Appeler
                      </Button>
                    )}
                    {selectedBanque.contact?.email && (
                      <Button
                        variant="outlined"
                        startIcon={<Email />}
                        href={`mailto:${selectedBanque.contact.email}`}
                        sx={{
                          borderColor: "primary.main",
                          color: "primary.main",
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: "bold",
                          "&:hover": {
                            borderColor: "primary.dark",
                            bgcolor: "primary.50",
                          },
                        }}
                      >
                        Envoyer un email
                      </Button>
                    )}
                    {selectedBanque.contact?.siteWeb && (
                      <Button
                        variant="outlined"
                        startIcon={<Business />}
                        href={`https://${selectedBanque.contact.siteWeb}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          borderColor: "secondary.main",
                          color: "secondary.main",
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: "bold",
                          "&:hover": {
                            borderColor: "secondary.dark",
                            bgcolor: "secondary.50",
                          },
                        }}
                      >
                        Visiter le site web
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography variant="h6" color="text.secondary">
                  Aucune banque sélectionnée
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      <Footer />
    </Box>
  );
};

export default HomePage;
