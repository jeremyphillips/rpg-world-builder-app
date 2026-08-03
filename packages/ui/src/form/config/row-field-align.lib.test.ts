import { describe, expect, it } from 'vitest'

import type { RowConfig } from '../field-config'
import { resolveRowFieldAlign, rowFieldReservesDerivedMeta } from '../field-config'

describe('rowFieldReservesDerivedMeta', () => {
  it('returns true when a leaf field reserves derived metadata space', () => {
    expect(
      rowFieldReservesDerivedMeta({
        type: 'combobox',
        name: 'classification.archetype',
        label: 'Archetype',
        options: [],
        derivedMeta: { reserveSpace: true, dependsOn: [], metaWhen: () => undefined },
      }),
    ).toBe(true)
  })

  it('returns false for fields without reserveSpace', () => {
    expect(
      rowFieldReservesDerivedMeta({
        type: 'select',
        name: 'authoringType',
        label: 'Location type',
        options: [],
      }),
    ).toBe(false)
  })
})

describe('resolveRowFieldAlign', () => {
  it('defaults to control-edge when no field reserves derived metadata', () => {
    const row = {
      kind: 'row',
      fields: [
        { type: 'select', name: 'authoringType', label: 'Location type', options: [] },
        { type: 'select', name: 'siteType', label: 'Site type', options: [] },
      ],
    } satisfies RowConfig

    expect(resolveRowFieldAlign(row)).toBe('control-edge')
  })

  it('uses start alignment when a sibling reserves derived metadata', () => {
    const row = {
      kind: 'row',
      fields: [
        { type: 'select', name: 'authoringType', label: 'Location type', options: [] },
        {
          type: 'combobox',
          name: 'classification.archetype',
          label: 'Archetype',
          options: [],
          derivedMeta: { reserveSpace: true, dependsOn: [], metaWhen: () => undefined },
        },
      ],
    } satisfies RowConfig

    expect(resolveRowFieldAlign(row)).toBe('start')
  })

  it('honors an explicit row align override', () => {
    const row = {
      kind: 'row',
      align: 'control-edge',
      fields: [
        {
          type: 'combobox',
          name: 'classification.archetype',
          label: 'Archetype',
          options: [],
          derivedMeta: { reserveSpace: true, dependsOn: [], metaWhen: () => undefined },
        },
      ],
    } satisfies RowConfig

    expect(resolveRowFieldAlign(row)).toBe('control-edge')
  })
})
