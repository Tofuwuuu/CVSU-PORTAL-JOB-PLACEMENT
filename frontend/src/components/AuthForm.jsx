// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  // Sync token with localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // Sync role with localStorage
  useEffect(() => {
    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [role]);

  const isAuthenticated = !!token;
  const isAdmin = role === "admin";

  const login = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
  };

  const { isAuthenticated, user } = useContext(AuthContext);
  console.log(user); // Should log: { id: 1, role: "admin", email: "admin@cvsu.edu" }

  return (
    <AuthContext.Provider
      value={{ token, role, isAuthenticated, isAdmin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
