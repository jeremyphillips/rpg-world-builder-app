import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  CharacterBuildFinalizationError,
  finalizeNpcCharacterBuild,
  isCharacterBuildFinalizationError,
  resolveAutomaticNpcBuild,
  resolveCharacterBuildAdvisoriesForDraft,
  type AutomaticNpcBuildConstraints,
  type AutomaticNpcBuildPreferences,
  type AutomaticNpcBuildSeed,
  type CharacterBuildAdvisory,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
  type ClassPackageChoice,
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
  membershipTitleId?: string
}

function withMembershipConnection(
  draft: CharacterBuilderDraft,
  membership: QuickNpcMembership,
): CharacterBuilderDraft {
  const preservedEdges = draft.relationshipEdges.filter(
    (edge) => edge.kind !== 'organizationMembership',
  )

  return {
    ...draft,
    relationshipEdges: [
      ...preservedEdges,
      {
        id: crypto.randomUUID(),
        kind: 'organizationMembership',
        characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
        organizationId: membership.organizationId,
        ...(membership.membershipTitleId !== undefined
          ? {
              details: {
                lifecycle: 'current' as const,
                membershipTitleId: membership.membershipTitleId,
              },
            }
          : {}),
      },
    ],
  }
}

export type QuickNpcPrepareCreateArgs = {
  seed: AutomaticNpcBuildSeed
  context: CharacterBuildContext
  constraints?: AutomaticNpcBuildConstraints
  preferences?: AutomaticNpcBuildPreferences
  allowanceSelections?: Record<string, readonly string[]>
  classPackage?: ClassPackageChoice
  pinnedChoiceSetIds?: readonly string[]
  startingEquipmentGrants?: readonly { equipmentId: string; quantity: number }[]
  membership?: QuickNpcMembership
  /** Seeded draft when automatic resolution fails — used for preview projection. */
  fallbackDraft?: CharacterBuilderDraft
  fallbackResolvedChoiceSets?: readonly ChoiceSet[]
  /** Starting-choice issues prepended before automatic build issues. */
  startingChoiceIssues?: readonly CharacterBuildValidationIssue[]
}

export type QuickNpcPreparedCreate = {
  draft: CharacterBuilderDraft
  input: CreateNpcRequestInput
  resolvedChoiceSets: readonly ChoiceSet[]
  advisories: readonly CharacterBuildAdvisory[]
}

export type QuickNpcPreparedDraft = {
  ok: boolean
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  issues: CharacterBuildValidationIssue[]
  /** Non-blocking advisories for the returned draft; `[]` when its class is unresolved. */
  advisories: readonly CharacterBuildAdvisory[]
}

function withAdvisories(
  prepared: Omit<QuickNpcPreparedDraft, 'advisories'>,
  context: CharacterBuildContext,
): QuickNpcPreparedDraft {
  return {
    ...prepared,
    advisories: resolveCharacterBuildAdvisoriesForDraft(prepared.draft, context, {
      resolvedChoiceSets: prepared.resolvedChoiceSets,
    }),
  }
}

/**
 * Deterministically resolves the Quick NPC draft used by preview and create.
 * Applies starting-choice issues first, then {@link resolveAutomaticNpcBuild},
 * then optional organization membership on success.
 */
// fallow-ignore-next-line complexity
export function resolveQuickNpcPreparedDraft(
  args: QuickNpcPrepareCreateArgs,
): QuickNpcPreparedDraft {
  const startingIssues = [...(args.startingChoiceIssues ?? [])]
  const resolution = resolveAutomaticNpcBuild({
    seed: args.seed,
    context: args.context,
    ...(args.constraints ? { constraints: args.constraints } : {}),
    ...(args.preferences ? { preferences: args.preferences } : {}),
    ...(args.allowanceSelections ? { allowanceSelections: args.allowanceSelections } : {}),
    ...(args.classPackage ? { classPackage: args.classPackage } : {}),
    ...(args.pinnedChoiceSetIds?.length ? { pinnedChoiceSetIds: args.pinnedChoiceSetIds } : {}),
    ...(args.startingEquipmentGrants?.length
      ? { startingEquipmentGrants: args.startingEquipmentGrants }
      : {}),
  })

  const fallbackDraft = args.fallbackDraft
  const fallbackChoiceSets = args.fallbackResolvedChoiceSets ?? []

  if (!resolution.ok) {
    if (!fallbackDraft) {
      throw new CharacterBuildFinalizationError([...startingIssues, ...resolution.issues])
    }
    return withAdvisories(
      {
        ok: false,
        draft: fallbackDraft,
        resolvedChoiceSets: fallbackChoiceSets,
        issues: [...startingIssues, ...resolution.issues],
      },
      args.context,
    )
  }

  if (startingIssues.length > 0) {
    return withAdvisories(
      {
        ok: false,
        draft: fallbackDraft ?? resolution.draft,
        resolvedChoiceSets: resolution.resolvedChoiceSets,
        issues: startingIssues,
      },
      args.context,
    )
  }

  const draft = args.membership
    ? withMembershipConnection(resolution.draft, args.membership)
    : resolution.draft

  return withAdvisories(
    { ok: true, draft, resolvedChoiceSets: resolution.resolvedChoiceSets, issues: [] },
    args.context,
  )
}

export function prepareQuickNpcCreate(args: QuickNpcPrepareCreateArgs): QuickNpcPreparedCreate {
  const prepared = resolveQuickNpcPreparedDraft(args)
  if (!prepared.ok) {
    throw new CharacterBuildFinalizationError(prepared.issues)
  }

  const input = finalizeNpcCharacterBuild(prepared.draft, args.context, {
    resolvedChoiceSets: prepared.resolvedChoiceSets,
  })

  return {
    draft: prepared.draft,
    input,
    resolvedChoiceSets: prepared.resolvedChoiceSets,
    advisories: prepared.advisories,
  }
}

/**
 * Builds the `POST /api/campaigns/:id/npcs` payload from a Quick NPC seed.
 * Throws {@link CharacterBuildFinalizationError} carrying builder validation
 * issues when automatic resolution or finalization fails — no partial NPC is
 * ever produced.
 */
export function buildQuickNpcCreateInput(args: QuickNpcPrepareCreateArgs): CreateNpcRequestInput {
  return prepareQuickNpcCreate(args).input
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
