import React from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * Logo Dillanci — image /images/logo-immo.png
 * L'image source a de larges marges blanches : on la recadre sur le contenu
 * et on la pose sur une plaque blanche arrondie (lisible sur la navbar sombre).
 */
const LogoCSS = ({ size = "md" }) => {
  // "float" : logo agrandi, responsive, destiné à déborder sous la navbar
  const RATIO = 1.544;
  const heights = {
    sm: 40,
    md: 52,
    lg: 80,
    float: { xs: 64, sm: 80, md: 100 },
  };
  const h = heights[size] ?? heights.md;
  const toWidth = (v) => Math.round(v * RATIO);
  const height = h;
  const width =
    typeof h === "object"
      ? Object.fromEntries(Object.entries(h).map(([k, v]) => [k, toWidth(v)]))
      : toWidth(h);
  const floating = size === "float";

  return (
    <Box
      component={Link}
      to="/"
      sx={{
        display: "inline-block",
        textDecoration: "none",
        cursor: "pointer",
        userSelect: "none",
        transition: "opacity 0.2s ease",
        "&:hover": { opacity: 0.9 },
      }}
    >
      <Box
        sx={{
          width,
          height,
          overflow: "hidden",
          borderRadius: "8px",
          bgcolor: "#ffffff",
          flexShrink: 0,
          boxShadow: floating ? "0 8px 22px rgba(14,17,51,0.35)" : "none",
        }}
      >
        <Box
          component="img"
          src="/images/logo-immo.png"
          alt="Dillanci"
          sx={{
            display: "block",
            width: "146.3%",
            maxWidth: "none",
            ml: "-22.86%",
            mt: "-18.1%",
          }}
        />
      </Box>
    </Box>
  );
};

export default LogoCSS;
