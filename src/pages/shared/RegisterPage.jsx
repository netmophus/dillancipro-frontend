import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import PageLayout from "../../components/shared/PageLayout";
import { InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";


const roles = ["Admin", "Banque", "Agence", "Ministere", "Commercial", "User"];





  const formatPhone = (rawPhone) => {
    // Supprime les espaces éventuels et ajoute le préfixe
    const cleaned = rawPhone.replace(/\s+/g, "");
    return cleaned.startsWith("+227") ? cleaned : `+227${cleaned}`;
  };
  


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    role: "",
  });
  const navigate = useNavigate();


  const [showPassword, setShowPassword] = useState(false);

const togglePasswordVisibility = () => {
  setShowPassword((prev) => !prev);
};


  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        phone: formatPhone(formData.phone),
      };
      await axios.post(`${BASE_URL}/auth/register`, dataToSend);
      navigate("/login");
    } catch (error) {
      console.error("Erreur d'inscription :", error.response?.data?.message);
    }
  };

  return (
    <PageLayout>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Création de compte
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
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
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            S'inscrire
          </Button>
        </Box>
      </Container>
      </PageLayout>
  );
};

export default RegisterPage;
