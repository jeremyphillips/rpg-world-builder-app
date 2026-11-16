import type { CharacterClass } from '../classes/class'
import type { MonsterBodyDraft } from '../monster'
import type { ContentValidationIssue } from '../lib/content-validation-issue'
import type { ContentValidationIntent } from '../lib/content-validation-intent'
import { collectCatalogReferenceIssues, monsterClassEdge } from '../lib/catalog-reference-issues'
import {
  isCreatureFamilyCompatible,
  type CreatureFamilyDefinition,
} from '../../vocab/creature-family'
import { joinInlineMetadata } from '../../primitives/inline-metadata'

export const MONSTER_CLASSIFICATION_UNRESOLVED = 'Unresolved reference'
export const MONSTER_CLASSIFICATION_DISABLED = 'Disabled'
export const MONSTER_CLASSIFICATION_DRAFT = 'Draft'

/** Resolved display names retain unavailable state; unknown ids are never silently omitted. */
export function formatMonsterClassificationReference(
  id: string,
  label?: string,
  note?: string,
): string {
  return joinInlineMetadata([
    label ?? id,
    label === undefined ? MONSTER_CLASSIFICATION_UNRESOLVED : note,
  ])
}

export type MonsterClassification = Pick<
  MonsterBodyDraft,
  'creatureType' | 'creatureFamilyIds' | 'classIds'
>

export type MonsterClassificationCatalogs = {
  creatureFamilies?: ReadonlyMap<string, CreatureFamilyDefinition & { status?: string }>
  classesById?: ReadonlyMap<string, CharacterClass>
}

export function collectMonsterClassificationIssues(
  monster: MonsterClassification,
  catalogs: MonsterClassificationCatalogs,
  intent: ContentValidationIntent,
): ContentValidationIssue[] {
  if (intent !== 'publish') return []
  const issues: ContentValidationIssue[] = collectCatalogReferenceIssues({
    policy: monsterClassEdge.policy,
    intent,
    catalogStatus: catalogs.classesById ? 'ready' : 'unavailable',
    refs: (monster.classIds ?? []).map((key, index) => ({ key, path: `classIds.${index}` })),
    resolve: (key) => catalogs.classesById?.get(key),
    unavailablePlacement: monsterClassEdge.unavailablePlacement,
    messages: monsterClassEdge.messages,
  })
  for (const [index, id] of (monster.creatureFamilyIds ?? []).entries()) {
    const family = catalogs.creatureFamilies?.get(id)
    const message = !catalogs.creatureFamilies
      ? 'Creature families could not be loaded. Try again before publishing.'
      : !family
        ? 'Choose a creature family from the vocabulary.'
        : family.status === 'disabled'
          ? 'This creature family is disabled.'
          : !isCreatureFamilyCompatible(family, monster.creatureType)
            ? 'This creature family is not compatible with the chosen creature type.'
            : undefined
    if (message)
      issues.push({ path: `creatureFamilyIds.${index}`, code: 'invalid_creature_family', message })
  }
  return issues
}

export function formatMonsterClassification(
  monster: MonsterClassification,
  options: {
    creatureTypeLabel: string
    familyLabel?: (id: string) => string
    classLabel?: (id: string) => string
  },
): string {
  const labels = [
    ...(monster.creatureFamilyIds ?? []).map(
      (id) => options.familyLabel?.(id) ?? formatMonsterClassificationReference(id),
    ),
    ...(monster.classIds ?? []).map(
      (id) => options.classLabel?.(id) ?? formatMonsterClassificationReference(id),
    ),
  ]
  return labels.length
    ? `${options.creatureTypeLabel} (${labels.join(', ')})`
    : options.creatureTypeLabel
}
