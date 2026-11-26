import React from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const BLUE = "#1859E8";
const FONT = '"Plus Jakarta Sans", "Manrope", "DM Sans", system-ui, Arial, sans-serif';

/**
 * Logo Dillanci : maison architecturale (toit incliné, cheminée, fenêtres, porte)
 * + mot-symbole italique gras + sous-titre. Fond transparent, environ 240 px de large.
 * Le texte reste du HTML pour profiter de la police du site.
 * Version autonome du logo : /images/logo-dillanci.svg
 */
const LogoDillanci = ({ scale = 1, color = BLUE, subtitle = "Plateforme immobilière du Niger" }) => (
  <Box
    component={Link}
    to="/"
    aria-label="Dillanci, plateforme immobilière du Niger, accueil"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: `${10 * scale}px`,
      textDecoration: "none",
      userSelect: "none",
      flexShrink: 0,
      width: { xs: 200 * scale, md: 240 * scale },
    }}
  >
    <Box
      component="svg"
      viewBox="0 0 64 50"
      aria-hidden="true"
      sx={{ width: { xs: 50, md: 62 }, height: "auto", display: "block", flexShrink: 0 }}
    >
      {/* Toiture inclinée + cheminée */}
      <rect x="44" y="6" width="5.5" height="12" rx="1" fill={color} />
      <path d="M4 25 32 4 60 25" fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Corps de la maison */}
      <path d="M11 24v21a3 3 0 0 0 3 3h36a3 3 0 0 0 3-3V24" fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Fenêtres (4 carreaux) */}
      <rect x="17" y="27" width="7" height="7" rx="1.2" fill={color} />
      <rect x="26" y="27" width="7" height="7" rx="1.2" fill={color} />
      <rect x="17" y="36" width="7" height="7" rx="1.2" fill={color} />
      <rect x="26" y="36" width="7" height="7" rx="1.2" fill={color} />
      {/* Porte */}
      <rect x="39" y="29" width="9" height="19" rx="1.8" fill={color} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        component="span"
        sx={{
          display: "block",
          fontFamily: FONT,
          fontWeight: 800,
          fontStyle: "italic",
          fontSize: { xs: 28, md: 34 },
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color,
        }}
      >
        Dillanci
      </Typography>
      <Typography
        component="span"
        sx={{
          display: "block",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: { xs: 9.5, md: 11 },
          lineHeight: 1.2,
          mt: 0.5,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  </Box>
);

export default LogoDillanci;
