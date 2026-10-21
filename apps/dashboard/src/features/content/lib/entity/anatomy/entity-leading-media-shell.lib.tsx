import { isValidElement, type ReactNode } from 'react'

import type { IdentityFrameShape } from '@rpg/ui'

import { DetailRowLeadingMedia } from '../../detail/row/detail-row-leading-media'

export function isAnatomyLeadingMediaShell(node: ReactNode): boolean {
  if (!isValidElement(node)) {
    return false
  }

  if (node.type === DetailRowLeadingMedia) {
    return true
  }

  return 'data-detail-row-leading-media' in (node.props as object)
}

export function wrapEntityAnatomyLeadingMedia(
  media: ReactNode,
  shape: IdentityFrameShape = 'box',
): ReactNode {
  if (isAnatomyLeadingMediaShell(media)) {
    return media
  }

  return <DetailRowLeadingMedia shape={shape}>{media}</DetailRowLeadingMedia>
}
