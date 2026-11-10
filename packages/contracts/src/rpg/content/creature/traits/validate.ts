import type { RefinementCtx } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import { getCreatureTraitTemplate } from './templates'

export type CreatureTraitTemplateIssue = {
  path: (string | number)[]
  message: string
}

const UNKNOWN_TEMPLATE_MESSAGE = 'Unknown creature trait template.'
const INVALID_CONFIG_MESSAGE = 'Creature trait template config is invalid.'

function templateRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  return value as Record<string, unknown>
}

function issuesForTemplateTrait(
  trait: Record<string, unknown>,
  index: number,
): CreatureTraitTemplateIssue[] {
  if (trait.kind !== 'template') return []

  const templateId = trait.templateId
  if (typeof templateId !== 'string' || templateId.length === 0) {
    return [{ path: [index, 'templateId'], message: UNKNOWN_TEMPLATE_MESSAGE }]
  }

  const template = getCreatureTraitTemplate(templateId)
  if (!template) {
    return [{ path: [index, 'templateId'], message: UNKNOWN_TEMPLATE_MESSAGE }]
  }

  const parsed = template.configSchema.safeParse(trait.config ?? {})
  if (parsed.success) return []

  const detail = parsed.error.issues[0]?.message
  return [
    {
      path: [index, 'config'],
      message: detail ? `${INVALID_CONFIG_MESSAGE} ${detail}` : INVALID_CONFIG_MESSAGE,
    },
  ]
}

/** Rejects unknown template ids and configs that do not match the registry schema. */
export function collectCreatureTraitTemplateIssues(traits: unknown): CreatureTraitTemplateIssue[] {
  if (!Array.isArray(traits)) return []
  return traits.flatMap((trait, index) => {
    const record = templateRecord(trait)
    if (!record) return []
    return issuesForTemplateTrait(record, index)
  })
}

export function refineCreatureTraitTemplate(
  trait: { kind?: string; templateId?: unknown; config?: unknown },
  ctx: RefinementCtx,
): void {
  for (const issue of collectCreatureTraitTemplateIssues([trait])) {
    addCustomRefinementIssue(ctx, issue.message, issue.path.slice(1))
  }
}
