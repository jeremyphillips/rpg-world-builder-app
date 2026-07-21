import type {
  Alignment,
  CharacterBuildCatalogIndex,
  CharacterKind,
  SystemRulesetId,
} from '@rpg/contracts'

export type CharacterImportSaveTarget = {
  characterKind: CharacterKind
  rulesetId: SystemRulesetId
  catalogIndex: CharacterBuildCatalogIndex
  campaignId?: string
  defaultAlignment?: Alignment
  saveLabel: string
  savingLabel: string
  saveErrorDefault: string
}

export const CHARACTER_IMPORT_DEFAULT_ALIGNMENT: Alignment = 'n'
