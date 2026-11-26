import {
  classHasSpellcasting,
  classSlugReferenceEdge,
  collectCatalogReferenceIssues,
  SPELL_CLASS_REFERENCE_ISSUE_CODE,
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

  const spellcastingIssues = withoutSpellcasting.map(({ slug, index }) => ({
    path: `classIds.${index}`,
    code: SPELL_CLASS_REFERENCE_ISSUE_CODE.classWithoutSpellcasting,
    message: `Class "${bySlug.get(slug)?.name ?? slug}" does not have spellcasting.`,
  }))

  const allIssues = [...issues, ...spellcastingIssues]
  if (allIssues.length === 0) return

  throw new HttpError(400, 'validation_error', allIssues.map((issue) => issue.message).join(' '), {
    issues: allIssues,
  })
}
