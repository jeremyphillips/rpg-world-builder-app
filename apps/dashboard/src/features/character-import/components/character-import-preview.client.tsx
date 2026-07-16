'use client'

import type { CharacterImportResult } from '@rpg/contracts/character-import'
import { Heading } from '@rpg/ui'

import {
  EXTRACTION_FIELD_KEYS,
  EXTRACTION_FIELD_LABELS,
  formatExtractionDisplayValue,
} from '../model/character-import-preview.lib'
import { CharacterImportPreviewRow } from './character-import-preview-row.client'
import { CharacterImportProficienciesPreviewSection } from './character-import-proficiencies-preview.client'
import { CharacterImportDispositionReport } from './character-import-disposition-report.client'
import { CharacterImportUnmappedAlert } from './character-import-unmapped-alert.client'

export type CharacterImportPreviewProps = {
  result: CharacterImportResult
}

export function CharacterImportPreview({ result }: CharacterImportPreviewProps) {
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="character-import-extraction-heading">
        <Heading variant="section" as="h2" id="character-import-extraction-heading">
          Extracted data
        </Heading>
        <div className="mt-3 rounded-md border border-border-subtle px-4">
          {EXTRACTION_FIELD_KEYS.map((field) => (
            <CharacterImportPreviewRow
              key={field}
              field={field}
              label={EXTRACTION_FIELD_LABELS[field]}
              result={result.extraction[field]}
              displayValue={formatExtractionDisplayValue(field, result.extraction[field])}
            />
          ))}
          <CharacterImportProficienciesPreviewSection result={result.extraction.proficiencies} />
        </div>
      </section>

      <CharacterImportDispositionReport dispositions={result.dispositions} />

      <CharacterImportUnmappedAlert coverage={result.coverage} />
    </div>
  )
}
