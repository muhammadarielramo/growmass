import React, { useState } from "react";
import growtopiaItems from "../data/growtopiaItems.json";
import { getVerifiedItemImage } from "../data/growtopiaSprites";
import { BASE_SEED_COLORS } from "../data/defaultRecipes";
import { Package, Sparkles } from "lucide-react";

// Fast lookup map from json
const itemsLookup = new Map();
growtopiaItems.forEach((item) => {
  if (item.name) {
    itemsLookup.set(item.name.toLowerCase().trim(), item);
    const clean = item.name.toLowerCase().replace(/ (seed|seeds|block|blocks)$/i, "").trim();
    if (!itemsLookup.has(clean)) {
      itemsLookup.set(clean, item);
    }
  }
});

export function getItemData(itemName) {
  if (!itemName) return null;
  const key = itemName.toLowerCase().trim();
  const verifiedImg = getVerifiedItemImage(itemName);
  if (verifiedImg) {
    return { name: itemName, image: verifiedImg };
  }

  if (itemsLookup.has(key)) return itemsLookup.get(key);
  const cleanKey = key.replace(/ (seed|seeds|block|blocks)$/i, "").trim();
  if (itemsLookup.has(cleanKey)) return itemsLookup.get(cleanKey);
  return null;
}

export function ItemIcon({ name, image, size = 28, style = {} }) {
  const [imgError, setImgError] = useState(false);

  const verifiedUrl = getVerifiedItemImage(name);
  const itemData = getItemData(name);
  const resolvedImg = verifiedUrl || image || itemData?.image;

  const cleanName = (name || "").toLowerCase().replace(/ (seed|seeds|block|blocks)$/i, "").trim();
  const seedColor = BASE_SEED_COLORS[cleanName] || BASE_SEED_COLORS[name] || "#10b981";

  if (resolvedImg && !imgError) {
    return (
      <img
        src={resolvedImg}
        alt={name || "Item"}
        onError={() => setImgError(true)}
        loading="lazy"
        crossOrigin="anonymous"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: "contain",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          imageRendering: "pixelated",
          flexShrink: 0,
          borderRadius: "4px",
          ...style
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "6px",
        background: `linear-gradient(135deg, ${seedColor} 0%, rgba(0,0,0,0.7) 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        color: "#ffffff",
        fontSize: size > 26 ? "11px" : "9px",
        fontWeight: "800",
        flexShrink: 0,
        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
        ...style
      }}
      title={name}
    >
      {name ? name.replace(/ (seed|block)$/i, "").slice(0, 2).toUpperCase() : <Package size={size * 0.5} />}
    </div>
  );
}
