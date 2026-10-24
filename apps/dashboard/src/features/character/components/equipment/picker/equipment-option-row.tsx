import { joinInlineMetadata } from '@rpg/contracts/primitives'
import { IdentityRow } from '@rpg/ui'

import {
  equipmentOptionInlineClauses,
  type EquipmentOptionRowPresentation,
} from '../../../lib/equipment/equipment-option-row-presentation.lib'

export type EquipmentOptionRowProps = {
  presentation: EquipmentOptionRowPresentation
  /** Inline clause cap. Remaining clauses stay available on the row title. */
  maxInlineClauses?: number
}

function classificationLabel(presentation: EquipmentOptionRowPresentation): string {
  return joinInlineMetadata([presentation.kindLabel, ...presentation.metadata])
}

/** Compact equipment identity for combobox options. The host row owns selection chrome. */
export function EquipmentOptionRow({
  presentation,
  maxInlineClauses = 2,
}: EquipmentOptionRowProps) {
  const inline = joinInlineMetadata(
    equipmentOptionInlineClauses(presentation, maxInlineClauses).map((clause) => clause.label),
  )
  const classification = classificationLabel(presentation)
  const trailing = presentation.trailingState

  return (
    <div className="flex w-full min-w-0" title={presentation.secondaryTitle}>
      <IdentityRow
        className="min-w-0 flex-1"
        heading={presentation.identity}
        classification={classification || undefined}
        supporting={inline || undefined}
        headingEnd={
          trailing ? (
            <>
              <span aria-hidden="true">{trailing.label}</span>
              <span className="sr-only">{trailing.accessibleLabel}</span>
            </>
          ) : undefined
        }
        density="compact"
      />
    </div>
  )
}
