import { getContentTypeTerm, getNaturalArmorBonusFieldLabel } from '@rpg/contracts'
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
  MONSTER_BODY_ARMOR_SLOT_HINT,
  MONSTER_SHIELD_SLOT_HEADING,
  MONSTER_SHIELD_SLOT_HINT,
} from '../monster-form-labels'

const NATURAL_ARMOR_LABEL = 'Natural armor'
const NATURAL_ARMOR_HINT =
  'Adds to unarmored Armor Class. Worn armor is used instead when it is higher.'
const FIXED_ARMOR_CLASS_LABEL = 'Fixed Armor Class'
const USE_FIXED_ARMOR_CLASS_LABEL = 'Use fixed Armor Class'
const USE_FIXED_ARMOR_CLASS_HINT =
  'Replaces the calculated result. The calculated total stays visible for reference.'

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
          kind: 'dependent',
          separator: 'subtle',
          controller: {
            type: 'checkbox',
            name: 'armorClass.naturalArmor',
            label: NATURAL_ARMOR_LABEL,
            hint: NATURAL_ARMOR_HINT,
            defaultValue: false,
          },
          dependents: {
            visibility: {
              dependsOn: ['armorClass.naturalArmor'],
              visibleWhen: (watched) => watched['armorClass.naturalArmor'] === true,
            },
            fields: [
              {
                type: 'number',
                name: 'armorClass.naturalArmorBonus',
                label: getNaturalArmorBonusFieldLabel(),
                labelPosition: 'settings',
                control: 'stepper',
                min: 1,
                defaultValue: 1,
                digits: 2,
              },
            ],
          },
        },
        {
          kind: 'group',
          legend: getContentTypeTerm('equipment').label,
          fields: [
            {
              kind: 'group',
              heading: {
                label: MONSTER_BODY_ARMOR_SLOT_HEADING,
                hint: MONSTER_BODY_ARMOR_SLOT_HINT,
                action: <MonsterArmorSlotAction slot="body-armor" ctx={ctx} />,
              },
              fields: [
                {
                  kind: 'slot',
                  name: 'armorClass.bodyArmor',
                  render: () => <MonsterArmorSlotBody slot="body-armor" ctx={ctx} />,
                },
              ],
            },
            {
              kind: 'group',
              heading: {
                label: MONSTER_SHIELD_SLOT_HEADING,
                hint: MONSTER_SHIELD_SLOT_HINT,
                action: <MonsterArmorSlotAction slot="shield" ctx={ctx} />,
              },
              fields: [
                {
                  kind: 'slot',
                  name: 'armorClass.shield',
                  render: () => <MonsterArmorSlotBody slot="shield" ctx={ctx} />,
                },
              ],
            },
          ],
        },
        {
          kind: 'group',
          heading: { label: 'Advanced options' },
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
                hint: USE_FIXED_ARMOR_CLASS_HINT,
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
