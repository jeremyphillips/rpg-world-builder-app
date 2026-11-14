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

export function lowestNumericPreset(
  options: readonly { value: string | number }[],
): number | undefined {
  const values = options.flatMap((option) =>
    typeof option.value === 'number' ? [option.value] : [],
  )
  if (values.length === 0) return undefined
  return Math.min(...values)
}

/** Integers the custom number input may commit. In-progress text is not a commit. */
export function isJoinedPairCustomAmountInBounds(
  value: number,
  customMin: number,
  customMax?: number,
): boolean {
  return (
    Number.isInteger(value) && value >= customMin && (customMax === undefined || value <= customMax)
  )
}

/** Value to store when Custom is chosen. `keep` leaves an in-bounds custom number alone. */
export function customJoinedPairSelection(input: {
  value: string | number | undefined
  options: readonly { value: string | number }[]
  customMin: number
  customMax?: number
}): { keep: true } | { write: number } {
  const keepsCurrent =
    typeof input.value === 'number' &&
    !input.options.some((option) => option.value === input.value) &&
    isJoinedPairCustomAmountInBounds(input.value, input.customMin, input.customMax)
  if (keepsCurrent) return { keep: true }
  const lowest = lowestNumericPreset(input.options)
  if (lowest === undefined || input.value === lowest) return { keep: true }
  return { write: lowest }
}
