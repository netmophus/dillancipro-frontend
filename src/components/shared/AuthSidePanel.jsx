import React from "react";
import { Box, Typography } from "@mui/material";
import { ShieldOutlined } from "@mui/icons-material";
import LogoDillanci from "./LogoDillanci";

const GREEN_DEEP = "#005C48";
const MINT = "#8DDBC0";
const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";
const PHOTO = "/images/login-dillanci.webp";

/**
 * Panneau de présentation des pages /login et /register (tablette et bureau).
 * Occupe toute la hauteur de l'écran : le texte s'adapte à la hauteur disponible
 * et la photographie garde une part fixe de la hauteur du panneau.
 */
const AuthSidePanel = ({ badge, badgeFilled = false, lines, mintLine, description, items }) => (
  <Box
    sx={{
      display: "none",
      "@media (min-width:768px)": { display: "flex", flex: "0 0 42%" },
      "@media (min-width:1024px)": { flex: "0 0 48%" },
      flexDirection: "column",
      minWidth: 0,
      height: "100%",
      bgcolor: GREEN_DEEP,
      color: "#fff",
    }}
  >
    {/* Présentation : se répartit dans la hauteur restante */}
    <Box
      sx={{
        flex: "1 1 auto",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "clamp(10px, 2.2vh, 24px)",
        px: { xs: 3.5, lg: 7 },
        py: "clamp(12px, 2.5vh, 32px)",
      }}
    >
      <Box sx={{ zoom: 1, "@media (max-height:800px)": { zoom: 0.88 }, "@media (max-height:700px)": { zoom: 0.78 } }}>
        <LogoDillanci color="#fff" subtitle="Plateforme immobilière du Niger" />
      </Box>

      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          alignSelf: "flex-start",
          px: 1.75,
          py: 0.75,
          borderRadius: "999px",
          bgcolor: badgeFilled ? "rgba(0,133,87,0.45)" : "transparent",
          border: `1px solid ${badgeFilled ? "rgba(255,255,255,0.35)" : MINT}`,
        }}
      >
        <ShieldOutlined sx={{ fontSize: 18, color: badgeFilled ? "#fff" : MINT }} />
        <Typography sx={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, lineHeight: 1 }}>{badge}</Typography>
      </Box>

      <Typography
        component="h1"
        sx={{
          fontFamily: FONT,
          fontWeight: 700,
          lineHeight: 1.2,
          fontSize: "clamp(26px, min(3vw, 4.6vh), 44px)",
          color: "#fff",
        }}
      >
        {lines.map((l) => (
          <React.Fragment key={l}>
            {l}
            <br />
          </React.Fragment>
        ))}
        <Box component="span" sx={{ color: MINT }}>{mintLine}</Box>
      </Typography>

      <Typography
        sx={{
          fontFamily: FONT,
          fontSize: "clamp(14px, 2.1vh, 17px)",
          lineHeight: 1.55,
          color: "#fff",
          maxWidth: 520,
        }}
      >
        {description}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 1.4vh, 14px)" }}>
        {items.map(({ Icon, titre, texte }) => (
          <Box key={titre} sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
            <Box
              sx={{
                width: "clamp(38px, 5.4vh, 48px)",
                height: "clamp(38px, 5.4vh, 48px)",
                borderRadius: "12px",
                bgcolor: "#1B7A64",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: "clamp(22px, 3.2vh, 28px)", color: "#fff" }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "clamp(14.5px, 2vh, 17px)", fontWeight: 700, lineHeight: 1.3, color: "#fff" }}>{titre}</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "clamp(12.5px, 1.8vh, 14.5px)", lineHeight: 1.35, color: "#E2F1EC" }}>{texte}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>

    {/* Photographie : part fixe de la hauteur, fondue dans le vert */}
    <Box
      sx={{
        position: "relative",
        flex: "0 0 28%",
        minHeight: 120,
        maxHeight: 360,
        overflow: "hidden",
        bgcolor: GREEN_DEEP,
      }}
    >
      <Box
        component="img"
        src={PHOTO}
        alt="Villa moderne au Niger"
        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: `linear-gradient(180deg, ${GREEN_DEEP} 0%, rgba(0,92,72,0) 100%)`,
        }}
      />
    </Box>
  </Box>
);

export default AuthSidePanel;
