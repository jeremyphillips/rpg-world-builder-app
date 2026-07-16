'use client'

import { SemanticText, Text } from '@rpg/ui'
import type {
  CharacterImportFieldResult,
  RecognizedSpellPreview,
} from '@rpg/contracts/character-import'

import {
  EXTRACTION_UNSET_DISPLAY_VALUE,
  PREVIEW_VALUE_TEXT_CLASS,
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
              ? formatSupportedSpellsValue(supported)
              : EXTRACTION_UNSET_DISPLAY_VALUE}
          </SemanticText>
          {unsupported.length > 0 ? (
            <div className="grid gap-1">
              <Text variant="emphasis">Unsupported:</Text>
              <SemanticText tone="caution" emphasis="medium" className={PREVIEW_VALUE_TEXT_CLASS}>
                {unsupported.map((entry) => formatSpellPreviewLabel(entry)).join(', ')}
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
