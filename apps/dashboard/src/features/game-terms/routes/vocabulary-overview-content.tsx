'use client'

import { useCallback, useState } from 'react'
import {
  deriveVocabularyEntryId,
  getVocabularyOptionSetTerm,
  vocabularyOptionSetIdSchema,
  type VocabularyOptionSetId,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'
import { buttonVariants } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page/page-header'
import { PageLoadState } from '@/components/layout/page/page-load-state'
import { WidePage } from '@/components/layout/page/wide-page'
import { useCanManageCampaign } from '@/features/campaign'
import { notifyVocabularyEntryCreated, notifyVocabularyEntrySaved } from '@/lib/notify'
import { CatalogOverviewTable } from '@/lib/data-table/catalog-overview-table.client'

import { BulkVocabularyAvailabilityDialog } from '../components/bulk-vocabulary-availability-dialog.client'
import {
  VocabularyEntrySheet,
  type VocabularyEntryFormValues,
} from '../components/vocabulary-entry-sheet.client'
import {
  UNKNOWN_VOCABULARY_SET_MESSAGE,
  useVocabularyMutations,
  useVocabularySet,
  vocabularyFieldLabel,
} from '@/features/vocabulary'

import { useVocabularyOverviewPage } from '../hooks/use-vocabulary-overview-page.client'
import { GameTermsFallback } from '../lib/detail/game-terms-fallback'
import { findGameTermsCategory } from '../lib/hub/vocabulary-set-registry'
import { VOCABULARY_OVERVIEW_FILTER_SCHEMA } from '../lib/vocabulary/vocabulary-overview-filter-schema'
import { buildVocabularyOverviewEmptyState } from '../lib/vocabulary/vocabulary-overview-availability-ui.lib'

type SheetState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; entry: VocabularyOptionWithUsage }

type VocabularyOverviewPageProps = {
  campaignId: string
  setId: VocabularyOptionSetId
  setLabel: string
  singularLabel: string
  pluralLabel: string
}

function VocabularyOverviewPage({
  campaignId,
  setId,
  setLabel,
  singularLabel,
  pluralLabel,
}: VocabularyOverviewPageProps) {
  const canManage = useCanManageCampaign(campaignId)
  const { isPending, isError } = useVocabularySet(campaignId, setId)
  const mutations = useVocabularyMutations(campaignId, setId)
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' })

  const handleEdit = useCallback((entry: VocabularyOptionWithUsage) => {
    setSheet({ mode: 'edit', entry })
  }, [])

  const overview = useVocabularyOverviewPage({
    campaignId,
    setId,
    canManage,
    onEdit: handleEdit,
  })

  const isSheetOpen = sheet.mode !== 'closed'
  const isMutating =
    mutations.createEntry.isPending ||
    mutations.patchEntry.isPending ||
    mutations.deleteEntry.isPending

  async function handleSheetSubmit(values: VocabularyEntryFormValues) {
    if (sheet.mode === 'create') {
      await mutations.createEntry.mutateAsync({
        setId,
        id: deriveVocabularyEntryId(values.label),
        label: values.label,
        description: values.description || undefined,
        status: values.status,
      })
      notifyVocabularyEntryCreated(values.label)
    } else if (sheet.mode === 'edit') {
      await mutations.patchEntry.mutateAsync({
        entryId: sheet.entry.id,
        input: {
          label: values.label,
          description: values.description || undefined,
          status: values.status,
        },
      })
      notifyVocabularyEntrySaved(values.label)
    }

    setSheet({ mode: 'closed' })
  }

  const newAction =
    canManage && overview.capabilities.create ? (
      <button
        type="button"
        className={buttonVariants({ size: 'sm' })}
        onClick={() => setSheet({ mode: 'create' })}
      >
        New {singularLabel.toLowerCase()}
      </button>
    ) : undefined

  return (
    <>
      <WidePage spacing="relaxed">
        <PageHeader heading={setLabel} actions={newAction} />
        <PageLoadState
          isPending={isPending}
          isError={isError}
          defaultErrorLabel={`Could not load ${setLabel.toLowerCase()}.`}
        >
          <CatalogOverviewTable
            tableKey={`vocabulary-${setId}`}
            columns={overview.columns}
            data={overview.tableRows}
            caption={`${setLabel} available in this campaign`}
            filterSchema={VOCABULARY_OVERVIEW_FILTER_SCHEMA}
            filterState={overview.filterState}
            onFilterChange={overview.setFilterField}
            onResetFilters={overview.resetFilters}
            getRowClassName={overview.getRowClassName}
            getCellClassName={overview.getCellClassName}
            rowActions={overview.rowActions}
            selection={overview.selectionConfig}
            availabilityEmptyState={({ scope, campaignAvailability, setFilterValue }) =>
              buildVocabularyOverviewEmptyState({
                campaignAvailability,
                scope,
                pluralNoun: pluralLabel.toLowerCase(),
                actions: { setFilterValue },
              })
            }
          />
        </PageLoadState>
      </WidePage>

      <VocabularyEntrySheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (!open) setSheet({ mode: 'closed' })
        }}
        mode={sheet.mode === 'edit' ? 'edit' : 'create'}
        campaignId={campaignId}
        setId={setId}
        createHeadline={`New ${singularLabel.toLowerCase()}`}
        entry={sheet.mode === 'edit' ? sheet.entry : undefined}
        isPending={isMutating}
        onSubmit={(values) => handleSheetSubmit(values)}
      />

      {overview.capabilities.bulkAvailability ? (
        <BulkVocabularyAvailabilityDialog
          open={overview.bulkOpen}
          onOpenChange={overview.setBulkOpen}
          campaignId={campaignId}
          setId={setId}
          selectedRows={overview.selectedRows}
          onApplyComplete={(summary) => {
            overview.removeFromSelection(summary.updatedIds)
            if (summary.fullSuccess) {
              overview.setBulkOpen(false)
              overview.exitSelectionMode()
            }
            if (summary.updatedIds.length > 0) {
              void overview.invalidateSet()
            }
          }}
        />
      ) : null}
    </>
  )
}

export type VocabularyOverviewContentProps = {
  campaignId: string
  setId: string
}

/** Game Terms set overview — table and entry sheet authoring. */
export function VocabularyOverviewContent({
  campaignId,
  setId: rawSetId,
}: VocabularyOverviewContentProps) {
  const parsedSetId = vocabularyOptionSetIdSchema.safeParse(rawSetId)

  if (!parsedSetId.success) {
    return <GameTermsFallback campaignId={campaignId} message={UNKNOWN_VOCABULARY_SET_MESSAGE} />
  }

  const category = findGameTermsCategory(parsedSetId.data)

  if (!category) {
    return <GameTermsFallback campaignId={campaignId} message={UNKNOWN_VOCABULARY_SET_MESSAGE} />
  }

  const setId = category.setId
  const setTerm = getVocabularyOptionSetTerm(setId)
  const singularLabel = vocabularyFieldLabel(setTerm)
  const pluralLabel = vocabularyFieldLabel(setTerm, { plural: true })

  return (
    <VocabularyOverviewPage
      campaignId={campaignId}
      setId={setId}
      setLabel={category.label}
      singularLabel={singularLabel}
      pluralLabel={pluralLabel}
    />
  )
}
