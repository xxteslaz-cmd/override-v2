"use client";
import { useState, useRef, useEffect, type ReactElement } from "react";
import type { SearchResult } from "./api/search/route";

// ─── Part data ────────────────────────────────────────────────────────────────

interface CPUPart  { id: string; name: string; price: number; tier: string; socket: string; perfScore: number; tdp: number; cores: number; threads: number; baseClock: number; boostClock: number; specs: string; img?: string; }
interface GPUPart  { id: string; name: string; price: number; tier: string; vram: number; perfScore: number; specs: string; lengthMm: number; powerW: number; img?: string; }
interface MoboPart { id: string; name: string; price: number; tier: string; specs: string; socket: string; formFactor: "ATX" | "mATX" | "ITX"; img?: string; }
interface CasePart { id: string; name: string; price: number; tier: string; specs: string; supportedFormFactors: string[]; maxGpuMm: number; img?: string; }
interface PSUPart  { id: string; name: string; price: number; tier: string; specs: string; watts: number; img?: string; }
interface SimplePart { id: string; name: string; price: number; tier: string; specs: string; img?: string; }
type AnyPart = CPUPart | GPUPart | MoboPart | CasePart | PSUPart | SimplePart;

const NI = "https://c1.neweggimages.com/ProductImage/";
const CPUS: CPUPart[] = [
  { id: "r3-7300x",   name: "AMD Ryzen 3 7300X",    price: 129, tier: "budget", socket: "AM5",     perfScore: 5,  tdp: 65,  cores: 4,  threads: 8,  baseClock: 4.1, boostClock: 5.0, specs: "4C/8T · 4.1–5.0 GHz · 65W · AM5",                       img: NI+"19-113-829-01.png" },
  { id: "r5-7500f",   name: "AMD Ryzen 5 7500F",    price: 159, tier: "budget", socket: "AM5",     perfScore: 6,  tdp: 65,  cores: 6,  threads: 12, baseClock: 3.7, boostClock: 5.0, specs: "6C/12T · 3.7–5.0 GHz · 65W · AM5 · No iGPU",             img: NI+"19-113-828-04.jpg" },
  { id: "r5-7600",    name: "AMD Ryzen 5 7600",     price: 189, tier: "budget", socket: "AM5",     perfScore: 6,  tdp: 65,  cores: 6,  threads: 12, baseClock: 3.8, boostClock: 5.1, specs: "6C/12T · 3.8–5.1 GHz · 65W · AM5",                       img: NI+"19-113-811-01.jpg" },
  { id: "i5-13400f",  name: "Intel Core i5-13400F", price: 169, tier: "budget", socket: "LGA1700", perfScore: 6,  tdp: 65,  cores: 10, threads: 16, baseClock: 2.5, boostClock: 4.6, specs: "10C/16T · 2.5–4.6 GHz · 65W · LGA1700 · No iGPU",         img: NI+"19-118-411-V01.jpg" },
  { id: "i5-14600k",  name: "Intel Core i5-14600K", price: 229, tier: "budget", socket: "LGA1700", perfScore: 7,  tdp: 125, cores: 14, threads: 20, baseClock: 3.5, boostClock: 5.3, specs: "14C/20T · 3.5–5.3 GHz · 125W · LGA1700",                  img: NI+"AYTVS2303090IKVEZ94.jpg" },
  { id: "r7-7700",    name: "AMD Ryzen 7 7700",     price: 249, tier: "mid",    socket: "AM5",     perfScore: 8,  tdp: 65,  cores: 8,  threads: 16, baseClock: 3.8, boostClock: 5.3, specs: "8C/16T · 3.8–5.3 GHz · 65W · AM5",                       img: NI+"19-113-817-01.jpg" },
  { id: "r7-7700x",   name: "AMD Ryzen 7 7700X",    price: 269, tier: "mid",    socket: "AM5",     perfScore: 8,  tdp: 105, cores: 8,  threads: 16, baseClock: 4.5, boostClock: 5.4, specs: "8C/16T · 4.5–5.4 GHz · 105W · AM5",                      img: NI+"19-113-808-10.jpg" },
  { id: "i7-14700",   name: "Intel Core i7-14700",  price: 299, tier: "mid",    socket: "LGA1700", perfScore: 8,  tdp: 65,  cores: 20, threads: 28, baseClock: 2.1, boostClock: 5.4, specs: "20C/28T · 2.1–5.4 GHz · 65W · LGA1700",                  img: NI+"AYTVS2303090IOYY094.jpg" },
  { id: "i7-14700k",  name: "Intel Core i7-14700K", price: 339, tier: "mid",    socket: "LGA1700", perfScore: 9,  tdp: 125, cores: 20, threads: 28, baseClock: 3.4, boostClock: 5.6, specs: "20C/28T · 3.4–5.6 GHz · 125W · LGA1700",                 img: NI+"AYTVS2303090IL7TG94.jpg" },
  { id: "r9-7900x",   name: "AMD Ryzen 9 7900X",    price: 329, tier: "high",   socket: "AM5",     perfScore: 9,  tdp: 170, cores: 12, threads: 24, baseClock: 4.7, boostClock: 5.6, specs: "12C/24T · 4.7–5.6 GHz · 170W · AM5",                     img: NI+"A4YUD2311300Z1H1E95.jpg" },
  { id: "r9-7950x",   name: "AMD Ryzen 9 7950X",    price: 449, tier: "high",   socket: "AM5",     perfScore: 10, tdp: 170, cores: 16, threads: 32, baseClock: 4.5, boostClock: 5.7, specs: "16C/32T · 4.5–5.7 GHz · 170W · AM5",                     img: NI+"19-113-793-03.png" },
  { id: "i9-14900",   name: "Intel Core i9-14900",  price: 369, tier: "high",   socket: "LGA1700", perfScore: 9,  tdp: 65,  cores: 24, threads: 32, baseClock: 2.0, boostClock: 5.8, specs: "24C/32T · 2.0–5.8 GHz · 65W · LGA1700",                  img: NI+"19-118-426-02.png" },
  { id: "i9-14900k",  name: "Intel Core i9-14900K", price: 429, tier: "high",   socket: "LGA1700", perfScore: 10, tdp: 125, cores: 24, threads: 32, baseClock: 3.2, boostClock: 6.0, specs: "24C/32T · 3.2–6.0 GHz · 125W · LGA1700",                 img: NI+"19-118-424-01.jpg" },
  { id: "r9-7950x3d", name: "AMD Ryzen 9 7950X3D",  price: 579, tier: "high",   socket: "AM5",     perfScore: 10, tdp: 120, cores: 16, threads: 32, baseClock: 4.2, boostClock: 5.7, specs: "16C/32T · 4.2–5.7 GHz · 120W · AM5 · 3D V-Cache",        img: NI+"19-113-829-01.png" },
];
const GPUS: GPUPart[] = [
  { id: "rx6600",      name: "AMD RX 6600",               price: 149, tier: "budget", vram: 8,  perfScore: 4,  specs: "8 GB · 1080p",            lengthMm: 240, powerW: 132, img: NI+"14-150-801-Z01.jpg" },
  { id: "rx7600",      name: "AMD RX 7600",               price: 219, tier: "budget", vram: 8,  perfScore: 5,  specs: "8 GB · 1080p",            lengthMm: 215, powerW: 165, img: NI+"14-930-083-01.jpg" },
  { id: "rtx4060",     name: "NVIDIA RTX 4060",           price: 289, tier: "budget", vram: 8,  perfScore: 6,  specs: "8 GB · 1080p/1440p",      lengthMm: 240, powerW: 115, img: NI+"14-126-596-V01.jpg" },
  { id: "rx6700",      name: "AMD RX 6700",               price: 249, tier: "budget", vram: 10, perfScore: 5,  specs: "10 GB · 1080p/1440p",     lengthMm: 267, powerW: 175, img: NI+"14-150-825-V01.jpg" },
  { id: "rtx3060",     name: "NVIDIA RTX 3060",           price: 199, tier: "budget", vram: 12, perfScore: 5,  specs: "12 GB · 1080p",           lengthMm: 242, powerW: 170, img: NI+"14-126-503-V01.jpg" },
  { id: "rtx4060ti",   name: "NVIDIA RTX 4060 Ti",        price: 369, tier: "mid",    vram: 16, perfScore: 7,  specs: "16 GB · 1440p",           lengthMm: 240, powerW: 165, img: NI+"14-126-590-V08.jpg" },
  { id: "rx7700xt",    name: "AMD RX 7700 XT",            price: 319, tier: "mid",    vram: 12, perfScore: 7,  specs: "12 GB · 1440p",           lengthMm: 267, powerW: 245, img: NI+"14-137-708-01.jpg" },
  { id: "rx7800xt",    name: "AMD RX 7800 XT",            price: 419, tier: "mid",    vram: 16, perfScore: 8,  specs: "16 GB · 1440p/4K",        lengthMm: 276, powerW: 263, img: NI+"14-930-109-09.jpg" },
  { id: "rtx4070",     name: "NVIDIA RTX 4070",           price: 499, tier: "mid",    vram: 12, perfScore: 8,  specs: "12 GB · 1440p/4K",        lengthMm: 285, powerW: 200, img: NI+"14-126-578-01.png" },
  { id: "rtx4070s",    name: "NVIDIA RTX 4070 Super",     price: 549, tier: "mid",    vram: 12, perfScore: 8,  specs: "12 GB · 1440p/4K",        lengthMm: 285, powerW: 220, img: NI+"14-126-607-32.jpg" },
  { id: "rx7900xt",    name: "AMD RX 7900 XT",            price: 629, tier: "high",   vram: 20, perfScore: 9,  specs: "20 GB · 4K",              lengthMm: 287, powerW: 315, img: NI+"14-150-905-05.jpg" },
  { id: "rtx4070ti",   name: "NVIDIA RTX 4070 Ti",        price: 679, tier: "high",   vram: 12, perfScore: 9,  specs: "12 GB · 4K",              lengthMm: 336, powerW: 285, img: NI+"14-126-567-04.jpg" },
  { id: "rtx4070tis",  name: "NVIDIA RTX 4070 Ti Super",  price: 749, tier: "high",   vram: 16, perfScore: 9,  specs: "16 GB · 4K",              lengthMm: 336, powerW: 285, img: NI+"14-126-617-02.jpg" },
  { id: "rx7900xtx",   name: "AMD RX 7900 XTX",           price: 799, tier: "high",   vram: 24, perfScore: 9,  specs: "24 GB · 4K",              lengthMm: 287, powerW: 355, img: NI+"14-150-916-04.jpg" },
  { id: "rtx4080s",    name: "NVIDIA RTX 4080 Super",     price: 949, tier: "high",   vram: 16, perfScore: 10, specs: "16 GB · 4K",              lengthMm: 336, powerW: 320, img: NI+"14-126-519-01.jpg" },
  { id: "rtx4090",     name: "NVIDIA RTX 4090",           price: 1549,tier: "ultra",  vram: 24, perfScore: 10, specs: "24 GB · 4K ultra",        lengthMm: 336, powerW: 450, img: NI+"14-126-579-V23.jpg" },
];
const MOTHERBOARDS: MoboPart[] = [
  { id: "b650m-ds",    name: "Gigabyte B650M DS3H",        price: 109, tier: "budget", socket: "AM5",     formFactor: "mATX", specs: "AM5 · DDR5 · PCIe 5.0 · mATX",            img: NI+"13-145-424-V01.jpg" },
  { id: "b650-plus",   name: "MSI B650 Gaming Plus",       price: 159, tier: "budget", socket: "AM5",     formFactor: "ATX",  specs: "AM5 · DDR5 · PCIe 5.0 · ATX",             img: NI+"13-144-557-06.jpg" },
  { id: "b760m-pro",   name: "ASUS Prime B760M-A",         price: 129, tier: "budget", socket: "LGA1700", formFactor: "mATX", specs: "LGA1700 · DDR5 · PCIe 4.0 · mATX",        img: NI+"13-119-621-09.png" },
  { id: "b760-pro",    name: "MSI PRO B760-P WiFi",        price: 149, tier: "budget", socket: "LGA1700", formFactor: "ATX",  specs: "LGA1700 · DDR5 · PCIe 4.0 · WiFi" },
  { id: "b650m-itx",   name: "ASRock B650I Lightning",     price: 229, tier: "mid",    socket: "AM5",     formFactor: "ITX",  specs: "AM5 · DDR5 · Mini-ITX" },
  { id: "x670-f",      name: "ASUS ROG Strix X670E-F",     price: 329, tier: "mid",    socket: "AM5",     formFactor: "ATX",  specs: "AM5 · DDR5 · PCIe 5.0 · WiFi 6E",         img: NI+"13-119-509-V01.jpg" },
  { id: "z790-edge",   name: "MSI MEG Z790 Edge",          price: 299, tier: "mid",    socket: "LGA1700", formFactor: "ATX",  specs: "LGA1700 · DDR5 · PCIe 5.0 · WiFi 6E",     img: NI+"13-144-635-03.png" },
  { id: "z790-aorus",  name: "Gigabyte Z790 Aorus Elite",  price: 279, tier: "mid",    socket: "LGA1700", formFactor: "ATX",  specs: "LGA1700 · DDR5 · PCIe 5.0 · WiFi 6E",     img: NI+"13-145-419-07.jpg" },
  { id: "x670e-hero",  name: "ASUS ROG Crosshair X670E",   price: 499, tier: "high",   socket: "AM5",     formFactor: "ATX",  specs: "AM5 · DDR5 · Flagship VRM",               img: NI+"13-119-494-V01.jpg" },
  { id: "z790-apex",   name: "ASUS ROG Maximus Z790 Apex", price: 599, tier: "high",   socket: "LGA1700", formFactor: "ATX",  specs: "LGA1700 · DDR5 · Extreme OC · 10Gb LAN" },
];
const RAMS: SimplePart[] = [
  { id: "ddr5-16-5600", name: "16 GB DDR5-5600",    price: 45,  tier: "budget", specs: "2×8 GB · DDR5-5600 · CL36" },
  { id: "ddr5-16",      name: "16 GB DDR5-6000",    price: 59,  tier: "budget", specs: "2×8 GB · DDR5-6000 · CL30",          img: NI+"20-232-976-S01.jpg" },
  { id: "ddr5-32a",     name: "32 GB DDR5-6000",    price: 89,  tier: "mid",    specs: "2×16 GB · DDR5-6000 · CL30",         img: NI+"20-232-978-S02.jpg" },
  { id: "ddr5-32b",     name: "32 GB DDR5-6400",    price: 109, tier: "mid",    specs: "2×16 GB · DDR5-6400 · CL32",         img: NI+"20-232-906-V01.jpg" },
  { id: "ddr5-32c",     name: "32 GB DDR5-6800",    price: 129, tier: "mid",    specs: "2×16 GB · DDR5-6800 · CL34 · XMP 3.0" },
  { id: "ddr5-64",      name: "64 GB DDR5-6000",    price: 169, tier: "high",   specs: "2×32 GB · DDR5-6000 · CL30",         img: NI+"20-232-979-S01.jpg" },
  { id: "ddr5-64b",     name: "64 GB DDR5-6400",    price: 199, tier: "high",   specs: "2×32 GB · DDR5-6400 · CL32 · RGB" },
  { id: "ddr5-96",      name: "96 GB DDR5-6000",    price: 279, tier: "high",   specs: "2×48 GB · DDR5-6000 · CL30" },
];
const STORAGES: SimplePart[] = [
  { id: "ssd-500-g4",  name: "500 GB NVMe Gen 4 SSD",   price: 45,  tier: "budget", specs: "5,000/4,200 MB/s · PCIe 4.0 · M.2" },
  { id: "ssd-1tb-g3",  name: "1 TB NVMe Gen 3 SSD",     price: 49,  tier: "budget", specs: "3,500/3,000 MB/s · PCIe 3.0 · M.2" },
  { id: "ssd-1tb-g4",  name: "1 TB NVMe Gen 4 SSD",     price: 69,  tier: "budget", specs: "7,000/6,500 MB/s · PCIe 4.0 · M.2",  img: NI+"20-147-791-V01.jpg" },
  { id: "ssd-2tb-g4",  name: "2 TB NVMe Gen 4 SSD",     price: 109, tier: "mid",    specs: "7,000/6,500 MB/s · PCIe 4.0 · M.2",  img: NI+"20-147-792-V01.jpg" },
  { id: "ssd-2tb-g4b", name: "2 TB NVMe Gen 4 SSD Pro", price: 139, tier: "mid",    specs: "7,400/6,900 MB/s · PCIe 4.0 · M.2" },
  { id: "ssd-4tb-g4",  name: "4 TB NVMe Gen 4 SSD",     price: 239, tier: "high",   specs: "7,200/6,900 MB/s · PCIe 4.0 · M.2" },
  { id: "ssd-2tb-g5",  name: "2 TB NVMe Gen 5 SSD",     price: 199, tier: "high",   specs: "12,000/11,000 MB/s · PCIe 5.0 · M.2" },
  { id: "ssd-4tb-g5",  name: "4 TB NVMe Gen 5 SSD",     price: 399, tier: "high",   specs: "12,000/11,000 MB/s · PCIe 5.0 · M.2" },
];
const PSUS: PSUPart[] = [
  { id: "psu-550g",  name: "EVGA SuperNOVA 550 G6",        price: 69,  tier: "budget", watts: 550,  specs: "550W · 80+ Gold · Fully modular" },
  { id: "psu-650g",  name: "Corsair RM650x",                price: 89,  tier: "budget", watts: 650,  specs: "650W · 80+ Gold · Fully modular",      img: NI+"17-139-259-S01.jpg" },
  { id: "psu-750g",  name: "Seasonic Focus GX-750",         price: 109, tier: "mid",    watts: 750,  specs: "750W · 80+ Gold · Fully modular",      img: NI+"17-151-235-V01.jpg" },
  { id: "psu-750p",  name: "be quiet! Pure Power 12M 750W", price: 99,  tier: "mid",    watts: 750,  specs: "750W · 80+ Gold · Semi-modular" },
  { id: "psu-850p",  name: "be quiet! Straight Power 850W", price: 139, tier: "mid",    watts: 850,  specs: "850W · 80+ Platinum · Fully modular" },
  { id: "psu-850g",  name: "Corsair RM850x",                price: 129, tier: "mid",    watts: 850,  specs: "850W · 80+ Gold · Fully modular",      img: NI+"17-139-270-V01.jpg" },
  { id: "psu-1000t", name: "Corsair HX1000",                price: 189, tier: "high",   watts: 1000, specs: "1000W · 80+ Platinum · Fully modular", img: NI+"17-139-229-V01.jpg" },
  { id: "psu-1200p", name: "Seasonic PRIME TX-1200",        price: 279, tier: "high",   watts: 1200, specs: "1200W · 80+ Titanium · Fully modular" },
];
const CASES: CasePart[] = [
  { id: "h5-flow",   name: "NZXT H5 Flow",              price: 89,  tier: "budget", supportedFormFactors: ["ATX","mATX","ITX"],         maxGpuMm: 365, specs: "Mid-tower · ATX/mATX/ITX · 365mm GPU" },
  { id: "meshify",   name: "Fractal Meshify C",          price: 99,  tier: "budget", supportedFormFactors: ["ATX","mATX","ITX"],         maxGpuMm: 315, specs: "Mid-tower · ATX/mATX/ITX · 315mm GPU",  img: NI+"11-352-069-V16.jpg" },
  { id: "p400a",     name: "Phanteks Eclipse P400A",     price: 79,  tier: "budget", supportedFormFactors: ["ATX","mATX","ITX"],         maxGpuMm: 355, specs: "Mid-tower · ATX/mATX · Mesh front",      img: NI+"11-854-077-V20.jpg" },
  { id: "4000d",     name: "Corsair 4000D Airflow",      price: 94,  tier: "budget", supportedFormFactors: ["ATX","mATX","ITX"],         maxGpuMm: 360, specs: "Mid-tower · ATX/mATX · Mesh front",      img: NI+"11-139-155-V01.jpg" },
  { id: "nr200p",    name: "Cooler Master NR200P",       price: 99,  tier: "mid",    supportedFormFactors: ["ITX"],                      maxGpuMm: 330, specs: "ITX · 330mm GPU · Compact",              img: NI+"11-119-453-25.png" },
  { id: "o11-evo",   name: "Lian Li O11 Dynamic EVO",   price: 169, tier: "mid",    supportedFormFactors: ["ATX","mATX","ITX"],         maxGpuMm: 446, specs: "Mid-tower · ATX/mATX/ITX · 446mm GPU" },
  { id: "define7",   name: "Fractal Design Define 7",    price: 189, tier: "mid",    supportedFormFactors: ["E-ATX","ATX","mATX","ITX"], maxGpuMm: 491, specs: "Full-tower · E-ATX · 491mm GPU",         img: NI+"11-352-106-V20.jpg" },
  { id: "h7-flow",   name: "NZXT H7 Flow",               price: 129, tier: "mid",    supportedFormFactors: ["ATX","mATX","ITX"],         maxGpuMm: 400, specs: "Mid-tower · ATX/mATX/ITX · 400mm GPU" },
  { id: "phanteks",  name: "Phanteks Enthoo 719",        price: 219, tier: "high",   supportedFormFactors: ["E-ATX","ATX","mATX","ITX"], maxGpuMm: 503, specs: "Full-tower · E-ATX · 503mm GPU",         img: NI+"11-854-065-V01.jpg" },
  { id: "o11-xl",    name: "Lian Li O11 Dynamic XL",     price: 199, tier: "high",   supportedFormFactors: ["E-ATX","ATX","mATX","ITX"], maxGpuMm: 480, specs: "Full-tower · E-ATX · 480mm GPU",         img: NI+"11-112-569-V01.jpg" },
];
const COOLERS: SimplePart[] = [
  { id: "wraith",     name: "AMD Wraith Stealth (Stock)", price: 0,   tier: "budget", specs: "Included · Up to 65W TDP" },
  { id: "hyper212",   name: "Cooler Master Hyper 212",    price: 35,  tier: "budget", specs: "Single-tower · 150mm · 120mm fan",   img: NI+"35-103-218-04.jpg" },
  { id: "nh-u12s",    name: "Noctua NH-U12S",             price: 79,  tier: "mid",    specs: "Single-tower · 158mm · 120mm fan",   img: NI+"AADYS200826AMgXr.jpg" },
  { id: "nh-d15",     name: "Noctua NH-D15",              price: 99,  tier: "mid",    specs: "Dual-tower · 165mm · Best air cooler",img: NI+"35-608-045-V02.jpg" },
  { id: "be-dark5",   name: "be quiet! Dark Rock 5",      price: 89,  tier: "mid",    specs: "Single-tower · 162mm · Silent" },
  { id: "kraken240",  name: "NZXT Kraken 240 AIO",        price: 109, tier: "mid",    specs: "240mm AIO · 2× 120mm fans" },
  { id: "kraken280",  name: "NZXT Kraken 280 AIO",        price: 129, tier: "mid",    specs: "280mm AIO · 2× 140mm fans" },
  { id: "kraken360",  name: "NZXT Kraken 360 AIO",        price: 149, tier: "high",   specs: "360mm AIO · 3× 120mm fans" },
  { id: "lc360",      name: "Corsair iCUE H150i Elite",   price: 169, tier: "high",   specs: "360mm AIO · 3× 120mm · LCD display", img: NI+"35-181-190-V11.jpg" },
  { id: "nh-d15g2",   name: "Noctua NH-D15 G2",           price: 149, tier: "high",   specs: "Dual-tower · 168mm · Top-tier air" },
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

const NO_BUDGET = 0; // sentinel: 0 means no limit
const BUDGET_PRESETS = [
  { label: "Low End",  sub: "Entry-level gaming",    value: 700  },
  { label: "Mid End",  sub: "1440p / streaming",     value: 1300 },
  { label: "High End", sub: "4K / content creation", value: 2200 },
  { label: "No Limit", sub: "Best of the best",      value: NO_BUDGET },
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
  mid:    { bg: "rgba(14,165,233,0.1)",  text: "#38bdf8", border: "rgba(14,165,233,0.25)" },
  high:   { bg: "rgba(168,85,247,0.1)",  text: "#c084fc", border: "rgba(168,85,247,0.25)" },
  ultra:  { bg: "rgba(251,146,60,0.1)",  text: "#fb923c", border: "rgba(251,146,60,0.25)" },
  search: { bg: "rgba(14,165,233,0.1)",  text: "#38bdf8", border: "rgba(14,165,233,0.25)" },
};

function gpuPairingNote(gpu: GPUPart, cpu?: CPUPart) {
  if (!cpu) return null;
  const d = gpu.perfScore - cpu.perfScore;
  if (Math.abs(d) <= 1) return { icon: "✦", text: "Well-balanced with your CPU", color: "#34d399" };
  if (d > 1)            return { icon: "↑", text: "GPU-heavy — great for future CPU upgrades", color: "#818cf8" };
  return                       { icon: "!", text: "CPU may bottleneck this GPU", color: "#f59e0b" };
}

// ─── Affiliate buy links — swap these URLs for your affiliate links ───────────
// To add affiliate tags: replace the URLs below with your tracked links.
// e.g. amazon: `https://www.amazon.com/s?k=...&tag=YOUR-TAG`
//      newegg: `https://www.newegg.com/p/pl?d=...&nm_mc=AFC-C8Junction&cm_mmc=AFC-C8Junction-_-na-_-na-_-na&cm_sp=&AID=YOUR-ID`

// Extract a direct Newegg product URL from a CDN image URL.

// Module-level cache: partId → KV price data (keyed by catalog id or name)
interface CachedPrices {
  newegg: { price: number; link: string } | null;
  amazon: { price: number; link: string } | null;
  lastChecked: string | null; // ISO string from KV
}
const _kvCache: Record<string, CachedPrices | null> = {};
const _kvPending: Record<string, Promise<CachedPrices | null>> = {};
const _cheaperCache: Record<string, "newegg" | "amazon" | null> = {};

function getLowestKvPrice(cached: CachedPrices | null): number | null {
  if (!cached) return null;
  const prices = [cached.newegg?.price, cached.amazon?.price].filter((p): p is number => p != null);
  return prices.length ? Math.min(...prices) : null;
}

async function fetchKvPrices(id: string): Promise<CachedPrices | null> {
  if (id in _kvCache) return _kvCache[id];
  if (id in _kvPending) return _kvPending[id];
  const p = fetch(`/api/prices?id=${encodeURIComponent(id)}`)
    .then(r => r.ok ? r.json() : null)
    .then((data: { newegg: { price: number; link: string } | null; amazon: { price: number; link: string } | null; lastChecked: string | null } | null) => {
      const cached: CachedPrices | null = data
        ? { newegg: data.newegg ?? null, amazon: data.amazon ?? null, lastChecked: data.lastChecked ?? null }
        : null;
      _kvCache[id] = cached;
      delete _kvPending[id];
      return cached;
    })
    .catch(() => { _kvCache[id] = null; delete _kvPending[id]; return null; });
  _kvPending[id] = p;
  return p;
}

// Live price display component — shows lowest of newegg/amazon from KV, falls back to static
function LivePrice({ id, fallback, style }: { id?: string; fallback?: number; style?: React.CSSProperties }) {
  const [price, setPrice] = useState<number | null>(() =>
    id && id in _kvCache ? (getLowestKvPrice(_kvCache[id]) ?? fallback ?? null) : (fallback ?? null)
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchKvPrices(id).then(cached => {
      if (cancelled) return;
      setPrice(getLowestKvPrice(cached) ?? fallback ?? null);
    });
    return () => { cancelled = true; };
  }, [id, fallback]);

  if (price == null) return <span style={style}>—</span>;
  return <span style={style}>${price.toFixed(2)}</span>;
}

function hoursAgo(iso: string | null): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h === 1) return "1 hour ago";
  if (h < 24) return `${h} hours ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

function BuyButtons({ id, name, staticPrice }: { id?: string; name: string; staticPrice?: number }) {
  const fallbackNewegg = `https://www.newegg.com/p/pl?d=${encodeURIComponent(name)}`;
  const fallbackAmazon = `https://www.amazon.com/s?k=${encodeURIComponent(name)}`;

  const [kvPrices, setKvPrices] = useState<CachedPrices | null>(() =>
    id && id in _kvCache ? _kvCache[id] : null
  );
  const [cheaper, setCheaper] = useState<"newegg" | "amazon" | null>(
    name in _cheaperCache ? _cheaperCache[name] : null
  );

  useEffect(() => {
    let cancelled = false;
    if (id) {
      fetchKvPrices(id).then(cached => {
        if (cancelled) return;
        setKvPrices(cached);
        if (cached?.newegg && cached?.amazon) {
          const result = cached.newegg.price <= cached.amazon.price ? "newegg" : "amazon";
          _cheaperCache[name] = result;
          setCheaper(result);
        }
      });
    } else {
      // No catalog id (AI build) — fall back to live comparison scrape
      if (name in _cheaperCache) { setCheaper(_cheaperCache[name]); return; }
      fetch(`/api/compare?q=${encodeURIComponent(name)}`)
        .then(r => r.json())
        .then(({ newegg: np, amazon: ap }: { newegg: number | null; amazon: number | null }) => {
          if (cancelled) return;
          const result = np != null && ap != null ? (np <= ap ? "newegg" : "amazon") : null;
          _cheaperCache[name] = result;
          setCheaper(result);
        })
        .catch(() => { _cheaperCache[name] = null; });
    }
    return () => { cancelled = true; };
  }, [id, name]);

  const neweggPrice = kvPrices?.newegg?.price ?? staticPrice;
  const amazonPrice = kvPrices?.amazon?.price ?? staticPrice;
  const neweggLink  = kvPrices?.newegg?.link  ?? fallbackNewegg;
  const amazonLink  = kvPrices?.amazon?.link  ?? fallbackAmazon;
  const lastChecked = kvPrices?.lastChecked ?? null;

  const resolvedCheaper = cheaper ?? (
    kvPrices?.newegg && kvPrices?.amazon
      ? (kvPrices.newegg.price <= kvPrices.amazon.price ? "newegg" : "amazon")
      : null
  );

  function btnStyle(store: "newegg" | "amazon") {
    const isWinner = resolvedCheaper === store;
    return {
      background: isWinner ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.04)",
      color:      isWinner ? "#6ee7b7"                : "rgba(255,255,255,0.35)",
      border:     isWinner ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.08)",
    };
  }
  function hoverStyle(store: "newegg" | "amazon", el: HTMLElement, enter: boolean) {
    const isWinner = resolvedCheaper === store;
    el.style.background = enter
      ? (isWinner ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.08)")
      : (isWinner ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.04)");
    el.style.color = enter
      ? (isWinner ? "#a7f3d0" : "rgba(255,255,255,0.6)")
      : (isWinner ? "#6ee7b7" : "rgba(255,255,255,0.35)");
  }

  const neweggLabel = neweggPrice != null ? ` $${neweggPrice.toFixed(2)}` : "";
  const amazonLabel = amazonPrice != null ? ` $${amazonPrice.toFixed(2)}` : "";
  const checkedLabel = hoursAgo(lastChecked);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <a href={neweggLink} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
            borderRadius: 6, fontSize: 11, fontWeight: 500, textDecoration: "none",
            transition: "all 0.15s", ...btnStyle("newegg") }}
          onMouseEnter={e => hoverStyle("newegg", e.currentTarget as HTMLElement, true)}
          onMouseLeave={e => hoverStyle("newegg", e.currentTarget as HTMLElement, false)}>
          Newegg{neweggLabel} ↗
        </a>
        <a href={amazonLink} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
            borderRadius: 6, fontSize: 11, fontWeight: 500, textDecoration: "none",
            transition: "all 0.15s", ...btnStyle("amazon") }}
          onMouseEnter={e => hoverStyle("amazon", e.currentTarget as HTMLElement, true)}
          onMouseLeave={e => hoverStyle("amazon", e.currentTarget as HTMLElement, false)}>
          Amazon{amazonLabel} ↗
        </a>
      </div>
      {checkedLabel && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
          Price last checked {checkedLabel}
        </span>
      )}
    </div>
  );
}

// ─── State sales tax rates (2024) ────────────────────────────────────────────

const STATE_TAX: Record<string, number> = {
  AL:0.04,AK:0,AZ:0.056,AR:0.065,CA:0.0725,CO:0.029,CT:0.0635,DE:0,
  FL:0.06,GA:0.04,HI:0.04,ID:0.06,IL:0.0625,IN:0.07,IA:0.06,KS:0.065,
  KY:0.06,LA:0.0445,ME:0.055,MD:0.06,MA:0.0625,MI:0.06,MN:0.06875,
  MS:0.07,MO:0.04225,MT:0,NE:0.055,NV:0.0685,NH:0,NJ:0.06625,NM:0.05125,
  NY:0.04,NC:0.0475,ND:0.05,OH:0.0575,OK:0.045,OR:0,PA:0.06,RI:0.07,
  SC:0.06,SD:0.045,TN:0.07,TX:0.0625,UT:0.061,VT:0.06,VA:0.053,
  WA:0.065,WV:0.06,WI:0.05,WY:0.04,DC:0.06,
};

const US_STATES = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","D.C."],["FL","Florida"],
  ["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],
  ["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],
  ["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],
  ["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],
  ["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],
  ["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],
  ["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],
  ["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],
  ["WY","Wyoming"],
] as const;

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg:        "#07090f",
  surface:   "#0d1117",
  surfaceHi: "#131820",
  border:    "#1a1f2e",
  borderHi:  "#222840",
  text:      "#e2e8f0",
  textMid:   "#8892a4",
  textDim:   "#434d60",
  accent:    "#0ea5e9",
  accentHi:  "#38bdf8",
  grad:      "linear-gradient(135deg, #0284c7, #0ea5e9)",
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

// Stat bar definitions per slot
const SLOT_STATS: Partial<Record<ComponentKey, { key: string; label: string; max: number; unit?: string; lowerBetter?: boolean }[]>> = {
  cpu: [
    { key: "perfScore", label: "Performance", max: 10 },
    { key: "tdp",       label: "TDP",         max: 200, unit: "W", lowerBetter: true },
  ],
  gpu: [
    { key: "perfScore", label: "Performance", max: 10 },
    { key: "vram",      label: "VRAM",        max: 24, unit: "GB" },
    { key: "powerW",    label: "Power Draw",  max: 450, unit: "W", lowerBetter: true },
  ],
  psu: [
    { key: "watts", label: "Wattage", max: 1200, unit: "W" },
  ],
  case: [
    { key: "maxGpuMm", label: "GPU Clearance", max: 503, unit: "mm" },
  ],
};

function StatBar({ value, max, lowerBetter }: { value: number; max: number; lowerBetter?: boolean }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = lowerBetter
    ? pct < 40 ? "#34d399" : pct < 70 ? "#fcd34d" : "#f87171"
    : pct < 40 ? "#60a5fa" : pct < 70 ? "#a78bfa" : "#34d399";
  return (
    <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: color, transition: "width 0.2s" }} />
    </div>
  );
}

// ─── Hardware slot icons ──────────────────────────────────────────────────────

function SlotIcon({ slot, size = 48 }: { slot: ComponentKey; size?: number }) {
  const s = size;
  const icons: Record<ComponentKey, ReactElement> = {
    cpu: (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="13" y="13" width="22" height="22" rx="3" fill="#0ea5e9" opacity="0.15" stroke="#0ea5e9" strokeWidth="1.5"/>
        <rect x="17" y="17" width="14" height="14" rx="1.5" fill="#0ea5e9" opacity="0.3"/>
        <rect x="20" y="20" width="8" height="8" rx="1" fill="#0ea5e9" opacity="0.7"/>
        {[16,20,24,28].map(y => <line key={`l${y}`} x1="6" y1={y} x2="13" y2={y} stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round"/>)}
        {[16,20,24,28].map(y => <line key={`r${y}`} x1="35" y1={y} x2="42" y2={y} stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round"/>)}
        {[16,20,24,28].map(x => <line key={`t${x}`} x1={x} y1="6" x2={x} y2="13" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round"/>)}
        {[16,20,24,28].map(x => <line key={`b${x}`} x1={x} y1="35" x2={x} y2="42" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round"/>)}
      </svg>
    ),
    gpu: (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="15" width="36" height="20" rx="3" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="1.5"/>
        <circle cx="16" cy="25" r="6" fill="#8b5cf6" opacity="0.2" stroke="#8b5cf6" strokeWidth="1.2"/>
        <circle cx="16" cy="25" r="2.5" fill="#8b5cf6" opacity="0.8"/>
        <circle cx="30" cy="25" r="6" fill="#8b5cf6" opacity="0.2" stroke="#8b5cf6" strokeWidth="1.2"/>
        <circle cx="30" cy="25" r="2.5" fill="#8b5cf6" opacity="0.8"/>
        <rect x="8" y="35" width="30" height="3" rx="1" fill="#8b5cf6" opacity="0.5"/>
        <line x1="40" y1="18" x2="44" y2="18" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="21" x2="44" y2="21" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="24" x2="44" y2="24" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    motherboard: (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="38" height="38" rx="3" fill="#10b981" opacity="0.1" stroke="#10b981" strokeWidth="1.5"/>
        <rect x="10" y="10" width="12" height="12" rx="1.5" fill="#10b981" opacity="0.3" stroke="#10b981" strokeWidth="1"/>
        <rect x="26" y="10" width="12" height="5" rx="1" fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="1"/>
        <rect x="26" y="17" width="12" height="5" rx="1" fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="1"/>
        <rect x="10" y="26" width="28" height="5" rx="1" fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="1"/>
        <rect x="10" y="33" width="28" height="5" rx="1" fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="1"/>
        <line x1="5" y1="24" x2="43" y2="24" stroke="#10b981" strokeWidth="0.5" opacity="0.4"/>
        <line x1="24" y1="5" x2="24" y2="43" stroke="#10b981" strokeWidth="0.5" opacity="0.4"/>
      </svg>
    ),
    ram: (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="6" width="8" height="36" rx="2" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5"/>
        <rect x="26" y="6" width="8" height="36" rx="2" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5"/>
        {[10,14,18,22,26,30,34].map(y => <rect key={`l${y}`} x="15.5" y={y} width="5" height="2" rx="0.5" fill="#f59e0b" opacity="0.6"/>)}
        {[10,14,18,22,26,30,34].map(y => <rect key={`r${y}`} x="27.5" y={y} width="5" height="2" rx="0.5" fill="#f59e0b" opacity="0.6"/>)}
        <rect x="14" y="38" width="8" height="4" rx="1" fill="#f59e0b" opacity="0.4"/>
        <rect x="26" y="38" width="8" height="4" rx="1" fill="#f59e0b" opacity="0.4"/>
      </svg>
    ),
    storage: (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="19" width="36" height="10" rx="2" fill="#06b6d4" opacity="0.15" stroke="#06b6d4" strokeWidth="1.5"/>
        <rect x="6" y="29" width="36" height="3" rx="1" fill="#06b6d4" opacity="0.3"/>
        {[10,16,22,28,32,36].map(x => <rect key={x} x={x} y="21" width="3" height="6" rx="0.5" fill="#06b6d4" opacity="0.5"/>)}
        <circle cx="38" cy="24" r="3" fill="#06b6d4" opacity="0.7"/>
        <circle cx="38" cy="24" r="1.2" fill="#06b6d4"/>
      </svg>
    ),
    psu: (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="28" height="28" rx="3" fill="#34d399" opacity="0.1" stroke="#34d399" strokeWidth="1.5"/>
        <circle cx="20" cy="24" r="8" fill="none" stroke="#34d399" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="20" cy="24" r="3" fill="#34d399" opacity="0.8"/>
        <line x1="20" y1="16" x2="20" y2="18" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="20" y1="30" x2="20" y2="32" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="28" y1="24" x2="30" y2="24" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="24" x2="10" y2="24" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="34" y="15" width="8" height="3" rx="1" fill="#34d399" opacity="0.5"/>
        <rect x="34" y="20" width="8" height="3" rx="1" fill="#34d399" opacity="0.5"/>
        <rect x="34" y="25" width="8" height="3" rx="1" fill="#34d399" opacity="0.5"/>
        <rect x="34" y="30" width="8" height="3" rx="1" fill="#34d399" opacity="0.5"/>
      </svg>
    ),
    case: (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="4" width="22" height="40" rx="3" fill="#6366f1" opacity="0.1" stroke="#6366f1" strokeWidth="1.5"/>
        <rect x="13" y="8" width="7" height="10" rx="1.5" fill="#6366f1" opacity="0.3" stroke="#6366f1" strokeWidth="1"/>
        <circle cx="30" cy="12" r="3" fill="#6366f1" opacity="0.5"/>
        <circle cx="30" cy="12" r="1.2" fill="#6366f1"/>
        <rect x="13" y="22" width="16" height="14" rx="1.5" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.4"/>
        <line x1="13" y1="40" x2="32" y2="40" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    cooler: (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="16" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.4"/>
        <circle cx="24" cy="24" r="4" fill="#f43f5e" opacity="0.6"/>
        <path d="M24 8 C24 8 28 16 24 20 C20 16 24 8 24 8Z" fill="#f43f5e" opacity="0.5"/>
        <path d="M40 24 C40 24 32 28 28 24 C32 20 40 24 40 24Z" fill="#f43f5e" opacity="0.5"/>
        <path d="M24 40 C24 40 20 32 24 28 C28 32 24 40 24 40Z" fill="#f43f5e" opacity="0.5"/>
        <path d="M8 24 C8 24 16 20 20 24 C16 28 8 24 8 24Z" fill="#f43f5e" opacity="0.5"/>
        <path d="M35.3 12.7 C35.3 12.7 29.3 18.7 24.7 16.7 C26.7 12.1 35.3 12.7 35.3 12.7Z" fill="#f43f5e" opacity="0.4"/>
        <path d="M35.3 35.3 C35.3 35.3 29.3 29.3 31.3 24.7 C35.9 26.7 35.3 35.3 35.3 35.3Z" fill="#f43f5e" opacity="0.4"/>
        <path d="M12.7 35.3 C12.7 35.3 18.7 29.3 23.3 31.3 C21.3 35.9 12.7 35.3 12.7 35.3Z" fill="#f43f5e" opacity="0.4"/>
        <path d="M12.7 12.7 C12.7 12.7 18.7 18.7 16.7 23.3 C12.1 21.3 12.7 12.7 12.7 12.7Z" fill="#f43f5e" opacity="0.4"/>
      </svg>
    ),
  };
  return icons[slot] ?? null;
}

// Estimate system wattage given current selections + a candidate part for a slot
function estimateWatts(sel: SelectedParts, slot: ComponentKey, candidate: AnyPart | null): number {
  const cpu  = slot === "cpu"  ? (candidate as CPUPart | null)  : sel.cpu;
  const gpu  = slot === "gpu"  ? (candidate as GPUPart | null)  : sel.gpu;
  const cpuW = cpu ? cpu.tdp : 0;
  const gpuW = gpu ? gpu.powerW : 0;
  return cpuW + gpuW + 80; // 80W for mobo, ram, storage, fans
}

function PartModal({ slot, selected, onSelect, onClose }: {
  slot: ComponentKey; selected: SelectedParts;
  onSelect: (p: AnyPart) => void; onClose: () => void;
}) {
  const meta       = COMPONENT_META[slot];
  const staticList = STATIC_PARTS[slot] as AnyPart[];
  const [query,        setQuery]        = useState("");
  const [results,      setResults]      = useState<SearchResult[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [filterTier,   setFilterTier]   = useState("all");
  const [filterMfr,    setFilterMfr]    = useState("all");
  const [filterSocket, setFilterSocket] = useState("all");
  const [sortBy,       setSortBy]       = useState("default");
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

  const showSearch = query.trim().length > 0;
  const selectedId = (selected as any)[slot]?.id;
  const isGpu = slot === "gpu";
  const isCpu = slot === "cpu";
  const stats = SLOT_STATS[slot];

  // Infer manufacturer from part name
  function getMfr(p: AnyPart): string {
    const n = p.name;
    if (n.startsWith("AMD") || n.startsWith("Ryzen") || n.startsWith("EPYC")) return "AMD";
    if (n.startsWith("Intel") || n.startsWith("Core") || n.startsWith("Xeon")) return "Intel";
    if (n.startsWith("NVIDIA") || n.startsWith("RTX") || n.startsWith("GTX")) return "NVIDIA";
    return "Other";
  }

  // Build filtered + sorted static list
  let filteredStatic = staticList.slice();
  if (filterTier !== "all")   filteredStatic = filteredStatic.filter(p => p.tier === filterTier);
  if (filterMfr  !== "all")   filteredStatic = filteredStatic.filter(p => getMfr(p) === filterMfr);
  if (filterSocket !== "all" && isCpu) filteredStatic = filteredStatic.filter(p => (p as CPUPart).socket === filterSocket);

  const SORT_FNS: Record<string, (a: AnyPart, b: AnyPart) => number> = {
    default:     () => 0,
    price_asc:   (a, b) => a.price - b.price,
    price_desc:  (a, b) => b.price - a.price,
    perf:        (a, b) => ((b as any).perfScore ?? 0) - ((a as any).perfScore ?? 0),
    cores:       (a, b) => ((b as CPUPart).cores ?? 0) - ((a as CPUPart).cores ?? 0),
    threads:     (a, b) => ((b as CPUPart).threads ?? 0) - ((a as CPUPart).threads ?? 0),
    clock:       (a, b) => ((b as CPUPart).boostClock ?? 0) - ((a as CPUPart).boostClock ?? 0),
    vram:        (a, b) => ((b as GPUPart).vram ?? 0) - ((a as GPUPart).vram ?? 0),
    power:       (a, b) => ((a as any).powerW ?? (a as any).tdp ?? 0) - ((b as any).powerW ?? (b as any).tdp ?? 0),
    watts:       (a, b) => ((b as PSUPart).watts ?? 0) - ((a as PSUPart).watts ?? 0),
  };
  if (sortBy !== "default") filteredStatic = [...filteredStatic].sort(SORT_FNS[sortBy] ?? (() => 0));

  const displayList = showSearch ? results : filteredStatic;

  // Per-part wattage accessor
  function partWatts(p: AnyPart): number | null {
    if ((p as CPUPart).tdp != null)    return (p as CPUPart).tdp;
    if ((p as GPUPart).powerW != null) return (p as GPUPart).powerW;
    if ((p as PSUPart).watts != null)  return (p as PSUPart).watts;
    return null;
  }

  // Available filter options based on slot
  const mfrOptions: string[] = slot === "gpu"
    ? ["all", "NVIDIA", "AMD"]
    : (isCpu ? ["all", "AMD", "Intel"] : []);
  const socketOptions: string[] = isCpu ? ["all", "AM5", "LGA1700"] : [];
  const sortOptions: { val: string; label: string }[] = [
    { val: "default",    label: "Default" },
    { val: "price_asc",  label: "Price ↑" },
    { val: "price_desc", label: "Price ↓" },
    { val: "perf",       label: "Performance" },
    ...(isCpu ? [
      { val: "cores",   label: "Core Count" },
      { val: "threads", label: "Thread Count" },
      { val: "clock",   label: "Boost Clock" },
      { val: "power",   label: "TDP (low→high)" },
    ] : []),
    ...(isGpu ? [
      { val: "vram",  label: "VRAM" },
      { val: "power", label: "Power (low→high)" },
    ] : []),
    ...(slot === "psu" ? [{ val: "watts", label: "Wattage" }] : []),
  ];

  const tiers = [
    { val: "all",    label: "All" },
    { val: "budget", label: "Low End" },
    { val: "mid",    label: "Mid End" },
    { val: "high",   label: "High End" },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
      background: "rgba(4,5,10,0.85)", backdropFilter: "blur(8px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 1400,
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        background: T.surface, border: `1px solid ${T.borderHi}`,
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{meta.icon}</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>{meta.label}</span>
              {isGpu && selected.cpu && (
                <span style={{ fontSize: 12, color: T.textDim }}>· matched to {selected.cpu.name}</span>
              )}
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.surfaceHi, color: T.textMid, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, color: T.textDim, pointerEvents: "none" }}>⌕</span>
            <input autoFocus type="text" value={query} onChange={e => handleSearch(e.target.value)}
              placeholder={`Search Newegg for ${meta.label.toLowerCase()}…`}
              style={{ width: "100%", padding: "10px 14px 10px 38px", background: T.bg,
                border: `1px solid ${T.border}`, borderRadius: 10, color: T.text,
                fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = T.accent)}
              onBlur={e => (e.target.style.borderColor = T.border)} />
            {searching && (
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                fontSize: 11, color: T.accent, fontWeight: 600 }}>Searching…</span>
            )}
          </div>

          {/* Filter + sort controls */}
          {!showSearch && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {/* Tier pills */}
              <div style={{ display: "flex", gap: 4 }}>
                {tiers.map(t => (
                  <button key={t.val} onClick={() => setFilterTier(t.val)}
                    style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", border: `1px solid ${filterTier === t.val ? T.accent : T.border}`,
                      background: filterTier === t.val ? "rgba(14,165,233,0.15)" : "transparent",
                      color: filterTier === t.val ? T.accentHi : T.textDim, transition: "all 0.1s" }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Manufacturer pills */}
              {mfrOptions.length > 0 && (
                <>
                  <div style={{ width: 1, height: 16, background: T.border }} />
                  <div style={{ display: "flex", gap: 4 }}>
                    {mfrOptions.map(m => (
                      <button key={m} onClick={() => setFilterMfr(m)}
                        style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          cursor: "pointer", border: `1px solid ${filterMfr === m ? T.accent : T.border}`,
                          background: filterMfr === m ? "rgba(14,165,233,0.15)" : "transparent",
                          color: filterMfr === m ? T.accentHi : T.textDim, transition: "all 0.1s" }}>
                        {m === "all" ? "All Brands" : m}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Socket pills */}
              {socketOptions.length > 0 && (
                <>
                  <div style={{ width: 1, height: 16, background: T.border }} />
                  <div style={{ display: "flex", gap: 4 }}>
                    {socketOptions.map(s => (
                      <button key={s} onClick={() => setFilterSocket(s)}
                        style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          cursor: "pointer", border: `1px solid ${filterSocket === s ? T.accent : T.border}`,
                          background: filterSocket === s ? "rgba(14,165,233,0.15)" : "transparent",
                          color: filterSocket === s ? T.accentHi : T.textDim, transition: "all 0.1s" }}>
                        {s === "all" ? "All Sockets" : s}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Sort dropdown */}
              <div style={{ marginLeft: "auto" }}>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ padding: "4px 8px", background: T.surfaceHi, border: `1px solid ${T.border}`,
                    borderRadius: 7, color: T.textMid, fontSize: 11, outline: "none", cursor: "pointer" }}>
                  {sortOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
              </div>
            </div>
          )}

          <div style={{ height: 1, background: T.border, margin: "0 -24px" }} />
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1, padding: "10px 16px 16px" }}>
          {displayList.length === 0 && !searching && (
            <div style={{ textAlign: "center", padding: "48px 0", color: T.textDim, fontSize: 14 }}>
              {showSearch ? "No results — try a different search" : "No parts in this tier"}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {displayList.map((part, i) => {
              const isSearchResult = "source" in part;
              const pid   = isSearchResult ? `s-${i}` : (part as AnyPart).id;
              const isSel = !isSearchResult && pid === selectedId;
              const note  = isGpu && !isSearchResult ? gpuPairingNote(part as GPUPart, selected.cpu) : null;

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
                  style={{ textAlign: "left", padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                    background: isSel ? "rgba(14,165,233,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isSel ? T.accent : T.border}`,
                    transition: "all 0.1s" }}
>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    {/* Part image / icon */}
                    {!isSearchResult && (() => {
                      const imgUrl = (part as AnyPart & { img?: string }).img;
                      return (
                        <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 12,
                          background: imgUrl ? "#fff" : "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={part.name}
                              width={56}
                              height={56}
                              style={{ objectFit: "contain", width: 56, height: 56, mixBlendMode: "multiply" }}
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = "none";
                                (target.parentElement as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div style={{ display: imgUrl ? "none" : "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                            <SlotIcon slot={slot} size={36} />
                          </div>
                        </div>
                      );
                    })()}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + badges row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: "-0.01em" }}>{part.name}</span>
                        {!isSearchResult && <TierBadge tier={(part as AnyPart).tier} />}
                        {isSel && <span style={{ fontSize: 10, fontWeight: 700, color: T.accent,
                          background: "rgba(14,165,233,0.15)", borderRadius: 4, padding: "1px 6px" }}>SELECTED</span>}
                      </div>
                      {/* Specs — one concise line */}
                      <p style={{ fontSize: 11, color: T.textDim, margin: "0 0 6px" }}>{(part as any).specs}</p>
                      {/* Stat bars — subtle, secondary info */}
                      {stats && !isSearchResult && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 6 }}>
                          {stats.map(s => {
                            const val = (part as any)[s.key];
                            if (val == null) return null;
                            return (
                              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 10, color: T.textDim, width: 70, flexShrink: 0 }}>{s.label}</span>
                                <StatBar value={val} max={s.max} lowerBetter={s.lowerBetter} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: T.textMid, width: 36, textAlign: "right", flexShrink: 0 }}>
                                  {val}{s.unit ?? ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {note && (
                        <p style={{ fontSize: 11, fontWeight: 500, margin: "0 0 4px", color: note.color }}>
                          {note.icon} {note.text}
                        </p>
                      )}
                      <BuyButtons id={isSearchResult ? undefined : (part as AnyPart).id} name={part.name} staticPrice={(part as any).price} />
                    </div>
                    {/* Price + wattage column */}
                    <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <LivePrice
                        id={isSearchResult ? undefined : (part as AnyPart).id}
                        fallback={(part as any).price}
                        style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: "-0.03em", lineHeight: 1 }}
                      />
                      {!isSearchResult && (() => { const w = partWatts(part as AnyPart); return w != null ? (
                        <div style={{ fontSize: 10, fontWeight: 600, color: slot === "psu" ? "#34d399" : "#f59e0b",
                          background: slot === "psu" ? "rgba(52,211,153,0.1)" : "rgba(245,158,11,0.1)",
                          border: `1px solid ${slot === "psu" ? "rgba(52,211,153,0.2)" : "rgba(245,158,11,0.2)"}`,
                          borderRadius: 5, padding: "2px 6px" }}>
                          ⚡ {w}W{slot === "psu" ? " max" : ""}
                        </div>
                      ) : null; })()}
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

function BudgetPresets({ value, onChange, cols = 4 }: { value: number; onChange: (v: number) => void; cols?: number }) {
  return (
    <div className="or-budget-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 8, marginBottom: 12 }}>
      {BUDGET_PRESETS.map(p => {
        const active = value === p.value;
        const isNoLimit = p.value === NO_BUDGET;
        return (
          <button key={p.label} type="button" onClick={() => onChange(p.value)}
            style={{ textAlign: "left", padding: "10px 10px", borderRadius: 12, cursor: "pointer",
              background: active ? (isNoLimit ? "rgba(251,191,36,0.12)" : "rgba(99,102,241,0.12)") : T.surfaceHi,
              border: `1px solid ${active ? (isNoLimit ? "rgba(251,191,36,0.5)" : "rgba(99,102,241,0.5)") : T.border}`,
              transition: "all 0.12s", minWidth: 0 }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = T.borderHi; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = T.border; }}>
            <div style={{ fontSize: 10, fontWeight: 600,
              color: active ? (isNoLimit ? "#fbbf24" : T.accentHi) : T.textDim,
              letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: active ? T.text : T.textMid,
              letterSpacing: "-0.02em", marginBottom: 2 }}>
              {isNoLimit ? "∞" : `$${p.value.toLocaleString()}`}
            </div>
            <div style={{ fontSize: 10, color: T.textDim,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.sub}</div>
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
  const [customBudgetStr, setCustomBudgetStr] = useState("1300");
  const [mode,         setMode]         = useState<"ai" | "custom">("ai");
  const [tab,          setTab]          = useState<"build" | "prebuilt">("build");
  const [stateCode,    setStateCode]    = useState("");
  const [livePrices,   setLivePrices]   = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => { if (d.region_code && STATE_TAX[d.region_code] !== undefined) setStateCode(d.region_code); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const slots = Object.keys(selected) as ComponentKey[];
    if (!slots.length) return;
    const updates: Record<string, number> = {};
    Promise.all(slots.map(async slot => {
      const part = (selected as any)[slot] as AnyPart;
      if (!part?.id) return;
      const cached = await fetchKvPrices(part.id);
      const lowest = getLowestKvPrice(cached);
      if (lowest != null) updates[slot] = lowest;
    })).then(() => {
      setLivePrices(prev => ({ ...prev, ...updates }));
    });
  }, [selected]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setAiBuild(null);
    const res  = await fetch("/api/build", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget: Number(budget) === NO_BUDGET ? null : Number(budget), useCase, notes }) });
    setAiBuild(await res.json());
    setLoading(false);
  }

  const customTotal = (Object.keys(selected) as ComponentKey[]).reduce((s, slot) => {
    const p = (selected as any)[slot] as AnyPart | undefined;
    return s + (livePrices[slot] ?? (p as any)?.price ?? 0);
  }, 0);
  const taxRate      = stateCode ? (STATE_TAX[stateCode] ?? 0) : 0;
  const taxAmount    = Math.round(customTotal * taxRate * 100) / 100;
  const totalWithTax = customTotal + taxAmount;
  const customRemaining = customBudget - totalWithTax;
  const compatIssues    = getCompatIssues(selected);

  // Wattage breakdown
  const wattCpu  = selected.cpu?.tdp ?? 0;
  const wattGpu  = selected.gpu?.powerW ?? 0;

  // Per-component estimates
  const wattMobo    = selected.motherboard ? 25 : 0;
  const wattRam     = selected.ram ? 8 : 0;
  const wattStorage = (() => {
    if (!selected.storage) return 0;
    const n = selected.storage.name;
    if (n.includes("Gen 5")) return 10;
    if (n.includes("Gen 4")) return 6;
    return 4; // Gen 3 or unknown
  })();
  const wattCooler = (() => {
    if (!selected.cooler) return 0;
    const id = selected.cooler.id;
    if (id === "lc360" || id === "kraken360") return 18;
    if (id === "kraken280") return 14;
    if (id === "kraken240") return 12;
    if (id === "nh-d15" || id === "nh-d15g2" || id === "be-dark5") return 7;
    if (id === "nh-u12s" || id === "hyper212") return 5;
    return 3; // stock / light cooler
  })();
  const wattCaseFans = selected.case ? 15 : 0; // ~3 case fans at ~5W avg
  const wattPlatform = wattMobo + wattRam + wattStorage + wattCooler + wattCaseFans;
  const wattTotal    = wattCpu + wattGpu + wattPlatform;
  const wattPsu      = selected.psu?.watts ?? 0;
  const wattPct      = wattPsu ? Math.min(100, (wattTotal / wattPsu) * 100) : 0;
  const wattOverload = wattPsu > 0 && wattTotal > wattPsu * 0.85;

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .or-ai-layout   { grid-template-columns: 1fr !important; }
          .or-cb-layout   { grid-template-columns: 1fr !important; }
          .or-parts-row   { grid-template-columns: 20px 1fr auto !important; }
          .or-parts-row .or-parts-name-col  { display: none; }
          .or-budget-grid { grid-template-columns: 1fr 1fr !important; }
          .or-trust-row   { gap: 14px !important; flex-direction: column; align-items: center; }
          .or-ai-result   { grid-template-columns: 1fr !important; }
          .or-part-price-col { display: none; }
        }
      `}</style>
      {openSlot && (
        <PartModal slot={openSlot} selected={selected}
          onSelect={p => setSelected(prev => ({ ...prev, [openSlot]: p }))}
          onClose={() => setOpenSlot(null)} />
      )}

      <main style={{ minHeight: "100vh", background: T.bg, color: T.text,
        fontFamily: "var(--font-geist-sans), 'Inter', system-ui, sans-serif" }}>

        {/* ── Nav ── */}
        <nav style={{ borderBottom: `1px solid ${T.border}`, background: T.surface,
          position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px",
            height: 50, display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/android-chrome-192x192.png" alt="Override"
              style={{ width: 24, height: 24, borderRadius: 5, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: "-0.01em" }}>Override</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 0 }}>
              {(["build", "prebuilt"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: "6px 20px", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", border: "none", background: "transparent",
                    transition: "all 0.15s", letterSpacing: "-0.01em",
                    color: tab === t ? T.text : T.textDim,
                    borderBottom: tab === t ? `2px solid ${T.accent}` : "2px solid transparent" }}>
                  {t === "build" ? "Build" : "Prebuilt"}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* ── Prebuilt ── */}
        {tab === "prebuilt" && (
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "80px 32px",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, color: T.textDim }}>working</span>
          </div>
        )}

        {/* ── Build ── */}
        {tab === "build" && (
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 32px 80px" }}>

            {/* Page header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{ fontSize: 48, fontWeight: 800, color: T.text, margin: "0 0 10px",
                letterSpacing: "-0.04em", lineHeight: 1 }}>Build a PC</h1>
              <p style={{ fontSize: 17, color: T.textMid, margin: "0 0 20px", fontWeight: 500, letterSpacing: "-0.01em" }}>
                PC building just became easy
              </p>
              {/* Trust signals */}
              <div className="or-trust-row" style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 24, flexWrap: "wrap" }}>
                {[
                  { icon: "🎯", text: "Set your budget & use case" },
                  { icon: "🔧", text: "Get a full compatible build" },
                  { icon: "✅", text: "Every choice explained" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 7,
                    fontSize: 13, color: T.textDim, fontWeight: 500 }}>
                    <span style={{ fontSize: 15 }}>{icon}</span>
                    <span style={{ borderBottom: `1px solid rgba(14,165,233,0.25)`, paddingBottom: 1 }}>{text}</span>
                  </div>
                ))}
              </div>
              {/* Mode toggle */}
              <div style={{ display: "inline-flex", background: T.surfaceHi, border: `1px solid ${T.border}`,
                borderRadius: 9, padding: 3, gap: 2 }}>
                {(["ai", "custom"] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    style={{ padding: "7px 18px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", border: "none", transition: "all 0.15s",
                      background: mode === m ? T.grad : "transparent",
                      color: mode === m ? "#fff" : T.textMid,
                      boxShadow: mode === m ? "0 2px 8px rgba(99,102,241,0.3)" : "none" }}>
                    {m === "ai" ? "⚡ Make Build" : "⚙ Custom Build"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── MAKE BUILD (AI) ── */}
            {mode === "ai" && (
              <div className="or-ai-layout" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 28, alignItems: "start" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
                    <FieldLabel>Budget</FieldLabel>
                    <BudgetPresets value={Number(budget)} onChange={v => setBudget(String(v))} />
                    {Number(budget) !== NO_BUDGET && (
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                          fontSize: 13, fontWeight: 600, color: T.textMid }}>$</span>
                        <input type="text" inputMode="numeric" value={budget}
                          onChange={e => setBudget(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="Custom amount"
                          style={{ width: "100%", padding: "10px 12px 10px 26px", background: T.surfaceHi,
                            border: `1px solid ${T.border}`, borderRadius: 8, color: T.text,
                            fontSize: 13, outline: "none", boxSizing: "border-box" }}
                          onFocus={e => (e.target.style.borderColor = T.accent)}
                          onBlur={e => (e.target.style.borderColor = T.border)} />
                      </div>
                    )}
                  </div>

                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
                    <FieldLabel>Use case</FieldLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {([["gaming","🎮","Gaming"],["video editing","🎬","Video Editing"],["programming","💻","Programming"],["general use","🖥️","General Use"]] as const).map(([val, icon, label]) => {
                        const active = useCase === val;
                        return (
                          <button key={val} type="button" onClick={() => setUseCase(val)}
                            style={{ padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 9, transition: "all 0.12s",
                              background: active ? "rgba(99,102,241,0.12)" : T.surfaceHi,
                              border: `1px solid ${active ? "rgba(99,102,241,0.4)" : T.border}` }}>
                            <span style={{ fontSize: 16 }}>{icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: active ? T.accentHi : T.textMid }}>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
                    <FieldLabel>Notes <span style={{ textTransform: "none", fontWeight: 400, color: T.textDim }}>(optional)</span></FieldLabel>
                    <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. prefer AMD, already have a case, want RGB"
                      style={{ width: "100%", padding: "10px 12px", background: T.surfaceHi,
                        border: `1px solid ${T.border}`, borderRadius: 8, color: T.text,
                        fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => (e.target.style.borderColor = T.accent)}
                      onBlur={e => (e.target.style.borderColor = T.border)} />
                  </div>

                  <button type="submit" disabled={loading}
                    style={{ padding: "13px 24px", borderRadius: 10, border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      background: loading ? T.surfaceHi : T.grad,
                      color: loading ? T.textDim : "#fff",
                      fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em",
                      boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                      transition: "all 0.15s" }}>
                    {loading ? "Generating…" : "Generate Build →"}
                  </button>
                </form>

                {/* Results */}
                {aiBuild ? (
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`,
                      background: T.surfaceHi, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Generated Build</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>
                        ${aiBuild.totalEstimate?.toLocaleString()}
                      </span>
                    </div>
                    {Object.entries(aiBuild).filter(([k]) => k !== "totalEstimate").map(([key, val]: [string, any], idx, arr) => (
                      <div key={key} style={{ display: "grid", gridTemplateColumns: "140px 1fr 80px",
                        padding: "12px 20px", gap: 12,
                        borderBottom: idx < arr.length - 1 ? `1px solid ${T.border}` : "none",
                        background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 14 }}>{COMPONENT_META[key as ComponentKey]?.icon}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {COMPONENT_META[key as ComponentKey]?.label ?? key}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{val.name}</div>
                          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, marginBottom: 4 }}>{val.reason}</div>
                          <BuyButtons name={val.name} staticPrice={val.price} />
                        </div>
                        <div style={{ textAlign: "right", paddingTop: 2 }}>
                          <LivePrice fallback={val.price} style={{ fontSize: 13, fontWeight: 700, color: T.text }} />
                        </div>
                      </div>
                    ))}
                    {/* Tax + total footer */}
                    {(() => {
                      const sub = aiBuild.totalEstimate ?? 0;
                      const tax = Math.round(sub * taxRate * 100) / 100;
                      const total = sub + tax;
                      return (
                        <div style={{ borderTop: `2px solid ${T.accent}`, background: T.surfaceHi, padding: "12px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textDim }}>
                            <span>Subtotal</span>
                            <span>${sub.toLocaleString()}</span>
                          </div>
                          {taxRate > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textDim }}>
                              <span>Tax ({stateCode} {(taxRate * 100).toFixed(2)}%)</span>
                              <span>${tax.toFixed(2)}</span>
                            </div>
                          )}
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.02em", paddingTop: 4, borderTop: `1px solid ${T.border}` }}>
                            <span>Total {taxRate === 0 && <span style={{ fontSize: 11, fontWeight: 400, color: T.textDim }}>(+ local tax)</span>}</span>
                            <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : !loading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                    minHeight: 320, border: `1px dashed ${T.border}`, borderRadius: 12 }}>
                    <span style={{ fontSize: 13, color: T.textDim }}>Your generated build will appear here</span>
                  </div>
                ) : null}
              </div>
            )}

            {/* ── CUSTOM BUILD ── */}
            {mode === "custom" && (
              <div className="or-cb-layout" style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 24, alignItems: "start" }}>

                {/* PCPartPicker-style table */}
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                  {/* Table header */}
                  <div className="or-parts-row" style={{ display: "grid", gridTemplateColumns: "28px 160px 1fr 100px 76px",
                    padding: "9px 16px", background: T.surfaceHi, borderBottom: `1px solid ${T.border}` }}>
                    {["", "Component", "Selection", "Price", ""].map((h, i) => (
                      <span key={i} style={{ fontSize: 10, fontWeight: 700, color: T.textDim,
                        textTransform: "uppercase", letterSpacing: "0.07em",
                        textAlign: i === 3 ? "right" : "left" }}>{h}</span>
                    ))}
                  </div>

                  {/* Component rows */}
                  {COMPONENT_ORDER.map((slot, idx) => {
                    const meta      = COMPONENT_META[slot];
                    const picked    = (selected as any)[slot] as AnyPart | undefined;
                    const issues    = compatIssues.filter(i => i.slot === slot);
                    const hasError  = issues.some(i => i.severity === "error");
                    const hasWarn   = issues.some(i => i.severity === "warn");


                    const indicator = !picked
                      ? { icon: "—", color: T.textDim }
                      : hasError
                        ? { icon: "✗", color: "#f87171" }
                        : hasWarn
                          ? { icon: "△", color: "#fcd34d" }
                          : { icon: "✓", color: "#34d399" };

                    return (
                      <div key={slot} className="or-parts-row" style={{
                        display: "grid", gridTemplateColumns: "28px 160px 1fr 100px 76px",
                        padding: "14px 0 14px 0", gap: 0,
                        borderBottom: idx < COMPONENT_ORDER.length - 1 ? `1px solid ${T.border}` : "none",
                        background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)",
                      }}>
                        {/* Compatibility indicator */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: indicator.color, paddingLeft: 6 }}>
                          {indicator.icon}
                        </div>

                        {/* Component type */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4, paddingTop: 1 }}>
                          <span style={{ fontSize: 15, lineHeight: 1 }}>{meta.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.textMid }}>{meta.label}</span>
                        </div>

                        {/* Selection */}
                        <div style={{ paddingRight: 12 }}>
                          {picked ? (
                            <>
                              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{picked.name}</div>
                              <div style={{ fontSize: 11, color: T.textDim, marginBottom: 4,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(picked as any).specs}</div>
                              {issues.map((iss, i) => (
                                <div key={i} style={{ fontSize: 11, marginBottom: 3,
                                  color: iss.severity === "error" ? "#fca5a5" : "#fcd34d" }}>
                                  {iss.severity === "error" ? "✗" : "△"} {iss.msg}
                                </div>
                              ))}
                              <BuyButtons id={(picked as any).id} name={picked.name} staticPrice={(picked as any).price} />
                            </>
                          ) : (
                            <button onClick={() => setOpenSlot(slot)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0,
                                fontSize: 13, color: T.accent, fontWeight: 500, letterSpacing: "-0.01em" }}>
                              + Choose a {meta.label}
                            </button>
                          )}
                        </div>

                        {/* Price */}
                        <div style={{ textAlign: "right", paddingRight: 12, paddingTop: 2 }}>
                          {picked && (
                            <LivePrice
                              id={(picked as any).id}
                              fallback={(picked as any).price}
                              style={{ fontSize: 14, fontWeight: 700, color: T.text }}
                            />
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: 5, paddingRight: 14, justifyContent: "flex-end" }}>
                          <button onClick={() => setOpenSlot(slot)}
                            title={picked ? "Change" : "Add"}
                            style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border}`,
                              background: "transparent", color: T.textMid, cursor: "pointer",
                              fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.1s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.accent; (e.currentTarget as HTMLElement).style.color = T.accentHi; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.textMid; }}>
                            {picked ? "✎" : "+"}
                          </button>
                          {picked && (
                            <button
                              onClick={() => setSelected(prev => { const n = { ...prev }; delete (n as any)[slot]; return n; })}
                              title="Remove"
                              style={{ width: 28, height: 28, borderRadius: 6, cursor: "pointer",
                                background: "transparent", color: T.textDim,
                                border: `1px solid ${T.border}`, fontSize: 14,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.1s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#ef4444"; (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.textDim; }}>
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Total row */}
                  <div className="or-parts-row" style={{ display: "grid", gridTemplateColumns: "28px 160px 1fr 100px 76px",
                    padding: "14px 0", background: T.surfaceHi,
                    borderTop: `2px solid ${T.accent}` }}>
                    <div />
                    <div style={{ paddingLeft: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.accent,
                        textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</span>
                    </div>
                    <div style={{ paddingRight: 12, display: "flex", alignItems: "center" }}>
                      {taxRate > 0 && stateCode && (
                        <span style={{ fontSize: 11, color: T.textDim }}>
                          Includes {(taxRate * 100).toFixed(2)}% {stateCode} tax
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: "right", paddingRight: 12 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: T.accentHi, letterSpacing: "-0.02em" }}>
                        ${totalWithTax.toFixed(2)}
                      </span>
                    </div>
                    <div />
                  </div>
                </div>

                {/* Right sidebar */}
                <div style={{ position: "sticky", top: 62, display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* Budget card */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
                    <FieldLabel>Budget</FieldLabel>
                    <BudgetPresets value={customBudget} onChange={v => { setCustomBudget(v); setCustomBudgetStr(String(v)); }} cols={2} />
                    {customBudget !== NO_BUDGET && (
                      <div style={{ position: "relative", marginBottom: 16 }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                          fontSize: 13, fontWeight: 600, color: T.textMid }}>$</span>
                        <input type="text" inputMode="numeric" value={customBudgetStr}
                          onChange={e => {
                            const raw = e.target.value.replace(/[^0-9]/g, "");
                            setCustomBudgetStr(raw);
                            if (raw !== "") setCustomBudget(Number(raw));
                          }}
                          onBlur={e => {
                            if (customBudgetStr === "") { setCustomBudgetStr("0"); setCustomBudget(0); }
                            e.target.style.borderColor = T.border;
                          }}
                          style={{ width: "100%", padding: "10px 12px 10px 26px", background: T.surfaceHi,
                            border: `1px solid ${T.border}`, borderRadius: 8, color: T.text,
                            fontSize: 13, outline: "none", boxSizing: "border-box" }}
                          onFocus={e => (e.target.style.borderColor = T.accent)} />
                      </div>
                    )}

                    {/* Progress bar — hidden when no budget limit */}
                    {customBudget !== NO_BUDGET && (
                      <div style={{ height: 3, borderRadius: 99, background: T.border, overflow: "hidden", marginBottom: 10 }}>
                        <div style={{ height: "100%", borderRadius: 99, transition: "width 0.3s",
                          width: `${Math.min(100, (totalWithTax / (customBudget || 1)) * 100)}%`,
                          background: customRemaining < 0 ? "#ef4444" : T.grad }} />
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: T.textDim }}>Subtotal</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>${customTotal.toFixed(2)}</span>
                      </div>
                      {taxRate > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, color: T.textDim }}>
                            Tax {stateCode && `(${stateCode} ${(taxRate*100).toFixed(2)}%)`}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>${taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ height: 1, background: T.border }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Total</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>
                          ${totalWithTax.toFixed(2)}
                        </span>
                      </div>
                      {customBudget !== NO_BUDGET && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, color: T.textDim }}>Remaining</span>
                          <span style={{ fontSize: 11, fontWeight: 700,
                            color: customRemaining < 0 ? "#f87171" : customRemaining < customBudget * 0.1 ? "#f59e0b" : "#34d399" }}>
                            {customRemaining < 0 ? `-$${Math.abs(customRemaining).toFixed(2)}` : `$${customRemaining.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Wattage card */}
                  {(wattCpu > 0 || wattGpu > 0 || wattPlatform > 0) && (
                    <div style={{ background: T.surface, border: `1px solid ${wattOverload ? "rgba(239,68,68,0.4)" : T.border}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>⚡ Power Draw</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: wattOverload ? "#f87171" : T.accentHi, letterSpacing: "-0.02em" }}>{wattTotal}W</span>
                      </div>
                      {/* Bar */}
                      <div style={{ height: 6, borderRadius: 99, background: T.border, overflow: "hidden", marginBottom: 10 }}>
                        <div style={{ height: "100%", borderRadius: 99, transition: "width 0.3s",
                          width: `${wattPct || (wattTotal > 0 ? 30 : 0)}%`,
                          background: wattOverload ? "#ef4444" : wattPct > 70 ? "#f59e0b" : T.grad }} />
                      </div>
                      {/* Breakdown rows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {wattCpu > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 11, color: T.textDim }}>🧠 CPU (TDP)</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: T.textMid }}>{wattCpu}W</span>
                          </div>
                        )}
                        {wattGpu > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 11, color: T.textDim }}>🎮 GPU</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: T.textMid }}>{wattGpu}W</span>
                          </div>
                        )}
                        {wattPlatform > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 11, color: T.textDim }}>🔌 Platform (est.)</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: T.textMid }}>{wattPlatform}W</span>
                          </div>
                        )}
                        {wattPsu > 0 && (
                          <>
                            <div style={{ height: 1, background: T.border, margin: "2px 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 11, color: T.textDim }}>⚡ PSU capacity</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: T.textMid }}>{wattPsu}W</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 11, color: T.textDim }}>Headroom</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: wattOverload ? "#f87171" : "#34d399" }}>
                                {wattOverload ? "⚠ " : ""}{wattPsu - wattTotal}W {wattOverload ? "short" : "free"}
                              </span>
                            </div>
                          </>
                        )}
                        {!wattPsu && (
                          <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>Add a PSU to check headroom</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions card */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14,
                    display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.keys(selected).length > 0 && (
                      <button onClick={() => setSelected({})}
                        style={{ width: "100%", padding: "9px", borderRadius: 8,
                          border: `1px solid ${T.border}`, background: "transparent",
                          color: T.textDim, fontSize: 12, fontWeight: 500, cursor: "pointer",
                          transition: "all 0.12s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textDim; (e.currentTarget as HTMLElement).style.borderColor = T.border; }}>
                        Clear all parts
                      </button>
                    )}
                    {stateCode ? (
                      <p style={{ margin: 0, fontSize: 11, color: T.textDim, textAlign: "center" }}>
                        Tax: {US_STATES.find(([c]) => c === stateCode)?.[1]} · {(taxRate * 100).toFixed(2)}%
                      </p>
                    ) : (
                      <select value={stateCode} onChange={e => setStateCode(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", background: T.surfaceHi,
                          border: `1px solid ${T.border}`, borderRadius: 8, color: T.textDim,
                          fontSize: 12, outline: "none", cursor: "pointer", appearance: "none" }}>
                        <option value="">Select state for tax…</option>
                        {US_STATES.map(([code, name]) => (
                          <option key={code} value={code}>{name} ({(STATE_TAX[code] * 100).toFixed(2)}%)</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        <footer style={{ borderTop: `1px solid ${T.border}`, padding: "20px 32px",
          display: "flex", gap: 20, justifyContent: "center", marginTop: "auto" }}>
          <a href="/about" style={{ fontSize: 12, color: T.textDim, textDecoration: "none" }}>About</a>
          <a href="/privacy" style={{ fontSize: 12, color: T.textDim, textDecoration: "none" }}>Privacy</a>
        </footer>
      </main>
    </>
  );
}
