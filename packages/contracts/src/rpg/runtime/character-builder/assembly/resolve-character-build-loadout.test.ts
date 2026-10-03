import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, type CharacterBuilderDraft } from '../draft/draft'
import { builderTestContext, storedFighter } from '../test-fixtures'
import { resolveCharacterBuildLoadout } from './resolve-character-build-loadout'

function draft(classPatch: CharacterBuilderDraft['class']): CharacterBuilderDraft {
  return { ...createEmptyCharacterBuilderDraft(), class: classPatch }
}

describe('resolveCharacterBuildLoadout', () => {
  it('assembles class proficiencies for a resolved class', () => {
    const result = resolveCharacterBuildLoadout(
      draft({ classId: storedFighter.id, level: 1 }),
      builderTestContext,
      [],
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.loadout.characterClass?.id).toBe(storedFighter.id)
    expect(result.loadout.proficiencies.weapons.length).toBeGreaterThan(0)
  })

  it('fails with class_required when no class is chosen', () => {
    expect(
      resolveCharacterBuildLoadout(draft({ classId: undefined, level: 1 }), builderTestContext, []),
    ).toEqual({ ok: false, reason: 'class_required' })
  })

  it('fails with class_not_in_catalog for an unknown class', () => {
    expect(
      resolveCharacterBuildLoadout(
        draft({ classId: 'srd-cc-5.2.1:missing', level: 1 }),
        builderTestContext,
        [],
      ),
    ).toEqual({ ok: false, reason: 'class_not_in_catalog' })
  })

  it('fails with class_not_permitted_at_level_zero for a classed level-zero draft', () => {
    expect(
      resolveCharacterBuildLoadout(
        draft({ classId: storedFighter.id, level: 0 }),
        builderTestContext,
        [],
      ),
    ).toEqual({ ok: false, reason: 'class_not_permitted_at_level_zero' })
  })

  it('succeeds for a level-zero classless draft', () => {
    const result = resolveCharacterBuildLoadout(
      draft({ classId: undefined, level: 0 }),
      { ...builderTestContext, characterKind: 'npc' },
      [],
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.loadout.characterClass).toBeUndefined()
    expect(result.loadout.isClasslessLevelZero).toBe(true)
  })
})
