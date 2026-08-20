'use client'

import type { Organization } from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'

import {
  EditOrganizationMembershipDrawer,
  formatRemoveMembershipHeadline,
  QuickNpcCreateModal,
} from '@/features/character'
import type { EditOrganizationMembershipOrganization } from '@/features/character/components/connections/edit-organization-membership-drawer.types'

import type { useOrganizationMembersDetail } from '../../hooks/use-organization-members-detail.client'
import { ORGANIZATION_ROSTER_EDIT_MEMBERSHIP_COPY } from '../../lib/members/organization-members.constants'
import { OrganizationMemberPickerDrawer } from './organization-member-picker-drawer.client'

type OrganizationMembersDetail = ReturnType<typeof useOrganizationMembersDetail>

type EditableOrganization = EditOrganizationMembershipOrganization & {
  functions?: Organization['functions']
  practices?: Organization['practices']
}

function toEditableOrganization(organization: Organization): EditableOrganization {
  return {
    id: organization.id,
    name: organization.name,
    organizationDomain: organization.organizationDomain,
    functions: organization.functions,
    practices: organization.practices,
    members: {
      classAffinityIds: organization.members.classAffinityIds,
      speciesAffinityIds: organization.members.speciesAffinityIds,
      titles: organization.members.titles,
    },
    ...(organization.organizationForm !== undefined
      ? { organizationForm: organization.organizationForm }
      : {}),
  }
}

/** Manager-only membership drawers — kept out of the section shell for complexity. */
export function OrganizationMembersDetailDrawers({
  organization,
  detail,
}: {
  organization: Organization
  detail: OrganizationMembersDetail
}) {
  if (!detail.canManage) return null

  const editableOrganization = toEditableOrganization(organization)
  const buildContext = detail.quickNpc.buildContext

  return (
    <>
      <OrganizationMemberPickerDrawer
        open={detail.drawerState?.mode === 'add' || detail.drawerState?.mode === 'createNpc'}
        onOpenChange={(open) => {
          if (!open) detail.closeDrawer()
        }}
        organization={editableOrganization}
        candidates={detail.candidates}
        candidatesLoading={detail.candidatesPending}
        onAdd={detail.handleAddMember}
        memberSelectionPolicy={detail.memberSelectionPolicy}
        quickNpc={{
          enabled: true,
          buildContextFailed: detail.quickNpc.buildContextFailed,
          buildContextReady: buildContext != null,
        }}
        onCreateNpc={detail.openCreateNpcModal}
      />

      {buildContext && detail.drawerState?.mode === 'createNpc' ? (
        <QuickNpcCreateModal
          open
          onOpenChange={(open) => {
            if (!open) detail.cancelCreateNpcModal()
          }}
          campaignId={detail.quickNpc.campaignId}
          buildContext={buildContext}
          context={{ kind: 'organization-member', organization: editableOrganization }}
          onCancel={detail.cancelCreateNpcModal}
          onCreated={detail.handleQuickNpcContentCreated}
        />
      ) : null}

      {detail.editingRow ? (
        <EditOrganizationMembershipDrawer
          key={`${detail.editingRow.characterId}:${detail.editingRow.title ?? ''}`}
          open
          onOpenChange={(open) => {
            if (!open) detail.closeDrawer()
          }}
          organization={editableOrganization}
          characterName={detail.editingRow.name}
          currentTitle={detail.editingRow.title}
          copy={ORGANIZATION_ROSTER_EDIT_MEMBERSHIP_COPY}
          onSave={detail.handleSaveMembership}
          onRemove={detail.handleRemoveFromEditDrawer}
        />
      ) : null}

      {detail.removingRow ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) detail.closeDrawer()
          }}
          headline={formatRemoveMembershipHeadline(detail.removingRow.name, organization.name)}
          description={ORGANIZATION_ROSTER_EDIT_MEMBERSHIP_COPY.removeConfirmDescription}
          confirmLabel={ORGANIZATION_ROSTER_EDIT_MEMBERSHIP_COPY.removeLabel}
          confirmVariant="destructive"
          onConfirm={() => {
            void detail.handleConfirmRemoveMember()
          }}
        />
      ) : null}
    </>
  )
}
