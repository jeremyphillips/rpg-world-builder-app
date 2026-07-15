import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/content-form-registry'
import { SpellResolutionEffectRemoveControl } from '../../components/effects/spell-resolution-effect-remove-control.client'
import { SpellResolutionEffectAddControl } from '../../components/effects/spell-resolution-effect-add-control.client'
import { SpellResolutionEffectsApplicationLabel } from '../../components/effects/spell-resolution-effects-application-label.client'
import { SpellResolutionHowItResolves } from '../../components/method/spell-resolution-how-it-resolves.client'
import { SpellResolutionProjectilesPreview } from '../../components/method/spell-resolution-how-it-resolves-projectiles.client'
import { SpellResolutionChangeNotice } from '../../components/notices/spell-resolution-change-notice.client'
import { SpellResolutionHybridNotice } from '../../components/notices/spell-resolution-hybrid-notice.client'
import { ResolutionChangeConfirmDialog } from '../../components/notices/resolution-change-confirm-dialog.client'
import { SpellResolutionOutcomes } from '../../components/outcomes/spell-resolution-outcomes.client'
import { SpellResolutionPreview } from '../../components/preview/spell-resolution-preview.client'
import { SpellResolutionProximitySelect } from '../../components/target/spell-resolution-proximity-select.client'
import { deriveDefaultEffectRecipient, type SpellResolutionTargetKind } from '@rpg/contracts'
import { formatEffectRowPrimary, formatEffectRowSummary } from '../../../lib/effects/effect-display'
import { resolutionEffectItemFields } from '../effects/resolution-effect-form-fields'
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
// Effect row summaries (e.g. "1d10 force") react to target/method changes above.

function resolutionEffectsArrayField(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'array',
    name: `${RESOLUTION_PREFIX}.effects`,
    legend: '',
    // Nested inside Effects & outcomes → Authored effects groups (depth ≥ 2). @rpg/ui
    // defaults nested arrays to compact unless itemVariant is explicit.
    itemVariant: 'detailed',
    hideAddAction: true, // Add menu is a sibling slot — options depend on live form state.
    hideItemRemove: true, // Remove is in the header slot so it can confirm / read context.
    itemRemoveSlot: {
      name: '_resolutionEffectHeaderRemove',
      render: () => createElement(SpellResolutionEffectRemoveControl),
    },
    itemCollapsible: true,
    itemHeader: {
      fallback: (index) => `Effect ${index + 1}`,
      primary: (values, index) => formatEffectRowPrimary(values, index),
      summaryDependsOn: [...RESOLUTION_SUMMARY_DEPENDS_ON],
      summary: (values, _index, watched) => {
        const context = resolutionSelectionContextFromWatched(watched ?? {})
        return formatEffectRowSummary(values, {
          recipient: deriveDefaultEffectRecipient(context),
          targetKind: context.targetKind as SpellResolutionTargetKind | undefined,
        })
      },
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
          // Live preview of authored projectile labels/count before save.
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

function resolutionOutcomeBranchesGroup(): FormItem {
  return {
    kind: 'group',
    legend: RESOLUTION_SECTION_LABELS.outcomeBranches,
    description: RESOLUTION_SECTION_LABELS.outcomesHint,
    fields: [
      {
        kind: 'slot',
        name: '_resolutionOutcomes',
        // Branches are method-derived (hit/miss/save); inner fields live in SpellResolutionOutcomes.
        render: () => createElement(SpellResolutionOutcomes),
      },
    ],
  }
}

function resolutionEffectsAndOutcomesGroup(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'group',
    legend: RESOLUTION_SECTION_LABELS.effectsAndOutcomes,
    description: RESOLUTION_SECTION_LABELS.effectsAndOutcomesHint,
    fieldsChrome: { variant: 'inset' },
    visibility: visibleWhenResolutionConfigured(),
    fields: [
      {
        kind: 'group',
        legend: RESOLUTION_SECTION_LABELS.authoredEffects,
        description: RESOLUTION_SECTION_LABELS.authoredEffectsDescription,
        fields: [
          {
            kind: 'stack',
            className: 'gap-3',
            fields: [
              {
                kind: 'slot',
                name: '_resolutionEffectsApplicationLabel',
                // Read-only label tying effects to the selected application pattern.
                render: () => createElement(SpellResolutionEffectsApplicationLabel),
              },
              resolutionEffectsArrayField(ctx),
              {
                kind: 'slot',
                name: '_resolutionEffectAddControl',
                render: () => createElement(SpellResolutionEffectAddControl),
              },
            ],
          },
        ],
      },
      resolutionOutcomeBranchesGroup(),
    ],
  }
}

/** Outcome branches subgroup for isolated stories/tests. */
export function resolutionOutcomeBranchesFields(): FormItem[] {
  return [resolutionOutcomeBranchesGroup()]
}

/** Slot-backed and grouped fields shown when resolution is configured. */
export function configuredResolutionFields(ctx: ContentFormCtx): FormItem[] {
  const configured = visibleWhenResolutionConfigured()

  return [
    // Dialogs/notices mount here so they share form context but stay out of the layout flow.
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
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.target,
      fieldsChrome: { variant: 'panel' },
      visibility: configured,
      fields: [
        {
          kind: 'slot',
          name: '_resolutionProximitySelect',
          // Proximity drives which target fields are shown; kept as a slot for that coupling.
          render: () => createElement(SpellResolutionProximitySelect),
        },
        ...resolutionTargetFormFields(),
      ],
    },
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.check,
      fieldsChrome: { variant: 'panel' },
      visibility: configured,
      fields: [
        {
          kind: 'slot',
          name: '_resolutionHowItResolves',
          // Attack vs save vs automatic — method fields are not a flat schema slice.
          render: () => createElement(SpellResolutionHowItResolves),
        },
      ],
    },
    ...resolutionProjectilesFields(), // Only visible when application pattern is projectiles.
    resolutionEffectsAndOutcomesGroup(ctx),
    {
      kind: 'slot',
      name: '_resolutionPreview',
      visibility: configured,
      render: () => createElement(SpellResolutionPreview),
    },
  ]
}
