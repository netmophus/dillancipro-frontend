import { createTheme } from "@mui/material/styles";

const fontFamily = '"DM Sans", system-ui, Arial, sans-serif';

// Thème : typographie DM Sans + palette Dillanci (primary bleu, secondary vert).
const theme = createTheme({
  palette: {
    primary: { main: "#3030F9", dark: "#2020C8", contrastText: "#ffffff" },
    secondary: { main: "#0A7C4F" },
  },
  typography: {
    fontFamily,
  },
});

export default theme;
