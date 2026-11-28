import {
  classSlugReferenceEdge,
  collectCatalogReferenceIssues,
  type CharacterClass,
  type ContentValidationIntent,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

function collectClassSlugsFromCharacterCreation(
  characterCreation: Record<string, unknown> | undefined,
): Array<{ path: string; key: string }> {
  if (!characterCreation) return []

  const refs: Array<{ path: string; key: string }> = []
  const multiclassing = characterCreation.multiclassing as
    | { classPolicy?: { classIds?: string[] } }
    | undefined
  multiclassing?.classPolicy?.classIds?.forEach((key, index) => {
    refs.push({
      path: `characterCreation.multiclassing.classPolicy.classIds.${index}`,
      key,
    })
  })

  const levelLimits = characterCreation.levelLimits as
    | { classLevelCaps?: { classId: string }[] }
    | undefined
  levelLimits?.classLevelCaps?.forEach((cap, index) => {
    refs.push({
      path: `characterCreation.levelLimits.classLevelCaps.${index}.classId`,
      key: cap.classId,
    })
  })

  return refs
}

/**
 * Species multiclass and level-cap class references are slugs. `unresolvedSlugs`
 * are catalog rows omitted because overlay apply failed (not missing classes).
 */
export function assertSpeciesClassSlugsExist(
  classSlugs: string[],
  resolvedClasses: CharacterClass[],
  unresolvedSlugs: ReadonlySet<string> = new Set(),
  intent: ContentValidationIntent = 'publish',
): void {
  if (classSlugs.length === 0) return
  assertSpeciesClassSlugRefs(
    classSlugs.map((key, index) => ({ path: `classIds.${index}`, key })),
    resolvedClasses,
    unresolvedSlugs,
    intent,
  )
}

export function assertSpeciesClassSlugsFromInput(
  input: Record<string, unknown>,
  resolvedClasses: CharacterClass[],
  unresolvedSlugs: ReadonlySet<string> = new Set(),
  intent: ContentValidationIntent = 'publish',
): void {
  const characterCreation = input.characterCreation as Record<string, unknown> | undefined
  const refs = collectClassSlugsFromCharacterCreation(characterCreation)
  assertSpeciesClassSlugRefs(refs, resolvedClasses, unresolvedSlugs, intent)
}

function assertSpeciesClassSlugRefs(
  refs: readonly { path: string; key: string }[],
  resolvedClasses: CharacterClass[],
  unresolvedSlugs: ReadonlySet<string>,
  intent: ContentValidationIntent,
): void {
  if (refs.length === 0) return
  const bySlug = new Map(resolvedClasses.map((cls) => [cls.slug, cls]))
  const issues = collectCatalogReferenceIssues({
    policy: classSlugReferenceEdge.policy,
    intent,
    catalogStatus: 'ready',
    refs,
    resolve: (key) => bySlug.get(key),
    unavailablePlacement: classSlugReferenceEdge.unavailablePlacement,
    messages: classSlugReferenceEdge.messages,
    unresolvedOverlayTargetKeys: unresolvedSlugs,
  })
  if (issues.length === 0) return
  throw new HttpError(400, 'validation_error', issues.map((issue) => issue.message).join(' '), {
    issues,
  })
}
