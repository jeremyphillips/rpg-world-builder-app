import {
  deriveDefaultEffectRecipient,
  formatResolutionAvailabilityReason,
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

import { formatEffectRowPrimary, formatEffectRowSummary } from '../../../lib/effects/effect-display'

import { RESOLUTION_EFFECT_KINDS } from '../effects/resolution-effect-add-menu.lib'
import { getEffectTemplatesForKinds } from '../../../lib/effects/effect-template-registry'
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
  description?: string
  note?: string
  disabled: boolean
}

const RESOLUTION_EFFECT_TEMPLATE_BY_KIND = new Map(
  getEffectTemplatesForKinds(RESOLUTION_EFFECT_KINDS).map((template) => [template.kind, template]),
)

/** Effect template items for the resolution-specific add control. */
export function buildResolutionEffectAddMenuItems(
  context: ResolutionSelectionState | undefined,
): ResolutionEffectAddMenuItem[] {
  return RESOLUTION_EFFECT_KINDS.map((kind) => {
    const label = getSpellAtomicEffectKindLabel(kind)
    const description = RESOLUTION_EFFECT_TEMPLATE_BY_KIND.get(kind)?.description

    if (!context) return { id: kind, label, description, disabled: false }

    const availability = getEffectKindAvailability(context, kind)
    const note = availability.reason
      ? formatResolutionAvailabilityReason(availability.reason, 'option')
      : undefined

    return {
      id: kind,
      label,
      description,
      note: !availability.allowed ? note : undefined,
      disabled: !availability.allowed,
    }
  })
}

export function formatResolutionEffectRowSummary(
  row: Record<string, unknown>,
  context: ResolutionSelectionState,
): string {
  return formatEffectRowSummary(row, { recipient: deriveDefaultEffectRecipient(context) })
}

/** Compact bullet for confirm dialog effect removal lines. */
export function describeEffectForConfirm(effect: {
  id: string
  kind: string
  roll?: unknown
  damageType?: string
  label?: string
}): string {
  return formatEffectRowPrimary(effect, 0)
}
