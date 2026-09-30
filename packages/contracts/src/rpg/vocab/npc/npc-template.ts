import type {
  ArmorProficiencyGrantSet,
  WeaponProficiencyGrantSet,
} from '../../primitives/proficiency/typed-proficiency-grant-set'
import type { Ability } from '../ability'
import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'
import type { NpcWealthTierId } from './npc-wealth-tier'

/**
 * Ceilings for classless level-0 role choices. A classless NPC never gains more
 * than an SRD 5.2.1 background grants. These are ceilings, not defaults.
 */
export const NPC_TEMPLATE_ROLE_CHOICE_LIMITS = {
  skills: 2,
  tools: 1,
} as const

export type NpcTemplateRoleChoiceCounts = {
  readonly skillCount?: number
  readonly toolCount?: number
}

/** Bias automatic selection at every level. Never add capabilities. */
export type NpcTemplateRecommendations = {
  /** Consulted only when class progression applies. */
  readonly classPreferenceSlugs: readonly string[]
  /** Full six-ability permutation used to order the standard array. */
  readonly abilityPriority: readonly Ability[]
  readonly skillSlugs: readonly string[]
  /** Empty unless the role works through tools. */
  readonly toolSlugs: readonly string[]
  readonly languageIds: readonly string[]
}

export type NpcTemplateKitItem = {
  readonly slug: string
  readonly quantity?: number
}

/**
 * Actual grants, choices, and equipment. Applies only to the classless
 * level-0 chassis. Absent means the template behaves like templateless on
 * that chassis: modest purse, no kit, no role choices.
 */
export type NpcTemplateLevelZero = {
  readonly wealthTier: NpcWealthTierId
  readonly kit: readonly NpcTemplateKitItem[]
  readonly training?: {
    readonly weapons?: WeaponProficiencyGrantSet
    readonly armor?: ArmorProficiencyGrantSet
  }
  readonly roleChoices?: NpcTemplateRoleChoiceCounts
}

export type NpcTemplateEntry = GameTermEntry & {
  readonly searchTerms?: readonly string[]
  readonly recommendations: NpcTemplateRecommendations
  readonly levelZero?: NpcTemplateLevelZero
}

export const NPC_TEMPLATE_TERM = {
  label: 'NPC Role',
  description:
    'Reusable role for NPC creation. Recommendations bias automatic selection and never add capabilities. The level-0 role layer grants choices, training, and equipment only on the classless chassis. Level and class remain contextual.',
  sentence: {
    singular: 'NPC role',
    plural: 'NPC roles',
  },
} as const satisfies VocabularyTerm

const ARTISAN_TOOL_SLUGS = [
  'smiths-tools',
  'alchemists-supplies',
  'brewers-supplies',
  'calligraphers-supplies',
  'carpenters-tools',
  'cartographers-tools',
  'cobblers-tools',
  'cooks-utensils',
  'glassblowers-tools',
  'jewelers-tools',
  'leatherworkers-tools',
  'masons-tools',
  'painters-supplies',
  'potters-tools',
  'tinkers-tools',
  'weavers-tools',
  'woodcarvers-tools',
] as const

export const NPC_TEMPLATE_ENTRIES = {
  commoner: {
    label: 'Commoner',
    description:
      'Ordinary townsfolk, farmhand, laborer, or villager. A practical, hardy baseline with no combat or specialist training.',
    searchTerms: ['townsfolk', 'farmhand', 'laborer', 'villager'],
    recommendations: {
      classPreferenceSlugs: [],
      abilityPriority: ['con', 'wis', 'str', 'dex', 'cha', 'int'],
      skillSlugs: ['animal-handling', 'athletics', 'perception', 'insight'],
      toolSlugs: [],
      languageIds: [],
    },
    levelZero: {
      wealthTier: 'poor',
      kit: [{ slug: 'club' }],
      roleChoices: { skillCount: 1, toolCount: 0 },
    },
  },
  guard: {
    label: 'Guard',
    description:
      'Watch member, soldier, sentry, or hired security. Physically capable, alert, and equipped to stand a post.',
    searchTerms: ['watch', 'soldier', 'sentry', 'security'],
    recommendations: {
      classPreferenceSlugs: ['fighter'],
      abilityPriority: ['str', 'con', 'wis', 'dex', 'cha', 'int'],
      skillSlugs: ['perception', 'athletics', 'intimidation', 'insight'],
      toolSlugs: [],
      languageIds: [],
    },
    levelZero: {
      wealthTier: 'modest',
      kit: [{ slug: 'spear' }, { slug: 'leather-armor' }],
      training: {
        weapons: { categories: ['simple'], items: [] },
        armor: { categories: ['light'], items: [] },
      },
      roleChoices: { skillCount: 2, toolCount: 0 },
    },
  },
  scout: {
    label: 'Scout',
    description:
      'Tracker, guide, lookout, or outrider. Quick and perceptive, at home in the wilds and on the move.',
    searchTerms: ['tracker', 'guide', 'lookout', 'outrider'],
    recommendations: {
      classPreferenceSlugs: ['ranger'],
      abilityPriority: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
      skillSlugs: ['perception', 'survival', 'stealth', 'nature'],
      toolSlugs: [],
      languageIds: [],
    },
    levelZero: {
      wealthTier: 'modest',
      kit: [
        { slug: 'shortbow' },
        { slug: 'arrows', quantity: 20 },
        { slug: 'leather-armor' },
        { slug: 'dagger' },
      ],
      training: {
        weapons: { categories: ['simple'], items: [] },
        armor: { categories: ['light'], items: [] },
      },
      roleChoices: { skillCount: 2, toolCount: 0 },
    },
  },
  merchant: {
    label: 'Merchant',
    description:
      'Trader, shopkeeper, broker, or factor. Persuasive and shrewd, with a knack for dealing across cultures.',
    searchTerms: ['trader', 'shopkeeper', 'broker', 'factor'],
    recommendations: {
      classPreferenceSlugs: [],
      abilityPriority: ['cha', 'int', 'wis', 'con', 'dex', 'str'],
      skillSlugs: ['persuasion', 'insight', 'history', 'animal-handling'],
      toolSlugs: [],
      languageIds: ['dwarvish', 'elvish', 'halfling', 'gnomish'],
    },
    levelZero: {
      wealthTier: 'comfortable',
      kit: [{ slug: 'dagger' }, { slug: 'clothes-fine' }],
      roleChoices: { skillCount: 2, toolCount: 0 },
    },
  },
  artisan: {
    label: 'Artisan',
    description:
      'Smith, carpenter, brewer, weaver, or other skilled maker. Defined by their trade and the tools of it.',
    searchTerms: ['smith', 'carpenter', 'brewer', 'weaver', 'maker'],
    recommendations: {
      classPreferenceSlugs: [],
      abilityPriority: ['dex', 'con', 'int', 'str', 'wis', 'cha'],
      skillSlugs: ['persuasion', 'insight', 'investigation', 'history'],
      toolSlugs: ARTISAN_TOOL_SLUGS,
      languageIds: [],
    },
    levelZero: {
      wealthTier: 'modest',
      kit: [],
      roleChoices: { skillCount: 1, toolCount: 1 },
    },
  },
  scholar: {
    label: 'Scholar',
    description:
      'Scribe, sage, librarian, teacher, or researcher. Learned and well-read, often fluent in more than one tongue.',
    searchTerms: ['scribe', 'sage', 'librarian', 'teacher', 'researcher'],
    recommendations: {
      classPreferenceSlugs: [],
      abilityPriority: ['int', 'wis', 'cha', 'con', 'dex', 'str'],
      skillSlugs: ['history', 'arcana', 'investigation', 'religion'],
      toolSlugs: [],
      languageIds: ['draconic', 'elvish', 'dwarvish', 'giant'],
    },
    levelZero: {
      wealthTier: 'modest',
      kit: [{ slug: 'quarterstaff' }, { slug: 'book' }],
      roleChoices: { skillCount: 2, toolCount: 0 },
    },
  },
  priest: {
    label: 'Priest',
    description:
      'Acolyte, temple priest, chaplain, or community spiritual leader. Devout, insightful, and versed in faith and ritual.',
    searchTerms: ['acolyte', 'chaplain', 'cleric', 'temple'],
    recommendations: {
      classPreferenceSlugs: ['cleric', 'paladin'],
      abilityPriority: ['wis', 'cha', 'int', 'con', 'str', 'dex'],
      skillSlugs: ['religion', 'insight', 'medicine', 'persuasion'],
      toolSlugs: [],
      languageIds: [],
    },
    levelZero: {
      wealthTier: 'modest',
      kit: [{ slug: 'mace' }, { slug: 'holy-symbol-amulet' }],
      training: {
        weapons: { categories: ['simple'], items: [] },
      },
      roleChoices: { skillCount: 2, toolCount: 0 },
    },
  },
  criminal: {
    label: 'Criminal',
    description:
      'Thief, smuggler, con artist, or street tough. Nimble and quick-tongued, working outside the law.',
    searchTerms: ['thief', 'smuggler', 'con artist', 'street tough'],
    recommendations: {
      classPreferenceSlugs: ['rogue'],
      abilityPriority: ['dex', 'cha', 'int', 'con', 'wis', 'str'],
      skillSlugs: ['stealth', 'sleight-of-hand', 'deception', 'perception'],
      toolSlugs: ['thieves-tools', 'disguise-kit', 'forgery-kit'],
      languageIds: [],
    },
    levelZero: {
      wealthTier: 'modest',
      kit: [{ slug: 'dagger' }, { slug: 'crowbar' }],
      training: {
        weapons: { categories: ['simple'], items: [] },
      },
      roleChoices: { skillCount: 2, toolCount: 1 },
    },
  },
} as const satisfies Record<string, NpcTemplateEntry>

export type NpcTemplateId = keyof typeof NPC_TEMPLATE_ENTRIES

export const NPC_TEMPLATE_IDS = keysFromEntries(NPC_TEMPLATE_ENTRIES)

export const npcTemplateIdSchema = vocabEnumFromEntries(NPC_TEMPLATE_ENTRIES)

/** Defensive resolver fallback only. Never a UI default and never written onto a draft. */
export const NPC_TEMPLATE_FALLBACK_ID = 'commoner' as const satisfies NpcTemplateId

export function getNpcTemplateEntry(id: string): NpcTemplateEntry | undefined {
  return NPC_TEMPLATE_ENTRIES[id as NpcTemplateId]
}

export function getNpcTemplateLabel(id: string): string {
  return getNpcTemplateEntry(id)?.label ?? id
}

export function getNpcTemplateClassPreferenceSlugs(id: string): readonly string[] {
  return getNpcTemplateEntry(id)?.recommendations.classPreferenceSlugs ?? []
}

/** Role-choice counts for a template, defaulting to zero and capped by the limits. */
export function resolveNpcTemplateRoleChoiceCounts(
  roleChoices: NpcTemplateRoleChoiceCounts | undefined,
): { skillCount: number; toolCount: number } {
  const skillCount = Math.min(
    Math.max(roleChoices?.skillCount ?? 0, 0),
    NPC_TEMPLATE_ROLE_CHOICE_LIMITS.skills,
  )
  const toolCount = Math.min(
    Math.max(roleChoices?.toolCount ?? 0, 0),
    NPC_TEMPLATE_ROLE_CHOICE_LIMITS.tools,
  )
  return { skillCount, toolCount }
}
