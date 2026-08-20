import React, { useState } from "react";
import { useProjects } from "../context/ProjectContext";
import { useCurrency } from "../context/CurrencyContext";
import { ItemAutocomplete } from "./ItemAutocomplete";
import {
  exportMaterialsToCSV,
  exportMaterialsToXLSX,
  exportCashLedgerToCSV,
  exportCashLedgerToXLSX,
  exportProjectToXLSX,
  exportProjectToCSV
} from "../utils/exportUtils";
import { getTodayGMT7, formatDateGMT7 } from "../utils/dateUtils";
import { MaterialShortageTracker } from "./MaterialShortageTracker";
import { ConfirmModal } from "./ConfirmModal";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Trash2,
  Edit2,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  Filter,
  Coins,
  Receipt,
  Package,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";

export function FinancialLedger({ project }) {
  const {
    addLedgerEntry,
    deleteLedgerEntry,
    addMaterial,
    updateMaterial,
    deleteMaterial
  } = useProjects();
  const { config, formatLocks, formatIDR, wlToIdr, idrToWl, calculateROI } = useCurrency();

  const [activeSubTab, setActiveSubTab] = useState("materials"); // 'materials', 'all_cash', 'capital', 'revenues'
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modals
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMatId, setEditingMatId] = useState(null);

  const [showCashModal, setShowCashModal] = useState(false);
  const [cashModalType, setCashModalType] = useState("revenues"); // 'capital', 'revenues', 'expenses'

  // Material Form State
  const [matName, setMatName] = useState("");
  const [matBranch, setMatBranch] = useState("");
  const [matQuantity, setMatQuantity] = useState("");
  const [matUnit, setMatUnit] = useState("pcs");
  const [matRateType, setMatRateType] = useState("total_wl");
  const [matRateValue, setMatRateValue] = useState("");
  const [matNotes, setMatNotes] = useState("");
  const [matDate, setMatDate] = useState(getTodayGMT7());

  // Cash Transaction Form State
  const [cashNote, setCashNote] = useState("");
  const [cashCategory, setCashCategory] = useState("seeds");
  const [cashQuantity, setCashQuantity] = useState("");
  const [cashUnitPrice, setCashUnitPrice] = useState("");
  const [cashCurrencyMode, setCashCurrencyMode] = useState("WL"); // 'WL', 'DL', 'BGL', 'IDR'
  const [cashAmount, setCashAmount] = useState("");
  const [cashDate, setCashDate] = useState(getTodayGMT7());

  const materials = project.materials || [];
  const capitalList = project.ledger?.capital || [];
  const ledgerExpensesList = project.ledger?.expenses || [];
  const revenuesList = project.ledger?.revenues || [];

  // Computed Totals
  const totalMaterialsSpendWL = materials.reduce((sum, m) => sum + Number(m.totalWL || 0), 0);
  const totalQuantitySum = materials.reduce((sum, m) => sum + Number(m.quantity || 0), 0);

  const totalCapitalWL = capitalList.reduce((sum, c) => sum + Number(c.amountWL || 0), 0);
  const totalLedgerExpensesWL = ledgerExpensesList.reduce((sum, e) => sum + Number(e.amountWL || 0), 0);
  const totalRevenuesWL = revenuesList.reduce((sum, r) => sum + Number(r.amountWL || 0), 0);

  // Total Real Cost (Materials Spend or Ledger Expenses)
  const totalCostWL = totalMaterialsSpendWL > 0 ? totalMaterialsSpendWL : totalLedgerExpensesWL;
  const totalCostIDR = wlToIdr(totalCostWL);

  const netProfitWL = totalRevenuesWL - totalCostWL;
  const netProfitIDR = wlToIdr(netProfitWL);
  const roi = calculateROI(totalCapitalWL || totalCostWL, netProfitWL);
  const isProfit = netProfitWL >= 0;

  // Live calculation for Material Modal
  const liveMatCost = calculatePurchaseCost({
    quantity: Number(matQuantity || 0),
    rateType: matRateType,
    rateValue: Number(matRateValue || 0),
    idrPerDl: config.idrPerDl
  });

  // --- Material Modal Handlers ---
  const handleOpenAddMaterial = () => {
    setEditingMatId(null);
    setMatName("");
    setMatBranch("");
    setMatQuantity("");
    setMatRateType("total_wl");
    setMatRateValue("");
    setMatNotes("");
    setMatDate(getTodayGMT7());
    setShowMaterialModal(true);
  };

  const handleEditMaterial = (mat) => {
    setEditingMatId(mat.id);
    setMatName(mat.name);
    setMatBranch(mat.branch || "");
    setMatQuantity(mat.quantity.toString());
    setMatRateType(mat.rateType || "total_wl");
    setMatRateValue(mat.rateValue !== undefined && mat.rateValue !== null ? mat.rateValue.toString() : (mat.totalWL || ""));
    setMatNotes(mat.notes || "");
    setMatDate(mat.date || getTodayGMT7());
    setShowMaterialModal(true);
  };

  const handleSaveMaterial = (e) => {
    e.preventDefault();
    if (!matName.trim()) return;

    const computed = calculatePurchaseCost({
      quantity: Number(matQuantity || 0),
      rateType: matRateType,
      rateValue: Number(matRateValue || 0),
      idrPerDl: config.idrPerDl
    });

    const matData = {
      name: matName.trim(),
      branch: matBranch.trim() || "-",
      quantity: Number(matQuantity || 0),
      unit: matUnit || "pcs",
      rateType: matRateType,
      rateValue: Number(matRateValue || 0),
      rateDisplay: computed.rateDisplay,
      totalWL: computed.totalWL,
      date: matDate || getTodayGMT7(),
      notes: matNotes.trim()
    };

    if (editingMatId) {
      updateMaterial(project.id, editingMatId, matData);
    } else {
      addMaterial(project.id, matData);
    }

    setShowMaterialModal(false);
  };

  // --- Cash Transaction Modal Handlers ---
  const handleOpenAddCash = (type) => {
    setCashModalType(type);
    setCashNote("");
    setCashCategory(type === "capital" ? "modal" : "seeds");
    setCashQuantity("");
    setCashUnitPrice("");
    setCashAmount("");
    setCashCurrencyMode("WL");
    setCashDate(getTodayGMT7());
    setShowCashModal(true);
  };

  const handleSaveCash = (e) => {
    e.preventDefault();
    if (!cashAmount || Number(cashAmount) <= 0) return;

    let finalAmountWL = 0;
    const rawVal = Number(cashAmount);

    if (cashCurrencyMode === "WL") finalAmountWL = rawVal;
    else if (cashCurrencyMode === "DL") finalAmountWL = rawVal * 100;
    else if (cashCurrencyMode === "BGL") finalAmountWL = rawVal * 10000;
    else if (cashCurrencyMode === "IDR") finalAmountWL = idrToWl(rawVal);

    addLedgerEntry(project.id, cashModalType, {
      date: cashDate,
      amountWL: finalAmountWL,
      note: cashNote || (cashModalType === "capital" ? "Setoran Modal" : cashModalType === "revenues" ? "Hasil Penjualan" : "Pengeluaran Operasional"),
      category: cashCategory,
      quantity: cashQuantity ? Number(cashQuantity) : null,
      unitPrice: cashUnitPrice,
      currencySource: cashCurrencyMode
    });

    setShowCashModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 4 Financial Master KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "14px"
      }}>
        {/* KPI 1: Total Modal Belanja Bahan */}
        <div className="glass-card" style={{
          borderLeft: "4px solid var(--amber-500)",
          background: "var(--bg-glass-card)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
              Total Modal Belanja ({materials.length} Item)
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.15)", color: "var(--amber-400)" }}>
              <Coins size={18} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--amber-400)" }} className="font-mono">
            {formatLocks(totalCostWL)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }} className="font-mono">
            ≈ {formatIDR(totalCostIDR)}
          </div>
        </div>

        {/* KPI 2: Total Setoran Modal */}
        <div className="glass-card" style={{
          borderLeft: "4px solid var(--purple-500)",
          background: "var(--bg-glass-card)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
              Setoran Modal Disuntikkan
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", color: "var(--purple-400)" }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--purple-400)" }} className="font-mono">
            {formatLocks(totalCapitalWL)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }} className="font-mono">
            ≈ {formatIDR(wlToIdr(totalCapitalWL))}
          </div>
        </div>

        {/* KPI 3: Hasil Penjualan */}
        <div className="glass-card" style={{
          borderLeft: "4px solid var(--cyan-500)",
          background: "var(--bg-glass-card)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
              Total Hasil Penjualan (Omset)
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.15)", color: "var(--cyan-400)" }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--cyan-400)" }} className="font-mono">
            {formatLocks(totalRevenuesWL)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }} className="font-mono">
            ≈ {formatIDR(wlToIdr(totalRevenuesWL))}
          </div>
        </div>

        {/* KPI 4: Laba Bersih & ROI */}
        <div className="glass-card" style={{
          borderLeft: isProfit ? "4px solid var(--emerald-500)" : "4px solid var(--rose-500)",
          background: "var(--bg-glass-card)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
              Laba Bersih & ROI
            </span>
            <div style={{
              padding: "6px",
              borderRadius: "8px",
              background: isProfit ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)",
              color: isProfit ? "var(--emerald-400)" : "var(--rose-400)"
            }}>
              {isProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
          </div>
          <div style={{
            fontSize: "24px",
            fontWeight: "800",
            color: isProfit ? "var(--emerald-400)" : "var(--rose-400)"
          }} className="font-mono">
            {isProfit ? `+${formatLocks(netProfitWL)}` : `-${formatLocks(Math.abs(netProfitWL))}`}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", marginTop: "4px" }}>
            <span className="font-mono" style={{ color: isProfit ? "var(--emerald-300)" : "var(--rose-300)" }}>
              {isProfit ? `+${formatIDR(netProfitIDR)}` : `-${formatIDR(Math.abs(netProfitIDR))}`}
            </span>
            <span className={`badge ${isProfit ? "badge-emerald" : "badge-rose"}`} style={{ fontSize: "11px", padding: "1px 6px" }}>
              ROI: {roi}%
            </span>
          </div>
        </div>
      </div>

      {/* Tracking Kebutuhan & Kekurangan Bahan */}
      <MaterialShortageTracker project={project} />

      {/* Main Header with Action & Export Buttons */}
      {/* Main Subtab Navigation Bar & Contextual Action Buttons */}
      <div className="glass-card" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        padding: "14px 18px",
        background: "var(--bg-glass-card)",
        border: "1px solid var(--border-medium)",
        borderRadius: "var(--radius-md)"
      }}>
        {/* Left: 2 Primary Sub-tab Switchers */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setActiveSubTab("materials")}
            className={`tab-btn ${activeSubTab === "materials" ? "active" : ""}`}
            style={{ padding: "8px 18px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Package size={16} />
            <span>Daftar Pembelian Bahan</span>
            <span className="badge badge-amber" style={{ fontSize: "11px", padding: "1px 6px" }}>
              {materials.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("all_cash")}
            className={`tab-btn ${activeSubTab === "all_cash" ? "active" : ""}`}
            style={{ padding: "8px 18px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Receipt size={16} />
            <span>Arus Kas & Buku Transaksi</span>
            <span className="badge badge-cyan" style={{ fontSize: "11px", padding: "1px 6px" }}>
              {capitalList.length + revenuesList.length + ledgerExpensesList.length}
            </span>
          </button>
        </div>

        {/* Right: Contextual Action & Dedicated Export Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Export Buttons (Separated data based on active subtab) */}
          <button
            className="btn btn-secondary"
            onClick={() =>
              activeSubTab === "materials"
                ? exportMaterialsToCSV(project, config)
                : exportCashLedgerToCSV(project, config)
            }
            title={activeSubTab === "materials" ? "Ekspor CSV Pembelian Bahan" : "Ekspor CSV Buku Kas"}
            style={{ fontSize: "12px", padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FileText size={15} color="var(--cyan-400)" />
            <span>CSV</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() =>
              activeSubTab === "materials"
                ? exportMaterialsToXLSX(project, config)
                : exportCashLedgerToXLSX(project, config)
            }
            title={activeSubTab === "materials" ? "Ekspor Excel Pembelian Bahan (.xlsx)" : "Ekspor Excel Buku Kas (.xlsx)"}
            style={{ fontSize: "12px", padding: "7px 14px", border: "1px solid rgba(16, 185, 129, 0.4)", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FileSpreadsheet size={15} color="var(--emerald-400)" />
            <span style={{ color: "var(--emerald-400)", fontWeight: "600" }}>Excel (XLSX)</span>
          </button>

          {/* Contextual Action Buttons */}
          {activeSubTab === "materials" ? (
            <button
              className="btn btn-amber"
              onClick={handleOpenAddMaterial}
              style={{ fontSize: "13px", padding: "7px 16px", display: "inline-flex", alignItems: "center", gap: "7px", boxShadow: "0 2px 10px rgba(245, 158, 11, 0.25)" }}
            >
              <PlusCircle size={16} />
              <span style={{ fontWeight: "700" }}>Catat Pembelian Bahan</span>
            </button>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => handleOpenAddCash("capital")}
                style={{ fontSize: "12px", padding: "7px 13px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid rgba(168, 85, 247, 0.3)" }}
              >
                <PlusCircle size={15} color="var(--purple-400)" />
                <span style={{ color: "var(--purple-300)", fontWeight: "600" }}>Setoran Modal</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => handleOpenAddCash("revenues")}
                style={{ fontSize: "12px", padding: "7px 13px", display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid rgba(6, 182, 212, 0.3)" }}
              >
                <PlusCircle size={15} color="var(--cyan-400)" />
                <span style={{ color: "var(--cyan-300)", fontWeight: "600" }}>Catat Penjualan (Omset)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* VIEW 1: DAFTAR PEMBELIAN BAHAN */}
      {activeSubTab === "materials" && (
        <div className="custom-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>No</th>
                <th>Nama Bahan / Item</th>
                <th style={{ textAlign: "right" }}>Jumlah Beli (Qty)</th>
                <th>Rate / Harga Beli</th>
                <th style={{ textAlign: "right" }}>Harga Satuan</th>
                <th style={{ textAlign: "right" }}>Total Biaya (WL)</th>
                <th style={{ textAlign: "right" }}>Estimasi Rupiah</th>
                <th style={{ textAlign: "right", width: "80px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat, idx) => {
                const qty = Number(mat.quantity || 0);
                const totalWL = Number(mat.totalWL || 0);
                const unitPrice = qty > 0 ? (totalWL / qty).toFixed(4) : "-";

                return (
                  <tr key={mat.id || idx}>
                    <td style={{ color: "var(--text-dim)" }}>{idx + 1}</td>
                    <td>
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
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "700" }} className="font-mono">
                      {qty.toLocaleString()}
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
                          onClick={() => handleEditMaterial(mat)}
                          title="Edit Bahan"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteTarget({ type: "material", data: mat })}
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

              {materials.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Belum ada bahan yang dicatat. Klik "Catat Pembelian Bahan" untuk menambahkan.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--bg-surface-elevated)", fontWeight: "800", borderTop: "2px solid var(--border-medium)" }}>
                <td colSpan="3" style={{ padding: "14px 16px", color: "var(--text-main)" }}>
                  TOTAL REKAPAN BELANJA BAHAN ({materials.length} Item)
                </td>
                <td style={{ textAlign: "right", padding: "14px 16px" }} className="font-mono">
                  {totalQuantitySum.toLocaleString()}
                </td>
                <td colSpan="2"></td>
                <td style={{ textAlign: "right", padding: "14px 16px", color: "var(--amber-400)", fontSize: "15px" }} className="font-mono">
                  {formatLocks(totalMaterialsSpendWL)}
                </td>
                <td style={{ textAlign: "right", padding: "14px 16px", color: "var(--emerald-400)", fontSize: "14px" }} className="font-mono">
                  {formatIDR(totalCostIDR)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* VIEW 2: ARUS KAS & TRANSAKSI */}
      {activeSubTab !== "materials" && (
        <div className="custom-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "90px" }}>Tipe</th>
                <th style={{ width: "110px" }}>Tanggal</th>
                <th>Keterangan / Catatan</th>
                <th>Kategori</th>
                <th style={{ textAlign: "right" }}>Jumlah (Qty)</th>
                <th style={{ textAlign: "right" }}>Nominal (Locks)</th>
                <th style={{ textAlign: "right" }}>Estimasi Rupiah</th>
                <th style={{ textAlign: "right", width: "80px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {/* Capital list */}
              {(activeSubTab === "all_cash" || activeSubTab === "capital") &&
                capitalList.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: "10px" }}>MODAL</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                      {formatDateGMT7(entry.date)}
                    </td>
                    <td style={{ fontWeight: "600", color: "var(--text-main)" }}>
                      {entry.note}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: "11px" }}>Setoran Modal</span>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-dim)" }}>-</td>
                    <td style={{ textAlign: "right", fontWeight: "700", color: "var(--purple-400)" }} className="font-mono">
                      +{formatLocks(entry.amountWL)}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)" }} className="font-mono">
                      +{formatIDR(wlToIdr(entry.amountWL))}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-icon"
                        onClick={() => setDeleteTarget({ type: "ledger", ledgerType: "capital", data: entry })}
                        title="Hapus"
                        style={{ color: "var(--rose-400)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

              {/* Revenues list */}
              {(activeSubTab === "all_cash" || activeSubTab === "revenues") &&
                revenuesList.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="badge badge-cyan" style={{ fontSize: "10px" }}>OMSET</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                      {formatDateGMT7(entry.date)}
                    </td>
                    <td style={{ fontWeight: "700", color: "var(--cyan-300)" }}>
                      {entry.note}
                    </td>
                    <td>
                      <span className="badge badge-cyan" style={{ fontSize: "11px" }}>{entry.category || "seeds"}</span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "700" }} className="font-mono">
                      {entry.quantity ? `${entry.quantity.toLocaleString()} pcs` : "-"}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "800", color: "var(--cyan-400)" }} className="font-mono">
                      +{formatLocks(entry.amountWL)}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--emerald-400)", fontWeight: "600" }} className="font-mono">
                      +{formatIDR(wlToIdr(entry.amountWL))}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-icon"
                        onClick={() => setDeleteTarget({ type: "ledger", ledgerType: "revenues", data: entry })}
                        title="Hapus"
                        style={{ color: "var(--rose-400)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

              {/* General expenses list */}
              {activeSubTab === "all_cash" &&
                ledgerExpensesList.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="badge badge-rose" style={{ fontSize: "10px" }}>KELUAR</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                      {formatDateGMT7(entry.date)}
                    </td>
                    <td style={{ fontWeight: "600", color: "var(--text-main)" }}>
                      {entry.note}
                    </td>
                    <td>
                      <span className="badge badge-rose" style={{ fontSize: "11px" }}>{entry.category || "expenses"}</span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "700" }} className="font-mono">
                      {entry.quantity ? `${entry.quantity.toLocaleString()} pcs` : "-"}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "700", color: "var(--rose-400)" }} className="font-mono">
                      -{formatLocks(entry.amountWL)}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)" }} className="font-mono">
                      -{formatIDR(wlToIdr(entry.amountWL))}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-icon"
                        onClick={() => setDeleteTarget({ type: "ledger", ledgerType: "expenses", data: entry })}
                        title="Hapus"
                        style={{ color: "var(--rose-400)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT MATERIAL PURCHASE */}
      {showMaterialModal && (
        <div className="modal-overlay" onClick={() => setShowMaterialModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={20} color="var(--amber-400)" />
                <h2 style={{ fontSize: "17px", fontWeight: "700" }}>
                  {editingMatId ? "Edit Pembelian Bahan" : "Catat Pembelian Bahan / Alat"}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => setShowMaterialModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveMaterial}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Name with ItemAutocomplete */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Bahan / Item (Auto-search 850+ Item)</label>
                  <ItemAutocomplete
                    value={matName}
                    onChange={(val) => setMatName(val)}
                    placeholder="Cari item Growtopia..."
                    required
                    autoFocus
                  />
                </div>

                {/* Quantity */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Jumlah / Kuantitas Beli (Qty)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Misal: 18020"
                    value={matQuantity}
                    onChange={(e) => setMatQuantity(e.target.value)}
                    className="form-input font-mono"
                    required
                  />
                </div>

                {/* Pricing / Rate Type Options */}
                <div className="form-group" style={{ background: "var(--bg-surface-elevated)", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <label className="form-label" style={{ marginBottom: "8px" }}>Pilih Format Rate / Harga Beli</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "12px" }}>
                    {RATE_TYPES.map((rt) => (
                      <button
                        key={rt.id}
                        type="button"
                        onClick={() => setMatRateType(rt.id)}
                        className={`badge ${matRateType === rt.id ? "badge-amber" : "badge-neutral"}`}
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
                      Nilai Rate ({RATE_TYPES.find(r => r.id === matRateType)?.label})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      placeholder={RATE_TYPES.find(r => r.id === matRateType)?.placeholder}
                      value={matRateValue}
                      onChange={(e) => setMatRateValue(e.target.value)}
                      className="form-input font-mono"
                      style={{ fontSize: "16px", fontWeight: "700", color: "var(--amber-400)" }}
                      required
                    />
                  </div>

                  {/* Live Calculation Preview Card */}
                  {matQuantity && matRateValue && (
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
                          {formatLocks(liveMatCost.totalWL)} ({liveMatCost.totalWL} WL)
                        </strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginTop: "4px" }}>
                        <span>Estimasi Rupiah:</span>
                        <strong style={{ color: "var(--emerald-400)" }} className="font-mono">
                          {formatIDR(liveMatCost.totalIDR)}
                        </strong>
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
                      value={matDate}
                      onChange={(e) => setMatDate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Catatan Pembelian</label>
                    <input
                      type="text"
                      placeholder="Misal: Beli di world BUYDANGER"
                      value={matNotes}
                      onChange={(e) => setMatNotes(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMaterialModal(false)}>
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

      {/* MODAL 2: ADD CASH TRANSACTION (CAPITAL / REVENUES) */}
      {showCashModal && (
        <div className="modal-overlay" onClick={() => setShowCashModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {cashModalType === "capital" ? <Wallet size={20} color="var(--purple-400)" /> : <ArrowDownRight size={20} color="var(--cyan-400)" />}
                <h2 style={{ fontSize: "17px", fontWeight: "700" }}>
                  {cashModalType === "capital" ? "Tambah Setoran Modal" : "Catat Hasil Penjualan (Omset)"}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => setShowCashModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCash}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Nominal & Currency Selector */}
                <div className="form-group" style={{ background: "var(--bg-surface-elevated)", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Pilih Mata Uang Input</label>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {["WL", "DL", "BGL", "IDR"].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setCashCurrencyMode(mode)}
                          className={`badge ${cashCurrencyMode === mode ? (cashModalType === "capital" ? "badge-purple" : "badge-cyan") : "badge-neutral"}`}
                          style={{ cursor: "pointer", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder={`Masukkan nominal dalam ${cashCurrencyMode}...`}
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="form-input font-mono"
                    style={{ fontSize: "18px", fontWeight: "800", color: cashModalType === "capital" ? "var(--purple-400)" : "var(--cyan-400)" }}
                    required
                    autoFocus
                  />
                </div>

                {/* Description Note */}
                <div className="form-group">
                  <label className="form-label">Keterangan Transaksi</label>
                  <input
                    type="text"
                    placeholder={cashModalType === "capital" ? "Misal: Setoran modal 50 DL dari akun utama" : "Misal: Jual 6.830 Science Station @ 5/1 WL"}
                    value={cashNote}
                    onChange={(e) => setCashNote(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                {/* Quantity (Optional for sales) */}
                {cashModalType === "revenues" && (
                  <div className="form-group">
                    <label className="form-label">Jumlah Item Terjual (Opsional)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Misal: 6830"
                      value={cashQuantity}
                      onChange={(e) => setCashQuantity(e.target.value)}
                      className="form-input font-mono"
                    />
                  </div>
                )}

                {/* Date */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tanggal Transaksi (GMT+7)</label>
                  <input
                    type="date"
                    value={cashDate}
                    onChange={(e) => setCashDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCashModal(false)}>
                  Batal
                </button>
                <button type="submit" className={`btn ${cashModalType === "capital" ? "btn-purple" : "btn-primary"}`}>
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === "material") {
            deleteMaterial(project.id, deleteTarget.data.id);
          } else if (deleteTarget.type === "ledger") {
            deleteLedgerEntry(project.id, deleteTarget.ledgerType, deleteTarget.data.id);
          }
          setDeleteTarget(null);
        }}
        title={
          deleteTarget?.type === "material"
            ? `Hapus Pembelian "${deleteTarget?.data?.name}"?`
            : `Hapus Transaksi "${deleteTarget?.data?.note}"?`
        }
        message={
          deleteTarget?.type === "material"
            ? `Apakah Anda yakin ingin menghapus data pembelian ${deleteTarget?.data?.name}? Total pengeluaran projek akan otomatis diperbarui.`
            : `Apakah Anda yakin ingin menghapus catatan transaksi ini senilai ${formatLocks(deleteTarget?.data?.amountWL || 0)}? Saldo dan laba bersih akan disesuaikan otomatis.`
        }
        confirmText="Hapus Data"
      />
    </div>
  );
}
