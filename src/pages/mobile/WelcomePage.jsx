import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Fade,
  Grow,
  Slide,
  useTheme,
  useMediaQuery,
  Grid,
  Avatar,
} from "@mui/material";
import {
  ArrowForward,
  Home,
  Security,
  LocationOn,
  Groups,
  TrendingUp,
  Support,
} from "@mui/icons-material";

const WelcomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    setLoaded(true);
  }, []);

  const features = [
    {
      icon: <Security />,
      title: "Sécurisé",
      description: "Transactions protégées",
      color: theme.palette.primary.main,
    },
    {
      icon: <LocationOn />,
      title: "Géolocalisé",
      description: "Biens localisés précisément",
      color: theme.palette.info.main,
    },
    {
      icon: <Groups />,
      title: "Multi-acteurs",
      description: "Écosystème connecté",
      color: theme.palette.secondary.main,
    },
  ];

  const stats = [
    { number: "1000+", label: "Biens répertoriés" },
    { number: "50+", label: "Agences partenaires" },
    { number: "500+", label: "Transactions/mois" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.main} 0%, 
          ${theme.palette.primary.dark} 40%, 
          ${theme.palette.secondary.main} 100%)`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Pattern de fond moderne animé */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, ${theme.palette.common.white} 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${theme.palette.common.white} 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, ${theme.palette.common.white} 0%, transparent 50%)
          `,
          animation: "float 20s ease-in-out infinite",
        }}
      />

      {/* Éléments décoratifs flottants */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          animation: "floatUp 15s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "70%",
          right: "10%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          animation: "floatUp 20s ease-in-out infinite 3s",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: { xs: 3, md: 4 },
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Badge moderne */}
          <Slide direction="down" in={loaded} timeout={400}>
            <Box
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "linear-gradient(135deg, #27AE60, #2ECC71)",
                color: "white",
                px: 2,
                py: 0.5,
                borderRadius: 20,
                fontSize: "0.75rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(39, 174, 96, 0.3)",
              }}
            >
              NOUVEAU
            </Box>
          </Slide>

          {/* Logo et titre */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Slide direction="up" in={loaded} timeout={800}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.primary.main,
                  mb: 1,
                  fontSize: { xs: "2rem", md: "2.8rem" },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.2,
                }}
              >
                Bienvenue à Dillanci
              </Typography>
            </Slide>

            <Fade in={loaded} timeout={1000}>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  mb: 3,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  lineHeight: 1.6,
                  maxWidth: "500px",
                  mx: "auto",
                  fontWeight: 400,
                }}
              >
                La plateforme intégrée pour gérer, acheter et vendre vos biens immobiliers en toute confiance au Niger.
              </Typography>
            </Fade>
          </Box>

          {/* Statistiques */}
          <Grow in={loaded} timeout={1200}>
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3} justifyContent="center">
                {stats.map((stat, index) => (
                  <Grid item xs={4} key={index}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          color: theme.palette.primary.main,
                          fontSize: { xs: "1.5rem", md: "2rem" },
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: { xs: "0.7rem", md: "0.8rem" },
                          fontWeight: 500,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grow>

          {/* Features */}
          <Box sx={{ mb: 4 }}>
            <Grow in={loaded} timeout={1400}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  gap: 2,
                  mb: 4,
                }}
              >
                {features.map((feature, index) => (
                  <Box
                    key={index}
                    sx={{
                      textAlign: "center",
                      flex: 1,
                      p: 2,
                      borderRadius: 2,
                      background: "rgba(255, 255, 255, 0.5)",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        mx: "auto",
                        mb: 1,
                        bgcolor: feature.color,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        display: "block",
                        fontSize: "0.85rem",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                        fontSize: "0.75rem",
                        mt: 0.5,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grow>
          </Box>

          {/* Boutons d'action */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Slide direction="up" in={loaded} timeout={1600}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => navigate("/register")}
                endIcon={<ArrowForward />}
                sx={{
                  py: 2.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: "0 8px 24px rgba(27, 82, 133, 0.3)",
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(27, 82, 133, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Créer un compte
              </Button>
            </Slide>

            <Slide direction="up" in={loaded} timeout={1800}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate("/login")}
                sx={{
                  py: 2.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  borderWidth: 2,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(27, 82, 133, 0.04)",
                    transform: "translateY(-2px)",
                    borderColor: theme.palette.primary.dark,
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Se connecter
              </Button>
            </Slide>
          </Box>

          {/* Texte informatif */}
          <Fade in={loaded} timeout={2000}>
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.85rem",
                }}
              >
                Rejoignez l'écosystème immobilier de référence au Niger
              </Typography>
            </Box>
          </Fade>
        </Paper>
      </Container>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
      `}</style>
    </Box>
  );
};

export default WelcomePage;
