'use client'

import { ImagePlus } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { MediaImage } from './media-image.client'
import {
  mediaSummaryCompactButtonVariants,
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
  maxItems: number
  countDisplay?: 'capacity' | 'count'
  representativeId?: string
  disabled?: boolean
  readOnly?: boolean
  onOpen: (imageId?: string) => void
  emptyContent?: ReactNode
}

function countCopy(count: number, maxItems: number, display: 'capacity' | 'count') {
  if (display === 'count') return `${count} ${count === 1 ? 'image' : 'images'} · Manage`
  return `${count} of ${maxItems} images · Manage`
}

function SummaryImage({ item }: { item: MediaFieldSummaryItem }) {
  const loading = item.state === 'loading'
  return (
    <MediaImage
      src={item.state === 'error' ? undefined : item.src}
      alt=""
      shape="square"
      size="lg"
      className={cn('size-full', loading && 'animate-pulse')}
      placeholderLabel={loading ? 'Image preview loading' : 'Preview unavailable'}
    />
  )
}

type MediaFieldSummaryLayoutProps = Omit<MediaFieldSummaryProps, 'layout'>

function resolveRepresentative(items: readonly MediaFieldSummaryItem[], representativeId?: string) {
  return items.find((item) => item.id === representativeId) ?? items[0]
}

function CompactMediaFieldSummary({
  label,
  items,
  maxItems,
  countDisplay = 'capacity',
  representativeId,
  disabled = false,
  readOnly = false,
  onOpen,
  emptyContent,
}: MediaFieldSummaryLayoutProps) {
  const count = items.length
  const canEdit = !disabled && !readOnly
  const representative = resolveRepresentative(items, representativeId)
  const single = maxItems === 1
  const action = count ? (single ? 'Change image' : countCopy(count, maxItems, countDisplay)) : ''
  const emptySubject = single ? 'No image' : 'No images'
  const emptyAction = single ? 'Add image' : 'Add images'

  return (
    <button
      type="button"
      className={mediaSummaryCompactButtonVariants()}
      disabled={!canEdit}
      onClick={() => onOpen(representative?.id)}
      aria-label={`${label}: ${count ? action : `${emptySubject}. ${emptyAction}`}`}
    >
      <span className={mediaSummaryWellVariants({ layout: 'compact' })} aria-hidden="true">
        {representative ? <SummaryImage item={representative} /> : (emptyContent ?? <ImagePlus />)}
      </span>
      <span className="max-w-48 text-xs leading-tight">
        {count ? (
          action
        ) : (
          <>
            <span className="text-muted-foreground">{emptySubject}</span>
            <span aria-hidden="true"> · </span>
            <span>{emptyAction}</span>
          </>
        )}
      </span>
    </button>
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

function ExpandedMediaFieldSummary({
  label,
  items,
  maxItems,
  representativeId,
  disabled = false,
  readOnly = false,
  onOpen,
}: MediaFieldSummaryLayoutProps) {
  const count = items.length
  const canEdit = !disabled && !readOnly
  const representative = resolveRepresentative(items, representativeId)

  return (
    <section aria-label={label} className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-medium">Images</h3>
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
      {!count ? (
        <ExpandedMediaFieldSummaryEmpty canEdit={canEdit} onOpen={() => onOpen()} />
      ) : (
        <ExpandedMediaFieldSummaryTiles items={items} canEdit={canEdit} onOpen={onOpen} />
      )}
    </section>
  )
}

/** Controlled, API-free summary for managed image collections. */
export function MediaFieldSummary({ layout, ...props }: MediaFieldSummaryProps) {
  if (layout === 'compact') return <CompactMediaFieldSummary {...props} />
  return <ExpandedMediaFieldSummary {...props} />
}
