import React, { useState, useEffect } from "react";
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
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  Login as LoginIcon,
  PhoneOutlined,
  EmailOutlined,
  Landscape,
  Home as HomeIcon,
  Apartment,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/config";

import { useAuth } from "../../contexts/AuthContext";
import ForgotPasswordModal from "../../components/shared/ForgotPasswordModal";
import LogoDillanci from "../../components/shared/LogoDillanci";
import AuthSidePanel from "../../components/shared/AuthSidePanel";

const LoginPage = () => {
  const [formData, setFormData] = useState({ phone: "", email: "", password: "" });
  const [loginMethod, setLoginMethod] = useState("phone"); // "phone" ou "email"
  const navigate = useNavigate();
  const { login } = useAuth();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Page plein écran : retire la marge par défaut du navigateur le temps de l'affichage
  useEffect(() => {
    const previous = document.body.style.margin;
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = previous;
    };
  }, []);

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

  const GREEN = "#008557";
  const GREEN_DEEP = "#005C48";
  const NIGHT = "#101C36";
  const MUTED = "#64748B";
  const BORDER = "#D5DCE3";
  const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

  const services = [
    { Icon: Landscape, titre: "Parcelles", texte: "Recherchez et gérez vos parcelles." },
    { Icon: HomeIcon, titre: "Locations", texte: "Trouvez un logement adapté." },
    { Icon: Apartment, titre: "Biens à vendre", texte: "Découvrez des biens immobiliers." },
  ];

  const labelSx = { display: "block", mb: 0.75, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: NIGHT };
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      fontFamily: FONT,
      fontSize: 16,
      height: 54, "@media (min-width:768px) and (max-height:800px)": { height: 48 }, "@media (min-width:768px) and (max-height:700px)": { height: 44 },
      borderRadius: "10px",
      bgcolor: "#fff",
      "& fieldset": { borderColor: BORDER },
      "&:hover fieldset": { borderColor: "#B7C2CD" },
      "&.Mui-focused fieldset": { borderColor: GREEN, borderWidth: 1.5 },
    },
    "& .MuiFormHelperText-root": { fontFamily: FONT, ml: 0.25, color: MUTED },
  };

  return (
    <>
      <Box sx={{ minHeight: "100dvh", "@media (min-width:768px)": { height: "100dvh" }, display: "flex", bgcolor: "#EEF1F4", fontFamily: FONT }}>
        <AuthSidePanel
          badge="Plateforme sécurisée"
          badgeFilled
          lines={["Gérez votre", "patrimoine foncier"]}
          mintLine="en toute sérénité"
          description="Suivez vos démarches, vos transactions et vos documents fonciers depuis une plateforme moderne et sécurisée."
          items={services}
        />

        {/* Panneau formulaire */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            boxSizing: "border-box",
            px: { xs: 2.5, sm: 4 },
            py: { xs: 3, sm: 4 },
            "@media (min-width:768px) and (max-height:800px)": { py: 2 },
            "@media (min-width:768px) and (max-height:700px)": { py: 1 },
            }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 540 },
              m: "auto",
              boxSizing: "border-box",
              bgcolor: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "20px",
              boxShadow: "0 2px 10px rgba(16,28,54,0.05)",
              p: { xs: 2.5, sm: 4.5 },
              "@media (min-width:768px) and (max-height:900px)": { p: 4 },
              "@media (min-width:768px) and (max-height:800px)": { p: 3 },
              "@media (min-width:768px) and (max-height:700px)": { p: 2.5 },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "20px", sm: "24px" }, "@media (min-width:768px) and (max-height:900px)": { gap: "20px" }, "@media (min-width:768px) and (max-height:800px)": { gap: "16px" }, "@media (min-width:768px) and (max-height:700px)": { gap: "12px" } }}>
              <Box sx={{ display: "block", "@media (min-width:768px)": { display: "none" } }}>
                <LogoDillanci scale={0.9} />
              </Box>

              <Button
                onClick={() => navigate("/")}
                startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                sx={{ alignSelf: "flex-start", px: 0.5, minWidth: 0, textTransform: "none", fontFamily: FONT, fontWeight: 600, fontSize: 14.5, color: NIGHT, "&:hover": { bgcolor: "transparent", color: GREEN } }}
              >
                Retour à l'accueil
              </Button>

              <Box>
                <Typography component="h2" sx={{ fontFamily: FONT, fontSize: { xs: 30, sm: 34 }, "@media (min-width:768px) and (max-height:800px)": { fontSize: 28 }, fontWeight: 700, color: NIGHT, lineHeight: 1.2 }}>
                  Connexion
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, mt: 0.75 }}>
                  Heureux de vous revoir. Entrez vos identifiants pour continuer.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ borderRadius: "10px", fontFamily: FONT }}>
                  {error}
                </Alert>
              )}

              {/* Bascule téléphone / email */}
              <Box sx={{ display: "flex", p: "4px", borderRadius: "12px", bgcolor: "#E8EDF2", gap: "4px" }}>
                {["phone", "email"].map((m) => {
                  const actif = loginMethod === m;
                  const Icone = m === "phone" ? PhoneOutlined : EmailOutlined;
                  return (
                    <Button
                      key={m}
                      fullWidth
                      disableElevation
                      startIcon={<Icone sx={{ fontSize: 20 }} />}
                      onClick={() => {
                        setLoginMethod(m);
                        setFormData({ ...formData, [m === "phone" ? "email" : "phone"]: "" });
                        setError("");
                      }}
                      sx={{
                        height: 44,
                        borderRadius: "9px",
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: 15,
                        textTransform: "none",
                        color: actif ? "#fff" : "#334155",
                        bgcolor: actif ? GREEN : "transparent",
                        "&:hover": { bgcolor: actif ? GREEN_DEEP : "rgba(16,28,54,0.05)" },
                      }}
                    >
                      {m === "phone" ? "Téléphone" : "Email"}
                    </Button>
                  );
                })}
              </Box>

              {loginMethod === "phone" ? (
                <Box>
                  <Typography component="label" htmlFor="login-phone" sx={labelSx}>Téléphone</Typography>
                  <TextField
                    id="login-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoFocus
                    required
                    fullWidth
                    placeholder="XXXXXXXX"
                    InputProps={{ startAdornment: <InputAdornment position="start"><Box component="span" sx={{ fontFamily: FONT, fontWeight: 600, color: NIGHT }}>+227</Box></InputAdornment> }}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 8 }}
                    helperText="Numéro Niger, 8 chiffres"
                    sx={fieldSx}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography component="label" htmlFor="login-email" sx={labelSx}>Email</Typography>
                  <TextField
                    id="login-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoFocus
                    required
                    fullWidth
                    placeholder="exemple@email.com"
                    sx={fieldSx}
                  />
                </Box>
              )}

              <Box>
                <Typography component="label" htmlFor="login-password" sx={labelSx}>Mot de passe</Typography>
                <TextField
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  placeholder="Votre mot de passe"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility} edge="end" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
                <Box sx={{ textAlign: "right", mt: 1 }}>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    sx={{ cursor: "pointer", fontFamily: FONT, fontSize: 14, fontWeight: 600, color: GREEN, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    Mot de passe oublié ?
                  </Link>
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                disableElevation
                fullWidth
                disabled={loading}
                startIcon={loading ? null : <LoginIcon />}
                sx={{
                  height: 54, "@media (min-width:768px) and (max-height:800px)": { height: 48 }, "@media (min-width:768px) and (max-height:700px)": { height: 44 },
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: "10px",
                  textTransform: "none",
                  bgcolor: GREEN,
                  color: "#fff",
                  "&:hover": { bgcolor: GREEN_DEEP },
                  "&.Mui-disabled": { bgcolor: GREEN, color: "#fff", opacity: 0.7 },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
              </Button>

              <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, textAlign: "center" }}>
                Pas encore de compte ?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate("/register")}
                  sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: GREEN, textDecoration: "none", verticalAlign: "baseline", "&:hover": { textDecoration: "underline" } }}
                >
                  Créer un compte
                </Link>
              </Typography>
            </Box>
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
