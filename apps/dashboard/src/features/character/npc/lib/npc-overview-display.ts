import type { NpcListCharacterSummary } from '@rpg/contracts'
import type { CharacterBuildCatalogIndex } from '@rpg/contracts'

import { formatContentReferenceLabel } from '../../lib/display/format-content-reference-label'

export function resolveNpcOverviewClassName(
  character: Pick<NpcListCharacterSummary, 'classes'>,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const entry = character.classes[0]
  if (!entry) return '—'

  return catalogIndex.classes.get(entry.classId)?.name ?? formatContentReferenceLabel(entry.classId)
}

export function resolveNpcOverviewSpeciesName(
  character: Pick<NpcListCharacterSummary, 'species'>,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  return (
    catalogIndex.species.get(character.species.id)?.name ??
    formatContentReferenceLabel(character.species.id)
  )
}
