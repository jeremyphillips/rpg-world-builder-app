import {
  formatMonsterPresetTrait,
  formatMonsterStatBlockSubject,
  monsterRichTextIsEmpty,
  parseMonsterPresetTraitDraftForFormat,
  parseMonsterPresetTraitForFormat,
  resolveTraitFacingParts,
  type Monster,
  type MonsterPresetTraitForFormat,
} from '@rpg/contracts'

import type { MonsterFormValues } from '../monster-form-values'
import {
  monsterMovementDefinitionFromForm,
  monsterMovementDefinitionFromRecord,
} from '../monster-movement-definition'
import { applyMonsterEntryHeadingQualifiers } from './monster-entry-heading'

export type TraitStatBlockRulesFacing = {
  heading: string
  descriptionHtml: string
  /** Plain rules text for `RulesPreview` prose content — same source as `descriptionHtml`. */
  proseText: string
}

function escapeTraitSentence(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function partsToStatBlockFacing(parts: {
  title: string
  rulesProse?: string
  supplementalHtml?: string
}): TraitStatBlockRulesFacing {
  const proseText = parts.rulesProse?.trim() ?? ''
  const generated = proseText ? `<p>${escapeTraitSentence(proseText)}</p>` : ''
  const supplemental = parts.supplementalHtml?.trim()
  const descriptionHtml =
    supplemental && !monsterRichTextIsEmpty(supplemental)
      ? `${generated}${supplemental}`
      : generated
  return { heading: parts.title, descriptionHtml, proseText }
}

export function resolveTemplateTraitStatBlockRulesFacing(input: {
  id: string
  templateId: string
  config?: unknown
  details?: string
  monster: Pick<Monster, 'name' | 'lair'>
}): TraitStatBlockRulesFacing {
  const subject = formatMonsterStatBlockSubject(input.monster.name)
  const parts = resolveTraitFacingParts(
    {
      kind: 'template',
      id: input.id,
      templateId: input.templateId,
      config: input.config,
      details: input.details,
    },
    {
      host: 'monster',
      subject,
      lairEnabled: input.monster.lair?.enabled === true,
    },
  )
  return partsToStatBlockFacing(parts)
}

export function resolvePresetTraitStatBlockRulesFacing(input: {
  id: string
  preset: MonsterPresetTraitForFormat['preset']
  monsterName: string
  trait: MonsterPresetTraitForFormat
  movement: Parameters<typeof formatMonsterPresetTrait>[2]
}): TraitStatBlockRulesFacing {
  const subject = formatMonsterStatBlockSubject(input.monsterName)
  const formatted = formatMonsterPresetTrait(subject, input.trait, input.movement)
  const sentence = formatted?.sentence ?? ''
  return {
    heading: formatted?.name ?? input.preset,
    descriptionHtml: formatted ? `<p>${escapeTraitSentence(sentence)}</p>` : '',
    proseText: sentence,
  }
}

export function resolveTraitStatBlockRulesFacing(input: {
  trait: Monster['traits'][number]
  monster: Pick<Monster, 'name' | 'lair' | 'movement' | 'movementAlternative'>
  record: Record<string, unknown>
}): TraitStatBlockRulesFacing | undefined {
  if (input.record.kind === 'template' && typeof input.record.templateId === 'string') {
    const details = typeof input.record.details === 'string' ? input.record.details : undefined
    return resolveTemplateTraitStatBlockRulesFacing({
      id: input.trait.id,
      templateId: input.record.templateId,
      config: input.record.config,
      details,
      monster: input.monster,
    })
  }
  if (typeof input.record.preset === 'string' && input.record.kind !== 'template') {
    const presetTrait =
      parseMonsterPresetTraitForFormat(input.trait) ??
      parseMonsterPresetTraitDraftForFormat(input.trait)
    if (!presetTrait) return undefined
    return resolvePresetTraitStatBlockRulesFacing({
      id: input.trait.id,
      preset: presetTrait.preset,
      monsterName: input.monster.name,
      trait: presetTrait,
      movement: monsterMovementDefinitionFromRecord(input.monster),
    })
  }
  return undefined
}

export function resolveTraitStatBlockRulesFacingForFormRow(input: {
  row: Record<string, unknown>
  monster: Pick<MonsterFormValues, 'name' | 'lair' | 'forms' | 'movement' | 'movementAlternative'>
}): TraitStatBlockRulesFacing | undefined {
  const id = typeof input.row.id === 'string' ? input.row.id : 'preview'
  const trait = { ...input.row, id } as Monster['traits'][number]
  const movementDefinition = monsterMovementDefinitionFromForm(
    input.monster.movement,
    input.monster.movementAlternative,
  )
  const facing = resolveTraitStatBlockRulesFacing({
    trait,
    monster: {
      name: input.monster.name,
      lair: input.monster.lair,
      movement: movementDefinition.movement,
      movementAlternative: movementDefinition.movementAlternative,
    },
    record: input.row,
  })
  if (!facing) return undefined
  const heading =
    input.row.kind === 'template'
      ? facing.heading
      : applyMonsterEntryHeadingQualifiers(input.monster, facing.heading, input.row)
  return {
    ...facing,
    heading,
  }
}
