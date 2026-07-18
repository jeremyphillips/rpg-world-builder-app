'use client'

import { SemanticText, Text } from '@rpg/ui'
import type {
  CharacterImportFieldResult,
  RecognizedEquipmentItem,
} from '@rpg/contracts/character-import'

import {
  EXTRACTION_UNSET_DISPLAY_VALUE,
  PREVIEW_VALUE_TEXT_CLASS,
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
          <SemanticText
            tone={extractionValueTone(result)}
            emphasis={extractionValueEmphasis(result)}
            className={PREVIEW_VALUE_TEXT_CLASS}
          >
            {EXTRACTION_UNSET_DISPLAY_VALUE}
          </SemanticText>
          {shouldShowExtractionIssue(result) ? (
            <SemanticText
              tone={extractionIssueTone(result)}
              emphasis="low"
              className={PREVIEW_VALUE_TEXT_CLASS}
            >
              {result.issues.join(' ')}
            </SemanticText>
          ) : null}
        </>
      ) : (
        <>
          <SemanticText tone="neutral" emphasis="medium" className={PREVIEW_VALUE_TEXT_CLASS}>
            {supported.length > 0
              ? formatSupportedEquipmentValue(supported)
              : EXTRACTION_UNSET_DISPLAY_VALUE}
          </SemanticText>
          {unsupported.length > 0 ? (
            <div className="grid gap-1">
              <Text variant="emphasis">Unsupported:</Text>
              <SemanticText tone="warning" emphasis="medium" className={PREVIEW_VALUE_TEXT_CLASS}>
                {unsupported.map((entry) => formatEquipmentItemLabel(entry)).join(', ')}
              </SemanticText>
            </div>
          ) : null}
          {shouldShowExtractionIssue(result) ? (
            <SemanticText
              tone={extractionIssueTone(result)}
              emphasis="low"
              className={PREVIEW_VALUE_TEXT_CLASS}
            >
              {result.issues.join(' ')}
            </SemanticText>
          ) : null}
        </>
      )}
    </div>
  )
}
