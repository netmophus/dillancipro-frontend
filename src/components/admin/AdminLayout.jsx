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
  LocationCity,
  Business,
  AccountBalance,
  People,
  Gavel,
  Home,
  AttachMoney,
  Timer,
  VerifiedUser,
  CheckCircle,
  Menu as MenuIcon,
  Settings,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";

const DRAWER_WIDTH = 268;

// Sections de navigation de l'espace administrateur
const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { label: "Tableau de bord", route: "/admin/dashboard", icon: Dashboard, color: "#5b6ee8" },
    ],
  },
  {
    title: "Patrimoine foncier",
    items: [
      { label: "Gestion des tarifs", route: "/admin/gestion-tarifs", icon: AttachMoney, color: "#4caf50" },
      { label: "Abonnements", route: "/admin/gestion-abonnements", icon: Timer, color: "#ff9800" },
      { label: "Vérification des biens", route: "/admin/verification-biens", icon: VerifiedUser, color: "#2196f3" },
      { label: "Vérification agences", route: "/admin/verification-agences", icon: CheckCircle, color: "#00bcd4" },
      { label: "Gestion des ventes", route: "/admin/gestion-ventes", icon: Gavel, color: "#9c27b0" },
    ],
  },
  {
    title: "Gestion de la plateforme",
    items: [
      { label: "Découpage géographique", route: "/admin/geographic", icon: LocationCity, color: "#2e7d32" },
      { label: "Agences", route: "/admin/agences", icon: Business, color: "#1976d2" },
      { label: "Banques", route: "/admin/banques", icon: AccountBalance, color: "#388e3c" },
      { label: "Notaires", route: "/admin/notaires", icon: Gavel, color: "#7b1fa2" },
      { label: "Utilisateurs", route: "/admin/utilisateurs", icon: People, color: "#f57c00" },
      { label: "Locations", route: "/admin/locations", icon: Home, color: "#ff5722" },
    ],
  },
];

const AdminLayout = ({ children }) => {
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
      {/* En-tête admin */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "#27AE60", width: 44, height: 44 }}>
          <Settings />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            Administration
          </Typography>
          <Chip
            label={typeof user?.role === "string" ? user.role : user?.role?.name || "Admin"}
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
          Géofoncier • Espace Admin
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#eef2f7" }}>
      {/* Toolbar de recherche conservée en haut */}
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
          {/* Bouton menu (mobile) */}
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

export default AdminLayout;
