import {
  ALIGNMENT_ENTRIES,
  CHALLENGE_RATING_IDS,
  CHALLENGE_RATING_MECHANICS,
  CREATURE_SIZE_ENTRIES,
  CREATURE_SIZES,
  CREATURE_TYPE_TERM,
  getChallengeRatingLabel,
} from '@rpg/contracts'
import { toOptions, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import { vocabularySelectFieldForTerm } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { withContentFormTabIcon } from '../../lib/forms/content-form-tab-icons'
import { descriptionField } from '../../lib/forms/fields/content-identity-form-fields'
import { movementWithHoverGroup } from '../../lib/forms/fields/content-movement-form-fields'
import { MonsterChallengeRatingHint } from '../components/form/monster-challenge-rating-hint'
import { creatureDetailsFields } from './monster-creature-details-form-fields'
import { MonsterEquipmentPanel } from '../components/form/monster-equipment-panel'
import { MonsterActionsEditor } from '../components/form/monster-actions-editor'
import { MonsterTraitsEditor } from '../components/form/monster-traits-editor'
import { MonsterStatisticsPanel } from '../components/form/monster-statistics-panel'
import { monsterHitPointsFields } from './monster-hit-points-form-fields'
import { MONSTER_CHALLENGE_HEADING, monsterEquipmentSectionLabel } from './monster-form-labels'
import { MONSTER_FORM_TAB } from './monster-form-view'

const sizeOptions = toOptions(
  CREATURE_SIZES,
  Object.fromEntries(
    CREATURE_SIZES.map((size) => [size, CREATURE_SIZE_ENTRIES[size].label]),
  ) as Record<(typeof CREATURE_SIZES)[number], string>,
)

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
      legend: 'Identity',
      density: 'comfortable',
      fields: [
        descriptionField(ctx),
        { type: 'select', name: 'size', label: 'Size', options: sizeOptions },
        vocabularySelectFieldForTerm(CREATURE_TYPE_TERM, {
          name: 'creatureType',
          options: creatureTypeOptions(ctx),
        }),
        { type: 'select', name: 'alignment', label: 'Alignment', options: alignmentOptions },
      ],
    },
  ]

  const statistics: FormItem[] = [
    { kind: 'slot', name: 'abilityScores', render: () => <MonsterStatisticsPanel ctx={ctx} /> },
    ownedSlot('armorClass'),
    ...monsterHitPointsFields(),
    movementWithHoverGroup(),
    {
      kind: 'group',
      legend: MONSTER_CHALLENGE_HEADING,
      fields: [
        {
          type: 'select',
          name: 'challengeRating',
          label: MONSTER_CHALLENGE_HEADING,
          options: challengeRatingOptions,
          clearable: true,
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
    { kind: 'slot', name: 'actions', render: () => <MonsterActionsEditor ctx={ctx} /> },
    ownedSlot('bonusActions'),
    ownedSlot('reactions'),
  ]

  return [
    { id: MONSTER_FORM_TAB.identity, label: 'Identity', fields: identity },
    { id: MONSTER_FORM_TAB.statistics, label: 'Statistics', fields: statistics },
    { id: MONSTER_FORM_TAB.creatureDetails, label: 'Creature Details', fields: creatureDetails },
    { id: MONSTER_FORM_TAB.equipment, label: monsterEquipmentSectionLabel(), fields: equipment },
    { id: MONSTER_FORM_TAB.traits, label: 'Traits', fields: traits },
    { id: MONSTER_FORM_TAB.actions, label: 'Actions', fields: actions },
  ].map(withContentFormTabIcon)
}
