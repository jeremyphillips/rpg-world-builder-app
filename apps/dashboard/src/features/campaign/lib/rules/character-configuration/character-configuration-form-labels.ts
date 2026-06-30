import type { ImportedCharactersPolicy } from '@rpg/contracts'

export const IMPORTED_CHARACTERS_POLICY_LABELS: Record<ImportedCharactersPolicy, string> = {
  approval_required: 'Yes, with DM approval',
  disabled: 'No, players must roll new characters',
}
