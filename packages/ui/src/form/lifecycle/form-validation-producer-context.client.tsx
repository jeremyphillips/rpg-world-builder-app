'use client'

import * as React from 'react'

import type { FormIssue } from '../errors/form-issue.types'
import type { FormValidationProducerSlot } from './form-evaluation.types'
import type { FormValidationProducerSession } from './form-validation-producer-session.lib'

export type FormValidationProducerContextValue = {
  session: FormValidationProducerSession
  stamp: number
  /** When set, producers must publish through slot replacement instead of parallel UI state. */
  replaceSlot?: (slot: FormValidationProducerSlot, issues: readonly FormIssue[]) => void
}

const FormValidationProducerContext =
  React.createContext<FormValidationProducerContextValue | null>(null)

export function FormValidationProducerProvider({
  session,
  stamp,
  replaceSlot,
  children,
}: FormValidationProducerContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ session, stamp, replaceSlot }),
    [replaceSlot, session, stamp],
  )
  return (
    <FormValidationProducerContext.Provider value={value}>
      {children}
    </FormValidationProducerContext.Provider>
  )
}

export function useFormValidationProducerContext(): FormValidationProducerContextValue | null {
  return React.useContext(FormValidationProducerContext)
}
