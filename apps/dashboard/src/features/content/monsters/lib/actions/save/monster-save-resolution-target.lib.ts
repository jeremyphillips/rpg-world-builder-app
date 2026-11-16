import { DEFAULT_RESOLUTION_TARGET, ensureOutcomeSlotsForMethod } from '@rpg/contracts'

type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

type SaveResolutionCarrier = {
  kind?: unknown
  resolution?: unknown
}

const SAVING_THROW = { kind: 'saving-throw', ability: 'dex' } as const

/** Ensures failed and successful outcome lists exist before the editor mounts. */
export function withSaveOutcomeSlots<T extends SaveResolutionCarrier>(action: T): T {
  if (action.kind !== 'save' || !isPlainObject(action.resolution)) return action
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
export function withDefaultSaveResolutionTarget<T extends SaveResolutionCarrier>(action: T): T {
  if (action.kind !== 'save') return action
  const resolution = action.resolution
  if (!isPlainObject(resolution) || resolution.selectionMode !== 'targets') return action
  if (isPlainObject(resolution.target)) return action
  return {
    ...action,
    resolution: {
      ...resolution,
      target: { ...DEFAULT_RESOLUTION_TARGET },
    },
  }
}
