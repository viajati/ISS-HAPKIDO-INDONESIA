"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./contexts/auth-context";

import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { HeroSection } from "./components/HeroSection";
import { ContentSection } from "./components/ContentSection";
import { LoginPage } from "./components/LoginPage";
import { SignUpPage } from "./components/SignUpPage";
import { RegistrationPage } from "./components/RegistrationPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import { EmailVerificationPage } from "./components/EmailVerificationPage";
// import { ForgotUsernamePage } from "./components/ForgotUsernamePage";
import { RequestTokenPage } from "./components/RequestTokenPage";
import { TentangPage } from "./components/TentangPage";
import { EdukasiCederaPage } from "./components/EdukasiCederaPage";
import { PanduanPenggunaPage } from "./components/PanduanPenggunaPage";
import { HasilAnalisisPage } from "./components/HasilAnalisisPage";
import { DashboardCoach } from "./components/DashboardCoach";
import { DashboardRegional } from "./components/DashboardRegional";
import { DashboardNational } from "./components/DashboardNational";
import { InputCederaPage } from "./components/InputCederaPage";
import { RiwayatPage } from "./components/RiwayatPage";
import { DraftPage } from "./components/DraftPage";
import { ProfilPage } from "./components/ProfilPage";
import { ChangePasswordPage } from "./components/ChangePasswordPage";
import { PanduanPrivatePage } from "./components/PanduanPrivatePage";
import { LogoutPage } from "./components/LogoutPage";
import { FAQsPage } from "./components/FAQsPage";
import { HelpContactPage } from "./components/HelpContactPage";
import { MenungguVerifikasi } from "./components/MenungguVerifikasi";
import { SudahVerifikasi } from "./components/SudahVerifikasi";
import { VisualisasiData } from "./components/VisualisasiData";
import { DownloadCenter } from "./components/DownloadCenter";
import { ManajemenPengguna } from "./components/ManajemenPengguna";
import { TokenGenerator } from "./components/TokenGenerator";

type AppRole = "coach" | "regional" | "national";
type PendingRole = "coach" | "regional-admin" | "national-admin";

function safeScrollToTop() {
  if (typeof window !== "undefined") window.scrollTo(0, 0);
}

function getPageFromUrl(): string {
  if (typeof window === "undefined") return "home";
  const url = new URL(window.location.href);
  return url.searchParams.get("page") || "home";
}

/**
 * ✅ SPA URL updater
 * - push: true => pushState (biar Back/Forward works)
 * - push: false => replaceState (biar ga nambah history)
 */
function setUrlPage(page: string, opts?: { push?: boolean; clearHash?: boolean }) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.set("page", page);

  // optional: bersihkan hash (mis. setelah reset password)
  if (opts?.clearHash) url.hash = "";

  // bersihin error params kalau ada
  url.searchParams.delete("error");
  url.searchParams.delete("error_code");
  url.searchParams.delete("error_description");

  if (opts?.push) window.history.pushState(null, "", url.toString());
  else window.history.replaceState(null, "", url.toString());
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Start with "home" to avoid hydration mismatch, will sync with URL in useEffect
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [previousPage, setPreviousPage] = useState<string>("home");

  // ✅ Get real user data from auth context
  const { user, profile, loadingProfile } = useAuth();
  const [pendingRole] = useState<PendingRole>("coach");

  // ✅ Derive userRole from actual profile data
  const userRole: AppRole = profile?.role === "admin_nasional" ? "national" : profile?.role === "admin_daerah" ? "regional" : "coach";
  const userName = profile?.full_name || "User";

  /**
   * ✅ Sync: kalau user buka link langsung dari email / share URL
   * dan juga kalau user klik Back/Forward di browser
   */
  useEffect(() => {
    // Pastikan URL punya page param (biar konsisten)
    const initial = getPageFromUrl();
    setUrlPage(initial, { push: false }); // normalize
    setCurrentPage(initial);

    const onPopState = () => {
      const page = getPageFromUrl();
      setCurrentPage(page);
      safeScrollToTop();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleNavigate = (page: string) => {
    setPreviousPage(currentPage);

    setCurrentPage(page);

    // ✅ update URL (push) supaya Back/Forward works
    setUrlPage(page, { push: true });

    safeScrollToTop();
  };

  const handleLogout = () => {
    setPreviousPage(currentPage);
    setCurrentPage("logout");
    setUrlPage("logout", { push: true });
    safeScrollToTop();
  };

  // Helpers for components that expect Indonesian role strings (“pelatih”, “admin_daerah”, ...)
  const mappedRole =
    userRole === "coach"
      ? "pelatih"
      : userRole === "regional"
      ? "admin_daerah"
      : "admin_nasional";

  // ✅ Get actual wilayah from profile
  const userWilayah = profile?.wilayah || undefined;

  // Render different pages based on currentPage state
  switch (currentPage) {
    // Public pages
    case "login":
      return <LoginPage onNavigate={handleNavigate} />;

    case "signup":
      return <SignUpPage onNavigate={handleNavigate} />;

    case "registration":
      return <RegistrationPage onNavigate={handleNavigate} userRole={pendingRole} />;

    case "forgot-password":
      return <ForgotPasswordPage onNavigate={handleNavigate} />;

    case "reset-password":
      // ✅ email reset link -> /?page=reset-password#access_token=...
      // ResetPasswordPage kamu akan handle hash tokennya.
      return <ResetPasswordPage />;

    case "verifikasi-email":
      return <EmailVerificationPage onNavigate={handleNavigate} />;

    case "request-token":
      return <RequestTokenPage onNavigate={handleNavigate} />;

    case "tentang":
      return <TentangPage onNavigate={handleNavigate} />;

    case "edukasi-cedera":
      return <EdukasiCederaPage onNavigate={handleNavigate} />;

    case "panduan-pengguna":
      return <PanduanPenggunaPage onNavigate={handleNavigate} />;

    case "faqs":
      return <FAQsPage onNavigate={handleNavigate} />;

    case "help-contact":
      return <HelpContactPage onNavigate={handleNavigate} />;

    case "hasil-analisis":
      return <HasilAnalisisPage onNavigate={handleNavigate} />;

    // Private area pages
    case "dashboard-coach":
      return <DashboardCoach onNavigate={handleNavigate} />;

    case "dashboard-regional":
      return <DashboardRegional onNavigate={handleNavigate} />;

    case "dashboard-national":
      return <DashboardNational onNavigate={handleNavigate} />;

    case "menunggu-verifikasi":
      return <MenungguVerifikasi onNavigate={handleNavigate} />;

    case "sudah-verifikasi":
      return <SudahVerifikasi onNavigate={handleNavigate} />;

    case "input-cedera":
      return (
        <InputCederaPage onNavigate={handleNavigate} onLogout={handleLogout} />
      );

    case "riwayat":
      return <RiwayatPage onNavigate={handleNavigate} onLogout={handleLogout} />;

    case "draft":
      return <DraftPage onNavigate={handleNavigate} onLogout={handleLogout} />;

    case "profil":
      return <ProfilPage onNavigate={handleNavigate} onLogout={handleLogout} />;

    case "change-password":
      return <ChangePasswordPage onNavigate={handleNavigate} />;

    case "panduan-private":
      return (
        <PanduanPrivatePage onNavigate={handleNavigate} onLogout={handleLogout} />
      );

    case "visualisasi-data":
      return (
        <VisualisasiData onNavigate={handleNavigate} />
      );

    case "download-center":
      return (
        <DownloadCenter onNavigate={handleNavigate} />
      );

    case "manajemen-pengguna":
      return <ManajemenPengguna onNavigate={handleNavigate} />;

    case "token-generator":
      return <TokenGenerator onNavigate={handleNavigate} />;

    case "logout":
      return <LogoutPage onNavigate={handleNavigate} fromPage={previousPage} />;

    // Redirect-ish
    case "dashboard":
      return <DashboardCoach onNavigate={handleNavigate} />;

    // Home
    default:
      return (
        <div className="min-h-screen bg-gray-50">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNavigate={handleNavigate}
          />
          <Header onNavigate={handleNavigate} />
          <HeroSection onNavigate={handleNavigate} onMenuClick={() => setIsSidebarOpen(true)} />
          <ContentSection onNavigate={handleNavigate} />
        </div>
      );
  }
}
