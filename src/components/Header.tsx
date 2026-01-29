
"use client";
import Image from "next/image";

const logoImage = "/assets/hapkido-logo.png";


interface HeaderProps {
  onNavigate?: (page: string) => void;
  showBackToHome?: boolean;
  isLoggedIn?: boolean;

}

export function Header({
  onNavigate,
  showBackToHome = false,
  isLoggedIn = false,
}: HeaderProps) {
  return (
    <header
      className="bg-white shadow-sm sticky top-0 z-40"
      style={{ borderBottom: "3px solid var(--dark-navy-10)" }}
    >
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          {/* Left: Menu + Logo/Title */}
                 <div className="flex items-center gap-3 w-full">
                   <button
                     type="button"
                     onClick={() => onNavigate?.("home")}
                     className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                   >
                     <Image
                       src={logoImage}
                       alt="Hapkido Indonesia Logo"
                       width={56}
                       height={56}
                       className="w-12 h-12 md:w-14 md:h-14"
                       priority
                     />
                     <div className="text-left">
                       <h1
                         style={{
                           color: "var(--dark-navy-0)",
                           letterSpacing: "0.05em",
                           lineHeight: "1.2",
                         }}
                         className="text-base md:text-lg"
                       >
                         HAPKIDO
                         <br />
                         INDONESIA
                       </h1>
                       <p
                         className="text-xs opacity-70"
                         style={{ fontSize: "0.7rem", color: "var(--dark-navy-10)" }}
                       >
                         Affiliated : World Hapkido Martial Arts Federation
                       </p>
                     </div>
                   </button>
                 </div>

          {/* Right: Login / Account */}
          <div className="flex items-center gap-4">
            <div
              className="px-2.5 py-1.5 rounded text-sm shadow-sm min-w-[140px] text-center"
              style={{ backgroundColor: "var(--coral-0)" }}
            >
              {isLoggedIn ? (
                <button
                  type="button"
                  className="text-white text-xs md:text-sm hover:underline"
                  onClick={() => onNavigate?.("dashboard")}
                >
                  MY ACCOUNT
                </button>
              ) : onNavigate ? (
                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="text-white text-xs md:text-sm hover:underline whitespace-nowrap"
                >
                  MASUK | DAFTAR
                </button>
              ) : null}
            </div>
          </div>
                {/* Removed stray unclosed div that caused parsing error */}
        </div>

        {/* ✅ Optional back-to-home row if you ever use showBackToHome */}
        {showBackToHome && onNavigate ? (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="text-xs underline opacity-80 hover:opacity-100"
              style={{ color: "var(--dark-navy-0)" }}
            >
              Back to Home
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
