import { CREATURE_SIZE_HIT_DIE, type CreatureSize } from '@rpg/contracts'
import type { FieldVisibility, FormItem, SelectFieldOptionListItem } from '@rpg/ui/form'

import { MONSTER_HIT_POINTS_HEADING } from '../monster-form-labels'
import {
  formatMonsterHitPointsPreviewLine,
  MONSTER_HIT_POINTS_DICE_COUNT_FIELD,
  MONSTER_HIT_POINTS_DICE_FACES_FIELD,
  MONSTER_HIT_POINTS_DICE_FIELD,
  MONSTER_HIT_POINTS_USE_FIXED_FIELD,
} from './monster-hit-points-form.lib'
import type { MonsterFormValues } from '../monster-form-values'

const HIT_DIE_FACE_OPTIONS: SelectFieldOptionListItem[] = [
  ...new Set(Object.values(CREATURE_SIZE_HIT_DIE)),
]
  .sort((a, b) => a - b)
  .map((faces) => ({ value: String(faces), label: String(faces) }))

function visibleWhenHitDiceMode(): FieldVisibility {
  return {
    dependsOn: [MONSTER_HIT_POINTS_USE_FIXED_FIELD],
    visibleWhen: (watched) => watched[MONSTER_HIT_POINTS_USE_FIXED_FIELD] !== true,
  }
}

function visibleWhenFixedMode(): FieldVisibility {
  return {
    dependsOn: [MONSTER_HIT_POINTS_USE_FIXED_FIELD],
    visibleWhen: (watched) => watched[MONSTER_HIT_POINTS_USE_FIXED_FIELD] === true,
  }
}

function hitPointsDicePreviewMeta() {
  return {
    reserveSpace: true,
    dependsOn: [
      'hitPoints',
      'size',
      'abilityScores',
      MONSTER_HIT_POINTS_DICE_FIELD,
      MONSTER_HIT_POINTS_DICE_COUNT_FIELD,
      MONSTER_HIT_POINTS_USE_FIXED_FIELD,
    ],
    metaWhen: (values: Record<string, unknown>) => {
      if (values[MONSTER_HIT_POINTS_USE_FIXED_FIELD] === true) return undefined
      const line = formatMonsterHitPointsPreviewLine(values as MonsterFormValues)
      if (!line) return undefined
      return { rows: [{ value: line }] }
    },
  }
}

export function monsterHitPointsFields(): FormItem[] {
  return [
    {
      kind: 'group',
      legend: MONSTER_HIT_POINTS_HEADING,
      density: 'comfortable',
      fields: [
        {
          type: 'switch',
          name: MONSTER_HIT_POINTS_USE_FIXED_FIELD,
          label: 'Fixed',
          labelPosition: 'inline',
        },
        {
          type: 'inlineSentence',
          name: MONSTER_HIT_POINTS_DICE_FACES_FIELD,
          label: 'Hit dice',
          labelVisibility: 'srOnly',
          visibility: visibleWhenHitDiceMode(),
          derivedMeta: hitPointsDicePreviewMeta(),
          optionsResolve: {
            dependsOn: ['size'],
            optionsWhen: (values) => {
              const size = (values.size ?? 'medium') as CreatureSize
              const faces = CREATURE_SIZE_HIT_DIE[size]
              return [{ value: String(faces), label: String(faces) }]
            },
          },
          segments: [
            {
              kind: 'number',
              name: MONSTER_HIT_POINTS_DICE_COUNT_FIELD,
              min: 1,
              digits: 2,
              defaultValue: 1,
              ariaLabel: 'Hit dice count',
            },
            { kind: 'text', value: 'd', tone: 'mono' },
            {
              kind: 'select',
              name: MONSTER_HIT_POINTS_DICE_FACES_FIELD,
              options: HIT_DIE_FACE_OPTIONS,
              digits: 2,
              width: 'xs',
              ariaLabel: 'Die faces',
            },
          ],
        },
        {
          type: 'number',
          name: 'hitPointsFixedAverage',
          label: MONSTER_HIT_POINTS_HEADING,
          min: 1,
          digits: 3,
          required: true,
          visibility: visibleWhenFixedMode(),
        },
      ],
    },
  ]
}
