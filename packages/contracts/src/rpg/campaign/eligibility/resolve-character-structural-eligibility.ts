import { createCharacterInputSchema } from '../../runtime/character/create-input'
import type { CharacterEligibilitySubject } from './character-eligibility-subject'
import type { CharacterCampaignBlockingIssue } from './character-campaign-eligibility'

export type ResolveCharacterStructuralEligibilityInput = {
  subject: CharacterEligibilitySubject
}

export type ResolveCharacterStructuralEligibilityResult = {
  blockingIssues: CharacterCampaignBlockingIssue[]
}

export function resolveCharacterStructuralEligibility({
  subject,
}: ResolveCharacterStructuralEligibilityInput): ResolveCharacterStructuralEligibilityResult {
  const { userId: _userId, id: _id, ...createInput } = subject
  const parsed = createCharacterInputSchema.safeParse(createInput)

  if (!parsed.success) {
    return { blockingIssues: [{ code: 'structurally_invalid' }] }
  }

  return { blockingIssues: [] }
}
