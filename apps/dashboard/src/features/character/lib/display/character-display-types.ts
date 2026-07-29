import type { Ability, CharacterNarrative, CharacterVitalState } from '@rpg/contracts'

import type {
  CharacterSheetEquipmentCard,
  CharacterSheetSpellCard,
} from '../detail/character-sheet-catalog'

export type CharacterCardViewModel = {
  id: string
  name: string
  summary: string
  campaign?: {
    id: string
    name: string
  }
}

export type CharacterDetailStatTileFooterKind = 'meta' | 'label'

export type CharacterDetailStatTileFooter = {
  kind: CharacterDetailStatTileFooterKind
  text: string
}

export type CharacterDetailStatTileId = 'ac' | 'initiative' | 'speed' | 'proficiencyBonus'

export type CharacterDetailStatTile = {
  id: CharacterDetailStatTileId
  label: string
  value: string
  footer?: CharacterDetailStatTileFooter
}

export type CharacterAbilityTile = {
  id: Ability
  label: string
  score: string
  modifier: string
}

export type CharacterHitPointsViewModel = {
  current: string
  max: string
  temporary: string
}

export type CharacterWealthViewModel = {
  label: string
  value: string
}

export type CharacterProficiencyGroupId = 'skills' | 'languages' | 'weapons' | 'tools' | 'armor'

export type CharacterProficiencyGroup = {
  id: CharacterProficiencyGroupId
  title: string
  items: CharacterDetailListItem[]
}

export type CharacterProficienciesViewModel = {
  title: string
  groups: CharacterProficiencyGroup[]
  emptyText: string
}

export type CharacterActionRowViewModel = {
  id: string
  name: string
  attackBonus: string
  damage: string
}

export type CharacterDetailListItem = {
  id: string
  label: string
  detail?: string
}

export type CharacterDetailListSection = {
  title: string
  items: CharacterDetailListItem[]
  emptyText: string
}

export type CharacterDetailViewModel = {
  id: string
  identity: {
    name: string
    summary: string
    xp: string | null
    vital: CharacterVitalState
    vitalLabel: string
  }
  stats: CharacterDetailStatTile[]
  abilities: CharacterAbilityTile[]
  hitPoints: CharacterHitPointsViewModel
  actions: CharacterActionRowViewModel[]
  savingThrows: CharacterDetailListSection
  proficiencies: CharacterProficienciesViewModel
  spells: CharacterSheetSpellCard[]
  equipment: CharacterSheetEquipmentCard[]
  wealth: CharacterWealthViewModel
  classFeatures: CharacterDetailListSection
  speciesTraits: CharacterDetailListSection
  feats: CharacterDetailListSection
  connections: CharacterDetailListSection
  narrative: CharacterNarrative | undefined
}
