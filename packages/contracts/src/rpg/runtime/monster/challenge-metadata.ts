import { joinInlineMetadata } from '../../primitives/inline-metadata'
import { formatExperiencePoints, formatProficiencyBonus } from '../creature/communication'

export type MonsterChallengeMetadataInput = {
  experiencePoints: number
  proficiencyBonus: number
}

/** Inline CR reward metadata for monster stat blocks and authoring hints. */
export function formatMonsterChallengeMetadata(input: MonsterChallengeMetadataInput): string {
  return joinInlineMetadata([
    formatExperiencePoints(input.experiencePoints),
    formatProficiencyBonus(input.proficiencyBonus),
  ])
}
