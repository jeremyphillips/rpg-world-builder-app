import { describe, expect, it } from 'vitest'

import { classSchema } from '../../../../content/classes/class'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { compareSpellPickerItemsByRecommendation } from '../picker/spell-picker-item'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'
import { PICKER_DISABLED_REASON_SELECTION_FULL } from '../picker/picker-item-state'
import {
  spellcastingTestContext,
  wizardCantrips,
  wizardClass,
  wizardLevelOneSpells,
} from '../../spellcasting-test-fixtures'
import { resolveSpellPickerItems } from './resolve-spell-picker-items'

describe('resolveSpellPickerItems', () => {
  const cantripChoiceSetId = spellcastingChoiceSetId(wizardClass.id, 'cantrips')
  const preparedChoiceSetId = spellcastingChoiceSetId(wizardClass.id, 'prepared')

  it('returns enriched rows for each ChoiceSet option', () => {
    const draft = createEmptyCharacterBuilderDraft()
    draft.class = { classId: wizardClass.id, level: 1 }

    const items = resolveSpellPickerItems({
      draft,
      context: spellcastingTestContext,
      choiceSetId: cantripChoiceSetId,
    })

    expect(items).toHaveLength(wizardCantrips.length)
    expect(items[0]?.spell.name).toBe('Arcane Bolt')
    expect(items[0]?.compactSummary.groups).toEqual([
      { kind: 'classification', levelLabel: 'Cantrip', schoolLabel: 'Evocation' },
      { kind: 'castingTime', label: 'Action' },
      { kind: 'range', label: 'Self' },
    ])
    expect(items[0]?.searchText).toContain('Arcane Bolt')
    expect(items[0]?.state.canSelect).toBe(true)
  })

  it('marks unselected rows disabled when the ChoiceSet is full', () => {
    const draft = createEmptyCharacterBuilderDraft()
    draft.class = { classId: wizardClass.id, level: 1 }
    draft.choiceSelections[cantripChoiceSetId] = wizardCantrips.slice(0, 3).map((spell) => spell.id)

    const items = resolveSpellPickerItems({
      draft,
      context: spellcastingTestContext,
      choiceSetId: cantripChoiceSetId,
    })

    const selected = items.filter((item) => item.state.isAlreadySelected)
    const unselected = items.filter((item) => !item.state.isAlreadySelected)

    expect(selected).toHaveLength(3)
    selected.forEach((item) => {
      expect(item.state.disabledReasons).toHaveLength(0)
    })

    expect(unselected.every((item) => !item.state.canSelect)).toBe(true)
    unselected.forEach((item) => {
      expect(item.state.disabledReasons).toContain(PICKER_DISABLED_REASON_SELECTION_FULL)
    })
  })

  it('never disables already-selected rows when the ChoiceSet is full', () => {
    const draft = createEmptyCharacterBuilderDraft()
    draft.class = { classId: wizardClass.id, level: 1 }
    draft.choiceSelections[spellcastingChoiceSetId(wizardClass.id, 'spellbook')] =
      wizardLevelOneSpells.map((spell) => spell.id)
    draft.choiceSelections[preparedChoiceSetId] = wizardLevelOneSpells
      .slice(0, 4)
      .map((spell) => spell.id)

    const items = resolveSpellPickerItems({
      draft,
      context: spellcastingTestContext,
      choiceSetId: preparedChoiceSetId,
    })

    const selected = items.filter((item) => item.state.isAlreadySelected)
    expect(selected).toHaveLength(4)
    selected.forEach((item) => {
      expect(item.state.disabledReasons).toHaveLength(0)
      expect(item.state.isSelectionFull).toBe(true)
    })
  })

  it('returns an empty list for unknown ChoiceSet ids', () => {
    const draft = createEmptyCharacterBuilderDraft()
    draft.class = { classId: wizardClass.id, level: 1 }

    expect(
      resolveSpellPickerItems({
        draft,
        context: spellcastingTestContext,
        choiceSetId: 'spellcasting:missing:spells',
      }),
    ).toEqual([])
  })

  it('keeps authored recommendations on the strong band and name-sorts the rest', () => {
    const recommendingWizard = classSchema.parse({
      ...wizardClass,
      spellcasting: {
        ...wizardClass.spellcasting!,
        recommendations: [{ target: 'cantrips', classLevel: 1, spellIds: ['mage-hand'] }],
      },
    })
    const context = {
      ...spellcastingTestContext,
      catalog: {
        ...spellcastingTestContext.catalog,
        classes: spellcastingTestContext.catalog.classes.map((entry) =>
          entry.id === wizardClass.id ? recommendingWizard : entry,
        ),
      },
    }
    const draft = createEmptyCharacterBuilderDraft()
    draft.class = { classId: wizardClass.id, level: 1 }

    const items = resolveSpellPickerItems({
      draft,
      context,
      choiceSetId: cantripChoiceSetId,
    })
    const byStrength = [...items]
      .sort(compareSpellPickerItemsByRecommendation)
      .map((item) => item.spell.name)
    const byBoolean = [...items]
      .sort((left, right) => {
        if (left.state.isRecommended !== right.state.isRecommended) {
          return left.state.isRecommended ? -1 : 1
        }
        return left.spell.name.localeCompare(right.spell.name, undefined, { sensitivity: 'base' })
      })
      .map((item) => item.spell.name)

    expect(
      items.find((item) => item.spell.slug === 'mage-hand')?.state.recommendation.strength,
    ).toBe('strong')
    expect(items.some((item) => item.state.recommendation.strength === 'compatible')).toBe(false)
    expect(byStrength).toEqual(byBoolean)
    expect(byStrength[0]).toBe('Mage Hand')
  })
})
