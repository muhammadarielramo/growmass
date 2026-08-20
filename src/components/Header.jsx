import React, { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { useProjects } from "../context/ProjectContext";
import { useTheme } from "../context/ThemeContext";
import {
  Layers,
  PlusCircle,
  BookOpen,
  Settings,
  TrendingUp,
  Clock,
  Sparkles,
  Coins,
  Calendar,
  Sun,
  Moon
} from "lucide-react";

export function Header({ onOpenNewProject, onOpenCatalog, onOpenSettings, onGoHome, isViewingDetail }) {
  const { config, formatLocks, formatIDR } = useCurrency();
  const { globalStats } = useProjects();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Live real-time clock ticking every second (GMT+7 WIB)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isProfitPositive = globalStats.totalNetProfitWL >= 0;

  // Format GMT+7 date and time
  const timeFormatted = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(currentDateTime);

  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(currentDateTime);

  return (
    <header style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-glass)",
      backdropFilter: "blur(16px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "12px 24px",
      transition: "background 0.3s ease, border-color 0.3s ease"
    }}>
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap"
      }}>
        {/* Brand & Logo */}
        <div 
          onClick={onGoHome}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(16, 185, 129, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <Layers size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "20px",
                fontWeight: "800",
                letterSpacing: "-0.03em",
                color: "var(--text-main)"
              }}>
                GROWMASS
              </span>
              <span className="badge badge-emerald" style={{ fontSize: "10px", padding: "1px 6px" }}>
                PRO
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "-2px" }}>
              Growtopia Massing & Profit Tracker
            </p>
          </div>
        </div>

        {/* Live GMT+7 Clock Widget */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "var(--bg-surface-elevated)",
          padding: "6px 16px",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-medium)",
          fontSize: "12px",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "var(--emerald-400)",
            boxShadow: "0 0 8px var(--emerald-400)",
            animation: "pulseGlow 2s infinite ease-in-out"
          }} />
          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
            {dateFormatted}
          </span>
          <span style={{ color: "var(--border-medium)" }}>•</span>
          <span style={{
            color: "var(--emerald-400)",
            fontWeight: "800",
            letterSpacing: "0.04em"
          }} className="font-mono">
            {timeFormatted} WIB
          </span>
        </div>

        {/* Global Stats Mini-Ticker */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "var(--bg-surface-elevated)",
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-subtle)",
          fontSize: "12px"
        }}>
          <div
            onClick={onOpenSettings}
            title="Klik untuk ubah kurs Rate DL"
            style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
          >
            <span style={{ color: "var(--text-dim)" }}>Rate DL:</span>
            <span style={{ color: "var(--amber-400)", fontWeight: "700" }} className="font-mono">
              Rp {config.idrPerDl.toLocaleString("id-ID")}
            </span>
          </div>

          <div style={{ width: "1px", height: "14px", background: "var(--border-subtle)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendingUp size={14} color={isProfitPositive ? "var(--emerald-400)" : "var(--rose-400)"} />
            <span style={{ color: "var(--text-dim)" }}>Total Profit:</span>
            <span style={{
              fontWeight: "700",
              color: isProfitPositive ? "var(--emerald-400)" : "var(--rose-400)"
            }} className="font-mono">
              {formatLocks(globalStats.totalNetProfitWL)}
            </span>
          </div>
        </div>

        {/* Header Action Buttons & Theme Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Light / Dark Mode Toggle Button */}
          <button
            className="btn-icon"
            onClick={toggleTheme}
            title={isDarkMode ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-medium)",
              color: isDarkMode ? "var(--amber-400)" : "var(--purple-400)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.25s ease"
            }}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onOpenCatalog}
            title="Buka Katalog Resep Massing"
            style={{ fontSize: "13px", padding: "8px 14px" }}
          >
            <BookOpen size={16} />
            <span>Katalog Resep</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onOpenSettings}
            title="Pengaturan Kurs & Backup Data"
            style={{ fontSize: "13px", padding: "8px 12px" }}
          >
            <Settings size={16} />
          </button>

          <button 
            className="btn btn-primary" 
            onClick={onOpenNewProject}
            style={{ fontSize: "13px", padding: "8px 16px" }}
          >
            <PlusCircle size={16} />
            <span>Projek Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
}
