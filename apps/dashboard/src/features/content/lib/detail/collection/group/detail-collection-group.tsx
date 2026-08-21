import type { ReactNode } from 'react'

import { cn, Eyebrow } from '@rpg/ui'

import { detailCollectionGroupHeaderVariants } from '../detail-collection-chrome.variants'
import { detailCollectionGroupVariants } from './detail-collection-group.variants'

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
    <div className={cn(detailCollectionGroupVariants(), className)}>
      {showHeader ? (
        <div className={detailCollectionGroupHeaderVariants()}>
          {label ? <Eyebrow size="sm">{label}</Eyebrow> : null}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}
