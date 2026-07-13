'use client'

import { useWatch } from 'react-hook-form'

import {
  CHARACTER_CREATION_TOOL_CHOICE_ID,
  STARTING_EQUIPMENT_FIELD_NAME,
} from '../../lib/character-creation/class-character-creation-link-labels'
import { findProficiencyEquipmentReferences } from '../../lib/character-creation/class-proficiency-equipment-references.lib'
import type { StartingEquipmentForm } from '../../lib/character-creation/class-starting-equipment-form-fields'
import { ProficiencyEquipmentLinkCue } from './proficiency-equipment-link-cue.client'

/** Reciprocal link cue in the Tool Proficiencies section when starting equipment references this choice. */
export function ToolProficiencyReciprocalCue() {
  const startingEquipment = useWatch({ name: STARTING_EQUIPMENT_FIELD_NAME }) as
    | StartingEquipmentForm
    | undefined
  const choiceLabel = useWatch({
    name: 'characterCreation.proficiencies.tools.label',
  }) as string | undefined

  const references = findProficiencyEquipmentReferences(
    startingEquipment,
    CHARACTER_CREATION_TOOL_CHOICE_ID,
  )
  const reference = references[0]
  if (!reference) return null

  return (
    <ProficiencyEquipmentLinkCue
      variant="proficiency"
      choiceLabel={choiceLabel?.trim() || reference.choiceId}
      packageLabel={reference.packageLabel}
      onNavigate={() => {
        document
          .getElementById('class-starting-equipment-heading')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}
    />
  )
}
