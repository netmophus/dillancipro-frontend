import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import {
  Business,
  Info,
  Person,
  Lock,
  LocationOn,
  Phone,
  Description,
  Inventory2,
  Star,
  Tune,
  Checklist,
  PhotoCamera,
  Visibility,
} from "@mui/icons-material";

// "#rrggbb" -> "rgba(r,g,b,a)"
const alpha = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const ICONS = {
  business: Business,
  info: Info,
  person: Person,
  lock: Lock,
  location: LocationOn,
  phone: Phone,
  description: Description,
  inventory: Inventory2,
  star: Star,
  tune: Tune,
  checklist: Checklist,
  photo: PhotoCamera,
  visibility: Visibility,
};

// Carte de section commune à tous les formulaires admin :
// fond blanc, barre colorée à gauche, ombre douce, en-tête à pastille d'icône.
const SectionCard = ({ title, color = "#3030F9", icon = "info", action, sx, children }) => {
  const Icon = ICONS[icon] || Info;
  const night = color.toLowerCase() === "#0e1133";
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: alpha(color, night ? 0.06 : 0.07),
        border: `1.5px solid ${alpha(color, night ? 0.25 : 0.3)}`,
        borderRadius: 4,
        boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
        // champs blancs pour rester lisibles sur le fond teinté
        "& .MuiOutlinedInput-root": { bgcolor: "#ffffff" },
        p: { xs: 3, md: 3.5 },
        mb: 3,
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: alpha(color, 0.15),
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ color }}>
            {title}
          </Typography>
        </Stack>
        {action}
      </Stack>
      {children}
    </Box>
  );
};

export default SectionCard;
