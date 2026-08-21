'use client'

import { useWatch } from 'react-hook-form'

import { ProficiencyEquipmentLinkCue } from '../../../lib/forms/grants/proficiency/proficiency-equipment-link-cue.client'
import { formatProficiencyLinkEquipmentCue } from '../../../lib/forms/grants/equipment/equipment-grant-form-labels'
import { CHARACTER_CREATION_TOOL_CHOICE_LABEL_PATH } from '../../lib/character-creation/class-character-creation-link-labels'

/** Link cue beneath proficiency-linked starting-equipment grant fields. */
export function ProficiencyLinkedGrantRowCue() {
  const proficiencyChoiceId = useWatch({ name: 'proficiencyChoiceId' }) as string | undefined
  const choiceLabel = useWatch({ name: CHARACTER_CREATION_TOOL_CHOICE_LABEL_PATH }) as
    | string
    | undefined

  if (!proficiencyChoiceId || !choiceLabel?.trim()) return null

  return (
    <ProficiencyEquipmentLinkCue
      message={formatProficiencyLinkEquipmentCue(choiceLabel.trim())}
      navigateLabel="View choice"
      onNavigate={() => {
        document
          .getElementById('class-character-creation-tool-proficiencies')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        document
          .querySelector<HTMLInputElement>(`[name="${CHARACTER_CREATION_TOOL_CHOICE_LABEL_PATH}"]`)
          ?.focus()
      }}
    />
  )
}
