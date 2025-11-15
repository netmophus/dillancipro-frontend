import React, { useState, useEffect } from "react";
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
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AccountCircle,
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
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AgenceMenu from "../agence/AgenceMenu";
import NotificationPanel from "./NotificationPanel";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
      {/* Top Bar - Contact & Social */}
      <Box
        sx={{
          bgcolor: "#000000",
          py: 1.5,
          px: 3,
          display: { xs: "none", md: "flex" },
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box display="flex" alignItems="center" gap={4}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                bgcolor: "#f44336",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#d32f2f",
                  transform: "scale(1.1)"
                }
              }}
            >
              <Phone fontSize="small" sx={{ color: "white" }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: "600", color: "white" }}>
              +22780648383
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                bgcolor: "#f44336",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#d32f2f",
                  transform: "scale(1.1)"
                }
              }}
            >
              <Email fontSize="small" sx={{ color: "white" }} />
            </Box>
            <Typography variant="body2" sx={{ color: "white", opacity: 0.9 }}>
              contact@dillancipro.ne
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" sx={{ color: "white", opacity: 0.8, mr: 2 }}>
            Suivez-nous :
          </Typography>
          <IconButton 
            size="small" 
            sx={{ 
              color: "white",
              bgcolor: "#f44336",
              borderRadius: "50%",
              width: 36,
              height: 36,
              "&:hover": { 
                bgcolor: "#d32f2f",
                transform: "scale(1.1)"
              },
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)"
            }}
          >
            <Facebook fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ 
              color: "white",
              bgcolor: "#f44336",
              borderRadius: "50%",
              width: 36,
              height: 36,
              "&:hover": { 
                bgcolor: "#d32f2f",
                transform: "scale(1.1)"
              },
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)"
            }}
          >
            <Twitter fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ 
              color: "white",
              bgcolor: "#f44336",
              borderRadius: "50%",
              width: 36,
              height: 36,
              "&:hover": { 
                bgcolor: "#d32f2f",
                transform: "scale(1.1)"
              },
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)"
            }}
          >
            <LinkedIn fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ 
              color: "white",
              bgcolor: "#f44336",
              borderRadius: "50%",
              width: 36,
              height: 36,
              "&:hover": { 
                bgcolor: "#d32f2f",
                transform: "scale(1.1)"
              },
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)"
            }}
          >
            <Instagram fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 60, md: 72 },
            px: { xs: 1.5, sm: 3 },
          }}
        >
        {/* Logo */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{ flexGrow: 1, cursor: "pointer" }}
          component={Link}
          to="/"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Avatar
            sx={{
              bgcolor: "white",
              color: "primary.main",
              width: { xs: 40, md: 46 },
              height: { xs: 40, md: 46 },
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <Landscape />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                display: { xs: "none", sm: "block" },
                letterSpacing: 0.4,
                fontSize: { sm: "1.05rem", md: "1.2rem" },
              }}
            >
              DillanciPro
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: { xs: "none", md: "block" },
                opacity: 0.9,
                fontSize: "0.7rem",
              }}
            >
              Manhajar dillancin gidaje
        </Typography>
          </Box>
        </Box>

        {user ? (
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Bouton Dashboard */}
            <Button
              color="inherit"
              component={Link}
              to={getDashboardPath()}
              startIcon={<Dashboard />}
              sx={{
                display: { xs: "none", md: "flex" },
                bgcolor: "rgba(255,255,255,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                borderRadius: 2,
                px: 2,
              }}
            >
              Dashboard
            </Button>

            {/* Menu Agence */}
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
                  border: "2px solid rgba(255,255,255,0.3)",
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
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                borderRadius: 2,
              }}
            >
              Connexion
            </Button>
            <Button
              variant="contained"
              component={Link}
              to="/register"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                borderRadius: 2,
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
                  border: "2px solid rgba(255,255,255,0.3)",
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
            sx={{ ml: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      </AppBar>
      
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 2,
          },
        }}
      >
        {user && (
          <MenuItem
            component={Link}
            to={getDashboardPath()}
            onClick={handleMobileMenuClose}
          >
            <ListItemIcon>
              <Dashboard fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </MenuItem>
        )}
        {user && hasRole("Agence") && (
          <MenuItem
            component={Link}
            to="/agence/dashboard"
            onClick={handleMobileMenuClose}
          >
            <ListItemIcon>
              <Business fontSize="small" />
            </ListItemIcon>
            <ListItemText>Espace agence</ListItemText>
          </MenuItem>
        )}
        {user && (
          <MenuItem
            onClick={() => {
              setNotificationPanelOpen(true);
              handleMobileMenuClose();
            }}
          >
            <ListItemIcon>
              <Notifications fontSize="small" />
            </ListItemIcon>
            <ListItemText>Notifications</ListItemText>
            {notificationCount > 0 && (
              <Chip
                size="small"
                color="error"
                label={notificationCount}
                sx={{ ml: 1 }}
              />
            )}
          </MenuItem>
        )}
        {user && <Divider sx={{ my: 1 }} />}
        {user && (
          <MenuItem
            component={Link}
            to="/profile"
            onClick={handleMobileMenuClose}
          >
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mon profil</ListItemText>
          </MenuItem>
        )}
        {user && (hasRole("User") || hasRole("Client")) && (
          <MenuItem
            component={Link}
            to="/user/mon-patrimoine"
            onClick={handleMobileMenuClose}
          >
            <ListItemIcon>
              <Landscape fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mon patrimoine</ListItemText>
          </MenuItem>
        )}
        {user && <Divider sx={{ my: 1 }} />}
        {user && (
          <MenuItem onClick={handleMobileLogout} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Déconnexion</ListItemText>
          </MenuItem>
        )}
        {!user && (
          <MenuItem
            component={Link}
            to="/login"
            onClick={handleMobileMenuClose}
          >
            <ListItemText>Connexion</ListItemText>
          </MenuItem>
        )}
        {!user && (
          <MenuItem
            component={Link}
            to="/register"
            onClick={handleMobileMenuClose}
          >
            <ListItemText>Inscription</ListItemText>
          </MenuItem>
        )}
        {!user && <Divider sx={{ my: 1 }} />}
        {!user && (
          <MenuItem
            component={Link}
            to="/"
            onClick={handleMobileMenuClose}
          >
            <ListItemIcon>
              <Home fontSize="small" />
            </ListItemIcon>
            <ListItemText>Accueil</ListItemText>
          </MenuItem>
        )}
      </Menu>
      
      {/* Panel de notifications */}
      <NotificationPanel 
        open={notificationPanelOpen} 
        onClose={() => setNotificationPanelOpen(false)} 
      />
    </>
  );
};

export default Navbar;
