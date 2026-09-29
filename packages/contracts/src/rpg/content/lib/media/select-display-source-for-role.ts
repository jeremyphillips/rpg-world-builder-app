import type { ContentMedia } from '../../../primitives/media/content-media'
import { roleAssignmentMatchesSelection } from '../../../primitives/media/content-media-source'
import type { MediaRole } from '../../../primitives/media/roles'
import type { AvailableContentMediaSource } from './resolve-available-content-media-sources'

export type SelectDisplaySourceForRoleResult = {
  source?: AvailableContentMediaSource
  assignedSourceMissing?: boolean
}

function sourceMatchesRoleAssignment(
  source: AvailableContentMediaSource,
  media: ContentMedia,
  role: MediaRole,
): boolean {
  const assignment = media.roles[role]
  if (!assignment) return false
  return roleAssignmentMatchesSelection(assignment, source.id)
}

function findFallbackSystemSourceForRole(
  sources: readonly AvailableContentMediaSource[],
  role: MediaRole,
): AvailableContentMediaSource | undefined {
  return sources.find(
    (source) =>
      source.sourceKind === 'system' &&
      (source.availableRoles.includes(role) ||
        source.assignments.some((entry) => entry.role === role && entry.state === 'derived')),
  )
}

/** Pick the display source for one role from canonical availability (layer 3 helper). */
export function selectDisplaySourceForRole(input: {
  sources: readonly AvailableContentMediaSource[]
  media?: ContentMedia | null
  role: MediaRole
}): SelectDisplaySourceForRoleResult {
  const { sources, media, role } = input
  const persistedAssignment = media?.roles[role]

  if (persistedAssignment) {
    const matched = sources.find((source) => sourceMatchesRoleAssignment(source, media!, role))
    if (matched) {
      return { source: matched }
    }
  }

  const derived = findFallbackSystemSourceForRole(sources, role)
  if (derived) {
    return {
      source: derived,
      assignedSourceMissing: persistedAssignment ? true : undefined,
    }
  }

  if (persistedAssignment) {
    return { assignedSourceMissing: true }
  }

  return {}
}
