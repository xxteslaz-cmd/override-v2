"use client";
import { useState, useEffect, useRef } from "react";
import type { SearchResult } from "./api/search/route";

// ─── Part data ────────────────────────────────────────────────────────────────

interface CPUPart {
  id: string; name: string; price: number; tier: string;
  socket: string; perfScore: number; specs: string;
}
interface GPUPart {
  id: string; name: string; price: number; tier: string;
  vram: number; perfScore: number; specs: string;
  lengthMm: number; powerW: number;
}
interface MoboPart {
  id: string; name: string; price: number; tier: string;
  specs: string; socket: string; formFactor: "ATX" | "mATX" | "ITX";
}
interface CasePart {
  id: string; name: string; price: number; tier: string;
  specs: string; supportedFormFactors: string[]; maxGpuMm: number;
}
interface PSUPart {
  id: string; name: string; price: number; tier: string;
  specs: string; watts: number;
}
interface SimplePart {
  id: string; name: string; price: number; tier: string; specs: string;
}

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
  { id: "rx6600",     name: "AMD RX 6600",              price: 179, tier: "budget", vram: 8,  perfScore: 4,  specs: "8 GB · 1080p",         lengthMm: 240, powerW: 132 },
  { id: "rtx4060",    name: "NVIDIA RTX 4060",          price: 299, tier: "budget", vram: 8,  perfScore: 6,  specs: "8 GB · 1080p/1440p",   lengthMm: 240, powerW: 115 },
  { id: "rx7600",     name: "AMD RX 7600",              price: 269, tier: "budget", vram: 8,  perfScore: 5,  specs: "8 GB · 1080p",         lengthMm: 215, powerW: 165 },
  { id: "rtx4060ti",  name: "NVIDIA RTX 4060 Ti",       price: 399, tier: "mid",   vram: 16, perfScore: 7,  specs: "16 GB · 1440p",        lengthMm: 240, powerW: 165 },
  { id: "rx7700xt",   name: "AMD RX 7700 XT",           price: 349, tier: "mid",   vram: 12, perfScore: 7,  specs: "12 GB · 1440p",        lengthMm: 267, powerW: 245 },
  { id: "rtx4070",    name: "NVIDIA RTX 4070",          price: 549, tier: "mid",   vram: 12, perfScore: 8,  specs: "12 GB · 1440p/4K",     lengthMm: 285, powerW: 200 },
  { id: "rx7800xt",   name: "AMD RX 7800 XT",           price: 449, tier: "mid",   vram: 16, perfScore: 8,  specs: "16 GB · 1440p/4K",     lengthMm: 276, powerW: 263 },
  { id: "rtx4070tis", name: "NVIDIA RTX 4070 Ti Super", price: 799, tier: "high",  vram: 16, perfScore: 9,  specs: "16 GB · 4K",           lengthMm: 336, powerW: 285 },
  { id: "rx7900xtx",  name: "AMD RX 7900 XTX",         price: 849, tier: "high",  vram: 24, perfScore: 9,  specs: "24 GB · 4K",           lengthMm: 287, powerW: 355 },
  { id: "rtx4080s",   name: "NVIDIA RTX 4080 Super",    price: 999, tier: "high",  vram: 16, perfScore: 10, specs: "16 GB · 4K",           lengthMm: 336, powerW: 320 },
  { id: "rtx4090",    name: "NVIDIA RTX 4090",          price: 1599,tier: "ultra", vram: 24, perfScore: 10, specs: "24 GB · 4K ultra",     lengthMm: 336, powerW: 450 },
];

const MOTHERBOARDS: MoboPart[] = [
  { id: "b650-plus",  name: "MSI B650 Gaming Plus",      price: 159, tier: "budget", socket: "AM5",     formFactor: "ATX",  specs: "AM5 · DDR5 · PCIe 5.0" },
  { id: "b760-pro",   name: "ASUS Prime B760M-A",        price: 139, tier: "budget", socket: "LGA1700", formFactor: "mATX", specs: "LGA1700 · DDR5 · PCIe 4.0" },
  { id: "x670-f",     name: "ASUS ROG Strix X670E-F",    price: 329, tier: "mid",    socket: "AM5",     formFactor: "ATX",  specs: "AM5 · DDR5 · PCIe 5.0 · WiFi 6E" },
  { id: "z790-edge",  name: "MSI MEG Z790 Edge",         price: 299, tier: "mid",    socket: "LGA1700", formFactor: "ATX",  specs: "LGA1700 · DDR5 · PCIe 5.0 · WiFi 6E" },
  { id: "b650m-itx",  name: "ASRock B650I Lightning",    price: 229, tier: "mid",    socket: "AM5",     formFactor: "ITX",  specs: "AM5 · DDR5 · Mini-ITX" },
  { id: "x670e-hero", name: "ASUS ROG Crosshair X670E",  price: 499, tier: "high",   socket: "AM5",     formFactor: "ATX",  specs: "AM5 · DDR5 · Flagship VRM" },
];

const RAMS: SimplePart[] = [
  { id: "ddr5-16",  name: "16 GB DDR5-6000",  price: 59,  tier: "budget", specs: "2×8 GB · DDR5-6000 · CL30" },
  { id: "ddr5-32a", name: "32 GB DDR5-6000",  price: 99,  tier: "mid",    specs: "2×16 GB · DDR5-6000 · CL30" },
  { id: "ddr5-32b", name: "32 GB DDR5-6400",  price: 119, tier: "mid",    specs: "2×16 GB · DDR5-6400 · CL32" },
  { id: "ddr5-64",  name: "64 GB DDR5-6000",  price: 189, tier: "high",   specs: "2×32 GB · DDR5-6000 · CL30" },
];

const STORAGES: SimplePart[] = [
  { id: "ssd-1tb-g3", name: "1 TB NVMe Gen 3 SSD",  price: 49,  tier: "budget", specs: "3,500/3,000 MB/s · PCIe 3.0" },
  { id: "ssd-1tb-g4", name: "1 TB NVMe Gen 4 SSD",  price: 69,  tier: "budget", specs: "7,000/6,500 MB/s · PCIe 4.0" },
  { id: "ssd-2tb-g4", name: "2 TB NVMe Gen 4 SSD",  price: 119, tier: "mid",    specs: "7,000/6,500 MB/s · PCIe 4.0" },
  { id: "ssd-4tb-g4", name: "4 TB NVMe Gen 4 SSD",  price: 249, tier: "high",   specs: "7,200/6,900 MB/s · PCIe 4.0" },
];

const PSUS: PSUPart[] = [
  { id: "psu-650g",  name: "Corsair RM650x",       price: 89,  tier: "budget", watts: 650,  specs: "650W · 80+ Gold · Fully modular" },
  { id: "psu-750g",  name: "Seasonic Focus GX-750",price: 109, tier: "mid",    watts: 750,  specs: "750W · 80+ Gold · Fully modular" },
  { id: "psu-850p",  name: "be quiet! Straight Power 850W", price: 139, tier: "mid", watts: 850, specs: "850W · 80+ Platinum · Fully modular" },
  { id: "psu-1000t", name: "Corsair HX1000",       price: 189, tier: "high",   watts: 1000, specs: "1000W · 80+ Titanium · Fully modular" },
];

const CASES: CasePart[] = [
  { id: "h5-flow",  name: "NZXT H5 Flow",              price: 89,  tier: "budget", supportedFormFactors: ["ATX","mATX","ITX"], maxGpuMm: 365, specs: "Mid-tower · ATX/mATX/ITX · 365mm GPU" },
  { id: "meshify",  name: "Fractal Meshify C",          price: 99,  tier: "budget", supportedFormFactors: ["ATX","mATX","ITX"], maxGpuMm: 315, specs: "Mid-tower · ATX/mATX/ITX · 315mm GPU" },
  { id: "o11-evo",  name: "Lian Li O11 Dynamic EVO",   price: 169, tier: "mid",    supportedFormFactors: ["ATX","mATX","ITX"], maxGpuMm: 446, specs: "Mid-tower · ATX/mATX/ITX · 446mm GPU" },
  { id: "define7",  name: "Fractal Design Define 7",    price: 189, tier: "mid",    supportedFormFactors: ["E-ATX","ATX","mATX","ITX"], maxGpuMm: 491, specs: "Full-tower · E-ATX supported · 491mm GPU" },
  { id: "nr200p",   name: "Cooler Master NR200P",       price: 99,  tier: "mid",    supportedFormFactors: ["ITX"],             maxGpuMm: 330, specs: "ITX only · 330mm GPU · Compact" },
  { id: "phanteks", name: "Phanteks Enthoo 719",        price: 219, tier: "high",   supportedFormFactors: ["E-ATX","ATX","mATX","ITX"], maxGpuMm: 503, specs: "Full-tower · E-ATX · 503mm GPU" },
];

const COOLERS: SimplePart[] = [
  { id: "wraith",   name: "AMD Wraith Stealth (Stock)", price: 0,   tier: "budget", specs: "Included · 65W TDP max" },
  { id: "nh-u12s",  name: "Noctua NH-U12S",             price: 79,  tier: "mid",    specs: "Single-tower · 158mm · Quiet" },
  { id: "nh-d15",   name: "Noctua NH-D15",              price: 99,  tier: "mid",    specs: "Dual-tower · Best air cooling" },
  { id: "kraken240",name: "NZXT Kraken 240 AIO",        price: 109, tier: "mid",    specs: "240mm AIO · 2× 120mm fans" },
  { id: "kraken360",name: "NZXT Kraken 360 AIO",        price: 149, tier: "high",   specs: "360mm AIO · 3× 120mm fans" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ComponentKey = "cpu" | "gpu" | "motherboard" | "ram" | "storage" | "psu" | "case" | "cooler";

interface SelectedParts {
  cpu?:         CPUPart;
  gpu?:         GPUPart;
  motherboard?: MoboPart;
  ram?:         SimplePart;
  storage?:     SimplePart;
  psu?:         PSUPart;
  case?:        CasePart;
  cooler?:      SimplePart;
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

  // CPU ↔ Motherboard socket
  if (s.cpu && s.motherboard && s.cpu.socket !== s.motherboard.socket) {
    issues.push({ slot: "motherboard", severity: "error",
      msg: `Socket mismatch: ${s.cpu.name} uses ${s.cpu.socket}, motherboard is ${s.motherboard.socket}` });
  }

  // Motherboard form factor ↔ Case
  if (s.motherboard && s.case) {
    if (!s.case.supportedFormFactors.includes(s.motherboard.formFactor)) {
      issues.push({ slot: "case", severity: "error",
        msg: `Case doesn't support ${s.motherboard.formFactor} boards (supports: ${s.case.supportedFormFactors.join(", ")})` });
    }
  }

  // GPU length ↔ Case
  if (s.gpu && s.case) {
    if (s.gpu.lengthMm > s.case.maxGpuMm) {
      issues.push({ slot: "gpu", severity: "error",
        msg: `GPU is ${s.gpu.lengthMm}mm but case only fits ${s.case.maxGpuMm}mm GPUs` });
    } else if (s.gpu.lengthMm > s.case.maxGpuMm - 20) {
      issues.push({ slot: "gpu", severity: "warn",
        msg: `GPU (${s.gpu.lengthMm}mm) is a tight fit — only ${s.case.maxGpuMm - s.gpu.lengthMm}mm clearance` });
    }
  }

  // PSU wattage
  if (s.psu && (s.cpu || s.gpu)) {
    const cpuW = s.cpu ? (s.cpu.socket === "AM5" ? 90 : 130) : 0;
    const gpuW = s.gpu?.powerW ?? 0;
    const total = cpuW + gpuW + 100; // system overhead
    if (total > s.psu.watts) {
      issues.push({ slot: "psu", severity: "error",
        msg: `PSU too weak: system needs ~${total}W, PSU is ${s.psu.watts}W` });
    } else if (total > s.psu.watts * 0.85) {
      issues.push({ slot: "psu", severity: "warn",
        msg: `PSU is near capacity (~${total}W needed, ${s.psu.watts}W available)` });
    }
  }

  return issues;
}

function getSlotIssues(slot: ComponentKey, allIssues: CompatIssue[]) {
  return allIssues.filter(i => i.slot === slot);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BUDGET_PRESETS = [
  { label: "Budget",    value: 700  },
  { label: "Mid-Range", value: 1300 },
  { label: "High-End",  value: 2200 },
];

const COMPONENT_META: Record<ComponentKey, { label: string; icon: string }> = {
  cpu:         { label: "Processor (CPU)",     icon: "🧠" },
  gpu:         { label: "Graphics Card (GPU)", icon: "🎮" },
  motherboard: { label: "Motherboard",         icon: "🔌" },
  ram:         { label: "Memory (RAM)",        icon: "💾" },
  storage:     { label: "Storage (SSD)",       icon: "💿" },
  psu:         { label: "Power Supply (PSU)",  icon: "⚡" },
  case:        { label: "Case",                icon: "🗄️" },
  cooler:      { label: "CPU Cooler",          icon: "❄️" },
};

const COMPONENT_ORDER: ComponentKey[] = ["cpu", "gpu", "motherboard", "ram", "storage", "psu", "case", "cooler"];

const STATIC_PARTS: Record<ComponentKey, AnyPart[]> = {
  cpu:         CPUS,
  gpu:         GPUS,
  motherboard: MOTHERBOARDS,
  ram:         RAMS,
  storage:     STORAGES,
  psu:         PSUS,
  case:        CASES,
  cooler:      COOLERS,
};

const TIER_BADGE: Record<string, string> = {
  budget: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  mid:    "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  high:   "bg-violet-500/20 text-violet-400 border border-violet-500/30",
  ultra:  "bg-orange-500/20 text-orange-400 border border-orange-500/30",
};

function gpuPairingNote(gpu: GPUPart, cpu?: CPUPart): string {
  if (!cpu) return "";
  const diff = gpu.perfScore - cpu.perfScore;
  if (Math.abs(diff) <= 1) return "✅ Well-balanced with your CPU";
  if (diff >  1) return "⚡ GPU-heavy — good for future CPU upgrades";
  return "⚠️ CPU may bottleneck this GPU";
}

// ─── Part Modal ───────────────────────────────────────────────────────────────

function PartModal({
  slot, selected, onSelect, onClose,
}: {
  slot: ComponentKey;
  selected: SelectedParts;
  onSelect: (p: AnyPart) => void;
  onClose: () => void;
}) {
  const meta       = COMPONENT_META[slot];
  const staticList = STATIC_PARTS[slot] as AnyPart[];

  const [query,       setQuery]       = useState("");
  const [searchRes,   setSearchRes]   = useState<SearchResult[]>([]);
  const [searching,   setSearching]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSearchRes([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}&category=${slot}`);
        const data: SearchResult[] = await res.json();
        setSearchRes(data);
      } finally {
        setSearching(false);
      }
    }, 500);
  }

  // Decide which list to show
  const displayList: (AnyPart | SearchResult)[] = query.trim()
    ? searchRes
    : staticList;

  const selectedId = (selected as any)[slot]?.id;

  function pickSearchResult(r: SearchResult) {
    onSelect({ id: r.id, name: r.name, price: r.price, specs: r.specs, tier: "search" } as AnyPart);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border overflow-hidden"
        style={{ background: "#13141f", borderColor: "#2a2d3e" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b shrink-0" style={{ borderColor: "#2a2d3e" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <h3 className="font-bold text-white">{meta.label}</h3>
              {slot === "gpu" && selected.cpu && (
                <p className="text-xs mt-0.5" style={{ color: "#8b8fa8" }}>
                  Matched to {selected.cpu.name}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-lg" style={{ color: "#8b8fa8" }}>✕</button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b shrink-0" style={{ borderColor: "#1e2133" }}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#555870" }}>🔍</span>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder={`Search Newegg / Amazon for ${meta.label.toLowerCase()}…`}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none"
              style={{ background: "#0d0e14", border: "1px solid #2a2d3e" }}
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#6366f1" }}>
                searching…
              </span>
            )}
          </div>
          {query && searchRes.length > 0 && (
            <p className="text-xs mt-2" style={{ color: "#555870" }}>
              {searchRes[0].source === "newegg" ? "📦 Live prices from Newegg" : "🤖 AI-estimated prices · click result to check Newegg"}
            </p>
          )}
        </div>

        {/* Part list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {displayList.length === 0 && !searching && (
            <p className="text-center py-8 text-sm" style={{ color: "#555870" }}>
              {query ? "No results found — try a different search" : "No parts in this category"}
            </p>
          )}

          {displayList.map((part, i) => {
            const isSearch = "source" in part;
            const isGpu    = slot === "gpu";
            const isSelected = !isSearch && (part as AnyPart).id === selectedId;
            const note     = isGpu && !isSearch ? gpuPairingNote(part as GPUPart, selected.cpu) : "";

            return (
              <button
                key={isSearch ? `s-${i}` : (part as AnyPart).id}
                onClick={() => {
                  if (isSearch) pickSearchResult(part as SearchResult);
                  else { onSelect(part as AnyPart); onClose(); }
                }}
                className="w-full text-left rounded-xl p-4 transition-all border group"
                style={{
                  background: isSelected ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                  borderColor: isSelected ? "#6366f1" : "#2a2d3e",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{part.name}</span>
                      {!isSearch && (
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${TIER_BADGE[(part as AnyPart).tier] ?? TIER_BADGE.budget}`}>
                          {(part as AnyPart).tier}
                        </span>
                      )}
                      {isSearch && (part as SearchResult).source === "newegg" && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">Newegg live</span>
                      )}
                      {isSearch && (part as SearchResult).source === "ai" && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">AI estimate</span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#8b8fa8" }}>{(part as any).specs}</p>
                    {note && (
                      <p className="text-xs mt-1.5 font-medium" style={{ color: note.startsWith("✅") ? "#34d399" : note.startsWith("⚡") ? "#a78bfa" : "#f59e0b" }}>
                        {note}
                      </p>
                    )}
                    {isSearch && (
                      <a
                        href={(part as SearchResult).url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-xs mt-1 inline-block hover:underline"
                        style={{ color: "#6366f1" }}
                      >
                        View on Newegg ↗
                      </a>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-white">${(part as any).price}</span>
                    {isSelected && <div className="text-xs text-indigo-400 mt-0.5">Selected</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [budget,   setBudget]   = useState("1200");
  const [useCase,  setUseCase]  = useState("gaming");
  const [notes,    setNotes]    = useState("");
  const [aiBuild,  setAiBuild]  = useState<AiBuild | null>(null);
  const [loading,  setLoading]  = useState(false);

  const [selected,      setSelected]      = useState<SelectedParts>({});
  const [openSlot,      setOpenSlot]      = useState<ComponentKey | null>(null);
  const [customBudget,  setCustomBudget]  = useState(1300);
  const [mode,          setMode]          = useState<"ai" | "custom">("ai");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAiBuild(null);
    const res = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget: Number(budget), useCase, notes }),
    });
    const data = await res.json();
    setAiBuild(data);
    setLoading(false);
  }

  const customTotal     = Object.values(selected).reduce((sum, p) => sum + ((p as any)?.price ?? 0), 0);
  const customRemaining = customBudget - customTotal;
  const compatIssues    = getCompatIssues(selected);

  return (
    <>
      {openSlot && (
        <PartModal
          slot={openSlot}
          selected={selected}
          onSelect={p => setSelected(prev => ({ ...prev, [openSlot]: p }))}
          onClose={() => setOpenSlot(null)}
        />
      )}

      <main className="min-h-screen" style={{ background: "#0d0e14", color: "#e2e4f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Top bar */}
        <div className="border-b" style={{ borderColor: "#1e2133" }}>
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>O</div>
            <span className="font-bold tracking-tight text-white">Override</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1e2133", color: "#6366f1" }}>AI PC Builder</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Hero */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #e2e4f0, #818cf8)" }}>
              Build your perfect PC
            </h1>
            <p style={{ color: "#8b8fa8" }}>AI-generated builds or hand-pick every part — with live Newegg prices.</p>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl p-1 mb-8 w-fit" style={{ background: "#13141f", border: "1px solid #1e2133" }}>
            {(["ai", "custom"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={mode === m
                  ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }
                  : { color: "#8b8fa8" }}
              >
                {m === "ai" ? "⚡ AI Build" : "🔧 Custom Build"}
              </button>
            ))}
          </div>

          {/* ── AI BUILD ── */}
          {mode === "ai" && (
            <div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#c9cce0" }}>Budget</label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {BUDGET_PRESETS.map(p => (
                      <button key={p.label} type="button" onClick={() => setBudget(String(p.value))}
                        className="rounded-xl p-3 text-left transition-all border"
                        style={Number(budget) === p.value
                          ? { background: "rgba(99,102,241,0.15)", borderColor: "#6366f1" }
                          : { background: "#13141f", borderColor: "#1e2133" }}>
                        <div className="text-xs font-medium mb-1" style={{ color: "#8b8fa8" }}>{p.label}</div>
                        <div className="font-bold text-white">${p.value.toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style={{ color: "#8b8fa8" }}>$</span>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} required
                      className="w-full pl-7 pr-4 py-2.5 rounded-xl text-white focus:outline-none"
                      style={{ background: "#13141f", border: "1px solid #2a2d3e" }} placeholder="Custom amount" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#c9cce0" }}>Use case</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[["gaming","🎮"],["video editing","🎬"],["programming","💻"],["general use","🖥️"]].map(([uc, icon]) => (
                      <button key={uc} type="button" onClick={() => setUseCase(uc)}
                        className="py-2 rounded-xl text-sm font-medium transition-all border capitalize"
                        style={useCase === uc
                          ? { background: "rgba(99,102,241,0.15)", borderColor: "#6366f1", color: "#a5b4fc" }
                          : { background: "#13141f", borderColor: "#1e2133", color: "#8b8fa8" }}>
                        {icon} {uc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#c9cce0" }}>Notes (optional)</label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. prefer AMD, already have a case, want RGB"
                    className="w-full px-4 py-2.5 rounded-xl text-white placeholder:text-gray-600 focus:outline-none"
                    style={{ background: "#13141f", border: "1px solid #2a2d3e" }} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all"
                  style={{ background: loading ? "#2a2d3e" : "linear-gradient(135deg, #6366f1, #8b5cf6)", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Generating build…" : "Generate Build →"}
                </button>
              </form>

              {aiBuild && (
                <div className="mt-8">
                  <h2 className="font-bold text-lg mb-4 text-white">Your Build</h2>
                  <div className="space-y-2">
                    {Object.entries(aiBuild).filter(([k]) => k !== "totalEstimate").map(([key, val]: [string, any]) => (
                      <div key={key} className="rounded-xl p-4 border" style={{ background: "#13141f", borderColor: "#1e2133" }}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="text-sm mb-1" style={{ color: "#8b8fa8" }}>
                              {COMPONENT_META[key as ComponentKey]?.icon} {COMPONENT_META[key as ComponentKey]?.label ?? key}
                            </div>
                            <div className="font-semibold text-white">{val.name}</div>
                            <div className="text-xs mt-1" style={{ color: "#8b8fa8" }}>{val.reason}</div>
                          </div>
                          <span className="font-bold text-white shrink-0">${val.price}</span>
                        </div>
                      </div>
                    ))}
                    <div className="rounded-xl p-4 border flex justify-between font-bold text-white"
                      style={{ background: "rgba(99,102,241,0.1)", borderColor: "#6366f1" }}>
                      <span>Total</span>
                      <span>${aiBuild.totalEstimate?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CUSTOM BUILD ── */}
          {mode === "custom" && (
            <div>
              {/* Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3" style={{ color: "#c9cce0" }}>Your Budget</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {BUDGET_PRESETS.map(p => (
                    <button key={p.label} type="button" onClick={() => setCustomBudget(p.value)}
                      className="rounded-xl p-3 text-left transition-all border"
                      style={customBudget === p.value
                        ? { background: "rgba(99,102,241,0.15)", borderColor: "#6366f1" }
                        : { background: "#13141f", borderColor: "#1e2133" }}>
                      <div className="text-xs font-medium mb-1" style={{ color: "#8b8fa8" }}>{p.label}</div>
                      <div className="font-bold text-white">${p.value.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style={{ color: "#8b8fa8" }}>$</span>
                  <input type="number" value={customBudget} onChange={e => setCustomBudget(Number(e.target.value))}
                    className="w-full pl-7 pr-4 py-2.5 rounded-xl text-white focus:outline-none"
                    style={{ background: "#13141f", border: "1px solid #2a2d3e" }} />
                </div>
              </div>

              {/* Budget bar */}
              <div className="rounded-xl p-4 border mb-5" style={{ background: "#13141f", borderColor: "#1e2133" }}>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "#8b8fa8" }}>Spent: <span className="text-white font-semibold">${customTotal.toLocaleString()}</span></span>
                  <span className="font-semibold" style={{ color: customRemaining < 0 ? "#f87171" : "#34d399" }}>
                    {customRemaining < 0 ? `Over by $${Math.abs(customRemaining)}` : `$${customRemaining.toLocaleString()} remaining`}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1e2133" }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(100, (customTotal / customBudget) * 100)}%`,
                    background: customRemaining < 0 ? "#f87171" : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  }} />
                </div>
              </div>

              {/* Compatibility errors */}
              {compatIssues.length > 0 && (
                <div className="rounded-xl p-4 border mb-5 space-y-2"
                  style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.3)" }}>
                  <p className="text-sm font-semibold text-red-400 mb-2">⚠️ Compatibility Issues</p>
                  {compatIssues.map((issue, i) => (
                    <div key={i} className="text-xs flex gap-2" style={{ color: issue.severity === "error" ? "#fca5a5" : "#fbbf24" }}>
                      <span>{issue.severity === "error" ? "✗" : "!"}</span>
                      <span>{issue.msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Component slots */}
              <div className="space-y-2">
                {COMPONENT_ORDER.map(slot => {
                  const meta     = COMPONENT_META[slot];
                  const picked   = (selected as any)[slot] as AnyPart | undefined;
                  const issues   = getSlotIssues(slot, compatIssues);
                  const hasError = issues.some(i => i.severity === "error");
                  const hasWarn  = issues.some(i => i.severity === "warn");

                  return (
                    <button key={slot} onClick={() => setOpenSlot(slot)}
                      className="w-full text-left rounded-xl p-4 border transition-all"
                      style={{
                        background: "#13141f",
                        borderColor: hasError ? "rgba(239,68,68,0.5)" : hasWarn ? "rgba(251,191,36,0.4)" : picked ? "#2a2d3e" : "#1e2133",
                      }}>
                      <div className="flex items-center gap-4">
                        <span className="text-xl w-8 text-center">{meta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium mb-0.5" style={{ color: "#8b8fa8" }}>{meta.label}</div>
                          {picked
                            ? <div className="font-semibold text-white truncate">{picked.name}</div>
                            : <div className="text-sm" style={{ color: "#555870" }}>Click to select</div>}
                          {picked && <div className="text-xs mt-0.5 truncate" style={{ color: "#8b8fa8" }}>{(picked as any).specs}</div>}
                          {issues.map((iss, i) => (
                            <div key={i} className="text-xs mt-1" style={{ color: iss.severity === "error" ? "#fca5a5" : "#fbbf24" }}>
                              {iss.severity === "error" ? "✗" : "!"} {iss.msg}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {picked && <span className="font-bold text-white">${(picked as any).price}</span>}
                          <span className="text-xs px-3 py-1 rounded-lg font-medium"
                            style={{ background: "rgba(255,255,255,0.05)", color: picked ? "#a5b4fc" : "#555870" }}>
                            {picked ? "Change" : "Pick"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {Object.keys(selected).length > 0 && (
                <button onClick={() => setSelected({})} className="mt-4 text-sm transition-colors" style={{ color: "#555870" }}>
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
