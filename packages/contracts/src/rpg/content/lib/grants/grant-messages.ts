import { defineMessage } from '../../../../validation/define-message'

// ---------------------------------------------------------------------------
// Grant validation messages (tier 2). Shared by grants.ts, equipment-grant.ts,
// and proficiency-grant.ts — tests assert through these definitions.
// ---------------------------------------------------------------------------

export const grantValidationMessages = {
  spellsGrantRequiresAvailabilityOrCasting: defineMessage(
    'validation.grant.spellsGrantRequiresAvailabilityOrCasting',
    () => 'Spell grants require availability, casting, or both.',
  ),
  spellsGrantSlotCastingRequiresAvailability: defineMessage(
    'validation.grant.spellsGrantSlotCastingRequiresAvailability',
    () => 'Slot casting via a free-cast grant requires an availability entitlement.',
  ),
  languageChoicePoolRequired: defineMessage(
    'validation.grant.languageChoicePoolRequired',
    () => 'Choose specific languages or language categories for this grant.',
  ),
  allowAnyQualifyingCategoryOnly: defineMessage(
    'validation.grant.allowAnyQualifyingCategoryOnly',
    () => 'Allow any qualifying feat only applies to Epic Boon and General categories.',
  ),
  atMostOneDefaultGrantGroup: defineMessage(
    'validation.grant.atMostOneDefaultGrantGroup',
    () => 'Only one default grant group (without an unlock level) is allowed.',
  ),
  defaultGrantGroupMustBeFirst: defineMessage(
    'validation.grant.defaultGrantGroupMustBeFirst',
    () => 'The default grant group must be listed first.',
  ),
  grantGroupUnlockLevelsUnique: defineMessage(
    'validation.grant.grantGroupUnlockLevelsUnique',
    () => 'Each grant group unlock level must be unique.',
  ),
  grantGroupsSortedByUnlock: defineMessage(
    'validation.grant.grantGroupsSortedByUnlock',
    () => 'Grant groups must be sorted by unlock level, lowest first.',
  ),
  grantTraitSingleAtomicGrant: defineMessage(
    'validation.grant.grantTraitSingleAtomicGrant',
    () =>
      'Grant traits must include exactly one atomic grant (one sense, resistance, movement bonus, or language).',
  ),
  categoryFilterNotAllowedForKind: defineMessage<{
    filterLabel: string
    equipmentKindLabel: string
  }>(
    'validation.grant.categoryFilterNotAllowedForKind',
    ({ filterLabel, equipmentKindLabel }) =>
      `${filterLabel} filters are not allowed for ${equipmentKindLabel}.`,
  ),
  categoryFilterWrongKind: defineMessage<{ filterLabel: string; equipmentKindLabel: string }>(
    'validation.grant.categoryFilterWrongKind',
    ({ filterLabel, equipmentKindLabel }) =>
      `${filterLabel} filters only apply to ${equipmentKindLabel} equipment.`,
  ),
  fixedProficiencyRequiresTarget: defineMessage(
    'validation.grant.fixedProficiencyRequiresTarget',
    () => 'Add at least one specific item or category.',
  ),
  filteredToolPoolRequiresTarget: defineMessage(
    'validation.grant.filteredToolPoolRequiresTarget',
    () => 'Filtered tool pools require at least one category or specific tool.',
  ),
}
