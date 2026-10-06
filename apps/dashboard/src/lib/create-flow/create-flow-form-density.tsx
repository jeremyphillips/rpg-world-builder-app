import * as React from 'react'

import { FormSectionProvider } from '@rpg/ui/form'

import {
  CREATE_FLOW_FORM_DENSITY,
  CreateFlowFormDensityContext,
} from './use-create-flow-form-density'

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
