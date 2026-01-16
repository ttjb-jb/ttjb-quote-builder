import React from "react";
import ReactDOM from "react-dom/client";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <div style={{ padding: 40, fontSize: 24 }}>
      ✅ MAIN.TSX IS RUNNING
    </div>
  </React.StrictMode>
);
