import { closedSetEnum, keysFromEntries } from '../enum-schema'
import { SPELLCASTING_GEAR_KIND_ENTRIES } from '../equipment/spellcasting-gear-kind'
import { TOOL_CATEGORY_ENTRIES } from '../equipment/tool-category'
import type { GameTermEntry, VocabularyTerm } from '../types'
import { getTermSentenceForm } from '../types'

// ---------------------------------------------------------------------------
// Class spellcasting focus kinds — class-level permission for spellcasting foci
// including spellbook and musical instrument; equipment focus gear taxonomy unchanged.
// ---------------------------------------------------------------------------

export const CLASS_SPELLCASTING_FOCUS_KIND_TERM = {
  label: 'Class Spellcasting Focus Kind',
  description: 'Spellcasting focus or substitute this class may use when casting spells.',
  sentence: {
    singular: 'class spellcasting focus kind',
    plural: 'class spellcasting focus kinds',
  },
} as const satisfies VocabularyTerm

export type ClassSpellcastingFocusDeterminer = 'indefinite' | 'possessive'

type ClassSpellcastingFocusKindEntry = GameTermEntry & {
  focusDeterminer: ClassSpellcastingFocusDeterminer
}

export const CLASS_SPELLCASTING_FOCUS_KIND_ENTRIES = {
  arcane_focus: {
    ...SPELLCASTING_GEAR_KIND_ENTRIES.arcane_focus,
    focusDeterminer: 'indefinite',
  },
  druidic_focus: {
    ...SPELLCASTING_GEAR_KIND_ENTRIES.druidic_focus,
    focusDeterminer: 'indefinite',
  },
  holy_symbol: {
    ...SPELLCASTING_GEAR_KIND_ENTRIES.holy_symbol,
    focusDeterminer: 'indefinite',
  },
  spellbook: {
    ...SPELLCASTING_GEAR_KIND_ENTRIES.spellbook,
    focusDeterminer: 'possessive',
  },
  musical_instrument: {
    ...TOOL_CATEGORY_ENTRIES.musical_instrument,
    focusDeterminer: 'indefinite',
  },
} as const satisfies Record<string, ClassSpellcastingFocusKindEntry>

export type ClassSpellcastingFocusKind = keyof typeof CLASS_SPELLCASTING_FOCUS_KIND_ENTRIES

export const CLASS_SPELLCASTING_FOCUS_KINDS = keysFromEntries(CLASS_SPELLCASTING_FOCUS_KIND_ENTRIES)

export const classSpellcastingFocusKindSchema = closedSetEnum(CLASS_SPELLCASTING_FOCUS_KINDS)

export function getClassSpellcastingFocusKindEntry(
  kind: string,
): ClassSpellcastingFocusKindEntry | undefined {
  return CLASS_SPELLCASTING_FOCUS_KIND_ENTRIES[kind as ClassSpellcastingFocusKind]
}

export function getClassSpellcastingFocusKindLabel(kind: string): string {
  return getClassSpellcastingFocusKindEntry(kind)?.label ?? kind
}

export function getClassSpellcastingFocusKindSentenceForm(kind: string, count: number): string {
  const entry = getClassSpellcastingFocusKindEntry(kind)
  if (!entry) return kind
  return getTermSentenceForm(entry, count)
}

export function isClassSpellcastingFocusKind(kind: string): kind is ClassSpellcastingFocusKind {
  return (CLASS_SPELLCASTING_FOCUS_KINDS as readonly string[]).includes(kind)
}

export function isSpellcastingGearFocusKind(
  kind: ClassSpellcastingFocusKind,
): kind is Exclude<ClassSpellcastingFocusKind, 'musical_instrument' | 'spellbook'> {
  return kind !== 'musical_instrument' && kind !== 'spellbook'
}
