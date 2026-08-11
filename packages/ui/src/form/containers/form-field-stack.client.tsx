'use client'

import * as React from 'react'

import { FormSectionProvider, FormRhythmStack } from '../context/form-section.context'
import { FormUiProvider } from '../context/form-ui.context'
import type { FormDensity } from '../form-density'
import type { FormItem } from '../field-config'
import { FormItems } from './form-items.client'

export interface FormFieldStackProps {
  fields: FormItem[]
  idPrefix: string
  density?: FormDensity
  className?: string
  /** Optional slot below the field stack — preview copy, helper text, etc. */
  children?: React.ReactNode
}

/**
 * Detached form field stack for modals and other surfaces where the caller owns
 * `FormProvider` + `useForm` and actions live outside a `<form>` element.
 */
export function FormFieldStack({
  fields,
  idPrefix,
  density,
  className,
  children,
}: FormFieldStackProps) {
  return (
    <FormUiProvider fields={fields}>
      <FormSectionProvider density={density}>
        <FormRhythmStack className={className}>
          <FormItems items={fields} idPrefix={idPrefix} />
        </FormRhythmStack>
      </FormSectionProvider>
      {children}
    </FormUiProvider>
  )
}
