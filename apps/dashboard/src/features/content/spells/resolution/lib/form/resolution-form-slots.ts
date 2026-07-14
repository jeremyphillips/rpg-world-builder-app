import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/content-form-registry'
import { SpellResolutionEffectAddControl } from '../../components/effects/spell-resolution-effect-add-control.client'
import { SpellResolutionEffectsApplicationLabel } from '../../components/effects/spell-resolution-effects-application-label.client'
import { SpellResolutionHowItResolves } from '../../components/method/spell-resolution-how-it-resolves.client'
import { SpellResolutionProjectilesPreview } from '../../components/method/spell-resolution-how-it-resolves-projectiles.client'
import { SpellResolutionChangeNotice } from '../../components/notices/spell-resolution-change-notice.client'
import { SpellResolutionHybridNotice } from '../../components/notices/spell-resolution-hybrid-notice.client'
import { ResolutionChangeConfirmDialog } from '../../components/notices/resolution-change-confirm-dialog.client'
import { SpellResolutionOutcomesPreview } from '../../components/preview/spell-resolution-outcomes-preview.client'
import { SpellResolutionPreview } from '../../components/preview/spell-resolution-preview.client'
import { SpellResolutionProximitySelect } from '../../components/target/spell-resolution-proximity-select.client'
import { formatEffectRowPrimary } from '../../../lib/effect-display'
import { resolutionEffectItemFields } from '../effects/resolution-effect-form-fields'
import { formatResolutionEffectRowSummary } from '../selection/resolution-selection-options.lib'
import { resolutionSelectionContextFromWatched } from '../selection/resolution-selection-context.lib'
import { RESOLUTION_FIELD_LABELS, RESOLUTION_SECTION_LABELS } from './resolution-form-labels'
import {
  combineFieldVisibility,
  visibleWhenResolutionConfigured,
} from './resolution-form-visibility'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'
import {
  resolutionTargetFormFields,
  visibleWhenApplicationPatternKind,
} from './resolution-target-form-fields'

const RESOLUTION_PREFIX = RESOLUTION_FIELD_NAME

const RESOLUTION_SUMMARY_DEPENDS_ON = [
  `${RESOLUTION_PREFIX}.proximityKind`,
  `${RESOLUTION_PREFIX}.targetKind`,
  `${RESOLUTION_PREFIX}.targetCount`,
  `${RESOLUTION_PREFIX}.methodKind`,
  `${RESOLUTION_PREFIX}.attackType`,
] as const

function resolutionEffectsArrayField(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'array',
    name: `${RESOLUTION_PREFIX}.effects`,
    legend: RESOLUTION_SECTION_LABELS.effects,
    addLabel: 'Add effect',
    hideAddControl: true,
    itemCollapsible: true,
    itemHeader: {
      fallback: (index) => `Effect ${index + 1}`,
      primary: (values, index) => formatEffectRowPrimary(values, index),
      summaryDependsOn: [...RESOLUTION_SUMMARY_DEPENDS_ON],
      summary: (values, _index, watched) =>
        formatResolutionEffectRowSummary(
          values,
          resolutionSelectionContextFromWatched(watched ?? {}),
        ),
    },
    fields: resolutionEffectItemFields(ctx),
  }
}

function resolutionProjectilesFields(): FormItem[] {
  const projectilesVisibility = combineFieldVisibility(
    visibleWhenResolutionConfigured(),
    visibleWhenApplicationPatternKind('projectiles'),
  )

  return [
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.projectiles,
      visibility: projectilesVisibility,
      fields: [
        {
          kind: 'slot',
          name: '_resolutionProjectilesPreview',
          render: () => createElement(SpellResolutionProjectilesPreview),
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: `${RESOLUTION_PREFIX}.projectileCount`,
              label: RESOLUTION_FIELD_LABELS.projectileCount,
              min: 1,
              digits: 2,
              width: 'auto',
              required: true,
            },
            {
              type: 'text',
              name: `${RESOLUTION_PREFIX}.projectileUnitLabelSingular`,
              label: RESOLUTION_FIELD_LABELS.projectileUnitLabelSingular,
              width: 'xl',
            },
            {
              type: 'text',
              name: `${RESOLUTION_PREFIX}.projectileUnitLabelPlural`,
              label: RESOLUTION_FIELD_LABELS.projectileUnitLabelPlural,
              width: 'xl',
            },
          ],
        },
      ],
    },
  ]
}

/** Slot-backed and grouped fields shown when resolution is configured. */
export function configuredResolutionFields(ctx: ContentFormCtx): FormItem[] {
  const configured = visibleWhenResolutionConfigured()

  return [
    {
      kind: 'slot',
      name: '_resolutionChangeConfirm',
      visibility: configured,
      render: () => createElement(ResolutionChangeConfirmDialog),
    },
    {
      kind: 'slot',
      name: '_resolutionChangeNotice',
      visibility: configured,
      render: () => createElement(SpellResolutionChangeNotice),
    },
    {
      kind: 'slot',
      name: '_resolutionHybridNotice',
      visibility: configured,
      render: () => createElement(SpellResolutionHybridNotice),
    },
    {
      kind: 'slot',
      name: '_resolutionPreview',
      visibility: configured,
      render: () => createElement(SpellResolutionPreview),
    },
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.target,
      visibility: configured,
      fields: [
        {
          kind: 'slot',
          name: '_resolutionProximitySelect',
          render: () => createElement(SpellResolutionProximitySelect),
        },
        ...resolutionTargetFormFields(),
      ],
    },
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.check,
      visibility: configured,
      fields: [
        {
          kind: 'slot',
          name: '_resolutionHowItResolves',
          render: () => createElement(SpellResolutionHowItResolves),
        },
      ],
    },
    ...resolutionProjectilesFields(),
    {
      kind: 'slot',
      name: '_resolutionEffectsApplicationLabel',
      visibility: configured,
      render: () => createElement(SpellResolutionEffectsApplicationLabel),
    },
    {
      kind: 'slot',
      name: '_resolutionEffectAddControl',
      visibility: configured,
      render: () => createElement(SpellResolutionEffectAddControl),
    },
    {
      ...resolutionEffectsArrayField(ctx),
      visibility: configured,
    },
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.outcomes,
      visibility: configured,
      fields: [
        {
          kind: 'slot',
          name: '_resolutionOutcomesPreview',
          render: () => createElement(SpellResolutionOutcomesPreview),
        },
      ],
    },
  ]
}
