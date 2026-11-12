import { ATTACK_RANGE_FEET } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import {
  attackRangeClusterRow,
  attackRangeJoinedPairFields,
  attackRangeRow,
  weaponAttackRangeGroup,
} from './weapon-attack-range-form-fields'

function assertAttackRangeRowFields(row: FormItem) {
  if (!('kind' in row) || row.kind !== 'row') {
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
  expect(disclosure?.addGate?.disabledWhen({ 'range.normal': ATTACK_RANGE_FEET.at(-1) })).toBe(true)
  expect(disclosure?.addGate?.disabledWhen({ 'range.normal': 60 })).toBe(false)
}

describe('attackRangeJoinedPairFields', () => {
  it('defaults Normal and Long labels', () => {
    const [normal, long] = attackRangeJoinedPairFields({
      normalName: 'range.normal',
      longName: 'range.long',
    })
    expect(normal).toMatchObject({ label: 'Normal' })
    expect(long).toMatchObject({ label: 'Long' })
    if (long.start.kind === 'select') {
      expect(long.start.ariaLabel).toBe('Long value')
    }
  })

  it('accepts custom range labels', () => {
    const [normal, long] = attackRangeJoinedPairFields({
      normalName: 'range.normal',
      longName: 'range.long',
      normalLabel: 'Normal range',
      longLabel: 'Long range',
    })
    expect(normal).toMatchObject({ label: 'Normal range' })
    expect(long).toMatchObject({ label: 'Long range' })
    if (long.start.kind === 'select') {
      expect(long.start.ariaLabel).toBe('Long range value')
    }
  })
})

describe('attackRangeRow', () => {
  it('builds the shared Normal and Long joined pairs without section chrome', () => {
    assertAttackRangeRowFields(
      attackRangeRow({
        normalName: 'range.normal',
        longName: 'range.long',
      }),
    )
  })
})

describe('attackRangeClusterRow', () => {
  it('splits Normal and Long at half width for a parent 2/3 column', () => {
    const row = attackRangeClusterRow({
      normalName: 'range.normal',
      longName: 'range.long',
    })
    expect(row).toMatchObject({ kind: 'row', spacing: 'compact' })
    expect(row.fields).toHaveLength(2)
    expect(row.fields[0]).toMatchObject({ width: '1/2', label: 'Normal' })
    expect(row.fields[1]).toMatchObject({ width: '1/2', label: 'Long' })
  })
})

describe('weaponAttackRangeGroup', () => {
  it('wraps the shared row in a Range legend', () => {
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
    assertAttackRangeRowFields(group.fields[0]!)
  })
})
