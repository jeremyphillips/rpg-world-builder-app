import type { FormValueSync } from '@rpg/ui/form'

import type {
  ClassGainProgression,
  ClassSpellcastingProgression,
  ClassSpellSelection,
  SpellMutationPolicy,
} from '@rpg/contracts'

export const SPELL_SELECTION_MODEL_OPTIONS = [
  {
    value: 'limitedRepertoire',
    label: 'Limited repertoire',
    description: 'Spells known expand at level-up from the class spell list.',
  },
  {
    value: 'prepareFromClassList',
    label: 'Prepare from class spell list',
    description: 'Prepare a daily loadout from the full class spell list.',
  },
  {
    value: 'prepareFromLearnedCollection',
    label: 'Prepare from a learned collection',
    description: 'Learn spells into a durable collection, then prepare from it.',
  },
] as const

export const SPELL_SELECTION_CHANGE_PACKAGE_OPTIONS = [
  { value: 'levelUp:1', label: 'When gaining a class level · Replace 1' },
  { value: 'longRest:1', label: 'After a Long Rest · Replace 1' },
  { value: 'longRest:all', label: 'After a Long Rest · Replace all' },
  { value: 'none', label: 'Cannot normally replace' },
] as const

export type SpellSelectionChangePackage =
  (typeof SPELL_SELECTION_CHANGE_PACKAGE_OPTIONS)[number]['value']

export function spellSelectionChangePackageFromPolicy(
  change: SpellMutationPolicy | undefined,
): SpellSelectionChangePackage {
  if (!change || change.kind === 'none') return 'none'
  if (change.trigger === 'levelUp' && change.limit === 1) return 'levelUp:1'
  if (change.trigger === 'longRest' && change.limit === 1) return 'longRest:1'
  if (change.trigger === 'longRest' && change.limit === 'all') return 'longRest:all'
  return 'none'
}

export function spellSelectionChangePolicyFromPackage(
  value: SpellSelectionChangePackage,
): SpellMutationPolicy {
  switch (value) {
    case 'levelUp:1':
      return { kind: 'replace', trigger: 'levelUp', limit: 1 }
    case 'longRest:1':
      return { kind: 'replace', trigger: 'longRest', limit: 1 }
    case 'longRest:all':
      return { kind: 'replace', trigger: 'longRest', limit: 'all' }
    case 'none':
      return { kind: 'none' }
  }
}

export function detectRegularGain(acquisition: ClassGainProgression | undefined): {
  starting: number
  perLevel: number
  throughLevel: number
} | null {
  const rows = [...(acquisition?.curve.rows ?? [])].sort((left, right) => left.level - right.level)
  if (rows.length === 0) return null
  const first = rows[0]
  if (!first || first.level !== 1) return null
  const starting = first.count
  const laterRows = rows.filter((row) => row.level > 1)
  if (laterRows.length === 0) return null
  const perLevel = laterRows[0]!.count
  if (!laterRows.every((row) => row.count === perLevel)) return null
  const maxLevel = rows[rows.length - 1]?.level ?? 1
  for (let level = 2; level <= maxLevel; level += 1) {
    if (!rows.some((row) => row.level === level)) return null
  }
  return { starting, perLevel, throughLevel: maxLevel }
}

export function materializeRegularGain(input: {
  starting: number
  perLevel: number
  throughLevel: number
}): ClassGainProgression {
  const rows = [
    { level: 1, count: input.starting },
    ...Array.from({ length: Math.max(0, input.throughLevel - 1) }, (_, index) => ({
      level: index + 2,
      count: input.perLevel,
    })),
  ]
  return { curve: { rows }, extension: 'zero' }
}

export function formatRegularGainSummary(input: {
  starting?: number
  perLevel?: number
  throughLevel?: number
  acquisition?: ClassGainProgression
}): string {
  const regular =
    input.starting !== undefined && input.perLevel !== undefined && input.throughLevel !== undefined
      ? { starting: input.starting, perLevel: input.perLevel, throughLevel: input.throughLevel }
      : detectRegularGain(input.acquisition)
  if (regular) {
    return `Start with ${regular.starting} · Gain ${regular.perLevel} each level through level ${regular.throughLevel}`
  }
  const acquisition = input.acquisition
  const count = acquisition?.curve.rows.length ?? 0
  return `Spell acquisition varies by class level · ${count} change level${count === 1 ? '' : 's'}`
}

export function formatRegularGainAlert(input: {
  starting?: number
  perLevel?: number
  throughLevel?: number
}): string | undefined {
  if (
    input.starting === undefined ||
    input.perLevel === undefined ||
    input.throughLevel === undefined
  ) {
    return undefined
  }

  const startingLabel = input.starting === 1 ? '1 spell' : `${input.starting} spells`
  const perLevelLabel = input.perLevel === 1 ? '1 spell' : `${input.perLevel} spells`

  return `Start with ${startingLabel}. Gain ${perLevelLabel} at each later level through level ${input.throughLevel}.`
}

export const SPELLBOOK_GAIN_MODE_REGULAR = 'regular' as const
export const SPELLBOOK_GAIN_MODE_VARIABLE = 'variable' as const

export type SpellbookGainMode =
  | typeof SPELLBOOK_GAIN_MODE_REGULAR
  | typeof SPELLBOOK_GAIN_MODE_VARIABLE

export const SPELLBOOK_GAIN_MODE_OPTIONS = [
  {
    value: SPELLBOOK_GAIN_MODE_REGULAR,
    label: 'Same amount each level',
    description: 'Start with a number of spells, then gain the same number at each later level.',
  },
  {
    value: SPELLBOOK_GAIN_MODE_VARIABLE,
    label: 'Varies by level',
    description: 'Specify exactly how many spells are gained at each level.',
  },
] as const

export function spellSelectionFromForm(input: {
  model: ClassSpellSelection['model'] | undefined
  changePackage: SpellSelectionChangePackage
  acquisition?: ClassGainProgression
}): ClassSpellSelection | undefined {
  if (!input.model) return undefined
  const change = spellSelectionChangePolicyFromPackage(input.changePackage)
  if (input.model === 'prepareFromLearnedCollection') {
    return {
      model: input.model,
      collection: 'spellbook',
      acquisition: input.acquisition ?? { curve: { rows: [] }, extension: 'zero' },
      change,
    }
  }
  return { model: input.model, change }
}

export function alignProgressionToModel(
  model: ClassSpellSelection['model'] | undefined,
  progression: ClassSpellcastingProgression | undefined,
): ClassSpellcastingProgression | undefined {
  if (!model || !progression) return progression

  const next = { ...progression }

  if (model === 'limitedRepertoire' && next.preparedSpells) {
    next.repertoire = next.repertoire ?? next.preparedSpells
    delete next.preparedSpells
  }

  if (
    (model === 'prepareFromClassList' || model === 'prepareFromLearnedCollection') &&
    next.repertoire
  ) {
    next.preparedSpells = next.preparedSpells ?? next.repertoire
    delete next.repertoire
  }

  return next
}

export function buildClassSpellSelectionValueSyncs(): FormValueSync[] {
  return [
    {
      dependsOn: ['spellSelectionModel', 'spellcasting.progression'],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes('spellSelectionModel')) return undefined
        const model = values.spellSelectionModel as ClassSpellSelection['model'] | undefined
        const spellcasting = values.spellcasting as
          | { progression?: ClassSpellcastingProgression }
          | undefined
        const aligned = alignProgressionToModel(model, spellcasting?.progression)
        if (aligned === spellcasting?.progression) return undefined
        return { 'spellcasting.progression': aligned }
      },
    },
  ]
}
