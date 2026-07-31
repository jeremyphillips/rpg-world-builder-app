import * as React from 'react'

type RealtimeContextValue = {
  isConnected: boolean
  setActiveConversationId: (conversationId: string | null) => void
}

const RealtimeContext = React.createContext<RealtimeContextValue>({
  isConnected: false,
  setActiveConversationId: () => undefined,
})

export function RealtimeContextProvider({
  isConnected,
  setActiveConversationId,
  children,
}: {
  isConnected: boolean
  setActiveConversationId: (conversationId: string | null) => void
  children: React.ReactNode
}) {
  const value = React.useMemo(
    () => ({ isConnected, setActiveConversationId }),
    [isConnected, setActiveConversationId],
  )
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export function useRealtimeStatus(): RealtimeContextValue {
  return React.useContext(RealtimeContext)
}
