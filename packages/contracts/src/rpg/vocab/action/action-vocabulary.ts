import { keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'
import type { NaturalAttackForm } from './natural-attack-form'

/**
 * Action identity and wording.
 * Core entries name common actions. They do not imply implemented rules.
 */
export const ACTION_VOCABULARY_TERM = {
  label: 'Action',
  description: 'Identity and wording for an action. Core entries do not imply implemented rules.',
  sentence: {
    singular: 'action',
    plural: 'actions',
  },
} as const satisfies VocabularyTerm

export const ACTION_GROUP_TERM = {
  label: 'Action Group',
  description:
    'Whether an action vocabulary entry is a core action, a natural attack, or a special action.',
  sentence: {
    singular: 'action group',
    plural: 'action groups',
  },
} as const satisfies VocabularyTerm

export const ACTION_GROUP_ENTRIES = {
  core: {
    label: 'Core',
    description: 'A common action identity with no mechanics attached.',
  },
  natural: {
    label: 'Natural',
    description: 'An attack defined by anatomy.',
  },
  special: {
    label: 'Special',
    description: 'A named special action such as a breath weapon or multiattack.',
  },
} as const satisfies Record<string, GameTermEntry>

export type ActionGroup = keyof typeof ACTION_GROUP_ENTRIES

export const ACTION_GROUPS = keysFromEntries(ACTION_GROUP_ENTRIES)

export type ActionVocabularyEntry = GameTermEntry & {
  readonly verb: string
  readonly gerund: string
  readonly group: ActionGroup
  readonly naturalForm?: NaturalAttackForm
}

export const ACTION_VOCABULARY_ENTRIES = {
  attack: {
    label: 'Attack',
    verb: 'Attack',
    gerund: 'Attacking',
    group: 'core',
    description: 'Make an attack against a target.',
  },
  grapple: {
    label: 'Grapple',
    verb: 'Grapple',
    gerund: 'Grappling',
    group: 'core',
    description: 'Attempt to seize and hold a creature.',
  },
  shove: {
    label: 'Shove',
    verb: 'Shove',
    gerund: 'Shoving',
    group: 'core',
    description: 'Push a creature away or knock it prone.',
  },
  dash: {
    label: 'Dash',
    verb: 'Dash',
    gerund: 'Dashing',
    group: 'core',
    description: 'Gain additional movement for the turn.',
  },
  disengage: {
    label: 'Disengage',
    verb: 'Disengage',
    gerund: 'Disengaging',
    group: 'core',
    description: 'Move without provoking opportunity attacks under applicable rules.',
  },
  dodge: {
    label: 'Dodge',
    verb: 'Dodge',
    gerund: 'Dodging',
    group: 'core',
    description: 'Focus on avoiding incoming attacks.',
  },
  help: {
    label: 'Help',
    verb: 'Help',
    gerund: 'Helping',
    group: 'core',
    description: 'Assist another creature with an eligible task or attack.',
  },
  hide: {
    label: 'Hide',
    verb: 'Hide',
    gerund: 'Hiding',
    group: 'core',
    description: 'Attempt to avoid detection.',
  },
  bite: {
    label: 'Bite',
    verb: 'Bite',
    gerund: 'Biting',
    group: 'natural',
    naturalForm: 'bite',
    description: 'Attack using teeth, jaws, or similar anatomy.',
  },
  claw: {
    label: 'Claw',
    verb: 'Claw',
    gerund: 'Clawing',
    group: 'natural',
    naturalForm: 'claw',
    description: 'Strike using claws or talons.',
  },
  slam: {
    label: 'Slam',
    verb: 'Slam',
    gerund: 'Slamming',
    group: 'natural',
    naturalForm: 'slam',
    description: 'Strike using a limb, appendage, or body.',
  },
  gore: {
    label: 'Gore',
    verb: 'Gore',
    gerund: 'Goring',
    group: 'natural',
    naturalForm: 'gore',
    description: 'Thrust with horns, tusks, or similar anatomy.',
  },
  ram: {
    label: 'Ram',
    verb: 'Ram',
    gerund: 'Ramming',
    group: 'natural',
    naturalForm: 'ram',
    description: 'Strike using the head or body.',
  },
  sting: {
    label: 'Sting',
    verb: 'Sting',
    gerund: 'Stinging',
    group: 'natural',
    naturalForm: 'sting',
    description: 'Attack using a stinger, potentially delivering additional effects.',
  },
  tail: {
    label: 'Tail',
    verb: 'Strike',
    gerund: 'Striking',
    group: 'natural',
    naturalForm: 'tail',
    description: 'Attack using a tail or similar appendage.',
  },
  talons: {
    label: 'Talons',
    verb: 'Rake',
    gerund: 'Raking',
    group: 'natural',
    naturalForm: 'talons',
    description: 'Strike using hooked talons.',
  },
  tentacle: {
    label: 'Tentacle',
    verb: 'Lash',
    gerund: 'Lashing',
    group: 'natural',
    naturalForm: 'tentacle',
    description: 'Strike or seize using a tentacle.',
  },
  rend: {
    label: 'Rend',
    verb: 'Rend',
    gerund: 'Rending',
    group: 'natural',
    naturalForm: 'claw',
    description: 'Tear into a target, often with claws, dealing additional damage.',
  },
  'breath-weapon': {
    label: 'Breath Weapon',
    verb: 'Exhale',
    gerund: 'Exhaling',
    group: 'special',
    description: 'Release an area effect, usually involving a saving throw.',
  },
  constrict: {
    label: 'Constrict',
    verb: 'Constrict',
    gerund: 'Constricting',
    group: 'special',
    description: 'Squeeze or restrain a creature, potentially causing damage.',
  },
  multiattack: {
    label: 'Multiattack',
    verb: 'Attack',
    gerund: 'Making multiple attacks',
    group: 'special',
    description: 'Perform a defined sequence of attacks.',
  },
  'frightful-presence': {
    label: 'Frightful Presence',
    verb: 'Terrify',
    gerund: 'Terrifying',
    group: 'special',
    description: 'Frighten nearby creatures through a supernatural presence.',
  },
} as const satisfies Record<string, ActionVocabularyEntry>

export type ActionVocabularyId = keyof typeof ACTION_VOCABULARY_ENTRIES

export const ACTION_VOCABULARY_IDS = keysFromEntries(ACTION_VOCABULARY_ENTRIES)

export function getActionVocabularyEntry(id: string): ActionVocabularyEntry | undefined {
  return ACTION_VOCABULARY_ENTRIES[id as ActionVocabularyId]
}
