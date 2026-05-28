"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { MapPin, ChevronDown, X } from "lucide-react";
import { COLOMBIA_CITIES } from "@/lib/colombia-cities";

interface Props {
  value: string;
  onChange: (ciudad: string, departamento: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CityAutocomplete({ value, onChange, placeholder = "Ciudad", className = "" }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Sync external value → input text
  useEffect(() => { setQuery(value); }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COLOMBIA_CITIES.slice(0, 8);
    return COLOMBIA_CITIES.filter((c) =>
      c.ciudad.toLowerCase().includes(q) ||
      c.departamento.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [query]);

  // Position dropdown using fixed coords to escape any overflow:hidden ancestor
  const updateDropdownPos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  const openDropdown = useCallback(() => {
    updateDropdownPos();
    setOpen(true);
  }, [updateDropdownPos]);

  const select = useCallback((ciudad: string, departamento: string) => {
    setQuery(ciudad);
    onChange(ciudad, departamento);
    setOpen(false);
  }, [onChange]);

  const clear = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery("");
    onChange("", "");
    openDropdown();
    inputRef.current?.focus();
  }, [onChange, openDropdown]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Check if click is inside the dropdown portal
        const portal = document.getElementById("city-autocomplete-portal");
        if (portal && portal.contains(e.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const handler = () => updateDropdownPos();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, updateDropdownPos]);

  const dropdown = open && (
    <ul
      id="city-autocomplete-portal"
      style={dropdownStyle}
      className="bg-white border border-noir-gray-2 rounded shadow-xl max-h-52 overflow-y-auto"
    >
      {filtered.length > 0 ? filtered.map((c) => (
        <li key={`${c.ciudad}-${c.departamento}`}>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); select(c.ciudad, c.departamento); }}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#f5f5f5] transition-colors"
          >
            <span className="text-sm font-medium">{c.ciudad}</span>
            <span className="text-[10px] text-noir-gray-4 ml-2 flex-shrink-0">{c.departamento}</span>
          </button>
        </li>
      )) : (
        <li className="px-4 py-3 text-xs text-noir-gray-4 text-center">
          No se encontró &quot;{query}&quot;
        </li>
      )}
    </ul>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); openDropdown(); }}
          onFocus={openDropdown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full border border-noir-gray-2 rounded pl-8 pr-8 py-[10px] text-sm outline-none focus:border-noir-black transition-colors bg-white"
        />
        {query ? (
          <button type="button" onMouseDown={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-gray-3 hover:text-noir-black transition-colors">
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-gray-3 pointer-events-none" />
        )}
      </div>

      {mounted && createPortal(dropdown, document.body)}
    </div>
  );
}
