import type { GameTermEntry } from '../types'
import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'

// ---------------------------------------------------------------------------
// Spell preparation mode — how a class prepares or knows spells (SRD class block).
// ---------------------------------------------------------------------------

export const SPELL_PREPARATION_MODE_ENTRIES = {
  prepared: {
    label: 'Prepared',
    description:
      'The caster prepares a subset of spells from their class list after a long rest (e.g. Cleric, Wizard).',
  },
  known: {
    label: 'Known',
    description:
      'The caster knows a fixed set of spells that expands as they gain levels (e.g. Bard, Sorcerer).',
  },
  full_list: {
    label: 'Full list',
    description:
      'The entire applicable class spell list is available without daily prepared-subset selection (class-wide mode). Per-spell always-prepared grants use grant availability instead.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellPreparationMode = keyof typeof SPELL_PREPARATION_MODE_ENTRIES

export const SPELL_PREPARATION_MODES = keysFromEntries(SPELL_PREPARATION_MODE_ENTRIES)

/** @deprecated Prefer `SPELL_PREPARATION_MODE_ENTRIES[id].label`. */
export const SPELL_PREPARATION_MODE_LABELS = Object.fromEntries(
  Object.entries(SPELL_PREPARATION_MODE_ENTRIES).map(([id, entry]) => [id, entry.label]),
) as {
  readonly [Mode in SpellPreparationMode]: (typeof SPELL_PREPARATION_MODE_ENTRIES)[Mode]['label']
}

export const spellPreparationModeSchema = vocabEnumFromEntries(SPELL_PREPARATION_MODE_ENTRIES)

/** Returns the reference entry for a spell preparation mode id, if known. */
export function getSpellPreparationModeEntry(id: string): GameTermEntry | undefined {
  return SPELL_PREPARATION_MODE_ENTRIES[id as SpellPreparationMode]
}

/** Returns the display label for a spell preparation mode. Falls back to the raw value. */
export function getSpellPreparationModeLabel(id: string): string {
  return getSpellPreparationModeEntry(id)?.label ?? id
}
