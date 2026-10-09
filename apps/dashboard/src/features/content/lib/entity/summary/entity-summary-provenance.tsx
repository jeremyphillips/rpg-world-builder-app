import type { ContentCardDensity } from '@rpg/ui'

import type { EntitySummaryProvenanceItem } from './entity-summary-provenance.types'
import {
  entitySummaryProvenanceActionVariants,
  entitySummaryProvenanceTextVariants,
} from './entity-summary.variants'

export function EntitySummaryProvenanceItemView({
  item,
  density,
}: {
  item: EntitySummaryProvenanceItem
  density: ContentCardDensity
}) {
  if (item.kind === 'text') {
    return <span className={entitySummaryProvenanceTextVariants({ density })}>{item.label}</span>
  }

  return (
    <button
      type="button"
      aria-label={item.ariaLabel}
      disabled={item.disabled}
      className={entitySummaryProvenanceActionVariants({ density })}
      onClick={item.onAction}
    >
      {item.label}
    </button>
  )
}
