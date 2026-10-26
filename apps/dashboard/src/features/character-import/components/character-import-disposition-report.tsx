import { Alert, Text } from '@rpg/ui'
import type { CharacterImportDispositionEntry } from '@rpg/contracts/character-import'

import { CharacterImportSemanticText } from './character-import-semantic-text'
import {
  formatDispositionSummary,
  partitionDispositionEntries,
} from '../model/character-import-preview.lib'

export type CharacterImportDispositionReportProps = {
  dispositions: CharacterImportDispositionEntry[]
}

function DispositionList({
  entries,
  title,
}: {
  entries: CharacterImportDispositionEntry[]
  title: string
}) {
  if (entries.length === 0) {
    return (
      <div>
        <Text variant="emphasis">{title}</Text>
        <CharacterImportSemanticText typography="caption" tone="neutral" emphasis="low">
          none
        </CharacterImportSemanticText>
      </div>
    )
  }

  return (
    <div>
      <Text variant="emphasis">{title}</Text>
      <ul className="mt-2 flex flex-col gap-2">
        {entries.map((entry) => (
          <li key={`${entry.sourcePath}:${entry.sourceValue}`}>
            <CharacterImportSemanticText typography="caption" tone="neutral" emphasis="medium">
              {formatDispositionSummary(entry)}
            </CharacterImportSemanticText>
            <CharacterImportSemanticText typography="caption" tone="neutral" emphasis="low">
              {entry.message}
            </CharacterImportSemanticText>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Development coverage for ignored and unsupported source fields. */
export function CharacterImportDispositionReport({
  dispositions,
}: CharacterImportDispositionReportProps) {
  const { ignored, unsupported } = partitionDispositionEntries(dispositions)

  if (ignored.length === 0 && unsupported.length === 0) {
    return null
  }

  return (
    <Alert
      variant="default"
      title="Source field dispositions"
      description="Explicit accounting for source values filtered out of the user-facing preview."
    >
      <div className="mt-2 flex flex-col gap-4">
        <DispositionList entries={ignored} title="Ignored source fields" />
        <DispositionList entries={unsupported} title="Unsupported source fields" />
      </div>
    </Alert>
  )
}
