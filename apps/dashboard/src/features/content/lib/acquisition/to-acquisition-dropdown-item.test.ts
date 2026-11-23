import { describe, expect, it } from 'vitest'

import { toAcquisitionDropdownItem } from './to-acquisition-dropdown-item'

describe('toAcquisitionDropdownItem', () => {
  it('maps available ready options to metadata', () => {
    expect(
      toAcquisitionDropdownItem({
        id: 'template:magic-resistance',
        label: 'Magic Resistance',
        description: {
          status: 'ready',
          text: 'Advantage on saving throws against spells and other magical effects.',
        },
        availability: { status: 'available' },
      }),
    ).toEqual({
      id: 'template:magic-resistance',
      label: 'Magic Resistance',
      metadata: 'Advantage on saving throws against spells and other magical effects.',
    })
  })

  it('maps unavailable options to disabledReason and keeps searchable metadata', () => {
    expect(
      toAcquisitionDropdownItem({
        id: 'template:darkvision',
        label: 'Darkvision',
        description: { status: 'ready', text: 'See in dim light and darkness.' },
        availability: {
          status: 'unavailable',
          code: 'occurrence',
          message: 'This sense is already on the species trait list.',
        },
      }),
    ).toEqual({
      id: 'template:darkvision',
      label: 'Darkvision',
      metadata: 'See in dim light and darkness.',
      disabled: true,
      disabledReason: 'This sense is already on the species trait list.',
    })
  })

  it('maps unresolved available descriptions to supporting metadata', () => {
    expect(
      toAcquisitionDropdownItem({
        id: 'template:custom-sense',
        label: 'Custom Sense',
        description: {
          status: 'unresolved',
          message: 'This sense has no vocabulary description.',
        },
        availability: { status: 'available' },
      }),
    ).toMatchObject({
      metadata: 'This sense has no vocabulary description.',
    })
  })
})
