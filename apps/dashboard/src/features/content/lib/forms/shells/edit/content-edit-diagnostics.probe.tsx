import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

/** Minimal edit layout for diagnostic alert tests — surfaces header notices and save affordance. */
export function DiagnosticsEditProbeLayout({
  formHeaderPrefix,
  submitLabel = 'Save changes',
  defaultValues,
  onSubmit,
}: {
  formHeaderPrefix?: ReactNode
  submitLabel?: string
  defaultValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>, form: ReturnType<typeof useForm>) => Promise<void>
}) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit ? form.handleSubmit((values) => onSubmit(values, form)) : undefined}>
        {formHeaderPrefix}
        <label>
          Name
          <input {...form.register('name')} />
        </label>
        {Array.isArray(form.watch('traits')) ? (
          <button
            type="button"
            onClick={() => {
              const traits = form.getValues('traits')
              if (Array.isArray(traits)) {
                form.setValue('traits', traits.slice(0, -1), { shouldDirty: true })
              }
            }}
          >
            Remove persisted homebrew trait
          </button>
        ) : null}
        <button type="submit">{submitLabel}</button>
      </form>
    </FormProvider>
  )
}
