import { describe, expect, it } from 'vitest'

import type { FormItem } from '../../field-config'
import { arrayItemHasVisibleBodyFields } from './array-item-visible-body.lib'

const items: FormItem[] = [
  {
    type: 'text',
    name: 'always',
    label: 'Always',
  },
  {
    type: 'text',
    name: 'conditional',
    label: 'Conditional',
    visibility: {
      dependsOn: ['kind'],
      visibleWhen: (values) => values.kind === 'editable',
    },
  },
]

const sizeRequirementRow: FormItem = {
  kind: 'row',
  heading: { label: 'Eligible sizes' },
  visibility: {
    dependsOn: ['kind'],
    visibleWhen: (values) => values.kind === 'size',
  },
  fields: [
    { type: 'select', name: 'bound', label: 'Size', options: [] },
    { type: 'select', name: 'comparison', label: 'Limit', options: [] },
  ],
}

describe('arrayItemHasVisibleBodyFields', () => {
  it('returns true when at least one item field is visible', () => {
    expect(arrayItemHasVisibleBodyFields(items, { kind: 'editable' })).toBe(true)
    expect(arrayItemHasVisibleBodyFields(items, {})).toBe(true)
  })

  it('returns false when every item field is hidden', () => {
    expect(arrayItemHasVisibleBodyFields([items[1]!], { kind: 'sight' })).toBe(false)
  })

  it('returns false when row-wrapped fields are hidden by container visibility', () => {
    expect(arrayItemHasVisibleBodyFields([sizeRequirementRow], { kind: 'willing' })).toBe(false)
    expect(arrayItemHasVisibleBodyFields([sizeRequirementRow], { kind: 'size' })).toBe(true)
  })
})
