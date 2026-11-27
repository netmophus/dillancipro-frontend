import React, { useEffect, useState } from "react";
import { Box, Drawer, Typography, IconButton } from "@mui/material";
import {
  Dashboard,
  Layers,
  Landscape,
  AddLocationAlt,
  LibraryAdd,
  Apartment,
  Home,
  MeetingRoom,
  AddHome,
  Gavel,
  CalendarMonth,
  PersonAdd,
  AssignmentInd,
  Storefront,
  Menu as MenuIcon,
  Close,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../shared/Navbar";

const SIDEBAR_WIDTH = 264;
const GREEN = "#008557";
const SIDEBAR_BG = "#004D40";
const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";
const DESKTOP = "@media (min-width:1024px)";

// Sections de navigation de l'espace agence
const NAV_SECTIONS = [
  {
    title: "Tableau de bord",
    items: [{ label: "Tableau de bord", route: "/agence/dashboard", icon: Dashboard }],
  },
  {
    title: "Patrimoine foncier",
    items: [
      { label: "Créer un lotissement", route: "/agence/create-lotissement", icon: Landscape },
      { label: "Créer un îlot", route: "/agence/create-ilot", icon: Layers },
      { label: "Ajouter une parcelle", route: "/agence/create-parcelle", icon: AddLocationAlt },
      { label: "Parcelles multiples", route: "/agence/create-parcelle-multiple", icon: LibraryAdd },
      { label: "Ajouter un bien", route: "/agence/create-bien", icon: Apartment },
      { label: "Mes biens", route: "/agence/mes-biens", icon: Home },
    ],
  },
  {
    title: "Locations",
    items: [
      { label: "Locations", route: "/agence/locations", icon: MeetingRoom },
      { label: "Nouvelle location", route: "/agence/locations/create", icon: AddHome },
    ],
  },
  {
    title: "Ventes & finances",
    items: [
      { label: "Mes ventes", route: "/agence/mes-ventes", icon: Gavel },
      { label: "Échéanciers", route: "/agence/echeanciers", icon: CalendarMonth },
    ],
  },
  {
    title: "Équipe commerciale",
    items: [
      { label: "Enrôler un commercial", route: "/agence/enroller-commercial", icon: PersonAdd },
      { label: "Affectations d'îlots", route: "/agence/affectations/ilots", icon: AssignmentInd },
    ],
  },
];

const AgenceLayout = ({ children, lastUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Pas de marge par défaut du navigateur : l'application occupe exactement 100dvh
  useEffect(() => {
    const previous = document.body.style.margin;
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = previous;
    };
  }, []);

  const isActive = (route) =>
    location.pathname === route || location.pathname.startsWith(route + "/");

  const go = (route) => {
    navigate(route);
    setMobileOpen(false);
  };

  const roleLabel = typeof user?.role === "string" ? user.role : user?.role?.name || "Agence";

  const sidebar = (showClose) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: SIDEBAR_BG, color: "#fff", fontFamily: FONT }}>
      {/* En-tête admin */}
      <Box sx={{ p: "18px 16px", display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid rgba(255,255,255,0.10)", flexShrink: 0 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Storefront sx={{ fontSize: 26, color: "#8DDBC0" }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>
            Espace Agence
          </Typography>
          <Typography noWrap sx={{ fontFamily: FONT, fontSize: 12.5, color: "#A7D8C9", lineHeight: 1.3 }}>
            {roleLabel}
          </Typography>
        </Box>
        {showClose && (
          <IconButton onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* Navigation (défilement propre au menu) */}
      <Box component="nav" aria-label="Navigation de l'espace agence" sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 1.5, px: 1.25 }}>
        {NAV_SECTIONS.map((section, sIdx) => (
          <Box key={sIdx} sx={{ mb: 1.5 }}>
            <Typography
              sx={{ px: 1.5, pt: 0.75, pb: 0.75, fontFamily: FONT, color: "rgba(255,255,255,0.55)", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}
            >
              {section.title}
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
              {section.items.map((item) => {
                const active = isActive(item.route);
                return (
                  <Box component="li" key={item.route}>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => go(item.route)}
                      aria-current={active ? "page" : undefined}
                      sx={{
                        width: "100%",
                        minHeight: 44,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 1.5,
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: FONT,
                        fontSize: 14.5,
                        fontWeight: active ? 600 : 500,
                        color: "#fff",
                        bgcolor: active ? GREEN : "transparent",
                        "&:hover": { bgcolor: active ? GREEN : "rgba(255,255,255,0.08)" },
                        "&:focus-visible": { outline: "2px solid #8DDBC0", outlineOffset: 1 },
                      }}
                    >
                      <item.icon sx={{ fontSize: 21, color: active ? "#fff" : "#8DDBC0", flexShrink: 0 }} />
                      <Box component="span" sx={{ minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.25 }}>{item.label}</Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.10)", textAlign: "center", flexShrink: 0 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Dillanci • Espace Agence</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column", bgcolor: "#F1F4F7", fontFamily: FONT }}>
      {/* Entête de l'application, sans le bandeau de coordonnées */}
      <Box sx={{ flexShrink: 0, position: "relative", zIndex: (t) => t.zIndex.appBar }}>
        <Navbar hideTopBar />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* Menu latéral permanent (ordinateur) */}
        <Box sx={{ display: "none", [DESKTOP]: { display: "block" }, width: SIDEBAR_WIDTH, flexShrink: 0, height: "100%" }}>
          {sidebar(false)}
        </Box>

        {/* Menu latéral en tiroir (tablette et mobile) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: false }}
          sx={{
            [DESKTOP]: { display: "none" },
            "& .MuiDrawer-paper": { width: "min(86vw, 300px)", boxSizing: "border-box", bgcolor: SIDEBAR_BG },
          }}
        >
          {sidebar(true)}
        </Drawer>

        {/* Zone principale : son propre défilement */}
        <Box component="main" sx={{ flex: 1, minWidth: 0, overflowY: "auto", overscrollBehavior: "contain" }}>
          <Box sx={{ p: { xs: "12px", sm: "16px" }, [DESKTOP]: { p: "24px" } }}>
            <Box sx={{ display: "flex", [DESKTOP]: { display: "none" }, mb: 1.5 }}>
              <Box
                component="button"
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Ouvrir le menu de l'espace agence"
                sx={{ display: "inline-flex", alignItems: "center", gap: 1, height: 42, px: 1.75, border: "none", borderRadius: "10px", cursor: "pointer", bgcolor: SIDEBAR_BG, color: "#fff", fontFamily: FONT, fontSize: 14.5, fontWeight: 600, "&:hover": { bgcolor: "#005C48" } }}
              >
                <MenuIcon sx={{ fontSize: 22 }} />
                Menu
              </Box>
            </Box>
            {children}
          </Box>
        </Box>
      </Box>

      {/* Pied de page administratif compact */}
      <Box
        component="footer"
        sx={{ flexShrink: 0, minHeight: 40, px: { xs: 1.5, sm: 3 }, py: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", columnGap: 2, bgcolor: "#fff", borderTop: "1px solid #E2E8F0", fontFamily: FONT, fontSize: 12.5, color: "#64748B" }}
      >
        <Box component="span">© {new Date().getFullYear()} Dillanci</Box>
        <Box component="span">
          {lastUpdate ? `Dernière actualisation : ${new Date(lastUpdate).toLocaleString("fr-FR")} · ` : ""}Espace Agence
        </Box>
      </Box>
    </Box>
  );
};

export default AgenceLayout;
