import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: "pelatih" | "admin_daerah" | "admin_nasional";
  wilayah?: string | null;
  dojang?: string | null;
  sabuk_level?: string | null;
  certification_date?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  // 🔐 Guard: cegah fetch berulang untuk user yang sama
  const lastFetchedUidRef = useRef<string | null>(null);

  const fetchProfile = useCallback(
    async (uid: string) => {
      // ✅ Jangan bikin UI balik ke "Memuat..." kalau profile sudah ada
      if (!profile) setLoadingProfile(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, role, wilayah, dojang, sabuk_level, certification_date, is_active, created_at, updated_at"
        )
        .eq("id", uid)
        .maybeSingle();

      if (error) {
        const msg = String(error.message || "").toLowerCase();

        // ✅ Abort / cancel itu NORMAL — jangan rusak state
        if (msg.includes("aborterror") || msg.includes("signal is aborted")) {
          setLoadingProfile(false);
          return;
        }

        console.error("fetchProfile error:", error.message);
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      const profileData = (data as Profile) ?? null;

      // ✅ BLOKIR: kalau akun nonaktif, langsung sign out
      if (profileData && profileData.is_active === false) {
        toast.error("Akun Anda dinonaktifkan. Hubungi Admin Nasional.");

        // signOut + reset states
        await supabase.auth.signOut();
        lastFetchedUidRef.current = null;

        setUser(null);
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      setProfile(profileData);
      setLoadingProfile(false);
    },
    [profile]
  );

  useEffect(() => {
    let mounted = true;

    // 🔹 Initial session
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("getSession error:", error.message);

      const sessionUser = data.session?.user ?? null;
      if (!mounted) return;

      setUser(sessionUser);

      if (sessionUser?.id) {
        if (lastFetchedUidRef.current !== sessionUser.id) {
          lastFetchedUidRef.current = sessionUser.id;
          fetchProfile(sessionUser.id); // ❌ jangan await
        }
      } else {
        lastFetchedUidRef.current = null;
        setProfile(null);
        setLoadingProfile(false);
      }
    })();

    // 🔹 Auth listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null;
        if (!mounted) return;

        setUser(sessionUser);

        if (sessionUser?.id) {
          if (lastFetchedUidRef.current !== sessionUser.id) {
            lastFetchedUidRef.current = sessionUser.id;
            fetchProfile(sessionUser.id); // ❌ jangan await
          }
        } else {
          lastFetchedUidRef.current = null;
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
    return supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();

    // ✅ WAJIB reset guard supaya login ulang fetch profile lagi
    lastFetchedUidRef.current = null;

    setUser(null);
    setProfile(null);
    setLoadingProfile(false);
  };

  return {
    user,
    profile,
    loadingProfile,
    signIn,
    signOut,
    fetchProfile,
  };
}
