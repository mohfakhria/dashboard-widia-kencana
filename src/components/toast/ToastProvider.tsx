"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          zIndex: 99999,
          background: "#1E293B", // navy
          color: "#F8FAFC", // putih lembut
          borderRadius: "10px",
          padding: "16px 22px", // lebih lega
          fontSize: "0.95rem", // sedikit lebih besar
          fontWeight: 500,
          boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
        },
        success: {
          iconTheme: {
            primary: "#22C55E",
            secondary: "#fff",
          },
          style: { background: "#064E3B" },
        },
        error: {
          iconTheme: {
            primary: "#DC2626",
            secondary: "#fff",
          },
          style: { background: "#7F1D1D" },
        },
      }}
    />
  );
}