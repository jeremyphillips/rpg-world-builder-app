import { createContext, useContext } from 'react'

const MasterDetailRowPrefixContext = createContext<string | undefined>(undefined)

export function MasterDetailRowPrefixProvider({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return (
    <MasterDetailRowPrefixContext.Provider value={value}>
      {children}
    </MasterDetailRowPrefixContext.Provider>
  )
}

/** RHF prefix for the selected master-detail row, e.g. `features.2`. */
export function useMasterDetailRowPrefix(): string {
  const prefix = useContext(MasterDetailRowPrefixContext)
  if (!prefix) {
    throw new Error('useMasterDetailRowPrefix must be used within MasterDetailRowPrefixProvider')
  }
  return prefix
}
