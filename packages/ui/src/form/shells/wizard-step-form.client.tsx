'use client'

import type { DefaultValues, FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'

import { WizardFooter, useWizard } from '../components/ui/wizard.client'
import { Form } from './form.client'
import type { FileFieldPropsMap, FormItem } from './field-config'

export interface WizardStepFormProps<TFieldValues extends FieldValues> {
  /** Zod schema for this step's fields only. */
  schema: ZodType<TFieldValues>
  /** Ordered fields/rows/groups for this step. */
  fields: FormItem[]
  /** Per-file-field remote preview props; see `FormProps['fileFieldProps']`. */
  fileFieldProps?: FileFieldPropsMap
  className?: string
}

/**
 * A wizard step backed by the schema-driven `<Form>`. Wires the standard step
 * skeleton: `mode="onChange"` so validity drives the Next button, submit via
 * `completeStep`, and a `WizardFooter`. Step values must be flat (no nesting in
 * the step itself) so they can be seeded back from the wizard's accumulated
 * values — revisiting a step via Back restores what was entered.
 */
export function WizardStepForm<TFieldValues extends FieldValues>({
  schema,
  fields,
  fileFieldProps,
  className,
}: WizardStepFormProps<TFieldValues>) {
  const { completeStep, accumulatedValues } = useWizard()

  return (
    <Form<TFieldValues>
      schema={schema}
      fields={fields}
      mode="onChange"
      defaultValues={accumulatedValues as DefaultValues<TFieldValues>}
      onSubmit={(values) => completeStep(values as Record<string, unknown>)}
      fileFieldProps={fileFieldProps}
      className={className}
      footer={(form) => (
        <WizardFooter isValid={form.formState.isValid} isSubmitting={form.formState.isSubmitting} />
      )}
    />
  )
}
