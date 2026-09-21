import type { ConfirmBeforeClearConfig } from '@rpg/ui/form'

/** Shared confirm copy when removing class spellcasting from the form. */
export const CLASS_SPELLCASTING_REMOVE_CONFIRM = {
  headline: 'Remove spellcasting?',
  description:
    "This will remove the Spellcasting feature and this class's spellcasting configuration, including spell progression, spell selection rules, recommendations, and related settings. This action will take effect when you save the class.",
  confirmLabel: 'Remove spellcasting',
  confirmVariant: 'destructive',
} as const satisfies ConfirmBeforeClearConfig
