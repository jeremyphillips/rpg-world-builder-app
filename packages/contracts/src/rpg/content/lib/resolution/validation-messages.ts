import { defineMessage } from '../../../../validation/define-message'

// ---------------------------------------------------------------------------
// Spell resolution validation messages (tier 2).
// ---------------------------------------------------------------------------

export const spellResolutionValidationMessages = {
  duplicateEffectId: defineMessage(
    'validation.spellResolution.duplicateEffectId',
    () => 'Each resolution effect must have a unique id.',
  ),
  duplicateOutcomeResult: defineMessage(
    'validation.spellResolution.duplicateOutcomeResult',
    () => 'Each outcome must have a unique result.',
  ),
  unknownEffectReference: defineMessage<{ effectId: string }>(
    'validation.spellResolution.unknownEffectReference',
    ({ effectId }) => `Outcome references unknown effect "${effectId}".`,
  ),
  outcomeResultNotAllowedForMethod: defineMessage<{ result: string }>(
    'validation.spellResolution.outcomeResultNotAllowedForMethod',
    ({ result }) => `Outcome result "${result}" is not allowed for this resolution method.`,
  ),
  outcomeRequiresApplicationOrNote: defineMessage(
    'validation.spellResolution.outcomeRequiresApplicationOrNote',
    () => 'Add an effect application or describe the outcome.',
  ),
  resolutionRequiresMeaningfulOutcome: defineMessage(
    'validation.spellResolution.resolutionRequiresMeaningfulOutcome',
    () => 'Add at least one outcome with an effect application or additional behavior.',
  ),
  duplicateOutcomeApplicationEffectId: defineMessage(
    'validation.spellResolution.duplicateOutcomeApplicationEffectId',
    () => 'Each effect can only be applied once per outcome.',
  ),
  halfNotSupportedForEffectKind: defineMessage<{ kind: string }>(
    'validation.spellResolution.halfNotSupportedForEffectKind',
    ({ kind }) => `Half application is not supported for "${kind}" effects in this version.`,
  ),
  effectKindIncompatibleWithTarget: defineMessage<{ kind: string; targetKind: string }>(
    'validation.spellResolution.effectKindIncompatibleWithTarget',
    ({ kind, targetKind }) =>
      `"${kind}" effects cannot target ${targetKind === 'object' ? 'objects' : 'creatures or objects'}.`,
  ),
  targetRequiredForTargetsMode: defineMessage(
    'validation.spellResolution.targetRequiredForTargetsMode',
    () => 'Add a target when selection mode is Targets.',
  ),
  originRequiredForPointMode: defineMessage(
    'validation.spellResolution.originRequiredForPointMode',
    () => 'Add an origin distance when selection mode is Point.',
  ),
  targetForbiddenForMode: defineMessage<{ mode: string }>(
    'validation.spellResolution.targetForbiddenForMode',
    ({ mode }) => `Target is not allowed when selection mode is "${mode}".`,
  ),
  originForbiddenForMode: defineMessage<{ mode: string }>(
    'validation.spellResolution.originForbiddenForMode',
    ({ mode }) => `Origin is not allowed when selection mode is "${mode}".`,
  ),
  areaForbiddenForMode: defineMessage<{ mode: string }>(
    'validation.spellResolution.areaForbiddenForMode',
    ({ mode }) => `Area of effect is not allowed when selection mode is "${mode}".`,
  ),
  occupantRequirementsRequireArea: defineMessage(
    'validation.spellResolution.occupantRequirementsRequireArea',
    () => 'Area occupant requirements are only allowed when an area of effect is present.',
  ),
  outcomeDamageForbiddenWithEnvelopeApplication: defineMessage(
    'validation.spellResolution.outcomeDamageForbiddenWithEnvelopeApplication',
    () =>
      'Remove outcome damage rows when this branch already applies envelope damage via applications.',
  ),
  failedOrSuccessfulSaveApplicationsForbidden: defineMessage(
    'validation.spellResolution.failedOrSuccessfulSaveApplicationsForbidden',
    () => 'Failure or Success outcomes cannot reference envelope effect applications.',
  ),
  repeatSaveOnlyOnFailedSave: defineMessage(
    'validation.spellResolution.repeatSaveOnlyOnFailedSave',
    () => 'Repeat save is only allowed on a failed save outcome.',
  ),
  repeatSaveRequiresSecondFailure: defineMessage(
    'validation.spellResolution.repeatSaveRequiresSecondFailure',
    () => 'Add a second failure effect or note when repeat save is authored.',
  ),
  invalidConditionReplacementReference: defineMessage<{ conditionId: string }>(
    'validation.spellResolution.invalidConditionReplacementReference',
    ({ conditionId }) =>
      `Condition replacement must reference an earlier condition on the first failure ("${conditionId}" was not found).`,
  ),
  methodIncompatibleWithSelectionMode: defineMessage<{
    compatibility: 'deferred' | 'unsupported'
    reasonCode: string
    methodKind: string
    selectionContext: string
  }>(
    'validation.spellResolution.methodIncompatibleWithSelectionMode',
    ({ compatibility, methodKind, selectionContext }) => {
      const modeLabel =
        selectionContext === 'self-with-area'
          ? 'Self (with area)'
          : selectionContext === 'self-without-area'
            ? 'Self'
            : selectionContext
      if (compatibility === 'deferred') {
        return `Resolution method "${methodKind}" is not yet supported for selection mode "${modeLabel}".`
      }
      return `Resolution method "${methodKind}" is not compatible with selection mode "${modeLabel}".`
    },
  ),
}
