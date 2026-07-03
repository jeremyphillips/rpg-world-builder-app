import { z } from 'zod'

import { getTermSentenceForm } from '../types'
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
    sentence: {
      singular: 'land vehicle',
      plural: 'land vehicles',
    },
  },
  water: {
    label: 'Water',
    description: 'Rowboats, sailing ships, galleys, and other watercraft.',
    sentence: {
      singular: 'water vehicle',
      plural: 'water vehicles',
    },
  },
  air: {
    label: 'Air',
    description: 'Airships, griffon mounts with howdahs, and similar aerial conveyances.',
    sentence: {
      singular: 'air vehicle',
      plural: 'air vehicles',
    },
  },
  space: {
    label: 'Space',
    description: 'Spelljammer-style vessels and other extraplanar craft.',
    sentence: {
      singular: 'space vehicle',
      plural: 'space vehicles',
    },
  },
  other: {
    label: 'Other',
    description: 'A vehicle that does not fit another category.',
  },
} as const satisfies Record<VehicleCategory, GameTermEntry>

/** Returns the reference entry for a vehicle category, if known. */
export function getVehicleCategoryEntry(category: string): GameTermEntry | undefined {
  return VEHICLE_CATEGORY_ENTRIES[category as VehicleCategory]
}

/** Returns the display label for a vehicle category. Falls back to the raw value. */
export function getVehicleCategoryLabel(category: string): string {
  return getVehicleCategoryEntry(category)?.label ?? category
}

/** Counted noun phrase for generated vehicle pool prose. */
export function getVehicleCategorySentenceForm(category: string, count = 1): string {
  const entry = getVehicleCategoryEntry(category)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: category, description: '' }, count)
}
