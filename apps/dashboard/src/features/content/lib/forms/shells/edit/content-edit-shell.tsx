import type {
  ContentSource,
  ContentStatus,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS, getErrorMessage } from '@rpg/contracts'
import { Heading, Spinner, Text } from '@rpg/ui'
import { useCallback, useState } from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'

import { NarrowPage } from '@/components/layout/page/narrow-page'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { notifyCoordinatedContentSaveSuccess } from '@/lib/notify'
import { SubclassUnsavedEditsProvider } from '@/features/content/classes/hooks/subclass-unsaved-edits-context'
import { stripEditEnvelopeFromFormDefaults } from '../../registry/content-form-key-helpers'
import { useContentWriteMutation } from '../../../list/use-content-mutations'
import {
  contentFormRegistry,
  type AnyContentFormDef,
  type ContentFormCtx,
} from '../../registry/content-form-registry'
import { findContentEditEntity, loadContentEditFormState } from './content-edit-load'
import {
  ContentFormNotRegistered,
  ContentFormOptionsGate,
  ContentFormLayout,
} from '../layout/content-form-shell-layout'
import { ContentAuthoringGate } from '../layout/content-authoring-gate'
import { ContentDeletionBlockedDialog } from '../../../delete/content-deletion-blocked-dialog'
import { ContentDeletionConfirmDialog } from '../../../delete/content-deletion-confirm-dialog'
import { useContentDeleteFlow } from '../../../delete/use-content-delete-flow'
import { ContentDemotionBlockedDialog } from '../../../demotion/content-demotion-blocked-dialog'
import { ContentDemotionConfirmDialog } from '../../../demotion/content-demotion-confirm-dialog'
import { useContentDemoteFlow } from '../../../demotion/use-content-demote-flow'
import { useContentPublishFlow } from '../../../demotion/use-content-publish-flow'
import { ContentEditLifecycleActions } from './content-edit-lifecycle-actions'
import { ContentEditPublishProvider } from './content-edit-publish-context'
import { resolveContentFormSchema } from './content-edit-load'
import { ContentEditHeadingBadges } from '../../../campaign-access/content-edit-heading-badges'

export interface ContentEditShellProps {
  /** Route key identifying the content type (e.g. `'species'`). */
  contentType: string
  campaignId: string
  entityId: string
  /** Loading state from the parent list query (used to resolve the entity). */
  isPending: boolean
  isError: boolean
  loadErrorLabel?: string
  notFoundLabel?: string
  /** Page heading factory — receives the entity name once resolved. */
  heading?: (name: string) => string
  /** Href for detail/breadcrumb links (not used for post-save navigation). */
  backHref: string
  /** Href for post-delete navigation (typically the type overview). */
  overviewHref: string
  /** Content type key for delete copy and API routing. */
  contentTypeKey: ContentTypeKey
  /** Merged into the form layout context (e.g. family-scoped equipment kind). */
  formCtx?: Partial<ContentFormCtx>
}

interface ContentEditFormProps {
  def: AnyContentFormDef
  campaignId: string
  entityId: string
  notFoundLabel?: string
  heading?: (name: string) => string
  backHref: string
  overviewHref: string
  contentTypeKey: ContentTypeKey
  formCtx?: Partial<ContentFormCtx>
}

interface ContentEditFormReadyProps extends ContentEditFormProps {
  ctx: ContentFormCtx
}

interface ContentEditEntityFormProps<
  TEntity extends {
    id: string
    name: string
    source: ContentSource
    status: ContentStatus
    campaignAccess?: ResolvedContentCampaignAccess
  },
> {
  def: AnyContentFormDef
  entity: TEntity
  campaignId: string
  overviewHref: string
  contentTypeKey: ContentTypeKey
  headingFn: (name: string) => string
  layoutCtx: ContentFormCtx
  schema: ZodType<FieldValues>
  defaultValues: DefaultValues<FieldValues>
  submitPending: boolean
  formError: string | null
  onSubmit: (values: FieldValues, form: UseFormReturn<FieldValues>) => Promise<void>
}

function ContentEditEntityForm<
  TEntity extends {
    id: string
    name: string
    source: ContentSource
    status: ContentStatus
    campaignAccess?: ResolvedContentCampaignAccess
  },
>(props: ContentEditEntityFormProps<TEntity>) {
  return (
    <ContentEditPublishProvider>
      <ContentEditEntityFormBody {...props} />
    </ContentEditPublishProvider>
  )
}

function ContentEditEntityFormBody<
  TEntity extends {
    id: string
    name: string
    source: ContentSource
    status: ContentStatus
    campaignAccess?: ResolvedContentCampaignAccess
  },
>({
  entity,
  campaignId,
  overviewHref,
  contentTypeKey,
  headingFn,
  def,
  layoutCtx,
  schema,
  defaultValues,
  submitPending,
  formError,
  onSubmit,
}: ContentEditEntityFormProps<TEntity>) {
  useSetBreadcrumbLabel(entity.name)
  const [campaignAccess, setCampaignAccess] = useState(
    () => entity.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  )
  const publishSchema = resolveContentFormSchema(def, layoutCtx, 'publish')
  const deleteFlow = useContentDeleteFlow({
    def,
    campaignId,
    entityId: entity.id,
    entityName: entity.name,
    entitySource: entity.source,
    contentTypeKey,
    overviewHref,
  })
  const publishFlow = useContentPublishFlow({
    def,
    campaignId,
    entityId: entity.id,
    entitySource: entity.source,
    entityStatus: entity.status,
  })
  const demoteFlow = useContentDemoteFlow({
    def,
    campaignId,
    entityId: entity.id,
    entityName: entity.name,
    entitySource: entity.source,
    entityStatus: entity.status,
  })

  const handlePublish = useCallback(async () => {
    try {
      await publishFlow.runPublishMutation()
    } catch (err) {
      publishFlow.setPublishError(getErrorMessage(err, 'Could not publish this item.'))
    }
  }, [publishFlow.runPublishMutation, publishFlow.setPublishError])

  const handleCoordinatedSaveSuccess = useCallback(
    (event: Parameters<typeof notifyCoordinatedContentSaveSuccess>[0]) => {
      notifyCoordinatedContentSaveSuccess(event, entity.name)
    },
    [entity.name],
  )

  const headerError =
    deleteFlow.deleteError ?? publishFlow.publishError ?? demoteFlow.demoteError ?? formError
  const showLifecycleActions = entity.source === 'homebrew'

  const formBody = (
    <ContentAuthoringGate campaignId={campaignId}>
      <NarrowPage spacing="relaxed" className="pb-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Heading variant="page" as="h1">
              {headingFn(entity.name)}
            </Heading>
            <ContentEditHeadingBadges
              contentType={contentTypeKey}
              source={entity.source}
              status={entity.status}
              campaignAccess={campaignAccess}
            />
          </div>
          {showLifecycleActions ? (
            <ContentEditLifecycleActions
              publishFlow={publishFlow}
              demoteFlow={demoteFlow}
              deleteFlow={deleteFlow}
            />
          ) : null}
        </div>

        <ContentFormLayout
          def={def}
          ctx={layoutCtx}
          formKey={entity.id}
          schema={schema}
          defaultValues={defaultValues}
          formMode="edit"
          contentTypeKey={contentTypeKey}
          campaignId={campaignId}
          entityId={entity.id}
          campaignAccess={campaignAccess}
          onCampaignAccessPersisted={setCampaignAccess}
          submitLabel="Save changes"
          submitPending={submitPending}
          formError={headerError}
          onSubmit={onSubmit}
          onSaved={handleCoordinatedSaveSuccess}
          publishSchema={entity.status === 'draft' ? publishSchema : undefined}
          onPublish={entity.status === 'draft' ? handlePublish : undefined}
        />
      </NarrowPage>

      <ContentDeletionConfirmDialog
        open={deleteFlow.confirmOpen}
        onOpenChange={deleteFlow.setConfirmOpen}
        contentTypeKey={contentTypeKey}
        entityName={entity.name}
        onConfirm={() => void deleteFlow.handleConfirmDelete()}
      />

      <ContentDeletionBlockedDialog
        open={deleteFlow.blockedOpen}
        onOpenChange={deleteFlow.setBlockedOpen}
        entityName={entity.name}
        blockers={deleteFlow.blockers}
      />

      <ContentDemotionConfirmDialog
        open={demoteFlow.confirmOpen}
        onOpenChange={demoteFlow.setConfirmOpen}
        entityName={entity.name}
        onConfirm={() => void demoteFlow.handleConfirmDemote()}
      />

      <ContentDemotionBlockedDialog
        open={demoteFlow.blockedOpen}
        onOpenChange={demoteFlow.setBlockedOpen}
        blockers={demoteFlow.blockers}
      />
    </ContentAuthoringGate>
  )

  return contentTypeKey === 'classes' ? (
    <SubclassUnsavedEditsProvider>{formBody}</SubclassUnsavedEditsProvider>
  ) : (
    formBody
  )
}

function ContentEditFormReady({
  def,
  campaignId,
  entityId,
  notFoundLabel = 'Item not found.',
  heading: headingFn = (name) => `Edit ${name}`,
  overviewHref,
  contentTypeKey,
  formCtx,
  ctx,
}: Omit<ContentEditFormReadyProps, 'backHref'>) {
  const entity = findContentEditEntity(def.useListQuery(campaignId).data, entityId)

  if (!entity) {
    return (
      <Text variant="destructive" role="alert">
        {notFoundLabel}
      </Text>
    )
  }

  return (
    <ContentEditFormBody
      def={def}
      entity={entity}
      campaignId={campaignId}
      entityId={entityId}
      headingFn={headingFn}
      overviewHref={overviewHref}
      contentTypeKey={contentTypeKey}
      formCtx={formCtx}
      ctx={ctx}
    />
  )
}

interface ContentEditFormBodyProps {
  def: AnyContentFormDef
  entity: {
    id: string
    name: string
    source: ContentSource
    status: ContentStatus
    campaignAccess?: ResolvedContentCampaignAccess
  }
  campaignId: string
  entityId: string
  headingFn: (name: string) => string
  overviewHref: string
  contentTypeKey: ContentTypeKey
  formCtx?: Partial<ContentFormCtx>
  ctx: ContentFormCtx
}

function ContentEditFormBody({
  def,
  entity,
  campaignId,
  entityId,
  headingFn,
  overviewHref,
  contentTypeKey,
  formCtx,
  ctx,
}: ContentEditFormBodyProps) {
  const mutation = useContentWriteMutation(def, campaignId, entityId)

  const { layoutCtx, schema, validationIntent, defaultValues } = loadContentEditFormState({
    def,
    entity,
    optionsCtx: ctx,
    formCtx,
    campaignId,
    entityId,
  })

  const { onSubmit, formError } = useSubmitHandler({
    submit: async (values, form) => {
      const saved = await mutation.mutateAsync(
        def.toInput(
          values,
          {
            entity,
            weaponCategoryBySlug: ctx.options?.weaponCategoryBySlug,
            campaignRules: layoutCtx.campaignRules,
            equipmentKind: layoutCtx.equipmentKind,
          },
          validationIntent,
        ),
      )
      const baseline = stripEditEnvelopeFromFormDefaults(def.toFormValues(saved), {
        stripKind: layoutCtx.equipmentKind != null,
      })
      form.reset(baseline)
    },
    fallbackMessage: `Could not update ${def.routeKey}.`,
  })

  return (
    <ContentEditEntityForm
      def={def}
      entity={entity}
      campaignId={campaignId}
      overviewHref={overviewHref}
      contentTypeKey={contentTypeKey}
      headingFn={headingFn}
      layoutCtx={layoutCtx}
      schema={schema}
      defaultValues={defaultValues}
      submitPending={mutation.isPending}
      formError={formError ?? null}
      onSubmit={onSubmit}
    />
  )
}

function ContentEditForm(props: ContentEditFormProps) {
  return (
    <ContentFormOptionsGate campaignId={props.campaignId}>
      {(ctx) => <ContentEditFormReady {...props} ctx={ctx} />}
    </ContentFormOptionsGate>
  )
}

/**
 * Generic shell for editing an existing content item. Resolves the entity from
 * the cached list query via `ContentDetailResolver`-style logic, seeds the
 * `<Form>` with `toFormValues(entity)`, and submits via the update API.
 *
 * Rendered entirely within the normal AppShell so breadcrumbs etc. work. The
 * entity is read from the list cache (same as the detail view), avoiding an
 * extra network round-trip.
 */
export function ContentEditShell({
  contentType,
  campaignId,
  entityId,
  isPending,
  isError,
  loadErrorLabel = 'Could not load item.',
  notFoundLabel,
  heading,
  backHref,
  overviewHref,
  contentTypeKey,
  formCtx,
}: ContentEditShellProps) {
  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <Text variant="destructive" role="alert">
        {loadErrorLabel}
      </Text>
    )
  }

  const def = contentFormRegistry[contentType]

  if (!def) {
    return <ContentFormNotRegistered />
  }

  return (
    <ContentEditForm
      def={def}
      campaignId={campaignId}
      entityId={entityId}
      notFoundLabel={notFoundLabel}
      heading={heading}
      backHref={backHref}
      overviewHref={overviewHref}
      contentTypeKey={contentTypeKey}
      formCtx={formCtx}
    />
  )
}
