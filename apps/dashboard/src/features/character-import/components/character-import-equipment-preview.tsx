import { Text } from '@rpg/ui'
import type {
  CharacterImportFieldResult,
  RecognizedEquipmentItem,
} from '@rpg/contracts/character-import'

import { CharacterImportSemanticText } from './character-import-semantic-text'
import {
  EXTRACTION_UNSET_DISPLAY_VALUE,
  extractionIssueTone,
  extractionValueEmphasis,
  extractionValueTone,
  formatEquipmentItemLabel,
  formatSupportedEquipmentValue,
  isExtractionValueUnset,
  partitionEquipmentItems,
  shouldShowExtractionIssue,
} from '../model/character-import-preview.lib'

export type CharacterImportEquipmentPreviewSectionProps = {
  result: CharacterImportFieldResult<RecognizedEquipmentItem[]>
}

export function CharacterImportEquipmentPreviewSection({
  result,
}: CharacterImportEquipmentPreviewSectionProps) {
  const isUnset = isExtractionValueUnset(result)
  const equipment = result.value
  const { supported, unsupported } = partitionEquipmentItems(equipment ?? [])

  return (
    <div className="grid gap-3 border-b border-border-subtle py-3 last:border-b-0">
      <Text variant="emphasis">Equipment</Text>
      {isUnset || !equipment ? (
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
              ? formatSupportedEquipmentValue(supported)
              : EXTRACTION_UNSET_DISPLAY_VALUE}
          </CharacterImportSemanticText>
          {unsupported.length > 0 ? (
            <div className="grid gap-1">
              <Text variant="emphasis">Unsupported:</Text>
              <CharacterImportSemanticText tone="warning" emphasis="medium">
                {unsupported.map((entry) => formatEquipmentItemLabel(entry)).join(', ')}
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
