import { createElement } from 'react'
import { z } from 'zod'
import { type SpeciesCultureConfig } from '@rpg/contracts'
import { personalNameComponentSchema } from '@rpg/contracts/vocab'
import { type FormItem } from '@rpg/ui/form'

import { buildActiveLanguageFieldOptions } from '@/features/homebrew'
import { getContentTypeMidSentenceLabel } from '@/features/content/lib/content-type-labels'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { SpeciesCultureNamingAlert } from '../components/species-culture-naming-alert.client'
import { SpeciesPersonalNameComponentsField } from '../components/species-personal-name-components-field.client'

export const CULTURE_FIELD_PREFIX = 'culture'
export const CULTURE_USE_OVERRIDE_FIELD = 'culture.useOverride'
export const CULTURE_NAME_FIELD = 'culture.name'
export const CULTURE_ID_FIELD = 'culture.id'
export const CULTURE_NAMING_SUPPORTED_FIELD = 'culture.naming.supported'
export const CULTURE_NAMING_PERSONAL_NAME_COMPONENTS_FIELD = 'culture.naming.personalNameComponents'

export const speciesCultureFormSchema = z
  .object({
    useOverride: z.boolean().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    naming: z.discriminatedUnion('supported', [
      z.object({ supported: z.literal(false) }).strict(),
      z.object({
        supported: z.literal(true),
        personalNameComponents: z.array(personalNameComponentSchema).optional(),
      }),
    ]),
  })
  .strict()

export type SpeciesCultureFormValues = z.infer<typeof speciesCultureFormSchema>

function isSystemSpecies(ctx: ContentFormCtx): boolean {
  return ctx.entitySource === 'system'
}

function isHomebrewSpecies(ctx: ContentFormCtx): boolean {
  return ctx.entitySource === 'homebrew'
}

function visibleWhenCultureOverrideActive() {
  return {
    dependsOn: [CULTURE_USE_OVERRIDE_FIELD],
    visibleWhen: (watched: Record<string, unknown>) => watched[CULTURE_USE_OVERRIDE_FIELD] === true,
  }
}

function visibleWhenNamingSupportedAndNotHomebrew(ctx: ContentFormCtx) {
  return {
    dependsOn: [CULTURE_NAMING_SUPPORTED_FIELD],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched[CULTURE_NAMING_SUPPORTED_FIELD] === true && !isHomebrewSpecies(ctx),
  }
}

export function cultureToFormValues(culture?: SpeciesCultureConfig): SpeciesCultureFormValues {
  const useOverride = culture?.id !== undefined
  const naming =
    culture?.naming ??
    ({
      supported: false,
    } as const)

  return {
    useOverride,
    ...(culture?.id !== undefined ? { id: culture.id } : {}),
    ...(culture?.name !== undefined ? { name: culture.name } : {}),
    naming:
      naming.supported === true
        ? {
            supported: true as const,
            ...(naming.personalNameComponents && naming.personalNameComponents.length > 0
              ? { personalNameComponents: naming.personalNameComponents }
              : {}),
          }
        : { supported: false as const },
  }
}

export function cultureFields(ctx: ContentFormCtx): FormItem {
  const systemSpecies = isSystemSpecies(ctx)
  const homebrewSpecies = isHomebrewSpecies(ctx)

  return {
    kind: 'group',
    legend: 'Culture',
    legendSize: 'subsection',
    chrome: { variant: 'panel', emphasis: 'subtle' },
    fields: [
      {
        type: 'switch',
        name: CULTURE_USE_OVERRIDE_FIELD,
        label: 'Use a different culture tradition',
        hint: `Override the default culture id derived from this ${getContentTypeMidSentenceLabel('species')} slug.`,
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
        type: 'chips',
        name: 'languageAffinities',
        label: 'Language affinities',
        hint: 'Recommended languages for origin picks. Does not grant languages or expand selectable pools.',
        options: buildActiveLanguageFieldOptions(ctx.languageVocabulary),
        chrome: { variant: 'panel' },
      },
      {
        type: 'switch',
        name: CULTURE_NAMING_SUPPORTED_FIELD,
        label: 'Name generation supported',
        visibility: {
          dependsOn: [],
          visibleWhen: () => false,
        },
      },
      ...(homebrewSpecies
        ? [
            {
              kind: 'slot' as const,
              name: 'cultureNamingAlert',
              render: () => createElement(SpeciesCultureNamingAlert),
            },
          ]
        : []),
      {
        kind: 'slot',
        name: CULTURE_NAMING_PERSONAL_NAME_COMPONENTS_FIELD,
        visibility: visibleWhenNamingSupportedAndNotHomebrew(ctx),
        render: () =>
          createElement(SpeciesPersonalNameComponentsField, {
            disabled: systemSpecies,
          }),
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
