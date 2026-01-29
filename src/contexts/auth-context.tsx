"use client";

import React, { createContext, useContext } from "react";
import { useAuth as useAuthHook, type Profile } from "../hooks/useAuth";
import type { User } from "@supabase/supabase-js";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loadingProfile: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  fetchProfile: (uid: string) => Promise<Profile | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthHook();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
