/**
 * Campaign authorization context for content discovery and saved-reference reads.
 *
 * `pc.characterIds` holds pre-resolved viewer PC ids (controlledCharacterIds ∩
 * open participations). Per-character surfaces pass a single id via
 * `SavedContentReferenceContext`.
 */
export type ContentViewer =
  | { kind: 'manage' }
  | { kind: 'pc'; characterIds: readonly string[] }
  | { kind: 'none' }

/** Saved-character reference scope — grants read independent of discovery policy. */
export type SavedContentReferenceContext = {
  characterId: string
}

/**
 * Whether a saved-character reference may be resolved for display. Campaign access
 * controls new discovery — it does not revoke reads for content already on a
 * saved character sheet.
 */
export function canResolveSavedContentReference(
  viewer: ContentViewer,
  reference: SavedContentReferenceContext,
): boolean {
  if (viewer.kind === 'manage') {
    return true
  }

  return viewer.kind === 'pc' && viewer.characterIds.includes(reference.characterId)
}
