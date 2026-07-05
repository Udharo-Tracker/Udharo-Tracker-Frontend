import { useEffect, useState, type ReactNode } from "react";
import { getAccessToken, SESSION_EXPIRED_EVENT } from "@/api/client";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAccessToken());

  useEffect(() => {
    function handleSessionExpired() {
      setIsAuthenticated(false);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
