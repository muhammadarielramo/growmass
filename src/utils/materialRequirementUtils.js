/**
 * Utility functions for calculating project material requirements,
 * purchased progress, and shortages (Kurang Berapa Bahan A/B).
 */

/**
 * Normalizes item names for flexible comparison (e.g. "Danger Sign Seed" matches "Danger Sign")
 */
export function normalizeItemKey(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/\s*seed\s*$/i, "")
    .replace(/\s+/g, " ");
}

/**
 * Computes detailed requirement vs purchase progress & shortages for a project
 * @param {Array} materialRequirements - Array of { id, name, targetQuantity, unit, branch, notes }
 * @param {Array} materials - Array of recorded purchases { id, name, quantity, unit, ... }
 */
export function calculateMaterialShortages(materialRequirements = [], materials = []) {
  const reqList = Array.isArray(materialRequirements) ? materialRequirements : [];
  const purchaseList = Array.isArray(materials) ? materials : [];

  // Group purchases by normalized name
  const purchasedMap = {};
  const originalNameMap = {};

  purchaseList.forEach((m) => {
    const key = normalizeItemKey(m.name);
    const qty = Number(m.quantity || 0);
    purchasedMap[key] = (purchasedMap[key] || 0) + qty;
    if (!originalNameMap[key]) {
      originalNameMap[key] = m.name;
    }
  });

  // Process explicitly defined requirements
  const handledKeys = new Set();
  const results = reqList.map((req, idx) => {
    const key = normalizeItemKey(req.name);
    handledKeys.add(key);

    const targetQty = Number(req.targetQuantity || 0);
    const purchasedQty = purchasedMap[key] || 0;
    const shortageQty = Math.max(0, targetQty - purchasedQty);
    const excessQty = Math.max(0, purchasedQty - targetQty);
    const percentage = targetQty > 0 ? Math.min(100, Math.round((purchasedQty / targetQty) * 100)) : (purchasedQty > 0 ? 100 : 0);
    const isFulfilled = purchasedQty >= targetQty && targetQty > 0;

    return {
      id: req.id || `req-${idx}`,
      name: req.name,
      targetQuantity: targetQty,
      purchasedQuantity: purchasedQty,
      shortageQuantity: shortageQty,
      excessQuantity: excessQty,
      percentage,
      isFulfilled,
      unit: req.unit || "pcs",
      branch: req.branch || "-",
      notes: req.notes || ""
    };
  });

  // Also include purchases that don't have explicit targets (optional tracking)
  purchaseList.forEach((m, idx) => {
    const key = normalizeItemKey(m.name);
    if (!handledKeys.has(key)) {
      handledKeys.add(key);
      const purchasedQty = purchasedMap[key] || 0;
      results.push({
        id: `untracked-${idx}`,
        name: m.name,
        targetQuantity: 0,
        purchasedQuantity: purchasedQty,
        shortageQuantity: 0,
        excessQuantity: purchasedQty,
        percentage: 100,
        isFulfilled: true,
        isUntracked: true,
        unit: m.unit || "pcs",
        branch: m.branch || "-",
        notes: m.notes || ""
      });
    }
  });

  // Overall summary metrics
  const trackedItems = results.filter((r) => !r.isUntracked && r.targetQuantity > 0);
  const totalTrackedItems = trackedItems.length;
  const fulfilledItemsCount = trackedItems.filter((r) => r.isFulfilled).length;
  const pendingItemsCount = totalTrackedItems - fulfilledItemsCount;

  const totalTargetQtySum = trackedItems.reduce((sum, r) => sum + r.targetQuantity, 0);
  const totalPurchasedForTrackedSum = trackedItems.reduce((sum, r) => sum + Math.min(r.purchasedQuantity, r.targetQuantity), 0);
  const totalShortageQtySum = trackedItems.reduce((sum, r) => sum + r.shortageQuantity, 0);

  const overallPercentage = totalTargetQtySum > 0
    ? Math.min(100, Math.round((totalPurchasedForTrackedSum / totalTargetQtySum) * 100))
    : (fulfilledItemsCount === totalTrackedItems && totalTrackedItems > 0 ? 100 : 0);

  return {
    items: results,
    trackedItems,
    totalTrackedItems,
    fulfilledItemsCount,
    pendingItemsCount,
    totalTargetQtySum,
    totalPurchasedForTrackedSum,
    totalShortageQtySum,
    overallPercentage
  };
}

/**
 * Generate default requirement targets based on project splices or existing materials
 */
export function generateDefaultRequirementsFromProject(project) {
  if (!project) return [];

  // If already has defined materialRequirements, return them
  if (Array.isArray(project.materialRequirements) && project.materialRequirements.length > 0) {
    return project.materialRequirements;
  }

  // Otherwise, if project has recorded materials, derive initial targets from them
  if (Array.isArray(project.materials) && project.materials.length > 0) {
    return project.materials.map((m, idx) => ({
      id: `req-init-${idx + 1}`,
      name: m.name,
      targetQuantity: Number(m.quantity || 0),
      unit: m.unit || "pcs",
      branch: m.branch || "-",
      notes: m.notes || ""
    }));
  }

  // Otherwise from recipe splices
  const splices = project.recipe?.splices || [];
  if (splices.length > 0) {
    const seen = new Set();
    const requirements = [];
    splices.forEach((sp, idx) => {
      [sp.itemA, sp.itemB].forEach((itemName) => {
        if (itemName && !seen.has(normalizeItemKey(itemName))) {
          seen.add(normalizeItemKey(itemName));
          requirements.push({
            id: `req-splice-${idx}-${requirements.length}`,
            name: itemName,
            targetQuantity: 1000,
            unit: "pcs",
            branch: sp.branch || "-",
            notes: `Bahan untuk ${sp.result || "splicing"}`
          });
        }
      });
    });
    return requirements;
  }

  return [];
}
