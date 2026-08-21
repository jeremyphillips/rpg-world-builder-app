'use client'

import { useWatch } from 'react-hook-form'

import { ProficiencyEquipmentLinkCue } from '../../../lib/forms/grants/proficiency-equipment-link-cue.client'
import { formatProficiencyLinkProficiencyCue } from '../../../lib/forms/grants/equipment-grant-form-labels'
import {
  CHARACTER_CREATION_TOOL_CHOICE_ID,
  STARTING_EQUIPMENT_FIELD_NAME,
} from '../../lib/character-creation/class-character-creation-link-labels'
import { findProficiencyEquipmentReferences } from '../../lib/character-creation/class-proficiency-equipment-references.lib'
import type { StartingEquipmentForm } from '../../lib/character-creation/class-starting-equipment-form-fields'

/** Reciprocal link cue in the Tool Proficiencies section when starting equipment references this choice. */
export function ToolProficiencyReciprocalCue() {
  const startingEquipment = useWatch({ name: STARTING_EQUIPMENT_FIELD_NAME }) as
    | StartingEquipmentForm
    | undefined

  const references = findProficiencyEquipmentReferences(
    startingEquipment,
    CHARACTER_CREATION_TOOL_CHOICE_ID,
  )
  const reference = references[0]
  if (!reference) return null

  return (
    <ProficiencyEquipmentLinkCue
      message={formatProficiencyLinkProficiencyCue(reference.packageLabel)}
      navigateLabel="View grant"
      onNavigate={() => {
        document
          .getElementById('class-starting-equipment-heading')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}
    />
  )
}
