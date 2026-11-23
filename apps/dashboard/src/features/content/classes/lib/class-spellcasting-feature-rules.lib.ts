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

export function resolveSpellcastingGrantingFeatureRulesDocument(input: {
  className: string
  rulesetId: CharacterClass['rulesetId']
  spellcasting: Spellcasting | undefined
  featureRow: FeatureRowForm
  spellcastingProgression: ResolvedSpellcastingProgressionConfig
  spellsById?: ReadonlyMap<string, Spell>
}): StatBlockProseDocument | null {
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

export function classSpellcastingGrantingFeatureRulesDisplay(
  ctx: ContentFormCtx,
): import('@rpg/ui/form').DisplayConfig {
  const SPELLCASTING_RULES_PREVIEW_LABEL = 'Generated rules' as const

  return {
    kind: 'display',
    id: 'class-spellcasting-granting-feature-rules',
    visibility: {
      dependsOn: ['grants'],
      visibleWhen: (watched) =>
        isSpellcastingGrantingFeatureRow({
          grants: watched.grants as FeatureRowForm['grants'],
        }),
    },
    resolve: {
      dependsOn: [
        'level',
        'name',
        'grants',
        '../../name',
        ...classSpellcastingPreviewParentDependsOn(),
      ],
      contentWhen: (values) => {
        const progression = ctx.spellcastingProgression
        if (!progression) {
          return {
            variant: 'rulesPreview',
            preview: {
              label: SPELLCASTING_RULES_PREVIEW_LABEL,
              content: {
                kind: 'guidance',
                message: 'Spellcasting progression rules are unavailable.',
              },
            },
          }
        }

        const spellcasting = spellcastingFromClassFormWatch(values)
        const document = resolveSpellcastingGrantingFeatureRulesDocument({
          className: String(values['../../name'] ?? ''),
          rulesetId: ctx.rulesetId,
          spellcasting,
          featureRow: {
            id: 'preview',
            name: String(values.name ?? ''),
            level: Number(values.level),
            grants: values.grants as FeatureRowForm['grants'],
          },
          spellcastingProgression: progression,
          spellsById: ctx.spellCatalogById,
        })

        if (!document) {
          return {
            variant: 'rulesPreview',
            preview: {
              label: SPELLCASTING_RULES_PREVIEW_LABEL,
              title: String(values.name ?? ''),
              content: {
                kind: 'guidance',
                message:
                  'Spellcasting is inactive or incomplete. Configure spellcasting on the Spellcasting tab and set this feature’s level.',
              },
            },
          }
        }

        return {
          variant: 'rulesPreview',
          preview: {
            label: SPELLCASTING_RULES_PREVIEW_LABEL,
            title: String(values.name ?? ''),
            content: { kind: 'rules', document },
          },
        }
      },
    },
  }
}
