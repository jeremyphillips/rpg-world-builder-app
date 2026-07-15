import {
  buildAtomicEffectDisplayFromParts,
  formatAtomicEffectDisplayTitle,
  type AtomicEffectDisplay,
  type EffectRecipient,
} from '@rpg/contracts'

import {
  normalizeRollFormValue,
  type RollFormShape,
} from '../../../../lib/forms/mechanics/roll-form-values'
import type { ResolutionEffectFormItem } from './resolution-form-schema'
import {
  formatResolutionEffectCompletenessMessage,
  getResolutionEffectCompleteness,
  type ResolutionEffectCompleteness,
} from './resolution-effect-validity.lib'
import { RESOLUTION_SECTION_LABELS } from './resolution-form-labels'

export type EffectReferenceState =
  | { kind: 'resolved'; display: AtomicEffectDisplay }
  | { kind: 'missing'; effectId: string }
  | {
      kind: 'incomplete'
      effect: ResolutionEffectFormItem
      completeness: Extract<ResolutionEffectCompleteness, { complete: false }>
    }
  | { kind: 'unavailable'; effect: ResolutionEffectFormItem; reason: string }

export type ResolveEffectReferenceOptions = {
  recipient?: EffectRecipient
  index?: number
}

function buildDisplayFromResolutionEffect(
  effect: ResolutionEffectFormItem,
  options: ResolveEffectReferenceOptions,
): AtomicEffectDisplay {
  const roll = normalizeRollFormValue(effect.roll as RollFormShape)

  return buildAtomicEffectDisplayFromParts(
    {
      kind: effect.kind,
      roll: roll ?? undefined,
      ...(effect.kind === 'damage' ? { damageType: effect.damageType } : {}),
    },
    { recipient: options.recipient, fallbackIndex: options.index },
  )
}

/** Resolves an effect reference for authoring surfaces (rows, menus, headers). */
export function resolveEffectReference(
  effect: ResolutionEffectFormItem | undefined,
  options: ResolveEffectReferenceOptions = {},
): EffectReferenceState {
  if (!effect) {
    return { kind: 'missing', effectId: '' }
  }

  const completeness = getResolutionEffectCompleteness(effect)
  if (!completeness.complete) {
    return { kind: 'incomplete', effect, completeness }
  }

  return {
    kind: 'resolved',
    display: buildDisplayFromResolutionEffect(effect, options),
  }
}

export function resolveEffectReferenceById(
  effects: readonly ResolutionEffectFormItem[],
  effectId: string,
  options: ResolveEffectReferenceOptions = {},
): EffectReferenceState {
  const effect = effects.find((entry) => entry.id === effectId)
  if (!effect) {
    return { kind: 'missing', effectId }
  }

  return resolveEffectReference(effect, options)
}

/** Plain-text title for any reference state — menus, aria labels, native title attributes. */
export function formatEffectReferenceTitle(
  reference: EffectReferenceState,
  options: ResolveEffectReferenceOptions = {},
): string {
  switch (reference.kind) {
    case 'resolved':
      return formatAtomicEffectDisplayTitle(reference.display)
    case 'missing':
      return reference.effectId
        ? `${RESOLUTION_SECTION_LABELS.outcomeUnknownEffect}: ${reference.effectId}`
        : RESOLUTION_SECTION_LABELS.outcomeUnknownEffect
    case 'incomplete':
      return formatAtomicEffectDisplayTitle(
        buildAtomicEffectDisplayFromParts(
          { kind: reference.effect.kind },
          { fallbackIndex: options.index },
        ),
      ).concat(` — ${RESOLUTION_SECTION_LABELS.outcomeIncompleteEffect}`)
    case 'unavailable':
      return formatAtomicEffectDisplayTitle(
        buildDisplayFromResolutionEffect(reference.effect, options),
      )
    default: {
      const _exhaustive: never = reference
      return _exhaustive
    }
  }
}

export function formatEffectReferenceDescription(
  reference: EffectReferenceState,
): string | undefined {
  if (reference.kind === 'incomplete') {
    return formatResolutionEffectCompletenessMessage(reference.effect, reference.completeness)
  }

  if (reference.kind === 'unavailable') {
    return reference.reason
  }

  return undefined
}

export function findResolutionEffectById(
  effects: readonly ResolutionEffectFormItem[],
  effectId: string,
): ResolutionEffectFormItem | undefined {
  return effects.find((effect) => effect.id === effectId)
}
