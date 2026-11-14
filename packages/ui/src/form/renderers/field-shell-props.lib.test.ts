import { describe, expect, it } from 'vitest'

import { buildFieldShellProps, type FieldShellSource } from './field-shell-props.lib'

const source: FieldShellSource = {
  config: {
    label: 'Name',
    info: 'Details',
    required: true,
    width: 'md',
    disabled: true,
    chrome: { variant: 'outline' },
  },
  id: 'form-name',
  hint: 'Required',
  hintPosition: 'below-label',
  presentationSize: 'md',
  controlSize: 'sm',
}

describe('buildFieldShellProps', () => {
  it('passes both sizes and the visible label', () => {
    expect(
      buildFieldShellProps(source, { error: 'Missing' }, { sizes: 'both', label: 'visible' }),
    ).toMatchObject({
      id: 'form-name',
      label: 'Name',
      labelVisibility: 'visible',
      hint: 'Required',
      size: 'md',
      controlSize: 'sm',
      error: 'Missing',
      disabled: true,
      chrome: { variant: 'outline' },
    })
  })

  it('omits sizes and exposes the accessible name when requested', () => {
    const shell = buildFieldShellProps(source, {}, { sizes: 'none', label: 'accessible-name' })

    expect(shell.size).toBeUndefined()
    expect(shell.controlSize).toBeUndefined()
    expect(shell.label).toBe('')
    expect(shell['aria-label']).toBe('Name')
    expect(shell.ariaLabel).toBe('Name')
  })
})
