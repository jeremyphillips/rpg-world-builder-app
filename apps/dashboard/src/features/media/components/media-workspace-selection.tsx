import { MediaCropEditor, MediaEmblemEditor } from '@rpg/ui'
import {
  asContainPresentation,
  asCropPresentation,
  defaultEmblemPresentation,
  mediaRoleSurfaceCopy,
  resolveMediaCropEditorConstraint,
  roleAssignmentMatchesVirtualId,
  type AvailableContentImage,
  type MediaAsset,
  type MediaRole,
  type SourceDimensions,
} from '@rpg/contracts'

import type { MediaManagerController } from '../hooks/use-media-manager'
import { mediaImageUrl, MEDIA_SOURCE_CROP, systemContentImageUrl } from '../lib/media-display'
import {
  isStalePrimaryCrop,
  resolveWorkspaceEditorCrop,
  useCorrectStalePrimaryCrop,
} from './media-workspace-editor.lib'
import { mediaManagerStyles as styles } from './media-manager.variants'

function MediaWorkspacePreviewFigure({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className={styles.previewCard()}>
      <img className={styles.preview()} src={src} alt={alt} />
    </figure>
  )
}

function MediaWorkspaceCropEditor({
  controller,
  src,
  source,
  activeRole,
  cropPresentation,
}: {
  controller: MediaManagerController
  src: string
  source: SourceDimensions
  activeRole: MediaRole
  cropPresentation: ReturnType<typeof asCropPresentation>
}) {
  const { dispatch } = controller
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
      src={src}
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
  src,
  source,
  activeRole,
  isActiveForSelection,
  interaction,
}: {
  controller: MediaManagerController
  src: string
  source: SourceDimensions
  activeRole: MediaRole
  isActiveForSelection: boolean
  interaction?: string
}) {
  const { dispatch } = controller
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
    return <MediaWorkspacePreviewFigure src={src} alt="" />
  }

  if (activeRole === 'emblem') {
    return (
      <div className={styles.editorCrop()}>
        <MediaEmblemEditor
          src={src}
          source={source}
          layout={containPresentation}
          instructions={mediaRoleSurfaceCopy.emblem.instructions}
          onChange={(layout) => dispatch({ type: 'contain', layout, source })}
        />
        {interaction ? <p className={styles.muted()}>{interaction}</p> : null}
      </div>
    )
  }

  return (
    <div className={styles.editorCrop()}>
      <MediaWorkspaceCropEditor
        controller={controller}
        src={src}
        source={source}
        activeRole={activeRole}
        cropPresentation={cropPresentation}
      />
      {interaction ? <p className={styles.muted()}>{interaction}</p> : null}
    </div>
  )
}

function resolveSelectionContext(input: {
  selectedAvailable: AvailableContentImage
  asset?: MediaAsset
  resolveSystemImageUrl: (srcPath: string) => string
  imageUrl: typeof mediaImageUrl
}): { src: string; source: SourceDimensions; alt: string } | undefined {
  if (input.selectedAvailable.kind === 'system') {
    return {
      src: input.resolveSystemImageUrl(input.selectedAvailable.srcPath),
      source: input.selectedAvailable.sourceDimensions,
      alt: input.selectedAvailable.source.slug,
    }
  }
  if (!input.asset) return undefined
  return {
    src: input.imageUrl(input.asset.id, 'artwork', MEDIA_SOURCE_CROP),
    source: { width: input.asset.orientedWidth, height: input.asset.orientedHeight },
    alt: input.selectedAvailable.attachment.alt ?? '',
  }
}

export function MediaWorkspaceSelection({
  controller,
  imageUrl = mediaImageUrl,
  selectedAvailable,
  asset,
  assignedRoles,
  interaction,
}: {
  controller: MediaManagerController
  imageUrl?: typeof mediaImageUrl
  selectedAvailable: AvailableContentImage
  asset?: MediaAsset
  assignedRoles: MediaRole[]
  interaction?: string
}) {
  const { state, resolveSystemImageUrl = systemContentImageUrl } = controller
  const activeRole = state.presentation
  const assignment = state.media.roles[activeRole]
  const isActiveForSelection =
    selectedAvailable.kind === 'system'
      ? assignedRoles.includes(activeRole) &&
        (!assignment || roleAssignmentMatchesVirtualId(assignment, selectedAvailable.id))
      : assignment?.source.kind === 'upload' &&
        assignment.source.imageId === selectedAvailable.attachment.id
  const context = resolveSelectionContext({
    selectedAvailable,
    asset,
    resolveSystemImageUrl,
    imageUrl,
  })

  if (!context) {
    return <div className={styles.empty()}>Loading image details…</div>
  }

  if (assignedRoles.length === 0) {
    return <MediaWorkspacePreviewFigure src={context.src} alt={context.alt} />
  }

  return (
    <MediaWorkspaceEditor
      controller={controller}
      src={context.src}
      source={context.source}
      activeRole={activeRole}
      isActiveForSelection={isActiveForSelection}
      interaction={interaction}
    />
  )
}
