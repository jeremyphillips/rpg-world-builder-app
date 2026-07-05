import { z } from 'zod'
import {
  ABILITY_ENTRIES,
  ABILITY_GENERATION_METHODS,
  ABILITY_IDS,
  abilityGenerationMethodSchema,
  ABILITY_SCORE_MIN,
  CHARACTER_ABILITY_SCORE_MAX,
  STANDARD_ARRAY,
  type Ability,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

const ABILITY_GENERATION_METHOD_LABELS = {
  'standard-array': 'Standard array',
  manual: 'Manual entry',
} as const satisfies Record<(typeof ABILITY_GENERATION_METHODS)[number], string>

const standardArrayOptions = [...STANDARD_ARRAY]
  .sort((a, b) => b - a)
  .map((value) => ({ label: String(value), value: String(value) }))

function abilityScoreField(ability: Ability, control: 'select' | 'number'): FormItem {
  const label = ABILITY_ENTRIES[ability].label

  if (control === 'select') {
    return {
      type: 'select',
      name: ability,
      label,
      required: true,
      visibility: {
        dependsOn: ['method'],
        visibleWhen: (values) => values.method === 'standard-array',
      },
      options: standardArrayOptions,
    }
  }

  return {
    type: 'number',
    name: ability,
    label,
    required: true,
    min: ABILITY_SCORE_MIN,
    max: CHARACTER_ABILITY_SCORE_MAX,
    visibility: {
      dependsOn: ['method'],
      visibleWhen: (values) => values.method === 'manual',
    },
  }
}

export const abilitiesFormSchema = z
  .object({
    method: abilityGenerationMethodSchema,
    str: z.coerce.number().int().optional(),
    dex: z.coerce.number().int().optional(),
    con: z.coerce.number().int().optional(),
    int: z.coerce.number().int().optional(),
    wis: z.coerce.number().int().optional(),
    cha: z.coerce.number().int().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.method === 'standard-array') {
      for (const ability of ABILITY_IDS) {
        if (typeof values[ability] !== 'number') {
          ctx.addIssue({
            code: 'custom',
            message: `${ABILITY_ENTRIES[ability].label} is required.`,
            path: [ability],
          })
        }
      }
      return
    }

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

export const abilitiesFormFields: FormItem[] = [
  {
    type: 'radio',
    name: 'method',
    label: 'Generation method',
    required: true,
    options: toOptions(ABILITY_GENERATION_METHODS, ABILITY_GENERATION_METHOD_LABELS),
  },
  {
    kind: 'group',
    legend: 'Ability scores',
    fields: ABILITY_IDS.flatMap((ability) => [
      abilityScoreField(ability, 'select'),
      abilityScoreField(ability, 'number'),
    ]),
  },
]
