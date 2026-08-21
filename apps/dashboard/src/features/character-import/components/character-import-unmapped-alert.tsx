import { Alert, Text } from '@rpg/ui'
import type { CharacterImportCoverageEntry } from '@rpg/contracts/character-import'

import {
  partitionCoverageEntries,
  groupCoverageEntries,
} from '../model/character-import-preview.lib'
import { CharacterImportCoverageList } from './character-import-coverage-list'

export type CharacterImportUnmappedAlertProps = {
  coverage: CharacterImportCoverageEntry[]
}

/** Summarizes create-input gaps separately from extraction failures. */
export function CharacterImportUnmappedAlert({ coverage }: CharacterImportUnmappedAlertProps) {
  const { readiness, providedWhenSaved } = partitionCoverageEntries(coverage)
  const blockingGroups = groupCoverageEntries(
    readiness.filter((entry) => entry.state === 'unresolved-reference'),
  )
  const deferredGroups = groupCoverageEntries(
    readiness.filter((entry) => entry.state === 'deferred'),
  )

  if (
    blockingGroups.length === 0 &&
    deferredGroups.length === 0 &&
    providedWhenSaved.length === 0
  ) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {blockingGroups.length > 0 ? (
        <Alert
          variant="destructive"
          title="Import readiness"
          description="These fields still need catalog resolution before a local character can be created."
        >
          <div className="mt-2 flex flex-col gap-4">
            {blockingGroups.map((group) => (
              <div key={group.id}>
                <Text variant="emphasis">{group.label}</Text>
                <CharacterImportCoverageList entries={group.entries} />
              </div>
            ))}
          </div>
        </Alert>
      ) : null}

      {deferredGroups.length > 0 ? (
        <Alert
          variant="default"
          title="Deferred import fields"
          description="These values are not extracted yet or are chosen during save."
        >
          <div className="mt-2 flex flex-col gap-4">
            {deferredGroups.map((group) => (
              <div key={group.id}>
                <Text variant="emphasis">{group.label}</Text>
                <CharacterImportCoverageList entries={group.entries} />
              </div>
            ))}
          </div>
        </Alert>
      ) : null}

      {providedWhenSaved.length > 0 ? (
        <Alert
          variant="default"
          title="Provided when saved"
          description="The application assigns these values during character creation."
        >
          <CharacterImportCoverageList entries={providedWhenSaved} />
        </Alert>
      ) : null}
    </div>
  )
}
