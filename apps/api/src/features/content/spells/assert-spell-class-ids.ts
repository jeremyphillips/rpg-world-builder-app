import { classHasSpellcasting, type CharacterClass } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

/**
 * Ensures every spell `classIds` slug references a campaign-resolved class with
 * spellcasting (system seed, overlay patch, or homebrew).
 */
export function assertSpellClassIdsHaveSpellcasting(
  classIds: string[],
  resolvedClasses: CharacterClass[],
): void {
  const bySlug = new Map(resolvedClasses.map((cls) => [cls.slug, cls]))
  const unknown: string[] = []
  const withoutSpellcasting: string[] = []

  for (const slug of classIds) {
    const cls = bySlug.get(slug)
    if (!cls) {
      unknown.push(slug)
      continue
    }
    if (!classHasSpellcasting(cls)) {
      withoutSpellcasting.push(slug)
    }
  }

  if (unknown.length === 0 && withoutSpellcasting.length === 0) {
    return
  }

  const parts: string[] = []
  if (unknown.length > 0) {
    const label = unknown.length === 1 ? 'class' : 'classes'
    parts.push(`Unknown ${label}: ${unknown.map((slug) => `"${slug}"`).join(', ')}.`)
  }
  if (withoutSpellcasting.length > 0) {
    const label = withoutSpellcasting.length === 1 ? 'Class' : 'Classes'
    parts.push(
      `${label} without spellcasting: ${withoutSpellcasting
        .map((slug) => `"${bySlug.get(slug)?.name ?? slug}"`)
        .join(', ')}.`,
    )
  }

  throw new HttpError(400, 'validation_error', parts.join(' '))
}
