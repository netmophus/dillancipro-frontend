import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AgenceMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  if (user?.role !== "Agence") return null; // 🔒 Accès limité au rôle Agence

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const goTo = (path) => {
    handleClose();
    navigate(path);
  };

  return (
    <>
      <Button color="inherit" onClick={handleOpen}>
        Gestion foncière
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {/* Villes, quartiers et zones gérés par l'admin */}
        <MenuItem onClick={() => goTo("/agence/create-ilot")}>➕ Îlot</MenuItem>
        <MenuItem onClick={() => goTo("/agence/create-parcelle")}>➕ Parcelle</MenuItem>
        <MenuItem onClick={() => goTo("/agence/create-bien")}>🏡 Bien immobilier</MenuItem>
        <MenuItem onClick={() => goTo("/agence/mes-biens")}>📋 Mes biens</MenuItem>
        <MenuItem onClick={() => goTo("/agence/create-commercial")}>👥 Enrôler un commercial</MenuItem>
      </Menu>
    </>
  );
};

export default AgenceMenu;
