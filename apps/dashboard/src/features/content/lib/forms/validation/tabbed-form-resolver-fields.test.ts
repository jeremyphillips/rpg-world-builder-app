import { describe, expect, it } from 'vitest'

import {
  embeddedArrayResolverField,
  embeddedMasterDetailTabValidation,
  prefixFormItems,
} from './tabbed-form-resolver-fields'

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

describe('embeddedMasterDetailTabValidation', () => {
  const itemFields = [{ type: 'text' as const, name: 'name', label: 'Name', required: true }]

  it('returns paired errorPaths and resolverFields for a master-detail array', () => {
    expect(
      embeddedMasterDetailTabValidation({
        path: 'traits',
        legend: 'Traits',
        fields: itemFields,
      }),
    ).toEqual({
      errorPaths: ['traits'],
      resolverFields: [
        {
          kind: 'array',
          name: 'traits',
          legend: 'Traits',
          fields: itemFields,
        },
      ],
    })
  })

  it('defaults legend from itemLabel then path', () => {
    const wiring = embeddedMasterDetailTabValidation({
      path: 'traits',
      itemLabel: 'Trait',
      fields: itemFields,
    })
    expect(wiring.resolverFields[0]).toMatchObject({ legend: 'Trait' })
  })
})
