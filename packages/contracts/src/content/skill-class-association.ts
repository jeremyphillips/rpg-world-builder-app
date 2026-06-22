import type { SkillProficiency } from './skill-proficiency'

/** Minimal skill fields needed for class↔skill association helpers. */
export type SkillClassAssociationSkill = Pick<SkillProficiency, 'slug' | 'suggestedClasses'>

/**
 * Skill slugs whose `suggestedClasses` includes `classSlug`.
 * Used to derive class skill menus from the skill-side SSOT.
 */
export function skillSlugsSuggestingClass(
  classSlug: string,
  skills: readonly SkillClassAssociationSkill[],
): string[] {
  return skills
    .filter((skill) => skill.suggestedClasses.includes(classSlug))
    .map((skill) => skill.slug)
    .sort((a, b) => a.localeCompare(b))
}

/** Added/removed skill slugs between two class skill-option lists (fan-out diff). */
export function diffClassSkillEdges(
  previousSkillSlugs: readonly string[],
  nextSkillSlugs: readonly string[],
): { added: string[]; removed: string[] } {
  const previous = new Set(previousSkillSlugs)
  const next = new Set(nextSkillSlugs)
  return {
    added: [...next].filter((slug) => !previous.has(slug)).sort((a, b) => a.localeCompare(b)),
    removed: [...previous].filter((slug) => !next.has(slug)).sort((a, b) => a.localeCompare(b)),
  }
}
