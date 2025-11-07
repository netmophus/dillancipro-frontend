import React from "react";
import { Typography, Box } from "@mui/material";
import PageLayout from "../../components/shared/PageLayout";
import { useAuth } from "../../contexts/AuthContext";

const MinistereDashboardPage = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <Box textAlign="center" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord - Ministère
        </Typography>
        <Typography variant="body1">
          Bonjour {user?.phone}, vous êtes connecté en tant que <strong>{user?.role}</strong>.
        </Typography>
      </Box>
    </PageLayout>
  );
};

export default MinistereDashboardPage;
