/** Canonical nested-create handoff payload after persistence succeeds. */
export type CreatedContentResult =
  | { contentType: 'organizations'; id: string }
  | { contentType: 'locations'; id: string }
  | { contentType: 'npcs'; id: string }

/**
 * Post-persist caller handoff. Resolves when handoff completes successfully.
 * Rejects when handoff fails — the entity already exists; do not retry persistence.
 */
export type OnContentCreated = (result: CreatedContentResult) => void | Promise<void>

/** Awaits caller handoff after persistence. Rejects on handoff failure without re-persisting. */
export async function invokeOnContentCreated(
  onCreated: OnContentCreated | undefined,
  result: CreatedContentResult,
): Promise<void> {
  await onCreated?.(result)
}
