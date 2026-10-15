import { weaponProficiencyGrantSetSchema, type WeaponProficiencyGrantSet } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { loadSeedClasses } from './index'

const RULESET = 'srd-cc-5.2.1' as const

function isMixedWeaponProficiencyGrantSet(grant: WeaponProficiencyGrantSet): boolean {
  return grant.categories.length > 0 && grant.items.length > 0
}

describe('catalog class weapon proficiency grants', () => {
  it('has no persisted mixed category+item weapon grants', () => {
    const mixed: { slug: string; grant: WeaponProficiencyGrantSet }[] = []

    for (const cls of loadSeedClasses(RULESET)) {
      const parsed = weaponProficiencyGrantSetSchema.safeParse(cls.proficiencies.weapons)
      if (!parsed.success) continue
      if (isMixedWeaponProficiencyGrantSet(parsed.data)) {
        mixed.push({ slug: cls.slug, grant: parsed.data })
      }
    }

    expect(mixed, mixed.map(({ slug }) => slug).join(', ')).toEqual([])
  })
})
