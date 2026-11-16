import {
  buildEffectEndFromAuthoring,
  effectEndSchema,
  EFFECT_END_TIMING_OPTION_IDS,
  type EffectEnd,
} from '@rpg/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function coalesceEffectEndFromAuthoring(
  row: Record<string, unknown>,
): EffectEnd | undefined {
  const option = typeof row.effectEndOption === 'string' ? row.effectEndOption : undefined
  const endRecord = isRecord(row.end) ? row.end : {}

  const built = option
    ? buildEffectEndFromAuthoring(option, {
        timedValue: endRecord.value,
        timedUnit: endRecord.unit,
        customText: endRecord.text,
      })
    : effectEndSchema.safeParse(row.end).success
      ? effectEndSchema.parse(row.end)
      : undefined

  return built
}

function retainIncompleteTimedEnd(
  end: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const partial: Record<string, unknown> = { kind: 'timed' }
  if (end.value !== undefined) partial.value = end.value
  if (end.unit !== undefined) partial.unit = end.unit
  return partial.value !== undefined || partial.unit !== undefined ? partial : undefined
}

function retainIncompleteEffectEnd(
  option: string | undefined,
  endRecord: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!endRecord) return undefined
  if (option === EFFECT_END_TIMING_OPTION_IDS.timed) {
    return retainIncompleteTimedEnd(endRecord)
  }
  if (option === EFFECT_END_TIMING_OPTION_IDS.custom && typeof endRecord.text === 'string') {
    return { kind: 'custom', text: endRecord.text }
  }
  return undefined
}

export function applyEffectEndAuthoringToRow(row: Record<string, unknown>): void {
  const option = typeof row.effectEndOption === 'string' ? row.effectEndOption : undefined
  const end = coalesceEffectEndFromAuthoring(row)
  delete row.effectEndOption

  if (end) {
    row.end = end
    return
  }

  const incomplete = retainIncompleteEffectEnd(option, isRecord(row.end) ? row.end : undefined)
  if (incomplete) {
    row.end = incomplete
    return
  }

  delete row.end
}
