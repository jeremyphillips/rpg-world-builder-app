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
