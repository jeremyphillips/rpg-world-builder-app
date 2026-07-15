import type { AreaGeometry } from '../../../primitives/area-geometry'
import type { Spell } from '../body'
import type {
  SpellResolutionExternalProximityKind,
  SpellResolutionSelectionMode,
  SpellResolutionTargetCountKind,
  SpellResolutionTargetKind,
} from './vocab'
import { inferSpellResolutionTargetCountKind } from './vocab'

type SpellResolutionDistance = { value: number; unit: 'ft' }

type LegacyTargetProximity =
  | { kind: 'self' }
  | { kind: SpellResolutionExternalProximityKind; distance?: SpellResolutionDistance }
  | { kind: 'reach'; distance?: SpellResolutionDistance }
  | { kind: 'distance'; distance: SpellResolutionDistance }

type LegacyResolutionTarget = {
  count: number
  countKind?: SpellResolutionTargetCountKind
  kind: SpellResolutionTargetKind
  proximity: LegacyTargetProximity
}

type LegacyResolutionOrigin = {
  proximity: { kind: 'distance'; distance: SpellResolutionDistance }
}

type LegacyResolutionInput = {
  selectionMode?: SpellResolutionSelectionMode
  target?: LegacyResolutionTarget
  origin?: LegacyResolutionOrigin
  areaOfEffect?: AreaGeometry
  method: unknown
  applicationPattern?: unknown
  effects: unknown[]
  outcomes: unknown[]
}

function stripLegacySelfTarget(
  target: LegacyResolutionTarget | undefined,
): LegacyResolutionTarget | undefined {
  if (!target) return undefined
  if (target.proximity.kind === 'self') return undefined
  return target
}

function inferSelectionModeFromLegacy(input: LegacyResolutionInput): SpellResolutionSelectionMode {
  if (input.selectionMode) return input.selectionMode

  if (input.target?.proximity.kind === 'self') return 'self'
  if (input.origin) return 'point'
  if (input.target) return 'targets'
  return 'none'
}

function normalizeTargetForMode(
  mode: SpellResolutionSelectionMode,
  target: LegacyResolutionTarget | undefined,
): LegacyResolutionTarget | undefined {
  const stripped = stripLegacySelfTarget(target)
  if (mode !== 'targets') return undefined
  if (!stripped) return undefined

  return {
    ...stripped,
    countKind: inferSpellResolutionTargetCountKind(stripped.count, stripped.countKind),
  }
}

function normalizeOriginForMode(
  mode: SpellResolutionSelectionMode,
  origin: LegacyResolutionOrigin | undefined,
): LegacyResolutionOrigin | undefined {
  if (mode !== 'point') return undefined
  return origin
}

function normalizeAreaForMode(
  mode: SpellResolutionSelectionMode,
  areaOfEffect: AreaGeometry | undefined,
): AreaGeometry | undefined {
  if (mode !== 'self' && mode !== 'point') return undefined
  return areaOfEffect
}

/** Normalizes legacy target.self and infers selection mode before schema validation. */
export function normalizeSpellResolutionInput(input: LegacyResolutionInput): LegacyResolutionInput {
  const selectionMode = inferSelectionModeFromLegacy(input)

  return {
    ...input,
    selectionMode,
    target: normalizeTargetForMode(selectionMode, input.target),
    origin: normalizeOriginForMode(selectionMode, input.origin),
    areaOfEffect: normalizeAreaForMode(selectionMode, input.areaOfEffect),
  }
}

export type InferPointResolutionFromSpellInput = Pick<Spell, 'range' | 'areaOfEffect'> & {
  method: { kind: string }
}

/**
 * Catalog migration helper — infers point selection from spell metadata.
 * Not used by preview formatters (resolution fields are authoritative).
 */
export function inferPointSelectionModeFromSpell(
  spell: InferPointResolutionFromSpellInput,
): SpellResolutionSelectionMode | undefined {
  if (spell.range.kind !== 'distance') return undefined
  if (!spell.areaOfEffect) return undefined
  if (spell.method.kind !== 'saving-throw') return undefined
  return 'point'
}

/** Builds a default origin from spell range distance for point-mode migrations. */
export function defaultOriginFromSpellRange(
  spell: Pick<Spell, 'range'>,
): LegacyResolutionOrigin | undefined {
  if (spell.range.kind !== 'distance') return undefined
  return {
    proximity: {
      kind: 'distance',
      distance: { value: spell.range.value.value, unit: 'ft' },
    },
  }
}
