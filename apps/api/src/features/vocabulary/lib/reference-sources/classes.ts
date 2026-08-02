import { flattenGrantGroups, resolveGrantGroupsFromContent } from '@rpg/contracts'
import type { ContentGrant, GrantGroups } from '@rpg/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function collectLanguageIdsFromGrant(grant: ContentGrant, languageIds: Set<string>): void {
  switch (grant.kind) {
    case 'languages':
      for (const id of grant.languageIds) languageIds.add(id)
      break
    case 'languageChoice':
      if (grant.from) {
        for (const id of grant.from) languageIds.add(id)
      }
      break
  }
}

function collectLanguageIdsFromFeature(feature: unknown, languageIds: Set<string>): void {
  if (!isRecord(feature)) return

  const groups = resolveGrantGroupsFromContent(
    {
      kind: String(feature.kind ?? 'custom'),
      grantGroups: feature.grantGroups as GrantGroups | undefined,
    },
    { level: typeof feature.level === 'number' ? feature.level : 1 },
  )

  for (const { grant } of flattenGrantGroups(groups)) {
    collectLanguageIdsFromGrant(grant, languageIds)
  }
}

export function extractClassLanguageIds(record: {
  features?: readonly unknown[]
}): readonly string[] {
  const languageIds = new Set<string>()
  for (const feature of record.features ?? []) {
    collectLanguageIdsFromFeature(feature, languageIds)
  }
  return [...languageIds]
}
