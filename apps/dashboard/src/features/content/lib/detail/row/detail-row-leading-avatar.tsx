import { Avatar } from '@rpg/ui'

import { DetailRowLeadingMedia } from './detail-row-leading-media'
import type { DetailRowLeadingMediaProps } from './detail-row-leading-media'

export type DetailRowLeadingAvatarProps = {
  name: string
  src?: string
  shape?: DetailRowLeadingMediaProps['shape']
  size?: DetailRowLeadingMediaProps['size']
}

/** Avatar in the canonical detail-row leading frame — no separate size system. */
export function DetailRowLeadingAvatar({
  name,
  src,
  shape = 'circle',
  size = 'xs',
}: DetailRowLeadingAvatarProps) {
  return (
    <DetailRowLeadingMedia shape={shape} size={size}>
      <Avatar name={name} src={src} className="size-full rounded-none" />
    </DetailRowLeadingMedia>
  )
}
