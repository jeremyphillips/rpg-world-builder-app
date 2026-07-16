'use client'

import { SemanticText, Text } from '@rpg/ui'
import type {
  CharacterImportFieldResult,
  CharacterImportProficienciesPreview,
} from '@rpg/contracts/character-import'

import {
  extractionFieldTone,
  extractionIssueReason,
  formatProficienciesPreviewValue,
} from '../model/character-import-preview.lib'

export type CharacterImportProficienciesPreviewProps = {
  result: CharacterImportFieldResult<CharacterImportProficienciesPreview>
}

function ProficiencyGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="grid gap-1">
      <Text variant="emphasis">{label}</Text>
      <SemanticText tone="neutral" emphasis="medium">
        {values.length > 0 ? values.join(', ') : 'None'}
      </SemanticText>
    </div>
  )
}

export function CharacterImportProficienciesPreviewSection({
  result,
}: CharacterImportProficienciesPreviewProps) {
  const tone = extractionFieldTone(result)
  const isUndefined = result.status !== 'mapped' || result.value == null
  const preview = result.value

  return (
    <div className="grid gap-3 border-b border-border-subtle py-3 last:border-b-0">
      <Text variant="emphasis">Proficiencies</Text>
      {isUndefined || !preview ? (
        <>
          <SemanticText tone="negative" emphasis="medium">
            Undefined
          </SemanticText>
          <SemanticText tone="negative" emphasis="low">
            {result.issues[0] ?? extractionIssueReason(result.status)}
          </SemanticText>
        </>
      ) : (
        <>
          <ProficiencyGroup
            label="Skills"
            values={formatProficienciesPreviewValue(preview.skills)}
          />
          <ProficiencyGroup label="Tools" values={formatProficienciesPreviewValue(preview.tools)} />
          {result.issues.length > 0 ? (
            <SemanticText tone={tone} emphasis="low">
              {result.issues.join(' ')}
            </SemanticText>
          ) : null}
        </>
      )}
    </div>
  )
}
