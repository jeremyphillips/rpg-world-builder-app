export const CLASS_SPELLCASTING_RULES_LEADS = {
  cantrips: 'Cantrips',
  spellbook: 'Spellbook',
  spellSlots: 'Spell Slots',
  preparedSpells: 'Prepared Spells of Level 1+',
  changingPrepared: 'Changing Your Prepared Spells',
  spellcastingAbility: 'Spellcasting Ability',
  spellcastingFocus: 'Spellcasting Focus',
} as const

export function classSpellListReferenceSentence(className: string): string {
  return `See "Spells" for the rules on spellcasting. The information below details how you use those rules with ${className} spells, which appear on the ${className} spell list.`
}

export function alwaysPreparedSpellsRuleSentence(className: string): string {
  return `If another ${className} feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as ${className} spells for you.`
}
