import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Link,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import registerImg from "../../assets/register.png";
import {
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack,
} from "@mui/icons-material";

const formatPhone = (rawPhone) => {
  const cleaned = rawPhone.replace(/\s+/g, "");
  return cleaned.startsWith("+227") ? cleaned : `+227${cleaned}`;
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "User",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0); // 0 = inscription, 1 = vérification
  const [verificationData, setVerificationData] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMessage("Veuillez entrer le code à 6 chiffres");
      return;
    }

    setVerifying(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const verifyData = {
        userId: verificationData.userId,
        code: verificationCode.trim(),
      };

      if (verificationData.phone) {
        verifyData.phone = verificationData.phone;
      } else {
        verifyData.email = verificationData.email;
      }

      const response = await axios.post(`${BASE_URL}/auth/verify-account`, verifyData);

      if (response.data.verified) {
        setSuccessMessage("Compte activé avec succès ! Redirection vers la connexion...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrorMessage("Code invalide. Veuillez réessayer.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la vérification. Veuillez réessayer.";
      setErrorMessage(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const resendData = { userId: verificationData.userId };

      if (verificationData.phone) {
        resendData.phone = verificationData.phone;
      } else {
        resendData.email = verificationData.email;
      }

      await axios.post(`${BASE_URL}/auth/resend-verification-code`, resendData);
      setSuccessMessage("Code de vérification renvoyé avec succès");
      setVerificationCode("");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors du renvoi du code. Veuillez réessayer.";
      setErrorMessage(message);
    } finally {
      setResending(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMessage("");
    setSuccessMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/\s+/g, "") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const phoneProvided = formData.phone && formData.phone.trim() !== "";
    const emailProvided = formData.email && formData.email.trim() !== "";

    if (!phoneProvided && !emailProvided) {
      setErrorMessage("Veuillez fournir au moins un numéro de téléphone ou un email");
      setSubmitting(false);
      return;
    }

    try {
      const dataToSend = {
        fullName: formData.fullName.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (phoneProvided) dataToSend.phone = formatPhone(formData.phone);
      if (emailProvided) dataToSend.email = formData.email.trim();

      const response = await axios.post(`${BASE_URL}/auth/register`, dataToSend);

      if (response.data.requiresVerification) {
        setVerificationData({
          userId: response.data.userId,
          method: response.data.method,
          phone: phoneProvided ? formatPhone(formData.phone) : null,
          email: emailProvided ? formData.email.trim() : null,
        });
        setActiveStep(1);
        setSuccessMessage("Compte créé avec succès. Un code de vérification vous a été envoyé.");
      } else {
        setSuccessMessage("Compte créé avec succès. Redirection en cours...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data ||
        error.message ||
        "Une erreur est survenue lors de l'inscription.";
      console.error("Erreur d'inscription :", message, error);
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const primaryBtnSx = {
    py: 1.5,
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
    "&:disabled": { background: "#c7cfdb", color: "#fff" },
    transition: "all 0.25s ease",
  };

  const year = new Date().getFullYear();

  return (
    <Box sx={{ height: "100vh", overflow: "hidden", display: "flex", bgcolor: "#fff" }}>
      {/* Panneau visuel */}
      <Box sx={{ position: "relative", flex: 1.15, display: { xs: "none", md: "block" } }}>
        <Box
          component="img"
          src={registerImg}
          alt="Géofoncier"
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(150deg, rgba(13,43,78,0.84) 0%, rgba(27,82,133,0.60) 55%, rgba(39,174,96,0.48) 100%)",
          }}
        />
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
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.25rem",
              }}
            >
              G
            </Box>
            <Typography variant="h6" fontWeight={800} letterSpacing={0.5}>
              Géofoncier
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" fontWeight={800} lineHeight={1.12} sx={{ maxWidth: 500 }}>
              Rejoignez la plateforme foncière de référence
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 2.5, maxWidth: 440 }}>
              Créez votre compte pour gérer vos biens, suivre vos transactions et
              accéder à tous nos services en toute sécurité.
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ opacity: 0.65 }}>
            © {year} Géofoncier — Tous droits réservés
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
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 440, m: "auto" }}>
          <Stack spacing={3}>
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
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "#0D2B4E",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                }}
              >
                G
              </Box>
              <Typography variant="h6" fontWeight={800} color="#0D2B4E">
                Géofoncier
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#0D2B4E" }}>
                {activeStep === 0 ? "Créer un compte" : "Vérification"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {activeStep === 0
                  ? "Remplissez le formulaire pour rejoindre Géofoncier."
                  : "Entrez le code de vérification reçu pour activer votre compte."}
              </Typography>
            </Box>

            {errorMessage && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                {successMessage}
              </Alert>
            )}

            {activeStep === 1 && (
              <Stepper activeStep={1} alternativeLabel>
                <Step>
                  <StepLabel>Inscription</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Vérification</StepLabel>
                </Step>
              </Stepper>
            )}

            {/* Étape 1 : Inscription */}
            {activeStep === 0 && (
              <>
                <TextField
                  fullWidth
                  label="Nom complet"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Ex: KANE ML"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  helperText="Au moins un email ou un téléphone est requis"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  helperText="Au moins un email ou un téléphone est requis"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">+227</InputAdornment>,
                    sx: { borderRadius: 2 },
                  }}
                />
                <TextField
                  fullWidth
                  label="Mot de passe"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
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

                <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={primaryBtnSx}>
                  {submitting ? <CircularProgress size={24} color="inherit" /> : "S'inscrire"}
                </Button>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Vous avez déjà un compte ?{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => navigate("/login")}
                    sx={{ fontWeight: 700, color: "#27AE60", textDecoration: "none" }}
                  >
                    Se connecter
                  </Link>
                </Typography>
              </>
            )}

            {/* Étape 2 : Vérification OTP */}
            {activeStep === 1 && verificationData && (
              <>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Un code de vérification a été envoyé par{" "}
                  {verificationData.method === "SMS" ? "SMS" : "email"}{" "}
                  {verificationData.method === "SMS"
                    ? `au numéro ${verificationData.phone}`
                    : `à l'adresse ${verificationData.email}`}
                </Alert>

                <TextField
                  fullWidth
                  label="Code de vérification"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(value);
                    setErrorMessage("");
                  }}
                  required
                  placeholder="123456"
                  inputProps={{ maxLength: 6, style: { letterSpacing: "0.5em", textAlign: "center", fontSize: "1.3rem" } }}
                  helperText="Entrez le code à 6 chiffres reçu"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    onClick={handleResendCode}
                    disabled={resending}
                    startIcon={verificationData.method === "SMS" ? <PhoneIcon /> : <EmailIcon />}
                    sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600 }}
                  >
                    {resending ? <CircularProgress size={20} /> : "Renvoyer"}
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleVerifyCode}
                    disabled={verifying || verificationCode.length !== 6}
                    sx={{ ...primaryBtnSx, flexGrow: 1 }}
                  >
                    {verifying ? <CircularProgress size={24} color="inherit" /> : "Vérifier"}
                  </Button>
                </Box>

                <Box sx={{ textAlign: "center" }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => {
                      setActiveStep(0);
                      setVerificationData(null);
                      setVerificationCode("");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    sx={{ fontWeight: 600, color: "#0D2B4E", textDecoration: "none" }}
                  >
                    Retour à l'inscription
                  </Link>
                </Box>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
