import { z } from 'zod'
import type { ReactNode } from 'react'
import { ABILITY_ENTRIES, ABILITY_IDS, type AbilityGenerationMethod } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

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

export type BuildAbilitiesStepFormFieldsInput = {
  method: AbilityGenerationMethod
  renderFixedScoresAssignment: () => ReactNode
  renderManualAbilitiesAssignment: () => ReactNode
  renderDraftSync: () => ReactNode
  renderContinueRegistration: () => ReactNode
}

/** Composes the abilities step field list for fixed-score or manual generation. */
export function buildAbilitiesStepFormFields({
  method,
  renderFixedScoresAssignment,
  renderManualAbilitiesAssignment,
  renderDraftSync,
  renderContinueRegistration,
}: BuildAbilitiesStepFormFieldsInput): FormItem[] {
  const items: FormItem[] =
    method === 'standard-array'
      ? [
          {
            kind: 'slot' as const,
            name: 'fixedScoresAssignment',
            render: renderFixedScoresAssignment,
          },
        ]
      : [
          {
            kind: 'slot' as const,
            name: 'manualAbilitiesAssignment',
            render: renderManualAbilitiesAssignment,
          },
        ]

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

/** Registers ability score paths for validation copy when the slot UI owns the controls. */
export function abilitiesScoreResolverFields(): FormItem[] {
  return ABILITY_IDS.map((ability) => ({
    type: 'number' as const,
    name: ability,
    label: ABILITY_ENTRIES[ability].label,
    required: true,
  }))
}

/** Field list used by validation tests for fixed-score assignment (slot + resolver paths). */
export function buildAbilitiesValidationFields(method: AbilityGenerationMethod): FormItem[] {
  if (method === 'standard-array' || method === 'manual') {
    return [
      {
        kind: 'slot' as const,
        name: method === 'standard-array' ? 'fixedScoresAssignment' : 'manualAbilitiesAssignment',
        render: () => null,
      },
      ...abilitiesScoreResolverFields(),
    ]
  }

  return []
}
