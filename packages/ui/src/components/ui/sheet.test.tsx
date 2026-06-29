import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { Sheet } from './sheet.client'
import { Button } from './button.client'

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
          <Sheet.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Sheet.Close>
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

  it('closes via a Sheet.Close footer button', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Open sheet' }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Open sheet' }))
    await screen.findByRole('dialog')

    const results = await axe.run(document.body, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
