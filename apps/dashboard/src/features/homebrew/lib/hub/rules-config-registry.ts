export type RulesConfigId = 'character-configuration' | 'mechanics'

export type RulesConfigEntry = {
  id: RulesConfigId
  label: string
  description: string
  /** When false, hub card is omitted until the detail page is implemented. */
  enabled: boolean
}

/** Rules configuration entries surfaced on the Homebrew hub. */
export const HOMEBREW_RULES_CONFIGS: readonly RulesConfigEntry[] = [
  {
    id: 'character-configuration',
    label: 'Character Configuration',
    description: 'Configure character creation rules',
    enabled: true,
  },
  {
    id: 'mechanics',
    label: 'Mechanics',
    description: 'Configure edition presets, armor class, and attack resolution',
    enabled: true,
  },
]

export function findRulesConfigEntry(configId: string): RulesConfigEntry | undefined {
  return HOMEBREW_RULES_CONFIGS.find((entry) => entry.id === configId)
}

export const ENABLED_HOMEBREW_RULES_CONFIGS = HOMEBREW_RULES_CONFIGS.filter(
  (entry) => entry.enabled,
)
