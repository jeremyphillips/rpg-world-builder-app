import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useSearchParams } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import {
  TICKET_DETAIL_DRAWER_SEARCH_PARAM,
  useTicketDetailDrawerSearchParams,
} from './use-ticket-detail-drawer-search-params'

function renderDrawerSearchParams(initialEntry = '/') {
  return renderHook(
    () => ({
      drawer: useTicketDetailDrawerSearchParams(),
      searchParams: useSearchParams()[0],
    }),
    {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
      ),
    },
  )
}

describe('useTicketDetailDrawerSearchParams', () => {
  it('reads ticketId from the URL', () => {
    const { result } = renderDrawerSearchParams('/?ticketId=ticket-1&type=bug')

    expect(result.current.drawer.ticketId).toBe('ticket-1')
    expect(result.current.drawer.drawerOpen).toBe(true)
  })

  it('sets ticketId while preserving other search params', () => {
    const { result } = renderDrawerSearchParams('/?type=bug')

    act(() => {
      result.current.drawer.selectTicket('ticket-2')
    })

    expect(result.current.searchParams.get(TICKET_DETAIL_DRAWER_SEARCH_PARAM)).toBe('ticket-2')
    expect(result.current.searchParams.get('type')).toBe('bug')
  })

  it('clears ticketId when the drawer closes', () => {
    const { result } = renderDrawerSearchParams('/?ticketId=ticket-1&type=bug')

    act(() => {
      result.current.drawer.onDrawerOpenChange(false)
    })

    expect(result.current.searchParams.get(TICKET_DETAIL_DRAWER_SEARCH_PARAM)).toBeNull()
    expect(result.current.searchParams.get('type')).toBe('bug')
    expect(result.current.drawer.drawerOpen).toBe(false)
  })

  it('ignores open=true changes', () => {
    const { result } = renderDrawerSearchParams('/?ticketId=ticket-1')

    act(() => {
      result.current.drawer.onDrawerOpenChange(true)
    })

    expect(result.current.searchParams.get(TICKET_DETAIL_DRAWER_SEARCH_PARAM)).toBe('ticket-1')
  })
})
