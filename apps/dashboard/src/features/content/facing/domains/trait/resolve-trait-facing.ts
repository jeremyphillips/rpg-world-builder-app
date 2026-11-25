import {
  formatMonsterStatBlockSubject,
  monsterRichTextIsEmpty,
  resolveTraitFacingParts,
  type ContentTrait,
  type FacingBlock,
  type FacingResolution,
  type TraitFacingHost,
} from '@rpg/contracts'

import type { MonsterFormValues } from '../../../monsters/lib/monster-form-values'

import {
  resolveTraitStatBlockRulesFacingForFormRow,
  type TraitStatBlockRulesFacing,
} from '../../../monsters/lib/presentation/resolve-trait-stat-block-rules-facing'
import type { TraitRowForm } from '../../../species/lib/species-trait-form-schema'
import { traitFromFormRow } from '../../../species/lib/species-trait-form-values'

function speciesTraitFacingHost(): TraitFacingHost {
  return { host: 'species' }
}

export function monsterTraitFacingHost(input: {
  monster: Pick<MonsterFormValues, 'name' | 'lair'>
}): TraitFacingHost {
  return {
    host: 'monster',
    subject: formatMonsterStatBlockSubject(input.monster.name),
    lairEnabled: input.monster.lair?.enabled === true,
  }
}

function facingBlocksFromParts(parts: {
  rulesProse?: string
  supplementalHtml?: string
}): FacingBlock[] {
  const blocks: FacingBlock[] = []
  const prose = parts.rulesProse?.trim()
  if (prose) {
    blocks.push({
      kind: 'rules',
      document: [[{ kind: 'text', value: prose }]],
    })
  }
  const html = parts.supplementalHtml?.trim()
  if (html && !monsterRichTextIsEmpty(html)) {
    blocks.push({ kind: 'richText', html })
  }
  return blocks
}

function readyFacingFromParts(input: {
  title: string
  rulesProse?: string
  supplementalHtml?: string
}): FacingResolution {
  const blocks = facingBlocksFromParts(input)
  if (blocks.length === 0 && !input.title.trim()) {
    return { status: 'incomplete', reason: { code: 'incomplete-trait' } }
  }
  if (blocks.length === 0) {
    return { status: 'incomplete', reason: { code: 'incomplete-trait' } }
  }
  return { status: 'ready', document: { title: input.title, blocks } }
}

function readyFacingFromStatBlock(facing: TraitStatBlockRulesFacing): FacingResolution {
  const blocks: FacingBlock[] = []
  const prose = facing.proseText.trim()
  if (prose) {
    blocks.push({
      kind: 'rules',
      document: [[{ kind: 'text', value: prose }]],
    })
  } else {
    const html = facing.descriptionHtml.trim()
    if (html && !monsterRichTextIsEmpty(html)) {
      blocks.push({ kind: 'richText', html })
    }
  }
  if (blocks.length === 0) {
    return { status: 'incomplete', reason: { code: 'incomplete-trait' } }
  }
  return { status: 'ready', document: { title: facing.heading, blocks } }
}

export function resolveTraitPersistedFacing(
  trait: ContentTrait,
  host: TraitFacingHost = speciesTraitFacingHost(),
): FacingResolution {
  const parts = resolveTraitFacingParts(trait, host)
  if (trait.kind === 'custom' && !parts.supplementalHtml?.trim()) {
    return { status: 'ready', document: { title: parts.title, blocks: [] } }
  }
  if (!parts.rulesProse?.trim() && !parts.supplementalHtml?.trim()) {
    if (trait.kind === 'template') {
      return { status: 'invalid', reason: { code: 'unresolvable-record' } }
    }
  }
  return readyFacingFromParts(parts)
}

export function resolveSpeciesTraitDraftFacing(row: TraitRowForm): FacingResolution | undefined {
  if (row.kind === 'custom') return undefined
  try {
    const trait = traitFromFormRow(row as never)
    return resolveTraitPersistedFacing(trait, speciesTraitFacingHost())
  } catch {
    return { status: 'invalid', reason: { code: 'unresolvable-record' } }
  }
}

function resolveMonsterTemplateTraitDraftFacing(input: {
  row: Record<string, unknown>
  monster: Pick<MonsterFormValues, 'name' | 'lair' | 'forms' | 'movement' | 'movementAlternative'>
}): FacingResolution {
  const trait = {
    kind: 'template' as const,
    id: typeof input.row.id === 'string' ? input.row.id : 'preview',
    templateId: String(input.row.templateId),
    config: input.row.config,
    details: typeof input.row.details === 'string' ? input.row.details : undefined,
  }
  const parts = resolveTraitFacingParts(trait, monsterTraitFacingHost(input))
  if (!parts.rulesProse?.trim() && !parts.supplementalHtml?.trim()) {
    return { status: 'incomplete', reason: { code: 'incomplete-trait' } }
  }
  return readyFacingFromParts(parts)
}

function resolveMonsterPresetTraitDraftFacing(input: {
  row: Record<string, unknown>
  monster: Pick<MonsterFormValues, 'name' | 'lair' | 'forms' | 'movement' | 'movementAlternative'>
}): FacingResolution {
  const facing = resolveTraitStatBlockRulesFacingForFormRow({
    row: input.row,
    monster: input.monster,
  })
  if (!facing) {
    return { status: 'invalid', reason: { code: 'unresolvable-record' } }
  }
  if (!facing.proseText.trim() && !facing.descriptionHtml.trim()) {
    return { status: 'incomplete', reason: { code: 'incomplete-trait' } }
  }
  return readyFacingFromStatBlock(facing)
}

export function resolveMonsterTraitDraftFacing(input: {
  row: Record<string, unknown>
  monster: Pick<MonsterFormValues, 'name' | 'lair' | 'forms' | 'movement' | 'movementAlternative'>
}): FacingResolution | undefined {
  if (input.row.kind === 'custom') return undefined
  if (input.row.kind === 'template') {
    try {
      return resolveMonsterTemplateTraitDraftFacing(input)
    } catch {
      return { status: 'invalid', reason: { code: 'unresolvable-record' } }
    }
  }
  if (typeof input.row.preset === 'string') {
    return resolveMonsterPresetTraitDraftFacing(input)
  }
  return undefined
}
