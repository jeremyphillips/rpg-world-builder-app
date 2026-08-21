import type { ClassStored } from './classes/class'
import type { SkillId } from './skill-proficiency'
import { isMeaningfulProficiencyChoice } from './lib/grants/proficiency-grant-set'

/** Minimal class fields for class-owned skill choice read helpers. */
export type ClassSkillChoiceSource = Pick<ClassStored, 'slug' | 'characterCreation'>

function meaningfulSkillChoices(cls: ClassSkillChoiceSource) {
  return (cls.characterCreation?.proficiencies?.skills?.choices ?? []).filter(
    isMeaningfulProficiencyChoice,
  )
}

/** Skill slugs offered in any meaningful class skill choice group. */
export function skillSlugsFromClassChoices(cls: ClassSkillChoiceSource): SkillId[] {
  const slugs = new Set<string>()
  for (const choice of meaningfulSkillChoices(cls)) {
    for (const slug of choice.from) {
      slugs.add(slug)
    }
  }
  return [...slugs].sort((a, b) => a.localeCompare(b)) as SkillId[]
}

/** Display summary for class skill choice pools — choose from first meaningful package. */
export function classSkillChoiceDisplaySummary(cls: ClassSkillChoiceSource): {
  choose: number
  optionSlugs: SkillId[]
} {
  const meaningful = meaningfulSkillChoices(cls)
  if (meaningful.length === 0) {
    return { choose: 0, optionSlugs: [] }
  }

  return {
    choose: meaningful[0]!.choose,
    optionSlugs: skillSlugsFromClassChoices(cls),
  }
}

/** Class records whose skill choice pools include `skillSlug` (inverse read). */
export type ClassOfferingSkillChoice = Pick<
  ClassStored,
  'slug' | 'id' | 'name' | 'characterCreation'
>

export function classesOfferingSkillChoice(
  skillSlug: string,
  classes: readonly ClassOfferingSkillChoice[],
): ClassOfferingSkillChoice[] {
  return classes
    .filter((cls) => meaningfulSkillChoices(cls).some((choice) => choice.from.includes(skillSlug)))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}
