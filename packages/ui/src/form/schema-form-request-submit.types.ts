import type { FieldValues, UseFormReturn } from 'react-hook-form'

export type SchemaFormSubmitHandler<TFieldValues extends FieldValues> = (
  values: TFieldValues,
  form: UseFormReturn<TFieldValues>,
) => void | Promise<void>

/** Imperative submit entry point — optional handler defaults to the wired form `onSubmit`. */
export type SchemaFormRequestSubmit<TFieldValues extends FieldValues = FieldValues> = (
  handler?: SchemaFormSubmitHandler<TFieldValues>,
  onInvalid?: () => void,
) => void
