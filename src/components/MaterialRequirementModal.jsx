import React, { useState, useEffect } from "react";
import { useProjects } from "../context/ProjectContext";
import { ItemAutocomplete } from "./ItemAutocomplete";
import { generateDefaultRequirementsFromProject } from "../utils/materialRequirementUtils";
import {
  Target,
  Plus,
  Trash2,
  Save,
  Sparkles,
  CheckCircle2,
  Info
} from "lucide-react";

export function MaterialRequirementModal({ isOpen, onClose, project }) {
  const { updateMaterialRequirements } = useProjects();

  const [requirements, setRequirements] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen && project) {
      const initial = generateDefaultRequirementsFromProject(project);
      setRequirements(
        initial.length > 0
          ? initial.map((r, idx) => ({
              id: r.id || `req-${idx + 1}`,
              name: r.name || "",
              targetQuantity: r.targetQuantity !== undefined ? r.targetQuantity : 1000,
              unit: r.unit || "pcs",
              branch: r.branch || "-",
              notes: r.notes || ""
            }))
          : [
              {
                id: `req-${Date.now()}-1`,
                name: "",
                targetQuantity: 1000,
                unit: "pcs",
                branch: "-",
                notes: ""
              }
            ]
      );
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleAddRow = () => {
    setRequirements((prev) => [
      ...prev,
      {
        id: `req-${Date.now()}-${prev.length + 1}`,
        name: "",
        targetQuantity: 1000,
        unit: "pcs",
        branch: "-",
        notes: ""
      }
    ]);
  };

  const handleRemoveRow = (reqId) => {
    setRequirements((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleUpdateField = (reqId, field, value) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanList = requirements
      .filter((r) => r.name && r.name.trim().length > 0)
      .map((r, idx) => ({
        id: r.id || `req-${Date.now()}-${idx + 1}`,
        name: r.name.trim(),
        targetQuantity: Math.max(0, Number(r.targetQuantity || 0)),
        unit: r.unit || "pcs",
        branch: r.branch || "-",
        notes: r.notes || ""
      }));

    updateMaterialRequirements(project.id, cleanList);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "780px" }}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Target size={20} color="var(--amber-400)" />
            <h2 style={{ fontSize: "18px", fontWeight: "700" }}>
              Atur Target Kebutuhan Bahan: {project.targetItem || project.name}
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="modal-body"
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Header Description & Add Action */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                  Tentukan jumlah target yang dibutuhkan untuk setiap bahan. Sistem akan menghitung otomatis berapa yang sudah terbeli dan berapa kekurangannya.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddRow}
                  style={{ fontSize: "12px", padding: "6px 14px" }}
                >
                  <Plus size={14} />
                  <span>Tambah Bahan</span>
                </button>
              </div>
            </div>

            {successMsg && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--emerald-400)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* List of Requirement Rows */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxHeight: "380px",
                overflowY: "auto"
              }}
            >
              {requirements.map((req, idx) => (
                <div
                  key={req.id}
                  className="glass-card"
                  style={{
                    padding: "12px 14px",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    display: "grid",
                    gridTemplateColumns: "auto 2fr 1.2fr 1fr auto",
                    gap: "10px",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-dim)",
                      fontWeight: "700",
                      width: "24px"
                    }}
                  >
                    #{idx + 1}
                  </span>

                  {/* Material Name with Autocomplete */}
                  <div>
                    <label className="form-label" style={{ fontSize: "11px", marginBottom: "2px" }}>
                      Nama Bahan / Item
                    </label>
                    <ItemAutocomplete
                      value={req.name}
                      onChange={(val) => handleUpdateField(req.id, "name", val)}
                      placeholder="Misal: Danger Sign seed"
                      required
                    />
                  </div>

                  {/* Target Quantity */}
                  <div>
                    <label className="form-label" style={{ fontSize: "11px", marginBottom: "2px" }}>
                      Target Butuh (Qty)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={req.targetQuantity}
                      onChange={(e) =>
                        handleUpdateField(req.id, "targetQuantity", e.target.value)
                      }
                      className="form-input font-mono"
                      style={{ fontWeight: "700", color: "var(--amber-400)", fontSize: "13px" }}
                      placeholder="Misal: 10200"
                      required
                    />
                  </div>

                  {/* Satuan / Unit */}
                  <div>
                    <label className="form-label" style={{ fontSize: "11px", marginBottom: "2px" }}>
                      Satuan
                    </label>
                    <select
                      value={req.unit || "pcs"}
                      onChange={(e) => handleUpdateField(req.id, "unit", e.target.value)}
                      className="form-select"
                      style={{ fontSize: "12px" }}
                    >
                      <option value="pcs">pcs (biji)</option>
                      <option value="seed">seed</option>
                      <option value="block">block</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>

                  {/* Delete Button */}
                  <div style={{ paddingTop: "16px" }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(req.id)}
                      className="btn-icon"
                      title="Hapus Target Bahan Ini"
                      style={{ color: "var(--rose-400)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {requirements.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "var(--text-muted)",
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px dashed var(--border-subtle)",
                    fontSize: "13px"
                  }}
                >
                  Belum ada ketentuan target bahan. Klik <strong>"+ Tambah Bahan"</strong> untuk menentukan target bahan projek.
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Simpan Ketentuan Target Bahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
