import { describe, expect, it } from 'vitest'

import {
  resolveCreateSetupChoiceValueLabel,
  resolveCreateSetupSummaryGroupMemberIds,
} from './create-setup-completed-choice-groups.lib'
import type { CreateSetupChoiceSet } from './create-setup.types'

function buildChoiceSet(
  overrides: Partial<CreateSetupChoiceSet> & Pick<CreateSetupChoiceSet, 'id'>,
): CreateSetupChoiceSet {
  return {
    kind: 'choice',
    fieldLabel: overrides.id,
    options: [{ value: 'a', label: 'Alpha' }],
    value: 'a',
    isComplete: true,
    ...overrides,
  }
}

describe('create-setup-completed-choice-groups', () => {
  it('resolves the selected option label for a choice set', () => {
    expect(
      resolveCreateSetupChoiceValueLabel(
        buildChoiceSet({
          id: 'title',
          fieldLabel: 'Title',
          options: [{ value: 'guildmaster', label: 'Guildmaster' }],
          value: 'guildmaster',
        }),
      ),
    ).toBe('Guildmaster')
  })

  it('uses the skipped label when a set is marked skipped', () => {
    expect(
      resolveCreateSetupChoiceValueLabel(
        buildChoiceSet({
          id: 'form',
          fieldLabel: 'Building form',
          value: '',
          skipped: true,
          skippedValueLabel: 'Not specified',
        }),
      ),
    ).toBe('Not specified')
  })

  it('preserves summary group membership by set declaration, not adjacency', () => {
    const sets = [
      buildChoiceSet({ id: 'a', summaryGroup: 'identity' }),
      buildChoiceSet({ id: 'inserted', fieldLabel: 'Inserted' }),
      buildChoiceSet({ id: 'b', summaryGroup: 'identity' }),
    ]

    expect(resolveCreateSetupSummaryGroupMemberIds(sets, 'identity')).toEqual(['a', 'b'])
  })
})
