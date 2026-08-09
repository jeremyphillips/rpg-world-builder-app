import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Sheet } from './sheet.client'
import { Button } from './button.client'
import { ComboboxField } from './combobox-field.client'
import { dialogPanelActionRowClasses } from './dialog-panel.variants'

function renderSheet(contentProps: Record<string, unknown> = {}) {
  return render(
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button>Open sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content {...contentProps}>
        <Sheet.Header headline="Edit entry" description="Update vocabulary details." />
        <Sheet.Body>Body content</Sheet.Body>
        <Sheet.Footer>
          <div className={dialogPanelActionRowClasses}>
            <Sheet.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Sheet.Close>
          </div>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>,
  )
}

describe('Sheet', () => {
  it('opens from the trigger and renders headline + description', async () => {
    const user = userEvent.setup()
    renderSheet()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open sheet' }))

    const dialog = await screen.findByRole('dialog', { name: 'Edit entry' })
    expect(dialog).toHaveTextContent('Update vocabulary details.')
  })

  it('renders an optional kicker above the headline', async () => {
    const user = userEvent.setup()
    render(
      <Sheet.Root>
        <Sheet.Trigger asChild>
          <Button>Open sheet</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header kicker="BENCH-001" headline="Add ticket CRUD UI" />
          <Sheet.Body>Body content</Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Open sheet' }))
    const dialog = await screen.findByRole('dialog', { name: 'Add ticket CRUD UI' })
    expect(dialog).toHaveTextContent('BENCH-001')
  })

  it('defaults the headline to the sheet-title heading style', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Open sheet' }))

    const headline = await screen.findByText('Edit entry')
    expect(headline).toHaveClass('heading-style-sheet-title')
  })

  it('overrides the headline style via headlineClassName', async () => {
    const user = userEvent.setup()
    render(
      <Sheet.Root>
        <Sheet.Trigger asChild>
          <Button>Open sheet</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header headline="Edit entry" headlineClassName="heading-style-card" />
          <Sheet.Body>Body content</Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>,
    )
    await user.click(screen.getByRole('button', { name: 'Open sheet' }))

    const headline = await screen.findByText('Edit entry')
    expect(headline).toHaveClass('heading-style-card')
    expect(headline).not.toHaveClass('heading-style-sheet-title')
  })

  it('closes via a Sheet.Close footer button', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Open sheet' }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('focuses the dialog panel on open', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Open sheet' }))
    const dialog = await screen.findByRole('dialog')

    expect(dialog).toHaveFocus()
  })

  it('hosts combobox popovers inside the sheet content layer', async () => {
    const user = userEvent.setup()
    const options = Array.from({ length: 20 }, (_, index) => ({
      value: `option-${index}`,
      label: `Option ${index}`,
    }))

    render(
      <Sheet.Root defaultOpen>
        <Sheet.Content>
          <Sheet.Header headline="Create location" />
          <Sheet.Body>
            <ComboboxField
              id="archetype"
              label="Archetype"
              options={options}
              multiple={false}
              value=""
            />
          </Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>,
    )

    const dialog = screen.getByRole('dialog')
    await user.click(screen.getByRole('combobox', { name: 'Archetype' }))
    expect(dialog.querySelector('[role="listbox"]')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Open sheet' }))
    await screen.findByRole('dialog')

    await expectNoAxeViolations(document.body)
  })
})
