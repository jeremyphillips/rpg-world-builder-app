import { useRef } from 'react'
import {
  Badge,
  Button,
  DialogPanelScrollRegion,
  FilenamePreview,
  type ScrollBoundaryState,
} from '@rpg/ui'
import { Images } from 'lucide-react'
import {
  mediaRoleSurfaceCopy,
  type AvailableContentImage,
  type ContentMedia,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'
import type { UploadEntry } from '../hooks/use-media-uploads'
import { resolveUploadEntryStatusLabel } from '../hooks/use-media-uploads'
import { assignedRolesForImage } from '../lib/media-session'
import { mediaImageUrl, systemContentImageUrl } from '../lib/media-display'
import { MEDIA_IMAGE_ACCEPT } from '../lib/media-upload.lib'
import { mediaManagerStyles as styles } from './media-manager.variants'

export type MediaGalleryProps = {
  imageUrl?: typeof mediaImageUrl
  systemImageUrl?: (srcPath: string) => string
  media: ContentMedia
  availableImages: AvailableContentImage[]
  assets: Record<string, MediaAsset>
  allowedRoles: readonly MediaRole[]
  selectedId?: string
  entries: UploadEntry[]
  onSelect: (id: string) => void
  onAdd: (files: File[]) => void
  onRetry: (id: string) => void
  onRemoveUpload: (id: string) => void
  onScrollBoundaryChange?: (state: ScrollBoundaryState) => void
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
  assets,
  allowedRoles,
  selectedId,
  entries,
  onSelect,
  onAdd,
  onRetry,
  onRemoveUpload,
  onScrollBoundaryChange,
}: MediaGalleryProps) {
  const input = useRef<HTMLInputElement>(null)
  const imageCount = availableImages.length

  return (
    <section className={styles.gallery()} aria-label="Images">
      <DialogPanelScrollRegion
        inset="innerLeading"
        regionClassName={styles.columnScroll()}
        viewportClassName={styles.columnScrollViewport()}
        showTopBoundaryShadow={false}
        showBottomBoundaryShadow={false}
        onBoundaryStateChange={onScrollBoundaryChange}
      >
        <div className={styles.galleryHeaderRow()}>
          <h2 className={styles.subheading()}>Images ({imageCount})</h2>
          <Button type="button" variant="outline" onClick={() => input.current?.click()}>
            + Add images
          </Button>
          <input
            ref={input}
            className={styles.hidden()}
            type="file"
            aria-label="Upload images"
            multiple
            accept={MEDIA_IMAGE_ACCEPT.join(',')}
            onChange={(event) => {
              onAdd(Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
          />
        </div>
        {!availableImages.length ? (
          <div className={styles.galleryEmpty()}>
            <Images className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">No images yet</p>
            <p className={styles.muted()}>Uploaded images will appear here.</p>
          </div>
        ) : (
          <div className={styles.grid()}>
            {availableImages.map((image, index) => {
              const roles = assignedRolesForImage(media, image.id, allowedRoles, availableImages)
              const roleLabels = roles.map((role) => mediaRoleSurfaceCopy[role].switchLabel)
              return (
                <button
                  key={image.id}
                  type="button"
                  className={styles.tile({ selected: selectedId === image.id })}
                  aria-pressed={selectedId === image.id}
                  aria-label={`${resolveGalleryImageLabel(image, index, assets)}${roleLabels.map((label) => `, ${label}`).join('')}`}
                  onClick={() => onSelect(image.id)}
                  onKeyDown={(event) => {
                    const delta =
                      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
                    if (!delta) return
                    event.preventDefault()
                    const next = (index + delta + availableImages.length) % availableImages.length
                    onSelect(availableImages[next]!.id)
                    const buttons = event.currentTarget.parentElement?.querySelectorAll('button')
                    buttons?.[next]?.focus()
                  }}
                >
                  <div className={styles.tileThumb()}>
                    <img
                      className={styles.thumbnail()}
                      src={resolveGalleryImageSrc(image, imageUrl, resolveSystemImageUrl)}
                      alt=""
                    />
                    {roles.length > 0 ? (
                      <div className={styles.tileBadges()}>
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
                      </div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className={styles.queue()}>
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
              <p role="alert" className={styles.error()}>
                {entry.error}
              </p>
            )}
            <div className={styles.row()}>
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
