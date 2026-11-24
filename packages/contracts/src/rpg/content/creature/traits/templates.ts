import { z } from 'zod'

import { DEFAULT_SYSTEM_RULESET_ID } from '../../../primitives/ruleset'
import type { VocabularyTerm } from '../../../vocab/types'
import {
  creatureRollAdjustmentSchema,
  creatureSaveOutcomeOverrideSchema,
  type CreatureRollAdjustment,
  type CreatureSaveOutcomeOverride,
} from '../effects'
import type { Sense } from '../../../vocab/sense'
import {
  SENSE_CREATURE_TRAIT_TEMPLATE_ENTRIES,
  type CreatureTraitTemplateSourcePolicy,
} from './sense-templates'
import { LEGENDARY_RESISTANCE_LABEL } from './legendary-resistance.constants'
import { legendaryResistanceLimitedUse } from './legendary-resistance-limited-use'
import {
  traitHasForVoice,
  traitLegendaryResistanceRulesProse,
  traitPossessiveForVoice,
  traitSubjectCap,
  type TraitRulesVoice,
} from './trait-rules-voice'

export type CreatureTraitTemplateHost = 'species' | 'monster'

// ---------------------------------------------------------------------------
// Versioned creature trait templates. Assignments store `templateId` plus
// config and display overrides. Mechanics are read from this registry.
//
// `formatName` is the human-facing feature label for lists and generic display
// (no lair, no stat-block parenthetical). Monster stat-block headings for
// Legendary Resistance use `formatLegendaryResistanceStatBlockTitle` instead.
// ---------------------------------------------------------------------------

export const CREATURE_TRAIT_TEMPLATE_TERM = {
  label: 'Creature Trait Template',
  description: 'A versioned mechanic assigned to a species or monster trait.',
  sentence: {
    singular: 'creature trait template',
    plural: 'creature trait templates',
  },
} as const satisfies VocabularyTerm

export type CreatureTraitGrantBody =
  | ({ kind: 'rollAdjustment' } & CreatureRollAdjustment)
  | ({ kind: 'saveOutcomeOverride' } & CreatureSaveOutcomeOverride)
  | ({ kind: 'sense' } & Sense)

export type CreatureTraitTemplate = {
  label: string
  description: string
  rulesetIds: readonly string[]
  hosts: readonly CreatureTraitTemplateHost[]
  occurrence?: 'one'
  sourcePolicy?: CreatureTraitTemplateSourcePolicy
  acquisitionGroup?: string
  senseId?: string
  configSchema: z.ZodTypeAny
  formatName?: (config: unknown) => string
  formatRules: (config: unknown, voice: TraitRulesVoice) => string
  resolveGrants: (config: unknown) => CreatureTraitGrantBody[]
}

const NO_CONFIG = z.object({}).strict()

const SPECIES_AND_MONSTER_HOSTS = [
  'species',
  'monster',
] as const satisfies readonly CreatureTraitTemplateHost[]

const legendaryResistanceConfigSchema = z.object({
  uses: z.object({
    normal: z
      .number({
        error: () => 'Uses is required.',
      })
      .int()
      .min(1),
    inLair: z.number().int().min(1).optional(),
  }),
})

function rollGrant(adjustment: CreatureRollAdjustment): CreatureTraitGrantBody {
  return { kind: 'rollAdjustment', ...creatureRollAdjustmentSchema.parse(adjustment) }
}

export const CREATURE_TRAIT_TEMPLATE_ENTRIES = {
  'magic-resistance': {
    label: 'Magic Resistance',
    description: 'Advantage on saving throws against spells and other magical effects.',
    rulesetIds: [DEFAULT_SYSTEM_RULESET_ID],
    hosts: SPECIES_AND_MONSTER_HOSTS,
    occurrence: 'one',
    configSchema: NO_CONFIG,
    formatRules: (_config, voice) =>
      `${traitSubjectCap(voice)} ${traitHasForVoice(voice)} Advantage on saving throws against spells and other magical effects.`,
    resolveGrants: () => [
      rollGrant({
        mode: 'advantage',
        rolls: [{ kind: 'saving-throw' }],
        circumstance: { kind: 'vs-magic' },
      }),
    ],
  },
  'pack-tactics': {
    label: 'Pack Tactics',
    description:
      'Advantage on an attack roll when an ally is adjacent to the target and is not incapacitated.',
    rulesetIds: [DEFAULT_SYSTEM_RULESET_ID],
    hosts: SPECIES_AND_MONSTER_HOSTS,
    occurrence: 'one',
    configSchema: NO_CONFIG,
    formatRules: (_config, voice) =>
      `${traitSubjectCap(voice)} ${traitHasForVoice(voice)} Advantage on an attack roll against a creature if at least one of ${traitPossessiveForVoice(voice)} allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.`,
    resolveGrants: () => [
      rollGrant({
        mode: 'advantage',
        rolls: [{ kind: 'attack' }],
        circumstance: { kind: 'ally-adjacent-to-target' },
      }),
    ],
  },
  'sunlight-sensitivity': {
    label: 'Sunlight Sensitivity',
    description: 'Disadvantage on attack rolls and Wisdom (Perception) checks while in sunlight.',
    rulesetIds: [DEFAULT_SYSTEM_RULESET_ID],
    hosts: SPECIES_AND_MONSTER_HOSTS,
    occurrence: 'one',
    configSchema: NO_CONFIG,
    formatRules: (_config, voice) =>
      `While in sunlight, ${traitSubjectCap(voice)} ${traitHasForVoice(voice)} Disadvantage on attack rolls and Wisdom (Perception) checks.`,
    resolveGrants: () => [
      rollGrant({
        mode: 'disadvantage',
        rolls: [
          { kind: 'attack' },
          { kind: 'ability-check', ability: 'wis', skillId: 'perception' },
        ],
        circumstance: { kind: 'in-sunlight' },
      }),
    ],
  },
  'legendary-resistance': {
    label: LEGENDARY_RESISTANCE_LABEL,
    description: 'Choose to succeed on a failed saving throw a limited number of times per day.',
    rulesetIds: [DEFAULT_SYSTEM_RULESET_ID],
    hosts: SPECIES_AND_MONSTER_HOSTS,
    occurrence: 'one',
    configSchema: legendaryResistanceConfigSchema,
    formatName: () => LEGENDARY_RESISTANCE_LABEL,
    formatRules: (_config, voice) => traitLegendaryResistanceRulesProse(voice),
    resolveGrants: (config) => {
      const parsed = legendaryResistanceConfigSchema.parse(config)
      const override = creatureSaveOutcomeOverrideSchema.parse({
        outcome: 'success',
        limitedUse: legendaryResistanceLimitedUse(parsed, { inLair: false }),
      })
      return [{ kind: 'saveOutcomeOverride', ...override }]
    },
  },
  ...SENSE_CREATURE_TRAIT_TEMPLATE_ENTRIES,
} as const satisfies Record<string, CreatureTraitTemplate>

export type CreatureTraitTemplateId = keyof typeof CREATURE_TRAIT_TEMPLATE_ENTRIES

export const CREATURE_TRAIT_TEMPLATE_IDS = Object.keys(CREATURE_TRAIT_TEMPLATE_ENTRIES) as [
  CreatureTraitTemplateId,
  ...CreatureTraitTemplateId[],
]

export function getCreatureTraitTemplate(templateId: string): CreatureTraitTemplate | undefined {
  return Object.hasOwn(CREATURE_TRAIT_TEMPLATE_ENTRIES, templateId)
    ? CREATURE_TRAIT_TEMPLATE_ENTRIES[templateId as CreatureTraitTemplateId]
    : undefined
}

/** Whether a registry template may be assigned on the given authoring host. */
export function isCreatureTraitTemplateEligibleForHost(
  templateId: string,
  host: CreatureTraitTemplateHost,
): boolean {
  const entry = getCreatureTraitTemplate(templateId)
  if (!entry) return false
  return entry.hosts.includes(host)
}

export function listCreatureTraitTemplatesForRuleset(
  rulesetId: string,
  host: CreatureTraitTemplateHost,
): CreatureTraitTemplateId[] {
  return CREATURE_TRAIT_TEMPLATE_IDS.filter((templateId) => {
    const entry = CREATURE_TRAIT_TEMPLATE_ENTRIES[templateId]
    if (!(entry.rulesetIds as readonly string[]).includes(rulesetId)) return false
    return isCreatureTraitTemplateEligibleForHost(templateId, host)
  })
}

export function readCreatureTraitTemplateConfig(
  templateId: string,
  config: unknown,
): { template: CreatureTraitTemplate; config: unknown } | undefined {
  const template = getCreatureTraitTemplate(templateId)
  if (!template) return undefined
  const parsed = template.configSchema.safeParse(config ?? {})
  if (!parsed.success) return undefined
  return { template, config: parsed.data }
}

export function defaultCreatureTraitTemplateConfig(
  templateId: string,
): Record<string, unknown> | undefined {
  if (templateId === 'legendary-resistance') return { uses: { normal: 3 } }
  if (templateId in SENSE_CREATURE_TRAIT_TEMPLATE_ENTRIES) return { range: 60 }
  return undefined
}
