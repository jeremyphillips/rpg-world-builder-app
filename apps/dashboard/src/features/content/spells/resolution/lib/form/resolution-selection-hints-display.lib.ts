import type { DisplayConfig, FormDisplayBlock } from '@rpg/ui/form'

import { SPELL_AREA_GEOMETRY_NONE } from '../../../lib/spell-form-labels'
import { RESOLUTION_SECTION_LABELS } from './resolution-form-labels'
import type { ResolutionFormValues } from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-constants'

const RESOLUTION_SELECTION_HINT_DEPS = [
  `${RESOLUTION_FIELD_NAME}.selectionMode`,
  `${RESOLUTION_FIELD_NAME}.areaOfEffect.shape`,
] as const

function supportingText(text: string): FormDisplayBlock {
  return { variant: 'text', text, role: 'supporting' }
}

function selectionHintBlocks(values: Record<string, unknown>): FormDisplayBlock[] | undefined {
  const selectionMode = values[`${RESOLUTION_FIELD_NAME}.selectionMode`]
  const areaShape = values[`${RESOLUTION_FIELD_NAME}.areaOfEffect.shape`]
  if (typeof selectionMode !== 'string') return undefined

  const hasArea = Boolean(areaShape && areaShape !== SPELL_AREA_GEOMETRY_NONE)

  if (selectionMode === 'none') {
    return [supportingText(RESOLUTION_SECTION_LABELS.selectionNoneHint)]
  }

  if (selectionMode === 'self' && !hasArea) {
    return [supportingText(RESOLUTION_SECTION_LABELS.selectionSelfRecipientHint)]
  }

  if (selectionMode === 'self' && hasArea) {
    return [
      supportingText(RESOLUTION_SECTION_LABELS.selectionSelfOriginHint),
      supportingText(RESOLUTION_SECTION_LABELS.selectionAffectedAreaHint),
    ]
  }

  if (selectionMode === 'point' && hasArea) {
    return [supportingText(RESOLUTION_SECTION_LABELS.selectionAffectedAreaHint)]
  }

  return undefined
}

export function resolutionSelectionHintsDisplay(): DisplayConfig {
  return {
    kind: 'display',
    id: 'resolution-selection-hints',
    resolve: {
      dependsOn: RESOLUTION_SELECTION_HINT_DEPS,
      contentWhen: (values) => selectionHintBlocks(values),
    },
  }
}
