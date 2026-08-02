'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import type { GlobalSearchDocument, GlobalSearchFilterGroup } from '@rpg/contracts'

import { useGlobalSearchTopbar } from '../hooks/use-global-search-topbar'
import { useDismissOnOutsideInteraction } from '../hooks/use-dismiss-on-outside-interaction'
import { buildGlobalSearchPageHref } from '../lib/global-search-url'
import { resolveGlobalSearchHref } from '../lib/resolve-global-search-href'
import { GlobalSearchField } from './global-search-field.client'
import { GlobalSearchPreviewPanel } from './global-search-preview-panel.client'
import { GlobalSearchTrigger } from './global-search-trigger.client'
import { useGlobalSearchContext } from './global-search-provider.client'
import {
  globalSearchTopbarInputWrapClasses,
  globalSearchTopbarPreviewClasses,
  globalSearchTopbarRootClasses,
} from './global-search-topbar.variants'

const TOPBAR_SEARCH_FIELD_ID = 'global-search-topbar-field'
const TOPBAR_SEARCH_PREVIEW_ID = 'global-search-topbar-preview'

export function GlobalSearchTopbar() {
  const { campaignId, open, setOpen } = useGlobalSearchContext()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const disabled = !campaignId

  const handleClose = React.useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const handleOpen = React.useCallback(() => {
    if (disabled) return
    setOpen(true)
  }, [disabled, setOpen])

  useDismissOnOutsideInteraction({
    enabled: open,
    containerRef,
    onDismiss: handleClose,
  })

  if (!campaignId) {
    return (
      <div className={globalSearchTopbarRootClasses}>
        <GlobalSearchTrigger disabled onOpen={() => undefined} />
      </div>
    )
  }

  return (
    <GlobalSearchTopbarExpanded
      campaignId={campaignId}
      open={open}
      containerRef={containerRef}
      onOpen={handleOpen}
      onClose={handleClose}
    />
  )
}

type GlobalSearchTopbarExpandedProps = {
  campaignId: string
  open: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  onOpen: () => void
  onClose: () => void
}

function GlobalSearchTopbarExpanded({
  campaignId,
  open,
  containerRef,
  onOpen,
  onClose,
}: GlobalSearchTopbarExpandedProps) {
  const navigate = useNavigate()
  const search = useGlobalSearchTopbar(campaignId, open)

  const handleSubmit = React.useCallback(() => {
    navigate(buildGlobalSearchPageHref(campaignId, { q: search.query, group: 'all' }))
    onClose()
  }, [campaignId, navigate, onClose, search.query])

  const resolveHref = React.useCallback(
    (document: GlobalSearchDocument) => resolveGlobalSearchHref(campaignId, document.target),
    [campaignId],
  )

  const showAllHref = React.useCallback(
    (filterGroup: GlobalSearchFilterGroup) =>
      buildGlobalSearchPageHref(campaignId, { q: search.query, group: filterGroup }),
    [campaignId, search.query],
  )

  return (
    <div ref={containerRef} className={globalSearchTopbarRootClasses}>
      {open ? (
        <div className={globalSearchTopbarInputWrapClasses}>
          <GlobalSearchField
            id={TOPBAR_SEARCH_FIELD_ID}
            value={search.query}
            onValueChange={search.setQuery}
            autoFocus
            aria-controls={TOPBAR_SEARCH_PREVIEW_ID}
            aria-expanded
            onRequestClose={onClose}
            onSubmit={handleSubmit}
            size="sm"
          />
          <GlobalSearchPreviewPanel
            id={TOPBAR_SEARCH_PREVIEW_ID}
            campaignId={campaignId}
            query={search.query}
            hasQuery={search.hasQuery}
            groupedSections={search.groupedSections}
            resultCount={search.resultCount}
            isPending={search.isPending}
            isError={search.isError}
            viewAllHref={buildGlobalSearchPageHref(campaignId, { q: search.query, group: 'all' })}
            onClose={onClose}
            onRetry={() => {
              void search.refetch()
            }}
            resolveHref={resolveHref}
            showAllHref={showAllHref}
            className={globalSearchTopbarPreviewClasses}
          />
        </div>
      ) : (
        <GlobalSearchTrigger
          onOpen={onOpen}
          aria-controls={TOPBAR_SEARCH_PREVIEW_ID}
          aria-expanded={false}
        />
      )}
    </div>
  )
}
