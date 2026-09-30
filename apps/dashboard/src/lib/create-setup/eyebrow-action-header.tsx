import { Eyebrow, SelectionSummaryChangeAction } from '@rpg/ui'

import { eyebrowActionHeaderClasses } from './eyebrow-action-header.variants'

export type EyebrowActionHeaderProps = {
  eyebrow: string
  actionLabel?: string
  actionAriaLabel?: string
  onAction?: () => void
}

export function EyebrowActionHeader({
  eyebrow,
  actionLabel,
  actionAriaLabel,
  onAction,
}: EyebrowActionHeaderProps) {
  const showAction = actionLabel != null && onAction != null

  return (
    <div className={eyebrowActionHeaderClasses}>
      <Eyebrow size="sm">{eyebrow}</Eyebrow>
      {showAction ? (
        <SelectionSummaryChangeAction
          changeLabel={actionLabel}
          ariaLabel={actionAriaLabel ?? actionLabel}
          onChange={onAction}
        />
      ) : null}
    </div>
  )
}
