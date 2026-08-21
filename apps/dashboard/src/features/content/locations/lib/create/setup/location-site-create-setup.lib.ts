import { SITE_TYPE_ENTRIES, type SiteType } from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

export const SITE_CREATE_SETUP_PROMPT = 'What kind of site are you creating?' as const

export const SITE_CREATE_SETUP_FIELD_LABEL = 'Site type' as const

export const SITE_CREATE_SETUP_HEADLINE = 'Create site' as const

/** Canonical site type options — labels and descriptions from SITE_TYPE_ENTRIES. */
export function buildSiteTypeRadioOptions(): RadioCardOption[] {
  return Object.entries(SITE_TYPE_ENTRIES).map(([value, entry]) => ({
    value,
    label: entry.label,
    description: entry.description,
  }))
}

export function isSiteType(value: string): value is SiteType {
  return value in SITE_TYPE_ENTRIES
}
