import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import LogoDillanci from "../../components/shared/LogoDillanci";
import AuthSidePanel from "../../components/shared/AuthSidePanel";
import {
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack,
  PersonOutline,
  EmailOutlined,
  PhoneOutlined,
  LockOutlined,
  PersonAddAltOutlined,
  LayersOutlined,
  TrendingUp,
  VerifiedUser,
  InfoOutlined,
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
  // Page plein écran : retire la marge par défaut du navigateur le temps de l'affichage
  useEffect(() => {
    const previous = document.body.style.margin;
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = previous;
    };
  }, []);

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

  const GREEN = "#008557";
  const GREEN_DEEP = "#005C48";
  const NIGHT = "#101C36";
  const MUTED = "#64748B";
  const BORDER = "#D5DCE3";
  const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

  const avantages = [
    { Icon: LayersOutlined, titre: "Gérez vos biens", texte: "Parcelles, locations et biens à vendre." },
    { Icon: TrendingUp, titre: "Suivez vos transactions", texte: "En temps réel et en toute transparence." },
    { Icon: VerifiedUser, titre: "Accédez à des services sécurisés", texte: "Des démarches simplifiées et fiables." },
  ];

  const primaryBtnSx = {
    height: 54, "@media (min-width:768px) and (max-height:800px)": { height: 48 }, "@media (min-width:768px) and (max-height:700px)": { height: 44 },
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 16,
    borderRadius: "10px",
    textTransform: "none",
    bgcolor: GREEN,
    color: "#fff",
    "&:hover": { bgcolor: GREEN_DEEP },
    "&.Mui-disabled": { bgcolor: GREEN, color: "#fff", opacity: 0.6 },
  };
  const labelSx = { display: "block", mb: 0.75, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: NIGHT };
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      fontFamily: FONT,
      fontSize: 16,
      minHeight: 52, "@media (min-width:768px) and (max-height:800px)": { height: 48, minHeight: 48, "& input": { py: "12px" } }, "@media (min-width:768px) and (max-height:700px)": { height: 44, minHeight: 44, "& input": { py: "9px" } },
      borderRadius: "10px",
      bgcolor: "#fff",
      "& fieldset": { borderColor: BORDER },
      "&:hover fieldset": { borderColor: "#B7C2CD" },
      "&.Mui-focused fieldset": { borderColor: GREEN, borderWidth: 1.5 },
    },
    "& .MuiFormHelperText-root": { fontFamily: FONT, ml: 0.25, color: MUTED },
  };
  const iconAdornment = (Icon) => (
    <InputAdornment position="start">
      <Icon sx={{ fontSize: 22, color: MUTED }} />
    </InputAdornment>
  );

  return (
    <Box sx={{ minHeight: "100dvh", "@media (min-width:768px)": { height: "100dvh" }, display: "flex", bgcolor: "#EEF1F4", fontFamily: FONT }}>
      <AuthSidePanel
        badge="Plateforme immobilière du Niger"
        lines={["Rejoignez la", "plateforme immobilière"]}
        mintLine="de référence"
        description="Créez votre compte pour gérer vos biens, suivre vos transactions et accéder à tous nos services en toute sécurité."
        items={avantages}
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
          px: { xs: 2, sm: 4 },
          "@media (min-width:375px)": { px: 2.5 },
          "@media (min-width:600px)": { px: 4 },
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
            maxWidth: { xs: "100%", sm: 580 },
              m: "auto",
            boxSizing: "border-box",
            bgcolor: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: "20px",
            boxShadow: "0 2px 10px rgba(16,28,54,0.05)",
            p: { xs: 2, sm: 4.5 },
              "@media (min-width:768px) and (max-height:900px)": { p: 4 },
              "@media (min-width:768px) and (max-height:800px)": { p: 3 },
              "@media (min-width:768px) and (max-height:700px)": { p: 2.5 },
            "@media (min-width:375px) and (max-width:599px)": { p: 2.5 },
            "@media (max-width:374px)": { "& .MuiOutlinedInput-input": { fontSize: 14.5 }, "& .MuiOutlinedInput-root": { pl: 1.25 } },
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
                {activeStep === 0 ? "Créer un compte" : "Vérification"}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 15.5, color: MUTED, mt: 0.75 }}>
                {activeStep === 0
                  ? "Remplissez le formulaire pour rejoindre Dillanci."
                  : "Entrez le code de vérification reçu pour activer votre compte."}
              </Typography>
            </Box>

            {errorMessage && (
              <Alert severity="error" sx={{ borderRadius: "10px", fontFamily: FONT }}>
                {errorMessage}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ borderRadius: "10px", fontFamily: FONT }}>
                {successMessage}
              </Alert>
            )}

            {activeStep === 1 && (
              <Stepper
                activeStep={1}
                alternativeLabel
                sx={{
                  "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": { color: GREEN },
                  "& .MuiStepLabel-label": { fontFamily: FONT },
                }}
              >
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
                <Box>
                  <Typography component="label" htmlFor="reg-fullname" sx={labelSx}>Nom complet *</Typography>
                  <TextField
                    id="reg-fullname"
                    fullWidth
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Entrez votre nom complet"
                    InputProps={{ startAdornment: iconAdornment(PersonOutline) }}
                    sx={fieldSx}
                  />
                </Box>
                <Box>
                  <Typography component="label" htmlFor="reg-email" sx={labelSx}>Email</Typography>
                  <TextField
                    id="reg-email"
                    fullWidth
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Entrez votre adresse email"
                    InputProps={{ startAdornment: iconAdornment(EmailOutlined) }}
                    sx={fieldSx}
                  />
                </Box>
                <Box>
                  <Typography component="label" htmlFor="reg-phone" sx={labelSx}>Téléphone</Typography>
                  <TextField
                    id="reg-phone"
                    fullWidth
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="90 12 34 56"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlined sx={{ fontSize: 22, color: MUTED, mr: 1 }} />
                          <Box component="span" sx={{ fontFamily: FONT, fontWeight: 600, color: NIGHT }}>+227</Box>
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1, color: MUTED }}>
                    <InfoOutlined sx={{ fontSize: 17 }} />
                    <Typography sx={{ fontFamily: FONT, fontSize: 13, lineHeight: 1.4, color: MUTED }}>
                      Au moins un email ou un téléphone est requis.
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography component="label" htmlFor="reg-password" sx={labelSx}>Mot de passe *</Typography>
                  <TextField
                    id="reg-password"
                    fullWidth
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Entrez votre mot de passe"
                    InputProps={{
                      startAdornment: iconAdornment(LockOutlined),
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
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  fullWidth
                  disabled={submitting}
                  startIcon={submitting ? null : <PersonAddAltOutlined />}
                  sx={primaryBtnSx}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : "S'inscrire"}
                </Button>

                <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, textAlign: "center" }}>
                  Vous avez déjà un compte ?{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => navigate("/login")}
                    sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: GREEN, textDecoration: "none", verticalAlign: "baseline", "&:hover": { textDecoration: "underline" } }}
                  >
                    Se connecter
                  </Link>
                </Typography>
              </>
            )}

            {/* Étape 2 : Vérification OTP */}
            {activeStep === 1 && verificationData && (
              <>
                <Alert severity="info" sx={{ borderRadius: "10px", fontFamily: FONT }}>
                  Un code de vérification a été envoyé par{" "}
                  {verificationData.method === "SMS" ? "SMS" : "email"}{" "}
                  {verificationData.method === "SMS"
                    ? `au numéro ${verificationData.phone}`
                    : `à l'adresse ${verificationData.email}`}
                </Alert>

                <Box>
                  <Typography component="label" htmlFor="reg-code" sx={labelSx}>Code de vérification</Typography>
                  <TextField
                    id="reg-code"
                    fullWidth
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
                    sx={fieldSx}
                  />
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    onClick={handleResendCode}
                    disabled={resending}
                    startIcon={verificationData.method === "SMS" ? <PhoneIcon /> : <EmailIcon />}
                    sx={{ height: 54, "@media (min-width:768px) and (max-height:800px)": { height: 48 }, "@media (min-width:768px) and (max-height:700px)": { height: 44 }, flex: "0 0 auto", borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 600, borderColor: GREEN, color: GREEN, "&:hover": { borderColor: GREEN_DEEP, bgcolor: "rgba(0,133,87,0.06)" } }}
                  >
                    {resending ? <CircularProgress size={20} /> : "Renvoyer"}
                  </Button>

                  <Button
                    variant="contained"
                    disableElevation
                    onClick={handleVerifyCode}
                    disabled={verifying || verificationCode.length !== 6}
                    sx={{ ...primaryBtnSx, flex: "1 1 140px" }}
                  >
                    {verifying ? <CircularProgress size={24} color="inherit" /> : "Vérifier"}
                  </Button>
                </Box>

                <Box sx={{ textAlign: "center" }}>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => {
                      setActiveStep(0);
                      setVerificationData(null);
                      setVerificationCode("");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: GREEN, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    Retour à l'inscription
                  </Link>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
