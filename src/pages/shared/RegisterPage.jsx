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
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import PageLayout from "../../components/shared/PageLayout";
import { Visibility, VisibilityOff, Phone as PhoneIcon, Email as EmailIcon, Home } from "@mui/icons-material";


  const formatPhone = (rawPhone) => {
    // Supprime les espaces éventuels et ajoute le préfixe
    const cleaned = rawPhone.replace(/\s+/g, "");
    return cleaned.startsWith("+227") ? cleaned : `+227${cleaned}`;
  };
  


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "User", // Rôle fixé à "User" pour l'inscription publique
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0); // 0 = inscription, 1 = vérification
  const [verificationData, setVerificationData] = useState(null); // { userId, method, phone/email }
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();


  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Vérifier le code OTP
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
        setSuccessMessage("✅ Compte activé avec succès ! Redirection vers la connexion...");
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

  // Renvoyer le code OTP
  const handleResendCode = async () => {
    setResending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const resendData = {
        userId: verificationData.userId,
      };
      
      if (verificationData.phone) {
        resendData.phone = verificationData.phone;
      } else {
        resendData.email = verificationData.email;
      }

      await axios.post(`${BASE_URL}/auth/resend-verification-code`, resendData);
      setSuccessMessage("✅ Code de vérification renvoyé avec succès");
      setVerificationCode(""); // Réinitialiser le champ code
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
    
    // Vérifier qu'au moins phone ou email est fourni
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
      
      // Ajouter phone ou email selon ce qui est fourni
      if (phoneProvided) {
        dataToSend.phone = formatPhone(formData.phone);
      }
      if (emailProvided) {
        dataToSend.email = formData.email.trim();
      }
      
      const response = await axios.post(`${BASE_URL}/auth/register`, dataToSend);
      
      // Si une vérification est requise
      if (response.data.requiresVerification) {
        setVerificationData({
          userId: response.data.userId,
          method: response.data.method,
          phone: phoneProvided ? formatPhone(formData.phone) : null,
          email: emailProvided ? formData.email.trim() : null,
        });
        setActiveStep(1);
        setSuccessMessage("✅ Compte créé avec succès. Un code de vérification vous a été envoyé.");
      } else {
        setSuccessMessage("✅ Compte créé avec succès. Redirection en cours...");
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
                  Bienvenue sur DillanciPro
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Créez votre compte pour accéder à tous nos services fonciers et immobiliers.
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  Rejoignez notre communauté et simplifiez vos transactions immobilières.
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
              <Grid container sx={{ width: "100%", height: "100%" }}>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: { xs: 2, md: 4 },
                    py: { xs: 4, md: 6 },
                  }}
                >
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                      width: "100%",
                      px: { xs: 4, md: 6 },
                      py: { xs: 5, md: 7 },
                      backgroundColor: "rgba(37, 99, 235, 0.05)",
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(37, 99, 235, 0.1)",
                    }}
                  >
                    <Stack spacing={3}>
                      <Box>
                        <Typography 
                          variant="h4" 
                          fontWeight={700} 
                          gutterBottom
                          sx={{
                            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mb: 1,
                          }}
                        >
                          {activeStep === 0 ? "Création de compte" : "Vérification du compte"}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color="text.secondary"
                          sx={{
                            fontSize: "0.95rem",
                            opacity: 0.8,
                          }}
                        >
                          {activeStep === 0 ? "Remplissez le formulaire pour créer votre compte" : "Entrez le code de vérification reçu"}
                        </Typography>
                      </Box>

                      {/* Messages d'erreur et de succès */}
                      {errorMessage && (
                        <Alert severity="error">
                          {errorMessage}
                        </Alert>
                      )}
                      {successMessage && (
                        <Alert severity="success">
                          {successMessage}
                        </Alert>
                      )}

                      {/* Stepper */}
                      {activeStep === 1 && (
                        <Box sx={{ mb: 2 }}>
                          <Stepper activeStep={1} alternativeLabel>
                            <Step>
                              <StepLabel>Inscription</StepLabel>
                            </Step>
                            <Step>
                              <StepLabel>Vérification</StepLabel>
                            </Step>
                          </Stepper>
                        </Box>
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
                            sx={{ mb: 2 }}
                          />
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            helperText="Au moins un email ou un téléphone doit être fourni"
                            sx={{ mb: 2 }}
                          />
                          <TextField
                            fullWidth
                            label="Téléphone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            helperText="Au moins un email ou un téléphone doit être fourni"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">+227</InputAdornment>,
                            }}
                            sx={{ mb: 2 }}
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
                            }}
                            sx={{ mb: 2 }}
                          />

                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={submitting}
                            sx={{ 
                              py: 1.8, 
                              fontWeight: 700,
                              fontSize: "1rem",
                              borderRadius: 2,
                              textTransform: "none",
                              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                                boxShadow: "0 6px 20px rgba(37, 99, 235, 0.5)",
                                transform: "translateY(-2px)",
                              },
                              "&:disabled": {
                                background: "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            {submitting ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : (
                              "S'inscrire"
                            )}
                          </Button>
                        </>
                      )}

                      {/* Étape 2 : Vérification OTP */}
                      {activeStep === 1 && verificationData && (
                        <>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            Un code de vérification a été envoyé par {verificationData.method === "SMS" ? "SMS" : "email"} {verificationData.method === "SMS" ? `au numéro ${verificationData.phone}` : `à l'adresse ${verificationData.email}`}
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
                            inputProps={{ maxLength: 6 }}
                            helperText="Entrez le code à 6 chiffres reçu"
                            sx={{ mb: 2 }}
                          />

                          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <Button
                              variant="outlined"
                              onClick={handleResendCode}
                              disabled={resending}
                              startIcon={verificationData.method === "SMS" ? <PhoneIcon /> : <EmailIcon />}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                              }}
                            >
                              {resending ? (
                                <CircularProgress size={20} />
                              ) : (
                                "Renvoyer"
                              )}
                            </Button>

                            <Button
                              variant="contained"
                              onClick={handleVerifyCode}
                              disabled={verifying || verificationCode.length !== 6}
                              sx={{ 
                                flexGrow: 1,
                                py: 1.5,
                                fontWeight: 700,
                                borderRadius: 2,
                                textTransform: "none",
                                background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                                  boxShadow: "0 6px 20px rgba(37, 99, 235, 0.5)",
                                  transform: "translateY(-2px)",
                                },
                                "&:disabled": {
                                  background: "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
                                },
                                transition: "all 0.3s ease",
                              }}
                            >
                              {verifying ? (
                                <CircularProgress size={24} color="inherit" />
                              ) : (
                                "Vérifier"
                              )}
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
                              sx={{ fontWeight: 500 }}
                            >
                              Retour à l'inscription
                            </Link>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={0}
                  md={6}
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "background.paper",
                    px: 6,
                    py: 8,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Home
                      sx={{
                        fontSize: 200,
                        color: "primary.main",
                        opacity: 0.2,
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default RegisterPage;
