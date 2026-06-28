import type { Epic } from '@rpg/contracts/dev-bench'
import { normalizeEpicTitle } from '@rpg/dev-bench-core'

import { CliError } from './errors'

export interface EpicResolutionInput {
  epicId?: string | null
  epicName?: string
}

export interface EpicResolutionResult {
  epicId: string | null | undefined
  warnings: string[]
}

export function resolveEpicReference(
  input: EpicResolutionInput,
  epics: Epic[],
): EpicResolutionResult {
  const warnings: string[] = []

  if (input.epicId) {
    return { epicId: input.epicId, warnings }
  }

  if (!input.epicName) {
    return { epicId: input.epicId ?? null, warnings }
  }

  const normalizedName = normalizeEpicTitle(input.epicName)
  const matches = epics.filter((epic) => normalizeEpicTitle(epic.title) === normalizedName)

  if (matches.length > 1) {
    throw new CliError('AMBIGUOUS_EPIC', `Multiple epics match epicName "${input.epicName}".`, {
      matches: matches.map((epic) => ({ id: epic.id, title: epic.title })),
    })
  }

  if (matches.length === 0) {
    warnings.push(`No epic matched epicName "${input.epicName}"; ticket created without epic.`)
    return { epicId: null, warnings }
  }

  return { epicId: matches[0]!.id, warnings }
}
