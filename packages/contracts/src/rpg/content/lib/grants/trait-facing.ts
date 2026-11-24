import { getDamageTypeSentenceForm } from '../../../vocab/damage/vocabulary'
import { getLanguageSentenceForm } from '../../../vocab/language'
import { formatMovementGrantSentence } from '../../../vocab/movement-mode'
import { getSenseLabel, getSenseSentenceForm } from '../../../vocab/sense'
import { isSenseCreatureTraitTemplateId } from '../../creature/traits/sense-templates'
import { formatLegendaryResistanceStatBlockTitle } from '../../creature/traits/format-legendary-resistance'
import { contextualCountSchema } from '../../../primitives/contextual-count'
import { readCreatureTraitTemplateConfig } from '../../creature/traits/templates'
import { monsterRichTextIsEmpty } from '../../monster/action/save-refinements'
import type {
  ContentGrant,
  ContentTrait,
  CustomContentTrait,
  GrantContentTrait,
  GrantGroups,
  TemplateContentTrait,
} from './grants'
import type { TraitRulesVoice } from '../../creature/traits/trait-rules-voice'
import { traitHasForVoice, traitSubjectCap } from '../../creature/traits/trait-rules-voice'
import type { TraitFacingHost } from './trait-facing-host'

export type TraitFacingParts = {
  title: string
  rulesProse?: string
  supplementalHtml?: string
}

function rulesVoiceFromHost(host: TraitFacingHost): TraitRulesVoice {
  if (host.host === 'species') return { agreement: 'player' }
  return { agreement: 'stat-block', subject: host.subject }
}

function normalizeSupplemental(details: string | undefined): string | undefined {
  if (!details?.trim() || monsterRichTextIsEmpty(details)) return undefined
  return details
}

function htmlParagraph(text: string): string {
  return `<p>${text}</p>`
}

type PublishedGrantDisplay = { name: string; descriptionHtml?: string }
type PublishedGrantMapper<K extends ContentGrant['kind']> = (
  grant: Extract<ContentGrant, { kind: K }>,
) => PublishedGrantDisplay

const GENERIC_GRANT_DISPLAY: PublishedGrantDisplay = { name: 'Grant' }

// Null entries are ineligible for standalone grant trait prose.
const PUBLISHED_GRANT_MAPPERS = {
  sense: (grant) => ({
    name: getSenseLabel(grant.type),
    descriptionHtml: htmlParagraph(
      `You have ${getSenseSentenceForm(grant.type)} with a range of ${grant.range} feet.`,
    ),
  }),
  resistances: (grant) => ({
    name: 'Damage Resistance',
    descriptionHtml: htmlParagraph(
      `You have Resistance to ${getDamageTypeSentenceForm(grant.damageTypes[0]!)}.`,
    ),
  }),
  movement: (grant) => ({
    name: 'Movement',
    descriptionHtml: htmlParagraph(formatMovementGrantSentence(grant)),
  }),
  languages: (grant) => ({
    name: 'Language',
    descriptionHtml: htmlParagraph(`You know ${getLanguageSentenceForm(grant.languageIds[0]!)}.`),
  }),
  damageType: null,
  weaponProficiency: null,
  toolProficiency: null,
  skillProficiency: null,
  armorTraining: null,
  languageChoice: null,
  featChoice: null,
  equipment: null,
  spells: null,
  rollAdjustment: null,
  saveOutcomeOverride: null,
} satisfies { [K in ContentGrant['kind']]: PublishedGrantMapper<K> | null }

function deriveGrantGroupDisplay(groups: GrantGroups): PublishedGrantDisplay {
  const grant = groups[0]?.grants[0]
  if (!grant) return GENERIC_GRANT_DISPLAY
  if (!Object.hasOwn(PUBLISHED_GRANT_MAPPERS, grant.kind)) {
    throw new Error('Unsupported published trait grant', { cause: grant })
  }
  const mapper = PUBLISHED_GRANT_MAPPERS[grant.kind] as PublishedGrantMapper<
    ContentGrant['kind']
  > | null
  return mapper ? mapper(grant) : GENERIC_GRANT_DISPLAY
}

function templateTitle(
  trait: TemplateContentTrait,
  host: TraitFacingHost,
  read: NonNullable<ReturnType<typeof readCreatureTraitTemplateConfig>>,
): string {
  if (trait.templateId === 'legendary-resistance') {
    const usesRaw = (read.config as { uses?: unknown }).uses
    const parsed = contextualCountSchema.safeParse(usesRaw)
    const uses = parsed.success ? parsed.data : { normal: 3 }
    return formatLegendaryResistanceStatBlockTitle({
      uses,
      lairEnabled: host.host === 'monster' && host.lairEnabled,
    })
  }
  return read.template.formatName?.(read.config) ?? read.template.label
}

function resolveCustomTraitFacingParts(trait: CustomContentTrait): TraitFacingParts {
  return {
    title: trait.name,
    supplementalHtml: normalizeSupplemental(trait.description),
  }
}

function resolveGrantTraitFacingParts(
  trait: GrantContentTrait,
  voice: TraitRulesVoice,
): TraitFacingParts {
  const derived = deriveGrantGroupDisplay(trait.grantGroups)
  const title = trait.nameOverride ?? derived.name
  const details = normalizeSupplemental(trait.details)
  const grant = trait.grantGroups[0]?.grants[0]
  if (grant?.kind === 'sense') {
    const rulesProse = `${traitSubjectCap(voice)} ${traitHasForVoice(voice)} ${getSenseSentenceForm(grant.type)} with a range of ${grant.range} feet.`
    return { title, rulesProse, supplementalHtml: details }
  }
  if (details) return { title, supplementalHtml: details }
  return { title, supplementalHtml: derived.descriptionHtml }
}

function resolveTemplateTraitFacingParts(
  trait: TemplateContentTrait,
  host: TraitFacingHost,
  voice: TraitRulesVoice,
): TraitFacingParts {
  const read = readCreatureTraitTemplateConfig(trait.templateId, trait.config)
  const fallbackTitle = read?.template.formatName?.(read.config) ?? trait.templateId
  const title = read ? templateTitle(trait, host, read) : fallbackTitle

  if (!read || !read.template.hosts.includes(host.host)) {
    return { title }
  }

  const rulesProse = read.template.formatRules?.(read.config, voice)
  const supplementalHtml = normalizeSupplemental(trait.details)

  if (isSenseCreatureTraitTemplateId(trait.templateId)) {
    return { title, rulesProse, supplementalHtml }
  }

  return { title, rulesProse, supplementalHtml }
}

/** Player-facing blocks for trait preview and detail surfaces. */
export function resolveTraitFacingParts(
  trait: ContentTrait,
  host: TraitFacingHost,
): TraitFacingParts {
  const voice = rulesVoiceFromHost(host)
  if (trait.kind === 'custom') return resolveCustomTraitFacingParts(trait)
  if (trait.kind === 'grant') return resolveGrantTraitFacingParts(trait, voice)
  return resolveTemplateTraitFacingParts(trait, host, voice)
}

/** Joins rules prose and supplemental rich text for list and stat-block HTML consumers. */
export function renderTraitFacingBodyHtml(parts: TraitFacingParts): string | undefined {
  const chunks: string[] = []
  const rules = parts.rulesProse?.trim()
  if (rules) chunks.push(htmlParagraph(rules))
  const supplemental = parts.supplementalHtml?.trim()
  if (supplemental && !monsterRichTextIsEmpty(supplemental)) {
    chunks.push(supplemental)
  }
  if (chunks.length === 0) return undefined
  return chunks.join('')
}
