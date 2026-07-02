'use client'

import * as React from 'react'

export interface FormUiContextValue {
  /** Scopes persisted form UI state (e.g. array collapse overrides) to a stable form instance. */
  uiStateKey?: string
}

export const FormUiContext = React.createContext<FormUiContextValue>({})

export function useFormUiContext(): FormUiContextValue {
  return React.useContext(FormUiContext)
}
