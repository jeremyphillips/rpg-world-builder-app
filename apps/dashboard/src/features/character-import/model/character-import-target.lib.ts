import type {
  CharacterAlignment,
  CharacterBuildCatalogIndex,
  CharacterGender,
  CharacterKind,
  SystemRulesetId,
} from '@rpg/contracts'

export type CharacterImportSaveTarget = {
  characterKind: CharacterKind
  rulesetId: SystemRulesetId
  catalogIndex: CharacterBuildCatalogIndex
  campaignId?: string
  defaultAlignment?: CharacterAlignment
  defaultGender?: CharacterGender
  saveLabel: string
  savingLabel: string
  saveErrorDefault: string
}

export const CHARACTER_IMPORT_DEFAULT_ALIGNMENT: CharacterAlignment = 'n'
export const CHARACTER_IMPORT_DEFAULT_GENDER: CharacterGender = 'male'
