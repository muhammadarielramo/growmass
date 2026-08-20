/**
 * Professional Pro Excel & CSV Export Utilities for Growmass
 * Uses xlsx-js-style to render fully styled, color-coded, branded financial spreadsheets
 */
import XLSX from "xlsx-js-style";
import { formatLocks, wlToIdr } from "./currency";
import { formatStatusLabel } from "./statusUtils";

// --- Color & Style Palette ---
const STYLES = {
  // Banners & Headers
  titleBanner: {
    font: { name: "Segoe UI", sz: 14, bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "0F172A" } }, // Dark Navy
    alignment: { vertical: "center", horizontal: "left" },
    border: {
      bottom: { style: "medium", color: { rgb: "334155" } }
    }
  },
  metaLabel: {
    font: { name: "Segoe UI", sz: 10, bold: true, color: { rgb: "475569" } },
    fill: { fgColor: { rgb: "F1F5F9" } },
    alignment: { vertical: "center", horizontal: "left" }
  },
  metaValue: {
    font: { name: "Segoe UI", sz: 10, bold: true, color: { rgb: "0F172A" } },
    fill: { fgColor: { rgb: "F8FAFC" } },
    alignment: { vertical: "center", horizontal: "left" }
  },

  // Table Headers
  thEmerald: {
    font: { name: "Segoe UI", sz: 10.5, bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "065F46" } }, // Emerald Green
    alignment: { vertical: "center", horizontal: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "047857" } },
      bottom: { style: "medium", color: { rgb: "022C22" } },
      left: { style: "thin", color: { rgb: "047857" } },
      right: { style: "thin", color: { rgb: "047857" } }
    }
  },
  thSlate: {
    font: { name: "Segoe UI", sz: 10.5, bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1E293B" } }, // Slate Dark
    alignment: { vertical: "center", horizontal: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "334155" } },
      bottom: { style: "medium", color: { rgb: "0F172A" } },
      left: { style: "thin", color: { rgb: "334155" } },
      right: { style: "thin", color: { rgb: "334155" } }
    }
  },

  // Data Cells
  tdEven: {
    font: { name: "Segoe UI", sz: 10, color: { rgb: "1E293B" } },
    fill: { fgColor: { rgb: "FFFFFF" } },
    border: {
      top: { style: "thin", color: { rgb: "E2E8F0" } },
      bottom: { style: "thin", color: { rgb: "E2E8F0" } },
      left: { style: "thin", color: { rgb: "E2E8F0" } },
      right: { style: "thin", color: { rgb: "E2E8F0" } }
    }
  },
  tdOdd: {
    font: { name: "Segoe UI", sz: 10, color: { rgb: "1E293B" } },
    fill: { fgColor: { rgb: "F8FAFC" } }, // Soft subtle zebra
    border: {
      top: { style: "thin", color: { rgb: "E2E8F0" } },
      bottom: { style: "thin", color: { rgb: "E2E8F0" } },
      left: { style: "thin", color: { rgb: "E2E8F0" } },
      right: { style: "thin", color: { rgb: "E2E8F0" } }
    }
  },

  // Highlighted Data Formats
  tdLocks: {
    font: { name: "Segoe UI", sz: 10, bold: true, color: { rgb: "B45309" } }, // Amber
    fill: { fgColor: { rgb: "FEF3C7" } },
    alignment: { vertical: "center", horizontal: "right" },
    border: {
      top: { style: "thin", color: { rgb: "FDE68A" } },
      bottom: { style: "thin", color: { rgb: "FDE68A" } },
      left: { style: "thin", color: { rgb: "FDE68A" } },
      right: { style: "thin", color: { rgb: "FDE68A" } }
    }
  },
  tdRevenue: {
    font: { name: "Segoe UI", sz: 10, bold: true, color: { rgb: "047857" } }, // Green
    fill: { fgColor: { rgb: "ECFDF5" } },
    alignment: { vertical: "center", horizontal: "right" },
    border: {
      top: { style: "thin", color: { rgb: "A7F3D0" } },
      bottom: { style: "thin", color: { rgb: "A7F3D0" } },
      left: { style: "thin", color: { rgb: "A7F3D0" } },
      right: { style: "thin", color: { rgb: "A7F3D0" } }
    }
  },
  tdCapital: {
    font: { name: "Segoe UI", sz: 10, bold: true, color: { rgb: "6B21A8" } }, // Purple
    fill: { fgColor: { rgb: "F3E8FF" } },
    alignment: { vertical: "center", horizontal: "right" },
    border: {
      top: { style: "thin", color: { rgb: "DDD6FE" } },
      bottom: { style: "thin", color: { rgb: "DDD6FE" } },
      left: { style: "thin", color: { rgb: "DDD6FE" } },
      right: { style: "thin", color: { rgb: "DDD6FE" } }
    }
  },
  tdExpense: {
    font: { name: "Segoe UI", sz: 10, bold: true, color: { rgb: "BE123C" } }, // Rose
    fill: { fgColor: { rgb: "FFE4E6" } },
    alignment: { vertical: "center", horizontal: "right" },
    border: {
      top: { style: "thin", color: { rgb: "FECDD3" } },
      bottom: { style: "thin", color: { rgb: "FECDD3" } },
      left: { style: "thin", color: { rgb: "FECDD3" } },
      right: { style: "thin", color: { rgb: "FECDD3" } }
    }
  },

  // Total Summary Footer
  tfootTotalLabel: {
    font: { name: "Segoe UI", sz: 11, bold: true, color: { rgb: "0F172A" } },
    fill: { fgColor: { rgb: "E2E8F0" } },
    alignment: { vertical: "center", horizontal: "left" },
    border: {
      top: { style: "medium", color: { rgb: "475569" } },
      bottom: { style: "double", color: { rgb: "0F172A" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } }
    }
  },
  tfootTotalLocks: {
    font: { name: "Segoe UI", sz: 11, bold: true, color: { rgb: "92400E" } },
    fill: { fgColor: { rgb: "FEF3C7" } },
    alignment: { vertical: "center", horizontal: "right" },
    border: {
      top: { style: "medium", color: { rgb: "475569" } },
      bottom: { style: "double", color: { rgb: "0F172A" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } }
    }
  },
  tfootTotalIdr: {
    font: { name: "Segoe UI", sz: 11, bold: true, color: { rgb: "065F46" } },
    fill: { fgColor: { rgb: "D1FAE5" } },
    alignment: { vertical: "center", horizontal: "right" },
    border: {
      top: { style: "medium", color: { rgb: "475569" } },
      bottom: { style: "double", color: { rgb: "0F172A" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } }
    }
  },

  // KPI Cards in Executive Dashboard
  kpiSectionHeader: {
    font: { name: "Segoe UI", sz: 12, bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "0F172A" } },
    alignment: { vertical: "center", horizontal: "left" },
    border: {
      bottom: { style: "medium", color: { rgb: "10B981" } }
    }
  },
  kpiCardLabel: {
    font: { name: "Segoe UI", sz: 10, bold: true, color: { rgb: "475569" } },
    fill: { fgColor: { rgb: "F8FAFC" } },
    alignment: { vertical: "center", horizontal: "left" },
    border: {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "thin", color: { rgb: "CBD5E1" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } }
    }
  },
  kpiCardValue: {
    font: { name: "Segoe UI", sz: 10.5, bold: true, color: { rgb: "0F172A" } },
    fill: { fgColor: { rgb: "FFFFFF" } },
    alignment: { vertical: "center", horizontal: "right" },
    border: {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "thin", color: { rgb: "CBD5E1" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } }
    }
  },
  kpiHighlightProfit: {
    font: { name: "Segoe UI", sz: 11, bold: true, color: { rgb: "065F46" } },
    fill: { fgColor: { rgb: "D1FAE5" } },
    alignment: { vertical: "center", horizontal: "right" },
    border: {
      top: { style: "medium", color: { rgb: "10B981" } },
      bottom: { style: "medium", color: { rgb: "10B981" } },
      left: { style: "thin", color: { rgb: "10B981" } },
      right: { style: "thin", color: { rgb: "10B981" } }
    }
  }
};

/**
 * Creates styled cell object
 */
function createStyledCell(value, style, type = null) {
  const cell = { v: value, s: style };
  if (type) cell.t = type;
  else if (typeof value === "number") cell.t = "n";
  else if (typeof value === "boolean") cell.t = "b";
  else cell.t = "s";
  return cell;
}

/**
 * Helper to compute column widths
 */
function calculateColumnWidths(dataMatrix) {
  if (!dataMatrix || dataMatrix.length === 0) return [];
  const colWidths = [];

  dataMatrix.forEach((row) => {
    if (!Array.isArray(row)) return;
    row.forEach((cellVal, colIdx) => {
      const textVal = cellVal !== null && cellVal !== undefined ? (cellVal.v !== undefined ? cellVal.v : cellVal) : "";
      const textLen = String(textVal).length;
      colWidths[colIdx] = Math.max(colWidths[colIdx] || 10, textLen + 3);
    });
  });

  return colWidths.map((w) => ({ wch: Math.min(Math.max(w, 12), 48) }));
}

/**
 * EXPORT 1: Dedicated Material Purchases to Styled Excel (XLSX)
 */
export function exportMaterialsToXLSX(project, currencyConfig) {
  const wb = XLSX.utils.book_new();
  const idrPerDl = currencyConfig?.idrPerDl || 3500;
  const materials = project.materials || [];

  const totalSpendWL = materials.reduce((sum, m) => sum + Number(m.totalWL || 0), 0);
  const totalCostIDR = wlToIdr(totalSpendWL, idrPerDl);

  const sheetData = [];

  // 1. Title Banner
  sheetData.push([
    createStyledCell("GROWMASS - DAFTAR REKAPAN PEMBELIAN BAHAN PROJEK", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner)
  ]);

  // 2. Metadata Info Block
  sheetData.push([
    createStyledCell("Nama Projek", STYLES.metaLabel),
    createStyledCell(project.name, STYLES.metaValue),
    createStyledCell("Target Item", STYLES.metaLabel),
    createStyledCell(project.targetItem || "-", STYLES.metaValue),
    createStyledCell("Status Projek", STYLES.metaLabel),
    createStyledCell(formatStatusLabel(project.status).toUpperCase(), STYLES.metaValue),
    createStyledCell("", STYLES.metaValue),
    createStyledCell("", STYLES.metaValue),
    createStyledCell("", STYLES.metaValue)
  ]);

  sheetData.push([
    createStyledCell("World Farm", STYLES.metaLabel),
    createStyledCell(project.worldName || "-", STYLES.metaValue),
    createStyledCell("Kurs 1 DL", STYLES.metaLabel),
    createStyledCell(`Rp ${idrPerDl.toLocaleString("id-ID")}`, STYLES.metaValue),
    createStyledCell("Tanggal Ekspor", STYLES.metaLabel),
    createStyledCell(new Date().toLocaleDateString("id-ID"), STYLES.metaValue),
    createStyledCell("", STYLES.metaValue),
    createStyledCell("", STYLES.metaValue),
    createStyledCell("", STYLES.metaValue)
  ]);

  // Empty separator
  sheetData.push([createStyledCell("", {}), createStyledCell("", {}), createStyledCell("", {})]);

  // 3. Table Header
  const headers = [
    "No",
    "Tanggal",
    "Nama Bahan / Item",
    "Jumlah Beli (Qty)",
    "Rate / Harga Beli",
    "Harga Satuan (WL)",
    "Total Biaya (WL)",
    "Estimasi Rupiah",
    "Catatan"
  ];
  sheetData.push(headers.map((h) => createStyledCell(h, STYLES.thEmerald)));

  // 4. Data Rows
  materials.forEach((m, idx) => {
    const isOdd = idx % 2 === 1;
    const baseStyle = isOdd ? STYLES.tdOdd : STYLES.tdEven;
    const qty = Number(m.quantity || 0);
    const totalWL = Number(m.totalWL || 0);
    const unitPrice = qty > 0 ? Number((totalWL / qty).toFixed(4)) : 0;

    sheetData.push([
      createStyledCell(idx + 1, { ...baseStyle, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(m.date || "-", { ...baseStyle, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(m.name, { ...baseStyle, font: { ...baseStyle.font, bold: true } }),
      createStyledCell(qty, { ...baseStyle, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(m.rateDisplay || "-", { ...baseStyle, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(unitPrice, { ...baseStyle, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(formatLocks(totalWL), STYLES.tdLocks),
      createStyledCell(wlToIdr(totalWL, idrPerDl), { ...baseStyle, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(m.notes || "-", baseStyle)
    ]);
  });

  // 5. Total Footer Row (Alinged properly!)
  sheetData.push([
    createStyledCell("TOTAL REKAPAN BELANJA BAHAN", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell(formatLocks(totalSpendWL), STYLES.tfootTotalLocks),
    createStyledCell(totalCostIDR, STYLES.tfootTotalIdr),
    createStyledCell("", STYLES.tfootTotalLabel)
  ]);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = calculateColumnWidths(sheetData);
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Merge Title Banner
    { s: { r: sheetData.length - 1, c: 0 }, e: { r: sheetData.length - 1, c: 5 } } // Merge Total Label Across 6 cols
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Pembelian Bahan");

  const filename = `Growmass_Bahan_${sanitizeFilename(project.name)}_${getDateStamp()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * EXPORT 2: Dedicated Cash Ledger to Styled Excel (XLSX)
 */
export function exportCashLedgerToXLSX(project, currencyConfig) {
  const wb = XLSX.utils.book_new();
  const idrPerDl = currencyConfig?.idrPerDl || 3500;

  const capital = project.ledger?.capital || [];
  const revenues = project.ledger?.revenues || [];
  const expenses = project.ledger?.expenses || [];

  const totalCapitalWL = capital.reduce((s, c) => s + Number(c.amountWL || 0), 0);
  const totalRevenuesWL = revenues.reduce((s, r) => s + Number(r.amountWL || 0), 0);
  const totalExpensesWL = expenses.reduce((s, e) => s + Number(e.amountWL || 0), 0);

  const sheetData = [];

  // 1. Title Banner
  sheetData.push([
    createStyledCell("GROWMASS - BUKU KAS & ARUS TRANSAKSI MODAL / OMSET", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner),
    createStyledCell("", STYLES.titleBanner)
  ]);

  // 2. Metadata Info Block
  sheetData.push([
    createStyledCell("Nama Projek", STYLES.metaLabel),
    createStyledCell(project.name, STYLES.metaValue),
    createStyledCell("Total Modal", STYLES.metaLabel),
    createStyledCell(formatLocks(totalCapitalWL), STYLES.metaValue),
    createStyledCell("Total Omset", STYLES.metaLabel),
    createStyledCell(formatLocks(totalRevenuesWL), STYLES.metaValue),
    createStyledCell("Kurs 1 DL", STYLES.metaLabel),
    createStyledCell(`Rp ${idrPerDl.toLocaleString("id-ID")}`, STYLES.metaValue),
    createStyledCell("", STYLES.metaValue)
  ]);

  // Empty separator
  sheetData.push([createStyledCell("", {})]);

  // 3. Table Header
  const headers = [
    "No",
    "Tipe Transaksi",
    "Tanggal (GMT+7)",
    "Keterangan Transaksi",
    "Kategori",
    "Jumlah (Qty)",
    "Nominal (WL)",
    "Format Locks",
    "Estimasi Rupiah"
  ];
  sheetData.push(headers.map((h) => createStyledCell(h, STYLES.thSlate)));

  let rowIdx = 1;

  // Capital Entries
  capital.forEach((c) => {
    const amt = Number(c.amountWL || 0);
    sheetData.push([
      createStyledCell(rowIdx++, STYLES.tdEven),
      createStyledCell("SETORAN MODAL", STYLES.tdCapital),
      createStyledCell(c.date || "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(c.note || "Setoran Modal", STYLES.tdEven),
      createStyledCell("Capital", STYLES.tdEven),
      createStyledCell("-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(amt, { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(`+${formatLocks(amt)}`, STYLES.tdCapital),
      createStyledCell(wlToIdr(amt, idrPerDl), { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } })
    ]);
  });

  // Revenue Entries
  revenues.forEach((r) => {
    const amt = Number(r.amountWL || 0);
    sheetData.push([
      createStyledCell(rowIdx++, STYLES.tdEven),
      createStyledCell("PENJUALAN (OMSET)", STYLES.tdRevenue),
      createStyledCell(r.date || "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(r.note || "Hasil Penjualan", STYLES.tdEven),
      createStyledCell(r.category || "seeds", STYLES.tdEven),
      createStyledCell(r.quantity ? Number(r.quantity) : "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(amt, { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(`+${formatLocks(amt)}`, STYLES.tdRevenue),
      createStyledCell(wlToIdr(amt, idrPerDl), { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } })
    ]);
  });

  // Expense Entries
  expenses.forEach((e) => {
    const amt = Number(e.amountWL || 0);
    sheetData.push([
      createStyledCell(rowIdx++, STYLES.tdEven),
      createStyledCell("PENGELUARAN", STYLES.tdExpense),
      createStyledCell(e.date || "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(e.note || "Pengeluaran Operasional", STYLES.tdEven),
      createStyledCell(e.category || "expenses", STYLES.tdEven),
      createStyledCell(e.quantity ? Number(e.quantity) : "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(-amt, { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(`-${formatLocks(amt)}`, STYLES.tdExpense),
      createStyledCell(-wlToIdr(amt, idrPerDl), { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } })
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = calculateColumnWidths(sheetData);
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Arus Kas & Transaksi");

  const filename = `Growmass_Buku_Kas_${sanitizeFilename(project.name)}_${getDateStamp()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * EXPORT 3: Master Multi-Sheet Executive Financial Workbook (Excel)
 */
export function exportProjectToXLSX(project, currencyConfig) {
  const wb = XLSX.utils.book_new();
  const idrPerDl = currencyConfig?.idrPerDl || 3500;

  const materials = project.materials || [];
  const capital = project.ledger?.capital || [];
  const expenses = project.ledger?.expenses || [];
  const revenues = project.ledger?.revenues || [];
  const splices = project.recipe?.splices || [];
  const stages = project.stages || [];

  const totalMaterialSpendWL = materials.reduce((sum, m) => sum + Number(m.totalWL || 0), 0);
  const totalOtherExpensesWL = expenses.reduce((sum, e) => sum + Number(e.amountWL || 0), 0);
  const totalCapitalWL = capital.reduce((sum, c) => sum + Number(c.amountWL || 0), 0);
  const totalRevenuesWL = revenues.reduce((sum, r) => sum + Number(r.amountWL || 0), 0);
  const grandTotalExpensesWL = totalMaterialSpendWL + totalOtherExpensesWL;
  const netProfitWL = totalRevenuesWL - grandTotalExpensesWL;
  const roi = grandTotalExpensesWL > 0 ? ((netProfitWL / grandTotalExpensesWL) * 100).toFixed(1) : "0.0";

  // --- Sheet 1: Dashboard Ringkasan Finansial & KPI ---
  const dashboardData = [
    [createStyledCell("GROWMASS - FINANCIAL REPORT & EXECUTIVE DASHBOARD", STYLES.titleBanner), createStyledCell("", STYLES.titleBanner), createStyledCell("", STYLES.titleBanner), createStyledCell("", STYLES.titleBanner)],
    [createStyledCell("", {}), createStyledCell("", {})],
    [createStyledCell("1. INFORMASI UMUM PROJEK", STYLES.kpiSectionHeader), createStyledCell("", STYLES.kpiSectionHeader), createStyledCell("", STYLES.kpiSectionHeader), createStyledCell("", STYLES.kpiSectionHeader)],
    [createStyledCell("Nama Projek", STYLES.kpiCardLabel), createStyledCell(project.name, STYLES.kpiCardValue), createStyledCell("World Farm", STYLES.kpiCardLabel), createStyledCell(project.worldName || "-", STYLES.kpiCardValue)],
    [createStyledCell("Target Item", STYLES.kpiCardLabel), createStyledCell(project.targetItem || "-", STYLES.kpiCardValue), createStyledCell("World Storage", STYLES.kpiCardLabel), createStyledCell(project.storageWorld || "-", STYLES.kpiCardValue)],
    [createStyledCell("Target Jumlah (Qty)", STYLES.kpiCardLabel), createStyledCell(project.targetQuantity ? Number(project.targetQuantity).toLocaleString() : "Fleksibel", STYLES.kpiCardValue), createStyledCell("Status Projek", STYLES.kpiCardLabel), createStyledCell(formatStatusLabel(project.status).toUpperCase(), STYLES.kpiCardValue)],
    [createStyledCell("Tanggal Dibuat", STYLES.kpiCardLabel), createStyledCell(project.createdDateGMT7 || new Date(project.createdAt).toLocaleDateString("id-ID"), STYLES.kpiCardValue), createStyledCell("Kurs Acuan 1 DL", STYLES.kpiCardLabel), createStyledCell(`Rp ${idrPerDl.toLocaleString("id-ID")}`, STYLES.kpiCardValue)],
    [createStyledCell("", {}), createStyledCell("", {})],
    [createStyledCell("2. REKAPITULASI KEUANGAN & LABA / RUGI", STYLES.kpiSectionHeader), createStyledCell("", STYLES.kpiSectionHeader), createStyledCell("", STYLES.kpiSectionHeader), createStyledCell("", STYLES.kpiSectionHeader)],
    [createStyledCell("Total Setoran Modal Awal", STYLES.kpiCardLabel), createStyledCell(formatLocks(totalCapitalWL), STYLES.tdCapital), createStyledCell("Estimasi Rupiah", STYLES.kpiCardLabel), createStyledCell(wlToIdr(totalCapitalWL, idrPerDl), STYLES.kpiCardValue)],
    [createStyledCell("Total Belanja Bahan", STYLES.kpiCardLabel), createStyledCell(formatLocks(totalMaterialSpendWL), STYLES.tdLocks), createStyledCell("Estimasi Rupiah", STYLES.kpiCardLabel), createStyledCell(wlToIdr(totalMaterialSpendWL, idrPerDl), STYLES.kpiCardValue)],
    [createStyledCell("Total Biaya Lainnya / Operasional", STYLES.kpiCardLabel), createStyledCell(formatLocks(totalOtherExpensesWL), STYLES.tdExpense), createStyledCell("Estimasi Rupiah", STYLES.kpiCardLabel), createStyledCell(wlToIdr(totalOtherExpensesWL, idrPerDl), STYLES.kpiCardValue)],
    [createStyledCell("Grand Total Pengeluaran Modal", STYLES.kpiCardLabel), createStyledCell(formatLocks(grandTotalExpensesWL), STYLES.tdExpense), createStyledCell("Estimasi Rupiah", STYLES.kpiCardLabel), createStyledCell(wlToIdr(grandTotalExpensesWL, idrPerDl), STYLES.kpiCardValue)],
    [createStyledCell("Total Hasil Penjualan (Omset)", STYLES.kpiCardLabel), createStyledCell(formatLocks(totalRevenuesWL), STYLES.tdRevenue), createStyledCell("Estimasi Rupiah", STYLES.kpiCardLabel), createStyledCell(wlToIdr(totalRevenuesWL, idrPerDl), STYLES.kpiCardValue)],
    [createStyledCell("Laba Bersih / Net Profit", STYLES.kpiCardLabel), createStyledCell(formatLocks(netProfitWL), STYLES.kpiHighlightProfit), createStyledCell("Estimasi Rupiah", STYLES.kpiCardLabel), createStyledCell(wlToIdr(netProfitWL, idrPerDl), STYLES.kpiHighlightProfit)],
    [createStyledCell("Return on Investment (ROI)", STYLES.kpiCardLabel), createStyledCell(`${roi}%`, STYLES.kpiHighlightProfit), createStyledCell("Efisiensi Modal", STYLES.kpiCardLabel), createStyledCell(netProfitWL >= 0 ? "PROFITABLE ✓" : "DEFICIT", STYLES.kpiCardValue)]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(dashboardData);
  wsSummary["!cols"] = [{ wch: 32 }, { wch: 24 }, { wch: 22 }, { wch: 24 }];
  wsSummary["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 3 } }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Finansial");

  // --- Sheet 2: Pembelian Bahan ---
  const materialsSheetData = [
    ["No", "Tanggal", "Nama Bahan / Item", "Jumlah (Qty)", "Rate / Harga", "Harga Satuan (WL)", "Total Biaya (WL)", "Estimasi Rupiah", "Catatan"].map((h) => createStyledCell(h, STYLES.thEmerald))
  ];
  materials.forEach((m, idx) => {
    const isOdd = idx % 2 === 1;
    const baseStyle = isOdd ? STYLES.tdOdd : STYLES.tdEven;
    const qty = Number(m.quantity || 0);
    const totalWL = Number(m.totalWL || 0);
    const unitPrice = qty > 0 ? Number((totalWL / qty).toFixed(4)) : 0;
    materialsSheetData.push([
      createStyledCell(idx + 1, { ...baseStyle, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(m.date || "-", { ...baseStyle, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(m.name, { ...baseStyle, font: { ...baseStyle.font, bold: true } }),
      createStyledCell(qty, { ...baseStyle, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(m.rateDisplay || "-", { ...baseStyle, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(unitPrice, { ...baseStyle, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(formatLocks(totalWL), STYLES.tdLocks),
      createStyledCell(wlToIdr(totalWL, idrPerDl), { ...baseStyle, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(m.notes || "-", baseStyle)
    ]);
  });
  materialsSheetData.push([
    createStyledCell("TOTAL REKAPAN BELANJA BAHAN", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell("", STYLES.tfootTotalLabel),
    createStyledCell(formatLocks(totalMaterialSpendWL), STYLES.tfootTotalLocks),
    createStyledCell(wlToIdr(totalMaterialSpendWL, idrPerDl), STYLES.tfootTotalIdr),
    createStyledCell("", STYLES.tfootTotalLabel)
  ]);
  const wsMaterials = XLSX.utils.aoa_to_sheet(materialsSheetData);
  wsMaterials["!cols"] = calculateColumnWidths(materialsSheetData);
  wsMaterials["!merges"] = [
    { s: { r: materialsSheetData.length - 1, c: 0 }, e: { r: materialsSheetData.length - 1, c: 5 } }
  ];
  XLSX.utils.book_append_sheet(wb, wsMaterials, "Pembelian Bahan");

  // --- Sheet 3: Buku Kas & Transaksi ---
  const ledgerSheetData = [
    ["No", "Tipe Transaksi", "Tanggal (GMT+7)", "Keterangan", "Kategori", "Jumlah (Qty)", "Nominal (WL)", "Format Locks", "Estimasi Rupiah"].map((h) => createStyledCell(h, STYLES.thSlate))
  ];
  let ledgerIdx = 1;
  capital.forEach((c) => {
    const amt = Number(c.amountWL || 0);
    ledgerSheetData.push([
      createStyledCell(ledgerIdx++, STYLES.tdEven),
      createStyledCell("SETORAN MODAL", STYLES.tdCapital),
      createStyledCell(c.date || "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(c.note || "Modal", STYLES.tdEven),
      createStyledCell("Capital", STYLES.tdEven),
      createStyledCell("-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(amt, { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(`+${formatLocks(amt)}`, STYLES.tdCapital),
      createStyledCell(wlToIdr(amt, idrPerDl), { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } })
    ]);
  });
  revenues.forEach((r) => {
    const amt = Number(r.amountWL || 0);
    ledgerSheetData.push([
      createStyledCell(ledgerIdx++, STYLES.tdEven),
      createStyledCell("PENJUALAN", STYLES.tdRevenue),
      createStyledCell(r.date || "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(r.note || "Penjualan", STYLES.tdEven),
      createStyledCell(r.category || "seeds", STYLES.tdEven),
      createStyledCell(r.quantity ? Number(r.quantity) : "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(amt, { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(`+${formatLocks(amt)}`, STYLES.tdRevenue),
      createStyledCell(wlToIdr(amt, idrPerDl), { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } })
    ]);
  });
  expenses.forEach((e) => {
    const amt = Number(e.amountWL || 0);
    ledgerSheetData.push([
      createStyledCell(ledgerIdx++, STYLES.tdEven),
      createStyledCell("PENGELUARAN", STYLES.tdExpense),
      createStyledCell(e.date || "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "center" } }),
      createStyledCell(e.note || "Pengeluaran", STYLES.tdEven),
      createStyledCell(e.category || "expenses", STYLES.tdEven),
      createStyledCell(e.quantity ? Number(e.quantity) : "-", { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(-amt, { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } }),
      createStyledCell(`-${formatLocks(amt)}`, STYLES.tdExpense),
      createStyledCell(-wlToIdr(amt, idrPerDl), { ...STYLES.tdEven, alignment: { vertical: "center", horizontal: "right" } })
    ]);
  });
  const wsLedger = XLSX.utils.aoa_to_sheet(ledgerSheetData);
  wsLedger["!cols"] = calculateColumnWidths(ledgerSheetData);
  XLSX.utils.book_append_sheet(wb, wsLedger, "Buku Kas & Transaksi");

  // --- Sheet 4: Pohon Resep Splicing ---
  if (splices.length > 0) {
    const splicesSheetData = [
      ["No", "Kelompok Alur", "Bahan A", "Jumlah A", "Rate A", "Bahan B", "Jumlah B", "Rate B", "Hasil Splice", "Jumlah Hasil", "Total Biaya Step (WL)"].map((h) => createStyledCell(h, STYLES.thSlate))
    ];
    splices.forEach((sp, idx) => {
      const stepCost = Number(sp.costWLA || 0) + Number(sp.costWLB || 0);
      splicesSheetData.push([
        createStyledCell(idx + 1, STYLES.tdEven),
        createStyledCell(sp.branch || "-", STYLES.tdEven),
        createStyledCell(sp.itemA, STYLES.tdEven),
        createStyledCell(sp.qtyA || 0, STYLES.tdEven),
        createStyledCell(sp.rateDisplayA || "-", STYLES.tdEven),
        createStyledCell(sp.itemB, STYLES.tdEven),
        createStyledCell(sp.qtyB || 0, STYLES.tdEven),
        createStyledCell(sp.rateDisplayB || "-", STYLES.tdEven),
        createStyledCell(sp.result, STYLES.tdRevenue),
        createStyledCell(sp.qtyResult || 0, STYLES.tdEven),
        createStyledCell(formatLocks(stepCost), STYLES.tdLocks)
      ]);
    });
    const wsSplices = XLSX.utils.aoa_to_sheet(splicesSheetData);
    wsSplices["!cols"] = calculateColumnWidths(splicesSheetData);
    XLSX.utils.book_append_sheet(wb, wsSplices, "Pohon Resep");
  }

  // --- Sheet 5: Tahapan Projek ---
  if (stages.length > 0) {
    const stagesSheetData = [
      ["No", "Tahap Pengerjaan", "Deskripsi / Formula", "Status", "Catatan"].map((h) => createStyledCell(h, STYLES.thSlate))
    ];
    stages.forEach((s, idx) => {
      stagesSheetData.push([
        createStyledCell(idx + 1, STYLES.tdEven),
        createStyledCell(s.title, { ...STYLES.tdEven, font: { ...STYLES.tdEven.font, bold: true } }),
        createStyledCell(s.description || "-", STYLES.tdEven),
        createStyledCell(s.completed ? "SELESAI (DONE) ✓" : "DALAM PROGRES", s.completed ? STYLES.tdRevenue : STYLES.tdEven),
        createStyledCell(s.notes || "-", STYLES.tdEven)
      ]);
    });
    const wsStages = XLSX.utils.aoa_to_sheet(stagesSheetData);
    wsStages["!cols"] = calculateColumnWidths(stagesSheetData);
    XLSX.utils.book_append_sheet(wb, wsStages, "Tahapan Projek");
  }

  const filename = `Growmass_Laporan_Lengkap_${sanitizeFilename(project.name)}_${getDateStamp()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * EXPORT 4: Dedicated Material Purchases to CSV
 */
export function exportMaterialsToCSV(project, currencyConfig) {
  const idrPerDl = currencyConfig?.idrPerDl || 3500;
  const materials = project.materials || [];

  const headers = [
    "No",
    "Tanggal",
    "Nama Bahan / Item",
    "Jumlah (Qty)",
    "Rate / Harga Beli",
    "Harga Satuan (WL)",
    "Total Biaya (WL)",
    "Format Locks",
    "Estimasi Rupiah",
    "Catatan"
  ];

  const rows = materials.map((m, idx) => {
    const qty = Number(m.quantity || 0);
    const totalWL = Number(m.totalWL || 0);
    const unitPrice = qty > 0 ? (totalWL / qty).toFixed(4) : "-";

    return [
      idx + 1,
      `"${m.date || "-"}"`,
      `"${(m.name || "").replace(/"/g, '""')}"`,
      qty,
      `"${(m.rateDisplay || "-").replace(/"/g, '""')}"`,
      unitPrice,
      totalWL,
      `"${formatLocks(totalWL)}"`,
      wlToIdr(totalWL, idrPerDl),
      `"${(m.notes || "").replace(/"/g, '""')}"`
    ];
  });

  const totalWlSum = materials.reduce((s, m) => s + Number(m.totalWL || 0), 0);

  const csvContent = [
    `REKAPAN PEMBELIAN BAHAN & BIAYA - ${project.name.toUpperCase()}`,
    `Target Item: ${project.targetItem || "-"} | Target Qty: ${Number(project.targetQuantity || 0).toLocaleString()}`,
    `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")} | Kurs 1 DL: Rp ${idrPerDl.toLocaleString("id-ID")}`,
    "",
    headers.join(","),
    ...rows.map((r) => r.join(",")),
    "",
    `TOTAL REKAPAN BELANJA BAHAN,,,,,,${totalWlSum},"${formatLocks(totalWlSum)}",${wlToIdr(totalWlSum, idrPerDl)}`
  ].join("\n");

  downloadBlob(csvContent, `Growmass_Bahan_${sanitizeFilename(project.name)}.csv`, "text/csv;charset=utf-8;");
}

/**
 * EXPORT 5: Dedicated Cash Ledger to CSV
 */
export function exportCashLedgerToCSV(project, currencyConfig) {
  const idrPerDl = currencyConfig?.idrPerDl || 3500;
  const capital = project.ledger?.capital || [];
  const revenues = project.ledger?.revenues || [];
  const expenses = project.ledger?.expenses || [];

  const headers = [
    "No",
    "Tipe Transaksi",
    "Tanggal (GMT+7)",
    "Keterangan Transaksi",
    "Kategori",
    "Jumlah (Qty)",
    "Nominal (WL)",
    "Format Locks",
    "Estimasi Rupiah"
  ];

  let rowIndex = 1;
  const rows = [];

  capital.forEach((c) => {
    const amt = Number(c.amountWL || 0);
    rows.push([
      rowIndex++,
      "SETORAN MODAL",
      `"${c.date || "-"}"`,
      `"${(c.note || "Setoran Modal").replace(/"/g, '""')}"`,
      "Modal",
      "-",
      amt,
      `"+${formatLocks(amt)}"`,
      wlToIdr(amt, idrPerDl)
    ]);
  });

  revenues.forEach((r) => {
    const amt = Number(r.amountWL || 0);
    rows.push([
      rowIndex++,
      "HASIL PENJUALAN (OMSET)",
      `"${r.date || "-"}"`,
      `"${(r.note || "Penjualan").replace(/"/g, '""')}"`,
      `"${r.category || "seeds"}"`,
      r.quantity ? Number(r.quantity) : "-",
      amt,
      `"+${formatLocks(amt)}"`,
      wlToIdr(amt, idrPerDl)
    ]);
  });

  expenses.forEach((e) => {
    const amt = Number(e.amountWL || 0);
    rows.push([
      rowIndex++,
      "PENGELUARAN LAINNYA",
      `"${e.date || "-"}"`,
      `"${(e.note || "Pengeluaran").replace(/"/g, '""')}"`,
      `"${e.category || "expenses"}"`,
      e.quantity ? Number(e.quantity) : "-",
      -amt,
      `"-${formatLocks(amt)}"`,
      -wlToIdr(amt, idrPerDl)
    ]);
  });

  const totalCapitalWL = capital.reduce((s, c) => s + Number(c.amountWL || 0), 0);
  const totalRevenuesWL = revenues.reduce((s, r) => s + Number(r.amountWL || 0), 0);

  const csvContent = [
    `BUKU KAS & ARUS TRANSAKSI - ${project.name.toUpperCase()}`,
    `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")} | Kurs 1 DL: Rp ${idrPerDl.toLocaleString("id-ID")}`,
    `Total Setoran Modal: ${formatLocks(totalCapitalWL)} | Total Omset: ${formatLocks(totalRevenuesWL)}`,
    "",
    headers.join(","),
    ...rows.map((r) => r.join(","))
  ].join("\n");

  downloadBlob(csvContent, `Growmass_Buku_Kas_${sanitizeFilename(project.name)}.csv`, "text/csv;charset=utf-8;");
}

/**
 * EXPORT 6: Complete Project CSV
 */
export function exportProjectToCSV(project, currencyConfig) {
  exportMaterialsToCSV(project, currencyConfig);
}

// Helpers
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name) {
  return (name || "Projek").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function getDateStamp() {
  return new Date().toISOString().split("T")[0];
}
