import { Link } from 'react-router-dom'
import type { DefaultValues, FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import { Heading, Spinner, Text } from '@rpg/ui'
import { Form, FormSaveFooter, TabbedForm, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import { useContentFormOptions } from './content-form-options'
import type { AnyContentFormDef, ContentFormCtx } from './content-form-registry'
import { contentFormFields } from './content-form-registry'

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
    <div className="flex items-center gap-3">
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
        stickyFooter
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

interface ContentTabbedSchemaFormProps<TFormValues extends FieldValues> {
  schema: ZodType<TFormValues>
  tabs: TabbedFormTab[]
  defaultValues?: DefaultValues<TFormValues>
  formKey?: string
  backHref: string
  submitLabel: string
  submitPending: boolean
  formError: string | null
  onSubmit: (values: TFormValues) => Promise<void>
}

export function ContentTabbedSchemaForm<TFormValues extends FieldValues>({
  schema,
  tabs,
  defaultValues,
  formKey,
  backHref,
  submitLabel,
  submitPending,
  formError,
  onSubmit,
}: ContentTabbedSchemaFormProps<TFormValues>) {
  return (
    <div className="max-w-2xl">
      <TabbedForm<TFormValues>
        key={formKey}
        schema={schema}
        tabs={tabs}
        defaultValues={defaultValues}
        collapsibleSections={false}
        onSubmit={(values) => onSubmit(values)}
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

interface ContentFormLayoutProps<TFormValues extends FieldValues> {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  schema: ZodType<TFormValues>
  defaultValues?: DefaultValues<TFormValues>
  formKey?: string
  backHref: string
  submitLabel: string
  submitPending: boolean
  formError: string | null
  onSubmit: (values: TFormValues) => Promise<void>
}

export function ContentFormLayout<TFormValues extends FieldValues>({
  def,
  ctx,
  schema,
  defaultValues,
  formKey,
  backHref,
  submitLabel,
  submitPending,
  formError,
  onSubmit,
}: ContentFormLayoutProps<TFormValues>) {
  const sharedProps = {
    schema,
    defaultValues,
    formKey,
    backHref,
    submitLabel,
    submitPending,
    formError,
    onSubmit,
  }

  if (def.buildTabs) {
    return <ContentTabbedSchemaForm tabs={def.buildTabs(ctx)} {...sharedProps} />
  }

  return <ContentSchemaForm fields={contentFormFields(def, ctx)} {...sharedProps} />
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
