import type { ContentMedia, MediaAsset } from '@rpg/contracts'
import type { UseMediaManagerBodyDropResult } from '../hooks/use-media-manager-body-drop'
import type { MediaManagerController } from '../hooks/use-media-manager'
import type { UploadEntry } from '../hooks/use-media-uploads'
import type { mediaImageUrl } from '../lib/media-display'
import { MediaManagerBodyDropOverlay } from './media-manager-body-drop-overlay'
import { MediaGallery } from './media-gallery'
import { MediaImageDetails } from './media-image-details'
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
  onPreviewBoundaryChange,
  onDetailsBoundaryChange,
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
  onPreviewBoundaryChange: Parameters<typeof MediaWorkspace>[0]['onScrollBoundaryChange']
  onDetailsBoundaryChange: Parameters<typeof MediaImageDetails>[0]['onScrollBoundaryChange']
}) {
  const { selectedAvailable, asset, policy, onAlt, changeRole, remove, canRemove } = controller
  const hasGalleryImages = controller.sessionAvailableImages.length > 0
  const showDetailsColumn = hasGalleryImages && Boolean(selectedAvailable)

  return (
    <div
      className={styles.bodyDropHost()}
      onDragEnter={bodyDrop.onDragEnter}
      onDragLeave={bodyDrop.onDragLeave}
      onDragOver={bodyDrop.onDragOver}
      onDrop={bodyDrop.onDrop}
    >
      <fieldset
        disabled={saving}
        className={styles.layout({ columns: showDetailsColumn ? 'three' : 'two' })}
      >
        <MediaGallery
          imageUrl={imageUrl}
          systemImageUrl={controller.resolveSystemImageUrl}
          media={media}
          availableImages={controller.sessionAvailableImages}
          assets={assets}
          allowedRoles={controller.policy.allowedRoles}
          selectedId={selectedId}
          entries={entries}
          onSelect={onSelect}
          onAdd={controller.uploads.add}
          onRetry={controller.uploads.retry}
          onRemoveUpload={controller.uploads.remove}
          onScrollBoundaryChange={onGalleryBoundaryChange}
          mutationsLocked={controller.mutationsLocked}
        />
        <MediaWorkspace
          controller={controller}
          imageUrl={imageUrl}
          onScrollBoundaryChange={onPreviewBoundaryChange}
        />
        {showDetailsColumn && selectedAvailable ? (
          <MediaImageDetails
            selectedAvailable={selectedAvailable}
            availableImages={controller.sessionAvailableImages}
            asset={asset}
            media={media}
            policy={policy}
            assignedRoles={controller.assignedRolesForSelection}
            onAlt={onAlt}
            onRole={changeRole}
            onRemove={remove}
            canRemove={canRemove}
            onScrollBoundaryChange={onDetailsBoundaryChange}
          />
        ) : null}
      </fieldset>
      {bodyDropOverlay ? (
        <MediaManagerBodyDropOverlay invalid={bodyDropOverlay === 'invalid'} />
      ) : null}
    </div>
  )
}
