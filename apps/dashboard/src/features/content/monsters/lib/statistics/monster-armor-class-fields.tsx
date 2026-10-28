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

const NATURAL_ARMOR_BONUS_HINT =
  'Increases natural protection. The higher of natural and equipped armor AC is used.'
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
          legend: getContentTypeTerm('equipment').label,
          fields: [
            {
              kind: 'slot',
              name: 'armorClass.bodyArmor',
              heading: {
                label: MONSTER_BODY_ARMOR_SLOT_HEADING,
                hint: MONSTER_BODY_ARMOR_SLOT_HINT,
                action: <MonsterArmorSlotAction slot="body-armor" ctx={ctx} />,
              },
              render: () => <MonsterArmorSlotBody slot="body-armor" ctx={ctx} />,
            },
            {
              kind: 'slot',
              name: 'armorClass.shield',
              heading: {
                label: MONSTER_SHIELD_SLOT_HEADING,
                hint: MONSTER_SHIELD_SLOT_HINT,
                action: <MonsterArmorSlotAction slot="shield" ctx={ctx} />,
              },
              render: () => <MonsterArmorSlotBody slot="shield" ctx={ctx} />,
            },
          ],
        },
        {
          kind: 'group',
          heading: { label: 'Advanced options' },
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
