import { useCallback, useState } from 'react'
import {
  getVocabularyOptionSetTerm,
  getVocabularySetCapability,
  vocabularyOptionSetIdSchema,
  type VocabularyOptionSetId,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'
import { Badge, buttonVariants, Text } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page/page-header'
import { PageLoadState } from '@/components/layout/page/page-load-state'
import { WidePage } from '@/components/layout/page/wide-page'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useCanManageCampaign } from '@/features/campaign'
import { UsageReferencesSection } from '@/lib/usage-references/usage-references-section'
import { notifyVocabularyEntrySaved } from '@/lib/notify'

import {
  VocabularyEntrySheet,
  type VocabularyEntryFormValues,
} from '../components/vocabulary-entry-sheet'
import {
  getVocabularySourceLabel,
  UNKNOWN_VOCABULARY_SET_MESSAGE,
  useVocabularyEntryUsage,
  useVocabularyMutations,
  useVocabularySet,
  vocabularyFieldLabel,
  VOCABULARY_STATUS_LABELS,
} from '@/features/vocabulary'

import { GameTermsFallback } from '../lib/detail/game-terms-fallback'
import { findGameTermsCategory } from '../lib/hub/vocabulary-set-registry'

type VocabularyTermDetailBodyProps = {
  campaignId: string
  setId: VocabularyOptionSetId
  entry: VocabularyOptionWithUsage
  canEdit: boolean
  showUsage: boolean
  onEdit: () => void
}

function VocabularyTermDetailBody({
  campaignId,
  setId,
  entry,
  canEdit,
  showUsage,
  onEdit,
}: VocabularyTermDetailBodyProps) {
  const { data: usage } = useVocabularyEntryUsage(campaignId, setId, entry.id, showUsage)

  const editAction = canEdit ? (
    <button
      type="button"
      className={buttonVariants({ variant: 'outline', size: 'sm' })}
      onClick={onEdit}
    >
      Edit
    </button>
  ) : undefined

  return (
    <>
      <PageHeader heading={entry.label} actions={editAction} />
      <div className="flex flex-wrap items-center gap-2">
        <Badge appearance="outline" tone="neutral" size="sm">
          {getVocabularySourceLabel(entry.source)}
        </Badge>
        {entry.status === 'disabled' ? (
          <Badge appearance="outline" tone="warning" size="sm">
            {VOCABULARY_STATUS_LABELS.disabled}
          </Badge>
        ) : null}
      </div>
      <Text variant="muted">{entry.description ?? 'No description.'}</Text>
      {showUsage ? (
        <UsageReferencesSection
          campaignId={campaignId}
          references={usage?.references ?? []}
          defaultOpen
        />
      ) : null}
    </>
  )
}

type VocabularyTermDetailPageProps = {
  campaignId: string
  setId: VocabularyOptionSetId
  termId: string
  setLabel: string
  singularLabel: string
}

function VocabularyTermDetailPage({
  campaignId,
  setId,
  termId,
  setLabel,
  singularLabel,
}: VocabularyTermDetailPageProps) {
  const canManage = useCanManageCampaign(campaignId)
  const capabilities = getVocabularySetCapability(setId)
  const { data: vocabularySet, isPending, isError } = useVocabularySet(campaignId, setId)
  const entry = vocabularySet?.options.find((option) => option.id === termId)
  const mutations = useVocabularyMutations(campaignId, setId)
  const [sheetOpen, setSheetOpen] = useState(false)

  useSetBreadcrumbLabel(entry?.label ?? '…')

  const handleEdit = useCallback(() => {
    setSheetOpen(true)
  }, [])

  async function handleSheetSubmit(values: VocabularyEntryFormValues) {
    if (!entry) return

    await mutations.patchEntry.mutateAsync({
      entryId: entry.id,
      input: {
        label: values.label,
        description: values.description || undefined,
        status: values.status,
      },
    })
    notifyVocabularyEntrySaved(values.label)
    setSheetOpen(false)
  }

  if (!isPending && !isError && vocabularySet && !entry) {
    return (
      <GameTermsFallback
        campaignId={campaignId}
        heading={setLabel}
        message="Unknown vocabulary entry."
      />
    )
  }

  const canEdit = Boolean(canManage && capabilities.edit && entry)

  return (
    <>
      <WidePage spacing="relaxed">
        <PageLoadState
          isPending={isPending}
          isError={isError}
          defaultErrorLabel={`Could not load ${setLabel.toLowerCase()}.`}
        >
          {entry ? (
            <VocabularyTermDetailBody
              campaignId={campaignId}
              setId={setId}
              entry={entry}
              canEdit={canEdit}
              showUsage={capabilities.usageResolution}
              onEdit={handleEdit}
            />
          ) : null}
        </PageLoadState>
      </WidePage>

      {entry ? (
        <VocabularyEntrySheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          mode="edit"
          campaignId={campaignId}
          setId={setId}
          createHeadline={`New ${singularLabel.toLowerCase()}`}
          entry={entry}
          isPending={mutations.patchEntry.isPending}
          onSubmit={(values) => handleSheetSubmit(values)}
        />
      ) : null}
    </>
  )
}

export type VocabularyTermDetailContentProps = {
  campaignId: string
  setId: string
  termId: string
}

/** Canonical read page for one vocabulary entry. */
export function VocabularyTermDetailContent({
  campaignId,
  setId: rawSetId,
  termId,
}: VocabularyTermDetailContentProps) {
  const parsedSetId = vocabularyOptionSetIdSchema.safeParse(rawSetId)

  if (!parsedSetId.success) {
    return <GameTermsFallback campaignId={campaignId} message={UNKNOWN_VOCABULARY_SET_MESSAGE} />
  }

  const category = findGameTermsCategory(parsedSetId.data)

  if (!category) {
    return <GameTermsFallback campaignId={campaignId} message={UNKNOWN_VOCABULARY_SET_MESSAGE} />
  }

  const setTerm = getVocabularyOptionSetTerm(category.setId)
  const singularLabel = vocabularyFieldLabel(setTerm)

  return (
    <VocabularyTermDetailPage
      campaignId={campaignId}
      setId={category.setId}
      termId={termId}
      setLabel={category.label}
      singularLabel={singularLabel}
    />
  )
}
