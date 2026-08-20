import React, { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { useProjects } from "../context/ProjectContext";
import {
  Settings,
  Download,
  Upload,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export function SettingsModal({ isOpen, onClose }) {
  const { config, updateConfig } = useCurrency();
  const { exportData, importData } = useProjects();

  const [idrRate, setIdrRate] = useState(config?.idrPerDl?.toString() || "3500");
  const [importStatus, setImportStatus] = useState(null);

  // Sync state whenever modal opens or config changes
  useEffect(() => {
    if (config?.idrPerDl !== undefined && config?.idrPerDl !== null) {
      setIdrRate(config.idrPerDl.toString());
    }
  }, [config?.idrPerDl, isOpen]);

  if (!isOpen) return null;

  const handleSaveRates = (e) => {
    e.preventDefault();
    const rateNum = Number(idrRate);
    if (!isNaN(rateNum) && rateNum > 0) {
      updateConfig({ idrPerDl: rateNum });
      setImportStatus({ type: "success", text: `Rate kurs berhasil diperbarui: Rp ${rateNum.toLocaleString("id-ID")} / DL` });
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const res = importData(content);
      if (res.success) {
        setImportStatus({ type: "success", text: res.message });
      } else {
        setImportStatus({ type: "error", text: res.message });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Settings size={20} color="var(--emerald-400)" />
            <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Pengaturan & Cadangan Data</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Notification status */}
          {importStatus && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              background: importStatus.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
              color: importStatus.type === "success" ? "var(--emerald-400)" : "var(--rose-400)",
              border: importStatus.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(244, 63, 94, 0.3)"
            }}>
              {importStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{importStatus.text}</span>
            </div>
          )}

          {/* Currency Rate Config */}
          <form onSubmit={handleSaveRates} className="glass-panel" style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Coins size={18} color="var(--amber-400)" />
              <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Pengaturan Kurs Nilai Tukar (Exchange Rate)</h3>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
              Tentukan harga pasaran Diamond Lock (DL) ke Rupiah untuk konversi otomatis seluruh modal dan profit.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "flex-end" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Harga 1 Diamond Lock (Rupiah / DL)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "14px", fontWeight: "700" }}>
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={idrRate}
                    onChange={(e) => setIdrRate(e.target.value)}
                    className="form-input font-mono"
                    style={{ paddingLeft: "42px", fontSize: "16px", fontWeight: "700", color: "var(--amber-400)" }}
                    placeholder="Contoh: 3500, 3420, 3125, dll."
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>
                Simpan Kurs
              </button>
            </div>
          </form>

          {/* Backup & Restore Data */}
          <div className="glass-panel" style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <ShieldCheck size={18} color="var(--cyan-400)" />
              <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Cadangan & Pulihkan Data (Backup & Restore)</h3>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
              Semua data projek tersimpan aman di browser Anda. Unduh file cadangan JSON secara berkala agar tidak hilang.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={exportData}
                style={{ justifyContent: "center" }}
              >
                <Download size={16} /> Unduh Backup (JSON)
              </button>

              <label className="btn btn-secondary" style={{ justifyContent: "center", cursor: "pointer" }}>
                <Upload size={16} /> Unggah / Restore
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Tutup Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
