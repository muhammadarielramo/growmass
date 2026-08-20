import React, { useState } from "react";
import { calculateMaterialShortages } from "../utils/materialRequirementUtils";
import { MaterialRequirementModal } from "./MaterialRequirementModal";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Settings,
  PlusCircle,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Edit3
} from "lucide-react";

export function MaterialShortageTracker({ project, onRecordPurchaseFor = null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const materials = project?.materials || [];
  const requirements = project?.materialRequirements || [];

  const shortageAnalysis = calculateMaterialShortages(requirements, materials);

  return (
    <>
      <div
        className="glass-card"
        style={{
          border: "1px solid var(--border-medium)",
          background: "linear-gradient(135deg, rgba(21, 31, 54, 0.85) 0%, rgba(14, 20, 36, 0.95) 100%)",
          padding: "20px",
          borderRadius: "var(--radius-lg)"
        }}
      >
        {/* Section Header with Quick Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                padding: "8px",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.15)",
                color: "var(--amber-400)"
              }}
            >
              <Target size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0, color: "var(--text-main)" }}>
                  Tracking Kebutuhan & Kekurangan Bahan
                </h3>
                <span
                  className={`badge ${
                    shortageAnalysis.fulfilledItemsCount === shortageAnalysis.totalTrackedItems &&
                    shortageAnalysis.totalTrackedItems > 0
                      ? "badge-emerald"
                      : "badge-amber"
                  }`}
                  style={{ fontSize: "11px" }}
                >
                  {shortageAnalysis.fulfilledItemsCount}/{shortageAnalysis.totalTrackedItems} Bahan Lengkap
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                Kustomisasi target kebutuhan setiap bahan dan pantau sisa kekurangan secara real-time.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 14px", border: "1px solid var(--border-medium)" }}
          >
            <Settings size={14} color="var(--amber-400)" />
            <span>Kustomisasi Target Butuh</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              marginBottom: "6px",
              fontWeight: "600"
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>
              Total Terpenuhi:{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {shortageAnalysis.totalPurchasedForTrackedSum.toLocaleString()} / {shortageAnalysis.totalTargetQtySum.toLocaleString()}
              </strong>
            </span>
            <span
              style={{
                color:
                  shortageAnalysis.overallPercentage === 100
                    ? "var(--emerald-400)"
                    : "var(--amber-400)",
                fontWeight: "700"
              }}
            >
              {shortageAnalysis.overallPercentage}% Selesai
              {shortageAnalysis.totalShortageQtySum > 0 && (
                <span style={{ color: "var(--rose-400)", marginLeft: "8px", fontWeight: "600" }}>
                  (Kurang {shortageAnalysis.totalShortageQtySum.toLocaleString()} lagi)
                </span>
              )}
            </span>
          </div>

          <div
            style={{
              height: "8px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "999px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${shortageAnalysis.overallPercentage}%`,
                background:
                  shortageAnalysis.overallPercentage === 100
                    ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
                    : "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
                borderRadius: "999px",
                transition: "width 0.4s ease"
              }}
            />
          </div>
        </div>

        {/* Breakdown Items List */}
        {shortageAnalysis.items.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "12px"
            }}
          >
            {shortageAnalysis.items.map((item) => {
              const hasTarget = item.targetQuantity > 0;
              return (
                <div
                  key={item.id}
                  style={{
                    background: item.isFulfilled && hasTarget
                      ? "rgba(16, 185, 129, 0.06)"
                      : "var(--bg-surface)",
                    border: item.isFulfilled && hasTarget
                      ? "1px solid rgba(16, 185, 129, 0.25)"
                      : "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "8px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start"
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "13px",
                          color: "var(--text-main)"
                        }}
                      >
                        {item.name}
                      </div>
                    </div>

                    {/* Shortage Status Badge */}
                    <div>
                      {hasTarget ? (
                        item.shortageQuantity > 0 ? (
                          <span
                            className="badge badge-rose font-mono"
                            style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px" }}
                          >
                            Kurang {item.shortageQuantity.toLocaleString()}
                          </span>
                        ) : (
                          <span
                            className="badge badge-emerald font-mono"
                            style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px" }}
                          >
                            Lengkap ✓ {item.excessQuantity > 0 ? `(+${item.excessQuantity.toLocaleString()})` : ""}
                          </span>
                        )
                      ) : (
                        <span
                          className="badge badge-neutral font-mono"
                          style={{ fontSize: "11px", padding: "3px 8px" }}
                        >
                          {item.purchasedQuantity.toLocaleString()} (Terbeli)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stats */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px"
                    }}
                  >
                    <div style={{ color: "var(--text-muted)" }}>
                      <span>Butuh: </span>
                      <strong style={{ color: "var(--amber-400)" }} className="font-mono">
                        {hasTarget ? item.targetQuantity.toLocaleString() : "-"}
                      </strong>
                    </div>

                    <div style={{ color: "var(--text-muted)" }}>
                      <span>Terbeli: </span>
                      <strong
                        style={{
                          color: item.isFulfilled ? "var(--emerald-400)" : "var(--cyan-400)"
                        }}
                        className="font-mono"
                      >
                        {item.purchasedQuantity.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Mini Progress Bar */}
                  {hasTarget && (
                    <div
                      style={{
                        height: "4px",
                        background: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "999px",
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${item.percentage}%`,
                          background: item.isFulfilled ? "var(--emerald-500)" : "var(--amber-500)",
                          borderRadius: "999px"
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "24px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--border-subtle)",
              color: "var(--text-muted)",
              fontSize: "13px"
            }}
          >
            Belum ada ketentuan target bahan untuk projek ini. Klik <strong>"Kustomisasi Target Butuh"</strong> untuk menentukan kebutuhan bahan.
          </div>
        )}
      </div>

      {/* Modal to Customize Target Quantities */}
      <MaterialRequirementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={project}
      />
    </>
  );
}
