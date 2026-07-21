import {
  ARMOR_CATEGORY_ENTRIES,
  FEAT_CATEGORY_ENTRIES,
  getProficiencyDomainCompactLabel,
  getProficiencyDomainLabel,
  MOVEMENT_MODE_ENTRIES,
  MOVEMENT_MODES,
  MOVEMENT_OPERATION_ENTRIES,
  MOVEMENT_OPERATIONS,
  TOOL_CATEGORY_ENTRIES,
  USAGE_FREQUENCY_ENTRIES,
  WEAPON_CATEGORY_ENTRIES,
  getSenseEntry,
  type ArmorCategory,
  type FeatCategory,
  type MovementMode,
  type MovementOperation,
  type ToolCategory,
  type UsageFrequency,
  type WeaponCategory,
} from '@rpg/contracts'

import { GRANT_TYPE_LABELS, type GrantType } from './grant-form-schema'

export const GRANT_TEMPLATE_GROUP_IDS = [
  'proficiencies',
  'character-options',
  'combat-traits',
] as const

export type GrantTemplateGroupId = (typeof GRANT_TEMPLATE_GROUP_IDS)[number]

export type GrantTemplateGroup = {
  id: GrantTemplateGroupId
  label: string
}

export const GRANT_TEMPLATE_GROUPS: readonly GrantTemplateGroup[] = [
  { id: 'proficiencies', label: 'Proficiencies & training' },
  { id: 'character-options', label: 'Character options' },
  { id: 'combat-traits', label: 'Combat & traits' },
] as const

export type GrantTemplateDuplicatePolicy = 'allow' | 'warn' | 'block'

export type GrantTemplateSearchMetadata = {
  aliases?: string[]
  keywords?: string[]
}

export type GrantTemplateVocabRef =
  | { kind: 'movementMode'; id: MovementMode }
  | { kind: 'movementOperation'; id: MovementOperation }
  | { kind: 'featCategory'; id: FeatCategory }
  | { kind: 'weaponCategory'; id: WeaponCategory }
  | { kind: 'toolCategory'; id: ToolCategory }
  | { kind: 'armorCategory'; id: ArmorCategory }
  | { kind: 'sense'; id: string }
  | { kind: 'usageFrequency'; id: UsageFrequency }

export type ResolvedGrantTemplateVocabRef = {
  label: string
  description?: string
}

export type GrantTemplate = {
  /** Kebab-case authoring id (template id ≠ grant kind). */
  id: string
  label: string
  description: string
  groupId: GrantTemplateGroupId
  grantType: GrantType
  createDefault: () => Record<string, unknown>
  repeatable?: boolean
  duplicatePolicy?: GrantTemplateDuplicatePolicy
  search?: GrantTemplateSearchMetadata
  vocabRefs?: GrantTemplateVocabRef[]
}

const GRANT_TEMPLATE_GROUP_BY_ID = Object.fromEntries(
  GRANT_TEMPLATE_GROUPS.map((group) => [group.id, group]),
) as Record<GrantTemplateGroupId, GrantTemplateGroup>

export const GRANT_TEMPLATES: readonly GrantTemplate[] = [
  {
    id: 'weapon-proficiency',
    label: GRANT_TYPE_LABELS.weaponProficiency,
    description: 'Grant proficiency with specific weapons, a weapon category, or a player choice.',
    groupId: 'proficiencies',
    grantType: 'weaponProficiency',
    createDefault: () => ({ grantType: 'weaponProficiency', proficiencySource: 'specific' }),
    search: {
      aliases: ['weapons', 'martial', 'simple'],
      keywords: ['proficiency'],
    },
    vocabRefs: Object.keys(WEAPON_CATEGORY_ENTRIES).map((id) => ({
      kind: 'weaponCategory' as const,
      id: id as WeaponCategory,
    })),
  },
  {
    id: 'tool-proficiency',
    label: GRANT_TYPE_LABELS.toolProficiency,
    description: 'Grant proficiency with specific tools, a tool category, or a player choice.',
    groupId: 'proficiencies',
    grantType: 'toolProficiency',
    createDefault: () => ({ grantType: 'toolProficiency', proficiencySource: 'specific' }),
    search: {
      aliases: ['tools', 'artisan', 'gaming set', "thieves' tools"],
      keywords: ['proficiency'],
    },
    vocabRefs: Object.keys(TOOL_CATEGORY_ENTRIES).map((id) => ({
      kind: 'toolCategory' as const,
      id: id as ToolCategory,
    })),
  },
  {
    id: 'skill-proficiency',
    label: GRANT_TYPE_LABELS.skillProficiency,
    description: `Grant ${getProficiencyDomainLabel('skill').toLowerCase()} with specific ${getProficiencyDomainCompactLabel('skill').toLowerCase()} or a player choice from a pool.`,
    groupId: 'proficiencies',
    grantType: 'skillProficiency',
    createDefault: () => ({ grantType: 'skillProficiency', proficiencySource: 'specific' }),
    search: {
      aliases: ['skills', 'expertise'],
      keywords: ['proficiency'],
    },
  },
  {
    id: 'armor-training',
    label: GRANT_TYPE_LABELS.armorTraining,
    description: 'Grant training with specific armor, an armor category, or a player choice.',
    groupId: 'proficiencies',
    grantType: 'armorTraining',
    createDefault: () => ({ grantType: 'armorTraining', proficiencySource: 'specific' }),
    search: {
      aliases: ['armor', 'shield', 'heavy armor', 'medium armor', 'light armor'],
      keywords: ['training', 'proficiency'],
    },
    vocabRefs: Object.keys(ARMOR_CATEGORY_ENTRIES).map((id) => ({
      kind: 'armorCategory' as const,
      id: id as ArmorCategory,
    })),
  },
  {
    id: 'language',
    label: GRANT_TYPE_LABELS.languages,
    description: 'Grant knowledge of a language.',
    groupId: 'character-options',
    grantType: 'languages',
    createDefault: () => ({ grantType: 'languages' }),
    search: {
      aliases: ['speak', 'read', 'write', 'tongue'],
      keywords: ['language'],
    },
  },
  {
    id: 'spells',
    label: GRANT_TYPE_LABELS.spells,
    description:
      'Grant innate spells with a spellcasting ability, cast mode, and optional frequency.',
    groupId: 'character-options',
    grantType: 'spells',
    createDefault: () => ({
      grantType: 'spells',
      spellCastingEnabled: true,
      spellCastingFrequency: 'at_will',
    }),
    search: {
      aliases: ['innate spells', 'spellcasting', 'cantrips', 'always prepared'],
      keywords: ['spells', 'magic'],
    },
    vocabRefs: Object.keys(USAGE_FREQUENCY_ENTRIES).map((id) => ({
      kind: 'usageFrequency' as const,
      id: id as UsageFrequency,
    })),
  },
  {
    id: 'feat-choice',
    label: GRANT_TYPE_LABELS.featChoice,
    description: 'Let the player choose from a feat category, with optional recommended feats.',
    groupId: 'character-options',
    grantType: 'featChoice',
    createDefault: () => ({
      grantType: 'featChoice',
      featChoose: 1,
      featCategory: 'general',
      featAllowAnyQualifying: true,
    }),
    search: {
      aliases: ['feat', 'optional feature', 'asi alternative'],
      keywords: ['choice'],
    },
    vocabRefs: Object.keys(FEAT_CATEGORY_ENTRIES).map((id) => ({
      kind: 'featCategory' as const,
      id: id as FeatCategory,
    })),
  },
  {
    id: 'damage-resistance',
    label: GRANT_TYPE_LABELS.resistances,
    description: 'Grant resistance to one or more damage types.',
    groupId: 'combat-traits',
    grantType: 'resistances',
    createDefault: () => ({ grantType: 'resistances' }),
    search: {
      aliases: ['resistance', 'damage resistance'],
      keywords: ['resist'],
    },
  },
  {
    id: 'special-sense',
    label: GRANT_TYPE_LABELS.senses,
    description: 'Grant a special sense such as darkvision with a range in feet.',
    groupId: 'combat-traits',
    grantType: 'senses',
    createDefault: () => ({ grantType: 'senses', senseRange: '60' }),
    search: {
      aliases: ['darkvision', 'blindsight', 'tremorsense', 'truesight'],
      keywords: ['sense', 'vision'],
    },
    vocabRefs: ['darkvision', 'blindsight', 'tremorsense', 'truesight'].map((id) => ({
      kind: 'sense' as const,
      id,
    })),
  },
  {
    id: 'damage-type',
    label: GRANT_TYPE_LABELS.damageType,
    description: 'Grant affinity or interaction with specific damage types.',
    groupId: 'combat-traits',
    grantType: 'damageType',
    createDefault: () => ({ grantType: 'damageType' }),
    search: {
      aliases: ['unarmed', 'natural weapon'],
      keywords: ['damage'],
    },
  },
  {
    id: 'movement-bonus',
    label: GRANT_TYPE_LABELS.movement,
    description: 'Grant a movement speed, increase a speed, or match one speed to another.',
    groupId: 'combat-traits',
    grantType: 'movement',
    createDefault: () => ({
      grantType: 'movement',
      movementMode: 'walk',
      movementOperation: 'increase',
      movementFeet: '5',
    }),
    search: {
      aliases: ['speed', 'walking speed', 'flying speed', 'swim speed'],
      keywords: ['movement', 'bonus'],
    },
    vocabRefs: [
      ...MOVEMENT_MODES.map((id) => ({ kind: 'movementMode' as const, id })),
      ...MOVEMENT_OPERATIONS.map((id) => ({ kind: 'movementOperation' as const, id })),
    ],
  },
] as const

const GRANT_TEMPLATE_BY_ID = Object.fromEntries(
  GRANT_TEMPLATES.map((template) => [template.id, template]),
) as Record<string, GrantTemplate>

/** Resolves a vocab ref to display metadata for search-term harvesting. */
export function resolveGrantTemplateVocabRef(
  ref: GrantTemplateVocabRef,
): ResolvedGrantTemplateVocabRef {
  switch (ref.kind) {
    case 'movementMode':
      return MOVEMENT_MODE_ENTRIES[ref.id]
    case 'movementOperation':
      return MOVEMENT_OPERATION_ENTRIES[ref.id]
    case 'featCategory':
      return FEAT_CATEGORY_ENTRIES[ref.id]
    case 'weaponCategory':
      return WEAPON_CATEGORY_ENTRIES[ref.id]
    case 'toolCategory':
      return TOOL_CATEGORY_ENTRIES[ref.id]
    case 'armorCategory':
      return ARMOR_CATEGORY_ENTRIES[ref.id]
    case 'sense':
      return getSenseEntry(ref.id)
    case 'usageFrequency':
      return USAGE_FREQUENCY_ENTRIES[ref.id]
    default: {
      const _exhaustive: never = ref
      return _exhaustive
    }
  }
}

/** Returns registry templates allowed for a consumer's grant-type list. */
export function getGrantTemplatesForTypes(grantTypes: readonly GrantType[]): GrantTemplate[] {
  const allowed = new Set<GrantType>(grantTypes)
  return GRANT_TEMPLATES.filter((template) => allowed.has(template.grantType))
}

export function getGrantTemplateGroup(groupId: GrantTemplateGroupId): GrantTemplateGroup {
  return GRANT_TEMPLATE_GROUP_BY_ID[groupId]
}

export function getGrantTemplateById(templateId: string): GrantTemplate | undefined {
  return GRANT_TEMPLATE_BY_ID[templateId]
}

export function resolveGrantTemplateRepeatable(template: GrantTemplate): boolean {
  return template.repeatable ?? true
}

export function resolveGrantTemplateDuplicatePolicy(
  template: GrantTemplate,
): GrantTemplateDuplicatePolicy {
  return template.duplicatePolicy ?? 'allow'
}
