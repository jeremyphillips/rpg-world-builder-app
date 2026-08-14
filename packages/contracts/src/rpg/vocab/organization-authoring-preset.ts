import type { OrganizationActivity } from './organization-activity'
import type { OrganizationDomain } from './organization-domain'
import type { OrganizationForm } from './organization-form'

export const ORGANIZATION_AUTHORING_PRESETS = {
  church: {
    label: 'Church',
    domain: 'religious',
    form: 'congregation',
    activities: ['worship', 'ministry'],
  },
  army: {
    label: 'Army',
    domain: 'military',
    activities: ['warfare', 'defense'],
  },
  bank: {
    label: 'Bank',
    domain: 'commercial',
    form: 'company',
    activities: ['banking', 'finance'],
  },
  academy: {
    label: 'Academy',
    domain: 'academic',
    form: 'association',
    activities: ['education', 'training', 'research'],
  },
  craft_guild: {
    label: 'Craft guild',
    domain: 'occupational',
    form: 'guild',
    activities: ['standards', 'apprenticeship', 'training'],
  },
  smuggling_ring: {
    label: 'Smuggling ring',
    domain: 'criminal',
    form: 'network',
    activities: ['smuggling'],
  },
} as const satisfies Record<
  string,
  {
    label: string
    domain: OrganizationDomain
    form?: OrganizationForm
    activities: readonly OrganizationActivity[]
  }
>

export type OrganizationAuthoringPresetId = keyof typeof ORGANIZATION_AUTHORING_PRESETS

export const ORGANIZATION_AUTHORING_PRESET_IDS = Object.keys(
  ORGANIZATION_AUTHORING_PRESETS,
) as OrganizationAuthoringPresetId[]

/** Returns editable canonical defaults; no preset identity is retained. */
export function applyOrganizationAuthoringPreset(id: OrganizationAuthoringPresetId): {
  organizationDomain: OrganizationDomain
  organizationForm?: OrganizationForm
  activities: OrganizationActivity[]
} {
  const preset = ORGANIZATION_AUTHORING_PRESETS[id]
  return {
    organizationDomain: preset.domain,
    ...('form' in preset ? { organizationForm: preset.form } : {}),
    activities: [...preset.activities],
  }
}
