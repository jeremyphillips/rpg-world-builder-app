import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { Heading, Spinner, Text } from '@rpg/ui'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'

import { NarrowPage } from '@/components/layout/narrow-page'
import { updateContent } from './content-client'
import { skillProficienciesQueryKey } from '../skillProficiencies/hooks/use-skill-proficiencies'
import { stripEditEnvelopeFromFormDefaults } from './content-form-key-helpers'
import {
  contentFormRegistry,
  type AnyContentFormDef,
  type ContentFormCtx,
} from './content-form-registry'
import { mergeEditLayoutCtx } from './content-edit-form-ctx'
import {
  ContentFormNotRegistered,
  ContentFormOptionsGate,
  ContentFormLayout,
} from './content-form-shell-parts'
import { ContentAuthoringGate } from './content-authoring-gate'

function resolveContentFormSchema(def: AnyContentFormDef, ctx: ContentFormCtx) {
  return def.resolveSchema?.(ctx) ?? def.schema
}

function invalidateContentQueries(
  queryClient: QueryClient,
  def: AnyContentFormDef,
  campaignId: string,
) {
  void queryClient.invalidateQueries({ queryKey: def.queryKey(campaignId) })
  if (def.routeKey === 'classes') {
    void queryClient.invalidateQueries({ queryKey: skillProficienciesQueryKey(campaignId) })
  }
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
  /** Href for "Cancel" and post-submit navigation (typically the detail page). */
  backHref: string
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
  formCtx?: Partial<ContentFormCtx>
}

interface ContentEditFormReadyProps extends ContentEditFormProps {
  ctx: ContentFormCtx
}

interface ContentEditEntityFormProps<TEntity extends { id: string; name: string }> {
  def: AnyContentFormDef
  entity: TEntity
  campaignId: string
  backHref: string
  headingFn: (name: string) => string
  layoutCtx: ContentFormCtx
  schema: ZodType<FieldValues>
  defaultValues: DefaultValues<FieldValues>
  submitPending: boolean
  formError: string | null
  onSubmit: (values: FieldValues, form: UseFormReturn<FieldValues>) => Promise<void>
}

function ContentEditEntityForm<TEntity extends { id: string; name: string }>({
  entity,
  campaignId,
  backHref,
  headingFn,
  def,
  layoutCtx,
  schema,
  defaultValues,
  submitPending,
  formError,
  onSubmit,
}: ContentEditEntityFormProps<TEntity>) {
  return (
    <ContentAuthoringGate campaignId={campaignId}>
      <NarrowPage spacing="relaxed" className="pb-10">
        <Heading variant="page" as="h2">
          {headingFn(entity.name)}
        </Heading>

        <ContentFormLayout
          def={def}
          ctx={layoutCtx}
          formKey={entity.id}
          schema={schema}
          defaultValues={defaultValues}
          backHref={backHref}
          submitLabel="Save changes"
          submitPending={submitPending}
          formError={formError}
          onSubmit={onSubmit}
        />
      </NarrowPage>
    </ContentAuthoringGate>
  )
}

function ContentEditFormReady({
  def,
  campaignId,
  entityId,
  notFoundLabel = 'Item not found.',
  heading: headingFn = (name) => `Edit ${name}`,
  backHref,
  formCtx,
  ctx,
}: ContentEditFormReadyProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const entity = def.useListQuery(campaignId).data?.find((e: { id: string }) => e.id === entityId)

  const mutation = useMutation({
    mutationFn: (input: unknown) => updateContent(campaignId, def.routeKey, entityId, input),
    onSuccess: () => invalidateContentQueries(queryClient, def, campaignId),
  })

  if (!entity) {
    return (
      <Text variant="destructive" role="alert">
        {notFoundLabel}
      </Text>
    )
  }

  const layoutCtx = mergeEditLayoutCtx(ctx, formCtx, campaignId, entityId, entity)

  return (
    <ContentEditEntityForm
      def={def}
      entity={entity}
      campaignId={campaignId}
      backHref={backHref}
      headingFn={headingFn}
      layoutCtx={{
        ...layoutCtx,
        embeddedSeedRowIds: def.extractEmbeddedSeedRowIds?.(entity),
      }}
      schema={resolveContentFormSchema(def, layoutCtx)}
      defaultValues={stripEditEnvelopeFromFormDefaults(def.toFormValues(entity), {
        stripKind: layoutCtx.equipmentKind != null,
      })}
      submitPending={mutation.isPending}
      formError={mutation.isError ? String(mutation.error) : null}
      onSubmit={async (values, form) => {
        await mutation.mutateAsync(
          def.toInput(values, {
            entity,
            weaponCategoryBySlug: ctx.options?.weaponCategoryBySlug,
            campaignRules: layoutCtx.campaignRules,
            equipmentKind: layoutCtx.equipmentKind,
          }),
        )
        form.reset(values)
        navigate(backHref)
      }}
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
      formCtx={formCtx}
    />
  )
}
