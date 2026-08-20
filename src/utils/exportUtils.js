/**
 * Export utilities for Growmass
 * Supports multi-sheet XLSX (Excel) and CSV formats
 */
import * as XLSX from "xlsx";
import { formatLocks, wlToIdr } from "./currency";

import { formatStatusLabel } from "./statusUtils";

/**
 * Export a complete project to XLSX format with multiple structured sheets
 */
export function exportProjectToXLSX(project, currencyConfig) {
  const wb = XLSX.utils.book_new();
  const idrPerDl = currencyConfig?.idrPerDl || 3500;

  // 1. Ringkasan Projek Sheet
  const materials = project.materials || [];
  const capital = project.ledger?.capital || [];
  const expenses = project.ledger?.expenses || [];
  const revenues = project.ledger?.revenues || [];

  const totalMaterialSpendWL = materials.reduce((sum, m) => sum + Number(m.totalWL || 0), 0);
  const totalOtherExpensesWL = expenses.reduce((sum, e) => sum + Number(e.amountWL || 0), 0);
  const totalCapitalWL = capital.reduce((sum, c) => sum + Number(c.amountWL || 0), 0);
  const totalRevenuesWL = revenues.reduce((sum, r) => sum + Number(r.amountWL || 0), 0);
  const grandTotalExpensesWL = totalMaterialSpendWL + totalOtherExpensesWL;
  const netProfitWL = totalRevenuesWL - grandTotalExpensesWL;

  const summaryData = [
    ["INFORMASI PROJEK GROWMASS", ""],
    ["Nama Projek", project.name],
    ["Target Item", project.targetItem],
    ["Target Jumlah", project.targetQuantity ? `${project.targetQuantity.toLocaleString()} ${project.unit || "Seeds"}` : "Fleksibel / Belum Ditentukan"],
    ["Status", formatStatusLabel(project.status).toUpperCase()],
    ["World Farm", project.worldName || "-"],
    ["World Storage", project.storageWorld || "-"],
    ["Tanggal Dibuat", new Date(project.createdAt).toLocaleDateString("id-ID")],
    ["Catatan", project.notes || "-"],
    ["", ""],
    ["RINGKASAN KEUANGAN", ""],
    ["Kurs Acuan 1 DL", `Rp ${idrPerDl.toLocaleString("id-ID")}`],
    ["Total Modal Awal (WL)", totalCapitalWL],
    ["Total Modal Awal (Rupiah)", wlToIdr(totalCapitalWL, idrPerDl)],
    ["Total Belanja Bahan (WL)", totalMaterialSpendWL],
    ["Total Biaya Operasional / Lainnya (WL)", totalOtherExpensesWL],
    ["Grand Total Pengeluaran (WL)", grandTotalExpensesWL],
    ["Grand Total Pengeluaran (Locks)", formatLocks(grandTotalExpensesWL)],
    ["Grand Total Pengeluaran (Rupiah)", wlToIdr(grandTotalExpensesWL, idrPerDl)],
    ["Total Hasil Penjualan (WL)", totalRevenuesWL],
    ["Total Hasil Penjualan (Rupiah)", wlToIdr(totalRevenuesWL, idrPerDl)],
    ["Laba Bersih / Net Profit (WL)", netProfitWL],
    ["Laba Bersih / Net Profit (Locks)", formatLocks(netProfitWL)],
    ["Laba Bersih / Net Profit (Rupiah)", wlToIdr(netProfitWL, idrPerDl)],
    ["ROI (%)", grandTotalExpensesWL > 0 ? `${((netProfitWL / grandTotalExpensesWL) * 100).toFixed(1)}%` : "0%"]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Projek");

  // 2. Daftar Pembelian Bahan & Alat Sheet
  const materialsHeader = [
    "No",
    "Nama Bahan / Item",
    "Cabang Resep",
    "Jumlah (Qty)",
    "Jenis Rate / Harga",
    "Rate Input",
    "Harga Satuan (WL/Item)",
    "Total Biaya (WL)",
    "Format Locks",
    "Total Biaya (Rupiah)",
    "Keterangan / Catatan"
  ];

  const materialsRows = materials.map((m, idx) => {
    const qty = Number(m.quantity || 0);
    const totalWL = Number(m.totalWL || 0);
    const unitPriceWL = qty > 0 ? (totalWL / qty).toFixed(4) : "-";

    return [
      idx + 1,
      m.name,
      m.branch || "-",
      qty,
      m.rateType || "Item/WL",
      m.rateDisplay || "-",
      unitPriceWL,
      totalWL,
      formatLocks(totalWL),
      wlToIdr(totalWL, idrPerDl),
      m.notes || ""
    ];
  });

  const wsMaterials = XLSX.utils.aoa_to_sheet([materialsHeader, ...materialsRows]);
  XLSX.utils.book_append_sheet(wb, wsMaterials, "Daftar Pembelian Bahan");

  // 3. Buku Kas Transaksi Sheet
  const ledgerHeader = [
    "No",
    "Tanggal",
    "Tipe Transaksi",
    "Kategori",
    "Keterangan",
    "Kuantitas",
    "Harga Satuan",
    "Nominal WL",
    "Format Locks",
    "Nominal Rupiah"
  ];

  let ledgerRowIndex = 1;
  const ledgerRows = [];

  capital.forEach((c) => {
    ledgerRows.push([
      ledgerRowIndex++,
      c.date,
      "MODAL AWAL",
      "Capital",
      c.note,
      "-",
      "-",
      c.amountWL,
      formatLocks(c.amountWL),
      wlToIdr(c.amountWL, idrPerDl)
    ]);
  });

  expenses.forEach((e) => {
    ledgerRows.push([
      ledgerRowIndex++,
      e.date,
      "PENGELUARAN",
      e.category,
      e.note,
      e.quantity || "-",
      e.unitPrice || "-",
      -e.amountWL,
      `-${formatLocks(e.amountWL)}`,
      -wlToIdr(e.amountWL, idrPerDl)
    ]);
  });

  revenues.forEach((r) => {
    ledgerRows.push([
      ledgerRowIndex++,
      r.date,
      "PENJUALAN",
      r.category,
      r.note,
      r.quantity || "-",
      r.unitPrice || "-",
      r.amountWL,
      formatLocks(r.amountWL),
      wlToIdr(r.amountWL, idrPerDl)
    ]);
  });

  const wsLedger = XLSX.utils.aoa_to_sheet([ledgerHeader, ...ledgerRows]);
  XLSX.utils.book_append_sheet(wb, wsLedger, "Buku Kas Transaksi");

  // 4. Alur & Tahapan Splicing Sheet
  const stages = project.stages || [];
  const stagesHeader = ["No", "Tahap / Langkah", "Deskripsi / Formula", "Status", "Catatan"];
  const stagesRows = stages.map((s, idx) => [
    idx + 1,
    s.title,
    s.description || "-",
    s.completed ? "SELESAI (DONE)" : "PROGRES",
    s.notes || "-"
  ]);

  const wsStages = XLSX.utils.aoa_to_sheet([stagesHeader, ...stagesRows]);
  XLSX.utils.book_append_sheet(wb, wsStages, "Alur Splicing");

  // Save and Trigger Download
  const filename = `Growmass_${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export project materials and ledger to CSV
 */
export function exportProjectToCSV(project, currencyConfig) {
  const idrPerDl = currencyConfig?.idrPerDl || 3500;
  const materials = project.materials || [];

  const headers = [
    "No",
    "Nama Bahan",
    "Cabang",
    "Jumlah (Qty)",
    "Rate Input",
    "Total Biaya (WL)",
    "Total Biaya (Locks)",
    "Total Biaya (Rupiah)",
    "Catatan"
  ];

  const rows = materials.map((m, idx) => {
    const totalWL = Number(m.totalWL || 0);
    return [
      idx + 1,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${(m.branch || "-").replace(/"/g, '""')}"`,
      Number(m.quantity || 0),
      `"${(m.rateDisplay || "-").replace(/"/g, '""')}"`,
      totalWL,
      `"${formatLocks(totalWL)}"`,
      wlToIdr(totalWL, idrPerDl),
      `"${(m.notes || "").replace(/"/g, '""')}"`
    ];
  });

  const csvContent = [
    `Rekapan Pembelian Bahan - ${project.name}`,
    `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")}`,
    `Kurs 1 DL: Rp ${idrPerDl.toLocaleString("id-ID")}`,
    "",
    headers.join(","),
    ...rows.map((r) => r.join(","))
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Growmass_Bahan_${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
