/** Closed catalog codes for unavailable facing reasons. */
export type FacingCatalogCode = 'equipment' | 'spells'

/** Attack preview configure hints — maps to label text in the dashboard adapter. */
export type FacingAttackInputField =
  | 'attack-bonus'
  | 'damage'
  | 'equipment'
  | 'challenge-rating'
  | 'mode'
  | 'ability-score'
  | 'details'

export type FacingReason =
  | { code: 'missing-rules-text' }
  | { code: 'missing-kind' }
  | { code: 'missing-attack-input'; field: FacingAttackInputField; label?: string }
  | { code: 'missing-multiattack-steps' }
  | { code: 'missing-spell-configuration' }
  | { code: 'missing-spell-reference' }
  | { code: 'missing-equipment-reference' }
  | { code: 'missing-action-reference' }
  | { code: 'incomplete-spellcasting' }
  | { code: 'spellcasting-progression-unavailable' }
  | { code: 'incomplete-trait' }
  | { code: 'catalog-pending'; catalog: FacingCatalogCode }
  | { code: 'catalog-error'; catalog: FacingCatalogCode }
  | { code: 'derived-conflict' }
  | { code: 'unsupported-kind' }
  | { code: 'unresolvable-record' }
  | { code: 'unexpected' }
