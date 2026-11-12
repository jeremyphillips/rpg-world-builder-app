import { ATTACK_RANGE_FEET } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { weaponAttackRangeGroup } from './weapon-attack-range-form-fields'
import { CHOOSE_NORMAL_RANGE_FIRST_LABEL } from './weapon-attack-range-form-fields.lib'

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

    const long = row.fields[1]
    if (!long || !('type' in long) || long.type !== 'joinedPair') {
      throw new Error('expected long joined pair')
    }
    if (long.start.kind !== 'select') throw new Error('expected long select start')
    expect(long.start.optionsResolve).toMatchObject({
      dependsOn: ['range.normal'],
    })
    const longOptions = long.start.optionsResolve!.optionsWhen({ 'range.normal': 60 })
    expect(longOptions.map((option) => option.value)).not.toContain(60)
    expect(longOptions.map((option) => option.value)).toContain(80)

    const disclosure = long.optionalDisclosure
    expect(disclosure?.addGate).toMatchObject({ dependsOn: ['range.normal'] })
    expect(disclosure?.addGate?.disabledWhen({ 'range.normal': undefined })).toBe(true)
    expect(disclosure?.addGate?.disabledReasonWhen?.({ 'range.normal': undefined })).toBe(
      CHOOSE_NORMAL_RANGE_FIRST_LABEL,
    )
    expect(disclosure?.addGate?.disabledWhen({ 'range.normal': ATTACK_RANGE_FEET.at(-1) })).toBe(
      true,
    )
    expect(disclosure?.addGate?.disabledWhen({ 'range.normal': 60 })).toBe(false)
  })
})
