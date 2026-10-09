import { MasterDetailRowPrefixContext } from './use-master-detail-row-prefix'

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
