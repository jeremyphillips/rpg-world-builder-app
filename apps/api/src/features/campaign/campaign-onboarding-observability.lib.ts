type CampaignOnboardingDuplicateInvitesContext = {
  campaignId: string
  userId: string
  selectedInviteId: string
  acceptedInviteIds: readonly string[]
}

type CampaignOnboardingInviteAuditFailureContext = {
  campaignId: string
  linkedInviteId: string
  characterId: string
}

export function warnCampaignOnboardingDuplicateAcceptedInvites(
  context: CampaignOnboardingDuplicateInvitesContext,
): void {
  console.warn(
    `[campaign-onboarding-duplicate-accepted-invites] campaignId=${context.campaignId} ` +
      `userId=${context.userId} selectedInviteId=${context.selectedInviteId} ` +
      `acceptedInviteIds=${context.acceptedInviteIds.join(',')}`,
  )
}

export function warnCampaignOnboardingInviteAuditFailed(
  context: CampaignOnboardingInviteAuditFailureContext,
): void {
  console.warn(
    `[campaign-onboarding-invite-audit-failed] campaignId=${context.campaignId} ` +
      `linkedInviteId=${context.linkedInviteId} characterId=${context.characterId}`,
  )
}
