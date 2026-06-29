import type { Over } from '@dnd-kit/core'
import { describe, expect, it } from 'vitest'

import { upNextTicket } from '../test-fixtures'
import { benchColumnDndId, benchTicketDndId } from './bench-dnd-ids'
import { resolveBenchDropColumn } from './resolve-bench-drop-column'

function over(id: string): Over {
  return { id } as Over
}

describe('resolveBenchDropColumn', () => {
  const ticketsById = new Map([[upNextTicket.id, upNextTicket]])

  it('resolves column droppable ids', () => {
    expect(resolveBenchDropColumn(over(benchColumnDndId('in_progress')), ticketsById)).toBe(
      'in_progress',
    )
  })

  it('resolves ticket droppable ids to their column', () => {
    expect(resolveBenchDropColumn(over(benchTicketDndId(upNextTicket.id)), ticketsById)).toBe(
      'up_next',
    )
  })

  it('returns null for unknown targets', () => {
    expect(resolveBenchDropColumn(over('unknown'), ticketsById)).toBeNull()
  })
})
