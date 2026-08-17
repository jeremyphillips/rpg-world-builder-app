import { describe, expect, it } from 'vitest'

import { pickClass } from '@/test/fixtures/pick'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { buildMemberClassAffinityChipOptions } from './organization-member-class-chip-options.lib'
import { resolveDiscoverableOrganizationMemberClasses } from './organization-member-class-discoverable.lib'

describe('resolveDiscoverableOrganizationMemberClasses parity', () => {
  it('matches selectable chip option values excluding orphan rows', () => {
    const fighter = pickClass('fighter')
    const rogue = pickClass('rogue')
    const ctx = makeContentFormCtx({
      options: {
        classEntities: [fighter, rogue],
        campaignClassEntities: [fighter, rogue, pickClass('wizard')],
      },
    })

    const discoverableIds = resolveDiscoverableOrganizationMemberClasses(ctx).map(
      (characterClass) => characterClass.id,
    )
    const chipValues = buildMemberClassAffinityChipOptions(ctx, ['srd-cc-5.2.1:wizard']).map(
      (option) => option.value,
    )

    expect(discoverableIds.sort()).toEqual(
      chipValues.filter((value) => value !== 'srd-cc-5.2.1:wizard').sort(),
    )
  })
})

describe('buildMemberClassAffinityChipOptions orphan labels', () => {
  it('labels campaign-catalog-only ids as unavailable and missing ids as unresolved', () => {
    const fighter = pickClass('fighter')
    const wizard = pickClass('wizard')
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
