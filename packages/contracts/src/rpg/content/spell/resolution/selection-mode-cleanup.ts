import type { ResolutionPatch, ResolutionSelectionState } from './selection-types'

const CLEAR_TARGET_SELECTION: ResolutionPatch = {
  targetCount: undefined,
  countKind: undefined,
  targetKind: undefined,
  proximityKind: undefined,
  proximityDistanceFt: undefined,
  proximityReachDistanceFt: undefined,
}

function inferLegacySelectionMode(
  state: ResolutionSelectionState,
): NonNullable<ResolutionSelectionState['selectionMode']> {
  if (state.proximityKind === 'self') return 'self'
  if (state.originDistanceFt !== undefined) return 'point'
  return 'targets'
}

function buildTargetsModeCleanup(
  before: ResolutionSelectionState,
  previousMode: NonNullable<ResolutionSelectionState['selectionMode']>,
): ResolutionPatch {
  const patch: ResolutionPatch = { originDistanceFt: undefined }

  if (previousMode === 'point') {
    patch.hasAreaOfEffect = false
    patch.areaOfEffectShape = undefined
  }
  if (before.targetCount === undefined) patch.targetCount = 1
  if (before.countKind === undefined) patch.countKind = 'exact'
  if (before.proximityKind === undefined || before.proximityKind === 'self') {
    patch.proximityKind = 'touch'
  }

  return patch
}

function buildSelfModeCleanup(
  previousMode: NonNullable<ResolutionSelectionState['selectionMode']>,
): ResolutionPatch {
  const patch: ResolutionPatch = { ...CLEAR_TARGET_SELECTION }
  if (previousMode === 'point') patch.originDistanceFt = undefined
  return patch
}

/** Clears fields incompatible with the next selection mode. */
export function buildSelectionModeCleanupPatch(
  before: ResolutionSelectionState,
  nextMode: NonNullable<ResolutionSelectionState['selectionMode']>,
): ResolutionPatch {
  const previousMode = before.selectionMode ?? inferLegacySelectionMode(before)

  switch (nextMode) {
    case 'targets':
      return buildTargetsModeCleanup(before, previousMode)
    case 'point':
      return { ...CLEAR_TARGET_SELECTION }
    case 'self':
      return buildSelfModeCleanup(previousMode)
    case 'none':
      return {
        ...CLEAR_TARGET_SELECTION,
        originDistanceFt: undefined,
        hasAreaOfEffect: false,
        areaOfEffectShape: undefined,
      }
    default: {
      const _exhaustive: never = nextMode
      return _exhaustive
    }
  }
}
