import React, { useState, useEffect } from "react";
import LogoDillanci from "./LogoDillanci";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Tooltip,
  Chip,
  Divider,
  Drawer,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Notifications,
  Settings,
  Logout,
  Dashboard,
  Person,
  Home,
  Business,
  AccountBalance,
  Landscape,
  AttachMoney,
  Menu as MenuIcon,
  Phone,
  Email,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Gavel,
  Close as CloseIcon,
  Map as MapIcon,
  Key as KeyIcon,
  ChevronRight,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AgenceMenu from "../agence/AgenceMenu";
import NotificationPanel from "./NotificationPanel";

// Identité visuelle de l'en-tête
const NIGHT = "#101C36";
const BLUE = "#1859E8";
const BLUE_DARK = "#1346BE";
// Verts de la barre supérieure : identiques à ceux du ruban SVG de la courbe du hero (#07966B -> #2FD39B)
const TOPBAR_GREEN = "#07966B";
const TOPBAR_GREEN_LIGHT = "#2FD39B";
const GREY_LIGHT = "#F3F6FA";
const NAV_FONT = '"Plus Jakarta Sans", "Manrope", "DM Sans", system-ui, Arial, sans-serif';

// Liens de navigation : texte sobre, fond clair au survol
const navLinkSx = {
  fontFamily: NAV_FONT,
  textTransform: "none",
  fontWeight: 600,
  fontSize: 15,
  color: NIGHT,
  px: 1.5,
  py: 0.9,
  borderRadius: "10px",
  minWidth: 0,
  "& .MuiButton-startIcon": { mr: 0.75, "& > *:nth-of-type(1)": { fontSize: 18 } },
  "&:hover": { bgcolor: GREY_LIGHT, color: BLUE },
};

// Menu mobile : charte Dillanci
const M_BLUE = "#3030F9";
const M_BLUE_TEXT = "#2020C8";
const M_NIGHT = "#0e1133";
const M_GREEN = "#0A7C4F";
const M_SKY = "#EAF0FF";
const M_GREEN_LIGHT = "#E3F5EC";
const M_MUTED = "#64748B";
const M_BORDER = "#E2E8F0";

const MobileSectionLabel = ({ children }) => (
  <Typography sx={{ px: 1.5, pt: 2, pb: 0.75, fontFamily: NAV_FONT, fontSize: 12, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase", color: M_MUTED }}>
    {children}
  </Typography>
);

// Ligne de navigation : pastille d'icône, libellé, chevron
const MobileNavItem = ({ to, onClick, icon: Icon, label, iconBg = M_SKY, iconColor = M_BLUE, active = false, badge, danger = false }) => (
  <Box
    component={to ? Link : "button"}
    {...(to ? { to } : { type: "button" })}
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      width: "100%",
      boxSizing: "border-box",
      p: "10px 12px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      textDecoration: "none",
      textAlign: "left",
      fontFamily: NAV_FONT,
      bgcolor: active ? M_SKY : "transparent",
      color: danger ? "#C62828" : M_NIGHT,
      "&:hover": { bgcolor: active ? M_SKY : "#f5f7fa" },
      "&:focus-visible": { outline: `2px solid ${M_BLUE}`, outlineOffset: 1 },
    }}
  >
    <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: danger ? "#FDECEA" : iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 20, color: danger ? "#C62828" : iconColor }} />
    </Box>
    <Typography component="span" sx={{ flex: 1, minWidth: 0, fontFamily: NAV_FONT, fontSize: 15, fontWeight: active ? 700 : 600, lineHeight: 1.3, overflowWrap: "anywhere", color: "inherit" }}>
      {label}
    </Typography>
    {badge > 0 && <Chip size="small" color="error" label={badge} />}
    <ChevronRight sx={{ fontSize: 20, color: active ? M_BLUE : "#94A3B8", flexShrink: 0 }} />
  </Box>
);

const Navbar = ({ hideTopBar = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    if (user) {
      console.log("🔍 Utilisateur connecté :", user.fullName, "-", user.role);
      fetchProfilePhoto();
    }
  }, [user]);

  const fetchProfilePhoto = async () => {
    try {
      const res = await import("../../services/api");
      const api = res.default;
      const profileRes = await api.get("/user/profile");
      if (profileRes.data?.photoUrl) {
        console.log("✅ Photo de profil chargée:", profileRes.data.photoUrl);
        setProfilePhoto(profileRes.data.photoUrl);
      } else {
        console.log("ℹ️ Aucune photo de profil disponible");
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement de la photo de profil:", err);
      setProfilePhoto(null);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/login");
  };

  const handleMobileLogout = () => {
    handleMobileMenuClose();
    logout();
    navigate("/login");
  };

  // Helper pour comparer les rôles (gère objet et string)
  const hasRole = (roleName) => {
    if (!user?.role) return false;
    const userRole = typeof user.role === 'string' ? user.role : user.role?.name || '';
    return userRole.toLowerCase() === roleName.toLowerCase();
  };

  // Vérifier si l'utilisateur peut voir tous les menus (User, Client, Admin)
  const canSeeAllMenus = () => {
    if (!user) return true; // Non connecté = voir tous les menus
    return hasRole("User") || hasRole("Client") || hasRole("Admin");
  };

  const getDashboardPath = () => {
    if (!user || !user.role) return "/";
    const roleValue = typeof user.role === 'string' ? user.role : user.role?.name || '';
    const role = roleValue.toLowerCase();

    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "banque":
        return "/banque/dashboard";
      case "agence":
        return "/agence/dashboard";
      case "ministere":
        return "/ministere/dashboard";
      case "commercial":
        return "/agence/commercial/dashboard";
      case "notaire":
        return "/notaire/dashboard";
      default:
        return "/user/dashboard";
    }
  };

  const getRoleIcon = () => {
    if (!user?.role) return <Person />;
    const roleValue = typeof user.role === 'string' ? user.role : user.role?.name || '';
    const role = roleValue.toLowerCase();
    switch (role) {
      case "admin":
        return <Settings />;
      case "agence":
        return <Business />;
      case "banque":
        return <AccountBalance />;
      case "commercial":
        return <AttachMoney />;
      case "notaire":
        return <Gavel />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = () => {
    if (!user?.role) return "#607d8b";
    const roleValue = typeof user.role === 'string' ? user.role : user.role?.name || '';
    const role = roleValue.toLowerCase();
    switch (role) {
      case "admin":
        return "#9c27b0";
      case "agence":
        return "#2196f3";
      case "banque":
        return "#4caf50";
      case "commercial":
        return "#ff9800";
      case "notaire":
        return "#7b1fa2";
      default:
        return "#607d8b";
    }
  };

  return (
    <>
      {/* Barre supérieure : coordonnées sur bleu nuit, réseaux sociaux sur vert avec transition en S */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
          height: { xs: 46, sm: 54, md: 64 },
          display: hideTopBar ? "none" : "block",
          bgcolor: NIGHT,
          borderBottom: `3px solid ${TOPBAR_GREEN}`,
          overflow: "hidden",
        }}
      >
        {/* Partie verte (droite) : courbe en S en SVG, mêmes verts que le ruban du hero */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: { xs: "50%", sm: "44%", md: "40%" },
            pointerEvents: "none",
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 100 64"
            preserveAspectRatio="none"
            aria-hidden="true"
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          >
            <defs>
              <linearGradient id="topbarGreen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={TOPBAR_GREEN} />
                <stop offset="100%" stopColor={TOPBAR_GREEN_LIGHT} />
              </linearGradient>
            </defs>
            <path d="M26 0 H100 V64 H8 C 30 44, 2 20, 26 0 Z" fill="url(#topbarGreen)" />
          </Box>
        </Box>

        {/* Contenu : 60 % coordonnées, 40 % réseaux sociaux */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pl: { xs: 2, sm: 3, md: 5 },
            pr: { xs: 1.5, sm: 3, md: 5 },
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0, flexShrink: 1 }}>
            <Box component="a" href="tel:+22780648383" sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, md: 1.25 }, color: "#fff", textDecoration: "none" }}>
              <Phone sx={{ fontSize: { xs: 16, md: 22 }, color: "#fff" }} />
              <Typography sx={{ fontFamily: NAV_FONT, fontWeight: 600, color: "#fff", fontSize: { xs: 13, sm: 14, md: 16 }, whiteSpace: "nowrap" }}>
                +22780648383
              </Typography>
            </Box>
            <Box
              aria-hidden="true"
              sx={{ display: { xs: "none", sm: "block" }, width: "1px", height: { sm: 22, md: 28 }, bgcolor: "rgba(255,255,255,0.35)", mx: { sm: 2, md: 3 } }}
            />
            <Box component="a" href="mailto:contact@miznas-patrimoine.ne" sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: { sm: 0.75, md: 1.25 }, color: "#fff", textDecoration: "none", minWidth: 0 }}>
              <Email sx={{ fontSize: { sm: 18, md: 22 }, color: "#fff" }} />
              <Typography sx={{ fontFamily: NAV_FONT, color: "#fff", fontSize: { sm: 14, md: 16 }, whiteSpace: "nowrap" }}>
                contact@miznas-patrimoine.ne
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, sm: 1, md: 2 }, flexShrink: 0 }}>
            <Typography sx={{ display: { xs: "none", lg: "block" }, fontFamily: NAV_FONT, color: "#fff", fontWeight: 600, fontSize: 16, mr: 0.5, whiteSpace: "nowrap" }}>
              Suivez-nous :
            </Typography>
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Twitter, label: "Twitter" },
              { Icon: LinkedIn, label: "LinkedIn" },
              { Icon: Instagram, label: "Instagram" },
            ].map(({ Icon, label }) => (
              <IconButton
                key={label}
                aria-label={label}
                sx={{
                  width: { xs: 30, sm: 34, md: 42 },
                  height: { xs: 30, sm: 34, md: 42 },
                  p: 0,
                  bgcolor: "#fff",
                  color: TOPBAR_GREEN,
                  boxShadow: "0 2px 6px rgba(16,28,54,0.18)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    bgcolor: "#fff",
                    transform: "translateY(-2px) scale(1.07)",
                    boxShadow: "0 6px 14px rgba(16,28,54,0.28)",
                  },
                }}
              >
                <Icon sx={{ fontSize: { xs: 17, sm: 20, md: 24 } }} />
              </IconButton>
            ))}
          </Box>
        </Box>
      </Box>

      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: "#fff",
          color: NIGHT,
          borderBottom: "1px solid #E6EAF0",
          boxShadow: "0 2px 10px rgba(16,28,54,0.05)",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 64, md: 80 },
            boxSizing: "border-box",
            maxWidth: 1440,
            width: "100%",
            mx: "auto",
            px: { xs: 1.5, sm: 3, lg: 5 },
          }}
        >
        {/* Logo à gauche */}
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", ...(hideTopBar && { "@media (max-width:359px)": { flexGrow: 0, width: 160, "& > a": { transform: "scale(0.8)", transformOrigin: "left center" } } }) }}>
          <LogoDillanci />
        </Box>

        {user ? (
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Lien Parcelles - Visible seulement pour User/Client/Admin */}
            {canSeeAllMenus() && (
              <Button
                color="inherit"
                component={Link}
                to="/parcelles"
                startIcon={<Landscape />}
                sx={{
                  display: { xs: "none", md: "flex" },
                  ...navLinkSx,
                }}
              >
                Parcelles à vendre
              </Button>
            )}

            {/* Lien Locations - Visible seulement pour User/Client/Admin */}
            {canSeeAllMenus() && (
              <Button
                color="inherit"
                component={Link}
                to="/locations"
                startIcon={<Home />}
                sx={{
                  display: { xs: "none", md: "flex" },
                  ...navLinkSx,
                }}
              >
                Locations
              </Button>
            )}

            {/* Lien Biens à vendre - Visible seulement pour User/Client/Admin */}
            {canSeeAllMenus() && (
              <Button
                color="inherit"
                component={Link}
                to="/biens"
                startIcon={<Business />}
                sx={{
                  display: { xs: "none", md: "flex" },
                  ...navLinkSx,
                }}
              >
                Biens à vendre
              </Button>
            )}

            {/* Bouton Dashboard - Toujours visible pour les utilisateurs connectés */}
            <Button
              color="inherit"
              component={Link}
              to={getDashboardPath()}
              startIcon={<Dashboard />}
              aria-current={pathname === getDashboardPath() ? "page" : undefined}
              sx={{
                display: { xs: "none", md: "flex" },
                ...navLinkSx,
                ...(pathname === getDashboardPath() && { bgcolor: "rgba(24,89,232,0.10)", color: BLUE, fontWeight: 700 }),
              }}
            >
              Dashboard
            </Button>

            {/* Menu Agence - Toujours visible pour les agences */}
            {hasRole("Agence") && (
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <AgenceMenu />
              </Box>
            )}

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                sx={{ display: { xs: "none", sm: "block" } }}
                onClick={() => setNotificationPanelOpen(true)}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Chip Rôle */}
            <Chip
              icon={getRoleIcon()}
              label={typeof user.role === 'string' ? user.role : user.role?.name || 'User'}
              sx={{
                bgcolor: getRoleColor(),
                color: "white",
                fontWeight: "bold",
                display: { xs: "none", md: "flex" },
                "& .MuiChip-icon": { color: "white" },
              }}
              size="small"
            />

            {/* Avatar + Menu */}
            <Tooltip title="Mon compte">
            <IconButton
              size="large"
              edge="end"
              onClick={handleMenu}
                sx={{
                  ml: 1,
                  border: "2px solid #E6EAF0",
                }}
              >
                <Avatar
                  src={profilePhoto}
                  sx={{
                    bgcolor: getRoleColor(),
                    width: 40,
                    height: 40,
                    fontWeight: "bold",
                  }}
                >
                  {!profilePhoto && (user.fullName || user.phone || "U").charAt(0).toUpperCase()}
                </Avatar>
            </IconButton>
            </Tooltip>

            {/* Menu utilisateur */}
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 250,
                  borderRadius: 2,
                  overflow: "visible",
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
            >
              {/* En-tête du menu */}
              <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {user.fullName || "Utilisateur"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.phone}
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    icon={getRoleIcon()}
                    label={typeof user.role === 'string' ? user.role : user.role?.name || 'User'}
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(),
                      color: "white",
                      "& .MuiChip-icon": { color: "white" },
                    }}
                  />
                </Box>
              </Box>

              <Divider />

              {/* Menu items */}
              <MenuItem
                component={Link}
                to={getDashboardPath()}
                onClick={handleClose}
                sx={{ py: 1.5 }}
              >
                <ListItemIcon>
                  <Dashboard fontSize="small" />
                </ListItemIcon>
                <ListItemText>Dashboard</ListItemText>
              </MenuItem>

              <MenuItem component={Link} to="/profile" onClick={handleClose} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mon Profil</ListItemText>
              </MenuItem>

              {/* Menu spécifique Client */}
              {(hasRole("User") || hasRole("Client")) && (
                <MenuItem
                  component={Link}
                  to="/user/mon-patrimoine"
                  onClick={handleClose}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon>
                    <Landscape fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mon Patrimoine</ListItemText>
                </MenuItem>
              )}

              {/* Menu spécifique Admin */}
              {hasRole("Admin") && (
                <MenuItem
                  component={Link}
                  to="/admin/gestion-tarifs"
                  onClick={handleClose}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon>
                    <AttachMoney fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Gestion Tarifs</ListItemText>
                </MenuItem>
              )}
              {hasRole("Admin") && (
                <MenuItem
                  component={Link}
                  to="/admin/gestion-abonnements"
                  onClick={handleClose}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon>
                    <Notifications fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Abonnements</ListItemText>
                </MenuItem>
              )}

              <Divider />

              <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: "error.main" }}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Déconnexion</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
            }}
          >
            {/* Lien Parcelles - Visible même sans connexion */}
            <Button
              color="inherit"
              component={Link}
              to="/parcelles"
              startIcon={<Landscape />}
              sx={{
                ...navLinkSx,
              }}
            >
              Parcelles à vendre
            </Button>
            {/* Lien Locations - Visible même sans connexion */}
            <Button
              color="inherit"
              component={Link}
              to="/locations"
              startIcon={<Home />}
              sx={{
                ...navLinkSx,
              }}
            >
              Locations
            </Button>
            {/* Lien Biens à vendre - Visible même sans connexion */}
            <Button
              color="inherit"
              component={Link}
              to="/biens"
              startIcon={<Business />}
              sx={{
                ...navLinkSx,
              }}
            >
              Biens à vendre
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{
                ...navLinkSx,
                color: BLUE,
                bgcolor: "#fff",
                border: `1.5px solid ${BLUE}`,
                px: 2.25,
                ml: 1,
                "&:hover": { bgcolor: "#EAF1FF", color: BLUE_DARK, borderColor: BLUE_DARK },
              }}
            >
              Connexion
            </Button>
            <Button
              variant="contained"
              component={Link}
              to="/register"
              disableElevation
              sx={{
                ...navLinkSx,
                bgcolor: BLUE,
                color: "#fff",
                px: 2.25,
                boxShadow: "0 4px 12px rgba(24,89,232,0.25)",
                "&:hover": { bgcolor: BLUE_DARK, color: "#fff" },
              }}
            >
              Inscription
            </Button>
          </Box>
        )}

        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {user && (
            <>
              <IconButton
                color="inherit"
                onClick={() => setNotificationPanelOpen(true)}
                sx={hideTopBar ? { "@media (max-width:359px)": { p: "6px" } } : undefined}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                edge="end"
                onClick={handleMenu}
                sx={{
                  border: "2px solid #E6EAF0",
                  ...(hideTopBar && { "@media (max-width:359px)": { p: "4px" } }),
                }}
              >
                <Avatar
                  src={profilePhoto}
                  sx={{
                    bgcolor: getRoleColor(),
                    width: 34,
                    height: 34,
                    fontWeight: "bold",
                  }}
                >
                  {!profilePhoto && (user.fullName || user.phone || "U").charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </>
          )}
          <IconButton
            color="inherit"
            onClick={handleMobileMenuOpen}
            aria-label="menu"
            sx={{ ml: 0.5, ...(hideTopBar && { "@media (max-width:359px)": { p: "6px", ml: 0 } }) }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="right"
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        sx={{
          display: { md: "none" },
          "& .MuiDrawer-paper": {
            width: "min(88vw, 360px)",
            maxWidth: "100%",
            boxSizing: "border-box",
            bgcolor: "#fff",
            display: "flex",
            flexDirection: "column",
            height: "100dvh",
          },
        }}
      >
        {/* En-tête */}
        <Box sx={{ bgcolor: M_NIGHT, color: "#fff", flexShrink: 0, p: "14px 14px 14px 16px", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 46, height: 46, borderRadius: "12px", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Box component="svg" viewBox="0 0 64 50" aria-hidden="true" sx={{ width: 32, height: "auto", display: "block" }}>
              <rect x="44" y="6" width="5.5" height="12" rx="1" fill={M_BLUE} />
              <path d="M4 25 32 4 60 25" fill="none" stroke={M_BLUE} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 24v21a3 3 0 0 0 3 3h36a3 3 0 0 0 3-3V24" fill="none" stroke={M_BLUE} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="17" y="27" width="7" height="7" rx="1.2" fill={M_BLUE} />
              <rect x="26" y="27" width="7" height="7" rx="1.2" fill={M_BLUE} />
              <rect x="17" y="36" width="7" height="7" rx="1.2" fill={M_BLUE} />
              <rect x="26" y="36" width="7" height="7" rx="1.2" fill={M_BLUE} />
              <rect x="39" y="29" width="9" height="19" rx="1.8" fill={M_BLUE} />
            </Box>
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontFamily: NAV_FONT, fontSize: 20, fontWeight: 800, lineHeight: 1.2, color: "#fff" }}>Dillanci</Typography>
            <Typography noWrap sx={{ fontFamily: NAV_FONT, fontSize: 12.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.3 }}>Immobilier du Niger</Typography>
          </Box>
          <IconButton onClick={handleMobileMenuClose} aria-label="Fermer le menu" sx={{ width: 40, height: 40, bgcolor: "rgba(255,255,255,0.14)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.24)" } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Contenu défilant */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: "14px 14px 8px" }}>
          {!user && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                component={Link}
                to="/register"
                onClick={handleMobileMenuClose}
                disableElevation
                sx={{ flex: 1, minWidth: 0, height: 46, borderRadius: "10px", textTransform: "none", fontFamily: NAV_FONT, fontWeight: 700, fontSize: 15, bgcolor: M_BLUE, color: "#fff", "&:hover": { bgcolor: "#2424D6" } }}
              >
                Inscription
              </Button>
              <Button
                component={Link}
                to="/login"
                onClick={handleMobileMenuClose}
                disableElevation
                sx={{ flex: 1, minWidth: 0, height: 46, borderRadius: "10px", textTransform: "none", fontFamily: NAV_FONT, fontWeight: 700, fontSize: 15, bgcolor: M_SKY, color: M_BLUE_TEXT, "&:hover": { bgcolor: "#DCE6FF" } }}
              >
                Connexion
              </Button>
            </Box>
          )}

          {user && (
            <>
              <MobileSectionLabel>Mon compte</MobileSectionLabel>
              <MobileNavItem to={getDashboardPath()} onClick={handleMobileMenuClose} icon={Dashboard} label="Dashboard" active={pathname === getDashboardPath()} />
              {hasRole("Agence") && (
                <MobileNavItem to="/agence/dashboard" onClick={handleMobileMenuClose} icon={Business} label="Espace agence" active={pathname === "/agence/dashboard"} />
              )}
              <MobileNavItem
                onClick={() => {
                  setNotificationPanelOpen(true);
                  handleMobileMenuClose();
                }}
                icon={Notifications}
                label="Notifications"
                badge={notificationCount}
              />
              <MobileNavItem to="/profile" onClick={handleMobileMenuClose} icon={Person} label="Mon profil" active={pathname === "/profile"} />
              {(hasRole("User") || hasRole("Client")) && (
                <MobileNavItem to="/user/mon-patrimoine" onClick={handleMobileMenuClose} icon={Landscape} label="Mon patrimoine" active={pathname === "/user/mon-patrimoine"} />
              )}
            </>
          )}

          <MobileSectionLabel>Navigation</MobileSectionLabel>
          {!user && <MobileNavItem to="/" onClick={handleMobileMenuClose} icon={Home} label="Accueil" active={pathname === "/"} />}
          {/* Menus de recherche - Visibles seulement pour User/Client/Admin ou non connectés */}
          {(canSeeAllMenus() || !user) && (
            <>
              <MobileNavItem to="/parcelles" onClick={handleMobileMenuClose} icon={MapIcon} label="Parcelles à vendre" active={pathname === "/parcelles"} />
              <MobileNavItem to="/locations" onClick={handleMobileMenuClose} icon={KeyIcon} iconBg={M_GREEN_LIGHT} iconColor={M_GREEN} label="Rechercher des locations" active={pathname === "/locations"} />
              <MobileNavItem to="/biens" onClick={handleMobileMenuClose} icon={Business} label="Biens à vendre" active={pathname === "/biens"} />
            </>
          )}

          {user && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${M_BORDER}` }}>
              <MobileNavItem onClick={handleMobileLogout} icon={Logout} label="Déconnexion" danger />
            </Box>
          )}
        </Box>

        {/* Réseaux sociaux */}
        <Box sx={{ flexShrink: 0, p: "12px 16px 16px", borderTop: `1px solid ${M_BORDER}` }}>
          <Typography sx={{ fontFamily: NAV_FONT, fontSize: 13, fontWeight: 700, color: M_MUTED, mb: 1 }}>Suivez-nous</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Twitter, label: "Twitter" },
              { Icon: LinkedIn, label: "LinkedIn" },
              { Icon: Instagram, label: "Instagram" },
            ].map(({ Icon, label }) => (
              <IconButton key={label} aria-label={label} sx={{ width: 40, height: 40, bgcolor: M_SKY, color: M_BLUE, "&:hover": { bgcolor: "#DCE6FF" } }}>
                <Icon sx={{ fontSize: 22 }} />
              </IconButton>
            ))}
          </Box>
        </Box>
      </Drawer>
      
      {/* Panel de notifications */}
      <NotificationPanel 
        open={notificationPanelOpen} 
        onClose={() => setNotificationPanelOpen(false)} 
      />
    </>
  );
};

export default Navbar;
