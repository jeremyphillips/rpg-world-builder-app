import type { CampaignCharacterParticipation } from './campaign-character-participation'

/** Open participation = participation record with no leftAt. */
export function isOpenParticipation(
  participation: Pick<CampaignCharacterParticipation, 'leftAt'>,
): boolean {
  return participation.leftAt === undefined
}
