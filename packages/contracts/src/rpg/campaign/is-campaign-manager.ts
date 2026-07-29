import type { CampaignRole } from '../../shared/roles'

export function isCampaignManager(role: CampaignRole): boolean {
  return role === 'owner' || role === 'co-owner'
}
