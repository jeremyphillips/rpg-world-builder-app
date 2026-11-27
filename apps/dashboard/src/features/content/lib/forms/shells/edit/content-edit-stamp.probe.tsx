import type { ComponentType, ReactNode } from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import {
  collectCurrentFormValidationProducerIssues,
  Form,
  isFormValidationProducerSlotStale,
  useFormValidationProducerContext,
} from '@rpg/ui/form'
import type { FormItem } from '@rpg/ui/form'

const probeFields: FormItem[] = [{ name: 'name', label: 'Name', type: 'text', required: true }]

export function ProducerApiIssueProbe() {
  const producer = useFormValidationProducerContext()
  if (!producer) {
    return <output data-testid="api-issue-count">0</output>
  }
  const count = collectCurrentFormValidationProducerIssues(producer.session, producer.stamp).length
  return <output data-testid="api-issue-count">{count}</output>
}

/** Counts only the `api` producer slot at the current stamp (persist rejection boundary). */
export function ProducerApiSlotIssueProbe() {
  const producer = useFormValidationProducerContext()
  if (!producer) {
    return <output data-testid="api-slot-issue-count">0</output>
  }
  const state = producer.session.slots.api
  if (!state || isFormValidationProducerSlotStale(state, producer.stamp)) {
    return <output data-testid="api-slot-issue-count">0</output>
  }
  return <output data-testid="api-slot-issue-count">{state.issues.length}</output>
}

/** Edit layout probe — real adopted onSubmit and producer boundary for stamp races. */
export function StampEditProbeLayout<TFormValues extends FieldValues>({
  schema,
  defaultValues,
  formKey,
  onSubmit,
  submitLabel = 'Save changes',
  formError,
  producerBoundary: ProducerBoundary,
}: {
  schema: ZodType<TFormValues>
  defaultValues?: DefaultValues<TFormValues>
  formKey?: string
  submitLabel?: string
  formError: string | null
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
  producerBoundary?: ComponentType<{ children: ReactNode }>
}) {
  const Boundary = ProducerBoundary ?? (({ children }: { children: ReactNode }) => children)

  return (
    <Form<TFormValues>
      key={formKey}
      id={formKey}
      uiStateKey={formKey}
      schema={schema}
      fields={probeFields}
      defaultValues={defaultValues}
      formError={formError ?? undefined}
      onSubmit={onSubmit}
      producerBoundary={Boundary}
      contentWrapper={(content) => (
        <>
          {content}
          <ProducerApiIssueProbe />
        </>
      )}
      footer={() => <button type="submit">{submitLabel}</button>}
    />
  )
}
