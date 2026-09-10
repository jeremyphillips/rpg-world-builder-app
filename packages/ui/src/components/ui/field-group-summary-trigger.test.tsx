import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FieldGroupSummaryTrigger } from './field-group-summary-trigger.client'

describe('FieldGroupSummaryTrigger', () => {
  it('is a single button and keeps Change as a non-focusable affordance', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(
      <FieldGroupSummaryTrigger
        size="md"
        summary={{
          status: { label: 'Available', tone: 'success', indicator: 'dot' },
          detail: 'All players',
        }}
        openLabel="Change"
        unsavedSuffix=" · Unsaved"
        showDirtySuffix={false}
        disabled={false}
        onOpen={onOpen}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Available. All players' })
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()
    expect(screen.getByText('Change')).toHaveAttribute('aria-hidden', 'true')

    await user.tab()
    expect(trigger).toHaveFocus()
    await user.click(trigger)
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('keeps summary copy at 12px in comfortable forms', () => {
    render(
      <FieldGroupSummaryTrigger
        size="md"
        summary={{
          status: { label: 'Available', tone: 'success', indicator: 'dot' },
          detail: 'All players',
        }}
        openLabel="Change"
        unsavedSuffix=" · Unsaved"
        showDirtySuffix={false}
        disabled={false}
        onOpen={() => undefined}
      />,
    )

    expect(screen.getByText('Available')).toHaveClass('text-xs')
    expect(screen.getByText('All players')).toHaveClass('text-xs')
    expect(screen.getByText('Change')).toHaveClass('text-xs')
  })

  it('keeps the dirty suffix and Change on the status line', () => {
    render(
      <FieldGroupSummaryTrigger
        size="md"
        summary={{
          status: { label: 'Available', tone: 'success', indicator: 'dot' },
          detail: 'All players',
        }}
        openLabel="Change"
        unsavedSuffix=" · Unsaved"
        showDirtySuffix
        disabled={false}
        onOpen={() => undefined}
      />,
    )

    const statusLine = screen.getByText('Available').parentElement!
    const body = statusLine.parentElement!

    expect(body).toHaveClass('flex', 'flex-wrap', 'items-center')
    expect(body).toContainElement(screen.getByText(/Unsaved/))
    expect(body.nextElementSibling).toHaveTextContent('Change')
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(
      <FieldGroupSummaryTrigger
        size="md"
        summary={{
          status: { label: 'Available', tone: 'success', indicator: 'dot' },
          detail: 'All players',
        }}
        openLabel="Change"
        unsavedSuffix=" · Unsaved"
        showDirtySuffix={false}
        disabled={false}
        onOpen={() => undefined}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
