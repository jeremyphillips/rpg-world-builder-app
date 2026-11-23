import { z } from 'zod'

import { DEFAULT_SYSTEM_RULESET_ID } from '../../../primitives/ruleset'
import {
  getSenseLabel,
  getSenseSentenceForm,
  isStandardSenseRange,
  standardSenseRangeValidationMessage,
} from '../../../vocab/sense'
import type { SenseId } from '../../../vocab/sense'
import type { CreatureTraitGrantBody, CreatureTraitTemplate } from './templates'

export type CreatureTraitTemplateSourcePolicy = 'collapse-first' | 'emit-each'

export type RegisteredSenseTemplateId = `sense-${SenseId}`

const senseTemplateConfigSchema = z.object({
  range: z
    .number({
      error: () => 'Range is required.',
    })
    .int()
    .min(0)
    .refine(isStandardSenseRange, { message: standardSenseRangeValidationMessage() }),
})

function senseTemplateEntry(senseId: SenseId): CreatureTraitTemplate & { senseId: SenseId } {
  const label = getSenseLabel(senseId)
  return {
    label,
    description: '',
    rulesetIds: [DEFAULT_SYSTEM_RULESET_ID],
    hosts: ['species'],
    acquisitionGroup: 'senses',
    sourcePolicy: 'emit-each',
    senseId,
    configSchema: senseTemplateConfigSchema,
    formatName: () => label,
    formatDescription: (config) =>
      `You have ${getSenseSentenceForm(senseId)} with a range of ${senseTemplateConfigSchema.parse(config).range} feet.`,
    resolveGrants: (config): CreatureTraitGrantBody[] => {
      const parsed = senseTemplateConfigSchema.parse(config)
      return [{ kind: 'sense', type: senseId, range: parsed.range }]
    },
  }
}

const STANDARD_SENSE_IDS = [
  'darkvision',
  'blindsight',
  'tremorsense',
  'truesight',
] as const satisfies readonly SenseId[]

export const REGISTERED_SENSE_TEMPLATE_SENSE_IDS: readonly SenseId[] = STANDARD_SENSE_IDS

/** Registers a species sense template. Template id is `sense-${senseId}`. */
export function defineSenseTemplate(senseId: SenseId): RegisteredSenseTemplateId {
  return `sense-${senseId}`
}

export const SENSE_CREATURE_TRAIT_TEMPLATE_ENTRIES = Object.fromEntries(
  STANDARD_SENSE_IDS.map((senseId) => [defineSenseTemplate(senseId), senseTemplateEntry(senseId)]),
) as Record<RegisteredSenseTemplateId, CreatureTraitTemplate & { senseId: SenseId }>

export function creatureTraitTemplateSenseId(templateId: string): SenseId | undefined {
  const entry = SENSE_CREATURE_TRAIT_TEMPLATE_ENTRIES[templateId as RegisteredSenseTemplateId]
  return entry?.senseId
}

export function isSenseCreatureTraitTemplateId(templateId: string): boolean {
  return templateId.startsWith('sense-')
}
