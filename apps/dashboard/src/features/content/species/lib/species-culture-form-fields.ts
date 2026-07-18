import { z } from 'zod'
import {
  speciesNamingSubjectKindSchema,
  type SpeciesCultureConfig,
  type SpeciesNamingSubjectKind,
} from '@rpg/contracts'
import { NAME_SUBJECT_KINDS } from '@rpg/contracts/name-generator'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { SUBJECT_KIND_LABELS } from '@/features/name-generator/model/name-generator.constants'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'

export const CULTURE_FIELD_PREFIX = 'culture'
export const CULTURE_USE_OVERRIDE_FIELD = 'culture.useOverride'
export const CULTURE_NAME_FIELD = 'culture.name'
export const CULTURE_ID_FIELD = 'culture.id'
export const CULTURE_NAMING_SUPPORTED_FIELD = 'culture.naming.supported'
export const CULTURE_NAMING_SUBJECT_KINDS_FIELD = 'culture.naming.subjectKinds'

const speciesNamingSubjectKinds = NAME_SUBJECT_KINDS.filter(
  (kind): kind is SpeciesNamingSubjectKind => kind !== 'person',
)

const speciesNamingSubjectKindOptions = toOptions(
  speciesNamingSubjectKinds,
  Object.fromEntries(
    speciesNamingSubjectKinds.map((kind) => [kind, SUBJECT_KIND_LABELS[kind] ?? kind]),
  ) as Record<SpeciesNamingSubjectKind, string>,
)

export const speciesCultureFormSchema = z
  .object({
    useOverride: z.boolean().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    naming: z.discriminatedUnion('supported', [
      z.object({ supported: z.literal(false) }).strict(),
      z.object({
        supported: z.literal(true),
        subjectKinds: z.array(speciesNamingSubjectKindSchema).optional(),
      }),
    ]),
  })
  .strict()

export type SpeciesCultureFormValues = z.infer<typeof speciesCultureFormSchema>

function isSystemSpecies(ctx: ContentFormCtx): boolean {
  return ctx.entitySource === 'system'
}

function visibleWhenCultureOverrideActive() {
  return {
    dependsOn: [CULTURE_USE_OVERRIDE_FIELD],
    visibleWhen: (watched: Record<string, unknown>) => watched[CULTURE_USE_OVERRIDE_FIELD] === true,
  }
}

function visibleWhenNamingSupported() {
  return {
    dependsOn: [CULTURE_NAMING_SUPPORTED_FIELD],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched[CULTURE_NAMING_SUPPORTED_FIELD] === true,
  }
}

export function cultureToFormValues(culture?: SpeciesCultureConfig): SpeciesCultureFormValues {
  const useOverride = culture?.id !== undefined

  return {
    useOverride,
    ...(culture?.id !== undefined ? { id: culture.id } : {}),
    ...(culture?.name !== undefined ? { name: culture.name } : {}),
    naming:
      culture?.naming ??
      ({
        supported: false,
      } as const),
  }
}

export function cultureFields(ctx: ContentFormCtx): FormItem {
  const systemSpecies = isSystemSpecies(ctx)

  return {
    kind: 'group',
    legend: 'Culture',
    legendSize: 'subsection',
    fields: [
      {
        type: 'switch',
        name: CULTURE_USE_OVERRIDE_FIELD,
        label: 'Use a different culture tradition',
        hint: 'Override the default culture id derived from this species slug.',
        visibility: {
          dependsOn: [],
          visibleWhen: () => !systemSpecies,
        },
      },
      {
        type: 'text',
        name: CULTURE_ID_FIELD,
        label: 'Culture id',
        visibility: {
          dependsOn: [],
          visibleWhen: () => false,
        },
      },
      {
        type: 'text',
        name: CULTURE_NAME_FIELD,
        label: 'Culture name',
        hint: 'Display name for this species’ cultural tradition, used by culture-aware features such as the name generator.',
        required: true,
        disabled: systemSpecies,
        visibility: visibleWhenCultureOverrideActive(),
      },
      {
        type: 'switch',
        name: CULTURE_NAMING_SUPPORTED_FIELD,
        label: 'Name generation',
        disabled: systemSpecies,
      },
      {
        type: 'chips',
        name: CULTURE_NAMING_SUBJECT_KINDS_FIELD,
        label: 'Additional name subjects',
        hint: 'Personal names are included automatically.',
        options: speciesNamingSubjectKindOptions,
        disabled: systemSpecies,
        visibility: visibleWhenNamingSupported(),
        chrome: { variant: 'panel' },
      },
    ],
  }
}

export function cultureFormSchemaRefinement(
  values: { culture?: SpeciesCultureFormValues },
  ctx: Pick<ContentFormCtx, 'entitySource'>,
  addIssue: (issue: { path: (string | number)[]; message: string }) => void,
): void {
  const culture = values.culture
  if (culture === undefined) return

  if (culture.useOverride === true && (culture.name === undefined || culture.name.trim() === '')) {
    addIssue({
      path: ['culture', 'name'],
      message: 'Culture name is required when using a custom culture tradition.',
    })
  }

  if (ctx.entitySource !== 'system' && culture.id !== undefined && culture.name === undefined) {
    addIssue({
      path: ['culture', 'name'],
      message: 'Culture name is required when a culture id override is present.',
    })
  }
}
