import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login as loginRequest, signup as signupRequest } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("codin_token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("codin_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getMe();
        if (active) {
          setUser(data.user);
          localStorage.setItem("codin_user", JSON.stringify(data.user));
        }
      } catch {
        if (active) {
          localStorage.removeItem("codin_token");
          localStorage.removeItem("codin_user");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [token]);

  async function login(credentials) {
    const data = await loginRequest(credentials);
    localStorage.setItem("codin_token", data.token);
    localStorage.setItem("codin_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function signup(payload) {
    const data = await signupRequest(payload);
    localStorage.setItem("codin_token", data.token);
    localStorage.setItem("codin_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("codin_token");
    localStorage.removeItem("codin_user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, loading, login, signup, logout }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
