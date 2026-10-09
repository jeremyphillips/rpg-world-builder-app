import {
  getContentTypeCapitalizedSentenceLabel,
  getContentTypeSentenceForm,
} from '../../primitives/content/content-type-terms'

/** Section heading for species trait lists (sheet, builder, authoring). */
export function getSpeciesTraitSectionLabel(): string {
  return `${getContentTypeCapitalizedSentenceLabel('species')} traits`
}

/** Empty-state copy when a character has no species traits recorded. */
export function getSpeciesTraitEmptySectionMessage(): string {
  return `No ${getContentTypeSentenceForm('species', 2)} traits.`
}
