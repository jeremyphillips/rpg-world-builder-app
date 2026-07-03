import { z } from 'zod'

import { getTermSentenceForm } from '../types'
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
    sentence: {
      singular: 'hireling',
      plural: 'hirelings',
    },
  },
  lodging: {
    label: 'Lodging',
    description: 'Inn rooms, apartments, and other overnight accommodations.',
    sentence: {
      singular: 'lodging',
      plural: 'lodgings',
    },
  },
  meal: {
    label: 'Meal',
    description: 'Food and drink purchased at an inn, tavern, or market.',
    sentence: {
      singular: 'meal',
      plural: 'meals',
    },
  },
  travel: {
    label: 'Travel',
    description: 'Overland or local travel services such as a messenger or guide.',
    sentence: {
      singular: 'travel service',
      plural: 'travel services',
    },
  },
  transport: {
    label: 'Transport',
    description: 'Passenger transport by coach, ship, or similar conveyance.',
    sentence: {
      singular: 'transport service',
      plural: 'transport services',
    },
  },
  stable: {
    label: 'Stable',
    description: 'Stabling, feed, and care for a mount.',
    sentence: {
      singular: 'stable service',
      plural: 'stable services',
    },
  },
  spellcasting: {
    label: 'Spellcasting',
    description: 'Paid spellcasting from an NPC with the appropriate spell list.',
    sentence: {
      singular: 'spellcasting service',
      plural: 'spellcasting services',
    },
  },
  lifestyle: {
    label: 'Lifestyle',
    description: 'A lifestyle expense bracket such as modest or wealthy living.',
    sentence: {
      singular: 'lifestyle expense',
      plural: 'lifestyle expenses',
    },
  },
  other: {
    label: 'Other',
    description: 'A service that does not fit another category.',
  },
} as const satisfies Record<ServiceCategory, GameTermEntry>

/** Returns the reference entry for a service category, if known. */
export function getServiceCategoryEntry(category: string): GameTermEntry | undefined {
  return SERVICE_CATEGORY_ENTRIES[category as ServiceCategory]
}

/** Returns the display label for a service category. Falls back to the raw value. */
export function getServiceCategoryLabel(category: string): string {
  return getServiceCategoryEntry(category)?.label ?? category
}

/** Counted noun phrase for generated service pool prose. */
export function getServiceCategorySentenceForm(category: string, count = 1): string {
  const entry = getServiceCategoryEntry(category)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: category, description: '' }, count)
}
