'use client'

import type { Organization } from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'

import {
  EditOrganizationMembershipDrawer,
  formatRemoveMembershipHeadline,
} from '@/features/character'

import type { useOrganizationMembersDetail } from '../hooks/use-organization-members-detail.client'
import { ORGANIZATION_ROSTER_EDIT_MEMBERSHIP_COPY } from '../lib/organization-members.constants'
import { OrganizationMemberPickerDrawer } from './organization-member-picker-drawer.client'

type OrganizationMembersDetail = ReturnType<typeof useOrganizationMembersDetail>

type EditableOrganization = {
  id: string
  name: string
  organizationKind: Organization['organizationKind']
  organizationSubtype?: string
}

function toEditableOrganization(organization: Organization): EditableOrganization {
  return {
    id: organization.id,
    name: organization.name,
    organizationKind: organization.organizationKind,
    ...(organization.organizationSubtype !== undefined
      ? { organizationSubtype: organization.organizationSubtype }
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

  return (
    <>
      <OrganizationMemberPickerDrawer
        open={detail.drawerState?.mode === 'add'}
        onOpenChange={(open) => {
          if (!open) detail.closeDrawer()
        }}
        organization={editableOrganization}
        candidates={detail.candidates}
        onAdd={detail.handleAddMember}
        quickNpc={detail.quickNpc}
      />

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
