import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Divider,
  Chip,
} from "@mui/material";
import {
  Business,
  AccountBalance,
  AccountBalanceWallet,
  People,
  Assessment,
  Settings,
  AttachMoney,
  Timer,
  VerifiedUser,
  Gavel,
  Landscape,
  ArrowForward,
  Home,
  LocationCity,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import PageLayout from "../../components/shared/PageLayout";
import { useNavigate } from "react-router-dom";


const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const modulesGlobaux = [
    {
      title: "Gestion géographique",
      description: "Villes, quartiers et zones du système",
      route: "/admin/geographic",
      icon: LocationCity,
      color: "#2e7d32",
    },
    {
      title: "Gestion des agences",
      description: "Créez et gérez les agences immobilières",
      route: "/admin/agences",
      icon: Business,
      color: "#1976d2",
    },
    {
      title: "Gestion des banques",
      description: "Biens hors exploitation des banques",
      route: "/admin/banques",
      icon: AccountBalance,
      color: "#388e3c",
    },
    {
      title: "Patrimoine de l'État",
      description: "Patrimoine immobilier public",
      route: "/admin/etat",
      icon: AccountBalanceWallet,
      color: "#7b1fa2",
    },
    {
      title: "Gestion des locations",
      description: "Créez et gérez les offres de location",
      route: "/admin/locations",
      icon: Home,
      color: "#ff5722",
      badge: "Nouveau",
    },
    {
      title: "Gestion des utilisateurs",
      description: "Comptes et accès utilisateurs",
      route: "/admin/utilisateurs",
      icon: People,
      color: "#f57c00",
    },
    {
      title: "Gestion des notaires",
      description: "Notaires partenaires de la plateforme",
      route: "/admin/notaires",
      icon: Gavel,
      color: "#9c27b0",
    },
    {
      title: "Statistiques",
      description: "Rapports et indicateurs clés",
      route: "/admin/statistiques",
      icon: Assessment,
      color: "#0288d1",
    },
    {
      title: "Configuration",
      description: "Paramètres du système",
      route: "/admin/configuration",
      icon: Settings,
      color: "#616161",
    },
  ];

  const modulesPatrimoine = [
    {
      title: "Gestion des Tarifs",
      description: "Paramétrez les montants d'enregistrement, abonnements et commissions",
      route: "/admin/gestion-tarifs",
      icon: AttachMoney,
      color: "#4caf50",
      badge: "FCFA",
    },
    {
      title: "Gestion des Abonnements",
      description: "Gérez les renouvellements et désactivations manuelles",
      route: "/admin/gestion-abonnements",
      icon: Timer,
      color: "#ff9800",
      badge: "Annuel",
    },
    {
      title: "Vérification des Biens",
      description: "Validez les biens et attribuez le badge 'Vérifié ✓'",
      route: "/admin/verification-biens",
      icon: VerifiedUser,
      color: "#2196f3",
      badge: "Badge",
    },
    {
      title: "Gestion des Ventes",
      description: "Gérez les ventes soumises et les commissions",
      route: "/admin/gestion-ventes",
      icon: Gavel,
      color: "#9c27b0",
      badge: "Commission",
    },
  ];

  const ModuleCard = ({ module }) => (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        borderLeft: `4px solid ${module.color}`,
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0px 12px 40px rgba(0,0,0,0.15)",
          transform: "translateY(-8px)",
        },
      }}
      onClick={() => navigate(module.route)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Avatar sx={{ bgcolor: module.color, width: 56, height: 56 }}>
            <module.icon fontSize="large" />
          </Avatar>
          {module.badge && (
            <Chip label={module.badge} size="small" sx={{ bgcolor: module.color, color: "white" }} />
          )}
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {module.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {module.description}
        </Typography>

        <Button
          endIcon={<ArrowForward />}
          sx={{ color: module.color, fontWeight: "bold" }}
          fullWidth
        >
          Accéder
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête moderne */}
        <Card
          elevation={3}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  border: "4px solid white",
                  bgcolor: "white",
                  color: "primary.main",
                }}
              >
                <Settings fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Tableau de bord Administrateur
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Bonjour {user?.phone} • Rôle : <strong>{user?.role}</strong>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* KPIs rapides */}
        <Grid container spacing={3} mb={4}>
          {[
            { label: "Agences", value: 12, color: "#1976d2", icon: Business },
            { label: "Banques", value: 8, color: "#388e3c", icon: AccountBalance },
            { label: "Utilisateurs", value: 123, color: "#f57c00", icon: People },
            { label: "Biens", value: 342, color: "#7b1fa2", icon: Landscape },
            { label: "Locations", value: 45, color: "#ff5722", icon: Home },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Card
                elevation={3}
                sx={{
                  borderLeft: `4px solid ${stat.color}`,
                  transition: "all 0.3s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color={stat.color}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                      <stat.icon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section Patrimoine Foncier */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Landscape fontSize="large" color="success" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                🏡 Gestion du Patrimoine Foncier
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tarifs, abonnements, vérifications et ventes
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {modulesPatrimoine.map((module, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <ModuleCard module={module} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Section Modules globaux */}
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Settings fontSize="large" color="primary" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                ⚙️ Modules Système
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestion globale de la plateforme
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {modulesGlobaux.map((module, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ModuleCard module={module} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default AdminDashboardPage;
