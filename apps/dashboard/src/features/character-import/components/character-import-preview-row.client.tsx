'use client'

import { SemanticText, Text } from '@rpg/ui'
import type { CharacterImportFieldResult } from '@rpg/contracts/character-import'

import {
  PREVIEW_VALUE_TEXT_CLASS,
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
      <SemanticText
        tone={extractionValueTone(result)}
        emphasis={extractionValueEmphasis(result)}
        className={PREVIEW_VALUE_TEXT_CLASS}
      >
        {displayValue}
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
    </div>
  )
}
