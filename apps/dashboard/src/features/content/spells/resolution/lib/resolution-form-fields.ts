import { createElement } from 'react'
import type { FieldVisibility, FormItem, InlineSentenceFieldConfig } from '@rpg/ui/form'

import {
  feetInputUnitField,
  SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
} from '../../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
import { SpellResolutionEmptyState } from '../components/spell-resolution-empty-state.client'
import { SpellResolutionHybridNotice } from '../components/spell-resolution-hybrid-notice.client'
import { SpellResolutionMethodSelect } from '../components/spell-resolution-method-select.client'
import { SpellResolutionOutcomesPreview } from '../components/spell-resolution-outcomes-preview.client'
import { SpellResolutionPreview } from '../components/spell-resolution-preview.client'
import { buildResolutionEffectArrayAddMenu } from './resolution-effect-add-menu.lib'
import {
  formatResolutionEffectRowPrimary,
  formatResolutionEffectRowSummary,
} from './resolution-effect-display'
import { resolutionEffectItemFields } from './resolution-effect-form-fields'
import {
  RESOLUTION_FIELD_LABELS,
  RESOLUTION_SECTION_LABELS,
  resolutionProximityKindOptions,
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

function resolutionEffectsArrayField(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'array',
    name: `${RESOLUTION_PREFIX}.effects`,
    legend: RESOLUTION_SECTION_LABELS.effects,
    addLabel: 'Add effect',
    itemCollapsible: true,
    itemHeader: {
      fallback: (index) => `Effect ${index + 1}`,
      primary: (values, index) => formatResolutionEffectRowPrimary(values, index),
      summary: (values) => formatResolutionEffectRowSummary(values),
    },
    addMenu: buildResolutionEffectArrayAddMenu(),
    fields: resolutionEffectItemFields(ctx),
  }
}

function configuredResolutionFields(ctx: ContentFormCtx): FormItem[] {
  const configured = visibleWhenResolutionConfigured()

  return [
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
          type: 'select',
          name: `${RESOLUTION_PREFIX}.proximityKind`,
          label: RESOLUTION_FIELD_LABELS.proximityKind,
          options: resolutionProximityKindOptions,
          width: 'md',
          required: true,
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
          name: '_resolutionMethodSelect',
          render: () => createElement(SpellResolutionMethodSelect),
        },
      ],
    },
    {
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.effects,
      visibility: configured,
      fields: [resolutionEffectsArrayField(ctx)],
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
      kind: 'group',
      legend: RESOLUTION_SECTION_LABELS.resolution,
      fields: [
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
      ],
    },
  ]
}
