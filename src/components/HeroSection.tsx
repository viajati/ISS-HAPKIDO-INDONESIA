"use client";

import { ArrowRight, Menu, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface HeroSectionProps {
  onNavigate: (page: string) => void;
  onMenuClick: () => void;
}

const heroLogo = "/assets/hapkido-logo.png";

export function HeroSection({ onNavigate, onMenuClick }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search query:", searchQuery);
  };

  return (
    <div
      className="relative text-white py-6 md:py-8 pb-8 md:pb-10"
      style={{
        background: "linear-gradient(135deg, var(--dark-navy-0), var(--dark-navy-20))",
      }}
    >
      <div className="container mx-auto px-4">
        {/* Menu & Search */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={onMenuClick}
            className="text-white px-3 py-1.5 rounded transition-all flex items-center gap-2 text-sm shadow-sm"
            style={{ backgroundColor: "var(--teal-0)" }}
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs md:text-sm">Menu Lengkap</span>
          </button>

          <form onSubmit={handleSearch} className="relative ml-auto">
            <input
              type="text"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 md:w-56 px-3 py-1.5 pr-9 rounded text-gray-800 text-xs bg-white border"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-500" />
            </button>
          </form>
        </div>

        {/* Hero Content */}
        <div className="text-center">
          <div className="max-w-3xl mx-auto">
            <Image
              src={heroLogo}
              alt="Hapkido Indonesia Logo"
              width={80}
              height={80}
              className="w-20 h-20 mx-auto mb-3 shadow-lg"
              priority
            />

            <h1 className="text-[24px] md:text-3xl font-bold mb-3">
              Sistem Pemantauan Cedera
              <br />
              <span className="italic opacity-90 text-xl md:text-2xl">
                (Injury Surveillance System)
              </span>
            </h1>

            <p className="text-[14px] md:text-lg mb-5 opacity-80">
              Platform resmi input dan analisis cedera Hapkido Indonesia
            </p>

            <div className="flex flex-col items-center gap-5">
              <button
                onClick={() => onNavigate("login")}
                className="px-9 py-3.5 rounded-lg shadow-lg text-white font-semibold"
                style={{ backgroundColor: "var(--teal-0)" }}
              >
                Login ke Sistem
              </button>

              <a
                href="https://www.hapkidoindonesia.com/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100"
              >
                Kembali ke Website Hapkido Indonesia
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
