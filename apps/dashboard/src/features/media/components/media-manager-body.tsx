import type { ContentMedia, MediaAsset } from '@rpg/contracts'
import type { UseMediaManagerBodyDropResult } from '../hooks/use-media-manager-body-drop'
import type { MediaManagerController } from '../hooks/use-media-manager'
import type { UploadEntry } from '../hooks/use-media-uploads'
import type { mediaImageUrl } from '../lib/media-display'
import { MediaManagerBodyDropOverlay } from './media-manager-body-drop-overlay'
import { MediaGallery } from './media-gallery'
import { MediaWorkspace } from './media-workspace'
import type { MediaManagerBodyDropOverlayState } from './media-manager-session.lib'
import { mediaManagerStyles as styles } from './media-manager.variants'

export function MediaManagerBody({
  bodyDrop,
  bodyDropOverlay,
  controller,
  imageUrl,
  media,
  assets,
  selectedId,
  entries,
  saving,
  onSelect,
  onGalleryBoundaryChange,
  onWorkspaceBoundaryChange,
}: {
  bodyDrop: UseMediaManagerBodyDropResult
  bodyDropOverlay?: MediaManagerBodyDropOverlayState
  controller: MediaManagerController
  imageUrl?: typeof mediaImageUrl
  media: ContentMedia
  assets: Record<string, MediaAsset>
  selectedId?: string
  entries: UploadEntry[]
  saving: boolean
  onSelect: (id: string) => void
  onGalleryBoundaryChange: Parameters<typeof MediaGallery>[0]['onScrollBoundaryChange']
  onWorkspaceBoundaryChange: Parameters<typeof MediaWorkspace>[0]['onScrollBoundaryChange']
}) {
  return (
    <div
      className={styles.bodyDropHost()}
      onDragEnter={bodyDrop.onDragEnter}
      onDragLeave={bodyDrop.onDragLeave}
      onDragOver={bodyDrop.onDragOver}
      onDrop={bodyDrop.onDrop}
    >
      <fieldset disabled={saving} className={styles.layout()}>
        <MediaGallery
          imageUrl={imageUrl}
          media={media}
          assets={assets}
          selectedId={selectedId}
          entries={entries}
          onSelect={onSelect}
          onAdd={controller.uploads.add}
          onRetry={controller.uploads.retry}
          onRemoveUpload={controller.uploads.remove}
          onScrollBoundaryChange={onGalleryBoundaryChange}
        />
        <MediaWorkspace
          controller={controller}
          imageUrl={imageUrl}
          onScrollBoundaryChange={onWorkspaceBoundaryChange}
        />
      </fieldset>
      {bodyDropOverlay ? (
        <MediaManagerBodyDropOverlay invalid={bodyDropOverlay === 'invalid'} />
      ) : null}
    </div>
  )
}
