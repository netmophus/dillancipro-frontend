import React, { useState, useEffect } from "react";
import api from "../../services/api";
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
  Dashboard,
  Notifications,
  Person,
  Call,
  WhatsApp,
  ContentCopy,
  VideoLibrary,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";

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
  const parcellesPerAgence = 6; // Nombre de parcelles à afficher par agence sur la homepage
  const [carouselIndices, setCarouselIndices] = useState({}); // Indices de carrousel pour chaque agence
  const [homepageNotaires, setHomepageNotaires] = useState([]);
  const [loadingHomepageNotaires, setLoadingHomepageNotaires] = useState(false);
  
  // Pagination simple pour les agences partenaires (afficher par tranches de 6)
  const [agencesVisibleCount, setAgencesVisibleCount] = useState(6);
  
  // État pour le carrousel des biens immobiliers
  const [biensCarouselIndex, setBiensCarouselIndex] = useState(0);
  
  // État pour le carrousel des parcelles
  const [parcellesCarouselIndex, setParcellesCarouselIndex] = useState(0);
  
  // État pour le carrousel des locations
  const [locationsCarouselIndex, setLocationsCarouselIndex] = useState(0);
  
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

  // Fonction pour générer l'URL d'une image statique Google Maps
  const getGoogleMapsStaticImage = (latitude, longitude, width = 400, height = 300, zoom = 15) => {
    if (!latitude || !longitude) return null;
    
    // Utiliser l'API Google Maps Static pour générer une image
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
    
    if (apiKey) {
      // Avec clé API : meilleure qualité et plus de fonctionnalités
      return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
    } else {
      // Sans clé API : Google Maps peut fonctionner mais avec limitations
      // Note: Google Maps Static API nécessite généralement une clé API
      // Alternative: utiliser OpenStreetMap via un service de tuiles
      return `https://tile.openstreetmap.org/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=${latitude},${longitude}`;
    }
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
          ["#667eea", "#764ba2"],
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
          ["#667eea", "#764ba2"],
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
          gradient: [
            ["#11998e", "#38ef7d"],
            ["#e94057", "#f27121"],
            ["#8e2de2", "#4a00e0"],
            ["#667eea", "#764ba2"],
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
      
      setHomepageBiens(transformedBiens);
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
      
      const transformed = parcelles.map((p, index) => ({
        id: p._id,
        ref: p.numeroParcelle || `P-${p._id.slice(-6)}`,
        ilot: p.ilot?.numeroIlot || "N/A",
        superficie: p.superficie || 0,
        prix: p.prix || 0,
        description: p.description || "",
        statut: p.statut || "avendre",
        ville: p.ilot?.ville || p.agenceId?.ville || "Niamey",
        agenceNom: p.agenceId?.nom || "",
        agenceId: p.agenceId?._id || null,
        agenceTelephone: p.agenceId?.telephone || "",
        agenceVille: p.agenceId?.ville || "",
        images: p.images || [],
        videos: p.videos || [],
        documents: p.documents || [],
        localisation: p.localisation || {},
        latitude: p.localisation?.lat || p.localisation?.latitude || null,
        longitude: p.localisation?.lng || p.localisation?.longitude || null,
      }));
      
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


  

  const banquesPartenaires = [
    { nom: "BOA Niger", services: "Financement immobilier" },
    { nom: "BIA Niger", services: "Prêts fonciers" },
    { nom: "Ecobank", services: "Crédit habitat" },
    { nom: "SONIBANK", services: "Financement terrain" },
  ];

  const parcellesVedettes = [
    { ref: "P-001", ville: "Niamey", superficie: 500, prix: 15000000, ilot: "A12" },
    { ref: "P-045", ville: "Maradi", superficie: 750, prix: 8500000, ilot: "B08" },
    { ref: "P-128", ville: "Zinder", superficie: 400, prix: 6000000, ilot: "C05" },
    { ref: "P-234", ville: "Tahoua", superficie: 600, prix: 7200000, ilot: "D14" },
  ];

  const biensVedettes = [
    { titre: "Villa moderne 4 chambres", ville: "Niamey", type: "Villa", prix: 45000000, superficie: 250 },
    { titre: "Appartement standing", ville: "Maradi", type: "Appartement", prix: 28000000, superficie: 120 },
    { titre: "Maison familiale", ville: "Zinder", type: "Maison", prix: 35000000, superficie: 200 },
  ];

  const features = [
    {
      icon: <Security fontSize="large" />,
      title: "Sécurité garantie",
      description: "Vérification de tous les biens et transactions sécurisées",
      color: "#4caf50",
    },
    {
      icon: <LocationOn fontSize="large" />,
      title: "Géolocalisation",
      description: "Tous les biens sont géolocalisés avec précision sur carte",
      color: "#2196f3",
    },
    {
      icon: <Speed fontSize="large" />,
      title: "Processus rapide",
      description: "Inscription et mise en vente en quelques minutes",
      color: "#ff9800",
    },
    {
      icon: <Groups fontSize="large" />,
      title: "Multi-acteurs",
      description: "Agences, banques, état et particuliers réunis",
      color: "#9c27b0",
    },
  ];

  // Fonction helper pour rendre une carte de parcelle (sans Grid pour le carrousel)
  const renderParcelleCard = (parcelle, index, inCarousel = false) => {
    const cardContent = (
      <Card
        elevation={3}
        sx={{
          height: "100%",
          transition: "all 0.3s",
          display: "flex",
          flexDirection: "column",
          "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
        }}
      >
        <Box
          sx={{
            height: { xs: 120, sm: 140, md: 160 },
            position: "relative",
            overflow: "hidden",
            bgcolor: "#e3f2fd",
          }}
        >
          {(parcelle.latitude && parcelle.longitude) ? (
            <>
              <Box
                component="img"
                src={getGoogleMapsStaticImage(parcelle.latitude, parcelle.longitude, 400, 140)}
                alt=""
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  cursor: "pointer",
                  filter: "brightness(0.9)",
                  bgcolor: "#e3f2fd",
                }}
                onClick={() => {
                  const googleMapsUrl = `https://www.google.com/maps?q=${parcelle.latitude},${parcelle.longitude}`;
                  window.open(googleMapsUrl, "_blank");
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      borderRadius: "50%",
                      bgcolor: "rgba(25, 118, 210, 0.3)",
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%": {
                          transform: "scale(1)",
                          opacity: 1,
                        },
                        "100%": {
                          transform: "scale(1.5)",
                          opacity: 0,
                        },
                      },
                    }}
                  />
                  <LocationOn
                    sx={{
                      color: "primary.main",
                      fontSize: { xs: 24, sm: 32 },
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      zIndex: 2,
                      position: "relative",
                    }}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: 6, sm: 8 },
                  right: { xs: 6, sm: 8 },
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "50%",
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  "&:hover": {
                    bgcolor: "white",
                    transform: "scale(1.15)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const googleMapsUrl = `https://www.google.com/maps?q=${parcelle.latitude},${parcelle.longitude}`;
                  window.open(googleMapsUrl, "_blank");
                }}
              >
                <LocationOn sx={{ color: "primary.main", fontSize: { xs: 18, sm: 22 } }} />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                height: "100%",
                background: parcelle.images && parcelle.images.length > 0
                  ? `url(${fixImageUrl(parcelle.images[0])}) center/cover`
                  : `linear-gradient(135deg, ${["#667eea", "#f093fb", "#4facfe", "#43e97b"][index % 4]} 0%, ${["#764ba2", "#f5576c", "#00f2fe", "#38f9d7"][index % 4]} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                "&::after": parcelle.images && parcelle.images.length > 0
                  ? {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0, 0, 0, 0.3)",
                    }
                  : {},
              }}
            >
              <Landscape sx={{ fontSize: { xs: 60, sm: 80 }, color: "white", opacity: 0.8, zIndex: 1 }} />
            </Box>
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: { xs: 1.5, sm: 2 } }}>
          <Chip
            label={`Îlot ${parcelle.ilot}`}
            size="small"
            color="primary"
            sx={{ 
              mb: 1,
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              height: { xs: 20, sm: 24 },
            }}
          />
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            gutterBottom
            sx={{
              fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
            }}
          >
            {parcelle.ref}
          </Typography>
          {parcelle.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 1, sm: 1.5 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {parcelle.description.length > 50 
                ? `${parcelle.description.substring(0, 50)}...` 
                : parcelle.description}
            </Typography>
          )}
          <Stack spacing={{ xs: 0.75, sm: 1 }} mb={{ xs: 1.5, sm: 2 }} sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn fontSize="small" color="action" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {parcelle.ville}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Home fontSize="small" color="action" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {parcelle.superficie} m²
              </Typography>
            </Box>
            {parcelle.agenceNom && (
              <Box display="flex" alignItems="center" gap={1}>
                <Business fontSize="small" color="action" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {parcelle.agenceNom}
                </Typography>
              </Box>
            )}
          </Stack>
          <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />
          <Typography 
            variant="h6" 
            color="primary" 
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
            }}
          >
            {parcelle.prix > 0 ? formatMoney(parcelle.prix) : "Prix sur demande"}
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mt: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              py: { xs: 0.75, sm: 1 },
            }}
            endIcon={<KeyboardArrowRight />}
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

  // Fonctions de navigation du carrousel des locations
  const handleLocationCarouselPrev = () => {
    setLocationsCarouselIndex((prev) => Math.max(0, prev - 3));
  };

  const handleLocationCarouselNext = () => {
    setLocationsCarouselIndex((prev) => Math.min(homepageLocations.length - 3, prev + 3));
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

  return (
    <PageLayout>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            px: { xs: 1, sm: 3, md: 4 },
          }}
        >
          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid
              item
              xs={12}
              md={6}
              sx={{ textAlign: { xs: "center", md: "left" } }}
            >
              <Chip
                label="🆕 Plateforme Officielle"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  mb: 2,
                  mx: { xs: "auto", md: 0 },
                  display: "inline-flex",
                  fontSize: { xs: "clamp(0.7rem, 2.2vw, 0.85rem)", sm: "0.9rem" },
                  px: { xs: 1.1, sm: 2 },
                  py: { xs: 0.35, sm: 0.75 },
                  borderRadius: 2.5,
                  letterSpacing: 0.4,
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: {
                    xs: "clamp(1.6rem, 6.5vw, 2.3rem)",
                    sm: "clamp(2.2rem, 5.5vw, 3rem)",
                    md: "clamp(2.8rem, 4vw, 3.6rem)",
                  },
                  lineHeight: { xs: 1.15, md: 1.2 },
                  letterSpacing: { xs: 0.5, md: 1 },
                }}
              >
                DillanciPro
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  opacity: 0.9,
                  fontSize: {
                    xs: "clamp(0.95rem, 4.2vw, 1.25rem)",
                    md: "clamp(1.35rem, 2.6vw, 1.6rem)",
                  },
                  lineHeight: { xs: 1.35, md: 1.4 },
                }}
              >
                La plateforme de référence pour la gestion foncière et immobilière au Niger
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  opacity: 0.8,
                  fontSize: {
                    xs: "clamp(0.85rem, 3.2vw, 1rem)",
                    md: "clamp(1.1rem, 2vw, 1.25rem)",
                  },
                  fontStyle: "italic",
                  lineHeight: { xs: 1.4, md: 1.5 },
                }}
              >
                Manhajar dillancin gidaje mai sauƙi da sauri
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  fontSize: {
                    xs: "clamp(0.85rem, 3.4vw, 1rem)",
                    md: "clamp(1.05rem, 2vw, 1.15rem)",
                  },
                  opacity: 0.85,
                  maxWidth: { xs: "100%", md: 520 },
                  mx: { xs: "auto", md: 0 },
                  lineHeight: { xs: 1.6, md: 1.7 },
                }}
              >
                Connectez agences immobilières, banques partenaires, gestion du patrimoine de l'État et particuliers
                sur une seule plateforme sécurisée et géolocalisée.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  alignItems: { xs: "stretch", sm: "center" },
                  justifyContent: { sm: "flex-start" },
                  gap: { xs: 1.5, sm: 2 },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    fontWeight: "bold",
                    px: { xs: 2.4, md: 4 },
                    py: { xs: 1.2, md: 1.5 },
                    width: { xs: "100%", sm: "auto" },
                    fontSize: {
                    xs: "clamp(0.75rem, 2.6vw, 0.9rem)",
                      md: "clamp(1rem, 1.8vw, 1.08rem)",
                    },
                    "&:hover": { bgcolor: "grey.100" },
                    "& .MuiButton-endIcon": {
                      ml: { xs: 0.5, md: 1 },
                    },
                    whiteSpace: { xs: "normal", sm: "nowrap" },
                  }}
                  endIcon={<AppRegistration />}
                >
                  S'inscrire gratuitement
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    fontWeight: "bold",
                    px: { xs: 2.4, md: 4 },
                    py: { xs: 1.2, md: 1.5 },
                    width: { xs: "100%", sm: "auto" },
                    fontSize: {
                    xs: "clamp(0.75rem, 2.6vw, 0.9rem)",
                      md: "clamp(1rem, 1.8vw, 1.08rem)",
                    },
                    "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                    "& .MuiButton-endIcon": {
                      ml: { xs: 0.5, md: 1 },
                    },
                    whiteSpace: { xs: "normal", sm: "nowrap" },
                  }}
                  endIcon={<Login />}
                >
                  Se connecter
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={10}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                        sx={{
                          fontSize: { xs: "clamp(1.6rem, 6vw, 2.3rem)", md: "2.6rem" },
                        }}
                      >
                        {stats.agences}+
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                          letterSpacing: 0.4,
                        }}
                      >
                        Agences
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="success.main"
                        sx={{
                          fontSize: { xs: "clamp(1.6rem, 6vw, 2.3rem)", md: "2.6rem" },
                        }}
                      >
                        {stats.parcelles}+
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                          letterSpacing: 0.4,
                        }}
                      >
                        Parcelles
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="warning.main"
                        sx={{
                          fontSize: { xs: "clamp(1.6rem, 6vw, 2.3rem)", md: "2.6rem" },
                        }}
                      >
                        {stats.biens}+
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                          letterSpacing: 0.4,
                        }}
                      >
                        Biens
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="error.main"
                        sx={{
                          fontSize: { xs: "clamp(1.6rem, 6vw, 2.3rem)", md: "2.6rem" },
                        }}
                      >
                        {stats.clients}+
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                          letterSpacing: 0.4,
                        }}
                      >
                        Clients
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Forme décorative */}
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: 0,
            right: 0,
            height: 100,
            background: "white",
            clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)",
          }}
        />
      </Box>

      {/* Features Section */}
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
          sx={{
            fontSize: {
              xs: "clamp(1.6rem, 7vw, 2.2rem)",
              md: "clamp(2.2rem, 4vw, 2.6rem)",
            },
            mb: { xs: 2.5, md: 3 },
          }}
        >
          🌟 Pourquoi choisir DillanciPro ?
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{
            mb: { xs: 4, md: 6 },
            maxWidth: 720,
            mx: "auto",
            fontSize: {
              xs: "clamp(0.9rem, 3.4vw, 1.05rem)",
              md: "clamp(1.05rem, 2.4vw, 1.15rem)",
            },
            lineHeight: { xs: 1.5, md: 1.65 },
            px: { xs: 1, md: 0 },
          }}
        >
          Une plateforme tout-en-un pour simplifier et sécuriser toutes vos transactions foncières et immobilières
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: { xs: 3, md: 4 },
            maxWidth: 1024,
            mx: "auto",
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              elevation={3}
              sx={{
                minHeight: { xs: 220, md: 260 },
                textAlign: "center",
                transition: "all 0.3s",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: { xs: 2, md: 4 },
                mb: { xs: 2.5, sm: 0 },
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3, md: 3.5 },
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: { xs: 1.5, md: 2 },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: feature.color,
                    width: { xs: 58, md: 68 },
                    height: { xs: 58, md: 68 },
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    fontSize: {
                      xs: "clamp(1rem, 3.8vw, 1.15rem)",
                      md: "clamp(1.1rem, 2.2vw, 1.3rem)",
                    },
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: {
                      xs: "clamp(0.85rem, 3.2vw, 0.98rem)",
                      md: "clamp(0.95rem, 1.9vw, 1.05rem)",
                    },
                    lineHeight: { xs: 1.5, md: 1.65 },
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

     

   {/* Agences Partenaires Section */}
      <Box sx={{ bgcolor: "grey.50", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            mb={{ xs: 3, md: 4 }}
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: {
                    xs: "clamp(1.6rem, 7vw, 2.2rem)",
                    md: "clamp(2.1rem, 4vw, 2.6rem)",
                  },
                  lineHeight: { xs: 1.2, md: 1.25 },
                }}
              >
                🏢 Agences Immobilières Partenaires
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: {
                    xs: "clamp(0.9rem, 3.3vw, 1.05rem)",
                    md: "clamp(1.05rem, 2.2vw, 1.15rem)",
                  },
                  lineHeight: { xs: 1.55, md: 1.6 },
                  maxWidth: 520,
                }}
              >
                Des professionnels certifiés à votre service
              </Typography>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => setOpenPartenaireDialog(true)}
              sx={{
                alignSelf: { xs: "stretch", md: "center" },
                display: "inline-flex",
                justifyContent: "center",
                fontWeight: "bold",
                px: { xs: 2.5, md: 3.5 },
                py: { xs: 1.1, md: 1.2 },
                fontSize: {
                  xs: "clamp(0.85rem, 3vw, 0.95rem)",
                  md: "clamp(0.95rem, 2vw, 1.05rem)",
                },
              }}
            >
              Devenir partenaire
            </Button>
          </Box>

          <Grid
            container
            spacing={{ xs: 2.5, md: 3 }}
            sx={{
              alignItems: "stretch",
            }}
          >
            {loadingHomepageAgences ? (
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 160 }}>
                  <CircularProgress size={48} />
                  <Typography variant="body1" sx={{ ml: 2 }}>Chargement des agences…</Typography>
                </Box>
              </Grid>
            ) : homepageAgences.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">Aucune agence trouvée pour le moment.</Alert>
              </Grid>
            ) : (
              homepageAgences.slice(0, agencesVisibleCount).map((agence, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={agence.id || index}
                  sx={{ display: "flex" }}
                >
                  <Card
                    elevation={3}
                    sx={{
                      height: "100%",
                      width: "100%",
                      maxWidth: "100%",
                      mb: { xs: 3, sm: 0 },
                      transition: "all 0.3s",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      boxShadow: { xs: 2, md: 4 },
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        p: { xs: 2.5, md: 3 },
                        gap: { xs: 2, md: 2.5 },
                        overflow: "hidden",
                        minWidth: 0,
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
                            bgcolor: "primary.main", 
                            width: { xs: 50, md: 56 }, 
                            height: { xs: 50, md: 56 },
                            boxShadow: 2
                          }}
                        >
                          <Business />
                        </Avatar>
                        <Box flex={1} minWidth={0}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                            noWrap
                            sx={{
                              fontSize: {
                                xs: "clamp(1rem, 3.2vw, 1.2rem)",
                                md: "clamp(1.1rem, 2.2vw, 1.3rem)",
                              },
                            }}
                          >
                            {agence.nom}
                          </Typography>
                          {agence.statutJuridique && (
                            <Chip 
                              label={agence.statutJuridique} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                              sx={{
                                mb: 0.5,
                                fontSize: {
                                  xs: "0.68rem",
                                  md: "0.72rem",
                                },
                              }}
                            />
                          )}
                          {agence.statut && (
                            <Chip 
                              label={agence.statut === "actif" ? "✅ Actif" : agence.statut === "en_attente" ? "⏳ En attente" : agence.statut}
                              size="small"
                              color={agence.statut === "actif" ? "success" : agence.statut === "en_attente" ? "warning" : "default"}
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

                      <Divider sx={{ my: 1.5 }} />

                      {/* Informations principales */}
                      <Box flex={1}>
                        {agence.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: { xs: 1.5, md: 2 }, 
                              lineHeight: { xs: 1.45, md: 1.55 },
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
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
                                color="text.primary"
                                fontWeight="medium"
                                sx={{
                                  fontSize: {
                                    xs: "clamp(0.88rem, 3vw, 0.95rem)",
                                    md: "clamp(0.95rem, 2vw, 1.05rem)",
                                  },
                                }}
                              >
                                {agence.adresse && agence.adresse !== "-" ? agence.adresse : ""}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: {
                                    xs: "0.7rem",
                                    md: "0.75rem",
                                  },
                                }}
                              >
                                {agence.ville} {agence.pays && agence.pays !== "-" ? `, ${agence.pays}` : ""}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Boîte postale */}
                        {agence.bp && agence.bp !== "-" && (
                          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                            <Typography variant="body2" color="text.secondary">
                              📮
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {agence.bp}
                            </Typography>
                          </Box>
                        )}

                        {/* Promoteur */}
                        {agence.promoteur && agence.promoteur !== "-" && (
                          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                            <Typography variant="body2" color="text.secondary">
                              👤
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {agence.promoteur}
                            </Typography>
                          </Box>
                        )}

                        {/* Contact */}
                        <Divider sx={{ my: 1.5 }} />
                        <Box>
                          {agence.telephone && agence.telephone !== "-" && (
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="body2" color="text.secondary">
                                📞
                              </Typography>
                              <Typography variant="body2" color="text.primary" fontWeight="medium">
                                {agence.telephone}
                              </Typography>
                            </Box>
                          )}
                          {agence.email && agence.email !== "-" && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" color="text.secondary">
                                ✉️
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="primary.main" 
                                sx={{ 
                                  wordBreak: "break-word",
                                  textDecoration: "none",
                                  "&:hover": {
                                    textDecoration: "underline"
                                  }
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
              ))
            )}
          </Grid>

          {/* Bouton Voir plus */}
          {!loadingHomepageAgences && homepageAgences.length > agencesVisibleCount && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setAgencesVisibleCount((v) => Math.min(v + 6, homepageAgences.length))}
              >
                Voir plus
              </Button>
            </Box>
          )}

          <Box textAlign="center" mt={4}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate("/register")}
            >
              Voir toutes les agences
            </Button>
          </Box>
        </Container>
      </Box>
















      {/* Banques Partenaires Section */}
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
          sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
        >
          🏦 Banques Partenaires
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{
            mb: { xs: 4, md: 6 },
            maxWidth: 640,
            mx: "auto",
            fontSize: { xs: "0.95rem", md: "1.05rem" },
          }}
        >
          Financez votre projet immobilier avec nos partenaires financiers
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 4,
            maxWidth: 1000,
            mx: "auto",
          }}
        >
          {banquesPartenaires.map((banque, index) => (
            <Card
              key={index}
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                height: 280,
                borderRadius: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: 4,
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: 8,
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3, md: 4 },
                  flex: 1,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "success.main",
                    width: { xs: 64, md: 70 },
                    height: { xs: 64, md: 70 },
                    mb: 1,
                  }}
              >
                  <AccountBalance sx={{ color: "white", fontSize: 32 }} />
                </Avatar>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
                >
                  {banque.nom}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.95rem", md: "1rem" },
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  {banque.services}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Notaires Partenaires Section */}
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
          sx={{
            fontSize: {
              xs: "clamp(1.6rem, 6.8vw, 2.2rem)",
              md: "clamp(2.2rem, 4vw, 2.6rem)",
            },
            mb: { xs: 2.5, md: 3 },
          }}
        >
          ⚖️ Notaires Partenaires
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{
            mb: { xs: 4.5, md: 6 },
            fontSize: {
              xs: "clamp(0.92rem, 3.4vw, 1.05rem)",
              md: "clamp(1.05rem, 2.3vw, 1.15rem)",
            },
            lineHeight: { xs: 1.55, md: 1.65 },
            maxWidth: 720,
            mx: "auto",
          }}
        >
          Faites confiance à nos notaires partenaires pour vos transactions immobilières
        </Typography>

        <Grid
          container
          spacing={{ xs: 6, md: 4, lg: 4.5 }}
          sx={{
            alignItems: "stretch",
          }}
        >
          {loadingHomepageNotaires ? (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                <CircularProgress size={48} />
                <Typography variant="body1" sx={{ ml: 2 }}>Chargement des notaires…</Typography>
              </Box>
            </Grid>
          ) : homepageNotaires.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">Aucun notaire partenaire disponible pour le moment.</Alert>
            </Grid>
          ) : (
            homepageNotaires.map((notaire, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={notaire._id || index}
                sx={{
                  display: "flex",
                }}
              >
                <Card
                  elevation={3}
                  sx={{
                    textAlign: "center",
                    p: { xs: 2.5, md: 3 },
                    height: "100%",
                    transition: "all 0.3s",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: { xs: 2, md: 4 },
                    mb: { xs: 6, sm: 0 },
                    "&:hover": {
                      transform: {
                        xs: "none",
                        sm: "translateY(-6px)",
                        md: "scale(1.05)",
                      },
                      boxShadow: 6,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: { xs: 60, md: 70 },
                      height: { xs: 60, md: 70 },
                      mx: "auto",
                      mb: 2,
                      fontSize: { xs: "1.8rem", md: "2rem" },
                    }}
                  >
                    ⚖️
                  </Avatar>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      fontSize: {
                        xs: "clamp(1rem, 3.4vw, 1.2rem)",
                        md: "clamp(1.1rem, 2.2vw, 1.3rem)",
                      },
                    }}
                  >
                    {notaire.fullName || "Notaire"}
                  </Typography>
                  {notaire.cabinetName && (
                    <Typography
                      variant="body2"
                      color="primary.main"
                      fontWeight="500"
                      gutterBottom
                      sx={{
                        fontSize: {
                          xs: "clamp(0.88rem, 3vw, 0.98rem)",
                          md: "1rem",
                        },
                      }}
                    >
                      {notaire.cabinetName}
                    </Typography>
                  )}
                  <Stack
                    spacing={1}
                    mt={2}
                    sx={{ flexGrow: 1 }}
                  >
                    {notaire.ville && (
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: {
                              xs: "0.9rem",
                              md: "1rem",
                            },
                          }}
                        >
                          {notaire.ville}
                          {notaire.quartier && `, ${notaire.quartier}`}
                        </Typography>
                      </Box>
                    )}
                    {notaire.phone && (
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {notaire.phone}
                        </Typography>
                      </Box>
                    )}
                    {notaire.email && (
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Email fontSize="small" color="action" />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: {
                              xs: "0.72rem",
                              md: "0.78rem",
                            },
                          }}
                        >
                          {notaire.email}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                  <Chip
                    label="Notaire Certifié"
                    color="success"
                    size="small"
                    sx={{
                      mt: 2,
                      fontSize: {
                        xs: "0.68rem",
                        md: "0.72rem",
                      },
                    }}
                  />
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* Parcelles à vendre Section */}
      <Box sx={{ bgcolor: "primary.light", py: { xs: 4, sm: 6, md: 8 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box mb={{ xs: 3, md: 4 }}>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
            >
              🏘️ Parcelles à vendre
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Découvrez notre sélection de terrains viabilisés
            </Typography>
          </Box>

          {/* Onglets pour filtrer par agence */}
          {agencesList.length > 0 && (
            <Box sx={{ mb: { xs: 3, md: 4 }, borderBottom: 1, borderColor: "divider", overflowX: "auto" }}>
              <Tabs
                value={selectedAgenceId}
                onChange={(e, newValue) => setSelectedAgenceId(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    minHeight: { xs: 56, sm: 64 },
                    px: { xs: 1.5, sm: 2, md: 3 },
                    fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                  },
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: { xs: 0.25, sm: 0.5 } }}>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        sx={{ 
                          fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                          textAlign: "center",
                          lineHeight: 1.2,
                        }}
                      >
                        Toutes les agences
                      </Typography>
                      <Chip
                        label={homepageParcelles.length}
                        size="small"
                        color="primary"
                        sx={{ 
                          height: { xs: 18, sm: 20 }, 
                          fontSize: { xs: "0.6rem", sm: "0.7rem" },
                          "& .MuiChip-label": {
                            px: { xs: 0.5, sm: 1 },
                          },
                        }}
                      />
                    </Box>
                  }
                  value="all"
                />
                {agencesList.map((agence) => (
                  <Tab
                    key={agence.id}
                    label={
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: { xs: 0.25, sm: 0.5 } }}>
                        <Typography 
                          variant="body1" 
                          fontWeight="bold" 
                          sx={{ 
                            textAlign: "center",
                            fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                            lineHeight: 1.2,
                            maxWidth: { xs: 80, sm: 120, md: "none" },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {agence.nom}
                        </Typography>
                        <Chip
                          label={`${agence.count} parcelle${agence.count > 1 ? "s" : ""}`}
                          size="small"
                          color="primary"
                          sx={{ 
                            height: { xs: 18, sm: 20 }, 
                            fontSize: { xs: "0.6rem", sm: "0.7rem" },
                            "& .MuiChip-label": {
                              px: { xs: 0.5, sm: 1 },
                            },
                          }}
                        />
                      </Box>
                    }
                    value={agence.id}
                  />
                ))}
              </Tabs>
            </Box>
          )}

          {/* Affichage des parcelles selon l'agence sélectionnée */}
          {loadingHomepageParcelles ? (
            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center", 
              alignItems: "center", 
              minHeight: 200,
              gap: { xs: 1, sm: 2 },
            }}>
              <CircularProgress size={{ xs: 40, sm: 48 }} />
              <Typography 
                variant="body1" 
                sx={{ 
                  ml: { xs: 0, sm: 2 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                Chargement des parcelles…
              </Typography>
            </Box>
          ) : (
            <>
              {/* Si "Toutes les agences" est sélectionné, afficher par sections d'agences */}
              {selectedAgenceId === "all" ? (
                agencesList.length > 0 ? (
                  agencesList.map((agence) => {
                    const parcellesAgence = parcellesByAgence[agence.id] || [];
                    const currentIndex = carouselIndices[agence.id] || 0;
                    // Calculer le nombre d'éléments visibles selon la taille d'écran
                    const itemsPerView = isMobile ? 1 : isDesktop ? 3 : 2; // xs: 1, sm: 2, md+: 3
                    const canScrollPrev = currentIndex > 0;
                    const canScrollNext = currentIndex < parcellesAgence.length - itemsPerView;

                    return (
                      <Box key={agence.id} sx={{ mb: { xs: 4, md: 6 } }}>
                        {/* En-tête de l'agence */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", sm: "center" },
                            mb: { xs: 2, md: 3 },
                            pb: { xs: 1.5, md: 2 },
                            borderBottom: 2,
                            borderColor: "primary.main",
                            gap: { xs: 1.5, sm: 0 },
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h5" 
                              fontWeight="bold" 
                              gutterBottom
                              sx={{
                                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              <Business sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" } }} />
                              {agence.nom}
                            </Typography>
                            {agence.ville && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  display: "flex",
                                  alignItems: "center",
                                  mt: { xs: 0.5, sm: 0 },
                                }}
                              >
                                <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                                {agence.ville}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            label={`${parcellesAgence.length} parcelle${parcellesAgence.length > 1 ? "s" : ""}`}
                            color="primary"
                            sx={{ 
                              fontWeight: "bold",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              height: { xs: 28, sm: 32 },
                            }}
                          />
                        </Box>

                        {/* Carrousel horizontal des parcelles de l'agence */}
                        <Box sx={{ position: "relative" }}>
                          {/* Bouton précédent */}
                          {parcellesAgence.length > 3 && canScrollPrev && (
                            <IconButton
                              onClick={() => handleAgenceCarouselPrev(agence.id, parcellesAgence.length)}
                              sx={{
                                position: "absolute",
                                left: { xs: -8, sm: -12 },
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 10,
                                bgcolor: "white",
                                boxShadow: 3,
                                "&:hover": {
                                  bgcolor: "primary.main",
                                  color: "white",
                                },
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                              }}
                            >
                              <ChevronLeft />
                            </IconButton>
                          )}

                          {/* Conteneur du carrousel avec barre de défilement */}
                          <Box
                            ref={(el) => {
                              // Synchroniser le scroll avec l'index lors des changements programmatiques
                              if (el && parcellesAgence.length > 0) {
                                const firstChild = el.querySelector('[data-parcelle-item]');
                                if (firstChild) {
                                  const itemWidth = firstChild.offsetWidth;
                                  const gap = isMobile ? 16 : isDesktop ? 24 : 24; // gap en px (2 * 8px = 16px pour xs, 3 * 8px = 24px pour sm/md)
                                  const targetScroll = currentIndex * (itemWidth + gap);
                                  
                                  // Utiliser requestAnimationFrame pour éviter les conflits avec le scroll manuel
                                  requestAnimationFrame(() => {
                                    if (Math.abs(el.scrollLeft - targetScroll) > 5) {
                                      el.scrollTo({
                                        left: targetScroll,
                                        behavior: "smooth",
                                      });
                                    }
                                  });
                                }
                              }
                            }}
                            sx={{
                              position: "relative",
                              overflowX: "auto",
                              overflowY: "hidden",
                              mx: { xs: 0, sm: 4 },
                              scrollBehavior: "smooth",
                              // Style personnalisé pour la barre de défilement
                              "&::-webkit-scrollbar": {
                                height: { xs: 8, sm: 10 },
                              },
                              "&::-webkit-scrollbar-track": {
                                background: "rgba(0, 0, 0, 0.05)",
                                borderRadius: 10,
                              },
                              "&::-webkit-scrollbar-thumb": {
                                background: (theme) => theme.palette.primary.main,
                                borderRadius: 10,
                                "&:hover": {
                                  background: (theme) => theme.palette.primary.dark,
                                },
                              },
                              // Pour Firefox
                              scrollbarWidth: "thin",
                              scrollbarColor: (theme) => `${theme.palette.primary.main} rgba(0, 0, 0, 0.05)`,
                              // Masquer la barre de défilement si tous les éléments sont visibles
                              ...(parcellesAgence.length <= itemsPerView && {
                                overflowX: "hidden",
                              }),
                            }}
                            onScroll={(e) => {
                              // Synchroniser l'index avec le scroll manuel
                              const scrollLeft = e.target.scrollLeft;
                              const firstChild = e.target.querySelector('[data-parcelle-item]');
                              
                              if (firstChild) {
                                const itemWidth = firstChild.offsetWidth;
                                const gap = isMobile ? 16 : 24; // gap en px
                                const newIndex = Math.round(scrollLeft / (itemWidth + gap));
                                
                                if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= parcellesAgence.length - itemsPerView) {
                                  setCarouselIndices((prev) => ({
                                    ...prev,
                                    [agence.id]: newIndex,
                                  }));
                                }
                              }
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                gap: { xs: 2, sm: 3 },
                                width: "max-content", // Permet le scroll horizontal
                                minWidth: "100%", // Assure que le conteneur prend au moins la largeur du parent
                              }}
                            >
                              {parcellesAgence.map((parcelle, index) => (
                                <Box
                                  key={parcelle.id || index}
                                  data-parcelle-item
                                  sx={{
                                    width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                                    minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                                    maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                                    flexShrink: 0,
                                  }}
                                >
                                  {renderParcelleCard(parcelle, index, true)}
                                </Box>
                              ))}
                            </Box>
                          </Box>

                          {/* Bouton suivant */}
                          {parcellesAgence.length > 3 && canScrollNext && (
                            <IconButton
                              onClick={() => handleAgenceCarouselNext(agence.id, parcellesAgence.length)}
                              sx={{
                                position: "absolute",
                                right: { xs: -8, sm: -12 },
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 10,
                                bgcolor: "white",
                                boxShadow: 3,
                                "&:hover": {
                                  bgcolor: "primary.main",
                                  color: "white",
                                },
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                              }}
                            >
                              <ChevronRight />
                            </IconButton>
                          )}
                        </Box>

                        {/* Bouton "Voir toutes les parcelles" */}
                        {parcellesAgence.length > 3 && (
                          <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 2, md: 3 } }}>
                            <Button
                              variant="contained"
                              size={isMobile ? "medium" : "large"}
                              endIcon={<ArrowForward />}
                              onClick={() => setSelectedAgenceId(agence.id)}
                              sx={{
                                px: { xs: 2, sm: 3, md: 4 },
                                py: { xs: 1, sm: 1.25, md: 1.5 },
                                fontWeight: "bold",
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                                whiteSpace: "nowrap",
                              }}
                            >
                              Voir toutes les parcelles ({parcellesAgence.length})
                            </Button>
                          </Box>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Alert severity="info">Aucune parcelle disponible pour le moment.</Alert>
                )
              ) : (
                /* Si une agence spécifique est sélectionnée, afficher toutes ses parcelles */
                (() => {
                  const parcellesAgence = parcellesByAgence[selectedAgenceId] || [];
                  const selectedAgence = agencesList.find((a) => a.id === selectedAgenceId);

                  return parcellesAgence.length > 0 ? (
                    <Box>
                      {/* En-tête de l'agence sélectionnée */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: "space-between",
                          alignItems: { xs: "flex-start", sm: "center" },
                          mb: { xs: 2, md: 3 },
                          pb: { xs: 1.5, md: 2 },
                          borderBottom: 2,
                          borderColor: "primary.main",
                          gap: { xs: 1.5, sm: 0 },
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h5" 
                            fontWeight="bold" 
                            gutterBottom
                            sx={{
                              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            <Business sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" } }} />
                            {selectedAgence?.nom || "Agence"}
                          </Typography>
                          {selectedAgence?.ville && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                display: "flex",
                                alignItems: "center",
                                mt: { xs: 0.5, sm: 0 },
                              }}
                            >
                              <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                              {selectedAgence.ville}
                            </Typography>
                          )}
                          {selectedAgence?.telephone && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mt: 0.5,
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Phone fontSize="small" sx={{ mr: 0.5 }} />
                              {selectedAgence.telephone}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={`${parcellesAgence.length} parcelle${parcellesAgence.length > 1 ? "s" : ""}`}
                          color="primary"
                          sx={{ 
                            fontWeight: "bold",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            height: { xs: 28, sm: 32 },
                          }}
                        />
                      </Box>

                      {/* Grille de toutes les parcelles de l'agence */}
                      <Grid container spacing={{ xs: 2, sm: 3 }}>
                        {parcellesAgence.map((parcelle, index) => renderParcelleCard(parcelle, index))}
                      </Grid>

                      {/* Bouton pour revenir à "Toutes les agences" */}
                      <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 3, md: 4 } }}>
                        <Button
                          variant="outlined"
                          size={isMobile ? "medium" : "large"}
                          startIcon={<ChevronLeft />}
                          onClick={() => setSelectedAgenceId("all")}
                          sx={{
                            px: { xs: 2, sm: 3, md: 4 },
                            py: { xs: 1, sm: 1.25, md: 1.5 },
                            fontWeight: "bold",
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          }}
                        >
                          Voir toutes les agences
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info">Aucune parcelle disponible pour cette agence.</Alert>
                  );
                })()
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Biens Immobiliers Section */}
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
          sx={{
            fontSize: {
              xs: "clamp(1.6rem, 6.5vw, 2.2rem)",
              md: "clamp(2.2rem, 4vw, 2.6rem)",
            },
            mb: { xs: 2.5, md: 3 },
          }}
        >
          🏠 Biens Immobiliers à vendre
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{
            mb: { xs: 4, md: 6 },
            fontSize: {
              xs: "clamp(0.92rem, 3.4vw, 1.05rem)",
              md: "clamp(1.05rem, 2.3vw, 1.15rem)",
            },
            lineHeight: { xs: 1.55, md: 1.65 },
            maxWidth: 720,
            mx: "auto",
          }}
        >
          Villas, appartements et maisons de qualité
        </Typography>

        {/* Carrousel des biens immobiliers */}
        <Box
          sx={{
            position: "relative",
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          {loadingHomepageBiens ? (
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              minHeight: 200 
            }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ ml: 2 }}>
                Chargement des biens immobiliers...
              </Typography>
            </Box>
          ) : homepageBiens.length > 0 ? (
            <>
              {/* Conteneur du carrousel avec overflow caché */}
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  mx: "auto",
                  maxWidth: "100%",
                }}
              >
                {/* Wrapper interne qui se déplace horizontalement */}
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 3.5, md: 3 },
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: {
                      xs: `translateX(-${biensCarouselIndex * 100}%)`,
                      sm: `translateX(-${biensCarouselIndex * 50}%)`,
                      md: `translateX(-${biensCarouselIndex * 33.333}%)`,
                    },
                    willChange: "transform",
                    pb: { xs: 1, md: 0 },
                  }}
                >
                  {homepageBiens.map((bien, index) => {
                    return (
                      <Card
                        key={bien.id || index}
                        elevation={8}
                        sx={{
                          minWidth: { xs: "calc(100% - 4px)", sm: "calc(50% - 18px)", md: "calc(33.333% - 20px)" },
                          maxWidth: { xs: "calc(100% - 4px)", sm: "calc(50% - 18px)", md: "calc(33.333% - 20px)" },
                          width: { xs: "calc(100% - 4px)", sm: "calc(50% - 18px)", md: "calc(33.333% - 20px)" },
                          height: { xs: "auto", md: 500 },
                          minHeight: { xs: 440, md: 500 },
                          transition: "transform 0.3s ease, box-shadow 0.3s ease",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: 3,
                          overflow: "hidden",
                          background: "white",
                          flexShrink: 0,
                          "&:hover": { 
                            transform: { xs: "none", md: "translateY(-8px)" }, 
                            boxShadow: { xs: "0 12px 30px rgba(0,0,0,0.12)", md: "0 20px 40px rgba(0,0,0,0.15)" } 
                          },
                        }}
                      >
                {/* Image du bien */}
                <Box
                  sx={{
                    height: { xs: 220, md: 250 },
                    background: `linear-gradient(135deg, ${bien.gradient[0]} 0%, ${bien.gradient[1]} 100%)`,
                    position: "relative",
                    overflow: "hidden"
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
                      "&:hover": { transform: "scale(1.05)" }
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: "rgba(255, 255, 255, 0.9)",
                      borderRadius: 2,
                      px: { xs: 1.5, md: 2 },
                      py: { xs: 0.8, md: 1 }
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold" color="primary.main">
                      {bien.type}
                    </Typography>
                  </Box>
                </Box>

                <CardContent
                  sx={{
                    p: { xs: 2.5, md: 3 },
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
                      lineHeight: 1.3,
                      mb: 2,
                      fontSize: {
                        xs: "clamp(1.05rem, 3.8vw, 1.25rem)",
                        md: "1.3rem",
                      },
                    }}
                  >
                    {bien.titre}
                  </Typography>

                  <Stack spacing={1.5} mb={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" color="primary" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.95rem", md: "1rem" },
                        }}
                      >
                        {bien.ville}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Home fontSize="small" color="primary" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.95rem", md: "1rem" },
                        }}
                      >
                        {bien.superficie} m²
                      </Typography>
                    </Box>
                    {bien.reference && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                          Réf: {bien.reference}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="h5"
                    color="primary"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      fontSize: {
                        xs: "clamp(1.3rem, 4vw, 1.6rem)",
                        md: "1.75rem",
                      },
                    }}
                  >
                    {formatMoney(bien.prix)}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForward />}
                    onClick={() => handleOpenBienDetails(bien)}
                    sx={{ 
                      mt: "auto",
                      py: { xs: 1.2, md: 1.5 },
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: "bold",
                      fontSize: {
                        xs: "clamp(0.9rem, 2.6vw, 1rem)",
                        md: "1rem",
                      },
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                        transform: { xs: "none", md: "translateY(-2px)" }
                      }
                    }}
                  >
                      Voir le bien
                    </Button>
                  </CardContent>
                    </Card>
                    );
                  })}
                </Box>
              </Box>

              {/* Boutons de navigation du carrousel */}
              {homepageBiens.length > 3 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: { xs: 1.5, md: 2 },
                    mt: { xs: 3.5, md: 4 },
                  }}
                >
                  <IconButton
                    onClick={handleBienCarouselPrev}
                    disabled={biensCarouselIndex === 0}
                    size="large"
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark", transform: { xs: "none", md: "scale(1.1)" } },
                      "&:disabled": { bgcolor: "grey.300", cursor: "not-allowed" },
                      transition: "all 0.3s",
                    }}
                  >
                    <ChevronLeft fontSize="large" />
                  </IconButton>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60, textAlign: "center" }}>
                    {Math.floor(biensCarouselIndex / 3) + 1} / {Math.ceil(homepageBiens.length / 3)}
                  </Typography>
                  
                  <IconButton
                    onClick={handleBienCarouselNext}
                    disabled={biensCarouselIndex >= homepageBiens.length - 3}
                    size="large"
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark", transform: { xs: "none", md: "scale(1.1)" } },
                      "&:disabled": { bgcolor: "grey.300", cursor: "not-allowed" },
                      transition: "all 0.3s",
                    }}
                  >
                    <ChevronRight fontSize="large" />
                  </IconButton>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              minHeight: 200 
            }}>
              <Typography variant="h6" color="text.secondary">
                Aucun bien immobilier disponible pour le moment
              </Typography>
            </Box>
          )}
        </Box>
      </Container>

      {/* Locations Proposées Section */}
      <Box sx={{ bgcolor: "grey.50", py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              🏠 Les locations proposées
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
              Trouvez votre prochain logement parmi nos offres de location premium
            </Typography>
          </Box>

          {/* Carrousel des locations */}
          <Box sx={{ position: "relative", maxWidth: 1200, mx: "auto" }}>
            {loadingHomepageLocations ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  Chargement des locations...
                </Typography>
              </Box>
            ) : homepageLocations.length > 0 ? (
              <>
                {/* Conteneur du carrousel avec overflow caché */}
                <Box
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    mx: "auto",
                    maxWidth: "100%",
                  }}
                >
                  {/* Wrapper interne qui se déplace horizontalement */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: {
                        xs: `translateX(-${locationsCarouselIndex * 100}%)`,
                        sm: `translateX(-${locationsCarouselIndex * 50}%)`,
                        md: `translateX(-${locationsCarouselIndex * 33.333}%)`,
                      },
                      willChange: "transform",
                    }}
                  >
                    {homepageLocations.map((location, index) => {
                      return (
                        <Card
                          key={location.id || index}
                          elevation={8}
                          sx={{
                            minWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                            maxWidth: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                            width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                            height: 760,
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: 4,
                            overflow: "hidden",
                            position: "relative",
                            flexShrink: 0,
                            "&:hover": {
                              transform: "translateY(-12px) scale(1.02)",
                              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                              "& .location-image": {
                                transform: "scale(1.05)"
                              }
                            },
                          }}
                        >
                {/* Image de la maison - Zone très agrandie */}
                <Box
                  sx={{
                    height: 560,
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
                      zIndex: 1
                    }
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
                      "&:hover": {
                        transform: "scale(1.05)"
                      }
                    }}
                  />
                  
                  {/* Badges en overlay */}
                  <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 3 }}>
                    <Chip
                      label={location.type}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: location.gradient[0],
                        fontWeight: "bold",
                        fontSize: "0.75rem"
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 3 }}>
                    <Chip
                      icon={location.meuble ? <CheckCircle /> : <Home />}
                      label={location.meuble ? "Meublé" : "Non meublé"}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: location.gradient[0],
                        fontWeight: "bold",
                        fontSize: "0.75rem"
                      }}
                    />
                  </Box>
                </Box>

                <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                    color: "text.primary",
                    lineHeight: 1.3,
                    mb: 1,
                    fontSize: "1.1rem"
                  }}>
                    {location.titre}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2,
                    lineHeight: 1.4,
                    minHeight: "2.6em",
                    fontSize: "0.85rem"
                  }}>
                    {location.description}
                  </Typography>

                  {/* Features */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {location.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: "0.7rem",
                            height: 24,
                            borderColor: location.gradient[0],
                            color: location.gradient[0],
                            "&:hover": {
                              bgcolor: `${location.gradient[0]}10`
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Stack spacing={1.2} mb={2}>
                    <Box display="flex" alignItems="center" gap={1.2}>
                      <LocationOn fontSize="small" sx={{ color: location.gradient[0] }} />
                      <Typography variant="body2" fontWeight="500" sx={{ fontSize: "0.8rem" }}>
                        {location.ville}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.2}>
                      <Home fontSize="small" sx={{ color: location.gradient[0] }} />
                      <Typography variant="body2" fontWeight="500" sx={{ fontSize: "0.8rem" }}>
                        {location.superficie} m² • {location.chambres} chambre{location.chambres > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.2}>
                      <CheckCircle fontSize="small" sx={{ color: "success.main" }} />
                      <Typography variant="body2" color="success.main" fontWeight="600" sx={{ fontSize: "0.8rem" }}>
                        Disponible : {location.disponibilite}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2, borderColor: "grey.200" }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight="bold" sx={{ 
                      color: location.gradient[0],
                      background: `linear-gradient(135deg, ${location.gradient[0]} 0%, ${location.gradient[1]} 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: "1.4rem"
                    }}>
                      {formatMoney(location.prix)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500" sx={{ fontSize: "0.8rem" }}>
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
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "0.9rem",
                      boxShadow: `0 4px 16px ${location.gradient[0]}30`,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 8px 24px ${location.gradient[0]}40`,
                        background: `linear-gradient(135deg, ${location.gradient[0]} 0%, ${location.gradient[1]} 100%)`,
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    Voir la location
                  </Button>
                </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                </Box>

                {/* Boutons de navigation du carrousel des locations */}
                {homepageLocations.length > 3 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 2,
                      mt: 4,
                    }}
                  >
                    <IconButton
                      onClick={handleLocationCarouselPrev}
                      disabled={locationsCarouselIndex === 0}
                      size="large"
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": { bgcolor: "primary.dark", transform: "scale(1.1)" },
                        "&:disabled": { bgcolor: "grey.300", cursor: "not-allowed" },
                        transition: "all 0.3s",
                      }}
                    >
                      <ChevronLeft fontSize="large" />
                    </IconButton>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60, textAlign: "center" }}>
                      {Math.floor(locationsCarouselIndex / 3) + 1} / {Math.ceil(homepageLocations.length / 3)}
                    </Typography>
                    
                    <IconButton
                      onClick={handleLocationCarouselNext}
                      disabled={locationsCarouselIndex >= homepageLocations.length - 3}
                      size="large"
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": { bgcolor: "primary.dark", transform: "scale(1.1)" },
                        "&:disabled": { bgcolor: "grey.300", cursor: "not-allowed" },
                        transition: "all 0.3s",
                      }}
                    >
                      <ChevronRight fontSize="large" />
                    </IconButton>
                  </Box>
                )}
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

      {/* Qui peut s'inscrire Section */}
      <Box 
        sx={{ 
          position: "relative",
          py: { xs: 6, md: 10 },
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.05) 0%, transparent 50%)",
            pointerEvents: "none",
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Chip 
              label="Acteurs du secteur" 
              color="primary" 
              sx={{ 
                mb: 2,
                px: 1,
                py: 0.5,
                fontSize: "0.875rem",
                fontWeight: "bold"
              }} 
            />
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                fontSize: { xs: "2rem", md: "2.75rem" },
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              👥 Qui peut rejoindre la plateforme ?
            </Typography>
            <Typography 
              variant="h6" 
              textAlign="center" 
              color="text.secondary" 
              sx={{ 
                mt: 2,
                maxWidth: 700,
                mx: "auto",
                fontWeight: 400,
                fontSize: { xs: "1rem", md: "1.125rem" }
              }}
            >
              DillanciPro est ouvert à tous les acteurs du secteur foncier et immobilier
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
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
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
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                    Créez votre agence, gérez vos commerciaux, vos parcelles et biens immobiliers. 
                    Système multi-agence avec séparation complète des données.
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Stack spacing={0.5} mt={0.75}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Gestion complète des parcelles
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Équipe de commerciaux
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Suivi des ventes et commissions
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
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
                    Accédez aux données foncières pour faciliter l'octroi de crédits immobiliers 
                    et sécuriser vos financements.
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Stack spacing={0.5} mt={0.75}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Vérification des biens
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Suivi des garanties
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Partenariat privilégié
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
                    Ministère / État
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
                    Gérez le patrimoine foncier de l'État, suivez les attributions et 
                    contrôlez l'aménagement du territoire.
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Stack spacing={0.5} mt={0.75}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Gestion du patrimoine national
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Statistiques en temps réel
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Supervision des transactions
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
                    Enregistrez votre patrimoine foncier, achetez des parcelles via les agences, 
                    et proposez vos biens à la vente.
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Stack spacing={0.5} mt={0.75}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Géolocalisation de vos biens
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Suivi des paiements
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ color: "success.main", fontSize: { xs: 20, md: 24 } }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", md: "1rem" } }}>
                    Proposer vos parcelles à la vente
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <Paper
          elevation={8}
          sx={{
            p: 6,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
            Prêt à commencer ?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Rejoignez la plateforme DillanciPro dès aujourd'hui et digitalisez votre activité
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                fontWeight: "bold",
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                "&:hover": { bgcolor: "grey.100" },
              }}
              endIcon={<AppRegistration />}
            >
              Créer mon compte
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                borderColor: "white",
                color: "white",
                fontWeight: "bold",
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
              endIcon={<Login />}
            >
              Se connecter
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* Dialogue Devenir Partenaire */}
      <Dialog
        open={openPartenaireDialog}
        onClose={() => setOpenPartenaireDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: "150px",
              height: "150px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              transform: "translate(50%, -50%)",
            }
          }
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1, position: "relative", zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 60, height: 60 }}>
              <Business fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                🏢 Devenir Partenaire
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Rejoignez notre réseau d'agences immobilières
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, lineHeight: 1.6 }}>
            Pour devenir partenaire de <strong>DillanciPro</strong>, 
            merci de nous contacter directement :
          </Typography> */}

          <Box sx={{ 
            bgcolor: "rgba(255,255,255,0.15)", 
            borderRadius: 3, 
            p: 3, 
            mb: 3,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
              📞 +227 80 64 83 83
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
              Appelez-nous pour discuter de votre intégration
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Call />}
                onClick={() => window.open("tel:+22780648383")}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                    transform: "scale(1.05)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Appeler
              </Button>
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                onClick={() => window.open("https://wa.me/22780648383")}
                sx={{
                  bgcolor: "#25D366",
                  color: "white",
                  fontWeight: "bold",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "#128C7E",
                    transform: "scale(1.05)"
                  },
                  transition: "all 0.3s ease"
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
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  fontWeight: "bold",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    transform: "scale(1.05)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Copier
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" sx={{ opacity: 0.8, fontStyle: "italic" }}>
            Nos équipes sont disponibles du lundi au vendredi, de 8h à 18h
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3, position: "relative", zIndex: 1 }}>
          <Button
            onClick={() => setOpenPartenaireDialog(false)}
            variant="outlined"
            sx={{
              borderColor: "rgba(255,255,255,0.5)",
              color: "white",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)"
              }
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
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                  <Paper sx={{ p: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
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
                        📞 Contacter le propriétaire
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
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
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.5rem"
                  }}>
                    💰 Informations financières
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                                <Typography variant="body2" fontWeight="bold" color="warning.main">
                                  Lat: {selectedBien.latitude}<br/>
                                  Lng: {selectedBien.longitude}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  const navigationUrl = `https://www.google.com/maps?q=${selectedBien.latitude},${selectedBien.longitude}`;
                                  window.open(navigationUrl, "_blank");
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
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                                    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
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
                                Google Maps
                              </Button>
                              
                              <Button
                                variant="outlined"
                                size="large"
                                startIcon={<LocationOn />}
                                onClick={() => {
                                  if (selectedBien.latitude && selectedBien.longitude) {
                                    const lat = selectedBien.latitude;
                                    const lng = selectedBien.longitude;
                                    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
                                    window.open(osmUrl, "_blank");
                                  } else {
                                    const searchQuery = selectedBien.adresse || selectedBien.ville;
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
                  Aucun bien immobilier sélectionné
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Drawer pour les détails de la parcelle */}
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
                Îlot {selectedParcelle?.ilot}
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
                <Paper sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
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
                          {selectedParcelle.ilot}
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
                      Îlot {selectedParcelle.ilot}
                    </Typography>
                  </Box>

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
                            const googleMapsUrl = `https://www.google.com/maps?q=${selectedParcelle.latitude},${selectedParcelle.longitude}`;
                            window.open(googleMapsUrl, "_blank");
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
                            const osmUrl = `https://www.openstreetmap.org/?mlat=${selectedParcelle.latitude}&mlon=${selectedParcelle.longitude}&zoom=15`;
                            window.open(osmUrl, "_blank");
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
                          const searchUrl = `https://maps.google.com/maps/search/${encodeURIComponent(`${selectedParcelle.ville} Îlot ${selectedParcelle.ilot}`)}`;
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
                    {selectedParcelle.documents && selectedParcelle.documents.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Documents ({selectedParcelle.documents.length})
                        </Typography>
                        <Stack spacing={1}>
                          {selectedParcelle.documents.map((doc, idx) => (
                            <Chip
                              key={idx}
                              label={`Document ${idx + 1}`}
                              component="a"
                              href={fixImageUrl(doc)}
                              target="_blank"
                              clickable
                              sx={{ justifyContent: "flex-start" }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    {selectedParcelle.videos && selectedParcelle.videos.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Vidéos ({selectedParcelle.videos.length})
                        </Typography>
                        <Stack spacing={1}>
                          {selectedParcelle.videos.map((video, idx) => (
                            <Chip
                              key={idx}
                              label={`Vidéo ${idx + 1}`}
                              component="a"
                              href={video}
                              target="_blank"
                              clickable
                              color="primary"
                              sx={{ justifyContent: "flex-start" }}
                            />
                          ))}
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
   

    </PageLayout>
  );
};

export default HomePage;
