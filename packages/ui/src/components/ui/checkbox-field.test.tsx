import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { CheckboxField } from './checkbox-field'

describe('CheckboxField', () => {
  it('uses option typography on the label', () => {
    render(<CheckboxField id="homebrew" label="Allow homebrew" size="sm" />)
    const label = screen.getByText('Allow homebrew')
    expect(label).toHaveClass('text-style-option', 'text-style-option--sm')
  })

  it('toggles via its associated label', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<CheckboxField id="homebrew" label="Allow homebrew" onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByLabelText('Allow homebrew'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('renders the error and marks the checkbox invalid', () => {
    render(<CheckboxField id="homebrew" label="Allow homebrew" error="Required." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
    expect(screen.getByLabelText('Allow homebrew')).toHaveAttribute('aria-invalid', 'true')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<CheckboxField id="homebrew" label="Allow homebrew" />)
    await expectNoAxeViolations(container)
  })

  it('stacks below-label hint in the text column beside the control', () => {
    const { container } = render(
      <CheckboxField
        id="homebrew"
        label="Allow homebrew"
        hint="Includes third-party content in search results."
      />,
    )
    const label = screen.getByText('Allow homebrew').closest('label')
    const hint = screen.getByText('Includes third-party content in search results.')
    const textColumn = label?.parentElement?.parentElement

    expect(textColumn).not.toBeNull()
    expect(textColumn).toHaveClass('flex', 'flex-col', 'gap-0.5')
    expect(textColumn).toContainElement(hint)
    const row = textColumn?.parentElement
    expect(row).toHaveClass('flex', 'gap-2')
    expect(row?.firstElementChild).toHaveClass('flex', 'h-4', 'shrink-0', 'items-center')
    expect(hint.closest('[data-field-message-region]')).toBeNull()
    expect(container.querySelector('[data-field-control-region] .ui-checkbox-option')).toBeNull()
    expect(container.querySelector('button[role="checkbox"]')).toBeTruthy()
  })

  it('renders below-control hints in the message region', () => {
    render(
      <CheckboxField
        id="homebrew"
        label="Allow homebrew"
        hint="Includes third-party content in search results."
        hintPosition="below-control"
      />,
    )
    const hint = screen.getByText('Includes third-party content in search results.')
    expect(hint.closest('[data-field-message-region]')).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Allow homebrew' })).toHaveAttribute(
      'aria-describedby',
      'homebrew-hint',
    )
  })

  it('hides below-control hints when invalid and points describedby at the error only', () => {
    render(
      <CheckboxField
        id="homebrew"
        label="Allow homebrew"
        hint="Includes third-party content in search results."
        hintPosition="below-control"
        error="Required."
      />,
    )
    expect(
      screen.queryByText('Includes third-party content in search results.'),
    ).not.toBeInTheDocument()
    const control = screen.getByRole('checkbox', { name: 'Allow homebrew' })
    expect(control).toHaveAttribute('aria-describedby', 'homebrew-error')
    expect(control).toHaveAttribute('aria-invalid', 'true')
  })

  it('keeps below-label hints visible with errors and links both ids in describedby', () => {
    render(
      <CheckboxField
        id="homebrew"
        label="Allow homebrew"
        hint="Includes third-party content in search results."
        error="Required."
      />,
    )
    const control = screen.getByRole('checkbox', { name: 'Allow homebrew' })
    expect(control).toHaveAttribute('aria-describedby', 'homebrew-hint homebrew-error')
    expect(screen.getByText('Includes third-party content in search results.')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
  })

  it('uses a single-line control band with hints in the message region inside anatomy rows', () => {
    const { container } = render(
      <FieldRowAnatomyProvider>
        <CheckboxField
          id="prepared"
          label="Always prepared"
          hint="Prepared spells do not count against slots."
        />
      </FieldRowAnatomyProvider>,
    )

    const band = container.querySelector('[data-field-control-region] > div')
    expect(band).toHaveClass('min-h-9')
    expect(band).not.toHaveClass('items-start')
    expect(
      screen
        .getByText('Prepared spells do not count against slots.')
        .closest('[data-field-message-region]'),
    ).toBeTruthy()
  })

  it('uses a content-sized control band without single-line min-height', () => {
    const { container } = render(<CheckboxField id="plain" label="Plain option" />)
    const band = container.querySelector('[data-field-control-region] > div')
    expect(band).not.toBeNull()
    expect(band).toHaveClass('min-h-0', 'h-auto', 'items-start')
    expect(band).not.toHaveClass('min-h-9')
    expect(band).not.toHaveClass('items-center')
  })

  it('renders three-region field anatomy', () => {
    const { container } = render(
      <CheckboxField
        id="homebrew"
        label="Allow homebrew"
        hint="Includes third-party content in search results."
      />,
    )

    expect(container.querySelector('[data-field-control-region]')).not.toBeNull()
    expect(container.querySelector('[data-field-label-region]')).not.toBeNull()
    expect(container.querySelector('[data-field-message-region]')).not.toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Allow homebrew' })).toBeInTheDocument()
  })

  it('does not toggle when clicking a below-label hint', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const hint = 'Includes third-party content in search results.'
    render(
      <CheckboxField
        id="homebrew"
        label="Allow homebrew"
        hint={hint}
        onCheckedChange={onCheckedChange}
      />,
    )
    await user.click(screen.getByText(hint))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('exposes sr-only labels on plain checkboxes', () => {
    render(
      <CheckboxField id="hidden" label="Allow homebrew" labelVisibility="srOnly" hint="Helper." />,
    )
    const visibleLabels = screen
      .getAllByText('Allow homebrew')
      .filter((node) => node.classList.contains('sr-only'))
    expect(visibleLabels.length).toBeGreaterThan(0)
    expect(screen.getByRole('checkbox', { name: 'Allow homebrew' })).toBeInTheDocument()
  })

  it('keeps outlined shells and below-label hints on the unified contract', () => {
    const { container } = render(
      <CheckboxField
        id="filter"
        label="Equipped only"
        shell="outlined"
        hint="Limits the list to equipped gear."
      />,
    )
    expect(container.querySelector('[data-shell="outlined"]')).not.toBeNull()
    const hint = screen.getByText('Limits the list to equipped gear.')
    expect(hint.closest('[data-field-message-region]')).toBeNull()
    expect(
      hint.closest('[data-field-control-region]')?.querySelector('.flex.flex-col.gap-0\\.5'),
    ).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Equipped only' })).toHaveAttribute(
      'aria-describedby',
      'filter-hint',
    )
  })

  it('renders outlined below-control hints in the message region', () => {
    render(
      <CheckboxField
        id="filter"
        label="Equipped only"
        shell="outlined"
        hint="Limits the list to equipped gear."
        hintPosition="below-control"
      />,
    )
    expect(
      screen.getByText('Limits the list to equipped gear.').closest('[data-field-message-region]'),
    ).toBeTruthy()
  })
})
