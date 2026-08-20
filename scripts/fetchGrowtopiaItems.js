import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchGrowtopiaItems() {
  console.log("Fetching items from Growtopia Fandom MediaWiki API...");
  const itemsMap = new Map();

  // Categories to crawl
  const categories = [
    "Seeds",
    "Grindable",
    "Consumables",
    "Items",
    "Tools",
    "Science",
    "Farmable",
    "Building Blocks"
  ];

  for (const cat of categories) {
    try {
      console.log(`Fetching category: ${cat}...`);
      let gcmcontinue = null;
      for (let page = 0; page < 3; page++) {
        const url = `https://growtopia.fandom.com/api.php?action=query&generator=categorymembers&gcmtitle=Category:${encodeURIComponent(cat)}&gcmnamespace=0&gcmlimit=100&prop=pageimages|info&pithumbsize=64&format=json` + (gcmcontinue ? `&gcmcontinue=${encodeURIComponent(gcmcontinue)}` : "");
        const res = await fetch(url, { headers: { "User-Agent": "GrowmassScraper/1.0" } });
        const data = await res.json();
        if (!data.query || !data.query.pages) break;

        for (const p of Object.values(data.query.pages)) {
          if (p.title && !p.title.includes("Category:") && !p.title.includes("Template:")) {
            const cleanTitle = p.title.replace(/ \((Seed|Block|Tree|Item)\)/gi, "");
            if (!itemsMap.has(cleanTitle)) {
              itemsMap.set(cleanTitle, {
                id: cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "_"),
                name: cleanTitle,
                category: cat,
                image: p.thumbnail?.source || null,
                url: p.fullurl || `https://growtopia.fandom.com/wiki/${encodeURIComponent(p.title)}`
              });
            }
          }
        }

        if (!data.continue || !data.continue.gcmcontinue) break;
        gcmcontinue = data.continue.gcmcontinue;
      }
    } catch (err) {
      console.error(`Error fetching category ${cat}:`, err.message);
    }
  }

  // Also fetch all pages starting from A to Z with thumbnails
  try {
    let gapcontinue = null;
    for (let i = 0; i < 5; i++) {
      const url = `https://growtopia.fandom.com/api.php?action=query&generator=allpages&gapnamespace=0&gaplimit=200&prop=pageimages&pithumbsize=64&format=json` + (gapcontinue ? `&gapcontinue=${encodeURIComponent(gapcontinue)}` : "");
      const res = await fetch(url, { headers: { "User-Agent": "GrowmassScraper/1.0" } });
      const data = await res.json();
      if (!data.query || !data.query.pages) break;

      for (const p of Object.values(data.query.pages)) {
        if (p.thumbnail && p.thumbnail.source) {
          const cleanTitle = p.title.replace(/ \((Seed|Block|Tree|Item)\)/gi, "");
          if (!itemsMap.has(cleanTitle) && !cleanTitle.includes("Category:") && !cleanTitle.includes("Template:") && !cleanTitle.includes("User:")) {
            itemsMap.set(cleanTitle, {
              id: cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "_"),
              name: cleanTitle,
              category: cleanTitle.toLowerCase().includes("seed") ? "Seeds" : "Items",
              image: p.thumbnail.source,
              url: `https://growtopia.fandom.com/wiki/${encodeURIComponent(p.title)}`
            });
          }
        }
      }

      if (!data.continue || !data.continue.gapcontinue) break;
      gapcontinue = data.continue.gapcontinue;
    }
  } catch (err) {
    console.error("Error fetching allpages:", err.message);
  }

  // Ensure all our primary Science Station & Massing items exist with high-quality icons
  const curatedKeyItems = [
    { name: "Science Station", category: "Science", image: "https://static.wikia.nocookie.net/growtopia/images/2/22/Science_Station.png/revision/latest/scale-to-width-down/64" },
    { name: "Toxic Waste Barrel", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/e/e6/Toxic_Waste_Barrel.png/revision/latest/scale-to-width-down/64" },
    { name: "Military Radio", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/1/15/Military_Radio.png/revision/latest/scale-to-width-down/64" },
    { name: "Danger Sign", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/8/87/Danger_Sign.png/revision/latest/scale-to-width-down/64" },
    { name: "Rock Background", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/1/19/Rock_Background.png/revision/latest/scale-to-width-down/64" },
    { name: "Dead Spike", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/4/4c/Death_Spikes.png/revision/latest/scale-to-width-down/64" },
    { name: "Bush", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/2/23/Bush.png/revision/latest/scale-to-width-down/64" },
    { name: "Cactus", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/1/11/Cactus.png/revision/latest/scale-to-width-down/64" },
    { name: "Crappy Sign", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/b/bc/Crappy_Sign.png/revision/latest/scale-to-width-down/64" },
    { name: "Brown Block", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/f/f6/Brown_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Toilet", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/3/30/Toilet.png/revision/latest/scale-to-width-down/64" },
    { name: "White Block", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/c/c2/White_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Bathtub", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/1/19/Bathtub.png/revision/latest/scale-to-width-down/64" },
    { name: "Green Block", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/7/7b/Green_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Plumbing", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/7/70/Plumbing.png/revision/latest/scale-to-width-down/64" },
    { name: "Acid", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/5/5a/Acid.png/revision/latest/scale-to-width-down/64" },
    { name: "Barrel Block", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/3/30/Barrel.png/revision/latest/scale-to-width-down/64" },
    { name: "Barrel", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/3/30/Barrel.png/revision/latest/scale-to-width-down/64" },
    { name: "Orange Block", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/7/76/Orange_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Biohazard Sign", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/6/63/Biohazard_Sign.png/revision/latest/scale-to-width-down/64" },
    { name: "Piano Note", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/6/67/Sheet_Music_Blank.png/revision/latest/scale-to-width-down/64" },
    { name: "Sheet Music: Sharp Piano", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/f/fe/Sheet_Music_Sharp_Piano.png/revision/latest/scale-to-width-down/64" },
    { name: "Fuel Pack", category: "Alat Operasional", image: "https://static.wikia.nocookie.net/growtopia/images/0/05/Fuel_Pack.png/revision/latest/scale-to-width-down/64" },
    { name: "Mining Explosive", category: "Alat Operasional", image: "https://static.wikia.nocookie.net/growtopia/images/9/91/Mining_Explosive.png/revision/latest/scale-to-width-down/64" },
    { name: "Cave Blast", category: "Alat Operasional", image: "https://static.wikia.nocookie.net/growtopia/images/d/df/Cave_Blast.png/revision/latest/scale-to-width-down/64" },
    { name: "World Lock", category: "Locks", image: "https://static.wikia.nocookie.net/growtopia/images/a/a2/World_Lock.png/revision/latest/scale-to-width-down/64" },
    { name: "Diamond Lock", category: "Locks", image: "https://static.wikia.nocookie.net/growtopia/images/c/c5/Diamond_Lock.png/revision/latest/scale-to-width-down/64" },
    { name: "Blue Gem Lock", category: "Locks", image: "https://static.wikia.nocookie.net/growtopia/images/0/00/Blue_Gem_Lock.png/revision/latest/scale-to-width-down/64" },
    { name: "Dirt", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/2/23/Dirt.png/revision/latest/scale-to-width-down/64" },
    { name: "Cave Dirt", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/0/0d/Cave_Dirt.png/revision/latest/scale-to-width-down/64" },
    { name: "Rock", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/6/67/Rock.png/revision/latest/scale-to-width-down/64" },
    { name: "Lava", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/b/b3/Lava.png/revision/latest/scale-to-width-down/64" },
    { name: "Water", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/f/f6/Water.png/revision/latest/scale-to-width-down/64" },
    { name: "Grass", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/d/d7/Grass.png/revision/latest/scale-to-width-down/64" },
    { name: "Wood", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/7/7b/Wood_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Sand", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/d/df/Sand.png/revision/latest/scale-to-width-down/64" },
    { name: "Door", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/4/4b/Main_Door.png/revision/latest/scale-to-width-down/64" },
    { name: "Glass Pane", category: "Bibit Dasar", image: "https://static.wikia.nocookie.net/growtopia/images/e/e0/Glass_Pane.png/revision/latest/scale-to-width-down/64" },
    { name: "Wooden Block", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/4/4f/Wooden_Platform.png/revision/latest/scale-to-width-down/64" },
    { name: "Display Box", category: "Building", image: "https://static.wikia.nocookie.net/growtopia/images/9/90/Display_Box.png/revision/latest/scale-to-width-down/64" },
    { name: "Fish Tank", category: "Farmable", image: "https://static.wikia.nocookie.net/growtopia/images/a/a2/Fish_Tank.png/revision/latest/scale-to-width-down/64" },
    { name: "Chandelier", category: "Farmable", image: "https://static.wikia.nocookie.net/growtopia/images/7/7d/Chandelier.png/revision/latest/scale-to-width-down/64" },
    { name: "Laser Grid", category: "Farmable", image: "https://static.wikia.nocookie.net/growtopia/images/7/70/Laser_Grid.png/revision/latest/scale-to-width-down/64" },
    { name: "Pepper Tree", category: "Farmable", image: "https://static.wikia.nocookie.net/growtopia/images/4/4e/Pepper_Tree.png/revision/latest/scale-to-width-down/64" },
    { name: "Portcullis", category: "Building", image: "https://static.wikia.nocookie.net/growtopia/images/b/b3/Portcullis.png/revision/latest/scale-to-width-down/64" },
    { name: "Purple Block", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/5/52/Purple_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Red Block", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/3/36/Red_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Blue Block", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/1/1b/Blue_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Yellow Block", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/d/da/Yellow_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Iron Block", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/2/23/Iron_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Steel Block", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/b/be/Steel_Block.png/revision/latest/scale-to-width-down/64" },
    { name: "Solar Panel", category: "Intermediate", image: "https://static.wikia.nocookie.net/growtopia/images/a/a2/Solar_Panel.png/revision/latest/scale-to-width-down/64" },
    { name: "Robotic Arm", category: "Science", image: "https://static.wikia.nocookie.net/growtopia/images/a/ae/Robotic_Arm.png/revision/latest/scale-to-width-down/64" },
    { name: "Harvester", category: "Tools", image: "https://static.wikia.nocookie.net/growtopia/images/7/7b/Harvester.png/revision/latest/scale-to-width-down/64" },
    { name: "Magplant 5000", category: "Tools", image: "https://static.wikia.nocookie.net/growtopia/images/a/a2/Magplant_5000.png/revision/latest/scale-to-width-down/64" },
    { name: "Unstable Tesseract", category: "Tools", image: "https://static.wikia.nocookie.net/growtopia/images/6/6b/Unstable_Tesseract.png/revision/latest/scale-to-width-down/64" },
    { name: "Rayman's Fist", category: "Tools", image: "https://static.wikia.nocookie.net/growtopia/images/e/ef/Rayman%27s_Fist.png/revision/latest/scale-to-width-down/64" }
  ];

  for (const item of curatedKeyItems) {
    itemsMap.set(item.name, {
      id: item.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      name: item.name,
      category: item.category,
      image: item.image,
      url: `https://growtopia.fandom.com/wiki/${encodeURIComponent(item.name)}`
    });

    // Also include Seed variant for seedable items
    if (!item.name.toLowerCase().includes("seed") && !["World Lock", "Diamond Lock", "Blue Gem Lock", "Fuel Pack", "Mining Explosive", "Cave Blast", "Harvester", "Magplant 5000", "Unstable Tesseract", "Rayman's Fist"].includes(item.name)) {
      const seedName = `${item.name} Seed`;
      if (!itemsMap.has(seedName)) {
        itemsMap.set(seedName, {
          id: seedName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          name: seedName,
          category: "Seeds",
          image: item.image,
          url: `https://growtopia.fandom.com/wiki/${encodeURIComponent(item.name)}`
        });
      }
    }
  }

  const itemsList = Array.from(itemsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  console.log(`Total collected items: ${itemsList.length}`);

  const outputPath = path.resolve(__dirname, "../src/data/growtopiaItems.json");
  fs.writeFileSync(outputPath, JSON.stringify(itemsList, null, 2), "utf8");
  console.log(`Saved database to ${outputPath}`);
}

fetchGrowtopiaItems();
