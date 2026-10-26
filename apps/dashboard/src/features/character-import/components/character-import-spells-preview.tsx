import { Text } from '@rpg/ui'
import type {
  CharacterImportFieldResult,
  RecognizedSpellPreview,
} from '@rpg/contracts/character-import'

import { CharacterImportSemanticText } from './character-import-semantic-text'
import {
  EXTRACTION_UNSET_DISPLAY_VALUE,
  extractionIssueTone,
  extractionValueEmphasis,
  extractionValueTone,
  formatSpellPreviewLabel,
  formatSupportedSpellsValue,
  isExtractionValueUnset,
  partitionSpellItems,
  shouldShowExtractionIssue,
} from '../model/character-import-preview.lib'

export type CharacterImportSpellsPreviewSectionProps = {
  result: CharacterImportFieldResult<RecognizedSpellPreview[]>
}

export function CharacterImportSpellsPreviewSection({
  result,
}: CharacterImportSpellsPreviewSectionProps) {
  const isUnset = isExtractionValueUnset(result)
  const spells = result.value
  const { supported, unsupported } = partitionSpellItems(spells ?? [])

  return (
    <div className="grid gap-3 border-b border-border-subtle py-3 last:border-b-0">
      <Text variant="emphasis">Spells</Text>
      {isUnset || !spells ? (
        <>
          <CharacterImportSemanticText
            tone={extractionValueTone(result)}
            emphasis={extractionValueEmphasis(result)}
          >
            {EXTRACTION_UNSET_DISPLAY_VALUE}
          </CharacterImportSemanticText>
          {shouldShowExtractionIssue(result) ? (
            <CharacterImportSemanticText tone={extractionIssueTone(result)} emphasis="low">
              {result.issues.join(' ')}
            </CharacterImportSemanticText>
          ) : null}
        </>
      ) : (
        <>
          <CharacterImportSemanticText tone="neutral" emphasis="medium">
            {supported.length > 0
              ? formatSupportedSpellsValue(supported)
              : EXTRACTION_UNSET_DISPLAY_VALUE}
          </CharacterImportSemanticText>
          {unsupported.length > 0 ? (
            <div className="grid gap-1">
              <Text variant="emphasis">Unsupported:</Text>
              <CharacterImportSemanticText tone="warning" emphasis="medium">
                {unsupported.map((entry) => formatSpellPreviewLabel(entry)).join(', ')}
              </CharacterImportSemanticText>
            </div>
          ) : null}
          {shouldShowExtractionIssue(result) ? (
            <CharacterImportSemanticText tone={extractionIssueTone(result)} emphasis="low">
              {result.issues.join(' ')}
            </CharacterImportSemanticText>
          ) : null}
        </>
      )}
    </div>
  )
}
