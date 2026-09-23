import {
  Button,
  cn,
  DialogPanelScrollRegion,
  FileDropzone,
  MediaCropEditor,
  resolveChromeCalloutClasses,
  resolveImageDropTargetDefaults,
  type ScrollBoundaryState,
} from '@rpg/ui'
import { Info } from 'lucide-react'
import { resolveEffectiveCrop, type ContentMedia, type MediaAsset } from '@rpg/contracts'
import type { UseQueryResult } from '@tanstack/react-query'

import type { MediaManagerController } from '../hooks/use-media-manager'
import { mediaImageUrl, MEDIA_SOURCE_CROP } from '../lib/media-display'
import { MediaImageDetails } from './media-image-details'
import { mediaManagerStyles as styles } from './media-manager.variants'
import { resolveMediaWorkspaceCopy, resolveMediaWorkspaceOnboarding } from './media-workspace.lib'

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
  onScrollBoundaryChange,
}: {
  controller: MediaManagerController
  imageUrl?: typeof mediaImageUrl
  onScrollBoundaryChange?: (state: ScrollBoundaryState) => void
}) {
  const { state, selected, asset, queries, policy, uploads } = controller
  const portrait = Boolean(
    selected &&
    state.media.roles.portrait?.imageId === selected.id &&
    state.presentation === 'portrait',
  )
  const primary = Boolean(selected && state.media.roles.primary?.imageId === selected.id)
  const copy = resolveMediaWorkspaceCopy({
    portrait,
    primary,
    hasSelection: Boolean(selected),
  })

  return (
    <section className={styles.workspace()} aria-label="Image workspace">
      <DialogPanelScrollRegion
        inset="innerLeading"
        regionClassName={styles.columnScroll()}
        viewportClassName={styles.columnScrollViewport()}
        showTopBoundaryShadow={false}
        showBottomBoundaryShadow={false}
        onBoundaryStateChange={onScrollBoundaryChange}
      >
        {portrait ? (
          <div className={styles.workspaceHeaderPortrait()}>
            <h2 className={styles.workspacePortraitHeading()}>{copy.heading}</h2>
            <p className={styles.muted()}>{copy.description}</p>
          </div>
        ) : (
          <div className={styles.workspaceHeader()}>
            <h2 className={styles.heading()}>{copy.heading}</h2>
            <p className={styles.muted()}>{copy.description}</p>
          </div>
        )}
        <div className={styles.workspaceContent()}>
          {selected && asset ? (
            <MediaWorkspaceSelection
              controller={controller}
              imageUrl={imageUrl}
              image={selected}
              asset={asset}
            />
          ) : selected ? (
            <div className={styles.empty()}>Loading image details…</div>
          ) : (
            <>
              <div className={styles.empty()}>
                <FileDropzone
                  {...resolveImageDropTargetDefaults(
                    uploads.maxUploadBytes !== undefined
                      ? { maxUploadBytes: uploads.maxUploadBytes }
                      : { includeMaxSize: false },
                  )}
                  className="h-full"
                  multiple
                  dropTarget={false}
                  onChange={(files) => uploads.add(files)}
                />
              </div>
              <div
                className={cn(
                  styles.workspaceOnboarding(),
                  resolveChromeCalloutClasses({ variant: 'callout', tone: 'info' }),
                )}
              >
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p className="text-sm">{resolveMediaWorkspaceOnboarding(policy.domain)}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <MediaWorkspaceErrorAlert queries={queries} />
      </DialogPanelScrollRegion>
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
