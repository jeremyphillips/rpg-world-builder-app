import { describe, expect, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import {
  buildContentIdentityFields,
  CONTENT_IDENTITY_AVAILABILITY_ROW_WIDTH,
  CONTENT_IDENTITY_NAME_ROW_WIDTH,
  nameField,
} from './content-identity-form-fields'

const availabilityItem: FormItem = {
  kind: 'slot',
  name: 'campaignAvailability',
  render: () => null,
}

describe('buildContentIdentityFields', () => {
  it('returns a shared field-container row for inline layout', () => {
    const [item] = buildContentIdentityFields({
      layout: 'inline',
      nameItem: nameField(),
      availabilityItem,
    })

    expect(item).toMatchObject({
      kind: 'row',
      align: 'start',
    })
    if (item && 'kind' in item && item.kind === 'row') {
      expect(item.fields).toEqual([
        { ...nameField(), width: CONTENT_IDENTITY_NAME_ROW_WIDTH },
        { ...availabilityItem, width: CONTENT_IDENTITY_AVAILABILITY_ROW_WIDTH },
      ])
    }
  })

  it('returns a flat stack for stacked layout', () => {
    expect(
      buildContentIdentityFields({
        layout: 'stacked',
        nameItem: nameField(),
        availabilityItem,
      }),
    ).toEqual([nameField(), availabilityItem])
  })

  it('rejects non-leaf identity items for inline layout', () => {
    expect(() =>
      buildContentIdentityFields({
        layout: 'inline',
        nameItem: { kind: 'group', legend: 'Name', fields: [] },
        availabilityItem,
      }),
    ).toThrow('Identity row fields must be a leaf field or slot.')
  })
})
