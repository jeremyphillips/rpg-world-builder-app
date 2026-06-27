export type RulesConfigId = 'character-configuration'

export type RulesConfigEntry = {
  id: RulesConfigId
  label: string
  /** When false, hub card is omitted until the detail page is implemented. */
  enabled: boolean
}

/** In-page anchor sections for the character configuration form. */
export const CHARACTER_CONFIGURATION_SECTIONS = [
  { id: 'starting-level', label: 'Starting level' },
  { id: 'imported-characters', label: 'Imported characters' },
  { id: 'standard-max-level', label: 'Standard max level' },
  { id: 'creature-type-policy', label: 'Creature types' },
  { id: 'extended-progression', label: 'Extended progression' },
] as const

export type CharacterConfigurationSectionId =
  (typeof CHARACTER_CONFIGURATION_SECTIONS)[number]['id']

/** Rules configuration entries surfaced on the Homebrew hub. */
export const HOMEBREW_RULES_CONFIGS: readonly RulesConfigEntry[] = [
  { id: 'character-configuration', label: 'Character Configuration', enabled: true },
]

export function findRulesConfigEntry(configId: string): RulesConfigEntry | undefined {
  return HOMEBREW_RULES_CONFIGS.find((entry) => entry.id === configId)
}

export const ENABLED_HOMEBREW_RULES_CONFIGS = HOMEBREW_RULES_CONFIGS.filter(
  (entry) => entry.enabled,
)
