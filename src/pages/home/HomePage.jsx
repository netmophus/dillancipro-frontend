import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { decimalToDMS } from "../../utils/coordinateUtils";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
  Home,
  TrendingUp,
  Security,
  Speed,
  Groups,
  CheckCircle,
  ArrowForward,
  LocationOn,
  AttachMoney,
  VerifiedUser,
  Star,
  Phone,
  Close as CloseIcon,
  Bed,
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
  VideoLibrary,
  Description,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import BienDetailDrawer from "../../components/biens/BienDetailDrawer";
import ParcelleDetailDrawer from "../../components/parcelles/ParcelleDetailDrawer";

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
  const [openLocationsDrawer, setOpenLocationsDrawer] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const locationsPerPage = 6;
  
  // États pour les locations dynamiques de la page d'accueil
  const [homepageLocations, setHomepageLocations] = useState([]);
  const [loadingHomepageLocations, setLoadingHomepageLocations] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // États pour les biens immobiliers dynamiques de la page d'accueil
  const [homepageBiens, setHomepageBiens] = useState([]);
  const [loadingHomepageBiens, setLoadingHomepageBiens] = useState(false);
  const [biensByAgence, setBiensByAgence] = useState({}); // Biens groupés par agence
  const [agencesListBiens, setAgencesListBiens] = useState([]); // Liste des agences avec biens
  const [selectedAgenceIdBiens, setSelectedAgenceIdBiens] = useState("all"); // ID de l'agence sélectionnée pour les biens
  const [biensCarouselByAgence, setBiensCarouselByAgence] = useState({}); // Indices de carrousel pour chaque agence (biens)
  const [selectedBien, setSelectedBien] = useState(null);
  const [openBiensDrawer, setOpenBiensDrawer] = useState(false);
  const [homepageAgences, setHomepageAgences] = useState([]);
  const [loadingHomepageAgences, setLoadingHomepageAgences] = useState(false);
  const [homepageParcelles, setHomepageParcelles] = useState([]);
  const [parcellesByAgence, setParcellesByAgence] = useState({}); // Parcelles groupées par agence
  const [agencesList, setAgencesList] = useState([]); // Liste des agences avec parcelles
  const [selectedAgenceId, setSelectedAgenceId] = useState("all"); // ID de l'agence sélectionnée ("all" pour toutes)
  const [loadingHomepageParcelles, setLoadingHomepageParcelles] = useState(false);
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [openParcelleDrawer, setOpenParcelleDrawer] = useState(false);
  const [selectedBanque, setSelectedBanque] = useState(null);
  const [openBanqueDrawer, setOpenBanqueDrawer] = useState(false);
  const parcellesPerAgence = 6; // Nombre de parcelles à afficher par agence sur la homepage
  const [carouselIndices, setCarouselIndices] = useState({}); // Indices de carrousel pour chaque agence
  const [parcellesCarouselByAgence, setParcellesCarouselByAgence] = useState({}); // Indices de carrousel pour chaque agence (parcelles)
  const [homepageNotaires, setHomepageNotaires] = useState([]);
  const [loadingHomepageNotaires, setLoadingHomepageNotaires] = useState(false);
  
  // État pour le carrousel des biens immobiliers
  const [biensCarouselIndex, setBiensCarouselIndex] = useState(0);
  
  // État pour le carrousel des parcelles
  const [parcellesCarouselIndex, setParcellesCarouselIndex] = useState(0);
  
  // État pour le carrousel des locations
  const [locationsCarouselIndex, setLocationsCarouselIndex] = useState(0);
  
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
  const [locationsDisplayed, setLocationsDisplayed] = useState(3);
  
  // État pour l'affichage progressif des parcelles par agence (initialement 3 par agence)
  const [parcellesDisplayedByAgence, setParcellesDisplayedByAgence] = useState({});
  
  // État pour l'affichage progressif des biens par agence
  const [biensDisplayedByAgence, setBiensDisplayedByAgence] = useState({});
  
  // Ref pour le conteneur scrollable des agences
  const agencesScrollContainerRef = useRef(null);
  
  // Ref pour le conteneur scrollable des banques
  const banquesScrollContainerRef = useRef(null);
  
  // Refs pour les conteneurs scrollables des parcelles par agence
  const parcellesScrollContainerRefs = useRef({});
  
  // Refs pour les conteneurs scrollables des biens par agence
  const biensScrollContainerRefs = useRef({});
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Fonction pour ouvrir le drawer avec les détails d'une location
  const handleOpenLocationDetails = (location) => {
    setSelectedLocation(location);
    setOpenLocationsDrawer(true);
  };

  // Fonction pour fermer le drawer
  const handleCloseLocationDetails = () => {
    setSelectedLocation(null);
    setOpenLocationsDrawer(false);
  };

  // Fonction pour ouvrir le drawer avec les détails d'une parcelle
  const handleOpenParcelleDetails = (parcelle) => {
    setSelectedParcelle(parcelle);
    setOpenParcelleDrawer(true);
  };

  // Fonction pour fermer le drawer des détails de parcelle
  const handleCloseParcelleDetails = () => {
    setSelectedParcelle(null);
    setOpenParcelleDrawer(false);
  };

  // Fonction pour ouvrir le drawer avec les détails d'un bien immobilier
  const handleOpenBienDetails = (bien) => {
    setSelectedBien(bien);
    setOpenBiensDrawer(true);
  };

  // Fonction pour fermer le drawer des détails de bien immobilier
  const handleCloseBienDetails = () => {
    setSelectedBien(null);
    setOpenBiensDrawer(false);
  };

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
    return `http://localhost:5000/${correctedPath}`;
  };

  // Fonction pour convertir les URLs YouTube/Vimeo en URLs d'embed
  const getVideoEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Si ce n'est ni YouTube ni Vimeo, retourner l'URL originale
    return videoUrl;
  };

  // Fonction pour générer l'URL d'une image statique OpenStreetMap (gratuit)
  const getOpenStreetMapStaticImage = (latitude, longitude, width = 400, height = 300, zoom = 18) => {
    if (!latitude || !longitude) return null;
    
    // Utiliser StaticMap API avec zoom élevé pour voir les maisons et routes
    // Alternative gratuite à Google Maps Static API
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=${latitude},${longitude},red-pushpin`;
  };

  // Fonction pour obtenir l'URL de navigation (gratuit, utilise OpenStreetMap)
  const getNavigationUrl = (latitude, longitude) => {
    if (!latitude || !longitude) return null;
    // Utilise OpenStreetMap pour la navigation (gratuit)
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
  };


  // Fonction pour charger toutes les locations depuis l'API (publique)
  const fetchAllLocations = async () => {
    setLoadingLocations(true);
    try {
      // Utiliser la route publique pour les locations
      const response = await api.get("/agence/locations/public").catch(async () => {
        // Fallback vers la route protégée si publique échoue (pour compatibilité)
        return await api.get("/agence/locations").catch(() => ({ data: { locations: [] } }));
      });
      const locations = response.data.locations || response.data || [];
      
      const transformedLocations = locations.map((location, index) => ({
        id: location._id,
        titre: location.titre,
        ville: location.ville,
        superficie: location.superficie?.toString() || "0",
        chambres: location.chambres || 0,
        prix: location.prixMensuel || 0,
        type: location.type || "Appartement",
        gradient: [
          ["#11998e", "#38ef7d"],
          ["#e94057", "#f27121"],
          ["#8e2de2", "#4a00e0"],
          ["#1B5285", "#27AE60"],
          ["#f093fb", "#f5576c"],
          ["#4facfe", "#00f2fe"]
        ][index % 6],
        image: location.images && location.images.length > 0 && location.images[0]?.url ? fixImageUrl(location.images[0].url) : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=90",
        description: location.description || "Bien immobilier de qualité",
        disponibilite: location.statut === "disponible" ? "Immédiate" : "Sur demande",
        meuble: location.meuble || false,
        features: [
          location.climatisation && "Climatisation",
          location.internet && "Internet",
          location.parking && "Parking",
          location.garage && "Garage",
          location.balcon && "Balcon",
          location.ascenseur && "Ascenseur",
          location.jardin && "Jardin",
          location.cuisine && "Cuisine",
          location.salon && "Salon"
        ].filter(Boolean)
      }));
      
      setAllLocations(transformedLocations);
      setTotalPages(Math.ceil(transformedLocations.length / locationsPerPage));
    } catch (error) {
      setAllLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fonction pour charger les locations de la page d'accueil (publique)
  const fetchHomepageLocations = async () => {
    setLoadingHomepageLocations(true);
    try {
      // Utiliser la route publique pour les locations
      const response = await api.get("/agence/locations/public").catch(async () => {
        // Fallback vers la route protégée si publique échoue (pour compatibilité)
        return await api.get("/agence/locations").catch(() => ({ data: { locations: [] } }));
      });
      const locations = response.data.locations || response.data || [];
      
      // Transformer les données de l'API pour correspondre au format attendu
      const transformedLocations = locations.map((location, index) => {
        return {
        id: location._id,
        titre: location.titre,
        ville: location.ville,
        quartier: location.quartier,
        adresse: location.adresse,
        coordonnees: location.coordonnees,
        superficie: location.superficie?.toString() || "0",
        chambres: location.chambres || 0,
        salleDeBain: location.salleDeBain || 0,
        prix: location.prixMensuel || 0,
        caution: location.caution || 0,
        charges: location.charges || 0,
        chargesIncluses: location.chargesIncluses || false,
        dureeMinimale: location.dureeMinimale || "Non spécifiée",
        dateDisponibilite: location.dateDisponibilite,
        type: location.type || "Appartement",
        statut: location.statut || "disponible",
        reference: location.reference,
        gradient: [
          ["#11998e", "#38ef7d"],
          ["#e94057", "#f27121"],
          ["#8e2de2", "#4a00e0"],
          ["#1B5285", "#27AE60"],
          ["#f093fb", "#f5576c"],
          ["#4facfe", "#00f2fe"]
        ][index % 6],
        image: location.images && location.images.length > 0 && location.images[0]?.url ? fixImageUrl(location.images[0].url) : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=90",
        images: location.images || [], // Inclure toutes les images
        description: location.description || "Bien immobilier de qualité",
        disponibilite: location.statut === "disponible" ? "Immédiate" : "Sur demande",
        meuble: location.meuble || false,
        // Équipements détaillés
        climatisation: location.climatisation || false,
        internet: location.internet || false,
        parking: location.parking || false,
        garage: location.garage || false,
        balcon: location.balcon || false,
        ascenseur: location.ascenseur || false,
        jardin: location.jardin || false,
        cuisine: location.cuisine || false,
        salon: location.salon || false,
        chauffage: location.chauffage || false,
        features: [
          location.climatisation && "Climatisation",
          location.internet && "Internet",
          location.parking && "Parking",
          location.garage && "Garage",
          location.balcon && "Balcon",
          location.ascenseur && "Ascenseur",
          location.jardin && "Jardin",
          location.cuisine && "Cuisine",
          location.salon && "Salon",
          location.chauffage && "Chauffage"
        ].filter(Boolean)
        };
      });
      
      setHomepageLocations(transformedLocations);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des locations:", error);
      // En cas d'erreur, laisser la liste vide
      setHomepageLocations([]);
    } finally {
      setLoadingHomepageLocations(false);
    }
  };

  // Fonction pour récupérer les biens immobiliers pour la page d'accueil
  const fetchHomepageBiens = async () => {
    setLoadingHomepageBiens(true);
    try {
      const response = await api.get("/public/patrimoine");
      const biens = response.data.patrimoine || response.data || [];
      
      // Transformer les données de l'API pour correspondre au format attendu
      const transformedBiens = biens.map((bien, index) => {
        const transformed = {
          id: bien._id,
          titre: bien.titre,
          type: bien.type || "Bien immobilier",
          ville: bien.localisation?.ville || "Ville non spécifiée",
          quartier: bien.localisation?.quartier,
          adresse: bien.localisation?.adresse,
          latitude: bien.localisation?.latitude,
          longitude: bien.localisation?.longitude,
          superficie: bien.superficie?.toString() || "0",
          prix: bien.prix || 0,
          reference: bien.reference,
          description: bien.description || "Bien immobilier de qualité",
          statut: bien.statut || "disponible",
          agenceId: bien.agenceId?._id || null,
          agenceNom: bien.agenceId?.nom || "",
          agenceVille: bien.agenceId?.ville || "",
          agenceTelephone: bien.agenceId?.telephone || "",
          gradient: [
            ["#11998e", "#38ef7d"],
            ["#e94057", "#f27121"],
            ["#8e2de2", "#4a00e0"],
            ["#1B5285", "#27AE60"],
            ["#f093fb", "#f5576c"],
            ["#4facfe", "#00f2fe"]
          ][index % 6],
          image: bien.images && bien.images.length > 0 && bien.images[0] ? fixImageUrl(bien.images[0]) : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=90",
          images: bien.images || [],
          documents: bien.documents || [],
          videos: bien.videos || [],
          // Caractéristiques détaillées
          caracteristiques: bien.caracteristiques || {},
          nbChambres: bien.caracteristiques?.nbChambres || 0,
          nbSallesBain: bien.caracteristiques?.nbSallesBain || 0,
          nbSalons: bien.caracteristiques?.nbSalons || 0,
          garage: bien.caracteristiques?.garage || false,
          piscine: bien.caracteristiques?.piscine || false,
          jardin: bien.caracteristiques?.jardin || false,
          climatisation: bien.caracteristiques?.climatisation || false,
          cuisine: bien.caracteristiques?.cuisine || "Non spécifiée",
          anneeConstruction: bien.caracteristiques?.anneeConstruction,
          etatGeneral: bien.caracteristiques?.etatGeneral || "Non spécifié",
          acces: bien.caracteristiques?.acces || "Non spécifié",
          electricite: bien.caracteristiques?.electricite || false,
          eau: bien.caracteristiques?.eau || false,
          securite: bien.caracteristiques?.securite || false,
          verified: bien.verified || false, // Statut de vérification
          // Informations supplémentaires
          situationGeographique: bien.situationGeographique || null,
          descriptionPhysique: bien.descriptionPhysique || null,
          atoutsMajeurs: Array.isArray(bien.atoutsMajeurs) ? bien.atoutsMajeurs : (bien.atoutsMajeurs ? [bien.atoutsMajeurs] : []),
          // Équipements disponibles
          features: [
            bien.caracteristiques?.garage && "Garage",
            bien.caracteristiques?.piscine && "Piscine",
            bien.caracteristiques?.jardin && "Jardin",
            bien.caracteristiques?.climatisation && "Climatisation",
            bien.caracteristiques?.electricite && "Électricité",
            bien.caracteristiques?.eau && "Eau courante",
            bien.caracteristiques?.securite && "Sécurité",
            bien.caracteristiques?.cuisine && `Cuisine ${bien.caracteristiques.cuisine}`,
            bien.caracteristiques?.acces && `Accès ${bien.caracteristiques.acces}`,
            bien.images?.length > 0 && "Photos disponibles",
            bien.documents?.length > 0 && "Documents disponibles",
            bien.videos?.length > 0 && "Vidéos disponibles"
          ].filter(Boolean)
        };
        
        return transformed;
      });
      
      // Grouper les biens par agence
      const groupedByAgence = {};
      const agencesMap = new Map();
      
      transformedBiens.forEach((bien) => {
        const agenceId = bien.agenceId || "sans-agence";
        const agenceNom = bien.agenceNom || "Sans agence";
        
        if (!groupedByAgence[agenceId]) {
          groupedByAgence[agenceId] = [];
          agencesMap.set(agenceId, {
            id: agenceId,
            nom: agenceNom,
            ville: bien.agenceVille || "",
            telephone: bien.agenceTelephone || "",
            count: 0,
          });
        }
        
        groupedByAgence[agenceId].push(bien);
        const agence = agencesMap.get(agenceId);
        agence.count = groupedByAgence[agenceId].length;
      });
      
      // Convertir la Map en tableau et trier par nombre de biens (décroissant)
      const agencesArray = Array.from(agencesMap.values()).sort((a, b) => b.count - a.count);
      
      setHomepageBiens(transformedBiens);
      setBiensByAgence(groupedByAgence);
      setAgencesListBiens(agencesArray);
    } catch (error) {
      setHomepageBiens([]);
    } finally {
      setLoadingHomepageBiens(false);
    }
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

  const fetchHomepageParcelles = async () => {
    setLoadingHomepageParcelles(true);
    try {
      const response = await api.get("/public/parcelles");
      const parcelles = response.data.parcelles || response.data || [];
      
      console.log("🔍 [HOMEPAGE_PARCelles] Parcelles reçues:", parcelles.length);
      if (parcelles.length > 0) {
        console.log("🔍 [HOMEPAGE_PARCelles] Première parcelle:", {
          id: parcelles[0]._id,
          photos: parcelles[0].photos,
          hasPhotos: parcelles[0].photos && parcelles[0].photos.length > 0
        });
      }
      
      const transformed = parcelles.map((p, index) => {
        // Extraire la ville depuis la localisation géographique de l'ilot
        // Priorité : ilot.quartier.ville (référence directe) > ilot.zone.quartier.ville
        let ville = "Niamey"; // Valeur par défaut
        
        // Essayer d'abord la référence directe quartier -> ville
        if (p.ilot?.quartier?.ville) {
          ville = typeof p.ilot.quartier.ville === 'object'
            ? (p.ilot.quartier.ville.nom || ville)
            : p.ilot.quartier.ville;
        } 
        // Sinon essayer via zone -> quartier -> ville
        else if (p.ilot?.zone?.quartier?.ville) {
          ville = typeof p.ilot.zone.quartier.ville === 'object' 
            ? (p.ilot.zone.quartier.ville.nom || ville)
            : p.ilot.zone.quartier.ville;
        }
        
        return {
          id: p._id,
          ref: p.numeroParcelle || `P-${p._id.slice(-6)}`,
          ilot: p.ilot?.numeroIlot || "N/A",
          superficie: p.superficie || 0,
          prix: p.prix || 0,
          description: p.description || "",
          statut: p.statut || "avendre",
          ville: ville, // Ville géographique de l'ilot
          agenceNom: p.agenceId?.nom || "",
          agenceId: p.agenceId?._id || null,
          agenceTelephone: p.agenceId?.telephone || "",
          agenceVille: p.agenceId?.ville || "", // Ville de l'agence (peut être différente)
          // Priorité: photos de la parcelle, puis images de l'îlot
          images: (p.photos && p.photos.length > 0) ? p.photos : (p.images || []),
          photos: p.photos || [], // Photos de la parcelle
          videos: p.videos || [],
          documents: p.documents || [],
          localisation: p.localisation || {},
          latitude: p.localisation?.lat || p.localisation?.latitude || null,
          longitude: p.localisation?.lng || p.localisation?.longitude || null,
          verified: p.verified || false, // Statut de vérification
        };
      });
      
      // Grouper les parcelles par agence
      const groupedByAgence = {};
      const agencesMap = new Map();
      
      transformed.forEach((parcelle) => {
        const agenceId = parcelle.agenceId || "sans-agence";
        const agenceNom = parcelle.agenceNom || "Sans agence";
        
        if (!groupedByAgence[agenceId]) {
          groupedByAgence[agenceId] = [];
          agencesMap.set(agenceId, {
            id: agenceId,
            nom: agenceNom,
            ville: parcelle.agenceVille || "",
            telephone: parcelle.agenceTelephone || "",
            count: 0,
          });
        }
        
        groupedByAgence[agenceId].push(parcelle);
        const agence = agencesMap.get(agenceId);
        agence.count = groupedByAgence[agenceId].length;
      });
      
      // Convertir la Map en tableau et trier par nombre de parcelles (décroissant)
      const agencesArray = Array.from(agencesMap.values()).sort((a, b) => b.count - a.count);
      
      setHomepageParcelles(transformed);
      setParcellesByAgence(groupedByAgence);
      setAgencesList(agencesArray);
    } catch (error) {
      console.error("Erreur lors du chargement des parcelles:", error);
      setHomepageParcelles([]);
      setParcellesByAgence({});
      setAgencesList([]);
    } finally {
      setLoadingHomepageParcelles(false);
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
    fetchAllLocations();
    fetchHomepageLocations();
    fetchHomepageBiens();
    fetchHomepageAgences();
    fetchHomepageParcelles();
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
      color: "#27AE60",
      gradient: ["#10b981", "#059669"],
    },
    {
      icon: <LocationOn fontSize="large" />,
      title: "Biens géolocalisés",
      description: "Localisez les biens avec précision pour mieux apprécier leur emplacement et leur environnement.",
      color: "#1B5285",
      gradient: ["#3b82f6", "#2563eb"],
    },
    {
      icon: <Speed fontSize="large" />,
      title: "Parcours simplifié",
      description: "Publication, consultation et mise en relation facilitées pour accélérer vos démarches immobilières.",
      color: "#f59e0b",
      gradient: ["#f59e0b", "#d97706"],
    },
    {
      icon: <Groups fontSize="large" />,
      title: "Écosystème connecté",
      description: "Agences, banques, notaires, services compétents et particuliers réunis sur une même plateforme.",
      color: "#1B5285",
      gradient: ["#1B5285", "#0D2B4E"],
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: "Suivi en temps réel",
      description: "Accédez à l'historique complet des transactions et suivez l'évolution de vos biens instantanément.",
      color: "#8b5cf6",
      gradient: ["#8b5cf6", "#7c3aed"],
    },
    {
      icon: <Support fontSize="large" />,
      title: "Accompagnement professionnel",
      description: "Bénéficiez d'un support dédié et de conseils d'experts pour toutes vos démarches immobilières.",
      color: "#ef4444",
      gradient: ["#ef4444", "#dc2626"],
    },
  ];

  // Fonction helper pour rendre une carte de parcelle (sans Grid pour le carrousel)
  const renderParcelleCard = (parcelle, index, inCarousel = false) => {
    // Debug: vérifier les photos
    if (index === 0) {
      console.log("🖼️ [RENDER_PARCelle_CARD] Parcelle:", {
        id: parcelle.id,
        ref: parcelle.ref,
        photos: parcelle.photos,
        images: parcelle.images,
        photosLength: parcelle.photos?.length,
        imagesLength: parcelle.images?.length,
        hasPhotos: (parcelle.photos && parcelle.photos.length > 0) || (parcelle.images && parcelle.images.length > 0),
        firstPhoto: parcelle.photos?.[0] || parcelle.images?.[0]
      });
    }
    
    const gradients = [
      "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ];
    const currentGradient = gradients[index % gradients.length];
    
    const cardContent = (
      <Card
        elevation={0}
        sx={{
          height: "100%",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          border: "none",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
          background: "white",
          position: "relative",
          "&:hover": { 
            transform: { xs: "none", md: "translateY(-12px) scale(1.02)" }, 
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            "& .parcelle-image": {
              transform: "scale(1.1)",
            },
            "& .parcelle-button": {
              background: currentGradient,
              color: "white",
              borderColor: "transparent",
            },
          },
        }}
      >
        {/* Image/Map Section avec overlay gradient */}
        <Box
          sx={{
            height: { xs: 200, sm: 220, md: 240 },
            position: "relative",
            overflow: "hidden",
            background: "#EBF5FB",
          }}
        >
          {/* Priorité 1: Photo de la parcelle */}
          {(() => {
            // Vérifier d'abord photos, puis images (comme dans le drawer)
            const photoUrl = (parcelle.photos && parcelle.photos.length > 0 && parcelle.photos[0]) 
              ? parcelle.photos[0] 
              : (parcelle.images && parcelle.images.length > 0 && parcelle.images[0]) 
                ? parcelle.images[0] 
                : null;
            
            if (photoUrl) {
              return (
                <Box
                  component="img"
                  className="parcelle-image"
                  src={fixImageUrl(photoUrl)}
                  alt={parcelle.ref || "Parcelle"}
                  onError={(e) => {
                    // Si l'image ne se charge pas, afficher un placeholder
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='16'%3EImage%20non%20disponible%3C/text%3E%3C/svg%3E";
                    e.target.onerror = null; // Empêcher la boucle infinie
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    cursor: "pointer",
                    transition: "transform 0.6s ease",
                    bgcolor: "#EBF5FB",
                  }}
                onClick={() => {
                  const osmUrl = getNavigationUrl(parcelle.latitude, parcelle.longitude);
                  if (osmUrl) window.open(osmUrl, "_blank");
                }}
                />
              );
            }
            
            // Sinon, afficher la carte Google Maps ou l'icône
            if (parcelle.latitude && parcelle.longitude) {
              return (
                <>
                  {getOpenStreetMapStaticImage(parcelle.latitude, parcelle.longitude, 400, 200) ? (
                    <Box
                      component="img"
                      className="parcelle-image"
                      src={getOpenStreetMapStaticImage(parcelle.latitude, parcelle.longitude, 400, 200)}
                      alt=""
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        cursor: "pointer",
                        transition: "transform 0.6s ease",
                        bgcolor: "#EBF5FB",
                      }}
                      onClick={() => {
                        const osmUrl = getNavigationUrl(parcelle.latitude, parcelle.longitude);
                        if (osmUrl) window.open(osmUrl, "_blank");
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        bgcolor: "#EBF5FB",
                        color: "text.secondary",
                      }}
                      onClick={() => {
                        const osmUrl = getNavigationUrl(parcelle.latitude, parcelle.longitude);
                        if (osmUrl) window.open(osmUrl, "_blank");
                      }}
                    >
                      <LocationOn sx={{ fontSize: 40, color: "primary.main" }} />
                    </Box>
                  )}
                </>
              );
            }
            
            // Par défaut, afficher l'icône
            return (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#EBF5FB",
                  color: "text.secondary",
                }}
              >
                <LocationOn sx={{ fontSize: 40, color: "primary.main" }} />
              </Box>
            );
          })()}
          {/* Overlay gradient */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(to bottom, transparent 0%, ${currentGradient}80 100%)`,
              pointerEvents: "none",
            }}
          />
          {/* Badge Vérifié en haut à gauche */}
          {parcelle.verified && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 3,
              }}
            >
              <Chip
                icon={<VerifiedUser sx={{ fontSize: "0.875rem !important", color: "white !important" }} />}
                label="Vérifié"
                size="small"
                sx={{
                  bgcolor: "rgba(76, 175, 80, 0.95)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  height: { xs: 24, sm: 28 },
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  "& .MuiChip-icon": {
                    color: "white !important",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  },
                }}
              />
            </Box>
          )}
          {/* Pin de localisation central - affiché uniquement si pas de photo */}
          {!((parcelle.photos && parcelle.photos.length > 0 && parcelle.photos[0]) || (parcelle.images && parcelle.images.length > 0 && parcelle.images[0])) && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    borderRadius: "50%",
                    bgcolor: "rgba(255, 255, 255, 0.3)",
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": {
                        transform: "scale(1)",
                        opacity: 1,
                      },
                      "100%": {
                        transform: "scale(1.8)",
                        opacity: 0,
                      },
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    borderRadius: "50%",
                    bgcolor: "white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                />
                <LocationOn
                  sx={{
                    color: "primary.main",
                    fontSize: { xs: 28, sm: 36 },
                    zIndex: 3,
                    position: "relative",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                  }}
                />
              </Box>
            </Box>
          )}
          {/* Bouton Maps en haut à droite */}
          {parcelle.latitude && parcelle.longitude && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                bgcolor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "50%",
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                zIndex: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "white",
                  transform: "scale(1.15) rotate(5deg)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                },
              }}
                onClick={(e) => {
                  e.stopPropagation();
                  const osmUrl = getNavigationUrl(parcelle.latitude, parcelle.longitude);
                  if (osmUrl) window.open(osmUrl, "_blank");
                }}
            >
              <LocationOn sx={{ color: "primary.main", fontSize: { xs: 20, sm: 24 } }} />
            </Box>
          )}
        </Box>

        {/* Content Section */}
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: { xs: 2, sm: 2.5 } }}>
          {/* Titre et référence */}
          <Box sx={{ mb: 1.5 }}>
            <Typography 
              variant="h5" 
              fontWeight={800}
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                background: currentGradient,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.5,
                lineHeight: 1.2,
              }}
            >
              {parcelle.ref}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: 500,
              }}
            >
              Ilot {parcelle.ilot}, Parcelle {parcelle.ref}
            </Typography>
          </Box>

          {/* Informations principales avec icônes modernes */}
          <Stack spacing={1.5} mb={2} sx={{ flexGrow: 1 }}>
            <Box 
              display="flex" 
              alignItems="center" 
              gap={1.5}
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: "rgba(59, 130, 246, 0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocationOn sx={{ color: "white", fontSize: { xs: 18, sm: 20 } }} />
              </Box>
              <Typography 
                variant="body2"
                fontWeight={600}
                sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}
              >
                {parcelle.ville}
              </Typography>
            </Box>

            <Box 
              display="flex" 
              alignItems="center" 
              gap={1.5}
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: "rgba(16, 185, 129, 0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(16, 185, 129, 0.1)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: "#27AE60",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Home sx={{ color: "white", fontSize: { xs: 18, sm: 20 } }} />
              </Box>
              <Typography 
                variant="body2"
                fontWeight={600}
                sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}
              >
                {parcelle.superficie} m²
              </Typography>
            </Box>

            {parcelle.agenceNom && (
              <Box 
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(139, 92, 246, 0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(139, 92, 246, 0.1)",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={parcelle.agenceTelephone ? 0.5 : 0}>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 1.5,
                      bgcolor: "#1B5285",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Business sx={{ color: "white", fontSize: { xs: 18, sm: 20 } }} />
                  </Box>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}
                  >
                    {parcelle.agenceNom}
                  </Typography>
                </Box>
                {parcelle.agenceTelephone && (
                  <Box display="flex" alignItems="center" gap={1.5} pl={5}>
                    <Phone sx={{ color: "primary.main", fontSize: { xs: 14, sm: 16 } }} />
                    <Typography 
                      variant="caption" 
                      fontWeight={600}
                      color="primary.main"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
                    >
                      {parcelle.agenceTelephone}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Stack>

          {/* Prix avec style moderne */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: currentGradient,
              mb: 2,
              textAlign: "center",
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: "rgba(255,255,255,0.9)",
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Prix
            </Typography>
            <Typography 
              variant="h5" 
              fontWeight={800}
              sx={{
                color: "white",
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                mt: 0.5,
              }}
            >
              {parcelle.prix > 0 ? formatMoney(parcelle.prix) : "Sur demande"}
            </Typography>
          </Box>

          {/* Bouton moderne */}
          <Button
            className="parcelle-button"
            fullWidth
            variant="outlined"
            size="large"
            sx={{ 
              mt: "auto",
              fontSize: { xs: "0.875rem", sm: "0.9375rem" },
              py: { xs: 1.25, sm: 1.5 },
              fontWeight: 700,
              borderRadius: 2,
              borderWidth: 2,
              borderColor: "primary.main",
              color: "primary.main",
              textTransform: "uppercase",
              letterSpacing: 1,
              transition: "all 0.4s ease",
              "&:hover": {
                borderWidth: 2,
              },
            }}
            endIcon={<ArrowForward />}
            onClick={() => handleOpenParcelleDetails(parcelle)}
          >
            Voir détails
          </Button>
        </CardContent>
      </Card>
    );

    // Si dans un carrousel, retourner juste la Card, sinon avec Grid
    if (inCarousel) {
      return cardContent;
    }

    return (
      <Grid item xs={12} sm={6} md={4} key={parcelle.id || index}>
        {cardContent}
      </Grid>
    );
  };

  // Fonction pour extraire le nom de fichier depuis une URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Document";
    try {
      // Si c'est une URL complète, extraire le nom de fichier
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || pathname.split('\\').pop();
      // Décoder les caractères encodés et retirer les paramètres de requête
      return decodeURIComponent(fileName.split('?')[0]) || "Document";
    } catch (e) {
      // Si ce n'est pas une URL valide, essayer d'extraire le nom depuis le chemin
      const parts = url.split('/');
      const fileName = parts[parts.length - 1] || parts[parts.length - 1].split('\\').pop();
      return decodeURIComponent(fileName.split('?')[0]) || "Document";
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  // Fonctions de navigation du carrousel des biens
  const handleBienCarouselPrev = () => {
    setBiensCarouselIndex((prev) => Math.max(0, prev - 3));
  };

  const handleBienCarouselNext = () => {
    setBiensCarouselIndex((prev) => Math.min(homepageBiens.length - 3, prev + 3));
  };

  // Fonctions de navigation du carrousel des parcelles
  const handleParcelleCarouselPrev = () => {
    setParcellesCarouselIndex((prev) => Math.max(0, prev - 3));
  };

  const handleParcelleCarouselNext = () => {
    const restParcelles = homepageParcelles.slice(6); // Parcelles après les 6 premières
    setParcellesCarouselIndex((prev) => Math.min(restParcelles.length - 3, prev + 3));
  };

  // Fonctions de navigation du carrousel par agence
  const handleAgenceCarouselPrev = (agenceId, totalParcelles) => {
    setCarouselIndices((prev) => {
      const currentIndex = prev[agenceId] || 0;
      const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
      // Déplacer d'un élément à la fois pour un défilement fluide
      return {
        ...prev,
        [agenceId]: Math.max(0, currentIndex - 1),
      };
    });
  };

  const handleAgenceCarouselNext = (agenceId, totalParcelles) => {
    setCarouselIndices((prev) => {
      const currentIndex = prev[agenceId] || 0;
      const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
      const maxIndex = Math.max(0, totalParcelles - itemsPerView);
      // Déplacer d'un élément à la fois pour un défilement fluide
      return {
        ...prev,
        [agenceId]: Math.min(maxIndex, currentIndex + 1),
      };
    });
  };

  // Fonctions de navigation du carrousel des parcelles par agence
  const handleParcellesAgenceCarouselPrev = (agenceId) => {
    const containerRef = parcellesScrollContainerRefs.current[agenceId];
    if (!containerRef || !containerRef.current) return;
    
    const container = containerRef.current;
    const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
    
    // Trouver toutes les cartes dans le conteneur
    const cards = container.querySelectorAll(`[data-parcelle-card="${agenceId}"]`);
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
    
    setParcellesCarouselByAgence((prev) => {
      const currentIndex = prev[agenceId] || 0;
      return {
        ...prev,
        [agenceId]: Math.max(0, currentIndex - itemsPerView),
      };
    });
  };

  const handleParcellesAgenceCarouselNext = (agenceId, totalParcelles) => {
    const containerRef = parcellesScrollContainerRefs.current[agenceId];
    if (!containerRef || !containerRef.current) return;
    
    const container = containerRef.current;
    const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
    
    // Trouver toutes les cartes dans le conteneur
    const cards = container.querySelectorAll(`[data-parcelle-card="${agenceId}"]`);
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
    
    setParcellesCarouselByAgence((prev) => {
      const currentIndex = prev[agenceId] || 0;
      const maxIndex = Math.max(0, totalParcelles - itemsPerView);
      return {
        ...prev,
        [agenceId]: Math.min(maxIndex, currentIndex + itemsPerView),
      };
    });
  };

  // Fonctions de navigation du carrousel des biens par agence
  const handleBiensAgenceCarouselPrev = (agenceId) => {
    const containerRef = biensScrollContainerRefs.current[agenceId];
    if (!containerRef || !containerRef.current) return;
    
    const container = containerRef.current;
    const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
    
    // Trouver toutes les cartes dans le conteneur
    const cards = container.querySelectorAll(`[data-bien-card="${agenceId}"]`);
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
    
    setBiensCarouselByAgence((prev) => {
      const currentIndex = prev[agenceId] || 0;
      return {
        ...prev,
        [agenceId]: Math.max(0, currentIndex - itemsPerView),
      };
    });
  };

  const handleBiensAgenceCarouselNext = (agenceId, totalBiens) => {
    const containerRef = biensScrollContainerRefs.current[agenceId];
    if (!containerRef || !containerRef.current) return;
    
    const container = containerRef.current;
    const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2;
    
    // Trouver toutes les cartes dans le conteneur
    const cards = container.querySelectorAll(`[data-bien-card="${agenceId}"]`);
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
    
    setBiensCarouselByAgence((prev) => {
      const currentIndex = prev[agenceId] || 0;
      const maxIndex = Math.max(0, totalBiens - itemsPerView);
      return {
        ...prev,
        [agenceId]: Math.min(maxIndex, currentIndex + itemsPerView),
      };
    });
  };

  // Fonctions de navigation du carrousel des locations
  const handleLocationCarouselPrev = () => {
    setLocationsCarouselIndex((prev) => Math.max(0, prev - 3));
  };

  const handleLocationCarouselNext = () => {
    setLocationsCarouselIndex((prev) => Math.min(homepageLocations.length - 3, prev + 3));
  };

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

  const handleShowMoreBiens = (agenceId) => {
    setBiensDisplayedByAgence((prev) => {
      const current = prev[agenceId] || 3;
      const biensAgence = biensByAgence[agenceId] || [];
      return {
        ...prev,
        [agenceId]: Math.min(current + 3, biensAgence.length),
      };
    });
  };

  const handleShowMoreLocations = () => {
    setLocationsDisplayed((prev) => Math.min(prev + 3, homepageLocations.length));
  };

  const handleShowMoreParcelles = (agenceId) => {
    setParcellesDisplayedByAgence((prev) => {
      const current = prev[agenceId] || 4;
      const parcellesAgence = parcellesByAgence[agenceId] || [];
      return {
        ...prev,
        [agenceId]: Math.min(current + 4, parcellesAgence.length),
      };
    });
  };

  const handleOpenLocationsDrawer = () => {
    setOpenLocationsDrawer(true);
  };

  const handleCloseLocationsDrawer = () => {
    setOpenLocationsDrawer(false);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };


  // à mettre dans ton composant ParcellesHome (ou équivalent)
const parcellesToDisplay =
  selectedAgenceId === "all"
    ? homepageParcelles
    : (parcellesByAgence[selectedAgenceId] || []);


  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#EBF5FB" }}>
      <Navbar />
      {/* Hero Section - Design Moderne */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #2471A3 100%)",
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
            background: "radial-gradient(circle at 20% 50%, rgba(39,174,96,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(245,197,24,0.15) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
      <Container
  maxWidth="xl"
  sx={{
    px: { xs: 1.5, sm: 3, md: 4 },
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
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          mx: { xs: "auto", md: 0 },
          px: { xs: 1.5, sm: 2 },
          py: { xs: 0.5, sm: 0.75 },
          borderRadius: 2,
          border: "1px solid rgba(39, 174, 96, 0.6)",
          bgcolor: "rgba(39, 174, 96, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
            fontWeight: 700,
            color: "rgba(39, 174, 96, 1)",
            letterSpacing: 0.5,
          }}
        >
          NEW
        </Box>
        <Typography
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.8rem" },
            fontWeight: 600,
            color: "white",
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          PLATEFORME OFFICIELLE
        </Typography>
      </Box>

      <Typography
        variant="h2"
        component="h1"
        fontWeight={800}
        gutterBottom
        sx={{
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
        MIZNAS Patrimoine
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
    color: "#0D2B4E",
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
            { label: "Agences", value: stats.agences, color: "#1B5285" },
            { label: "Parcelles", value: stats.parcelles, color: "#27AE60" },
            { label: "Biens", value: stats.biens, color: "#f59e0b" },
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
    bgcolor: "background.paper",
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
  {/* Section moderne "Pourquoi choisir MIZNAS Patrimoine" */}
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
        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Star sx={{ fontSize: { xs: 18, md: 20 }, color: "#fbbf24" }} />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          fontSize: { xs: "0.75rem", sm: "0.85rem" },
          background: "linear-gradient(135deg, #27AE60 0%, #1B5285 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
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
        background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #27AE60 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      }}
    >
      Pourquoi choisir MIZNAS Patrimoine ?
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
                background: `linear-gradient(135deg, ${feature.gradient[0]}15 0%, ${feature.gradient[1]}08 50%, rgba(255, 255, 255, 0.95) 100%)`,
                backdropFilter: "blur(20px)",
                border: `2px solid ${feature.color}25`,
                boxShadow: `0 8px 32px ${feature.color}15, 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)`,
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
                  background: `linear-gradient(90deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
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
                  background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)`,
                  opacity: 0.6,
                  transition: "all 0.4s ease",
                  filter: "blur(20px)",
                },
                "&:hover": {
                  transform: { xs: "none", md: "translateY(-12px) scale(1.02)" },
                  boxShadow: `0 20px 60px ${feature.color}30, 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)`,
                  borderColor: `${feature.color}40`,
                  background: `linear-gradient(135deg, ${feature.gradient[0]}20 0%, ${feature.gradient[1]}12 50%, rgba(255, 255, 255, 0.98) 100%)`,
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
                    width: { xs: 80, sm: 90, md: 100 },
                    height: { xs: 80, sm: 90, md: 100 },
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                    boxShadow: `0 12px 40px ${feature.color}30, 0 4px 12px ${feature.color}20`,
                    position: "relative",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: -4,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
                      opacity: 0.3,
                      filter: "blur(12px)",
                      transition: "opacity 0.4s ease",
                    },
                    "&:hover": {
                      transform: "scale(1.1) rotate(5deg)",
                      boxShadow: `0 16px 50px ${feature.color}40, 0 6px 16px ${feature.color}30`,
                      "&::before": {
                        opacity: 0.5,
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: "white",
                      fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
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
                    color: feature.gradient[0],
                    textShadow: `0 2px 8px ${feature.color}20`,
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
                    color: "rgba(0, 0, 0, 0.75)",
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
                    background: `linear-gradient(90deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
                    mt: "auto",
                    opacity: 0.6,
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
              background: "linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)",
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
  background: "linear-gradient(135deg, #EBF5FB 0%, #D6EAF8 30%, #F0F9F4 60%, #ffffff 100%)",
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
    background: "radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)",
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
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
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
            background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
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
          background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #2471A3 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
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
            background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
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
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
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
                    ? "linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(40, 40, 50, 0.95) 50%, rgba(35, 35, 45, 0.95) 100%)"
                    : "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(255, 255, 255, 0.95) 100%)",
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
                      ? "linear-gradient(90deg, #ffa726, #fb8c00)"
                      : "linear-gradient(90deg, #1B5285, #27AE60)",
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
                      ? "radial-gradient(circle, rgba(255, 167, 38, 0.15) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
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
                      ? "linear-gradient(135deg, rgba(30, 30, 40, 0.98) 0%, rgba(40, 40, 50, 0.98) 50%, rgba(35, 35, 45, 0.98) 100%)"
                      : "linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(255, 255, 255, 0.98) 100%)",
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
                          ? "linear-gradient(135deg, rgba(255, 167, 38, 0.9), rgba(251, 140, 0, 0.9))"
                          : "linear-gradient(135deg, #1B5285, #27AE60)",
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
                              ? "✅ Actif"
                              : agence.statut === "en_attente"
                              ? "⏳ En attente"
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
                        ? "linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2))"
                        : "linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))",
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
                          📍
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
                          📮
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
                            👤
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
                          ? "linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2))"
                          : "linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))",
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
                              📞
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
                            ✉️
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
    background: "linear-gradient(135deg, #EBF5FB 0%, #D6EAF8 30%, #F0F9F4 60%, #ffffff 100%)",
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
      background: "radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
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
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
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
            background: "linear-gradient(135deg, #27AE60 0%, #1B5285 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
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
          background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #2471A3 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
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
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(255, 255, 255, 0.95) 100%)",
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
                  background: "linear-gradient(90deg, #27AE60, #1B5285)",
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
                  background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
                  opacity: 0.6,
                  transition: "all 0.4s ease",
                  filter: "blur(20px)",
                },
                "&:hover": {
                  transform: { xs: "none", md: "translateY(-12px) scale(1.02)" },
                  boxShadow: "0 20px 60px rgba(16, 185, 129, 0.3), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                  borderColor: "rgba(16, 185, 129, 0.4)",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(59, 130, 246, 0.12) 50%, rgba(255, 255, 255, 0.98) 100%)",
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
                    width: { xs: 70, sm: 80, md: 90 },
                    height: { xs: 70, sm: 80, md: 90 },
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #27AE60, #1B5285)",
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
                      fontSize: { xs: "2rem", sm: "2.2rem", md: "2.5rem" },
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
    background: "linear-gradient(135deg, #EBF5FB 0%, #D6EAF8 30%, #F0F9F4 60%, #ffffff 100%)",
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
      background: "radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)",
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
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
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
          ⚖️
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            background: "linear-gradient(135deg, #1B5285 0%, #0D2B4E 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
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
          background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #2471A3 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
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
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(255, 255, 255, 0.95) 100%)",
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
                    background: "linear-gradient(90deg, #1B5285, #27AE60)",
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
                    background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
                    opacity: 0.6,
                    transition: "all 0.4s ease",
                    filter: "blur(20px)",
                  },
                  "&:hover": {
                    transform: { xs: "none", md: "translateY(-12px) scale(1.02)" },
                    boxShadow: "0 20px 60px rgba(139, 92, 246, 0.3), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                    borderColor: "rgba(139, 92, 246, 0.4)",
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(99, 102, 241, 0.12) 50%, rgba(255, 255, 255, 0.98) 100%)",
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
                        background: "linear-gradient(135deg, #1B5285, #27AE60)",
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
                      ⚖️
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
                      background: "linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.3))",
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





{/* Parcelles à vendre – DESIGN MODERNE */}
<Box
  component="section"
  sx={{
    background: "linear-gradient(135deg, #EAFAF1 0%, #D5F5E3 30%, #F0F9F4 60%, #ffffff 100%)",
    py: { xs: 6, md: 8 },
    px: { xs: 2, sm: 3 },
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(5, 150, 105, 0.08) 0%, transparent 50%)",
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
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: { xs: 18, md: 20 },
          }}
        >
          🏘️
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            background: "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Terrains viabilisés
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
          background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #2471A3 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        Parcelles à vendre
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
        Découvrez notre sélection de terrains viabilisés auprès de nos agences partenaires.
      </Typography>

      {/* Chips modernes */}
      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="center"
        sx={{
          flexWrap: "wrap",
          rowGap: 1.5,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Chip
          label={`${homepageParcelles.length} parcelle${
            homepageParcelles.length > 1 ? "s" : ""
          } disponibles`}
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
        {agencesList.length > 0 && (
          <Chip
            label={`${agencesList.length} agence${agencesList.length > 1 ? "s" : ""} partenaire${agencesList.length > 1 ? "s" : ""}`}
            size="small"
            sx={{
              borderRadius: "50px",
              fontWeight: 600,
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              bgcolor: "rgba(5, 150, 105, 0.15)",
              color: "#059669",
              border: "1px solid rgba(5, 150, 105, 0.3)",
            }}
          />
        )}
      </Stack>

      {/* FILTRES AGENCES – chips cliquables modernisés */}
      {agencesList.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "center",
            mb: { xs: 3, md: 4 },
            overflowX: "auto",
            pb: 1,
          }}
        >
          <Chip
            label={`Toutes les agences (${homepageParcelles.length})`}
            clickable
            onClick={() => setSelectedAgenceId("all")}
            sx={{
              borderRadius: "50px",
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              fontWeight: 600,
              bgcolor: selectedAgenceId === "all" 
                ? "linear-gradient(135deg, #10b981, #059669)" 
                : "rgba(16, 185, 129, 0.1)",
              color: selectedAgenceId === "all" ? "white" : "#10b981",
              border: selectedAgenceId === "all" 
                ? "none" 
                : "1px solid rgba(16, 185, 129, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: selectedAgenceId === "all" 
                  ? "linear-gradient(135deg, #059669, #047857)" 
                  : "rgba(16, 185, 129, 0.15)",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
              },
            }}
          />
          {agencesList.map((agence) => (
            <Chip
              key={agence.id}
              label={`${agence.nom} (${agence.count})`}
              clickable
              onClick={() => setSelectedAgenceId(agence.id)}
              sx={{
                borderRadius: "50px",
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                maxWidth: 220,
                fontWeight: 600,
                bgcolor: selectedAgenceId === agence.id 
                  ? "linear-gradient(135deg, #10b981, #059669)" 
                  : "rgba(16, 185, 129, 0.1)",
                color: selectedAgenceId === agence.id ? "white" : "#10b981",
                border: selectedAgenceId === agence.id 
                  ? "none" 
                  : "1px solid rgba(16, 185, 129, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: selectedAgenceId === agence.id 
                    ? "linear-gradient(135deg, #059669, #047857)" 
                    : "rgba(16, 185, 129, 0.15)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* CONTENU */}
      {loadingHomepageParcelles ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <CircularProgress size={40} />
          <Typography
            variant="body1"
            sx={{
              ml: { xs: 0, sm: 2 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Chargement des parcelles…
          </Typography>
        </Box>
      ) : parcellesToDisplay.length === 0 ? (
        <Alert severity="info">
          Aucune parcelle disponible pour cette sélection.
        </Alert>
      ) : (
        <>
          {/* Bande info agence sélectionnée moderne (hors "all") */}
          {selectedAgenceId !== "all" && (
            <Box
              sx={{
                mb: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "linear-gradient(135deg, #10b981, #059669)",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <Business sx={{ fontSize: { xs: 24, sm: 28 }, color: "white" }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: {
                        xs: "clamp(1.1rem, 2.5vw, 1.2rem)",
                        sm: "1.3rem",
                      },
                      color: "#27AE60",
                      mb: 0.5,
                    }}
                  >
                    {agencesList.find((a) => a.id === selectedAgenceId)?.nom ??
                      "Agence"}
                  </Typography>
                  {agencesList.find((a) => a.id === selectedAgenceId)?.ville && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOn
                        sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.6)" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(0, 0, 0, 0.7)",
                          fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        }}
                      >
                        {agencesList.find((a) => a.id === selectedAgenceId)?.ville}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ChevronLeft />}
                onClick={() => setSelectedAgenceId("all")}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  borderRadius: "50px",
                  borderColor: "#10b981",
                  color: "#27AE60",
                  px: { xs: 2, sm: 3 },
                  "&:hover": {
                    borderColor: "#059669",
                    bgcolor: "rgba(16, 185, 129, 0.08)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Voir toutes les agences
              </Button>
            </Box>
          )}

          {/* PARCELLES PAR AGENCE AVEC PAGINATION */}
          {selectedAgenceId === "all" ? (
            // Afficher toutes les agences avec leurs parcelles en pagination
            <Stack spacing={4}>
              {agencesList.map((agence) => {
                const parcellesAgence = parcellesByAgence[agence.id] || [];
                const parcellesDisplayed = parcellesDisplayedByAgence[agence.id] || 4;
                
                if (parcellesAgence.length === 0) return null;

                return (
                  <Box key={agence.id}>
                    {/* En-tête agence moderne */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 4,
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: 3,
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "linear-gradient(135deg, #10b981, #059669)",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        <Business sx={{ fontSize: { xs: 24, sm: 28 }, color: "white" }} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          sx={{
                            fontSize: {
                              xs: "clamp(1.1rem, 2.5vw, 1.2rem)",
                              sm: "1.3rem",
                            },
                            color: "#27AE60",
                            mb: 0.5,
                          }}
                        >
                          {agence.nom}
                        </Typography>
                        {agence.ville && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.6)" }} />
                            <Typography 
                              variant="body2" 
                              sx={{
                                color: "rgba(0, 0, 0, 0.7)",
                                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                              }}
                            >
                              {agence.ville}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Chip
                        label={`${parcellesAgence.length} parcelle${parcellesAgence.length > 1 ? "s" : ""}`}
                        size="small"
                        sx={{
                          borderRadius: "50px",
                          fontWeight: 600,
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          bgcolor: "rgba(16, 185, 129, 0.15)",
                          color: "#27AE60",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      />
                    </Box>

                    {/* Grid des parcelles de cette agence */}
                    <Box
                      sx={{
                        mx: "auto",
                        maxWidth: 1200,
                        width: "100%",
                      }}
                    >
                      <Grid 
                        container 
                        spacing={2}
                        sx={{
                          width: "100%",
                          margin: 0,
                        }}
                      >
                        {parcellesAgence.slice(0, parcellesDisplayed).map((parcelle, index) => (
                          <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={3}
                            key={parcelle.id || index}
                            sx={{
                              display: "flex",
                              flexBasis: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" },
                              maxWidth: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" },
                              flexGrow: 0,
                              flexShrink: 0,
                            }}
                          >
                            {renderParcelleCard(parcelle, index, true)}
                          </Grid>
                        ))}
                      </Grid>

                      {/* Bouton "Afficher la suite" moderne pour cette agence */}
                      {parcellesDisplayed < parcellesAgence.length && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={() => handleShowMoreParcelles(agence.id)}
                            sx={{
                              px: { xs: 4, sm: 5 },
                              py: { xs: 1.2, sm: 1.5 },
                              fontSize: { xs: "0.9rem", md: "1rem" },
                              fontWeight: 600,
                              borderRadius: "50px",
                              textTransform: "none",
                              background: "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)",
                              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                              position: "relative",
                              overflow: "hidden",
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                transition: "left 0.5s ease",
                              },
                              "&:hover": {
                                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                boxShadow: "0 6px 24px rgba(16, 185, 129, 0.4)",
                                transform: "translateY(-2px)",
                                "&::before": {
                                  left: "100%",
                                },
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            Afficher la suite
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            // Afficher les parcelles de l'agence sélectionnée avec Grid
            (() => {
              const parcellesAgence = parcellesByAgence[selectedAgenceId] || [];
              const parcellesDisplayed = parcellesDisplayedByAgence[selectedAgenceId] || 4;

              return (
                <Box
                  sx={{
                    mx: "auto",
                    maxWidth: 1200,
                    width: "100%",
                  }}
                >
                  <Grid 
                    container 
                    spacing={2}
                    sx={{
                      width: "100%",
                      margin: 0,
                    }}
                  >
                    {parcellesAgence.slice(0, parcellesDisplayed).map((parcelle, index) => (
                      <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={3}
                        key={parcelle.id || index}
                        sx={{
                          display: "flex",
                          flexBasis: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" },
                          maxWidth: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" },
                          flexGrow: 0,
                          flexShrink: 0,
                        }}
                      >
                        {renderParcelleCard(parcelle, index, true)}
                      </Grid>
                    ))}
                  </Grid>

                  {/* Bouton "Afficher la suite" moderne */}
                  {parcellesDisplayed < parcellesAgence.length && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => handleShowMoreParcelles(selectedAgenceId)}
                        sx={{
                          px: { xs: 4, sm: 5 },
                          py: { xs: 1.2, sm: 1.5 },
                          fontSize: { xs: "0.9rem", md: "1rem" },
                          fontWeight: 600,
                          borderRadius: "50px",
                          textTransform: "none",
                          background: "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)",
                          boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: "-100%",
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                            transition: "left 0.5s ease",
                          },
                          "&:hover": {
                            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                            boxShadow: "0 6px 24px rgba(16, 185, 129, 0.4)",
                            transform: "translateY(-2px)",
                            "&::before": {
                              left: "100%",
                            },
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Afficher la suite
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })()
          )}
        </>
      )}
    </Box>
  </Container>
</Box>






      {/* Biens Immobiliers Section – DESIGN MODERNE */}
<Box
  component="section"
  sx={{
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #e0f2fe 60%, #ffffff 100%)",
    py: { xs: 6, md: 8 },
    px: { xs: 2, sm: 3 },
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
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
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: { xs: 18, md: 20 },
          }}
        >
          🏠
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Propriétés sélectionnées
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
          background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #2471A3 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        Biens immobiliers à vendre
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
        Villas, appartements et maisons de qualité sélectionnés auprès de nos partenaires.
      </Typography>

      {/* Chips modernes */}
      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="center"
        sx={{
          flexWrap: "wrap",
          rowGap: 1.5,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Chip
          label={`${homepageBiens.length} bien${homepageBiens.length > 1 ? "s" : ""} disponible${homepageBiens.length > 1 ? "s" : ""}`}
          size="small"
          sx={{
            borderRadius: "50px",
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            bgcolor: "rgba(59, 130, 246, 0.15)",
            color: "#1B5285",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        />
        {agencesListBiens.length > 0 && (
          <Chip
            label={`${agencesListBiens.length} agence${agencesListBiens.length > 1 ? "s" : ""} partenaire${agencesListBiens.length > 1 ? "s" : ""}`}
            size="small"
            sx={{
              borderRadius: "50px",
              fontWeight: 600,
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              bgcolor: "rgba(37, 99, 235, 0.15)",
              color: "#2563eb",
              border: "1px solid rgba(37, 99, 235, 0.3)",
            }}
          />
        )}
      </Stack>

      {/* FILTRES AGENCES – chips cliquables modernisés */}
      {agencesListBiens.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "center",
            mb: { xs: 3, md: 4 },
            overflowX: "auto",
            pb: 1,
          }}
        >
          <Chip
            label={`Toutes les agences (${homepageBiens.length})`}
            clickable
            onClick={() => setSelectedAgenceIdBiens("all")}
            sx={{
              borderRadius: "50px",
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              fontWeight: 600,
              bgcolor: selectedAgenceIdBiens === "all" 
                ? "linear-gradient(135deg, #3b82f6, #2563eb)" 
                : "rgba(59, 130, 246, 0.1)",
              color: selectedAgenceIdBiens === "all" ? "white" : "#3b82f6",
              border: selectedAgenceIdBiens === "all" 
                ? "none" 
                : "1px solid rgba(59, 130, 246, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: selectedAgenceIdBiens === "all" 
                  ? "linear-gradient(135deg, #2563eb, #1d4ed8)" 
                  : "rgba(59, 130, 246, 0.15)",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
              },
            }}
          />
          {agencesListBiens.map((agence) => (
            <Chip
              key={agence.id}
              label={`${agence.nom} (${agence.count})`}
              clickable
              onClick={() => setSelectedAgenceIdBiens(agence.id)}
              sx={{
                borderRadius: "50px",
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                maxWidth: 220,
                fontWeight: 600,
                bgcolor: selectedAgenceIdBiens === agence.id 
                  ? "linear-gradient(135deg, #3b82f6, #2563eb)" 
                  : "rgba(59, 130, 246, 0.1)",
                color: selectedAgenceIdBiens === agence.id ? "white" : "#3b82f6",
                border: selectedAgenceIdBiens === agence.id 
                  ? "none" 
                  : "1px solid rgba(59, 130, 246, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: selectedAgenceIdBiens === agence.id 
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)" 
                    : "rgba(59, 130, 246, 0.15)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* CONTENU */}
      {loadingHomepageBiens ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <CircularProgress size={40} />
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Chargement des biens immobiliers…
          </Typography>
        </Box>
      ) : homepageBiens.length === 0 ? (
        <Alert severity="info">
          Aucun bien immobilier disponible pour le moment.
        </Alert>
      ) : (
        <>
          {/* BIENS PAR AGENCE AVEC PAGINATION */}
          {selectedAgenceIdBiens === "all" ? (
            // Afficher toutes les agences avec leurs biens en pagination
            <Stack spacing={4}>
              {agencesListBiens.map((agence) => {
                const biensAgence = biensByAgence[agence.id] || [];
                const biensDisplayed = biensDisplayedByAgence[agence.id] || 3;
                
                if (biensAgence.length === 0) return null;

                return (
                  <Box key={agence.id}>
                    {/* En-tête agence moderne */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 4,
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: 3,
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "linear-gradient(135deg, #3b82f6, #2563eb)",
                          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        <Business sx={{ fontSize: { xs: 24, sm: 28 }, color: "white" }} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          sx={{
                            fontSize: {
                              xs: "clamp(1.1rem, 2.5vw, 1.2rem)",
                              sm: "1.3rem",
                            },
                            color: "#1B5285",
                            mb: 0.5,
                          }}
                        >
                          {agence.nom}
                        </Typography>
                        {agence.ville && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.6)" }} />
                            <Typography 
                              variant="body2" 
                              sx={{
                                color: "rgba(0, 0, 0, 0.7)",
                                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                              }}
                            >
                              {agence.ville}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Chip
                        label={`${biensAgence.length} bien${biensAgence.length > 1 ? "s" : ""}`}
                        size="small"
                        sx={{
                          borderRadius: "50px",
                          fontWeight: 600,
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          bgcolor: "rgba(59, 130, 246, 0.15)",
                          color: "#1B5285",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                        }}
                      />
                    </Box>

                    {/* Grid des biens de cette agence */}
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
                        {biensAgence.slice(0, biensDisplayed).map((bien, index) => (
                          <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={4}
                            key={bien.id || index}
                            sx={{
                              display: "flex",
                              flexBasis: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                              maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                              flexGrow: 0,
                              flexShrink: 0,
                            }}
                          >
                            <Card
                              elevation={3}
                              sx={{
                                width: "100%",
                                height: "100%",
                                minHeight: "unset",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
                                "&:hover": {
                                  transform: { xs: "none", md: "translateY(-6px)" },
                                  boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
                                },
                              }}
                            >
              {/* Image */}
              <Box
                sx={{
                  height: { xs: 200, sm: 210, md: 220 },
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={bien.image}
                  alt={bien.titre}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                />

                {/* Tags en haut à droite */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                    alignItems: "flex-end",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.4,
                      py: 0.6,
                      borderRadius: 999,
                      bgcolor: "rgba(15,23,42,0.85)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: { xs: "0.68rem", sm: "0.72rem" },
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      {bien.type}
                    </Typography>
                  </Box>

                  {bien.verified && (
                    <Chip
                      icon={
                        <VerifiedUser
                          sx={{ fontSize: "0.85rem !important" }}
                        />
                      }
                      label="Vérifié"
                      size="small"
                      color="success"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.95)",
                        fontWeight: 600,
                        fontSize: { xs: "0.65rem", sm: "0.7rem" },
                        height: 22,
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Contenu carte */}
              <CardContent
                sx={{
                  p: { xs: 2.2, sm: 2.5, md: 3 },
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    mb: 1.5,
                    fontSize: {
                      xs: "1.05rem",
                      sm: "1.15rem",
                      md: "1.2rem",
                    },
                    lineHeight: 1.3,
                  }}
                >
                  {bien.titre}
                </Typography>

                <Stack spacing={1.1} mb={2.2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOn fontSize="small" color="primary" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: {
                          xs: "0.85rem",
                          sm: "0.9rem",
                        },
                      }}
                    >
                      {bien.quartier ? `${bien.ville}, ${bien.quartier}` : bien.ville}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Home fontSize="small" color="primary" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: {
                          xs: "0.85rem",
                          sm: "0.9rem",
                        },
                      }}
                    >
                      {bien.superficie} m²
                    </Typography>
                  </Box>

                  {bien.reference && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: {
                          xs: "0.8rem",
                          sm: "0.9rem",
                        },
                      }}
                    >
                      Réf : {bien.reference}
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Typography
                  variant="h5"
                  color="primary"
                  fontWeight="bold"
                  sx={{
                    mb: 1.8,
                    fontSize: {
                      xs: "1.35rem",
                      sm: "1.45rem",
                      md: "1.6rem",
                    },
                  }}
                >
                  {formatMoney(bien.prix)}
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => handleOpenBienDetails(bien)}
                  sx={{
                    mt: "auto",
                    py: { xs: 1.1, sm: 1.2 },
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: {
                      xs: "0.9rem",
                      sm: "0.95rem",
                    },
                    background:
                      "linear-gradient(135deg,#1B5285 0%,#27AE60 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg,#1B5285 0%,#27AE60 100%)",
                      transform: { xs: "none", md: "translateY(-2px)" },
                    },
                  }}
                >
                  Voir le bien
                </Button>
              </CardContent>
            </Card>
                          </Grid>
                        ))}
                      </Grid>

                      {/* Bouton "Afficher la suite" moderne pour cette agence */}
                      {biensDisplayed < biensAgence.length && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={() => handleShowMoreBiens(agence.id)}
                            sx={{
                              px: { xs: 4, sm: 5 },
                              py: { xs: 1.2, sm: 1.5 },
                              fontSize: { xs: "0.9rem", md: "1rem" },
                              fontWeight: 600,
                              borderRadius: "50px",
                              textTransform: "none",
                              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                              position: "relative",
                              overflow: "hidden",
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                transition: "left 0.5s ease",
                              },
                              "&:hover": {
                                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                boxShadow: "0 6px 24px rgba(59, 130, 246, 0.4)",
                                transform: "translateY(-2px)",
                                "&::before": {
                                  left: "100%",
                                },
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            Afficher la suite
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            // Afficher les biens de l'agence sélectionnée avec Grid
            (() => {
              const biensAgence = biensByAgence[selectedAgenceIdBiens] || [];
              const biensDisplayed = biensDisplayedByAgence[selectedAgenceIdBiens] || 3;

              return (
                <>
                  {/* Bande info agence sélectionnée */}
                  <Box
                    sx={{
                      mb: { xs: 2.5, md: 3 },
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: 1.5,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                        }}
                      >
                        <Business
                          sx={{
                            fontSize: { xs: "1.4rem", sm: "1.6rem" },
                            color: "primary.main",
                          }}
                        />
                        {agencesListBiens.find((a) => a.id === selectedAgenceIdBiens)?.nom ??
                          "Agence"}
                      </Typography>
                      {agencesListBiens.find((a) => a.id === selectedAgenceIdBiens)?.ville && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          }}
                        >
                          <LocationOn
                            fontSize="small"
                            sx={{ mr: 0.5, color: "text.secondary" }}
                          />
                          {agencesListBiens.find((a) => a.id === selectedAgenceIdBiens)?.ville}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      variant="text"
                      size="small"
                      startIcon={<ChevronLeft />}
                      onClick={() => setSelectedAgenceIdBiens("all")}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    >
                      Voir toutes les agences
                    </Button>
                  </Box>

                  {/* Grid des biens */}
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
                      {biensAgence.slice(0, biensDisplayed).map((bien, index) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={4}
                          key={bien.id || index}
                          sx={{
                            display: "flex",
                            flexBasis: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                            maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                            flexGrow: 0,
                            flexShrink: 0,
                          }}
                        >
                          <Card
                            elevation={3}
                            sx={{
                              width: "100%",
                              height: "100%",
                              minHeight: "unset",
                              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: 3,
                              overflow: "hidden",
                              boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
                              "&:hover": {
                                transform: { xs: "none", md: "translateY(-6px)" },
                                boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
                              },
                            }}
                          >
                          {/* Image */}
                          <Box
                            sx={{
                              height: { xs: 200, sm: 210, md: 220 },
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              component="img"
                              src={bien.image}
                              alt={bien.titre}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                                "&:hover": { transform: "scale(1.05)" },
                              }}
                            />

                            {/* Tags en haut à droite */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.75,
                                alignItems: "flex-end",
                              }}
                            >
                              <Box
                                sx={{
                                  px: 1.4,
                                  py: 0.6,
                                  borderRadius: 999,
                                  bgcolor: "rgba(15,23,42,0.85)",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: { xs: "0.68rem", sm: "0.72rem" },
                                    textTransform: "uppercase",
                                    letterSpacing: 0.4,
                                  }}
                                >
                                  {bien.type}
                                </Typography>
                              </Box>

                              {bien.verified && (
                                <Chip
                                  icon={
                                    <VerifiedUser
                                      sx={{ fontSize: "0.85rem !important" }}
                                    />
                                  }
                                  label="Vérifié"
                                  size="small"
                                  color="success"
                                  sx={{
                                    bgcolor: "rgba(255,255,255,0.95)",
                                    fontWeight: 600,
                                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                    height: 22,
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          {/* Contenu carte */}
                          <CardContent
                            sx={{
                              p: { xs: 2.2, sm: 2.5, md: 3 },
                              display: "flex",
                              flexDirection: "column",
                              flex: 1,
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{
                                mb: 1.5,
                                fontSize: {
                                  xs: "1.05rem",
                                  sm: "1.15rem",
                                  md: "1.2rem",
                                },
                                lineHeight: 1.3,
                              }}
                            >
                              {bien.titre}
                            </Typography>

                            <Stack spacing={1.1} mb={2.2}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOn fontSize="small" color="primary" />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: {
                                      xs: "0.85rem",
                                      sm: "0.9rem",
                                    },
                                  }}
                                >
                                  {bien.quartier ? `${bien.ville}, ${bien.quartier}` : bien.ville}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1}>
                                <Home fontSize="small" color="primary" />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: {
                                      xs: "0.85rem",
                                      sm: "0.9rem",
                                    },
                                  }}
                                >
                                  {bien.superficie} m²
                                </Typography>
                              </Box>

                              {bien.reference && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: {
                                      xs: "0.8rem",
                                      sm: "0.9rem",
                                    },
                                  }}
                                >
                                  Réf : {bien.reference}
                                </Typography>
                              )}
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />

                            <Typography
                              variant="h5"
                              color="primary"
                              fontWeight="bold"
                              sx={{
                                mb: 1.8,
                                fontSize: {
                                  xs: "1.35rem",
                                  sm: "1.45rem",
                                  md: "1.6rem",
                                },
                              }}
                            >
                              {formatMoney(bien.prix)}
                            </Typography>

                            <Button
                              fullWidth
                              variant="contained"
                              endIcon={<ArrowForward />}
                              onClick={() => handleOpenBienDetails(bien)}
                              sx={{
                                mt: "auto",
                                py: { xs: 1.1, sm: 1.2 },
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: {
                                  xs: "0.9rem",
                                  sm: "0.95rem",
                                },
                                background:
                                  "linear-gradient(135deg,#1B5285 0%,#27AE60 100%)",
                                "&:hover": {
                                  background:
                                    "linear-gradient(135deg,#1B5285 0%,#27AE60 100%)",
                                  transform: { xs: "none", md: "translateY(-2px)" },
                                },
                              }}
                            >
                              Voir le bien
                            </Button>
                          </CardContent>
                        </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Bouton "Afficher la suite" moderne */}
                    {biensDisplayed < biensAgence.length && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 4,
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => handleShowMoreBiens(selectedAgenceIdBiens)}
                          sx={{
                            px: { xs: 4, sm: 5 },
                            py: { xs: 1.2, sm: 1.5 },
                            fontSize: { xs: "0.9rem", md: "1rem" },
                            fontWeight: 600,
                            borderRadius: "50px",
                            textTransform: "none",
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                            position: "relative",
                            overflow: "hidden",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: "-100%",
                              width: "100%",
                              height: "100%",
                              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                              transition: "left 0.5s ease",
                            },
                            "&:hover": {
                              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                              boxShadow: "0 6px 24px rgba(59, 130, 246, 0.4)",
                              transform: "translateY(-2px)",
                              "&::before": {
                                left: "100%",
                              },
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Afficher la suite
                        </Button>
                      </Box>
                    )}
                  </Box>
                </>
              );
            })()
          )}
        </>
      )}
    </Box>
  </Container>
</Box>


      {/* Locations Proposées Section – DESIGN MODERNE */}
<Box
  component="section"
  sx={{
    background: "linear-gradient(135deg, #fef2f2 0%, #fce7f3 30%, #fdf2f8 60%, #ffffff 100%)",
    py: { xs: 6, md: 8 },
    px: { xs: 2, sm: 3 },
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
      background: "radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(219, 39, 119, 0.08) 0%, transparent 50%)",
      pointerEvents: "none",
      zIndex: 0,
    },
  }}
>
  <Container
    maxWidth="xl"
    sx={{
      px: { xs: 1.5, sm: 2, md: 3 },
      width: "100%",
      position: "relative",
      zIndex: 1,
    }}
  >
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
          background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)",
          border: "1px solid rgba(236, 72, 153, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: { xs: 18, md: 20 },
          }}
        >
          🏠
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Locations premium
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
          background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #2471A3 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        Les locations proposées
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
        Trouvez votre prochain logement parmi nos offres de location premium
      </Typography>

      {/* Chips modernes */}
      {homepageLocations.length > 0 && (
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
            label={`${homepageLocations.length} location${homepageLocations.length > 1 ? "s" : ""} disponible${homepageLocations.length > 1 ? "s" : ""}`}
            size="small"
            sx={{
              borderRadius: "50px",
              fontWeight: 600,
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              bgcolor: "rgba(236, 72, 153, 0.15)",
              color: "#ec4899",
              border: "1px solid rgba(236, 72, 153, 0.3)",
            }}
          />
        </Stack>
      )}
    </Box>

    {/* Grid des locations */}
    <Box sx={{ position: "relative", maxWidth: 1200, mx: "auto" }}>
      {loadingHomepageLocations ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <CircularProgress size={{ xs: 40, sm: 48, md: 60 }} />
          <Typography
            variant="h6"
            sx={{
              ml: { xs: 0, md: 2 },
              fontSize: {
                xs: "clamp(0.95rem, 3.5vw, 1.1rem)",
                md: "1.25rem",
              },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Chargement des locations...
          </Typography>
        </Box>
      ) : homepageLocations.length > 0 ? (
        <>
          {/* Conteneur Grid */}
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
              {homepageLocations.slice(0, locationsDisplayed).map((location, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4}
                  key={location.id || index}
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
                      minHeight: "unset",
                      transition:
                        "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      flexDirection: "column",
                      background: "white",
                      border: "1px solid rgba(148,163,184,0.35)",
                      borderRadius: { xs: 2.5, md: 3 },
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: "0 6px 24px rgba(15,23,42,0.08)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, ${location.gradient[0]}, ${location.gradient[1]})`,
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                        zIndex: 1,
                      },
                      "&:hover": {
                        transform: {
                          xs: "none",
                          md: "translateY(-8px) scale(1.01)",
                        },
                        boxShadow: `0 16px 40px ${location.gradient[0]}20`,
                        borderColor: location.gradient[0],
                        "&::before": {
                          opacity: 1,
                        },
                        "& .location-image": {
                          transform: {
                            xs: "none",
                            md: "scale(1.05)",
                          },
                        },
                      },
                    }}
                  >
                  {/* Image de la maison */}
                  <Box
                    sx={{
                      height: { xs: 210, sm: 230, md: 240 },
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${location.gradient[0]}10 0%, ${location.gradient[1]}10 100%)`,
                        zIndex: 1,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={location.image}
                      alt={location.titre}
                      className="location-image"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        transition: "all 0.3s ease",
                        zIndex: 2,
                        position: "relative",
                      }}
                    />

                    {/* Badges en overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        zIndex: 3,
                      }}
                    >
                      <Chip
                        label={location.type}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.92)",
                          color: location.gradient[0],
                          fontWeight: "bold",
                          fontSize: {
                            xs: "clamp(0.65rem, 2.5vw, 0.7rem)",
                            md: "0.75rem",
                          },
                          height: { xs: 22, md: 24 },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 3,
                      }}
                    >
                      <Chip
                        icon={location.meuble ? <CheckCircle /> : <Home />}
                        label={location.meuble ? "Meublé" : "Non meublé"}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.92)",
                          color: location.gradient[0],
                          fontWeight: "bold",
                          fontSize: {
                            xs: "clamp(0.65rem, 2.5vw, 0.7rem)",
                            md: "0.75rem",
                          },
                          height: { xs: 22, md: 24 },
                          "& .MuiChip-icon": {
                            fontSize: { xs: "0.875rem", md: "1rem" },
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent
                    sx={{
                      p: { xs: 2, md: 3 },
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        color: "text.primary",
                        lineHeight: { xs: 1.25, md: 1.3 },
                        mb: { xs: 0.75, md: 1 },
                        fontSize: {
                          xs: "clamp(1.05rem, 3.8vw, 1.25rem)",
                          md: "1.3rem",
                        },
                      }}
                    >
                      {location.titre}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: { xs: 1.5, md: 2 },
                        lineHeight: { xs: 1.35, md: 1.4 },
                        fontSize: {
                          xs: "clamp(0.8rem, 3vw, 0.9rem)",
                          md: "0.95rem",
                        },
                      }}
                    >
                      {location.description}
                    </Typography>

                    {/* Features */}
                    {location.features?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {location.features.map((feature, idx) => (
                            <Chip
                              key={idx}
                              label={feature}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: {
                                  xs: "clamp(0.65rem, 2.5vw, 0.7rem)",
                                  md: "0.75rem",
                                },
                                height: { xs: 22, md: 24 },
                                borderColor: location.gradient[0],
                                color: location.gradient[0],
                                "&:hover": {
                                  bgcolor: `${location.gradient[0]}10`,
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    <Stack spacing={1.2} mb={2}>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <LocationOn
                          fontSize="small"
                          sx={{ color: location.gradient[0] }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          sx={{
                            fontSize: {
                              xs: "clamp(0.75rem, 2.8vw, 0.85rem)",
                              md: "0.9rem",
                            },
                          }}
                        >
                          {location.ville}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <Home
                          fontSize="small"
                          sx={{ color: location.gradient[0] }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          sx={{
                            fontSize: {
                              xs: "clamp(0.75rem, 2.8vw, 0.85rem)",
                              md: "0.9rem",
                            },
                          }}
                        >
                          {location.superficie} m² • {location.chambres} chambre
                          {location.chambres > 1 ? "s" : ""}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <CheckCircle
                          fontSize="small"
                          sx={{ color: "success.main" }}
                        />
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight="600"
                          sx={{
                            fontSize: {
                              xs: "clamp(0.75rem, 2.8vw, 0.85rem)",
                              md: "0.9rem",
                            },
                          }}
                        >
                          Disponible : {location.disponibilite}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 2, borderColor: "grey.200" }} />

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          background: `linear-gradient(135deg, ${location.gradient[0]} 0%, ${location.gradient[1]} 100%)`,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: {
                            xs: "clamp(1.2rem, 4vw, 1.5rem)",
                            md: "1.6rem",
                          },
                        }}
                      >
                        {formatMoney(location.prix)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight="500"
                        sx={{
                          fontSize: {
                            xs: "clamp(0.7rem, 2.5vw, 0.8rem)",
                            md: "0.85rem",
                          },
                        }}
                      >
                        /mois
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="medium"
                      endIcon={<ArrowForward />}
                      onClick={() => handleOpenLocationDetails(location)}
                      sx={{
                        mt: "auto",
                        background: `linear-gradient(135deg, ${location.gradient[0]} 0%, ${location.gradient[1]} 100%)`,
                        color: "white",
                        fontWeight: "bold",
                        py: { xs: 1, md: 1.2 },
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: {
                          xs: "clamp(0.85rem, 2.6vw, 0.95rem)",
                          md: "1rem",
                        },
                        boxShadow: `0 4px 16px ${location.gradient[0]}30`,
                        "&:hover": {
                          transform: {
                            xs: "none",
                            md: "translateY(-2px)",
                          },
                          boxShadow: `0 8px 24px ${location.gradient[0]}40`,
                          background: `linear-gradient(135deg, ${location.gradient[0]} 0%, ${location.gradient[1]} 100%)`,
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Voir la location
                    </Button>
                  </CardContent>
                </Card>
                </Grid>
              ))}
            </Grid>

            {/* Bouton "Afficher la suite" moderne pour les locations */}
            {locationsDisplayed < homepageLocations.length && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleShowMoreLocations}
                  sx={{
                    px: { xs: 4, sm: 5 },
                    py: { xs: 1.2, sm: 1.5 },
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    fontWeight: 600,
                    borderRadius: "50px",
                    textTransform: "none",
                    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                    boxShadow: "0 4px 16px rgba(236, 72, 153, 0.3)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      transition: "left 0.5s ease",
                    },
                    "&:hover": {
                      background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                      boxShadow: "0 6px 24px rgba(236, 72, 153, 0.4)",
                      transform: "translateY(-2px)",
                      "&::before": {
                        left: "100%",
                      },
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Afficher la suite
                </Button>
              </Box>
            )}
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Aucune location disponible pour le moment
          </Typography>
        </Box>
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
          background: "linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 30%, #ede9fe 60%, #ffffff 100%)",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)",
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
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
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
                👥
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
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
                background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #2471A3 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
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
              MIZNAS Patrimoine est ouvert à tous les acteurs du secteur foncier et immobilier
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
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
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
                  background: "linear-gradient(90deg, #1B5285 0%, #27AE60 100%)",
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
                    background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
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
                background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
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
                  background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
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
                    background: "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)",
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
                background: "linear-gradient(135deg, #ffffff 0%, #fffbf0 100%)",
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
                  background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                },
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(245, 158, 11, 0.15)",
                  borderColor: "warning.main",
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                <Box
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)",
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
                background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
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
                  background: "linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)",
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
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
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
        "linear-gradient(135deg, #0D2B4E 0%, #1B5285 50%, #2471A3 100%)",
      color: "white",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 10% 0%, rgba(96,165,250,0.25) 0%, transparent 50%), radial-gradient(circle at 90% 100%, rgba(129,140,248,0.25) 0%, transparent 50%)",
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
          Plateforme sécurisée MIZNAS Patrimoine
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
        Rejoignez MIZNAS Patrimoine dès aujourd&apos;hui et digitalisez votre
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
            background: "linear-gradient(135deg, #1B5285 0%, #27AE60 50%, #1B5285 100%)",
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
              background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
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
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
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
                🏢 Devenir Partenaire
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
              📞 +227 80 64 83 83
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

      {/* Drawer des locations */}
      <Drawer
        anchor="right"
        open={openLocationsDrawer}
        onClose={() => setOpenLocationsDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "80%", md: "70%", lg: "60%" },
            maxWidth: "1200px",
          },
        }}
      >
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          {/* En-tête du drawer */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {selectedLocation ? `🏠 ${selectedLocation.titre}` : "🏠 Détails de la Location"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedLocation ? `${selectedLocation.type} à ${selectedLocation.ville}` : "Informations complètes"}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseLocationDetails}
              sx={{
                bgcolor: "grey.100",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenu du drawer */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {selectedLocation ? (
              <Grid container spacing={3}>
                {/* Photos de la location */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    📸 Photos de la location
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    {/* Photo principale */}
                    <Box
                      component="img"
                      src={selectedLocation.image}
                      alt={selectedLocation.titre}
                            sx={{
                        width: "100%",
                        height: 400,
                        objectFit: "cover",
                        borderRadius: 2,
                        mb: 2
                      }}
                    />
                    
                    {/* Galerie des autres photos */}
                    {selectedLocation.images && selectedLocation.images.length > 1 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" mb={1}>
                          Autres photos ({selectedLocation.images.length - 1})
                        </Typography>
                        <Grid container spacing={1}>
                          {selectedLocation.images.slice(1).map((image, index) => (
                            <Grid item xs={3} key={index}>
                            <Box
                              component="img"
                                src={fixImageUrl(image.url || image)}
                                alt={`${selectedLocation.titre} - Photo ${index + 2}`}
                              sx={{
                                width: "100%",
                                  height: 80,
                                objectFit: "cover",
                                  borderRadius: 1,
                                  cursor: "pointer",
                                transition: "all 0.3s ease",
                                  "&:hover": { 
                                    transform: "scale(1.05)",
                                    boxShadow: 2
                                  }
                                }}
                                onClick={() => {
                                  // Remplacer la photo principale par celle cliquée
                                  const newImages = [...selectedLocation.images];
                                  [newImages[0], newImages[index + 1]] = [newImages[index + 1], newImages[0]];
                                  setSelectedLocation({
                                    ...selectedLocation,
                                    image: fixImageUrl(newImages[0].url || newImages[0]),
                                    images: newImages
                                  });
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                            </Box>
                    )}
                    
                    {/* Si pas d'autres photos, afficher un message */}
                    {(!selectedLocation.images || selectedLocation.images.length <= 1) && (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucune photo supplémentaire disponible
                        </Typography>
                            </Box>
                    )}
                          </Box>
                </Grid>

                {/* Informations principales */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" mb={3} sx={{ 
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.5rem"
                  }}>
                    ℹ️ Informations principales
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #fff5f8 0%, #ffeef2 100%)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(240, 147, 251, 0.1)",
                    border: "1px solid rgba(240, 147, 251, 0.1)"
                  }}>
                    <Grid container spacing={3}>
                      {/* Type de bien */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          color: "white",
                          textAlign: "center"
                        }}>
                          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontSize: "0.8rem", fontWeight: 600 }}>
                            TYPE DE BIEN
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                            {selectedLocation.type}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Disponibilité */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(76, 175, 80, 0.1)",
                          border: "1px solid rgba(76, 175, 80, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            DISPONIBILITÉ
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                            {selectedLocation.disponibilite}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Meublé */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(255, 152, 0, 0.1)",
                          border: "1px solid rgba(255, 152, 0, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            MEUBLÉ
                          </Typography>
                          <Chip 
                            label={selectedLocation.meuble ? "Meublé" : "Non meublé"} 
                            color={selectedLocation.meuble ? "success" : "warning"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>

                      {/* Description */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid rgba(0, 0, 0, 0.1)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 2 }}>
                            DESCRIPTION
                          </Typography>
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {selectedLocation.description}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Informations pratiques */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" mb={3} sx={{ 
                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.5rem"
                  }}>
                    📅 Informations pratiques
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(79, 172, 254, 0.1)",
                    border: "1px solid rgba(79, 172, 254, 0.1)"
                  }}>
                    <Grid container spacing={3}>
                      {/* Date de disponibilité */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          color: "white",
                          textAlign: "center"
                        }}>
                          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontSize: "0.8rem", fontWeight: 600 }}>
                            DATE DE DISPONIBILITÉ
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                            {selectedLocation.dateDisponibilite ? 
                              new Date(selectedLocation.dateDisponibilite).toLocaleDateString('fr-FR') : 
                              "Immédiate"
                            }
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Durée minimale */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(156, 39, 176, 0.1)",
                          border: "1px solid rgba(156, 39, 176, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            DURÉE MINIMALE
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="secondary.main" sx={{ mt: 1 }}>
                            {selectedLocation.dureeMinimale}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Charges incluses */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: selectedLocation.chargesIncluses ? 
                            "rgba(76, 175, 80, 0.1)" : "rgba(255, 152, 0, 0.1)",
                          border: `1px solid ${selectedLocation.chargesIncluses ? 
                            "rgba(76, 175, 80, 0.3)" : "rgba(255, 152, 0, 0.3)"}`
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            CHARGES INCLUSES
                          </Typography>
                          <Chip 
                            label={selectedLocation.chargesIncluses ? "Oui" : "Non"} 
                            color={selectedLocation.chargesIncluses ? "success" : "warning"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>

                      {/* Référence du bien */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            RÉFÉRENCE DU BIEN
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                            {selectedLocation.reference || "Non spécifiée"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Caractéristiques */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" mb={3} sx={{ 
                    background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.5rem"
                  }}>
                    🏠 Caractéristiques détaillées
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)",
                    border: "1px solid rgba(102, 126, 234, 0.1)"
                  }}>
                    <Grid container spacing={3}>
                      {/* Superficie */}
                      <Grid item xs={6} sm={4}>
                        <Box sx={{ 
                          textAlign: "center",
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
                          color: "white"
                        }}>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedLocation.superficie}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            m²
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Superficie
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Chambres */}
                      <Grid item xs={6} sm={4}>
                        <Box sx={{ 
                          textAlign: "center",
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          color: "white"
                        }}>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedLocation.chambres}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            🛏️
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Chambres
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Salles de bain */}
                      <Grid item xs={6} sm={4}>
                        <Box sx={{ 
                          textAlign: "center",
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          color: "white"
                        }}>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedLocation.salleDeBain}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            🚿
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Salles de bain
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Référence */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            RÉFÉRENCE DU BIEN
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {selectedLocation.reference || "Non spécifiée"}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Statut */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: selectedLocation.statut === "disponible" ? 
                            "rgba(76, 175, 80, 0.1)" : "rgba(255, 152, 0, 0.1)",
                          border: `1px solid ${selectedLocation.statut === "disponible" ? 
                            "rgba(76, 175, 80, 0.3)" : "rgba(255, 152, 0, 0.3)"}`
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            STATUT
                          </Typography>
                          <Chip 
                            label={selectedLocation.statut} 
                            color={selectedLocation.statut === "disponible" ? "success" : "warning"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>

                      {/* Durée minimale */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(156, 39, 176, 0.1)",
                          border: "1px solid rgba(156, 39, 176, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            DURÉE MINIMALE
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="secondary.main">
                            {selectedLocation.dureeMinimale}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Équipements */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid rgba(0, 0, 0, 0.1)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 2 }}>
                            ÉQUIPEMENTS INCLUS
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {selectedLocation.features.map((feature, index) => (
                              <Chip 
                                key={index} 
                                label={feature} 
                                size="small" 
                                sx={{ 
                                  background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
                                  color: "white",
                                  fontWeight: "bold",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                                  },
                                  transition: "all 0.3s ease"
                                }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Prix de location */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    💰 Informations financières
                  </Typography>
                  <Paper sx={{ p: 3, background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)", color: "white" }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" fontWeight="bold" sx={{ color: "white" }}>
                            {formatMoney(selectedLocation.prix)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Prix mensuel
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                            {formatMoney(selectedLocation.caution)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Caution
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                            {formatMoney(selectedLocation.charges)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Charges {selectedLocation.chargesIncluses ? "(incluses)" : "(non incluses)"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                            {formatMoney(selectedLocation.prix + selectedLocation.charges)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Total mensuel
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          background: "rgba(255, 255, 255, 0.9)",
                          color: "primary.main",
                          px: 4,
                          fontWeight: "bold",
                          "&:hover": {
                            background: "white",
                            transform: "translateY(-2px)"
                          }
                        }}
                      >
                        📞 Contacter l'agence
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => {
                          const whatsappUrl = `https://wa.me/22780648383`;
                          window.open(whatsappUrl, "_blank");
                        }}
                        sx={{ 
                          px: 4,
                          borderColor: "white",
                          color: "white",
                          fontWeight: "bold",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.1)",
                            borderColor: "white"
                          }
                        }}
                      >
                        🏠 Demander une visite
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                {/* Localisation */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    📍 Localisation et géolocalisation
                  </Typography>
                  <Paper sx={{ p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ 
                              bgcolor: "primary.main", 
                              color: "white", 
                              borderRadius: "50%", 
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <LocationOn />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                VILLE
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {selectedLocation.ville}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ 
                              bgcolor: "secondary.main", 
                              color: "white", 
                              borderRadius: "50%", 
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <Home />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                QUARTIER
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="secondary.main">
                                {selectedLocation.quartier || "Quartier non spécifié"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ 
                              bgcolor: "success.main", 
                              color: "white", 
                              borderRadius: "50%", 
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <LocationOn />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                ADRESSE
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                {selectedLocation.adresse || "Adresse non spécifiée"}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Coordonnées GPS */}
                          {selectedLocation.coordonnees && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Box sx={{ 
                                bgcolor: "warning.main", 
                                color: "white", 
                                borderRadius: "50%", 
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <LocationOn />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  COORDONNÉES GPS
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="warning.main">
                                  Lat: {selectedLocation.coordonnees.latitude || "N/A"}<br/>
                                  Lng: {selectedLocation.coordonnees.longitude || "N/A"}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  if (selectedLocation.coordonnees?.latitude && selectedLocation.coordonnees?.longitude) {
                                    const navigationUrl = `https://www.google.com/maps?q=${selectedLocation.coordonnees.latitude},${selectedLocation.coordonnees.longitude}`;
                                    window.open(navigationUrl, "_blank");
                                  } else {
                                    alert("Coordonnées GPS non disponibles");
                                  }
                                }}
                                sx={{ 
                                  minWidth: "auto",
                                  px: 1,
                                  py: 0.5,
                                  fontSize: "0.7rem"
                                }}
                              >
                                Naviguer
                              </Button>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          height: 350, 
                          borderRadius: 3, 
                          overflow: "hidden",
                          position: "relative",
                          background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {/* Overlay avec effet de verre */}
                          <Box sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column"
                          }}>
                            <Box sx={{ 
                              bgcolor: "rgba(255, 255, 255, 0.9)", 
                              borderRadius: "50%", 
                              p: 3,
                              mb: 2,
                              boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                            }}>
                              <LocationOn sx={{ fontSize: 40, color: "primary.main" }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color="white" mb={1}>
                              🗺️ Géolocalisation Interactive
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={2} textAlign="center">
                              Visualisez l'emplacement exact sur la carte
                            </Typography>
                            
                            {/* Boutons de géolocalisation */}
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                              <Button
                                variant="contained"
                                size="large"
                                startIcon={<LocationOn />}
                                onClick={() => {
                                  if (selectedLocation.coordonnees?.latitude && selectedLocation.coordonnees?.longitude) {
                                    const lat = selectedLocation.coordonnees.latitude;
                                    const lng = selectedLocation.coordonnees.longitude;
                                    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                                    window.open(googleMapsUrl, "_blank");
                                  } else {
                                    const searchQuery = selectedLocation.adresse || selectedLocation.ville;
                                    const fallbackUrl = `https://maps.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
                                    window.open(fallbackUrl, "_blank");
                                  }
                                }}
                                sx={{
                                  background: "rgba(255, 255, 255, 0.9)",
                                  color: "primary.main",
                                  fontWeight: "bold",
                                  px: 3,
                                  py: 1.5,
                                  borderRadius: 2,
                                  textTransform: "none",
                                  "&:hover": {
                                    background: "white",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
                                  },
                                  transition: "all 0.3s ease"
                                }}
                              >
                                Google Maps
                              </Button>
                              
                              <Button
                                variant="outlined"
                                size="large"
                                startIcon={<LocationOn />}
                                onClick={() => {
                                  if (selectedLocation.coordonnees?.latitude && selectedLocation.coordonnees?.longitude) {
                                    const lat = selectedLocation.coordonnees.latitude;
                                    const lng = selectedLocation.coordonnees.longitude;
                                    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
                                    window.open(osmUrl, "_blank");
                                  } else {
                                    const searchQuery = selectedLocation.adresse || selectedLocation.ville;
                                    const fallbackUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(searchQuery)}`;
                                    window.open(fallbackUrl, "_blank");
                                  }
                                }}
                                sx={{
                                  borderColor: "rgba(255, 255, 255, 0.8)",
                                  color: "white",
                                  fontWeight: "bold",
                                  px: 3,
                                  py: 1.5,
                                  borderRadius: 2,
                                  textTransform: "none",
                                  "&:hover": {
                                    background: "rgba(255, 255, 255, 0.1)",
                                    borderColor: "white"
                                  },
                                  transition: "all 0.3s ease"
                                }}
                              >
                                OpenStreetMap
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography variant="h6" color="text.secondary">
                  Aucune location sélectionnée
                </Typography>
                  </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Drawer des biens immobiliers */}
      <BienDetailDrawer
        open={openBiensDrawer}
        onClose={handleCloseBienDetails}
        selectedBien={selectedBien}
        onBienUpdate={setSelectedBien}
      />

      {/* Ancien drawer - à supprimer après vérification */}
      {false && (
      <Drawer
        anchor="right"
        open={openBiensDrawer}
        onClose={handleCloseBienDetails}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "80%", md: "70%", lg: "60%" },
            maxWidth: "1200px",
          },
        }}
      >
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          {/* En-tête du drawer */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {selectedBien ? `🏠 ${selectedBien.titre}` : "🏠 Détails du Bien Immobilier"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedBien ? `${selectedBien.type} à ${selectedBien.ville}` : "Informations complètes"}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseBienDetails}
              sx={{
                bgcolor: "grey.100",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenu du drawer */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {selectedBien ? (
              <Grid container spacing={3}>
                {/* Photos du bien */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    📸 Photos du bien
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    {/* Photo principale */}
                    <Box
                      component="img"
                      src={selectedBien.image}
                      alt={selectedBien.titre}
                      sx={{
                        width: "100%",
                        height: 400,
                        objectFit: "cover",
                        borderRadius: 2,
                        mb: 2
                      }}
                    />
                    
                    {/* Galerie des autres photos */}
                    {selectedBien.images && selectedBien.images.length > 1 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" mb={1}>
                          Autres photos ({selectedBien.images.length - 1})
                        </Typography>
                        <Grid container spacing={1}>
                          {selectedBien.images.slice(1).map((image, index) => (
                            <Grid item xs={3} key={index}>
                              <Box
                                component="img"
                                src={fixImageUrl(image)}
                                alt={`${selectedBien.titre} - Photo ${index + 2}`}
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                  "&:hover": { 
                                    transform: "scale(1.05)",
                                    boxShadow: 2
                                  }
                                }}
                                onClick={() => {
                                  // Remplacer la photo principale par celle cliquée
                                  const newImages = [...selectedBien.images];
                                  [newImages[0], newImages[index + 1]] = [newImages[index + 1], newImages[0]];
                                  setSelectedBien({
                                    ...selectedBien,
                                    image: fixImageUrl(newImages[0]),
                                    images: newImages
                                  });
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    
                    {/* Si pas d'autres photos */}
                    {(!selectedBien.images || selectedBien.images.length <= 1) && (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucune photo supplémentaire disponible
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Vidéos du bien */}
                {selectedBien.videos && selectedBien.videos.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      🎥 Vidéos du bien
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                      <Grid container spacing={3}>
                        {selectedBien.videos.map((videoUrl, index) => {
                          const embedUrl = getVideoEmbedUrl(videoUrl);
                          const isYouTube = embedUrl && embedUrl.includes('youtube.com/embed');
                          const isVimeo = embedUrl && embedUrl.includes('vimeo.com/video');
                          
                          return (
                            <Grid item xs={12} md={6} key={index}>
                              <Paper
                                elevation={3}
                                sx={{
                                  overflow: "hidden",
                                  borderRadius: 2,
                                  position: "relative",
                                  "&:hover": {
                                    boxShadow: 6,
                                  },
                                }}
                              >
                                {embedUrl && (isYouTube || isVimeo) ? (
                                  <Box
                                    component="iframe"
                                    src={embedUrl}
                                    sx={{
                                      width: "100%",
                                      height: 300,
                                      border: "none",
                                      display: "block",
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: 300,
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      bgcolor: "primary.main",
                                      color: "white",
                                      p: 3,
                                    }}
                                  >
                                    <VideoLibrary sx={{ fontSize: 48, mb: 2 }} />
                                    <Typography variant="h6" fontWeight="bold" mb={1}>
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
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Grid>
                )}

                {/* Situation géographique du Terrain */}
                {selectedBien.situationGeographique && (
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      🗺️ Situation géographique du Terrain
                    </Typography>
                    <Paper sx={{ 
                      p: 3, 
                      background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(76, 175, 80, 0.1)",
                      border: "1px solid rgba(76, 175, 80, 0.2)"
                    }}>
                      <Typography variant="body1" sx={{ lineHeight: 1.8, color: "text.primary" }}>
                        {selectedBien.situationGeographique}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Description physique */}
                {selectedBien.descriptionPhysique && (
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      📋 Description physique
                    </Typography>
                    <Paper sx={{ 
                      p: 3, 
                      background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(255, 152, 0, 0.1)",
                      border: "1px solid rgba(255, 152, 0, 0.2)"
                    }}>
                      <Typography variant="body1" sx={{ lineHeight: 1.8, color: "text.primary" }}>
                        {selectedBien.descriptionPhysique}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Atouts majeurs */}
                {selectedBien.atoutsMajeurs && selectedBien.atoutsMajeurs.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      ⭐ Atouts majeurs
                    </Typography>
                    <Paper sx={{ 
                      p: 3, 
                      background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(156, 39, 176, 0.1)",
                      border: "1px solid rgba(156, 39, 176, 0.2)"
                    }}>
                      <Grid container spacing={2}>
                        {selectedBien.atoutsMajeurs.map((atout, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box sx={{ 
                              p: 2,
                              borderRadius: 2,
                              background: "rgba(255, 255, 255, 0.8)",
                              border: "1px solid rgba(156, 39, 176, 0.3)",
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(156, 39, 176, 0.2)"
                              }
                            }}>
                              <Box sx={{ 
                                bgcolor: "secondary.main", 
                                color: "white", 
                                borderRadius: "50%", 
                                p: 0.8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 32,
                                height: 32
                              }}>
                                <Typography variant="body2" fontWeight="bold">
                                  ✓
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight={500} sx={{ flex: 1 }}>
                                {typeof atout === "string" ? atout : atout.nom || atout}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Informations principales */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" mb={3} sx={{ 
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.5rem"
                  }}>
                    ℹ️ Informations principales
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #fff5f8 0%, #ffeef2 100%)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(240, 147, 251, 0.1)",
                    border: "1px solid rgba(240, 147, 251, 0.1)"
                  }}>
                    <Grid container spacing={3}>
                      {/* Type de bien */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          color: "white",
                          textAlign: "center"
                        }}>
                          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontSize: "0.8rem", fontWeight: 600 }}>
                            TYPE DE BIEN
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                            {selectedBien.type}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Ville */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(76, 175, 80, 0.1)",
                          border: "1px solid rgba(76, 175, 80, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            VILLE
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                            {selectedBien.ville}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Superficie */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(255, 152, 0, 0.1)",
                          border: "1px solid rgba(255, 152, 0, 0.2)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            SUPERFICIE
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ mt: 1 }}>
                            {selectedBien.superficie} m²
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Description */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid rgba(0, 0, 0, 0.1)"
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 2 }}>
                            DESCRIPTION
                          </Typography>
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {selectedBien.description}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Informations financières */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" mb={3} sx={{ 
                    background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.5rem"
                  }}>
                    💰 Informations financières
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
                    color: "white",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)"
                  }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Box textAlign="center">
                          <Typography variant="h3" fontWeight="bold" sx={{ color: "white" }}>
                            {formatMoney(selectedBien.prix)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Valeur estimée
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                          const whatsappUrl = `https://wa.me/22780648383`;
                          window.open(whatsappUrl, "_blank");
                        }}
                        sx={{
                          background: "rgba(255, 255, 255, 0.9)",
                          color: "primary.main",
                          px: 4,
                          fontWeight: "bold",
                          "&:hover": {
                            background: "white",
                            transform: "translateY(-2px)"
                          }
                        }}
                      >
                        📞 Contacter le propriétaire
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => {
                          const whatsappUrl = `https://wa.me/22780648383`;
                          window.open(whatsappUrl, "_blank");
                        }}
                        sx={{ 
                          px: 4,
                          borderColor: "white",
                          color: "white",
                          fontWeight: "bold",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.1)",
                            borderColor: "white"
                          }
                        }}
                      >
                        🏠 Demander une visite
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                {/* Localisation */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    📍 Localisation et géolocalisation
                  </Typography>
                  <Paper sx={{ p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ 
                              bgcolor: "primary.main", 
                              color: "white", 
                              borderRadius: "50%", 
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <LocationOn />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                VILLE
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {selectedBien.ville}
                              </Typography>
                            </Box>
                          </Box>

                          {selectedBien.quartier && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Box sx={{ 
                                bgcolor: "secondary.main", 
                                color: "white", 
                                borderRadius: "50%", 
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <Home />
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  QUARTIER
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="secondary.main">
                                  {selectedBien.quartier}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {selectedBien.adresse && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Box sx={{ 
                                bgcolor: "success.main", 
                                color: "white", 
                                borderRadius: "50%", 
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <LocationOn />
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  ADRESSE
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                  {selectedBien.adresse}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* Coordonnées GPS */}
                          {selectedBien.latitude && selectedBien.longitude && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Box sx={{ 
                                bgcolor: "warning.main", 
                                color: "white", 
                                borderRadius: "50%", 
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <LocationOn />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  COORDONNÉES GPS
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
                                  Format décimal:<br/>
                                  Lat: {selectedBien.latitude}<br/>
                                  Lng: {selectedBien.longitude}
                                </Typography>
                                {decimalToDMS(selectedBien.latitude, "lat") && decimalToDMS(selectedBien.longitude, "lon") && (
                                  <Typography variant="body2" fontWeight="bold" color="warning.dark" sx={{ mt: 1, fontSize: "0.85rem" }}>
                                    Format DMS:<br/>
                                    {decimalToDMS(selectedBien.latitude, "lat")} / {decimalToDMS(selectedBien.longitude, "lon")}
                                  </Typography>
                                )}
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={async () => {
                                  try {
                                    if (!navigator.geolocation) {
                                      alert("La géolocalisation n'est pas supportée par votre navigateur");
                                      return;
                                    }

                                    navigator.geolocation.getCurrentPosition(
                                      (position) => {
                                        const userLat = position.coords.latitude;
                                        const userLng = position.coords.longitude;
                                        const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${selectedBien.latitude},${selectedBien.longitude}`;
                                        window.open(googleMapsUrl, "_blank");
                                      },
                                      (error) => {
                                        console.error("Erreur de géolocalisation:", error);
                                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedBien.latitude},${selectedBien.longitude}`;
                                        window.open(googleMapsUrl, "_blank");
                                      },
                                      {
                                        enableHighAccuracy: true,
                                        timeout: 15000,
                                        maximumAge: 0
                                      }
                                    );
                                  } catch (error) {
                                    console.error("Erreur:", error);
                                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedBien.latitude},${selectedBien.longitude}`;
                                    window.open(googleMapsUrl, "_blank");
                                  }
                                }}
                                sx={{ 
                                  minWidth: "auto",
                                  px: 1,
                                  py: 0.5,
                                  fontSize: "0.7rem"
                                }}
                              >
                                Itinéraire
                              </Button>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          height: 350, 
                          borderRadius: 3, 
                          overflow: "hidden",
                          position: "relative",
                          background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {/* Overlay avec effet de verre */}
                          <Box sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column"
                          }}>
                            <Box sx={{ 
                              bgcolor: "rgba(255, 255, 255, 0.9)", 
                              borderRadius: "50%", 
                              p: 3,
                              mb: 2,
                              boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                            }}>
                              <LocationOn sx={{ fontSize: 40, color: "primary.main" }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color="white" mb={1}>
                              🗺️ Géolocalisation Interactive
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={2} textAlign="center">
                              Visualisez l'emplacement exact sur la carte
                            </Typography>
                            
                            {/* Boutons de géolocalisation */}
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                              <Button
                                variant="contained"
                                size="large"
                                startIcon={<LocationOn />}
                                onClick={() => {
                                  if (selectedBien.latitude && selectedBien.longitude) {
                                    const lat = selectedBien.latitude;
                                    const lng = selectedBien.longitude;
                                    const googleMapsUrl = `https://www.google.com/maps/@${lat},${lng},18z`;
                                    window.open(googleMapsUrl, "_blank");
                                  } else {
                                    const searchQuery = selectedBien.adresse || selectedBien.ville;
                                    const fallbackUrl = `https://maps.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
                                    window.open(fallbackUrl, "_blank");
                                  }
                                }}
                                sx={{
                                  background: "rgba(255, 255, 255, 0.9)",
                                  color: "primary.main",
                                  fontWeight: "bold",
                                  px: 3,
                                  py: 1.5,
                                  borderRadius: 2,
                                  textTransform: "none",
                                  "&:hover": {
                                    background: "white",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
                                  },
                                  transition: "all 0.3s ease"
                                }}
                              >
                                Voir sur la carte
                              </Button>
                              
                              <Button
                                variant="outlined"
                                size="large"
                                startIcon={<LocationOn />}
                                onClick={async () => {
                                  try {
                                    if (!navigator.geolocation) {
                                      alert("La géolocalisation n'est pas supportée par votre navigateur");
                                      return;
                                    }

                                    navigator.geolocation.getCurrentPosition(
                                      (position) => {
                                        const userLat = position.coords.latitude;
                                        const userLng = position.coords.longitude;
                                        const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${selectedBien.latitude},${selectedBien.longitude}`;
                                        window.open(googleMapsUrl, "_blank");
                                      },
                                      (error) => {
                                        console.error("Erreur de géolocalisation:", error);
                                        let errorMsg = "Impossible d'obtenir votre position. ";
                                        switch(error.code) {
                                          case error.PERMISSION_DENIED:
                                            errorMsg += "Veuillez autoriser l'accès à votre position dans les paramètres du navigateur.";
                                            break;
                                          case error.POSITION_UNAVAILABLE:
                                            errorMsg += "Votre position n'est pas disponible.";
                                            break;
                                          case error.TIMEOUT:
                                            errorMsg += "La demande de position a expiré.";
                                            break;
                                          default:
                                            errorMsg += "Une erreur est survenue lors de la récupération de votre position.";
                                            break;
                                        }
                                        alert(errorMsg);
                                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedBien.latitude},${selectedBien.longitude}`;
                                        window.open(googleMapsUrl, "_blank");
                                      },
                                      {
                                        enableHighAccuracy: true,
                                        timeout: 15000,
                                        maximumAge: 0
                                      }
                                    );
                                  } catch (error) {
                                    console.error("Erreur:", error);
                                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedBien.latitude},${selectedBien.longitude}`;
                                    window.open(googleMapsUrl, "_blank");
                                  }
                                }}
                                sx={{
                                  borderColor: "rgba(255, 255, 255, 0.8)",
                                  color: "white",
                                  fontWeight: "bold",
                                  px: 3,
                                  py: 1.5,
                                  borderRadius: 2,
                                  textTransform: "none",
                                  "&:hover": {
                                    background: "rgba(255, 255, 255, 0.1)",
                                    borderColor: "white"
                                  },
                                  transition: "all 0.3s ease"
                                }}
                              >
                                Itinéraire depuis ma position
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography variant="h6" color="text.secondary">
                  Aucun bien immobilier sélectionné
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>
      )}

      {/* Drawer pour les détails de la parcelle */}
      <ParcelleDetailDrawer
        open={openParcelleDrawer}
        onClose={handleCloseParcelleDetails}
        selectedParcelle={selectedParcelle}
        onParcelleUpdate={setSelectedParcelle}
      />

      {/* Ancien drawer - à supprimer après vérification */}
      {false && (
      <Drawer
        anchor="right"
        open={openParcelleDrawer}
        onClose={handleCloseParcelleDetails}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "90%", md: 600, lg: 700 },
            bgcolor: "background.default",
          },
        }}
      >
        <Box sx={{ p: 3, height: "100%", overflowY: "auto" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                🏘️ {selectedParcelle?.ref || "Détails de la parcelle"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Îlot {selectedParcelle?.ilot}, Parcelle {selectedParcelle?.ref}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseParcelleDetails}>
              <CloseIcon />
            </IconButton>
          </Box>

          {selectedParcelle ? (
            <Grid container spacing={3}>
              {/* Photos de la parcelle */}
              {selectedParcelle.images && selectedParcelle.images.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      📸 Photos de la parcelle
                    </Typography>
                    <Box sx={{ position: "relative", height: 300, borderRadius: 2, overflow: "hidden", mb: 2 }}>
                      <Box
                        component="img"
                        src={fixImageUrl(selectedParcelle.images[0])}
                        alt={selectedParcelle.ref}
                        onError={(e) => {
                          // Si l'image ne se charge pas, afficher un placeholder
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='16'%3EImage%20non%20disponible%3C/text%3E%3C/svg%3E";
                          e.target.onerror = null; // Empêcher la boucle infinie
                        }}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          bgcolor: "#f0f0f0",
                        }}
                      />
                    </Box>
                    {selectedParcelle.images.length > 1 && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {selectedParcelle.images.slice(1).map((img, idx) => (
                          <Box
                            key={idx}
                            component="img"
                            src={fixImageUrl(img)}
                            alt={`${selectedParcelle.ref} - Image ${idx + 2}`}
                            onError={(e) => {
                              // Si l'image ne se charge pas, afficher un placeholder
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='10'%3EN/A%3C/text%3E%3C/svg%3E";
                              e.target.onerror = null; // Empêcher la boucle infinie
                            }}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 1,
                              cursor: "pointer",
                              border: "2px solid transparent",
                              bgcolor: "#f0f0f0",
                              "&:hover": {
                                borderColor: "primary.main",
                              },
                            }}
                            onClick={() => {
                              const newImages = [...selectedParcelle.images];
                              newImages[0] = img;
                              newImages[idx + 1] = selectedParcelle.images[0];
                              setSelectedParcelle({ ...selectedParcelle, images: newImages });
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* Informations principales */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #1B5285 0%, #27AE60 100%)" }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "white", mb: 2 }}>
                    📋 Informations principales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          RÉFÉRENCE
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {selectedParcelle.ref}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          ÎLOT
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {selectedParcelle.ilot}, Parcelle {selectedParcelle.ref}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          SUPERFICIE
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {selectedParcelle.superficie} m²
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          PRIX
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {selectedParcelle.prix > 0 ? formatMoney(selectedParcelle.prix) : "Prix sur demande"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          VILLE
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          📍 {selectedParcelle.ville}
                        </Typography>
                      </Paper>
                    </Grid>
                    {selectedParcelle.description && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            DESCRIPTION
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6 }}>
                            {selectedParcelle.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    {selectedParcelle.agenceNom && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            AGENCE
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            🏢 {selectedParcelle.agenceNom}
                          </Typography>
                          {selectedParcelle.agenceTelephone && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              📞 {selectedParcelle.agenceTelephone}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Géolocalisation */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "white", mb: 3 }}>
                    🗺️ Localisation
                  </Typography>
                  
                  <Box sx={{ 
                    height: 350, 
                    borderRadius: 3, 
                    overflow: "hidden",
                    position: "relative",
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    mb: 2
                  }}>
                    <Box sx={{ 
                      bgcolor: "rgba(255, 255, 255, 0.9)", 
                      borderRadius: "50%", 
                      p: 3,
                      mb: 2
                    }}>
                      <LocationOn sx={{ fontSize: 60, color: "primary.main" }} />
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "white", mb: 1 }}>
                      {selectedParcelle.ville}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                      Îlot {selectedParcelle.ilot}, Parcelle {selectedParcelle.ref}
                    </Typography>
                  </Box>

                  {/* Carte interactive Leaflet */}
                  {(selectedParcelle.latitude && selectedParcelle.longitude) ? (
                    <Grid item xs={12} sx={{ mb: 3 }}>
                      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255, 255, 255, 0.95)" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Typography variant="h6" fontWeight="bold">
                            🗺️ Localisation sur la carte
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              const googleMapsUrl = `https://www.google.com/maps/@${selectedParcelle.latitude},${selectedParcelle.longitude},18z`;
                              window.open(googleMapsUrl, "_blank");
                            }}
                            sx={{ textTransform: "none" }}
                          >
                            Voir sur Google Maps
                          </Button>
                        </Box>
                        <Box sx={{ height: 400, borderRadius: 2, overflow: "hidden", border: "2px solid #e0e0e0" }}>
                          <MapContainer
                            center={[selectedParcelle.latitude, selectedParcelle.longitude]}
                            zoom={18}
                            style={{ height: "100%", width: "100%" }}
                            scrollWheelZoom={true}
                            minZoom={10}
                            maxZoom={19}
                          >
                            {/* Carte détaillée avec maisons et routes - Style OpenStreetMap standard (plus détaillé) */}
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              maxZoom={19}
                            />
                            <Marker
                              position={[selectedParcelle.latitude, selectedParcelle.longitude]}
                              icon={L.icon({
                                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                                shadowSize: [41, 41],
                                shadowAnchor: [12, 41]
                              })}
                            >
                              <Popup>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Parcelle {selectedParcelle.ref}
                                </Typography>
                                <Typography variant="body2">
                                  Îlot {selectedParcelle.ilot}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {selectedParcelle.latitude}, {selectedParcelle.longitude}
                                </Typography>
                                <Button
                                  size="small"
                                  variant="contained"
                                  sx={{ mt: 1 }}
                                  onClick={() => {
                                    const googleMapsUrl = `https://www.google.com/maps/@${selectedParcelle.latitude},${selectedParcelle.longitude},18z`;
                                    window.open(googleMapsUrl, "_blank");
                                  }}
                                >
                                  Voir sur Google Maps
                                </Button>
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </Box>
                      </Paper>
                    </Grid>
                  ) : null}

                  {/* Coordonnées GPS */}
                  {(selectedParcelle.latitude && selectedParcelle.longitude) ? (
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Box sx={{ 
                          bgcolor: "rgba(255, 255, 255, 0.9)", 
                          borderRadius: "50%", 
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <LocationOn sx={{ color: "warning.main" }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontSize: "0.8rem", fontWeight: 600, color: "white" }}>
                            COORDONNÉES GPS
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: "rgba(255,255,255,0.95)" }}>
                            Lat: {selectedParcelle.latitude}<br/>
                            Lng: {selectedParcelle.longitude}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Boutons de navigation */}
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<LocationOn />}
                          onClick={() => {
                            const osmUrl = getNavigationUrl(selectedParcelle.latitude, selectedParcelle.longitude);
                            if (osmUrl) window.open(osmUrl, "_blank");
                          }}
                          sx={{
                            background: "rgba(255, 255, 255, 0.9)",
                            color: "primary.main",
                            fontWeight: "bold",
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: "none",
                            "&:hover": {
                              background: "white",
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
                            },
                            transition: "all 0.3s ease"
                          }}
                        >
                          Voir sur la carte
                        </Button>
                        
                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={<LocationOn />}
                          onClick={async () => {
                            try {
                              // Demander la permission de géolocalisation
                              if (!navigator.geolocation) {
                                alert("La géolocalisation n'est pas supportée par votre navigateur");
                                return;
                              }

                              // Obtenir la position actuelle de l'utilisateur avec haute précision
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  const userLat = position.coords.latitude;
                                  const userLng = position.coords.longitude;
                                  const accuracy = position.coords.accuracy; // Précision en mètres
                                  
                                  console.log("Position GPS:", { userLat, userLng, accuracy });
                                  
                                  // Utiliser Google Maps pour l'itinéraire (meilleure précision et détails)
                                  // Format: saddr=lat1,lng1&daddr=lat2,lng2
                                  const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${selectedParcelle.latitude},${selectedParcelle.longitude}`;
                                  window.open(googleMapsUrl, "_blank");
                                },
                                (error) => {
                                  // Si l'utilisateur refuse ou erreur, proposer Google Maps sans point de départ
                                  console.error("Erreur de géolocalisation:", error);
                                  let errorMsg = "Impossible d'obtenir votre position. ";
                                  switch(error.code) {
                                    case error.PERMISSION_DENIED:
                                      errorMsg += "Veuillez autoriser l'accès à votre position dans les paramètres du navigateur.";
                                      break;
                                    case error.POSITION_UNAVAILABLE:
                                      errorMsg += "Votre position n'est pas disponible.";
                                      break;
                                    case error.TIMEOUT:
                                      errorMsg += "La demande de position a expiré.";
                                      break;
                                    default:
                                      errorMsg += "Une erreur est survenue lors de la récupération de votre position.";
                                      break;
                                  }
                                  alert(errorMsg);
                                  // Ouvrir Google Maps avec seulement la destination
                                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedParcelle.latitude},${selectedParcelle.longitude}`;
                                  window.open(googleMapsUrl, "_blank");
                                },
                                {
                                  enableHighAccuracy: true, // Utiliser GPS si disponible
                                  timeout: 15000, // Augmenter le timeout
                                  maximumAge: 0 // Ne pas utiliser de position en cache
                                }
                              );
                            } catch (error) {
                              console.error("Erreur:", error);
                              // Fallback: ouvrir Google Maps avec seulement la destination
                              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedParcelle.latitude},${selectedParcelle.longitude}`;
                              window.open(googleMapsUrl, "_blank");
                            }
                          }}
                          sx={{
                            borderColor: "rgba(255, 255, 255, 0.8)",
                            color: "white",
                            fontWeight: "bold",
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: "none",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.1)",
                              borderColor: "white"
                            },
                            transition: "all 0.3s ease"
                          }}
                        >
                          Itinéraire depuis ma position
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}>
                        Coordonnées GPS non disponibles
                      </Typography>
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<LocationOn />}
                        onClick={() => {
                          const searchUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${selectedParcelle.ville} Îlot ${selectedParcelle.ilot}, Parcelle ${selectedParcelle.ref}`)}`;
                          window.open(searchUrl, "_blank");
                        }}
                        sx={{
                          borderColor: "rgba(255, 255, 255, 0.8)",
                          color: "white",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.1)",
                            borderColor: "white"
                          }
                        }}
                      >
                        Rechercher sur Google Maps
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Documents et vidéos */}
              {(selectedParcelle.documents && selectedParcelle.documents.length > 0) || 
               (selectedParcelle.videos && selectedParcelle.videos.length > 0) ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📄 Documents et médias
                    </Typography>
                    
                    {/* Section Vidéos */}
                    {selectedParcelle.videos && selectedParcelle.videos.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          🎥 Vidéos ({selectedParcelle.videos.length})
                        </Typography>
                        <Stack spacing={2}>
                          {selectedParcelle.videos.map((videoUrl, idx) => {
                            const embedUrl = getVideoEmbedUrl(videoUrl);
                            return (
                              <Box key={idx} sx={{ mb: 2 }}>
                                {embedUrl && embedUrl.startsWith('http') ? (
                                  <Box
                                    sx={{
                                      position: "relative",
                                      width: "100%",
                                      paddingTop: "56.25%", // 16:9 aspect ratio
                                      borderRadius: 2,
                                      overflow: "hidden",
                                      bgcolor: "#000",
                                      mb: 1,
                                    }}
                                  >
                                    <iframe
                                      src={embedUrl}
                                      title={`Vidéo ${idx + 1}`}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        border: "none",
                                      }}
                                    />
                                  </Box>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    component="a"
                                    href={videoUrl}
                                    target="_blank"
                                    startIcon={<VideoLibrary />}
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                  >
                                    Voir la vidéo {idx + 1}
                                  </Button>
                                )}
                              </Box>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}

                    {/* Section Documents */}
                    {selectedParcelle.documents && selectedParcelle.documents.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          📎 Documents ({selectedParcelle.documents.length})
                        </Typography>
                        <Stack spacing={1.5}>
                          {selectedParcelle.documents.map((docUrl, idx) => {
                            const fileName = getFileNameFromUrl(docUrl);
                            const fullUrl = fixImageUrl(docUrl);
                            return (
                              <Button
                                key={idx}
                                variant="outlined"
                                component="a"
                                href={fullUrl}
                                target="_blank"
                                download
                                startIcon={<Description />}
                                fullWidth
                                sx={{
                                  justifyContent: "flex-start",
                                  py: 1.5,
                                  textTransform: "none",
                                  textAlign: "left",
                                }}
                              >
                                <Box sx={{ flex: 1, textAlign: "left" }}>
                                  <Typography variant="body2" fontWeight="medium" noWrap>
                                    {fileName}
                                  </Typography>
                                </Box>
                              </Button>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ) : null}
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <Typography variant="h6" color="text.secondary">
                Aucune parcelle sélectionnée
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>
      )}

      {/* Drawer des banques partenaires - Moderne et Responsive */}
      <Drawer
        anchor="right"
        open={openBanqueDrawer}
        onClose={handleCloseBanqueDetails}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "85%", md: "70%", lg: "60%" },
            maxWidth: "1200px",
            background: "linear-gradient(135deg, #EBF5FB 0%, #D6EAF8 30%, #F0F9F4 60%, #ffffff 100%)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
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
              borderImage: "linear-gradient(90deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.3)) 1",
              flexShrink: 0,
            }}
          >
            <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }} flex={1}>
              <Box
                sx={{
                  width: { xs: 70, sm: 80, md: 90 },
                  height: { xs: 70, sm: 80, md: 90 },
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #27AE60, #1B5285)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 40px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(59, 130, 246, 0.2)",
                  border: "3px solid rgba(255, 255, 255, 0.5)",
                  flexShrink: 0,
                }}
              >
                <AccountBalance sx={{ color: "white", fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } }} />
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
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
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
                      📋 À propos
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
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)",
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
                      💼 Produits et Services
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
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)",
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
                      ✨ Avantages
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
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
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
                        📞 Contact
                      </Typography>
                      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                        {selectedBanque.contact.telephone && (
                          <Grid item xs={12} sm={4}>
                            <Box
                              sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: { xs: 2, sm: 2.5 },
                                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)",
                                backdropFilter: "blur(10px)",
                                border: "2px solid rgba(59, 130, 246, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1.5, sm: 2 },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                "&:hover": {
                                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(255, 255, 255, 0.95) 100%)",
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
                                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
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
                                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)",
                                backdropFilter: "blur(10px)",
                                border: "2px solid rgba(16, 185, 129, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1.5, sm: 2 },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                "&:hover": {
                                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(255, 255, 255, 0.95) 100%)",
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
                                  background: "linear-gradient(135deg, #10b981, #059669)",
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
                                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)",
                                backdropFilter: "blur(10px)",
                                border: "2px solid rgba(139, 92, 246, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1.5, sm: 2 },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                "&:hover": {
                                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(255, 255, 255, 0.95) 100%)",
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
                                  background: "linear-gradient(135deg, #1B5285, #0D2B4E)",
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
                        📍 Adresse et Localisation
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
