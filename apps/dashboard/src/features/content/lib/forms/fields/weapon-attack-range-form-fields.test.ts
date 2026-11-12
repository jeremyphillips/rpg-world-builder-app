import { ATTACK_RANGE_FEET } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { weaponAttackRangeGroup } from './weapon-attack-range-form-fields'

describe('weaponAttackRangeGroup', () => {
  it('builds the shared Normal and Long joined pairs', () => {
    const group = weaponAttackRangeGroup({
      normalName: 'range.normal',
      longName: 'range.long',
    })

    expect(group).toMatchObject({
      kind: 'group',
      legend: 'Range',
    })
    expect(group).not.toHaveProperty('description')
    if (!('kind' in group) || group.kind !== 'group') return
    const row = group.fields[0]
    if (!row || !('kind' in row) || row.kind !== 'row') {
      throw new Error('expected a range row')
    }
    expect(row.fields).toHaveLength(2)
    expect(row.fields[0]).toMatchObject({
      type: 'joinedPair',
      label: 'Normal',
      start: { kind: 'select', name: 'range.normal', allowCustom: true },
      end: { kind: 'label', text: 'ft.' },
    })
    expect(row.fields[1]).toMatchObject({
      type: 'joinedPair',
      label: 'Long',
      hint: { text: 'Disadvantage beyond normal range.', position: 'below-control' },
      optionalDisclosure: { addLabel: 'Add long range' },
      start: { kind: 'select', name: 'range.long', allowCustom: true, clearable: true },
    })
    const normal = row.fields[0]
    if (!normal || !('type' in normal) || normal.type !== 'joinedPair') return
    if (normal.start.kind !== 'select') return
    expect(normal.start.options.map((option) => option.value)).toEqual([...ATTACK_RANGE_FEET])
    expect(normal.start.options.map((option) => option.value)).toContain(240)
  })
})
