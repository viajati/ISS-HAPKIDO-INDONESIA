"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

function setUrlPage(page: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("page", page);
  window.history.replaceState(null, "", url.toString());
}

function getInitialPageFromUrl(): string {
  if (typeof window === "undefined") return "home";
  const url = new URL(window.location.href);
  return url.searchParams.get("page") || "home";
}

export default function App() {
  const searchParams = useSearchParams();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ initial dari URL (?page=...)
  const [currentPage, setCurrentPage] = useState<string>(getInitialPageFromUrl());
  const [previousPage, setPreviousPage] = useState<string>("home");

  // Mock role/name (you’ll replace this with Supabase later)
  const [userRole, setUserRole] = useState<AppRole>("coach");
  const [userName, setUserName] = useState<string>("Ahmad Pratama");
  const [pendingRole] = useState<PendingRole>("coach"); // currently unused setter in your code

  // ✅ sinkronin: kalau URL berubah (mis. user buka link reset dari email)
  useEffect(() => {
    const page = searchParams.get("page");
    if (!page) return;

    // jangan loop: hanya set kalau beda
    setCurrentPage((prev) => (prev === page ? prev : page));
  }, [searchParams]);

  const handleNavigate = (page: string) => {
    setPreviousPage(currentPage);

    // Track user role when navigating to dashboards (mock behavior)
    if (page === "dashboard-coach") {
      setUserRole("coach");
      setUserName("Ahmad Pratama");
    } else if (page === "dashboard-regional") {
      setUserRole("regional");
      setUserName("Budi Santoso");
    } else if (page === "dashboard-national") {
      setUserRole("national");
      setUserName("Dr. Siti Nurhaliza");
    }

    setCurrentPage(page);

    // ✅ update URL supaya button/link bisa pakai /?page=login dll
    setUrlPage(page);

    safeScrollToTop();
  };

  const handleLogout = () => {
    setPreviousPage(currentPage);
    setCurrentPage("logout");
    setUrlPage("logout");
    safeScrollToTop();
  };

  // Helpers for components that expect Indonesian role strings
  const mappedRole =
    userRole === "coach"
      ? "pelatih"
      : userRole === "regional"
      ? "admin_daerah"
      : "admin_nasional";

  const userWilayah =
    userRole === "regional"
      ? "Jawa Barat"
      : userRole === "coach"
      ? "DKI Jakarta"
      : undefined;

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
      // ✅ important: supaya /?page=reset-password dari link email bisa render ini
      return <ResetPasswordPage />;

    case "verifikasi-email":
      return <EmailVerificationPage onNavigate={handleNavigate} />;

    // case "forgot-username":
    //   return <ForgotUsernamePage onNavigate={handleNavigate} />;

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
        <InputCederaPage
          onNavigate={handleNavigate}
          userRole={userRole}
          onLogout={handleLogout}
        />
      );

    case "riwayat":
      return (
        <RiwayatPage
          onNavigate={handleNavigate}
          userRole={userRole}
          onLogout={handleLogout}
        />
      );

    case "draft":
      return (
        <DraftPage
          onNavigate={handleNavigate}
          userRole={userRole}
          onLogout={handleLogout}
        />
      );

    case "profil":
      return (
        <ProfilPage
          onNavigate={handleNavigate}
          userRole={userRole}
          onLogout={handleLogout}
        />
      );

    case "panduan-private":
      return (
        <PanduanPrivatePage
          onNavigate={handleNavigate}
          userRole={userRole}
          onLogout={handleLogout}
        />
      );

    case "visualisasi-data":
      return (
        <VisualisasiData
          onNavigate={handleNavigate}
          userRole={mappedRole}
          userWilayah={userWilayah}
        />
      );

    case "download-center":
      return (
        <DownloadCenter
          onNavigate={handleNavigate}
          userRole={mappedRole}
          userWilayah={userWilayah}
        />
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
