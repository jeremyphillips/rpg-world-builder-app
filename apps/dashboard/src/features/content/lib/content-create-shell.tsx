import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Heading, Spinner, Text } from '@rpg/ui'
import { Form, FormSaveFooter } from '@rpg/ui/form'

import { createContent } from './content-client'
import { contentFormRegistry } from './content-form-registry'

export interface ContentCreateShellProps {
  /** Route key identifying the content type (e.g. `'species'`). */
  contentType: string
  campaignId: string
  /** Page heading (e.g. `"New Species"`). */
  heading: string
  /** Href for the "Cancel" link and post-submit navigation (typically the overview). */
  backHref: string
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
}: ContentCreateShellProps) {
  const def = contentFormRegistry[contentType]
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: unknown) => createContent(campaignId, def!.routeKey, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: def!.queryKey(campaignId) })
    },
  })

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Heading variant="page" as="h2">
          {heading}
        </Heading>
      </div>

      {def ? (
        <div className="max-w-2xl">
          <Form
            schema={def.schema}
            fields={def.buildFields({})}
            defaultValues={def.createDefaultValues}
            onSubmit={async (values) => {
              await mutation.mutateAsync(def.toInput(values))
              navigate(backHref)
            }}
            formError={mutation.isError ? String(mutation.error) : null}
            footer={(form) => (
              <div className="flex items-center gap-3 pt-4">
                <FormSaveFooter
                  pending={mutation.isPending || form.formState.isSubmitting}
                  submitLabel="Create"
                />
                <Link to={backHref} className="text-sm text-muted-foreground hover:underline">
                  Cancel
                </Link>
              </div>
            )}
          />
        </div>
      ) : (
        <ContentFormComingSoon />
      )}
    </div>
  )
}

function ContentFormComingSoon() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <Text variant="muted">Form coming soon.</Text>
    </div>
  )
}

/**
 * Handles the loading/error/ready pattern for the create shell's parent data
 * (e.g. campaign context). Renders a `<Spinner>` while pending and a
 * destructive alert on error.
 */
export interface ContentFormShellResolverProps {
  isPending: boolean
  isError: boolean
  errorLabel?: string
  children: React.ReactNode
}

export function ContentFormShellResolver({
  isPending,
  isError,
  errorLabel,
  children,
}: ContentFormShellResolverProps) {
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
        {errorLabel ?? 'Could not load page data.'}
      </Text>
    )
  }
  return children
}
