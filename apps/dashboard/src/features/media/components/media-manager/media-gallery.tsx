import { useEffect, useRef, useState } from 'react'
import {
  Badge,
  borderStrength,
  Button,
  cn,
  DialogPanelScrollRegion,
  Icon,
  FilenamePreview,
  Text,
  type ScrollBoundaryState,
} from '@rpg/ui'
import {
  MEDIA_GALLERY_ONLY_LABEL,
  mediaRoleSurfaceCopy,
  resolveEffectiveImageRoles,
  type AvailableContentImage,
  type AvailableContentMediaSource,
  type ContentMedia,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'
import type { UploadEntry } from '../../hooks/use-media-uploads'
import { resolveUploadEntryStatusLabel } from '../../hooks/use-media-uploads'
import { mediaImageUrl, systemContentImageUrl } from '../../lib/media-display'
import { MEDIA_IMAGE_ACCEPT } from '../../lib/media-upload.lib'

function readGalleryColumnStride(): number {
  if (typeof window.matchMedia !== 'function') return 1
  return window.matchMedia('(min-width: 768px)').matches ? 2 : 1
}

export type MediaGalleryProps = {
  imageUrl?: typeof mediaImageUrl
  systemImageUrl?: (srcPath: string) => string
  media: ContentMedia
  availableImages: AvailableContentImage[]
  availableSources: readonly AvailableContentMediaSource[]
  assets: Record<string, MediaAsset>
  contextBlocked?: boolean
  contextBlockedMessage?: string
  allowedRoles: readonly MediaRole[]
  selectedId?: string
  entries: UploadEntry[]
  onSelect: (id: string) => void
  onAdd: (files: File[]) => void
  onRetry: (id: string) => void
  onRemoveUpload: (id: string) => void
  onScrollBoundaryChange?: (state: ScrollBoundaryState) => void
  mutationsLocked?: boolean
}

function resolveGalleryImageSrc(
  image: AvailableContentImage,
  imageUrl: typeof mediaImageUrl,
  resolveSystemImageUrl: (srcPath: string) => string,
): string {
  if (image.kind === 'system') {
    return resolveSystemImageUrl(image.srcPath)
  }
  return imageUrl(image.attachment.assetId, 'gallery-thumbnail')
}

function resolveGalleryImageLabel(
  image: AvailableContentImage,
  index: number,
  assets: Record<string, MediaAsset>,
): string {
  if (image.kind === 'system') {
    return `System ${image.source.slug}`
  }
  return assets[image.attachment.assetId]?.filename ?? `Image ${index + 1}`
}

export function MediaGallery({
  imageUrl = mediaImageUrl,
  systemImageUrl: resolveSystemImageUrl = systemContentImageUrl,
  media,
  availableImages,
  availableSources,
  assets,
  allowedRoles,
  contextBlocked = false,
  contextBlockedMessage,
  selectedId,
  entries,
  onSelect,
  onAdd,
  onRetry,
  onRemoveUpload,
  onScrollBoundaryChange,
  mutationsLocked = false,
}: MediaGalleryProps) {
  const input = useRef<HTMLInputElement>(null)
  const [columnStride, setColumnStride] = useState<number>(readGalleryColumnStride)
  const imageCount = availableImages.length

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const syncColumnStride = () =>
      setColumnStride((current) => {
        const next = mediaQuery.matches ? 2 : 1
        return current === next ? current : next
      })
    syncColumnStride()
    mediaQuery.addEventListener('change', syncColumnStride)
    return () => mediaQuery.removeEventListener('change', syncColumnStride)
  }, [])

  return (
    <section
      className={cn(
        'media-manager__column media-manager__column--separated',
        borderStrength('subtle'),
      )}
      aria-label="Images"
    >
      <DialogPanelScrollRegion
        inset="innerLeading"
        regionClassName="media-manager__column-scroll"
        viewportClassName="media-manager__column-viewport"
        showTopBoundaryShadow={false}
        showBottomBoundaryShadow={false}
        onBoundaryStateChange={onScrollBoundaryChange}
      >
        <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Images ({imageCount})</h2>
          <Button
            type="button"
            variant="outline"
            disabled={mutationsLocked}
            onClick={() => input.current?.click()}
          >
            + Add images
          </Button>
          <input
            ref={input}
            className="sr-only"
            type="file"
            aria-label="Upload images"
            multiple
            accept={MEDIA_IMAGE_ACCEPT.join(',')}
            disabled={mutationsLocked}
            onChange={(event) => {
              onAdd(Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
          />
        </div>
        {/* TODO(empty-well): model this gallery empty as a shared well component. */}
        {contextBlocked ? (
          <div
            className="flex min-h-48 flex-1 flex-col items-center justify-center gap-2 px-4 text-center md:min-h-0"
            role="alert"
          >
            <Icon name="images" size="3xl" className="text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Images unavailable</p>
            <Text variant="supporting">{contextBlockedMessage}</Text>
          </div>
        ) : !availableImages.length ? (
          <div className="flex min-h-48 flex-1 flex-col items-center justify-center gap-2 px-4 text-center md:min-h-0">
            <Icon name="images" size="3xl" className="text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No images yet</p>
            <Text variant="supporting">Uploaded images will appear here.</Text>
          </div>
        ) : (
          <div className="flex gap-3 pb-2 md:grid md:grid-cols-2">
            {availableImages.map((image, index) => {
              const effective = resolveEffectiveImageRoles(
                media,
                image.id,
                allowedRoles,
                availableSources,
              )
              const roles = effective.roles
              const galleryOnly = roles.length === 0 && image.kind === 'upload'
              const roleLabels = roles.map((role) => mediaRoleSurfaceCopy[role].switchLabel)
              return (
                <button
                  key={image.id}
                  type="button"
                  className="media-manager__tile ui-focus-ring"
                  aria-pressed={selectedId === image.id}
                  aria-label={`${resolveGalleryImageLabel(image, index, assets)}${roleLabels.map((label) => `, ${label}`).join('')}`}
                  onClick={() => onSelect(image.id)}
                  onKeyDown={(event) => {
                    const horizontalDelta =
                      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
                    const verticalDelta =
                      event.key === 'ArrowDown'
                        ? columnStride
                        : event.key === 'ArrowUp'
                          ? -columnStride
                          : 0
                    const delta = horizontalDelta || verticalDelta
                    if (!delta) return
                    event.preventDefault()
                    const next = (index + delta + availableImages.length) % availableImages.length
                    onSelect(availableImages[next]!.id)
                    const buttons = event.currentTarget.parentElement?.querySelectorAll('button')
                    buttons?.[next]?.focus()
                  }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      className="size-full object-cover"
                      src={resolveGalleryImageSrc(image, imageUrl, resolveSystemImageUrl)}
                      alt=""
                    />
                    {roles.length > 0 || galleryOnly ? (
                      <div className="absolute inset-x-1 bottom-1 flex flex-wrap gap-1">
                        {roles.map((role) => (
                          <Badge
                            key={role}
                            size="sm"
                            appearance="soft"
                            tone="neutral"
                            className="max-w-full truncate"
                          >
                            {mediaRoleSurfaceCopy[role].switchLabel}
                          </Badge>
                        ))}
                        {galleryOnly ? (
                          <Badge
                            size="sm"
                            appearance="soft"
                            tone="neutral"
                            className="max-w-full truncate"
                          >
                            {MEDIA_GALLERY_ONLY_LABEL}
                          </Badge>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn('space-y-2 rounded-md border p-3 text-sm', borderStrength())}
          >
            <p className="flex min-w-0 items-center gap-2">
              <FilenamePreview
                filename={entry.file.name}
                density="compact"
                className="min-w-0 flex-1"
              />
              <span className="shrink-0 text-muted-foreground">
                — {resolveUploadEntryStatusLabel(entry.status)}
              </span>
            </p>
            {entry.error && (
              <p role="alert" className="text-sm text-destructive">
                {entry.error}
              </p>
            )}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
              {entry.status === 'failed' && (
                <Button type="button" variant="outline" onClick={() => onRetry(entry.id)}>
                  Retry
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onRemoveUpload(entry.id)}>
                Remove from queue
              </Button>
            </div>
          </div>
        ))}
      </DialogPanelScrollRegion>
    </section>
  )
}
