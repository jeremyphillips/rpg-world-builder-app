import { isClassFeatureKind, type ClassFeatureKind, type FacingReason } from '@rpg/contracts'

import type { FeatureRowForm } from '../../classes/lib/class-feature-form-fields'

export type ClassFeatureDraftAdaptation =
  | {
      status: 'ok'
      record: FeatureRowForm & { kind: ClassFeatureKind }
    }
  | { status: 'incomplete'; reason: FacingReason }
  | { status: 'invalid'; reason: FacingReason }

/** Draft class feature rows need `kind` for live preview — save transforms stay elsewhere. */
export function adaptClassFeatureDraftRow(row: unknown): ClassFeatureDraftAdaptation {
  const draft = row as FeatureRowForm | undefined
  const kind = draft?.kind

  if (!kind) {
    return { status: 'incomplete', reason: { code: 'missing-kind' } }
  }

  if (!isClassFeatureKind(kind)) {
    return { status: 'invalid', reason: { code: 'unsupported-kind' } }
  }

  return {
    status: 'ok',
    record: {
      ...(draft as FeatureRowForm),
      kind,
    },
  }
}
