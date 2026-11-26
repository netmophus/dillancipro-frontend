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
  PersonAddAlt1,
  Balance,
  HomeWork,
  VerifiedUser,
  Bolt,
  HeadsetMic,
  HomeOutlined,
  BusinessOutlined,
  LandscapeOutlined,
  GroupsOutlined,
  AccountBalance,
  Landscape,
  TrendingUp,
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



  // Couleurs des cartes "Pourquoi choisir Dillanci" (principale -> secondaire)
  const CARD_TONES = {
    "Transactions sécurisées": { main: "#008577", dark: "#005C53" },
    "Biens géolocalisés": { main: "#1455D9", dark: "#12369C" },
    "Parcours simplifié": { main: "#F57C00", dark: "#B84B00" },
    "Écosystème connecté": { main: "#8B25CC", dark: "#551499" },
    "Suivi en temps réel": { main: "#008FC5", dark: "#00568C" },
    "Accompagnement professionnel": { main: "#254AB5", dark: "#172D78" },
  };

  // Cartes d'entrée vers les listes de partenaires (ancres des sections existantes)
  const PARTNER_CARDS = [
    {
      key: "banques",
      title: "Banques partenaires",
      description: "Découvrez les biens immobiliers issus des immobilisations hors exploitation des banques partenaires : terrains, villas, immeubles et autres actifs immobiliers.",
      cta: "Voir les biens bancaires",
      main: "#006B48",
      dark: "#00543A",
      photo: "/images/partenaire-banque.webp",
      Icon: AccountBalance,
      target: "section-banques",
    },
    {
      key: "notaires",
      title: "Notaires partenaires",
      description: "Bénéficiez d'un accompagnement juridique pour sécuriser vos ventes immobilières, vérifier les documents et formaliser les actes de vente.",
      cta: "Nos notaires",
      main: "#0754B8",
      dark: "#073681",
      photo: "/images/partenaire-notaire.webp",
      Icon: Balance,
      target: "section-notaires",
    },
    {
      key: "agences",
      title: "Agences immobilières",
      description: "Découvrez les biens proposés par nos agences partenaires : villas, maisons, appartements, jardins, parcelles, immeubles et locaux commerciaux.",
      cta: "Découvrir les biens",
      main: "#A31550",
      dark: "#800B3B",
      photo: "/images/partenaire-agence.webp",
      Icon: HomeWork,
      target: "section-agences",
    },
  ];

  // Profils de la section "Rejoignez l'écosystème" : les flèches utilisent les parcours existants
  const ECO_PROFILES = [
    {
      key: "agences",
      title: "Agences immobilières",
      description: "Publiez et commercialisez vos biens immobiliers : villas, maisons, appartements, jardins, parcelles et locaux commerciaux.",
      main: "#A31550",
      light: "#FDF2F6",
      Icon: HomeWork,
      action: () => setOpenPartenaireDialog(true),
    },
    {
      key: "banques",
      title: "Banques partenaires",
      description: "Commercialisez vos immobilisations hors exploitation : immeubles, villas, terrains et autres actifs immobiliers.",
      main: "#008557",
      light: "#EFF8F3",
      Icon: AccountBalance,
      action: () => setOpenPartenaireDialog(true),
    },
    {
      key: "notaires",
      title: "Notaires et services compétents",
      description: "Sécurisez et accompagnez les transactions immobilières : vérification des documents, actes de vente et formalités.",
      main: "#1859E8",
      light: "#EFF5FF",
      Icon: Balance,
      action: () => setOpenPartenaireDialog(true),
    },
    {
      key: "particuliers",
      title: "Particuliers et clients",
      description: "Recherchez, achetez, vendez ou louez un bien immobilier en toute confiance.",
      main: "#E87500",
      light: "#FFF5E9",
      Icon: Groups,
      action: () => navigate("/register"),
    },
  ];

  const SHOW_PARTNER_LISTS = false;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const features = [
    {
      icon: <VerifiedUser fontSize="inherit" />,
      title: "Transactions sécurisées",
      description: "Vérification renforcée des biens et meilleure sécurisation des opérations immobilières.",
      color: "#0A7C4F",
      gradient: ["#0A7C4F", "#065F3D"],
    },
    {
      icon: <LocationOn fontSize="inherit" />,
      title: "Biens géolocalisés",
      description: "Localisez les biens avec précision pour mieux apprécier leur emplacement et leur environnement.",
      color: "#3030F9",
      gradient: ["#3030F9", "#2020C8"],
    },
    {
      icon: <Bolt fontSize="inherit" />,
      title: "Parcours simplifié",
      description: "Publication, consultation et mise en relation facilitées pour accélérer vos démarches immobilières.",
      color: "#0A7C4F",
      gradient: ["#0A7C4F", "#065F3D"],
    },
    {
      icon: <Groups fontSize="inherit" />,
      title: "Écosystème connecté",
      description: "Agences, banques, notaires, services compétents et particuliers réunis sur une même plateforme.",
      color: "#3030F9",
      gradient: ["#3030F9", "#2020C8"],
    },
    {
      icon: <TrendingUp fontSize="inherit" />,
      title: "Suivi en temps réel",
      description: "Accédez à l'historique complet des transactions et suivez l'évolution de vos biens instantanément.",
      color: "#0A7C4F",
      gradient: ["#0A7C4F", "#065F3D"],
    },
    {
      icon: <HeadsetMic fontSize="inherit" />,
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
  const handleShowMoreAgences = () => {
    setAgencesDisplayed((prev) => Math.min(prev + 3, homepageAgences.length));
  };

  const handleShowMoreBanques = () => {
    setBanquesDisplayed((prev) => Math.min(prev + 3, banquesPartenaires.length));
  };


  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f5f7fa" }}>
      <Navbar />
      {/* Hero Section : photo plein cadre, voile bleu lumineux à gauche, courbe en bas */}
      <Box
        component="section"
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          color: "#fff",
          // Bleu de repli si la photo n'est pas encore disponible
          backgroundColor: "#1F6FD1",
          backgroundImage: "url(/images/hero-villa.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(3,65,145,0.92) 0%, rgba(4,84,178,0.82) 100%)",
            pointerEvents: "none",
          },
          "@media (min-width:1024px)": {
            minHeight: 600,
            "&::before": {
              background:
                "linear-gradient(90deg, rgba(3,65,145,0.98) 0%, rgba(4,84,178,0.88) 25%, rgba(5,91,180,0.45) 47%, rgba(5,91,180,0) 72%)",
            },
          },
        }}
      >
        {/* Conteneur interne : 1440 px max, marges latérales de 5 % */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            boxSizing: "border-box",
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 2.5, sm: 4, lg: "5%" },
            pt: { xs: 5, sm: 6, lg: 8 },
            pb: { xs: 11, sm: 13, lg: 15 },
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: { xs: 4, lg: 3 },
            alignItems: "stretch",
            "@media (min-width:1024px)": {
              gridTemplateColumns: "48fr 52fr",
              minHeight: 600,
            },
          }}
        >
          {/* Colonne gauche */}
          <Box sx={{ textAlign: { xs: "center", lg: "left" }, alignSelf: "center" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.75,
                py: 0.75,
                mb: 2.5,
                borderRadius: "999px",
                bgcolor: "rgba(80,150,255,0.35)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              <HomeOutlined sx={{ fontSize: 18, color: "#fff" }} />
              <Typography sx={{ fontFamily: "'Plus Jakarta Sans', 'Manrope', 'DM Sans', system-ui, Arial, sans-serif", fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
                Immobilier au Niger
              </Typography>
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontFamily: "'Plus Jakarta Sans', 'Manrope', 'DM Sans', system-ui, Arial, sans-serif",
                fontWeight: 800,
                color: "#fff",
                fontSize: "clamp(32px, 3.2vw, 54px)",
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                maxWidth: 650,
                mx: { xs: "auto", lg: 0 },
                whiteSpace: "normal",
              }}
            >
              <Box component="span" sx={{ display: { xs: "inline", lg: "block" } }}>La plateforme des </Box>
              <Box component="span" sx={{ display: { xs: "inline", lg: "block" } }}>acteurs de l’immobilier </Box>
              <Box component="span" sx={{ display: { xs: "inline", lg: "block" } }}>au Niger</Box>
            </Typography>

            {/* Courbe verte décorative */}
            <Box
              component="svg"
              viewBox="0 0 96 14"
              aria-hidden="true"
              sx={{ display: "block", width: 96, height: 14, mt: 1.75, mb: 2.5, mx: { xs: "auto", lg: 0 } }}
            >
              <path
                d="M3 9 C 18 2, 32 2, 46 8 S 76 14, 93 5"
                fill="none"
                stroke="#2FD39B"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </Box>

            <Typography
              sx={{
                fontSize: { xs: 16, md: 17 },
                lineHeight: 1.6,
                color: "#fff",
                maxWidth: 580,
                mx: { xs: "auto", lg: 0 },
                mb: 4,
              }}
            >
              Connectez les agences, banques, notaires et particuliers pour un marché immobilier plus simple, sécurisé et accessible.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: { xs: "center", lg: "flex-start" },
              }}
            >
              <Button
                variant="contained"
                disableElevation
                onClick={() => navigate("/register")}
                endIcon={<ArrowForward sx={{ fontSize: 20 }} />}
                sx={{
                  bgcolor: "#fff",
                  color: "#1859E8",
                  fontWeight: 700,
                  height: 52,
                  px: 3.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: 16,
                  boxShadow: "0 6px 18px rgba(3,40,100,0.25)",
                  "&:hover": { bgcolor: "#F3F6FA" },
                }}
              >
                S&apos;inscrire gratuitement
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "#fff",
                  borderWidth: 1.5,
                  color: "#fff",
                  fontWeight: 700,
                  height: 52,
                  px: 3.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: 16,
                  "&:hover": { borderColor: "#fff", borderWidth: 1.5, bgcolor: "rgba(255,255,255,0.14)" },
                }}
              >
                Se connecter
              </Button>
            </Stack>
          </Box>

          {/* Colonne droite : carte des indicateurs, en bas, au-dessus du jardin */}
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <Box
              sx={{
                width: "100%",
                bgcolor: "rgba(255,255,255,0.95)",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(3,40,100,0.18)",
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                overflow: "hidden",
              }}
            >
              {[
                { label: "Agences", value: stats.agences, color: "#1859E8", Icon: BusinessOutlined },
                { label: "Parcelles", value: stats.parcelles, color: "#07966B", Icon: LandscapeOutlined },
                { label: "Biens", value: stats.biens, color: "#1859E8", Icon: HomeOutlined },
                { label: "Clients", value: stats.clients, color: "#07966B", Icon: GroupsOutlined },
              ].map((item, idx) => (
                <Box
                  key={item.label}
                  sx={{
                    px: 1.5,
                    py: { xs: 2, sm: 2.25 },
                    minHeight: { sm: 135 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    // Séparateurs verticaux gris clair
                    borderLeft: {
                      xs: idx % 2 === 1 ? "1px solid #E3E8EF" : "none",
                      sm: idx > 0 ? "1px solid #E3E8EF" : "none",
                    },
                    borderTop: { xs: idx > 1 ? "1px solid #E3E8EF" : "none", sm: "none" },
                  }}
                >
                  <item.Icon sx={{ fontSize: 30, color: item.color, mb: 0.75 }} />
                  <Typography
                    sx={{
                      fontFamily: "'Plus Jakarta Sans', 'Manrope', 'DM Sans', system-ui, Arial, sans-serif",
                      fontWeight: 800,
                      fontSize: { xs: 28, md: 32 },
                      lineHeight: 1.1,
                      color: "#101C36",
                    }}
                  >
                    {item.value}+
                  </Typography>
                  <Typography sx={{ fontSize: { xs: 13, md: 14 }, fontWeight: 500, color: "#4A5568", mt: 0.5 }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Courbe inférieure : ruban vert, touche bleu clair, grande courbe aux couleurs de la page */}
        <Box
          component="svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
          sx={{
            position: "absolute",
            left: 0,
            bottom: -1,
            width: "100%",
            height: { xs: 56, sm: 80, lg: 120 },
            display: "block",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <defs>
            <linearGradient id="heroRibbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#07966B" />
              <stop offset="55%" stopColor="#2FD39B" />
              <stop offset="100%" stopColor="#07966B" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 62 C 360 120, 760 30, 1440 70 L1440 84 C 760 48, 360 138, 0 80 Z" fill="url(#heroRibbon)" />
          <path d="M0 88 C 420 130, 900 40, 1440 76 L1440 96 C 900 62, 420 150, 0 100 Z" fill="#7DB4F5" fillOpacity="0.35" />
          <path d="M0 84 C 420 126, 900 36, 1440 72 L1440 120 L0 120 Z" fill="#EDF0F4" />
        </Box>
      </Box>

{/* Section "Pourquoi choisir Dillanci" */}
<Box component="section" sx={{ bgcolor: "#EDF0F4", width: "100%", overflow: "hidden" }}>
  <Box
    sx={{
      boxSizing: "border-box",
      maxWidth: 1440,
      mx: "auto",
      px: { xs: 2.5, sm: 4, md: 5, lg: 7.5 },
      py: { xs: 5, md: 7.5 },
    }}
  >
    {/* En-tête : badge, titre sur deux lignes, courbe verte */}
    <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 1.5, sm: 3 }, mb: 3 }}>
        <Box aria-hidden="true" sx={{ width: { xs: 28, sm: 80 }, height: 3, borderRadius: "2px", background: "linear-gradient(90deg, rgba(24,89,232,0) 0%, #1859E8 100%)" }} />
        <Typography
          component="p"
          sx={{
            m: 0,
            fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
            fontSize: { xs: 22, sm: 28, md: 34 },
            fontWeight: 800,
            letterSpacing: "0.01em",
            lineHeight: 1.2,
            color: "#1859E8",
          }}
        >
          Pourquoi choisir Dillanci ?
        </Typography>
        <Box aria-hidden="true" sx={{ width: { xs: 28, sm: 80 }, height: 3, borderRadius: "2px", background: "linear-gradient(90deg, #1859E8 0%, rgba(24,89,232,0) 100%)" }} />
      </Box>

      <Typography
        variant="h2"
        sx={{
          fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
          fontWeight: 800,
          fontSize: { xs: "clamp(24px, 6.5vw, 30px)", sm: "clamp(28px, 4.5vw, 36px)", lg: "clamp(38px, 2.9vw, 42px)" },
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        <Box component="span" sx={{ display: "block", color: "#101C36" }}>Une plateforme complète et fiable</Box>
        <Box component="span" sx={{ display: "block", color: "#07966B" }}>pour tous les acteurs de l’immobilier</Box>
      </Typography>

      <Box
        component="svg"
        viewBox="0 0 96 14"
        aria-hidden="true"
        sx={{ display: "block", width: 96, height: 14, mt: 1.75, mx: "auto" }}
      >
        <path d="M3 9 C 18 2, 32 2, 46 8 S 76 14, 93 5" fill="none" stroke="#2FD39B" strokeWidth="4" strokeLinecap="round" />
      </Box>
    </Box>

    {/* Deux colonnes : cartes 65 % / photographie 35 % */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "65fr 35fr" },
        gap: { xs: 4, lg: 4 },
        alignItems: "stretch",
      }}
    >
      {/* Six cartes : 3 colonnes x 2 lignes sur desktop */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gridAutoRows: "1fr",
          gap: "20px",
        }}
      >
        {features.map((feature) => {
          const tone = CARD_TONES[feature.title] || { main: "#1455D9", dark: "#12369C" };
          return (
            <Box
              key={feature.title}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                background: `linear-gradient(145deg, ${tone.main} 0%, ${tone.dark} 100%)`,
                borderRadius: "18px",
                boxShadow: "0 4px 14px rgba(16,28,54,0.10)",
                p: "24px",
                overflow: "hidden",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                  transform: { xs: "none", md: "translateY(-4px)" },
                  boxShadow: "0 10px 24px rgba(16,28,54,0.16)",
                },
              }}
            >
              {/* Forme décorative incurvée, translucide, coin supérieur droit */}
              <Box
                component="svg"
                viewBox="0 0 120 120"
                aria-hidden="true"
                sx={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, pointerEvents: "none" }}
              >
                <path d="M120 0 V86 C 96 82, 70 66, 56 42 C 48 28, 52 12, 60 0 Z" fill="#fff" fillOpacity="0.12" />
                <path d="M120 0 V50 C 106 48, 92 38, 86 24 C 83 15, 85 6, 88 0 Z" fill="#fff" fillOpacity="0.10" />
              </Box>
              <Box
                sx={{
                  position: "relative",
                  width: 56,
                  height: 56,
                  borderRadius: "14px",
                  bgcolor: "#fff",
                  color: tone.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  mb: 2.5,
                  flexShrink: 0,
                }}
              >
                {feature.icon}
              </Box>
              <Typography
                sx={{ position: "relative", fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif", fontSize: { xs: 20, lg: 21 }, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.25, mb: 1.25 }}
              >
                {feature.title}
              </Typography>
              <Typography
                sx={{ position: "relative", fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif", fontSize: { xs: 15, lg: 15 }, fontWeight: 400, color: "#F5F7FA", lineHeight: 1.5 }}
              >
                {feature.description}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Photographie : contour incurvé, ruban vert sous l'image */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 320, sm: 400, lg: 0 },
          mb: { xs: 2, lg: 0 },
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 400 40"
          preserveAspectRatio="none"
          aria-hidden="true"
          sx={{ position: "absolute", left: "6%", right: "6%", bottom: -16, width: "88%", height: 40, display: "block" }}
        >
          <defs>
            <linearGradient id="whyRibbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#07966B" />
              <stop offset="100%" stopColor="#2FD39B" />
            </linearGradient>
          </defs>
          <path d="M0 8 C 110 40, 290 -4, 400 22 L400 32 C 290 6, 110 50, 0 20 Z" fill="url(#whyRibbon)" />
        </Box>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            overflow: "hidden",
            borderRadius: { xs: "24px", lg: "96px 24px 96px 24px" },
            bgcolor: "#d9e2ec",
            boxShadow: "0 12px 30px rgba(16,28,54,0.15)",
          }}
        >
          <Box
            component="img"
            src="/images/pourquoi-dillanci.webp"
            alt="Conseillère immobilière présentant la maquette d’une villa"
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: { xs: "70% 30%", lg: "78% 50%" },
            }}
          />
        </Box>
      </Box>
    </Box>
  </Box>
</Box>

     























{/* Section "Nos partenaires de confiance" : points d'entrée vers les listes de partenaires */}
<Box component="section" sx={{ bgcolor: "#E9EDF2", width: "100%", overflow: "hidden" }}>
  <Box
    sx={{
      boxSizing: "border-box",
      maxWidth: 1440,
      mx: "auto",
      px: { xs: 2.5, sm: 4, md: 5, lg: 7.5 },
      py: { xs: 5, md: 7.5 },
    }}
  >
    <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
      <Typography
        variant="h2"
        sx={{
          fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
          fontWeight: 700,
          fontSize: { xs: "clamp(26px, 7vw, 32px)", sm: "clamp(30px, 5vw, 38px)", lg: "clamp(38px, 2.9vw, 42px)" },
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: "#101C36",
        }}
      >
        Nos partenaires de <Box component="span" sx={{ color: "#07966B" }}>confiance</Box>
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
          mt: 1.5,
          mx: "auto",
          maxWidth: 760,
          fontSize: { xs: 16, md: 18 },
          lineHeight: 1.5,
          color: "#475569",
        }}
      >
        Un réseau solide pour vous proposer, sécuriser et finaliser vos projets immobiliers.
      </Typography>
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
        gap: "24px",
        alignItems: "stretch",
      }}
    >
      {PARTNER_CARDS.map((c, idx) => (
        <Box
          key={c.key}
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            minHeight: { xs: 480, lg: 520 },
            borderRadius: "20px",
            overflow: "hidden",
            bgcolor: c.main,
            boxShadow: "0 8px 24px rgba(16,28,54,0.14)",
            // Dernière carte seule sur la 2e ligne en tablette : centrée sur toute la largeur
            gridColumn: { sm: idx === 2 ? "1 / -1" : "auto", lg: "auto" },
            justifySelf: { sm: idx === 2 ? "center" : "stretch", lg: "stretch" },
            width: { sm: idx === 2 ? "calc(50% - 12px)" : "auto", lg: "auto" },
          }}
        >
          {/* Photographie (≈ 45 % de la hauteur) ; couleur de repli tant que la photo n'est pas fournie */}
          <Box
            sx={{
              position: "relative",
              flex: "0 0 45%",
              minHeight: 200,
              backgroundColor: c.dark,
              backgroundImage: `url(${c.photo})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Partie colorée, séparée de la photo par une courbe */}
          <Box
            sx={{
              position: "relative",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              background: `linear-gradient(180deg, ${c.main} 0%, ${c.dark} 100%)`,
              px: 3,
              pt: 6,
              pb: 3,
            }}
          >
            {/* Courbe + fine séparation blanche */}
            <Box
              component="svg"
              viewBox="0 0 400 40"
              preserveAspectRatio="none"
              aria-hidden="true"
              sx={{ position: "absolute", left: 0, top: -39, width: "100%", height: 40, display: "block" }}
            >
              <path d="M0 40 V22 C 90 -2, 310 -2, 400 22 V40 Z" fill={c.main} />
              <path d="M0 22 C 90 -2, 310 -2, 400 22" fill="none" stroke="#fff" strokeWidth="3" />
            </Box>

            {/* Icône à cheval entre la photo et la partie colorée */}
            <Box
              sx={{
                position: "absolute",
                top: -32,
                left: "50%",
                transform: "translateX(-50%)",
                width: 64,
                height: 64,
                borderRadius: "16px",
                bgcolor: "#fff",
                color: c.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(16,28,54,0.2)",
                zIndex: 2,
              }}
            >
              <c.Icon sx={{ fontSize: 36 }} />
            </Box>

            <Typography sx={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1.25, mb: 1.25 }}>
              {c.title}
            </Typography>
            <Typography sx={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif", fontSize: { xs: 15, lg: 15.5 }, color: "#fff", lineHeight: 1.55, mb: 3, minHeight: { sm: 100 } }}>
              {c.description}
            </Typography>
            <Button
              onClick={() => scrollToSection(c.target)}
              endIcon={<ArrowForward sx={{ fontSize: 20 }} />}
              disableElevation
              sx={{
                mt: "auto",
                height: 48,
                px: 3,
                borderRadius: "12px",
                bgcolor: "#fff",
                color: c.main,
                fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
                fontWeight: 700,
                fontSize: 15.5,
                textTransform: "none",
                "&:hover": { bgcolor: "#F3F6FA" },
              }}
            >
              {c.cta}
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
</Box>

{/* Listes Agences / Banques / Notaires partenaires : masquées de l'accueil (code conservé). Passer à true pour les réafficher. */}
{SHOW_PARTNER_LISTS && (
<>
<Box id="section-agences" sx={{ 
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
                    gap: "20px",
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
  id="section-banques"
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
                gap: "20px",
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
  id="section-notaires"
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
                    gap: "20px",
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
</>
)}

      {/* Section "Rejoignez l'écosystème Dillanci" */}
      <Box component="section" sx={{ bgcolor: "#fff", width: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            boxSizing: "border-box",
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 2.5, sm: 4, md: 5 },
            py: { xs: 5, md: 7 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "35fr 65fr" },
            columnGap: { lg: 8 },
            rowGap: { xs: 4, lg: 0 },
            alignItems: "start",
          }}
        >
          {/* Colonne gauche : titre, description, photographie */}
          <Box sx={{ textAlign: "left" }}>
            <Box aria-hidden="true" sx={{ display: "flex", gap: 0.75, mb: 2 }}>
              <Box sx={{ width: 36, height: 5, borderRadius: "3px", bgcolor: "#07966B" }} />
              <Box sx={{ width: 12, height: 5, borderRadius: "3px", bgcolor: "#2FD39B" }} />
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
                fontWeight: 800,
                fontSize: { xs: "clamp(32px, 9vw, 40px)", md: "clamp(40px, 5vw, 48px)", lg: "clamp(44px, 3.4vw, 52px)" },
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#101C36",
              }}
            >
              <Box component="span" sx={{ display: "block" }}>Rejoignez</Box>
              <Box component="span" sx={{ display: "block" }}>l’écosystème</Box>
              <Box component="span" sx={{ display: "block", color: "#07966B" }}>Dillanci</Box>
            </Typography>
            <Box component="svg" viewBox="0 0 96 14" aria-hidden="true" sx={{ display: "block", width: 96, height: 14, mt: 1.5, mb: 2.5 }}>
              <path d="M3 9 C 18 2, 32 2, 46 8 S 76 14, 93 5" fill="none" stroke="#2FD39B" strokeWidth="4" strokeLinecap="round" />
            </Box>
            <Typography sx={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif", fontSize: { xs: 17, md: 19 }, lineHeight: 1.5, color: "#334155", maxWidth: 460, mb: 3 }}>
              Quatre profils, un même objectif : valoriser et sécuriser l’immobilier au Niger.
            </Typography>
            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                height: { sm: 260, lg: 240 },
                borderRadius: "24px",
                overflow: "hidden",
                backgroundColor: "#E9EDF2",
                backgroundImage: "url(/images/ecosysteme-dillanci.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 8px 24px rgba(16,28,54,0.12)",
              }}
            />
          </Box>

          {/* Colonne droite : quatre blocs horizontaux reliés par une courbe */}
          <Box sx={{ position: "relative" }}>
            {/* Ligne incurvée de liaison avec quatre points colorés (desktop) */}
            <Box
              component="svg"
              viewBox="0 0 40 600"
              preserveAspectRatio="none"
              aria-hidden="true"
              sx={{ display: { xs: "none", lg: "block" }, position: "absolute", left: -44, top: 0, width: 32, height: "100%", pointerEvents: "none" }}
            >
              <path d="M20 12 C 4 120, 36 180, 20 210 S 4 330, 20 400 S 36 500, 20 588" fill="none" stroke="#C9D3E0" strokeWidth="2" strokeDasharray="5 6" vectorEffect="non-scaling-stroke" />
            </Box>
            <Box sx={{ display: { xs: "none", lg: "flex" }, flexDirection: "column", justifyContent: "space-around", position: "absolute", left: -56, top: 0, bottom: 0, width: 24, pointerEvents: "none" }}>
              {ECO_PROFILES.map((pf) => (
                <Box key={pf.key} sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: pf.main, border: "3px solid #fff", boxShadow: "0 0 0 1px #E0E6EE", alignSelf: "center" }} />
              ))}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {ECO_PROFILES.map((pf) => (
                <Box
                  key={pf.key}
                  role="button"
                  tabIndex={0}
                  onClick={pf.action}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pf.action(); } }}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    minHeight: { xs: 120, md: 125 },
                    borderRadius: "24px",
                    overflow: "hidden",
                    bgcolor: pf.light,
                    border: `1px solid ${pf.main}33`,
                    boxShadow: "0 4px 14px rgba(16,28,54,0.07)",
                    cursor: "pointer",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": { transform: { md: "translateY(-3px)" }, boxShadow: "0 10px 24px rgba(16,28,54,0.12)" },
                    "&:focus-visible": { outline: `3px solid ${pf.main}`, outlineOffset: 2 },
                  }}
                >
                  {/* Zone colorée de l'icône, bord droit incurvé */}
                  <Box sx={{ position: "relative", flex: { xs: "0 0 84px", sm: "0 0 120px", md: "0 0 140px" }, color: "#fff" }}>
                    <Box
                      component="svg"
                      viewBox="0 0 140 100"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
                    >
                      <path d="M0 0 H122 C 144 30, 144 70, 122 100 H0 Z" fill={pf.main} />
                    </Box>
                    <Box sx={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", pr: 1.5 }}>
                      <pf.Icon sx={{ fontSize: { xs: 36, md: 52 }, color: "#fff" }} />
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", px: { xs: 2, md: 3 }, py: 1.75 }}>
                    <Typography sx={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif", fontSize: { xs: 18, md: 23 }, fontWeight: 700, color: pf.main, lineHeight: 1.25, mb: 0.5 }}>
                      {pf.title}
                    </Typography>
                    <Typography sx={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif", fontSize: { xs: 14, md: 15.5 }, color: "#334155", lineHeight: 1.5 }}>
                      {pf.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", pr: { xs: 1.5, md: 3 } }}>
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: { xs: 36, md: 42 },
                        height: { xs: 36, md: 42 },
                        borderRadius: "50%",
                        bgcolor: pf.main,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ArrowForward sx={{ fontSize: 22 }} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Section "Prêt à commencer ?" */}
      <Box component="section" sx={{ bgcolor: "#E9EDF2", width: "100%", overflow: "hidden" }}>
        <Box sx={{ boxSizing: "border-box", maxWidth: 1440, mx: "auto", px: { xs: 2, sm: 4, md: 5 }, py: "50px" }}>
          <Box
            sx={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "40fr 60fr" },
              minHeight: { lg: 350 },
              borderRadius: "24px",
              overflow: "hidden",
              background: "linear-gradient(135deg, #005C42 0%, #004D38 100%)",
              boxShadow: "0 12px 32px rgba(0,60,40,0.22)",
            }}
          >
            {/* Photographie (40 %), fondue dans le vert vers la droite */}
            <Box
              sx={{
                position: "relative",
                minHeight: { xs: 200, sm: 260, lg: 0 },
                backgroundImage: "url(/images/pret-a-commencer.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: {
                    xs: "linear-gradient(180deg, rgba(0,77,56,0) 40%, #004D38 100%)",
                    lg: "linear-gradient(90deg, rgba(0,92,66,0) 55%, #005C42 100%)",
                  },
                },
              }}
            />

            {/* Courbe décorative : coin supérieur gauche */}
            <Box
              component="svg"
              viewBox="0 0 200 200"
              aria-hidden="true"
              sx={{ position: "absolute", top: 0, left: 0, width: { xs: 110, lg: 190 }, height: { xs: 110, lg: 190 }, pointerEvents: "none", zIndex: 2 }}
            >
              <path d="M0 0 H200 C 120 10, 40 70, 0 200 Z" fill="#84CC16" fillOpacity="0.85" />
              <path d="M0 0 H130 C 80 10, 30 50, 0 130 Z" fill="#FACC15" fillOpacity="0.9" />
            </Box>

            {/* Courbe décorative : coin inférieur droit */}
            <Box
              component="svg"
              viewBox="0 0 300 220"
              aria-hidden="true"
              sx={{ position: "absolute", right: 0, bottom: 0, width: { xs: 150, lg: 300 }, height: { xs: 110, lg: 220 }, pointerEvents: "none", zIndex: 1 }}
            >
              <path d="M300 0 C 290 110, 180 210, 40 220 H300 Z" fill="#84CC16" fillOpacity="0.28" />
              <path d="M300 70 C 285 150, 220 205, 130 220 H300 Z" fill="#FACC15" fillOpacity="0.22" />
            </Box>

            {/* Contenu (60 %) */}
            <Box
              sx={{
                position: "relative",
                zIndex: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: { xs: 2.5, md: 6 },
                pt: { xs: 4, lg: 5 },
                pb: { xs: 8, lg: 11 },
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
                  fontWeight: 800,
                  fontSize: { xs: "clamp(30px, 8vw, 36px)", md: "clamp(36px, 4vw, 42px)", lg: 46 },
                  lineHeight: 1.15,
                  color: "#fff",
                }}
              >
                Prêt à{" "}
                <Box component="span" sx={{ color: "#FACC15", position: "relative", display: "inline-block" }}>
                  commencer ?
                  <Box
                    component="svg"
                    viewBox="0 0 160 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    sx={{ position: "absolute", left: 0, right: 0, bottom: -10, width: "100%", height: 12 }}
                  >
                    <path d="M3 8 C 40 1, 80 1, 120 6 S 150 9, 157 4" fill="none" stroke="#FACC15" strokeWidth="3.5" strokeLinecap="round" />
                  </Box>
                </Box>
              </Typography>

              <Typography
                sx={{
                  fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
                  mt: 3.5,
                  mb: 4,
                  maxWidth: 700,
                  fontSize: { xs: 16, md: 18 },
                  lineHeight: 1.6,
                  color: "#fff",
                }}
              >
                Créez votre compte dès maintenant et accédez à toutes les opportunités immobilières sur Dillanci.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={0} sx={{ gap: "20px", alignItems: "center", justifyContent: "center", width: { xs: "100%", sm: "auto" } }}>
                <Button
                  onClick={() => navigate("/register")}
                  startIcon={<PersonAddAlt1 />}
                  endIcon={<ArrowForward />}
                  disableElevation
                  sx={{
                    height: 52,
                    px: 3.5,
                    borderRadius: "999px",
                    bgcolor: "#fff",
                    color: "#005C42",
                    fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    textTransform: "none",
                    width: { xs: "100%", sm: "auto" },
                    maxWidth: 320,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": { bgcolor: "#F3F6FA", transform: "translateY(-2px)", boxShadow: "0 8px 18px rgba(0,0,0,0.22)" },
                  }}
                >
                  Créer un compte
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  startIcon={<Login />}
                  endIcon={<ArrowForward />}
                  sx={{
                    height: 52,
                    px: 3.5,
                    borderRadius: "999px",
                    border: "2px solid #fff",
                    color: "#fff",
                    fontFamily: "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    textTransform: "none",
                    width: { xs: "100%", sm: "auto" },
                    maxWidth: 320,
                    transition: "transform 0.2s ease, background-color 0.2s ease",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.14)", transform: "translateY(-2px)", border: "2px solid #fff" },
                  }}
                >
                  Se connecter
                </Button>
              </Stack>
            </Box>

            {/* Silhouette de Niamey (contours blancs, discrète) : zone droite, sous le contenu */}
            <Box
              component="svg"
              viewBox="0 0 600 70"
              preserveAspectRatio="xMidYMax meet"
              aria-hidden="true"
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                right: { md: "4%", lg: "6%" },
                bottom: 0,
                width: { md: "56%", lg: "50%" },
                height: 62,
                pointerEvents: "none",
                zIndex: 1,
                opacity: 0.2,
              }}
            >
              <g fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
                <path d="M0 70 V54 H28 V40 H52 V54 H70 V70" />
                <path d="M90 70 V30 L110 14 L130 30 V70" />
                <path d="M150 70 V44 H190 V70" />
                {/* Grande mosquée : minaret + coupoles */}
                <path d="M215 70 V20 M215 20 L222 8 L229 20 V70" />
                <path d="M229 70 V46 C 240 30, 270 30, 281 46 V70" />
                <path d="M290 70 V36 H320 V70" />
                <path d="M340 70 V24 L352 10 L364 24 V70" />
                <path d="M380 70 V48 H418 V70" />
                <path d="M432 70 V28 H452 V70 M437 28 V18 H447 V28" />
                <path d="M470 70 V50 C 478 38, 498 38, 506 50 V70" />
                <path d="M520 70 V36 H552 V70 M528 36 V24 H544 V36" />
                <path d="M565 70 V56 H600 V70" />
              </g>
            </Box>
          </Box>
        </Box>
      </Box>

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
