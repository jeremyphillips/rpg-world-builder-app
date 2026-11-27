import type { FieldValues, UseFormReturn } from 'react-hook-form'

const persistBaselineResetForms = new WeakSet<UseFormReturn<FieldValues>>()

/** Marks the next pathless reset on this form as the post-persist baseline sync (no stamp bump). */
export function markContentFormPersistBaselineReset<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
): void {
  persistBaselineResetForms.add(form as UseFormReturn<FieldValues>)
}

export function consumeContentFormPersistBaselineReset<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
): boolean {
  const formRef = form as UseFormReturn<FieldValues>
  if (!persistBaselineResetForms.has(formRef)) return false
  persistBaselineResetForms.delete(formRef)
  return true
}
