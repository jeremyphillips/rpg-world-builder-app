import * as React from 'react'

type RealtimeContextValue = {
  isConnected: boolean
}

const RealtimeContext = React.createContext<RealtimeContextValue>({
  isConnected: false,
})

export function RealtimeContextProvider({
  isConnected,
  children,
}: {
  isConnected: boolean
  children: React.ReactNode
}) {
  const value = React.useMemo(() => ({ isConnected }), [isConnected])
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export function useRealtimeStatus(): RealtimeContextValue {
  return React.useContext(RealtimeContext)
}
