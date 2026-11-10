import { z } from 'zod'

import { formatLimitedUseNotation } from '../../../primitives/limited-use'
import { DEFAULT_SYSTEM_RULESET_ID } from '../../../primitives/ruleset'
import type { VocabularyTerm } from '../../../vocab/types'
import {
  creatureRollAdjustmentSchema,
  creatureSaveOutcomeOverrideSchema,
  type CreatureRollAdjustment,
  type CreatureSaveOutcomeOverride,
} from '../effects'

// ---------------------------------------------------------------------------
// Versioned creature trait templates. Assignments store `templateId` plus
// config and display overrides. Mechanics are read from this registry.
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

export type CreatureTraitTemplate = {
  label: string
  description: string
  rulesetIds: readonly string[]
  configSchema: z.ZodTypeAny
  formatName?: (config: unknown) => string
  formatDescription: (config: unknown) => string
  resolveGrants: (config: unknown) => CreatureTraitGrantBody[]
}

const NO_CONFIG = z.object({}).strict()

const legendaryResistanceConfigSchema = z.object({
  uses: z.number().int().min(1),
})

function legendaryResistanceLimitedUse(uses: number) {
  return {
    kind: 'uses' as const,
    count: { kind: 'fixed' as const, value: uses },
    recovery: { minimumRest: 'long' as const },
  }
}

function rollGrant(adjustment: CreatureRollAdjustment): CreatureTraitGrantBody {
  return { kind: 'rollAdjustment', ...creatureRollAdjustmentSchema.parse(adjustment) }
}

export const CREATURE_TRAIT_TEMPLATE_ENTRIES = {
  'magic-resistance': {
    label: 'Magic Resistance',
    description: 'Advantage on saving throws against spells and other magical effects.',
    rulesetIds: [DEFAULT_SYSTEM_RULESET_ID],
    configSchema: NO_CONFIG,
    formatDescription: () =>
      'This creature has Advantage on saving throws against spells and other magical effects.',
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
    configSchema: NO_CONFIG,
    formatDescription: () =>
      "This creature has Advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.",
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
    configSchema: NO_CONFIG,
    formatDescription: () =>
      'While in sunlight, this creature has Disadvantage on attack rolls and Wisdom (Perception) checks.',
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
    label: 'Legendary Resistance',
    description: 'Choose to succeed on a failed saving throw a limited number of times per day.',
    rulesetIds: [DEFAULT_SYSTEM_RULESET_ID],
    configSchema: legendaryResistanceConfigSchema,
    formatName: (config) => {
      const { uses } = legendaryResistanceConfigSchema.parse(config)
      const notation = formatLimitedUseNotation(legendaryResistanceLimitedUse(uses), 'stat-block')
      return `Legendary Resistance (${notation})`
    },
    formatDescription: (config) => {
      const { uses } = legendaryResistanceConfigSchema.parse(config)
      const notation = formatLimitedUseNotation(legendaryResistanceLimitedUse(uses), 'stat-block')
      return `If this creature fails a saving throw, it can choose to succeed instead (${notation}).`
    },
    resolveGrants: (config) => {
      const { uses } = legendaryResistanceConfigSchema.parse(config)
      const override = creatureSaveOutcomeOverrideSchema.parse({
        outcome: 'success',
        limitedUse: legendaryResistanceLimitedUse(uses),
      })
      return [{ kind: 'saveOutcomeOverride', ...override }]
    },
  },
} as const satisfies Record<string, CreatureTraitTemplate>

export type CreatureTraitTemplateId = keyof typeof CREATURE_TRAIT_TEMPLATE_ENTRIES

export const CREATURE_TRAIT_TEMPLATE_IDS = Object.keys(CREATURE_TRAIT_TEMPLATE_ENTRIES) as [
  CreatureTraitTemplateId,
  ...CreatureTraitTemplateId[],
]

export function getCreatureTraitTemplate(templateId: string): CreatureTraitTemplate | undefined {
  return CREATURE_TRAIT_TEMPLATE_ENTRIES[templateId as CreatureTraitTemplateId]
}

export function listCreatureTraitTemplatesForRuleset(rulesetId: string): CreatureTraitTemplateId[] {
  return CREATURE_TRAIT_TEMPLATE_IDS.filter((templateId) =>
    (CREATURE_TRAIT_TEMPLATE_ENTRIES[templateId].rulesetIds as readonly string[]).includes(
      rulesetId,
    ),
  )
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
  if (templateId === 'legendary-resistance') return { uses: 3 }
  return undefined
}
