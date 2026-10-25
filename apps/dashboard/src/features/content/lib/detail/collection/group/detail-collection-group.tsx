import type { ReactNode } from 'react'

import { cn, Eyebrow } from '@rpg/ui'

import { detailCollectionGroupHeaderVariants } from '../detail-collection-chrome.variants'

export type DetailCollectionGroupProps = {
  label?: string
  /** Single optional group-header action control (button, menu, link-button). */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Grouped collection-body subgroup: optional muted eyebrow label + bordered/padded body.
 * Owns inter-group `border-b` rhythm. Intra-group row dividers stay on DetailCollectionRowList.
 */
export function DetailCollectionGroup({
  label,
  action,
  children,
  className,
}: DetailCollectionGroupProps) {
  const showHeader = Boolean(label || action)

  return (
    <div className={cn('border-b border-border-subtle px-4 py-2 last:border-b-0', className)}>
      {showHeader ? (
        <div className={detailCollectionGroupHeaderVariants}>
          {label ? <Eyebrow size="sm">{label}</Eyebrow> : null}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}
