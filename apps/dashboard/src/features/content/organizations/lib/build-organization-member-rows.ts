import type { OrganizationMembersResponse, OrganizationMemberSummary } from '@rpg/contracts'

import {
  buildCharacterEntitySummaryVmFromTransport,
  formatCharacterInlineSummary,
} from '@/features/character'
import { resolveCampaignCharacterDetailHref } from '@/lib/routing/resolve-campaign-character-detail-href'

export type OrganizationMemberRowVm = {
  characterId: string
  characterType: OrganizationMemberSummary['characterType']
  name: string
  /** Membership title rendered inline after the name; absent for untitled memberships. */
  title?: string
  /** Effective roster priority — carried so edits can preserve an explicit custom-title priority. */
  priority?: number
  /** `PC · Dwarf · Level 1 Fighter` — the character identity line under the name. */
  identityLine: string
  detailHref: string
}

export type OrganizationMembersViewModel = {
  rows: OrganizationMemberRowVm[]
  total: number
  emptyText: string
}

export function buildOrganizationMemberRows(
  members: OrganizationMembersResponse,
  routeContext: { campaignId: string },
): { rows: OrganizationMemberRowVm[]; total: number } {
  return {
    rows: members.items.map((member) => {
      const summary = buildCharacterEntitySummaryVmFromTransport({
        id: member.character.id,
        name: member.character.name,
        summary: member.character.summary,
        characterType: member.characterType,
      })

      return {
        characterId: member.character.id,
        characterType: member.characterType,
        name: member.character.name,
        ...(member.membership.title !== undefined ? { title: member.membership.title } : {}),
        ...(member.membership.priority !== undefined
          ? { priority: member.membership.priority }
          : {}),
        identityLine: formatCharacterInlineSummary(summary, { includeCharacterType: true }),
        detailHref: resolveCampaignCharacterDetailHref(routeContext, member),
      }
    }),
    total: members.total,
  }
}
