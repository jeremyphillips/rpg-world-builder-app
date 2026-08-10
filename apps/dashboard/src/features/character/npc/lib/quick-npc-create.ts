import {
  CharacterBuildFinalizationError,
  finalizeNpcCharacterBuild,
  isCharacterBuildFinalizationError,
  resolveAutomaticNpcBuild,
  type AutomaticNpcBuildSeed,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CreateNpcRequestInput,
} from '@rpg/contracts'

// ---------------------------------------------------------------------------
// Quick NPC assembly — automatic build resolution, contextual membership
// injection, then the ONE authoritative finalSubmit validation inside the
// canonical finalize path. The persisted NPC is indistinguishable from a
// builder-created one.
// ---------------------------------------------------------------------------

export type QuickNpcMembership = {
  organizationId: string
  title?: string
  priority?: number
}

function withMembershipConnection(
  draft: CharacterBuilderDraft,
  membership: QuickNpcMembership,
): CharacterBuilderDraft {
  return {
    ...draft,
    connections: {
      ...draft.connections,
      organizations: [
        {
          organizationId: membership.organizationId,
          ...(membership.title !== undefined ? { title: membership.title } : {}),
          ...(membership.priority !== undefined ? { priority: membership.priority } : {}),
        },
      ],
    },
  }
}

/**
 * Builds the `POST /api/campaigns/:id/npcs` payload from a Quick NPC seed.
 * Throws {@link CharacterBuildFinalizationError} carrying builder validation
 * issues when automatic resolution or finalization fails — no partial NPC is
 * ever produced.
 */
export function buildQuickNpcCreateInput(args: {
  seed: AutomaticNpcBuildSeed
  context: CharacterBuildContext
  membership?: QuickNpcMembership
}): CreateNpcRequestInput {
  const resolution = resolveAutomaticNpcBuild(args.seed, args.context)
  if (!resolution.ok) {
    throw new CharacterBuildFinalizationError(resolution.issues)
  }

  const draft = args.membership
    ? withMembershipConnection(resolution.draft, args.membership)
    : resolution.draft

  return finalizeNpcCharacterBuild(draft, args.context, {
    resolvedChoiceSets: resolution.resolvedChoiceSets,
  })
}

const MAX_QUICK_NPC_ISSUE_MESSAGES = 3

/**
 * Maps builder validation issues to a single inline form error using the
 * existing issue messages. Returns undefined for non-builder errors so
 * callers fall back to their generic failure copy.
 */
export function formatQuickNpcCreationError(error: unknown): string | undefined {
  if (!isCharacterBuildFinalizationError(error)) return undefined

  const messages = [...new Set(error.validationIssues.map((issue) => issue.message))]
  if (messages.length === 0) return undefined

  const shown = messages.slice(0, MAX_QUICK_NPC_ISSUE_MESSAGES)
  const remaining = messages.length - shown.length
  return remaining > 0 ? `${shown.join(' ')} (+${remaining} more)` : shown.join(' ')
}
