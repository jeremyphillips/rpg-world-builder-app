import { describe, expect, it } from 'vitest'
import {
  buildContentPurposeSelectors,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  ORGANIZATION_AUTHORING_PRESET_IDS,
} from '@rpg/contracts'

import { buildQuickNpcClassRadioCardPresentation } from '@/features/character'
import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import type { OrganizationMemberPickerCandidate } from '../../lib/members/organization-member-picker-drawer.lib'
import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import {
  buildOrganizationCreateInput,
  buildOrganizationFormValueSyncs,
  organizationToFormValues,
} from '../../../lib/forms/organization-form-projection'
import { buildMemberClassAffinityChipOptions } from './organization-member-class-chip-options.lib'
import { isOrganizationMemberPickerRecommended } from './organization-member-picker-drawer.lib'

function collectPresetOptionValues(): string[] {
  return [...ORGANIZATION_AUTHORING_PRESET_IDS]
}

describe('organization member class affinities integration', () => {
  const rogue = makeCharacterClass({ slug: 'rogue', id: 'class-rogue', name: 'Rogue' })
  const fighter = makeCharacterClass({ slug: 'fighter', id: 'class-fighter', name: 'Fighter' })
  const wizard = makeCharacterClass({ slug: 'wizard', id: 'class-wizard', name: 'Wizard' })

  it('persists familiar-seeded affinities and materialized titles after save/reload', () => {
    const [sync] = buildOrganizationFormValueSyncs(undefined, [rogue])
    const applied = sync?.apply({ startingPointId: 'thieves_guild' }, ['startingPointId'])

    expect(applied).toMatchObject({
      startingPointId: 'thieves_guild',
      practices: ['theft'],
      'members.classAffinityIds': ['class-rogue'],
      'members.titles': expect.any(Array),
    })

    const saved = buildOrganizationCreateInput({
      name: 'Dockside Exchange',
      startingPointId: 'thieves_guild',
      organizationDomain: 'criminal',
      organizationForm: 'network',
      functions: [],
      practices: ['theft'],
      members: {
        classAffinityIds: ['class-rogue'],
        speciesAffinityIds: [],
        titles: applied?.['members.titles'] as never,
      },
    })

    expect(saved).not.toHaveProperty('startingPointId')
    expect(saved).not.toHaveProperty('sourcePresetId')
    expect(saved.members.classAffinityIds).toEqual(['class-rogue'])
    expect((saved.members.titles ?? []).length).toBeGreaterThan(0)

    const reopened = organizationToFormValues({
      ...saved,
      id: 'org-thieves',
      slug: 'dockside-exchange',
      rulesetId: 'srd-cc-5.2.1',
      source: 'homebrew',
      status: 'published',
      campaignId: 'camp_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      connections: { locations: [] },
      members: {
        classAffinityIds: saved.members.classAffinityIds,
        speciesAffinityIds: saved.members.speciesAffinityIds,
        titles: saved.members.titles ?? [],
      },
    })

    expect(reopened).toMatchObject({
      practices: ['theft'],
      members: { classAffinityIds: ['class-rogue'], speciesAffinityIds: [] },
    })
    expect(reopened).not.toHaveProperty('startingPointId')
  })

  it('round-trips custom affinity ids through edit form values', () => {
    const reopened = organizationToFormValues({
      id: 'org-free-company',
      slug: 'free-company',
      rulesetId: 'srd-cc-5.2.1',
      source: 'homebrew',
      status: 'published',
      campaignId: 'camp_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Free Company',
      organizationDomain: 'military',
      functions: [],
      practices: [],
      members: {
        classAffinityIds: ['class-fighter', 'class-barbarian', 'class-wizard'],
        speciesAffinityIds: [],
        titles: [],
      },
      connections: { locations: [] },
    })

    expect(reopened.members?.classAffinityIds).toEqual([
      'class-fighter',
      'class-barbarian',
      'class-wizard',
    ])
  })

  it('keeps unavailable stored classes out of downstream recommendation UI', () => {
    const candidate: OrganizationMemberPickerCandidate = {
      id: 'npc-wizard',
      name: 'Arcane Contact',
      summary: 'Human · Level 5 Wizard',
      characterType: 'npc',
      classIds: [wizard.id],
      isMember: false,
    }

    expect(
      isOrganizationMemberPickerRecommended(candidate, {
        classAffinityIds: [wizard.id],
        speciesAffinityIds: [],
        playableClasses: [fighter, rogue],
        playableSpecies: [],
      }),
    ).toBe(false)

    expect(
      buildQuickNpcClassRadioCardPresentation({
        classOptions: [
          { value: fighter.id, label: fighter.name },
          { value: rogue.id, label: rogue.name },
        ],
        classAffinityIds: [wizard.id],
        playableClasses: [fighter, rogue],
      }),
    ).toEqual({
      options: [
        { value: fighter.id, label: 'Fighter' },
        { value: rogue.id, label: 'Rogue' },
      ],
    })
  })

  it('shows unavailable stored classes on the org edit field until the author removes them', () => {
    const ctx = makeContentFormCtx({
      options: {
        classes: buildContentPurposeSelectors([
          fighter,
          {
            ...wizard,
            campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
          },
        ]),
      },
    })

    const options = buildMemberClassAffinityChipOptions(ctx, [wizard.id])
    expect(options).toEqual(
      expect.arrayContaining([
        { value: wizard.id, label: 'Wizard · Unavailable in this campaign' },
      ]),
    )
  })

  it('does not block org authoring when a stored affinity class is unavailable', () => {
    const [sync] = buildOrganizationFormValueSyncs(undefined, [fighter])

    expect(sync?.apply({ startingPointId: 'thieves_guild' }, ['startingPointId'])).toMatchObject({
      'members.classAffinityIds': [],
    })

    expect(collectPresetOptionValues()).toContain('thieves_guild')

    const saved = buildOrganizationCreateInput({
      name: 'Lantern Guild',
      organizationDomain: 'criminal',
      organizationForm: 'network',
      functions: [],
      practices: ['theft'],
      members: {
        classAffinityIds: [rogue.id],
        speciesAffinityIds: [],
      },
    })

    expect(saved.members.classAffinityIds).toEqual([rogue.id])
  })
})
