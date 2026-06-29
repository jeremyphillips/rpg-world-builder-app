import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { sampleEpic, sampleEpicTickets } from '../test-fixtures'
import { RecommendNextButton } from './recommend-next-button'

describe('RecommendNextButton', () => {
  it('opens the recommended ticket when one is eligible', async () => {
    const user = userEvent.setup()
    const onSelectTicket = vi.fn()

    render(
      <RecommendNextButton
        tickets={sampleEpicTickets}
        epics={[sampleEpic]}
        epicId={sampleEpic.id}
        onSelectTicket={onSelectTicket}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Recommend next' }))

    expect(onSelectTicket).toHaveBeenCalledWith('507f1f77bcf86cd799439013')
  })

  it('shows an empty message when no ticket is eligible', async () => {
    const user = userEvent.setup()

    render(
      <RecommendNextButton
        tickets={sampleEpicTickets.map((ticket) => ({ ...ticket, status: 'done' as const }))}
        epics={[sampleEpic]}
        epicId={sampleEpic.id}
        onSelectTicket={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Recommend next' }))

    expect(
      screen.getByText(/No eligible tickets — add to backlog or move to Up Next/i),
    ).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <RecommendNextButton
        tickets={sampleEpicTickets}
        epics={[sampleEpic]}
        epicId={sampleEpic.id}
        onSelectTicket={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Recommend next' })).toBeInTheDocument()
    })

    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false }, 'landmark-unique': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
