import { Link } from 'react-router-dom'
import type { DefaultValues, FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import { Heading, Spinner, Text } from '@rpg/ui'
import { Form, FormSaveFooter, type FormItem } from '@rpg/ui/form'

import { useContentFormOptions } from './content-form-options'
import type { ContentFormCtx } from './content-form-registry'

export const CONTENT_CATALOG_OPTIONS_ERROR = 'Could not load catalog options.'

export function ContentFormComingSoon() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <Text variant="muted">Form coming soon.</Text>
    </div>
  )
}

export function ContentFormNotRegistered({ heading = 'Edit' }: { heading?: string }) {
  return (
    <div className="space-y-4">
      <Heading variant="page" as="h2">
        {heading}
      </Heading>
      <ContentFormComingSoon />
    </div>
  )
}

interface ContentFormCancelFooterProps {
  backHref: string
  submitLabel: string
  pending: boolean
}

export function ContentFormCancelFooter({
  backHref,
  submitLabel,
  pending,
}: ContentFormCancelFooterProps) {
  return (
    <div className="flex items-center gap-3 pt-4">
      <FormSaveFooter pending={pending} submitLabel={submitLabel} />
      <Link to={backHref} className="text-sm text-muted-foreground hover:underline">
        Cancel
      </Link>
    </div>
  )
}

interface ContentSchemaFormProps<TFormValues extends FieldValues> {
  schema: ZodType<TFormValues>
  fields: FormItem[]
  defaultValues?: DefaultValues<TFormValues>
  formKey?: string
  backHref: string
  submitLabel: string
  submitPending: boolean
  formError: string | null
  onSubmit: (values: TFormValues) => Promise<void>
}

export function ContentSchemaForm<TFormValues extends FieldValues>({
  schema,
  fields,
  defaultValues,
  formKey,
  backHref,
  submitLabel,
  submitPending,
  formError,
  onSubmit,
}: ContentSchemaFormProps<TFormValues>) {
  return (
    <div className="max-w-2xl">
      <Form<TFormValues>
        key={formKey}
        schema={schema}
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        formError={formError}
        footer={(form) => (
          <ContentFormCancelFooter
            backHref={backHref}
            submitLabel={submitLabel}
            pending={submitPending || form.formState.isSubmitting}
          />
        )}
      />
    </div>
  )
}

interface ContentFormOptionsGateProps {
  campaignId: string
  children: (ctx: ContentFormCtx) => React.ReactNode
}

export interface ContentFormShellResolverProps {
  isPending: boolean
  isError: boolean
  errorLabel?: string
  children: React.ReactNode
}

/** Renders a spinner or error alert while async form prerequisites load. */
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

/** Waits for campaign catalog options before rendering form content. */
export function ContentFormOptionsGate({ campaignId, children }: ContentFormOptionsGateProps) {
  const { ctx, isPending, isError } = useContentFormOptions(campaignId)

  return (
    <ContentFormShellResolver
      isPending={isPending}
      isError={isError}
      errorLabel={CONTENT_CATALOG_OPTIONS_ERROR}
    >
      {children(ctx)}
    </ContentFormShellResolver>
  )
}
