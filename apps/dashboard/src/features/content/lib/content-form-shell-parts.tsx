import { useNavigate } from 'react-router-dom'
import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import { Heading, Spinner, Text, Button } from '@rpg/ui'
import {
  Form,
  FormFooterActions,
  TabbedForm,
  type FormItem,
  type FormValueSync,
  type TabbedFormTab,
} from '@rpg/ui/form'

import { NarrowPage } from '@/components/layout/narrow-page'
import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'
import { weaponAdvisorySubmitOptions, weaponFormValueSyncs } from '../equipment/weapons'
import { useContentFormOptions } from './content-form-options'
import type { AnyContentFormDef, ContentFormCtx } from './content-form-registry'
import { contentFormFields } from './content-form-registry'
import { useAdvisoryFormSubmit, type AdvisoryFormSubmitOptions } from './use-advisory-form-submit'

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
    <NarrowPage spacing="relaxed" className="pb-10">
      <Heading variant="page" as="h1">
        {heading}
      </Heading>
      <ContentFormComingSoon />
    </NarrowPage>
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
  const navigate = useNavigate()

  return (
    <>
      <FormUnsavedChangesGuard />
      <FormFooterActions
        pending={pending}
        submitLabel={submitLabel}
        secondary={
          <Button type="button" variant="outline" onClick={() => navigate(backHref)}>
            Cancel
          </Button>
        }
      />
    </>
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
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
  collapsibleSections?: boolean
  valueSyncs?: FormValueSync[]
  beforeSubmit?: (
    values: TFormValues,
    form: UseFormReturn<TFormValues>,
  ) => boolean | Promise<boolean>
  submitConfirmDialog?: React.ReactNode
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
  collapsibleSections,
  valueSyncs,
  beforeSubmit,
  submitConfirmDialog,
}: ContentSchemaFormProps<TFormValues>) {
  const handleSubmit = React.useCallback(
    async (values: TFormValues, form: UseFormReturn<TFormValues>) => {
      if (beforeSubmit) {
        const proceed = await beforeSubmit(values, form)
        if (!proceed) return
      }
      await onSubmit(values, form)
    },
    [beforeSubmit, onSubmit],
  )

  return (
    <>
      <Form<TFormValues>
        key={formKey}
        schema={schema}
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        formError={formError}
        collapsibleSections={collapsibleSections}
        valueSyncs={valueSyncs}
        stickyFooter
        footer={(form) => (
          <ContentFormCancelFooter
            backHref={backHref}
            submitLabel={submitLabel}
            pending={submitPending || form.formState.isSubmitting}
          />
        )}
      />
      {submitConfirmDialog}
    </>
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
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
  valueSyncs?: FormValueSync[]
  beforeSubmit?: (
    values: TFormValues,
    form: UseFormReturn<TFormValues>,
  ) => boolean | Promise<boolean>
  submitConfirmDialog?: React.ReactNode
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
  valueSyncs,
  beforeSubmit,
  submitConfirmDialog,
}: ContentTabbedSchemaFormProps<TFormValues>) {
  const handleSubmit = React.useCallback(
    async (values: TFormValues, form: UseFormReturn<TFormValues>) => {
      if (beforeSubmit) {
        const proceed = await beforeSubmit(values, form)
        if (!proceed) return
      }
      await onSubmit(values, form)
    },
    [beforeSubmit, onSubmit],
  )

  return (
    <>
      <TabbedForm<TFormValues>
        key={formKey}
        schema={schema}
        tabs={tabs}
        defaultValues={defaultValues}
        collapsibleSections={false}
        valueSyncs={valueSyncs}
        onSubmit={(values, form) => handleSubmit(values, form)}
        formError={formError}
        footer={(form) => (
          <ContentFormCancelFooter
            backHref={backHref}
            submitLabel={submitLabel}
            pending={submitPending || form.formState.isSubmitting}
          />
        )}
      />
      {submitConfirmDialog}
    </>
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
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => Promise<void>
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
  const isWeaponEquipmentForm = def.routeKey === 'equipment' && ctx.equipmentKind === 'weapon'
  const weaponAdvisoryOptions = React.useMemo(
    () => (isWeaponEquipmentForm ? weaponAdvisorySubmitOptions() : { enabled: false }),
    [isWeaponEquipmentForm],
  )
  const { onSubmit: advisoryOnSubmit, confirmDialog } = useAdvisoryFormSubmit(
    onSubmit,
    weaponAdvisoryOptions as AdvisoryFormSubmitOptions<TFormValues>,
  )
  const resolvedOnSubmit = isWeaponEquipmentForm ? advisoryOnSubmit : onSubmit
  const valueSyncs = isWeaponEquipmentForm ? weaponFormValueSyncs : undefined

  const sharedProps = {
    schema,
    defaultValues,
    formKey,
    backHref,
    submitLabel,
    submitPending,
    formError,
    onSubmit: resolvedOnSubmit,
    valueSyncs,
    submitConfirmDialog: isWeaponEquipmentForm ? confirmDialog : undefined,
  }

  if (def.buildTabs) {
    return <ContentTabbedSchemaForm tabs={def.buildTabs(ctx)} {...sharedProps} />
  }

  return (
    <ContentSchemaForm
      fields={contentFormFields(def, ctx)}
      collapsibleSections={def.routeKey === 'equipment' ? false : undefined}
      {...sharedProps}
    />
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
