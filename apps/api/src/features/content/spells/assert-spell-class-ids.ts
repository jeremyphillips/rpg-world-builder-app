import {
  classHasSpellcasting,
  classSlugReferenceEdge,
  collectCatalogReferenceIssues,
  getContentTypeCapitalizedSentenceLabel,
  getContentTypeSentenceForm,
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
    unresolvedOverlayTargetIds: unresolvedSlugs,
  })

  const withoutSpellcasting = classIds.filter((slug) => {
    if (unresolvedSlugs.has(slug)) return false
    const cls = bySlug.get(slug)
    return cls != null && !classHasSpellcasting(cls)
  })

  if (issues.length === 0 && withoutSpellcasting.length === 0) return

  const unknown = classIds.filter((slug) => !bySlug.has(slug) && !unresolvedSlugs.has(slug))
  const parts: string[] = []
  if (unknown.length > 0) {
    parts.push(
      `Unknown ${getContentTypeSentenceForm('classes', unknown.length)}: ${unknown.map((slug) => `"${slug}"`).join(', ')}.`,
    )
  }
  if (issues.some((issue) => issue.code === 'unresolved_overlay_class')) {
    parts.push(classSlugReferenceEdge.messages.unresolvedOverlayTarget)
  }
  if (withoutSpellcasting.length > 0) {
    parts.push(
      `${getContentTypeCapitalizedSentenceLabel('classes', {
        plural: withoutSpellcasting.length !== 1,
      })} without spellcasting: ${withoutSpellcasting
        .map((slug) => `"${bySlug.get(slug)?.name ?? slug}"`)
        .join(', ')}.`,
    )
  }

  throw new HttpError(400, 'validation_error', parts.join(' '), { issues })
}
