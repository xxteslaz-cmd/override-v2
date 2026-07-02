// Catalog of all products Override tracks for price refreshes.
// `query` is sent to SerpApi Google Shopping; keep it specific enough to
// land on the right product but not so narrow it returns zero results.

export interface CatalogEntry {
  id: string;
  name: string;
  query: string;        // SerpApi search query
  fallbackPrice: number;
}

const CATALOG: CatalogEntry[] = [
  // ── CPUs ──────────────────────────────────────────────────────────────────
  { id: "r3-7300x",   name: "AMD Ryzen 3 7300X",        query: "AMD Ryzen 3 7300X processor",         fallbackPrice: 129  },
  { id: "r5-7500f",   name: "AMD Ryzen 5 7500F",        query: "AMD Ryzen 5 7500F processor",         fallbackPrice: 159  },
  { id: "r5-7600",    name: "AMD Ryzen 5 7600",         query: "AMD Ryzen 5 7600 processor",          fallbackPrice: 189  },
  { id: "i5-13400f",  name: "Intel Core i5-13400F",     query: "Intel Core i5-13400F processor",      fallbackPrice: 169  },
  { id: "i5-14600k",  name: "Intel Core i5-14600K",     query: "Intel Core i5-14600K processor",      fallbackPrice: 229  },
  { id: "r7-7700",    name: "AMD Ryzen 7 7700",         query: "AMD Ryzen 7 7700 processor",          fallbackPrice: 249  },
  { id: "r7-7700x",   name: "AMD Ryzen 7 7700X",        query: "AMD Ryzen 7 7700X processor",         fallbackPrice: 269  },
  { id: "i7-14700",   name: "Intel Core i7-14700",      query: "Intel Core i7-14700 processor",       fallbackPrice: 299  },
  { id: "i7-14700k",  name: "Intel Core i7-14700K",     query: "Intel Core i7-14700K processor",      fallbackPrice: 339  },
  { id: "r9-7900x",   name: "AMD Ryzen 9 7900X",        query: "AMD Ryzen 9 7900X processor",         fallbackPrice: 329  },
  { id: "r9-7950x",   name: "AMD Ryzen 9 7950X",        query: "AMD Ryzen 9 7950X processor",         fallbackPrice: 449  },
  { id: "i9-14900",   name: "Intel Core i9-14900",      query: "Intel Core i9-14900 processor",       fallbackPrice: 369  },
  { id: "i9-14900k",  name: "Intel Core i9-14900K",     query: "Intel Core i9-14900K processor",      fallbackPrice: 429  },
  { id: "r9-7950x3d", name: "AMD Ryzen 9 7950X3D",     query: "AMD Ryzen 9 7950X3D 3D V-Cache",      fallbackPrice: 579  },

  // ── GPUs ──────────────────────────────────────────────────────────────────
  { id: "rx6600",     name: "AMD RX 6600",              query: "AMD Radeon RX 6600 graphics card",    fallbackPrice: 149  },
  { id: "rx7600",     name: "AMD RX 7600",              query: "AMD Radeon RX 7600 graphics card",    fallbackPrice: 219  },
  { id: "rtx4060",    name: "NVIDIA RTX 4060",          query: "NVIDIA GeForce RTX 4060 graphics card",fallbackPrice: 289 },
  { id: "rx6700",     name: "AMD RX 6700",              query: "AMD Radeon RX 6700 graphics card",    fallbackPrice: 249  },
  { id: "rtx3060",    name: "NVIDIA RTX 3060",          query: "NVIDIA GeForce RTX 3060 graphics card",fallbackPrice: 199 },
  { id: "rtx4060ti",  name: "NVIDIA RTX 4060 Ti",      query: "NVIDIA GeForce RTX 4060 Ti 16GB",     fallbackPrice: 369  },
  { id: "rx7700xt",   name: "AMD RX 7700 XT",          query: "AMD Radeon RX 7700 XT graphics card", fallbackPrice: 319  },
  { id: "rx7800xt",   name: "AMD RX 7800 XT",          query: "AMD Radeon RX 7800 XT graphics card", fallbackPrice: 419  },
  { id: "rtx4070",    name: "NVIDIA RTX 4070",          query: "NVIDIA GeForce RTX 4070 graphics card",fallbackPrice: 499 },
  { id: "rtx4070s",   name: "NVIDIA RTX 4070 Super",   query: "NVIDIA GeForce RTX 4070 Super graphics card",fallbackPrice: 549},
  { id: "rx7900xt",   name: "AMD RX 7900 XT",          query: "AMD Radeon RX 7900 XT graphics card", fallbackPrice: 629  },
  { id: "rtx4070ti",  name: "NVIDIA RTX 4070 Ti",      query: "NVIDIA GeForce RTX 4070 Ti graphics card",fallbackPrice: 679},
  { id: "rtx4070tis", name: "NVIDIA RTX 4070 Ti Super",query: "NVIDIA GeForce RTX 4070 Ti Super",    fallbackPrice: 749  },
  { id: "rx7900xtx",  name: "AMD RX 7900 XTX",         query: "AMD Radeon RX 7900 XTX graphics card",fallbackPrice: 799  },
  { id: "rtx4080s",   name: "NVIDIA RTX 4080 Super",   query: "NVIDIA GeForce RTX 4080 Super",       fallbackPrice: 949  },
  { id: "rtx4090",    name: "NVIDIA RTX 4090",          query: "NVIDIA GeForce RTX 4090 graphics card",fallbackPrice: 1549},

  // ── Motherboards ──────────────────────────────────────────────────────────
  { id: "b650m-ds",   name: "Gigabyte B650M DS3H",     query: "Gigabyte B650M DS3H motherboard",     fallbackPrice: 109  },
  { id: "b650-plus",  name: "MSI B650 Gaming Plus",    query: "MSI B650 Gaming Plus WiFi motherboard",fallbackPrice: 159 },
  { id: "b760m-pro",  name: "ASUS Prime B760M-A",      query: "ASUS Prime B760M-A WiFi motherboard", fallbackPrice: 129  },
  { id: "b760-pro",   name: "MSI PRO B760-P WiFi",     query: "MSI PRO B760-P WiFi motherboard",     fallbackPrice: 149  },
  { id: "b650m-itx",  name: "ASRock B650I Lightning",  query: "ASRock B650I Lightning WiFi motherboard",fallbackPrice: 229},
  { id: "x670-f",     name: "ASUS ROG Strix X670E-F",  query: "ASUS ROG Strix X670E-F motherboard",  fallbackPrice: 329  },
  { id: "z790-edge",  name: "MSI MEG Z790 Edge",       query: "MSI MEG Z790 Edge WiFi motherboard",  fallbackPrice: 299  },
  { id: "z790-aorus", name: "Gigabyte Z790 Aorus Elite",query: "Gigabyte Z790 Aorus Elite motherboard",fallbackPrice: 279},
  { id: "x670e-hero", name: "ASUS ROG Crosshair X670E",query: "ASUS ROG Crosshair X670E Hero",       fallbackPrice: 499  },
  { id: "z790-apex",  name: "ASUS ROG Maximus Z790 Apex",query: "ASUS ROG Maximus Z790 Apex",        fallbackPrice: 599  },

  // ── RAM ───────────────────────────────────────────────────────────────────
  { id: "ddr5-16-5600",name: "16 GB DDR5-5600",        query: "16GB DDR5 5600 RAM desktop",          fallbackPrice: 45   },
  { id: "ddr5-16",    name: "16 GB DDR5-6000",         query: "16GB DDR5 6000 CL30 RAM desktop",     fallbackPrice: 59   },
  { id: "ddr5-32a",   name: "32 GB DDR5-6000",         query: "32GB DDR5 6000 CL30 RAM desktop",     fallbackPrice: 89   },
  { id: "ddr5-32b",   name: "32 GB DDR5-6400",         query: "32GB DDR5 6400 CL32 RAM desktop",     fallbackPrice: 109  },
  { id: "ddr5-32c",   name: "32 GB DDR5-6800",         query: "32GB DDR5 6800 XMP 3.0 RAM desktop",  fallbackPrice: 129  },
  { id: "ddr5-64",    name: "64 GB DDR5-6000",         query: "64GB DDR5 6000 CL30 RAM desktop",     fallbackPrice: 169  },
  { id: "ddr5-64b",   name: "64 GB DDR5-6400",         query: "64GB DDR5 6400 RGB RAM desktop",      fallbackPrice: 199  },
  { id: "ddr5-96",    name: "96 GB DDR5-6000",         query: "96GB DDR5 6000 RAM 2x48GB desktop",   fallbackPrice: 279  },

  // ── Storage ───────────────────────────────────────────────────────────────
  { id: "ssd-500-g4", name: "500 GB NVMe Gen 4 SSD",  query: "500GB NVMe PCIe Gen 4 M.2 SSD",       fallbackPrice: 45   },
  { id: "ssd-1tb-g3", name: "1 TB NVMe Gen 3 SSD",    query: "1TB NVMe PCIe Gen 3 M.2 SSD",         fallbackPrice: 49   },
  { id: "ssd-1tb-g4", name: "1 TB NVMe Gen 4 SSD",    query: "1TB NVMe PCIe Gen 4 M.2 SSD 7000MBs", fallbackPrice: 69  },
  { id: "ssd-2tb-g4", name: "2 TB NVMe Gen 4 SSD",    query: "2TB NVMe PCIe Gen 4 M.2 SSD",         fallbackPrice: 109  },
  { id: "ssd-2tb-g4b",name: "2 TB NVMe Gen 4 SSD Pro",query: "2TB NVMe PCIe Gen 4 M.2 SSD 7400MBs", fallbackPrice: 139 },
  { id: "ssd-4tb-g4", name: "4 TB NVMe Gen 4 SSD",    query: "4TB NVMe PCIe Gen 4 M.2 SSD",         fallbackPrice: 239  },
  { id: "ssd-2tb-g5", name: "2 TB NVMe Gen 5 SSD",    query: "2TB NVMe PCIe Gen 5 M.2 SSD 12000MBs",fallbackPrice: 199 },
  { id: "ssd-4tb-g5", name: "4 TB NVMe Gen 5 SSD",    query: "4TB NVMe PCIe Gen 5 M.2 SSD",         fallbackPrice: 399  },

  // ── PSUs ──────────────────────────────────────────────────────────────────
  { id: "psu-550g",   name: "EVGA SuperNOVA 550 G6",  query: "EVGA SuperNOVA 550 G6 power supply",  fallbackPrice: 69   },
  { id: "psu-650g",   name: "Corsair RM650x",          query: "Corsair RM650x modular power supply",  fallbackPrice: 89  },
  { id: "psu-750g",   name: "Seasonic Focus GX-750",   query: "Seasonic Focus GX-750 power supply",  fallbackPrice: 109  },
  { id: "psu-750p",   name: "be quiet! Pure Power 12M 750W",query: "be quiet Pure Power 12M 750W",   fallbackPrice: 99  },
  { id: "psu-850p",   name: "be quiet! Straight Power 850W",query: "be quiet Straight Power 850W",   fallbackPrice: 139  },
  { id: "psu-850g",   name: "Corsair RM850x",          query: "Corsair RM850x modular power supply",  fallbackPrice: 129 },
  { id: "psu-1000t",  name: "Corsair HX1000",          query: "Corsair HX1000 platinum power supply", fallbackPrice: 189 },
  { id: "psu-1200p",  name: "Seasonic PRIME TX-1200",  query: "Seasonic PRIME TX-1200 titanium",     fallbackPrice: 279  },

  // ── Cases ─────────────────────────────────────────────────────────────────
  { id: "h5-flow",    name: "NZXT H5 Flow",            query: "NZXT H5 Flow ATX mid tower case",     fallbackPrice: 89   },
  { id: "meshify",    name: "Fractal Meshify C",        query: "Fractal Design Meshify C case",       fallbackPrice: 99   },
  { id: "p400a",      name: "Phanteks Eclipse P400A",   query: "Phanteks Eclipse P400A mesh case",    fallbackPrice: 79   },
  { id: "4000d",      name: "Corsair 4000D Airflow",    query: "Corsair 4000D Airflow ATX case",      fallbackPrice: 94   },
  { id: "nr200p",     name: "Cooler Master NR200P",     query: "Cooler Master NR200P ITX case",       fallbackPrice: 99   },
  { id: "o11-evo",    name: "Lian Li O11 Dynamic EVO",  query: "Lian Li O11 Dynamic EVO case",        fallbackPrice: 169  },
  { id: "define7",    name: "Fractal Design Define 7",  query: "Fractal Design Define 7 case",        fallbackPrice: 189  },
  { id: "h7-flow",    name: "NZXT H7 Flow",             query: "NZXT H7 Flow ATX mid tower case",     fallbackPrice: 129  },
  { id: "phanteks",   name: "Phanteks Enthoo 719",      query: "Phanteks Enthoo 719 full tower case", fallbackPrice: 219  },
  { id: "o11-xl",     name: "Lian Li O11 Dynamic XL",  query: "Lian Li O11 Dynamic XL case",         fallbackPrice: 199  },

  // ── Coolers ───────────────────────────────────────────────────────────────
  { id: "hyper212",   name: "Cooler Master Hyper 212",  query: "Cooler Master Hyper 212 CPU cooler",  fallbackPrice: 35   },
  { id: "nh-u12s",    name: "Noctua NH-U12S",           query: "Noctua NH-U12S CPU cooler",           fallbackPrice: 79   },
  { id: "nh-d15",     name: "Noctua NH-D15",            query: "Noctua NH-D15 CPU cooler",            fallbackPrice: 99   },
  { id: "be-dark5",   name: "be quiet! Dark Rock 5",    query: "be quiet Dark Rock 5 CPU cooler",     fallbackPrice: 89   },
  { id: "kraken240",  name: "NZXT Kraken 240 AIO",      query: "NZXT Kraken 240 AIO liquid cooler",   fallbackPrice: 109  },
  { id: "kraken280",  name: "NZXT Kraken 280 AIO",      query: "NZXT Kraken 280 AIO liquid cooler",   fallbackPrice: 129  },
  { id: "kraken360",  name: "NZXT Kraken 360 AIO",      query: "NZXT Kraken 360 AIO liquid cooler",   fallbackPrice: 149  },
  { id: "lc360",      name: "Corsair iCUE H150i Elite", query: "Corsair iCUE H150i Elite 360mm AIO",  fallbackPrice: 169  },
  { id: "nh-d15g2",   name: "Noctua NH-D15 G2",         query: "Noctua NH-D15 G2 CPU cooler",         fallbackPrice: 149  },
];

export default CATALOG;

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return CATALOG.find(e => e.id === id);
}
