'use client'

import { ConfirmDialog } from '@rpg/ui'

import { EditOrganizationMembershipDrawer } from '../../components/connections/edit-organization-membership-drawer.client'
import {
  CHARACTER_SHEET_EDIT_MEMBERSHIP_COPY,
  type EditOrganizationMembershipOrganization,
} from '../../components/connections/edit-organization-membership-drawer.types'
import { OrganizationPickerDrawer } from '../../components/connections/organization-picker-drawer.client'
import type { OrganizationMembershipSelection } from '../../components/connections/organization-picker-drawer.types'
import type { OrganizationPickerItem } from '../../components/connections/organization-picker-drawer.types'
import type { OrganizationReferenceResolution } from '@rpg/contracts'

type CharacterOrganizationMembershipDrawersProps = {
  characterName: string
  pickerOpen: boolean
  onPickerOpenChange: (open: boolean) => void
  pickerItems: readonly OrganizationPickerItem[]
  onAdd: (membership: OrganizationMembershipSelection) => Promise<void>
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

/** Drawer/confirm chrome for sheet membership editing — keeps the container presentation-thin. */
export function CharacterOrganizationMembershipDrawers({
  characterName,
  pickerOpen,
  onPickerOpenChange,
  pickerItems,
  onAdd,
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
      <OrganizationPickerDrawer
        open={pickerOpen}
        onOpenChange={onPickerOpenChange}
        items={pickerItems}
        onAdd={onAdd}
      />

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
