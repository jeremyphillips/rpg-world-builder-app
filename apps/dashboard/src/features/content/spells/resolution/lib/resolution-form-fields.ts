import { createElement } from 'react'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import { damageTypeField } from '../../../lib/forms/mechanics/damage-type-field'
import { rollValueFieldConfigs } from '../../../lib/forms/mechanics/roll-value-fields'
import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
import { SpellResolutionEmptyState } from '../components/spell-resolution-empty-state.client'
import { SpellResolutionMethodSelect } from '../components/spell-resolution-method-select.client'
import { SpellResolutionOutcomes } from '../components/spell-resolution-outcomes.client'
import { SpellResolutionPreview } from '../components/spell-resolution-preview.client'
import { SpellResolutionRemoveButton } from '../components/spell-resolution-remove.client'
import { SpellResolutionTargetCount } from '../components/spell-resolution-target-count.client'
import {
  RESOLUTION_FIELD_LABELS,
  RESOLUTION_SECTION_LABELS,
  resolutionRangeKindOptions,
  resolutionSaveAbilityOptions,
  resolutionTargetKindOptions,
} from './resolution-form-labels'

const RESOLUTION_PREFIX = 'resolution'

function visibleWhenResolutionConfigured(): FieldVisibility {
  return {
    dependsOn: [RESOLUTION_PREFIX],
    visibleWhen: (values) => values[RESOLUTION_PREFIX] != null,
  }
}

function visibleWhenNoResolution(): FieldVisibility {
  return {
    dependsOn: [RESOLUTION_PREFIX],
    visibleWhen: (values) => values[RESOLUTION_PREFIX] == null,
  }
}

function visibleWhenResolutionSavingThrow(): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.methodKind`],
    visibleWhen: (values) => values[`${RESOLUTION_PREFIX}.methodKind`] === 'saving-throw',
  }
}

function visibleWhenResolutionRangeDistance(): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.rangeKind`],
    visibleWhen: (values) => values[`${RESOLUTION_PREFIX}.rangeKind`] === 'distance',
  }
}

function visibleWhenResolutionRangeReach(): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.rangeKind`],
    visibleWhen: (values) => values[`${RESOLUTION_PREFIX}.rangeKind`] === 'reach',
  }
}

function withVisibility(fields: FormItem[], visibility: FieldVisibility): FormItem[] {
  return fields.map((field) => ({ ...field, visibility }))
}

/** Resolution tab fields for the spell authoring form. */
export function resolutionFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'slot',
      name: '_resolutionPersistenceNotice',
      render: () =>
        createElement(
          'p',
          { className: 'text-sm text-muted-foreground', role: 'status' },
          RESOLUTION_SECTION_LABELS.notSavedBanner,
        ),
    },
    {
      kind: 'slot',
      name: '_resolutionEmptyState',
      visibility: visibleWhenNoResolution(),
      render: () => createElement(SpellResolutionEmptyState),
    },
    {
      kind: 'slot',
      name: '_resolutionPreview',
      label: RESOLUTION_SECTION_LABELS.preview,
      visibility: visibleWhenResolutionConfigured(),
      render: () => createElement(SpellResolutionPreview),
    },
    {
      kind: 'slot',
      name: '_resolutionRemove',
      visibility: visibleWhenResolutionConfigured(),
      render: () => createElement(SpellResolutionRemoveButton),
    },
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.target,
      visibility: visibleWhenResolutionConfigured(),
      fields: [
        {
          kind: 'slot',
          name: '_resolutionTargetCount',
          render: () => createElement(SpellResolutionTargetCount),
        },
        {
          type: 'select',
          name: `${RESOLUTION_PREFIX}.targetKind`,
          label: RESOLUTION_FIELD_LABELS.targetKind,
          options: resolutionTargetKindOptions,
          width: 'lg',
          required: true,
        },
        {
          type: 'number',
          name: `${RESOLUTION_PREFIX}.targetCount`,
          label: RESOLUTION_FIELD_LABELS.targetCount,
          min: 1,
          digits: 2,
          width: 'auto',
          required: true,
          visibility: {
            dependsOn: [`${RESOLUTION_PREFIX}.targetCount`],
            visibleWhen: (values) => {
              const count = values[`${RESOLUTION_PREFIX}.targetCount`]
              return typeof count === 'number' && count !== 1
            },
          },
        },
      ],
    },
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.resolution,
      visibility: visibleWhenResolutionConfigured(),
      fields: [
        {
          kind: 'slot',
          name: '_resolutionMethodSelect',
          render: () => createElement(SpellResolutionMethodSelect),
        },
        ...withVisibility(
          [
            {
              type: 'select',
              name: `${RESOLUTION_PREFIX}.saveAbility`,
              label: RESOLUTION_FIELD_LABELS.saveAbility,
              options: resolutionSaveAbilityOptions,
              width: 'md',
              required: true,
            },
          ],
          visibleWhenResolutionSavingThrow(),
        ),
        {
          type: 'select',
          name: `${RESOLUTION_PREFIX}.rangeKind`,
          label: RESOLUTION_FIELD_LABELS.rangeKind,
          options: resolutionRangeKindOptions,
          width: 'md',
          required: true,
        },
        ...withVisibility(
          [
            {
              type: 'number',
              name: `${RESOLUTION_PREFIX}.rangeDistanceFt`,
              label: RESOLUTION_FIELD_LABELS.rangeDistanceFt,
              min: 0,
              digits: 3,
              width: 'auto',
              required: true,
            },
          ],
          visibleWhenResolutionRangeDistance(),
        ),
        ...withVisibility(
          [
            {
              type: 'number',
              name: `${RESOLUTION_PREFIX}.reachDistanceFt`,
              label: RESOLUTION_FIELD_LABELS.reachDistanceFt,
              min: 0,
              digits: 3,
              width: 'auto',
              hint: 'Optional explicit reach distance in feet.',
            },
          ],
          visibleWhenResolutionRangeReach(),
        ),
      ],
    },
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.damage,
      visibility: visibleWhenResolutionConfigured(),
      fields: [
        {
          kind: 'row',
          fields: [
            damageTypeField({
              name: `${RESOLUTION_PREFIX}.damageType`,
              ctx,
              required: true,
            }),
            ...rollValueFieldConfigs({
              namePrefix: `${RESOLUTION_PREFIX}.damageRoll`,
              label: RESOLUTION_FIELD_LABELS.damageRoll,
              required: true,
            }),
          ],
        },
      ],
    },
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.outcomes,
      visibility: visibleWhenResolutionConfigured(),
      fields: [
        {
          kind: 'slot',
          name: '_resolutionOutcomes',
          render: () => createElement(SpellResolutionOutcomes),
        },
      ],
    },
  ]
}
