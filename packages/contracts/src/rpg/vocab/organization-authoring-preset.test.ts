import { describe, expect, it } from 'vitest'

import {
  applyOrganizationAuthoringPreset,
  getOrganizationAuthoringPresetRecommendedPractices,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  ORGANIZATION_AUTHORING_PRESETS,
  type OrganizationAuthoringPresetId,
} from './organization-authoring-preset'
import { getOrganizationMembershipTitleEntry } from './organization-membership-title'
import { ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES } from './organization-member-title-entry'
import { ORGANIZATION_DOMAIN_IDS } from './organization-domain'
import { ORGANIZATION_FORM_IDS } from './organization-form'
import { ORGANIZATION_FUNCTION_IDS } from './organization-function'
import { ORGANIZATION_PRACTICE_IDS } from './organization-practice'

function normalizePresetLabel(label: string): string {
  return label.trim().toLowerCase()
}

describe('organization authoring presets', () => {
  it('registers fifty breadth-v1 familiar types', () => {
    expect(ORGANIZATION_AUTHORING_PRESET_IDS).toHaveLength(50)
  })

  it('projects only valid domain, form, function, and practice ids', () => {
    for (const preset of Object.values(ORGANIZATION_AUTHORING_PRESETS)) {
      expect(ORGANIZATION_DOMAIN_IDS).toContain(preset.domain)
      if ('form' in preset && preset.form) {
        expect(ORGANIZATION_FORM_IDS).toContain(preset.form)
      }
      for (const fn of preset.functions) {
        expect(ORGANIZATION_FUNCTION_IDS).toContain(fn)
      }
      for (const practice of preset.practices) {
        expect(ORGANIZATION_PRACTICE_IDS).toContain(practice)
      }
    }
  })

  it('does not keep another preset label in discoveryTerms', () => {
    for (const id of ORGANIZATION_AUTHORING_PRESET_IDS) {
      const label = normalizePresetLabel(ORGANIZATION_AUTHORING_PRESETS[id].label)
      for (const otherId of ORGANIZATION_AUTHORING_PRESET_IDS) {
        if (otherId === id) continue
        const other = ORGANIZATION_AUTHORING_PRESETS[otherId]
        const terms = 'discoveryTerms' in other ? (other.discoveryTerms ?? []) : []
        for (const term of terms) {
          expect(normalizePresetLabel(term)).not.toBe(label)
        }
      }
    }
  })

  it('requires a description on every preset', () => {
    for (const preset of Object.values(ORGANIZATION_AUTHORING_PRESETS)) {
      expect(preset.description.trim()).not.toBe('')
    }
  })

  it('requires membership title refs that resolve in the vocabulary', () => {
    for (const id of ORGANIZATION_AUTHORING_PRESET_IDS) {
      const preset = ORGANIZATION_AUTHORING_PRESETS[id]
      expect(preset.members.titles.length).toBeGreaterThan(0)
      const seen = new Set<string>()
      for (const ref of preset.members.titles) {
        expect(getOrganizationMembershipTitleEntry(ref.titleId)).toBeDefined()
        expect(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES).toContain(ref.priority)
        expect(seen.has(ref.titleId)).toBe(false)
        seen.add(ref.titleId)
      }
    }
  })

  it('requires recommendedPractices on every preset with valid, disjoint practice ids', () => {
    for (const id of ORGANIZATION_AUTHORING_PRESET_IDS) {
      const preset = ORGANIZATION_AUTHORING_PRESETS[id]
      expect(preset).toHaveProperty('recommendedPractices')
      expect(Array.isArray(preset.recommendedPractices)).toBe(true)

      const seen = new Set<string>()
      for (const practice of preset.recommendedPractices) {
        expect(ORGANIZATION_PRACTICE_IDS).toContain(practice)
        expect(seen.has(practice)).toBe(false)
        seen.add(practice)
        expect(preset.practices).not.toContain(practice)
      }

      expect(getOrganizationAuthoringPresetRecommendedPractices(id)).toEqual(
        preset.recommendedPractices,
      )
    }
  })

  it('curates high-signal recommended practice ordering', () => {
    expect(ORGANIZATION_AUTHORING_PRESETS.thieves_guild.recommendedPractices).toEqual([
      'fencing',
      'extortion',
      'smuggling',
      'investigation',
    ])
    expect(ORGANIZATION_AUTHORING_PRESETS.protection_racket.recommendedPractices).toEqual([
      'theft',
      'fencing',
      'gambling',
    ])
    expect(ORGANIZATION_AUTHORING_PRESETS.navy.recommendedPractices).toEqual([
      'shipbuilding',
      'espionage',
      'piracy',
    ])
    expect(ORGANIZATION_AUTHORING_PRESETS.city_watch.recommendedPractices).toEqual([
      'bodyguarding',
      'bounty_hunting',
      'scouting',
    ])
    expect(ORGANIZATION_AUTHORING_PRESETS.merchant_house.recommendedPractices).toEqual([
      'brokerage',
      'warehousing',
    ])
    expect(ORGANIZATION_AUTHORING_PRESETS.labor_union.recommendedPractices).toEqual([])
  })

  it('does not expose recommendedPractices from applyOrganizationAuthoringPreset', () => {
    const values = applyOrganizationAuthoringPreset('thieves_guild')
    expect(values).not.toHaveProperty('recommendedPractices')
  })

  it('returns an editable recipe without durable preset provenance', () => {
    const values = applyOrganizationAuthoringPreset('smuggling_ring')
    values.organizationDomain = 'political'
    values.functions = ['finance']
    values.practices = []

    expect(values).toEqual({
      organizationDomain: 'political',
      organizationForm: 'network',
      functions: ['finance'],
      practices: [],
    })
    expect(values).not.toHaveProperty('authoringPresetId')
    expect(values).not.toHaveProperty('description')
    expect(values).not.toHaveProperty('discoveryTerms')
  })

  it('projects force on the Army recipe', () => {
    expect(applyOrganizationAuthoringPreset('army')).toEqual({
      organizationDomain: 'military',
      organizationForm: 'force',
      functions: ['warfare', 'defense'],
      practices: [],
    })
  })

  it.each([
    [
      'academy',
      {
        organizationDomain: 'academic',
        organizationForm: 'association',
        functions: ['education', 'training', 'research'],
        practices: [],
      },
    ],
    [
      'bank',
      {
        organizationDomain: 'commercial',
        organizationForm: 'company',
        functions: ['finance'],
        practices: ['banking'],
      },
    ],
    [
      'craft_guild',
      {
        organizationDomain: 'occupational',
        organizationForm: 'guild',
        functions: ['standards', 'training'],
        practices: ['apprenticeship'],
      },
    ],
    [
      'smuggling_ring',
      {
        organizationDomain: 'criminal',
        organizationForm: 'network',
        functions: [],
        practices: ['smuggling'],
      },
    ],
    [
      'church',
      {
        organizationDomain: 'religious',
        organizationForm: 'congregation',
        functions: ['worship', 'ministry'],
        practices: [],
      },
    ],
    [
      'knightly_order',
      {
        organizationDomain: 'military',
        organizationForm: 'order',
        functions: ['warfare', 'defense'],
        practices: [],
      },
    ],
    [
      'government_ministry',
      {
        organizationDomain: 'government',
        organizationForm: 'office',
        functions: ['administration'],
        practices: [],
      },
    ],
    [
      'trading_company',
      {
        organizationDomain: 'commercial',
        organizationForm: 'company',
        functions: ['trade'],
        practices: [],
      },
    ],
    [
      'religious_order',
      {
        organizationDomain: 'religious',
        organizationForm: 'order',
        functions: ['worship', 'ministry'],
        practices: [],
      },
    ],
    [
      'city_council',
      {
        organizationDomain: 'government',
        organizationForm: 'association',
        functions: [],
        practices: [],
      },
    ],
    [
      'political_party',
      {
        organizationDomain: 'political',
        organizationForm: 'association',
        functions: ['advocacy'],
        practices: [],
      },
    ],
    [
      'adventurers_guild',
      {
        organizationDomain: 'occupational',
        organizationForm: 'guild',
        functions: [],
        practices: [],
      },
    ],
    [
      'thieves_guild',
      {
        organizationDomain: 'criminal',
        organizationForm: 'guild',
        functions: [],
        practices: ['theft'],
      },
    ],
    [
      'shipping_company',
      {
        organizationDomain: 'commercial',
        organizationForm: 'company',
        functions: ['transport'],
        practices: ['navigation'],
      },
    ],
    [
      'city_watch',
      {
        organizationDomain: 'government',
        functions: ['policing'],
        practices: ['investigation'],
      },
    ],
    [
      'mutual_aid_society',
      {
        organizationDomain: 'community',
        organizationForm: 'association',
        functions: ['aid'],
        practices: [],
      },
    ],
    ['gang', { organizationDomain: 'criminal', functions: [], practices: [] }],
  ] as const)('projects %s from the confirmed v1 subset', (id, expected) => {
    expect(applyOrganizationAuthoringPreset(id)).toEqual(expected)
  })

  it('does not attach transport discovery terms to Trading company', () => {
    expect(ORGANIZATION_AUTHORING_PRESETS.trading_company.discoveryTerms ?? []).not.toEqual(
      expect.arrayContaining(['shipping', 'caravan', 'coach', 'courier']),
    )
    expect(ORGANIZATION_AUTHORING_PRESETS.shipping_company.discoveryTerms).toEqual(
      expect.arrayContaining(['coach line', 'courier service']),
    )
    expect(ORGANIZATION_AUTHORING_PRESETS.army.discoveryTerms ?? []).not.toContain('navy')
    expect(ORGANIZATION_AUTHORING_PRESETS.army.discoveryTerms ?? []).not.toContain('militia')
    expect(ORGANIZATION_AUTHORING_PRESETS.army.discoveryTerms ?? []).not.toContain('pirate crew')
  })

  it.each([
    ['navy', { organizationForm: 'force', practices: ['navigation'] }],
    ['protection_racket', { practices: ['extortion'] }],
    ['assassins_order', { practices: ['assassination'] }],
    ['farming_cooperative', { organizationForm: 'cooperative', practices: ['farming'] }],
    ['explorers_society', { practices: ['cartography', 'surveying'] }],
  ] as const satisfies ReadonlyArray<
    readonly [OrganizationAuthoringPresetId, Record<string, unknown>]
  >)('projects breadth presets for %s', (id, expected) => {
    expect(applyOrganizationAuthoringPreset(id)).toEqual(expect.objectContaining(expected))
  })
})
