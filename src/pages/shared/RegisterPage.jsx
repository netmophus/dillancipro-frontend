import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import PageLayout from "../../components/shared/PageLayout";
import { Visibility, VisibilityOff } from "@mui/icons-material";


const roles = ["Admin", "Banque", "Agence", "Ministere", "Commercial", "User"];





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
    role: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();


  const [showPassword, setShowPassword] = useState(false);

const togglePasswordVisibility = () => {
  setShowPassword((prev) => !prev);
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
    try {
      const dataToSend = {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formatPhone(formData.phone),
      };
      await axios.post(`${BASE_URL}/auth/register`, dataToSend);
      setSuccessMessage("✅ Compte créé avec succès. Redirection en cours...");
      setTimeout(() => navigate("/login"), 1500);
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
          Création de compte
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
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
          />
        <TextField
            fullWidth
            label="Téléphone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            required
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

          <TextField
            fullWidth
            select
            label="Rôle"
            name="role"
            value={formData.role}
            onChange={handleChange}
            margin="normal"
            required
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
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
      </Container>
      </PageLayout>
  );
};

export default RegisterPage;
