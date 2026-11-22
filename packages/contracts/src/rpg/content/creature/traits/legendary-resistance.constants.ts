/** Canonical display name for the legendary-resistance template (not a VocabularyTerm). */
export const LEGENDARY_RESISTANCE_LABEL = 'Legendary Resistance' as const

/** Master-detail reset control when a stored name override must be removed. */
export const LEGENDARY_RESISTANCE_CLEAR_NAME_CONTROL_LABEL = 'Clear custom name' as const

export const LEGENDARY_RESISTANCE_NAME_OVERRIDE_MESSAGE =
  `${LEGENDARY_RESISTANCE_LABEL} does not take a custom name. Choose ${LEGENDARY_RESISTANCE_CLEAR_NAME_CONTROL_LABEL}.` as const
