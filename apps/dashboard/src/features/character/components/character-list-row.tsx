import type { CharacterRosterStatus } from '@rpg/contracts'

import { DetailRowLeadingMedia, RelationshipList } from '@/features/content'

import { buildCharacterListRowPresentation } from '../lib/display/character-list-row.lib'
import type { CharacterListCardData } from './character-list-card.lib'

export type CharacterListRowProps = {
  card: CharacterListCardData
  detailHref: string
  controllerLine?: string
  rosterStatus?: CharacterRosterStatus
}

/** Compact list-row presentation for a character summary — composes RelationshipList.Row. */
export function CharacterListRow({
  card,
  detailHref,
  controllerLine,
  rosterStatus,
}: CharacterListRowProps) {
  const row = buildCharacterListRowPresentation({
    card,
    detailHref,
    controllerLine,
    rosterStatus,
  })

  return (
    <RelationshipList.Row
      {...row}
      leadingMedia={
        row.leadingMedia ? (
          <DetailRowLeadingMedia shape="box" size="xs">
            {row.leadingMedia}
          </DetailRowLeadingMedia>
        ) : undefined
      }
    />
  )
}
