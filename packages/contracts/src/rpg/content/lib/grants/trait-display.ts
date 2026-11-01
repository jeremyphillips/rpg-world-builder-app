import { getDamageTypeSentenceForm } from '../../../vocab/damage/vocabulary'
import { getLanguageSentenceForm } from '../../../vocab/language'
import { formatMovementGrantSentence } from '../../../vocab/movement-mode'
import { getSenseLabel, getSenseSentenceForm } from '../../../vocab/sense'
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

function deriveGrantGroupDisplay(groups: GrantGroups): TraitDisplay {
  const grant = groups[0]?.grants[0]
  if (!grant) return { name: 'Grant' }

  switch (grant.kind) {
    case 'sense':
      return {
        name: getSenseLabel(grant.type),
        descriptionHtml: `<p>You have ${getSenseSentenceForm(grant.type)} with a range of ${grant.range} feet.</p>`,
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

function resolveTemplateTraitDisplay(trait: TemplateContentTrait): TraitDisplay {
  const read = readCreatureTraitTemplateConfig(trait.templateId, trait.config)
  const derivedName = read
    ? (read.template.formatName?.(read.config) ?? read.template.label)
    : trait.templateId
  const derivedDescription = read
    ? htmlParagraph(read.template.formatDescription(read.config))
    : undefined
  return {
    name: trait.nameOverride ?? derivedName,
    descriptionHtml: trait.descriptionOverride ?? derivedDescription,
  }
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
