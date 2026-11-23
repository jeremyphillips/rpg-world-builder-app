import type {
  FacingBlock,
  FacingResolution,
  StatBlockProse,
  StatBlockProseDocument,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterActionSection } from '../../../monsters/lib/actions/references/monster-action-equipment-references'
import type { MonsterFormValues } from '../../../monsters/lib/monster-form-values'
import { resolveActionStatBlockRulesFacingForForm } from '../../../monsters/lib/presentation/resolve-action-stat-block-rules-facing-for-form'

function attackLineDocument(line: string): StatBlockProseDocument {
  const paragraph: StatBlockProse = [{ kind: 'text', value: line }]
  return [paragraph]
}

function facingBlocksFromMonsterRules(input: {
  rulesProse?: StatBlockProseDocument
  descriptionHtml?: string
  attackLine?: string
}): FacingBlock[] {
  const blocks: FacingBlock[] = []
  if (input.rulesProse?.length) {
    blocks.push({ kind: 'rules', document: input.rulesProse })
  } else if (input.attackLine) {
    blocks.push({ kind: 'rules', document: attackLineDocument(input.attackLine) })
  }
  const description = input.descriptionHtml?.trim()
  if (description) blocks.push({ kind: 'richText', html: description })
  return blocks
}

export function resolveMonsterActionDraftFacing(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  actionId: string
  section: MonsterActionSection
}): FacingResolution {
  const outcome = resolveActionStatBlockRulesFacingForForm(input)

  if (outcome.status === 'unavailable' || outcome.status === 'failed') {
    return { status: outcome.status, guidance: outcome.guidance }
  }

  if (outcome.status === 'incomplete') {
    return { status: 'incomplete', guidance: outcome.guidance }
  }

  const blocks = facingBlocksFromMonsterRules({
    rulesProse: outcome.facing.rulesProse,
    descriptionHtml: outcome.facing.descriptionHtml,
    attackLine: outcome.facing.attackLine,
  })

  return {
    status: 'ready',
    document: {
      title: outcome.facing.name,
      blocks,
    },
  }
}
