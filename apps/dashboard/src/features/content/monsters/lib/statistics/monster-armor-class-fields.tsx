import { getNaturalArmorBonusFieldLabel } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MonsterArmorClassPreview } from '../../components/form/monster-armor-class-preview'
import {
  MonsterArmorSlotAction,
  MonsterArmorSlotBody,
} from '../../components/form/monster-armor-slot'
import {
  MONSTER_ARMOR_CLASS_HEADING,
  MONSTER_BODY_ARMOR_SLOT_HEADING,
  MONSTER_SHIELD_SLOT_HEADING,
} from '../monster-form-labels'

const NATURAL_ARMOR_BONUS_HINT = "Adds to the creature's unarmored AC."
const ARMOR_AND_SHIELD_LEGEND = 'Armor & shield'
const MANUAL_AC_OVERRIDE_LABEL = 'Manual AC override'
const MANUAL_AC_OVERRIDE_HINT =
  "Use when the normal calculation doesn't apply. Replaces the calculated result."
const FIXED_ARMOR_CLASS_LABEL = 'Fixed Armor Class'
const USE_FIXED_ARMOR_CLASS_LABEL = 'Use fixed Armor Class'

export function monsterArmorClassFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      legend: MONSTER_ARMOR_CLASS_HEADING,
      description:
        'The highest of natural armor and worn armor, plus a shield. A fixed value replaces the result.',
      fields: [
        {
          kind: 'slot',
          name: 'armorClass.preview',
          render: () => <MonsterArmorClassPreview ctx={ctx} />,
        },
        {
          type: 'number',
          name: 'armorClass.naturalArmorBonus',
          label: getNaturalArmorBonusFieldLabel(),
          hint: NATURAL_ARMOR_BONUS_HINT,
          labelPosition: 'settings',
          control: 'stepper',
          min: 0,
          defaultValue: 0,
          digits: 2,
          separator: 'subtle',
        },
        {
          kind: 'group',
          legend: ARMOR_AND_SHIELD_LEGEND,
          fields: [
            {
              kind: 'columns',
              columns: [
                {
                  fields: [
                    {
                      kind: 'slot',
                      name: 'armorClass.bodyArmor',
                      heading: {
                        label: MONSTER_BODY_ARMOR_SLOT_HEADING,
                        action: <MonsterArmorSlotAction slot="body-armor" ctx={ctx} />,
                      },
                      render: () => <MonsterArmorSlotBody slot="body-armor" ctx={ctx} />,
                    },
                  ],
                },
                {
                  fields: [
                    {
                      kind: 'slot',
                      name: 'armorClass.shield',
                      heading: {
                        label: MONSTER_SHIELD_SLOT_HEADING,
                        action: <MonsterArmorSlotAction slot="shield" ctx={ctx} />,
                      },
                      render: () => <MonsterArmorSlotBody slot="shield" ctx={ctx} />,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          kind: 'group',
          heading: { label: MANUAL_AC_OVERRIDE_LABEL, hint: MANUAL_AC_OVERRIDE_HINT },
          headingScale: 'field',
          disclosure: {
            variant: 'legend',
            defaultOpen: false,
            persistOpen: false,
          },
          fields: [
            {
              kind: 'dependent',
              controller: {
                type: 'checkbox',
                name: 'armorClass.useFixedAc',
                label: USE_FIXED_ARMOR_CLASS_LABEL,
                defaultValue: false,
              },
              dependents: {
                visibility: {
                  dependsOn: ['armorClass.useFixedAc'],
                  visibleWhen: (watched) => watched['armorClass.useFixedAc'] === true,
                },
                fields: [
                  {
                    type: 'number',
                    name: 'armorClass.fixedValue',
                    label: FIXED_ARMOR_CLASS_LABEL,
                    labelPosition: 'settings',
                    control: 'stepper',
                    min: 0,
                    defaultValue: 10,
                    digits: 2,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ]
}
