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
import { Box } from "@mui/material";

const App = () => {
  return (
    <Box sx={{ backgroundColor: "#e3f2fd", minHeight: "100vh" }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Box>
  );
};

export default App;
