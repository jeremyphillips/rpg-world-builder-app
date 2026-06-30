'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants, DataTable, Heading, Text } from '@rpg/ui'
import {
  vocabularyOptionSetIdSchema,
  type VocabularyOptionSetId,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'

import { PageHeader } from '@/components/layout/page-header'
import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { ROUTES } from '@/app/routes'
import { useCanManageCampaign } from '@/features/campaign'

import { vocabularyColumns } from '../lib/vocabulary/vocabulary-overview-columns'
import {
  VocabularyEntrySheet,
  type VocabularyEntryFormValues,
} from '../components/vocabulary-entry-sheet.client'
import { VocabularyRowActions } from '../components/vocabulary-row-actions.client'
import { VocabularySetNav } from '../components/vocabulary-set-nav.client'
import { useVocabularyMutations, useVocabularySet } from '../hooks/use-vocabulary-set'
import {
  UNKNOWN_VOCABULARY_SET_MESSAGE,
  VOCABULARY_NOT_IMPLEMENTED_MESSAGE,
} from '../lib/vocabulary/labels'
import { findVocabularySetEntry } from '../lib/hub/vocabulary-set-registry'

type SheetState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; entry: VocabularyOptionWithUsage }

type VocabularySetManagerProps = {
  campaignId: string
  setId: VocabularyOptionSetId
  setLabel: string
}

function VocabularySetManager({ campaignId, setId, setLabel }: VocabularySetManagerProps) {
  const canManage = useCanManageCampaign(campaignId)
  const { data: vocabularySet, isPending, isError } = useVocabularySet(campaignId, setId)
  const mutations = useVocabularyMutations(campaignId, setId)
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' })

  const isSheetOpen = sheet.mode !== 'closed'
  const isMutating =
    mutations.createEntry.isPending ||
    mutations.patchEntry.isPending ||
    mutations.deleteEntry.isPending

  async function handleSheetSubmit(values: VocabularyEntryFormValues) {
    if (sheet.mode === 'create') {
      await mutations.createEntry.mutateAsync({
        setId,
        id: values.id,
        label: values.label,
        description: values.description || undefined,
      })
    } else if (sheet.mode === 'edit') {
      await mutations.patchEntry.mutateAsync({
        entryId: sheet.entry.id,
        input: {
          label: values.label,
          description: values.description || undefined,
          status: values.status,
        },
      })
    }

    setSheet({ mode: 'closed' })
  }

  const newAction = canManage ? (
    <button
      type="button"
      className={buttonVariants({ size: 'sm' })}
      onClick={() => setSheet({ mode: 'create' })}
    >
      New
    </button>
  ) : undefined

  return (
    <>
      <PageHeader heading={setLabel} actions={newAction} />
      <PageLoadState
        isPending={isPending}
        isError={isError}
        defaultErrorLabel={`Could not load ${setLabel.toLowerCase()}.`}
      >
        <DataTable
          columns={vocabularyColumns()}
          data={vocabularySet?.options ?? []}
          caption={`${setLabel} available in this campaign`}
          rowActions={(row) => (
            <VocabularyRowActions
              entry={row}
              canManage={canManage}
              onEdit={(entry) => setSheet({ mode: 'edit', entry })}
              onToggleStatus={(entry) => {
                void mutations.patchEntry.mutateAsync({
                  entryId: entry.id,
                  input: { status: entry.status === 'active' ? 'disabled' : 'active' },
                })
              }}
              onDelete={(entry) => {
                void mutations.deleteEntry.mutateAsync(entry.id)
              }}
            />
          )}
        />
      </PageLoadState>

      <VocabularyEntrySheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (!open) setSheet({ mode: 'closed' })
        }}
        mode={sheet.mode === 'edit' ? 'edit' : 'create'}
        entry={sheet.mode === 'edit' ? sheet.entry : undefined}
        isPending={isMutating}
        onSubmit={(values) => {
          void handleSheetSubmit(values)
        }}
      />
    </>
  )
}

export type VocabularyDetailContentProps = {
  campaignId: string
  setId: string
}

/** Shared vocabulary set manager — rail/select nav, table, and entry sheet. */
export function VocabularyDetailContent({
  campaignId,
  setId: rawSetId,
}: VocabularyDetailContentProps) {
  const parsedSetId = vocabularyOptionSetIdSchema.safeParse(rawSetId)

  if (!parsedSetId.success) {
    return (
      <WidePage spacing="relaxed">
        <PageHeader heading="Vocabulary" />
        <Text variant="muted">{UNKNOWN_VOCABULARY_SET_MESSAGE}</Text>
        <Link
          to={ROUTES.homebrew.hub(campaignId)}
          className={buttonVariants({ variant: 'outline' })}
        >
          Back to Homebrew
        </Link>
      </WidePage>
    )
  }

  const setId = parsedSetId.data
  const registryEntry = findVocabularySetEntry(setId)
  const setEnabled = registryEntry?.enabled ?? false
  const setLabel = registryEntry?.label ?? rawSetId

  return (
    <WidePage spacing="list">
      <div className="flex flex-col gap-6 lg:flex-row">
        <VocabularySetNav campaignId={campaignId} activeSetId={setId} />
        <div className="mx-auto min-w-0 w-full max-w-xl flex-1">
          {setEnabled ? (
            <VocabularySetManager campaignId={campaignId} setId={setId} setLabel={setLabel} />
          ) : (
            <>
              <PageHeader heading={setLabel} />
              <Heading variant="section" as="h2">
                Not available yet
              </Heading>
              <Text variant="muted">{VOCABULARY_NOT_IMPLEMENTED_MESSAGE}</Text>
            </>
          )}
        </div>
      </div>
    </WidePage>
  )
}
