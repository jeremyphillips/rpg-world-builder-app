import { Eyebrow, SelectionSummaryChangeAction } from '@rpg/ui'

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
    <div className="flex min-h-control-action-compact flex-wrap items-center justify-between gap-2">
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
