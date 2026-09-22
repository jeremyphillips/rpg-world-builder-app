import type {
  Alignment,
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
  defaultAlignment?: Alignment
  defaultGender?: CharacterGender
  saveLabel: string
  savingLabel: string
  saveErrorDefault: string
}

export const CHARACTER_IMPORT_DEFAULT_ALIGNMENT: Alignment = 'n'
export const CHARACTER_IMPORT_DEFAULT_GENDER: CharacterGender = 'male'
