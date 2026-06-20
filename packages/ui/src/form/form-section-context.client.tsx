'use client'

import * as React from 'react'

export interface FormSectionContextValue {
  /** When false, sections render as plain fieldsets. Defaults to true on `<Form>`. */
  collapsibleSections: boolean
  /** Nesting depth; accordion sections only apply at depth 0. */
  depth: number
}

export const FormSectionContext = React.createContext<FormSectionContextValue>({
  collapsibleSections: true,
  depth: 0,
})

export function useFormSectionContext(): FormSectionContextValue {
  return React.useContext(FormSectionContext)
}
