import { ChevronRight } from 'lucide-react'
import { InlineInactiveStatus, ValidationIssueCountBadge } from '@rpg/ui'
import type { RefObject } from 'react'

import { masterDetailRowValidationStateLabel } from '../../lib/master-detail/master-detail-row-validation'
import type { MasterDetailListItem } from './master-detail-list-panel'
import {
  masterDetailListRowAvailabilityClasses,
  masterDetailListRowClasses,
  masterDetailListRowContentClasses,
  masterDetailListRowEndClasses,
  masterDetailListRowEyebrowClasses,
  masterDetailListRowMetadataClasses,
  masterDetailListRowSourceClasses,
  masterDetailListRowTitleClasses,
} from './master-detail-list-panel.variants'

export interface MasterDetailListRowProps {
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
    <span className={masterDetailListRowContentClasses}>
      {item.meta?.eyebrow ? (
        <span className={masterDetailListRowEyebrowClasses}>{item.meta.eyebrow}</span>
      ) : null}
      <span className={masterDetailListRowTitleClasses}>{item.title}</span>
      {item.meta?.sourceLabel ? (
        <span className={masterDetailListRowSourceClasses}>{item.meta.sourceLabel}</span>
      ) : null}
      {item.availabilityStatusLabel ? (
        <InlineInactiveStatus
          label={item.availabilityStatusLabel}
          className={masterDetailListRowAvailabilityClasses}
        />
      ) : null}
      {issueCount > 0 ? (
        <span className={masterDetailListRowMetadataClasses}>
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
  const active = item.active !== false
  const issueCount = item.issueCount ?? 0

  return (
    <li>
      <button
        ref={isSelected ? selectedRowRef : undefined}
        type="button"
        aria-current={isSelected ? 'true' : undefined}
        aria-invalid={item.hasError ? true : undefined}
        onClick={() => onSelect(index)}
        className={masterDetailListRowClasses({ active, isSelected })}
      >
        <MasterDetailListRowContent item={item} issueCount={issueCount} />
        <span className={masterDetailListRowEndClasses} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
        {issueCount > 0 ? (
          <span className="sr-only">, {masterDetailRowValidationStateLabel(issueCount)}</span>
        ) : null}
      </button>
    </li>
  )
}
