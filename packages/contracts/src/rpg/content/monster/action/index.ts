export {
  monsterActionSchema,
  monsterActionDraftSchema,
  type MonsterAction,
  type MonsterActionDraft,
  type MonsterActionDraftInput,
} from './actions-schema'
export {
  monsterBonusActionSchema,
  monsterBonusActionDraftSchema,
  bonusTeleportPassengerSchema,
  type MonsterBonusAction,
  type MonsterBonusActionDraft,
  type MonsterBonusActionDraftInput,
  type BonusTeleportPassenger,
} from './bonus-schema'
export {
  monsterLegendaryActionSchema,
  monsterLegendaryActionDraftSchema,
  monsterLegendaryActionsBlockSchema,
  monsterLegendaryActionsBlockDraftSchema,
  type MonsterLegendaryAction,
  type MonsterLegendaryActionDraft,
  type MonsterLegendaryActionDraftInput,
  type MonsterLegendaryActionsBlock,
  type MonsterLegendaryActionsBlockDraft,
} from './legendary-schema'
export {
  monsterReactionSchema,
  monsterReactionDraftSchema,
  type MonsterReaction,
  type MonsterReactionDraft,
  type MonsterReactionDraftInput,
} from './reaction-schema'
export {
  PARRY_AC_BONUS_MIN,
  PARRY_AC_BONUS_MAX,
  PARRY_AC_BONUS_DEFAULT,
  NATURAL_WEAPON_PROPERTIES,
} from './shared-fragments'
export { refineMonsterSpellEntries } from './spell-refinements'
export { RULES_OR_SAVING_THROW_MESSAGE, monsterRichTextIsEmpty } from './save-refinements'
export { refineMonsterActionShape } from './shape-refinements'
export {
  acquisitionStateForItem,
  collectRepeatabilityViolations,
  type RepeatabilityViolation,
  MONSTER_SINGLETON_KINDS,
  MONSTER_SINGLETON_PRESET_IDS,
  type AcquisitionItemState,
  type MonsterActionRowLike,
  type MonsterActionSectionRows,
} from './monster-action-repeatability'
export {
  ACTION_REFERENCE_CHOOSE_FROM_ACTIONS,
  ACTION_REFERENCE_DUPLICATE_MESSAGE,
  CHOOSE_ATTACK_FROM_ACTIONS,
  LEGENDARY_REFERENCE_ATTACK_CHOICE_MESSAGE,
  MULTIATTACK_REFERENCE_DUPLICATE_MESSAGE,
  MULTIATTACK_REFERENCE_INVALID_KIND_MESSAGE,
  MULTIATTACK_REFERENCE_MISSING_MESSAGE,
  MULTIATTACK_REFERENCE_SELF_MESSAGE,
  MULTIATTACK_SECTION_MESSAGE,
  actionReferenceInvalidKindMessage,
} from './reference-messages'
export {
  multiattackEligibilityKinds,
  multiattackRowEligibleForPurpose,
  type MultiattackEligibilityPurpose,
} from './multiattack-eligibility'
export { multiattackValidationMessages } from './multiattack-validation-messages'
export {
  isMultiattackAttackGroup,
  isMultiattackUseClause,
  multiattackPositiveInt,
  type MultiattackAlternative,
  type MultiattackAttackGroup,
  type MultiattackDraftStep,
  type MultiattackPublishedStep,
  type MultiattackReplacement,
  type MultiattackUseChoice,
  type MultiattackUseSingle,
} from './multiattack-schemas'
export { actionsReferencingAction, stripReferencedActionId } from './action-references'
export type { ReferencedActionRow } from './action-references'
export { planMonsterActionRemoval, shapeShiftRows } from './action-removal-plan'
export type { MonsterActionPlanBody, MonsterActionRemovalPlan } from './action-removal-plan'
export {
  MONSTER_CONSTRICT_PRESET_DUPLICATE_MESSAGE,
  MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE,
  MONSTER_WEAPON_EQUIPMENT_DUPLICATE_MESSAGE,
  monsterSingletonKindMessage,
} from './repeatability-messages'
