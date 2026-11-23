import type { RefinementCtx } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import { isSenseCreatureTraitTemplateId } from './sense-templates'
import {
  getCreatureTraitTemplate,
  isCreatureTraitTemplateEligibleForHost,
  type CreatureTraitTemplateHost,
} from './templates'

export type CreatureTraitTemplateIssue = {
  path: (string | number)[]
  message: string
}

const UNKNOWN_TEMPLATE_MESSAGE = 'Unknown creature trait template.'
const INVALID_CONFIG_MESSAGE = 'Creature trait template config is invalid.'
const HOST_INELIGIBLE_MESSAGE = 'This creature trait template cannot be assigned on this host.'
const SENSE_DESCRIPTION_OVERRIDE_MESSAGE =
  'Sense templates use details instead of description override.'

function templateRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  return value as Record<string, unknown>
}

function configIssuesForTemplate(
  template: NonNullable<ReturnType<typeof getCreatureTraitTemplate>>,
  trait: Record<string, unknown>,
  index: number,
): CreatureTraitTemplateIssue[] {
  const parsed = template.configSchema.safeParse(trait.config ?? {})
  if (parsed.success) return []

  const inner = parsed.error.issues[0]
  if (!inner) return [{ path: [index, 'config'], message: INVALID_CONFIG_MESSAGE }]
  return [
    {
      path: [index, 'config', ...(inner.path as (string | number)[])],
      message: inner.message,
    },
  ]
}

function eligibilityIssuesForTemplate(
  templateId: string,
  trait: Record<string, unknown>,
  index: number,
  host?: CreatureTraitTemplateHost,
): CreatureTraitTemplateIssue[] {
  const issues: CreatureTraitTemplateIssue[] = []
  if (host && !isCreatureTraitTemplateEligibleForHost(templateId, host)) {
    issues.push({ path: [index, 'templateId'], message: HOST_INELIGIBLE_MESSAGE })
  }
  if (
    isSenseCreatureTraitTemplateId(templateId) &&
    typeof trait.descriptionOverride === 'string' &&
    trait.descriptionOverride.length > 0
  ) {
    issues.push({
      path: [index, 'descriptionOverride'],
      message: SENSE_DESCRIPTION_OVERRIDE_MESSAGE,
    })
  }
  return issues
}

function issuesForTemplateTrait(
  trait: Record<string, unknown>,
  index: number,
  host?: CreatureTraitTemplateHost,
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

  return [
    ...eligibilityIssuesForTemplate(templateId, trait, index, host),
    ...configIssuesForTemplate(template, trait, index),
  ]
}

/** Rejects unknown template ids and configs that do not match the registry schema. */
export function collectCreatureTraitTemplateIssues(
  traits: unknown,
  options?: { host?: CreatureTraitTemplateHost },
): CreatureTraitTemplateIssue[] {
  if (!Array.isArray(traits)) return []
  return traits.flatMap((trait, index) => {
    const record = templateRecord(trait)
    if (!record) return []
    return issuesForTemplateTrait(record, index, options?.host)
  })
}

export function refineCreatureTraitTemplate(
  trait: {
    kind?: string
    templateId?: unknown
    config?: unknown
    descriptionOverride?: unknown
  },
  ctx: RefinementCtx,
  options?: { host?: CreatureTraitTemplateHost },
): void {
  for (const issue of collectCreatureTraitTemplateIssues([trait], options)) {
    addCustomRefinementIssue(ctx, issue.message, issue.path.slice(1))
  }
}
