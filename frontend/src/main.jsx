import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0f172a",
              border: "1px solid #334155",
              color: "#f8fafc",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#0f172a",
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
