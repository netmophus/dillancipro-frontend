// // src/App.jsx
// import React from "react";
// import { AuthProvider } from "./context/AuthContext";
// import Navbar from "./components/Navbar";
// import AppRoutes from "./routes/Routes";
// import useInactivityLogout from "./hooks/useInactivityLogout";

// const App = () => {
//   // Active le timer d'inactivité pour 60 secondes (60000 ms)
//   useInactivityLogout(60000);

//   return (
//     <AuthProvider>
//       <Navbar />
//       <AppRoutes />
//     </AuthProvider>
//   );
// };

// export default App;


import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { Box, GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={{ body: { fontFamily: theme.typography.fontFamily } }}
      />
      <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
};

export default App;
