import { z } from 'zod'

import { durationUnitSchema, type DurationUnit } from '../../vocab/spell/duration'
import { TIME_UNIT_ENTRIES } from '../../vocab/time-unit'
import { formatTermCount } from '../../vocab/types'

export const EFFECT_END_PARTICIPANTS = ['source', 'target'] as const
export type EffectEndParticipant = (typeof EFFECT_END_PARTICIPANTS)[number]

export const EFFECT_END_BOUNDARIES = ['start', 'end'] as const
export type EffectEndBoundary = (typeof EFFECT_END_BOUNDARIES)[number]

export const EFFECT_END_WHICH = ['next', 'current'] as const
export type EffectEndWhich = (typeof EFFECT_END_WHICH)[number]

export const effectEndTurnBoundSchema = z.object({
  kind: z.literal('turn-bound'),
  participant: z.enum(EFFECT_END_PARTICIPANTS),
  boundary: z.enum(EFFECT_END_BOUNDARIES),
  which: z.enum(EFFECT_END_WHICH),
})

export const effectEndTimedSchema = z.object({
  kind: z.literal('timed'),
  value: z.number().int().min(1),
  unit: durationUnitSchema,
})

export const effectEndCustomSchema = z.object({
  kind: z.literal('custom'),
  text: z.string().trim().min(1),
})

export const effectEndSchema = z.discriminatedUnion('kind', [
  effectEndTurnBoundSchema,
  effectEndTimedSchema,
  effectEndCustomSchema,
])

export type EffectEnd = z.infer<typeof effectEndSchema>
export type EffectEndTurnBound = z.infer<typeof effectEndTurnBoundSchema>
export type EffectEndTimed = z.infer<typeof effectEndTimedSchema>
export type EffectEndCustom = z.infer<typeof effectEndCustomSchema>

/** Ephemeral authoring ids — never persisted on catalog entities. */
export const EFFECT_END_TIMING_OPTION_IDS = {
  sourceStartNext: 'source-start-next',
  sourceEndNext: 'source-end-next',
  targetStartNext: 'target-start-next',
  targetEndNext: 'target-end-next',
  sourceEndCurrent: 'source-end-current',
  timed: 'timed',
  custom: 'custom',
} as const

export type EffectEndTimingOptionId =
  (typeof EFFECT_END_TIMING_OPTION_IDS)[keyof typeof EFFECT_END_TIMING_OPTION_IDS]

type EffectEndTimingOption = {
  readonly id: EffectEndTimingOptionId
  readonly label: string
  readonly end?: EffectEnd
}

const TURN_BOUND_OPTIONS: readonly EffectEndTimingOption[] = [
  {
    id: EFFECT_END_TIMING_OPTION_IDS.sourceStartNext,
    label: "Start of the creature's next turn",
    end: {
      kind: 'turn-bound',
      participant: 'source',
      boundary: 'start',
      which: 'next',
    },
  },
  {
    id: EFFECT_END_TIMING_OPTION_IDS.sourceEndNext,
    label: "End of the creature's next turn",
    end: {
      kind: 'turn-bound',
      participant: 'source',
      boundary: 'end',
      which: 'next',
    },
  },
  {
    id: EFFECT_END_TIMING_OPTION_IDS.targetStartNext,
    label: "Start of the target's next turn",
    end: {
      kind: 'turn-bound',
      participant: 'target',
      boundary: 'start',
      which: 'next',
    },
  },
  {
    id: EFFECT_END_TIMING_OPTION_IDS.targetEndNext,
    label: "End of the target's next turn",
    end: {
      kind: 'turn-bound',
      participant: 'target',
      boundary: 'end',
      which: 'next',
    },
  },
  {
    id: EFFECT_END_TIMING_OPTION_IDS.sourceEndCurrent,
    label: "End of the creature's current turn",
    end: {
      kind: 'turn-bound',
      participant: 'source',
      boundary: 'end',
      which: 'current',
    },
  },
] as const

export const EFFECT_END_TIMING_OPTIONS = [
  ...TURN_BOUND_OPTIONS,
  {
    id: EFFECT_END_TIMING_OPTION_IDS.timed,
    label: 'Fixed duration',
    end: { kind: 'timed', value: 1, unit: 'minute' } satisfies EffectEndTimed,
  },
  {
    id: EFFECT_END_TIMING_OPTION_IDS.custom,
    label: 'Custom',
  },
] as const satisfies readonly EffectEndTimingOption[]

export function effectEndTimingSelectOptions(): Array<{ value: string; label: string }> {
  return EFFECT_END_TIMING_OPTIONS.map((option) => ({
    value: option.id,
    label: option.label,
  }))
}

const TURN_BOUND_BY_ID = new Map(
  TURN_BOUND_OPTIONS.map((option) => [option.id, option.end] as const),
)

function effectEndsEqual(a: EffectEnd, b: EffectEnd): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'turn-bound' && b.kind === 'turn-bound') {
    return a.participant === b.participant && a.boundary === b.boundary && a.which === b.which
  }
  if (a.kind === 'timed' && b.kind === 'timed') {
    return a.value === b.value && a.unit === b.unit
  }
  if (a.kind === 'custom' && b.kind === 'custom') {
    return a.text === b.text
  }
  return false
}

export function resolveSelectIdFromEffectEnd(end: EffectEnd | undefined): string | undefined {
  if (!end) return undefined
  if (end.kind === 'timed') return EFFECT_END_TIMING_OPTION_IDS.timed
  if (end.kind === 'custom') return EFFECT_END_TIMING_OPTION_IDS.custom
  for (const option of TURN_BOUND_OPTIONS) {
    if (option.end && effectEndsEqual(option.end, end)) return option.id
  }
  return undefined
}

export type BuildEffectEndFromAuthoringInput = {
  timedValue?: unknown
  timedUnit?: unknown
  customText?: unknown
}

function positiveInt(value: unknown): number | undefined {
  const parsed =
    typeof value === 'number' && Number.isInteger(value)
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN
  if (!Number.isInteger(parsed) || parsed < 1) return undefined
  return parsed
}

function timedEffectEndFromAuthoring(
  input: BuildEffectEndFromAuthoringInput,
): EffectEndTimed | undefined {
  const value = positiveInt(input.timedValue)
  if (value === undefined) return undefined
  const unit = input.timedUnit
  if (typeof unit !== 'string' || !durationUnitSchema.safeParse(unit).success) return undefined
  return { kind: 'timed', value, unit: unit as DurationUnit }
}

function customEffectEndFromAuthoring(text: unknown): EffectEndCustom | undefined {
  if (typeof text !== 'string') return undefined
  const trimmed = text.trim()
  return trimmed ? { kind: 'custom', text: trimmed } : undefined
}

export function buildEffectEndFromAuthoring(
  optionId: string | undefined,
  input: BuildEffectEndFromAuthoringInput,
): EffectEnd | undefined {
  if (!optionId) return undefined
  if (optionId === EFFECT_END_TIMING_OPTION_IDS.timed) {
    return timedEffectEndFromAuthoring(input)
  }
  if (optionId === EFFECT_END_TIMING_OPTION_IDS.custom) {
    return customEffectEndFromAuthoring(input.customText)
  }
  return TURN_BOUND_BY_ID.get(optionId as EffectEndTimingOptionId)
}

export type EffectEndFormatVoice = 'monster-stat-block' | 'spell-caster' | 'preview'

export type EffectEndFormatContext = {
  voice: EffectEndFormatVoice
  /** Name of the creature whose stat block owns the effect (source participant). */
  sourceName?: string
}

function statBlockSubject(name: string | undefined): string {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return 'the creature'
  const lower = trimmed.toLowerCase()
  if (lower.startsWith('the ')) return lower
  return `the ${lower}`
}

function possessiveSourcePhrase(sourceName: string | undefined): string {
  return `${statBlockSubject(sourceName)}'s`
}

function formatTurnBoundPhrase(end: EffectEndTurnBound, context: EffectEndFormatContext): string {
  const boundaryWord = end.boundary === 'start' ? 'start' : 'end'
  const turnPhrase = end.which === 'next' ? 'next turn' : 'turn'

  if (end.participant === 'target') {
    return `until the ${boundaryWord} of the target's ${turnPhrase}`
  }

  if (context.voice === 'spell-caster') {
    return `until the ${boundaryWord} of your ${turnPhrase}`
  }

  const whose = possessiveSourcePhrase(context.sourceName)
  return `until the ${boundaryWord} of ${whose} ${turnPhrase}`
}

/** Formats when an effect ends. Leading space is omitted — callers prepend inside a sentence. */
export function formatEffectEnd(end: EffectEnd, context: EffectEndFormatContext): string {
  switch (end.kind) {
    case 'turn-bound':
      return formatTurnBoundPhrase(end, context)
    case 'timed':
      return `for ${formatTermCount(TIME_UNIT_ENTRIES[end.unit], end.value)}`
    case 'custom':
      return end.text
    default: {
      const _exhaustive: never = end
      return _exhaustive
    }
  }
}
