import type { OrganizationLegacyActivity } from './organization-activity-migration'
import { migrateOrganizationActivities } from './organization-activity-migration'
import type { OrganizationDomain } from './organization-domain'
import type { OrganizationForm } from './organization-form'
import type { OrganizationFunction } from './organization-function'
import type { OrganizationPractice } from './organization-practice'

/**
 * Ephemeral familiar starting points for organization authoring.
 *
 * Presets project editable domain / form / activities only. Preset identity is
 * never persisted. `discoveryTerms` are authoring discovery strings that help
 * users find a closest starting point — not lexical aliases and not the same
 * field as `OrganizationClassificationEntry.searchTerms`.
 */
export type OrganizationAuthoringPresetEntry = {
  label: string
  /** Closest-starting-point rationale shown on the picker option. */
  description: string
  /** Adjacent familiar names and search helpers for picker discovery. */
  discoveryTerms?: readonly string[]
  domain: OrganizationDomain
  form?: OrganizationForm
  activities: readonly OrganizationLegacyActivity[]
}

export const ORGANIZATION_AUTHORING_PRESETS = {
  academy: {
    label: 'Academy',
    description: 'Closest starting point for university, mage college, and teaching bodies.',
    discoveryTerms: ['university', 'mage college', 'bardic college', 'seminary', 'wizard circle'],
    domain: 'academic',
    form: 'association',
    activities: ['education', 'training', 'research'],
  },
  adventurers_guild: {
    label: "Adventurers' guild",
    description:
      'Closest starting point for an adventurer hall, company, or monster hunters guild.',
    discoveryTerms: ["monster hunters' guild", 'adventuring company', 'treasure hunters'],
    domain: 'occupational',
    form: 'guild',
    activities: [],
  },
  army: {
    label: 'Army',
    description: 'Closest starting point for navy, militia, marines, and other armed hosts.',
    discoveryTerms: [
      'navy',
      'militia',
      'marines',
      'sky fleet',
      'garrison',
      'legion',
      'crusading host',
      'royal guard',
      'warband',
      'pirate crew',
    ],
    domain: 'military',
    form: 'force',
    activities: ['warfare', 'defense'],
  },
  bank: {
    label: 'Bank',
    description: 'Closest starting point for moneylenders, pawnbrokers, and tax farmers.',
    discoveryTerms: ['moneylenders', 'pawnbrokers', 'tax farmers', 'insurance company'],
    domain: 'commercial',
    form: 'company',
    activities: ['banking', 'finance'],
  },
  church: {
    label: 'Church',
    description: 'Closest starting point for temple, cult, and gathered faith communities.',
    discoveryTerms: [
      'temple',
      'temple organization',
      'cult',
      'druid circle',
      'heretical sect',
      "witches' coven",
      'missionary society',
      'pilgrimage society',
      'inquisitorial office',
    ],
    domain: 'religious',
    form: 'congregation',
    activities: ['worship', 'ministry'],
  },
  city_council: {
    label: 'City council',
    description: 'Closest starting point for parliament, senate, and privy council.',
    discoveryTerms: ['parliament', 'senate', 'privy council'],
    domain: 'government',
    form: 'association',
    activities: [],
  },
  city_watch: {
    label: 'City watch',
    description: 'Closest starting point for civic policing and crown law enforcement.',
    discoveryTerms: ['marshals'],
    domain: 'government',
    activities: ['policing'],
  },
  craft_guild: {
    label: 'Craft guild',
    description: 'Closest starting point for scribes, alchemists, and professional trade guilds.',
    discoveryTerms: [
      'merchant guild',
      'labor union',
      'professional college',
      'hunters lodge',
      'scribes guild',
      'entertainers guild',
      'alchemists guild',
      'cartographers guild',
      'pilots guild',
      'advocates guild',
      'apothecaries guild',
      'theater troupe',
      'teamsters guild',
      'river boatmen',
      'market association',
      'shopkeepers association',
      'factors guild',
      'ranchers association',
      'surgeons college',
    ],
    domain: 'occupational',
    form: 'guild',
    activities: ['standards', 'apprenticeship', 'training'],
  },
  gang: {
    label: 'Gang',
    description: 'Closest starting point for street gangs, protection rackets, and prison crews.',
    discoveryTerms: ['protection racket', 'wreckers', 'prison gang'],
    domain: 'criminal',
    activities: [],
  },
  government_ministry: {
    label: 'Government ministry',
    description:
      'Closest starting point for customs service, provincial administration, and executive departments.',
    discoveryTerms: [
      'royal court',
      'magistracy',
      'exchequer',
      'diplomatic corps',
      'mint',
      'postal service',
      'customs service',
      'provincial governorate',
      'colonial administration',
    ],
    domain: 'government',
    form: 'office',
    activities: ['administration'],
  },
  knightly_order: {
    label: 'Knightly order',
    description: 'Chivalric membership organized around martial discipline and sworn service.',
    domain: 'military',
    form: 'order',
    activities: ['warfare', 'defense'],
  },
  mercenary_company: {
    label: 'Mercenary company',
    description: 'Closest starting point for ranger company and other hired fighting enterprises.',
    discoveryTerms: ['ranger company'],
    domain: 'military',
    form: 'company',
    activities: ['warfare'],
  },
  mutual_aid_society: {
    label: 'Mutual aid society',
    description:
      'Closest starting point for burial societies, civic leagues, and reciprocal support bodies.',
    discoveryTerms: [
      'orphanage society',
      'famine relief society',
      'burial society',
      'civic league',
      'festival guild',
      'sporting club',
      'hospice society',
    ],
    domain: 'community',
    form: 'association',
    activities: ['aid'],
  },
  political_party: {
    label: 'Political party',
    description: 'Closest starting point for reform league and advocacy society.',
    discoveryTerms: ['reform league', 'advocacy society'],
    domain: 'political',
    form: 'association',
    activities: ['advocacy'],
  },
  religious_order: {
    label: 'Religious order',
    description: 'Closest starting point for monastery and rule-bound faith communities.',
    discoveryTerms: ['monastery'],
    domain: 'religious',
    form: 'order',
    activities: ['worship', 'ministry'],
  },
  scholarly_society: {
    label: 'Scholarly society',
    description:
      "Closest starting point for explorers' society, guild of scholars, and museum society.",
    discoveryTerms: [
      "explorers' society",
      'guild of scholars',
      'museum society',
      'research institute',
    ],
    domain: 'academic',
    form: 'association',
    activities: ['research'],
  },
  shipping_company: {
    label: 'Shipping company',
    description: 'Closest starting point for caravan operators, coach lines, and courier services.',
    discoveryTerms: ['caravan company', 'coach line', 'courier service'],
    domain: 'commercial',
    form: 'company',
    activities: ['transport'],
  },
  smuggling_ring: {
    label: 'Smuggling ring',
    description: 'Closest starting point for fencing networks and counterfeiting rings.',
    discoveryTerms: ['fencing network', 'counterfeiting ring', 'criminal syndicate'],
    domain: 'criminal',
    form: 'network',
    activities: ['smuggling'],
  },
  thieves_guild: {
    label: "Thieves' guild",
    description: "Closest starting point for beggars' guild and urban criminal guilds.",
    discoveryTerms: ["beggars' guild"],
    domain: 'criminal',
    form: 'guild',
    activities: [],
  },
  trading_company: {
    label: 'Trading company',
    description: 'Closest starting point for merchant house and chartered company.',
    discoveryTerms: [
      'merchant house',
      'chartered company',
      'auction house',
      'warehouse combine',
      'bazaar syndicate',
      'company of merchant adventurers',
      'fur company',
      'foundry works',
      'textile manufactory',
      'shipyard company',
      'glassworks',
      'farming cooperative',
      'millers cooperative',
      'logging company',
      'fishing fleet',
    ],
    domain: 'commercial',
    form: 'company',
    activities: ['trade'],
  },
} as const satisfies Record<string, OrganizationAuthoringPresetEntry>

export type OrganizationAuthoringPresetId = keyof typeof ORGANIZATION_AUTHORING_PRESETS

export const ORGANIZATION_AUTHORING_PRESET_IDS = Object.keys(
  ORGANIZATION_AUTHORING_PRESETS,
) as OrganizationAuthoringPresetId[]

/** Returns editable canonical defaults; no preset identity is retained. */
export function applyOrganizationAuthoringPreset(id: OrganizationAuthoringPresetId): {
  organizationDomain: OrganizationDomain
  organizationForm?: OrganizationForm
  functions: OrganizationFunction[]
  practices: OrganizationPractice[]
} {
  const preset = ORGANIZATION_AUTHORING_PRESETS[id]
  const { functions, practices } = migrateOrganizationActivities(preset.activities)
  return {
    organizationDomain: preset.domain,
    ...('form' in preset ? { organizationForm: preset.form } : {}),
    functions,
    practices,
  }
}
