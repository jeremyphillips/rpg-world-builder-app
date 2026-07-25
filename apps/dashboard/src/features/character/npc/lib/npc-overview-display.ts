import type { CharacterBuildCatalogIndex, NpcCharacter } from '@rpg/contracts'

import { formatContentReferenceLabel } from '../../lib/format-content-reference-label'

export function resolveNpcOverviewClassName(
  npc: Pick<NpcCharacter, 'classes'>,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const entry = npc.classes[0]
  if (!entry) return '—'

  return catalogIndex.classes.get(entry.classId)?.name ?? formatContentReferenceLabel(entry.classId)
}

export function resolveNpcOverviewSpeciesName(
  npc: Pick<NpcCharacter, 'species'>,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  return (
    catalogIndex.species.get(npc.species.id)?.name ?? formatContentReferenceLabel(npc.species.id)
  )
}
