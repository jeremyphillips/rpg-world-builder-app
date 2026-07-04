import { describe, expect, it } from 'vitest'

import { embeddedArrayResolverField, prefixFormItems } from './tabbed-form-resolver-fields'

describe('prefixFormItems', () => {
  it('prefixes leaf fields and nested dotted names', () => {
    const items = prefixFormItems(
      [
        { type: 'text', name: 'name', label: 'Name', required: true },
        { type: 'text', name: 'classPolicy.mode', label: 'Mode', required: true },
      ],
      'heritage',
    )

    expect(items).toEqual([
      { type: 'text', name: 'heritage.name', label: 'Name', required: true },
      { type: 'text', name: 'heritage.classPolicy.mode', label: 'Mode', required: true },
    ])
  })

  it('prefixes array containers without double-prefixing item fields', () => {
    const items = prefixFormItems(
      [
        {
          kind: 'array',
          name: 'options',
          legend: 'Options',
          fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
        },
      ],
      'heritage',
    )

    expect(items[0]).toMatchObject({
      kind: 'array',
      name: 'heritage.options',
      legend: 'Options',
    })
    expect(items[0]).toMatchObject({
      fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
    })
  })
})

describe('embeddedArrayResolverField', () => {
  it('builds a resolver-only array field config', () => {
    const field = embeddedArrayResolverField('traits', 'Traits', [
      { type: 'text', name: 'name', label: 'Name', required: true },
    ])

    expect(field).toMatchObject({
      kind: 'array',
      name: 'traits',
      legend: 'Traits',
    })
  })
})
