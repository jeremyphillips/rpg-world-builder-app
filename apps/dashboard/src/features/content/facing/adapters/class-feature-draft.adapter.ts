import { CLASS_FEATURE_KINDS, type ClassFeatureKind, type FacingInvalidCode } from '@rpg/contracts'

import type { FeatureRowForm } from '../../classes/lib/class-feature-form-fields'

export type ClassFeatureDraftAdaptation =
  | {
      status: 'ok'
      record: FeatureRowForm & { id: string; kind: ClassFeatureKind }
    }
  | { status: 'invalid'; code: FacingInvalidCode }

function isClassFeatureKind(value: unknown): value is ClassFeatureKind {
  return typeof value === 'string' && (CLASS_FEATURE_KINDS as readonly string[]).includes(value)
}

/** Draft class feature rows must keep `id` and `kind` for live preview — save transforms stay elsewhere. */
export function adaptClassFeatureDraftRow(row: unknown): ClassFeatureDraftAdaptation {
  const draft = row as FeatureRowForm | undefined
  const id = typeof draft?.id === 'string' ? draft.id.trim() : ''
  if (!id) return { status: 'invalid', code: 'missing-id' }

  const kind = draft?.kind
  if (!kind || !isClassFeatureKind(kind)) return { status: 'invalid', code: 'missing-kind' }

  return {
    status: 'ok',
    record: {
      ...(draft as FeatureRowForm),
      id,
      kind,
    },
  }
}
