import { describe, expect, it } from 'vitest'

import type { ContentResolutionRow } from './content-resolution-policy'
import {
  collectCatalogReferenceIssues,
  equipmentPresencePolicy,
  skillReferencePolicy,
  spellReferencePolicy,
  type CatalogReferencePolicy,
} from './catalog-reference-issues'

const draftRow = { status: 'draft' }
const publishedRow = { status: 'published' }
const ineligibleRow = {
  status: 'published',
  campaignAccess: { available: false },
} as ContentResolutionRow

const spellMessages = {
  unknown: 'Choose a spell from the catalog.',
  notReferenceable: 'Draft spells cannot be referenced on published content.',
  catalogUnavailable: 'The spell catalog is unavailable, so this reference cannot be checked.',
}

const skillMessages = {
  unknown: 'Unknown skill.',
  notReferenceable: 'Publish this skill before using it on a monster.',
  notCampaignEligible: 'This skill is not available in this campaign.',
  catalogUnavailable: 'Skills could not be loaded. Try again before publishing.',
}

const equipmentMessages = {
  unknown: 'Unknown equipment.',
  catalogUnavailable: 'Equipment could not be loaded. Try again before publishing.',
}

const skillWithoutCampaignCheck = {
  subject: 'skill',
  checks: {
    unknown: ['publish'],
    notReferenceable: ['publish'],
    catalogUnavailable: ['publish'],
  },
} as const satisfies CatalogReferencePolicy<'skill'>

describe('collectCatalogReferenceIssues', () => {
  it('does not emit unknown when the catalog is unavailable', () => {
    expect(
      collectCatalogReferenceIssues({
        policy: spellReferencePolicy,
        intent: 'draft',
        catalogStatus: 'unavailable',
        refs: [{ path: 'spellIds.0', key: 'missing' }],
        resolve: () => undefined,
        unavailablePlacement: { kind: 'per-ref' },
        messages: spellMessages,
      }),
    ).toEqual([])

    expect(
      collectCatalogReferenceIssues({
        policy: spellReferencePolicy,
        intent: 'publish',
        catalogStatus: 'unavailable',
        refs: [{ path: 'spellIds.0', key: 'missing' }],
        resolve: () => undefined,
        unavailablePlacement: { kind: 'per-ref' },
        messages: spellMessages,
      }),
    ).toEqual([
      {
        path: 'spellIds.0',
        code: 'spell_catalog_unavailable',
        message: 'The spell catalog is unavailable, so this reference cannot be checked.',
      },
    ])
  })

  it('emits nothing for an empty per-ref list and one aggregate issue for an empty list', () => {
    expect(
      collectCatalogReferenceIssues({
        policy: spellReferencePolicy,
        intent: 'publish',
        catalogStatus: 'unavailable',
        refs: [],
        resolve: () => undefined,
        unavailablePlacement: { kind: 'per-ref' },
        messages: spellMessages,
      }),
    ).toEqual([])

    expect(
      collectCatalogReferenceIssues({
        policy: equipmentPresencePolicy,
        intent: 'publish',
        catalogStatus: 'unavailable',
        refs: [],
        resolve: () => undefined,
        unavailablePlacement: { kind: 'aggregate', path: 'equipment' },
        messages: equipmentMessages,
      }),
    ).toEqual([
      {
        path: 'equipment',
        code: 'equipment_catalog_unavailable',
        message: 'Equipment could not be loaded. Try again before publishing.',
      },
    ])
  })

  it('gates checks by intent', () => {
    const refs = [{ path: 'proficiencies.skills.0.skill', key: 'missing' }]
    const resolve = () => undefined

    expect(
      collectCatalogReferenceIssues({
        policy: skillReferencePolicy,
        intent: 'draft',
        catalogStatus: 'ready',
        refs,
        resolve,
        unavailablePlacement: { kind: 'aggregate', path: 'proficiencies.skills' },
        messages: skillMessages,
      }),
    ).toEqual([])

    expect(
      collectCatalogReferenceIssues({
        policy: equipmentPresencePolicy,
        intent: 'draft',
        catalogStatus: 'ready',
        refs: [{ path: 'equipment.0.equipmentId', key: 'missing' }],
        resolve,
        unavailablePlacement: { kind: 'aggregate', path: 'equipment' },
        messages: equipmentMessages,
      }),
    ).toEqual([
      {
        path: 'equipment.0.equipmentId',
        code: 'unknown_equipment',
        message: 'Unknown equipment.',
      },
    ])

    expect(
      collectCatalogReferenceIssues({
        policy: skillReferencePolicy,
        intent: 'publish',
        catalogStatus: 'ready',
        refs,
        resolve,
        unavailablePlacement: { kind: 'aggregate', path: 'proficiencies.skills' },
        messages: skillMessages,
      }),
    ).toEqual([
      {
        path: 'proficiencies.skills.0.skill',
        code: 'unknown_skill',
        message: 'Unknown skill.',
      },
    ])
  })

  it('emits not referenceable before campaign eligibility', () => {
    expect(
      collectCatalogReferenceIssues({
        policy: skillReferencePolicy,
        intent: 'publish',
        catalogStatus: 'ready',
        refs: [{ path: 'proficiencies.skills.0.skill', key: 'draft-skill' }],
        resolve: () => draftRow,
        unavailablePlacement: { kind: 'aggregate', path: 'proficiencies.skills' },
        messages: skillMessages,
      }),
    ).toEqual([
      {
        path: 'proficiencies.skills.0.skill',
        code: 'skill_not_referenceable',
        message: 'Publish this skill before using it on a monster.',
      },
    ])

    expect(
      collectCatalogReferenceIssues({
        policy: skillReferencePolicy,
        intent: 'publish',
        catalogStatus: 'ready',
        refs: [{ path: 'proficiencies.skills.1.skill', key: 'hidden' }],
        resolve: () => ineligibleRow,
        unavailablePlacement: { kind: 'aggregate', path: 'proficiencies.skills' },
        messages: skillMessages,
      }),
    ).toEqual([
      {
        path: 'proficiencies.skills.1.skill',
        code: 'skill_not_campaign_eligible',
        message: 'This skill is not available in this campaign.',
      },
    ])
  })

  it('does not emit a check the policy omits', () => {
    expect(
      collectCatalogReferenceIssues({
        policy: skillWithoutCampaignCheck,
        intent: 'publish',
        catalogStatus: 'ready',
        refs: [{ path: 'proficiencies.skills.0.skill', key: 'hidden' }],
        resolve: () => ineligibleRow,
        unavailablePlacement: { kind: 'aggregate', path: 'proficiencies.skills' },
        messages: skillMessages,
      }),
    ).toEqual([])

    expect(
      collectCatalogReferenceIssues({
        policy: spellReferencePolicy,
        intent: 'publish',
        catalogStatus: 'ready',
        refs: [{ path: 'spellIds.0', key: 'hidden' }],
        resolve: () => ineligibleRow,
        unavailablePlacement: { kind: 'per-ref' },
        messages: spellMessages,
      }),
    ).toEqual([])

    expect(
      collectCatalogReferenceIssues({
        policy: spellReferencePolicy,
        intent: 'publish',
        catalogStatus: 'ready',
        refs: [{ path: 'spellIds.0', key: 'published' }],
        resolve: () => publishedRow,
        unavailablePlacement: { kind: 'per-ref' },
        messages: spellMessages,
      }),
    ).toEqual([])
  })

  it('emits one issue per ref in ref order', () => {
    const rows = new Map<string, { status: string }>([
      ['draft-spell', draftRow],
      ['published-spell', publishedRow],
    ])

    expect(
      collectCatalogReferenceIssues({
        policy: spellReferencePolicy,
        intent: 'publish',
        catalogStatus: 'ready',
        refs: [
          { path: 'spellIds.0', key: 'missing' },
          { path: 'spellIds.1', key: 'draft-spell' },
          { path: 'spellIds.2', key: 'published-spell' },
        ],
        resolve: (key) => rows.get(key),
        unavailablePlacement: { kind: 'per-ref' },
        messages: spellMessages,
      }),
    ).toEqual([
      {
        path: 'spellIds.0',
        code: 'unknown_spell',
        message: 'Choose a spell from the catalog.',
      },
      {
        path: 'spellIds.1',
        code: 'spell_not_referenceable',
        message: 'Draft spells cannot be referenced on published content.',
      },
    ])
  })
})
