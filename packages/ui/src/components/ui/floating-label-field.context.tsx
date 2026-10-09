'use client'

import * as React from 'react'

const FloatingLabelFieldContext = React.createContext(false)

/** Marks descendants as rendered inside {@link FloatingLabelField}. */
export function FloatingLabelFieldProvider({ children }: { children: React.ReactNode }) {
  return (
    <FloatingLabelFieldContext.Provider value={true}>{children}</FloatingLabelFieldContext.Provider>
  )
}

/** True when the caller is inside a floating-label composite. */
export function useFloatingLabelFieldState(): boolean {
  return React.useContext(FloatingLabelFieldContext)
}
