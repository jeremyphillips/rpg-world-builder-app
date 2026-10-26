import { Text } from '@rpg/ui'
import type { CharacterImportFieldResult } from '@rpg/contracts/character-import'

import { CharacterImportSemanticText } from './character-import-semantic-text'
import {
  extractionIssueTone,
  extractionValueEmphasis,
  extractionValueTone,
  shouldShowExtractionIssue,
  type ExtractionFieldKey,
} from '../model/character-import-preview.lib'

export type CharacterImportPreviewRowProps = {
  label: string
  field: ExtractionFieldKey
  result: CharacterImportFieldResult<unknown>
  displayValue: string
}

export function CharacterImportPreviewRow({
  label,
  result,
  displayValue,
}: CharacterImportPreviewRowProps) {
  return (
    <div className="grid gap-1 border-b border-border-subtle py-3 last:border-b-0">
      <Text variant="emphasis">{label}</Text>
      <CharacterImportSemanticText
        tone={extractionValueTone(result)}
        emphasis={extractionValueEmphasis(result)}
      >
        {displayValue}
      </CharacterImportSemanticText>
      {shouldShowExtractionIssue(result) ? (
        <CharacterImportSemanticText tone={extractionIssueTone(result)} emphasis="low">
          {result.issues.join(' ')}
        </CharacterImportSemanticText>
      ) : null}
    </div>
  )
}
