import { Text } from '@rpg/ui'
import type {
  CharacterImportFieldResult,
  CharacterNarrativePreview,
} from '@rpg/contracts/character-import'

import { CharacterImportSemanticText } from './character-import-semantic-text'
import {
  NARRATIVE_FIELD_KEYS,
  NARRATIVE_FIELD_LABELS,
  formatNarrativeFieldValue,
  narrativeFieldTone,
  type NarrativeFieldKey,
} from '../model/character-import-preview.lib'

export type CharacterImportNarrativePreviewSectionProps = {
  result: CharacterImportFieldResult<CharacterNarrativePreview>
}

function NarrativeFieldRow({
  field,
  narrative,
}: {
  field: NarrativeFieldKey
  narrative: CharacterNarrativePreview | undefined
}) {
  const { displayValue, isUnset } = formatNarrativeFieldValue(narrative, field)

  return (
    <div className="grid gap-1">
      <Text variant="emphasis">{NARRATIVE_FIELD_LABELS[field]}</Text>
      <CharacterImportSemanticText
        tone={narrativeFieldTone(isUnset)}
        emphasis={isUnset ? 'low' : 'medium'}
      >
        {displayValue}
      </CharacterImportSemanticText>
    </div>
  )
}

export function CharacterImportNarrativePreviewSection({
  result,
}: CharacterImportNarrativePreviewSectionProps) {
  const narrative = result.status === 'mapped' ? result.value : undefined

  return (
    <div className="grid gap-3 border-b border-border-subtle py-3 last:border-b-0">
      <Text variant="emphasis">Narrative</Text>
      {NARRATIVE_FIELD_KEYS.map((field) => (
        <NarrativeFieldRow key={field} field={field} narrative={narrative} />
      ))}
    </div>
  )
}
