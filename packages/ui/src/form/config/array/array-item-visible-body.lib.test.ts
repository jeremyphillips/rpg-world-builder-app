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

describe('arrayItemHasVisibleBodyFields', () => {
  it('returns true when at least one item field is visible', () => {
    expect(arrayItemHasVisibleBodyFields(items, { kind: 'editable' })).toBe(true)
    expect(arrayItemHasVisibleBodyFields(items, {})).toBe(true)
  })

  it('returns false when every item field is hidden', () => {
    expect(arrayItemHasVisibleBodyFields([items[1]!], { kind: 'sight' })).toBe(false)
  })
})
