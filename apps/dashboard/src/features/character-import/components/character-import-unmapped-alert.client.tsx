'use client'

import { Alert } from '@rpg/ui'
import type { CharacterImportCoverageEntry } from '@rpg/contracts/character-import'

import { partitionCoverageEntries } from '../model/character-import-preview.lib'
import { CharacterImportCoverageList } from './character-import-coverage-list.client'

export type CharacterImportUnmappedAlertProps = {
  coverage: CharacterImportCoverageEntry[]
}

/** Summarizes create-input gaps separately from extraction failures. */
export function CharacterImportUnmappedAlert({ coverage }: CharacterImportUnmappedAlertProps) {
  const { readiness, providedWhenSaved } = partitionCoverageEntries(coverage)
  const blocking = readiness.filter(
    (entry) => entry.state !== 'mapped' && entry.state !== 'not-applicable',
  )

  if (blocking.length === 0 && providedWhenSaved.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {blocking.length > 0 ? (
        <Alert
          variant="destructive"
          title="Import readiness"
          description="These fields are still required before a local character can be created."
        >
          <CharacterImportCoverageList entries={blocking} />
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
