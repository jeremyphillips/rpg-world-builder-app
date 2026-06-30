import type { ReactNode } from 'react'

import { cn } from '../lib/utils'
import { Text } from '../components/ui/text'
import { SubmitButton } from '../components/ui/submit-button'
import {
  formActionsBarActionsRowClasses,
  formActionsBarLeadingGroupClasses,
  formActionsBarPrimaryGroupClasses,
} from './form-chrome.variants'

export interface FormFooterActionsProps {
  /** Optional left-aligned actions (e.g. destructive delete). */
  leading?: ReactNode
  /** Optional actions before submit (e.g. cancel). */
  secondary?: ReactNode
  /** Disables the submit button and swaps in `pendingLabel` while truthy. */
  pending?: boolean
  /** When true, renders `successMessage` beside the submit button. */
  isSuccess?: boolean
  /** Submit button label, e.g. "Save profile". */
  submitLabel: string
  /** Label shown while `pending`. Defaults to `"Saving…"`. */
  pendingLabel?: string
  /** Confirmation text announced (role="status") after a successful save. */
  successMessage?: string
  className?: string
}

/**
 * Standard form actions row: optional leading/secondary controls plus a pending-aware
 * submit button. Use in `<Form>` / `<TabbedForm>` `footer` props (inside or outside
 * sticky chrome — layout is the same; only the wrapper differs).
 */
export function FormFooterActions({
  leading,
  secondary,
  pending = false,
  isSuccess = false,
  submitLabel,
  pendingLabel = 'Saving…',
  successMessage,
  className,
}: FormFooterActionsProps) {
  return (
    <div className={cn(formActionsBarActionsRowClasses, className)}>
      {leading ? <div className={formActionsBarLeadingGroupClasses}>{leading}</div> : null}
      <div className={formActionsBarPrimaryGroupClasses}>
        {secondary}
        {isSuccess && successMessage ? (
          <Text variant="small" role="status">
            {successMessage}
          </Text>
        ) : null}
        <SubmitButton pending={pending} pendingLabel={pendingLabel}>
          {submitLabel}
        </SubmitButton>
      </div>
    </div>
  )
}
