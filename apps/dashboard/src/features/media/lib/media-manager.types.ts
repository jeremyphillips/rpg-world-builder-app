import type {
  ContentMedia,
  ContentMediaDomain,
  ContentSource,
  MediaAsset,
  MediaScope,
  SystemImageSubject,
} from '@rpg/contracts'

export type MediaManagerSave = {
  media: ContentMedia
  expectedMediaRevision: number
  assets: MediaAsset[]
}
import type { mediaImageUrl } from './media-display'
export type MediaManagerContentContext = {
  domain: ContentMediaDomain
  contentSource: ContentSource
  subject?: SystemImageSubject
  slug?: string
  rulesetId?: string
  campaignImageSetId?: string
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
  formMode?: 'create' | 'edit'
  contentContext?: MediaManagerContentContext
  onSave: (change: MediaManagerSave) => void | Promise<void>
  /** Storybook-only: force the body drop overlay without a live file drag. */
  previewBodyDrop?: 'active' | 'invalid'
}
