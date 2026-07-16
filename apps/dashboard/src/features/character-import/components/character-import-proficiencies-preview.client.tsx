'use client'

import { SemanticText, Text } from '@rpg/ui'
import type {
  CharacterImportFieldResult,
  CharacterImportProficienciesPreview,
} from '@rpg/contracts/character-import'

import {
  EXTRACTION_UNSET_DISPLAY_VALUE,
  PREVIEW_VALUE_TEXT_CLASS,
  extractionIssueTone,
  extractionValueEmphasis,
  extractionValueTone,
  formatProficienciesPreviewValue,
  isExtractionValueUnset,
  shouldShowExtractionIssue,
} from '../model/character-import-preview.lib'

export type CharacterImportProficienciesPreviewProps = {
  result: CharacterImportFieldResult<CharacterImportProficienciesPreview>
}

function ProficiencyGroup({ label, values }: { label: string; values: string[] }) {
  const isUnset = values.length === 0

  return (
    <div className="grid gap-1">
      <Text variant="emphasis">{label}</Text>
      <SemanticText
        tone={isUnset ? 'informative' : 'neutral'}
        emphasis={isUnset ? 'low' : 'medium'}
        className={PREVIEW_VALUE_TEXT_CLASS}
      >
        {isUnset ? EXTRACTION_UNSET_DISPLAY_VALUE : values.join(', ')}
      </SemanticText>
    </div>
  )
}

export function CharacterImportProficienciesPreviewSection({
  result,
}: CharacterImportProficienciesPreviewProps) {
  const isUnset = isExtractionValueUnset(result)
  const preview = result.value

  return (
    <div className="grid gap-3 border-b border-border-subtle py-3 last:border-b-0">
      <Text variant="emphasis">Proficiencies</Text>
      {isUnset || !preview ? (
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
          <ProficiencyGroup
            label="Skills"
            values={formatProficienciesPreviewValue(preview.skills)}
          />
          <ProficiencyGroup label="Tools" values={formatProficienciesPreviewValue(preview.tools)} />
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
