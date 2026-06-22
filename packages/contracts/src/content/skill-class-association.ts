import type { CharacterClass, ClassStored } from './class/class'
import type { SkillId, SkillProficiency } from './skill-proficiency'

/** Minimal skill fields needed for class↔skill association helpers. */
export type SkillClassAssociationSkill = Pick<SkillProficiency, 'slug' | 'suggestedClasses'>

/**
 * Skill slugs whose `suggestedClasses` includes `classSlug`.
 * Used to derive class skill menus from the skill-side SSOT.
 */
export function skillSlugsSuggestingClass(
  classSlug: string,
  skills: readonly SkillClassAssociationSkill[],
): SkillId[] {
  return skills
    .filter((skill) => skill.suggestedClasses.includes(classSlug))
    .map((skill) => skill.slug as SkillId)
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

/** Attach API-derived `proficiencies.skills.from` from the skill-side SSOT. */
export function withDerivedClassSkillFrom(
  cls: ClassStored,
  skills: readonly SkillClassAssociationSkill[],
): CharacterClass {
  return {
    ...cls,
    proficiencies: {
      ...cls.proficiencies,
      skills: {
        choose: cls.proficiencies.skills.choose,
        from: skillSlugsSuggestingClass(cls.slug, skills),
      },
    },
  }
}

/** Derive read models for a class list (stable sort on `from`). */
export function deriveClassesSkillFrom(
  classes: readonly ClassStored[],
  skills: readonly SkillClassAssociationSkill[],
): CharacterClass[] {
  return classes.map((cls) => withDerivedClassSkillFrom(cls, skills))
}

/** Remove transient `proficiencies.skills.from` before persisting a class write. */
export function stripClassSkillFromFromInput(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const proficiencies = input.proficiencies
  if (!proficiencies || typeof proficiencies !== 'object') return input

  const skills = (proficiencies as Record<string, unknown>).skills
  if (!skills || typeof skills !== 'object') return input

  const { from: _from, ...skillsWithoutFrom } = skills as Record<string, unknown>
  return {
    ...input,
    proficiencies: {
      ...(proficiencies as Record<string, unknown>),
      skills: skillsWithoutFrom,
    },
  }
}
