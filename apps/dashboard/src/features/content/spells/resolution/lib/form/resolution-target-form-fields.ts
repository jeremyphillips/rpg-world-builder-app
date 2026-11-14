import { MEASURED_RANGE_FEET } from '@rpg/contracts'
import type { FormItem, InlineSentenceFieldConfig } from '@rpg/ui/form'

import { distanceJoinedPairField } from '../../../../lib/forms/fields/content-distance-form-fields'
import {
  RESOLUTION_FIELD_LABELS,
  resolutionCountKindOptions,
  resolutionTargetKindOptions,
} from './resolution-form-labels'
import {
  combineFieldVisibility,
  visibleWhenCountKindEditable,
  visibleWhenProximityKind,
  visibleWhenSelectionMode,
} from './resolution-form-visibility'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

const RESOLUTION_PREFIX = RESOLUTION_FIELD_NAME

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
    name: '_resolutionTargetTouchInline',
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
    name: '_resolutionTargetReachInline',
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
    name: '_resolutionTargetDistanceInline',
    label: RESOLUTION_FIELD_LABELS.target,
    visibility: visibleWhenProximityKind('distance'),
    segments: [
      { kind: 'text', value: 'One', tone: 'label' },
      targetKindSegment(),
      { kind: 'text', value: 'within', tone: 'label' },
      {
        kind: 'joinedPair',
        ariaLabel: RESOLUTION_FIELD_LABELS.proximityDistance,
        start: {
          kind: 'select',
          name: `${RESOLUTION_PREFIX}.proximityDistanceFt`,
          options: MEASURED_RANGE_FEET.map((feet) => ({ value: feet, label: String(feet) })),
          digits: 3,
          allowCustom: true,
          ariaLabel: RESOLUTION_FIELD_LABELS.proximityDistance,
        },
        end: {
          kind: 'label',
          text: 'ft.',
          ariaLabel: 'Distance unit',
        },
      },
    ],
  }
}

/** Target group scalar and inline-sentence fields (proximity select is a separate slot). */
export function resolutionTargetFormFields(): FormItem[] {
  const targetsMode = visibleWhenSelectionMode('targets')

  return [
    resolutionTouchTargetField(),
    resolutionReachTargetField(),
    resolutionDistanceTargetField(),
    distanceJoinedPairField({
      amountName: `${RESOLUTION_PREFIX}.proximityReachDistanceFt`,
      label: RESOLUTION_FIELD_LABELS.proximityReachDistance,
      presets: MEASURED_RANGE_FEET,
      allowCustom: true,
      clearable: true,
      visibility: visibleWhenProximityKind('reach'),
      hint: 'Optional explicit reach distance in feet. Omit to use the caster’s default reach.',
    }),
    {
      type: 'number',
      name: `${RESOLUTION_PREFIX}.targetCount`,
      label: RESOLUTION_FIELD_LABELS.targetCount,
      min: 1,
      digits: 2,
      width: 'auto',
      required: true,
      visibility: combineFieldVisibility(targetsMode, visibleWhenCountKindEditable()),
    },
    {
      type: 'select',
      name: `${RESOLUTION_PREFIX}.countKind`,
      label: RESOLUTION_FIELD_LABELS.countKind,
      options: resolutionCountKindOptions,
      width: 'md',
      visibility: combineFieldVisibility(targetsMode, visibleWhenCountKindEditable()),
    },
    distanceJoinedPairField({
      amountName: `${RESOLUTION_PREFIX}.originDistanceFt`,
      label: RESOLUTION_FIELD_LABELS.originDistance,
      presets: MEASURED_RANGE_FEET,
      allowCustom: true,
      required: true,
      visibility: visibleWhenSelectionMode('point'),
      hint: 'Distance within which the caster selects the origin point.',
    }),
  ]
}

/** Re-export for resolution-form-slots proximity / application pattern visibility. */
export { visibleWhenApplicationPatternKind } from './resolution-form-visibility'
