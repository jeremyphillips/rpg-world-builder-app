import { useNavigate } from 'react-router-dom'
import { Heading } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { allowFormNavigationOnce } from '@/lib/form-unsaved-changes-guard'
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

import { resolveContentFormSchema } from './content-edit-load'

export interface ContentCreateShellProps {
  /** Route key identifying the content type (e.g. `'species'`). */
  contentType: string
  campaignId: string
  /** Page heading (e.g. `"New Species"`). */
  heading: string
  /** Href for the "Cancel" link and post-submit navigation (typically the overview). */
  backHref: string
  /** Merged on top of the form def's `createDefaultValues` (e.g. preset `kind`). */
  initialValues?: Record<string, unknown>
  /** Merged into the form layout context (e.g. family-scoped equipment kind). */
  formCtx?: Partial<ContentFormCtx>
}

interface ContentCreateFormProps {
  def: AnyContentFormDef
  campaignId: string
  backHref: string
  initialValues?: Record<string, unknown>
  formCtx?: Partial<ContentFormCtx>
}

function ContentCreateForm({
  def,
  campaignId,
  backHref,
  initialValues,
  formCtx,
}: ContentCreateFormProps) {
  const navigate = useNavigate()
  const mutation = useContentWriteMutation(def, campaignId)

  return (
    <ContentFormOptionsGate campaignId={campaignId}>
      {(optionsCtx) => {
        const ctx = {
          ...optionsCtx,
          ...formCtx,
          campaignId,
          mode: 'create' as const,
          entitySource: 'homebrew' as const,
        }
        return (
          <ContentFormLayout
            def={def}
            ctx={ctx}
            schema={resolveContentFormSchema(def, ctx)}
            defaultValues={{ ...def.createDefaultValues, ...initialValues }}
            backHref={backHref}
            submitLabel="Create"
            submitPending={mutation.isPending}
            formError={mutation.isError ? String(mutation.error) : null}
            onSubmit={async (values, form) => {
              await mutation.mutateAsync(
                def.toInput(values, {
                  weaponCategoryBySlug: ctx.options?.weaponCategoryBySlug,
                  campaignRules: ctx.campaignRules,
                  equipmentKind: ctx.equipmentKind,
                }),
              )
              form.reset(values)
              allowFormNavigationOnce()
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
  initialValues,
  formCtx,
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
            campaignId={campaignId}
            backHref={backHref}
            initialValues={initialValues}
            formCtx={formCtx}
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
