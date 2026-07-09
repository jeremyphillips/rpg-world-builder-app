import { describe, expect, it } from 'vitest'

import type { ChoiceSet } from '@rpg/contracts'

import {
  formatChoiceSetDrawerTriggerLabel,
  formatSelectionCounter,
  isChoiceSetFull,
  isChoiceSetOverSelected,
  shouldShowSelectionFullNotice,
} from './selection-counter.lib'

const cantripChoiceSet = {
  choiceType: 'cantrip',
  label: 'Cantrips',
  max: 3,
} as ChoiceSet

describe('selection-counter.lib', () => {
  it('formats selection counters and full/over-selected state', () => {
    expect(formatSelectionCounter(2, 3)).toBe('Selected: 2 / 3')
    expect(isChoiceSetFull(2, 3)).toBe(false)
    expect(isChoiceSetFull(3, 3)).toBe(true)
    expect(isChoiceSetOverSelected(4, 3)).toBe(true)
  })

  it('returns Add labels before the ChoiceSet is full', () => {
    expect(formatChoiceSetDrawerTriggerLabel(cantripChoiceSet, { selectedCount: 1, max: 3 })).toBe(
      'Add cantrip',
    )
    expect(
      formatChoiceSetDrawerTriggerLabel(
        { choiceType: 'skillProficiency', label: 'Rogue Skills', max: 4 } as ChoiceSet,
        { selectedCount: 2, max: 4 },
      ),
    ).toBe('Add skill proficiency')
  })

  it('returns Manage labels when the ChoiceSet is full', () => {
    expect(formatChoiceSetDrawerTriggerLabel(cantripChoiceSet, { selectedCount: 3, max: 3 })).toBe(
      'Manage cantrips',
    )
    expect(
      formatChoiceSetDrawerTriggerLabel(
        { choiceType: 'spell', label: 'Prepared Spells', max: 4 } as ChoiceSet,
        { selectedCount: 4, max: 4 },
      ),
    ).toBe('Manage spells')
  })

  it('shows selection full for proficiencies but not spells when Manage is active', () => {
    const skillChoiceSet = {
      choiceType: 'skillProficiency',
      label: 'Rogue Skills',
      max: 2,
    } as ChoiceSet

    expect(
      shouldShowSelectionFullNotice(
        skillChoiceSet,
        true,
        formatChoiceSetDrawerTriggerLabel(skillChoiceSet, { selectedCount: 2, max: 2 }),
      ),
    ).toBe(true)

    expect(
      shouldShowSelectionFullNotice(
        cantripChoiceSet,
        true,
        formatChoiceSetDrawerTriggerLabel(cantripChoiceSet, { selectedCount: 3, max: 3 }),
      ),
    ).toBe(false)
  })
})
