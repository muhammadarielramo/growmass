import React, { useState, useEffect } from "react";
import { useProjects } from "../context/ProjectContext";
import { ItemAutocomplete } from "./ItemAutocomplete";
import { ConfirmModal } from "./ConfirmModal";
import {
  BookOpen,
  PlusCircle,
  Trash2,
  GitFork,
  ArrowRight,
  Sparkles,
  Save,
  Plus,
  HelpCircle
} from "lucide-react";

export function RecipeEditorModal({ isOpen, onClose, initialRecipe = null, onSaveSuccess = null }) {
  const { addRecipe, updateRecipe } = useProjects();

  const isEditing = Boolean(initialRecipe?.id);
  const [deleteSpliceTarget, setDeleteSpliceTarget] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [recipeA, setRecipeA] = useState("");
  const [recipeB, setRecipeB] = useState("");
  const [splices, setSplices] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (initialRecipe) {
        setName(initialRecipe.name || "");
        setDescription(initialRecipe.description || "");
        setRecipeA(initialRecipe.recipeA || "");
        setRecipeB(initialRecipe.recipeB || "");
        setSplices(
          Array.isArray(initialRecipe.splices) && initialRecipe.splices.length > 0
            ? initialRecipe.splices.map((s, idx) => ({
                id: s.id || `sp-${Date.now()}-${idx}`,
                branch: s.branch || `Tahap ${idx + 1}`,
                itemA: s.itemA || "",
                itemB: s.itemB || "",
                result: s.result || ""
              }))
            : [
                {
                  id: `sp-${Date.now()}-1`,
                  branch: "Tahap 1",
                  itemA: "",
                  itemB: "",
                  result: ""
                }
              ]
        );
      } else {
        setName("");
        setDescription("");
        setRecipeA("");
        setRecipeB("");
        setSplices([
          {
            id: `sp-${Date.now()}-1`,
            branch: "Tahap 1",
            itemA: "",
            itemB: "",
            result: ""
          }
        ]);
      }
    }
  }, [isOpen, initialRecipe]);

  if (!isOpen) return null;

  const handleAddSpliceRow = () => {
    setSplices((prev) => [
      ...prev,
      {
        id: `sp-${Date.now()}-${prev.length + 1}`,
        branch: `Tahap ${prev.length + 1}`,
        itemA: "",
        itemB: "",
        result: ""
      }
    ]);
  };

  const handleRemoveSpliceRow = (spliceId) => {
    setSplices((prev) => prev.filter((s) => s.id !== spliceId));
  };

  const handleUpdateSpliceField = (spliceId, field, value) => {
    setSplices((prev) =>
      prev.map((s) => (s.id === spliceId ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Filter out empty splices
    const cleanSplices = splices
      .filter((s) => s.itemA?.trim() || s.itemB?.trim() || s.result?.trim())
      .map((s, idx) => ({
        id: s.id || `sp-${Date.now()}-${idx}`,
        branch: s.branch?.trim() || `Tahap ${idx + 1}`,
        itemA: s.itemA?.trim() || "-",
        itemB: s.itemB?.trim() || "-",
        result: s.result?.trim() || "-"
      }));

    const recipePayload = {
      name: name.trim(),
      description: description.trim() || `Resep massing ${name.trim()}`,
      recipeA: recipeA.trim(),
      recipeB: recipeB.trim(),
      splices: cleanSplices
    };

    let saved = null;
    if (isEditing) {
      updateRecipe(initialRecipe.id, recipePayload);
      saved = { ...initialRecipe, ...recipePayload };
    } else {
      saved = addRecipe(recipePayload);
    }

    if (onSaveSuccess) {
      onSaveSuccess(saved);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "720px" }}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={20} color="var(--emerald-400)" />
            <h2 style={{ fontSize: "18px", fontWeight: "700" }}>
              {isEditing ? `Edit Resep: ${initialRecipe.name}` : "Tambah Resep Massing Baru"}
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
            {/* Target Item Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Nama Target Item / Resep (Auto-search 850+ Item) <span style={{ color: "var(--rose-400)" }}>*</span>
              </label>
              <ItemAutocomplete
                value={name}
                onChange={(val) => {
                  setName(val);
                  if (!description) {
                    setDescription(`Formula & tahapan splicing untuk membuat ${val}`);
                  }
                }}
                placeholder="Contoh: Science Station, Display Box, Fish Tank, dll."
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Deskripsi Singkat Resep</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Kombinasi Toxic Waste Barrel + Military Radio"
                className="form-input"
              />
            </div>

            {/* Final Formula Box (Item A + Item B -> Result) */}
            <div
              className="glass-panel"
              style={{
                padding: "14px 16px",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-surface-elevated)"
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--emerald-400)",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Sparkles size={14} />
                <span>Formula Utama Akhir (Final Splicing)</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr auto 1fr",
                  gap: "8px",
                  alignItems: "center"
                }}
              >
                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>
                    Bahan Utama A
                  </label>
                  <ItemAutocomplete
                    value={recipeA}
                    onChange={(val) => setRecipeA(val)}
                    placeholder="Contoh: Toxic Waste Barrel"
                  />
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "var(--emerald-400)",
                    paddingTop: "16px",
                    textAlign: "center"
                  }}
                >
                  +
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>
                    Bahan Utama B
                  </label>
                  <ItemAutocomplete
                    value={recipeB}
                    onChange={(val) => setRecipeB(val)}
                    placeholder="Contoh: Military Radio"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "16px"
                  }}
                >
                  <ArrowRight size={18} color="var(--emerald-400)" />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "11px" }}>
                    Hasil Akhir
                  </label>
                  <input
                    type="text"
                    value={name || "Target Item"}
                    readOnly
                    className="form-input font-mono"
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      borderColor: "rgba(16, 185, 129, 0.3)",
                      color: "var(--emerald-400)",
                      fontWeight: "700"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Splice Tree Step List */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px"
                }}
              >
                <div>
                  <label className="form-label" style={{ fontSize: "13px", fontWeight: "700", marginBottom: "2px" }}>
                    Daftar Langkah Splicing ({splices.length} Pasangan)
                  </label>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                    Susun tahapan kombinasi dari bibit dasar hingga bahan jadi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSpliceRow}
                  className="btn btn-secondary"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  <Plus size={14} />
                  <span>Tambah Langkah</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {splices.map((splice, idx) => (
                  <div
                    key={splice.id}
                    style={{
                      padding: "12px",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-surface)",
                      position: "relative",
                      zIndex: (splices.length - idx) * 10
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          className="badge badge-amber"
                          style={{ fontSize: "11px", padding: "2px 8px" }}
                        >
                          Langkah {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={splice.branch}
                          onChange={(e) =>
                            handleUpdateSpliceField(splice.id, "branch", e.target.value)
                          }
                          placeholder="Nama Cabang / Alur (Misal: 1. Membuat Kaktus)"
                          className="form-input"
                          style={{
                            fontSize: "12px",
                            padding: "4px 8px",
                            height: "28px",
                            width: "220px"
                          }}
                        />
                      </div>

                      {splices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (splice.itemA || splice.itemB || splice.result) {
                              setDeleteSpliceTarget(splice);
                            } else {
                              handleRemoveSpliceRow(splice.id);
                            }
                          }}
                          className="btn-icon"
                          title="Hapus Langkah Ini"
                          style={{ color: "var(--rose-400)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr auto 1fr",
                        gap: "6px",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <ItemAutocomplete
                          value={splice.itemA}
                          onChange={(val) =>
                            handleUpdateSpliceField(splice.id, "itemA", val)
                          }
                          placeholder="Item A (Misal: Danger Sign)"
                          style={{ fontSize: "12px" }}
                        />
                      </div>

                      <span style={{ fontWeight: "700", color: "var(--text-dim)", fontSize: "13px" }}>
                        +
                      </span>

                      <div>
                        <ItemAutocomplete
                          value={splice.itemB}
                          onChange={(val) =>
                            handleUpdateSpliceField(splice.id, "itemB", val)
                          }
                          placeholder="Item B (Misal: Rock Background)"
                          style={{ fontSize: "12px" }}
                        />
                      </div>

                      <span style={{ color: "var(--emerald-400)", fontSize: "12px" }}>
                        →
                      </span>

                      <div>
                        <ItemAutocomplete
                          value={splice.result}
                          onChange={(val) =>
                            handleUpdateSpliceField(splice.id, "result", val)
                          }
                          placeholder="Hasil (Misal: Death Spike)"
                          style={{ fontSize: "12px" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{isEditing ? "Simpan Perubahan Resep" : "Simpan Resep Baru"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Delete Splice Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteSpliceTarget)}
        onClose={() => setDeleteSpliceTarget(null)}
        onConfirm={() => {
          if (deleteSpliceTarget) {
            handleRemoveSpliceRow(deleteSpliceTarget.id);
            setDeleteSpliceTarget(null);
          }
        }}
        title={`Hapus Langkah "${deleteSpliceTarget?.branch || "Splicing"}"?`}
        message={`Apakah Anda yakin ingin menghapus langkah kombinasi ${deleteSpliceTarget?.itemA || "?"} + ${deleteSpliceTarget?.itemB || "?"} → ${deleteSpliceTarget?.result || "?"}?`}
        confirmText="Hapus Langkah"
      />
    </div>
  );
}
