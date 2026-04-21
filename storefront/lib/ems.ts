// EMS (Japan Post) international shipping brackets — 2026 rates
// Source: Japan Post EMS official rate table, World Zone grouping
export type EmsZone = 1 | 2 | 3 | 4;

// Zone classification (World Zone 1-4)
export const EMS_ZONES: Record<string, EmsZone> = {
  // Zone 1 — East Asia (cheapest)
  kr: 1, tw: 1, cn: 1, hk: 1, mn: 1,
  // Zone 2 — Southeast Asia / Oceania (partial) / Canada / Mexico / India
  sg: 2, th: 2, my: 2, ph: 2, vn: 2, id: 2, in: 2, au: 2, nz: 2, ca: 2, mx: 2,
  // Zone 3 — North America / Middle East / Europe
  us: 3, uk: 3, de: 3, fr: 3, es: 3, it: 3, nl: 3, ae: 3, sa: 3, il: 3,
  // Zone 4 — South America / Africa
  br: 4, ar: 4, cl: 4, za: 4, ng: 4, eg: 4,
};

// EMS rate in JPY: [maxWeightG, zone1, zone2, zone3, zone4]
const EMS_RATES: Array<[number, number, number, number, number]> = [
  [500, 1900, 2350, 3150, 3900],
  [600, 2120, 2620, 3500, 4350],
  [700, 2340, 2890, 3850, 4800],
  [800, 2560, 3160, 4200, 5250],
  [900, 2780, 3430, 4550, 5700],
  [1000, 3000, 3700, 4900, 6150],
  [1250, 3500, 4350, 5800, 7300],
  [1500, 4000, 5000, 6700, 8450],
  [1750, 4500, 5650, 7600, 9600],
  [2000, 5000, 6300, 8500, 10750],
  [2500, 5900, 7500, 10150, 12800],
  [3000, 6800, 8700, 11800, 14850],
  [4000, 8300, 10700, 14550, 18400],
  [5000, 9800, 12700, 17300, 21950],
];

const TRANSIT: Record<EmsZone, string> = {
  1: "2–4 business days",
  2: "3–6 business days",
  3: "4–8 business days",
  4: "6–12 business days",
};

export function calcEms(weightG: number, countryCode: string): { jpy: number | null; transit: string; zone: EmsZone | null } {
  const zone = EMS_ZONES[countryCode.toLowerCase()];
  if (!zone) return { jpy: null, transit: "Contact us", zone: null };
  if (weightG <= 0 || weightG > 5000) return { jpy: null, transit: TRANSIT[zone], zone };
  for (const [maxG, z1, z2, z3, z4] of EMS_RATES) {
    if (weightG <= maxG) {
      const jpy = [0, z1, z2, z3, z4][zone];
      return { jpy, transit: TRANSIT[zone], zone };
    }
  }
  return { jpy: null, transit: TRANSIT[zone], zone };
}
