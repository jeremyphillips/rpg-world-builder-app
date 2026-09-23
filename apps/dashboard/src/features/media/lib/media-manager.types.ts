import type { ContentMedia, ContentMediaDomain, MediaAsset, MediaScope } from '@rpg/contracts'

export type MediaManagerSave = {
  media: ContentMedia
  expectedMediaRevision: number
  assets: MediaAsset[]
}
import type { mediaImageUrl } from './media-display'
export type MediaManagerProps = {
  /** Optional authorized/system-asset resolver; defaults to the same-origin media API. */
  imageUrl?: typeof mediaImageUrl
  open: boolean
  onOpenChange: (open: boolean) => void
  domain: ContentMediaDomain
  value: ContentMedia
  scope: MediaScope
  initialAssets?: MediaAsset[]
  mode: 'form' | 'detail'
  onSave: (change: MediaManagerSave) => void | Promise<void>
}
