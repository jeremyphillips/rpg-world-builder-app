import { describe, expect, it } from 'vitest'

import type { FormItem } from '../field-config'
import { formItemKey } from './form-item-node.client'

describe('formItemKey', () => {
  it('includes control type when leaf fields share the same name', () => {
    const select: FormItem = { type: 'select', name: 'dex', label: 'Dexterity', options: [] }
    const number: FormItem = { type: 'number', name: 'dex', label: 'Dexterity' }

    expect(formItemKey(select, 0)).toBe('dex-select-0')
    expect(formItemKey(number, 1)).toBe('dex-number-1')
  })

  it('prefixes keys inside array item scopes', () => {
    const field: FormItem = { type: 'text', name: 'label', label: 'Label' }

    expect(formItemKey(field, 0, 'items.0')).toBe('items.0.label-text-0')
  })

  it('keys unnamed containers by kind and index', () => {
    expect(formItemKey({ kind: 'columns', columns: [{ fields: [] }, { fields: [] }] }, 0)).toBe(
      'columns-0',
    )
    expect(formItemKey({ kind: 'group', legend: 'Basics', fields: [] }, 2, 'panel')).toBe(
      'panel.group-2',
    )
  })
})
