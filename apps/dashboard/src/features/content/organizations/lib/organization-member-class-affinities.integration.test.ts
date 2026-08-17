import { describe, expect, it } from 'vitest'
import { flattenSelectFieldOptions } from '@rpg/ui/form'

import { buildQuickNpcClassRadioCardPresentation } from '@/features/character/npc/lib/quick-npc-class-option-groups.lib'
import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import type { OrganizationMemberPickerCandidate } from '../components/organization-member-picker-drawer.client'
import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationToFormValues,
} from '../../lib/forms/organization-form-projection'
import { buildMemberClassAffinityChipOptions } from './organization-member-class-chip-options.lib'
import { isOrganizationMemberPickerRecommended } from './organization-member-picker-drawer.lib'

function collectPresetOptionValues(ctx = makeContentFormCtx()): string[] {
  const presetField = buildOrganizationFields(ctx).find(
    (item) => 'name' in item && item.name === 'authoringPresetId',
  )
  if (!presetField || !('options' in presetField) || !Array.isArray(presetField.options)) {
    return []
  }
  return flattenSelectFieldOptions(presetField.options).map((option) => option.value)
}

describe('organization member class affinities integration', () => {
  const rogue = makeCharacterClass({ slug: 'rogue', id: 'class-rogue', name: 'Rogue' })
  const fighter = makeCharacterClass({ slug: 'fighter', id: 'class-fighter', name: 'Fighter' })
  const wizard = makeCharacterClass({ slug: 'wizard', id: 'class-wizard', name: 'Wizard' })

  it('persists familiar-seeded affinities without preset identity after save/reload', () => {
    const [sync] = buildOrganizationFormValueSyncs(undefined, [rogue])
    const applied = sync?.apply({ authoringPresetId: 'thieves_guild' }, ['authoringPresetId'])

    expect(applied).toMatchObject({
      authoringPresetId: undefined,
      practices: ['theft'],
      memberClassAffinityIds: ['class-rogue'],
    })

    const saved = buildOrganizationCreateInput({
      name: 'Dockside Exchange',
      organizationDomain: 'criminal',
      organizationForm: 'network',
      functions: [],
      practices: ['theft'],
      memberClassAffinityIds: ['class-rogue'],
    })

    expect(saved).not.toHaveProperty('authoringPresetId')
    expect(saved.memberClassAffinityIds).toEqual(['class-rogue'])

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
    })

    expect(reopened).toMatchObject({
      practices: ['theft'],
      memberClassAffinityIds: ['class-rogue'],
    })
    expect(reopened).not.toHaveProperty('authoringPresetId')
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
      memberClassAffinityIds: ['class-fighter', 'class-barbarian', 'class-wizard'],
      connections: { locations: [] },
    })

    expect(reopened.memberClassAffinityIds).toEqual([
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
        memberClassAffinityIds: [wizard.id],
        availableClasses: [fighter, rogue],
      }),
    ).toBe(false)

    expect(
      buildQuickNpcClassRadioCardPresentation({
        classOptions: [
          { value: fighter.id, label: fighter.name },
          { value: rogue.id, label: rogue.name },
        ],
        memberClassAffinityIds: [wizard.id],
        availableClasses: [fighter, rogue],
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
        classEntities: [fighter],
        campaignClassEntities: [fighter, wizard],
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
    const ctx = makeContentFormCtx({
      options: {
        classEntities: [fighter],
        campaignClassEntities: [fighter, rogue],
      },
    })
    const [sync] = buildOrganizationFormValueSyncs(undefined, [fighter])

    expect(
      sync?.apply({ authoringPresetId: 'thieves_guild' }, ['authoringPresetId']),
    ).toMatchObject({
      memberClassAffinityIds: [],
    })

    expect(collectPresetOptionValues(ctx)).toContain('thieves_guild')

    const saved = buildOrganizationCreateInput({
      name: 'Lantern Guild',
      organizationDomain: 'criminal',
      organizationForm: 'network',
      functions: [],
      practices: ['theft'],
      memberClassAffinityIds: [rogue.id],
    })

    expect(saved.memberClassAffinityIds).toEqual([rogue.id])
  })
})
