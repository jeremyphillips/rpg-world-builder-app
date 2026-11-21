import {
  SAVING_THROW_SPELLCASTING_HINT,
  savingThrowFieldGroup,
} from '../../../lib/forms/mechanics/saving-throw-field-group'
import { MonsterActionCastingAbilityField } from '../../components/form/actions/shared/casting-ability.slot'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterFormAdvisoryDisplay } from '../monster-form-advisory-presentation'
import { defineMasterDetailItemNoun } from '../../../lib/master-detail/master-detail-item-noun'
import { insertMonsterFormAvailabilityField } from '../forms/monster-form-availability-fields'
import { OutsideWaterBreathSlot } from '../../components/form/slots/traits/outside-water-breath.slot'
import { MonsterTraitRulesPreview } from '../../components/form/slots/traits/trait-preview.slot'
import type { MonsterFormAdvisory } from '../monster-form-advisories'
import {
  MONSTER_CUSTOM_DESCRIPTION_HINT,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_RULES_TEXT_LABEL,
} from '../monster-form-labels'

import {
  outsideWaterBreathDurationEnabled,
  type OutsideWaterBreathDurationFields,
} from '@/features/content/lib/creature-traits/outside-water-breath.lib'

import { legendaryResistanceTemplateUseFields } from '@/features/content/lib/creature-traits/legendary-resistance-trait-fields'

import { monsterTraitPresetFields } from './monster-trait-preset-fields'

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
  sharedCastingOptions?: { value: string; label: string }[]
}): FormItem[] {
  const castingName = 'savingThrow.dcSource.castingAbility'
  void input?.sharedCastingOptions
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
const legendaryResistanceTemplateVisibility = {
  dependsOn: ['templateId'],
  visibleWhen: (watched: Record<string, unknown>) =>
    watched['templateId'] === 'legendary-resistance',
}

function withLegendaryResistanceTemplateVisibility(field: FormItem): FormItem {
  if (field.visibility === undefined) {
    return { ...field, visibility: legendaryResistanceTemplateVisibility }
  }
  const prior = field.visibility
  return {
    ...field,
    visibility: {
      dependsOn: [
        ...new Set([...prior.dependsOn, ...legendaryResistanceTemplateVisibility.dependsOn]),
      ],
      visibleWhen: (watched: Record<string, unknown>) =>
        prior.visibleWhen(watched) && legendaryResistanceTemplateVisibility.visibleWhen(watched),
    },
  }
}

export function monsterTraitTemplateFields(): FormItem[] {
  return [
    ...legendaryResistanceTemplateUseFields({ includeInLair: true }).map(
      withLegendaryResistanceTemplateVisibility,
    ),
    {
      type: 'richtext',
      name: 'descriptionOverride',
      label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
      hint: MONSTER_CUSTOM_DESCRIPTION_HINT,
      optionalDisclosure: { intent: 'add', actionSubject: 'details' },
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

function traitPreviewSlot(): FormItem {
  return {
    kind: 'slot',
    name: 'traitPreview',
    render: () => <MonsterTraitRulesPreview />,
  }
}

function presetParameterFields(
  row: { preset: string } & Record<string, unknown>,
  ctx: Pick<ContentFormCtx, 'damageTypeVocabulary'>,
): FormItem[] {
  if (row.preset !== 'water-breathing') return monsterTraitPresetFields(row.preset, ctx)
  return [
    {
      kind: 'slot',
      name: 'outsideWaterBreathToggle',
      render: () => <OutsideWaterBreathSlot />,
    },
    ...(outsideWaterBreathDurationEnabled(row as OutsideWaterBreathDurationFields)
      ? monsterTraitPresetFields(row.preset, ctx)
      : []),
  ]
}

/**
 * Trait detail order: preview, advisory, mechanics, then supplemental prose.
 * Custom description is primary content and stays immediately after the advisory.
 */
export function monsterTraitDetailFields(input: {
  row: unknown
  advisories: readonly MonsterFormAdvisory[]
  rowPath: string
  monsterName: string
  ctx: Pick<ContentFormCtx, 'damageTypeVocabulary'>
  sharedCastingOptions?: { value: string; label: string }[]
}): FormItem[] {
  const advisoryItem = monsterFormAdvisoryDisplay(input.advisories, input.rowPath)
  if (isTemplateRow(input.row)) {
    return insertMonsterFormAvailabilityField([
      traitPreviewSlot(),
      advisoryItem,
      ...monsterTraitTemplateFields(),
    ])
  }
  if (!isPresetRow(input.row)) {
    return insertMonsterFormAvailabilityField([
      advisoryItem,
      ...monsterTraitItemFields({
        sharedCastingOptions: input.sharedCastingOptions,
      }),
    ])
  }
  return [traitPreviewSlot(), advisoryItem, ...presetParameterFields(input.row, input.ctx)]
}
