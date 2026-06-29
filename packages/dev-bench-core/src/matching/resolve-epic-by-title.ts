import type { Epic } from '@rpg/contracts/dev-bench'

import { normalizeEpicTitle } from '../aggregation/epic-aggregation'

export type EpicResolutionErrorCode = 'AMBIGUOUS_EPIC' | 'EPIC_NOT_FOUND'

export class EpicResolutionError extends Error {
  readonly code: EpicResolutionErrorCode
  readonly details?: unknown

  constructor(code: EpicResolutionErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'EpicResolutionError'
    this.code = code
    this.details = details
  }
}

export interface EpicQueryReference {
  epicId?: string
  epicName?: string
}

export function findEpicsByTitle(epics: Epic[], epicName: string): Epic[] {
  const normalizedName = normalizeEpicTitle(epicName)
  return epics.filter((epic) => normalizeEpicTitle(epic.title) === normalizedName)
}

/** Strict epic lookup for list/query contexts — throws when ambiguous or not found. */
export function resolveEpicIdForQuery(
  input: EpicQueryReference,
  epics: Epic[],
): string | undefined {
  if (input.epicId) {
    return input.epicId
  }

  if (!input.epicName) {
    return undefined
  }

  const matches = findEpicsByTitle(epics, input.epicName)

  if (matches.length > 1) {
    throw new EpicResolutionError(
      'AMBIGUOUS_EPIC',
      `Multiple epics match epicName "${input.epicName}".`,
      { matches: matches.map((epic) => ({ id: epic.id, title: epic.title })) },
    )
  }

  if (matches.length === 0) {
    throw new EpicResolutionError('EPIC_NOT_FOUND', `No epic matched epicName "${input.epicName}".`)
  }

  return matches[0]!.id
}
