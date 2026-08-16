import type {
  OrganizationAuthoringPresetId,
  OrganizationFunction,
  OrganizationLegacyActivity,
  OrganizationPractice,
} from '@rpg/contracts'

/**
 * Activity-pressure regression fixture — not a coverage KPI.
 *
 * Locks representative preset projections and Function boundary cases after the
 * functions/practices split. Update rows deliberately when classification changes
 * on purpose.
 */
export type OrganizationActivityPressurePresetRow = {
  id: string
  presetId: OrganizationAuthoringPresetId
  presetFunctions: readonly OrganizationFunction[]
  presetPractices: readonly OrganizationPractice[]
  notes?: string
}

export type OrganizationActivityPressureCustomRow = {
  id: string
  customLegacyActivities: readonly OrganizationLegacyActivity[]
  notes?: string
}

export type OrganizationActivityPressureRow =
  | OrganizationActivityPressurePresetRow
  | OrganizationActivityPressureCustomRow

export function isActivityPressurePresetRow(
  row: OrganizationActivityPressureRow,
): row is OrganizationActivityPressurePresetRow {
  return 'presetId' in row
}

export const ORGANIZATION_ACTIVITY_PRESSURE_FIXTURE = [
  {
    id: 'city_watch_policing',
    presetId: 'city_watch',
    presetFunctions: ['policing'],
    presetPractices: [],
    notes: 'Civic order enforcement — not external defense.',
  },
  {
    id: 'army_warfare_defense',
    presetId: 'army',
    presetFunctions: ['warfare', 'defense'],
    presetPractices: [],
    notes: 'Armed host — warfare plus protection, not policing.',
  },
  {
    id: 'political_party_advocacy',
    presetId: 'political_party',
    presetFunctions: ['advocacy'],
    presetPractices: [],
    notes: 'Campaigning and representation.',
  },
  {
    id: 'mutual_aid_society_aid',
    presetId: 'mutual_aid_society',
    presetFunctions: ['aid'],
    presetPractices: [],
    notes: 'Material relief and reciprocal support — not clinical care.',
  },
  {
    id: 'church_worship_ministry',
    presetId: 'church',
    presetFunctions: ['worship', 'ministry'],
    presetPractices: [],
    notes: 'Faith community — pastoral service without care.',
  },
  {
    id: 'government_ministry_administration',
    presetId: 'government_ministry',
    presetFunctions: ['administration'],
    presetPractices: [],
    notes: 'Bureaucratic function — governance not inherent to ministries.',
  },
  {
    id: 'scholarly_society_research',
    presetId: 'scholarly_society',
    presetFunctions: ['research'],
    presetPractices: [],
    notes: 'Inquiry — exploration left to customize path.',
  },
  {
    id: 'smuggling_ring_smuggling',
    presetId: 'smuggling_ring',
    presetFunctions: [],
    presetPractices: ['smuggling'],
    notes: 'Practice only — no Function pile-on.',
  },
  {
    id: 'hospital_order_care_ministry',
    customLegacyActivities: ['care', 'ministry'],
    notes: 'Hospital order customize path — bodily care plus pastoral service.',
  },
  {
    id: 'secret_police_composition',
    customLegacyActivities: ['policing', 'intelligence', 'administration'],
    notes: 'Secret police honestly composes order, covert information, and bureaucracy.',
  },
] as const satisfies readonly OrganizationActivityPressureRow[]
