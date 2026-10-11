export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  deliveryFee: number; // PKR
  minOrderAmount: number; // PKR
  estimatedMinutes: string;
  postcodes: string[];
  keywords: string[]; // Areas, landmarks, sectors in Sialkot
  isActive: boolean;
}

export const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-central',
    name: 'Zone 1: Khadim Ali Road & Sialkot City (Standard)',
    description: 'Central hub near kitchen, fast hot delivery within 25–35 minutes.',
    deliveryFee: 100,
    minOrderAmount: 200,
    estimatedMinutes: '25-35 mins',
    postcodes: ['51310'],
    keywords: [
      'khadim ali',
      'mehtaab',
      'mehtab',
      'model town',
      'rang pura',
      'railway road',
      'circular road',
      'shahabpura',
      'defense road',
      'defence road',
      'hajipura',
      'chungi',
      'abbot road',
      'kutcheri',
      'court road',
    ],
    isActive: true,
  },
  {
    id: 'zone-cantt-city',
    name: 'Zone 2: Sialkot Cantt, Paris Road & City Center (3–6 km)',
    description: 'Sialkot Cantonment, Saddar Bazar, Paris Road and surrounding sectors.',
    deliveryFee: 140,
    minOrderAmount: 400,
    estimatedMinutes: '35-45 mins',
    postcodes: ['51311', '51320'],
    keywords: [
      'cantt',
      'cantonment',
      'paris road',
      'kashmir road',
      'saddar',
      'mall road',
      'garrison',
      'commissioner road',
      'aziz shaheed',
      'iqbal manzil',
      'allama iqbal',
      'murray college',
      'water works',
      'neka pura',
      'tibba araian',
    ],
    isActive: true,
  },
  {
    id: 'zone-outer-industrial',
    name: 'Zone 3: Outer Sialkot & Industrial Corridors (6–10 km)',
    description: 'Suburbs, Small Industrial Estate, Daska Road & Ugoki surroundings.',
    deliveryFee: 220,
    minOrderAmount: 600,
    estimatedMinutes: '45-60 mins',
    postcodes: ['51340', '51360'],
    keywords: [
      'ugoki',
      'sambrial',
      'daska road',
      'small industrial',
      'industrial estate',
      'sie',
      'marakiwal',
      'airport road',
      'gohadpur',
      'hunter pura',
      'hunterpura',
      'fatehgarh',
      'bondu',
      'kotli behram',
      'muzaffarpur',
    ],
    isActive: true,
  },
];

/**
 * Helper to match an entered address against active delivery zones.
 * Checks keywords and postcodes.
 */
export function matchDeliveryZone(
  address: string,
  zones: DeliveryZone[]
): DeliveryZone | null {
  if (!address || typeof address !== 'string') return null;
  const normalized = address.toLowerCase();

  // Filter only active zones
  const activeZones = zones.filter((z) => z.isActive);

  // 1. Check postal codes first if present
  for (const zone of activeZones) {
    for (const pc of zone.postcodes) {
      if (normalized.includes(pc)) {
        return zone;
      }
    }
  }

  // 2. Check keywords in priority order (Zone 1 > Zone 2 > Zone 3)
  for (const zone of activeZones) {
    for (const kw of zone.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        return zone;
      }
    }
  }

  return null;
}
