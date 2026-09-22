import type { OrganizationReferenceResolution } from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'

import { EditOrganizationMembershipDrawer } from '../../connections/edit-organization-membership-drawer'
import {
  CHARACTER_SHEET_EDIT_MEMBERSHIP_COPY,
  type EditOrganizationMembershipOrganization,
} from '../../connections/edit-organization-membership-drawer.types'

type CharacterOrganizationMembershipDrawersProps = {
  characterName: string
  editingMembership: OrganizationReferenceResolution | null
  editingOrganization: EditOrganizationMembershipOrganization | null
  onEditingOpenChange: (open: boolean) => void
  onSave: (title?: string) => Promise<void>
  onRemove: () => Promise<void>
  unresolvedToRemove: OrganizationReferenceResolution | null
  unresolvedRemoveHeadline: string
  onUnresolvedOpenChange: (open: boolean) => void
  onRemoveUnresolved: () => Promise<void>
}

/** Edit/confirm chrome for sheet membership editing — add picker lives on the relationship field. */
export function CharacterOrganizationMembershipDrawers({
  characterName,
  editingMembership,
  editingOrganization,
  onEditingOpenChange,
  onSave,
  onRemove,
  unresolvedToRemove,
  unresolvedRemoveHeadline,
  onUnresolvedOpenChange,
  onRemoveUnresolved,
}: CharacterOrganizationMembershipDrawersProps) {
  return (
    <>
      {editingOrganization && editingMembership ? (
        <EditOrganizationMembershipDrawer
          key={`${editingMembership.organizationId}:${editingMembership.title ?? ''}`}
          open
          onOpenChange={onEditingOpenChange}
          organization={editingOrganization}
          characterName={characterName}
          currentTitle={editingMembership.title}
          onSave={onSave}
          onRemove={onRemove}
        />
      ) : null}

      {unresolvedToRemove ? (
        <ConfirmDialog
          open
          onOpenChange={onUnresolvedOpenChange}
          headline={unresolvedRemoveHeadline}
          description={CHARACTER_SHEET_EDIT_MEMBERSHIP_COPY.removeConfirmDescription}
          confirmLabel={CHARACTER_SHEET_EDIT_MEMBERSHIP_COPY.removeLabel}
          confirmVariant="destructive"
          onConfirm={() => {
            void onRemoveUnresolved()
          }}
        />
      ) : null}
    </>
  )
}
