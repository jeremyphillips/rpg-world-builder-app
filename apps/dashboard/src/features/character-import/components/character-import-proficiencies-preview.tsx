import { Text } from '@rpg/ui'
import { getProficiencyDomainCompactLabel } from '@rpg/contracts'
import type {
  CharacterImportFieldResult,
  CharacterImportProficienciesPreview,
} from '@rpg/contracts/character-import'

import { CharacterImportSemanticText } from './character-import-semantic-text'
import {
  EXTRACTION_UNSET_DISPLAY_VALUE,
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
      <CharacterImportSemanticText
        tone={isUnset ? 'info' : 'neutral'}
        emphasis={isUnset ? 'low' : 'medium'}
      >
        {isUnset ? EXTRACTION_UNSET_DISPLAY_VALUE : values.join(', ')}
      </CharacterImportSemanticText>
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
          <ProficiencyGroup
            label={getProficiencyDomainCompactLabel('skill')}
            values={formatProficienciesPreviewValue(preview.skills)}
          />
          <ProficiencyGroup label="Tools" values={formatProficienciesPreviewValue(preview.tools)} />
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
