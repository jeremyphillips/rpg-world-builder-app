import type { CharacterKind } from '../../character-acquisition/kind'

/** Confirm copy shown when a valid build still has advisories at create time. */
export type CharacterBuildCreateWithWarningsMessages = {
  headline: string
  description: string
  cancelLabel: string
  confirmLabel: string
}

const CONFIRM_LABELS = {
  pc: 'Create character anyway',
  npc: 'Create NPC anyway',
} as const satisfies Record<CharacterKind, string>

export function getCharacterBuildCreateWithWarningsMessages(
  characterKind: CharacterKind,
): CharacterBuildCreateWithWarningsMessages {
  return {
    headline: 'Create with warnings?',
    description: 'This build has warnings you may want to review before creating it.',
    cancelLabel: 'Go back',
    confirmLabel: CONFIRM_LABELS[characterKind],
  }
}
