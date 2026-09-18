'use client'

import * as React from 'react'

import {
  FieldChromeShell,
  type FieldChromeShellProps,
} from '../../components/ui/field-chrome-shell'
import { FormSectionContext, useFormSectionContext } from './form-section.context'

/** Field container shell that rebinds the internal nesting plane for dependent nests. */
export function FormFieldChromeShell(props: FieldChromeShellProps) {
  const parent = useFormSectionContext()
  const value = React.useMemo(
    () => ({ ...parent, surfaceHost: 'field-container' as const }),
    [parent],
  )

  return (
    <FormSectionContext.Provider value={value}>
      <FieldChromeShell {...props} />
    </FormSectionContext.Provider>
  )
}
