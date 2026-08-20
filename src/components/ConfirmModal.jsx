import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  message = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  confirmText = "Ya, Hapus",
  cancelText = "Batal",
  danger = true
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "440px",
          border: danger ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-medium)",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.8)"
        }}
      >
        <div className="modal-header" style={{ borderBottom: "1px solid var(--border-subtle)", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                padding: "8px",
                borderRadius: "10px",
                background: danger ? "rgba(244, 63, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
                color: danger ? "var(--rose-400)" : "var(--amber-400)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {danger ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--text-main)" }}>
              {title}
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "20px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        <div
          className="modal-footer"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px"
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ fontSize: "13px", padding: "8px 16px" }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={danger ? "btn btn-danger" : "btn btn-primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              fontSize: "13px",
              padding: "8px 18px",
              background: danger ? "var(--rose-500)" : undefined,
              borderColor: danger ? "var(--rose-500)" : undefined,
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {danger && <Trash2 size={14} />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
