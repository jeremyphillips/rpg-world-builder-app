import {
  getCreatureTraitTemplate,
  type CreatureTraitTemplateHost,
  type CreatureTraitTemplateId,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import { z } from 'zod'

import {
  SENSE_RANGE_UNIT_LABEL,
  senseRangeJoinedPairField,
} from '../forms/fields/content-sense-range-form-fields'
import { legendaryResistanceTemplateUseFields } from './legendary-resistance-trait-fields'

type TemplateConfigField = Extract<
  FormItem,
  { type: 'number' | 'text' | 'select' | 'checkbox' | 'switch' | 'joinedPair' }
>

type TemplateFieldPolicy =
  | { kind: 'configurable'; fields: () => readonly [TemplateConfigField, ...TemplateConfigField[]] }
  | { kind: 'fieldless' | 'unsupported' }

const FIELDLESS = { kind: 'fieldless' } as const
const UNSUPPORTED = { kind: 'unsupported' } as const

const FIELDLESS_ON_BOTH_HOSTS = { species: FIELDLESS, monster: FIELDLESS }
const SENSE_FIELD_POLICY = {
  species: {
    kind: 'configurable',
    fields: () => [
      senseRangeJoinedPairField({
        amountName: 'config.range',
        required: true,
        end: { kind: 'label', text: SENSE_RANGE_UNIT_LABEL, ariaLabel: 'Range unit' },
      }),
    ],
  },
  monster: UNSUPPORTED,
} satisfies Record<CreatureTraitTemplateHost, TemplateFieldPolicy>

const FIELD_POLICIES = {
  'magic-resistance': FIELDLESS_ON_BOTH_HOSTS,
  'pack-tactics': FIELDLESS_ON_BOTH_HOSTS,
  'sunlight-sensitivity': FIELDLESS_ON_BOTH_HOSTS,
  'legendary-resistance': {
    species: {
      kind: 'configurable',
      fields: () => legendaryResistanceTemplateUseFields({ includeInLair: true }),
    },
    monster: {
      kind: 'configurable',
      fields: () => legendaryResistanceTemplateUseFields({ includeInLair: true }),
    },
  },
  'sense-blindsight': SENSE_FIELD_POLICY,
  'sense-darkvision': SENSE_FIELD_POLICY,
  'sense-tremorsense': SENSE_FIELD_POLICY,
  'sense-truesight': SENSE_FIELD_POLICY,
} satisfies Record<CreatureTraitTemplateId, Record<CreatureTraitTemplateHost, TemplateFieldPolicy>>

const CONFIG_PREFIX = 'config.'
const DETAILS_PATH = 'details'
const RESERVED_PATHS = new Set([
  DETAILS_PATH,
  'descriptionOverride',
  'overrideDisplay',
  'nameOverride',
])

function supplementalDetailsField(): FormItem {
  return {
    type: 'richtext',
    name: DETAILS_PATH,
    label: 'Details',
    optionalDisclosure: { intent: 'add', actionSubject: DETAILS_PATH },
  }
}

function boundPaths(field: TemplateConfigField): string[] {
  if (field.type !== 'joinedPair') return [field.name]
  return field.end.kind === 'select' ? [field.start.name, field.end.name] : [field.start.name]
}

function schemaHasFieldPath(schema: z.ZodType | undefined, path: string): boolean {
  if (!path.startsWith(CONFIG_PREFIX)) return false
  for (const segment of path.slice(CONFIG_PREFIX.length).split('.')) {
    if (!(schema instanceof z.ZodObject) || !Object.hasOwn(schema.shape, segment)) return false
    schema = schema.shape[segment]
  }
  return schema !== undefined && !(schema instanceof z.ZodObject)
}

/** Validates persisted config bindings against the template schema, including nested fields. */
export function validateTraitTemplateConfigFields(
  fields: readonly TemplateConfigField[],
  templateId: CreatureTraitTemplateId,
): void {
  const schema = getCreatureTraitTemplate(templateId)?.configSchema
  const paths = fields.flatMap(boundPaths)
  const seen = new Set<string>()
  for (const path of paths) {
    if (RESERVED_PATHS.has(path.split('.')[0]!)) {
      throw new Error(`Trait template field "${path}" is reserved (${templateId}).`)
    }
    if (seen.has(path)) {
      throw new Error(`Duplicate trait template field "${path}" (${templateId}).`)
    }
    seen.add(path)
  }
  for (const path of paths) {
    if (!schemaHasFieldPath(schema, path)) {
      throw new Error(
        `Trait template field "${path}" is not a field on ${templateId} config schema.`,
      )
    }
  }
}

/** Assembles registry-backed trait config fields for one template and authoring host. */
export function assembleCreatureTraitTemplateFields(input: {
  templateId: string
  host: CreatureTraitTemplateHost
  visibility?: FormItem['visibility']
}): FormItem[] {
  const template = getCreatureTraitTemplate(input.templateId)
  if (!template) return []

  const templateId = input.templateId as CreatureTraitTemplateId
  const policy = FIELD_POLICIES[templateId]?.[input.host]
  if (!policy || template.hosts.includes(input.host) === (policy.kind === 'unsupported')) {
    throw new Error(`Trait template field policy does not match ${templateId} on ${input.host}.`)
  }
  if (policy.kind === 'unsupported') return []
  if (policy.kind === 'fieldless') return [supplementalDetailsField()]

  const fields = policy.fields()
  if (fields.length === 0) {
    throw new Error(`Configurable trait template ${templateId} has no fields on ${input.host}.`)
  }
  validateTraitTemplateConfigFields(fields, templateId)
  const visibleFields = fields.map((field) =>
    input.visibility ? { ...field, visibility: input.visibility } : field,
  )
  return [...ownConfigObjectGroups(visibleFields), supplementalDetailsField()]
}

/** Object schema paths such as `config.uses` own their leaf controls. */
function ownConfigObjectGroups(fields: FormItem[]): FormItem[] {
  const grouped = new Map<string, FormItem[]>()
  const rest: FormItem[] = []

  for (const field of fields) {
    if (!('name' in field) || typeof field.name !== 'string') {
      rest.push(field)
      continue
    }
    const segments = field.name.split('.')
    if (segments.length < 3 || segments[0] !== 'config') {
      rest.push(field)
      continue
    }
    const objectPath = segments.slice(0, -1).join('.')
    const current = grouped.get(objectPath) ?? []
    current.push(field)
    grouped.set(objectPath, current)
  }

  const groups: FormItem[] = [...grouped.entries()].map(([name, groupFields]) => ({
    kind: 'group',
    name,
    heading: { label: 'Uses', labelVisibility: 'srOnly' },
    fields: groupFields,
  }))

  return [...groups, ...rest]
}
