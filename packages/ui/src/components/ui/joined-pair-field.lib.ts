import type {
  JoinedPairEndOccupantConfig,
  JoinedPairOccupantsConfig,
  JoinedPairStartOccupantConfig,
} from './joined-pair-field.types'

const ALLOWED_COMPOSITIONS: ReadonlySet<string> = new Set([
  'number:select',
  'select:select',
  'select:label',
])

function occupantKindKey(
  occupant: JoinedPairStartOccupantConfig | JoinedPairEndOccupantConfig,
): string {
  return occupant.kind
}

/** Validates start/end occupant combinations allowed by the joined-pair contract. */
export function assertAllowedJoinedPairComposition(occupants: JoinedPairOccupantsConfig): void {
  const key = `${occupantKindKey(occupants.start)}:${occupantKindKey(occupants.end)}`
  if (!ALLOWED_COMPOSITIONS.has(key)) {
    throw new Error(
      `JoinedPair: unsupported occupant composition "${key}". Allowed: number+select, select+select, select+label.`,
    )
  }
}

/** Bound RHF paths from named occupants in a joined pair. */
export function joinedPairBoundNames(occupants: JoinedPairOccupantsConfig): string[] {
  const names: string[] = [occupants.start.name]
  if (occupants.end.kind === 'select') {
    names.push(occupants.end.name)
  }
  return names
}
