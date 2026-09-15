import type { FieldWidth } from './field-control.variants'

/**
 * Width-token → CSS grid track resolver for anatomy rows.
 *
 * ## Flex semantics audit (SSOT for parity)
 *
 * Current `fieldWidthVariants` inside a flex `FieldRow` (`data-field-row`):
 *
 * | Token | Flex classes | Behavior |
 * | --- | --- | --- |
 * | `xs`–`xl` | `max-w-* flex-none in-data-[field-row]:w-*` | Fixed track: 4/6/9/12/16rem |
 * | `auto` | `w-fit flex-none` | Intrinsic content width |
 * | `full` | `w-full flex-1` | Grow weight 1; absorbs leftover free space |
 * | fractions | `basis-0 grow-[N] max-w-* min-w-0` | Base-12 grow weights; `max-w` caps lone / mixed cases |
 *
 * Fraction grow weights: `1/4`→3, `1/3`→4, `1/2`→6, `2/3`→8, `3/4`→9 (sum 12 = whole row).
 *
 * Flex redistributes free space when a growing item hits `max-width`. CSS grid `fr`
 * tracks do **not**. Parity rules below encode that difference without a phantom
 * filler track in the common cases.
 */

/** Fixed rem tracks for intrinsic `xs`–`xl` tokens (matches Tailwind `w-16`…`w-64`). */
export const FIELD_WIDTH_FIXED_TRACKS = {
  xs: '4rem',
  sm: '6rem',
  md: '9rem',
  lg: '12rem',
  xl: '16rem',
} as const satisfies Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>

/** Base-12 grow weights — same scale as flex `grow-[N]` on fractional tokens. */
export const FIELD_WIDTH_FRACTION_WEIGHTS = {
  '1/4': 3,
  '1/3': 4,
  '1/2': 6,
  '2/3': 8,
  '3/4': 9,
} as const satisfies Record<'1/4' | '1/3' | '1/2' | '2/3' | '3/4', number>

/** Percentage caps matching flex `max-w-*` on fractional tokens. */
export const FIELD_WIDTH_FRACTION_MAX_PERCENT = {
  '1/4': 25,
  '1/3': 33.3333,
  '1/2': 50,
  '2/3': 66.6667,
  '3/4': 75,
} as const satisfies Record<'1/4' | '1/3' | '1/2' | '2/3' | '3/4', number>

export type FieldWidthFraction = keyof typeof FIELD_WIDTH_FRACTION_WEIGHTS
export type FieldWidthFixed = keyof typeof FIELD_WIDTH_FIXED_TRACKS

export function isFieldWidthFraction(width: FieldWidth): width is FieldWidthFraction {
  return width in FIELD_WIDTH_FRACTION_WEIGHTS
}

export function isFieldWidthFixed(width: FieldWidth): width is FieldWidthFixed {
  return width in FIELD_WIDTH_FIXED_TRACKS
}

export type FieldRowColumnTrackStrategy =
  /** Fixed rem / max-content / 1fr only — no fraction special-casing. */
  | 'literal'
  /** Fractions use `Nfr` weights; complete or no competing `full`. */
  | 'fraction-fr'
  /**
   * Fractions use `minmax(0, P%)` so a sibling `full` (`1fr`) can absorb leftover
   * the way flex redistributes after `max-width` binds.
   */
  | 'fraction-max-percent'
  /**
   * Incomplete fraction set with no `full` — percentage-capped tracks leave trailing
   * free space (same visual as flex items capped by `max-w` without growing past it).
   * No phantom filler track.
   */
  | 'fraction-incomplete'

export interface ResolveFieldRowColumnTracksResult {
  /** Values for `grid-template-columns` (one track per field, same order). */
  tracks: string[]
  /** Serialized `grid-template-columns` value. */
  gridTemplateColumns: string
  strategy: FieldRowColumnTrackStrategy
  /**
   * Always false with the current resolver — documented so callers do not invent
   * a filler track without revisiting the parity audit.
   */
  usedPhantomFiller: false
}

function fractionMaxTrack(width: FieldWidthFraction): string {
  const pct = FIELD_WIDTH_FRACTION_MAX_PERCENT[width]
  // Trim trailing zeros from the known table values for cleaner CSS.
  const normalized = Number.isInteger(pct)
    ? String(pct)
    : pct.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
  return `minmax(0, ${normalized}%)`
}

function fractionFrTrack(width: FieldWidthFraction): string {
  return `minmax(0, ${FIELD_WIDTH_FRACTION_WEIGHTS[width]}fr)`
}

function trackForLiteral(width: FieldWidth): string {
  if (isFieldWidthFixed(width)) return FIELD_WIDTH_FIXED_TRACKS[width]
  if (width === 'auto') return 'max-content'
  if (width === 'full') return 'minmax(0, 1fr)'
  if (isFieldWidthFraction(width)) return fractionFrTrack(width)
  return 'minmax(0, 1fr)'
}

/**
 * Resolves CSS `grid-template-columns` tracks for an anatomy row from leaf width tokens.
 *
 * Does **not** change `fieldWidthVariants` on the fields themselves — fixed `w-*`,
 * `w-fit`, `w-full`, and fraction `max-w-*` remain item-level constraints. Flex
 * `grow-*` / `basis-0` are inert on grid items and can stay for standalone/flex rows.
 *
 * @returns Track list with strategy metadata. Never introduces a phantom filler.
 */
export function resolveFieldRowColumnTracks(
  widths: readonly FieldWidth[],
): ResolveFieldRowColumnTracksResult {
  if (widths.length === 0) {
    return {
      tracks: [],
      gridTemplateColumns: '',
      strategy: 'literal',
      usedPhantomFiller: false,
    }
  }

  const fractions = widths.filter(isFieldWidthFraction)
  const hasFull = widths.some((width) => width === 'full')
  const hasOnlyLiteral = fractions.length === 0

  if (hasOnlyLiteral) {
    const tracks = widths.map(trackForLiteral)
    return {
      tracks,
      gridTemplateColumns: tracks.join(' '),
      strategy: 'literal',
      usedPhantomFiller: false,
    }
  }

  const fractionWeightSum = fractions.reduce(
    (sum, width) => sum + FIELD_WIDTH_FRACTION_WEIGHTS[width],
    0,
  )
  const allFractions = fractions.length === widths.length

  // `full` + fraction(s): percentage-capped fraction tracks so `1fr` absorbs leftover
  // (flex redistributes after max-width; plain `Nfr` would starve `full`).
  if (hasFull && fractions.length > 0) {
    const tracks = widths.map((width) => {
      if (isFieldWidthFraction(width)) return fractionMaxTrack(width)
      return trackForLiteral(width)
    })
    return {
      tracks,
      gridTemplateColumns: tracks.join(' '),
      strategy: 'fraction-max-percent',
      usedPhantomFiller: false,
    }
  }

  // Pure fraction row that fills the base-12 scale (e.g. 1/2+1/2, 1/3+2/3, 1/4+1/4+1/2).
  if (allFractions && fractionWeightSum === 12) {
    const tracks = widths.map((width) => fractionFrTrack(width as FieldWidthFraction))
    return {
      tracks,
      gridTemplateColumns: tracks.join(' '),
      strategy: 'fraction-fr',
      usedPhantomFiller: false,
    }
  }

  // Incomplete fraction set (lone 1/2, 1/3+1/3, …) and mixes with fixed/auto but no full:
  // cap tracks at the fraction percentage. Trailing free space remains — same as flex
  // items that cannot grow past max-w. No phantom filler.
  if (fractionWeightSum < 12) {
    const tracks = widths.map((width) => {
      if (isFieldWidthFraction(width)) return fractionMaxTrack(width)
      return trackForLiteral(width)
    })
    return {
      tracks,
      gridTemplateColumns: tracks.join(' '),
      strategy: 'fraction-incomplete',
      usedPhantomFiller: false,
    }
  }

  // Fractions mixed with fixed/auto that sum to 12 among fraction slots
  // (e.g. md + 1/2 + 1/2): use fr among fractions; fixed stays rem.
  const tracks = widths.map((width) => {
    if (isFieldWidthFraction(width)) return fractionFrTrack(width)
    return trackForLiteral(width)
  })
  return {
    tracks,
    gridTemplateColumns: tracks.join(' '),
    strategy: 'fraction-fr',
    usedPhantomFiller: false,
  }
}

/**
 * Models flex free-space distribution for proportional siblings after gap deduction.
 * Mirrors browsers: assign by grow ratio, freeze items that hit max-width, redistribute.
 * Used by parity tests — not a runtime layout engine.
 */
export function modelFlexProportionalWidths(input: {
  containerWidth: number
  gap: number
  /** Grow weight per item (`full` → 1, fraction → base-12 weight, fixed/auto → 0). */
  growWeights: number[]
  /** Max width per item (`Infinity` when uncapped). */
  maxWidths: number[]
  /** Preferred/base width for non-growing items (fixed rem or measured auto). */
  baseWidths: number[]
}): number[] {
  const { containerWidth, gap, growWeights, maxWidths, baseWidths } = input
  const count = growWeights.length
  if (count === 0) return []

  const gapTotal = gap * Math.max(0, count - 1)
  const widths = baseWidths.map((base, index) => (growWeights[index] === 0 ? base : 0))
  const nonGrowSum = widths.reduce((sum, width) => sum + width, 0)
  let free = Math.max(0, containerWidth - gapTotal - nonGrowSum)
  let active = growWeights
    .map((weight, index) => ({ index, weight, max: maxWidths[index]! }))
    .filter((item) => item.weight > 0)

  while (active.length > 0) {
    const weightSum = active.reduce((sum, item) => sum + item.weight, 0)
    const overMax = active.filter((item) => (free * item.weight) / weightSum > item.max + 0.01)

    if (overMax.length === 0) {
      for (const item of active) {
        widths[item.index] = (free * item.weight) / weightSum
      }
      break
    }

    for (const item of overMax) {
      widths[item.index] = item.max
      free = Math.max(0, free - item.max)
    }
    const overIndexes = new Set(overMax.map((item) => item.index))
    active = active.filter((item) => !overIndexes.has(item.index))
  }

  return widths
}

/**
 * Models grid track used sizes for the resolver's track strings in simple row cases.
 * Supports fixed rem, `max-content` (via provided content widths), `minmax(0,Nfr)`,
 * `minmax(0,P%)`, and `minmax(0,1fr)`.
 */
export function modelGridTrackWidths(input: {
  containerWidth: number
  gap: number
  tracks: string[]
  /** Content width for `max-content` tracks (same index). */
  contentWidths?: number[]
}): number[] {
  const { containerWidth, gap, tracks, contentWidths = [] } = input
  const count = tracks.length
  if (count === 0) return []

  const gapTotal = gap * Math.max(0, count - 1)
  const available = Math.max(0, containerWidth - gapTotal)

  const parsed = tracks.map((track, index) => {
    if (track === 'max-content') {
      return { kind: 'fixed' as const, size: contentWidths[index] ?? 0 }
    }
    const rem = /^(\d+(?:\.\d+)?)rem$/.exec(track)
    if (rem) {
      return { kind: 'fixed' as const, size: Number(rem[1]) * 16 }
    }
    const pct = /^minmax\(0,\s*(\d+(?:\.\d+)?)%\)$/.exec(track)
    if (pct) {
      return {
        kind: 'percent' as const,
        size: (containerWidth * Number(pct[1])) / 100,
      }
    }
    const fr = /^minmax\(0,\s*(\d+(?:\.\d+)?)fr\)$/.exec(track)
    if (fr) {
      return { kind: 'fr' as const, weight: Number(fr[1]) }
    }
    throw new Error(`Unsupported track for parity model: ${track}`)
  })

  const definite = parsed.map((item) => {
    if (item.kind === 'fixed' || item.kind === 'percent') return item.size
    return 0
  })
  const definiteSum = definite.reduce((sum, size) => sum + size, 0)
  const free = Math.max(0, available - definiteSum)
  const frWeightSum = parsed.reduce(
    (sum, item) => (item.kind === 'fr' ? sum + item.weight : sum),
    0,
  )

  return parsed.map((item, index) => {
    if (item.kind === 'fr') {
      return frWeightSum === 0 ? 0 : (free * item.weight) / frWeightSum
    }
    return definite[index]!
  })
}
