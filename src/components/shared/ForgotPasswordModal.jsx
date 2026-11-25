import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import { Visibility, VisibilityOff, Phone as PhoneIcon, Email as EmailIcon, LockReset, Close } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../config/config";

const steps = ["Entrer le contact", "Vérifier le code", "Nouveau mot de passe"];

const ForgotPasswordModal = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetMethod, setResetMethod] = useState("phone"); // "phone" ou "email"

  // Étape 1 : Numéro de téléphone ou email
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // Étape 2 : Code de vérification
  const [code, setCode] = useState("");
  
  // Étape 3 : Nouveau mot de passe
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });

  const sanitizeLocalPhone = (value) => {
    let digits = value.replace(/\D/g, "");

    if (digits.startsWith("00227")) {
      digits = digits.slice(5);
    } else if (digits.startsWith("227") && digits.length > 8) {
      digits = digits.slice(3);
    }

    return digits.slice(0, 8);
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

  // Étape 1 : Demander la réinitialisation
  const handleRequestReset = async () => {
    const phoneProvided = resetMethod === "phone" && phone && phone.trim() !== "";
    const emailProvided = resetMethod === "email" && email && email.trim() !== "";

    if (!phoneProvided && !emailProvided) {
      setError(`Veuillez entrer votre ${resetMethod === "phone" ? "numéro de téléphone" : "adresse email"}`);
      return;
    }

    // Validation de l'email si méthode email
    if (emailProvided) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Veuillez entrer une adresse email valide");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const requestData = {};
      if (phoneProvided) {
        requestData.phone = formatPhone(phone);
      } else {
        requestData.email = email.trim().toLowerCase();
      }

      const response = await axios.post(`${BASE_URL}/auth/forgot-password`, requestData);

      setSuccess(response.data.message || "Code envoyé avec succès");
      setActiveStep(1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'envoi du code. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Vérifier le code
  const handleVerifyCode = async () => {
    if (!code || code.trim() === "") {
      setError(`Veuillez entrer le code reçu par ${resetMethod === "phone" ? "SMS" : "email"}`);
      return;
    }

    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const requestData = {
        code: code.trim(),
      };
      
      if (resetMethod === "phone") {
        requestData.phone = formatPhone(phone);
      } else {
        requestData.email = email.trim().toLowerCase();
      }

      const response = await axios.post(`${BASE_URL}/auth/verify-reset-code`, requestData);

      if (response.data.verified) {
        setSuccess("Code vérifié avec succès");
        setActiveStep(2);
      } else {
        setError("Code invalide. Veuillez réessayer.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Code invalide ou expiré. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  // Étape 3 : Réinitialiser le mot de passe
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const requestData = {
        code: code.trim(),
        newPassword: newPassword,
      };
      
      if (resetMethod === "phone") {
        requestData.phone = formatPhone(phone);
      } else {
        requestData.email = email.trim().toLowerCase();
      }

      const response = await axios.post(`${BASE_URL}/auth/reset-password`, requestData);

      setSuccess(response.data.message || "Mot de passe réinitialisé avec succès");
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la réinitialisation. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setPhone("");
    setEmail("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setResetMethod("phone");
    setLoading(false);
    onClose();
  };

  const isNextDisabled = useMemo(() => {
    if (loading) {
      return true;
    }

    if (activeStep === 0) {
      if (resetMethod === "phone") {
        return phone.length !== 8;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !email.trim() || !emailRegex.test(email.trim());
      }
    }

    if (activeStep === 1) {
      return code.trim().length !== 6;
    }

    return newPassword.length < 6 || newPassword !== confirmPassword;
  }, [activeStep, phone, email, code, newPassword, confirmPassword, loading, resetMethod]);

  const handleNext = () => {
    if (activeStep === 0) {
      handleRequestReset();
    } else if (activeStep === 1) {
      handleVerifyCode();
    } else if (activeStep === 2) {
      handleResetPassword();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError("");
    setSuccess("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 55%, #27AE60 165%)",
          color: "white",
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockReset />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800}>
            Mot de passe oublié
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Réinitialisez votre accès en 3 étapes
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 3, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
        <Box sx={{ mb: 3 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              "& .MuiStepLabel-label": { fontWeight: 600, fontSize: "0.78rem" },
              "& .MuiStepIcon-root.Mui-active": { color: "#27AE60" },
              "& .MuiStepIcon-root.Mui-completed": { color: "#0D2B4E" },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Étape 1 : Numéro de téléphone ou email */}
        {activeStep === 0 && (
          <Box>
            <Box sx={{ display: "flex", p: 0.5, borderRadius: 2.5, bgcolor: "#f1f4f9", mb: 2 }}>
              {[
                { key: "phone", label: "Téléphone", icon: <PhoneIcon /> },
                { key: "email", label: "Email", icon: <EmailIcon /> },
              ].map((m) => (
                <Button
                  key={m.key}
                  fullWidth
                  disableElevation
                  startIcon={m.icon}
                  onClick={() => {
                    setResetMethod(m.key);
                    if (m.key === "phone") setEmail("");
                    else setPhone("");
                    setError("");
                  }}
                  sx={{
                    py: 0.9,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    color: resetMethod === m.key ? "#0D2B4E" : "text.secondary",
                    bgcolor: resetMethod === m.key ? "#fff" : "transparent",
                    boxShadow: resetMethod === m.key ? "0 2px 8px rgba(13,43,78,0.10)" : "none",
                    "&:hover": { bgcolor: resetMethod === m.key ? "#fff" : "rgba(0,0,0,0.03)" },
                  }}
                >
                  {m.label}
                </Button>
              ))}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {resetMethod === "phone" 
                ? "Entrez votre numéro de téléphone. Nous vous enverrons un code de vérification par SMS."
                : "Entrez votre adresse email. Nous vous enverrons un code de vérification par email."}
            </Typography>

            {resetMethod === "phone" ? (
              <TextField
                fullWidth
                label="Numéro de téléphone"
                value={phone}
                onChange={(e) => setPhone(sanitizeLocalPhone(e.target.value))}
                margin="normal"
                required
                placeholder="XXXXXXXX"
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 1, color: "text.secondary" }}>
                      +227
                    </Typography>
                  ),
                }}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 8,
                }}
                helperText="Numéro de téléphone Niger, 8 chiffres"
              />
            ) : (
              <TextField
                fullWidth
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                placeholder="exemple@email.com"
                helperText="Adresse email de votre compte"
              />
            )}
          </Box>
        )}

        {/* Étape 2 : Code de vérification */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Entrez le code à 6 chiffres que vous avez reçu par {resetMethod === "phone" ? "SMS" : "email"} {resetMethod === "phone" ? `au numéro` : `à l'adresse`}{" "}
              <strong>{resetMethod === "phone" ? formatPhone(phone) : email}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Code de vérification"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(value);
              }}
              margin="normal"
              required
              placeholder="123456"
              inputProps={{ maxLength: 6, style: { letterSpacing: "0.4em", textAlign: "center", fontSize: "1.3rem", fontWeight: 700 } }}
            />
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => {
                setActiveStep(0);
                setCode("");
                setError("");
                setSuccess("");
              }}
              sx={{ mt: 1 }}
            >
              Renvoyer le code
            </Link>
          </Box>
        )}

        {/* Étape 3 : Nouveau mot de passe */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Entrez votre nouveau mot de passe.
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                required
                helperText="Minimum 6 caractères"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                        }
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary" }}>
          Annuler
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading} sx={{ textTransform: "none", fontWeight: 600, color: "#0D2B4E" }}>
            Retour
          </Button>
        )}
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={isNextDisabled}
          endIcon={loading && <CircularProgress size={20} color="inherit" />}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            px: 3,
            background: "linear-gradient(135deg, #0D2B4E 0%, #27AE60 160%)",
            "&:hover": { background: "linear-gradient(135deg, #0a2240 0%, #229152 160%)" },
            "&:disabled": { background: "#c7cfdb", color: "#fff" },
          }}
        >
          {loading
            ? "En cours..."
            : activeStep === 0
            ? "Envoyer le code"
            : activeStep === 1
            ? "Vérifier"
            : "Réinitialiser"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordModal;

