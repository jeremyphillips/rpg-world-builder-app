import { getDamageTypeLabel } from '../vocab/damage-type'
import { getSenseLabel } from '../vocab/sense'
import type { ContentGrants, ContentTrait, CustomContentTrait, GrantContentTrait } from './grants'

export type TraitDisplay = {
  name: string
  descriptionHtml?: string
}

function formatSenseGrantDescription(grants: ContentGrants): TraitDisplay | undefined {
  const sense = grants.senses?.[0]
  if (!sense) return undefined
  return {
    name: getSenseLabel(sense.type),
    descriptionHtml: `<p>You have ${getSenseLabel(sense.type)} with a range of ${sense.range} feet.</p>`,
  }
}

function formatResistanceGrantDescription(grants: ContentGrants): TraitDisplay | undefined {
  const type = grants.resistances?.[0]
  if (!type) return undefined
  return {
    name: 'Damage Resistance',
    descriptionHtml: `<p>You have Resistance to ${getDamageTypeLabel(type)} damage.</p>`,
  }
}

function formatSpeedOverrideGrantDescription(grants: ContentGrants): TraitDisplay | undefined {
  const walk = grants.speedOverride?.walk
  if (walk === undefined) return undefined
  return {
    name: 'Speed',
    descriptionHtml: `<p>Your Speed is ${walk} feet.</p>`,
  }
}

function formatLanguageGrantDescription(grants: ContentGrants): TraitDisplay | undefined {
  const language = grants.languages?.[0]
  if (!language) return undefined
  return {
    name: 'Language',
    descriptionHtml: `<p>You know ${language}.</p>`,
  }
}

function deriveGrantDisplay(grants: ContentGrants): TraitDisplay {
  return (
    formatSenseGrantDescription(grants) ??
    formatResistanceGrantDescription(grants) ??
    formatSpeedOverrideGrantDescription(grants) ??
    formatLanguageGrantDescription(grants) ?? {
      name: 'Grant',
    }
  )
}

function resolveCustomTraitDisplay(trait: CustomContentTrait): TraitDisplay {
  return {
    name: trait.name,
    descriptionHtml: trait.description,
  }
}

function resolveGrantTraitDisplay(trait: GrantContentTrait): TraitDisplay {
  const derived = deriveGrantDisplay(trait.grants)
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

/** Reads structured grants from either trait variant (for stat aggregation). */
export function getTraitGrants(trait: ContentTrait): ContentGrants | undefined {
  return trait.grants
}

/** Resolves display name for list labels and breadcrumbs. */
export function resolveTraitName(trait: ContentTrait): string {
  return resolveTraitDisplay(trait).name
}
