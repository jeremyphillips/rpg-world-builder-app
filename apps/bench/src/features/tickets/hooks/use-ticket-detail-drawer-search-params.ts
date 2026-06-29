import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export const TICKET_DETAIL_DRAWER_SEARCH_PARAM = 'ticketId'

/** Syncs `TicketDetailDrawer` open state with the `?ticketId=` search param. */
export function useTicketDetailDrawerSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const ticketId = searchParams.get(TICKET_DETAIL_DRAWER_SEARCH_PARAM)

  const selectTicket = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(TICKET_DETAIL_DRAWER_SEARCH_PARAM, id)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const onDrawerOpenChange = useCallback(
    (open: boolean) => {
      if (open) return
      const params = new URLSearchParams(searchParams)
      params.delete(TICKET_DETAIL_DRAWER_SEARCH_PARAM)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return {
    ticketId,
    drawerOpen: ticketId != null,
    selectTicket,
    onDrawerOpenChange,
  }
}
