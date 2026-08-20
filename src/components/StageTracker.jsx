import React, { useState } from "react";
import { useProjects } from "../context/ProjectContext";
import { formatDateGMT7 } from "../utils/dateUtils";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Save,
  Clock,
  ListTodo,
  Layers,
  Calendar
} from "lucide-react";

export function StageTracker({ project }) {
  const { toggleStage, updateStage, addStage, deleteStage } = useProjects();
  const [newStageTitle, setNewStageTitle] = useState("");
  const [newStageDesc, setNewStageDesc] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStageId, setEditingStageId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState("");

  const stages = project.stages || [];
  const completedCount = stages.filter((s) => s.completed).length;
  const totalCount = stages.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleToggle = (stageId) => {
    const stage = stages.find((s) => s.id === stageId);
    if (stage && !stage.completed && completedCount + 1 === totalCount) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }
    }
    toggleStage(project.id, stageId);
  };

  const handleAddStage = (e) => {
    e.preventDefault();
    if (!newStageTitle.trim()) return;
    addStage(project.id, {
      title: newStageTitle,
      description: newStageDesc
    });
    setNewStageTitle("");
    setNewStageDesc("");
    setShowAddForm(false);
  };

  const handleStartEditStage = (stage) => {
    setEditingStageId(stage.id);
    setEditTitle(stage.title);
    setEditDesc(stage.description || "");
  };

  const handleSaveStage = (stageId) => {
    updateStage(project.id, stageId, {
      title: editTitle.trim(),
      description: editDesc.trim()
    });
    setEditingStageId(null);
  };

  const handleStartEditNote = (stage) => {
    setEditingNoteId(stage.id);
    setNoteText(stage.notes || "");
  };

  const handleSaveNote = (stageId) => {
    updateStage(project.id, stageId, { notes: noteText });
    setEditingNoteId(null);
    setNoteText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Progress Overview Header */}
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(21, 31, 54, 0.75) 0%, rgba(14, 20, 36, 0.85) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ListTodo size={20} color="var(--emerald-400)" />
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Alur Kerja & Tahapan Splicing</h2>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              Ikuti dan centang setiap tahap penggabungan bahan sesuai alur produksi massing Anda.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="badge badge-emerald" style={{ fontSize: "14px", padding: "6px 14px" }}>
              {completedCount} / {totalCount} Selesai ({progressPercent}%)
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ fontSize: "13px", padding: "6px 12px" }}
            >
              <Plus size={16} /> Tambah Tahap
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-track" style={{ height: "10px" }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Add Stage Form */}
      {showAddForm && (
        <form onSubmit={handleAddStage} className="glass-card" style={{ border: "1px solid var(--emerald-500)", animation: "fadeIn 0.2s ease" }}>
          <h3 style={{ fontSize: "15px", marginBottom: "12px", color: "var(--emerald-400)" }}>
            Tambah Langkah / Tahap Kustom
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Judul Tahap</label>
              <input
                type="text"
                placeholder="Contoh: 6. Panen & Jual"
                value={newStageTitle}
                onChange={(e) => setNewStageTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Deskripsi / Formula Splice (Bisa Multi-baris)</label>
              <textarea
                placeholder="Contoh: • Campurkan Bahan A dan Bahan B untuk menghasilkan C."
                value={newStageDesc}
                onChange={(e) => setNewStageDesc(e.target.value)}
                className="form-textarea"
                rows="2"
              />
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Simpan Tahap
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Checklist List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {stages.map((stage, idx) => {
          const isEditingStage = editingStageId === stage.id;
          const isEditingNote = editingNoteId === stage.id;

          return (
            <div
              key={stage.id || idx}
              className="glass-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                borderLeft: stage.completed ? "4px solid var(--emerald-500)" : "4px solid var(--border-medium)",
                background: stage.completed ? "rgba(16, 185, 129, 0.06)" : "var(--bg-glass-card)",
                transition: "all 0.2s ease",
                padding: "16px 20px"
              }}
            >
              {isEditingStage ? (
                /* Edit Stage Form */
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="form-input"
                    style={{ fontWeight: "700" }}
                    placeholder="Judul Tahap"
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="form-textarea"
                    rows="3"
                    placeholder="Deskripsi langkah atau formula splice..."
                  />
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary" onClick={() => setEditingStageId(null)} style={{ fontSize: "12px", padding: "6px 12px" }}>
                      Batal
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSaveStage(stage.id)} style={{ fontSize: "12px", padding: "6px 12px" }}>
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Stage View */
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  {/* Checkbox & Title */}
                  <div
                    onClick={() => handleToggle(stage.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    <div style={{
                      marginTop: "2px",
                      color: stage.completed ? "var(--emerald-400)" : "var(--text-dim)",
                      transition: "transform 0.15s ease"
                    }}>
                      {stage.completed ? (
                        <CheckCircle2 size={24} color="var(--emerald-400)" />
                      ) : (
                        <Circle size={24} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <h4 style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: stage.completed ? "var(--emerald-300)" : "var(--text-main)",
                          textDecoration: stage.completed ? "line-through" : "none"
                        }}>
                          {stage.title}
                        </h4>
                        {stage.completed && (
                          <span className="badge badge-emerald" style={{ fontSize: "10px", padding: "2px 6px" }}>
                            SELESAI ✓
                          </span>
                        )}
                      </div>

                      {stage.description && (
                        <p style={{
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          marginTop: "6px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-line"
                        }}>
                          {stage.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      className="btn-icon"
                      onClick={() => handleStartEditStage(stage)}
                      title="Edit Judul & Formula"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => (isEditingNote ? handleSaveNote(stage.id) : handleStartEditNote(stage))}
                      title={isEditingNote ? "Simpan Catatan" : "Tambah/Edit Catatan"}
                    >
                      <Save size={13} color={stage.notes ? "var(--amber-400)" : undefined} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => deleteStage(project.id, stage.id)}
                      title="Hapus Tahap"
                      style={{ color: "var(--rose-400)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Stage Notes Section */}
              {isEditingNote ? (
                <div style={{ marginTop: "6px", display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Tulis catatan pengerjaan tahap ini (misal: selesai 5000 biji di world A)..."
                    className="form-input"
                    style={{ fontSize: "12px", padding: "6px 10px" }}
                    autoFocus
                  />
                  <button className="btn btn-primary" onClick={() => handleSaveNote(stage.id)} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Simpan
                  </button>
                </div>
              ) : (
                stage.notes && (
                  <div style={{
                    fontSize: "12px",
                    background: "rgba(0, 0, 0, 0.25)",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    color: "var(--amber-300)",
                    borderLeft: "3px solid var(--amber-400)",
                    marginTop: "4px"
                  }}>
                    <strong>Catatan:</strong> {stage.notes}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
