import { Button, FilenamePreview, MediaCropEditor, MediaEmblemEditor } from '@rpg/ui'
import {
  MEDIA_ROLE_ENTRIES,
  asContainPresentation,
  asCropPresentation,
  defaultEmblemPresentation,
  resolveDefaultCropForRole,
  resolveEffectiveCrop,
  type ContentMedia,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'

import type { MediaManagerController } from '../hooks/use-media-manager'
import { cropFrameForRole } from '../lib/media-session'
import { mediaImageUrl, MEDIA_SOURCE_CROP } from '../lib/media-display'
import { MediaImageDetails } from './media-image-details'
import { mediaManagerStyles as styles } from './media-manager.variants'

function MediaWorkspaceEditor({
  controller,
  imageUrl,
  selected,
  asset,
  activeRole,
  isActiveForSelection,
}: {
  controller: MediaManagerController
  imageUrl: typeof mediaImageUrl
  selected: ContentMedia['images'][number]
  asset: MediaAsset
  activeRole: MediaRole
  isActiveForSelection: boolean
}) {
  const { dispatch } = controller
  const source = { width: asset.orientedWidth, height: asset.orientedHeight }
  const assignment = controller.state.media.roles[activeRole]
  const cropPresentation = asCropPresentation(assignment?.presentation)
  const containPresentation =
    asContainPresentation(assignment?.presentation) ?? defaultEmblemPresentation()

  if (!isActiveForSelection) {
    return (
      <figure className={styles.previewCard()}>
        <img
          className={styles.preview()}
          src={imageUrl(asset.id, 'artwork', MEDIA_SOURCE_CROP)}
          alt={selected.alt ?? ''}
        />
        <figcaption className={styles.previewCaption()}>
          <FilenamePreview filename={asset.filename} />
        </figcaption>
      </figure>
    )
  }

  if (activeRole === 'emblem') {
    return (
      <MediaEmblemEditor
        src={imageUrl(asset.id, 'artwork', MEDIA_SOURCE_CROP)}
        source={{ width: asset.orientedWidth, height: asset.orientedHeight }}
        layout={containPresentation}
        onChange={(layout) =>
          dispatch({
            type: 'contain',
            layout,
            source: { width: asset.orientedWidth, height: asset.orientedHeight },
          })
        }
      />
    )
  }

  const resolvedCrop = resolveEffectiveCrop(cropPresentation, source, () =>
    resolveDefaultCropForRole(activeRole, source),
  )

  return (
    <MediaCropEditor
      src={imageUrl(asset.id, 'artwork', MEDIA_SOURCE_CROP)}
      source={source}
      frame={cropFrameForRole(activeRole)}
      crop={resolvedCrop}
      focalPoint={activeRole === 'portrait' ? undefined : cropPresentation?.focalPoint}
      onFocalPointChange={
        activeRole === 'portrait'
          ? undefined
          : (focalPoint) => dispatch({ type: 'crop', crop: resolvedCrop, focalPoint })
      }
      onChange={(crop) =>
        dispatch({ type: 'crop', crop, focalPoint: cropPresentation?.focalPoint })
      }
    />
  )
}

export function MediaWorkspaceSelection({
  controller,
  imageUrl = mediaImageUrl,
  image: selected,
  asset,
  assignedRoles,
}: {
  controller: MediaManagerController
  imageUrl?: typeof mediaImageUrl
  image: ContentMedia['images'][number]
  asset: MediaAsset
  assignedRoles: MediaRole[]
}) {
  const { state, policy, dispatch, onAlt, changeRole, remove } = controller
  const activeRole = state.presentation
  const assignment = state.media.roles[activeRole]
  const isActiveForSelection = assignment?.imageId === selected.id

  return (
    <>
      {assignedRoles.length >= 2 && (
        <div className={styles.row()} role="group" aria-label="Presentation">
          {assignedRoles.map((role) => (
            <Button
              key={role}
              type="button"
              variant="outline"
              aria-pressed={state.presentation === role}
              onClick={() => dispatch({ type: 'presentation', role })}
            >
              {MEDIA_ROLE_ENTRIES[role].label}
            </Button>
          ))}
        </div>
      )}
      <div className={styles.editor()}>
        <MediaWorkspaceEditor
          controller={controller}
          imageUrl={imageUrl}
          selected={selected}
          asset={asset}
          activeRole={activeRole}
          isActiveForSelection={isActiveForSelection}
        />
        <MediaImageDetails
          image={selected}
          asset={asset}
          media={state.media}
          policy={policy}
          onAlt={onAlt}
          onRole={changeRole}
          onRemove={remove}
        />
      </div>
    </>
  )
}
