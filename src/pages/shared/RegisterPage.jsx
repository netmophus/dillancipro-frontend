import React, { useState } from "react";
import {
  Container,
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
import PageLayout from "../../components/shared/PageLayout";
import { Visibility, VisibilityOff, Phone as PhoneIcon, Email as EmailIcon } from "@mui/icons-material";


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
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {activeStep === 0 ? "Création de compte" : "Vérification du compte"}
        </Typography>

        {/* Messages d'erreur et de succès (affichés dans toutes les étapes) */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Stepper */}
        {activeStep === 1 && (
          <Box sx={{ mb: 3 }}>
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
          <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom complet"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            helperText="Au moins un email ou un téléphone doit être fourni"
          />
        <TextField
            fullWidth
            label="Téléphone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            helperText="Au moins un email ou un téléphone doit être fourni"
            InputProps={{
                startAdornment: <InputAdornment position="start">+227</InputAdornment>,
            }}
            />

<TextField
  fullWidth
  label="Mot de passe"
  name="password"
  type={showPassword ? "text" : "password"}
  value={formData.password}
  onChange={handleChange}
  margin="normal"
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
/>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={submitting}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "S'inscrire"
              )}
            </Button>
          </Box>
        )}

        {/* Étape 2 : Vérification OTP */}
        {activeStep === 1 && verificationData && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
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
              margin="normal"
              required
              placeholder="123456"
              inputProps={{ maxLength: 6 }}
              helperText="Entrez le code à 6 chiffres reçu"
            />

            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleResendCode}
                disabled={resending}
                startIcon={verificationData.method === "SMS" ? <PhoneIcon /> : <EmailIcon />}
              >
                {resending ? (
                  <CircularProgress size={20} />
                ) : (
                  "Renvoyer le code"
                )}
              </Button>

              <Button
                variant="contained"
                onClick={handleVerifyCode}
                disabled={verifying || verificationCode.length !== 6}
                sx={{ flexGrow: 1 }}
              >
                {verifying ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Vérifier"
                )}
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: "center" }}>
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
              >
                Retour à l'inscription
              </Link>
            </Box>
          </Box>
        )}
      </Container>
    </PageLayout>
  );
};

export default RegisterPage;
