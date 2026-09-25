'use client'

import { ImagePlus, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { MediaImage } from './media-image.client'
import {
  MEDIA_FIELD_SUMMARY_MANAGE_IMAGES_LABEL,
  resolveCompactSummaryCopy,
} from './media-field-summary.lib'
import {
  mediaSummaryCompactCountVariants,
  mediaSummaryCompactGearButtonVariants,
  mediaSummaryCompactGearIconVariants,
  mediaSummaryCompactInteractiveRootVariants,
  mediaSummaryCompactOverlayVariants,
  mediaSummaryCompactPreviewButtonVariants,
  mediaSummaryTileButtonVariants,
  mediaSummaryWellVariants,
} from './media-field-summary.variants'

export const MEDIA_FIELD_SUMMARY_TILE_BUDGET = 4

export type MediaFieldSummaryItem = {
  id: string
  src?: string
  alt?: string
  state?: 'ready' | 'loading' | 'error'
}

export type MediaFieldSummaryProps = {
  label: string
  layout: 'compact' | 'expanded'
  items: readonly MediaFieldSummaryItem[]
  /** Uploaded attachments only — omit virtual or derived preview sources. */
  attachmentCount?: number
  maxItems: number
  countDisplay?: 'capacity' | 'count'
  representativeId?: string
  disabled?: boolean
  readOnly?: boolean
  onOpen: (imageId?: string) => void
  emptyContent?: ReactNode
  /** Expanded layout only — omit the built-in title/action row when an outer header owns chrome. */
  showHeader?: boolean
}

function SummaryImage({ item }: { item: MediaFieldSummaryItem }) {
  const loading = item.state === 'loading'
  return (
    <MediaImage
      src={item.state === 'error' ? undefined : item.src}
      alt=""
      shape="square"
      className={cn('size-full rounded-none', loading && 'animate-pulse')}
      placeholderLabel={loading ? 'Image preview loading' : 'Preview unavailable'}
    />
  )
}

type MediaFieldSummaryLayoutProps = Omit<MediaFieldSummaryProps, 'layout'>

function resolveRepresentative(items: readonly MediaFieldSummaryItem[], representativeId?: string) {
  return items.find((item) => item.id === representativeId) ?? items[0]
}

function CompactPreviewWell({
  representative,
  emptyContent,
}: {
  representative?: MediaFieldSummaryItem
  emptyContent?: ReactNode
}) {
  return (
    <span className={mediaSummaryWellVariants({ layout: 'compact' })} aria-hidden="true">
      {representative ? <SummaryImage item={representative} /> : (emptyContent ?? <ImagePlus />)}
    </span>
  )
}

function CompactMediaFieldSummary({
  label,
  items,
  attachmentCount,
  maxItems,
  representativeId,
  disabled = false,
  readOnly = false,
  onOpen,
  emptyContent,
}: MediaFieldSummaryLayoutProps) {
  const resolvedUploadCount =
    attachmentCount ?? items.filter((item) => !item.id.startsWith('system:')).length
  const galleryCount = items.length
  const canEdit = !disabled && !readOnly
  const representative = resolveRepresentative(items, representativeId)
  const copy = resolveCompactSummaryCopy(resolvedUploadCount, galleryCount, maxItems)
  const openManager = () => onOpen(representative?.id)

  return (
    <div className={mediaSummaryCompactInteractiveRootVariants()} role="group" aria-label={label}>
      <button
        type="button"
        className={mediaSummaryCompactPreviewButtonVariants()}
        disabled={!canEdit}
        onClick={openManager}
        aria-label={`${label}: ${copy.previewAriaLabel}`}
      >
        <CompactPreviewWell representative={representative} emptyContent={emptyContent} />
        <div
          className={cn(
            mediaSummaryCompactOverlayVariants(),
            copy.showManageGear && canEdit && 'pr-6',
          )}
        >
          <span className={mediaSummaryCompactCountVariants()}>{copy.countLabel}</span>
        </div>
      </button>
      {copy.showManageGear && canEdit ? (
        <button
          type="button"
          className={mediaSummaryCompactGearButtonVariants()}
          aria-label={MEDIA_FIELD_SUMMARY_MANAGE_IMAGES_LABEL}
          onClick={openManager}
        >
          <Settings aria-hidden="true" className={mediaSummaryCompactGearIconVariants()} />
        </button>
      ) : null}
    </div>
  )
}

function ExpandedMediaFieldSummaryEmpty({
  canEdit,
  onOpen,
}: {
  canEdit: boolean
  onOpen: () => void
}) {
  if (canEdit) {
    return (
      <button
        type="button"
        className={cn(
          mediaSummaryWellVariants({ layout: 'expanded' }),
          'outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        onClick={onOpen}
      >
        <span className="text-sm">No images yet.</span>
      </button>
    )
  }

  return (
    <div className={mediaSummaryWellVariants({ layout: 'expanded' })}>
      <span className="text-sm">No images yet.</span>
    </div>
  )
}

function ExpandedMediaFieldSummaryTiles({
  items,
  canEdit,
  onOpen,
}: {
  items: readonly MediaFieldSummaryItem[]
  canEdit: boolean
  onOpen: (imageId?: string) => void
}) {
  const count = items.length
  const overflow = Math.max(0, count - 3)
  const visible = count > MEDIA_FIELD_SUMMARY_TILE_BUDGET ? items.slice(0, 3) : items.slice(0, 4)

  return (
    <div className="flex flex-wrap gap-3">
      {visible.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            mediaSummaryTileButtonVariants(),
            mediaSummaryWellVariants({ layout: 'tile' }),
          )}
          disabled={!canEdit}
          onClick={() => onOpen(item.id)}
          aria-label={item.alt || `Edit image ${index + 1}`}
        >
          <SummaryImage item={item} />
        </button>
      ))}
      {overflow ? (
        <button
          type="button"
          className={cn(
            mediaSummaryTileButtonVariants(),
            mediaSummaryWellVariants({ layout: 'tile' }),
            'text-lg font-medium',
          )}
          disabled={!canEdit}
          onClick={() => onOpen(items[3]?.id)}
          aria-label={`Manage ${overflow} more images`}
        >
          +{overflow}
        </button>
      ) : null}
    </div>
  )
}

function ExpandedMediaFieldSummaryHeader({
  label,
  count,
  maxItems,
  canEdit,
  onOpen,
  representativeId,
  items,
}: {
  label: string
  count: number
  maxItems: number
  canEdit: boolean
  onOpen: (imageId?: string) => void
  representativeId?: string
  items: readonly MediaFieldSummaryItem[]
}) {
  const representative = resolveRepresentative(items, representativeId)

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="font-medium">{label}</h3>
        {count ? (
          <p className="text-sm text-muted-foreground">
            {count} of {maxItems} images
          </p>
        ) : null}
      </div>
      {canEdit ? (
        <button
          type="button"
          className="text-sm font-medium underline-offset-4 hover:underline"
          onClick={() => onOpen(representative?.id)}
        >
          {count ? 'Manage' : 'Add images'}
        </button>
      ) : null}
    </div>
  )
}

export function ExpandedMediaFieldSummaryBody({
  items,
  disabled = false,
  readOnly = false,
  onOpen,
}: Pick<MediaFieldSummaryLayoutProps, 'items' | 'disabled' | 'readOnly' | 'onOpen'>) {
  const count = items.length
  const canEdit = !disabled && !readOnly

  if (!count) {
    return <ExpandedMediaFieldSummaryEmpty canEdit={canEdit} onOpen={() => onOpen()} />
  }

  return <ExpandedMediaFieldSummaryTiles items={items} canEdit={canEdit} onOpen={onOpen} />
}

function ExpandedMediaFieldSummary({
  label,
  items,
  maxItems,
  representativeId,
  disabled = false,
  readOnly = false,
  onOpen,
  showHeader = true,
}: MediaFieldSummaryLayoutProps & { showHeader?: boolean }) {
  const count = items.length
  const canEdit = !disabled && !readOnly

  return (
    <section aria-label={label} className="space-y-3">
      {showHeader ? (
        <ExpandedMediaFieldSummaryHeader
          label={label}
          count={count}
          maxItems={maxItems}
          canEdit={canEdit}
          onOpen={onOpen}
          representativeId={representativeId}
          items={items}
        />
      ) : null}
      <ExpandedMediaFieldSummaryBody
        items={items}
        disabled={disabled}
        readOnly={readOnly}
        onOpen={onOpen}
      />
    </section>
  )
}

/** Controlled, API-free summary for managed image collections. */
export function MediaFieldSummary({ layout, ...props }: MediaFieldSummaryProps) {
  if (layout === 'compact') return <CompactMediaFieldSummary {...props} />
  return <ExpandedMediaFieldSummary {...props} />
}
