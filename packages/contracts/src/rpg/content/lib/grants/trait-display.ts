import { getDamageTypeSentenceForm } from '../../../vocab/damage/vocabulary'
import { getLanguageSentenceForm } from '../../../vocab/language'
import { formatMovementGrantSentence } from '../../../vocab/movement-mode'
import { formatCreatureSenseTraitRulesSentence, getSenseLabel } from '../../../vocab/sense'
import { isSenseCreatureTraitTemplateId } from '../../creature/traits/sense-templates'
import { readCreatureTraitTemplateConfig } from '../../creature/traits/templates'
import type {
  ContentTrait,
  CustomContentTrait,
  GrantContentTrait,
  GrantGroups,
  TemplateContentTrait,
} from './grants'

export type TraitDisplay = {
  name: string
  descriptionHtml?: string
}

export type TraitFacingParts = {
  title: string
  rulesProse?: string
  supplementalHtml?: string
}

function deriveGrantGroupDisplay(groups: GrantGroups): TraitDisplay {
  const grant = groups[0]?.grants[0]
  if (!grant) return { name: 'Grant' }

  switch (grant.kind) {
    case 'sense':
      return {
        name: getSenseLabel(grant.type),
        descriptionHtml: htmlParagraph(
          formatCreatureSenseTraitRulesSentence({ type: grant.type, range: grant.range }),
        ),
      }
    case 'resistances':
      return {
        name: 'Damage Resistance',
        descriptionHtml: `<p>You have Resistance to ${getDamageTypeSentenceForm(
          grant.damageTypes[0]!,
        )}.</p>`,
      }
    case 'movement':
      return {
        name: 'Movement',
        descriptionHtml: `<p>${formatMovementGrantSentence(grant)}</p>`,
      }
    case 'languages':
      return {
        name: 'Language',
        descriptionHtml: `<p>You know ${getLanguageSentenceForm(grant.languageIds[0]!)}.</p>`,
      }
    default:
      return { name: 'Grant' }
  }
}

function resolveCustomTraitDisplay(trait: CustomContentTrait): TraitDisplay {
  return {
    name: trait.name,
    descriptionHtml: trait.description,
  }
}

function resolveGrantTraitDisplay(trait: GrantContentTrait): TraitDisplay {
  const derived = deriveGrantGroupDisplay(trait.grantGroups)
  return {
    name: trait.nameOverride ?? derived.name,
    descriptionHtml: trait.descriptionOverride ?? derived.descriptionHtml,
  }
}

function htmlParagraph(text: string): string {
  return `<p>${text}</p>`
}

function senseTemplateRulesHtml(
  templateId: string,
  read: NonNullable<ReturnType<typeof readCreatureTraitTemplateConfig>>,
): string | undefined {
  if (!isSenseCreatureTraitTemplateId(templateId)) return undefined
  const senseGrant = read.template
    .resolveGrants(read.config)
    .find(
      (grant): grant is { kind: 'sense'; type: string; range: number } => grant.kind === 'sense',
    )
  if (!senseGrant) return undefined
  return htmlParagraph(formatCreatureSenseTraitRulesSentence(senseGrant))
}

function resolveTemplateTraitDisplay(trait: TemplateContentTrait): TraitDisplay {
  const read = readCreatureTraitTemplateConfig(trait.templateId, trait.config)
  const derivedName = read
    ? (read.template.formatName?.(read.config) ?? read.template.label)
    : trait.templateId
  const derivedDescription = read
    ? htmlParagraph(read.template.formatDescription(read.config))
    : undefined

  const senseRules = read ? senseTemplateRulesHtml(trait.templateId, read) : undefined
  if (senseRules) {
    return { name: trait.nameOverride ?? derivedName, descriptionHtml: senseRules }
  }

  return {
    name: trait.nameOverride ?? derivedName,
    descriptionHtml: trait.descriptionOverride ?? derivedDescription,
  }
}

function resolveGrantTraitFacingParts(trait: GrantContentTrait): TraitFacingParts {
  const derived = deriveGrantGroupDisplay(trait.grantGroups)
  const title = trait.nameOverride ?? derived.name
  if (trait.descriptionOverride?.trim()) {
    return { title, supplementalHtml: trait.descriptionOverride }
  }
  const grant = trait.grantGroups[0]?.grants[0]
  if (grant?.kind === 'sense') {
    return {
      title,
      rulesProse: formatCreatureSenseTraitRulesSentence({
        type: grant.type,
        range: grant.range,
      }),
    }
  }
  return { title, supplementalHtml: derived.descriptionHtml }
}

function resolveTemplateTraitFacingParts(trait: TemplateContentTrait): TraitFacingParts {
  const read = readCreatureTraitTemplateConfig(trait.templateId, trait.config)
  const derivedName = read
    ? (read.template.formatName?.(read.config) ?? read.template.label)
    : trait.templateId
  const title = trait.nameOverride ?? derivedName

  if (read && isSenseCreatureTraitTemplateId(trait.templateId)) {
    const senseGrant = read.template
      .resolveGrants(read.config)
      .find(
        (grant): grant is { kind: 'sense'; type: string; range: number } => grant.kind === 'sense',
      )
    const rulesProse = senseGrant
      ? formatCreatureSenseTraitRulesSentence({
          type: senseGrant.type,
          range: senseGrant.range,
        })
      : undefined
    const details = trait.details?.trim() ? trait.details : undefined
    return { title, rulesProse, supplementalHtml: details }
  }

  if (trait.descriptionOverride?.trim()) {
    return { title, supplementalHtml: trait.descriptionOverride }
  }

  const derivedDescription = read
    ? htmlParagraph(read.template.formatDescription(read.config))
    : undefined
  return { title, supplementalHtml: derivedDescription }
}

/** Player-facing blocks for trait preview and detail surfaces. */
export function resolveTraitFacingParts(trait: ContentTrait): TraitFacingParts {
  if (trait.kind === 'custom') {
    return { title: trait.name, supplementalHtml: trait.description }
  }
  if (trait.kind === 'grant') return resolveGrantTraitFacingParts(trait)
  return resolveTemplateTraitFacingParts(trait)
}

/** Resolves human-facing name and description HTML for a content trait. */
export function resolveTraitDisplay(trait: ContentTrait): TraitDisplay {
  if (trait.kind === 'grant') return resolveGrantTraitDisplay(trait)
  if (trait.kind === 'template') return resolveTemplateTraitDisplay(trait)
  return resolveCustomTraitDisplay(trait)
}

/** Resolves display name for list labels and breadcrumbs. */
export function resolveTraitName(trait: ContentTrait): string {
  return resolveTraitDisplay(trait).name
}
