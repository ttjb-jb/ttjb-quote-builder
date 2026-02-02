import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import App from "./App";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeModeProvider, useThemeMode } from "./context/ThemeModeContext";
import { SnackbarProvider } from "./context/SnackbarContext";
import { buildTheme } from "./theme";
import "./index.css";

function ThemedApp() {
  const { resolvedMode } = useThemeMode();
  const theme = React.useMemo(() => buildTheme(resolvedMode), [resolvedMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  </React.StrictMode>
);