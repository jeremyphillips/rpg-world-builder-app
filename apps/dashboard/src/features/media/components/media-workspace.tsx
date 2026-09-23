import { Button, MediaCropEditor } from '@rpg/ui'
import { resolveEffectiveCrop, type ContentMedia, type MediaAsset } from '@rpg/contracts'
import type { UseQueryResult } from '@tanstack/react-query'

import type { MediaManagerController } from '../hooks/use-media-manager'
import { mediaImageUrl, MEDIA_SOURCE_CROP } from '../lib/media-display'
import { MediaImageDetails } from './media-image-details'
import { mediaManagerStyles as styles } from './media-manager.variants'
import { resolveMediaWorkspaceCopy } from './media-workspace.lib'

function MediaWorkspaceErrorAlert({
  queries,
}: {
  queries: Array<Pick<UseQueryResult, 'isError' | 'refetch'>>
}) {
  if (!queries.some((query) => query.isError)) {
    return null
  }

  return (
    <div role="alert">
      <p>Image details could not be loaded.</p>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          queries.forEach((query) => {
            if (query.isError) void query.refetch()
          })
        }}
      >
        Retry image details
      </Button>
    </div>
  )
}

export function MediaWorkspace({
  controller,
  imageUrl = mediaImageUrl,
}: {
  controller: MediaManagerController
  imageUrl?: typeof mediaImageUrl
}) {
  const { state, selected, asset, queries } = controller
  const portrait = Boolean(
    selected &&
    state.media.roles.portrait?.imageId === selected.id &&
    state.presentation === 'portrait',
  )
  const primary = Boolean(selected && state.media.roles.primary?.imageId === selected.id)
  const copy = resolveMediaWorkspaceCopy({ portrait, primary })

  return (
    <section className={styles.workspace()} aria-label="Image workspace">
      <h2 className={styles.heading()}>{copy.heading}</h2>
      <p className={styles.muted()}>{copy.description}</p>
      {selected && asset ? (
        <MediaWorkspaceSelection
          controller={controller}
          imageUrl={imageUrl}
          image={selected}
          asset={asset}
        />
      ) : (
        <div className={styles.empty()}>
          {selected ? 'Loading image details…' : 'Add an image to get started.'}
        </div>
      )}
      <MediaWorkspaceErrorAlert queries={queries} />
    </section>
  )
}

function MediaWorkspaceSelection({
  controller,
  imageUrl,
  image: selected,
  asset,
}: {
  controller: MediaManagerController
  imageUrl: typeof mediaImageUrl
  image: ContentMedia['images'][number]
  asset: MediaAsset
}) {
  const { state, policy, dispatch, onAlt, changeRole, remove } = controller
  const portrait =
    state.media.roles.portrait?.imageId === selected.id && state.presentation === 'portrait'
  const primary = state.media.roles.primary?.imageId === selected.id
  return (
    <>
      {primary && state.media.roles.portrait?.imageId === selected.id && (
        <div className={styles.row()} role="group" aria-label="Presentation">
          {(['portrait', 'primary'] as const).map((role) => (
            <Button
              key={role}
              type="button"
              variant="outline"
              aria-pressed={state.presentation === role}
              onClick={() => dispatch({ type: 'presentation', role })}
            >
              {role === 'portrait' ? 'Portrait' : 'Primary image'}
            </Button>
          ))}
        </div>
      )}
      <div className={styles.editor()}>
        {portrait ? (
          <MediaCropEditor
            src={imageUrl(asset.id, 'artwork', MEDIA_SOURCE_CROP)}
            source={{ width: asset.orientedWidth, height: asset.orientedHeight }}
            crop={resolveEffectiveCrop(state.media.roles.portrait?.presentation, {
              width: asset.orientedWidth,
              height: asset.orientedHeight,
            })}
            onChange={(crop) => dispatch({ type: 'crop', crop })}
          />
        ) : (
          <img
            className={styles.preview()}
            src={imageUrl(asset.id, 'artwork', MEDIA_SOURCE_CROP)}
            alt={selected.alt ?? ''}
          />
        )}
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
