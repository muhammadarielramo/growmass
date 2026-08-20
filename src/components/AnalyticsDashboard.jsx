import React, { useState } from "react";
import { useProjects } from "../context/ProjectContext";
import { useCurrency } from "../context/CurrencyContext";
import { formatStatusKey, formatStatusLabel, PROJECT_STATUSES } from "../utils/statusUtils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingBag,
  Percent,
  Layers,
  Search,
  PlusCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export function AnalyticsDashboard({ onSelectProject, onNewProject, onOpenCatalog }) {
  const { projects, globalStats } = useProjects();
  const { formatLocks, formatIDR, wlToIdr, calculateROI } = useCurrency();
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'not_started', 'in_progress', 'completed'
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((proj) => {
    const projStatusKey = formatStatusKey(proj.status);
    const matchesStatus =
      filterStatus === "all"
        ? true
        : projStatusKey === filterStatus;

    const matchesSearch =
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.targetItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.worldName && proj.worldName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const isProfitPositive = globalStats.totalNetProfitWL >= 0;
  const overallROI = calculateROI(globalStats.totalInvestedWL, globalStats.totalNetProfitWL);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Banner / Welcome */}
      <div className="glass-panel" style={{
        padding: "28px 32px",
        background: "var(--bg-glass)",
        border: "1px solid var(--border-medium)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "220px",
          height: "220px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none"
        }} />

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          position: "relative",
          zIndex: 1
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="badge badge-emerald">
                <Sparkles size={12} /> SISTEM MASSING GROWTOPIA
              </span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>
              Dashboard & <span className="gradient-text-emerald">Buku Kas Massing</span>
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "600px" }}>
              Pantau seluruh alur splicing bibit, hitung kebutuhan bahan dasar, lacak modal dalam WL & Rupiah, serta maksimalkan ROI panen massal Anda.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={onNewProject}>
              <PlusCircle size={18} />
              <span>Mulai Projek Mass Baru</span>
            </button>
            <button className="btn btn-secondary" onClick={onOpenCatalog}>
              <Layers size={18} />
              <span>Lihat Resep</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "16px"
      }}>
        {/* KPI 1: Net Profit */}
        <div className="glass-card" style={{
          borderLeft: isProfitPositive ? "4px solid var(--emerald-500)" : "4px solid var(--rose-500)",
          background: "var(--bg-glass-card)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
              Total Laba Bersih (Net Profit)
            </span>
            <div style={{
              padding: "6px",
              borderRadius: "8px",
              background: isProfitPositive ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
              color: isProfitPositive ? "var(--emerald-400)" : "var(--rose-400)"
            }}>
              {isProfitPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
          </div>

          <div style={{ fontSize: "24px", fontWeight: "800", color: isProfitPositive ? "var(--emerald-400)" : "var(--rose-400)" }} className="font-mono">
            {formatLocks(globalStats.totalNetProfitWL)}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }} className="font-mono">
            ≈ {formatIDR(wlToIdr(globalStats.totalNetProfitWL))}
          </div>
        </div>

        {/* KPI 2: Total Modal & Expenses */}
        <div className="glass-card" style={{
          borderLeft: "4px solid var(--amber-500)",
          background: "var(--bg-glass-card)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
              Total Modal & Pengeluaran
            </span>
            <div style={{
              padding: "6px",
              borderRadius: "8px",
              background: "rgba(245, 158, 11, 0.15)",
              color: "var(--amber-400)"
            }}>
              <Wallet size={18} />
            </div>
          </div>

          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--amber-400)" }} className="font-mono">
            {formatLocks(globalStats.totalExpensesWL)}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }} className="font-mono">
            ≈ {formatIDR(wlToIdr(globalStats.totalExpensesWL))}
          </div>
        </div>

        {/* KPI 3: Total Revenue */}
        <div className="glass-card" style={{
          borderLeft: "4px solid var(--cyan-500)",
          background: "var(--bg-glass-card)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
              Total Hasil Penjualan
            </span>
            <div style={{
              padding: "6px",
              borderRadius: "8px",
              background: "rgba(6, 182, 212, 0.15)",
              color: "var(--cyan-400)"
            }}>
              <ShoppingBag size={18} />
            </div>
          </div>

          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--cyan-400)" }} className="font-mono">
            {formatLocks(globalStats.totalRevenuesWL)}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }} className="font-mono">
            ≈ {formatIDR(wlToIdr(globalStats.totalRevenuesWL))}
          </div>
        </div>

        {/* KPI 4: ROI & Projek Status */}
        <div className="glass-card" style={{
          borderLeft: "4px solid var(--purple-500)",
          background: "var(--bg-glass-card)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
              Rata-rata ROI & Batch
            </span>
            <div style={{
              padding: "6px",
              borderRadius: "8px",
              background: "rgba(168, 85, 247, 0.15)",
              color: "var(--purple-400)"
            }}>
              <Percent size={18} />
            </div>
          </div>

          <div style={{
            fontSize: "24px",
            fontWeight: "800",
            color: isProfitPositive ? "var(--emerald-400)" : "var(--rose-400)"
          }} className="font-mono">
            {isProfitPositive ? `+${overallROI}%` : `${overallROI}%`}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Dari {projects.length} Projek Terdaftar
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Controls Bar: Search & Status Filters */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginRight: "8px" }}>
              Daftar Projek Massing
            </h2>
            {[
              { id: "all", label: "Semua Projek" },
              { id: "not_started", label: "Not Started" },
              { id: "in_progress", label: "In Progress" },
              { id: "completed", label: "Completed" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`badge ${filterStatus === tab.id ? "badge-emerald" : "badge-neutral"}`}
                style={{
                  cursor: "pointer",
                  border: filterStatus === tab.id ? "1px solid var(--emerald-500)" : "1px solid var(--border-subtle)",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: "700"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", minWidth: "240px" }}>
            <Search size={16} color="var(--text-dim)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Cari item, world, nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "36px", fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="glass-panel" style={{
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}>
            <Layers size={48} color="var(--text-dim)" />
            <div>
              <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>Belum ada projek massing dengan status ini</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Mulai projek massing baru atau ganti filter status di atas.
              </p>
            </div>
            <button className="btn btn-primary" onClick={onNewProject}>
              <PlusCircle size={16} /> Buat Projek Sekarang
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "18px"
          }}>
            {filteredProjects.map((project) => {
              const completedStagesCount = (project.stages || []).filter((s) => s.completed).length;
              const totalStagesCount = (project.stages || []).length || 1;
              const progressPct = Math.round((completedStagesCount / totalStagesCount) * 100);

              const matExp = (project.materials || []).reduce((sum, m) => sum + Number(m.totalWL || 0), 0);
              const projCap = (project.ledger?.capital || []).reduce((sum, c) => sum + Number(c.amountWL || 0), 0);
              const ledgerExp = (project.ledger?.expenses || []).reduce((sum, e) => sum + Number(e.amountWL || 0), 0);
              const projExp = Math.max(matExp, ledgerExp);
              const projRev = (project.ledger?.revenues || []).reduce((sum, r) => sum + Number(r.amountWL || 0), 0);
              const projProfit = projRev - projExp;
              const projProfitIDR = wlToIdr(projProfit);
              const projRoi = calculateROI(projCap || projExp, projProfit);

              const statusKey = formatStatusKey(project.status);
              const statusLabel = formatStatusLabel(project.status);

              return (
                <div
                  key={project.id}
                  className="glass-card"
                  onClick={() => onSelectProject(project.id)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                    position: "relative"
                  }}
                >
                  {/* Top: Status & Target */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span className={`status-pill status-${statusKey}`}>
                        {statusLabel}
                      </span>
                      <span className="badge badge-neutral font-mono">
                        {project.targetQuantity ? `${project.targetQuantity.toLocaleString()} ${project.unit || "Seeds"}` : "Fleksibel"}
                      </span>
                    </div>

                    <div style={{ marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--text-main)" }}>
                        {project.name}
                      </h3>
                    </div>

                    {project.worldName && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--cyan-400)" }}>
                        <span>World:</span>
                        <span style={{ fontWeight: "700", background: "rgba(6, 182, 212, 0.12)", padding: "2px 6px", borderRadius: "4px" }}>
                          {project.worldName}
                        </span>
                        {project.storageWorld && (
                          <span style={{ color: "var(--text-dim)", marginLeft: "4px" }}>
                            • Store: {project.storageWorld}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Splicing Stages Progress Bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                      <span>Progres Splicing ({completedStagesCount}/{totalStagesCount} Tahap)</span>
                      <span className="font-mono" style={{ fontWeight: "700", color: progressPct === 100 ? "var(--emerald-400)" : "var(--text-main)" }}>
                        {progressPct}%
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${progressPct}%`,
                          background: progressPct === 100
                            ? "linear-gradient(90deg, var(--emerald-500), var(--emerald-400))"
                            : "linear-gradient(90deg, var(--cyan-500), var(--emerald-400))"
                        }}
                      />
                    </div>
                  </div>

                  {/* Card Bottom: Profit & ROI Preview */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-subtle)"
                  }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                        ESTIMASI PROFIT
                      </span>
                      <div style={{
                        fontSize: "15px",
                        fontWeight: "800",
                        color: projProfit >= 0 ? "var(--emerald-400)" : "var(--rose-400)"
                      }} className="font-mono">
                        {formatLocks(projProfit)}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }} className="font-mono">
                        {formatIDR(projProfitIDR)}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className={`badge ${projProfit >= 0 ? "badge-emerald" : "badge-rose"}`} style={{ fontSize: "11px" }}>
                        ROI: {projRoi}%
                      </span>
                      <div className="btn-icon" style={{ width: "28px", height: "28px" }}>
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
