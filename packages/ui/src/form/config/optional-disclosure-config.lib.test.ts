import { afterEach, describe, expect, it, vi } from 'vitest'

import type { FieldConfig } from '../field-config'
import { assertOptionalDisclosureFieldConfig } from './optional-disclosure-config.lib'

function textareaField(
  overrides: Partial<Extract<FieldConfig, { type: 'textarea' }>> = {},
): Extract<FieldConfig, { type: 'textarea' }> {
  return {
    type: 'textarea',
    name: 'note',
    label: 'Additional behavior',
    ...overrides,
  }
}

describe('assertOptionalDisclosureFieldConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('allows a valid textarea optionalDisclosure config', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig(
      textareaField({
        optionalDisclosure: { addLabel: 'Add additional behavior' },
      }),
    )

    expect(error).not.toHaveBeenCalled()
  })

  it('errors when optionalDisclosure is used on an unsupported field kind', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig({
      type: 'select',
      name: 'mode',
      label: 'Mode',
      options: [],
      optionalDisclosure: { addLabel: 'Add mode note' },
    } as FieldConfig)

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('only allowed for text, textarea, richtext'),
    )
  })

  it('errors when optionalDisclosure is combined with required', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig(
      textareaField({
        required: true,
        optionalDisclosure: { addLabel: 'Add additional behavior' },
      }),
    )

    expect(error).toHaveBeenCalledWith(expect.stringContaining('incompatible with required: true'))
  })

  it('errors when optionalDisclosure is used on text before implementation', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig({
      type: 'text',
      name: 'note',
      label: 'Note',
      optionalDisclosure: { addLabel: 'Add note' },
    } as FieldConfig)

    expect(error).toHaveBeenCalledWith(expect.stringContaining('not implemented for "text"'))
    expect(error).toHaveBeenCalledWith(expect.stringContaining('TODO(richtext)'))
  })
})
