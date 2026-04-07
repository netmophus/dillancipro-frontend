import React from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * Logo CSS pur — MIZNAS Patrimoine
 * Icône : immeuble stylisé + étoile dorée + vague verte
 * Charte : bleu #1B5285 | vert #27AE60 | or #F5C518
 */
const LogoCSS = ({ size = "md" }) => {
  const scale = size === "sm" ? 0.75 : size === "lg" ? 1.3 : 1;
  const iconSize = Math.round(48 * scale);
  const gap = Math.round(10 * scale);

  return (
    <Box
      component={Link}
      to="/"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: `${gap}px`,
        textDecoration: "none",
        cursor: "pointer",
        userSelect: "none",
        "&:hover .logo-icon": { transform: "scale(1.05)" },
        "&:hover .logo-text-main": { opacity: 0.9 },
      }}
    >
      {/* ── ICÔNE ── */}
      <Box
        className="logo-icon"
        sx={{
          position: "relative",
          width: iconSize,
          height: iconSize,
          transition: "transform 0.25s ease",
          flexShrink: 0,
        }}
      >
        {/* Cadre extérieur — carré arrondi bleu */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            border: `${Math.round(3 * scale)}px solid #1B5285`,
            borderRadius: `${Math.round(8 * scale)}px`,
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {/* Bâtiment gauche — bleu foncé */}
        <Box sx={{
          position: "absolute",
          bottom: Math.round(12 * scale),
          left: Math.round(7 * scale),
          width: Math.round(9 * scale),
          height: Math.round(22 * scale),
          bgcolor: "#1B5285",
          borderRadius: `${Math.round(2 * scale)}px ${Math.round(2 * scale)}px 0 0`,
        }} />

        {/* Bâtiment centre-gauche — bleu clair */}
        <Box sx={{
          position: "absolute",
          bottom: Math.round(12 * scale),
          left: Math.round(18 * scale),
          width: Math.round(8 * scale),
          height: Math.round(28 * scale),
          background: "linear-gradient(180deg, #2471A3 0%, #1B5285 100%)",
          borderRadius: `${Math.round(2 * scale)}px ${Math.round(2 * scale)}px 0 0`,
        }} />

        {/* Bâtiment centre-droit — vert */}
        <Box sx={{
          position: "absolute",
          bottom: Math.round(12 * scale),
          left: Math.round(28 * scale),
          width: Math.round(8 * scale),
          height: Math.round(20 * scale),
          background: "linear-gradient(180deg, #2ECC71 0%, #27AE60 100%)",
          borderRadius: `${Math.round(2 * scale)}px ${Math.round(2 * scale)}px 0 0`,
        }} />

        {/* Sol — ligne verte */}
        <Box sx={{
          position: "absolute",
          bottom: Math.round(9 * scale),
          left: Math.round(5 * scale),
          right: Math.round(5 * scale),
          height: Math.round(3 * scale),
          bgcolor: "#27AE60",
          borderRadius: 1,
        }} />

        {/* Vague verte — pseudo-arc en bas */}
        <Box sx={{
          position: "absolute",
          bottom: Math.round(4 * scale),
          left: Math.round(5 * scale),
          right: Math.round(5 * scale),
          height: Math.round(5 * scale),
          borderBottom: `${Math.round(3 * scale)}px solid #1E8449`,
          borderRadius: "0 0 50% 50%",
        }} />

        {/* Étoile dorée — coin haut droit */}
        <Box sx={{
          position: "absolute",
          top: Math.round(3 * scale),
          right: Math.round(5 * scale),
          fontSize: Math.round(12 * scale),
          lineHeight: 1,
          color: "#F5C518",
          textShadow: "0 0 4px rgba(245,197,24,0.6)",
          fontStyle: "normal",
        }}>
          ✦
        </Box>
      </Box>

      {/* ── TEXTE ── */}
      <Box className="logo-text-main" sx={{ transition: "opacity 0.2s ease" }}>
        {/* Ligne 1 : MIZNAS Patrimoine */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, lineHeight: 1 }}>
          <Typography
            component="span"
            sx={{
              fontWeight: 900,
              fontSize: `${Math.round(18 * scale)}px`,
              color: "white",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1,
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            MIZNAS
          </Typography>
          <Typography
            component="span"
            sx={{
              fontWeight: 700,
              fontSize: `${Math.round(18 * scale)}px`,
              color: "#4CD77A",
              letterSpacing: "0.02em",
              lineHeight: 1,
              textShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            Patrimoine
          </Typography>
        </Box>

        {/* Ligne 2 : slogan */}
        <Typography
          component="p"
          sx={{
            fontSize: `${Math.round(9.5 * scale)}px`,
            color: "rgba(255,255,255,0.72)",
            letterSpacing: "0.06em",
            mt: "2px",
            lineHeight: 1,
            display: { xs: "none", sm: "block" },
          }}
        >
          La plateforme des acteurs de l&apos;immobilier
        </Typography>
      </Box>
    </Box>
  );
};

export default LogoCSS;
