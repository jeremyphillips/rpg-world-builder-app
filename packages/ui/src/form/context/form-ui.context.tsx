'use client'

import * as React from 'react'

export type FormValidationPresentation = 'progressive' | 'always'

export type ValidationSessionExpandKey = `${string}:${string}`

export interface FormUiContextValue {
  /** Scopes persisted form UI state (e.g. array collapse overrides) to a stable form instance. */
  uiStateKey?: string
  /** Controls when array row issue chrome appears. Defaults to `progressive`. */
  validationPresentation: FormValidationPresentation
  /** Set after the first failed submit for the form instance. */
  hasAttemptedSubmit: boolean
  markSubmitAttempted: () => void
  /** Ephemeral expand overrides keyed by `${fullName}:${collapseKey}`. */
  validationSessionExpandKeys: ReadonlySet<ValidationSessionExpandKey>
  addValidationSessionExpandKeys: (keys: readonly ValidationSessionExpandKey[]) => void
}

const defaultContext: FormUiContextValue = {
  validationPresentation: 'progressive',
  hasAttemptedSubmit: false,
  markSubmitAttempted: () => undefined,
  validationSessionExpandKeys: new Set(),
  addValidationSessionExpandKeys: () => undefined,
}

export const FormUiContext = React.createContext<FormUiContextValue>(defaultContext)

export function useFormUiContext(): FormUiContextValue {
  return React.useContext(FormUiContext)
}

export interface FormUiProviderProps {
  uiStateKey?: string
  validationPresentation?: FormValidationPresentation
  children: React.ReactNode
}

/** Supplies form UI state including progressive validation presentation. */
export function FormUiProvider({
  uiStateKey,
  validationPresentation = 'progressive',
  children,
}: FormUiProviderProps) {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false)
  const [validationSessionExpandKeys, setValidationSessionExpandKeys] = React.useState<
    ReadonlySet<ValidationSessionExpandKey>
  >(() => new Set())

  const markSubmitAttempted = React.useCallback(() => {
    setHasAttemptedSubmit(true)
  }, [])

  const addValidationSessionExpandKeys = React.useCallback(
    (keys: readonly ValidationSessionExpandKey[]) => {
      if (keys.length === 0) return
      setValidationSessionExpandKeys((previous) => {
        const next = new Set(previous)
        for (const key of keys) next.add(key)
        return next
      })
    },
    [],
  )

  const value = React.useMemo(
    () => ({
      uiStateKey,
      validationPresentation,
      hasAttemptedSubmit,
      markSubmitAttempted,
      validationSessionExpandKeys,
      addValidationSessionExpandKeys,
    }),
    [
      uiStateKey,
      validationPresentation,
      hasAttemptedSubmit,
      markSubmitAttempted,
      validationSessionExpandKeys,
      addValidationSessionExpandKeys,
    ],
  )

  return <FormUiContext.Provider value={value}>{children}</FormUiContext.Provider>
}
