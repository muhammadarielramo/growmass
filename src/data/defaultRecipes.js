/**
 * Growtopia Single Project Template: Science Station Massing
 */

export const DEFAULT_RECIPES = [
  {
    id: "science_station",
    name: "Science Station",
    category: "Science / Consumable",
    rarity: 45,
    itemSeed: "Science Station Seed",
    itemBlock: "Science Station",
    description: "Target utama Science Station dibuat dari kombinasi: Toxic Waste Barrel Seed + Military Radio Seed.",
    recipeA: "Toxic Waste Barrel",
    recipeB: "Military Radio",
    splices: [
      { id: "sp-1", itemA: "Danger Sign", itemB: "Rock Background", result: "Death Spike", branch: "1. Membuat Kaktus" },
      { id: "sp-2", itemA: "Death Spike", itemB: "Boost", result: "Cactus", branch: "1. Membuat Kaktus" },
      { id: "sp-3", itemA: "Creepy Sign", itemB: "Brown Block", result: "Toilet", branch: "2. Membuat Bathtub" },
      { id: "sp-4", itemA: "Toilet", itemB: "White Block", result: "Bathtub", branch: "2. Membuat Bathtub" },
      { id: "sp-5", itemA: "Bathtub", itemB: "Green Block", result: "Plumbing", branch: "3. Membuat Plumbing" },
      { id: "sp-6", itemA: "Plumbing", itemB: "Cactus", result: "Acid", branch: "4. Membuat Toxic Waste Barrel" },
      { id: "sp-7", itemA: "Acid", itemB: "Barrel Block", result: "Toxic Waste Barrel", branch: "4. Membuat Toxic Waste Barrel" },
      { id: "sp-8", itemA: "Orange Block", itemB: "Danger Sign", result: "Biohazard Sign", branch: "Cabang Military Radio" },
      { id: "sp-9", itemA: "Piano Note", itemB: "Death Spike", result: "Sheet Music: Sharp Piano", branch: "Cabang Military Radio" },
      { id: "sp-10", itemA: "Biohazard Sign", itemB: "Sheet Music: Sharp Piano", result: "Military Radio", branch: "Cabang Military Radio" },
      { id: "sp-11", itemA: "Toxic Waste Barrel", itemB: "Military Radio", result: "Science Station", branch: "5. Finalisasi (Science Station)" }
    ],
    stages: [
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
    ]
  }
];

export const BASE_SEED_COLORS = {
  "Danger Sign": "#ef4444",
  "Rock Background": "#71717a",
  "Death Spike": "#dc2626",
  "Dead Spike": "#dc2626",
  "Boost": "#15803d",
  "Bush": "#15803d",
  "Cactus": "#22c55e",
  "Creepy Sign": "#a16207",
  "Crappy Sign": "#a16207",
  "Brown Block": "#5c4033",
  "Toilet": "#d97706",
  "White Block": "#e2e8f0",
  "Bathtub": "#38bdf8",
  "Green Block": "#10b981",
  "Plumbing": "#0284c7",
  "Acid": "#84cc16",
  "Barrel Block": "#78350f",
  "Barrel": "#78350f",
  "Toxic Waste Barrel": "#15803d",
  "Orange Block": "#f97316",
  "Biohazard Sign": "#ea580c",
  "Piano Note": "#6366f1",
  "Sheet Music: Sharp Piano": "#818cf8",
  "Military Radio": "#059669",
  "Science Station": "#8b5cf6"
};
