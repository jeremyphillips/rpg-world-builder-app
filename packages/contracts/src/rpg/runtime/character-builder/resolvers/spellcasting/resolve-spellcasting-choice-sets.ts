import type { Spell } from '../../../../content/spell'
import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../../content/classes/spellcasting'
import {
  resolveCompiledChoiceProgressionQuotaAtLevel,
  type CompiledSpellcastingChoiceProgression,
  type ResolvedClassSpellcasting,
} from '../../../creature/resolve-class-spellcasting'
import { getSpellCollectionKindLabel } from '../../../../vocab/spell/spell-collection-kind'
import type { SpellChoiceSource } from '../../../../vocab/spell/spell-choice-source'
import { buildChoiceSetId, type ChoiceSet, type ChoiceSetOption } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { BuilderSpellcastingProfile } from './builder-spellcasting'

export function spellcastingChoiceSetId(classId: string, suffix: string): string {
  return buildChoiceSetId('spellcasting', classId, suffix)
}

function labelForProgression(progression: CompiledSpellcastingChoiceProgression): string {
  return progression.label || getSpellCollectionKindLabel(progression.destination)
}

function spellLevelPredicate(
  progression: CompiledSpellcastingChoiceProgression,
  maxSelectableSpellLevel: number,
): (spell: Spell) => boolean {
  if (progression.destination === 'cantrips') {
    return (spell) => spell.level === 0
  }
  return (spell) => spell.level >= 1 && spell.level <= maxSelectableSpellLevel
}

function spellOptionsFromClassList(
  catalogIndex: CharacterBuildCatalogIndex,
  classSlug: string,
  predicate: (spell: Spell) => boolean,
): ChoiceSetOption[] {
  return [...catalogIndex.spells.values()]
    .filter((spell) => spell.classIds.includes(classSlug) && predicate(spell))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((spell) => ({ id: spell.id, label: spell.name }))
}

function writerProgressionsForCollection(
  resolved: ResolvedClassSpellcasting,
  collection: Extract<SpellChoiceSource, { kind: 'collection' }>['collection'],
): CompiledSpellcastingChoiceProgression[] {
  return resolved.choiceProgressions.filter((progression) => progression.destination === collection)
}

function spellOptionsFromCollectionSource(
  draft: CharacterBuilderDraft,
  classId: string,
  source: Extract<SpellChoiceSource, { kind: 'collection' }>,
  resolved: ResolvedClassSpellcasting,
  catalogIndex: CharacterBuildCatalogIndex,
  maxSelectableSpellLevel: number,
): ChoiceSetOption[] {
  const writerProgressions = writerProgressionsForCollection(resolved, source.collection)

  const spellIds = new Set<string>()
  for (const progression of writerProgressions) {
    const choiceSetId = spellcastingChoiceSetId(classId, progression.suffix)
    for (const spellId of draft.choiceSelections[choiceSetId] ?? []) {
      spellIds.add(spellId)
    }
  }

  return [...spellIds]
    .map((spellId) => catalogIndex.spells.get(spellId))
    .filter((spell): spell is Spell => spell !== undefined)
    .filter((spell) => spell.level >= 1 && spell.level <= maxSelectableSpellLevel)
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((spell) => ({ id: spell.id, label: spell.name }))
}

function resolveSpellOptions(
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  progression: CompiledSpellcastingChoiceProgression,
  characterClassSlug: string,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSetOption[] {
  const predicate = spellLevelPredicate(progression, profile.maxSelectableSpellLevel)

  if (progression.source.kind === 'classList') {
    return spellOptionsFromClassList(catalogIndex, characterClassSlug, predicate)
  }

  return spellOptionsFromCollectionSource(
    draft,
    profile.classId,
    progression.source,
    profile.resolved,
    catalogIndex,
    profile.maxSelectableSpellLevel,
  )
}

function choiceTypeForProgression(
  progression: CompiledSpellcastingChoiceProgression,
): ChoiceSet['choiceType'] {
  return progression.destination === 'cantrips' ? 'cantrip' : 'spell'
}

function resolveClassCantripChoiceSet(
  profile: BuilderSpellcastingProfile,
  characterClassSlug: string,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet | null {
  const quota = profile.cantripsKnown
  if (quota <= 0) return null

  return {
    id: spellcastingChoiceSetId(profile.classId, CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips),
    sourceType: 'spellcasting',
    sourceId: profile.classId,
    choiceType: 'cantrip',
    label: 'Cantrips',
    min: quota,
    max: quota,
    options: spellOptionsFromClassList(
      catalogIndex,
      characterClassSlug,
      (spell) => spell.level === 0,
    ),
    required: true,
    requiredToComplete: true,
  }
}

/** Builds class cantrip capacity plus one ChoiceSet per applicable compiled progression. */
export function resolveSpellcastingChoiceSets(
  profile: BuilderSpellcastingProfile,
  characterClassSlug: string,
  catalogIndex: CharacterBuildCatalogIndex,
  draft: CharacterBuilderDraft,
): ChoiceSet[] {
  const choiceSets: ChoiceSet[] = []

  const cantripChoiceSet = resolveClassCantripChoiceSet(profile, characterClassSlug, catalogIndex)
  if (cantripChoiceSet) {
    choiceSets.push(cantripChoiceSet)
  }

  for (const progression of profile.resolved.choiceProgressions) {
    if (progression.suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips) continue

    const quota = resolveCompiledChoiceProgressionQuotaAtLevel(progression, profile.classLevel)
    if (quota <= 0) continue

    choiceSets.push({
      id: spellcastingChoiceSetId(profile.classId, progression.suffix),
      sourceType: 'spellcasting',
      sourceId: profile.classId,
      choiceType: choiceTypeForProgression(progression),
      label: labelForProgression(progression),
      min: quota,
      max: quota,
      options: resolveSpellOptions(draft, profile, progression, characterClassSlug, catalogIndex),
      required: true,
      requiredToComplete: true,
    })
  }

  return choiceSets
}
