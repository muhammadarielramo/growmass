import React, { useState } from "react";
import { useProjects } from "../context/ProjectContext";
import { useCurrency } from "../context/CurrencyContext";
import { calculatePurchaseCost, RATE_TYPES } from "../utils/currencyRateCalculator";
import { exportProjectToXLSX, exportProjectToCSV } from "../utils/exportUtils";
import { getTodayGMT7, formatDateGMT7 } from "../utils/dateUtils";
import { ItemAutocomplete } from "./ItemAutocomplete";
import { ItemIcon } from "./ItemIcon";
import {
  Package,
  PlusCircle,
  FileSpreadsheet,
  FileText,
  Trash2,
  Edit2,
  Calculator,
  Coins,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  Info,
  Calendar
} from "lucide-react";

export function MaterialPurchases({ project }) {
  const { addMaterial, deleteMaterial, updateMaterial } = useProjects();
  const { config, formatLocks, formatIDR, wlToIdr } = useCurrency();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMatId, setEditingMatId] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Bibit Dasar");
  const [branch, setBranch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [rateType, setRateType] = useState("item_per_wl");
  const [rateValue, setRateValue] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(getTodayGMT7());
  const [filterCategory, setFilterCategory] = useState("all");

  const materials = project.materials || [];

  // Computed total spend
  const totalSpendWL = materials.reduce((sum, m) => sum + Number(m.totalWL || 0), 0);
  const totalSpendIDR = wlToIdr(totalSpendWL);
  const totalQuantitySum = materials.reduce((sum, m) => sum + Number(m.quantity || 0), 0);

  // Live calculation for modal
  const liveCost = calculatePurchaseCost({
    quantity: Number(quantity || 0),
    rateType,
    rateValue: Number(rateValue || 0),
    idrPerDl: config.idrPerDl
  });

  const handleOpenAddModal = () => {
    setEditingMatId(null);
    setName("");
    setCategory("Bibit Dasar");
    setBranch("");
    setQuantity("");
    setRateType("item_per_wl");
    setRateValue("");
    setNotes("");
    setPurchaseDate(getTodayGMT7());
    setShowAddModal(true);
  };

  const handleEditModal = (mat) => {
    setEditingMatId(mat.id);
    setName(mat.name);
    setCategory(mat.category || "Bibit Dasar");
    setBranch(mat.branch || "");
    setQuantity(mat.quantity.toString());
    setRateType(mat.rateType || "item_per_wl");
    setRateValue(mat.rateValue || "");
    setNotes(mat.notes || "");
    setPurchaseDate(mat.date || getTodayGMT7());
    setShowAddModal(true);
  };

  const handleSaveMaterial = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const computed = calculatePurchaseCost({
      quantity: Number(quantity || 0),
      rateType,
      rateValue: Number(rateValue || 0),
      idrPerDl: config.idrPerDl
    });

    const matData = {
      name: name.trim(),
      category,
      branch: branch.trim() || "-",
      quantity: Number(quantity || 0),
      unit: unit || "pcs",
      rateType,
      rateValue: Number(rateValue || 0),
      rateDisplay: computed.rateDisplay,
      totalWL: computed.totalWL,
      date: purchaseDate || getTodayGMT7(),
      notes: notes.trim()
    };

    if (editingMatId) {
      updateMaterial(project.id, editingMatId, matData);
    } else {
      addMaterial(project.id, matData);
    }

    setShowAddModal(false);
  };

  const filteredMaterials = materials.filter((m) => {
    if (filterCategory === "all") return true;
    return m.category === filterCategory;
  });

  const categories = ["all", "Bibit Dasar", "Bibit Tambahan", "Alat Operasional"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Master Spend Overview Banner */}
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(21, 31, 54, 0.9) 0%, rgba(14, 20, 36, 0.95) 100%)",
        border: "1px solid rgba(245, 158, 11, 0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="badge badge-amber">
                <Coins size={14} /> REKAPAN PENGADAAN BAHAN
              </span>
              <span className="badge badge-neutral">{materials.length} Jenis Item</span>
              <span className="badge badge-cyan">{totalQuantitySum.toLocaleString()} Total Unit</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
              Total Biaya Pembelian (Total Spend)
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "2px" }}>
              <span style={{ fontSize: "28px", fontWeight: "800", color: "var(--amber-400)" }} className="font-mono">
                {formatLocks(totalSpendWL)}
              </span>
              <span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: "600" }} className="font-mono">
                ≈ {formatIDR(totalSpendIDR)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Add & Export */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary"
              onClick={() => exportProjectToCSV(project, config)}
              title="Ekspor daftar bahan ke CSV"
              style={{ fontSize: "13px", padding: "8px 14px" }}
            >
              <FileText size={16} color="var(--cyan-400)" />
              <span>Ekspor CSV</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => exportProjectToXLSX(project, config)}
              title="Ekspor rekapan lengkap ke Excel (.xlsx)"
              style={{ fontSize: "13px", padding: "8px 14px", border: "1px solid rgba(16, 185, 129, 0.4)" }}
            >
              <FileSpreadsheet size={16} color="var(--emerald-400)" />
              <span style={{ color: "var(--emerald-400)" }}>Ekspor Excel (XLSX)</span>
            </button>

            <button
              className="btn btn-amber"
              onClick={handleOpenAddModal}
              style={{ fontSize: "13px", padding: "8px 16px" }}
            >
              <PlusCircle size={16} />
              <span>Catat Pembelian Bahan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`badge ${filterCategory === cat ? "badge-amber" : "badge-neutral"}`}
              style={{
                cursor: "pointer",
                padding: "6px 14px",
                fontSize: "12px",
                border: filterCategory === cat ? "1px solid var(--amber-500)" : "1px solid var(--border-subtle)"
              }}
            >
              {cat === "all" ? `Semua Bahan (${materials.length})` : `${cat} (${materials.filter(m => m.category === cat).length})`}
            </button>
          ))}
        </div>

        <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
          Didukung 850+ database item Growtopia resmi dengan auto-complete & ikon
        </span>
      </div>

      {/* Materials Table */}
      <div className="custom-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>No</th>
              <th>Nama Bahan / Item</th>
              <th>Kategori</th>
              <th>Cabang Alur Resep</th>
              <th style={{ textAlign: "right" }}>Jumlah Beli (Qty)</th>
              <th>Rate / Harga Beli</th>
              <th style={{ textAlign: "right" }}>Harga Satuan (WL)</th>
              <th style={{ textAlign: "right" }}>Total Biaya (WL)</th>
              <th style={{ textAlign: "right" }}>Estimasi Rupiah</th>
              <th style={{ textAlign: "right", width: "80px" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((mat, idx) => {
              const qty = Number(mat.quantity || 0);
              const totalWL = Number(mat.totalWL || 0);
              const unitPrice = qty > 0 ? (totalWL / qty).toFixed(4) : "-";

              return (
                <tr key={mat.id || idx}>
                  <td style={{ color: "var(--text-dim)" }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <ItemIcon name={mat.name} size={30} />
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px" }}>
                          {mat.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                          {mat.date && (
                            <span>📅 {formatDateGMT7(mat.date)}</span>
                          )}
                          {mat.notes && (
                            <span>• {mat.notes}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      mat.category === "Alat Operasional" ? "badge-rose" : mat.category === "Bibit Tambahan" ? "badge-purple" : "badge-emerald"
                    }`} style={{ fontSize: "11px" }}>
                      {mat.category || "Bibit Dasar"}
                    </span>
                  </td>
                  <td style={{ color: "var(--cyan-300)", fontSize: "12px", fontWeight: "500" }}>
                    {mat.branch || "-"}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "700" }} className="font-mono">
                    {qty.toLocaleString()} {mat.unit || "pcs"}
                  </td>
                  <td>
                    <span className="badge badge-amber font-mono" style={{ fontSize: "12px" }}>
                      {mat.rateDisplay || "-"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", color: "var(--text-muted)" }} className="font-mono">
                    {unitPrice} WL
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "800", color: "var(--amber-400)" }} className="font-mono">
                    {formatLocks(totalWL)}
                  </td>
                  <td style={{ textAlign: "right", color: "var(--text-muted)" }} className="font-mono">
                    {formatIDR(wlToIdr(totalWL, config.idrPerDl))}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEditModal(mat)}
                        title="Edit Bahan"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => deleteMaterial(project.id, mat.id)}
                        title="Hapus Bahan"
                        style={{ color: "var(--rose-400)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredMaterials.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  Belum ada bahan yang dicatat dalam kategori ini.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "var(--bg-surface-elevated)", fontWeight: "800", borderTop: "2px solid var(--border-medium)" }}>
              <td colSpan="4" style={{ padding: "14px 16px", color: "var(--text-main)" }}>
                TOTAL KESELURUHAN PENGADAAN BAHAN ({materials.length} Item)
              </td>
              <td style={{ textAlign: "right", padding: "14px 16px" }} className="font-mono">
                {totalQuantitySum.toLocaleString()} pcs
              </td>
              <td colSpan="2"></td>
              <td style={{ textAlign: "right", padding: "14px 16px", color: "var(--amber-400)", fontSize: "15px" }} className="font-mono">
                {formatLocks(totalSpendWL)}
              </td>
              <td style={{ textAlign: "right", padding: "14px 16px", color: "var(--emerald-400)", fontSize: "14px" }} className="font-mono">
                {formatIDR(totalSpendIDR)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add / Edit Material Modal with ItemAutocomplete */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={20} color="var(--amber-400)" />
                <h2 style={{ fontSize: "17px", fontWeight: "700" }}>
                  {editingMatId ? "Edit Pembelian Bahan" : "Catat Pembelian Bahan / Alat"}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveMaterial}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Name with ItemAutocomplete & Category */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Bahan / Item (Auto-search 850+ Item)</label>
                    <ItemAutocomplete
                      value={name}
                      onChange={(val, item) => {
                        setName(val);
                        if (item?.category) {
                          if (item.category.toLowerCase().includes("seed")) setCategory("Bibit Dasar");
                          else if (item.category.toLowerCase().includes("tool") || item.category.toLowerCase().includes("consumable")) setCategory("Alat Operasional");
                        }
                      }}
                      placeholder="Cari item Growtopia..."
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="form-select"
                    >
                      <option value="Bibit Dasar">Bibit Dasar</option>
                      <option value="Bibit Tambahan">Bibit Tambahan / Instan</option>
                      <option value="Alat Operasional">Alat Operasional</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                {/* Resep Branch */}
                <div className="form-group">
                  <label className="form-label">Cabang / Jalur Resep (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Misal: Cabang Toxic Waste Barrel atau Death Spikes"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Quantity & Unit */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Jumlah / Kuantitas Beli (Qty)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Misal: 18020"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="form-input font-mono"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Satuan</label>
                    <input
                      type="text"
                      placeholder="pcs / seed"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Pricing / Rate Type Options */}
                <div className="form-group" style={{ background: "var(--bg-surface-elevated)", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <label className="form-label" style={{ marginBottom: "8px" }}>Pilih Format Rate / Harga Beli</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "12px" }}>
                    {RATE_TYPES.map((rt) => (
                      <button
                        key={rt.id}
                        type="button"
                        onClick={() => setRateType(rt.id)}
                        className={`badge ${rateType === rt.id ? "badge-amber" : "badge-neutral"}`}
                        style={{
                          cursor: "pointer",
                          justifyContent: "center",
                          padding: "6px",
                          fontSize: "11px",
                          fontWeight: "700"
                        }}
                      >
                        {rt.label}
                      </button>
                    ))}
                  </div>

                  {/* Rate Value Input */}
                  <div>
                    <label className="form-label">
                      Nilai Rate ({RATE_TYPES.find(r => r.id === rateType)?.label})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      placeholder={RATE_TYPES.find(r => r.id === rateType)?.placeholder}
                      value={rateValue}
                      onChange={(e) => setRateValue(e.target.value)}
                      className="form-input font-mono"
                      style={{ fontSize: "16px", fontWeight: "700", color: "var(--amber-400)" }}
                      required
                    />
                  </div>

                  {/* Live Calculation Preview Card */}
                  {quantity && rateValue && (
                    <div style={{
                      marginTop: "12px",
                      background: "rgba(0, 0, 0, 0.3)",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      borderLeft: "3px solid var(--emerald-400)",
                      fontSize: "12px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                        <span>Total Biaya (WL):</span>
                        <strong style={{ color: "var(--amber-400)" }} className="font-mono">
                          {formatLocks(liveCost.totalWL)} ({liveCost.totalWL} WL)
                        </strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginTop: "4px" }}>
                        <span>Estimasi Rupiah:</span>
                        <strong style={{ color: "var(--emerald-400)" }} className="font-mono">
                          {formatIDR(liveCost.totalIDR)}
                        </strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginTop: "4px" }}>
                        <span>Harga Satuan:</span>
                        <span className="font-mono">{liveCost.unitPriceWL.toFixed(4)} WL/item</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date & Notes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tanggal (GMT+7)</label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Catatan Pembelian (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Misal: Beli di world BUYDANGER"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-amber">
                  {editingMatId ? "Perbarui Bahan" : "Simpan Pembelian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
