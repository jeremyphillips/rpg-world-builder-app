import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Text } from '../../components/ui/text'
import { formStickyActionsBarClasses } from './form-chrome.variants'

export interface FormActionsBarProps {
  /** Form-level validation or server error shown above the actions row. */
  formError?: string | null
  children?: ReactNode
  className?: string
}

/**
 * Sticky save/cancel row for long `<Form>` / `<TabbedForm>` layouts. Keeps primary
 * actions and form-level errors visible while tab panels or field stacks scroll.
 */
export function FormActionsBar({ formError, children, className }: FormActionsBarProps) {
  if (!formError && !children) {
    return null
  }

  return (
    <div
      role="toolbar"
      aria-label="Form actions"
      className={cn(formStickyActionsBarClasses, className)}
    >
      {formError ? (
        <Text variant="destructive" role="alert" className="mb-3">
          {formError}
        </Text>
      ) : null}
      {children}
    </div>
  )
}
