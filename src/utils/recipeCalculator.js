/**
 * Recipe Calculator Utility for Growmass
 * Computes multi-tier splicing trees, base ingredients tally,
 * and project phases.
 */

/**
 * Calculate total base and intermediate materials needed for a given recipe tree and target quantity
 */
export function calculateTreeRequirements(treeNode, targetQuantity = 1000) {
  const baseRequirements = {};
  const intermediateRequirements = {};
  const tierMap = {};

  function traverse(node, quantity, depth = 0) {
    if (!node) return;

    const currentTier = depth;
    if (!tierMap[currentTier]) {
      tierMap[currentTier] = [];
    }

    if (node.isBase) {
      baseRequirements[node.item] = (baseRequirements[node.item] || 0) + quantity;
      return;
    }

    if (node.ingredients && node.ingredients.length === 2) {
      const [ingA, ingB] = node.ingredients;
      
      // Each splice of target needs 1 of ingA and 1 of ingB
      if (node.item !== treeNode.item) {
        intermediateRequirements[node.item] = (intermediateRequirements[node.item] || 0) + quantity;
      }

      tierMap[currentTier].push({
        item: node.item,
        quantity,
        ingA: ingA.item,
        ingB: ingB.item,
        growTime: node.growTime || 0,
        growTimeFormatted: node.growTimeFormatted || "-"
      });

      traverse(ingA, quantity, depth + 1);
      traverse(ingB, quantity, depth + 1);
    }
  }

  traverse(treeNode, Number(targetQuantity));

  return {
    targetItem: treeNode.item,
    targetQuantity: Number(targetQuantity),
    baseRequirements,
    intermediateRequirements,
    tierMap
  };
}

/**
 * Generate default checklist workflow stages for a mass project based on recipe
 */
export function generateProjectStages(recipe, targetQuantity = 1000) {
  if (recipe && Array.isArray(recipe.stages) && recipe.stages.length > 0) {
    return recipe.stages.map((s) => ({ ...s, completed: false }));
  }

  if (recipe && Array.isArray(recipe.splices) && recipe.splices.length > 0) {
    return recipe.splices.map((sp, idx) => ({
      id: `stage-${Date.now()}-${idx + 1}`,
      title: `${idx + 1}. ${sp.branch || `Membuat ${sp.result || "Item"}`}`,
      description: `• Splicing ${sp.itemA || "?"} + ${sp.itemB || "?"} → ${sp.result || "?"}`,
      completed: false,
      notes: ""
    }));
  }

  const stages = [
    {
      id: "stage-1-cactus",
      title: "1. Membuat Kaktus",
      description: "• Campurkan Danger Sign dan Rock Background untuk mendapatkan Death Spike.\n• Campurkan Death Spike dengan Boost untuk mendapatkan Cactus.",
      completed: false,
      notes: ""
    },
    {
      id: "stage-2-bathtub",
      title: "2. Membuat Bathtub",
      description: "• Campurkan Creepy Sign dan Brown Block untuk mendapatkan Toilet.\n• Campurkan Toilet dan White Block untuk mendapatkan Bathtub.",
      completed: false,
      notes: ""
    },
    {
      id: "stage-3-plumbing",
      title: "3. Membuat Plumbing",
      description: "• Campurkan Bathtub dengan Green Block untuk menghasilkan Plumbing.",
      completed: false,
      notes: ""
    },
    {
      id: "stage-4-toxic-waste",
      title: "4. Membuat Toxic Waste Barrel",
      description: "• Campurkan Plumbing dengan Cactus untuk mendapatkan Acid.\n• Campurkan Acid dengan Barrel Block untuk mendapatkan Toxic Waste Barrel.",
      completed: false,
      notes: ""
    },
    {
      id: "stage-5-final-science",
      title: "5. Finalisasi (Science Station)",
      description: "• Campurkan Toxic Waste Barrel dengan Military Radio untuk mendapatkan Science Station.",
      completed: false,
      notes: ""
    }
  ];

  return stages;
}

/**
 * Formats a duration in seconds into human-readable text (e.g. "3d 14h 20m")
 */
export function formatSeconds(seconds) {
  if (!seconds || seconds <= 0) return "Ready";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (days === 0 && hours === 0 && minutes === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}
