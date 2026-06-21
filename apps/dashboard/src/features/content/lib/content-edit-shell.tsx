import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Heading, Spinner, Text } from '@rpg/ui'

import { updateContent } from './content-client'
import type { ContentFormCtx } from './content-form-registry'
import {
  ContentFormNotRegistered,
  ContentFormOptionsGate,
  ContentSchemaForm,
} from './content-form-shell-parts'
import { contentFormRegistry, type AnyContentFormDef } from './content-form-registry'

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
}

interface ContentEditFormProps {
  def: AnyContentFormDef
  campaignId: string
  entityId: string
  notFoundLabel?: string
  heading?: (name: string) => string
  backHref: string
}

interface ContentEditFormReadyProps extends ContentEditFormProps {
  ctx: ContentFormCtx
}

function ContentEditFormReady({
  def,
  campaignId,
  entityId,
  notFoundLabel = 'Item not found.',
  heading: headingFn = (name) => `Edit ${name}`,
  backHref,
  ctx,
}: ContentEditFormReadyProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const entity = def.useListQuery(campaignId).data?.find((e: { id: string }) => e.id === entityId)
  const fields = def.buildFields(ctx)

  const mutation = useMutation({
    mutationFn: (input: unknown) => updateContent(campaignId, def.routeKey, entityId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: def.queryKey(campaignId) })
    },
  })

  if (!entity) {
    return (
      <Text variant="destructive" role="alert">
        {notFoundLabel}
      </Text>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <Heading variant="page" as="h2">
        {headingFn(entity.name)}
      </Heading>

      <ContentSchemaForm
        formKey={entity.id}
        schema={def.schema}
        fields={fields}
        defaultValues={def.toFormValues(entity)}
        backHref={backHref}
        submitLabel="Save changes"
        submitPending={mutation.isPending}
        formError={mutation.isError ? String(mutation.error) : null}
        onSubmit={async (values) => {
          await mutation.mutateAsync(
            def.toInput(values, {
              entity,
              weaponCategoryBySlug: ctx.options?.weaponCategoryBySlug,
            }),
          )
          navigate(backHref)
        }}
      />
    </div>
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
    />
  )
}
