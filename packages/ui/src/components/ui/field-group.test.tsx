import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { writeGroupCollapseOpen } from '../../form/config/group-collapse-storage.lib'

import { Badge } from './badge'

import { FieldGroup } from './field-group'
import { TextField } from './text-field'

function fieldStack(fieldset: HTMLElement): HTMLElement | null {
  return fieldset.querySelector('div.flex.flex-col.gap-6, div.flex.flex-col.gap-4')
}

function bodyRelationshipWrapper(fieldset: HTMLElement): HTMLElement | null {
  return fieldset.querySelector(
    [
      ':scope > .mt-5',
      ':scope > .mt-4',
      ':scope > .mt-3',
      ':scope > .mt-1\\.5',
      ':scope > .mt-1',
      ':scope [data-state] > .mt-5',
      ':scope [data-state] > .mt-4',
      ':scope [data-state] > .mt-3',
      ':scope [data-state] > .mt-1\\.5',
      ':scope [data-state] > .mt-1',
    ].join(', '),
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
    const fieldset = screen.getByRole('group', { name: /Character basics/ })
    const legend = screen.getByText('Character basics').closest('legend')
    expect(legend).toHaveClass('text-field-group-legend', 'w-full')
    expect(legend?.firstElementChild).toHaveClass('flex', 'flex-col', 'gap-2')
    expect(legend?.firstElementChild).not.toHaveClass('mb-5')
    expect(bodyRelationshipWrapper(fieldset)).toHaveClass('mt-5')
    expect(screen.getByText('Shown on your sheet.')).not.toHaveClass('mb-3')
  })

  it('applies section body gap outside the legend when there is no description', () => {
    render(
      <FieldGroup legend="Character basics">
        <TextField id="name" label="Name" />
      </FieldGroup>,
    )

    const fieldset = screen.getByRole('group', { name: /Character basics/ })
    expect(screen.getByText('Character basics').closest('legend')).not.toHaveClass('mb-5')
    expect(bodyRelationshipWrapper(fieldset)).toHaveClass('mt-5')
  })

  it('uses subgroup body gap for subsection legends with a description', () => {
    render(
      <FieldGroup legend="Damage" legendSize="subsection" description="Primary damage dice.">
        <TextField id="damage-dice" label="Dice" />
      </FieldGroup>,
    )

    const fieldset = screen.getByRole('group', { name: /Damage/ })
    expect(screen.getByText('Damage').closest('legend')?.firstElementChild).toHaveClass(
      'flex',
      'flex-col',
      'gap-2',
    )
    expect(bodyRelationshipWrapper(fieldset)).toHaveClass('mt-4')
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

  it('applies compact legend typography, body spacing, and stack rhythm', () => {
    render(
      <FieldGroup legend="Basics" rhythm="compact" description="Help copy.">
        <TextField id="name" label="Name" size="sm" />
      </FieldGroup>,
    )

    const fieldset = screen.getByRole('group', { name: /Basics/ })
    const legend = screen.getByText('Basics').closest('legend')
    expect(legend).toHaveClass('text-md', 'font-heading')
    expect(legend?.firstElementChild).toHaveClass('gap-1')
    expect(legend?.firstElementChild).not.toHaveClass('mb-3')
    expect(bodyRelationshipWrapper(fieldset)).toHaveClass('mt-3')
    expect(screen.getByText('Help copy.')).toHaveClass('text-xs')

    const stack = fieldStack(fieldset)
    expect(stack).toHaveClass('flex', 'flex-col', 'gap-4')
  })

  it('renders a subsection legend at the smaller type scale', () => {
    render(
      <FieldGroup legend="Damage" legendSize="subsection">
        <TextField id="damage-dice" label="Dice" />
      </FieldGroup>,
    )
    expect(screen.getByText('Damage').closest('legend')).toHaveClass('text-field-subgroup-legend')
  })

  it('applies array body gap outside array legend typography', () => {
    render(
      <FieldGroup legend="Grants" legendSize="array" size="md">
        <TextField id="grant-type" label="Grant type" />
      </FieldGroup>,
    )
    const fieldset = screen.getByRole('group', { name: /Grants/ })
    expect(screen.getByText('Grants').closest('legend')).toHaveClass('text-md', 'font-field-label')
    expect(screen.getByText('Grants').closest('legend')).not.toHaveClass('mb-1.5')
    expect(bodyRelationshipWrapper(fieldset)).toHaveClass('mt-1.5')
  })

  it('defaults array legend to sm field label typography when size is omitted', () => {
    render(
      <FieldGroup legend="Grants" legendSize="array">
        <TextField id="grant-type" label="Grant type" />
      </FieldGroup>,
    )
    expect(screen.getByText('Grants').closest('legend')).toHaveClass('text-xs', 'font-field-label')
  })

  it('does not apply body gap when the group has no legend', () => {
    render(
      <FieldGroup>
        <TextField id="name" label="Name" />
      </FieldGroup>,
    )
    const wrapper = screen.getByRole('textbox', { name: 'Name' }).closest('div')
    expect(wrapper?.parentElement).not.toHaveClass('mt-5', 'mt-4', 'mt-3')
  })

  it('does not render body spacing when the group has a legend but no body', () => {
    render(<FieldGroup legend="Empty">{null}</FieldGroup>)
    const fieldset = screen.getByRole('group', { name: /Empty/ })
    expect(bodyRelationshipWrapper(fieldset)).toBeNull()
    expect(fieldStack(fieldset)).toBeNull()
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

  it('renders a non-interactive legend accessory without changing the group name', () => {
    render(
      <FieldGroup
        legend="Starting point"
        legendAccessory={
          <Badge tone="neutral" size="sm" appearance="soft" aria-hidden>
            Customized
          </Badge>
        }
      >
        <TextField id="preset" label="Preset" labelVisibility="srOnly" />
      </FieldGroup>,
    )

    expect(screen.getByRole('group', { name: 'Starting point' })).toBeInTheDocument()
    expect(screen.getByText('Customized')).toBeInTheDocument()
    expect(screen.getByText('Customized').closest('legend')).toBeInTheDocument()
  })

  it('uses compact legend typography and trigger rhythm for legend disclosure groups', () => {
    render(
      <FieldGroup
        legend="Optional details"
        description="Member affinities and description"
        rhythm="compact"
        disclosure={{ variant: 'legend', defaultOpen: false }}
      >
        <TextField id="detail" label="Detail" size="sm" />
      </FieldGroup>,
    )

    const fieldset = screen.getByRole('group', { name: /Optional details/ })
    const legend = screen.getByText('Optional details').closest('legend')
    expect(legend).toHaveClass('text-md', 'font-heading')
    expect(legend?.firstElementChild?.querySelector('.flex.flex-col.gap-1')).toBeTruthy()
    const trigger = screen.getByRole('button', { name: /Optional details/i })
    expect(trigger).toHaveClass('py-0')
    expect(trigger).not.toHaveClass('text-field-group-legend')
    expect(bodyRelationshipWrapper(fieldset)).toBeNull()
    const content = fieldset.querySelector('[data-state]')
    expect(content?.className).not.toMatch(/\bpt-|\bpb-/)
    expect(content?.className).not.toContain('text-sm')
  })

  it('applies the same compact body gap for open disclosure as static groups', async () => {
    const user = userEvent.setup()
    render(
      <FieldGroup
        legend="Optional details"
        description="Support copy"
        rhythm="compact"
        disclosure={{ variant: 'legend', defaultOpen: false }}
      >
        <TextField id="detail" label="Detail" size="sm" />
      </FieldGroup>,
    )

    const fieldset = screen.getByRole('group', { name: /Optional details/ })
    await user.click(screen.getByRole('button', { name: /Optional details/i }))
    expect(bodyRelationshipWrapper(fieldset)).toHaveClass('mt-3')
  })

  it('aligns a trailing legend action in the header end slot without changing body gap', () => {
    render(
      <FieldGroup
        legend="Starting point"
        rhythm="compact"
        legendAction={
          <button type="button" className="test-legend-action">
            Set up manually
          </button>
        }
      >
        <TextField id="detail" label="Detail" size="sm" />
      </FieldGroup>,
    )

    const fieldset = screen.getByRole('group', { name: /Starting point/ })
    const action = screen.getByRole('button', { name: 'Set up manually' })
    expect(action).toHaveClass('test-legend-action')
    expect(action.parentElement).toHaveClass('shrink-0', 'justify-self-end')
    expect(bodyRelationshipWrapper(fieldset)).toHaveClass('mt-3')
  })

  it('keeps collapsible legend accessory outside the disclosure trigger', async () => {
    const user = userEvent.setup()
    render(
      <FieldGroup
        legend="Optional details"
        description="Member affinities and description"
        legendAccessory={
          <Badge tone="neutral" size="sm" appearance="soft" aria-hidden>
            Status
          </Badge>
        }
        disclosure={{ variant: 'legend', defaultOpen: false }}
      >
        <TextField id="detail" label="Detail" />
      </FieldGroup>,
    )

    const legend = screen.getByText('Optional details').closest('legend')
    const toggle = screen.getByRole('button', { name: /Optional details/i })
    expect(legend).toContainElement(toggle)
    expect(toggle).not.toContainElement(screen.getByText('Status'))
    expect(legend).toContainElement(screen.getByText('Status'))

    await user.click(toggle)
    expect(screen.getByRole('textbox', { name: 'Detail' })).toBeInTheDocument()
  })

  it('ignores stored collapse state when persistOpen is false', () => {
    writeGroupCollapseOpen('form-session', 'organization-quick-create-optional-details', true)

    render(
      <FieldGroup
        id="organization-quick-create-optional-details"
        uiStateKey="form-session"
        legend="Optional details"
        disclosure={{ variant: 'legend', defaultOpen: false, persistOpen: false }}
      >
        <TextField id="detail" label="Detail" />
      </FieldGroup>,
    )

    expect(screen.getByRole('button', { name: /Optional details/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('toggles collapsible groups and drops body gap when closed', async () => {
    const user = userEvent.setup()
    render(
      <FieldGroup
        legend="Advanced"
        rhythm="compact"
        disclosure={{ variant: 'legend', defaultOpen: true }}
      >
        <TextField id="advanced-field" label="Detail" size="sm" />
      </FieldGroup>,
    )

    const fieldset = screen.getByRole('group', { name: /Advanced/ })
    const content = fieldset.querySelector('[data-state]')
    expect(content).toHaveAttribute('data-state', 'open')
    expect(bodyRelationshipWrapper(fieldset)).toHaveClass('mt-3')
    await user.click(screen.getByRole('button', { name: /Advanced/ }))
    expect(content).toHaveAttribute('data-state', 'closed')
    expect(bodyRelationshipWrapper(fieldset)).toBeNull()
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
