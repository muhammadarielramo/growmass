/**
 * Storage and default initial state for Growmass
 * Clean architecture with real Science Station project, GMT+7 dates,
 * and exact standardized item names as requested.
 */
import { getTodayGMT7 } from "./dateUtils";

const STORAGE_KEYS = {
  PROJECTS: "growmass_projects",
  CURRENCY_CONFIG: "growmass_currency_config",
  ACTIVE_PROJECT_ID: "growmass_active_project_id",
};

const todayGMT7 = getTodayGMT7();

export const INITIAL_REAL_PROJECTS = [
  {
    id: "proj-science-station-real",
    name: "Massing Science Station",
    targetItem: "Science Station",
    targetQuantity: 6830,
    unit: "Seeds",
    status: "in_progress",
    worldName: "MASSLAB01",
    storageWorld: "STORECHEM01",
    notes: "Projek massing Science Station skala besar. Formula: Danger Sign + Rock Background -> Death Spike; Death Spike + Boost -> Cactus; Creepy Sign + Brown Block -> Toilet; Toilet + White Block -> Bathtub; Bathtub + Green Block -> Plumbing; Plumbing + Cactus -> Acid; Acid + Barrel Block -> Toxic Waste Barrel; Toxic Waste Barrel + Military Radio -> Science Station.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdDateGMT7: todayGMT7,
    // Splice Tree with Quantities, Rates, and Output Yields
    recipe: {
      id: "science_station_custom",
      name: "Science Station",
      category: "Consumable / Science",
      description: "Science Station = Toxic Waste Barrel Seed + Military Radio Seed",
      splices: [
        {
          id: "sp-1",
          branch: "1. Membuat Kaktus",
          itemA: "Danger Sign",
          qtyA: 10200,
          rateTypeA: "item_per_wl",
          rateValueA: 35,
          rateDisplayA: "35/WL",
          costWLA: 291,
          itemB: "Rock Background",
          qtyB: 10200,
          rateTypeB: "item_per_wl",
          rateValueB: 28,
          rateDisplayB: "28/WL",
          costWLB: 365,
          result: "Death Spike",
          qtyResult: 10200
        },
        {
          id: "sp-2",
          branch: "1. Membuat Kaktus",
          itemA: "Death Spike",
          qtyA: 8100,
          rateTypeA: "item_per_wl",
          rateValueA: 0,
          rateDisplayA: "Hasil Splice",
          costWLA: 0,
          itemB: "Boost",
          qtyB: 8100,
          rateTypeB: "item_per_wl",
          rateValueB: 23,
          rateDisplayB: "23/WL",
          costWLB: 350,
          result: "Cactus",
          qtyResult: 8100
        },
        {
          id: "sp-3",
          branch: "2. Membuat Bathtub",
          itemA: "Creepy Sign",
          qtyA: 7500,
          rateTypeA: "item_per_wl",
          rateValueA: 25,
          rateDisplayA: "25/WL",
          costWLA: 300,
          itemB: "Brown Block",
          qtyB: 7500,
          rateTypeB: "item_per_wl",
          rateValueB: 25,
          rateDisplayB: "25/WL",
          costWLB: 300,
          result: "Toilet",
          qtyResult: 7500
        },
        {
          id: "sp-4",
          branch: "2. Membuat Bathtub",
          itemA: "Toilet",
          qtyA: 7470,
          rateTypeA: "item_per_wl",
          rateValueA: 0,
          rateDisplayA: "Hasil Splice",
          costWLA: 0,
          itemB: "White Block",
          qtyB: 7470,
          rateTypeB: "item_per_wl",
          rateValueB: 25,
          rateDisplayB: "25/WL",
          costWLB: 300,
          result: "Bathtub",
          qtyResult: 7470
        },
        {
          id: "sp-5",
          branch: "3. Membuat Plumbing",
          itemA: "Bathtub",
          qtyA: 7470,
          rateTypeA: "item_per_wl",
          rateValueA: 0,
          rateDisplayA: "Hasil Splice",
          costWLA: 0,
          itemB: "Green Block",
          qtyB: 7800,
          rateTypeB: "item_per_wl",
          rateValueB: 25,
          rateDisplayB: "25/WL",
          costWLB: 315,
          result: "Plumbing",
          qtyResult: 7470
        },
        {
          id: "sp-6",
          branch: "4. Membuat Toxic Waste Barrel",
          itemA: "Plumbing",
          qtyA: 7350,
          rateTypeA: "item_per_wl",
          rateValueA: 0,
          rateDisplayA: "Hasil Splice",
          costWLA: 0,
          itemB: "Cactus",
          qtyB: 7350,
          rateTypeB: "item_per_wl",
          rateValueB: 0,
          rateDisplayB: "Hasil Splice",
          costWLB: 0,
          result: "Acid",
          qtyResult: 7350
        },
        {
          id: "sp-7",
          branch: "4. Membuat Toxic Waste Barrel",
          itemA: "Acid",
          qtyA: 7350,
          rateTypeA: "item_per_wl",
          rateValueA: 0,
          rateDisplayA: "Hasil Splice",
          costWLA: 0,
          itemB: "Barrel Block",
          qtyB: 7350,
          rateTypeB: "item_per_wl",
          rateValueB: 19,
          rateDisplayB: "19/WL",
          costWLB: 380,
          result: "Toxic Waste Barrel",
          qtyResult: 7350
        },
        {
          id: "sp-8",
          branch: "Cabang Military Radio",
          itemA: "Orange Block",
          qtyA: 7812,
          rateTypeA: "item_per_wl",
          rateValueA: 24,
          rateDisplayA: "24/WL",
          costWLA: 330,
          itemB: "Danger Sign",
          qtyB: 7820,
          rateTypeB: "item_per_wl",
          rateValueB: 35,
          rateDisplayB: "35/WL",
          costWLB: 224,
          result: "Biohazard Sign",
          qtyResult: 7812
        },
        {
          id: "sp-9",
          branch: "Cabang Military Radio",
          itemA: "Piano Note",
          qtyA: 5720,
          rateTypeA: "item_per_wl",
          rateValueA: 14,
          rateDisplayA: "14/WL",
          costWLA: 410,
          itemB: "Death Spike",
          qtyB: 2100,
          rateTypeB: "item_per_wl",
          rateValueB: 0,
          rateDisplayB: "Hasil Splice",
          costWLA: 0,
          result: "Sheet Music: Sharp Piano",
          qtyResult: 2100
        },
        {
          id: "sp-10",
          branch: "Cabang Military Radio",
          itemA: "Biohazard Sign",
          qtyA: 2100,
          rateTypeA: "item_per_wl",
          rateValueA: 0,
          rateDisplayA: "Hasil Splice",
          costWLA: 0,
          itemB: "Sheet Music: Sharp Piano",
          qtyB: 2100,
          rateTypeB: "item_per_wl",
          rateValueB: 0,
          rateDisplayB: "Hasil Splice",
          costWLB: 0,
          result: "Military Radio",
          qtyResult: 2100
        },
        {
          id: "sp-11",
          branch: "5. Finalisasi (Science Station)",
          itemA: "Toxic Waste Barrel",
          qtyA: 7350,
          rateTypeA: "item_per_wl",
          rateValueA: 0,
          rateDisplayA: "Hasil Splice",
          costWLA: 0,
          itemB: "Military Radio",
          qtyB: 70,
          rateTypeB: "item_per_wl",
          rateValueB: 2,
          rateDisplayB: "2/WL",
          costWLB: 35,
          result: "Science Station",
          qtyResult: 6830
        }
      ]
    },
    // 14 Real Purchased Materials with exact corrected names
    materials: [
      {
        id: "mat-1",
        name: "Danger Sign seed",
        category: "Bibit Dasar",
        branch: "Cabang Kaktus & Biohazard",
        quantity: 18020,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 35,
        rateDisplay: "35/WL",
        totalWL: 515,
        date: todayGMT7,
        notes: "10.200 untuk Kaktus (Death Spike) + 7.820 untuk Biohazard Sign"
      },
      {
        id: "mat-2",
        name: "Rock Background seed",
        category: "Bibit Dasar",
        branch: "Cabang Kaktus (Death Spike)",
        quantity: 10200,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 28,
        rateDisplay: "28/WL",
        totalWL: 365,
        date: todayGMT7,
        notes: "Displice dengan Danger Sign untuk Death Spike"
      },
      {
        id: "mat-3",
        name: "Boost seed",
        category: "Bibit Dasar",
        branch: "Cabang Kaktus (Cactus)",
        quantity: 8100,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 23,
        rateDisplay: "23/WL",
        totalWL: 350,
        date: todayGMT7,
        notes: "Displice dengan Death Spike untuk membuat Cactus"
      },
      {
        id: "mat-4",
        name: "Creepy Sign seed",
        category: "Bibit Dasar",
        branch: "Cabang Bathtub (Toilet)",
        quantity: 7500,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 25,
        rateDisplay: "25/WL",
        totalWL: 300,
        date: todayGMT7,
        notes: "Displice dengan Brown Block untuk Toilet"
      },
      {
        id: "mat-5",
        name: "Brown Block seed",
        category: "Bibit Dasar",
        branch: "Cabang Bathtub (Toilet)",
        quantity: 7500,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 25,
        rateDisplay: "25/WL",
        totalWL: 300,
        date: todayGMT7,
        notes: "Displice dengan Creepy Sign untuk Toilet"
      },
      {
        id: "mat-6",
        name: "White Block seed",
        category: "Bibit Dasar",
        branch: "Cabang Bathtub (Bathtub)",
        quantity: 7470,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 25,
        rateDisplay: "25/WL",
        totalWL: 300,
        date: todayGMT7,
        notes: "Displice dengan Toilet untuk Bathtub"
      },
      {
        id: "mat-7",
        name: "Green Block seed",
        category: "Bibit Dasar",
        branch: "Cabang Plumbing",
        quantity: 7800,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 25,
        rateDisplay: "25/WL",
        totalWL: 315,
        date: todayGMT7,
        notes: "Displice dengan Bathtub untuk Plumbing"
      },
      {
        id: "mat-8",
        name: "Barrel Block seed",
        category: "Bibit Dasar",
        branch: "Cabang Toxic Waste Barrel",
        quantity: 7350,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 19,
        rateDisplay: "19/WL",
        totalWL: 380,
        date: todayGMT7,
        notes: "Displice dengan Acid untuk Toxic Waste Barrel"
      },
      {
        id: "mat-9",
        name: "Piano Note seed",
        category: "Bibit Dasar",
        branch: "Cabang Military Radio (Sharp Piano)",
        quantity: 5720,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 14,
        rateDisplay: "14/WL",
        totalWL: 410,
        date: todayGMT7,
        notes: "Displice dengan Death Spike untuk Sharp Piano"
      },
      {
        id: "mat-10",
        name: "Orange Block seed",
        category: "Bibit Dasar",
        branch: "Cabang Military Radio (Biohazard)",
        quantity: 7812,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 24,
        rateDisplay: "24/WL",
        totalWL: 330,
        date: todayGMT7,
        notes: "Displice dengan Danger Sign untuk Biohazard Sign"
      },
      {
        id: "mat-11",
        name: "Military Radio seed",
        category: "Bibit Tambahan",
        branch: "Cabang Military Radio (Instan)",
        quantity: 70,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 2,
        rateDisplay: "2/WL",
        totalWL: 35,
        date: todayGMT7,
        notes: "70 biji instan siap splice final"
      },
      {
        id: "mat-12",
        name: "Fuel Pack",
        category: "Alat Operasional",
        branch: "Operasional Panen",
        quantity: 3696,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 2.7,
        rateDisplay: "2.7/WL",
        totalWL: 1350,
        date: todayGMT7,
        notes: "Bahan bakar Harvester saat panen pohon"
      },
      {
        id: "mat-13",
        name: "Mining Explosive",
        category: "Alat Operasional",
        branch: "Pemecah Blok",
        quantity: 2656,
        unit: "pcs",
        rateType: "item_per_wl",
        rateValue: 4.25,
        rateDisplay: "4.25/WL",
        totalWL: 625,
        date: todayGMT7,
        notes: "Mempermudah pemecahan blok hasil panen"
      },
      {
        id: "mat-14",
        name: "Cave Blast",
        category: "Alat Operasional",
        branch: "Persiapan World",
        quantity: 10,
        unit: "pcs",
        rateType: "wl_per_item",
        rateValue: 1.6,
        rateDisplay: "1.6 WL/item",
        totalWL: 16,
        date: todayGMT7,
        notes: "Persiapan world massing"
      }
    ],
    // 5 Exact Stages with exact names as requested by user
    stages: [
      {
        id: "stage-1-cactus",
        title: "1. Membuat Kaktus",
        description: "• Campurkan Danger Sign dan Rock Background untuk mendapatkan Death Spike.\n• Campurkan Death Spike dengan Boost untuk mendapatkan Cactus.",
        completed: false,
        notes: "",
        date: todayGMT7
      },
      {
        id: "stage-2-bathtub",
        title: "2. Membuat Bathtub",
        description: "• Campurkan Creepy Sign dan Brown Block untuk mendapatkan Toilet.\n• Campurkan Toilet dan White Block untuk mendapatkan Bathtub.",
        completed: false,
        notes: "",
        date: todayGMT7
      },
      {
        id: "stage-3-plumbing",
        title: "3. Membuat Plumbing",
        description: "• Campurkan Bathtub dengan Green Block untuk menghasilkan Plumbing.",
        completed: false,
        notes: "",
        date: todayGMT7
      },
      {
        id: "stage-4-toxic-waste",
        title: "4. Membuat Toxic Waste Barrel",
        description: "• Campurkan Plumbing dengan Cactus untuk mendapatkan Acid.\n• Campurkan Acid dengan Barrel Block untuk mendapatkan Toxic Waste Barrel.",
        completed: false,
        notes: "",
        date: todayGMT7
      },
      {
        id: "stage-5-final-science",
        title: "5. Finalisasi (Science Station)",
        description: "• Campurkan Toxic Waste Barrel dengan Military Radio untuk mendapatkan Science Station.",
        completed: false,
        notes: "",
        date: todayGMT7
      }
    ],
    // Flexible Capital Ledger
    ledger: {
      capital: [],
      expenses: [
        {
          id: "exp-sci-init",
          date: todayGMT7,
          category: "seeds",
          note: "Pembelian 14 Bahan & Alat Massing Science Station",
          amountWL: 5591,
          quantity: 93714,
          unitPrice: "55 DL 91 WL"
        }
      ],
      revenues: []
    }
  }
];

export const INITIAL_SAMPLE_PROJECTS = INITIAL_REAL_PROJECTS;

export function loadProjectsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => {
          const s = (p.status || "").toLowerCase();
          let normalizedStatus = "not_started";
          if (s === "completed") normalizedStatus = "completed";
          else if (["in_progress", "splicing", "sourcing", "planting", "harvesting", "selling", "active"].includes(s)) {
            normalizedStatus = "in_progress";
          }
          return {
            ...p,
            status: normalizedStatus
          };
        });
      }
    }
  } catch (err) {
    console.error("Failed to load projects from storage", err);
  }
  return INITIAL_REAL_PROJECTS;
}

export function saveProjectsToStorage(projects) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error("Failed to save projects to storage", err);
  }
}

export function loadCurrencyConfigFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENCY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load currency config", err);
  }
  return {
    idrPerDl: 3500,
    wlPerDl: 100,
    dlPerBgl: 100
  };
}

export function saveCurrencyConfigToStorage(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error("Failed to save currency config", err);
  }
}
