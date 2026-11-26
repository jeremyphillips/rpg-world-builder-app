import type {
  CatalogLayer,
  ContentStatus,
  ContentTypeKey,
  OverlayReadDiagnostics,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { emptyContentMediaSchema, type ContentMedia } from '@rpg/contracts'
import { Alert, Heading, Spinner, Text } from '@rpg/ui'
import { useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useMemo, useState } from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'

import { ContentFormPageShell } from '../layout/content-form-page-shell'
import { resolveContentFormLayout } from '../layout/content-form-layout.lib'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { SubclassUnsavedEditsProvider } from '@/features/content/classes/hooks/subclass-unsaved-edits-context'
import { stripEditEnvelopeFromFormDefaults } from '../../registry/content-form-key-helpers'
import { serializeContentFormInput } from '../../registry/content-form-serialize-input.lib'
import { resolveCatalogSeedBody } from '../../registry/resolve-catalog-seed-body.lib'
import { findContentOverlayListFailure } from '../../../list/create-content-list'
import { useContentWriteMutation } from '../../../list/use-content-mutations'
import { type AnyContentFormDef, type ContentFormCtx } from '../../registry/content-form-registry'
import {
  findContentEditEntity,
  loadContentEditFormState,
  replaceCachedContentListEntity,
} from './content-edit-load'
import {
  ArmorClassAuthoringNotice,
  ArmorClassAuthoringProvider,
} from '../session/armor-class-authoring-session'
import {
  armorClassAuthoringIsStale,
  armorClassRulesSignature,
  useArmorClassAuthoringSession,
} from '../session/armor-class-authoring-session.lib'
import { useContentEditEntityFormState } from './content-edit-entity-form-state'
import { ContentFormOptionsGate, ContentFormLayout } from '../layout/content-form-shell-layout'
import { ContentAuthoringGate } from '../layout/content-authoring-gate'
import { ContentEditLifecycleActions } from './content-edit-lifecycle-actions'
import { ContentEditPublishProvider } from './content-edit-publish-context'
import { ContentEditHeadingBadges } from '../../../campaign-access/content-edit-heading-badges'
import { ContentEditEntityFormDialogs } from './content-edit-entity-form-dialogs'
import {
  CONTENT_MEDIA_STALE_FORM_MESSAGE,
  extractStaleMediaFromError,
} from './content-edit-stale-media.lib'
import { draftPublishValidationSurface } from '../../validation/content-draft-publish-validation-surface.ref'

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
  source: CatalogLayer
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
          catalogLayer={source}
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
  def: AnyContentFormDef
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
    catalogLayer: CatalogLayer
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
  formKey?: string
  formHeaderNotice?: ReactNode
}

function ContentEditEntityForm<
  TEntity extends {
    id: string
    name: string
    catalogLayer: CatalogLayer
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
    catalogLayer: CatalogLayer
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
  formKey,
  formHeaderNotice,
}: ContentEditEntityFormProps<TEntity>) {
  useSetBreadcrumbLabel(entity.name)
  const layout = resolveContentFormLayout(def)
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
      source={entity.catalogLayer}
      status={entity.status}
      campaignAccess={campaignAccess}
      omitDraft={layout.previewEnabled}
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
      formKey={formKey ?? entity.id}
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
      scrollMode={layout.scrollMode}
      previewEnabled={layout.previewEnabled}
      previewDraftBadge={layout.previewEnabled && entity.status === 'draft'}
      formHeaderPrefix={
        <>
          {layout.previewEnabled ? heading : null}
          {formHeaderNotice}
        </>
      }
    />
  )

  const formBody = (
    <ContentAuthoringGate campaignId={campaignId}>
      <ContentFormPageShell scrollMode={layout.scrollMode} pageWidth={layout.pageWidth}>
        {layout.previewEnabled ? (
          formLayout
        ) : (
          <>
            {heading}
            {formLayout}
          </>
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
  const listResult = def.useListQueryResult(campaignId)
  const entity = findContentEditEntity(listResult.data?.items, entityId)
  const overlayFailure = findContentOverlayListFailure(listResult.data?.overlayFailures, entityId)

  if (!entity) {
    if (overlayFailure) {
      return (
        <Alert variant="destructive" role="alert">
          {overlayFailure.message}
        </Alert>
      )
    }
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
    catalogLayer: CatalogLayer
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

function overlayReadDiagnosticsAlertMessage(
  diagnostics: OverlayReadDiagnostics | undefined,
): string | null {
  if (!diagnostics) return null
  const parts: string[] = []
  if (diagnostics.identityConflicts.length > 0) {
    parts.push('This record has overlay identity conflicts. Review before publishing changes.')
  }
  if (diagnostics.orphanedSeedOverrides.length > 0) {
    parts.push('Some stored seed overrides no longer match the current catalog seed.')
  }
  return parts.length > 0 ? parts.join(' ') : null
}

function useFrozenSystemOriginRowIds(entity: {
  id: string
  catalogLayer: CatalogLayer
  seedRowIdsByPath?: Readonly<Record<string, readonly string[]>>
}): ContentFormCtx['embeddedSystemOriginRowIds'] {
  const resolveSeedLocks = () => entity.seedRowIdsByPath

  const [systemOrigin, setSystemOrigin] = useState<{
    entityId: string
    ids: ContentFormCtx['embeddedSystemOriginRowIds']
  } | null>(() =>
    entity.catalogLayer === 'system' ? { entityId: entity.id, ids: resolveSeedLocks() } : null,
  )
  if (entity.catalogLayer === 'system' && systemOrigin?.entityId !== entity.id) {
    setSystemOrigin({
      entityId: entity.id,
      ids: resolveSeedLocks(),
    })
  } else if (entity.catalogLayer !== 'system' && systemOrigin) {
    setSystemOrigin(null)
  }
  return systemOrigin?.entityId === entity.id ? systemOrigin.ids : undefined
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
  const queryClient = useQueryClient()
  const mutation = useContentWriteMutation(def, campaignId, entityId)
  const authoring = useArmorClassAuthoringSession(
    Boolean(def.armorClassRulesSensitive),
    ctx.armorClassRules,
  )

  const loaded = loadContentEditFormState({
    def,
    entity,
    optionsCtx: ctx,
    formCtx,
    campaignId,
    entityId,
    armorClassRules: authoring.snapshot,
  })
  const systemOriginRowIds = useFrozenSystemOriginRowIds(entity)
  const layoutCtx = {
    ...loaded.layoutCtx,
    embeddedSystemOriginRowIds: systemOriginRowIds,
  }
  const catalogSeed = useMemo(
    () =>
      entity.catalogLayer === 'system' && layoutCtx.rulesetId
        ? resolveCatalogSeedBody(def.routeKey, layoutCtx.rulesetId, entityId)
        : undefined,
    [def.routeKey, entity.catalogLayer, entityId, layoutCtx.rulesetId],
  )
  const [overlayBaseline, setOverlayBaseline] = useState<Record<string, unknown> | null>(() => {
    if (entity.catalogLayer !== 'system' || !def.normalizeOverlayBody) return null
    return def.normalizeOverlayBody(
      loaded.defaultValues as never,
      { entity, armorClassRules: layoutCtx.armorClassRules },
      loaded.validationIntent,
    )
  })
  const { schema, validationIntent, defaultValues } = loaded
  const { onSubmit, formError } = useSubmitHandler({
    // fallow-ignore-next-line complexity — edit submit merges overlay intent, media, and cache sync
    submit: async (values, form) => {
      if (
        armorClassAuthoringIsStale({
          sensitive: authoring.sensitive,
          isDirty: form.formState.isDirty,
          snapshot: authoring.snapshot,
          live: authoring.live,
        })
      ) {
        return
      }

      if (validationIntent === 'draft') {
        draftPublishValidationSurface.current?.(values as FieldValues)
      }

      let saved: unknown
      try {
        saved = await mutation.mutateAsync(
          serializeContentFormInput(
            def,
            values,
            {
              entity,
              weaponCategoryBySlug: ctx.options?.weaponCategoryBySlug,
              campaignRules: layoutCtx.campaignRules,
              equipmentKind: layoutCtx.equipmentKind,
              armorClassRules: layoutCtx.armorClassRules,
            },
            validationIntent,
            {
              operation: 'update',
              dirtyFields: form.formState.dirtyFields as Record<string, unknown>,
              rulesetId: layoutCtx.rulesetId,
              overlayBaseline: overlayBaseline ?? undefined,
              catalogSeed,
              expectedOverlayRevision:
                (entity as { overlayRevision?: number }).overlayRevision ?? 0,
              entityId,
              seedRowIdsByPath: (entity as { seedRowIdsByPath?: Record<string, readonly string[]> })
                .seedRowIdsByPath,
            },
          ),
        )
      } catch (error) {
        const serverMedia = extractStaleMediaFromError(error)
        if (serverMedia === undefined) throw error

        form.resetField('media', { defaultValue: serverMedia })
        throw new Error(CONTENT_MEDIA_STALE_FORM_MESSAGE, { cause: error })
      }
      const savedRecord = saved as typeof entity & { media?: ContentMedia }
      queryClient.setQueryData(def.queryKey(campaignId), (current: unknown) =>
        replaceCachedContentListEntity(current, savedRecord),
      )
      const baseline = stripEditEnvelopeFromFormDefaults(
        {
          ...def.toFormValues(saved, { armorClassRules: layoutCtx.armorClassRules }),
          media: savedRecord.media ?? emptyContentMediaSchema,
        },
        {
          stripKind: layoutCtx.equipmentKind != null,
        },
      )
      form.reset(baseline)
      if (entity.catalogLayer === 'system' && def.normalizeOverlayBody) {
        setOverlayBaseline(
          def.normalizeOverlayBody(
            baseline as never,
            { entity: savedRecord, armorClassRules: layoutCtx.armorClassRules },
            validationIntent,
          ),
        )
      }
      if (validationIntent === 'draft') {
        draftPublishValidationSurface.current?.(baseline as FieldValues)
      }
    },
    fallbackMessage: `Could not update ${def.routeKey}.`,
  })

  const formDefaults = authoring.keptValues ?? {
    ...defaultValues,
    media: entity.media ?? emptyContentMediaSchema,
  }
  const overlayDiagnosticsMessage = overlayReadDiagnosticsAlertMessage(
    (entity as { overlayReadDiagnostics?: OverlayReadDiagnostics }).overlayReadDiagnostics,
  )

  return (
    <ArmorClassAuthoringProvider value={authoring}>
      <ContentEditEntityForm
        def={def}
        entity={entity}
        campaignId={campaignId}
        overviewHref={overviewHref}
        contentTypeKey={contentTypeKey}
        headingFn={headingFn}
        layoutCtx={layoutCtx}
        schema={schema}
        formKey={`${entity.id}:${armorClassRulesSignature(authoring.snapshot)}:${authoring.generation}`}
        formHeaderNotice={
          <>
            <ArmorClassAuthoringNotice />
            {overlayDiagnosticsMessage ? (
              <Alert variant="warning" role="status">
                {overlayDiagnosticsMessage}
              </Alert>
            ) : null}
          </>
        }
        defaultValues={formDefaults}
        submitPending={mutation.isPending}
        formError={formError ?? null}
        onSubmit={onSubmit}
      />
    </ArmorClassAuthoringProvider>
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
  def,
  campaignId,
  entityId,
  isPending,
  isError,
  loadErrorLabel = 'Could not load item.',
  notFoundLabel,
  heading,
  backHref,
  overviewHref,
  formCtx,
}: ContentEditShellProps) {
  const layout = resolveContentFormLayout(def)

  if (isPending) {
    return (
      <ContentFormPageShell scrollMode={layout.scrollMode} pageWidth={layout.pageWidth}>
        <div className="flex justify-center">
          <Spinner />
        </div>
      </ContentFormPageShell>
    )
  }

  if (isError) {
    return (
      <ContentFormPageShell scrollMode={layout.scrollMode} pageWidth={layout.pageWidth}>
        <Text variant="destructive" role="alert">
          {loadErrorLabel}
        </Text>
      </ContentFormPageShell>
    )
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
      contentTypeKey={def.routeKey}
      formCtx={formCtx}
    />
  )
}
