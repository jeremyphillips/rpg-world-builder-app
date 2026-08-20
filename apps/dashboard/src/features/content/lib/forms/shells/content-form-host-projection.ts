import type { DefaultValues, FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import type { FormItem, FormValueSync } from '@rpg/ui/form'
import type { ContentValidationIntent } from '@rpg/contracts'

import { weaponFormValueSyncs } from '../../../equipment/weapons'
import { resolutionFormValueSyncs } from '../../../spells/resolution/lib/form/resolution-form-sync'
import type { AnyContentFormDef, ContentFormCtx } from '../content-form-registry'
import { contentFormFields } from '../content-form-registry'
import { resolveContentFormSchema } from './content-edit-load'
import type { ContentFormHostFormProps } from './content-form-host.client'

/** Resolver fields for invalid-submit focus — hoisted name first. */
export function resolveContentFormNavigationFields(
  def: Pick<AnyContentFormDef, 'nameField' | 'buildFields' | 'buildTabs'>,
  ctx: ContentFormCtx,
  fields?: FormItem[],
): FormItem[] {
  return [def.nameField(ctx), ...(fields ?? contentFormFields(def, ctx))]
}

export function resolveContentFormValueSyncs(
  def: Pick<AnyContentFormDef, 'routeKey' | 'valueSyncs'>,
  ctx: ContentFormCtx,
): FormValueSync[] | undefined {
  const isWeaponEquipmentForm = def.routeKey === 'equipment' && ctx.equipmentKind === 'weapon'
  const isSpellForm = def.routeKey === 'spells'

  if (isWeaponEquipmentForm) return weaponFormValueSyncs
  if (isSpellForm) return resolutionFormValueSyncs
  if (typeof def.valueSyncs === 'function') return def.valueSyncs(ctx)
  return def.valueSyncs
}

export type ResolveContentFormHostConfigOptions<TFormValues extends FieldValues> = {
  validationIntent?: ContentValidationIntent
  defaultValues?: DefaultValues<TFormValues>
  formKey?: string
  fields?: FormItem[]
}

export function resolveContentFormHostConfig<TFormValues extends FieldValues>(
  def: AnyContentFormDef,
  ctx: ContentFormCtx,
  options: ResolveContentFormHostConfigOptions<TFormValues> = {},
): Pick<
  ContentFormHostFormProps<TFormValues>,
  'schema' | 'fields' | 'valueSyncs' | 'defaultValues' | 'formKey'
> {
  const validationIntent = options.validationIntent ?? 'draft'

  return {
    schema: resolveContentFormSchema(def, ctx, validationIntent) as ZodType<TFormValues>,
    fields: options.fields ?? contentFormFields(def, ctx),
    valueSyncs: resolveContentFormValueSyncs(def, ctx),
    defaultValues: {
      ...def.createDefaultValues,
      ...options.defaultValues,
    } as DefaultValues<TFormValues>,
    ...(options.formKey !== undefined ? { formKey: options.formKey } : {}),
  }
}
