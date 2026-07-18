import type { NamingConvention, NameSubjectKind } from '@rpg/contracts/name-generator'
import { NAME_SUBJECT_KINDS } from '@rpg/contracts/name-generator'

export function deriveAvailableSubjectKinds({
  cultureIds,
  conventions,
  resolveConventionCultureId = (cultureId) => cultureId,
}: {
  cultureIds: readonly string[]
  conventions: readonly NamingConvention[]
  resolveConventionCultureId?: (cultureId: string) => string
}): NameSubjectKind[] {
  const cultureIdSet = new Set<string>()
  for (const cultureId of cultureIds) {
    cultureIdSet.add(cultureId)
    cultureIdSet.add(resolveConventionCultureId(cultureId))
  }

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
