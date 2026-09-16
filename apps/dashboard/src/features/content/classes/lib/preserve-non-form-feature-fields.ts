import type { ClassBodyFeature, ProgressionTable } from '@rpg/contracts'

/** Fields owned by structured feature data, not the feature form editor. */
export type NonFormFeatureFields = {
  tables?: ProgressionTable[]
}

export function preserveNonFormFeatureFields(
  existing: ClassBodyFeature | undefined,
): NonFormFeatureFields {
  if (!existing || existing.kind !== 'custom' || !existing.tables?.length) return {}
  return { tables: existing.tables }
}
