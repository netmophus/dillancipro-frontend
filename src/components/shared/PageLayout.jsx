// import React from "react";
// import { Box, Container } from "@mui/material";
// import Navbar from "./Navbar";
// import Footer from "./Footer";

// const PageLayout = ({ children }) => {
//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         backgroundColor: "#e3f2fd",
//       }}
//     >
//       {/* Barre de navigation fixe en haut */}
//       <Navbar />

//       {/* Contenu central défilable */}
//       <Box
//         sx={{
//           flex: 1,
//           overflowY: "auto",
//           px: 2,
//           mt: 2,
//           mb: 2,
//           backgroundColor: "#e3f2fd",
//         }}
//       >
//         <Container maxWidth="md">{children}</Container>
//       </Box>

//       {/* Pied de page fixe en bas */}
//       <Footer />
//     </Box>
//   );
// };

// export default PageLayout;



// PageLayout.jsx
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
      {/* Navbar */}
      <Navbar />

      {/* Contenu central */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#e3f2fd",
          // 🔽 beaucoup moins de padding sur petits écrans
          px: { xs: 0.5, sm: 1.5, md: 2 }, // 4px / 12px / 16px
          mt: { xs: 1, sm: 2 },
          mb: { xs: 1, sm: 2 },
        }}
      >
        <Container
          maxWidth="md"
          disableGutters   // 🔽 on enlève les 16px de MUI
        >
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default PageLayout;
