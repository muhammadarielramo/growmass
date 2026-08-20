import React, { useState, useEffect } from "react";
import { useProjects } from "../context/ProjectContext";
import { formatSeconds } from "../utils/recipeCalculator";
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  TreeDeciduous,
  AlertCircle,
  Sparkles,
  MapPin
} from "lucide-react";

export function GrowthTimers({ project }) {
  const { addTimer, deleteTimer } = useProjects();
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Form state
  const [timerLabel, setTimerLabel] = useState("");
  const [timerWorld, setTimerWorld] = useState(project.worldName || "");
  const [timerTreeType, setTimerTreeType] = useState(project.targetItem || "");
  const [durationPreset, setDurationPreset] = useState("recipe"); // 'recipe', 'custom'
  const [customDays, setCustomDays] = useState("0");
  const [customHours, setCustomHours] = useState("2");
  const [customMinutes, setCustomMinutes] = useState("30");

  // Keep live tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timers = project.timers || [];

  const handleAddTimer = (e) => {
    e.preventDefault();
    let totalSecs = 0;

    if (durationPreset === "recipe" && project.recipe?.growTime) {
      totalSecs = project.recipe.growTime;
    } else {
      totalSecs =
        Number(customDays || 0) * 86400 +
        Number(customHours || 0) * 3600 +
        Number(customMinutes || 0) * 60;
    }

    if (totalSecs <= 0) totalSecs = 3600;

    addTimer(project.id, {
      label: timerLabel || `Pohon ${timerTreeType || project.targetItem}`,
      worldName: timerWorld || project.worldName || "FARM",
      treeType: timerTreeType || project.targetItem,
      durationSeconds: totalSecs
    });

    setShowAddModal(false);
    setTimerLabel("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Add Action */}
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(21, 31, 54, 0.8) 0%, rgba(14, 20, 36, 0.9) 100%)",
        border: "1px solid rgba(6, 182, 212, 0.25)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={20} color="var(--cyan-400)" />
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Timer Pertumbuhan Pohon (Farm Worlds)</h2>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              Pantau waktu matang pohon secara realtime agar tidak terlambat memanen hasil massing Anda.
            </p>
          </div>

          <button className="btn btn-cyan" onClick={() => setShowAddModal(true)} style={{ fontSize: "13px" }}>
            <Plus size={16} /> Pasang Timer Pohon
          </button>
        </div>
      </div>

      {/* Timers Grid */}
      {timers.length === 0 ? (
        <div className="glass-panel" style={{ padding: "48px 24px", textAlign: "center" }}>
          <TreeDeciduous size={48} color="var(--text-dim)" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>Belum Ada Timer Aktif</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Pasang timer saat Anda selesai menanam bibit di world farm.
          </p>
          <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Pasang Timer Sekarang
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {timers.map((timer) => {
            const plantedTimestamp = new Date(timer.plantedAt).getTime();
            const harvestTimestamp = new Date(timer.harvestAt).getTime();
            const totalDurationMs = harvestTimestamp - plantedTimestamp;
            const elapsedMs = currentTime - plantedTimestamp;
            const remainingSecs = Math.max(0, Math.floor((harvestTimestamp - currentTime) / 1000));
            const isReady = remainingSecs <= 0;
            const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

            return (
              <div
                key={timer.id}
                className="glass-card"
                style={{
                  borderLeft: isReady ? "4px solid var(--emerald-400)" : "4px solid var(--cyan-500)",
                  background: isReady ? "rgba(16, 185, 129, 0.08)" : "var(--bg-glass-card)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span className={`badge ${isReady ? "badge-emerald" : "badge-cyan"}`} style={{ marginBottom: "6px" }}>
                        {isReady ? "SIAP PANEN! ✓" : "SEDANG TUMBUH"}
                      </span>
                      <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{timer.label}</h3>
                    </div>

                    <button
                      className="btn-icon"
                      onClick={() => deleteTimer(project.id, timer.id)}
                      title="Hapus Timer"
                      style={{ color: "var(--rose-400)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                    <MapPin size={13} color="var(--amber-400)" />
                    <span>World:</span>
                    <strong style={{ color: "var(--text-main)" }}>{timer.worldName}</strong>
                    <span>• {timer.treeType}</span>
                  </div>
                </div>

                {/* Countdown Display */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Sisa Waktu:</span>
                    <span
                      style={{
                        fontSize: isReady ? "16px" : "20px",
                        fontWeight: "800",
                        color: isReady ? "var(--emerald-400)" : "var(--cyan-400)"
                      }}
                      className="font-mono"
                    >
                      {isReady ? "Siap Panen Sekarang!" : formatSeconds(remainingSecs)}
                    </span>
                  </div>

                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${progressPercent}%`,
                        background: isReady
                          ? "linear-gradient(90deg, #10b981, #34d399)"
                          : "linear-gradient(90deg, #06b6d4, #38bdf8)"
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
                    <span>Ditanam: {new Date(timer.plantedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Target: {new Date(timer.harvestAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Timer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "16px", color: "var(--cyan-400)" }}>Pasang Timer Pohon Farm</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddTimer}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Nama / Label Timer</label>
                  <input
                    type="text"
                    placeholder={`Misal: Pohon ${project.targetItem} Main Farm`}
                    value={timerLabel}
                    onChange={(e) => setTimerLabel(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">World Farm</label>
                    <input
                      type="text"
                      placeholder="Misal: FARMMASS01"
                      value={timerWorld}
                      onChange={(e) => setTimerWorld(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jenis Pohon</label>
                    <input
                      type="text"
                      placeholder="Misal: Display Box"
                      value={timerTreeType}
                      onChange={(e) => setTimerTreeType(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Duration options */}
                <div className="form-group">
                  <label className="form-label">Durasi Pertumbuhan</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    {project.recipe?.growTimeFormatted && (
                      <button
                        type="button"
                        onClick={() => setDurationPreset("recipe")}
                        className={`badge ${durationPreset === "recipe" ? "badge-cyan" : "badge-neutral"}`}
                        style={{ cursor: "pointer", padding: "8px 12px" }}
                      >
                        Resep: {project.recipe.growTimeFormatted}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDurationPreset("custom")}
                      className={`badge ${durationPreset === "custom" ? "badge-cyan" : "badge-neutral"}`}
                      style={{ cursor: "pointer", padding: "8px 12px" }}
                    >
                      Kustom Waktu
                    </button>
                  </div>

                  {durationPreset === "custom" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Hari</label>
                        <input
                          type="number"
                          min="0"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          className="form-input font-mono"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Jam</label>
                        <input
                          type="number"
                          min="0"
                          value={customHours}
                          onChange={(e) => setCustomHours(e.target.value)}
                          className="form-input font-mono"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Menit</label>
                        <input
                          type="number"
                          min="0"
                          value={customMinutes}
                          onChange={(e) => setCustomMinutes(e.target.value)}
                          className="form-input font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-cyan">
                  Mulai Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
