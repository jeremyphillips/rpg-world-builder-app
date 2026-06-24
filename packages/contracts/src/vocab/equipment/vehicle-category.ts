import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Vehicle categories — land, water, air, and exotic conveyances.
// ---------------------------------------------------------------------------

export const VEHICLE_CATEGORIES = ['land', 'water', 'air', 'space', 'other'] as const

export const vehicleCategorySchema = z.enum(VEHICLE_CATEGORIES)

export type VehicleCategory = z.infer<typeof vehicleCategorySchema>

export const VEHICLE_CATEGORY_ENTRIES = {
  land: {
    label: 'Land',
    description: 'Carts, wagons, carriages, and other ground vehicles.',
  },
  water: {
    label: 'Water',
    description: 'Rowboats, sailing ships, galleys, and other watercraft.',
  },
  air: {
    label: 'Air',
    description: 'Airships, griffon mounts with howdahs, and similar aerial conveyances.',
  },
  space: {
    label: 'Space',
    description: 'Spelljammer-style vessels and other extraplanar craft.',
  },
  other: {
    label: 'Other',
    description: 'A vehicle that does not fit another category.',
  },
} as const satisfies Record<VehicleCategory, GameTermEntry>

/** Returns the display label for a vehicle category. Falls back to the raw value. */
export function getVehicleCategoryLabel(category: string): string {
  return VEHICLE_CATEGORY_ENTRIES[category as VehicleCategory]?.label ?? category
}
