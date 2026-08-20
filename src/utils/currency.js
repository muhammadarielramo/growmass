/**
 * Currency utilities for Growmass
 * Supports World Locks (WL), Diamond Locks (DL), Blue Gem Locks (BGL), and Indonesian Rupiah (IDR).
 */

export const DEFAULT_CURRENCY_CONFIG = {
  idrPerDl: 3500, // Rp 3.500 per Diamond Lock
  wlPerDl: 100,   // 100 WL = 1 DL
  dlPerBgl: 100,  // 100 DL = 1 BGL (10,000 WL)
};

/**
 * Convert World Locks (WL) to Indonesian Rupiah (IDR)
 */
export function wlToIdr(wl, idrPerDl = DEFAULT_CURRENCY_CONFIG.idrPerDl) {
  if (!wl || isNaN(wl)) return 0;
  return Math.round((Number(wl) / 100) * idrPerDl);
}

/**
 * Convert Indonesian Rupiah (IDR) to World Locks (WL)
 */
export function idrToWl(idr, idrPerDl = DEFAULT_CURRENCY_CONFIG.idrPerDl) {
  if (!idr || isNaN(idr) || idrPerDl <= 0) return 0;
  return Math.round((Number(idr) / idrPerDl) * 100);
}

/**
 * Convert BGL, DL, WL breakdown to total WL
 */
export function locksToTotalWl(bgl = 0, dl = 0, wl = 0) {
  return (Number(bgl || 0) * 10000) + (Number(dl || 0) * 100) + Number(wl || 0);
}

/**
 * Convert total WL to { bgl, dl, wl }
 */
export function totalWlToLocks(totalWl) {
  const isNegative = totalWl < 0;
  const absWl = Math.abs(Math.round(totalWl || 0));

  const bgl = Math.floor(absWl / 10000);
  const remainderAfterBgl = absWl % 10000;
  const dl = Math.floor(remainderAfterBgl / 100);
  const wl = remainderAfterBgl % 100;

  return {
    isNegative,
    bgl: isNegative ? -bgl : bgl,
    dl: isNegative ? -dl : dl,
    wl: isNegative ? -wl : wl,
    rawBgl: bgl,
    rawDl: dl,
    rawWl: wl,
  };
}

/**
 * Format total WL into human readable locks (e.g. "2 BGL 45 DL 10 WL" or "85 WL")
 */
export function formatLocks(totalWl, options = { showZero: false }) {
  if (totalWl === 0 || totalWl === null || totalWl === undefined || isNaN(totalWl)) {
    return "0 WL";
  }

  const { isNegative, rawBgl, rawDl, rawWl } = totalWlToLocks(totalWl);
  const parts = [];

  if (rawBgl > 0) parts.push(`${rawBgl} BGL`);
  if (rawDl > 0) parts.push(`${rawDl} DL`);
  if (rawWl > 0 || (parts.length === 0 && options.showZero)) parts.push(`${rawWl} WL`);

  const result = parts.join(" ") || "0 WL";
  return isNegative ? `-${result}` : result;
}

/**
 * Format number into Indonesian Rupiah format (e.g. "Rp 350.000")
 */
export function formatIDR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
  const num = Math.round(Number(amount));
  const isNeg = num < 0;
  const formatted = Math.abs(num).toLocaleString("id-ID");
  return isNeg ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Calculate ROI % (Return on Investment)
 */
export function calculateROI(capitalWl, netProfitWl) {
  if (!capitalWl || capitalWl <= 0) return 0;
  const roi = (netProfitWl / capitalWl) * 100;
  return Number(roi.toFixed(1));
}

/**
 * Format dual currency object
 */
export function formatDual(totalWl, idrPerDl = DEFAULT_CURRENCY_CONFIG.idrPerDl) {
  const wlFormatted = formatLocks(totalWl);
  const idrFormatted = formatIDR(wlToIdr(totalWl, idrPerDl));
  return {
    wl: wlFormatted,
    idr: idrFormatted,
    combined: `${wlFormatted} (${idrFormatted})`
  };
}
