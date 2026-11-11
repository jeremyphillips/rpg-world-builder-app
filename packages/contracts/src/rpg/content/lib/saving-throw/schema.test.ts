import { describe, expect, it } from 'vitest'

import { createMonsterInputSchema, monsterBodySchema } from '../../monster'
import {
  monsterActionDraftSchema,
  monsterActionSchema,
  RULES_OR_SAVING_THROW_MESSAGE,
} from '../../monster/action'
import {
  MONSTER_FIXTURE_SPELLS,
  MONSTER_TEST_INPUT,
  issueMessages,
} from '../../monster/test-fixtures'
import { omitEmptySavingThrow, savingThrowEffectSchema } from './schema'

const save = {
  ability: 'con' as const,
  dcSource: { kind: 'fixed' as const, dc: 14 },
  targets: 'each creature in a 5-foot Emanation',
  failure: 'The target is cursed. Until the curse ends, it cannot heal.',
}

describe('savingThrowEffectSchema', () => {
  it('requires ability, DC, targets, and failure, and strips blank success', () => {
    expect(savingThrowEffectSchema.parse({ ...save, success: '   ' })).toEqual(save)
    expect(savingThrowEffectSchema.safeParse({ ...save, failure: '  ' }).success).toBe(false)
    expect(
      savingThrowEffectSchema.safeParse({ ...save, dcSource: { kind: 'fixed', dc: 1.5 } }).success,
    ).toBe(false)
    expect(
      savingThrowEffectSchema.safeParse({ ...save, dcSource: { kind: 'fixed', dc: 41 } }).success,
    ).toBe(false)
    expect(
      savingThrowEffectSchema.parse({ ...save, dcSource: { kind: 'fixed' } }).dcSource,
    ).toEqual({
      kind: 'fixed',
      dc: 15,
    })
  })

  it('accepts a spellcasting DC and rejects the action-kind discriminator', () => {
    expect(
      savingThrowEffectSchema.parse({
        ...save,
        dcSource: { kind: 'spellcasting', castingAbility: { kind: 'ability', ability: 'int' } },
      }).dcSource,
    ).toEqual({ kind: 'spellcasting', castingAbility: { kind: 'ability', ability: 'int' } })
    expect(
      savingThrowEffectSchema.safeParse({
        ...save,
        dcSource: { kind: 'spell', castingAbility: { kind: 'shared', entryId: 'cast' } },
      }).success,
    ).toBe(false)
  })
})

describe('omitEmptySavingThrow', () => {
  it('drops an empty object and keeps a partial draft', () => {
    expect(omitEmptySavingThrow({ targets: '  ', success: '' })).toBeUndefined()
    expect(omitEmptySavingThrow({ ability: 'wis', success: '  ' })).toEqual({ ability: 'wis' })
  })
})

describe('rules text or saving throw', () => {
  it('publishes rules text, a save, or both, and rejects empty rich text alone', () => {
    const textOnly = monsterActionSchema.safeParse({
      id: 'note',
      kind: 'special',
      name: 'Note',
      description: '<p>It watches.</p>',
    })
    const saveOnly = monsterActionSchema.safeParse({
      id: 'disrupt',
      kind: 'special',
      name: 'Disrupt Life',
      description: '<p></p>',
      savingThrow: { ...save, success: 'Half damage' },
    })
    expect(textOnly.success).toBe(true)
    expect(saveOnly.success).toBe(true)

    const empty = createMonsterInputSchema.safeParse({
      ...MONSTER_TEST_INPUT,
      actions: [{ id: 'blank', kind: 'special', name: 'Blank', description: '<p><br></p>' }],
    })
    expect(issueMessages(empty)).toContain(RULES_OR_SAVING_THROW_MESSAGE)

    const publishedSave = createMonsterInputSchema.safeParse({
      ...MONSTER_TEST_INPUT,
      actions: [
        {
          id: 'disrupt',
          kind: 'special',
          name: 'Disrupt Life',
          description: '<p></p>',
          savingThrow: save,
        },
      ],
    })
    expect(issueMessages(publishedSave)).not.toContain(RULES_OR_SAVING_THROW_MESSAGE)
    expect(
      issueMessages(
        monsterBodySchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [{ id: 'blank', kind: 'special', name: 'Blank' }],
        }),
      ),
    ).toContain(RULES_OR_SAVING_THROW_MESSAGE)
  })

  it('keeps a partial save on the draft and does not require rules text', () => {
    expect(
      monsterActionDraftSchema.safeParse({
        id: 'glare',
        kind: 'special',
        savingThrow: { ability: 'wis' },
      }).success,
    ).toBe(true)
  })

  it('reuses the shared spellcasting message for a dangling entry', () => {
    const result = createMonsterInputSchema.safeParse({
      ...MONSTER_TEST_INPUT,
      actions: [
        {
          id: 'cast',
          kind: 'spell',
          name: 'Spellcasting',
          castingAbility: { kind: 'ability', ability: 'int' },
          spells: [{ spellId: MONSTER_FIXTURE_SPELLS.fireball.id }],
        },
        {
          id: 'glare',
          kind: 'special',
          name: 'Fell Glare',
          savingThrow: {
            ...save,
            ability: 'wis',
            dcSource: {
              kind: 'spellcasting',
              castingAbility: { kind: 'shared', entryId: 'missing' },
            },
          },
        },
      ],
    })
    expect(issueMessages(result)).toContain(
      'Shared spellcasting must use another spell entry that has its own ability.',
    )
  })
})
