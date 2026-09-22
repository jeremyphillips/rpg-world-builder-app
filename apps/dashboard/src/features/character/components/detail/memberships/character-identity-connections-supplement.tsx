import { CharacterOrganizationMembershipsContainer } from './character-organization-memberships-container'
import { CharacterResidenceContainer } from '../residence/character-residence-container'
import type { CharacterOrganizationMembershipSubjectKind } from '../../../lib/invalidate-character-organization-membership-queries'

export type CharacterIdentityConnectionsSupplementProps = {
  campaignId: string
  characterId: string
  characterName: string
  canEdit: boolean
  subjectKind: CharacterOrganizationMembershipSubjectKind
}

export function CharacterIdentityConnectionsSupplement({
  campaignId,
  characterId,
  characterName,
  canEdit,
  subjectKind,
}: CharacterIdentityConnectionsSupplementProps) {
  return (
    <div className="flex flex-col gap-2">
      <CharacterOrganizationMembershipsContainer
        campaignId={campaignId}
        characterId={characterId}
        characterName={characterName}
        canEdit={canEdit}
        subjectKind={subjectKind}
      />
      <CharacterResidenceContainer
        campaignId={campaignId}
        characterId={characterId}
        canEdit={canEdit}
        subjectKind={subjectKind}
      />
    </div>
  )
}
