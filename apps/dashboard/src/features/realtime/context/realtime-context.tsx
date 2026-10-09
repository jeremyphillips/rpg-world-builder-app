import * as React from 'react'

import { RealtimeContext, type RealtimeContextValue } from './use-realtime-status'

export function RealtimeContextProvider({
  isConnected,
  setActiveConversationId,
  children,
}: {
  isConnected: boolean
  setActiveConversationId: RealtimeContextValue['setActiveConversationId']
  children: React.ReactNode
}) {
  const value = React.useMemo(
    () => ({ isConnected, setActiveConversationId }),
    [isConnected, setActiveConversationId],
  )
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}
