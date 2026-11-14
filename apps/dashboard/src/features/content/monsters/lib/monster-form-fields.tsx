import {
  ALIGNMENT_ENTRIES,
  CHALLENGE_RATING_IDS,
  CHALLENGE_RATING_MECHANICS,
  CREATURE_TYPE_TERM,
  getChallengeRatingLabel,
} from '@rpg/contracts'
import { toOptions, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import { buildActiveSizeFieldOptions, vocabularySelectFieldForTerm } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { withContentFormTabIcon } from '../../lib/forms/content-form-tab-icons'
import { descriptionField } from '../../lib/forms/fields/content-identity-form-fields'
import {
  createCreatureSizesFieldConfig,
  MONSTER_SIZES_FIELD_HINT,
} from '../../lib/forms/fields/creature-sizes-form-fields'
import { movementWithHoverGroup } from '../../lib/forms/fields/content-movement-form-fields'
import { MonsterChallengeRatingHint } from '../components/form/monster-challenge-rating-hint'
import { creatureDetailsFields } from './creature-details/monster-creature-details-form-fields'
import { MonsterEquipmentPanel } from '../components/form/monster-equipment-panel'
import { MonsterActionSections } from '../components/form/monster-action-sections'
import { MonsterTraitsEditor } from '../components/form/monster-traits-editor'
import { MonsterStatisticsPanel } from '../components/form/monster-statistics-panel'
import { monsterArmorClassFields } from './statistics/monster-armor-class-fields'
import { monsterHitPointsFields } from './statistics/monster-hit-points-form-fields'
import {
  MONSTER_CHALLENGE_HEADING,
  MONSTER_LEGENDARY_ACTIONS_HEADING,
  MONSTER_LEGENDARY_LAIR_USES_LABEL,
  MONSTER_LEGENDARY_USES_LABEL,
  monsterEquipmentSectionLabel,
} from './monster-form-labels'
import { MONSTER_FORM_TAB } from './monster-form-view'
import {
  monsterActionRowResolveFields,
  monsterTraitRowResolveFields,
} from './monster-master-detail-validation-fields'
import {
  embeddedArrayResolverField,
  embeddedMasterDetailTabValidation,
} from '../../lib/forms/validation/tabbed-form-resolver-fields'

const alignmentOptions = toOptions(
  Object.keys(ALIGNMENT_ENTRIES),
  Object.fromEntries(Object.entries(ALIGNMENT_ENTRIES).map(([id, entry]) => [id, entry.label])),
)

const challengeRatingOptions = [...CHALLENGE_RATING_IDS]
  .sort(
    (left, right) =>
      CHALLENGE_RATING_MECHANICS[left].value - CHALLENGE_RATING_MECHANICS[right].value,
  )
  .map((id) => ({
    value: id,
    label: getChallengeRatingLabel(id),
  }))

function creatureTypeOptions(ctx: ContentFormCtx) {
  const vocabulary = ctx.creatureTypeVocabulary
  if (!vocabulary) return []
  return [...vocabulary.activeIds].map((id) => ({
    value: id,
    label: vocabulary.labelById[id] ?? id,
  }))
}

function ownedSlot(name: string): FormItem {
  return { kind: 'slot', name, render: () => null }
}

export function buildMonsterTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  const identity: FormItem[] = [
    {
      kind: 'group',
      heading: { label: 'Identity' },
      density: 'comfortable',
      fields: [
        descriptionField(ctx),
        createCreatureSizesFieldConfig({
          hint: MONSTER_SIZES_FIELD_HINT,
          options: buildActiveSizeFieldOptions(ctx.sizeVocabulary, ctx.creatureSizesSeedIds),
        }),
        vocabularySelectFieldForTerm(CREATURE_TYPE_TERM, {
          name: 'creatureType',
          options: creatureTypeOptions(ctx),
          required: true,
        }),
        {
          type: 'select',
          name: 'alignment',
          label: 'Alignment',
          options: alignmentOptions,
          required: true,
        },
      ],
    },
  ]

  const statistics: FormItem[] = [
    { kind: 'slot', name: 'abilityScores', render: () => <MonsterStatisticsPanel ctx={ctx} /> },
    ...monsterArmorClassFields(ctx),
    ...monsterHitPointsFields(),
    movementWithHoverGroup(),
    {
      kind: 'group',
      heading: { label: MONSTER_CHALLENGE_HEADING },
      fields: [
        {
          type: 'select',
          name: 'challengeRating',
          label: MONSTER_CHALLENGE_HEADING,
          options: challengeRatingOptions,
          required: true,
        },
        {
          kind: 'slot',
          name: 'challengeRating',
          render: () => <MonsterChallengeRatingHint />,
        },
        ownedSlot('experiencePointsOverride'),
      ],
    },
    ownedSlot('proficiencies.savingThrows'),
  ]

  const creatureDetails: FormItem[] = creatureDetailsFields(ctx)

  const equipment: FormItem[] = [
    { kind: 'slot', name: 'equipment', render: () => <MonsterEquipmentPanel ctx={ctx} /> },
  ]

  const traits: FormItem[] = [
    { kind: 'slot', name: 'traits', render: () => <MonsterTraitsEditor ctx={ctx} /> },
  ]

  const actions: FormItem[] = [
    {
      kind: 'group',
      heading: { label: MONSTER_LEGENDARY_ACTIONS_HEADING },
      visibility: {
        dependsOn: ['legendaryActions'],
        visibleWhen: (values) =>
          Array.isArray(values.legendaryActions) && values.legendaryActions.length > 0,
      },
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'legendaryActionUses',
              label: MONSTER_LEGENDARY_USES_LABEL,
              min: 1,
              digits: 2,
              width: 'auto',
            },
            {
              type: 'number',
              name: 'legendaryActionUsesInLair',
              label: MONSTER_LEGENDARY_LAIR_USES_LABEL,
              min: 1,
              digits: 2,
              width: 'auto',
            },
          ],
        },
      ],
    },
    { kind: 'slot', name: 'actions', render: () => <MonsterActionSections ctx={ctx} /> },
    ownedSlot('bonusActions'),
    ownedSlot('reactions'),
    ownedSlot('legendaryActions'),
  ]

  const actionValidation = embeddedMasterDetailTabValidation({
    path: 'actions',
    itemLabel: 'Actions',
    fields: [],
    resolveItemFields: monsterActionRowResolveFields({ ctx, section: 'actions' }),
  })

  return [
    { id: MONSTER_FORM_TAB.identity, label: 'Identity', fields: identity },
    { id: MONSTER_FORM_TAB.statistics, label: 'Statistics', fields: statistics },
    { id: MONSTER_FORM_TAB.creatureDetails, label: 'Creature Details', fields: creatureDetails },
    { id: MONSTER_FORM_TAB.equipment, label: monsterEquipmentSectionLabel(), fields: equipment },
    {
      id: MONSTER_FORM_TAB.traits,
      label: 'Traits',
      fields: traits,
      ...embeddedMasterDetailTabValidation({
        path: 'traits',
        itemLabel: 'Traits',
        fields: [],
        resolveItemFields: monsterTraitRowResolveFields({ ctx }),
      }),
    },
    {
      id: MONSTER_FORM_TAB.actions,
      label: 'Actions',
      fields: actions,
      ...actionValidation,
      errorPaths: ['actions', 'bonusActions', 'reactions', 'legendaryActions'],
      resolverFields: [
        ...actionValidation.resolverFields,
        embeddedArrayResolverField('bonusActions', 'Bonus actions', {
          resolveItemFields: monsterActionRowResolveFields({ ctx, section: 'bonusActions' }),
        }),
        embeddedArrayResolverField('reactions', 'Reactions', {
          resolveItemFields: monsterActionRowResolveFields({ ctx, section: 'reactions' }),
        }),
        embeddedArrayResolverField('legendaryActions', 'Legendary Actions', {
          resolveItemFields: monsterActionRowResolveFields({ ctx, section: 'legendaryActions' }),
        }),
      ],
    },
  ].map(withContentFormTabIcon)
}
