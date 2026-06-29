import { describe, expect, it } from 'vitest'

import { isOpenTicketStatus } from './open-tickets'

describe('isOpenTicketStatus', () => {
  it('includes backlog and on-desk statuses', () => {
    expect(isOpenTicketStatus('backlog')).toBe(true)
    expect(isOpenTicketStatus('up_next')).toBe(true)
    expect(isOpenTicketStatus('in_progress')).toBe(true)
    expect(isOpenTicketStatus('blocked')).toBe(true)
  })

  it('excludes done and wont_do', () => {
    expect(isOpenTicketStatus('done')).toBe(false)
    expect(isOpenTicketStatus('wont_do')).toBe(false)
  })
})
