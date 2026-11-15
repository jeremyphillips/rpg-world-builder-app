import { DEFAULT_RESOLUTION_TARGET } from '@rpg/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Seeds creature target defaults when a save uses targets mode but has no target yet. */
export function withDefaultSaveResolutionTarget<T extends Record<string, unknown>>(action: T): T {
  if (action.kind !== 'save') return action
  const resolution = action.resolution
  if (!isRecord(resolution) || resolution.selectionMode !== 'targets') return action
  if (isRecord(resolution.target)) return action
  return {
    ...action,
    resolution: {
      ...resolution,
      target: { ...DEFAULT_RESOLUTION_TARGET },
    },
  }
}
