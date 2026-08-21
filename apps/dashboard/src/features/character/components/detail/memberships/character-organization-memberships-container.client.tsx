'use client'

import { CharacterOrganizationMembershipDrawers } from './character-organization-membership-drawers.client'
import { useCharacterOrganizationMembershipsSheet } from '../../../hooks/use-character-organization-memberships-sheet.client'
import type { CharacterOrganizationMembershipSubjectKind } from '../../../lib/invalidate-character-organization-membership-queries'
import { CharacterOrganizationsSummary } from './character-organizations-summary.client'

export type CharacterOrganizationMembershipsContainerProps = {
  campaignId: string
  characterId: string
  characterName: string
  canEdit: boolean
  subjectKind: CharacterOrganizationMembershipSubjectKind
}

/** Owns membership queries, mutations, and chooser/editor drawers for campaign sheets. */
export function CharacterOrganizationMembershipsContainer({
  campaignId,
  characterId,
  characterName,
  canEdit,
  subjectKind,
}: CharacterOrganizationMembershipsContainerProps) {
  const sheet = useCharacterOrganizationMembershipsSheet({
    campaignId,
    characterId,
    characterName,
    canEdit,
    subjectKind,
  })

  if (sheet.isBootstrapping) return null

  return (
    <>
      <CharacterOrganizationsSummary
        campaignId={campaignId}
        memberships={sheet.memberships}
        canEdit={canEdit}
        onEditMembership={canEdit ? sheet.setEditingMembership : undefined}
        onRemoveUnresolvedMembership={canEdit ? sheet.setUnresolvedToRemove : undefined}
        onAddOrganization={canEdit ? () => sheet.setPickerOpen(true) : undefined}
      />
      {canEdit ? (
        <CharacterOrganizationMembershipDrawers
          characterName={characterName}
          pickerOpen={sheet.pickerOpen}
          onPickerOpenChange={sheet.setPickerOpen}
          pickerItems={sheet.pickerItems}
          onAdd={sheet.handleAdd}
          editingMembership={sheet.editingMembership}
          editingOrganization={sheet.editingOrganization}
          onEditingOpenChange={(open) => {
            if (!open) sheet.setEditingMembership(null)
          }}
          onSave={sheet.handleSave}
          onRemove={sheet.handleRemove}
          unresolvedToRemove={sheet.unresolvedToRemove}
          unresolvedRemoveHeadline={sheet.unresolvedRemoveHeadline}
          onUnresolvedOpenChange={(open) => {
            if (!open) sheet.setUnresolvedToRemove(null)
          }}
          onRemoveUnresolved={sheet.handleRemoveUnresolved}
        />
      ) : null}
    </>
  )
}
