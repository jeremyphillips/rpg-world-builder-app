import { DEFAULT_RESOLUTION_TARGET, ensureOutcomeSlotsForMethod } from '@rpg/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const SAVING_THROW = { kind: 'saving-throw', ability: 'dex' } as const

/** Ensures failed and successful outcome lists exist before the editor mounts. */
export function withSaveOutcomeSlots<T extends Record<string, unknown>>(action: T): T {
  if (action.kind !== 'save' || !isRecord(action.resolution)) return action
  const outcomes = Array.isArray(action.resolution.outcomes) ? action.resolution.outcomes : []
  return {
    ...action,
    resolution: {
      ...action.resolution,
      outcomes: ensureOutcomeSlotsForMethod(SAVING_THROW, outcomes, (result) => ({
        result,
        effects: [],
      })),
    },
  }
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
