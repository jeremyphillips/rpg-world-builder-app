import { useRef } from 'react'
import { Button } from '@rpg/ui'
import { MEDIA_ROLE_ENTRIES, type ContentMedia, type MediaAsset } from '@rpg/contracts'
import type { UploadEntry } from '../hooks/use-media-uploads'
import { mediaImageUrl } from '../lib/media-display'
import { mediaManagerStyles as styles } from './media-manager.variants'

export type MediaGalleryProps = {
  imageUrl?: typeof mediaImageUrl
  media: ContentMedia
  assets: Record<string, MediaAsset>
  selectedId?: string
  entries: UploadEntry[]
  onSelect: (id: string) => void
  onAdd: (files: File[]) => void
  onRetry: (id: string) => void
  onRemoveUpload: (id: string) => void
}
export function MediaGallery({
  imageUrl = mediaImageUrl,
  media,
  assets,
  selectedId,
  entries,
  onSelect,
  onAdd,
  onRetry,
  onRemoveUpload,
}: MediaGalleryProps) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <section className={styles.gallery()} aria-label="Images">
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
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => {
            onAdd(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
      </div>
      {!media.images.length && (
        <p className={styles.muted()}>No images yet. Add images, then assign a role.</p>
      )}
      <div className={styles.grid()}>
        {media.images.map((image, index) => {
          const roles = (['portrait', 'primary'] as const).filter(
            (role) => media.roles[role]?.imageId === image.id,
          )
          return (
            <button
              key={image.id}
              type="button"
              className={styles.tile({ selected: selectedId === image.id })}
              aria-pressed={selectedId === image.id}
              aria-label={`${assets[image.assetId]?.filename ?? `Image ${index + 1}`}${roles.map((role) => `, ${MEDIA_ROLE_ENTRIES[role].label}`).join('')}`}
              onClick={() => onSelect(image.id)}
              onKeyDown={(event) => {
                const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
                if (!delta) return
                event.preventDefault()
                const next = (index + delta + media.images.length) % media.images.length
                onSelect(media.images[next]!.id)
                const buttons = event.currentTarget.parentElement?.querySelectorAll('button')
                buttons?.[next]?.focus()
              }}
            >
              <img
                className={styles.thumbnail()}
                src={imageUrl(image.assetId, 'gallery-thumbnail')}
                alt=""
              />
              <span className={styles.badges()}>
                {selectedId === image.id && <span className={styles.badge()}>✓ Selected</span>}
                {roles.map((role) => (
                  <span key={role} className={styles.badge()}>
                    {MEDIA_ROLE_ENTRIES[role].label}
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>
      {entries.map((entry) => (
        <div key={entry.id} className={styles.queue()}>
          <p>
            {entry.file.name} — {entry.status}
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
    </section>
  )
}
