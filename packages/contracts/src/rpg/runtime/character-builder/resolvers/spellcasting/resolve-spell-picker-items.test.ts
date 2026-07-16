import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../../draft'
import {
  spellcastingCantripsChoiceSetId,
  spellcastingSpellsChoiceSetId,
} from './resolve-spellcasting-choice-sets'
import { PICKER_DISABLED_REASON_SELECTION_FULL } from '../picker/picker-item-state'
import {
  spellcastingTestContext,
  wizardCantrips,
  wizardClass,
  wizardLevelOneSpells,
} from '../../spellcasting-test-fixtures'
import { resolveSpellPickerItems } from './resolve-spell-picker-items'

describe('resolveSpellPickerItems', () => {
  const cantripChoiceSetId = spellcastingCantripsChoiceSetId(wizardClass.id)
  const spellChoiceSetId = spellcastingSpellsChoiceSetId(wizardClass.id)

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
    expect(items[0]?.compactSummary.classification.levelLabel).toBe('Cantrip')
    expect(items[0]?.compactSummary.castingSummary).toContain('Instantaneous')
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
    draft.choiceSelections[spellChoiceSetId] = wizardLevelOneSpells
      .slice(0, 4)
      .map((spell) => spell.id)

    const items = resolveSpellPickerItems({
      draft,
      context: spellcastingTestContext,
      choiceSetId: spellChoiceSetId,
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
})
