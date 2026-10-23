import { Icon, InlineInactiveStatus, ValidationIssueCountBadge } from '@rpg/ui'
import type { RefObject } from 'react'

import { masterDetailRowValidationStateLabel } from '../../lib/master-detail/master-detail-row-validation'
import type { MasterDetailListItem } from './master-detail-list-panel'
import { masterDetailListRowClasses } from './master-detail-list-row.variants'

export type MasterDetailListRowProps = {
  item: MasterDetailListItem
  index: number
  isSelected: boolean
  onSelect: (index: number) => void
  selectedRowRef?: RefObject<HTMLButtonElement | null>
}

function MasterDetailListRowContent({
  item,
  issueCount,
}: {
  item: MasterDetailListItem
  issueCount: number
}) {
  return (
    <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
      {item.meta?.eyebrow ? (
        <span className="min-w-0 truncate text-style-caption">{item.meta.eyebrow}</span>
      ) : null}
      <span className="min-w-0 truncate text-style-label text-foreground">{item.title}</span>
      {item.meta?.sourceLabel ? (
        <span className="min-w-0 truncate text-style-caption">{item.meta.sourceLabel}</span>
      ) : null}
      {item.availabilityStatusLabel ? (
        <InlineInactiveStatus label={item.availabilityStatusLabel} className="min-w-0" />
      ) : null}
      {issueCount > 0 ? (
        <span className="flex min-w-0 items-center">
          <ValidationIssueCountBadge count={issueCount} />
        </span>
      ) : null}
    </span>
  )
}

export function MasterDetailListRow({
  item,
  index,
  isSelected,
  onSelect,
  selectedRowRef,
}: MasterDetailListRowProps) {
  const issueCount = item.issueCount ?? 0

  return (
    <li>
      <button
        ref={isSelected ? selectedRowRef : undefined}
        type="button"
        aria-current={isSelected ? 'true' : undefined}
        aria-invalid={item.hasError ? true : undefined}
        onClick={() => onSelect(index)}
        className={masterDetailListRowClasses({ isSelected })}
      >
        <MasterDetailListRowContent item={item} issueCount={issueCount} />
        <span className="flex shrink-0 self-center text-foreground" aria-hidden>
          <Icon name="chevron-right" size="lg" />
        </span>
        {issueCount > 0 ? (
          <span className="sr-only">, {masterDetailRowValidationStateLabel(issueCount)}</span>
        ) : null}
      </button>
    </li>
  )
}
