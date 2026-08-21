import { useWatch } from 'react-hook-form'

import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import { SPELL_AREA_GEOMETRY_NONE } from '../../../lib/spell-form-labels'

function SelectionHint({ children }: { children: string }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

/** Mode-specific static copy for the Selection panel. */
export function SpellResolutionSelectionHints() {
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined

  if (!resolution) return null

  const areaShape = resolution.areaOfEffect?.shape
  const hasArea = Boolean(areaShape && areaShape !== SPELL_AREA_GEOMETRY_NONE)

  if (resolution.selectionMode === 'none') {
    return <SelectionHint>{RESOLUTION_SECTION_LABELS.selectionNoneHint}</SelectionHint>
  }

  if (resolution.selectionMode === 'self' && !hasArea) {
    return <SelectionHint>{RESOLUTION_SECTION_LABELS.selectionSelfRecipientHint}</SelectionHint>
  }

  if (resolution.selectionMode === 'self' && hasArea) {
    return (
      <div className="flex flex-col gap-1">
        <SelectionHint>{RESOLUTION_SECTION_LABELS.selectionSelfOriginHint}</SelectionHint>
        <SelectionHint>{RESOLUTION_SECTION_LABELS.selectionAffectedAreaHint}</SelectionHint>
      </div>
    )
  }

  if (resolution.selectionMode === 'point' && hasArea) {
    return <SelectionHint>{RESOLUTION_SECTION_LABELS.selectionAffectedAreaHint}</SelectionHint>
  }

  return null
}
