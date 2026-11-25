import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  Button,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add,
  AddLocationAlt,
  Apartment,
  Home,
  PersonAdd,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AgenceMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  if (user?.role !== "Agence") return null; // Accès limité au rôle Agence

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const goTo = (path) => {
    handleClose();
    navigate(path);
  };

  const items = [
    { label: "Îlot", path: "/agence/create-ilot", icon: Add },
    { label: "Parcelle", path: "/agence/create-parcelle", icon: AddLocationAlt },
    { label: "Bien immobilier", path: "/agence/create-bien", icon: Apartment },
    { label: "Mes biens", path: "/agence/mes-biens", icon: Home },
    { label: "Enrôler un commercial", path: "/agence/create-commercial", icon: PersonAdd },
  ];

  return (
    <>
      <Button color="inherit" onClick={handleOpen}>
        Gestion foncière
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {items.map((item) => (
          <MenuItem key={item.path} onClick={() => goTo(item.path)}>
            <ListItemIcon>
              <item.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default AgenceMenu;
