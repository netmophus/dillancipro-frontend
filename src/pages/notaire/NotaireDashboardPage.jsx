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
  Chip,
} from "@mui/material";
import {
  Gavel,
  Assignment,
  CheckCircle,
  HourglassEmpty,
  ArrowForward,
  AccountBalance,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import PageLayout from "../../components/shared/PageLayout";
import { useNavigate } from "react-router-dom";

const NotaireDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
              <Gavel fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Dashboard Notaire
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bienvenue, {user?.fullName || "Notaire"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Modules */}
        <Grid container spacing={3}>
          {/* Formalisation Notariale */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={3}
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate("/notaire/demandes-credit-hypothecaire")}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}>
                    <AccountBalance />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "white" }}>
                    Formalisation Notariale
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 2 }} gutterBottom>
                  Formalisez les documents (titre foncier, convention d'ouverture de crédit, acte hypothécaire) 
                  pour les dossiers soumis par les banques partenaires selon les procédures UMEMOA
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  sx={{ mt: 2 }}
                  variant="contained"
                  fullWidth
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                  }}
                >
                  Accéder
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={3}
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate("/notaire/ventes")}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Assignment />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Mes Ventes
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Consultez et gérez les ventes qui vous sont assignées
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  sx={{ mt: 2 }}
                  variant="contained"
                  fullWidth
                >
                  Accéder
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={3}
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate("/notaire/ventes?statut=en_cours_notariat")}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <HourglassEmpty />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    En Cours
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ventes en cours de traitement
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  sx={{ mt: 2 }}
                  variant="contained"
                  color="warning"
                  fullWidth
                >
                  Voir
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={3}
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate("/notaire/ventes?statut=formalites_completes")}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Finalisées
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ventes avec formalités complètes
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  sx={{ mt: 2 }}
                  variant="contained"
                  color="success"
                  fullWidth
                >
                  Voir
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Message informatif */}
        <Box sx={{ mt: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ℹ️ Informations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En tant que notaire partenaire, vous pouvez gérer les ventes qui vous sont assignées.
                Consultez vos ventes pour mettre à jour leur statut, uploader des documents et finaliser les formalités.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default NotaireDashboardPage;

