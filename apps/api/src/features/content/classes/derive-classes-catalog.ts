import {
  classSchema,
  deriveClassesSkillFrom,
  type CharacterClass,
  type ClassStored,
} from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../content.service'
import { skillProficiencyWriteConfig } from '../skill-proficiencies/skill-proficiencies.config'
import { classContentConfig } from './classes.config'

/** Resolve campaign classes with API-derived `proficiencies.skills.from`. */
export async function resolveClassesForCampaign(campaignId: string): Promise<CharacterClass[]> {
  const [storedClasses, skills] = await Promise.all([
    resolveCatalogForCampaign(classContentConfig, campaignId),
    resolveCatalogForCampaign(skillProficiencyWriteConfig.readConfig, campaignId),
  ])

  return deriveClassesSkillFrom(storedClasses as ClassStored[], skills).map((cls) =>
    classSchema.parse(cls),
  )
}

/** Attach derived skill options to a single stored class record. */
export async function enrichClassWithDerivedSkills(
  campaignId: string,
  stored: ClassStored,
): Promise<CharacterClass> {
  const skills = await resolveCatalogForCampaign(skillProficiencyWriteConfig.readConfig, campaignId)
  return classSchema.parse(deriveClassesSkillFrom([stored], skills)[0])
}
