import * as React from 'react'
import type { FormDensity } from '@rpg/ui/form'

/** Default form rhythm for create-modal and nested create-tab workflows. */
export const CREATE_FLOW_FORM_DENSITY: FormDensity = 'compact'

export const CreateFlowFormDensityContext = React.createContext<FormDensity | null>(null)

/** Undefined outside {@link CreateFlowFormDensityRoot}. */
export function useCreateFlowFormDensity(): FormDensity | undefined {
  return React.useContext(CreateFlowFormDensityContext) ?? undefined
}
