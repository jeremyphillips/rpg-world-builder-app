import {
  formatClassSpellcastingFeatureRules,
  spellcastingSchema,
  type CharacterClass,
  type ResolvedSpellcastingProgressionConfig,
  type StatBlockProseDocument,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

import type { ClassFormValues } from './class-form-fields'
import { featureFromFormRow, type FeatureRowForm } from './class-feature-form-fields'
import { isSpellcastingGrantingFeatureRow } from './class-spellcasting-lifecycle'

function parseSpellcastingFromForm(value: unknown): ClassFormValues['spellcasting'] | undefined {
  if (!value || typeof value !== 'object') return undefined
  const parsed = spellcastingSchema.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

export function resolveSpellcastingGrantingFeatureRulesDocument(input: {
  className: string
  rulesetId: CharacterClass['rulesetId']
  spellcasting: unknown
  featureRow: FeatureRowForm
  spellcastingProgression: ResolvedSpellcastingProgressionConfig
}): StatBlockProseDocument | null {
  if (!isSpellcastingGrantingFeatureRow(input.featureRow)) return null

  const spellcasting = parseSpellcastingFromForm(input.spellcasting)
  if (!spellcasting) return null

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
    spellcasting,
  } as CharacterClass

  return formatClassSpellcastingFeatureRules({
    characterClass,
    config: input.spellcastingProgression,
    focusKinds: spellcasting.focusKinds,
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
      dependsOn: ['level', 'name', 'grants', '../../spellcasting', '../../name'],
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

        const document = resolveSpellcastingGrantingFeatureRulesDocument({
          className: String(values['../../name'] ?? ''),
          rulesetId: ctx.rulesetId,
          spellcasting: values['../../spellcasting'],
          featureRow: {
            id: 'preview',
            name: String(values.name ?? ''),
            level: Number(values.level),
            grants: values.grants as FeatureRowForm['grants'],
          },
          spellcastingProgression: progression,
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
