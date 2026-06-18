import { createContext } from 'react'

export interface BreadcrumbLabelContextValue {
  entityLabel: string | undefined
  setEntityLabel: (label: string | undefined) => void
}

export const BreadcrumbLabelContext = createContext<BreadcrumbLabelContextValue>({
  entityLabel: undefined,
  setEntityLabel: () => {},
})
