import type { NamingConvention, NameSubjectKind } from '@rpg/contracts/name-generator'
import { NAME_SUBJECT_KINDS } from '@rpg/contracts/name-generator'

export function deriveAvailableSubjectKinds({
  cultureIds,
  conventions,
}: {
  cultureIds: readonly string[]
  conventions: readonly NamingConvention[]
}): NameSubjectKind[] {
  const cultureIdSet = new Set(cultureIds)
  const matched = new Set<NameSubjectKind>()

  for (const convention of conventions) {
    const matchesCulture = convention.associations.some(
      (association) => association.kind === 'culture' && cultureIdSet.has(association.cultureId),
    )

    if (!matchesCulture) {
      continue
    }

    for (const subjectKind of convention.subjectKinds) {
      matched.add(subjectKind)
    }
  }

  return NAME_SUBJECT_KINDS.filter((kind) => matched.has(kind))
}
