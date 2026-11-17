import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { CheckboxField } from './checkbox-field'

describe('CheckboxField', () => {
  it('uses option typography on the label', () => {
    render(<CheckboxField id="homebrew" label="Allow homebrew" size="sm" />)
    expect(screen.getByText('Allow homebrew').closest('.text-style-option')).toBeTruthy()
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

  it('stacks hint below the option row when not in an anatomy row', () => {
    render(
      <CheckboxField
        id="homebrew"
        label="Allow homebrew"
        hint="Includes third-party content in search results."
      />,
    )
    const hint = screen.getByText('Includes third-party content in search results.')
    const stack = hint.parentElement
    expect(stack).toHaveClass('flex', 'flex-col', 'gap-0.5')
    expect(stack?.querySelector('.ui-checkbox-option')).toBeTruthy()
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
    expect(container.querySelector('.ui-checkbox-option')).toBeTruthy()
  })
})
