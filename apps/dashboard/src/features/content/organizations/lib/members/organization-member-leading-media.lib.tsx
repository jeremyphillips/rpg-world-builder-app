import type { ContentDisplayImage } from '@rpg/contracts'
import { resolveContentDisplayFallback } from '@rpg/contracts'

import { DetailRowLeadingMedia } from '../../../lib/detail/row/detail-row-leading-media'
import { buildEntitySurfaceLeadingMediaNode } from '../../../lib/entity/surfaces/entity-surface-projection.lib'

import {
  buildCharacterEntityCardModel,
  buildCharacterEntitySummaryVmFromTransport,
} from '@/features/character'

import type { OrganizationMemberRowVm } from './build-organization-member-rows'

export function buildOrganizationMemberLeadingMedia(
  row: Pick<OrganizationMemberRowVm, 'characterId' | 'name' | 'characterType' | 'displayImage'>,
) {
  const vm = buildCharacterEntitySummaryVmFromTransport({
    id: row.characterId,
    name: row.name,
    summary: '',
    characterType: row.characterType,
  })

  const identity = buildCharacterEntityCardModel(vm, {
    displayImage: row.displayImage,
  })
  identity.fallback = resolveContentDisplayFallback({
    domain: 'character',
    surface: 'compact',
    characterType: row.characterType,
  })

  const media = buildEntitySurfaceLeadingMediaNode(identity, 'compact')
  if (!media) return undefined

  return (
    <DetailRowLeadingMedia shape="box" size="xs">
      {media}
    </DetailRowLeadingMedia>
  )
}

export type OrganizationMemberRowMediaInput = {
  characterId: string
  name: string
  characterType: OrganizationMemberRowVm['characterType']
  displayImage?: ContentDisplayImage
}
