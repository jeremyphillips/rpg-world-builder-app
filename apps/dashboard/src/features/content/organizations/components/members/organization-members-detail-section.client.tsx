'use client'

import type { Organization } from '@rpg/contracts'

import { useOrganizationMembersDetail } from '../../hooks/use-organization-members-detail.client'
import { OrganizationMembersDetailDrawers } from './organization-members-detail-drawers.client'
import { OrganizationMembersSection } from './organization-members-section.client'

export function OrganizationMembersDetailSection({
  campaignId,
  organization,
}: {
  campaignId: string
  organization: Organization
}) {
  const detail = useOrganizationMembersDetail(campaignId, organization)

  return (
    <>
      <OrganizationMembersSection
        rows={detail.members.rows}
        total={detail.members.total}
        emptyText={detail.emptyText}
        canManage={detail.canManage}
        isPending={detail.membersQuery.isPending}
        isError={detail.membersQuery.isError}
        mutationError={detail.mutationError}
        pendingCharacterId={detail.pendingCharacterId}
        onAddMember={detail.canManage ? detail.openAddDrawer : undefined}
        onEditMembership={detail.canManage ? detail.openEditDrawer : undefined}
        onRemoveMember={detail.canManage ? detail.openRemoveConfirm : undefined}
      />
      <OrganizationMembersDetailDrawers organization={organization} detail={detail} />
    </>
  )
}
