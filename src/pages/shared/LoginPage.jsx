import React, { useState } from "react";
import {
  Box,
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

import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/config";

import { useAuth } from "../../contexts/AuthContext";
import ForgotPasswordModal from "../../components/shared/ForgotPasswordModal";

const LoginPage = () => {
  const [formData, setFormData] = useState({ phone: "", email: "", password: "" });
  const [loginMethod, setLoginMethod] = useState("phone"); // "phone" ou "email"
  const navigate = useNavigate();
  const { login } = useAuth();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

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
    if (!digits) return "";
    if (digits.startsWith("00227")) {
      digits = digits.slice(5);
    } else if (digits.startsWith("227") && digits.length > 8) {
      digits = digits.slice(3);
    }
    digits = digits.slice(-8);
    return `+227${digits}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    const phoneProvided = formData.phone && formData.phone.trim() !== "";
    const emailProvided = formData.email && formData.email.trim() !== "";

    if (!phoneProvided && !emailProvided) {
      setError("Veuillez entrer un numéro de téléphone ou un email");
      return;
    }
    if (!formData.password) {
      setError("Veuillez entrer votre mot de passe");
      return;
    }

    setLoading(true);
    try {
      const loginData = { password: formData.password };

      if (phoneProvided) {
        loginData.phone = formatPhone(formData.phone);
      } else {
        loginData.email = formData.email.trim().toLowerCase();
      }

      const res = await axios.post(`${BASE_URL}/auth/login`, loginData);

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
      } else if (role === "Commercial") {
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

  const year = new Date().getFullYear();

  return (
    <>
      <Box sx={{ height: "100vh", overflow: "hidden", display: "flex", bgcolor: "#fff" }}>
        {/* Panneau visuel */}
        <Box
          sx={{
            position: "relative",
            flex: 1.15,
            display: { xs: "none", md: "block" },
            background:
              "linear-gradient(150deg, #0D2B4E 0%, #1B5285 55%, #27AE60 130%)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: { md: 6, lg: 9 },
              color: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography variant="h6" fontWeight={800} letterSpacing={0.5}>
                DILLANCI
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3" fontWeight={800} lineHeight={1.12} sx={{ maxWidth: 500 }}>
                Gérez votre patrimoine foncier en toute sérénité
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 2.5, maxWidth: 440 }}>
                Suivez vos démarches, vos transactions et vos documents fonciers
                depuis une plateforme moderne et sécurisée.
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ opacity: 0.65 }}>
              © {year} DILLANCI — Tous droits réservés
            </Typography>
          </Box>
        </Box>

        {/* Panneau formulaire */}
        <Box
          sx={{
            flex: 1,
            height: "100vh",
            overflowY: "auto",
            display: "flex",
            px: { xs: 3, sm: 6 },
            py: 4,
          }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 410, m: "auto" }}>
            <Stack spacing={3.5}>
              <Button
                onClick={() => navigate("/")}
                startIcon={<ArrowBack />}
                variant="outlined"
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: "#0D2B4E",
                  borderWidth: 1.5,
                  color: "#0D2B4E",
                  px: 2.5,
                  py: 0.9,
                  "&:hover": {
                    bgcolor: "#0D2B4E",
                    color: "#fff",
                    borderColor: "#0D2B4E",
                    borderWidth: 1.5,
                  },
                }}
              >
                Retour à l'accueil
              </Button>
              <Box
                sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.25, mb: 1 }}
              >
                <Typography variant="h6" fontWeight={800} color="#0D2B4E">
                  DILLANCI
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: "#0D2B4E" }}>
                  Connexion
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Heureux de vous revoir. Entrez vos identifiants pour continuer.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Bascule téléphone / email */}
              <Box sx={{ display: "flex", p: 0.5, borderRadius: 2.5, bgcolor: "#f1f4f9" }}>
                {["phone", "email"].map((m) => (
                  <Button
                    key={m}
                    fullWidth
                    disableElevation
                    onClick={() => {
                      setLoginMethod(m);
                      setFormData({ ...formData, [m === "phone" ? "email" : "phone"]: "" });
                      setError("");
                    }}
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                      color: loginMethod === m ? "#0D2B4E" : "text.secondary",
                      bgcolor: loginMethod === m ? "#fff" : "transparent",
                      boxShadow: loginMethod === m ? "0 2px 8px rgba(13,43,78,0.10)" : "none",
                      "&:hover": { bgcolor: loginMethod === m ? "#fff" : "rgba(0,0,0,0.03)" },
                    }}
                  >
                    {m === "phone" ? "Téléphone" : "Email"}
                  </Button>
                ))}
              </Box>

              {loginMethod === "phone" ? (
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
                    startAdornment: <InputAdornment position="start">+227</InputAdornment>,
                    sx: { borderRadius: 2 },
                  }}
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 8 }}
                  helperText="Numéro Niger, 8 chiffres"
                />
              ) : (
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoFocus
                  required
                  fullWidth
                  placeholder="exemple@email.com"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              )}

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
                  sx: { borderRadius: 2 },
                }}
              />

              <Box sx={{ textAlign: "right", mt: -1.5 }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{ cursor: "pointer", fontWeight: 600, color: "#0D2B4E", textDecoration: "none" }}
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
                sx={{
                  py: 1.6,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: 2.5,
                  textTransform: "none",
                  background: "linear-gradient(135deg, #0D2B4E 0%, #27AE60 160%)",
                  boxShadow: "0 8px 22px rgba(13,43,78,0.28)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0a2240 0%, #229152 160%)",
                    boxShadow: "0 10px 26px rgba(13,43,78,0.36)",
                  },
                  transition: "all 0.25s ease",
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
              </Button>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Pas encore de compte ?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate("/register")}
                  sx={{ fontWeight: 700, color: "#27AE60", textDecoration: "none" }}
                >
                  Créer un compte
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </>
  );
};

export default LoginPage;
