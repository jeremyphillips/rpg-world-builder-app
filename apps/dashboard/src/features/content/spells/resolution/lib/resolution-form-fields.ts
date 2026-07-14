import { createElement } from 'react'
import type { FieldVisibility, FormItem, InlineSentenceFieldConfig } from '@rpg/ui/form'

import {
  feetInputUnitField,
  SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
} from '../../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
import { SpellResolutionEmptyState } from '../components/spell-resolution-empty-state.client'
import { SpellResolutionEffectsApplicationLabel } from '../components/spell-resolution-effects-application-label.client'
import { SpellResolutionHybridNotice } from '../components/spell-resolution-hybrid-notice.client'
import {
  SpellResolutionHowItResolves,
  SpellResolutionProjectilesPreview,
} from '../components/spell-resolution-how-it-resolves.client'
import { SpellResolutionOutcomesPreview } from '../components/spell-resolution-outcomes-preview.client'
import { SpellResolutionPreview } from '../components/spell-resolution-preview.client'
import { ResolutionEffectAddControl } from '../components/resolution-effect-add-control.client'
import { SpellResolutionChangeNotice } from '../components/spell-resolution-change-notice.client'
import { SpellResolutionProximitySelect } from '../components/spell-resolution-proximity-select.client'
import { ResolutionChangeConfirmDialog } from '../lib/use-resolution-change-confirm.client'
import { formatResolutionEffectRowPrimary } from './resolution-effect-display'
import {
  formatResolutionEffectRowSummary,
  resolutionSelectionContextFromWatched,
} from './resolution-selection-context.lib'
import { resolutionEffectItemFields } from './resolution-effect-form-fields'
import {
  RESOLUTION_FIELD_LABELS,
  RESOLUTION_SECTION_LABELS,
  resolutionTargetKindOptions,
} from './resolution-form-labels'
import {
  combineFieldVisibility,
  visibleWhenNoResolution,
  visibleWhenResolutionConfigured,
} from './resolution-form-visibility'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

const RESOLUTION_PREFIX = RESOLUTION_FIELD_NAME

function visibleWhenProximityKind(kind: 'touch' | 'reach' | 'distance'): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.proximityKind`],
    visibleWhen: (values) => values[`${RESOLUTION_PREFIX}.proximityKind`] === kind,
  }
}

function visibleWhenResolutionTargetCountEditable(): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.targetCount`],
    visibleWhen: (values) => {
      const count = values[`${RESOLUTION_PREFIX}.targetCount`]
      return typeof count === 'number' && count !== 1
    },
  }
}

function visibleWhenApplicationPatternKind(kind: 'projectiles'): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.applicationPatternKind`],
    visibleWhen: (values) => values[`${RESOLUTION_PREFIX}.applicationPatternKind`] === kind,
  }
}

function targetKindSegment() {
  return {
    kind: 'select' as const,
    name: `${RESOLUTION_PREFIX}.targetKind`,
    options: resolutionTargetKindOptions,
    ariaLabel: RESOLUTION_FIELD_LABELS.targetKind,
    width: 'lg' as const,
  }
}

/** One [creature] you touch */
function resolutionTouchTargetField(): InlineSentenceFieldConfig {
  return {
    type: 'inlineSentence',
    name: `${RESOLUTION_PREFIX}.targetKind`,
    label: RESOLUTION_FIELD_LABELS.target,
    visibility: visibleWhenProximityKind('touch'),
    segments: [
      { kind: 'text', value: 'One', tone: 'label' },
      targetKindSegment(),
      { kind: 'text', value: 'you touch', tone: 'label' },
    ],
  }
}

/** One [creature] within your reach */
function resolutionReachTargetField(): InlineSentenceFieldConfig {
  return {
    type: 'inlineSentence',
    name: `${RESOLUTION_PREFIX}.targetKind`,
    label: RESOLUTION_FIELD_LABELS.target,
    visibility: visibleWhenProximityKind('reach'),
    segments: [
      { kind: 'text', value: 'One', tone: 'label' },
      targetKindSegment(),
      { kind: 'text', value: 'within your reach', tone: 'label' },
    ],
  }
}

/** One [creature] within [60] feet */
function resolutionDistanceTargetField(): InlineSentenceFieldConfig {
  return {
    type: 'inlineSentence',
    name: `${RESOLUTION_PREFIX}.targetKind`,
    label: RESOLUTION_FIELD_LABELS.target,
    visibility: visibleWhenProximityKind('distance'),
    segments: [
      { kind: 'text', value: 'One', tone: 'label' },
      targetKindSegment(),
      { kind: 'text', value: 'within', tone: 'label' },
      {
        kind: 'number',
        name: `${RESOLUTION_PREFIX}.proximityDistanceFt`,
        min: 0,
        digits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
        ariaLabel: RESOLUTION_FIELD_LABELS.proximityDistance,
      },
      { kind: 'text', value: 'feet', tone: 'label' },
    ],
  }
}

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
      primary: (values, index) => formatResolutionEffectRowPrimary(values, index),
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

function configuredResolutionFields(ctx: ContentFormCtx): FormItem[] {
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
        resolutionTouchTargetField(),
        resolutionReachTargetField(),
        resolutionDistanceTargetField(),
        feetInputUnitField(
          `${RESOLUTION_PREFIX}.proximityReachDistanceFt`,
          RESOLUTION_FIELD_LABELS.proximityReachDistance,
          {
            valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
            width: 'auto',
            visibility: visibleWhenProximityKind('reach'),
            hint: 'Optional explicit reach distance in feet. Omit to use the caster’s default reach.',
          },
        ),
        {
          type: 'number',
          name: `${RESOLUTION_PREFIX}.targetCount`,
          label: RESOLUTION_FIELD_LABELS.targetCount,
          min: 1,
          digits: 2,
          width: 'auto',
          required: true,
          visibility: combineFieldVisibility(
            configured,
            visibleWhenResolutionTargetCountEditable(),
          ),
        },
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
      render: () => createElement(ResolutionEffectAddControl),
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
    ...configuredResolutionFields(ctx),
  ]
}
