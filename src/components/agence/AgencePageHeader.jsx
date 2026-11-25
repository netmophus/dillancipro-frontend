import React from "react";
import { Card, CardContent, Stack, Avatar, Box, Typography } from "@mui/material";

/**
* En-tête de page réutilisable pour l'espace agence.
* Reprend le bandeau dégradé du tableau de bord pour une identité cohérente.
*
* @param {React.ElementType} icon  Icône MUI affichée dans l'avatar
* @param {string} title            Titre principal
* @param {string} subtitle         Sous-titre / description
* @param {React.ReactNode} action  Contenu optionnel aligné à droite (bouton, chips…)
*/
const AgencePageHeader = ({ icon: Icon, title, subtitle, action }) => (
  <Card
    elevation={0}
    sx={{
      mb: 3.5,
      borderRadius: 4,
      background: "linear-gradient(135deg, #0D2B4E 0%, #1B5285 55%, #27AE60 165%)",
      color: "white",
    }}
  >
    <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Stack direction="row" alignItems="center" spacing={2.5} sx={{ minWidth: 0 }}>
          {Icon && (
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "rgba(255,255,255,0.15)",
                border: "3px solid rgba(255,255,255,0.35)",
              }}
            >
              <Icon fontSize="large" />
            </Avatar>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" fontWeight="bold" noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action}
      </Stack>
    </CardContent>
  </Card>
);

export default AgencePageHeader;
