import { getDamageTypeLabel } from '../../vocab/damage/vocabulary'
import { getLanguageLabel } from '../../vocab/language'
import { formatMovementBonusDescription } from '../../vocab/movement-mode'
import { getSenseLabel } from '../../vocab/sense'
import type {
  ContentGrants,
  ContentTrait,
  CustomContentTrait,
  GrantContentTrait,
  GrantGroups,
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
        descriptionHtml: `<p>You have ${getSenseLabel(grant.type)} with a range of ${grant.range} feet.</p>`,
      }
    case 'resistances':
      return {
        name: 'Damage Resistance',
        descriptionHtml: `<p>You have Resistance to ${getDamageTypeLabel(grant.damageTypes[0]!)} damage.</p>`,
      }
    case 'movement':
      return {
        name: 'Movement',
        descriptionHtml: `<p>${formatMovementBonusDescription(grant)}</p>`,
      }
    case 'languages':
      return {
        name: 'Language',
        descriptionHtml: `<p>You know ${getLanguageLabel(grant.languageIds[0]!)}.</p>`,
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

/** Resolves human-facing name and description HTML for a content trait. */
export function resolveTraitDisplay(trait: ContentTrait): TraitDisplay {
  if (trait.kind === 'grant') {
    return resolveGrantTraitDisplay(trait)
  }
  return resolveCustomTraitDisplay(trait)
}

/**
 * Reads structured grants from either trait variant (for stat aggregation).
 * Custom traits may carry a legacy `grants` bag; grant traits use `grantGroups`.
 */
export function getTraitGrants(trait: ContentTrait): ContentGrants | undefined {
  if (trait.kind === 'custom') return trait.grants
  return undefined
}

/** Resolves display name for list labels and breadcrumbs. */
export function resolveTraitName(trait: ContentTrait): string {
  return resolveTraitDisplay(trait).name
}
