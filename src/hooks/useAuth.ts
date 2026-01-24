import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: "pelatih" | "admin_daerah" | "admin_nasional";
  wilayah?: string | null;
  dojang?: string | null;
  sabuk_level?: string | null;
  certification_date?: string | null; // DATE biasanya balik string "YYYY-MM-DD"
  created_at?: string | null;
  updated_at?: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  const fetchProfile = useCallback(async (uid: string) => {
    setLoadingProfile(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, phone, role, wilayah, dojang, sabuk_level, certification_date, created_at, updated_at"
      )
      .eq("id", uid)
      .maybeSingle();

    if (error) {
      console.error("fetchProfile error:", error.message);
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setProfile((data as Profile) ?? null);
    setLoadingProfile(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    // initial session
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("getSession error:", error.message);

      const sessionUser = data.session?.user ?? null;
      if (!mounted) return;

      setUser(sessionUser);

      if (sessionUser?.id) {
        await fetchProfile(sessionUser.id);
      } else {
        setProfile(null);
        setLoadingProfile(false);
      }
    })();

    // auth listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null;
        if (!mounted) return;

        setUser(sessionUser);

        if (sessionUser?.id) {
          await fetchProfile(sessionUser.id);
        } else {
          setProfile(null);
          setLoadingProfile(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoadingProfile(false);
  };

  return { user, profile, loadingProfile, signIn, signOut, fetchProfile };
}
