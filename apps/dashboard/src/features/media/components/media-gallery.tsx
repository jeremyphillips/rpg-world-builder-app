import { useRef } from 'react'
import { Button, DialogPanelScrollRegion, FilenamePreview, type ScrollBoundaryState } from '@rpg/ui'
import { Images } from 'lucide-react'
import {
  mediaRoleSurfaceCopy,
  type ContentMedia,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'
import type { UploadEntry } from '../hooks/use-media-uploads'
import { mediaImageUrl } from '../lib/media-display'
import { MEDIA_IMAGE_ACCEPT } from '../lib/media-upload.lib'
import { mediaManagerStyles as styles } from './media-manager.variants'

export type MediaGalleryProps = {
  imageUrl?: typeof mediaImageUrl
  media: ContentMedia
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

function rolesForImage(
  media: ContentMedia,
  imageId: string,
  allowedRoles: readonly MediaRole[],
): MediaRole[] {
  return allowedRoles.filter((role) => media.roles[role]?.imageId === imageId)
}

export function MediaGallery({
  imageUrl = mediaImageUrl,
  media,
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
        <div className={styles.row()}>
          <h2 className={styles.subheading()}>Images ({media.images.length})</h2>
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
        {!media.images.length ? (
          <div className={styles.galleryEmpty()}>
            <Images className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">No images yet</p>
            <p className={styles.muted()}>Uploaded images will appear here.</p>
          </div>
        ) : (
          <div className={styles.grid()}>
            {media.images.map((image, index) => {
              const roles = rolesForImage(media, image.id, allowedRoles)
              const roleLabels = roles.map((role) => mediaRoleSurfaceCopy[role].switchLabel)
              return (
                <button
                  key={image.id}
                  type="button"
                  className={styles.tile({ selected: selectedId === image.id })}
                  aria-pressed={selectedId === image.id}
                  aria-label={`${assets[image.assetId]?.filename ?? `Image ${index + 1}`}${roleLabels.map((label) => `, ${label}`).join('')}`}
                  onClick={() => onSelect(image.id)}
                  onKeyDown={(event) => {
                    const delta =
                      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
                    if (!delta) return
                    event.preventDefault()
                    const next = (index + delta + media.images.length) % media.images.length
                    onSelect(media.images[next]!.id)
                    const buttons = event.currentTarget.parentElement?.querySelectorAll('button')
                    buttons?.[next]?.focus()
                  }}
                >
                  <div className={styles.tileThumb()}>
                    <img
                      className={styles.thumbnail()}
                      src={imageUrl(image.assetId, 'gallery-thumbnail')}
                      alt=""
                    />
                  </div>
                  {roles.length > 0 ? (
                    <div className={styles.tileFooter()}>{roleLabels.join(' · ')}</div>
                  ) : null}
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
              <span className="shrink-0 text-muted-foreground">— {entry.status}</span>
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
