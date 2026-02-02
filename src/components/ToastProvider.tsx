import React, { createContext, useContext, useMemo, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

type ToastSeverity = "success" | "info" | "warning" | "error";

type ToastState = {
  open: boolean;
  message: string;
  severity: ToastSeverity;
};

type ToastContextValue = {
  toast: (message: string, severity?: ToastSeverity) => void;
  success: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info"
  });

  const api = useMemo<ToastContextValue>(() => {
    const toast = (message: string, severity: ToastSeverity = "info") => {
      setState({ open: true, message, severity });
    };
    return {
      toast,
      success: (m) => toast(m, "success"),
      info: (m) => toast(m, "info"),
      warning: (m) => toast(m, "warning"),
      error: (m) => toast(m, "error")
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}

      <Snackbar
        open={state.open}
        autoHideDuration={2600}
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
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}