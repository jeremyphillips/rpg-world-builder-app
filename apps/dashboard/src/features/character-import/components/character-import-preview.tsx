import type { CharacterImportResult } from '@rpg/contracts/character-import'
import { Heading, Panel } from '@rpg/ui'

import {
  EXTRACTION_FIELD_KEYS,
  EXTRACTION_FIELD_LABELS,
  formatExtractionDisplayValue,
} from '../model/character-import-preview.lib'
import { CharacterImportPreviewRow } from './character-import-preview-row'
import { CharacterImportEquipmentPreviewSection } from './character-import-equipment-preview'
import { CharacterImportNarrativePreviewSection } from './character-import-narrative-preview'
import { CharacterImportSpellsPreviewSection } from './character-import-spells-preview'
import { CharacterImportProficienciesPreviewSection } from './character-import-proficiencies-preview'
import { CharacterImportDispositionReport } from './character-import-disposition-report'
import { CharacterImportUnmappedAlert } from './character-import-unmapped-alert'

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
        <Panel tone="subtle" density="compact" className="mt-3">
          {EXTRACTION_FIELD_KEYS.map((field) => (
            <CharacterImportPreviewRow
              key={field}
              field={field}
              label={EXTRACTION_FIELD_LABELS[field]}
              result={result.extraction[field]}
              displayValue={formatExtractionDisplayValue(field, result.extraction[field])}
            />
          ))}
          <CharacterImportNarrativePreviewSection result={result.extraction.narrative} />
          <CharacterImportEquipmentPreviewSection result={result.extraction.equipment} />
          <CharacterImportSpellsPreviewSection result={result.extraction.spells} />
          <CharacterImportProficienciesPreviewSection result={result.extraction.proficiencies} />
        </Panel>
      </section>

      <CharacterImportDispositionReport dispositions={result.dispositions} />

      <CharacterImportUnmappedAlert coverage={result.coverage} />
    </div>
  )
}
