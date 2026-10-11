import { ALIGNMENT_ENTRIES, CREATURE_SIZE_ENTRIES, CREATURE_SIZES } from '@rpg/contracts'
import { toOptions, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { withContentFormTabIcon } from '../../lib/forms/content-form-tab-icons'
import {
  MonsterActionsPassthrough,
  MonsterTraitsPassthrough,
} from '../components/form/monster-preserved-collections'
import { MonsterCreatureDetailsPanel } from '../components/form/monster-creature-details-panel'
import { MonsterEquipmentPanel } from '../components/form/monster-equipment-panel'
import { MonsterStatisticsPanel } from '../components/form/monster-statistics-panel'
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
    { type: 'textarea', name: 'description', label: 'Description' },
    { type: 'select', name: 'size', label: 'Size', options: sizeOptions },
    {
      type: 'select',
      name: 'creatureType',
      label: 'Creature type',
      options: creatureTypeOptions(ctx),
    },
    { type: 'select', name: 'alignment', label: 'Alignment', options: alignmentOptions },
  ]

  const statistics: FormItem[] = [
    { kind: 'slot', name: 'abilityScores', render: () => <MonsterStatisticsPanel ctx={ctx} /> },
    ownedSlot('armorClass'),
    ownedSlot('hitPoints'),
    ownedSlot('movement'),
    ownedSlot('hover'),
    ownedSlot('challengeRating'),
    ownedSlot('experiencePointsOverride'),
    ownedSlot('proficiencies.savingThrows'),
  ]

  const creatureDetails: FormItem[] = [
    {
      kind: 'slot',
      name: 'proficiencies.skills',
      render: () => <MonsterCreatureDetailsPanel ctx={ctx} />,
    },
    ownedSlot('proficiencies.weapons'),
    ownedSlot('senses'),
    ownedSlot('languages'),
    ownedSlot('defenses'),
  ]

  const equipment: FormItem[] = [
    { kind: 'slot', name: 'equipment', render: () => <MonsterEquipmentPanel ctx={ctx} /> },
  ]

  const traits: FormItem[] = [
    { kind: 'slot', name: 'traits', render: () => <MonsterTraitsPassthrough /> },
  ]

  const actions: FormItem[] = [
    { kind: 'slot', name: 'actions', render: () => <MonsterActionsPassthrough /> },
    ownedSlot('bonusActions'),
    ownedSlot('reactions'),
  ]

  return [
    { id: MONSTER_FORM_TAB.identity, label: 'Identity', fields: identity },
    { id: MONSTER_FORM_TAB.statistics, label: 'Statistics', fields: statistics },
    { id: MONSTER_FORM_TAB.creatureDetails, label: 'Creature Details', fields: creatureDetails },
    { id: MONSTER_FORM_TAB.equipment, label: 'Equipment', fields: equipment },
    { id: MONSTER_FORM_TAB.traits, label: 'Traits', fields: traits },
    { id: MONSTER_FORM_TAB.actions, label: 'Actions', fields: actions },
  ].map(withContentFormTabIcon)
}
