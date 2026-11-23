import {
  formatClassSpellcastingFeatureRules,
  type CharacterClass,
  type ResolvedSpellcastingProgressionConfig,
  type Spell,
  type Spellcasting,
  type StatBlockProseDocument,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

import { featureFromFormRow, type FeatureRowForm } from './class-feature-form-fields'
import { isSpellcastingGrantingFeatureRow } from './class-spellcasting-lifecycle'
import {
  classSpellcastingPreviewParentDependsOn,
  spellcastingFromClassFormWatch,
} from './class-form-values'

export const CLASS_SPELLCASTING_RULES_PROGRESSION_UNAVAILABLE =
  'Spellcasting progression rules are unavailable.' as const

export const CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE =
  'Spellcasting is inactive or incomplete. Configure spellcasting on the Spellcasting tab and set this feature’s level.' as const

export type SpellcastingGrantingFeatureFacing = {
  title: string
  introHtml?: string
  rulesDocument?: StatBlockProseDocument
  guidance?: string
}

type ResolveSpellcastingGrantingFeatureFacingInput = {
  className: string
  rulesetId: CharacterClass['rulesetId']
  spellcasting: Spellcasting | undefined
  featureRow: FeatureRowForm
  spellcastingProgression: ResolvedSpellcastingProgressionConfig | undefined
  spellsById?: ReadonlyMap<string, Spell>
}

function normalizeIntroHtml(intro: string | undefined): string | undefined {
  const trimmed = intro?.trim()
  return trimmed ? intro : undefined
}

function resolveSpellcastingGrantingFeatureRulesDocumentFromInput(
  input: Omit<ResolveSpellcastingGrantingFeatureFacingInput, 'spellcastingProgression'> & {
    spellcastingProgression: ResolvedSpellcastingProgressionConfig
  },
): StatBlockProseDocument | null {
  if (!isSpellcastingGrantingFeatureRow(input.featureRow)) return null
  if (!input.spellcasting) return null

  const feature = featureFromFormRow({
    ...input.featureRow,
    id: input.featureRow.id ?? 'spellcasting-rules-preview',
  })

  const characterClass = {
    id: `${input.rulesetId}:preview`,
    rulesetId: input.rulesetId,
    name: input.className.trim() || 'Class',
    primaryAbilities: ['int'],
    hitDie: 6,
    proficiencies: {
      savingThrows: ['int', 'wis'],
      armor: { categories: [], items: [] },
      weapons: { categories: [], items: [] },
    },
    features: [feature],
    spellcasting: input.spellcasting,
  } as CharacterClass

  return formatClassSpellcastingFeatureRules({
    characterClass,
    config: input.spellcastingProgression,
    focusKinds: input.spellcasting.focusKinds,
    spellsById: input.spellsById,
  })
}

/** Authoring + published spellcasting/Pact Magic granting feature body (intro + generated rules). */
export function resolveSpellcastingGrantingFeatureFacing(
  input: ResolveSpellcastingGrantingFeatureFacingInput,
): SpellcastingGrantingFeatureFacing {
  const title = String(input.featureRow.name ?? '').trim() || 'Spellcasting'
  const introHtml = normalizeIntroHtml(input.featureRow.intro)

  if (!isSpellcastingGrantingFeatureRow(input.featureRow)) {
    return { title, introHtml }
  }

  if (!input.spellcastingProgression) {
    return {
      title,
      introHtml,
      guidance: CLASS_SPELLCASTING_RULES_PROGRESSION_UNAVAILABLE,
    }
  }

  if (!input.spellcasting) {
    return {
      title,
      introHtml,
      guidance: CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE,
    }
  }

  const rulesDocument =
    resolveSpellcastingGrantingFeatureRulesDocumentFromInput({
      ...input,
      spellcastingProgression: input.spellcastingProgression,
    }) ?? undefined

  if (!rulesDocument) {
    return {
      title,
      introHtml,
      guidance: CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE,
    }
  }

  return { title, introHtml, rulesDocument }
}

export function resolveSpellcastingGrantingFeatureRulesDocument(
  input: Omit<ResolveSpellcastingGrantingFeatureFacingInput, 'spellcastingProgression'> & {
    spellcastingProgression: ResolvedSpellcastingProgressionConfig
  },
): StatBlockProseDocument | null {
  return resolveSpellcastingGrantingFeatureRulesDocumentFromInput(input)
}

export function classSpellcastingGrantingFeatureRulesDisplay(
  ctx: ContentFormCtx,
): import('@rpg/ui/form').DisplayConfig {
  return {
    kind: 'display',
    id: 'class-spellcasting-granting-feature-rules',
    visibility: {
      dependsOn: ['kind'],
      visibleWhen: (watched) => watched.kind === 'spellcasting',
    },
    resolve: {
      dependsOn: [
        'intro',
        'level',
        'name',
        'kind',
        '../../name',
        ...classSpellcastingPreviewParentDependsOn(),
      ],
      contentWhen: (values) => {
        const facing = resolveSpellcastingGrantingFeatureFacing({
          className: String(values['../../name'] ?? ''),
          rulesetId: ctx.rulesetId,
          spellcasting: spellcastingFromClassFormWatch(values),
          featureRow: {
            id: 'preview',
            name: String(values.name ?? ''),
            level: Number(values.level),
            intro: String(values.intro ?? ''),
            grants: values.grants as FeatureRowForm['grants'],
          },
          spellcastingProgression: ctx.spellcastingProgression,
          spellsById: ctx.spellCatalogById,
        })

        return {
          variant: 'rulesPreview',
          preview: {
            title: facing.title,
            content: {
              kind: 'introAndRules',
              introHtml: facing.introHtml,
              rulesDocument: facing.rulesDocument,
              guidance: facing.guidance,
            },
          },
        }
      },
    },
  }
}
