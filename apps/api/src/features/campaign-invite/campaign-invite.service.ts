export { CAMPAIGN_INVITE_EXPIRY_DAYS } from '@rpg/contracts'

export {
  acceptCampaignInvite,
  resolveCampaignInviteByToken,
  type AcceptCampaignInviteInput,
  type AcceptCampaignInviteResult,
} from './accept-campaign-invite.service'
export {
  listCampaignInvitesForOverview,
  revokeCampaignInvite,
  shareCampaignInviteLink,
  type RevokeCampaignInviteInput,
  type ShareCampaignInviteLinkInput,
  type ShareCampaignInviteLinkResult,
} from './manage-campaign-invite.service'
export {
  sendCampaignInvite,
  type SendCampaignInviteInput,
  type SendCampaignInviteResult,
} from './send-campaign-invite.service'
