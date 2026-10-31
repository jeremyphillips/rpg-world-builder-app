import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const NATURAL_ATTACK_FORM_TERM = {
  label: 'Natural Attack Form',
  description:
    'The anatomy used by a natural attack. This is not an action identity or a mechanic.',
  sentence: {
    singular: 'natural attack form',
    plural: 'natural attack forms',
  },
} as const satisfies VocabularyTerm

export const NATURAL_ATTACK_FORM_ENTRIES = {
  bite: {
    label: 'Bite',
    description: 'Teeth, jaws, or a similar biting anatomy.',
  },
  claw: {
    label: 'Claw',
    description: 'Claws, talons, or a similar edged anatomy.',
  },
  slam: {
    label: 'Slam',
    description: 'A limb, appendage, or body used to slam.',
  },
  gore: {
    label: 'Gore',
    description: 'Horns, tusks, or a similar thrusting anatomy.',
  },
  ram: {
    label: 'Ram',
    description: 'The head or body used to ram.',
  },
  sting: {
    label: 'Sting',
    description: 'A stinger.',
  },
  tail: {
    label: 'Tail',
    description: 'A tail or similar appendage.',
  },
  tentacle: {
    label: 'Tentacle',
    description: 'A tentacle.',
  },
  talons: {
    label: 'Talons',
    description: 'Hooked talons.',
  },
} as const satisfies Record<string, GameTermEntry>

export type NaturalAttackForm = keyof typeof NATURAL_ATTACK_FORM_ENTRIES

export const NATURAL_ATTACK_FORMS = keysFromEntries(NATURAL_ATTACK_FORM_ENTRIES)

export const naturalAttackFormSchema = vocabEnumFromEntries(NATURAL_ATTACK_FORM_ENTRIES)

export function getNaturalAttackFormLabel(id: string): string {
  return NATURAL_ATTACK_FORM_ENTRIES[id as NaturalAttackForm]?.label ?? id
}
