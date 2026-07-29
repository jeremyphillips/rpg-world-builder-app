import { equipmentInventoryUsageMongoOrClauses, type ApiContentTypeKey } from '@rpg/contracts'

/**
 * Returns a Mongo filter fragment merged into campaign participant character queries.
 * Skill proficiencies match on slug — characters store skill slugs, not envelope ids.
 */
export function getContentCharacterUsageMatcher(
  contentType: ApiContentTypeKey,
  contentId: string,
  contentSlug: string,
): Record<string, unknown> {
  switch (contentType) {
    case 'classes':
      return { 'classes.classId': contentId }
    case 'species':
      return { 'species.id': contentId }
    case 'spells':
      return { 'spells.spellId': contentId }
    case 'feats':
      return { 'feats.featId': contentId }
    case 'equipment':
      return {
        $or: equipmentInventoryUsageMongoOrClauses(contentId),
      }
    case 'skill-proficiencies':
      return { 'proficiencies.skills.skill': contentSlug }
    default: {
      const _exhaustive: never = contentType
      return _exhaustive
    }
  }
}
