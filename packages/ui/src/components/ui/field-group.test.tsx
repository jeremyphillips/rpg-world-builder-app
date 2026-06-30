import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { FieldGroup } from './field-group'
import { TextField } from './text-field'

describe('FieldGroup', () => {
  it('renders a group named by its legend', () => {
    render(
      <FieldGroup legend="Character basics">
        <TextField id="name" label="Name" />
      </FieldGroup>,
    )
    expect(screen.getByRole('group', { name: /Character basics/ })).toBeInTheDocument()
    expect(screen.getByText('Character basics')).toHaveClass('text-field-group-legend')
  })

  it('renders an optional description', () => {
    render(
      <FieldGroup legend="Character basics" description="Shown on your sheet.">
        <TextField id="name" label="Name" />
      </FieldGroup>,
    )
    expect(screen.getByText('Shown on your sheet.')).toBeInTheDocument()
  })

  it('stacks sibling fields with a gap-based column rhythm', () => {
    render(
      <FieldGroup legend="Character basics">
        <TextField id="name" label="Name" />
        <TextField id="bio" label="Bio" />
      </FieldGroup>,
    )
    const stack = screen
      .getByRole('group', { name: /Character basics/ })
      .querySelector(':scope > div')
    expect(stack).toHaveClass('flex', 'flex-col', 'gap-6')
  })

  it('renders a subsection legend at the smaller type scale', () => {
    render(
      <FieldGroup legend="Damage" legendSize="subsection">
        <TextField id="damage-dice" label="Dice" />
      </FieldGroup>,
    )
    expect(screen.getByText('Damage')).toHaveClass('text-field-subgroup-legend')
    expect(screen.getByText('Damage')).not.toHaveClass('text-field-group-legend')
  })

  it('renders an array legend at the repeatable-list type scale', () => {
    render(
      <FieldGroup legend="Grants" legendSize="array">
        <TextField id="grant-type" label="Grant type" />
      </FieldGroup>,
    )
    expect(screen.getByText('Grants')).toHaveClass('text-field-array-legend')
    expect(screen.getByText('Grants')).not.toHaveClass('text-field-group-legend')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <FieldGroup legend="Character basics">
        <TextField id="name" label="Name" />
      </FieldGroup>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
