import type {
  ContentMedia,
  ContentMediaDomain,
  ContentSource,
  ContentTypeKey,
  MediaAsset,
  MediaScope,
} from '@rpg/contracts'

export type MediaManagerSave = {
  media: ContentMedia
  expectedMediaRevision: number
  assets: MediaAsset[]
}
import type { mediaImageUrl } from './media-display'
export type MediaManagerContentContext = {
  contentType: ContentTypeKey
  slug: string
  contentSource: ContentSource
  rulesetId?: string
}

export type MediaManagerProps = {
  /** Optional authorized/system-asset resolver; defaults to the same-origin media API. */
  imageUrl?: typeof mediaImageUrl
  /** Optional public system-art resolver for virtual catalog sources. */
  systemImageUrl?: (srcPath: string) => string
  open: boolean
  onOpenChange: (open: boolean) => void
  domain: ContentMediaDomain
  value: ContentMedia
  scope: MediaScope
  initialAssets?: MediaAsset[]
  initialSelectedImageId?: ContentMedia['images'][number]['id']
  maxItems?: number
  mode: 'form' | 'detail'
  contentContext?: MediaManagerContentContext
  onSave: (change: MediaManagerSave) => void | Promise<void>
  /** Storybook-only: force the body drop overlay without a live file drag. */
  previewBodyDrop?: 'active' | 'invalid'
}
