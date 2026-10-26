import { Text } from '@rpg/ui'
import type { CharacterImportCoverageEntry } from '@rpg/contracts/character-import'

import { CharacterImportSemanticText } from './character-import-semantic-text'
import { coverageStateTone, formatCoverageStateLabel } from '../model/character-import-preview.lib'

export type CharacterImportCoverageListProps = {
  entries: CharacterImportCoverageEntry[]
}

export function CharacterImportCoverageList({ entries }: CharacterImportCoverageListProps) {
  return (
    <ul className="mt-2 flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.targetPath} className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <Text variant="emphasis">{entry.targetPath}</Text>
            <CharacterImportSemanticText
              typography="caption"
              tone={coverageStateTone(entry.state)}
              emphasis="low"
            >
              {formatCoverageStateLabel(entry.state)}
            </CharacterImportSemanticText>
          </div>
          <CharacterImportSemanticText typography="caption" tone="neutral" emphasis="low">
            {entry.reason}
          </CharacterImportSemanticText>
        </li>
      ))}
    </ul>
  )
}
