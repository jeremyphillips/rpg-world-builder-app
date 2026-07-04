import type { ReactNode } from 'react'
import { FormProvider, useForm, type FieldValues } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'

/**
 * Harness for form tab/panel components that expect an enclosing
 * react-hook-form context (and router context for availability links).
 *
 * @example
 * render(
 *   <TestFormShell defaultValues={{ features }}>
 *     <ClassFeaturesTab formCtx={formCtx} />
 *   </TestFormShell>,
 * )
 */
export function TestFormShell({
  children,
  defaultValues = {},
}: {
  children: ReactNode
  defaultValues?: FieldValues
}) {
  const form = useForm({ defaultValues })
  return (
    <MemoryRouter>
      <FormProvider {...form}>{children}</FormProvider>
    </MemoryRouter>
  )
}
