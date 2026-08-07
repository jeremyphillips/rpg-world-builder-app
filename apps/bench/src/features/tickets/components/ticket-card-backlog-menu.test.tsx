import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { sampleTicket } from '../test-fixtures'
import { TicketCardBacklogMenu } from './ticket-card-backlog-menu'
import { ADD_TO_BENCH_MENU_LABEL } from '../lib/ticket-card-labels'

describe('TicketCardBacklogMenu', () => {
  it('offers add to bench', async () => {
    const onAddToBench = vi.fn()
    const user = userEvent.setup()
    render(<TicketCardBacklogMenu ticket={sampleTicket} onAddToBench={onAddToBench} />)

    await user.click(screen.getByRole('button', { name: `Actions for ${sampleTicket.key}` }))
    await user.click(screen.getByRole('menuitem', { name: ADD_TO_BENCH_MENU_LABEL }))

    expect(onAddToBench).toHaveBeenCalledTimes(1)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <TicketCardBacklogMenu ticket={sampleTicket} onAddToBench={() => undefined} />,
    )

    await expectNoAxeViolations(container)
  })
})
