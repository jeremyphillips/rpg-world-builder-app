import { describe, expect, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import {
  buildContentIdentityFields,
  CONTENT_IDENTITY_AVAILABILITY_COLUMN_CLASS,
  nameField,
} from './content-identity-form-fields'

const availabilityItem: FormItem = {
  kind: 'slot',
  name: 'campaignAvailability',
  render: () => null,
}

describe('buildContentIdentityFields', () => {
  it('returns independent field containers in a primary-detail columns layout', () => {
    const [item] = buildContentIdentityFields({
      layout: 'inline',
      nameItem: nameField(),
      availabilityItem,
    })

    expect(item).toMatchObject({
      kind: 'columns',
      widths: 'primary-detail',
      className: CONTENT_IDENTITY_AVAILABILITY_COLUMN_CLASS,
      columns: [
        { fields: [{ ...nameField(), chrome: { variant: 'none' } }] },
        { fields: [availabilityItem] },
      ],
    })
  })

  it('returns stacked identity fields without a shared container', () => {
    expect(
      buildContentIdentityFields({
        layout: 'stacked',
        nameItem: nameField(),
        availabilityItem,
      }),
    ).toEqual([{ ...nameField(), chrome: { variant: 'none' } }, availabilityItem])
  })
})
