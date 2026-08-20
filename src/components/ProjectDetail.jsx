import React, { useState } from "react";
import { useProjects } from "../context/ProjectContext";
import { useCurrency } from "../context/CurrencyContext";
import { FinancialLedger } from "./FinancialLedger";
import { StageTracker } from "./StageTracker";
import { SplicingTree } from "./SplicingTree";
import { formatStatusKey, formatStatusLabel } from "../utils/statusUtils";
import { ConfirmModal } from "./ConfirmModal";
import {
  ArrowLeft,
  GitFork,
  ListTodo,
  Wallet,
  Trash2,
  Edit3,
  CheckCircle2,
  MapPin,
  Sparkles,
  TrendingUp,
  Package,
  Coins,
  FileText
} from "lucide-react";

export function ProjectDetail({ onBack }) {
  const { activeProject, updateProject, deleteProject } = useProjects();
  const { config, formatLocks, formatIDR, wlToIdr, calculateROI } = useCurrency();
  const [activeTab, setActiveTab] = useState("ledger"); // 'ledger', 'stages', 'tree'
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!activeProject) {
    return (
      <div className="glass-panel" style={{ padding: "48px", textAlign: "center" }}>
        <h3>Projek tidak ditemukan</h3>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: "16px" }}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const materialsSpendWL = (activeProject.materials || []).reduce((sum, m) => sum + Number(m.totalWL || 0), 0);
  const projExp = (activeProject.ledger?.expenses || []).reduce((sum, e) => sum + Number(e.amountWL || 0), 0);
  const projRev = (activeProject.ledger?.revenues || []).reduce((sum, r) => sum + Number(r.amountWL || 0), 0);
  const projCap = (activeProject.ledger?.capital || []).reduce((sum, c) => sum + Number(c.amountWL || 0), 0);

  const totalCostWL = materialsSpendWL > 0 ? materialsSpendWL : projExp;
  const netProfitWL = projRev - totalCostWL;
  const netProfitIDR = wlToIdr(netProfitWL);
  const roi = calculateROI(projCap || totalCostWL, netProfitWL);
  const isProfit = netProfitWL >= 0;

  const handleStatusChange = (newStatus) => {
    updateProject(activeProject.id, { status: newStatus });
  };

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      updateProject(activeProject.id, { name: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveNotes = () => {
    updateProject(activeProject.id, { notes: notesInput });
    setIsEditingNotes(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteProject(activeProject.id);
    onBack();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Navigation & Action Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ padding: "8px 14px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Project Status Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Status:</span>
            <select
              value={formatStatusKey(activeProject.status)}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="form-select"
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "700",
                width: "auto",
                borderRadius: "var(--radius-full)",
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-medium)"
              }}
            >
              <option value="not_started">NOT STARTED</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="completed">COMPLETED ✓</option>
            </select>
          </div>

          <button
            onClick={handleDelete}
            className="btn btn-danger"
            style={{ padding: "6px 12px", fontSize: "12px" }}
            title="Hapus Projek"
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>
      </div>

      {/* Project Hero Workspace Header */}
      <div className="glass-panel" style={{
        padding: "24px",
        background: "var(--bg-glass)",
        border: "1px solid var(--border-medium)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span className={`status-pill status-${formatStatusKey(activeProject.status)}`}>
                {formatStatusLabel(activeProject.status)}
              </span>
              {activeProject.targetQuantity ? (
                <span className="badge badge-emerald font-mono">
                  {activeProject.targetQuantity.toLocaleString()} {activeProject.unit || "Seeds"}
                </span>
              ) : (
                <span className="badge badge-neutral">
                  Target Fleksibel / Sesuai Bahan
                </span>
              )}
              <span className="badge badge-cyan font-mono">
                Item: {activeProject.targetItem}
              </span>
            </div>

            {/* Editable Title with ItemIcon */}
            {isEditingTitle ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="form-input"
                  style={{ fontSize: "20px", fontWeight: "800", padding: "6px 12px" }}
                  autoFocus
                />
                <button className="btn btn-primary" onClick={handleSaveTitle} style={{ padding: "8px 14px" }}>
                  Simpan
                </button>
                <button className="btn btn-secondary" onClick={() => setIsEditingTitle(false)} style={{ padding: "8px 12px" }}>
                  Batal
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>
                  {activeProject.name}
                </h1>
                <button
                  className="btn-icon"
                  onClick={() => {
                    setTitleInput(activeProject.name);
                    setIsEditingTitle(true);
                  }}
                  title="Ubah Nama Projek"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            )}

            {/* Worlds & Metadata */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-muted)" }}>
              {activeProject.worldName && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={14} color="var(--amber-400)" />
                  <span>World: <strong style={{ color: "var(--text-main)" }}>{activeProject.worldName}</strong></span>
                </div>
              )}
              {activeProject.storageWorld && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "var(--text-dim)" }}>Storage:</span>
                  <strong style={{ color: "var(--cyan-400)" }}>{activeProject.storageWorld}</strong>
                </div>
              )}
              <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                Dibuat: {activeProject.createdDateGMT7 || "-"}
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div className="glass-card" style={{ padding: "10px 16px", minWidth: "130px", background: "var(--bg-surface-elevated)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Modal Belanja</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--amber-400)" }} className="font-mono">
                {formatLocks(totalCostWL)}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "10px 16px", minWidth: "130px", background: "var(--bg-surface-elevated)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Hasil Penjualan</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--cyan-400)" }} className="font-mono">
                {formatLocks(projRev)}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "10px 16px", minWidth: "130px", background: "var(--bg-surface-elevated)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Laba Bersih</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: isProfit ? "var(--emerald-400)" : "var(--rose-400)" }} className="font-mono">
                {isProfit ? `+${formatLocks(netProfitWL)}` : `-${formatLocks(Math.abs(netProfitWL))}`}
              </div>
            </div>
          </div>
        </div>

        {/* Project Notes Banner */}
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
          {isEditingNotes ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Tulis strategi, catatan pembeli, harga pasaran, atau rencana massing..."
                className="form-textarea"
                rows="2"
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-primary" onClick={handleSaveNotes} style={{ fontSize: "12px", padding: "6px 12px" }}>
                  Simpan Catatan
                </button>
                <button className="btn btn-secondary" onClick={() => setIsEditingNotes(false)} style={{ fontSize: "12px", padding: "6px 12px" }}>
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "13px", color: activeProject.notes ? "var(--text-main)" : "var(--text-dim)", fontStyle: activeProject.notes ? "normal" : "italic" }}>
                <FileText size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} color="var(--emerald-400)" />
                {activeProject.notes || "Belum ada catatan untuk projek ini. Klik tombol di kanan untuk menambahkan."}
              </div>
              <button
                className="btn-icon"
                onClick={() => {
                  setNotesInput(activeProject.notes || "");
                  setIsEditingNotes(true);
                }}
                title="Edit Catatan Projek"
              >
                <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3 Streamlined Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "ledger" ? "active" : ""}`}
          onClick={() => setActiveTab("ledger")}
        >
          <Wallet size={16} />
          <span>Rekapan Modal & Buku Kas</span>
          <span className="badge badge-amber" style={{ fontSize: "10px", padding: "1px 6px" }}>
            {(activeProject.materials || []).length} Item
          </span>
        </button>

        <button
          className={`tab-btn ${activeTab === "stages" ? "active" : ""}`}
          onClick={() => setActiveTab("stages")}
        >
          <ListTodo size={16} />
          <span>Alur & Tahap Splicing</span>
          <span className="badge badge-neutral" style={{ fontSize: "10px", padding: "1px 5px" }}>
            {(activeProject.stages || []).filter((s) => s.completed).length}/{(activeProject.stages || []).length}
          </span>
        </button>

        <button
          className={`tab-btn ${activeTab === "tree" ? "active" : ""}`}
          onClick={() => setActiveTab("tree")}
        >
          <GitFork size={16} />
          <span>Pohon Resep (Splice Tree)</span>
          <span className="badge badge-purple" style={{ fontSize: "10px", padding: "1px 5px" }}>
            {(activeProject.recipe?.splices || []).length} Splice
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "ledger" && <FinancialLedger project={activeProject} />}
      {activeTab === "stages" && <StageTracker project={activeProject} />}
      {activeTab === "tree" && <SplicingTree project={activeProject} />}

      {/* Delete Project Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={`Hapus Projek "${activeProject.name}"?`}
        message="Apakah Anda yakin ingin menghapus projek massing ini? Seluruh data pembelian bahan, rekapan buku kas, dan catatan tahapan akan dihapus secara permanen."
        confirmText="Hapus Projek Ini"
      />
    </div>
  );
}
