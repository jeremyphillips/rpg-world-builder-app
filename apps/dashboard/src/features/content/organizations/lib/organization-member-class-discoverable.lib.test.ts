import { describe, expect, it } from 'vitest'
import type { CharacterClass } from '@rpg/contracts'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { buildMemberClassAffinityChipOptions } from './organization-member-class-chip-options.lib'
import { resolveDiscoverableOrganizationMemberClasses } from './organization-member-class-discoverable.lib'

function makeClass(input: { slug: string; id?: string; name?: string }): CharacterClass {
  const id = input.id ?? `srd-cc-5.2.1:${input.slug}`
  return {
    id,
    slug: input.slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: input.name ?? input.slug.charAt(0).toUpperCase() + input.slug.slice(1),
    primaryAbilities: ['str'],
    hitDie: 10,
    proficiencies: {
      savingThrows: ['str', 'con'],
      armor: { categories: [], items: [] },
      weapons: { categories: [], items: [] },
      skills: { categories: [], items: [] },
    },
    features: [],
  }
}

describe('resolveDiscoverableOrganizationMemberClasses parity', () => {
  it('matches selectable chip option values excluding orphan rows', () => {
    const fighter = makeClass({ slug: 'fighter' })
    const rogue = makeClass({ slug: 'rogue' })
    const ctx = makeContentFormCtx({
      options: {
        classEntities: [fighter, rogue],
        campaignClassEntities: [fighter, rogue, makeClass({ slug: 'wizard', id: 'class-wizard' })],
      },
    })

    const discoverableIds = resolveDiscoverableOrganizationMemberClasses(ctx).map(
      (characterClass) => characterClass.id,
    )
    const chipValues = buildMemberClassAffinityChipOptions(ctx, ['class-wizard']).map(
      (option) => option.value,
    )

    expect(discoverableIds.sort()).toEqual(
      chipValues.filter((value) => value !== 'class-wizard').sort(),
    )
  })
})

describe('buildMemberClassAffinityChipOptions orphan labels', () => {
  it('labels campaign-catalog-only ids as unavailable and missing ids as unresolved', () => {
    const fighter = makeClass({ slug: 'fighter' })
    const wizard = makeClass({ slug: 'wizard', id: 'class-wizard', name: 'Wizard' })
    const ctx = makeContentFormCtx({
      options: {
        classEntities: [fighter],
        campaignClassEntities: [fighter, wizard],
      },
    })

    const options = buildMemberClassAffinityChipOptions(ctx, [wizard.id, 'deleted-class-id'])
    expect(options).toEqual(
      expect.arrayContaining([
        { value: fighter.id, label: 'Fighter' },
        { value: wizard.id, label: 'Wizard · Unavailable in this campaign' },
        { value: 'deleted-class-id', label: 'Deleted Class Id · Unresolved reference' },
      ]),
    )
  })
})
