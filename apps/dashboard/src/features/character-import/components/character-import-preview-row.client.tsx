'use client'

import { SemanticText, Text } from '@rpg/ui'
import type { CharacterImportFieldResult } from '@rpg/contracts/character-import'

import {
  extractionFieldTone,
  extractionIssueReason,
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
  const tone = extractionFieldTone(result)
  const isUndefined = result.status !== 'mapped' || result.value == null

  return (
    <div className="grid gap-1 border-b border-border-subtle py-3 last:border-b-0">
      <Text variant="emphasis">{label}</Text>
      <SemanticText tone={isUndefined ? 'negative' : tone} emphasis="medium">
        {displayValue}
      </SemanticText>
      {isUndefined ? (
        <SemanticText tone="negative" emphasis="low">
          {result.issues[0] ?? extractionIssueReason(result.status)}
        </SemanticText>
      ) : result.issues.length > 0 ? (
        <SemanticText tone="caution" emphasis="low">
          {result.issues.join(' ')}
        </SemanticText>
      ) : null}
    </div>
  )
}
