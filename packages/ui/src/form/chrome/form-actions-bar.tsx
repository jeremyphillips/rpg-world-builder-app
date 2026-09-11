import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Text } from '../../components/ui/text'
import { formDockedActionsBarClasses, formStickyActionsBarClasses } from './form-chrome.variants'

export type FormActionsBarPlacement = 'sticky' | 'docked'

export interface FormActionsBarProps {
  /** Form-level validation or server error shown above the actions row. */
  formError?: string | null
  /** Cross-tab validation summary for `<TabbedForm>` footers. */
  validationSummary?: ReactNode
  children?: ReactNode
  className?: string
  /** `docked` sits below a bounded scroll body; `sticky` pins during ancestor scroll. */
  placement?: FormActionsBarPlacement
}

/**
 * Sticky save/cancel row for long `<Form>` / `<TabbedForm>` layouts. Keeps primary
 * actions and form-level errors visible while tab panels or field stacks scroll.
 */
export function FormActionsBar({
  formError,
  validationSummary,
  children,
  className,
  placement = 'sticky',
}: FormActionsBarProps) {
  if (!formError && !validationSummary && !children) {
    return null
  }

  const placementClasses =
    placement === 'docked' ? formDockedActionsBarClasses : formStickyActionsBarClasses

  return (
    <div role="toolbar" aria-label="Form actions" className={cn(placementClasses, className)}>
      {formError ? (
        <Text variant="destructive" role="alert" className="mb-3">
          {formError}
        </Text>
      ) : null}
      {validationSummary}
      {children}
    </div>
  )
}
