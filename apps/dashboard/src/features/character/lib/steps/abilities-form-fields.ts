import { z } from 'zod'
import type { ReactNode } from 'react'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ABILITY_SCORE_MIN,
  CHARACTER_ABILITY_SCORE_MAX,
  type Ability,
  type AbilityGenerationMethod,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

function manualAbilityScoreField(ability: Ability): FormItem {
  return {
    type: 'number',
    name: ability,
    label: ABILITY_ENTRIES[ability].label,
    required: true,
    min: ABILITY_SCORE_MIN,
    max: CHARACTER_ABILITY_SCORE_MAX,
  }
}

const abilityScoreSchema = z.coerce.number().int().optional()

export const abilitiesFormSchema = z
  .object({
    str: abilityScoreSchema,
    dex: abilityScoreSchema,
    con: abilityScoreSchema,
    int: abilityScoreSchema,
    wis: abilityScoreSchema,
    cha: abilityScoreSchema,
  })
  .superRefine((values, ctx) => {
    for (const ability of ABILITY_IDS) {
      if (typeof values[ability] !== 'number') {
        ctx.addIssue({
          code: 'custom',
          message: `${ABILITY_ENTRIES[ability].label} is required.`,
          path: [ability],
        })
      }
    }
  })

export type AbilitiesFormValues = z.infer<typeof abilitiesFormSchema>

export function buildAbilitiesFormFields(method: AbilityGenerationMethod): FormItem[] {
  if (method === 'manual') {
    return [
      {
        kind: 'group',
        legend: 'Ability scores',
        fields: ABILITY_IDS.map((ability) => manualAbilityScoreField(ability)),
      },
    ]
  }

  return []
}

/** Registers ability score paths for validation copy when the slot UI owns the controls. */
export function abilitiesScoreResolverFields(): FormItem[] {
  return ABILITY_IDS.map((ability) => ({
    type: 'number' as const,
    name: ability,
    label: ABILITY_ENTRIES[ability].label,
    required: true,
  }))
}

export type BuildAbilitiesStepFormFieldsInput = {
  method: AbilityGenerationMethod
  renderStandardArrayAssignment: () => ReactNode
  renderDraftSync: () => ReactNode
  renderContinueRegistration: () => ReactNode
}

/** Composes the abilities step field list for standard-array or manual generation. */
export function buildAbilitiesStepFormFields({
  method,
  renderStandardArrayAssignment,
  renderDraftSync,
  renderContinueRegistration,
}: BuildAbilitiesStepFormFieldsInput): FormItem[] {
  const items: FormItem[] =
    method === 'standard-array'
      ? [
          {
            kind: 'slot' as const,
            name: 'standardArrayAssignment',
            render: renderStandardArrayAssignment,
          },
        ]
      : buildAbilitiesFormFields(method)

  return [
    ...items,
    {
      kind: 'slot' as const,
      name: '_abilitiesContinueRegistration',
      render: renderContinueRegistration,
    },
    {
      kind: 'slot' as const,
      name: '_abilitiesDraftSync',
      render: renderDraftSync,
    },
  ]
}

/** Field list used by validation tests for standard-array (slot + resolver paths). */
export function buildAbilitiesValidationFields(method: AbilityGenerationMethod): FormItem[] {
  if (method === 'standard-array') {
    return [
      {
        kind: 'slot' as const,
        name: 'standardArrayAssignment',
        render: () => null,
      },
      ...abilitiesScoreResolverFields(),
    ]
  }

  return buildAbilitiesFormFields(method)
}
