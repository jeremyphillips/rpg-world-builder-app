import {
  Button,
  cn,
  DialogPanelScrollRegion,
  FileDropzone,
  resolveChromeCalloutClasses,
  resolveImageDropTargetDefaults,
  type ScrollBoundaryState,
} from '@rpg/ui'
import { Info } from 'lucide-react'
import type { UseQueryResult } from '@tanstack/react-query'

import type { MediaManagerController } from '../hooks/use-media-manager'
import { assignedRolesForImage } from '../lib/media-session'
import { mediaImageUrl } from '../lib/media-display'
import { mediaManagerStyles as styles } from './media-manager.variants'
import { MediaWorkspaceSelection } from './media-workspace-selection'
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
  const assignedRoles = selected
    ? assignedRolesForImage(state.media, selected.id, policy.allowedRoles)
    : []
  const copy = resolveMediaWorkspaceCopy({
    presentation: state.presentation,
    assignedRoles,
    hasSelection: Boolean(selected),
  })
  const isCropEditor =
    selected &&
    assignedRoles.includes(state.presentation) &&
    state.presentation !== 'emblem' &&
    ['portrait', 'banner', 'primary'].includes(state.presentation)

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
        {isCropEditor ? (
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
              assignedRoles={assignedRoles}
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
