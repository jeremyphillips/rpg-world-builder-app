import { useNavigate } from 'react-router-dom'
import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'
import { Heading, InsetPanel, Button } from '@rpg/ui'
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
import { weaponAdvisorySubmitOptions, weaponFormValueSyncs } from '../../../equipment/weapons'
import { resolutionFormValueSyncs } from '../../../spells/resolution/lib/form/resolution-form-sync'
import { useContentFormOptions } from '../../form-options/content-form-options'
import type { AnyContentFormDef, ContentFormCtx } from '../content-form-registry'
import { contentFormFields } from '../content-form-registry'
import {
  CONTENT_CATALOG_OPTIONS_ERROR,
  ContentFormShellResolver,
} from './content-form-shell-resolver'
import { useAdvisoryFormSubmit, type AdvisoryFormSubmitOptions } from './use-advisory-form-submit'

export function ContentFormComingSoon() {
  return (
    <InsetPanel borderStyle="dashed" surface="none" size="lg" align="center">
      <InsetPanel.Text>Form coming soon.</InsetPanel.Text>
    </InsetPanel>
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

function ContentFormCancelFooter({ backHref, submitLabel, pending }: ContentFormCancelFooterProps) {
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
  valueSyncs?: FormValueSync[]
  beforeSubmit?: (
    values: TFormValues,
    form: UseFormReturn<TFormValues>,
  ) => boolean | Promise<boolean>
  submitConfirmDialog?: React.ReactNode
}

function ContentSchemaForm<TFormValues extends FieldValues>({
  schema,
  fields,
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
        uiStateKey={formKey}
        schema={schema}
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        formError={formError}
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

function ContentTabbedSchemaForm<TFormValues extends FieldValues>({
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
        uiStateKey={formKey}
        schema={schema}
        tabs={tabs}
        defaultValues={defaultValues}
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
  const isSpellForm = def.routeKey === 'spells'
  const weaponAdvisoryOptions = React.useMemo((): AdvisoryFormSubmitOptions<TFormValues> => {
    if (!isWeaponEquipmentForm) return { enabled: false }
    // Weapon advisories are authored for EquipmentFormValues; this layout only
    // enables them on the weapon equipment route where TFormValues matches.
    return weaponAdvisorySubmitOptions() as unknown as AdvisoryFormSubmitOptions<TFormValues>
  }, [isWeaponEquipmentForm])
  const { onSubmit: advisoryOnSubmit, confirmDialog } = useAdvisoryFormSubmit(
    onSubmit,
    weaponAdvisoryOptions,
  )
  const resolvedOnSubmit = isWeaponEquipmentForm ? advisoryOnSubmit : onSubmit
  const valueSyncs = isWeaponEquipmentForm
    ? weaponFormValueSyncs
    : isSpellForm
      ? resolutionFormValueSyncs
      : undefined

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

  return <ContentSchemaForm fields={contentFormFields(def, ctx)} {...sharedProps} />
}

interface ContentFormOptionsGateProps {
  campaignId: string
  children: (ctx: ContentFormCtx) => React.ReactNode
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
