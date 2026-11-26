import {
  classHasSpellcasting,
  classSlugReferenceEdge,
  collectCatalogReferenceIssues,
  getContentTypeCapitalizedSentenceLabel,
  type CharacterClass,
  type ContentValidationIntent,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

/**
 * Spell `classIds` are class slugs. Unresolved overlay targets are distinct from
 * unknown slugs. Spellcasting eligibility runs only for resolved classes.
 */
export function assertSpellClassIdsHaveSpellcasting(
  classIds: string[],
  resolvedClasses: CharacterClass[],
  unresolvedSlugs: ReadonlySet<string> = new Set(),
  intent: ContentValidationIntent = 'publish',
): void {
  const bySlug = new Map(resolvedClasses.map((cls) => [cls.slug, cls]))
  const issues = collectCatalogReferenceIssues({
    policy: classSlugReferenceEdge.policy,
    intent,
    catalogStatus: 'ready',
    refs: classIds.map((key, index) => ({ path: `classIds.${index}`, key })),
    resolve: (key) => bySlug.get(key),
    unavailablePlacement: classSlugReferenceEdge.unavailablePlacement,
    messages: classSlugReferenceEdge.messages,
    unresolvedOverlayTargetKeys: unresolvedSlugs,
  })

  const withoutSpellcasting = classIds
    .map((slug, index) => ({ slug, index }))
    .filter(({ slug }) => {
      if (unresolvedSlugs.has(slug)) return false
      const cls = bySlug.get(slug)
      return cls != null && !classHasSpellcasting(cls)
    })

  if (issues.length === 0 && withoutSpellcasting.length === 0) return

  const messages = issues.map((issue) => issue.message)
  if (withoutSpellcasting.length > 0) {
    messages.push(
      `${getContentTypeCapitalizedSentenceLabel('classes', {
        plural: withoutSpellcasting.length !== 1,
      })} without spellcasting: ${withoutSpellcasting
        .map(({ slug }) => `"${bySlug.get(slug)?.name ?? slug}"`)
        .join(', ')}.`,
    )
  }

  throw new HttpError(400, 'validation_error', messages.join(' '), { issues })
}
