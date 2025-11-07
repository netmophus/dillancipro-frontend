import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Divider,
} from "@mui/material";
import {
  Phone,
  Email,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box component="footer" sx={{ bgcolor: "#212121", color: "white" }}>
      {/* Main Footer Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="body1" textAlign="center" sx={{ mb: 4, opacity: 0.9 }}>
          La plateforme de référence pour la gestion foncière et immobilière au Niger. 
          Sécurisée, géolocalisée et accessible à tous.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Liens rapides
            </Typography>
            <Stack spacing={1}>
              <Button
                color="inherit"
                sx={{ justifyContent: "flex-start", textTransform: "none" }}
                onClick={() => navigate("/register")}
              >
                → S'inscrire
              </Button>
              <Button
                color="inherit"
                sx={{ justifyContent: "flex-start", textTransform: "none" }}
                onClick={() => navigate("/login")}
              >
                → Se connecter
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contact
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Phone fontSize="small" />
                <Typography variant="body2">+227 XX XX XX XX</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Email fontSize="small" />
                <Typography variant="body2">contact@dillancipro.ne</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">Niamey, Niger</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "grey.700" }} />
        <Typography variant="body2" textAlign="center" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} DillanciPro. Tous droits réservés. | Plateforme officielle de gestion foncière
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
