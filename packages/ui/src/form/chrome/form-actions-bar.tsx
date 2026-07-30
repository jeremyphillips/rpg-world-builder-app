import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Text } from '../../components/ui/text'
import {
  formStickyActionsBarClasses,
  formStickyActionsBarSheetClasses,
} from './form-chrome.variants'

export type FormActionsBarVariant = 'default' | 'sheet'

export interface FormActionsBarProps {
  /** Form-level validation or server error shown above the actions row. */
  formError?: string | null
  /** Cross-tab validation summary for `<TabbedForm>` footers. */
  validationSummary?: ReactNode
  children?: ReactNode
  className?: string
  /** `sheet` adds horizontal inset for drawer/sheet forms with `p-0` bodies. */
  variant?: FormActionsBarVariant
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
  variant = 'default',
}: FormActionsBarProps) {
  if (!formError && !validationSummary && !children) {
    return null
  }

  const variantClasses =
    variant === 'sheet' ? formStickyActionsBarSheetClasses : formStickyActionsBarClasses

  return (
    <div role="toolbar" aria-label="Form actions" className={cn(variantClasses, className)}>
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
