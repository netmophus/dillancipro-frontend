import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../config/config";

const steps = ["Entrer le numéro", "Vérifier le code", "Nouveau mot de passe"];

const ForgotPasswordModal = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Étape 1 : Numéro de téléphone
  const [phone, setPhone] = useState("");
  
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
    if (!phone || phone.trim() === "") {
      setError("Veuillez entrer votre numéro de téléphone");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
        phone: formatPhone(phone),
      });

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
      setError("Veuillez entrer le code reçu par SMS");
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
      const response = await axios.post(`${BASE_URL}/auth/verify-reset-code`, {
        phone: formatPhone(phone),
        code: code.trim(),
      });

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
      const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
        phone: formatPhone(phone),
        code: code.trim(),
        newPassword: newPassword,
      });

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
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setLoading(false);
    onClose();
  };

  const isNextDisabled = useMemo(() => {
    if (loading) {
      return true;
    }

    if (activeStep === 0) {
      return phone.length !== 8;
    }

    if (activeStep === 1) {
      return code.trim().length !== 6;
    }

    return newPassword.length < 6 || newPassword !== confirmPassword;
  }, [activeStep, phone, code, newPassword, confirmPassword, loading]);

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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Mot de passe oublié</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
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

        {/* Étape 1 : Numéro de téléphone */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Entrez votre numéro de téléphone. Nous vous enverrons un code de
              vérification par SMS.
            </Typography>
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
          </Box>
        )}

        {/* Étape 2 : Code de vérification */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Entrez le code à 6 chiffres que vous avez reçu par SMS au numéro{" "}
              <strong>{formatPhone(phone)}</strong>
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
              inputProps={{ maxLength: 6 }}
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
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Retour
          </Button>
        )}
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={isNextDisabled}
          endIcon={loading && <CircularProgress size={20} />}
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

