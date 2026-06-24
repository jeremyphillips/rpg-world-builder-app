import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Service categories — hirelings, lodging, travel, and other paid services.
// ---------------------------------------------------------------------------

export const SERVICE_CATEGORIES = [
  'hireling',
  'lodging',
  'meal',
  'travel',
  'transport',
  'stable',
  'spellcasting',
  'lifestyle',
  'other',
] as const

export const serviceCategorySchema = z.enum(SERVICE_CATEGORIES)

export type ServiceCategory = z.infer<typeof serviceCategorySchema>

export const SERVICE_CATEGORY_ENTRIES = {
  hireling: {
    label: 'Hireling',
    description: 'Skilled or untrained labor hired for a proficiency-based or manual task.',
  },
  lodging: {
    label: 'Lodging',
    description: 'Inn rooms, apartments, and other overnight accommodations.',
  },
  meal: {
    label: 'Meal',
    description: 'Food and drink purchased at an inn, tavern, or market.',
  },
  travel: {
    label: 'Travel',
    description: 'Overland or local travel services such as a messenger or guide.',
  },
  transport: {
    label: 'Transport',
    description: 'Passenger transport by coach, ship, or similar conveyance.',
  },
  stable: {
    label: 'Stable',
    description: 'Stabling, feed, and care for a mount.',
  },
  spellcasting: {
    label: 'Spellcasting',
    description: 'Paid spellcasting from an NPC with the appropriate spell list.',
  },
  lifestyle: {
    label: 'Lifestyle',
    description: 'A lifestyle expense bracket such as modest or wealthy living.',
  },
  other: {
    label: 'Other',
    description: 'A service that does not fit another category.',
  },
} as const satisfies Record<ServiceCategory, GameTermEntry>

/** Returns the display label for a service category. Falls back to the raw value. */
export function getServiceCategoryLabel(category: string): string {
  return SERVICE_CATEGORY_ENTRIES[category as ServiceCategory]?.label ?? category
}
