import { createContext, useContext } from 'react'

export const MasterDetailRowPrefixContext = createContext<string | undefined>(undefined)

/** RHF prefix for the selected master-detail row, e.g. `features.2`. */
export function useMasterDetailRowPrefix(): string {
  const prefix = useContext(MasterDetailRowPrefixContext)
  if (!prefix) {
    throw new Error('useMasterDetailRowPrefix must be used within MasterDetailRowPrefixProvider')
  }
  return prefix
}
