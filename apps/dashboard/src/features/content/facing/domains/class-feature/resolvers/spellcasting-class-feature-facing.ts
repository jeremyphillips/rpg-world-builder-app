import {
  formatClassSpellcastingFeatureRules,
  spellcastingGrantingFeatureDisplayName,
  type CharacterClass,
  type ClassBodyFeature,
  type FacingBlock,
  type FacingDocument,
  type FacingResolution,
} from '@rpg/contracts'

import {
  CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE,
  CLASS_SPELLCASTING_RULES_PROGRESSION_UNAVAILABLE,
} from '../../../../classes/lib/class-spellcasting-feature-rules.lib'
import {
  featureFromFormRow,
  type FeatureRowForm,
} from '../../../../classes/lib/class-feature-form-fields'
import type { ClassFacingHostContext } from '../class-facing-host'

function normalizeIntroHtml(intro: string | undefined): string | undefined {
  const trimmed = intro?.trim()
  return trimmed ? intro : undefined
}

function previewCharacterClass(
  host: ClassFacingHostContext,
  feature: ClassBodyFeature,
): CharacterClass {
  return {
    id: `${host.rulesetId}:preview`,
    rulesetId: host.rulesetId,
    name: host.className.trim() || 'Class',
    primaryAbilities: ['int'],
    hitDie: 6,
    proficiencies: {
      savingThrows: ['int', 'wis'],
      armor: { categories: [], items: [] },
      weapons: { categories: [], items: [] },
    },
    features: [feature],
    spellcasting: host.spellcasting,
  } as CharacterClass
}

function spellcastingRulesDocument(
  host: ClassFacingHostContext,
  row: FeatureRowForm & { id: string },
) {
  if (!host.spellcasting || !host.spellcastingProgression) return null
  if (row.kind !== 'spellcasting') return null

  const feature = featureFromFormRow(row)
  return formatClassSpellcastingFeatureRules({
    characterClass: previewCharacterClass(host, feature),
    config: host.spellcastingProgression,
    focusKinds: host.spellcasting.focusKinds,
    spellsById: host.spellsById,
  })
}

function introPartialDocument(
  title: string,
  introHtml: string | undefined,
  rulesDocument?: NonNullable<ReturnType<typeof spellcastingRulesDocument>>,
): FacingDocument {
  const blocks: FacingBlock[] = []
  if (introHtml) blocks.push({ kind: 'richText', html: introHtml })
  if (rulesDocument?.length) blocks.push({ kind: 'rules', document: rulesDocument })
  return { title, blocks }
}

export function resolveSpellcastingClassFeatureFacing(
  row: FeatureRowForm & { id: string },
  host: ClassFacingHostContext,
): FacingResolution {
  const title = spellcastingGrantingFeatureDisplayName({
    name: row.name,
    featureId: row.id,
  })
  const introHtml = normalizeIntroHtml(row.intro)

  if (!host.spellcastingProgression) {
    return introHtml
      ? {
          status: 'incomplete',
          guidance: CLASS_SPELLCASTING_RULES_PROGRESSION_UNAVAILABLE,
          document: introPartialDocument(title, introHtml),
        }
      : { status: 'unavailable', guidance: CLASS_SPELLCASTING_RULES_PROGRESSION_UNAVAILABLE }
  }

  if (!host.spellcasting) {
    return introHtml
      ? {
          status: 'incomplete',
          guidance: CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE,
          document: introPartialDocument(title, introHtml),
        }
      : { status: 'incomplete', guidance: CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE }
  }

  const rulesDocument = spellcastingRulesDocument(host, row)
  if (!rulesDocument?.length) {
    return introHtml
      ? {
          status: 'incomplete',
          guidance: CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE,
          document: introPartialDocument(title, introHtml),
        }
      : { status: 'incomplete', guidance: CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE }
  }

  return {
    status: 'ready',
    document: introPartialDocument(title, introHtml, rulesDocument),
  }
}

export function resolvePersistedSpellcastingClassFeatureFacing(
  feature: Extract<ClassBodyFeature, { kind: 'spellcasting' }>,
  host: ClassFacingHostContext,
): FacingResolution {
  return resolveSpellcastingClassFeatureFacing(
    {
      id: feature.id,
      kind: 'spellcasting',
      name: feature.name,
      intro: feature.intro,
      level: feature.level,
      grants: [],
      tables: [],
      available: 'available' in feature && feature.available === false ? false : true,
    },
    host,
  )
}
