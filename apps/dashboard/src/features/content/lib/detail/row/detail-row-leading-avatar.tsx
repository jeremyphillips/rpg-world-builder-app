import { Avatar } from '@rpg/ui'

import { DetailRowLeadingMedia } from './detail-row-leading-media'
import type { DetailRowLeadingMediaProps } from './detail-row-leading-media'

export type DetailRowLeadingAvatarProps = {
  name: string
  src?: string
  shape?: DetailRowLeadingMediaProps['shape']
  size?: DetailRowLeadingMediaProps['size']
}

/** Avatar inside the detail-row leading frame. IdentityFrame owns the slot; `size-full rounded-none` is the recorded override and wins over `ui-avatar--*` because utilities follow the components layer. */
export function DetailRowLeadingAvatar({
  name,
  src,
  shape = 'circle',
  size,
}: DetailRowLeadingAvatarProps) {
  return (
    <DetailRowLeadingMedia shape={shape} size={size}>
      <Avatar name={name} src={src} className="size-full rounded-none" />
    </DetailRowLeadingMedia>
  )
}
