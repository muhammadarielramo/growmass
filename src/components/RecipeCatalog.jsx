import React, { useState, useEffect, useMemo } from "react";
import { useProjects } from "../context/ProjectContext";
import { RecipeEditorModal } from "./RecipeEditorModal";
import {
  BookOpen,
  Search,
  Layers,
  Sparkles,
  GitFork,
  ArrowRight,
  PlusCircle,
  Edit2,
  Trash2,
  Package,
  Plus,
  Info
} from "lucide-react";

export function RecipeCatalog({ isOpen, onClose, onStartProjectFromRecipe }) {
  const { recipes, deleteRecipe } = useProjects();

  const [activeRecipeId, setActiveRecipeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState(null);

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes || [];
    const q = searchQuery.toLowerCase().trim();
    return (recipes || []).filter((r) =>
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  }, [recipes, searchQuery]);

  // Keep activeRecipe aligned with existing recipes
  const activeRecipe = useMemo(() => {
    if (!recipes || recipes.length === 0) return null;
    const found = recipes.find((r) => r.id === activeRecipeId);
    return found || filteredRecipes[0] || recipes[0];
  }, [recipes, activeRecipeId, filteredRecipes]);

  useEffect(() => {
    if (isOpen && (!activeRecipeId || !recipes.some((r) => r.id === activeRecipeId))) {
      if (recipes && recipes.length > 0) {
        setActiveRecipeId(recipes[0].id);
      }
    }
  }, [isOpen, recipes, activeRecipeId]);

  if (!isOpen) return null;

  const splices = activeRecipe?.splices || [];

  const handleOpenAdd = () => {
    setRecipeToEdit(null);
    setShowEditorModal(true);
  };

  const handleOpenEdit = (recipe) => {
    setRecipeToEdit(recipe);
    setShowEditorModal(true);
  };

  const handleDelete = (recipeId, recipeName) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus resep "${recipeName}"?`)) {
      deleteRecipe(recipeId);
    }
  };

  const handleSaveSuccess = (savedRecipe) => {
    if (savedRecipe?.id) {
      setActiveRecipeId(savedRecipe.id);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "860px" }}
        >
          <div className="modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={20} color="var(--emerald-400)" />
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Katalog & Template Resep Massing</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenAdd}
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                <Plus size={14} />
                <span>Tambah Resep Baru</span>
              </button>
              <button className="btn-icon" onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          <div
            className="modal-body"
            style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "20px 24px" }}
          >
            {/* Top Bar: Search & Recipe Pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-dim)",
                      pointerEvents: "none"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Cari resep massing..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: "34px", fontSize: "13px", height: "36px" }}
                  />
                </div>
              </div>

              {/* Recipe Selector Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "4px"
                }}
              >
                {filteredRecipes.map((rec) => {
                  const isSelected = activeRecipe?.id === rec.id;
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => setActiveRecipeId(rec.id)}
                      className={`badge ${isSelected ? "badge-emerald" : "badge-neutral"}`}
                      style={{
                        cursor: "pointer",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: isSelected ? "700" : "500",
                        border: isSelected
                          ? "1px solid var(--emerald-500)"
                          : "1px solid var(--border-subtle)",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {rec.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeRecipe ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Active Recipe Header Card */}
                <div
                  className="glass-card"
                  style={{
                    background: "var(--bg-glass-card)",
                    border: "1px solid var(--border-medium)",
                    padding: "16px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}
                  >
                    <div>
                      <h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0, color: "var(--text-main)" }}>
                        {activeRecipe.name}
                      </h2>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", marginBottom: 0 }}>
                        {activeRecipe.description || "Formula & alur tahapan splicing massing"}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleOpenEdit(activeRecipe)}
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        title="Edit Resep Ini"
                      >
                        <Edit2 size={13} />
                        <span>Edit Resep</span>
                      </button>

                      {recipes.length > 1 && (
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDelete(activeRecipe.id, activeRecipe.name)}
                          style={{ color: "var(--rose-400)", padding: "6px" }}
                          title="Hapus Resep"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Final Splicing Formula Box */}
                {(activeRecipe.recipeA || activeRecipe.recipeB) && (
                  <div
                    style={{
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "14px 16px"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-dim)",
                        textTransform: "uppercase",
                        fontWeight: "700",
                        marginBottom: "8px"
                      }}
                    >
                      Formula Splicing Akhir (Final Combination)
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        flexWrap: "wrap"
                      }}
                    >
                      <span className="badge badge-cyan" style={{ fontSize: "13px", padding: "6px 12px" }}>
                        {activeRecipe.recipeA || "?"} Seed
                      </span>

                      <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--emerald-400)" }}>
                        +
                      </span>

                      <span className="badge badge-purple" style={{ fontSize: "13px", padding: "6px 12px" }}>
                        {activeRecipe.recipeB || "?"} Seed
                      </span>

                      <ArrowRight size={18} color="var(--emerald-400)" />

                      <span
                        className="badge badge-emerald"
                        style={{ fontSize: "13px", padding: "6px 12px", fontWeight: "800" }}
                      >
                        {activeRecipe.name} Seed
                      </span>
                    </div>
                  </div>
                )}

                {/* Splicing Steps List */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px"
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>
                      Daftar Formula Splicing ({splices.length} Pasangan):
                    </div>
                  </div>

                  {splices.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "10px",
                        maxHeight: "260px",
                        overflowY: "auto"
                      }}
                    >
                      {splices.map((sp, idx) => (
                        <div
                          key={sp.id || idx}
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
                              {sp.branch || `Tahap ${idx + 1}`}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginTop: "4px"
                              }}
                            >
                              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--cyan-300)" }}>
                                {sp.itemA}
                              </span>
                              <span style={{ color: "var(--text-dim)" }}>+</span>
                              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--purple-300)" }}>
                                {sp.itemB}
                              </span>
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
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        background: "var(--bg-surface)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px dashed var(--border-subtle)",
                        color: "var(--text-muted)",
                        fontSize: "13px"
                      }}
                    >
                      Belum ada langkah splicing pada resep ini. Klik "Edit Resep" untuk menambahkan tahapan.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                Tidak ada resep yang cocok dengan pencarian.
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Tutup
            </button>
            {activeRecipe && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onStartProjectFromRecipe(activeRecipe);
                  onClose();
                }}
              >
                <PlusCircle size={16} />
                <span>Mulai Projek Massing {activeRecipe.name}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Recipe Modal */}
      <RecipeEditorModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        initialRecipe={recipeToEdit}
        onSaveSuccess={handleSaveSuccess}
      />
    </>
  );
}
