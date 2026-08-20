import React, { useState, useEffect } from "react";
import { useProjects } from "../context/ProjectContext";
import { useCurrency } from "../context/CurrencyContext";
import { ItemAutocomplete } from "./ItemAutocomplete";
import {
  Layers,
  PlusCircle,
  Clock,
  Sparkles,
  Coins,
  MapPin
} from "lucide-react";

export function ProjectModal({ isOpen, onClose, initialRecipe = null, presetRecipe = null }) {
  const { createProject } = useProjects();
  const { config, idrToWl, wlToIdr, formatLocks, formatIDR } = useCurrency();

  const selectedPreset = presetRecipe || initialRecipe;

  const [itemName, setItemName] = useState(selectedPreset?.name || "Science Station");
  const [projectName, setProjectName] = useState("");
  const [targetQuantity, setTargetQuantity] = useState(""); // Optional
  const [unit, setUnit] = useState("Seeds");
  const [worldName, setWorldName] = useState("");
  const [storageWorld, setStorageWorld] = useState("");
  const [notes, setNotes] = useState("");

  // Initial Capital
  const [capitalMode, setCapitalMode] = useState("DL"); // 'WL', 'DL', 'BGL', 'IDR'
  const [capitalAmount, setCapitalAmount] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (selectedPreset) {
        setItemName(selectedPreset.name || "Science Station");
        setProjectName(`Massing ${selectedPreset.name || "Science Station"}`);
      } else {
        setItemName("Science Station");
        setProjectName("Massing Science Station");
      }
    }
  }, [isOpen, selectedPreset]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalCapitalWL = 0;
    const rawCap = Number(capitalAmount || 0);
    if (rawCap > 0) {
      if (capitalMode === "WL") finalCapitalWL = rawCap;
      else if (capitalMode === "DL") finalCapitalWL = rawCap * 100;
      else if (capitalMode === "BGL") finalCapitalWL = rawCap * 10000;
      else if (capitalMode === "IDR") finalCapitalWL = idrToWl(rawCap);
    }

    const targetItemClean = itemName.trim() || "Item Massing";
    const customProjectName = projectName.trim() || `Massing ${targetItemClean}${targetQuantity ? ` x${targetQuantity}` : ""}`;

    createProject({
      name: customProjectName,
      targetItem: targetItemClean,
      targetQuantity: targetQuantity ? Number(targetQuantity) : null,
      unit: unit || "Seeds",
      worldName: worldName.trim().toUpperCase(),
      storageWorld: storageWorld.trim().toUpperCase(),
      notes: notes.trim(),
      recipe: {
        id: selectedPreset?.id || `custom_${Date.now()}`,
        name: targetItemClean,
        category: "Mass Project",
        description: selectedPreset?.description || `Projek massing ${targetItemClean}`,
        recipeA: selectedPreset?.recipeA || "",
        recipeB: selectedPreset?.recipeB || "",
        splices: selectedPreset?.splices || []
      },
      initialCapitalWL: finalCapitalWL,
      capitalSource: capitalMode
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={20} color="var(--emerald-400)" />
            <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Buat Projek Massing Baru</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Target Item Name with ItemAutocomplete */}
            <div className="form-group">
              <label className="form-label">Target Item Massing (Auto-search 850+ Item)</label>
              <ItemAutocomplete
                value={itemName}
                onChange={(val) => {
                  setItemName(val);
                  if (!projectName || projectName.startsWith("Massing ")) {
                    setProjectName(`Massing ${val}${targetQuantity ? ` x${targetQuantity}` : ""}`);
                  }
                }}
                placeholder="Misal: Science Station, Display Box, Fish Tank, dll."
                required
                autoFocus
              />
            </div>

            {/* Custom Project Name */}
            <div className="form-group">
              <label className="form-label">Nama Projek</label>
              <input
                type="text"
                placeholder="Contoh: Massing Science Station Batch 1"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Target Quantity (Optional) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Jumlah / Qty (Opsional / Kosongkan jika belum tahu)</label>
              <input
                type="number"
                min="1"
                placeholder="Contoh: 6830 (Bisa diisi nanti)"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                className="form-input font-mono"
              />
            </div>

            {/* Worlds Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">World Massing / Farm (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: MASSLAB01"
                  value={worldName}
                  onChange={(e) => setWorldName(e.target.value)}
                  className="form-input font-mono"
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">World Storage / Drop (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: STORECHEM01"
                  value={storageWorld}
                  onChange={(e) => setStorageWorld(e.target.value)}
                  className="form-input font-mono"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
            </div>

            {/* Initial Capital (Completely Optional) */}
            <div className="form-group" style={{ background: "var(--bg-surface-elevated)", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Modal Awal (Opsional - Bisa Diisi Nanti)</label>
                <div style={{ display: "flex", gap: "4px" }}>
                  {["WL", "DL", "BGL", "IDR"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCapitalMode(mode)}
                      className={`badge ${capitalMode === mode ? "badge-emerald" : "badge-neutral"}`}
                      style={{ cursor: "pointer", padding: "2px 8px", fontSize: "11px" }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="number"
                step="any"
                min="0"
                placeholder={`Masukkan nominal modal awal dalam ${capitalMode} (atau biarkan 0)...`}
                value={capitalAmount}
                onChange={(e) => setCapitalAmount(e.target.value)}
                className="form-input font-mono"
              />
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Catatan Tambahan</label>
              <textarea
                placeholder="Tulis catatan, rencana batch, atau keterangan lainnya..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
                rows="2"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Mulai Projek</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
