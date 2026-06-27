"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "../lib/storage";
import { STORAGE_KEYS } from "../lib/constants";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export interface User {
  id: string;
  email: string;
  fullName?: string;
  planId?: string;
}

interface AuthContextType {
  currentUser: User | null;
  user: User | null; // For backward compatibility
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean; // For backward compatibility
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, fullName: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    const token = storage.get(STORAGE_KEYS.TOKEN);
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await api.get<User>("/auth/me");
      setCurrentUser(userData);
    } catch (err) {
      // Clear expired / invalid token
      storage.remove(STORAGE_KEYS.TOKEN);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.post<{ access_token: string; userId: string }>("/auth/login", {
        email,
        password,
      });
      storage.set(STORAGE_KEYS.TOKEN, data.access_token);
      await refreshUser();
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (email: string, fullName: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.post<{ access_token: string; userId: string }>("/auth/signup", {
        email,
        fullName,
        password,
      });
      storage.set(STORAGE_KEYS.TOKEN, data.access_token);
      await refreshUser();
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    storage.remove(STORAGE_KEYS.TOKEN);
    setCurrentUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        isAuthenticated: !!currentUser,
        loading,
        isLoading: loading,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
