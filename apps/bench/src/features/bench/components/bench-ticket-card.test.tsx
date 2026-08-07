import type { ComponentProps } from 'react'
import { DndContext } from '@dnd-kit/core'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { upNextTicket } from '../test-fixtures'
import { BenchTicketCard } from './bench-ticket-card'

function renderCard(props: ComponentProps<typeof BenchTicketCard>) {
  return render(
    <DndContext>
      <ul>
        <BenchTicketCard {...props} />
      </ul>
    </DndContext>,
  )
}

describe('BenchTicketCard', () => {
  it('invokes move handler from overflow menu', async () => {
    const onMove = vi.fn()
    const user = userEvent.setup()
    renderCard({ ticket: upNextTicket, column: 'up_next', onMove })

    await user.click(screen.getByRole('button', { name: `Move ${upNextTicket.key}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Move to In Progress' }))

    expect(onMove).toHaveBeenCalledWith('in_progress')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderCard({
      ticket: upNextTicket,
      column: 'up_next',
      onMove: () => undefined,
    })

    await expectNoAxeViolations(container)
  })
})
