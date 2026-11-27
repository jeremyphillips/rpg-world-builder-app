'use client'

import * as React from 'react'

import type { FormValidationProducerSession } from './form-validation-producer-session.lib'

export type FormValidationProducerContextValue = {
  session: FormValidationProducerSession
  stamp: number
}

const FormValidationProducerContext =
  React.createContext<FormValidationProducerContextValue | null>(null)

export function FormValidationProducerProvider({
  session,
  stamp,
  children,
}: FormValidationProducerContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ session, stamp }), [session, stamp])
  return (
    <FormValidationProducerContext.Provider value={value}>
      {children}
    </FormValidationProducerContext.Provider>
  )
}

export function useFormValidationProducerContext(): FormValidationProducerContextValue | null {
  return React.useContext(FormValidationProducerContext)
}
