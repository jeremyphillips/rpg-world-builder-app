import { armorWriteConfig } from '../armor/armor.config'
import { classWriteConfig } from '../classes/classes.config'
import { equipmentWriteConfig } from '../equipment/equipment.config'
import { skillProficiencyWriteConfig } from '../skill-proficiencies/skill-proficiencies.config'
import { speciesWriteConfig } from '../species/species.config'
import { spellWriteConfig } from '../spells/spells.config'
import { weaponsWriteConfig } from '../weapons/weapons.config'
import type { ContentWriteConfig } from './content-write-config'
import type { ContentTypeName } from '../content-types'

const CONTENT_WRITE_CONFIGS = {
  classes: classWriteConfig,
  equipment: equipmentWriteConfig,
  'skill-proficiencies': skillProficiencyWriteConfig,
  weapons: weaponsWriteConfig,
  armor: armorWriteConfig,
  species: speciesWriteConfig,
  spells: spellWriteConfig,
} as const satisfies Record<
  ContentTypeName,
  ContentWriteConfig<{
    id: string
    slug: string
    source: 'system' | 'homebrew'
    campaignId: string | null
  }>
>

export type ContentWriteTypeName = keyof typeof CONTENT_WRITE_CONFIGS

export function getContentWriteConfig(type: string): ContentWriteConfig<never> | undefined {
  return CONTENT_WRITE_CONFIGS[type as ContentWriteTypeName] as
    | ContentWriteConfig<never>
    | undefined
}

export function isContentWriteType(type: string): type is ContentWriteTypeName {
  return type in CONTENT_WRITE_CONFIGS
}
