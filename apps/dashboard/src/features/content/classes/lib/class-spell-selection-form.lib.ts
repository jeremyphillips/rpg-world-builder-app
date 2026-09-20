import type { ClassGainProgression, ClassSpellSelection, SpellMutationPolicy } from '@rpg/contracts'

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

export function formatRegularGainSummary(acquisition: ClassGainProgression | undefined): string {
  const regular = detectRegularGain(acquisition)
  if (!regular) {
    const count = acquisition?.curve.rows.length ?? 0
    return `Spell acquisition varies by class level · ${count} change level${count === 1 ? '' : 's'}`
  }
  return `Start with ${regular.starting} · Gain ${regular.perLevel} each level through level ${regular.throughLevel}`
}

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

export function remapProgressionOnModelSwitch(input: {
  previousModel: ClassSpellSelection['model'] | undefined
  nextModel: ClassSpellSelection['model']
  progression: ClassSpellSelection extends never
    ? never
    : import('@rpg/contracts').ClassSpellcastingProgression | undefined
}): import('@rpg/contracts').ClassSpellcastingProgression | undefined {
  const progression = input.progression ?? {}
  if (input.previousModel === input.nextModel) return progression

  const next = { ...progression }

  if (
    input.previousModel === 'limitedRepertoire' &&
    (input.nextModel === 'prepareFromClassList' ||
      input.nextModel === 'prepareFromLearnedCollection')
  ) {
    if (next.repertoire) {
      next.preparedSpells = next.repertoire
      delete next.repertoire
    }
  }

  if (
    (input.previousModel === 'prepareFromClassList' ||
      input.previousModel === 'prepareFromLearnedCollection') &&
    input.nextModel === 'limitedRepertoire'
  ) {
    if (next.preparedSpells) {
      next.repertoire = next.preparedSpells
      delete next.preparedSpells
    }
  }

  return next
}
