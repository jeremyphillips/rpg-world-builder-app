import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import type { CharacterBuilderDraft } from '../../draft/draft'
import {
  nonCasterClass,
  paladinClass,
  spellcastingTestContext,
  warlockClass,
  wizardClass,
  wizardLevelOneSpells,
} from '../../spellcasting-test-fixtures'
import { indexCharacterBuildCatalog } from '../../context'
import { resolveAvailableChoices } from '../registry/resolve-choices'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'
import { resolveSpellcastingChoices } from './resolve-spellcasting-choices'

function draftWith(overrides: Partial<CharacterBuilderDraft>): CharacterBuilderDraft {
  return { ...createEmptyCharacterBuilderDraft(), ...overrides }
}

describe('resolveSpellcastingChoices', () => {
  const catalogIndex = indexCharacterBuildCatalog(spellcastingTestContext.catalog)

  it('returns no ChoiceSets for non-casters', () => {
    const draft = draftWith({
      class: { classId: nonCasterClass.id, level: 1 },
    })

    expect(resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)).toEqual([])
  })

  it('emits cantrip, spellbook, and prepared ChoiceSets for wizard', () => {
    const draft = draftWith({
      class: { classId: wizardClass.id, level: 1 },
      choiceSelections: {
        [spellcastingChoiceSetId(wizardClass.id, 'spellbook-gain')]: wizardLevelOneSpells.map(
          (spell) => spell.id,
        ),
      },
    })

    const choiceSets = resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)

    expect(choiceSets).toHaveLength(3)
    expect(choiceSets[0]).toMatchObject({
      id: spellcastingChoiceSetId(wizardClass.id, 'cantrips'),
      sourceType: 'spellcasting',
      choiceType: 'cantrip',
      min: 3,
      max: 3,
      required: true,
    })
    expect(choiceSets[1]).toMatchObject({
      id: spellcastingChoiceSetId(wizardClass.id, 'spellbook-gain'),
      choiceType: 'spell',
      min: 6,
      max: 6,
      required: true,
    })
    expect(choiceSets[2]).toMatchObject({
      id: spellcastingChoiceSetId(wizardClass.id, 'prepared'),
      choiceType: 'spell',
      min: 4,
      max: 4,
      required: true,
    })
    expect(choiceSets[2]?.options).toHaveLength(6)
  })

  it('filters class-list options by class spell list and spell level', () => {
    const draft = draftWith({
      class: { classId: wizardClass.id, level: 1 },
    })

    const [cantrips, spellbook] = resolveSpellcastingChoices(
      draft,
      spellcastingTestContext,
      catalogIndex,
    )

    expect(cantrips?.options.every((option) => option.id.includes(':'))).toBe(true)
    expect(cantrips?.options).toHaveLength(5)
    expect(spellbook?.options).toHaveLength(6)
    expect(spellbook?.options.some((option) => option.label === 'Fireball')).toBe(false)
  })

  it('emits only prepared ChoiceSets for paladin', () => {
    const draft = draftWith({
      class: { classId: paladinClass.id, level: 1 },
    })

    const choiceSets = resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)

    expect(choiceSets).toHaveLength(1)
    expect(choiceSets[0]?.choiceType).toBe('spell')
    expect(choiceSets[0]?.min).toBe(2)
    expect(choiceSets[0]?.options).toHaveLength(4)
  })

  it('registers through resolveAvailableChoices', () => {
    const draft = draftWith({
      class: { classId: warlockClass.id, level: 1 },
    })

    const choiceSets = resolveAvailableChoices(draft, spellcastingTestContext)
    const spellChoiceSets = choiceSets.filter(
      (choiceSet) => choiceSet.choiceType === 'cantrip' || choiceSet.choiceType === 'spell',
    )

    expect(spellChoiceSets).toHaveLength(2)
    expect(spellChoiceSets.every((choiceSet) => choiceSet.options.length >= choiceSet.min)).toBe(
      true,
    )
  })

  it('emits satisfiable spell ChoiceSets for every seeded caster fixture', () => {
    for (const characterClass of [wizardClass, paladinClass, warlockClass]) {
      const draft = draftWith({
        class: { classId: characterClass.id, level: 1 },
        ...(characterClass.id === wizardClass.id
          ? {
              choiceSelections: {
                [spellcastingChoiceSetId(wizardClass.id, 'spellbook-gain')]:
                  wizardLevelOneSpells.map((spell) => spell.id),
              },
            }
          : {}),
      })

      const choiceSets = resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)

      for (const choiceSet of choiceSets) {
        expect(
          choiceSet.options.length,
          `${characterClass.slug}:${choiceSet.id}`,
        ).toBeGreaterThanOrEqual(choiceSet.min)
      }
    }
  })
})
