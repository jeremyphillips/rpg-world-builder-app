import {
  deriveDefaultEffectRecipient,
  formatEffectRowSentenceFromParts,
  formatResolutionAvailabilityReason,
  formatRollValue,
  getApplicationPatternAvailability,
  getEffectKindAvailability,
  getMethodAvailability,
  getSpellApplicationPatternKindLabel,
  getSpellAtomicEffectKindLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionProximityKindLabel,
  RESOLUTION_METHOD_OPTIONS,
  type ResolutionChangePlan,
  type ResolutionChangeRequest,
  type ResolutionEffectKind,
  type ResolutionEffectRef,
  type ResolutionMethodOption,
  type ResolutionSelectionState,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  normalizeRollFormValue,
  type RollFormShape,
} from '../../../lib/forms/mechanics/roll-form-values'
import { RESOLUTION_APPLICATION_PATTERN_OPTIONS } from './resolution-form-labels'
import type { ResolutionFormValues } from './resolution-form-schema'
import { RESOLUTION_EFFECT_KINDS } from './resolution-effect-add-menu.lib'

/** Maps flattened resolution form values to contract selection context. */
export function resolutionFormToSelectionContext(
  values: ResolutionFormValues | undefined,
): ResolutionSelectionState | undefined {
  if (!values) return undefined

  return {
    proximityKind: values.proximityKind,
    proximityDistanceFt: values.proximityDistanceFt,
    proximityReachDistanceFt: values.proximityReachDistanceFt,
    targetKind: values.targetKind,
    targetCount: values.targetCount,
    methodKind: values.methodKind,
    attackType: values.attackType,
    saveAbility: values.saveAbility,
    applicationPatternKind: values.applicationPatternKind,
    projectileCount: values.projectileCount,
    projectileUnitLabelSingular: values.projectileUnitLabelSingular,
    projectileUnitLabelPlural: values.projectileUnitLabelPlural,
    effects: values.effects,
  }
}

function methodOptionLabel(option: ResolutionMethodOption): string {
  if (option === 'saving-throw') return 'Saving throw'
  if (option === 'automatic') return 'Automatic'
  return getSpellResolutionAttackTypeLabel(option)
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
export function describeEffectForConfirm(effect: ResolutionEffectRef): string {
  const kindLabel = getSpellAtomicEffectKindLabel(effect.kind as ResolutionEffectKind)
  const detail = formatEffectRollDetail(effect as Record<string, unknown>)
  return detail ? `${kindLabel} — ${detail}` : kindLabel
}

function formatIncompatibleSelectionLine(
  selection: ResolutionChangePlan['incompatibleSelections'][number],
): string {
  if (selection.field === 'method') {
    return `invalidate the current ${methodOptionLabel(selection.currentOption)} selection`
  }
  return `remove the ${getSpellApplicationPatternKindLabel(selection.currentKind)} application pattern`
}

const CHANGE_FIELD_HEADLINES: Record<ResolutionChangeRequest['field'], string> = {
  proximityKind: 'Change target proximity?',
  methodOption: 'Change resolution method?',
  applicationPatternKind: 'Change application pattern?',
}

export type ResolutionChangeDialogCopy = {
  headline: string
  intro: string
  consequences: string[]
  footer: string
}

/** Aggregates all plan consequences for the confirm dialog body. */
export function formatChangePlanForDialog(
  plan: ResolutionChangePlan,
  change: ResolutionChangeRequest,
): ResolutionChangeDialogCopy {
  const headline = CHANGE_FIELD_HEADLINES[change.field]

  const consequences = [
    ...plan.incompatibleSelections.map((selection) => formatIncompatibleSelectionLine(selection)),
    ...plan.effectsToRemove.map((effect) => `remove ${describeEffectForConfirm(effect)}`),
  ]

  let intro = 'Applying this change will:'
  if (change.field === 'proximityKind') {
    intro = `Changing the target to ${getSpellResolutionProximityKindLabel(change.value)} will:`
  }

  return {
    headline,
    intro,
    consequences,
    footer: 'Review the Resolution fields after applying this change.',
  }
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

export function resolutionSelectionContextFromWatched(
  watched: Record<string, unknown>,
  prefix = 'resolution.',
): ResolutionSelectionState {
  const read = (key: string) => watched[`${prefix}${key}`]
  return {
    proximityKind: read('proximityKind') as ResolutionSelectionState['proximityKind'],
    proximityDistanceFt: read('proximityDistanceFt') as number | undefined,
    proximityReachDistanceFt: read('proximityReachDistanceFt') as number | undefined,
    targetKind: read('targetKind') as string | undefined,
    targetCount: read('targetCount') as number | undefined,
    methodKind: read('methodKind') as ResolutionSelectionState['methodKind'],
    attackType: read('attackType') as ResolutionSelectionState['attackType'],
    saveAbility: read('saveAbility') as string | undefined,
    applicationPatternKind: read(
      'applicationPatternKind',
    ) as ResolutionSelectionState['applicationPatternKind'],
  }
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
