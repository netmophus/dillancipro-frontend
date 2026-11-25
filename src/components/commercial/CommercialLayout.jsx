import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  Landscape,
  CheckCircle,
  Layers,
  Apartment,
  Gavel,
  Payments,
  PersonAdd,
  AccountCircle,
  Badge as BadgeIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";

const DRAWER_WIDTH = 268;

// Sections de navigation de l'espace commercial
const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { label: "Tableau de bord", route: "/agence/commercial/dashboard", icon: Dashboard, color: "#5b6ee8" },
    ],
  },
  {
    title: "Parcelles",
    items: [
      { label: "À vendre", route: "/commercial/parcelles-non-vendues", icon: Landscape, color: "#4caf50" },
      { label: "Vendues", route: "/commercial/parcelles-vendues", icon: CheckCircle, color: "#2e7d32" },
      { label: "Mes îlots", route: "/commercial/mes-ilots", icon: Layers, color: "#9c27b0" },
    ],
  },
  {
    title: "Biens & ventes",
    items: [
      { label: "Mes biens", route: "/commercial/mes-biens", icon: Apartment, color: "#673ab7" },
      { label: "Mes ventes", route: "/commercial/mes-ventes", icon: Gavel, color: "#7b1fa2" },
      { label: "Paiements partiels", route: "/commercial/paiements-partiels", icon: Payments, color: "#ff9800" },
    ],
  },
  {
    title: "Clients",
    items: [
      { label: "Inscrire un client", route: "/commercial/inscrire-client", icon: PersonAdd, color: "#1976d2" },
    ],
  },
  {
    title: "Compte",
    items: [
      { label: "Mon profil", route: "/commercial/mon-profil", icon: AccountCircle, color: "#607d8b" },
    ],
  },
];

const CommercialLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (route) =>
    location.pathname === route || location.pathname.startsWith(route + "/");

  const go = (route) => {
    navigate(route);
    setMobileOpen(false);
  };

  const SidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0D2B4E",
        color: "rgba(255,255,255,0.92)",
      }}
    >
      {/* En-tête commercial */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "#27AE60", width: 44, height: 44 }}>
          <BadgeIcon />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            Espace Commercial
          </Typography>
          <Chip
            label={typeof user?.role === "string" ? user.role : user?.role?.name || "Commercial"}
            size="small"
            sx={{ bgcolor: "rgba(39,174,96,0.2)", color: "#7Ce0a3", height: 20, fontSize: "0.7rem" }}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {NAV_SECTIONS.map((section, sIdx) => (
          <Box key={sIdx} sx={{ mb: 1 }}>
            {section.title && (
              <Typography
                variant="overline"
                sx={{
                  px: 2.5,
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.68rem",
                  letterSpacing: 1,
                }}
              >
                {section.title}
              </Typography>
            )}
            <List dense disablePadding>
              {section.items.map((item) => {
                const active = isActive(item.route);
                return (
                  <ListItemButton
                    key={item.route}
                    onClick={() => go(item.route)}
                    sx={{
                      mx: 1.25,
                      my: 0.25,
                      borderRadius: 1.5,
                      bgcolor: active ? "rgba(39,174,96,0.18)" : "transparent",
                      borderLeft: active ? `3px solid ${item.color}` : "3px solid transparent",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38, color: active ? item.color : "rgba(255,255,255,0.65)" }}>
                      <item.icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.86rem",
                        fontWeight: active ? 700 : 500,
                        color: active ? "#fff" : "rgba(255,255,255,0.85)",
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
          Géofoncier • Espace Commercial
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#eef2f7" }}>
      <Navbar />

      <Box sx={{ display: "flex", flex: 1, alignItems: "flex-start" }}>
        {/* Sidebar permanente (desktop) */}
        <Box
          component="nav"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
            position: "sticky",
            top: 0,
            alignSelf: "stretch",
          }}
        >
          <Box sx={{ position: "sticky", top: 0, height: "100vh" }}>{SidebarContent}</Box>
        </Box>

        {/* Sidebar temporaire (mobile) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
          }}
        >
          {SidebarContent}
        </Drawer>

        {/* Contenu principal */}
        <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 1.5, sm: 2.5, md: 3 } }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, mb: 1 }}>
            <Tooltip title="Menu">
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ bgcolor: "#0D2B4E", color: "white", "&:hover": { bgcolor: "#1B5285" } }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {children}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default CommercialLayout;
