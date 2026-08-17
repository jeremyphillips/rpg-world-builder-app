import { describe, expect, it } from 'vitest'
import { buildContentPurposeSelectors, DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { makeSpecies } from '@/test/fixtures/factories/species'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { buildMemberSpeciesAffinityChipOptions } from './organization-member-species-chip-options.lib'
import { resolveDiscoverableOrganizationMemberSpecies } from './organization-member-species-discoverable.lib'

describe('resolveDiscoverableOrganizationMemberSpecies parity', () => {
  it('matches selectable chip option values excluding orphan rows', () => {
    const dwarf = makeSpecies({ slug: 'dwarf', name: 'Dwarf' })
    const elf = makeSpecies({ slug: 'elf', name: 'Elf' })
    const unavailable = {
      ...makeSpecies({ slug: 'wizard-species', name: 'Wizard Species' }),
      campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
    }
    const ctx = makeContentFormCtx({
      options: {
        species: buildContentPurposeSelectors([dwarf, elf, unavailable]),
      },
    })

    const discoverableIds = resolveDiscoverableOrganizationMemberSpecies(ctx).map(
      (species) => species.id,
    )
    const chipValues = buildMemberSpeciesAffinityChipOptions(ctx, [unavailable.id]).map(
      (option) => option.value,
    )

    expect(discoverableIds.sort()).toEqual(
      chipValues.filter((value) => value !== unavailable.id).sort(),
    )
  })

  it('includes dm_only species in forCampaignUse when campaign availability is on', () => {
    const dmOnly = {
      ...makeSpecies({ slug: 'deep-gnome', name: 'Deep Gnome' }),
      campaignAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        visibilityMode: 'dm_only' as const,
      },
    }
    const ctx = makeContentFormCtx({
      options: {
        species: buildContentPurposeSelectors([dmOnly]),
      },
    })

    expect(resolveDiscoverableOrganizationMemberSpecies(ctx)).toEqual([dmOnly])
  })
})

describe('buildMemberSpeciesAffinityChipOptions orphan labels', () => {
  it('labels campaign-catalog-only ids as unavailable and missing ids as unresolved', () => {
    const dwarf = makeSpecies({ slug: 'dwarf', name: 'Dwarf' })
    const unavailable = {
      ...makeSpecies({ slug: 'elf', name: 'Elf' }),
      campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
    }
    const ctx = makeContentFormCtx({
      options: {
        species: buildContentPurposeSelectors([dwarf, unavailable]),
      },
    })

    const options = buildMemberSpeciesAffinityChipOptions(ctx, [
      unavailable.id,
      'deleted-species-id',
    ])
    expect(options).toEqual(
      expect.arrayContaining([
        { value: dwarf.id, label: 'Dwarf' },
        { value: unavailable.id, label: 'Elf · Unavailable in this campaign' },
        { value: 'deleted-species-id', label: 'Deleted Species Id · Unresolved reference' },
      ]),
    )
  })
})
