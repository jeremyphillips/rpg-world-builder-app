import { describe, expect, it } from 'vitest'

import { abilitySaveDc } from './spell-dc'
import { formatSavingThrowClauses, resolveProseSavingThrowDc } from './format-saving-throw'

const MUCUS_FAILURE =
  "The target is cursed. Until the curse ends, the target's skin becomes slimy, the target can breathe air and water, and it can't regain Hit Points unless it is underwater."

describe('formatSavingThrowClauses', () => {
  it('keeps a multi-sentence failure as one clause and omits success', () => {
    expect(
      formatSavingThrowClauses({
        abilityLabel: 'Constitution',
        dc: 14,
        targets:
          'each creature in a 5-foot Emanation originating from the aboleth at the end of its turn',
        failure: MUCUS_FAILURE,
      }),
    ).toBe(
      `Constitution Saving Throw: DC 14, each creature in a 5-foot Emanation originating from the aboleth at the end of its turn. Failure: ${MUCUS_FAILURE}`,
    )
  })

  it('does not add a second period and includes success when present', () => {
    expect(
      formatSavingThrowClauses({
        abilityLabel: 'Constitution',
        dc: 20,
        targets:
          "each creature that isn't an Undead in a 20-foot Emanation originating from the lich.",
        failure: '31 (9d6) Necrotic damage.',
        success: 'Half damage.',
      }),
    ).toBe(
      "Constitution Saving Throw: DC 20, each creature that isn't an Undead in a 20-foot Emanation originating from the lich. Failure: 31 (9d6) Necrotic damage. Success: Half damage.",
    )
  })
})

describe('resolveProseSavingThrowDc', () => {
  it('returns a fixed DC and derives a spellcasting DC from abilitySaveDc', () => {
    expect(
      resolveProseSavingThrowDc({
        source: { kind: 'fixed', dc: 14 },
        spellcastingAbilityScore: 18,
        proficiencyBonus: 4,
      }),
    ).toBe(14)
    expect(
      resolveProseSavingThrowDc({
        source: { kind: 'spellcasting', castingAbility: { kind: 'ability', ability: 'int' } },
        spellcastingAbilityScore: 21,
        proficiencyBonus: 7,
      }),
    ).toBe(abilitySaveDc(21, 7))
    expect(
      resolveProseSavingThrowDc({
        source: { kind: 'spellcasting', castingAbility: { kind: 'shared', entryId: 'missing' } },
        proficiencyBonus: 7,
      }),
    ).toBeUndefined()
  })
})
