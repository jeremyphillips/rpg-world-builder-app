import type { OrganizationActivity, OrganizationAuthoringPresetId } from '@rpg/contracts'

/**
 * Activity-pressure regression fixture — not a coverage KPI.
 *
 * Locks representative preset projections and Function boundary cases after the
 * v2 Function package admission. Update rows deliberately when activities change
 * on purpose.
 */
export type OrganizationActivityPressurePresetRow = {
  id: string
  presetId: OrganizationAuthoringPresetId
  presetActivities: readonly OrganizationActivity[]
  notes?: string
}

export type OrganizationActivityPressureCustomRow = {
  id: string
  customActivities: readonly OrganizationActivity[]
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
    presetActivities: ['policing'],
    notes: 'Civic order enforcement — not external defense.',
  },
  {
    id: 'army_warfare_defense',
    presetId: 'army',
    presetActivities: ['warfare', 'defense'],
    notes: 'Armed host — warfare plus protection, not policing.',
  },
  {
    id: 'political_party_advocacy',
    presetId: 'political_party',
    presetActivities: ['advocacy'],
    notes: 'Campaigning and representation.',
  },
  {
    id: 'mutual_aid_society_aid',
    presetId: 'mutual_aid_society',
    presetActivities: ['aid'],
    notes: 'Material relief and reciprocal support — not clinical care.',
  },
  {
    id: 'church_worship_ministry',
    presetId: 'church',
    presetActivities: ['worship', 'ministry'],
    notes: 'Faith community — pastoral service without care.',
  },
  {
    id: 'government_ministry_administration',
    presetId: 'government_ministry',
    presetActivities: ['administration'],
    notes: 'Bureaucratic function — governance not inherent to ministries.',
  },
  {
    id: 'scholarly_society_research',
    presetId: 'scholarly_society',
    presetActivities: ['research'],
    notes: 'Inquiry — exploration left to customize path.',
  },
  {
    id: 'smuggling_ring_smuggling',
    presetId: 'smuggling_ring',
    presetActivities: ['smuggling'],
    notes: 'Practice only — no Function pile-on.',
  },
  {
    id: 'hospital_order_care_ministry',
    customActivities: ['care', 'ministry'],
    notes: 'Hospital order customize path — bodily care plus pastoral service.',
  },
  {
    id: 'secret_police_composition',
    customActivities: ['policing', 'intelligence', 'administration'],
    notes: 'Secret police honestly composes order, covert information, and bureaucracy.',
  },
] as const satisfies readonly OrganizationActivityPressureRow[]
