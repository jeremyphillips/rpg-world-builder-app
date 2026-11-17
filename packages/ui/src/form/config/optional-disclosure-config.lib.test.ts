import { afterEach, describe, expect, it, vi } from 'vitest'

import type { FieldConfig } from '../field-config'
import {
  assertOptionalDisclosureFieldConfig,
  optionalDisclosureLeafFieldConfig,
} from './optional-disclosure-config.lib'

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

function selectField(
  overrides: Partial<Extract<FieldConfig, { type: 'select' }>> = {},
): Extract<FieldConfig, { type: 'select' }> {
  return {
    type: 'select',
    name: 'mode',
    label: 'Mode',
    options: [],
    ...overrides,
  }
}

describe('optionalDisclosureLeafFieldConfig', () => {
  it('hoists the label and fills the disclosure column', () => {
    expect(
      optionalDisclosureLeafFieldConfig({
        type: 'combobox',
        name: 'classIds',
        label: 'Classes',
        width: '1/2',
        options: [],
      }),
    ).toEqual(
      expect.objectContaining({
        labelVisibility: 'srOnly',
        width: 'full',
      }),
    )
  })
})

describe('assertOptionalDisclosureFieldConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('allows a valid textarea optionalDisclosure config', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig(
      textareaField({
        optionalDisclosure: { intent: 'add', addLabel: 'Add additional behavior' },
      }),
    )

    expect(error).not.toHaveBeenCalled()
  })

  it('allows a valid select optionalDisclosure config', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig(
      selectField({
        optionalDisclosure: { intent: 'add', addLabel: 'Add function override' },
      }),
    )

    expect(error).not.toHaveBeenCalled()
  })

  it('allows a valid textSuggestions optionalDisclosure config', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig({
      type: 'textSuggestions',
      name: 'classification.specialization',
      label: 'Specialization',
      suggestions: {
        dependsOn: ['classification.facilityType'],
        suggestionsWhen: () => [],
      },
      optionalDisclosure: { intent: 'add', addLabel: 'Add specialization' },
    })

    expect(error).not.toHaveBeenCalled()
  })

  it('errors when optionalDisclosure is used on an unsupported field kind', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig({
      type: 'number',
      name: 'count',
      label: 'Count',
      optionalDisclosure: { intent: 'add', addLabel: 'Add count note' },
    } as FieldConfig)

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(
        'only allowed for text, textSuggestions, textarea, richtext, select, combobox, rollValue, joinedPair',
      ),
    )
  })

  it('errors when optionalDisclosure is combined with required', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig(
      textareaField({
        required: true,
        optionalDisclosure: { intent: 'add', addLabel: 'Add additional behavior' },
      }),
    )

    expect(error).toHaveBeenCalledWith(expect.stringContaining('incompatible with required: true'))
  })

  it('allows a valid text optionalDisclosure config', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig({
      type: 'text',
      name: 'note',
      label: 'Note',
      optionalDisclosure: { intent: 'add', addLabel: 'Add note' },
    } as FieldConfig)

    expect(error).not.toHaveBeenCalled()
  })

  it('allows a valid richtext optionalDisclosure config', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    assertOptionalDisclosureFieldConfig({
      type: 'richtext',
      name: 'description',
      label: 'Custom description',
      optionalDisclosure: { intent: 'add', addLabel: 'Add custom description' },
    })

    expect(error).not.toHaveBeenCalled()
  })
})
