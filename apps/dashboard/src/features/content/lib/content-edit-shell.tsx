import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Heading, Spinner, Text } from '@rpg/ui'
import { Form, FormSaveFooter } from '@rpg/ui/form'

import { updateContent } from './content-client'
import { contentFormRegistry } from './content-form-registry'
import type { AnyContentFormDef } from './content-form-registry'

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

/**
 * Inner form component. Rendered only when `def` is guaranteed to exist,
 * keeping all hook calls unconditional and the complexity low.
 */
function ContentEditForm({
  def,
  campaignId,
  entityId,
  notFoundLabel = 'Item not found.',
  heading: headingFn = (name) => `Edit ${name}`,
  backHref,
}: ContentEditFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const entity = def.useListQuery(campaignId).data?.find((e: { id: string }) => e.id === entityId)

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

      <div className="max-w-2xl">
        <Form
          key={entity.id}
          schema={def.schema}
          fields={def.buildFields({})}
          defaultValues={def.toFormValues(entity)}
          onSubmit={async (values) => {
            await mutation.mutateAsync(def.toInput(values))
            navigate(backHref)
          }}
          formError={mutation.isError ? String(mutation.error) : null}
          footer={(form) => (
            <div className="flex items-center gap-3 pt-4">
              <FormSaveFooter
                pending={mutation.isPending || form.formState.isSubmitting}
                submitLabel="Save changes"
              />
              <Link to={backHref} className="text-sm text-muted-foreground hover:underline">
                Cancel
              </Link>
            </div>
          )}
        />
      </div>
    </div>
  )
}

/**
 * Generic shell for editing an existing content item. Resolves the entity from
 * the cached list query via `ContentDetailResolver`-style logic, seeds the
 * `<Form>` with `toFormValues(entity)`, and submits via the stubbed update API.
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
    return (
      <div className="space-y-4">
        <Heading variant="page" as="h2">
          Edit
        </Heading>
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Text variant="muted">Form coming soon.</Text>
        </div>
      </div>
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
    />
  )
}
