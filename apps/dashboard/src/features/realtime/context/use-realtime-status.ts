import * as React from 'react'

export type RealtimeContextValue = {
  isConnected: boolean
  setActiveConversationId: (conversationId: string | null) => void
}

export const RealtimeContext = React.createContext<RealtimeContextValue>({
  isConnected: false,
  setActiveConversationId: () => undefined,
})

export function useRealtimeStatus(): RealtimeContextValue {
  return React.useContext(RealtimeContext)
}
