import { useCallback, useState } from 'react'
import {
  DEFAULT_SYSTEM_RULESET_ID,
  getVocabularyOptionSetTerm,
  getVocabularySetCapability,
  vocabularyOptionSetIdSchema,
  type VocabularyOptionSetId,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'
import { Badge, buttonVariants, Eyebrow, Text } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page/page-header'
import { contentDetailHeroEyebrowClasses } from '@/features/content'
import { PageLoadState } from '@/components/layout/page/page-load-state'
import { PageShell } from '@/components/layout/page/page-shell'
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
import { GameTermDetailMediaField } from '../components/game-term-detail-media-field'
import { shouldShowGameTermMediaField } from '../lib/vocabulary/vocabulary-term-detail-page.lib'
import type { MediaManagerSave } from '@/features/media'
import { vocabularyTermDetailBodyClasses } from './vocabulary-term-detail-content.variants'

type VocabularyTermDetailBodyProps = {
  campaignId: string
  setId: VocabularyOptionSetId
  setLabel: string
  entry: VocabularyOptionWithUsage
  singularLabel: string
  canManageMedia: boolean
  canEdit: boolean
  showMediaField: boolean
  showUsage: boolean
  onEdit: () => void
  onSaveMedia: (change: MediaManagerSave) => void | Promise<void>
}

function VocabularyTermDetailBody({
  campaignId,
  setId,
  setLabel,
  entry,
  singularLabel,
  canManageMedia,
  canEdit,
  showMediaField,
  showUsage,
  onEdit,
  onSaveMedia,
}: VocabularyTermDetailBodyProps) {
  const { data: usage } = useVocabularyEntryUsage(campaignId, setId, entry.id, showUsage)
  const rulesetId = DEFAULT_SYSTEM_RULESET_ID

  const editAction = canEdit ? (
    <button
      type="button"
      className={buttonVariants({ variant: 'outline', size: 'sm' })}
      onClick={onEdit}
    >
      Edit
    </button>
  ) : undefined

  const sourceBadge = (
    <Badge appearance="outline" tone="neutral" size="sm">
      {getVocabularySourceLabel(entry.source)}
    </Badge>
  )
  const disabledBadge =
    entry.status === 'disabled' ? (
      <Badge appearance="outline" tone="warning" size="sm">
        {VOCABULARY_STATUS_LABELS.disabled}
      </Badge>
    ) : null

  return (
    <>
      <div className={vocabularyTermDetailBodyClasses}>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <Eyebrow size="md" tone="muted" className={contentDetailHeroEyebrowClasses}>
              {setLabel}
            </Eyebrow>
            <PageHeader
              heading={entry.label}
              badge={
                <>
                  {sourceBadge}
                  {disabledBadge}
                </>
              }
              actions={editAction}
            />
          </div>
          <Text variant="muted">{entry.description ?? 'No description.'}</Text>
        </div>
        {showMediaField ? (
          <div className="shrink-0 self-start">
            <GameTermDetailMediaField
              campaignId={campaignId}
              setId={setId}
              entry={entry}
              singularLabel={singularLabel}
              rulesetId={rulesetId}
              readOnly={!canManageMedia}
              onSave={onSaveMedia}
            />
          </div>
        ) : null}
      </div>
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

function VocabularyTermDetailLoaded({
  campaignId,
  setId,
  setLabel,
  singularLabel,
  entry,
}: {
  campaignId: string
  setId: VocabularyOptionSetId
  setLabel: string
  singularLabel: string
  entry: VocabularyOptionWithUsage
}) {
  const canManage = useCanManageCampaign(campaignId)
  const capabilities = getVocabularySetCapability(setId)
  const mutations = useVocabularyMutations(campaignId, setId)
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleEdit = useCallback(() => setSheetOpen(true), [])
  const handleSaveMedia = useCallback(
    async (change: MediaManagerSave) => {
      await mutations.patchEntry.mutateAsync({
        entryId: entry.id,
        input: {
          media: change.media,
          expectedMediaRevision: change.expectedMediaRevision,
        },
      })
    },
    [entry.id, mutations.patchEntry],
  )

  const handleSheetSubmit = async (values: VocabularyEntryFormValues) => {
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

  return (
    <>
      <VocabularyTermDetailBody
        campaignId={campaignId}
        setId={setId}
        setLabel={setLabel}
        entry={entry}
        singularLabel={singularLabel}
        canManageMedia={Boolean(canManage && capabilities.media)}
        canEdit={Boolean(canManage && capabilities.edit)}
        showMediaField={shouldShowGameTermMediaField(setId, entry, capabilities)}
        showUsage={capabilities.usageResolution}
        onEdit={handleEdit}
        onSaveMedia={handleSaveMedia}
      />
      <VocabularyEntrySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode="edit"
        campaignId={campaignId}
        setId={setId}
        createHeadline={`New ${singularLabel.toLowerCase()}`}
        entry={entry}
        isPending={mutations.patchEntry.isPending}
        onSubmit={handleSheetSubmit}
      />
    </>
  )
}

function VocabularyTermDetailPage({
  campaignId,
  setId,
  termId,
  setLabel,
  singularLabel,
}: VocabularyTermDetailPageProps) {
  const { data: vocabularySet, isPending, isError } = useVocabularySet(campaignId, setId)
  const entry = vocabularySet?.options.find((option) => option.id === termId)

  useSetBreadcrumbLabel(entry?.label ?? '…')

  if (!isPending && !isError && vocabularySet && !entry) {
    return (
      <GameTermsFallback
        campaignId={campaignId}
        heading={setLabel}
        message="Unknown vocabulary entry."
      />
    )
  }

  return (
    <PageShell width="full" rhythm="relaxed">
      <PageLoadState
        isPending={isPending}
        isError={isError}
        defaultErrorLabel={`Could not load ${setLabel.toLowerCase()}.`}
      >
        {entry ? (
          <VocabularyTermDetailLoaded
            campaignId={campaignId}
            setId={setId}
            setLabel={setLabel}
            singularLabel={singularLabel}
            entry={entry}
          />
        ) : null}
      </PageLoadState>
    </PageShell>
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
