import { MediaCropEditor, MediaEmblemEditor } from '@rpg/ui'
import {
  asContainPresentation,
  asCropPresentation,
  defaultEmblemPresentation,
  mediaRoleSurfaceCopy,
  resolveMediaCropEditorConstraint,
  type ContentMedia,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'

import type { MediaManagerController } from '../hooks/use-media-manager'
import { mediaImageUrl, MEDIA_SOURCE_CROP } from '../lib/media-display'
import {
  isStalePrimaryCrop,
  resolveWorkspaceEditorCrop,
  useCorrectStalePrimaryCrop,
} from './media-workspace-editor.lib'
import { MediaImageDetails } from './media-image-details'
import { mediaManagerStyles as styles } from './media-manager.variants'

function MediaWorkspacePreviewFigure({
  imageUrl,
  selected,
  asset,
}: {
  imageUrl: typeof mediaImageUrl
  selected: ContentMedia['images'][number]
  asset: MediaAsset
}) {
  return (
    <figure className={styles.previewCard()}>
      <img
        className={styles.preview()}
        src={imageUrl(asset.id, 'artwork', MEDIA_SOURCE_CROP)}
        alt={selected.alt ?? ''}
      />
    </figure>
  )
}

function MediaWorkspaceCropEditor({
  controller,
  imageUrl,
  asset,
  activeRole,
  cropPresentation,
}: {
  controller: MediaManagerController
  imageUrl: typeof mediaImageUrl
  asset: MediaAsset
  activeRole: MediaRole
  cropPresentation: ReturnType<typeof asCropPresentation>
}) {
  const { dispatch } = controller
  const source = { width: asset.orientedWidth, height: asset.orientedHeight }
  const constraint = resolveMediaCropEditorConstraint(activeRole)
  if (!constraint) return null

  const stalePrimaryCrop = isStalePrimaryCrop(activeRole, source, cropPresentation)
  const crop = resolveWorkspaceEditorCrop({
    role: activeRole,
    source,
    cropPresentation,
    stalePrimaryCrop,
  })
  const supportsFocalPoint = constraint.spec.supportsFocalPoint

  return (
    <MediaCropEditor
      src={imageUrl(asset.id, 'artwork', MEDIA_SOURCE_CROP)}
      source={source}
      constraint={constraint}
      crop={crop}
      focalPoint={supportsFocalPoint ? cropPresentation?.focalPoint : undefined}
      onFocalPointChange={
        supportsFocalPoint
          ? (focalPoint) => dispatch({ type: 'crop', crop, focalPoint })
          : undefined
      }
      onChange={(nextCrop) =>
        dispatch({ type: 'crop', crop: nextCrop, focalPoint: cropPresentation?.focalPoint })
      }
    />
  )
}

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
  const stalePrimaryCrop = isStalePrimaryCrop(activeRole, source, cropPresentation)

  useCorrectStalePrimaryCrop({
    dispatch,
    stalePrimaryCrop,
    isActiveForSelection,
    source,
    focalPoint: cropPresentation?.focalPoint,
  })

  if (!isActiveForSelection) {
    return <MediaWorkspacePreviewFigure imageUrl={imageUrl} selected={selected} asset={asset} />
  }

  if (activeRole === 'emblem') {
    return (
      <MediaEmblemEditor
        src={imageUrl(asset.id, 'artwork', MEDIA_SOURCE_CROP)}
        source={source}
        layout={containPresentation}
        instructions={mediaRoleSurfaceCopy.emblem.instructions}
        onChange={(layout) => dispatch({ type: 'contain', layout, source })}
      />
    )
  }

  return (
    <MediaWorkspaceCropEditor
      controller={controller}
      imageUrl={imageUrl}
      asset={asset}
      activeRole={activeRole}
      cropPresentation={cropPresentation}
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
  const { state, policy, onAlt, changeRole, remove } = controller
  const activeRole = state.presentation
  const assignment = state.media.roles[activeRole]
  const isActiveForSelection = assignment?.imageId === selected.id

  if (assignedRoles.length === 0) {
    return (
      <div className={styles.editor()}>
        <div className={styles.editorCrop()}>
          <MediaWorkspacePreviewFigure imageUrl={imageUrl} selected={selected} asset={asset} />
        </div>
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
    )
  }

  return (
    <div className={styles.editor()}>
      <div className={styles.editorCrop()}>
        <MediaWorkspaceEditor
          controller={controller}
          imageUrl={imageUrl}
          selected={selected}
          asset={asset}
          activeRole={activeRole}
          isActiveForSelection={isActiveForSelection}
        />
      </div>
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
  )
}
