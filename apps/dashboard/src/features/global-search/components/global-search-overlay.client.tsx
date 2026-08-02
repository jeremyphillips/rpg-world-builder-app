'use client'

import * as React from 'react'

import type { GlobalSearchDocument, GlobalSearchFilterGroup } from '@rpg/contracts'
import { Modal } from '@rpg/ui'

import { useGlobalSearchOverlay } from '../hooks/use-global-search-overlay'
import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import { buildGlobalSearchPageHref } from '../lib/global-search-url'
import { resolveGlobalSearchHref } from '../lib/resolve-global-search-href'
import { GlobalSearchOverlayPanel } from './global-search-overlay-panel.client'

export type GlobalSearchOverlayProps = {
  campaignId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearchOverlay({ campaignId, open, onOpenChange }: GlobalSearchOverlayProps) {
  const overlay = useGlobalSearchOverlay(campaignId, open)

  const resolveHref = React.useCallback(
    (document: GlobalSearchDocument) => resolveGlobalSearchHref(campaignId, document.target),
    [campaignId],
  )

  const showAllHref = React.useCallback(
    (filterGroup: GlobalSearchFilterGroup) =>
      buildGlobalSearchPageHref(campaignId, { q: overlay.query, group: filterGroup }),
    [campaignId, overlay.query],
  )

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg" aria-label={GLOBAL_SEARCH_COPY.pageTitle}>
        <GlobalSearchOverlayPanel
          campaignId={campaignId}
          query={overlay.query}
          hasQuery={overlay.hasQuery}
          groupedSections={overlay.groupedSections}
          resultCount={overlay.resultCount}
          isPending={overlay.isPending}
          isError={overlay.isError}
          viewAllHref={buildGlobalSearchPageHref(campaignId, { q: overlay.query, group: 'all' })}
          onOpenChange={onOpenChange}
          onQueryChange={overlay.setQuery}
          onRetry={() => {
            void overlay.refetch()
          }}
          resolveHref={resolveHref}
          showAllHref={showAllHref}
        />
      </Modal.Content>
    </Modal.Root>
  )
}
