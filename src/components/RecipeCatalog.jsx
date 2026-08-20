import React, { useState } from "react";
import { DEFAULT_RECIPES } from "../data/defaultRecipes";
import {
  BookOpen,
  Search,
  Layers,
  Sparkles,
  GitFork,
  ArrowRight,
  PlusCircle,
  Package
} from "lucide-react";

export function RecipeCatalog({ isOpen, onClose, onStartProjectFromRecipe }) {
  const [activeRecipeDetail, setActiveRecipeDetail] = useState(DEFAULT_RECIPES[0]);

  if (!isOpen) return null;

  const splices = activeRecipeDetail?.splices || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={20} color="var(--emerald-400)" />
            <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Template Resep Massing Science Station</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "24px" }}>
          {/* Main Info */}
          <div className="glass-card" style={{
            background: "var(--bg-glass-card)",
            border: "1px solid var(--border-medium)"
          }}>
            <div style={{ marginBottom: "8px" }}>
              <span className="badge badge-emerald" style={{ marginBottom: "4px" }}>
                {activeRecipeDetail.category}
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>{activeRecipeDetail.name}</h2>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              {activeRecipeDetail.description}
            </p>
          </div>

          {/* Splicing Formula Box */}
          <div style={{
            background: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "16px"
          }}>
            <div style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700", marginBottom: "10px" }}>
              Formula Splicing Akhir (Final Combination)
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <span className="badge badge-cyan" style={{ fontSize: "13px", padding: "6px 12px" }}>
                {activeRecipeDetail.recipeA} Seed
              </span>

              <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--emerald-400)" }}>+</span>

              <span className="badge badge-purple" style={{ fontSize: "13px", padding: "6px 12px" }}>
                {activeRecipeDetail.recipeB} Seed
              </span>

              <ArrowRight size={18} color="var(--emerald-400)" />

              <span className="badge badge-emerald" style={{ fontSize: "13px", padding: "6px 12px", fontWeight: "800" }}>
                {activeRecipeDetail.name} Seed
              </span>
            </div>
          </div>

          {/* 5 Splicing Stages Overview */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px", color: "var(--text-main)" }}>
              Daftar Formula Splicing ({splices.length} Pasangan):
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
              {splices.map((sp) => (
                <div
                  key={sp.id}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--amber-400)", fontWeight: "600" }}>
                      {sp.branch}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--cyan-300)" }}>{sp.itemA}</span>
                      <span style={{ color: "var(--text-dim)" }}>+</span>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--purple-300)" }}>{sp.itemB}</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--emerald-400)" }}>
                      {sp.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onStartProjectFromRecipe(activeRecipeDetail);
              onClose();
            }}
          >
            <PlusCircle size={16} />
            <span>Mulai Projek Massing Science Station</span>
          </button>
        </div>
      </div>
    </div>
  );
}
