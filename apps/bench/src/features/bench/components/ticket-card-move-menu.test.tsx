import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { upNextTicket } from '../test-fixtures'
import { TicketCardMoveMenu } from './ticket-card-move-menu'

describe('TicketCardMoveMenu', () => {
  it('lists move targets excluding current status', async () => {
    const onMove = vi.fn()
    const user = userEvent.setup()
    render(<TicketCardMoveMenu ticket={upNextTicket} onMove={onMove} />)

    await user.click(screen.getByRole('button', { name: `Move ${upNextTicket.key}` }))

    expect(screen.queryByRole('menuitem', { name: 'Move to Up Next' })).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Move to In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Move to Backlog' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: "Mark Won't Do" })).toBeInTheDocument()
  })

  it('calls onMove when an item is selected', async () => {
    const onMove = vi.fn()
    const user = userEvent.setup()
    render(<TicketCardMoveMenu ticket={upNextTicket} onMove={onMove} />)

    await user.click(screen.getByRole('button', { name: `Move ${upNextTicket.key}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Move to Blocked' }))

    expect(onMove).toHaveBeenCalledWith('blocked')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <TicketCardMoveMenu ticket={upNextTicket} onMove={() => undefined} />,
    )

    await expectNoAxeViolations(container)
  })
})
