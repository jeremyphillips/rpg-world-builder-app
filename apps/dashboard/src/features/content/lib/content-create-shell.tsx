import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Heading } from '@rpg/ui'

import { createContent } from './content-client'
import { ContentAuthoringGate } from './content-authoring-gate'
import {
  ContentFormComingSoon,
  ContentFormOptionsGate,
  ContentFormLayout,
} from './content-form-shell-parts'
import { contentFormRegistry, type AnyContentFormDef } from './content-form-registry'

export interface ContentCreateShellProps {
  /** Route key identifying the content type (e.g. `'species'`). */
  contentType: string
  campaignId: string
  /** Page heading (e.g. `"New Species"`). */
  heading: string
  /** Href for the "Cancel" link and post-submit navigation (typically the overview). */
  backHref: string
}

interface ContentCreateFormProps {
  def: AnyContentFormDef
  campaignId: string
  backHref: string
}

function ContentCreateForm({ def, campaignId, backHref }: ContentCreateFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: unknown) => createContent(campaignId, def.routeKey, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: def.queryKey(campaignId) })
    },
  })

  return (
    <ContentFormOptionsGate campaignId={campaignId}>
      {(optionsCtx) => {
        const ctx = { ...optionsCtx, campaignId, mode: 'create' as const }
        return (
          <ContentFormLayout
            def={def}
            ctx={ctx}
            schema={def.schema}
            defaultValues={def.createDefaultValues}
            backHref={backHref}
            submitLabel="Create"
            submitPending={mutation.isPending}
            formError={mutation.isError ? String(mutation.error) : null}
            onSubmit={async (values) => {
              await mutation.mutateAsync(
                def.toInput(values, { weaponCategoryBySlug: ctx.options?.weaponCategoryBySlug }),
              )
              navigate(backHref)
            }}
          />
        )
      }}
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
}: ContentCreateShellProps) {
  const def = contentFormRegistry[contentType]

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Heading variant="page" as="h2">
          {heading}
        </Heading>
      </div>

      {def ? (
        <ContentAuthoringGate campaignId={campaignId}>
          <ContentCreateForm def={def} campaignId={campaignId} backHref={backHref} />
        </ContentAuthoringGate>
      ) : (
        <ContentFormComingSoon />
      )}
    </div>
  )
}

export {
  ContentFormShellResolver,
  type ContentFormShellResolverProps,
} from './content-form-shell-parts'
