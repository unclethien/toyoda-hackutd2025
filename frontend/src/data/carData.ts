export interface CarModel {
  name: string;
  versions: string[];
}

export interface CarMake {
  name: string;
  models: CarModel[];
}

export const carDatabase: CarMake[] = [
  {
    name: "Toyota",
    models: [
      {
        name: "Camry",
        versions: ["LE", "SE", "SE Nightshade", "XLE", "XSE", "TRD"],
      },
      {
        name: "Corolla",
        versions: ["L", "LE", "SE", "XLE", "XSE", "Apex Edition"],
      },
      {
        name: "RAV4",
        versions: [
          "LE",
          "XLE",
          "XLE Premium",
          "Adventure",
          "TRD Off-Road",
          "Limited",
          "Prime SE",
          "Prime XSE",
        ],
      },
      {
        name: "Highlander",
        versions: ["L", "LE", "XLE", "XSE", "Limited", "Platinum"],
      },
      {
        name: "4Runner",
        versions: ["SR5", "TRD Off-Road", "TRD Pro", "Limited", "Platinum"],
      },
      {
        name: "Tacoma",
        versions: [
          "SR",
          "SR5",
          "TRD Sport",
          "TRD Off-Road",
          "Limited",
          "TRD Pro",
        ],
      },
      {
        name: "Tundra",
        versions: [
          "SR",
          "SR5",
          "Limited",
          "Platinum",
          "1794",
          "TRD Pro",
          "Capstone",
        ],
      },
      {
        name: "Sienna",
        versions: ["LE", "XLE", "XSE", "Limited", "Platinum"],
      },
      {
        name: "Prius",
        versions: [
          "LE",
          "XLE",
          "Limited",
          "Prime SE",
          "Prime XSE",
          "Prime XSE Premium",
        ],
      },
      {
        name: "Crown",
        versions: ["XLE", "Limited", "Platinum"],
      },
      {
        name: "GR Corolla",
        versions: ["Core", "Circuit Edition", "Premium"],
      },
      {
        name: "GR86",
        versions: ["Base", "Premium"],
      },
      {
        name: "bZ4X",
        versions: ["XLE", "Limited"],
      },
    ],
  },
  {
    name: "Honda",
    models: [
      {
        name: "Civic",
        versions: ["LX", "Sport", "EX", "Touring", "Type R"],
      },
      {
        name: "Accord",
        versions: [
          "LX",
          "Sport",
          "Sport-L",
          "EX-L",
          "Touring",
          "Hybrid Sport",
          "Hybrid EX-L",
          "Hybrid Touring",
        ],
      },
      {
        name: "CR-V",
        versions: [
          "LX",
          "EX",
          "EX-L",
          "Sport",
          "Sport Touring",
          "Hybrid Sport",
          "Hybrid Sport-L",
          "Hybrid Sport Touring",
        ],
      },
      {
        name: "Pilot",
        versions: ["Sport", "EX-L", "TrailSport", "Touring", "Elite"],
      },
      {
        name: "HR-V",
        versions: ["LX", "Sport", "EX-L"],
      },
      {
        name: "Passport",
        versions: ["Sport", "TrailSport", "EX-L", "Elite"],
      },
      {
        name: "Odyssey",
        versions: ["LX", "EX", "EX-L", "Touring", "Elite"],
      },
      {
        name: "Ridgeline",
        versions: ["Sport", "RTL", "RTL-E", "TrailSport", "Black Edition"],
      },
    ],
  },
  {
    name: "Ford",
    models: [
      {
        name: "F-150",
        versions: [
          "XL",
          "STX",
          "XLT",
          "Lariat",
          "King Ranch",
          "Platinum",
          "Limited",
          "Raptor",
          "Lightning",
        ],
      },
      {
        name: "Mustang",
        versions: [
          "EcoBoost",
          "EcoBoost Premium",
          "GT",
          "GT Premium",
          "Dark Horse",
          "Mach 1",
        ],
      },
      {
        name: "Explorer",
        versions: ["Base", "XLT", "Limited", "ST", "Platinum", "King Ranch"],
      },
      {
        name: "Escape",
        versions: ["S", "SE", "SEL", "ST-Line", "Platinum"],
      },
      {
        name: "Edge",
        versions: ["SE", "SEL", "ST", "ST-Line"],
      },
      {
        name: "Bronco",
        versions: [
          "Base",
          "Big Bend",
          "Black Diamond",
          "Outer Banks",
          "Badlands",
          "Wildtrak",
          "Raptor",
        ],
      },
      {
        name: "Bronco Sport",
        versions: [
          "Base",
          "Big Bend",
          "Outer Banks",
          "Badlands",
          "Heritage",
          "Heritage Limited",
        ],
      },
      {
        name: "Maverick",
        versions: ["XL", "XLT", "Lariat", "Tremor"],
      },
      {
        name: "Ranger",
        versions: ["XL", "XLT", "Lariat", "Raptor"],
      },
      {
        name: "Expedition",
        versions: [
          "XLT",
          "Limited",
          "King Ranch",
          "Platinum",
          "Stealth",
          "Timberline",
        ],
      },
    ],
  },
  {
    name: "Chevrolet",
    models: [
      {
        name: "Silverado 1500",
        versions: ["WT", "Custom", "LT", "RST", "LTZ", "High Country", "ZR2"],
      },
      {
        name: "Equinox",
        versions: ["LS", "LT", "RS", "Premier"],
      },
      {
        name: "Traverse",
        versions: ["LS", "LT", "RS", "Premier", "High Country"],
      },
      {
        name: "Tahoe",
        versions: ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
      },
      {
        name: "Suburban",
        versions: ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
      },
      {
        name: "Blazer",
        versions: ["1LT", "2LT", "3LT", "RS", "Premier"],
      },
      {
        name: "Malibu",
        versions: ["LS", "RS", "LT", "Premier"],
      },
      {
        name: "Trax",
        versions: ["1LS", "2LS", "1LT", "2RS", "ACTIV"],
      },
      {
        name: "Colorado",
        versions: ["WT", "LT", "Z71", "Trail Boss", "ZR2"],
      },
      {
        name: "Corvette",
        versions: [
          "Stingray 1LT",
          "Stingray 2LT",
          "Stingray 3LT",
          "Z06",
          "E-Ray",
        ],
      },
    ],
  },
  {
    name: "Nissan",
    models: [
      {
        name: "Altima",
        versions: ["S", "SV", "SR", "SL", "Platinum"],
      },
      {
        name: "Sentra",
        versions: ["S", "SV", "SR"],
      },
      {
        name: "Rogue",
        versions: ["S", "SV", "SL", "Platinum"],
      },
      {
        name: "Pathfinder",
        versions: ["S", "SV", "SL", "Platinum", "Rock Creek"],
      },
      {
        name: "Armada",
        versions: ["SV", "SL", "Platinum"],
      },
      {
        name: "Frontier",
        versions: ["S", "SV", "PRO-4X", "PRO-X"],
      },
      {
        name: "Titan",
        versions: ["S", "SV", "PRO-4X", "Platinum Reserve"],
      },
      {
        name: "Kicks",
        versions: ["S", "SV", "SR"],
      },
      {
        name: "Murano",
        versions: ["S", "SV", "SL", "Platinum"],
      },
      {
        name: "Z",
        versions: ["Sport", "Performance", "NISMO"],
      },
    ],
  },
  {
    name: "Hyundai",
    models: [
      {
        name: "Elantra",
        versions: ["SE", "SEL", "N Line", "Limited"],
      },
      {
        name: "Sonata",
        versions: ["SE", "SEL", "N Line", "Limited"],
      },
      {
        name: "Tucson",
        versions: [
          "SE",
          "SEL",
          "N Line",
          "Limited",
          "Hybrid Blue",
          "Hybrid SEL",
          "Hybrid Limited",
        ],
      },
      {
        name: "Santa Fe",
        versions: [
          "SE",
          "SEL",
          "XRT",
          "Limited",
          "Calligraphy",
          "Hybrid SEL",
          "Hybrid Limited",
        ],
      },
      {
        name: "Palisade",
        versions: ["SE", "SEL", "Limited", "Calligraphy"],
      },
      {
        name: "Kona",
        versions: ["SE", "SEL", "N Line", "Limited", "Electric"],
      },
      {
        name: "Santa Cruz",
        versions: ["SE", "SEL", "SEL Premium", "XRT", "Limited"],
      },
      {
        name: "IONIQ 5",
        versions: ["SE Standard Range", "SE Long Range", "SEL", "Limited"],
      },
      {
        name: "IONIQ 6",
        versions: ["SE Long Range", "SEL", "Limited"],
      },
    ],
  },
  {
    name: "Mazda",
    models: [
      {
        name: "Mazda3",
        versions: [
          "Base",
          "Select",
          "Preferred",
          "Premium",
          "Turbo",
          "Turbo Premium Plus",
        ],
      },
      {
        name: "Mazda6",
        versions: [
          "Sport",
          "Touring",
          "Grand Touring",
          "Grand Touring Reserve",
        ],
      },
      {
        name: "CX-30",
        versions: [
          "Base",
          "Select",
          "Preferred",
          "Premium",
          "Turbo",
          "Turbo Premium Plus",
        ],
      },
      {
        name: "CX-5",
        versions: [
          "Sport",
          "Select",
          "Preferred",
          "Premium",
          "Premium Plus",
          "Turbo",
          "Turbo Signature",
        ],
      },
      {
        name: "CX-50",
        versions: [
          "Sport",
          "Select",
          "Preferred",
          "Premium",
          "Premium Plus",
          "Turbo",
          "Turbo Premium Plus",
        ],
      },
      {
        name: "CX-90",
        versions: [
          "Preferred",
          "Preferred Plus",
          "Premium",
          "Premium Plus",
          "Turbo S",
          "Turbo S Premium",
        ],
      },
      {
        name: "MX-5 Miata",
        versions: ["Sport", "Club", "Grand Touring"],
      },
    ],
  },
];
