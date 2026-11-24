import { getCreatureTraitTemplate, type CreatureTraitTemplateHost } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { senseRangeJoinedPairField } from '../forms/fields/content-sense-range-form-fields'
import { legendaryResistanceTemplateUseFields } from './legendary-resistance-trait-fields'

export type TemplateConfigField = Extract<
  FormItem,
  { type: 'number' | 'text' | 'select' | 'checkbox' | 'switch' }
>

export type TemplateFieldContribution = {
  shared: readonly TemplateConfigField[]
  extend?: Partial<Record<CreatureTraitTemplateHost, readonly TemplateConfigField[]>>
}

const RESERVED_PATHS = new Set([
  'details',
  'descriptionOverride',
  'overrideDisplay',
  'nameOverride',
])

const CONTRIBUTIONS: Partial<Record<string, TemplateFieldContribution>> = {
  'legendary-resistance': {
    shared: legendaryResistanceTemplateUseFields({ includeInLair: false }) as TemplateConfigField[],
    extend: {
      monster: legendaryResistanceTemplateUseFields({
        includeInLair: true,
      }).filter(
        (field): field is TemplateConfigField =>
          'name' in field && field.name === 'config.uses.inLair',
      ),
    },
  },
}

function supplementalDetailsField(): FormItem {
  return {
    type: 'richtext',
    name: 'details',
    label: 'Details',
    optionalDisclosure: { intent: 'add', actionSubject: 'details' },
  }
}

function assertFieldPath(path: string, templateId: string): void {
  if (RESERVED_PATHS.has(path)) {
    throw new Error(`Trait template field "${path}" is reserved (${templateId}).`)
  }
}

function assertPathOnSchema(path: string, templateId: string): void {
  if (!path.startsWith('config.')) return
  const template = getCreatureTraitTemplate(templateId)
  if (!template) return
  const key = path.slice('config.'.length).split('.')[0]
  if (!key) return
  const shape = template.configSchema.safeParse({})
  if (!shape.success) return
  const configKeys = Object.keys(shape.data as Record<string, unknown>)
  const nested = path.slice('config.'.length)
  const top = nested.split('.')[0]
  if (!top || !configKeys.includes(top)) {
    throw new Error(`Trait template field "${path}" is not on ${templateId} config schema.`)
  }
}

function withOptionalVisibility(field: FormItem, visibility?: FormItem['visibility']): FormItem {
  return visibility ? { ...field, visibility } : field
}

/** @internal Validation hook for contribution registry tests. */
export function validateTraitTemplateFieldContributionForTest(
  contribution: TemplateFieldContribution,
  host: CreatureTraitTemplateHost,
  templateId: string,
): void {
  validateContributionPaths(contribution, host, templateId)
}

function validateContributionPaths(
  contribution: TemplateFieldContribution,
  host: CreatureTraitTemplateHost,
  templateId: string,
): void {
  const paths = [
    ...contribution.shared.map((field) => field.name),
    ...(contribution.extend?.[host] ?? []).map((field) => field.name),
  ]
  const seen = new Set<string>()
  for (const path of paths) {
    if (seen.has(path)) {
      throw new Error(`Duplicate trait template field "${path}" (${templateId}).`)
    }
    seen.add(path)
    assertFieldPath(path, templateId)
    assertPathOnSchema(path, templateId)
  }
}

function contributionFields(
  contribution: TemplateFieldContribution,
  host: CreatureTraitTemplateHost,
  visibility?: FormItem['visibility'],
): FormItem[] {
  const fields: FormItem[] = contribution.shared.map((field) =>
    withOptionalVisibility(field, visibility),
  )
  for (const field of contribution.extend?.[host] ?? []) {
    if (contribution.shared.some((shared) => shared.name === field.name)) {
      throw new Error(`Trait template field "${field.name}" cannot extend a shared path.`)
    }
    fields.push(withOptionalVisibility(field, visibility))
  }
  return fields
}

function senseTemplateConfigField(): TemplateConfigField {
  return senseRangeJoinedPairField({
    amountName: 'config.range',
    width: '1/3',
    required: true,
  }) as unknown as TemplateConfigField
}

/** Assembles registry-backed trait config fields for one template and authoring host. */
export function assembleCreatureTraitTemplateFields(input: {
  templateId: string
  host: CreatureTraitTemplateHost
  visibility?: FormItem['visibility']
}): FormItem[] {
  const contribution = CONTRIBUTIONS[input.templateId]
  const configFields: FormItem[] = contribution
    ? (validateContributionPaths(contribution, input.host, input.templateId),
      contributionFields(contribution, input.host, input.visibility))
    : input.templateId.startsWith('sense-')
      ? [senseTemplateConfigField()]
      : getCreatureTraitTemplate(input.templateId)
        ? []
        : []

  return [...configFields, supplementalDetailsField()]
}
