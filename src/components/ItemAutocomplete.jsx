import React, { useState, useRef, useEffect, useMemo } from "react";
import growtopiaItems from "../data/growtopiaItems.json";
import { ItemIcon, getItemData } from "./ItemIcon";
import { Search, ChevronDown, Check, Sparkles } from "lucide-react";

export function ItemAutocomplete({
  value,
  onChange,
  placeholder = "Ketik atau pilih item...",
  required = false,
  autoFocus = false,
  className = "",
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return growtopiaItems.slice(0, 30);
    }
    const q = query.toLowerCase().trim();
    const matches = growtopiaItems.filter((item) =>
      item.name.toLowerCase().includes(q) || (item.category && item.category.toLowerCase().includes(q))
    );
    // Sort exact prefix matches first
    matches.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });
    return matches.slice(0, 40);
  }, [query]);

  const selectedItemData = getItemData(query);

  const handleSelect = (item) => {
    setQuery(item.name);
    onChange(item.name, item);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val, getItemData(val));
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", ...style }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {/* Item Icon Preview inside input */}
        <div style={{ position: "absolute", left: "10px", display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 2 }}>
          <ItemIcon name={query} size={22} />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          className={`form-input ${className}`}
          style={{
            paddingLeft: "40px",
            paddingRight: "32px",
            width: "100%",
            fontSize: "14px",
            fontWeight: "600"
          }}
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "absolute",
            right: "8px",
            background: "none",
            border: "none",
            color: "var(--text-dim)",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            maxHeight: "260px",
            overflowY: "auto",
            zIndex: 1000,
            animation: "fadeIn 0.15s ease-out"
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
              Tidak menemukan item di database. Anda tetap dapat menggunakan nama custom "<strong>{query}</strong>".
            </div>
          ) : (
            <div style={{ padding: "4px" }}>
              {filteredItems.map((item) => {
                const isCurrent = query.toLowerCase().trim() === item.name.toLowerCase().trim();
                return (
                  <div
                    key={item.id || item.name}
                    onClick={() => handleSelect(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      background: isCurrent ? "rgba(16, 185, 129, 0.18)" : "transparent",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = "var(--bg-surface-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <ItemIcon name={item.name} image={item.image} size={24} />
                      <span style={{ fontSize: "13px", fontWeight: isCurrent ? "700" : "600", color: isCurrent ? "var(--emerald-400)" : "var(--text-main)" }}>
                        {item.name}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {item.category && (
                        <span className="badge badge-neutral" style={{ fontSize: "10px", padding: "1px 5px" }}>
                          {item.category}
                        </span>
                      )}
                      {isCurrent && <Check size={14} color="var(--emerald-400)" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
