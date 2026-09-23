import { CharacterConnectionsSection } from '../connections/character-connections-section'
import type { CharacterRelationshipSubjectKind } from '../../../lib/invalidate-character-relationship-queries'

export type CharacterIdentityConnectionsSupplementProps = {
  campaignId: string
  characterId: string
  characterName: string
  canEdit: boolean
  subjectKind: CharacterRelationshipSubjectKind
}

export function CharacterIdentityConnectionsSupplement({
  campaignId,
  characterId,
  canEdit,
  subjectKind,
}: CharacterIdentityConnectionsSupplementProps) {
  return (
    <CharacterConnectionsSection
      campaignId={campaignId}
      characterId={characterId}
      canEdit={canEdit}
      subjectKind={subjectKind}
    />
  )
}
