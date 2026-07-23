'use client'

import * as React from 'react'

import type { TabbedFormTab } from './tabbed-form-panels.client'

export type TabbedFormChromeContextValue = {
  formId: string
  tabs: TabbedFormTab[]
  setActiveTabId: (tabId: string) => void
}

export const TabbedFormChromeContext = React.createContext<TabbedFormChromeContextValue | null>(
  null,
)

export function useTabbedFormChrome(): TabbedFormChromeContextValue | null {
  return React.useContext(TabbedFormChromeContext)
}
