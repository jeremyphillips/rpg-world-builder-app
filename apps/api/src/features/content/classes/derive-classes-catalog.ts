import { classSchema, type CharacterClass, type ClassStored } from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../content.service'
import { classContentConfig } from './classes.config'

/** Parse a single stored class record for API responses. */
export function parseClassReadModel(stored: ClassStored): CharacterClass {
  return classSchema.parse(stored)
}

/** Resolve campaign classes (class-owned proficiency choices). */
export async function resolveClassesForCampaign(campaignId: string): Promise<CharacterClass[]> {
  const storedClasses = await resolveCatalogForCampaign(classContentConfig, campaignId)
  return (storedClasses as ClassStored[]).map((cls) => parseClassReadModel(cls))
}
