import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockReset,
  Close,
  Check,
  CheckCircle,
  CheckCircleOutline,
  RadioButtonUnchecked,
  PhoneOutlined,
  EmailOutlined,
  LockOutlined,
  SendOutlined,
  MarkEmailRead,
  VerifiedUser,
} from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../config/config";

const steps = ["Entrer le contact", "Vérifier le code", "Nouveau mot de passe"];

const ForgotPasswordModal = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetMethod, setResetMethod] = useState("phone"); // "phone" ou "email"
  const [done, setDone] = useState(false); // vrai uniquement après la réponse positive du serveur
  const otpRefs = useRef([]);
  const contentRef = useRef(null);

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
      setDone(true);
      
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
    setDone(false);
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

  const GREEN = "#008557";
  const GREEN_DEEP = "#005C48";
  const GREEN_LIGHT = "#DCF5E5";
  const NIGHT = "#101C36";
  const GREY = "#EEF1F4";
  const MUTED = "#64748B";
  const BORDER = "#D5DCE3";
  const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

  const labelSx = { display: "block", mb: 0.75, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: NIGHT };
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      fontFamily: FONT,
      fontSize: 16,
      minHeight: 54,
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

  // Masquage d'affichage uniquement : la valeur réelle n'est jamais modifiée
  const maskedContact =
    resetMethod === "phone"
      ? (() => {
          const d = formatPhone(phone).replace("+227", "");
          return d.length === 8 ? `+227 ** ** ${d.slice(4, 6)} ${d.slice(6)}` : formatPhone(phone);
        })()
      : (() => {
          const [name, domain] = email.trim().split("@");
          return domain ? `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 3))}@${domain}` : email;
        })();

  // Chaque changement d'étape repart du haut de la fenêtre
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeStep, done]);

  const handleCodeChange = (index, raw) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    const next = (code.slice(0, index) + digits).slice(0, 6);
    setCode(next);
    const target = Math.min(next.length, 5);
    otpRefs.current[target]?.focus();
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (code[index]) {
        setCode(code.slice(0, index) + code.slice(index + 1));
      } else if (index > 0) {
        setCode(code.slice(0, index - 1) + code.slice(index));
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    setCode(digits);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const stepperSteps = steps.map((label, i) => {
    const complete = done || i < activeStep;
    const active = !done && i === activeStep;
    return { label, i, complete, active };
  });

  const stepTitle =
    activeStep === 1 ? "Vérifiez votre code" : activeStep === 2 ? "Définissez votre nouveau mot de passe" : null;
  const StepIcon = activeStep === 1 ? MarkEmailRead : LockOutlined;

  const passwordRules = [
    { ok: newPassword.length >= 6, label: "Minimum 6 caractères" },
    { ok: confirmPassword.length > 0 && newPassword === confirmPassword, label: "Les deux mots de passe sont identiques" },
  ];

  const passwordField = (id, label, key, value, setValue, withHelper) => (
    <Box>
      <Typography component="label" htmlFor={id} sx={labelSx}>{label} *</Typography>
      <TextField
        id={id}
        fullWidth
        type={showPasswords[key] ? "text" : "password"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        placeholder={key === "new" ? "Entrez votre nouveau mot de passe" : "Confirmez votre mot de passe"}
        InputProps={{
          startAdornment: iconAdornment(LockOutlined),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={showPasswords[key] ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }))}
              >
                {showPasswords[key] ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={fieldSx}
      />
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      aria-labelledby="forgot-password-title"
      PaperProps={{
        sx: {
          m: 2,
          width: "calc(100% - 32px)",
          maxWidth: 760,
          maxHeight: "calc(100dvh - 32px)",
          borderRadius: "20px",
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "0 12px 40px rgba(16,28,54,0.18)",
          fontFamily: FONT,
        },
      }}
    >
      {/* En-tête */}
      <Box sx={{ bgcolor: GREEN_DEEP, color: "#fff", p: { xs: 2, sm: 3 }, display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
        <Box sx={{ width: { xs: 44, sm: 52 }, height: { xs: 44, sm: 52 }, borderRadius: "12px", bgcolor: "#1B7A64", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <LockReset sx={{ fontSize: { xs: 26, sm: 30 }, color: "#fff" }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id="forgot-password-title" component="h2" sx={{ fontFamily: FONT, fontSize: { xs: 21, sm: 26 }, fontWeight: 700, lineHeight: 1.2, color: "#fff" }}>
            Mot de passe oublié
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: { xs: 14, sm: 15.5 }, color: "#E2F1EC", mt: 0.25 }}>
            Réinitialisez votre accès en 3 étapes
          </Typography>
        </Box>
        <IconButton onClick={handleClose} aria-label="Fermer" sx={{ color: "#fff", flexShrink: 0, "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}>
          <Close sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      <DialogContent ref={contentRef} sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 } }}>
        {/* Indicateur de progression */}
        <Box component="ol" aria-label="Progression" sx={{ display: "flex", listStyle: "none", m: 0, p: 0, mb: { xs: 2.5, sm: 3 } }}>
          {stepperSteps.map(({ label, i, complete, active }) => (
            <Box
              component="li"
              key={label}
              aria-current={active ? "step" : undefined}
              sx={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                "&::before": i === 0 ? { display: "none" } : {
                  content: '""',
                  position: "absolute",
                  top: { xs: 17, sm: 19 },
                  right: "50%",
                  width: "100%",
                  height: 2,
                  bgcolor: complete || active ? GREEN : BORDER,
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  bgcolor: complete || active ? GREEN : GREY,
                  color: complete || active ? "#fff" : "#475569",
                }}
              >
                {complete ? <Check sx={{ fontSize: 22 }} /> : i + 1}
              </Box>
              <Typography sx={{ mt: 0.75, px: 0.5, fontFamily: FONT, fontSize: { xs: 12, sm: 13.5 }, lineHeight: 1.3, fontWeight: active ? 700 : 600, color: active ? NIGHT : complete ? NIGHT : MUTED, overflowWrap: "anywhere" }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        {error && (
          <Alert severity="error" role="alert" sx={{ mb: 2, borderRadius: "10px", fontFamily: FONT }}>
            {error}
          </Alert>
        )}

        {success && !done && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: "10px", fontFamily: FONT }}>
            {success}
          </Alert>
        )}

        {/* Confirmation de réussite (après la réponse positive du serveur) */}
        {done && (
          <Box sx={{ textAlign: "center", py: { xs: 1, sm: 2 } }}>
            <CheckCircle sx={{ fontSize: 72, color: GREEN }} />
            <Typography component="h3" sx={{ fontFamily: FONT, fontSize: { xs: 21, sm: 24 }, fontWeight: 700, color: NIGHT, mt: 1 }}>
              Mot de passe réinitialisé
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, mt: 0.75 }}>
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
            </Typography>
            <Button
              onClick={handleClose}
              variant="contained"
              disableElevation
              sx={{ mt: 2.5, height: 50, px: 4, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 16, bgcolor: GREEN, "&:hover": { bgcolor: GREEN_DEEP } }}
            >
              Se connecter
            </Button>
          </Box>
        )}

        {/* Étape 1 : Numéro de téléphone ou email */}
        {!done && activeStep === 0 && (
          <Box>
            <Box sx={{ display: "flex", p: "4px", borderRadius: "12px", bgcolor: GREY, gap: "4px", mb: 2.5 }}>
              {[
                { key: "phone", label: "Téléphone", Icon: PhoneOutlined },
                { key: "email", label: "Email", Icon: EmailOutlined },
              ].map((m) => {
                const actif = resetMethod === m.key;
                return (
                  <Button
                    key={m.key}
                    fullWidth
                    disableElevation
                    startIcon={<m.Icon sx={{ fontSize: 20 }} />}
                    aria-pressed={actif}
                    onClick={() => {
                      setResetMethod(m.key);
                      if (m.key === "phone") setEmail("");
                      else setPhone("");
                      setError("");
                    }}
                    sx={{
                      height: 48,
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
                    {m.label}
                  </Button>
                );
              })}
            </Box>

            <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, mb: 2.5, lineHeight: 1.55 }}>
              {resetMethod === "phone"
                ? "Entrez votre numéro de téléphone. Nous vous enverrons un code de vérification par SMS."
                : "Entrez votre adresse email. Nous vous enverrons un code de vérification par email."}
            </Typography>

            {resetMethod === "phone" ? (
              <Box>
                <Typography component="label" htmlFor="fp-phone" sx={labelSx}>Numéro de téléphone *</Typography>
                <TextField
                  id="fp-phone"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(sanitizeLocalPhone(e.target.value))}
                  required
                  placeholder="90 12 34 56"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "stretch", height: "auto", maxHeight: "none", m: 0, ml: "-14px", mr: 1.5, px: 1.75, bgcolor: GREY, borderRight: `1px solid ${BORDER}`, borderRadius: "10px 0 0 10px" }}
                      >
                        <Box component="span" sx={{ fontFamily: FONT, fontWeight: 700, color: NIGHT }}>+227</Box>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 8 }}
                  helperText="Numéro de téléphone Niger, 8 chiffres."
                  sx={fieldSx}
                />
              </Box>
            ) : (
              <Box>
                <Typography component="label" htmlFor="fp-email" sx={labelSx}>Adresse email *</Typography>
                <TextField
                  id="fp-email"
                  fullWidth
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Entrez votre adresse email"
                  InputProps={{ startAdornment: iconAdornment(EmailOutlined) }}
                  helperText="Adresse email de votre compte."
                  sx={fieldSx}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Étape 2 : Code de vérification */}
        {!done && activeStep === 1 && (
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: GREEN_LIGHT, color: GREEN, display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
              <StepIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography component="h3" sx={{ fontFamily: FONT, fontSize: { xs: 20, sm: 22 }, fontWeight: 700, color: NIGHT }}>{stepTitle}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, mt: 0.75, mb: 2.5, lineHeight: 1.55, overflowWrap: "anywhere" }}>
              Entrez le code à 6 chiffres que vous avez reçu par {resetMethod === "phone" ? "SMS au numéro" : "email à l'adresse"}{" "}
              <Box component="strong" sx={{ color: NIGHT }}>{maskedContact}</Box>
            </Typography>
            <Box
              role="group"
              aria-label="Code de vérification à 6 chiffres"
              sx={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: { xs: "6px", sm: "12px" }, maxWidth: 420, mx: "auto" }}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <Box
                  key={i}
                  component="input"
                  ref={(el) => { otpRefs.current[i] = el; }}
                  value={code[i] || ""}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  onPaste={handleCodePaste}
                  onFocus={(e) => e.target.select()}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  aria-label={`Chiffre ${i + 1} sur 6`}
                  autoFocus={i === 0}
                  sx={{
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    height: { xs: 50, sm: 58 },
                    p: 0,
                    textAlign: "center",
                    fontFamily: FONT,
                    fontSize: { xs: 22, sm: 26 },
                    fontWeight: 700,
                    color: NIGHT,
                    bgcolor: "#fff",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "10px",
                    outline: "none",
                    "&:focus": { borderColor: GREEN, boxShadow: `0 0 0 1px ${GREEN}` },
                  }}
                />
              ))}
            </Box>
            <Link
              component="button"
              type="button"
              onClick={() => {
                setActiveStep(0);
                setCode("");
                setError("");
                setSuccess("");
              }}
              sx={{ mt: 2.5, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: GREEN, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              Renvoyer le code
            </Link>
          </Box>
        )}

        {/* Étape 3 : Nouveau mot de passe */}
        {!done && activeStep === 2 && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: GREEN_LIGHT, color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <StepIcon sx={{ fontSize: 24 }} />
              </Box>
              <Typography component="h3" sx={{ fontFamily: FONT, fontSize: { xs: 18, sm: 21 }, fontWeight: 700, color: NIGHT, lineHeight: 1.25 }}>{stepTitle}</Typography>
            </Box>
            <Stack spacing={2.5}>
              {passwordField("fp-new", "Nouveau mot de passe", "new", newPassword, setNewPassword)}
              {passwordField("fp-confirm", "Confirmer le mot de passe", "confirm", confirmPassword, setConfirmPassword)}
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
                {passwordRules.map((r) => (
                  <Box component="li" key={r.label} sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: FONT, fontSize: 13.5, color: r.ok ? GREEN_DEEP : MUTED }}>
                    {r.ok ? <CheckCircle sx={{ fontSize: 18, color: GREEN }} /> : <RadioButtonUnchecked sx={{ fontSize: 18 }} />}
                    {r.label}
                  </Box>
                ))}
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>

      {!done && (
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, pt: 1, gap: 1.25, flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0, "& > :not(style) ~ :not(style)": { ml: 0 } }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ flex: { xs: "1 1 100px", sm: "0 0 auto" }, height: 50, px: 3, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 600, fontSize: 15, color: NIGHT, bgcolor: "#fff", border: `1px solid ${BORDER}`, "&:hover": { bgcolor: GREY } }}
          >
            Annuler
          </Button>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={loading}
              sx={{ flex: { xs: "1 1 100px", sm: "0 0 auto" }, height: 50, px: 3, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 600, fontSize: 15, color: NIGHT, bgcolor: "#fff", border: `1px solid ${BORDER}`, "&:hover": { bgcolor: GREY } }}
            >
              Retour
            </Button>
          )}
          <Button
            onClick={handleNext}
            variant="contained"
            disableElevation
            disabled={isNextDisabled}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : activeStep === 0 ? <SendOutlined /> : activeStep === 1 ? <VerifiedUser /> : <CheckCircleOutline />}
            sx={{
              flex: { xs: "1 1 100%", sm: "0 0 auto" },
              height: 50,
              px: 3,
              borderRadius: "10px",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 15.5,
              textTransform: "none",
              bgcolor: GREEN,
              color: "#fff",
              "&:hover": { bgcolor: GREEN_DEEP },
              "&.Mui-disabled": { bgcolor: "#C7CFDB", color: "#fff" },
            }}
          >
            {loading
              ? "En cours..."
              : activeStep === 0
              ? "Envoyer le code"
              : activeStep === 1
              ? "Vérifier le code"
              : "Réinitialiser le mot de passe"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ForgotPasswordModal;
