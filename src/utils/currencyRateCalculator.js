/**
 * Rate Calculator helpers for Material Purchases & Splice Step Costs
 * Computes Total WL, Total Rupiah, and unit prices across various rate modes.
 */
import { wlToIdr, idrToWl } from "./currency";

export const RATE_TYPES = [
  { id: "total_wl", label: "💵 Total WL Langsung", placeholder: "Misal: 515 (Total biaya belanja langsung dalam WL)", example: "515 WL total" },
  { id: "item_per_wl", label: "Item / WL", placeholder: "Misal: 35 (artinya 35 seed / 1 WL)", example: "35 seed = 1 WL" },
  { id: "wl_per_item", label: "WL / Item", placeholder: "Misal: 1.5 atau 2 (Harga WL per item)", example: "1 item = 1.5 WL" },
  { id: "total_dl", label: "Total DL Langsung", placeholder: "Misal: 5.5 (Total biaya dalam DL)", example: "5.5 DL total" },
  { id: "total_rupiah", label: "Total Rupiah (IDR)", placeholder: "Misal: 50000 (Rp 50.000)", example: "Rp 50.000 total" },
  { id: "rupiah_per_item", label: "Rupiah / Item", placeholder: "Misal: 15 (Rp 15 per seed)", example: "Rp 15 / seed" },
];

/**
 * Calculates total WL, total IDR, and formatted rate string from quantity and rate inputs
 */
export function calculatePurchaseCost({ quantity, rateType, rateValue, idrPerDl = 3500 }) {
  const qty = Number(quantity || 0);
  const rate = Number(rateValue || 0);

  if (qty <= 0 && rate <= 0) {
    return {
      totalWL: 0,
      totalIDR: 0,
      unitPriceWL: 0,
      unitPriceIDR: 0,
      rateDisplay: "-"
    };
  }

  let totalWL = 0;
  let totalIDR = 0;
  let rateDisplay = "";

  switch (rateType) {
    case "total_wl":
      totalWL = rate;
      totalIDR = wlToIdr(totalWL, idrPerDl);
      rateDisplay = qty > 0 ? `${(qty / (totalWL || 1)).toFixed(1)}/WL (${totalWL} WL)` : `${totalWL} WL`;
      break;

    case "item_per_wl":
      if (rate > 0) {
        totalWL = Math.round((qty / rate) * 100) / 100;
        rateDisplay = `${rate}/WL`;
      }
      totalIDR = wlToIdr(totalWL, idrPerDl);
      break;

    case "wl_per_item":
      totalWL = Math.round((qty * rate) * 100) / 100;
      totalIDR = wlToIdr(totalWL, idrPerDl);
      rateDisplay = `${rate} WL/item`;
      break;

    case "total_dl":
      totalWL = Math.round(rate * 100);
      totalIDR = wlToIdr(totalWL, idrPerDl);
      rateDisplay = `${rate} DL (${totalWL} WL)`;
      break;

    case "total_rupiah":
      totalIDR = Math.round(rate);
      totalWL = idrToWl(totalIDR, idrPerDl);
      rateDisplay = `Rp ${rate.toLocaleString("id-ID")}`;
      break;

    case "rupiah_per_item":
      totalIDR = Math.round(qty * rate);
      totalWL = idrToWl(totalIDR, idrPerDl);
      rateDisplay = `Rp ${rate.toLocaleString("id-ID")}/item`;
      break;

    default:
      totalWL = rate;
      totalIDR = wlToIdr(totalWL, idrPerDl);
      rateDisplay = `${rate} WL`;
  }

  const unitPriceWL = qty > 0 ? totalWL / qty : 0;
  const unitPriceIDR = qty > 0 ? totalIDR / qty : 0;

  return {
    totalWL,
    totalIDR,
    unitPriceWL,
    unitPriceIDR,
    rateDisplay
  };
}
