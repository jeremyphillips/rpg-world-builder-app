import { describe, expect, it } from 'vitest'

import { isActiveTicketStatus } from './active-tickets'

describe('isActiveTicketStatus', () => {
  it('includes backlog and on-desk statuses', () => {
    expect(isActiveTicketStatus('backlog')).toBe(true)
    expect(isActiveTicketStatus('up_next')).toBe(true)
    expect(isActiveTicketStatus('in_progress')).toBe(true)
    expect(isActiveTicketStatus('blocked')).toBe(true)
  })

  it('excludes done and wont_do', () => {
    expect(isActiveTicketStatus('done')).toBe(false)
    expect(isActiveTicketStatus('wont_do')).toBe(false)
  })
})
