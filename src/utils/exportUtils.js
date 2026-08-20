/**
 * Professional Export Utilities for Growmass
 * Generates Pro-grade multi-sheet XLSX (Excel) spreadsheets and clean CSV files
 */
import * as XLSX from "xlsx";
import { formatLocks, wlToIdr } from "./currency";
import { formatStatusLabel } from "./statusUtils";

/**
 * Calculates optimal column widths so no text/numbers get truncated (###)
 */
function calculateColumnWidths(rows) {
  if (!rows || rows.length === 0) return [];
  const colWidths = [];

  rows.forEach((row) => {
    if (!Array.isArray(row)) return;
    row.forEach((val, colIdx) => {
      const textLen = val !== null && val !== undefined ? String(val).length : 0;
      colWidths[colIdx] = Math.max(colWidths[colIdx] || 10, textLen + 3);
    });
  });

  return colWidths.map((w) => ({ wch: Math.min(Math.max(w, 12), 45) }));
}

/**
 * EXPORT 1: Dedicated Material Purchases to CSV
 */
export function exportMaterialsToCSV(project, currencyConfig) {
  const idrPerDl = currencyConfig?.idrPerDl || 3500;
  const materials = project.materials || [];

  const headers = [
    "No",
    "Nama Bahan / Item",
    "Jumlah (Qty)",
    "Rate / Harga Beli",
    "Harga Satuan (WL)",
    "Total Biaya (WL)",
    "Format Locks",
    "Estimasi Rupiah",
    "Tanggal Pembelian",
    "Catatan"
  ];

  const rows = materials.map((m, idx) => {
    const qty = Number(m.quantity || 0);
    const totalWL = Number(m.totalWL || 0);
    const unitPrice = qty > 0 ? (totalWL / qty).toFixed(4) : "-";

    return [
      idx + 1,
      `"${(m.name || "").replace(/"/g, '""')}"`,
      qty,
      `"${(m.rateDisplay || "-").replace(/"/g, '""')}"`,
      unitPrice,
      totalWL,
      `"${formatLocks(totalWL)}"`,
      wlToIdr(totalWL, idrPerDl),
      `"${m.date || "-"}"`,
      `"${(m.notes || "").replace(/"/g, '""')}"`
    ];
  });

  const totalQtySum = materials.reduce((s, m) => s + Number(m.quantity || 0), 0);
  const totalWlSum = materials.reduce((s, m) => s + Number(m.totalWL || 0), 0);

  const csvContent = [
    `REKAPAN PEMBELIAN BAHAN & BIAYA - ${project.name.toUpperCase()}`,
    `Target Item: ${project.targetItem || "-"} | Target Qty: ${Number(project.targetQuantity || 0).toLocaleString()}`,
    `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")} | Kurs 1 DL: Rp ${idrPerDl.toLocaleString("id-ID")}`,
    "",
    headers.join(","),
    ...rows.map((r) => r.join(",")),
    "",
    `TOTAL KESELURUHAN,,${totalQtySum},,,${totalWlSum},"${formatLocks(totalWlSum)}",${wlToIdr(totalWlSum, idrPerDl)}`
  ].join("\n");

  downloadBlob(csvContent, `Growmass_Bahan_${sanitizeFilename(project.name)}.csv`, "text/csv;charset=utf-8;");
}

/**
 * EXPORT 2: Dedicated Material Purchases to Pro XLSX Excel
 */
export function exportMaterialsToXLSX(project, currencyConfig) {
  const wb = XLSX.utils.book_new();
  const idrPerDl = currencyConfig?.idrPerDl || 3500;
  const materials = project.materials || [];

  const totalSpendWL = materials.reduce((sum, m) => sum + Number(m.totalWL || 0), 0);
  const totalQtySum = materials.reduce((sum, m) => sum + Number(m.quantity || 0), 0);

  // Sheet 1: Detailed Materials Table
  const tableData = [
    ["GROWMASS - DAFTAR REKAPAN PEMBELIAN BAHAN PROJEK", "", "", "", "", "", "", "", ""],
    ["Nama Projek:", project.name, "Target Item:", project.targetItem || "-", "Status:", formatStatusLabel(project.status).toUpperCase(), "", "", ""],
    ["World Farm:", project.worldName || "-", "Kurs 1 DL:", `Rp ${idrPerDl.toLocaleString("id-ID")}`, "Tanggal Ekspor:", new Date().toLocaleDateString("id-ID"), "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    [
      "No",
      "Nama Bahan / Item",
      "Jumlah Beli (Qty)",
      "Rate / Harga Beli",
      "Harga Satuan (WL)",
      "Total Biaya (WL)",
      "Format Locks",
      "Estimasi Rupiah",
      "Tanggal",
      "Catatan / Keterangan"
    ]
  ];

  materials.forEach((m, idx) => {
    const qty = Number(m.quantity || 0);
    const totalWL = Number(m.totalWL || 0);
    const unitPrice = qty > 0 ? Number((totalWL / qty).toFixed(4)) : 0;

    tableData.push([
      idx + 1,
      m.name,
      qty,
      m.rateDisplay || "-",
      unitPrice,
      totalWL,
      formatLocks(totalWL),
      wlToIdr(totalWL, idrPerDl),
      m.date || "-",
      m.notes || ""
    ]);
  });

  // Summary Row
  tableData.push([
    "",
    "TOTAL BELANJA BAHAN",
    totalQtySum,
    "",
    "",
    totalSpendWL,
    formatLocks(totalSpendWL),
    wlToIdr(totalSpendWL, idrPerDl),
    "",
    ""
  ]);

  const ws = XLSX.utils.aoa_to_sheet(tableData);
  ws["!cols"] = calculateColumnWidths(tableData);
  XLSX.utils.book_append_sheet(wb, ws, "Pembelian Bahan");

  const filename = `Growmass_Bahan_${sanitizeFilename(project.name)}_${getDateStamp()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * EXPORT 3: Dedicated Cash Ledger to CSV
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
  const totalExpensesWL = expenses.reduce((s, e) => s + Number(e.amountWL || 0), 0);

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
 * EXPORT 4: Dedicated Cash Ledger to Pro XLSX Excel
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

  const tableData = [
    ["GROWMASS - BUKU KAS & ARUS TRANSAKSI MODAL / OMSET", "", "", "", "", "", "", ""],
    ["Nama Projek:", project.name, "Target Item:", project.targetItem || "-", "Status:", formatStatusLabel(project.status).toUpperCase(), "", ""],
    ["Total Setoran Modal:", formatLocks(totalCapitalWL), "Total Hasil Penjualan:", formatLocks(totalRevenuesWL), "Kurs 1 DL:", `Rp ${idrPerDl.toLocaleString("id-ID")}`, ""],
    ["", "", "", "", "", "", "", ""],
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

  let rowIndex = 1;

  capital.forEach((c) => {
    const amt = Number(c.amountWL || 0);
    tableData.push([
      rowIndex++,
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
    tableData.push([
      rowIndex++,
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
    tableData.push([
      rowIndex++,
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

  const ws = XLSX.utils.aoa_to_sheet(tableData);
  ws["!cols"] = calculateColumnWidths(tableData);
  XLSX.utils.book_append_sheet(wb, ws, "Arus Kas & Transaksi");

  const filename = `Growmass_Buku_Kas_${sanitizeFilename(project.name)}_${getDateStamp()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * EXPORT 5: Complete Master Multi-Sheet Pro Financial Workbook (Excel)
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

  // Sheet 1: Dashboard Ringkasan Finansial
  const summaryData = [
    ["GROWMASS - FINANCIAL REPORT & EXECUTIVE DASHBOARD", ""],
    ["", ""],
    ["1. INFORMASI UMUM PROJEK", ""],
    ["Nama Projek", project.name],
    ["Target Item", project.targetItem || "-"],
    ["Target Jumlah (Qty)", project.targetQuantity ? Number(project.targetQuantity).toLocaleString() : "Fleksibel"],
    ["Status Projek", formatStatusLabel(project.status).toUpperCase()],
    ["World Farm", project.worldName || "-"],
    ["World Storage", project.storageWorld || "-"],
    ["Tanggal Pembuatan", project.createdDateGMT7 || new Date(project.createdAt).toLocaleDateString("id-ID")],
    ["Catatan Projek", project.notes || "-"],
    ["", ""],
    ["2. REKAPITULASI KEUANGAN & LABA / RUGI", ""],
    ["Kurs Acuan (IDR / DL)", `Rp ${idrPerDl.toLocaleString("id-ID")}`],
    ["Total Setoran Modal Awal (WL)", totalCapitalWL],
    ["Total Setoran Modal Awal (Locks)", formatLocks(totalCapitalWL)],
    ["Total Setoran Modal Awal (Rupiah)", wlToIdr(totalCapitalWL, idrPerDl)],
    ["", ""],
    ["Total Belanja Bahan (WL)", totalMaterialSpendWL],
    ["Total Belanja Bahan (Locks)", formatLocks(totalMaterialSpendWL)],
    ["Total Belanja Bahan (Rupiah)", wlToIdr(totalMaterialSpendWL, idrPerDl)],
    ["", ""],
    ["Total Biaya Operasional / Lainnya (WL)", totalOtherExpensesWL],
    ["Grand Total Pengeluaran (WL)", grandTotalExpensesWL],
    ["Grand Total Pengeluaran (Locks)", formatLocks(grandTotalExpensesWL)],
    ["Grand Total Pengeluaran (Rupiah)", wlToIdr(grandTotalExpensesWL, idrPerDl)],
    ["", ""],
    ["Total Hasil Penjualan / Omset (WL)", totalRevenuesWL],
    ["Total Hasil Penjualan / Omset (Locks)", formatLocks(totalRevenuesWL)],
    ["Total Hasil Penjualan / Omset (Rupiah)", wlToIdr(totalRevenuesWL, idrPerDl)],
    ["", ""],
    ["Laba Bersih / Net Profit (WL)", netProfitWL],
    ["Laba Bersih / Net Profit (Locks)", formatLocks(netProfitWL)],
    ["Laba Bersih / Net Profit (Rupiah)", wlToIdr(netProfitWL, idrPerDl)],
    ["Return on Investment (ROI)", `${roi}%`]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 36 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Finansial");

  // Sheet 2: Pembelian Bahan
  const materialsTable = [
    ["No", "Nama Bahan / Item", "Jumlah (Qty)", "Rate / Harga Beli", "Harga Satuan (WL)", "Total Biaya (WL)", "Format Locks", "Estimasi Rupiah", "Tanggal", "Catatan"]
  ];
  materials.forEach((m, idx) => {
    const qty = Number(m.quantity || 0);
    const totalWL = Number(m.totalWL || 0);
    const unitPrice = qty > 0 ? Number((totalWL / qty).toFixed(4)) : 0;
    materialsTable.push([
      idx + 1,
      m.name,
      qty,
      m.rateDisplay || "-",
      unitPrice,
      totalWL,
      formatLocks(totalWL),
      wlToIdr(totalWL, idrPerDl),
      m.date || "-",
      m.notes || ""
    ]);
  });
  const wsMaterials = XLSX.utils.aoa_to_sheet(materialsTable);
  wsMaterials["!cols"] = calculateColumnWidths(materialsTable);
  XLSX.utils.book_append_sheet(wb, wsMaterials, "Pembelian Bahan");

  // Sheet 3: Buku Kas & Transaksi
  const ledgerTable = [
    ["No", "Tipe Transaksi", "Tanggal", "Keterangan", "Kategori", "Jumlah (Qty)", "Nominal WL", "Format Locks", "Estimasi Rupiah"]
  ];
  let ledgerIdx = 1;
  capital.forEach((c) => {
    const amt = Number(c.amountWL || 0);
    ledgerTable.push([ledgerIdx++, "SETORAN MODAL", c.date || "-", c.note || "Modal", "Capital", "-", amt, formatLocks(amt), wlToIdr(amt, idrPerDl)]);
  });
  revenues.forEach((r) => {
    const amt = Number(r.amountWL || 0);
    ledgerTable.push([ledgerIdx++, "PENJUALAN", r.date || "-", r.note || "Penjualan", r.category || "seeds", r.quantity || "-", amt, formatLocks(amt), wlToIdr(amt, idrPerDl)]);
  });
  expenses.forEach((e) => {
    const amt = Number(e.amountWL || 0);
    ledgerTable.push([ledgerIdx++, "PENGELUARAN", e.date || "-", e.note || "Pengeluaran", e.category || "expenses", e.quantity || "-", -amt, `-${formatLocks(amt)}`, -wlToIdr(amt, idrPerDl)]);
  });
  const wsLedger = XLSX.utils.aoa_to_sheet(ledgerTable);
  wsLedger["!cols"] = calculateColumnWidths(ledgerTable);
  XLSX.utils.book_append_sheet(wb, wsLedger, "Buku Kas & Transaksi");

  // Sheet 4: Pohon Resep Splicing
  if (splices.length > 0) {
    const splicesTable = [
      ["No", "Kelompok Alur", "Bahan A", "Jumlah A", "Rate A", "Bahan B", "Jumlah B", "Rate B", "Hasil Splice", "Jumlah Hasil", "Total Biaya Step (WL)"]
    ];
    splices.forEach((sp, idx) => {
      const stepCost = Number(sp.costWLA || 0) + Number(sp.costWLB || 0);
      splicesTable.push([
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
    const wsSplices = XLSX.utils.aoa_to_sheet(splicesTable);
    wsSplices["!cols"] = calculateColumnWidths(splicesTable);
    XLSX.utils.book_append_sheet(wb, wsSplices, "Pohon Resep");
  }

  // Sheet 5: Tahapan Checklist
  if (stages.length > 0) {
    const stagesTable = [["No", "Tahap Pengerjaan", "Deskripsi / Formula", "Status", "Catatan"]];
    stages.forEach((s, idx) => {
      stagesTable.push([idx + 1, s.title, s.description || "-", s.completed ? "SELESAI (DONE)" : "PROGRES", s.notes || "-"]);
    });
    const wsStages = XLSX.utils.aoa_to_sheet(stagesTable);
    wsStages["!cols"] = calculateColumnWidths(stagesTable);
    XLSX.utils.book_append_sheet(wb, wsStages, "Tahapan Projek");
  }

  const filename = `Growmass_Laporan_Lengkap_${sanitizeFilename(project.name)}_${getDateStamp()}.xlsx`;
  XLSX.writeFile(wb, filename);
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
