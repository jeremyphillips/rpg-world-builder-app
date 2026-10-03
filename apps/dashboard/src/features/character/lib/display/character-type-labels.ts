import {
  getCharacterTypeBulkActionDescriptor,
  getCharacterTypeCollectionLabel,
  getCharacterTypeLabel,
  type CharacterType,
} from '@rpg/contracts'

/** Plural title for sidebar, breadcrumbs, and overview headings. */
export function getCharacterTypeNavLabel(characterType: CharacterType): string {
  return getCharacterTypeCollectionLabel(characterType)
}

/** Singular title for create actions and entity references. */
export function getCharacterTypeItemLabel(characterType: CharacterType): string {
  return getCharacterTypeLabel(characterType)
}

export function formatCharacterTypeLoadErrorMessage(characterType: CharacterType): string {
  return `Could not load ${getCharacterTypeCollectionLabel(characterType)}.`
}

export function formatCharacterTypeImportActionLabel(characterType: CharacterType): string {
  return `Import ${getCharacterTypeLabel(characterType)}`
}

export function formatCharacterTypeCreatePrimaryLabel(characterType: CharacterType): string {
  return `Create ${getCharacterTypeLabel(characterType)}`
}

export function formatCharacterTypeSelectedCountPhrase(
  characterType: CharacterType,
  count: number,
): string {
  const { nounSingular, nounPlural } = getCharacterTypeBulkActionDescriptor(characterType)
  const noun = count === 1 ? nounSingular : nounPlural
  return `${count} selected ${noun}`
}
