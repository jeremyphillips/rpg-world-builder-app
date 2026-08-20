'use client'

import * as React from 'react'

import { FormSectionProvider, type FormDensity } from '@rpg/ui/form'

/** Default form rhythm for create-modal and nested create-tab workflows. */
export const CREATE_FLOW_FORM_DENSITY: FormDensity = 'compact'

const CreateFlowFormDensityContext = React.createContext<FormDensity | null>(null)

/** Supplies compact form density to nested forms and hand-built field stacks. */
export function CreateFlowFormDensityRoot({ children }: { children: React.ReactNode }) {
  return (
    <CreateFlowFormDensityContext.Provider value={CREATE_FLOW_FORM_DENSITY}>
      <FormSectionProvider density={CREATE_FLOW_FORM_DENSITY} inRhythmStack>
        {children}
      </FormSectionProvider>
    </CreateFlowFormDensityContext.Provider>
  )
}

/** Undefined outside {@link CreateFlowFormDensityRoot}. */
export function useCreateFlowFormDensity(): FormDensity | undefined {
  return React.useContext(CreateFlowFormDensityContext) ?? undefined
}
