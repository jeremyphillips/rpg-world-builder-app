import { useNavigate } from 'react-router-dom'
import type {
  ContentCampaignAccessPatch,
  ContentTypeKey,
  ContentValidationIntent,
} from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'
import { useRef, useState, type ReactNode } from 'react'

import { NarrowPage } from '@/components/layout/page/narrow-page'
import type { UnsavedChangesConfirmController } from '@/lib/form-unsaved-changes-guard'
import { notifyContentCreated } from '@/lib/notify'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { formatContentCreateActionLabel } from '../../content-type-labels'
import { useContentWriteMutation } from '../../list/use-content-mutations'
import { ContentAuthoringGate } from './content-authoring-gate'
import {
  ContentFormComingSoon,
  ContentFormOptionsGate,
  ContentFormLayout,
} from './content-form-shell-layout'
import {
  contentFormRegistry,
  type AnyContentFormDef,
  type ContentFormCtx,
} from '../content-form-registry'
import { resolveContentPostCreateEditHref } from './content-form-navigation'

import { resolveContentFormSchema } from './content-edit-load'
import { intentToStatus } from './content-create-intent'
import { createWithDeferredCampaignAccess } from '../../campaign-access/create-with-deferred-campaign-access'
import { CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR } from '../../campaign-access/campaign-access-labels'
import { useContentFormSubmit } from './content-form-submit'
import { resolveContentFormNavigationFields } from './content-form-host-projection'

export interface ContentCreateShellProps {
  /** Route key identifying the content type (e.g. `'species'`). */
  contentType: string
  campaignId: string
  /** Page heading (e.g. `"New Species"`). */
  heading: string
  /** Href for the "Cancel" link (typically the overview). */
  backHref: string
  /** Merged on top of the form def's `createDefaultValues` (e.g. preset `kind`). */
  initialValues?: Record<string, unknown>
  /** Merged into the form layout context (e.g. family-scoped equipment kind). */
  formCtx?: Partial<ContentFormCtx>
  /** Applied to form values immediately before serialization on create submit. */
  prepareSubmitValues?: (values: Record<string, unknown>) => Record<string, unknown>
  /** Rendered inside the form header before campaign-access chrome (e.g. fixed-field registration). */
  formHeaderPrefix?: ReactNode
}

interface ContentCreateFormBodyProps {
  def: AnyContentFormDef
  contentTypeKey: ContentTypeKey
  campaignId: string
  backHref: string
  ctx: ContentFormCtx
  initialValues?: Record<string, unknown>
  formCtx?: Partial<ContentFormCtx>
  prepareSubmitValues?: (values: Record<string, unknown>) => Record<string, unknown>
  formHeaderPrefix?: ReactNode
}

function ContentCreateFormBody({
  def,
  contentTypeKey,
  campaignId,
  backHref,
  ctx,
  initialValues,
  formCtx,
  prepareSubmitValues,
  formHeaderPrefix,
}: ContentCreateFormBodyProps) {
  const navigate = useNavigate()
  const mutation = useContentWriteMutation(def, campaignId)
  const [saveDraftPending, setSaveDraftPending] = useState(false)
  const [campaignAccessDeferredError, setCampaignAccessDeferredError] = useState<string | null>(
    null,
  )
  const campaignAccessDraftRef = useRef<ContentCampaignAccessPatch | null>(null)
  const leaveGuardRef = useRef<Pick<UnsavedChangesConfirmController, 'runTrusted'> | null>(null)
  const formKey = `content-create-${def.routeKey}-${campaignId}`

  const prepareCommitValues = prepareSubmitValues as
    | ((values: Record<string, unknown>) => Record<string, unknown>)
    | undefined

  const createEntity = async (
    values: Record<string, unknown>,
    status: 'draft' | 'published',
    validationIntent: ContentValidationIntent,
  ) => {
    const preparedValues = prepareSubmitValues?.(values) ?? values
    const { entity: created, deferredAccessFailed } = await createWithDeferredCampaignAccess({
      campaignId,
      routeKey: def.routeKey,
      createInput: {
        ...def.toInput(
          preparedValues,
          {
            weaponCategoryBySlug: ctx.options?.weaponCategoryBySlug,
            campaignRules: ctx.campaignRules,
            equipmentKind: ctx.equipmentKind,
          },
          validationIntent,
        ),
        status,
      },
      mutateAsync: (input) => mutation.mutateAsync(input) as Promise<{ id: string }>,
      pendingAccess: campaignAccessDraftRef.current,
    })

    if (deferredAccessFailed) {
      setCampaignAccessDeferredError(CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR)
    }

    const editHref = resolveContentPostCreateEditHref(def, campaignId, created, formCtx)
    leaveGuardRef.current?.runTrusted(() => navigate(editHref))
    if (!deferredAccessFailed) {
      notifyContentCreated(contentTypeKey)
    }
  }

  const invalidPresentation = {
    resolverFields: resolveContentFormNavigationFields(def, ctx),
    formId: formKey,
  }

  const {
    onSubmit: onPublish,
    formError: publishFormError,
    UiBridge,
  } = useContentFormSubmit<Record<string, unknown>>({
    def,
    ctx,
    fallbackMessage: `Could not create ${def.routeKey}.`,
    prepareCommitValues,
    invalidPresentation,
    persist: async (values) => {
      await createEntity(values, intentToStatus('publish'), 'publish')
    },
  })

  const { onSubmit: onSaveDraft, formError: saveDraftFormError } = useSubmitHandler(
    async (values) => {
      setSaveDraftPending(true)
      try {
        await createEntity(values, intentToStatus('save_draft'), 'draft')
      } finally {
        setSaveDraftPending(false)
      }
    },
    `Could not save ${def.routeKey} draft.`,
  )

  return (
    <>
      {campaignAccessDeferredError ? (
        <Text variant="warning" role="status" className="mb-4">
          {campaignAccessDeferredError}
        </Text>
      ) : null}
      <ContentFormLayout
        def={def}
        ctx={ctx}
        schema={resolveContentFormSchema(def, ctx, 'draft')}
        defaultValues={{ ...def.createDefaultValues, ...initialValues }}
        formKey={formKey}
        formMode="create"
        contentTypeKey={contentTypeKey}
        campaignId={campaignId}
        onCampaignAccessDraftChange={(patch) => {
          campaignAccessDraftRef.current = patch
        }}
        backHref={backHref}
        submitLabel={formatContentCreateActionLabel(contentTypeKey)}
        submitPending={mutation.isPending}
        formError={publishFormError ?? saveDraftFormError ?? null}
        onSubmit={onPublish}
        onSaveDraft={onSaveDraft}
        saveDraftPending={saveDraftPending}
        onLeaveGuardReady={(guard) => {
          leaveGuardRef.current = guard
        }}
        formHeaderPrefix={
          <>
            <UiBridge />
            {formHeaderPrefix}
          </>
        }
      />
    </>
  )
}

interface ContentCreateFormProps {
  def: AnyContentFormDef
  contentTypeKey: ContentTypeKey
  campaignId: string
  backHref: string
  initialValues?: Record<string, unknown>
  formCtx?: Partial<ContentFormCtx>
  prepareSubmitValues?: (values: Record<string, unknown>) => Record<string, unknown>
  formHeaderPrefix?: ReactNode
}

function ContentCreateForm({
  def,
  contentTypeKey,
  campaignId,
  backHref,
  initialValues,
  formCtx,
  prepareSubmitValues,
  formHeaderPrefix,
}: ContentCreateFormProps) {
  return (
    <ContentFormOptionsGate campaignId={campaignId}>
      {(optionsCtx) => (
        <ContentCreateFormBody
          def={def}
          contentTypeKey={contentTypeKey}
          campaignId={campaignId}
          backHref={backHref}
          ctx={{
            ...optionsCtx,
            ...formCtx,
            campaignId,
            mode: 'create',
            entitySource: 'homebrew',
          }}
          initialValues={initialValues}
          formCtx={formCtx}
          prepareSubmitValues={prepareSubmitValues}
          formHeaderPrefix={formHeaderPrefix}
        />
      )}
    </ContentFormOptionsGate>
  )
}

/**
 * Generic shell for creating a new content item. Looks up the `ContentFormDef`
 * for `contentType` in the registry, renders the schema-driven `<Form>`, and
 * calls the content API on submit.
 *
 * If no form is registered for the type yet, it renders a "coming soon" notice
 * so the route is still navigable.
 */
export function ContentCreateShell({
  contentType,
  campaignId,
  heading,
  backHref,
  initialValues,
  formCtx,
  prepareSubmitValues,
  formHeaderPrefix,
}: ContentCreateShellProps) {
  const def = contentFormRegistry[contentType]

  return (
    <NarrowPage spacing="relaxed" className="pb-10">
      <Heading variant="page" as="h1">
        {heading}
      </Heading>

      {def ? (
        <ContentAuthoringGate campaignId={campaignId}>
          <ContentCreateForm
            def={def}
            contentTypeKey={contentType as ContentTypeKey}
            campaignId={campaignId}
            backHref={backHref}
            initialValues={initialValues}
            formCtx={formCtx}
            prepareSubmitValues={prepareSubmitValues}
            formHeaderPrefix={formHeaderPrefix}
          />
        </ContentAuthoringGate>
      ) : (
        <ContentFormComingSoon />
      )}
    </NarrowPage>
  )
}

export {
  ContentFormShellResolver,
  type ContentFormShellResolverProps,
} from './content-form-shell-resolver'
