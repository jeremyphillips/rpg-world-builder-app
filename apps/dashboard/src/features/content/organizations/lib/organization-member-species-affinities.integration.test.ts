import { describe, expect, it } from 'vitest'
import { buildContentPurposeSelectors, DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { flattenSelectFieldOptions } from '@rpg/ui/form'

import { buildQuickNpcSpeciesRadioCardPresentation } from '@/features/character'
import { makeSpecies } from '@/test/fixtures/factories/species'
import type { OrganizationMemberPickerCandidate } from '../components/organization-member-picker-drawer.client'
import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  organizationToFormValues,
} from '../../lib/forms/organization-form-projection'
import { buildMemberSpeciesAffinityChipOptions } from './organization-member-species-chip-options.lib'
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

describe('organization member species affinities integration', () => {
  const human = makeSpecies({ slug: 'human', id: 'species-human', name: 'Human' })
  const elf = makeSpecies({ slug: 'elf', id: 'species-elf', name: 'Elf' })
  const dwarf = makeSpecies({ slug: 'dwarf', id: 'species-dwarf', name: 'Dwarf' })
  const halfling = makeSpecies({ slug: 'halfling', id: 'species-halfling', name: 'Halfling' })

  it('persists authored species affinities through save/reload without preset identity', () => {
    const saved = buildOrganizationCreateInput({
      name: 'Silver Circle',
      organizationDomain: 'academic',
      organizationForm: 'order',
      functions: [],
      practices: [],
      memberClassAffinityIds: [],
      memberSpeciesAffinityIds: [elf.id, dwarf.id],
    })

    expect(saved).not.toHaveProperty('authoringPresetId')
    expect(saved.memberSpeciesAffinityIds).toEqual([elf.id, dwarf.id])

    const reopened = organizationToFormValues({
      ...saved,
      id: 'org-silver-circle',
      slug: 'silver-circle',
      rulesetId: 'srd-cc-5.2.1',
      source: 'homebrew',
      status: 'published',
      campaignId: 'camp_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      membershipTitles: saved.membershipTitles ?? [],
      connections: { locations: [] },
    })

    expect(reopened).toMatchObject({
      memberClassAffinityIds: [],
      memberSpeciesAffinityIds: [elf.id, dwarf.id],
    })
    expect(reopened).not.toHaveProperty('authoringPresetId')
  })

  it('round-trips custom species affinity ids through edit form values', () => {
    const reopened = organizationToFormValues({
      id: 'org-woodland-court',
      slug: 'woodland-court',
      rulesetId: 'srd-cc-5.2.1',
      source: 'homebrew',
      status: 'published',
      campaignId: 'camp_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Woodland Court',
      organizationDomain: 'community',
      functions: [],
      practices: [],
      memberClassAffinityIds: [],
      memberSpeciesAffinityIds: [elf.id, dwarf.id, halfling.id],
      membershipTitles: [],
      connections: { locations: [] },
    })

    expect(reopened.memberSpeciesAffinityIds).toEqual([elf.id, dwarf.id, halfling.id])
  })

  it('keeps unavailable stored species out of downstream recommendation UI', () => {
    const candidate: OrganizationMemberPickerCandidate = {
      id: 'npc-elf',
      name: 'Arcane Contact',
      summary: 'Elf · Level 5 Wizard',
      characterType: 'npc',
      classIds: [],
      speciesId: elf.id,
      isMember: false,
    }

    expect(
      isOrganizationMemberPickerRecommended(candidate, {
        memberClassAffinityIds: [],
        memberSpeciesAffinityIds: [elf.id],
        playableClasses: [],
        playableSpecies: [human, dwarf],
      }),
    ).toBe(false)

    expect(
      buildQuickNpcSpeciesRadioCardPresentation({
        speciesOptions: [
          { value: human.id, label: human.name },
          { value: dwarf.id, label: dwarf.name },
        ],
        memberSpeciesAffinityIds: [elf.id],
        playableSpecies: [human, dwarf],
      }),
    ).toEqual({
      options: [
        { value: human.id, label: 'Human' },
        { value: dwarf.id, label: 'Dwarf' },
      ],
    })
  })

  it('shows unavailable stored species on the org edit field until the author removes them', () => {
    const ctx = makeContentFormCtx({
      options: {
        species: buildContentPurposeSelectors([
          human,
          {
            ...elf,
            campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
          },
        ]),
      },
    })

    const options = buildMemberSpeciesAffinityChipOptions(ctx, [elf.id])
    expect(options).toEqual(
      expect.arrayContaining([{ value: elf.id, label: 'Elf · Unavailable in this campaign' }]),
    )
  })

  it('does not block org authoring when a stored affinity species is unavailable', () => {
    const ctx = makeContentFormCtx({
      options: {
        species: buildContentPurposeSelectors([
          human,
          {
            ...elf,
            campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
          },
        ]),
      },
    })

    expect(collectPresetOptionValues(ctx)).toContain('thieves_guild')

    const saved = buildOrganizationCreateInput({
      name: 'Lantern Guild',
      organizationDomain: 'criminal',
      organizationForm: 'network',
      functions: [],
      practices: ['theft'],
      memberClassAffinityIds: [],
      memberSpeciesAffinityIds: [elf.id],
    })

    expect(saved.memberSpeciesAffinityIds).toEqual([elf.id])
  })
})
