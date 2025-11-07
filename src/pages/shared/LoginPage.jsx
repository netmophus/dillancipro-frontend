import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/config";

import PageLayout from "../../components/shared/PageLayout";
import { useAuth } from "../../contexts/AuthContext";
import ForgotPasswordModal from "../../components/shared/ForgotPasswordModal";

const LoginPage = () => {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

const togglePasswordVisibility = () => {
  setShowPassword((prev) => !prev);
};


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      let digits = value.replace(/\D/g, "");

      if (digits.startsWith("00227")) {
        digits = digits.slice(5);
      } else if (digits.startsWith("227") && digits.length > 8) {
        digits = digits.slice(3);
      }

      setFormData((prev) => ({ ...prev, phone: digits.slice(0, 8) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPhone = (rawPhone) => {
    let digits = rawPhone.replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    if (digits.startsWith("00227")) {
      digits = digits.slice(5);
    } else if (digits.startsWith("227") && digits.length > 8) {
      digits = digits.slice(3);
    }

    digits = digits.slice(-8);

    return `+227${digits}`;
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(`${BASE_URL}/auth/login`, {
//         ...formData,
//         phone: formatPhone(formData.phone),
//       });

//       login(res.data.token, res.data.user);

//       if (res.data.user.role === "Admin") {
//         navigate("/admin/dashboard");
//       } else {
//         navigate("/user/dashboard");
//       }
//     } catch (error) {
//       console.error("Erreur de connexion :", error.response?.data?.message);
//     }
//   };


const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        ...formData,
        phone: formatPhone(formData.phone),
      });
  
      login(res.data.token, res.data.user);
  
      const role = res.data.user.role;
  
      if (role === "Admin") {
        navigate("/admin/dashboard");
      } else if (role === "Banque") {
        navigate("/banque/dashboard");
      } else if (role === "Agence") {
        navigate("/agence/dashboard");
      } else if (role === "Ministere") {
        navigate("/ministere/dashboard");
      } 
      
      

      else if (role === "Commercial") {
        navigate("/agence/commercial/dashboard");
      } else if (role === "Notaire") {
        navigate("/notaire/dashboard");
      } else {
        navigate("/user/dashboard");
      }
  
    } catch (error) {
      console.error("Erreur de connexion :", error.response?.data?.message);
      setError(
        error.response?.data?.message ||
          "Impossible de vous connecter pour le moment. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <PageLayout>
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Paper
          elevation={10}
          sx={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 4,
          }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                background: "linear-gradient(140deg, #0f172a 0%, #2563eb 100%)",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: { xs: 4, md: 5 },
                py: { xs: 6, md: 8 },
              }}
            >
              <Stack spacing={3} sx={{ textAlign: { xs: "center", md: "left" } }}>
                <Typography variant="h4" fontWeight={700} lineHeight={1.2}>
                  Bienvenue sur GeoFoncier
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Accédez à votre espace pour suivre vos démarches foncières,
                  vos transactions et vos documents importants.
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  Vos données sont sécurisées et protégées. Pensez à mettre à
                  jour votre mot de passe régulièrement.
                </Typography>
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}
              md={7}
              sx={{
                backgroundColor: "background.paper",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  width: "100%",
                  px: { xs: 4, md: 6 },
                  py: { xs: 6, md: 8 },
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Connexion à votre compte
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Entrez vos identifiants pour continuer.
                    </Typography>
                  </Box>

                  {error && <Alert severity="error">{error}</Alert>}

                  <TextField
                    label="Téléphone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoFocus
                    required
                    fullWidth
                    placeholder="XXXXXXXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">+227</InputAdornment>
                      ),
                    }}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 8,
                    }}
                    helperText="Numéro de téléphone Niger, 8 chiffres"
                  />

                  <TextField
                    label="Mot de passe"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ textAlign: "right" }}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => setForgotPasswordOpen(true)}
                      sx={{ cursor: "pointer", fontWeight: 500 }}
                    >
                      Mot de passe oublié ?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ py: 1.5, fontWeight: 600 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </PageLayout>
  );
};

export default LoginPage;
