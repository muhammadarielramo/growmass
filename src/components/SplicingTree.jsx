import React, { useState } from "react";
import { useProjects } from "../context/ProjectContext";
import { useCurrency } from "../context/CurrencyContext";
import { ItemAutocomplete } from "./ItemAutocomplete";
import { ItemIcon } from "./ItemIcon";
import { calculatePurchaseCost, RATE_TYPES } from "../utils/currencyRateCalculator";
import {
  GitFork,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Package,
  Save,
  Coins,
  Calculator,
  TrendingDown,
  Info
} from "lucide-react";

export function SplicingTree({ project }) {
  const { updateProject } = useProjects();
  const { config, formatLocks, formatIDR, wlToIdr } = useCurrency();
  const [showAddSpliceModal, setShowAddSpliceModal] = useState(false);
  const [editingSpliceId, setEditingSpliceId] = useState(null);

  // Form State
  const [selectedBranch, setSelectedBranch] = useState("1. Membuat Kaktus");
  const [customBranchText, setCustomBranchText] = useState("");
  const [isCustomBranch, setIsCustomBranch] = useState(false);

  // Ingredient A
  const [itemA, setItemA] = useState("");
  const [qtyA, setQtyA] = useState("");
  const [rateTypeA, setRateTypeA] = useState("total_wl"); // 'total_wl', 'item_per_wl', 'wl_per_item', 'total_dl'
  const [rateValueA, setRateValueA] = useState("");
  const [isSpliceProducedA, setIsSpliceProducedA] = useState(false);

  // Ingredient B
  const [itemB, setItemB] = useState("");
  const [qtyB, setQtyB] = useState("");
  const [rateTypeB, setRateTypeB] = useState("total_wl");
  const [rateValueB, setRateValueB] = useState("");
  const [isSpliceProducedB, setIsSpliceProducedB] = useState(false);

  // Result X
  const [result, setResult] = useState("");
  const [qtyResult, setQtyResult] = useState("");

  const recipe = project.recipe || {};
  const splices = recipe.splices || [];
  const materials = project.materials || [];
  const stages = project.stages || [];

  // Available branch list for dropdown
  const defaultBranchList = [
    "1. Membuat Kaktus",
    "2. Membuat Bathtub",
    "3. Membuat Plumbing",
    "4. Membuat Toxic Waste Barrel",
    "5. Finalisasi (Science Station)",
    "Cabang Military Radio"
  ];

  // Merge with any custom branches from stages and splices
  const branchOptionsSet = new Set(defaultBranchList);
  stages.forEach(s => { if (s.title) branchOptionsSet.add(s.title); });
  splices.forEach(s => { if (s.branch) branchOptionsSet.add(s.branch); });
  const allBranchOptions = Array.from(branchOptionsSet);

  // Calculate live costs in modal
  const costA = isSpliceProducedA ? { totalWL: 0, totalIDR: 0, rateDisplay: "Hasil Splice", unitPriceWL: 0 } : calculatePurchaseCost({
    quantity: Number(qtyA || 0),
    rateType: rateTypeA,
    rateValue: Number(rateValueA || 0),
    idrPerDl: config.idrPerDl
  });

  const costB = isSpliceProducedB ? { totalWL: 0, totalIDR: 0, rateDisplay: "Hasil Splice", unitPriceWL: 0 } : calculatePurchaseCost({
    quantity: Number(qtyB || 0),
    rateType: rateTypeB,
    rateValue: Number(rateValueB || 0),
    idrPerDl: config.idrPerDl
  });

  const totalStepLiveCostWL = (costA.totalWL || 0) + (costB.totalWL || 0);

  // Compute total splice capital across all splices
  const totalSplicesCostWL = splices.reduce((sum, sp) => {
    const costA_val = Number(sp.costWLA || 0);
    const costB_val = Number(sp.costWLB || 0);
    return sum + costA_val + costB_val;
  }, 0);

  // Final produced target estimate
  const finalSplice = splices.find(s => s.result.toLowerCase().includes((project.targetItem || "Science Station").toLowerCase())) || splices[splices.length - 1];
  const finalOutputYield = Number(finalSplice?.qtyResult || project.targetQuantity || 0);
  const costPerTargetUnitWL = finalOutputYield > 0 ? (totalSplicesCostWL / finalOutputYield).toFixed(2) : "-";

  // Group splices by branch
  const splicesByBranch = splices.reduce((acc, sp) => {
    const br = sp.branch || "Lainnya";
    if (!acc[br]) acc[br] = [];
    acc[br].push(sp);
    return acc;
  }, {});

  const handleOpenAdd = () => {
    setEditingSpliceId(null);
    setSelectedBranch(allBranchOptions[0] || "1. Membuat Kaktus");
    setCustomBranchText("");
    setIsCustomBranch(false);

    setItemA("");
    setQtyA("");
    setRateTypeA("total_wl");
    setRateValueA("");
    setIsSpliceProducedA(false);

    setItemB("");
    setQtyB("");
    setRateTypeB("total_wl");
    setRateValueB("");
    setIsSpliceProducedB(false);

    setResult("");
    setQtyResult("");
    setShowAddSpliceModal(true);
  };

  const handleOpenEdit = (sp) => {
    setEditingSpliceId(sp.id);
    const br = sp.branch || "1. Membuat Kaktus";
    if (allBranchOptions.includes(br)) {
      setSelectedBranch(br);
      setIsCustomBranch(false);
      setCustomBranchText("");
    } else {
      setSelectedBranch("__custom__");
      setIsCustomBranch(true);
      setCustomBranchText(br);
    }

    setItemA(sp.itemA || "");
    setQtyA(sp.qtyA ? sp.qtyA.toString() : "");
    setRateTypeA(sp.rateTypeA || "total_wl");
    setRateValueA(sp.rateValueA ? sp.rateValueA.toString() : (sp.costWLA || ""));
    setIsSpliceProducedA(sp.rateDisplayA === "Hasil Splice" || sp.costWLA === 0);

    setItemB(sp.itemB || "");
    setQtyB(sp.qtyB ? sp.qtyB.toString() : "");
    setRateTypeB(sp.rateTypeB || "total_wl");
    setRateValueB(sp.rateValueB ? sp.rateValueB.toString() : (sp.costWLB || ""));
    setIsSpliceProducedB(sp.rateDisplayB === "Hasil Splice" || sp.costWLB === 0);

    setResult(sp.result || "");
    setQtyResult(sp.qtyResult ? sp.qtyResult.toString() : "");
    setShowAddSpliceModal(true);
  };

  const handleSaveSplice = (e) => {
    e.preventDefault();
    if (!itemA.trim() || !itemB.trim() || !result.trim()) return;

    const finalBranch = isCustomBranch ? (customBranchText.trim() || "Lainnya") : selectedBranch;

    const computedA = isSpliceProducedA ? { totalWL: 0, rateDisplay: "Hasil Splice" } : calculatePurchaseCost({
      quantity: Number(qtyA || 0),
      rateType: rateTypeA,
      rateValue: Number(rateValueA || 0),
      idrPerDl: config.idrPerDl
    });

    const computedB = isSpliceProducedB ? { totalWL: 0, rateDisplay: "Hasil Splice" } : calculatePurchaseCost({
      quantity: Number(qtyB || 0),
      rateType: rateTypeB,
      rateValue: Number(rateValueB || 0),
      idrPerDl: config.idrPerDl
    });

    const spliceData = {
      branch: finalBranch,
      itemA: itemA.trim(),
      qtyA: Number(qtyA || 0),
      rateTypeA,
      rateValueA: Number(rateValueA || 0),
      rateDisplayA: computedA.rateDisplay,
      costWLA: computedA.totalWL,

      itemB: itemB.trim(),
      qtyB: Number(qtyB || 0),
      rateTypeB,
      rateValueB: Number(rateValueB || 0),
      rateDisplayB: computedB.rateDisplay,
      costWLB: computedB.totalWL,

      result: result.trim(),
      qtyResult: Number(qtyResult || 0)
    };

    let updatedSplices = [...splices];
    if (editingSpliceId) {
      updatedSplices = updatedSplices.map((s) =>
        s.id === editingSpliceId ? { ...s, ...spliceData } : s
      );
    } else {
      updatedSplices.push({
        id: `sp-${Date.now()}`,
        ...spliceData
      });
    }

    // Sync to project materials list
    let updatedMaterials = [...materials];
    
    if (!isSpliceProducedA && spliceData.costWLA > 0 && spliceData.qtyA > 0) {
      const existingIdxA = updatedMaterials.findIndex(m => m.name.toLowerCase().trim() === itemA.toLowerCase().trim() || m.name.toLowerCase().trim() === `${itemA.toLowerCase().trim()} seed`);
      if (existingIdxA >= 0) {
        updatedMaterials[existingIdxA] = {
          ...updatedMaterials[existingIdxA],
          quantity: spliceData.qtyA,
          rateDisplay: computedA.rateDisplay,
          totalWL: spliceData.costWLA
        };
      } else {
        updatedMaterials.push({
          id: `mat-${Date.now()}-a`,
          name: `${itemA.trim()} seed`,
          category: "Bibit Dasar",
          branch: finalBranch,
          quantity: spliceData.qtyA,
          unit: "pcs",
          rateType: rateTypeA,
          rateValue: Number(rateValueA || 0),
          rateDisplay: computedA.rateDisplay,
          totalWL: spliceData.costWLA,
          notes: `Bahan untuk ${result.trim()}`
        });
      }
    }

    if (!isSpliceProducedB && spliceData.costWLB > 0 && spliceData.qtyB > 0) {
      const existingIdxB = updatedMaterials.findIndex(m => m.name.toLowerCase().trim() === itemB.toLowerCase().trim() || m.name.toLowerCase().trim() === `${itemB.toLowerCase().trim()} seed`);
      if (existingIdxB >= 0) {
        updatedMaterials[existingIdxB] = {
          ...updatedMaterials[existingIdxB],
          quantity: spliceData.qtyB,
          rateDisplay: computedB.rateDisplay,
          totalWL: spliceData.costWLB
        };
      } else {
        updatedMaterials.push({
          id: `mat-${Date.now()}-b`,
          name: `${itemB.trim()} seed`,
          category: "Bibit Dasar",
          branch: finalBranch,
          quantity: spliceData.qtyB,
          unit: "pcs",
          rateType: rateTypeB,
          rateValue: Number(rateValueB || 0),
          rateDisplay: computedB.rateDisplay,
          totalWL: spliceData.costWLB,
          notes: `Bahan untuk ${result.trim()}`
        });
      }
    }

    updateProject(project.id, {
      recipe: {
        ...recipe,
        splices: updatedSplices
      },
      materials: updatedMaterials
    });

    setShowAddSpliceModal(false);
  };

  const handleDeleteSplice = (spliceId) => {
    const updatedSplices = splices.filter((s) => s.id !== spliceId);
    updateProject(project.id, {
      recipe: {
        ...recipe,
        splices: updatedSplices
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Splice Capital Overview Header Banner */}
      <div className="glass-card" style={{
        background: "var(--bg-glass-card)",
        border: "1px solid var(--border-medium)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="badge badge-purple">
                <GitFork size={14} /> POHON RESEP SPLICING & KALKULATOR MODAL
              </span>
              <span className="badge badge-neutral">{splices.length} Pasangan Splice</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ItemIcon name={project.targetItem || "Science Station"} size={36} />
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>
                  Formula & Modal Splicing: {project.targetItem || project.name}
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>
                  Input jumlah & harga beli Bahan A + Bahan B $\rightarrow$ Menghasilkan berapa Hasil X (Otomatis masuk rekapan modal).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Add Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{
              background: "rgba(0, 0, 0, 0.4)",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              textAlign: "right"
            }}>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                Total Modal Bahan Splicing
              </div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--amber-400)" }} className="font-mono">
                {formatLocks(totalSplicesCostWL)}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                ≈ {formatIDR(wlToIdr(totalSplicesCostWL))}
              </div>
            </div>

            {finalOutputYield > 0 && (
              <div style={{
                background: "rgba(0, 0, 0, 0.4)",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                textAlign: "right"
              }}>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Estimasi Biaya / Biji Target
                </div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--emerald-400)" }} className="font-mono">
                  {costPerTargetUnitWL} WL/biji
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Target: {finalOutputYield.toLocaleString()} pcs
                </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={handleOpenAdd} style={{ fontSize: "13px", padding: "10px 16px" }}>
              <Plus size={16} />
              <span>Tambah Pasangan Resep</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Splice Branches */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {Object.entries(splicesByBranch).map(([branchName, branchSplices]) => (
          <div key={branchName} className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} color="var(--purple-400)" />
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                  {branchName}
                </h3>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: "11px" }}>
                {branchSplices.length} Langkah
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "16px" }}>
              {branchSplices.map((sp) => {
                const stepCostWL = Number(sp.costWLA || 0) + Number(sp.costWLB || 0);
                const stepCostIDR = wlToIdr(stepCostWL);

                return (
                  <div
                    key={sp.id}
                    className="glass-card"
                    style={{
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "16px",
                      position: "relative"
                    }}
                  >
                    {/* Header: Branch and Actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="badge badge-purple" style={{ fontSize: "10px" }}>
                        {sp.branch || branchName}
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button className="btn-icon" onClick={() => handleOpenEdit(sp)} title="Edit Jumlah, Harga & Resep">
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDeleteSplice(sp.id)} title="Hapus Resep" style={{ color: "var(--rose-400)" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Detailed Interactive Splice Visual Card */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr auto 1.2fr auto 1.4fr",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(0, 0, 0, 0.35)",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.05)"
                    }}>
                      {/* Ingredient A */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minWidth: 0 }}>
                        <ItemIcon name={sp.itemA} size={32} style={{ marginBottom: "4px" }} />
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--cyan-300)", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                          {sp.itemA}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-main)", marginTop: "2px" }} className="font-mono">
                          {sp.qtyA ? `${sp.qtyA.toLocaleString()} pcs` : "-"}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--amber-400)", marginTop: "2px" }}>
                          {sp.rateDisplayA || "-"}
                        </div>
                        {sp.costWLA > 0 ? (
                          <div style={{ fontSize: "10px", color: "var(--emerald-400)", fontWeight: "700" }}>
                            {formatLocks(sp.costWLA)}
                          </div>
                        ) : (
                          <div style={{ fontSize: "9px", color: "var(--text-dim)" }}>
                            (Hasil Splice)
                          </div>
                        )}
                      </div>

                      <span style={{ fontWeight: "800", color: "var(--purple-400)", fontSize: "16px" }}>+</span>

                      {/* Ingredient B */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minWidth: 0 }}>
                        <ItemIcon name={sp.itemB} size={32} style={{ marginBottom: "4px" }} />
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--purple-300)", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                          {sp.itemB}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-main)", marginTop: "2px" }} className="font-mono">
                          {sp.qtyB ? `${sp.qtyB.toLocaleString()} pcs` : "-"}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--amber-400)", marginTop: "2px" }}>
                          {sp.rateDisplayB || "-"}
                        </div>
                        {sp.costWLB > 0 ? (
                          <div style={{ fontSize: "10px", color: "var(--emerald-400)", fontWeight: "700" }}>
                            {formatLocks(sp.costWLB)}
                          </div>
                        ) : (
                          <div style={{ fontSize: "9px", color: "var(--text-dim)" }}>
                            (Hasil Splice)
                          </div>
                        )}
                      </div>

                      <ArrowRight size={16} color="var(--emerald-400)" />

                      {/* Result X */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minWidth: 0 }}>
                        <ItemIcon name={sp.result} size={36} style={{ marginBottom: "4px" }} />
                        <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--emerald-400)", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                          {sp.result}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          fontWeight: "800",
                          color: "#ffffff",
                          background: "rgba(16, 185, 129, 0.25)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: "1px solid rgba(16, 185, 129, 0.4)",
                          marginTop: "2px"
                        }} className="font-mono">
                          {sp.qtyResult ? `${sp.qtyResult.toLocaleString()} seed` : "-"}
                        </div>
                        <div style={{ fontSize: "9px", color: "var(--emerald-300)", marginTop: "2px" }}>
                          Hasil Produksi
                        </div>
                      </div>
                    </div>

                    {/* Step Cost Bottom Bar */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      paddingTop: "8px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)"
                    }}>
                      <span>Biaya Modal Tahap Ini:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ color: stepCostWL > 0 ? "var(--amber-400)" : "var(--text-dim)" }} className="font-mono">
                          {stepCostWL > 0 ? formatLocks(stepCostWL) : "0 WL (Dari Hasil Sebelumnya)"}
                        </strong>
                        {stepCostWL > 0 && (
                          <span className="font-mono" style={{ color: "var(--emerald-400)" }}>
                            ≈ {formatIDR(stepCostIDR)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Splice Modal with Direct WL Value input options */}
      {showAddSpliceModal && (
        <div className="modal-overlay" onClick={() => setShowAddSpliceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "660px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GitFork size={20} color="var(--purple-400)" />
                <h2 style={{ fontSize: "17px", fontWeight: "700" }}>
                  {editingSpliceId ? "Edit Formula, Jumlah & Biaya Splice" : "Tambah Formula, Jumlah & Biaya Splice"}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => setShowAddSpliceModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveSplice}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Branch Selection Dropdown */}
                <div className="form-group">
                  <label className="form-label">Pilih Kelompok / Cabang Alur</label>
                  <select
                    value={isCustomBranch ? "__custom__" : selectedBranch}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomBranch(true);
                      } else {
                        setIsCustomBranch(false);
                        setSelectedBranch(e.target.value);
                      }
                    }}
                    className="form-select"
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  >
                    {allBranchOptions.map((br) => (
                      <option key={br} value={br}>{br}</option>
                    ))}
                    <option value="__custom__">+ Tulis Cabang Kustom Baru...</option>
                  </select>

                  {isCustomBranch && (
                    <input
                      type="text"
                      placeholder="Ketik nama cabang kustom (misal: Cabang High-Tier Alchemy)..."
                      value={customBranchText}
                      onChange={(e) => setCustomBranchText(e.target.value)}
                      className="form-input"
                      style={{ marginTop: "8px" }}
                      required
                      autoFocus
                    />
                  )}
                </div>

                {/* Section Bahan A */}
                <div style={{ background: "rgba(6, 182, 212, 0.06)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(6, 182, 212, 0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                    <label className="form-label" style={{ color: "var(--cyan-300)", marginBottom: 0 }}>
                      🔷 Bahan 1 (Seed A)
                    </label>
                    <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "var(--text-dim)" }}>
                      <input
                        type="checkbox"
                        checked={isSpliceProducedA}
                        onChange={(e) => setIsSpliceProducedA(e.target.checked)}
                      />
                      <span>Bahan dari hasil splice sebelumnya (Gratis / Sudah Jadi)</span>
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "10px" }}>
                    <ItemAutocomplete
                      value={itemA}
                      onChange={(val) => setItemA(val)}
                      placeholder="Cari Bahan A (Misal: Danger Sign)..."
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Jumlah Beli (Qty A)"
                      value={qtyA}
                      onChange={(e) => setQtyA(e.target.value)}
                      className="form-input font-mono"
                      required
                    />
                  </div>

                  {!isSpliceProducedA && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Rate Type Selector Pills */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {[
                          { id: "total_wl", label: "💵 Total WL Langsung" },
                          { id: "item_per_wl", label: "Item / WL" },
                          { id: "wl_per_item", label: "WL / Item" },
                          { id: "total_dl", label: "Total DL" }
                        ].map((rt) => (
                          <button
                            key={rt.id}
                            type="button"
                            onClick={() => setRateTypeA(rt.id)}
                            className={`badge ${rateTypeA === rt.id ? "badge-cyan" : "badge-neutral"}`}
                            style={{ cursor: "pointer", padding: "4px 8px", fontSize: "11px", fontWeight: "700" }}
                          >
                            {rt.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                        <input
                          type="number"
                          step="any"
                          min="0.0001"
                          placeholder={
                            rateTypeA === "total_wl" ? "Masukkan Total WL Langsung (misal: 291 WL)..." :
                            rateTypeA === "item_per_wl" ? "Berapa biji per 1 WL (misal: 35)..." :
                            rateTypeA === "wl_per_item" ? "Harga WL per biji (misal: 1.5)..." :
                            "Total DL langsung (misal: 3 DL)..."
                          }
                          value={rateValueA}
                          onChange={(e) => setRateValueA(e.target.value)}
                          className="form-input font-mono"
                          style={{ color: "var(--cyan-300)", fontWeight: "700" }}
                        />
                      </div>
                    </div>
                  )}

                  {qtyA && !isSpliceProducedA && costA.totalWL > 0 && (
                    <div style={{ fontSize: "11px", color: "var(--cyan-300)", marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span>Biaya Bahan A: <strong>{formatLocks(costA.totalWL)}</strong> ({costA.rateDisplay})</span>
                      <span>≈ {formatIDR(costA.totalIDR)}</span>
                    </div>
                  )}
                </div>

                {/* Section Bahan B */}
                <div style={{ background: "rgba(168, 85, 247, 0.06)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                    <label className="form-label" style={{ color: "var(--purple-300)", marginBottom: 0 }}>
                      🟣 Bahan 2 (Seed B)
                    </label>
                    <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "var(--text-dim)" }}>
                      <input
                        type="checkbox"
                        checked={isSpliceProducedB}
                        onChange={(e) => setIsSpliceProducedB(e.target.checked)}
                      />
                      <span>Bahan dari hasil splice sebelumnya (Gratis / Sudah Jadi)</span>
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "10px" }}>
                    <ItemAutocomplete
                      value={itemB}
                      onChange={(val) => setItemB(val)}
                      placeholder="Cari Bahan B (Misal: Rock Background)..."
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Jumlah Beli (Qty B)"
                      value={qtyB}
                      onChange={(e) => setQtyB(e.target.value)}
                      className="form-input font-mono"
                      required
                    />
                  </div>

                  {!isSpliceProducedB && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Rate Type Selector Pills */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {[
                          { id: "total_wl", label: "💵 Total WL Langsung" },
                          { id: "item_per_wl", label: "Item / WL" },
                          { id: "wl_per_item", label: "WL / Item" },
                          { id: "total_dl", label: "Total DL" }
                        ].map((rt) => (
                          <button
                            key={rt.id}
                            type="button"
                            onClick={() => setRateTypeB(rt.id)}
                            className={`badge ${rateTypeB === rt.id ? "badge-purple" : "badge-neutral"}`}
                            style={{ cursor: "pointer", padding: "4px 8px", fontSize: "11px", fontWeight: "700" }}
                          >
                            {rt.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                        <input
                          type="number"
                          step="any"
                          min="0.0001"
                          placeholder={
                            rateTypeB === "total_wl" ? "Masukkan Total WL Langsung (misal: 365 WL)..." :
                            rateTypeB === "item_per_wl" ? "Berapa biji per 1 WL (misal: 28)..." :
                            rateTypeB === "wl_per_item" ? "Harga WL per biji (misal: 1.5)..." :
                            "Total DL langsung (misal: 3.5 DL)..."
                          }
                          value={rateValueB}
                          onChange={(e) => setRateValueB(e.target.value)}
                          className="form-input font-mono"
                          style={{ color: "var(--purple-300)", fontWeight: "700" }}
                        />
                      </div>
                    </div>
                  )}

                  {qtyB && !isSpliceProducedB && costB.totalWL > 0 && (
                    <div style={{ fontSize: "11px", color: "var(--purple-300)", marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span>Biaya Bahan B: <strong>{formatLocks(costB.totalWL)}</strong> ({costB.rateDisplay})</span>
                      <span>≈ {formatIDR(costB.totalIDR)}</span>
                    </div>
                  )}
                </div>

                {/* Section Output Result X */}
                <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                  <label className="form-label" style={{ color: "var(--emerald-400)", marginBottom: "8px" }}>
                    🟢 Hasil Penggabungan (Output Seed X)
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                    <ItemAutocomplete
                      value={result}
                      onChange={(val) => setResult(val)}
                      placeholder="Nama Hasil Splice (Misal: Death Spike)..."
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Estimasi Hasil (Qty)"
                      value={qtyResult}
                      onChange={(e) => setQtyResult(e.target.value)}
                      className="form-input font-mono"
                      style={{ fontWeight: "700", color: "var(--emerald-400)" }}
                      required
                    />
                  </div>
                </div>

                {/* Live Step Summary */}
                <div style={{
                  background: "var(--bg-surface-elevated)",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  borderLeft: "4px solid var(--amber-400)",
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ color: "var(--text-muted)" }}>Total Modal Langkah Splice Ini:</div>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--amber-400)" }} className="font-mono">
                      {formatLocks(totalStepLiveCostWL)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--text-muted)" }}>Estimasi Rupiah:</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--emerald-400)" }} className="font-mono">
                      {formatIDR(wlToIdr(totalStepLiveCostWL))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSpliceModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSpliceId ? "Simpan Perubahan & Update Modal" : "Tambah ke Resep & Rekapan Modal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
