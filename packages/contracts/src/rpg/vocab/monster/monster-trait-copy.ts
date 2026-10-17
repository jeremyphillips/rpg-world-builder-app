import { getContentTypeSentenceForm } from '../../primitives/content/content-type-terms'

/** Section heading for monster trait lists on stat blocks and authoring. */
export function getMonsterTraitSectionLabel(): string {
  return 'Traits'
}

/** Empty-state copy when a monster has no traits. */
export function getMonsterTraitEmptySectionMessage(): string {
  return `No ${getContentTypeSentenceForm('monsters', 2)} traits.`
}
