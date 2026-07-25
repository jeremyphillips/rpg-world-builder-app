'use client'

import * as React from 'react'

import type { FieldSize } from '../../components/ui/field.client'
import type { FieldStackRhythm } from '../../components/ui/field.variants'
import { FormSectionProvider, FormRhythmStack } from '../context/form-section.context'
import { FormUiProvider } from '../context/form-ui.context'
import type { FormItem } from '../field-config'
import { FormItems } from './form-items.client'

export interface FormFieldStackProps {
  fields: FormItem[]
  idPrefix: string
  rhythm?: FieldStackRhythm
  size?: FieldSize
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
  rhythm,
  size,
  className,
  children,
}: FormFieldStackProps) {
  return (
    <FormUiProvider fields={fields}>
      <FormSectionProvider rhythm={rhythm} size={size}>
        <FormRhythmStack className={className}>
          <FormItems items={fields} idPrefix={idPrefix} />
        </FormRhythmStack>
      </FormSectionProvider>
      {children}
    </FormUiProvider>
  )
}
