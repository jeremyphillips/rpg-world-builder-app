import { classValidationMessages, formatFieldMessage } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  expectAcquisitionDropdownItemDisplayCopy,
  expectPlainDisplayCopy,
} from '@/test/expect-plain-display-copy'

import { toAcquisitionDropdownItem } from './to-acquisition-dropdown-item'

const MALFORMED_TRANSPORT = '\x00{"not-field-payload":true}'

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
    const item = toAcquisitionDropdownItem({
      id: 'template:darkvision',
      label: 'Darkvision',
      description: { status: 'ready', text: 'See in dim light and darkness.' },
      availability: {
        status: 'unavailable',
        code: 'occurrence',
        message: 'This sense is already on the species trait list.',
      },
    })
    expect(item).toEqual({
      id: 'template:darkvision',
      label: 'Darkvision',
      metadata: 'See in dim light and darkness.',
      disabled: true,
      disabledReason: 'This sense is already on the species trait list.',
    })
    expectAcquisitionDropdownItemDisplayCopy(item)
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

  it('decodes encoded unavailable messages for disabledReason', () => {
    const transport = classValidationMessages.subclassChoiceFeatureDuplicate()
    const item = toAcquisitionDropdownItem({
      id: 'subclass-choice',
      label: 'Subclass',
      description: {
        status: 'ready',
        text: 'A level where the character chooses a subclass for this class.',
      },
      availability: { status: 'unavailable', code: 'occurrence', message: transport },
    })

    expectAcquisitionDropdownItemDisplayCopy(item, { disabledReasonTransport: transport })
    expectPlainDisplayCopy(item.disabledReason, {
      transport,
      label: 'disabledReason',
    })
  })

  it('decodes parameterized catalog messages in disabledReason', () => {
    const transport = classValidationMessages.grantGroupUnlockAfterFeatureLevel({
      unlockLevel: 2,
      featureLevel: 5,
    })

    expect(
      toAcquisitionDropdownItem({
        id: 'custom',
        label: 'Custom',
        description: { status: 'ready', text: 'Description' },
        availability: { status: 'unavailable', code: 'prerequisite', message: transport },
      }).disabledReason,
    ).toBe(formatFieldMessage(transport))
  })

  it('keeps ready description text as metadata when unavailable', () => {
    expect(
      toAcquisitionDropdownItem({
        id: 'subclass-choice',
        label: 'Subclass',
        description: { status: 'ready', text: 'Searchable ready description.' },
        availability: {
          status: 'unavailable',
          code: 'occurrence',
          message: 'Plain unavailable reason.',
        },
      }),
    ).toMatchObject({
      metadata: 'Searchable ready description.',
      disabledReason: 'Plain unavailable reason.',
    })
  })

  it('decodes unresolved description messages for available rows', () => {
    const transport = classValidationMessages.subclassChoiceFeatureDuplicate()
    expect(
      toAcquisitionDropdownItem({
        id: 'template:trait',
        label: 'Trait',
        description: { status: 'unresolved', message: transport },
        availability: { status: 'available' },
      }).metadata,
    ).toBe(formatFieldMessage(transport))
  })

  it('passes malformed transport through formatFieldMessage failure policy', () => {
    expect(
      toAcquisitionDropdownItem({
        id: 'x',
        label: 'X',
        description: { status: 'unresolved', message: MALFORMED_TRANSPORT },
        availability: { status: 'available' },
      }).metadata,
    ).toBe(formatFieldMessage(MALFORMED_TRANSPORT))

    expect(
      toAcquisitionDropdownItem({
        id: 'x',
        label: 'X',
        description: { status: 'ready', text: 'Ready' },
        availability: {
          status: 'unavailable',
          code: 'readiness',
          message: MALFORMED_TRANSPORT,
        },
      }).disabledReason,
    ).toBe(formatFieldMessage(MALFORMED_TRANSPORT))
  })

  it('preserves non-display fields', () => {
    expect(
      toAcquisitionDropdownItem({
        id: 'kind:custom',
        label: 'Custom feature',
        groupId: 'features',
        classification: 'Feature kind',
        searchTerms: ['custom', 'feature'],
        search: { includeSupporting: true },
        description: { status: 'ready', text: 'Supporting' },
        availability: { status: 'available' },
      }),
    ).toMatchObject({
      id: 'kind:custom',
      label: 'Custom feature',
      groupId: 'features',
      classification: 'Feature kind',
      searchTerms: ['custom', 'feature'],
      search: { includeSupporting: true },
    })
  })
})
