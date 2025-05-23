"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  checkAuthStatus,
  logoutUser,
  getAuthToken,
  isTokenExpired,
  type Admin,
} from "@/lib/api/auth";
import { defaultLocale } from "@/lib/i18n/config";

// Type for the API response
type ApiResponse<T> = {
  statusCode: number;
  status: string;
  message: string;
  data: T;
};

type AuthContextType = {
  user: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      setIsLoading(true);

      // Check if we have a token
      const token = getAuthToken();
      if (!token || isTokenExpired(token)) {
        throw new Error("No valid token");
      }

      // Get user data from API
      const response = await checkAuthStatus();

      // Extract user data from the response structure
      if (response.status === "success" && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        router.push(`/${defaultLocale}/dashboard`);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Even if API call fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      router.push(`/${defaultLocale}/login`);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
