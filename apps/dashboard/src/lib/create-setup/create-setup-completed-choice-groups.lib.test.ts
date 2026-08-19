import { describe, expect, it } from 'vitest'

import {
  resolveCreateSetupChoiceValueLabel,
  resolveCreateSetupPartialSummaryRows,
  resolveCreateSetupPartialSummarySegments,
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

  it('builds partial summary rows for completed non-active sets', () => {
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
    ])

    expect(
      resolveCreateSetupPartialSummaryRows({
        setIds: ['membershipTitle'],
        setById,
      }),
    ).toEqual([{ setId: 'membershipTitle', label: 'Title', valueLabel: 'Guildmaster' }])
  })

  it('resolves partial summary segments for grouped and standalone sets', () => {
    const sets = [
      buildChoiceSet({
        id: 'membershipTitle',
        fieldLabel: 'Title',
        summaryGroup: 'selections',
        options: [{ value: 'guildmaster', label: 'Guildmaster' }],
        value: 'guildmaster',
      }),
      buildChoiceSet({
        id: 'speciesId',
        fieldLabel: 'Species',
        summaryGroup: 'selections',
        options: [{ value: 'gnome', label: 'Gnome' }],
        value: '',
        isComplete: false,
      }),
      buildChoiceSet({
        id: 'siteType',
        fieldLabel: 'Site type',
        options: [{ value: 'landmark', label: 'Landmark' }],
        value: 'landmark',
      }),
    ]

    expect(
      resolveCreateSetupPartialSummarySegments({
        sets,
        visibleSetIds: ['membershipTitle', 'speciesId', 'siteType'],
        activeSetId: 'speciesId',
      }),
    ).toEqual([
      { kind: 'group', summaryGroup: 'selections', setIds: ['membershipTitle'] },
      { kind: 'standalone', setId: 'siteType' },
    ])
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
