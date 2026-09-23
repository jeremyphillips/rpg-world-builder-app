import type {
  ContentSource,
  ContentStatus,
  ContentTypeKey,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { emptyContentMediaSchema, type ContentMedia } from '@rpg/contracts'
import { Heading, Spinner, Text } from '@rpg/ui'
import { type ReactNode } from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'

import { hasContentFormPreview } from '../../preview/content-form-preview.types'
import { ContentFormPageShell } from '../layout/content-form-page-shell'
import {
  contentFormPageShellBodyClasses,
  contentFormPageShellHeadingClasses,
} from '../layout/content-form-page-shell.variants'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { SubclassUnsavedEditsProvider } from '@/features/content/classes/hooks/subclass-unsaved-edits-context'
import { stripEditEnvelopeFromFormDefaults } from '../../registry/content-form-key-helpers'
import { useContentWriteMutation } from '../../../list/use-content-mutations'
import {
  contentFormRegistry,
  type AnyContentFormDef,
  type ContentFormCtx,
} from '../../registry/content-form-registry'
import { findContentEditEntity, loadContentEditFormState } from './content-edit-load'
import { useContentEditEntityFormState } from './content-edit-entity-form-state'
import {
  ContentFormNotRegistered,
  ContentFormOptionsGate,
  ContentFormLayout,
} from '../layout/content-form-shell-layout'
import { ContentAuthoringGate } from '../layout/content-authoring-gate'
import { ContentEditLifecycleActions } from './content-edit-lifecycle-actions'
import { ContentEditPublishProvider } from './content-edit-publish-context'
import { ContentEditHeadingBadges } from '../../../campaign-access/content-edit-heading-badges'
import { ContentEditEntityFormDialogs } from './content-edit-entity-form-dialogs'

function ContentEditFormHeading({
  heading,
  contentTypeKey,
  source,
  status,
  campaignAccess,
  omitDraft = false,
  lifecycle,
}: {
  heading: string
  contentTypeKey: ContentTypeKey
  source: ContentSource
  status: ContentStatus
  campaignAccess: ResolvedContentCampaignAccess
  omitDraft?: boolean
  lifecycle: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Heading variant="page" as="h1">
          {heading}
        </Heading>
        <ContentEditHeadingBadges
          contentType={contentTypeKey}
          source={source}
          status={status}
          campaignAccess={campaignAccess}
          omitDraft={omitDraft}
        />
      </div>
      {lifecycle}
    </div>
  )
}

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
    media?: ContentMedia
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
    media?: ContentMedia
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
    media?: ContentMedia
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
  const usePreviewLayout = hasContentFormPreview(def)
  const {
    campaignAccess,
    setCampaignAccess,
    publishSchema,
    deleteFlow,
    publishFlow,
    demoteFlow,
    handlePublish,
    handleCoordinatedSaveSuccess,
    headerError,
    showLifecycleActions,
  } = useContentEditEntityFormState({
    entity,
    campaignId,
    overviewHref,
    contentTypeKey,
    def,
    layoutCtx,
    formError,
  })

  const heading = (
    <ContentEditFormHeading
      heading={headingFn(entity.name)}
      contentTypeKey={contentTypeKey}
      source={entity.source}
      status={entity.status}
      campaignAccess={campaignAccess}
      omitDraft={usePreviewLayout}
      lifecycle={
        showLifecycleActions ? (
          <ContentEditLifecycleActions
            publishFlow={publishFlow}
            demoteFlow={demoteFlow}
            deleteFlow={deleteFlow}
          />
        ) : null
      }
    />
  )

  const formLayout = (
    <ContentFormLayout
      def={def}
      ctx={layoutCtx}
      formKey={entity.id}
      schema={schema}
      defaultValues={{ ...defaultValues, media: entity.media ?? emptyContentMediaSchema }}
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
      previewDraftBadge={usePreviewLayout && entity.status === 'draft'}
      formHeaderPrefix={usePreviewLayout ? heading : undefined}
    />
  )

  const formBody = (
    <ContentAuthoringGate campaignId={campaignId}>
      <ContentFormPageShell usePreviewLayout={usePreviewLayout}>
        {usePreviewLayout ? (
          formLayout
        ) : (
          <div className={contentFormPageShellBodyClasses}>
            <div className={contentFormPageShellHeadingClasses}>{heading}</div>
            {formLayout}
          </div>
        )}
      </ContentFormPageShell>

      <ContentEditEntityFormDialogs
        contentTypeKey={contentTypeKey}
        entityName={entity.name}
        deleteFlow={deleteFlow}
        demoteFlow={demoteFlow}
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
    media?: ContentMedia
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
      const savedRecord = saved as typeof entity & { media?: ContentMedia }
      const baseline = stripEditEnvelopeFromFormDefaults(
        { ...def.toFormValues(saved), media: savedRecord.media ?? emptyContentMediaSchema },
        {
          stripKind: layoutCtx.equipmentKind != null,
        },
      )
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
      defaultValues={{ ...defaultValues, media: entity.media ?? emptyContentMediaSchema }}
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
  const def = contentFormRegistry[contentType]
  const usePreviewLayout = def != null && hasContentFormPreview(def)

  if (isPending) {
    return (
      <ContentFormPageShell usePreviewLayout={usePreviewLayout}>
        <div className="flex justify-center">
          <Spinner />
        </div>
      </ContentFormPageShell>
    )
  }

  if (isError) {
    return (
      <ContentFormPageShell usePreviewLayout={usePreviewLayout}>
        <Text variant="destructive" role="alert">
          {loadErrorLabel}
        </Text>
      </ContentFormPageShell>
    )
  }

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
