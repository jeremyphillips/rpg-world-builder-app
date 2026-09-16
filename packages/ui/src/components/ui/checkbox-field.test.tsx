import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { CheckboxField } from './checkbox-field'

describe('CheckboxField', () => {
  it('applies field size to the label', () => {
    render(<CheckboxField id="homebrew" label="Allow homebrew" size="sm" />)
    expect(screen.getByText('Allow homebrew').closest('label')).toHaveClass('text-xs')
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

  it('stacks inline label and hint in the same column beside the checkbox', () => {
    render(
      <CheckboxField
        id="homebrew"
        label="Allow homebrew"
        hint="Includes third-party content in search results."
      />,
    )
    const label = screen.getByText('Allow homebrew').closest('label')
    const hint = screen.getByText('Includes third-party content in search results.')
    const textColumn = label?.parentElement

    expect(textColumn).toHaveClass('flex', 'flex-col', 'gap-0.5')
    expect(textColumn).toContainElement(hint)
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

  it('keeps first-line checkbox column alignment inside the content-sized band', () => {
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
    const row = screen.getByText('Allow homebrew').closest('label')?.parentElement?.parentElement
    expect(row).toHaveClass('flex', 'gap-2')
    expect(row?.firstElementChild).toHaveClass('flex', 'h-4', 'shrink-0', 'items-center')
  })
})
