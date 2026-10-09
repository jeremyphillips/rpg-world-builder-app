import { describe, expect, expectTypeOf, it } from 'vitest'

import { ABILITY_IDS, type Ability } from '../vocab/ability'
import { BUILD_ADVISORY_ABILITY_IDS, characterBuildAdvisorySchema } from './build-advisory'

describe('BUILD_ADVISORY_ABILITY_IDS', () => {
  it('mirrors the ability vocabulary', () => {
    expect(BUILD_ADVISORY_ABILITY_IDS).toEqual(ABILITY_IDS)
    expectTypeOf<(typeof BUILD_ADVISORY_ABILITY_IDS)[number]>().toEqualTypeOf<Ability>()
  })
})

describe('characterBuildAdvisorySchema', () => {
  const plateAdvisory = {
    code: 'equipment_ability_score_requirement_unmet',
    subject: {
      kind: 'equipment',
      equipmentId: 'srd-cc-5.2.1:plate-armor',
      label: 'Plate Armor',
      unmet: [{ ability: 'str', required: 15, actual: 12 }],
    },
  } as const

  it('parses an unmet ability-score requirement advisory', () => {
    expect(characterBuildAdvisorySchema.parse(plateAdvisory)).toEqual(plateAdvisory)
  })

  it('rejects an empty unmet list', () => {
    expect(
      characterBuildAdvisorySchema.safeParse({
        ...plateAdvisory,
        subject: { ...plateAdvisory.subject, unmet: [] },
      }).success,
    ).toBe(false)
  })
})
