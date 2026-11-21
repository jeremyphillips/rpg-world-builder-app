import {
  contextualCountSchema,
  formatCreatureTrait,
  formatLegendaryResistanceStatBlockTitle,
  formatMonsterStatBlockSubject,
  resolveTraitDisplay,
  type Monster,
} from '@rpg/contracts'

import { formatMonsterTemplateSentence } from '../format-monster-template-sentence'

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

function legendaryResistanceHeading(
  record: Record<string, unknown>,
  monster: Pick<Monster, 'lair'>,
): string | undefined {
  const usesRaw =
    record.config && typeof record.config === 'object' && !Array.isArray(record.config)
      ? (record.config as { uses?: unknown }).uses
      : undefined
  const parsed = contextualCountSchema.safeParse(usesRaw)
  if (!parsed.success) return undefined
  return formatLegendaryResistanceStatBlockTitle({
    uses: parsed.data,
    lairEnabled: monster.lair?.enabled === true,
  })
}

function mergeTemplateDescriptionHtml(
  sentence: string | undefined,
  displayDescriptionHtml: string | undefined,
  descriptionOverride: string | undefined,
): { descriptionHtml: string; proseText: string } {
  const extra = descriptionOverride?.trim() ? descriptionOverride : ''
  const generated = sentence
    ? `<p>${escapeTraitSentence(sentence)}</p>`
    : (displayDescriptionHtml ?? '')
  const descriptionHtml = extra ? `${generated}${extra}` : generated
  const proseText = sentence?.trim() ?? ''
  return { descriptionHtml, proseText }
}

export function resolveTemplateTraitStatBlockRulesFacing(input: {
  id: string
  templateId: string
  config?: unknown
  nameOverride?: string
  descriptionOverride?: string
  monster: Pick<Monster, 'name' | 'lair'>
}): TraitStatBlockRulesFacing {
  const display = resolveTraitDisplay({
    kind: 'template',
    id: input.id,
    templateId: input.templateId,
    config: input.config,
    nameOverride: input.nameOverride,
  })
  const sentence = formatMonsterTemplateSentence({
    templateId: input.templateId,
    config: input.config,
    monsterName: input.monster.name,
  })
  const { descriptionHtml, proseText } = mergeTemplateDescriptionHtml(
    sentence,
    display.descriptionHtml,
    input.descriptionOverride,
  )
  const record = {
    templateId: input.templateId,
    config: input.config,
  }
  const heading =
    input.templateId === 'legendary-resistance'
      ? (legendaryResistanceHeading(record, input.monster) ?? display.name)
      : input.nameOverride?.trim() || display.name
  return { heading, descriptionHtml, proseText }
}

export function resolvePresetTraitStatBlockRulesFacing(input: {
  id: string
  preset: string
  monsterName: string
  trait: Parameters<typeof formatCreatureTrait>[0]['trait']
}): TraitStatBlockRulesFacing {
  const subject = formatMonsterStatBlockSubject(input.monsterName)
  const formatted = formatCreatureTrait({ subject, trait: input.trait })
  const sentence = formatted?.sentence ?? ''
  return {
    heading: formatted?.name ?? input.preset,
    descriptionHtml: formatted ? `<p>${escapeTraitSentence(sentence)}</p>` : '',
    proseText: sentence,
  }
}

export function resolveTraitStatBlockRulesFacing(input: {
  trait: Monster['traits'][number]
  monster: Pick<Monster, 'name' | 'lair'>
  record: Record<string, unknown>
}): TraitStatBlockRulesFacing | undefined {
  if (input.record.kind === 'template' && typeof input.record.templateId === 'string') {
    const nameOverride =
      typeof input.record.nameOverride === 'string' ? input.record.nameOverride : undefined
    const descriptionOverride =
      typeof input.record.descriptionOverride === 'string'
        ? input.record.descriptionOverride
        : undefined
    return resolveTemplateTraitStatBlockRulesFacing({
      id: input.trait.id,
      templateId: input.record.templateId,
      config: input.record.config,
      nameOverride,
      descriptionOverride,
      monster: input.monster,
    })
  }
  if (typeof input.record.preset === 'string' && input.record.kind !== 'template') {
    return resolvePresetTraitStatBlockRulesFacing({
      id: input.trait.id,
      preset: input.record.preset,
      monsterName: input.monster.name,
      trait: input.trait as Parameters<typeof formatCreatureTrait>[0]['trait'],
    })
  }
  return undefined
}

export function resolveTraitStatBlockRulesFacingForFormRow(input: {
  row: Record<string, unknown>
  monster: Pick<Monster, 'name' | 'lair' | 'forms'>
}): TraitStatBlockRulesFacing | undefined {
  const id = typeof input.row.id === 'string' ? input.row.id : 'preview'
  const trait = { ...input.row, id } as Monster['traits'][number]
  const facing = resolveTraitStatBlockRulesFacing({
    trait,
    monster: input.monster,
    record: input.row,
  })
  if (!facing) return undefined
  return {
    ...facing,
    heading: applyMonsterEntryHeadingQualifiers(input.monster, facing.heading, input.row),
  }
}
