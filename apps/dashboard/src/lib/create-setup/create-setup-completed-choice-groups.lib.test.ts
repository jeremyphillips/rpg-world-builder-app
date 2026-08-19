import { describe, expect, it } from 'vitest'

import {
  isCreateSetupGroupedChoiceSummaryReady,
  resolveCreateSetupChoiceValueLabel,
  resolveCreateSetupCollapsedCompleteGroupedSetIds,
  resolveCreateSetupGroupedChoiceRows,
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

  it('requires every declared group member to be collapsed-complete before grouping', () => {
    const isCollapsedComplete = (setId: string) => setId === 'membershipTitle'

    expect(
      isCreateSetupGroupedChoiceSummaryReady({
        groupMemberSetIds: ['membershipTitle', 'speciesId'],
        visibleSetIds: ['membershipTitle', 'speciesId'],
        isCollapsedComplete,
      }),
    ).toBe(false)
  })

  it('builds grouped rows only for collapsed-complete ids when filtered', () => {
    const setById = new Map<string, CreateSetupChoiceSet>([
      [
        'membershipTitle',
        buildChoiceSet({
          id: 'membershipTitle',
          fieldLabel: 'Title',
          options: [{ value: 'guildmaster', label: 'Guildmaster' }],
          value: 'guildmaster',
        }),
      ],
      [
        'speciesId',
        buildChoiceSet({
          id: 'speciesId',
          fieldLabel: 'Species',
          options: [{ value: 'gnome', label: 'Gnome' }],
          value: '',
          isComplete: false,
        }),
      ],
    ])

    expect(
      resolveCreateSetupGroupedChoiceRows({
        groupMemberSetIds: ['membershipTitle', 'speciesId'],
        setById,
        collapsedCompleteSetIds: ['membershipTitle'],
      }),
    ).toEqual([{ setId: 'membershipTitle', label: 'Title', valueLabel: 'Guildmaster' }])
  })

  it('builds grouped rows in declared set order', () => {
    const setById = new Map<string, CreateSetupChoiceSet>([
      [
        'speciesId',
        buildChoiceSet({
          id: 'speciesId',
          fieldLabel: 'Species',
          options: [{ value: 'gnome', label: 'Gnome' }],
          value: 'gnome',
        }),
      ],
      [
        'membershipTitle',
        buildChoiceSet({
          id: 'membershipTitle',
          fieldLabel: 'Title',
          options: [{ value: 'guildmaster', label: 'Guildmaster' }],
          value: 'guildmaster',
        }),
      ],
    ])

    expect(
      resolveCreateSetupGroupedChoiceRows({
        groupMemberSetIds: ['membershipTitle', 'speciesId'],
        setById,
      }),
    ).toEqual([
      { setId: 'membershipTitle', label: 'Title', valueLabel: 'Guildmaster' },
      { setId: 'speciesId', label: 'Species', valueLabel: 'Gnome' },
    ])
  })

  it('preserves summary group membership by set declaration, not adjacency', () => {
    const sets = [
      buildChoiceSet({ id: 'a', summaryGroup: 'identity' }),
      buildChoiceSet({ id: 'inserted', fieldLabel: 'Inserted' }),
      buildChoiceSet({ id: 'b', summaryGroup: 'identity' }),
    ]

    expect(resolveCreateSetupSummaryGroupMemberIds(sets, 'identity')).toEqual(['a', 'b'])
    expect(
      resolveCreateSetupCollapsedCompleteGroupedSetIds({
        groupMemberSetIds: ['a', 'b'],
        visibleSetIds: ['a', 'inserted', 'b'],
        isCollapsedComplete: () => true,
      }),
    ).toEqual(['a', 'b'])
  })
})
