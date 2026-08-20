/**
 * Date utilities formatted for GMT+7 (WIB - Waktu Indonesia Barat)
 */

export function getTodayGMT7() {
  const now = new Date();
  // Adjust to GMT+7
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const gmt7Date = new Date(utc + (3600000 * 7));
  return gmt7Date.toISOString().split("T")[0];
}

export function formatDateGMT7(dateInput, includeTime = false) {
  if (!dateInput) return "-";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const options = {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {})
    };

    const formatted = new Intl.DateTimeFormat("id-ID", options).format(d);
    return includeTime ? `${formatted} WIB` : formatted;
  } catch (err) {
    return String(dateInput);
  }
}
