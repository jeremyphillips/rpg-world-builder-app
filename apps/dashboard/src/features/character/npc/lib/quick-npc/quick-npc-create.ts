import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  CharacterBuildFinalizationError,
  ensureEquipmentGrant,
  finalizeNpcCharacterBuild,
  indexCharacterBuildCatalog,
  isCharacterBuildFinalizationError,
  resolveAutomaticNpcBuild,
  type AutomaticNpcBuildConstraints,
  type AutomaticNpcBuildPreferences,
  type AutomaticNpcBuildSeed,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
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
  manualEquipmentGrantIds?: readonly string[]
  /**
   * Selected starting equipment to materialize onto `draft.equipment.grants`.
   * These rows are inventory, not immutable grants.
   */
  startingEquipmentGrants?: readonly { equipmentId: string; quantity: number }[]
  membership?: QuickNpcMembership
}

export type QuickNpcPreparedCreate = {
  draft: CharacterBuilderDraft
  input: CreateNpcRequestInput
  resolvedChoiceSets: readonly ChoiceSet[]
}

/**
 * Resolves the automatic build once, then finalizes to the wire input and returns
 * the final draft for narrative context (same membership + choice resolution).
 */
export function materializeStartingEquipmentGrants(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  grants: readonly { equipmentId: string; quantity: number }[] | undefined,
): CharacterBuilderDraft {
  if (!grants || grants.length === 0) return draft
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  let next = draft
  for (const grant of grants) {
    const applied = ensureEquipmentGrant({
      draft: next,
      equipmentId: grant.equipmentId,
      quantity: grant.quantity,
      catalogIndex,
      contribution: 'additional',
    })
    if (applied.ok) next = applied.draft
  }
  return next
}

export function prepareQuickNpcCreate(args: QuickNpcPrepareCreateArgs): QuickNpcPreparedCreate {
  const resolution = resolveAutomaticNpcBuild({
    seed: args.seed,
    context: args.context,
    ...(args.constraints ? { constraints: args.constraints } : {}),
    ...(args.preferences ? { preferences: args.preferences } : {}),
    ...(args.allowanceSelections ? { allowanceSelections: args.allowanceSelections } : {}),
    ...(args.manualEquipmentGrantIds
      ? { manualEquipmentGrantIds: args.manualEquipmentGrantIds }
      : {}),
  })
  if (!resolution.ok) {
    throw new CharacterBuildFinalizationError(resolution.issues)
  }

  let draft = args.membership
    ? withMembershipConnection(resolution.draft, args.membership)
    : resolution.draft
  draft = materializeStartingEquipmentGrants(draft, args.context, args.startingEquipmentGrants)

  const input = finalizeNpcCharacterBuild(draft, args.context, {
    resolvedChoiceSets: resolution.resolvedChoiceSets,
  })

  return { draft, input, resolvedChoiceSets: resolution.resolvedChoiceSets }
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

export class QuickNpcStartingChoiceIncompleteError extends Error {
  constructor() {
    super('Choose the required number of starting choices before creating this NPC.')
    this.name = 'QuickNpcStartingChoiceIncompleteError'
  }
}

/**
 * Maps builder validation issues to a single inline form error using the
 * existing issue messages. Returns undefined for non-builder errors so
 * callers fall back to their generic failure copy.
 */
export function formatQuickNpcCreationError(error: unknown): string | undefined {
  if (error instanceof QuickNpcStartingChoiceIncompleteError) return error.message
  if (!isCharacterBuildFinalizationError(error)) return undefined

  const messages = [...new Set(error.validationIssues.map((issue) => issue.message))]
  if (messages.length === 0) return undefined

  const shown = messages.slice(0, MAX_QUICK_NPC_ISSUE_MESSAGES)
  const remaining = messages.length - shown.length
  return remaining > 0 ? `${shown.join(' ')} (+${remaining} more)` : shown.join(' ')
}
