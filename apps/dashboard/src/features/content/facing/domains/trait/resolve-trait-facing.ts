import {
  monsterRichTextIsEmpty,
  resolveTraitFacingParts,
  type ContentTrait,
  type FacingBlock,
  type FacingResolution,
} from '@rpg/contracts'

import type { MonsterFormValues } from '../../../monsters/lib/monster-form-values'
import {
  resolveTraitStatBlockRulesFacingForFormRow,
  type TraitStatBlockRulesFacing,
} from '../../../monsters/lib/presentation/resolve-trait-stat-block-rules-facing'
import type { TraitRowForm } from '../../../species/lib/species-trait-form-fields'
import { traitFromFormRow } from '../../../species/lib/species-trait-form-values'

function facingBlocksFromTraitDisplay(input: {
  title: string
  descriptionHtml?: string
  rulesProseText?: string
}): FacingBlock[] {
  const blocks: FacingBlock[] = []
  const prose = input.rulesProseText?.trim()
  if (prose) {
    blocks.push({
      kind: 'rules',
      document: [[{ kind: 'text', value: prose }]],
    })
  }
  const html = input.descriptionHtml?.trim()
  if (html && !monsterRichTextIsEmpty(html)) {
    blocks.push({ kind: 'richText', html })
  }
  return blocks
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
    return {
      status: 'unavailable',
      guidance: 'Complete trait configuration to preview rules text.',
    }
  }
  return { status: 'ready', document: { title: facing.heading, blocks } }
}

export function resolveTraitPersistedFacing(trait: ContentTrait): FacingResolution {
  const parts = resolveTraitFacingParts(trait)
  if (trait.kind === 'custom' && !parts.supplementalHtml?.trim()) {
    return { status: 'ready', document: { title: parts.title, blocks: [] } }
  }
  return readyFacingFromDisplay({
    title: parts.title,
    rulesProseText: parts.rulesProse,
    descriptionHtml: parts.supplementalHtml,
  })
}

function readyFacingFromDisplay(input: {
  title: string
  rulesProseText?: string
  descriptionHtml?: string
}): FacingResolution {
  const blocks = facingBlocksFromTraitDisplay(input)
  if (blocks.length === 0 && !input.title.trim()) {
    return { status: 'unavailable', guidance: 'Add trait details to preview player-facing text.' }
  }
  if (blocks.length === 0) {
    return {
      status: 'unavailable',
      guidance: 'Complete trait configuration to preview rules text.',
    }
  }
  return { status: 'ready', document: { title: input.title, blocks } }
}

export function resolveSpeciesTraitDraftFacing(
  row: TraitRowForm & { id: string },
): FacingResolution | undefined {
  if (row.kind === 'custom') return undefined
  try {
    const trait = traitFromFormRow(row)
    return resolveTraitPersistedFacing(trait)
  } catch {
    return { status: 'invalid', code: 'missing-kind' }
  }
}

export function resolveMonsterTraitDraftFacing(input: {
  row: Record<string, unknown>
  monster: Pick<MonsterFormValues, 'name' | 'lair' | 'forms'>
}): FacingResolution | undefined {
  if (input.row.kind === 'custom') return undefined
  if (typeof input.row.preset === 'string' || input.row.kind === 'template') {
    const facing = resolveTraitStatBlockRulesFacingForFormRow({
      row: input.row,
      monster: input.monster,
    })
    if (!facing) return { status: 'invalid', code: 'missing-kind' }
    if (!facing.proseText.trim() && !facing.descriptionHtml.trim()) {
      return {
        status: 'unavailable',
        guidance: 'Complete trait configuration to preview rules text.',
      }
    }
    return readyFacingFromStatBlock(facing)
  }
  return undefined
}
