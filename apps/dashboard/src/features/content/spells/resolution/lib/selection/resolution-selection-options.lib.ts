import {
  deriveDefaultEffectRecipient,
  formatEffectRowSentenceFromParts,
  formatResolutionAvailabilityReason,
  formatRollValue,
  getApplicationPatternAvailability,
  getEffectKindAvailability,
  getMethodAvailability,
  getSpellAtomicEffectKindLabel,
  getSpellResolutionAttackTypeLabel,
  RESOLUTION_METHOD_OPTIONS,
  type ResolutionEffectKind,
  type ResolutionMethodOption,
  type ResolutionSelectionState,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  normalizeRollFormValue,
  type RollFormShape,
} from '../../../../lib/forms/mechanics/roll-form-values'
import { RESOLUTION_EFFECT_KINDS } from '../effects/resolution-effect-add-menu.lib'
import { RESOLUTION_APPLICATION_PATTERN_OPTIONS } from '../form/resolution-form-labels'

function methodOptionLabel(option: ResolutionMethodOption): string {
  if (option === 'saving-throw') return 'Saving throw'
  if (option === 'automatic') return 'Automatic'
  return getSpellResolutionAttackTypeLabel(option)
}

const RESOLUTION_METHOD_SELECT_OPTIONS: FieldOption[] = RESOLUTION_METHOD_OPTIONS.map((value) => ({
  value,
  label: methodOptionLabel(value),
}))

/** Method select options with availability reasons applied. */
export function buildResolutionMethodOptions(
  context: ResolutionSelectionState | undefined,
): FieldOption[] {
  if (!context) return RESOLUTION_METHOD_SELECT_OPTIONS

  return RESOLUTION_METHOD_SELECT_OPTIONS.map((option) => {
    const availability = getMethodAvailability(context, option.value as ResolutionMethodOption)
    if (availability.allowed) return option
    return {
      ...option,
      disabled: true,
      description: availability.reason
        ? formatResolutionAvailabilityReason(availability.reason, 'option')
        : undefined,
    }
  })
}

/** Application pattern select options with availability reasons applied. */
export function buildResolutionApplicationPatternOptions(
  context: ResolutionSelectionState | undefined,
): FieldOption[] {
  if (!context) return [...RESOLUTION_APPLICATION_PATTERN_OPTIONS]

  return RESOLUTION_APPLICATION_PATTERN_OPTIONS.map((option) => {
    if (option.value === 'none') return option
    const availability = getApplicationPatternAvailability(context, option.value as 'projectiles')
    if (availability.allowed) return option
    return {
      ...option,
      disabled: true,
      description: availability.reason
        ? formatResolutionAvailabilityReason(availability.reason, 'option')
        : undefined,
    }
  })
}

export type ResolutionEffectAddMenuItem = {
  id: ResolutionEffectKind
  label: string
  disabled: boolean
  reason?: string
}

/** Effect template items for the resolution-specific add control. */
export function buildResolutionEffectAddMenuItems(
  context: ResolutionSelectionState | undefined,
): ResolutionEffectAddMenuItem[] {
  return RESOLUTION_EFFECT_KINDS.map((kind) => {
    const label = getSpellAtomicEffectKindLabel(kind)
    if (!context) return { id: kind, label, disabled: false }

    const availability = getEffectKindAvailability(context, kind)
    return {
      id: kind,
      label,
      disabled: !availability.allowed,
      reason: availability.reason
        ? formatResolutionAvailabilityReason(availability.reason, 'option')
        : undefined,
    }
  })
}

export function formatResolutionEffectRowSummary(
  row: Record<string, unknown>,
  context: ResolutionSelectionState,
): string {
  const kind = row.kind
  if (kind !== 'damage' && kind !== 'healing' && kind !== 'temporary-hit-points') {
    return ''
  }

  const roll = normalizeRollFormValue(row.roll as RollFormShape)
  if (!roll) return ''

  const recipient = deriveDefaultEffectRecipient(context)
  return formatEffectRowSentenceFromParts(
    {
      kind,
      roll,
      ...(kind === 'damage' && typeof row.damageType === 'string'
        ? { damageType: row.damageType }
        : {}),
    },
    { recipient },
  )
}

function formatEffectRollDetail(row: Record<string, unknown>): string | undefined {
  const roll = normalizeRollFormValue(row.roll as RollFormShape)
  if (!roll) return undefined
  if (row.kind === 'damage' && typeof row.damageType === 'string') {
    return `${formatRollValue(roll)} ${row.damageType} damage`
  }
  return formatRollValue(roll)
}

/** Compact bullet for confirm dialog effect removal lines. */
export function describeEffectForConfirm(effect: {
  id: string
  kind: string
  roll?: unknown
  damageType?: string
}): string {
  const kindLabel = getSpellAtomicEffectKindLabel(effect.kind as ResolutionEffectKind)
  const detail = formatEffectRollDetail(effect as Record<string, unknown>)
  return detail ? `${kindLabel} — ${detail}` : kindLabel
}
