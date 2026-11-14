import { formatCreatureTrait, formatMonsterStatBlockSubject } from '@rpg/contracts'
import {
  SAVING_THROW_SPELLCASTING_HINT,
  savingThrowFieldGroup,
} from '../../lib/forms/mechanics/saving-throw-field-group'
import { MonsterActionCastingAbilityField } from './actions/monster-action-casting-fields'
import { RulesPreview } from '@rpg/ui'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { defineMasterDetailItemNoun } from '../../lib/master-detail/master-detail-item-noun'
import { WaterBreathingToggle } from '../components/form/water-breathing-toggle'
import { formatMonsterTemplateSentence } from './format-monster-template-sentence'
import type { MonsterFormAdvisory } from './monster-form-advisories'
import { monsterFormAdvisorySlot } from './monster-form-advisory-presentation'
import {
  MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_HINT,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_RULES_TEXT_LABEL,
  MONSTER_TRAIT_PREVIEW_LABEL,
} from './monster-form-labels'
import {
  monsterTraitPresetFields,
  waterBreathingDurationEnabled,
} from './monster-trait-preset-fields'

function visibleForCustomTrait(): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (watched) => watched['kind'] !== 'template',
  }
}

export const MONSTER_TRAIT_ITEM_NOUN = defineMasterDetailItemNoun({
  label: 'Trait',
  singular: 'trait',
  plural: 'traits',
})

export function monsterTraitItemFields(input?: {
  rowPath?: string
  sharedCastingOptions?: { value: string; label: string }[]
}): FormItem[] {
  const rowPath = input?.rowPath
  const castingName = `${rowPath ? `${rowPath}.` : ''}savingThrow.dcSource.castingAbility`
  return [
    {
      type: 'richtext',
      name: 'description',
      label: MONSTER_RULES_TEXT_LABEL,
      visibility: visibleForCustomTrait(),
    },
    {
      ...savingThrowFieldGroup({
        renderCastingAbility: () => (
          <MonsterActionCastingAbilityField
            name={castingName}
            required
            hint={SAVING_THROW_SPELLCASTING_HINT}
            preview="save-dc"
          />
        ),
      }),
      visibility: visibleForCustomTrait(),
    },
  ]
}

/** Config and optional display overrides for a monster `kind: 'template'` row. */
export function monsterTraitTemplateFields(): FormItem[] {
  return [
    {
      type: 'number',
      name: 'config.uses',
      label: 'Uses',
      min: 1,
      required: true,
      hint: 'Printed on the trait name as N/Day after a long rest.',
      visibility: {
        dependsOn: ['templateId'],
        visibleWhen: (watched) => watched['templateId'] === 'legendary-resistance',
      },
    },
    {
      type: 'richtext',
      name: 'descriptionOverride',
      label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
      hint: MONSTER_CUSTOM_DESCRIPTION_HINT,
      optionalDisclosure: { addLabel: MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL },
    },
  ]
}

function isPresetRow(row: unknown): row is { preset: string } & Record<string, unknown> {
  return (
    typeof row === 'object' &&
    row !== null &&
    'preset' in row &&
    typeof row.preset === 'string' &&
    !('templateId' in row)
  )
}

function isTemplateRow(row: unknown): row is { templateId: string; config?: unknown } {
  return (
    typeof row === 'object' &&
    row !== null &&
    'templateId' in row &&
    typeof row.templateId === 'string'
  )
}

function traitPreviewSlot(text: string): FormItem {
  return {
    kind: 'slot',
    name: 'traitPreview',
    render: () => (
      <RulesPreview label={MONSTER_TRAIT_PREVIEW_LABEL} content={{ kind: 'prose', text }} />
    ),
  }
}

function presetParameterFields(
  row: { preset: string } & Record<string, unknown>,
  rowPath: string,
  ctx: Pick<ContentFormCtx, 'damageTypeVocabulary'>,
): FormItem[] {
  if (row.preset !== 'water-breathing') return monsterTraitPresetFields(row.preset, ctx)
  return [
    {
      kind: 'slot',
      name: 'outsideWaterBreathToggle',
      render: () => <WaterBreathingToggle namePrefix={rowPath} />,
    },
    ...(waterBreathingDurationEnabled(row) ? monsterTraitPresetFields(row.preset, ctx) : []),
  ]
}

/**
 * Trait detail order: preview, advisory, mechanics, then supplemental prose.
 * Custom description is primary content and stays immediately after the advisory.
 */
export function monsterTraitDetailFields(input: {
  row: unknown
  rowPath: string
  advisories: readonly MonsterFormAdvisory[]
  monsterName: string
  ctx: Pick<ContentFormCtx, 'damageTypeVocabulary'>
  sharedCastingOptions?: { value: string; label: string }[]
}): FormItem[] {
  const advisorySlot = monsterFormAdvisorySlot(input.advisories, input.rowPath)
  if (isTemplateRow(input.row)) {
    const sentence =
      formatMonsterTemplateSentence({
        templateId: input.row.templateId,
        config: input.row.config,
        monsterName: input.monsterName,
      }) ?? ''
    const preview = sentence ? [traitPreviewSlot(sentence)] : []
    return [...preview, advisorySlot, ...monsterTraitTemplateFields()]
  }
  if (!isPresetRow(input.row)) {
    return [
      advisorySlot,
      ...monsterTraitItemFields({
        rowPath: input.rowPath,
        sharedCastingOptions: input.sharedCastingOptions,
      }),
    ]
  }
  const subject = formatMonsterStatBlockSubject(input.monsterName)
  const formatted = formatCreatureTrait({ subject, trait: input.row })
  const preview = formatted ? [traitPreviewSlot(formatted.sentence)] : []
  return [...preview, advisorySlot, ...presetParameterFields(input.row, input.rowPath, input.ctx)]
}
