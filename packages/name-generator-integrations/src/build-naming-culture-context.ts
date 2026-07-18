import type { NamingCultureContext } from '@rpg/contracts/name-generator'
import type { SpeciesCultureConfig } from '@rpg/contracts/rpg/content'
import {
  getSpeciesCultureDisplayName,
  getSpeciesCulturePrimaryId,
  getSpeciesLanguageAffinity,
} from '@rpg/contracts/rpg/content'

export function buildNamingCultureContext(species: {
  id: string
  slug: string
  culture?: SpeciesCultureConfig
  languageAffinities?: readonly string[]
}): NamingCultureContext {
  const cultureId = getSpeciesCulturePrimaryId({ slug: species.slug, culture: species.culture })

  return {
    cultureId,
    cultureLabel: getSpeciesCultureDisplayName({ slug: species.slug, culture: species.culture }),
    languageIds: getSpeciesLanguageAffinity(species),
  }
}
