import type { Character, CharacterBuildCatalogIndex, CharacterClassEntry } from '@rpg/contracts'
import { getCharacterTotalLevel, resolveTraitDisplay } from '@rpg/contracts'

import { formatContentReferenceLabel } from './format-content-reference-label'
import type { CharacterCardViewModel } from './character-display-types'

function resolveHeritageName(
  catalogIndex: CharacterBuildCatalogIndex,
  speciesRef: Character['species'],
): string | undefined {
  const heritageId = speciesRef.heritageId
  if (!heritageId) return undefined

  const species = catalogIndex.species.get(speciesRef.id)
  const heritageOption = species?.heritage?.options.find((option) => option.id === heritageId)
  return heritageOption
    ? resolveTraitDisplay(heritageOption).name
    : formatContentReferenceLabel(heritageId)
}

function resolveClassName(catalogIndex: CharacterBuildCatalogIndex, classId: string): string {
  return catalogIndex.classes.get(classId)?.name ?? formatContentReferenceLabel(classId)
}

function resolveSubclassLabel(subclassId: string | undefined): string | undefined {
  if (!subclassId) return undefined
  return formatContentReferenceLabel(subclassId)
}

function formatSingleClassSegment(
  entry: CharacterClassEntry,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const className = resolveClassName(catalogIndex, entry.classId)
  const subclassLabel = resolveSubclassLabel(entry.subclassId)
  return subclassLabel ? `${className} (${subclassLabel})` : className
}

function formatMulticlassSegment(
  entry: CharacterClassEntry,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const className = resolveClassName(catalogIndex, entry.classId)
  const subclassLabel = resolveSubclassLabel(entry.subclassId)
  const subclassPart = subclassLabel ? ` (${subclassLabel})` : ''
  return `${className} ${entry.level}${subclassPart}`
}

export function formatCharacterSummary(
  character: Pick<Character, 'classes' | 'species'>,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const species = catalogIndex.species.get(character.species.id)
  const speciesName = species?.name ?? formatContentReferenceLabel(character.species.id)
  const heritageName = resolveHeritageName(catalogIndex, character.species)
  const speciesPart = heritageName ? `${speciesName} (${heritageName})` : speciesName
  const totalLevel = getCharacterTotalLevel(character)

  const classPart =
    character.classes.length === 1
      ? formatSingleClassSegment(character.classes[0]!, catalogIndex)
      : character.classes.map((entry) => formatMulticlassSegment(entry, catalogIndex)).join(' / ')

  return `${speciesPart} · Level ${totalLevel} ${classPart}`
}

export function buildCharacterCardViewModel(
  character: Pick<Character, 'id' | 'name' | 'classes' | 'species'> & {
    campaign?: { id: string; name: string }
  },
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterCardViewModel {
  return {
    id: character.id,
    name: character.name,
    summary: formatCharacterSummary(character, catalogIndex),
    ...(character.campaign ? { campaign: character.campaign } : {}),
  }
}
