import { useState } from 'react'
import { BreadcrumbLabelContext } from './breadcrumb-label-context'

export function BreadcrumbLabelProvider({ children }: { children: React.ReactNode }) {
  const [entityLabel, setEntityLabel] = useState<string | undefined>()
  return (
    <BreadcrumbLabelContext.Provider value={{ entityLabel, setEntityLabel }}>
      {children}
    </BreadcrumbLabelContext.Provider>
  )
}
