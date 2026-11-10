'use client'

import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { useOptionalFieldLabelVisibility } from './field.client'

/** Owned-slot resolution. Adapters do not call this; the label slot does. */
export function resolveOwnedLabelVisibility(
  explicit: FieldLabelVisibility | undefined,
  fromContext: FieldLabelVisibility | undefined,
): FieldLabelVisibility {
  return explicit ?? fromContext ?? 'visible'
}

export function useOwnedLabelVisibility(explicit?: FieldLabelVisibility): FieldLabelVisibility {
  return resolveOwnedLabelVisibility(explicit, useOptionalFieldLabelVisibility())
}

/** Keep a visible label slot when the label is visible or the slot still has hint or info. */
export function showOwnedLabelSlot(options: {
  labelVisibility: FieldLabelVisibility | undefined
  hintInLabelSlot: boolean
  hasInfo: boolean
}): boolean {
  return options.labelVisibility !== 'srOnly' || options.hintInLabelSlot || options.hasInfo
}
