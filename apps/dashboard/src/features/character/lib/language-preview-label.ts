import { getLanguageLabel, type CharacterBuildCatalogIndex } from '@rpg/contracts'

export function resolveLanguagePreviewLabel(
  languageId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const language = catalogIndex.languages.find((entry) => entry.id === languageId)
  return language?.label ?? getLanguageLabel(languageId)
}
