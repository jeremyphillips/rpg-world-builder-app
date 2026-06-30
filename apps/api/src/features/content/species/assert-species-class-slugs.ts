import type { CharacterClass } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

function collectClassSlugsFromCharacterCreation(
  characterCreation: Record<string, unknown> | undefined,
): string[] {
  if (!characterCreation) return []

  const slugs: string[] = []
  const multiclassing = characterCreation.multiclassing as
    | { classPolicy?: { classIds?: string[] } }
    | undefined
  if (multiclassing?.classPolicy?.classIds) {
    slugs.push(...multiclassing.classPolicy.classIds)
  }

  const levelLimits = characterCreation.levelLimits as
    | { classLevelCaps?: { classId: string }[] }
    | undefined
  if (levelLimits?.classLevelCaps) {
    slugs.push(...levelLimits.classLevelCaps.map((cap) => cap.classId))
  }

  return slugs
}

/**
 * Ensures species multiclassing / level-limit class references resolve to a
 * campaign class slug (system seed, overlay patch, or homebrew).
 */
export function assertSpeciesClassSlugsExist(
  classSlugs: string[],
  resolvedClasses: CharacterClass[],
): void {
  if (classSlugs.length === 0) return

  const bySlug = new Map(resolvedClasses.map((cls) => [cls.slug, cls]))
  const unknown: string[] = []

  for (const slug of classSlugs) {
    if (!bySlug.has(slug)) {
      unknown.push(slug)
    }
  }

  if (unknown.length === 0) return

  const label = unknown.length === 1 ? 'class' : 'classes'
  throw new HttpError(
    400,
    'validation_error',
    `Unknown ${label}: ${unknown.map((slug) => `"${slug}"`).join(', ')}.`,
  )
}

/** Collects class slugs from a species write payload and validates them. */
export function assertSpeciesClassSlugsFromInput(
  input: Record<string, unknown>,
  resolvedClasses: CharacterClass[],
): void {
  const characterCreation = input.characterCreation as Record<string, unknown> | undefined
  const slugs = collectClassSlugsFromCharacterCreation(characterCreation)
  assertSpeciesClassSlugsExist(slugs, resolvedClasses)
}
