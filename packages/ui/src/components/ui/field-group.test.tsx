import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FieldGroup } from './field-group'
import { TextField } from './text-field'

function fieldStack(fieldset: HTMLElement): HTMLElement | null {
  return fieldset.querySelector(
    ':scope > div.flex.flex-col.gap-6, :scope > div > div.flex.flex-col.gap-6',
  )
}

describe('FieldGroup', () => {
  it('renders a group named by its legend', () => {
    render(
      <FieldGroup legend="Character basics">
        <TextField id="name" label="Name" />
      </FieldGroup>,
    )
    expect(screen.getByRole('group', { name: /Character basics/ })).toBeInTheDocument()
    expect(screen.getByText('Character basics').closest('legend')).toHaveClass(
      'text-field-group-legend',
    )
  })

  it('renders an optional description', () => {
    render(
      <FieldGroup legend="Character basics" description="Shown on your sheet.">
        <TextField id="name" label="Name" />
      </FieldGroup>,
    )
    expect(screen.getByText('Shown on your sheet.')).toBeInTheDocument()
    const legend = screen.getByText('Character basics').closest('legend')
    expect(legend).toHaveClass('text-field-group-legend', 'w-full')
    expect(legend?.firstElementChild).toHaveClass('flex', 'flex-col', 'gap-2', 'mb-5')
    expect(screen.getByText('Shown on your sheet.')).not.toHaveClass('mb-3')
  })

  it('applies section header margin to a legend without a description', () => {
    render(
      <FieldGroup legend="Character basics">
        <TextField id="name" label="Name" />
      </FieldGroup>,
    )

    expect(screen.getByText('Character basics').closest('legend')).toHaveClass('mb-5')
  })

  it('uses subgroup header margin for subsection legends with a description', () => {
    render(
      <FieldGroup legend="Damage" legendSize="subsection" description="Primary damage dice.">
        <TextField id="damage-dice" label="Dice" />
      </FieldGroup>,
    )

    expect(screen.getByText('Damage').closest('legend')?.firstElementChild).toHaveClass('mb-4')
  })

  it('stacks sibling fields with a gap-based column rhythm', () => {
    render(
      <FieldGroup legend="Character basics">
        <TextField id="name" label="Name" />
        <TextField id="bio" label="Bio" />
      </FieldGroup>,
    )
    const stack = fieldStack(screen.getByRole('group', { name: /Character basics/ }))
    expect(stack).toHaveClass('flex', 'flex-col', 'gap-6')
  })

  it('renders a subsection legend at the smaller type scale', () => {
    render(
      <FieldGroup legend="Damage" legendSize="subsection">
        <TextField id="damage-dice" label="Dice" />
      </FieldGroup>,
    )
    expect(screen.getByText('Damage').closest('legend')).toHaveClass('text-field-subgroup-legend')
  })

  it('renders an array legend at the repeatable-list type scale when size is md', () => {
    render(
      <FieldGroup legend="Grants" legendSize="array" size="md">
        <TextField id="grant-type" label="Grant type" />
      </FieldGroup>,
    )
    expect(screen.getByText('Grants').closest('legend')).toHaveClass('text-field-array-legend')
  })

  it('defaults array legend to sm scale when size is omitted', () => {
    render(
      <FieldGroup legend="Grants" legendSize="array">
        <TextField id="grant-type" label="Grant type" />
      </FieldGroup>,
    )
    expect(screen.getByText('Grants').closest('legend')).toHaveClass('text-sm')
  })

  it('applies panel chrome on the field body', () => {
    render(
      <FieldGroup legend="Target" chrome={{ variant: 'panel' }}>
        <TextField id="target-kind" label="Kind" />
      </FieldGroup>,
    )
    const fieldset = screen.getByRole('group', { name: /Target/ })
    expect(fieldset).not.toHaveClass('rounded-md')
    const stack = fieldStack(fieldset)
    expect(stack).toHaveClass('rounded-md', 'border', 'p-4', 'bg-surface-subtle')
  })

  it('applies rail chrome on the field stack', () => {
    render(
      <FieldGroup legend="Effects" chrome={{ variant: 'rail' }}>
        <TextField id="effect-name" label="Effect" />
      </FieldGroup>,
    )
    const stack = fieldStack(screen.getByRole('group', { name: /Effects/ }))
    expect(stack).toHaveClass('before:left-2', 'pl-9')
    expect(stack).not.toHaveClass('border-l-2')
  })

  it('applies divider top chrome on the fieldset', () => {
    render(
      <FieldGroup legend="Weapons" chrome={{ variant: 'divider', edge: 'top' }}>
        <TextField id="weapon-mode" label="Mode" />
      </FieldGroup>,
    )
    expect(screen.getByRole('group', { name: /Weapons/ })).toHaveClass('border-t', 'pt-7')
  })

  it('toggles collapsible groups', async () => {
    const user = userEvent.setup()
    render(
      <FieldGroup legend="Advanced" disclosure={{ variant: 'legend', defaultOpen: true }}>
        <TextField id="advanced-field" label="Detail" />
      </FieldGroup>,
    )

    const content = screen.getByRole('group', { name: /Advanced/ }).querySelector('[data-state]')
    expect(content).toHaveAttribute('data-state', 'open')
    await user.click(screen.getByRole('button', { name: /Advanced/ }))
    expect(content).toHaveAttribute('data-state', 'closed')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <FieldGroup legend="Character basics">
        <TextField id="name" label="Name" />
      </FieldGroup>,
    )
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations for panel chrome', async () => {
    const { container } = render(
      <FieldGroup legend="Target" chrome={{ variant: 'panel' }}>
        <TextField id="target-field" label="Kind" />
      </FieldGroup>,
    )
    await expectNoAxeViolations(container)
  })
})
