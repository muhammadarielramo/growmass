/**
 * Project Status Helpers for Growmass
 * Standardized to 3 clear statuses: Not Started, In Progress, Completed
 */

export const PROJECT_STATUSES = [
  { id: "not_started", label: "Not Started" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" }
];

export function formatStatusKey(status) {
  if (!status) return "not_started";
  const s = status.toLowerCase().replace(/[\s-]/g, "_");
  if (s === "completed") return "completed";
  if (["in_progress", "splicing", "sourcing", "planting", "harvesting", "selling", "active"].includes(s)) {
    return "in_progress";
  }
  return "not_started";
}

export function formatStatusLabel(status) {
  const key = formatStatusKey(status);
  switch (key) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "not_started":
    default:
      return "Not Started";
  }
}
