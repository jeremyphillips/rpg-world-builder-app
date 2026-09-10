import { describe, expect, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import { disableFormItems } from './disable-form-items'

describe('disableFormItems', () => {
  it('disables nested dependent controllers and fields', () => {
    const items: FormItem[] = [
      {
        kind: 'dependent',
        controller: { type: 'switch', name: 'enabled', label: 'Enable' },
        dependents: {
          fields: [
            { type: 'text', name: 'formula', label: 'Formula' },
            {
              kind: 'group',
              legend: 'Nested',
              fields: [{ type: 'number', name: 'bonus', label: 'Bonus' }],
            },
          ],
        },
      },
    ]

    const [item] = disableFormItems(items, true)
    expect(item).toMatchObject({
      kind: 'dependent',
      controller: { type: 'switch', name: 'enabled', label: 'Enable', disabled: true },
      dependents: {
        fields: [
          { type: 'text', name: 'formula', label: 'Formula', disabled: true },
          {
            kind: 'group',
            legend: 'Nested',
            fields: [{ type: 'number', name: 'bonus', label: 'Bonus', disabled: true }],
          },
        ],
      },
    })
  })

  it('leaves items unchanged when disabled is false', () => {
    const items: FormItem[] = [{ type: 'text', name: 'name', label: 'Name' }]
    expect(disableFormItems(items, false)).toEqual(items)
  })
})
