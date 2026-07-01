"use client";
import { useState, useRef } from "react";
import type { SearchResult } from "./api/search/route";

// ─── Part data ────────────────────────────────────────────────────────────────

interface CPUPart  { id: string; name: string; price: number; tier: string; socket: string; perfScore: number; specs: string; }
interface GPUPart  { id: string; name: string; price: number; tier: string; vram: number; perfScore: number; specs: string; lengthMm: number; powerW: number; }
interface MoboPart { id: string; name: string; price: number; tier: string; specs: string; socket: string; formFactor: "ATX" | "mATX" | "ITX"; }
interface CasePart { id: string; name: string; price: number; tier: string; specs: string; supportedFormFactors: string[]; maxGpuMm: number; }
interface PSUPart  { id: string; name: string; price: number; tier: string; specs: string; watts: number; }
interface SimplePart { id: string; name: string; price: number; tier: string; specs: string; }
type AnyPart = CPUPart | GPUPart | MoboPart | CasePart | PSUPart | SimplePart;

const CPUS: CPUPart[] = [
  { id: "r5-7600",   name: "AMD Ryzen 5 7600",     price: 219, tier: "budget", socket: "AM5",     perfScore: 6,  specs: "6C/12T · 65W · AM5" },
  { id: "i5-14600k", name: "Intel Core i5-14600K", price: 249, tier: "budget", socket: "LGA1700", perfScore: 7,  specs: "14C/20T · 125W · LGA1700" },
  { id: "r7-7700x",  name: "AMD Ryzen 7 7700X",    price: 299, tier: "mid",    socket: "AM5",     perfScore: 8,  specs: "8C/16T · 105W · AM5" },
  { id: "i7-14700k", name: "Intel Core i7-14700K", price: 359, tier: "mid",    socket: "LGA1700", perfScore: 9,  specs: "20C/28T · 125W · LGA1700" },
  { id: "r9-7950x",  name: "AMD Ryzen 9 7950X",    price: 549, tier: "high",   socket: "AM5",     perfScore: 10, specs: "16C/32T · 170W · AM5" },
  { id: "i9-14900k", name: "Intel Core i9-14900K", price: 499, tier: "high",   socket: "LGA1700", perfScore: 10, specs: "24C/32T · 125W · LGA1700" },
];
const GPUS: GPUPart[] = [
  { id: "rx6600",     name: "AMD RX 6600",              price: 179, tier: "budget", vram: 8,  perfScore: 4,  specs: "8 GB · 1080p",       lengthMm: 240, powerW: 132 },
  { id: "rtx4060",    name: "NVIDIA RTX 4060",          price: 299, tier: "budget", vram: 8,  perfScore: 6,  specs: "8 GB · 1080p/1440p", lengthMm: 240, powerW: 115 },
  { id: "rx7600",     name: "AMD RX 7600",              price: 269, tier: "budget", vram: 8,  perfScore: 5,  specs: "8 GB · 1080p",       lengthMm: 215, powerW: 165 },
  { id: "rtx4060ti",  name: "NVIDIA RTX 4060 Ti",       price: 399, tier: "mid",   vram: 16, perfScore: 7,  specs: "16 GB · 1440p",      lengthMm: 240, powerW: 165 },
  { id: "rx7700xt",   name: "AMD RX 7700 XT",           price: 349, tier: "mid",   vram: 12, perfScore: 7,  specs: "12 GB · 1440p",      lengthMm: 267, powerW: 245 },
  { id: "rtx4070",    name: "NVIDIA RTX 4070",          price: 549, tier: "mid",   vram: 12, perfScore: 8,  specs: "12 GB · 1440p/4K",   lengthMm: 285, powerW: 200 },
  { id: "rx7800xt",   name: "AMD RX 7800 XT",           price: 449, tier: "mid",   vram: 16, perfScore: 8,  specs: "16 GB · 1440p/4K",   lengthMm: 276, powerW: 263 },
  { id: "rtx4070tis", name: "NVIDIA RTX 4070 Ti Super", price: 799, tier: "high",  vram: 16, perfScore: 9,  specs: "16 GB · 4K",         lengthMm: 336, powerW: 285 },
  { id: "rx7900xtx",  name: "AMD RX 7900 XTX",         price: 849, tier: "high",  vram: 24, perfScore: 9,  specs: "24 GB · 4K",         lengthMm: 287, powerW: 355 },
  { id: "rtx4080s",   name: "NVIDIA RTX 4080 Super",    price: 999, tier: "high",  vram: 16, perfScore: 10, specs: "16 GB · 4K",         lengthMm: 336, powerW: 320 },
  { id: "rtx4090",    name: "NVIDIA RTX 4090",          price: 1599,tier: "ultra", vram: 24, perfScore: 10, specs: "24 GB · 4K ultra",   lengthMm: 336, powerW: 450 },
];
const MOTHERBOARDS: MoboPart[] = [
  { id: "b650-plus",  name: "MSI B650 Gaming Plus",     price: 159, tier: "budget", socket: "AM5",     formFactor: "ATX",  specs: "AM5 · DDR5 · PCIe 5.0" },
  { id: "b760-pro",   name: "ASUS Prime B760M-A",       price: 139, tier: "budget", socket: "LGA1700", formFactor: "mATX", specs: "LGA1700 · DDR5 · PCIe 4.0" },
  { id: "x670-f",     name: "ASUS ROG Strix X670E-F",   price: 329, tier: "mid",    socket: "AM5",     formFactor: "ATX",  specs: "AM5 · DDR5 · PCIe 5.0 · WiFi 6E" },
  { id: "z790-edge",  name: "MSI MEG Z790 Edge",        price: 299, tier: "mid",    socket: "LGA1700", formFactor: "ATX",  specs: "LGA1700 · DDR5 · PCIe 5.0 · WiFi 6E" },
  { id: "b650m-itx",  name: "ASRock B650I Lightning",   price: 229, tier: "mid",    socket: "AM5",     formFactor: "ITX",  specs: "AM5 · DDR5 · Mini-ITX" },
  { id: "x670e-hero", name: "ASUS ROG Crosshair X670E", price: 499, tier: "high",   socket: "AM5",     formFactor: "ATX",  specs: "AM5 · DDR5 · Flagship VRM" },
];
const RAMS: SimplePart[] = [
  { id: "ddr5-16",  name: "16 GB DDR5-6000",  price: 59,  tier: "budget", specs: "2×8 GB · DDR5-6000 · CL30" },
  { id: "ddr5-32a", name: "32 GB DDR5-6000",  price: 99,  tier: "mid",    specs: "2×16 GB · DDR5-6000 · CL30" },
  { id: "ddr5-32b", name: "32 GB DDR5-6400",  price: 119, tier: "mid",    specs: "2×16 GB · DDR5-6400 · CL32" },
  { id: "ddr5-64",  name: "64 GB DDR5-6000",  price: 189, tier: "high",   specs: "2×32 GB · DDR5-6000 · CL30" },
];
const STORAGES: SimplePart[] = [
  { id: "ssd-1tb-g3", name: "1 TB NVMe Gen 3 SSD", price: 49,  tier: "budget", specs: "3,500/3,000 MB/s · PCIe 3.0" },
  { id: "ssd-1tb-g4", name: "1 TB NVMe Gen 4 SSD", price: 69,  tier: "budget", specs: "7,000/6,500 MB/s · PCIe 4.0" },
  { id: "ssd-2tb-g4", name: "2 TB NVMe Gen 4 SSD", price: 119, tier: "mid",    specs: "7,000/6,500 MB/s · PCIe 4.0" },
  { id: "ssd-4tb-g4", name: "4 TB NVMe Gen 4 SSD", price: 249, tier: "high",   specs: "7,200/6,900 MB/s · PCIe 4.0" },
];
const PSUS: PSUPart[] = [
  { id: "psu-650g",  name: "Corsair RM650x",              price: 89,  tier: "budget", watts: 650,  specs: "650W · 80+ Gold · Fully modular" },
  { id: "psu-750g",  name: "Seasonic Focus GX-750",       price: 109, tier: "mid",    watts: 750,  specs: "750W · 80+ Gold · Fully modular" },
  { id: "psu-850p",  name: "be quiet! Straight Power 850W", price: 139, tier: "mid",  watts: 850,  specs: "850W · 80+ Platinum · Fully modular" },
  { id: "psu-1000t", name: "Corsair HX1000",              price: 189, tier: "high",   watts: 1000, specs: "1000W · 80+ Titanium · Fully modular" },
];
const CASES: CasePart[] = [
  { id: "h5-flow",  name: "NZXT H5 Flow",             price: 89,  tier: "budget", supportedFormFactors: ["ATX","mATX","ITX"],          maxGpuMm: 365, specs: "Mid-tower · ATX/mATX/ITX · 365mm GPU" },
  { id: "meshify",  name: "Fractal Meshify C",         price: 99,  tier: "budget", supportedFormFactors: ["ATX","mATX","ITX"],          maxGpuMm: 315, specs: "Mid-tower · ATX/mATX/ITX · 315mm GPU" },
  { id: "o11-evo",  name: "Lian Li O11 Dynamic EVO",  price: 169, tier: "mid",    supportedFormFactors: ["ATX","mATX","ITX"],          maxGpuMm: 446, specs: "Mid-tower · ATX/mATX/ITX · 446mm GPU" },
  { id: "define7",  name: "Fractal Design Define 7",   price: 189, tier: "mid",    supportedFormFactors: ["E-ATX","ATX","mATX","ITX"],  maxGpuMm: 491, specs: "Full-tower · E-ATX · 491mm GPU" },
  { id: "nr200p",   name: "Cooler Master NR200P",      price: 99,  tier: "mid",    supportedFormFactors: ["ITX"],                       maxGpuMm: 330, specs: "ITX only · 330mm GPU · Compact" },
  { id: "phanteks", name: "Phanteks Enthoo 719",       price: 219, tier: "high",   supportedFormFactors: ["E-ATX","ATX","mATX","ITX"],  maxGpuMm: 503, specs: "Full-tower · E-ATX · 503mm GPU" },
];
const COOLERS: SimplePart[] = [
  { id: "wraith",    name: "AMD Wraith Stealth (Stock)", price: 0,   tier: "budget", specs: "Included · 65W TDP max" },
  { id: "nh-u12s",   name: "Noctua NH-U12S",             price: 79,  tier: "mid",    specs: "Single-tower · 158mm · Quiet" },
  { id: "nh-d15",    name: "Noctua NH-D15",              price: 99,  tier: "mid",    specs: "Dual-tower · Best air cooling" },
  { id: "kraken240", name: "NZXT Kraken 240 AIO",        price: 109, tier: "mid",    specs: "240mm AIO · 2× 120mm fans" },
  { id: "kraken360", name: "NZXT Kraken 360 AIO",        price: 149, tier: "high",   specs: "360mm AIO · 3× 120mm fans" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ComponentKey = "cpu" | "gpu" | "motherboard" | "ram" | "storage" | "psu" | "case" | "cooler";
interface SelectedParts {
  cpu?: CPUPart; gpu?: GPUPart; motherboard?: MoboPart;
  ram?: SimplePart; storage?: SimplePart; psu?: PSUPart;
  case?: CasePart; cooler?: SimplePart;
}
interface AiBuild {
  cpu: { name: string; price: number; reason: string };
  gpu: { name: string; price: number; reason: string };
  motherboard: { name: string; price: number; reason: string };
  ram: { name: string; price: number; reason: string };
  storage: { name: string; price: number; reason: string };
  psu: { name: string; price: number; reason: string };
  case: { name: string; price: number; reason: string };
  cooler: { name: string; price: number; reason: string };
  totalEstimate: number;
}

// ─── Compatibility ────────────────────────────────────────────────────────────

interface CompatIssue { slot: ComponentKey; msg: string; severity: "error" | "warn" }

function getCompatIssues(s: SelectedParts): CompatIssue[] {
  const issues: CompatIssue[] = [];
  if (s.cpu && s.motherboard && s.cpu.socket !== s.motherboard.socket)
    issues.push({ slot: "motherboard", severity: "error", msg: `Socket mismatch: ${s.cpu.name} needs ${s.cpu.socket}, board is ${s.motherboard.socket}` });
  if (s.motherboard && s.case && !s.case.supportedFormFactors.includes(s.motherboard.formFactor))
    issues.push({ slot: "case", severity: "error", msg: `Case doesn't fit ${s.motherboard.formFactor} boards (supports: ${s.case.supportedFormFactors.join(", ")})` });
  if (s.gpu && s.case) {
    if (s.gpu.lengthMm > s.case.maxGpuMm)
      issues.push({ slot: "gpu", severity: "error", msg: `GPU is ${s.gpu.lengthMm}mm — case max is ${s.case.maxGpuMm}mm` });
    else if (s.gpu.lengthMm > s.case.maxGpuMm - 20)
      issues.push({ slot: "gpu", severity: "warn", msg: `Tight fit — only ${s.case.maxGpuMm - s.gpu.lengthMm}mm clearance` });
  }
  if (s.psu && (s.cpu || s.gpu)) {
    const needed = (s.cpu ? (s.cpu.socket === "AM5" ? 90 : 130) : 0) + (s.gpu?.powerW ?? 0) + 100;
    if (needed > s.psu.watts)
      issues.push({ slot: "psu", severity: "error", msg: `PSU too weak: ~${needed}W needed, ${s.psu.watts}W available` });
    else if (needed > s.psu.watts * 0.85)
      issues.push({ slot: "psu", severity: "warn", msg: `PSU near capacity (~${needed}W / ${s.psu.watts}W)` });
  }
  return issues;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BUDGET_PRESETS = [
  { label: "Budget",    sub: "Entry-level gaming",  value: 700  },
  { label: "Mid-Range", sub: "1440p / streaming",   value: 1300 },
  { label: "High-End",  sub: "4K / content creation", value: 2200 },
];

const COMPONENT_META: Record<ComponentKey, { label: string; icon: string }> = {
  cpu:         { label: "Processor",    icon: "🧠" },
  gpu:         { label: "Graphics Card", icon: "🎮" },
  motherboard: { label: "Motherboard",  icon: "🔌" },
  ram:         { label: "Memory",       icon: "💾" },
  storage:     { label: "Storage",      icon: "💿" },
  psu:         { label: "Power Supply", icon: "⚡" },
  case:        { label: "Case",         icon: "🗄️" },
  cooler:      { label: "CPU Cooler",   icon: "❄️" },
};

const COMPONENT_ORDER: ComponentKey[] = ["cpu", "gpu", "motherboard", "ram", "storage", "psu", "case", "cooler"];

const STATIC_PARTS: Record<ComponentKey, AnyPart[]> = {
  cpu: CPUS, gpu: GPUS, motherboard: MOTHERBOARDS,
  ram: RAMS, storage: STORAGES, psu: PSUS, case: CASES, cooler: COOLERS,
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  budget: { bg: "rgba(16,185,129,0.1)",  text: "#34d399", border: "rgba(16,185,129,0.25)" },
  mid:    { bg: "rgba(99,102,241,0.1)",  text: "#818cf8", border: "rgba(99,102,241,0.25)" },
  high:   { bg: "rgba(168,85,247,0.1)",  text: "#c084fc", border: "rgba(168,85,247,0.25)" },
  ultra:  { bg: "rgba(251,146,60,0.1)",  text: "#fb923c", border: "rgba(251,146,60,0.25)" },
  search: { bg: "rgba(99,102,241,0.1)",  text: "#818cf8", border: "rgba(99,102,241,0.25)" },
};

function gpuPairingNote(gpu: GPUPart, cpu?: CPUPart) {
  if (!cpu) return null;
  const d = gpu.perfScore - cpu.perfScore;
  if (Math.abs(d) <= 1) return { icon: "✦", text: "Well-balanced with your CPU", color: "#34d399" };
  if (d > 1)            return { icon: "↑", text: "GPU-heavy — great for future CPU upgrades", color: "#818cf8" };
  return                       { icon: "!", text: "CPU may bottleneck this GPU", color: "#f59e0b" };
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg:        "#080910",
  surface:   "#0f1117",
  surfaceHi: "#141620",
  border:    "#1c1e2e",
  borderHi:  "#252840",
  text:      "#e8eaf5",
  textMid:   "#9294a8",
  textDim:   "#4b4e6a",
  accent:    "#6366f1",
  accentHi:  "#818cf8",
  grad:      "linear-gradient(135deg, #6366f1, #8b5cf6)",
};

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const c = TIER_COLORS[tier] ?? TIER_COLORS.mid;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 99, textTransform: "capitalize" }}>
      {tier}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
      textTransform: "uppercase", color: T.textMid, marginBottom: 10 }}>
      {children}
    </label>
  );
}

// ─── Part picker modal ────────────────────────────────────────────────────────

function PartModal({ slot, selected, onSelect, onClose }: {
  slot: ComponentKey; selected: SelectedParts;
  onSelect: (p: AnyPart) => void; onClose: () => void;
}) {
  const meta       = COMPONENT_META[slot];
  const staticList = STATIC_PARTS[slot] as AnyPart[];
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(val: string) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(val)}&category=${slot}`);
        setResults(await r.json());
      } finally { setSearching(false); }
    }, 500);
  }

  const showSearch  = query.trim().length > 0;
  const displayList = showSearch ? results : staticList;
  const selectedId  = (selected as any)[slot]?.id;
  const isGpu = slot === "gpu";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
      background: "rgba(4,5,10,0.85)", backdropFilter: "blur(8px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 620,
        maxHeight: "82vh", display: "flex", flexDirection: "column",
        background: T.surface, border: `1px solid ${T.borderHi}`,
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>{meta.icon}</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>{meta.label}</span>
              </div>
              {isGpu && selected.cpu && (
                <p style={{ fontSize: 12, color: T.textMid, marginLeft: 30 }}>Matched to {selected.cpu.name}</p>
              )}
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.surfaceHi, color: T.textMid, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, color: T.textDim, pointerEvents: "none" }}>⌕</span>
            <input autoFocus type="text" value={query} onChange={e => handleSearch(e.target.value)}
              placeholder={`Search Newegg for ${meta.label.toLowerCase()}…`}
              style={{ width: "100%", padding: "10px 14px 10px 38px", background: T.bg,
                border: `1px solid ${T.border}`, borderRadius: 10, color: T.text,
                fontSize: 14, outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s" }}
              onFocus={e => (e.target.style.borderColor = T.accent)}
              onBlur={e => (e.target.style.borderColor = T.border)} />
            {searching && (
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                fontSize: 11, color: T.accent, fontWeight: 600 }}>Searching…</span>
            )}
          </div>


          <div style={{ height: 1, background: T.border, margin: "0 -24px" }} />
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px 16px" }}>
          {displayList.length === 0 && !searching && (
            <div style={{ textAlign: "center", padding: "48px 0", color: T.textDim, fontSize: 14 }}>
              {showSearch ? "No results — try a different search" : "No parts available"}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {displayList.map((part, i) => {
              const isSearchResult = "source" in part;
              const pid  = isSearchResult ? `s-${i}` : (part as AnyPart).id;
              const isSel = !isSearchResult && pid === selectedId;
              const note = isGpu && !isSearchResult ? gpuPairingNote(part as GPUPart, selected.cpu) : null;

              return (
                <button key={pid}
                  onClick={() => {
                    if (isSearchResult) {
                      onSelect({ id: pid, name: part.name, price: part.price, specs: (part as SearchResult).specs, tier: "search" } as AnyPart);
                    } else {
                      onSelect(part as AnyPart);
                    }
                    onClose();
                  }}
                  style={{ textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                    background: isSel ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isSel ? "rgba(99,102,241,0.5)" : T.border}`,
                    transition: "all 0.12s" }}
                  onMouseEnter={e => { if (!isSel) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = T.borderHi; } }}
                  onMouseLeave={e => { if (!isSel) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLElement).style.borderColor = T.border; } }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: "-0.01em" }}>{part.name}</span>
                        {!isSearchResult && <TierBadge tier={(part as AnyPart).tier} />}
                      </div>
                      <p style={{ fontSize: 12, color: T.textMid, margin: 0 }}>{(part as any).specs}</p>
                      {note && (
                        <p style={{ fontSize: 12, fontWeight: 500, marginTop: 6, color: note.color }}>
                          {note.icon} {note.text}
                        </p>
                      )}
                      {isSearchResult && (
                        <a href={(part as SearchResult).url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: 11, color: T.accent, textDecoration: "none", marginTop: 4, display: "inline-block" }}>
                          View on Newegg ↗
                        </a>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>${(part as any).price}</div>
                      {isSel && <div style={{ fontSize: 11, color: T.accent, fontWeight: 600, marginTop: 2 }}>Selected</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Budget preset picker ─────────────────────────────────────────────────────

function BudgetPresets({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
      {BUDGET_PRESETS.map(p => {
        const active = value === p.value;
        return (
          <button key={p.label} type="button" onClick={() => onChange(p.value)}
            style={{ textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              background: active ? "rgba(99,102,241,0.12)" : T.surfaceHi,
              border: `1px solid ${active ? "rgba(99,102,241,0.5)" : T.border}`,
              transition: "all 0.12s" }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = T.borderHi; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = T.border; }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: active ? T.accentHi : T.textDim,
              letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: active ? T.text : T.textMid,
              letterSpacing: "-0.02em", marginBottom: 2 }}>${p.value.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: T.textDim }}>{p.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [budget,  setBudget]  = useState("1200");
  const [useCase, setUseCase] = useState("gaming");
  const [notes,   setNotes]   = useState("");
  const [aiBuild, setAiBuild] = useState<AiBuild | null>(null);
  const [loading, setLoading] = useState(false);

  const [selected,     setSelected]     = useState<SelectedParts>({});
  const [openSlot,     setOpenSlot]     = useState<ComponentKey | null>(null);
  const [customBudget, setCustomBudget] = useState(1300);
  const [mode,         setMode]         = useState<"ai" | "custom">("ai");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setAiBuild(null);
    const res  = await fetch("/api/build", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget: Number(budget), useCase, notes }) });
    setAiBuild(await res.json());
    setLoading(false);
  }

  const customTotal     = Object.values(selected).reduce((s, p) => s + ((p as any)?.price ?? 0), 0);
  const customRemaining = customBudget - customTotal;
  const compatIssues    = getCompatIssues(selected);

  return (
    <>
      {openSlot && (
        <PartModal slot={openSlot} selected={selected}
          onSelect={p => setSelected(prev => ({ ...prev, [openSlot]: p }))}
          onClose={() => setOpenSlot(null)} />
      )}

      <main style={{ minHeight: "100vh", background: T.bg, color: T.text,
        fontFamily: "var(--font-geist-sans), 'Inter', system-ui, sans-serif" }}>

        {/* Nav */}
        <nav style={{ borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 10,
          backdropFilter: "blur(12px)", background: "rgba(8,9,16,0.85)" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px",
            height: 56, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.grad,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", flexShrink: 0 }}>O</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>Override</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", padding: "3px 8px",
              borderRadius: 99, background: "rgba(99,102,241,0.12)", color: T.accent,
              border: `1px solid rgba(99,102,241,0.2)`, textTransform: "uppercase" }}>Beta</span>
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Hero */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1,
              margin: "0 0 12px",
              background: "linear-gradient(135deg, #e8eaf5 0%, #9294a8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Build your perfect PC
            </h1>
            <p style={{ fontSize: 15, color: T.textMid, margin: 0, lineHeight: 1.6 }}>
              AI-generated builds or hand-pick every part — with live Newegg prices and compatibility checks.
            </p>
          </div>

          {/* Mode tabs */}
          <div style={{ display: "inline-flex", background: T.surfaceHi, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: 4, marginBottom: 36, gap: 2 }}>
            {(["ai", "custom"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{ padding: "8px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s", border: "none",
                  background: mode === m ? T.grad : "transparent",
                  color: mode === m ? "#fff" : T.textMid,
                  boxShadow: mode === m ? "0 2px 8px rgba(99,102,241,0.35)" : "none" }}>
                {m === "ai" ? "⚡  AI Build" : "⚙  Custom Build"}
              </button>
            ))}
          </div>

          {/* ── AI BUILD ── */}
          {mode === "ai" && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                {/* Budget */}
                <div>
                  <FieldLabel>Budget</FieldLabel>
                  <BudgetPresets value={Number(budget)} onChange={v => setBudget(String(v))} />
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                      fontSize: 14, fontWeight: 600, color: T.textMid }}>$</span>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} required
                      placeholder="Custom amount"
                      style={{ width: "100%", padding: "11px 14px 11px 30px", background: T.surfaceHi,
                        border: `1px solid ${T.border}`, borderRadius: 10, color: T.text,
                        fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => (e.target.style.borderColor = T.accent)}
                      onBlur={e => (e.target.style.borderColor = T.border)} />
                  </div>
                </div>

                {/* Use case */}
                <div>
                  <FieldLabel>Use case</FieldLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {([["gaming","🎮","Gaming"],["video editing","🎬","Video Editing"],["programming","💻","Programming"],["general use","🖥️","General Use"]] as const).map(([val, icon, label]) => {
                      const active = useCase === val;
                      return (
                        <button key={val} type="button" onClick={() => setUseCase(val)}
                          style={{ padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 10, transition: "all 0.12s",
                            background: active ? "rgba(99,102,241,0.12)" : T.surfaceHi,
                            border: `1px solid ${active ? "rgba(99,102,241,0.4)" : T.border}` }}
                          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = T.borderHi; }}
                          onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = T.border; }}>
                          <span style={{ fontSize: 18 }}>{icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: active ? T.accentHi : T.textMid }}>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <FieldLabel>Notes <span style={{ textTransform: "none", fontWeight: 400, color: T.textDim }}>(optional)</span></FieldLabel>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. prefer AMD, already have a case, want RGB"
                    style={{ width: "100%", padding: "11px 14px", background: T.surfaceHi,
                      border: `1px solid ${T.border}`, borderRadius: 10, color: T.text,
                      fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => (e.target.style.borderColor = T.accent)}
                    onBlur={e => (e.target.style.borderColor = T.border)} />
                </div>

                <button type="submit" disabled={loading}
                  style={{ padding: "14px 24px", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer",
                    background: loading ? T.surfaceHi : T.grad, color: loading ? T.textDim : "#fff",
                    fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em",
                    boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
                    transition: "all 0.15s" }}>
                  {loading ? "Generating your build…" : "Generate Build →"}
                </button>
              </div>
            </form>
          )}

          {/* AI Result */}
          {mode === "ai" && aiBuild && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: T.text, marginBottom: 16 }}>
                Your Build
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(aiBuild).filter(([k]) => k !== "totalEstimate").map(([key, val]: [string, any]) => (
                  <div key={key} style={{ padding: "16px 20px", borderRadius: 12,
                    background: T.surfaceHi, border: `1px solid ${T.border}`,
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                        color: T.textDim, marginBottom: 4 }}>
                        {COMPONENT_META[key as ComponentKey]?.icon} {COMPONENT_META[key as ComponentKey]?.label ?? key}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>{val.name}</div>
                      <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.5 }}>{val.reason}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text, flexShrink: 0 }}>${val.price}</div>
                  </div>
                ))}
                <div style={{ padding: "16px 20px", borderRadius: 12,
                  background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)",
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.accentHi }}>Total estimate</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>
                    ${aiBuild.totalEstimate?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── CUSTOM BUILD ── */}
          {mode === "custom" && (
            <div>
              {/* Budget */}
              <div style={{ marginBottom: 28 }}>
                <FieldLabel>Your Budget</FieldLabel>
                <BudgetPresets value={customBudget} onChange={setCustomBudget} />
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    fontSize: 14, fontWeight: 600, color: T.textMid }}>$</span>
                  <input type="number" value={customBudget} onChange={e => setCustomBudget(Number(e.target.value))}
                    style={{ width: "100%", padding: "11px 14px 11px 30px", background: T.surfaceHi,
                      border: `1px solid ${T.border}`, borderRadius: 10, color: T.text,
                      fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => (e.target.style.borderColor = T.accent)}
                    onBlur={e => (e.target.style.borderColor = T.border)} />
                </div>
              </div>

              {/* Budget bar */}
              <div style={{ padding: "16px 20px", borderRadius: 12, background: T.surfaceHi,
                border: `1px solid ${T.border}`, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: T.textMid }}>
                    Spent <strong style={{ color: T.text, fontWeight: 700 }}>${customTotal.toLocaleString()}</strong>
                    <span style={{ color: T.textDim }}> of ${customBudget.toLocaleString()}</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700,
                    color: customRemaining < 0 ? "#f87171" : customRemaining < customBudget * 0.1 ? "#f59e0b" : "#34d399" }}>
                    {customRemaining < 0 ? `$${Math.abs(customRemaining)} over` : `$${customRemaining.toLocaleString()} left`}
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: T.border, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, transition: "width 0.3s",
                    width: `${Math.min(100, (customTotal / customBudget) * 100)}%`,
                    background: customRemaining < 0 ? "#f87171" : T.grad }} />
                </div>
              </div>

              {/* Compatibility warnings */}
              {compatIssues.length > 0 && (
                <div style={{ padding: "14px 16px", borderRadius: 12, marginBottom: 16,
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", letterSpacing: "0.04em",
                    textTransform: "uppercase", marginBottom: 8 }}>Compatibility Issues</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {compatIssues.map((iss, i) => (
                      <div key={i} style={{ fontSize: 12, display: "flex", gap: 8, lineHeight: 1.5,
                        color: iss.severity === "error" ? "#fca5a5" : "#fcd34d" }}>
                        <span style={{ flexShrink: 0 }}>{iss.severity === "error" ? "✗" : "△"}</span>
                        <span>{iss.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Component slots */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {COMPONENT_ORDER.map(slot => {
                  const meta      = COMPONENT_META[slot];
                  const picked    = (selected as any)[slot] as AnyPart | undefined;
                  const issues    = compatIssues.filter(i => i.slot === slot);
                  const hasError  = issues.some(i => i.severity === "error");
                  const hasWarn   = issues.some(i => i.severity === "warn");
                  const borderCol = hasError ? "rgba(239,68,68,0.4)" : hasWarn ? "rgba(251,191,36,0.3)" : T.border;

                  return (
                    <div key={slot}
                      style={{ padding: "16px 20px", borderRadius: 12,
                        background: T.surfaceHi, border: `1px solid ${borderCol}`, transition: "border-color 0.12s",
                        display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: 22, flexShrink: 0, width: 32, textAlign: "center" }}>{meta.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
                          textTransform: "uppercase", color: T.textDim, marginBottom: 3 }}>{meta.label}</div>
                        {picked
                          ? <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{picked.name}</div>
                          : <div style={{ fontSize: 13, color: T.textDim }}>Click to select</div>}
                        {picked && (
                          <div style={{ fontSize: 12, color: T.textMid,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(picked as any).specs}</div>
                        )}
                        {issues.map((iss, i) => (
                          <div key={i} style={{ fontSize: 11, marginTop: 4,
                            color: iss.severity === "error" ? "#fca5a5" : "#fcd34d" }}>
                            {iss.severity === "error" ? "✗" : "△"} {iss.msg}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {picked && (
                          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
                            ${(picked as any).price}
                          </span>
                        )}
                        <button onClick={() => setOpenSlot(slot)}
                          style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, cursor: "pointer",
                            background: picked ? "rgba(99,102,241,0.12)" : T.bg,
                            color: picked ? T.accentHi : T.textDim,
                            border: `1px solid ${picked ? "rgba(99,102,241,0.25)" : T.border}`,
                            transition: "all 0.12s" }}>
                          {picked ? "Change" : "Pick"}
                        </button>
                        {picked && (
                          <button
                            onClick={() => setSelected(prev => { const next = { ...prev }; delete (next as any)[slot]; return next; })}
                            style={{ width: 28, height: 28, borderRadius: 8, cursor: "pointer", display: "flex",
                              alignItems: "center", justifyContent: "center", fontSize: 14,
                              background: "rgba(239,68,68,0.08)", color: "#f87171",
                              border: "1px solid rgba(239,68,68,0.2)", transition: "all 0.12s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.18)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}>
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {Object.keys(selected).length > 0 && (
                <button onClick={() => setSelected({})}
                  style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, color: T.textDim, padding: 0 }}>
                  Clear all selections
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
