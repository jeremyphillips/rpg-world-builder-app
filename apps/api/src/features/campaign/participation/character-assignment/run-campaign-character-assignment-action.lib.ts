import {
  isCampaignCharacterAssignmentFailureError,
  mapCampaignCharacterAssignmentFailureToHttpError,
} from './campaign-character-assignment-failure.lib'

export async function runCampaignCharacterAssignmentAction<T>(
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action()
  } catch (error) {
    if (isCampaignCharacterAssignmentFailureError(error)) {
      throw mapCampaignCharacterAssignmentFailureToHttpError(error.failure)
    }
    throw error
  }
}
