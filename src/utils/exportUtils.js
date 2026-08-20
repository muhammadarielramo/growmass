/**
 * Professional Pro Excel & CSV Export Utilities for Growmass
 * Uses official SheetJS (xlsx) for 100% reliable browser compatibility and clean spreadsheet layouts
 */
import * as XLSX from "xlsx";
import { formatLocks, wlToIdr } from "./currency";
import { formatStatusLabel } from "./statusUtils";

/**
 * Calculates optimal column widths so no text/numbers get truncated (###)
 */
function calculateColumnWidths(dataMatrix) {
  if (!dataMatrix || dataMatrix.length === 0) return [];
  const colWidths = [];

  dataMatrix.forEach((row) => {
    if (!Array.isArray(row)) return;
    row.forEach((cellVal, colIdx) => {
      const textVal = cellVal !== null && cellVal !== undefined ? String(cellVal) : "";
      const textLen = textVal.length;
      colWidths[colIdx] = Math.max(colWidths[colIdx] || 10, textLen + 3);
    });
  });

  return colWidths.map((w) => ({ wch: Math.min(Math.max(w, 12), 48) }));
}

/**
 * EXPORT 1: Dedicated Material Purchases to Pro XLSX (Excel)
 */
export function exportMaterialsToXLSX(project, currencyConfig) {
  const wb = XLSX.utils.book_new();
  const idrPerDl = currencyConfig?.idrPerDl || 3500;
  const materials = project.materials || [];

  const totalSpendWL = materials.reduce((sum, m) => sum + Number(m.totalWL || 0), 0);
  const totalCostIDR = wlToIdr(totalSpendWL, idrPerDl);

  const sheetData = [
    // Title Banner
    ["GROWMASS - DAFTAR REKAPAN PEMBELIAN BAHAN PROJEK", "", "", "", "", "", "", "", ""],
    // Metadata block
    ["Nama Projek:", project.name, "Target Item:", project.targetItem || "-", "Status Projek:", formatStatusLabel(project.status).toUpperCase(), "", "", ""],
    ["World Farm:", project.worldName || "-", "Kurs 1 DL:", `Rp ${idrPerDl.toLocaleString("id-ID")}`, "Tanggal Ekspor:", new Date().toLocaleDateString("id-ID"), "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    // Table Headers
    [
      "No",
      "Tanggal",
      "Nama Bahan / Item",
      "Jumlah Beli (Qty)",
      "Rate / Harga Beli",
      "Harga Satuan (WL)",
      "Total Biaya (WL)",
      "Format Locks",
      "Estimasi Rupiah",
      "Catatan / Keterangan"
    ]
  ];

  // Data rows
  materials.forEach((m, idx) => {
    const qty = Number(m.quantity || 0);
    const totalWL = Number(m.totalWL || 0);
    const unitPrice = qty > 0 ? Number((totalWL / qty).toFixed(4)) : 0;

    sheetData.push([
      idx + 1,
      m.date || "-",
      m.name,
      qty,
      m.rateDisplay || "-",
      unitPrice,
      totalWL,
      formatLocks(totalWL),
      wlToIdr(totalWL, idrPerDl),
      m.notes || "-"
    ]);
  });

  // Summary row (Aligned properly!)
  sheetData.push([
    "TOTAL REKAPAN BELANJA BAHAN",
    "",
    "",
    "",
    "",
    "",
    totalSpendWL,
    formatLocks(totalSpendWL),
    totalCostIDR,
    ""
  ]);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = calculateColumnWidths(sheetData);
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: sheetData.length - 1, c: 0 }, e: { r: sheetData.length - 1, c: 5 } }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Pembelian Bahan");

  const filename = `Growmass_Bahan_${sanitizeFilename(project.name)}_${getDateStamp()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * EXPORT 2: Dedicated Cash Ledger to Pro XLSX (Excel)
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

  const sheetData = [
    // Title Banner
    ["GROWMASS - BUKU KAS & ARUS TRANSAKSI MODAL / OMSET", "", "", "", "", "", "", "", ""],
    // Metadata block
    ["Nama Projek:", project.name, "Total Setoran Modal:", formatLocks(totalCapitalWL), "Total Hasil Omset:", formatLocks(totalRevenuesWL), "Kurs 1 DL:", `Rp ${idrPerDl.toLocaleString("id-ID")}`, ""],
    ["", "", "", "", "", "", "", "", ""],
    // Table Headers
    [
      "No",
      "Tipe Transaksi",
      "Tanggal (GMT+7)",
      "Keterangan Transaksi",
      "Kategori",
      "Jumlah (Qty)",
      "Nominal (WL)",
      "Format Locks",
      "Estimasi Rupiah"
    ]
  ];

  let rowIdx = 1;

  capital.forEach((c) => {
    const amt = Number(c.amountWL || 0);
    sheetData.push([
      rowIdx++,
      "SETORAN MODAL",
      c.date || "-",
      c.note || "Setoran Modal",
      "Modal",
      "-",
      amt,
      `+${formatLocks(amt)}`,
      wlToIdr(amt, idrPerDl)
    ]);
  });

  revenues.forEach((r) => {
    const amt = Number(r.amountWL || 0);
    sheetData.push([
      rowIdx++,
      "PENJUALAN (OMSET)",
      r.date || "-",
      r.note || "Hasil Penjualan",
      r.category || "seeds",
      r.quantity ? Number(r.quantity) : "-",
      amt,
      `+${formatLocks(amt)}`,
      wlToIdr(amt, idrPerDl)
    ]);
  });

  expenses.forEach((e) => {
    const amt = Number(e.amountWL || 0);
    sheetData.push([
      rowIdx++,
      "PENGELUARAN LAINNYA",
      e.date || "-",
      e.note || "Pengeluaran Operasional",
      e.category || "expenses",
      e.quantity ? Number(e.quantity) : "-",
      -amt,
      `-${formatLocks(amt)}`,
      -wlToIdr(amt, idrPerDl)
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
    ["GROWMASS - FINANCIAL REPORT & EXECUTIVE DASHBOARD", "", "", ""],
    ["", "", "", ""],
    ["1. INFORMASI UMUM PROJEK", "", "", ""],
    ["Nama Projek", project.name, "World Farm", project.worldName || "-"],
    ["Target Item", project.targetItem || "-", "World Storage", project.storageWorld || "-"],
    ["Target Jumlah (Qty)", project.targetQuantity ? Number(project.targetQuantity).toLocaleString() : "Fleksibel", "Status Projek", formatStatusLabel(project.status).toUpperCase()],
    ["Tanggal Dibuat", project.createdDateGMT7 || new Date(project.createdAt).toLocaleDateString("id-ID"), "Kurs Acuan 1 DL", `Rp ${idrPerDl.toLocaleString("id-ID")}`],
    ["", "", "", ""],
    ["2. REKAPITULASI KEUANGAN & LABA / RUGI", "", "", ""],
    ["Total Setoran Modal Awal", formatLocks(totalCapitalWL), "Estimasi Rupiah", wlToIdr(totalCapitalWL, idrPerDl)],
    ["Total Belanja Bahan", formatLocks(totalMaterialSpendWL), "Estimasi Rupiah", wlToIdr(totalMaterialSpendWL, idrPerDl)],
    ["Total Biaya Operasional / Lainnya", formatLocks(totalOtherExpensesWL), "Estimasi Rupiah", wlToIdr(totalOtherExpensesWL, idrPerDl)],
    ["Grand Total Pengeluaran Modal", formatLocks(grandTotalExpensesWL), "Estimasi Rupiah", wlToIdr(grandTotalExpensesWL, idrPerDl)],
    ["Total Hasil Penjualan (Omset)", formatLocks(totalRevenuesWL), "Estimasi Rupiah", wlToIdr(totalRevenuesWL, idrPerDl)],
    ["Laba Bersih / Net Profit", formatLocks(netProfitWL), "Estimasi Rupiah", wlToIdr(netProfitWL, idrPerDl)],
    ["Return on Investment (ROI)", `${roi}%`, "Status Finansial", netProfitWL >= 0 ? "PROFITABLE ✓" : "DEFICIT"]
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
    ["No", "Tanggal", "Nama Bahan / Item", "Jumlah (Qty)", "Rate / Harga", "Harga Satuan (WL)", "Total Biaya (WL)", "Format Locks", "Estimasi Rupiah", "Catatan"]
  ];
  materials.forEach((m, idx) => {
    const qty = Number(m.quantity || 0);
    const totalWL = Number(m.totalWL || 0);
    const unitPrice = qty > 0 ? Number((totalWL / qty).toFixed(4)) : 0;
    materialsSheetData.push([
      idx + 1,
      m.date || "-",
      m.name,
      qty,
      m.rateDisplay || "-",
      unitPrice,
      totalWL,
      formatLocks(totalWL),
      wlToIdr(totalWL, idrPerDl),
      m.notes || "-"
    ]);
  });
  materialsSheetData.push([
    "TOTAL REKAPAN BELANJA BAHAN",
    "",
    "",
    "",
    "",
    "",
    totalMaterialSpendWL,
    formatLocks(totalMaterialSpendWL),
    wlToIdr(totalMaterialSpendWL, idrPerDl),
    ""
  ]);
  const wsMaterials = XLSX.utils.aoa_to_sheet(materialsSheetData);
  wsMaterials["!cols"] = calculateColumnWidths(materialsSheetData);
  wsMaterials["!merges"] = [
    { s: { r: materialsSheetData.length - 1, c: 0 }, e: { r: materialsSheetData.length - 1, c: 5 } }
  ];
  XLSX.utils.book_append_sheet(wb, wsMaterials, "Pembelian Bahan");

  // --- Sheet 3: Buku Kas & Transaksi ---
  const ledgerSheetData = [
    ["No", "Tipe Transaksi", "Tanggal (GMT+7)", "Keterangan", "Kategori", "Jumlah (Qty)", "Nominal (WL)", "Format Locks", "Estimasi Rupiah"]
  ];
  let ledgerIdx = 1;
  capital.forEach((c) => {
    const amt = Number(c.amountWL || 0);
    ledgerSheetData.push([ledgerIdx++, "SETORAN MODAL", c.date || "-", c.note || "Modal", "Capital", "-", amt, formatLocks(amt), wlToIdr(amt, idrPerDl)]);
  });
  revenues.forEach((r) => {
    const amt = Number(r.amountWL || 0);
    ledgerSheetData.push([ledgerIdx++, "PENJUALAN", r.date || "-", r.note || "Penjualan", r.category || "seeds", r.quantity || "-", amt, formatLocks(amt), wlToIdr(amt, idrPerDl)]);
  });
  expenses.forEach((e) => {
    const amt = Number(e.amountWL || 0);
    ledgerSheetData.push([ledgerIdx++, "PENGELUARAN", e.date || "-", e.note || "Pengeluaran", e.category || "expenses", e.quantity || "-", -amt, `-${formatLocks(amt)}`, -wlToIdr(amt, idrPerDl)]);
  });
  const wsLedger = XLSX.utils.aoa_to_sheet(ledgerSheetData);
  wsLedger["!cols"] = calculateColumnWidths(ledgerSheetData);
  XLSX.utils.book_append_sheet(wb, wsLedger, "Buku Kas & Transaksi");

  // --- Sheet 4: Pohon Resep Splicing ---
  if (splices.length > 0) {
    const splicesSheetData = [
      ["No", "Kelompok Alur", "Bahan A", "Jumlah A", "Rate A", "Bahan B", "Jumlah B", "Rate B", "Hasil Splice", "Jumlah Hasil", "Total Biaya Step (WL)"]
    ];
    splices.forEach((sp, idx) => {
      const stepCost = Number(sp.costWLA || 0) + Number(sp.costWLB || 0);
      splicesSheetData.push([
        idx + 1,
        sp.branch || "-",
        sp.itemA,
        sp.qtyA || 0,
        sp.rateDisplayA || "-",
        sp.itemB,
        sp.qtyB || 0,
        sp.rateDisplayB || "-",
        sp.result,
        sp.qtyResult || 0,
        stepCost
      ]);
    });
    const wsSplices = XLSX.utils.aoa_to_sheet(splicesSheetData);
    wsSplices["!cols"] = calculateColumnWidths(splicesSheetData);
    XLSX.utils.book_append_sheet(wb, wsSplices, "Pohon Resep");
  }

  // --- Sheet 5: Tahapan Projek ---
  if (stages.length > 0) {
    const stagesSheetData = [
      ["No", "Tahap Pengerjaan", "Deskripsi / Formula", "Status", "Catatan"]
    ];
    stages.forEach((s, idx) => {
      stagesSheetData.push([
        idx + 1,
        s.title,
        s.description || "-",
        s.completed ? "SELESAI (DONE) ✓" : "DALAM PROGRES",
        s.notes || "-"
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
