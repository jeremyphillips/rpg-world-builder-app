'use client'

import { ActionButton } from './action-button.client'

/** Shared title-row edit affordance (master-detail name, inline editable headings). */
export const INLINE_TITLE_EDIT_ACTION_BUTTON_SIZE = 'icon-xs' as const

export type InlineTitleEditActionButtonProps = {
  editing: boolean
  onClick: () => void
  'aria-label'?: string
}

export function InlineTitleEditActionButton({
  editing,
  onClick,
  'aria-label': ariaLabel = 'Edit name',
}: InlineTitleEditActionButtonProps) {
  return (
    <ActionButton
      action="edit"
      variant="ghost"
      size={INLINE_TITLE_EDIT_ACTION_BUTTON_SIZE}
      aria-label={ariaLabel}
      aria-hidden={editing ? true : undefined}
      tabIndex={editing ? -1 : 0}
      className={editing ? 'invisible shrink-0' : 'shrink-0'}
      onClick={onClick}
    />
  )
}
