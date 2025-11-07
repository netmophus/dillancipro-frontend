import React from "react";
import { Box, Container } from "@mui/material";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PageLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#e3f2fd",
      }}
    >
      {/* Barre de navigation fixe en haut */}
      <Navbar />

      {/* Contenu central défilable */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          mt: 2,
          mb: 2,
          backgroundColor: "#e3f2fd",
        }}
      >
        <Container maxWidth="md">{children}</Container>
      </Box>

      {/* Pied de page fixe en bas */}
      <Footer />
    </Box>
  );
};

export default PageLayout;
