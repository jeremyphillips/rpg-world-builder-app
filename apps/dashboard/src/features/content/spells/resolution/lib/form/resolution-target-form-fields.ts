import type { FieldVisibility, FormItem, InlineSentenceFieldConfig } from '@rpg/ui/form'

import {
  feetInputUnitField,
  SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
} from '../../../../lib/forms/fields/content-identity-form-fields'
import { RESOLUTION_FIELD_LABELS, resolutionTargetKindOptions } from './resolution-form-labels'
import {
  combineFieldVisibility,
  visibleWhenResolutionConfigured,
} from './resolution-form-visibility'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

const RESOLUTION_PREFIX = RESOLUTION_FIELD_NAME

export function visibleWhenProximityKind(kind: 'touch' | 'reach' | 'distance'): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.proximityKind`],
    visibleWhen: (values) => values[`${RESOLUTION_PREFIX}.proximityKind`] === kind,
  }
}

export function visibleWhenResolutionTargetCountEditable(): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.targetCount`],
    visibleWhen: (values) => {
      const count = values[`${RESOLUTION_PREFIX}.targetCount`]
      return typeof count === 'number' && count !== 1
    },
  }
}

export function visibleWhenApplicationPatternKind(kind: 'projectiles'): FieldVisibility {
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

/** Target group scalar and inline-sentence fields (proximity select is a separate slot). */
export function resolutionTargetFormFields(): FormItem[] {
  const configured = visibleWhenResolutionConfigured()

  return [
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
      visibility: combineFieldVisibility(configured, visibleWhenResolutionTargetCountEditable()),
    },
  ]
}
