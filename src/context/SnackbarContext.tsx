import React, { createContext, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

type Severity = "success" | "info" | "warning" | "error";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: Severity;
};

type SnackbarContextValue = {
  notify: (message: string, severity?: Severity) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success"
  });

  const value = useMemo<SnackbarContextValue>(
    () => ({
      notify: (message: string, severity: Severity = "success") => {
        setState({ open: true, message, severity });
      }
    }),
    []
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}

      <Snackbar
        open={state.open}
        autoHideDuration={3200}
        onClose={() => setState((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setState((s) => ({ ...s, open: false }))}
          severity={state.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used inside <SnackbarProvider>");
  return ctx;
}