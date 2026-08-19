import { describe, expect, it } from 'vitest'

import {
  isCreateSetupGroupedChoiceSummaryReady,
  resolveCreateSetupChoiceValueLabel,
  resolveCreateSetupCollapsedCompleteGroupedSetIds,
  resolveCreateSetupGroupedChoiceRows,
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
    onValueChange: () => {},
    onReset: () => {},
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

  it('requires every declared id to be collapsed-complete before grouping', () => {
    const isCollapsedComplete = (setId: string) => setId === 'membershipTitle'

    expect(
      isCreateSetupGroupedChoiceSummaryReady({
        groupedChoiceSetIds: ['membershipTitle', 'speciesId'],
        visibleSetIds: ['membershipTitle', 'speciesId'],
        isCollapsedComplete,
      }),
    ).toBe(false)
  })

  it('allows a partial grouped summary when opted in', () => {
    const isCollapsedComplete = (setId: string) => setId === 'membershipTitle'

    expect(
      isCreateSetupGroupedChoiceSummaryReady({
        groupedChoiceSetIds: ['membershipTitle', 'speciesId'],
        visibleSetIds: ['membershipTitle', 'speciesId'],
        isCollapsedComplete,
        allowPartial: true,
      }),
    ).toBe(true)

    expect(
      resolveCreateSetupCollapsedCompleteGroupedSetIds({
        groupedChoiceSetIds: ['membershipTitle', 'speciesId'],
        visibleSetIds: ['membershipTitle', 'speciesId'],
        isCollapsedComplete,
      }),
    ).toEqual(['membershipTitle'])
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
        groupedChoiceSetIds: ['membershipTitle', 'speciesId'],
        setById,
        collapsedCompleteSetIds: ['membershipTitle'],
      }),
    ).toEqual([{ setId: 'membershipTitle', label: 'Title', valueLabel: 'Guildmaster' }])
  })

  it('builds grouped rows in declared id order', () => {
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
        groupedChoiceSetIds: ['membershipTitle', 'speciesId'],
        setById,
      }),
    ).toEqual([
      { setId: 'membershipTitle', label: 'Title', valueLabel: 'Guildmaster' },
      { setId: 'speciesId', label: 'Species', valueLabel: 'Gnome' },
    ])
  })
})
