import { describe, expect, it } from 'vitest'

import { PERSONAL_NAME_COMPONENT_TERM } from './personal-name-component'
import { NAME_SUBJECT_KIND_TERM } from '../../name-generator/subject-kind'
import {
  SPELL_APPLICATION_PATTERN_TERM,
  SPELL_RESOLUTION_APPLICATION_AMOUNT_TERM,
  SPELL_RESOLUTION_ATTACK_TYPE_TERM,
  SPELL_RESOLUTION_OUTCOME_RESULT_TERM,
  SPELL_RESOLUTION_PROXIMITY_KIND_TERM,
  SPELL_RESOLUTION_SELECTION_MODE_TERM,
  SPELL_RESOLUTION_TARGET_COUNT_KIND_TERM,
  SPELL_RESOLUTION_TARGET_KIND_TERM,
} from '../content/spell/resolution/vocab'
import { AREA_GEOMETRY_SHAPE_TERM } from '../primitives/area-geometry'
import { ABILITY_SCORE_TERM } from './ability'
import { ALIGNMENT_TERM } from './alignment'
import { ARMOR_CATEGORY_TERM } from './armor/category'
import { ARMOR_MATERIAL_TERM } from './armor/material'
import { CREATURE_SIZE_TERM } from './creature-size'
import { CREATURE_TYPE_TERM } from './creature-type'
import { DAMAGE_TYPE_TERM } from './damage/vocabulary'
import { EQUIPMENT_CATEGORY_TERM } from './equipment/equipment-category'
import { PHYSICAL_DAMAGE_TYPE_TERM } from './damage/physical'
import { CONDITION_TERM } from './effect-condition'
import { EQUIPMENT_KIND_TERM } from './equipment/kind'
import { GEAR_KIND_TERM } from './equipment/gear-kind'
import { HOLY_SYMBOL_USAGE_TERM } from './equipment/holy-symbol-usage'
import { SERVICE_CATEGORY_TERM } from './equipment/service-category'
import { SPELLCASTING_GEAR_KIND_TERM } from './equipment/spellcasting-gear-kind'
import { TOOL_CATEGORY_TERM } from './equipment/tool-category'
import { VEHICLE_CATEGORY_TERM } from './equipment/vehicle-category'
import { FEAT_CATEGORY_TERM, FEAT_PART_TERM } from './feat'
import { LANGUAGE_CATEGORY_TERM, LANGUAGE_TERM } from './language'
import { MAGIC_ITEM_CATEGORY_TERM } from './magic-item/category'
import { MAGIC_ITEM_RARITY_TERM } from './magic-item/rarity'
import { ATTACK_RESOLUTION_MODE_TERM } from './mechanics/attack-resolution-mode'
import { BUILDING_ARCHETYPE_TERM } from './location/building-archetype'
import {
  BUILDING_FACILITY_AUTHORING_GROUP_TERM,
  BUILDING_FACILITY_TYPE_TERM,
} from './location/building-facility-type'
import { BUILDING_FORM_TERM } from './location/building-form'
import { BUILDING_FUNCTION_FAMILY_TERM } from './location/building-function-family'
import { EDITION_PRESET_TERM } from './mechanics/edition-preset'
import { HIT_POINTS_TERM } from './mechanics/hit-points'
import { MOVEMENT_MODE_TERM, MOVEMENT_OPERATION_TERM } from './movement-mode'
import { PROFICIENCY_TERM } from './proficiency'
import { SENSE_TERM } from './sense'
import { SPELL_ATOMIC_EFFECT_KIND_TERM } from './spell/atomic-effect-kind'
import { CASTING_TIME_UNIT_TERM } from './spell/casting-time'
import { SPELL_DELIVERY_METHOD_TERM } from './spell/delivery-method'
import { DURATION_UNIT_TERM } from './spell/duration'
import { SPELL_FUNCTION_TAG_TERM } from './spell/function-tag'
import { SPELL_GRANT_AVAILABILITY_TERM } from './spell/grant-availability'
import { SPELL_PREPARATION_MODE_TERM } from './spell/preparation-mode'
import { SPELL_RANGE_KIND_TERM } from './spell/range'
import { SPELL_ROLE_TAG_TERM } from './spell/role-tag'
import { SPELL_SCHOOL_TERM } from './spell/school'
import { SPELLCASTING_PROGRESSION_TERM } from './spell/spellcasting-progression'
import { getTermSentenceForm, type VocabularyTerm } from './types'
import { USAGE_FREQUENCY_TERM } from './usage-frequency'
import { WEAPON_CATEGORY_TERM } from './weapon/category'
import { WEAPON_MASTERY_TERM } from './weapon/mastery'
import { WEAPON_MODE_TERM } from './weapon/mode'
import { WEAPON_PROPERTY_TERM } from './weapon/property'
import { ORGANIZATION_FUNCTION_TERM } from './organization-function'
import { ORGANIZATION_PRACTICE_TERM } from './organization-practice'
import { ORGANIZATION_DOMAIN_TERM } from './organization-domain'
import { ORGANIZATION_FORM_TERM } from './organization-form'
import { NPC_AUTHORING_TEMPLATE_TERM } from './npc-authoring-template'

/** Closed `rpg/vocab` modules — each `*_ENTRIES` map has a sibling `*_TERM`. */
const RPG_VOCAB_CLOSED_TERMS = [
  ABILITY_SCORE_TERM,
  ALIGNMENT_TERM,
  CREATURE_SIZE_TERM,
  CONDITION_TERM,
  FEAT_CATEGORY_TERM,
  FEAT_PART_TERM,
  LANGUAGE_CATEGORY_TERM,
  MOVEMENT_MODE_TERM,
  MOVEMENT_OPERATION_TERM,
  PROFICIENCY_TERM,
  USAGE_FREQUENCY_TERM,
  ARMOR_CATEGORY_TERM,
  ARMOR_MATERIAL_TERM,
  PHYSICAL_DAMAGE_TYPE_TERM,
  EQUIPMENT_KIND_TERM,
  GEAR_KIND_TERM,
  HOLY_SYMBOL_USAGE_TERM,
  SERVICE_CATEGORY_TERM,
  SPELLCASTING_GEAR_KIND_TERM,
  TOOL_CATEGORY_TERM,
  VEHICLE_CATEGORY_TERM,
  MAGIC_ITEM_CATEGORY_TERM,
  MAGIC_ITEM_RARITY_TERM,
  ATTACK_RESOLUTION_MODE_TERM,
  BUILDING_ARCHETYPE_TERM,
  BUILDING_FACILITY_AUTHORING_GROUP_TERM,
  BUILDING_FACILITY_TYPE_TERM,
  BUILDING_FORM_TERM,
  BUILDING_FUNCTION_FAMILY_TERM,
  EDITION_PRESET_TERM,
  SPELL_ATOMIC_EFFECT_KIND_TERM,
  CASTING_TIME_UNIT_TERM,
  SPELL_DELIVERY_METHOD_TERM,
  DURATION_UNIT_TERM,
  SPELL_FUNCTION_TAG_TERM,
  SPELL_GRANT_AVAILABILITY_TERM,
  SPELL_PREPARATION_MODE_TERM,
  SPELL_RANGE_KIND_TERM,
  SPELL_ROLE_TAG_TERM,
  SPELLCASTING_PROGRESSION_TERM,
  WEAPON_CATEGORY_TERM,
  WEAPON_MASTERY_TERM,
  WEAPON_MODE_TERM,
  WEAPON_PROPERTY_TERM,
  ORGANIZATION_DOMAIN_TERM,
  ORGANIZATION_FORM_TERM,
  ORGANIZATION_FUNCTION_TERM,
  ORGANIZATION_PRACTICE_TERM,
  NPC_AUTHORING_TEMPLATE_TERM,
] as const satisfies readonly VocabularyTerm[]

/** Open `rpg/vocab` sets — `*_SET_ID` modules with a sibling `*_TERM`. */
const RPG_VOCAB_OPEN_TERMS = [
  CREATURE_TYPE_TERM,
  DAMAGE_TYPE_TERM,
  LANGUAGE_TERM,
  SENSE_TERM,
  SPELL_SCHOOL_TERM,
  CONDITION_TERM,
  CREATURE_SIZE_TERM,
  WEAPON_PROPERTY_TERM,
  EQUIPMENT_CATEGORY_TERM,
] as const satisfies readonly VocabularyTerm[]

const NAME_GENERATOR_TERMS = [
  NAME_SUBJECT_KIND_TERM,
  PERSONAL_NAME_COMPONENT_TERM,
] as const satisfies readonly VocabularyTerm[]

const PRIMITIVE_TERMS = [AREA_GEOMETRY_SHAPE_TERM] as const satisfies readonly VocabularyTerm[]

/** Taxonomies with `*_TERM` only — no `*_ENTRIES`, not in `VOCABULARY_OPTION_SET_TERMS`. */
const CONCEPT_ONLY_TERMS = [HIT_POINTS_TERM] as const satisfies readonly VocabularyTerm[]

const SPELL_RESOLUTION_TERMS = [
  SPELL_RESOLUTION_TARGET_KIND_TERM,
  SPELL_RESOLUTION_ATTACK_TYPE_TERM,
  SPELL_RESOLUTION_OUTCOME_RESULT_TERM,
  SPELL_RESOLUTION_APPLICATION_AMOUNT_TERM,
  SPELL_RESOLUTION_PROXIMITY_KIND_TERM,
  SPELL_RESOLUTION_SELECTION_MODE_TERM,
  SPELL_RESOLUTION_TARGET_COUNT_KIND_TERM,
  SPELL_APPLICATION_PATTERN_TERM,
] as const satisfies readonly VocabularyTerm[]

function expectVocabularyTerm(term: VocabularyTerm): void {
  expect(term.label).not.toBe('')
  expect(term.description).not.toBe('')
  expect(getTermSentenceForm(term, 1)).not.toBe('')
  expect(getTermSentenceForm(term, 2)).not.toBe('')
}

describe('rpg/vocab term coverage', () => {
  it('defines closed vocab terms for every *_ENTRIES map', () => {
    expect(RPG_VOCAB_CLOSED_TERMS).toHaveLength(49)
    for (const term of RPG_VOCAB_CLOSED_TERMS) {
      expectVocabularyTerm(term)
    }
  })

  it('defines open vocab terms for every *_SET_ID module', () => {
    expect(RPG_VOCAB_OPEN_TERMS).toHaveLength(9)
    for (const term of RPG_VOCAB_OPEN_TERMS) {
      expectVocabularyTerm(term)
    }
  })
})

describe('name-generator term coverage', () => {
  it('defines vocab terms for every *_ENTRIES map', () => {
    expect(NAME_GENERATOR_TERMS).toHaveLength(2)
    for (const term of NAME_GENERATOR_TERMS) {
      expectVocabularyTerm(term)
    }
  })
})

describe('primitives term coverage', () => {
  it('defines vocab terms for GameTermEntry *_ENTRIES maps', () => {
    expect(PRIMITIVE_TERMS).toHaveLength(1)
    for (const term of PRIMITIVE_TERMS) {
      expectVocabularyTerm(term)
    }
  })
})

describe('concept-only term coverage', () => {
  it('defines vocab terms without *_ENTRIES maps', () => {
    expect(CONCEPT_ONLY_TERMS).toHaveLength(1)
    for (const term of CONCEPT_ONLY_TERMS) {
      expectVocabularyTerm(term)
    }
  })
})

describe('spell resolution term coverage', () => {
  it('defines vocab terms for every *_ENTRIES map', () => {
    expect(SPELL_RESOLUTION_TERMS).toHaveLength(8)
    for (const term of SPELL_RESOLUTION_TERMS) {
      expectVocabularyTerm(term)
    }
  })
})
