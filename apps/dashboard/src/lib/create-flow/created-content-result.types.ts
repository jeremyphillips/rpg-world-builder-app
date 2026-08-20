/** Canonical nested-create handoff payload after persistence succeeds. */
export type CreatedContentResult =
  | { contentType: 'organizations'; id: string }
  | { contentType: 'locations'; id: string }
  | { contentType: 'npcs'; id: string }

/**
 * Post-persist caller handoff. Resolves when handoff completes successfully.
 *
 * Semantics: persist succeeds first; the callback runs query refresh, drawer selection, or other
 * caller-owned wiring. Modal close and success chrome run only after this promise resolves.
 * Rejects when handoff fails — the entity already exists; callers must not retry persistence.
 *
 * @see apps/dashboard/docs/create-flow.md §OnContentCreated handoff
 */
export type OnContentCreated = (result: CreatedContentResult) => void | Promise<void>

/**
 * Awaits caller handoff after persistence. Rejects on handoff failure without re-persisting.
 * Create modals and nested picker hooks surface `formatNestedCreateHandoffFailure(err)` on reject.
 */
export async function invokeOnContentCreated(
  onCreated: OnContentCreated | undefined,
  result: CreatedContentResult,
): Promise<void> {
  await onCreated?.(result)
}
