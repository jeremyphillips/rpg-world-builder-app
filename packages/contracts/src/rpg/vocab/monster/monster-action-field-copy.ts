const MONSTER_REACTION_FIELD_LABELS = {
  trigger: 'Trigger',
} as const satisfies Record<string, string>

export type MonsterReactionFieldId = keyof typeof MONSTER_REACTION_FIELD_LABELS

/** Labels for monster action/reaction form fields that are not standalone game terms. */
export function getMonsterReactionFieldLabel(field: MonsterReactionFieldId): string {
  return MONSTER_REACTION_FIELD_LABELS[field]
}

/** Column/field label for monster action kind selection (not the kind value label). */
export function getMonsterActionKindFieldLabel(): string {
  return 'Kind'
}
