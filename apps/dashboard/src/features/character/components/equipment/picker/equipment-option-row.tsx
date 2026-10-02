import { IdentityRow } from '@rpg/ui'

import {
  equipmentOptionInlineClauses,
  type EquipmentOptionRowPresentation,
} from '../../../lib/equipment/equipment-option-row-presentation.lib'
import {
  equipmentOptionQuantityAccessibleVariants,
  equipmentOptionRowIdentityVariants,
  equipmentOptionRowVariants,
} from './equipment-option-row.variants'

export type EquipmentOptionRowProps = {
  presentation: EquipmentOptionRowPresentation
  /** Inline clause cap. Remaining clauses stay available on the row title. */
  maxInlineClauses?: number
}

function classificationLabel(presentation: EquipmentOptionRowPresentation): string {
  return [presentation.kindLabel, ...presentation.metadata]
    .filter((part) => part.length > 0)
    .join(' · ')
}

/** Compact equipment identity for combobox options. The host row owns selection chrome. */
export function EquipmentOptionRow({
  presentation,
  maxInlineClauses = 2,
}: EquipmentOptionRowProps) {
  const inline = equipmentOptionInlineClauses(presentation, maxInlineClauses)
    .map((clause) => clause.label)
    .join(' · ')
  const classification = classificationLabel(presentation)
  const trailing = presentation.trailingState

  return (
    <div className={equipmentOptionRowVariants()} title={presentation.secondaryTitle}>
      <IdentityRow
        className={equipmentOptionRowIdentityVariants()}
        heading={presentation.identity}
        classification={classification || undefined}
        supporting={inline || undefined}
        headingEnd={
          trailing ? (
            <>
              <span aria-hidden="true">{trailing.label}</span>
              <span className={equipmentOptionQuantityAccessibleVariants()}>
                {trailing.accessibleLabel}
              </span>
            </>
          ) : undefined
        }
        size="sm"
      />
    </div>
  )
}
