import type { CharacterClass } from '../../content/classes/class'
import {
  CLASS_CANTRIP_CHOICE_SET_PROGRESSION_ID,
  CLASS_SPELLCASTING_CHOICE_SUFFIXES,
  type ClassSpellcastingChoiceSuffix,
  type Spellcasting,
} from '../../content/classes/spellcasting'
import {
  DEFAULT_SPELL_SELECTION_COLUMN_LABEL,
  resolveSpellSelectionColumnLabel,
  type ClassSpellSelection,
} from '../../content/classes/spellcasting/class-spell-selection'
import type { ClassCapacityProgression } from '../../content/classes/spellcasting/class-capacity-progression'
import type { ClassSpellcastingProgression } from '../../content/classes/spellcasting/class-spellcasting-progression'
import type { ClassGainProgression } from '../../content/classes/spellcasting/class-gain-progression'
import {
  resolveGainQuotaThroughLevel,
  resolveProgressionValueAtLevel,
} from '../../campaign/rules/spellcasting-progression/lookup'
import type { ProgressionCurve } from '../../campaign/rules/spellcasting-progression/progression-curve'
import type { ResolvedSpellcastingProgressionConfig } from '../../campaign/rules/spellcasting-progression/resolve-config'
import { resolveSlotProgressionForClass } from '../../campaign/rules/spellcasting-progression/resolve-config'
import type { SlotProgression } from '../../campaign/rules/spellcasting-progression/slot-progression'
import {
  maxSelectableSpellLevelFromSlotProgression,
  spellcastingFeatureLabelForSlotProgression,
} from '../../campaign/rules/spellcasting-progression/resolve-slots'
import {
  IMMUTABLE_SPELL_MUTATION,
  type SpellMutationPolicy,
} from '../../vocab/spell/spell-mutation-policy'
import type { SpellChoiceSource } from '../../vocab/spell/spell-choice-source'
import type { SpellCollectionKind } from '../../vocab/spell/spell-collection-kind'
import type { ProgressionExtension } from '../../vocab/spell/progression-extension'

// ---------------------------------------------------------------------------
// Class spellcasting resolution — slots + class-owned selection/progression.
// ---------------------------------------------------------------------------

export type CompiledSpellcastingChoiceProgression = {
  /** ChoiceSet suffix — cantrips | repertoire | prepared | spellbook */
  suffix: ClassSpellcastingChoiceSuffix
  kind: 'capacity' | 'gain'
  extension: ProgressionExtension
  source: SpellChoiceSource
  destination: SpellCollectionKind
  mutation: SpellMutationPolicy
  label: string
  curve: ProgressionCurve
  /** Whether the progression appears as a column in the class progression table. */
  showInTable: boolean
}

export type ResolvedClassSpellcastingDisplayColumn = {
  suffix: ClassSpellcastingChoiceSuffix
  label: string
  kind: 'capacity' | 'gain'
  extension: ProgressionExtension
  curve: ProgressionCurve
}

export type ResolvedClassSpellcasting = {
  slotProgression: SlotProgression
  spellSelection: ClassSpellSelection | undefined
  progression: ClassSpellcastingProgression | undefined
  choiceProgressions: CompiledSpellcastingChoiceProgression[]
  displayColumns: ResolvedClassSpellcastingDisplayColumn[]
}

function capacityCurve(progression: ClassCapacityProgression | undefined): ProgressionCurve {
  return progression?.curve ?? { rows: [] }
}

function compileCantripProgression(
  progression: ClassSpellcastingProgression | undefined,
): CompiledSpellcastingChoiceProgression | null {
  if (!progression?.cantrips) return null

  return {
    suffix: CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips,
    kind: 'capacity',
    extension: progression.cantrips.extension,
    source: { kind: 'classList' },
    destination: 'cantrips',
    mutation: IMMUTABLE_SPELL_MUTATION,
    label: 'Cantrips',
    curve: capacityCurve(progression.cantrips),
    showInTable: true,
  }
}

function compileSelectionProgressions(
  spellSelection: ClassSpellSelection | undefined,
  progression: ClassSpellcastingProgression | undefined,
): CompiledSpellcastingChoiceProgression[] {
  if (!spellSelection) return []

  const columnLabel = resolveSpellSelectionColumnLabel(spellSelection)

  switch (spellSelection.model) {
    case 'limitedRepertoire': {
      if (!progression?.repertoire) return []
      return [
        {
          suffix: CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire,
          kind: 'capacity',
          extension: progression.repertoire.extension,
          source: { kind: 'classList' },
          destination: 'repertoire',
          mutation: spellSelection.change,
          label: columnLabel,
          curve: capacityCurve(progression.repertoire),
          showInTable: true,
        },
      ]
    }
    case 'prepareFromClassList': {
      if (!progression?.preparedSpells) return []
      return [
        {
          suffix: CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
          kind: 'capacity',
          extension: progression.preparedSpells.extension,
          source: { kind: 'classList' },
          destination: 'prepared',
          mutation: spellSelection.change,
          label: columnLabel,
          curve: capacityCurve(progression.preparedSpells),
          showInTable: true,
        },
      ]
    }
    case 'prepareFromLearnedCollection': {
      const compiled: CompiledSpellcastingChoiceProgression[] = []
      compiled.push(compileSpellbookGain(spellSelection.acquisition))
      if (progression?.preparedSpells) {
        compiled.push({
          suffix: CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
          kind: 'capacity',
          extension: progression.preparedSpells.extension,
          source: { kind: 'collection', collection: spellSelection.collection },
          destination: 'prepared',
          mutation: spellSelection.change,
          label: columnLabel,
          curve: capacityCurve(progression.preparedSpells),
          showInTable: true,
        })
      }
      return compiled
    }
  }
}

function compileSpellbookGain(
  acquisition: ClassGainProgression,
): CompiledSpellcastingChoiceProgression {
  return {
    suffix: CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook,
    kind: 'gain',
    extension: acquisition.extension,
    source: { kind: 'classList' },
    destination: 'spellbook',
    mutation: IMMUTABLE_SPELL_MUTATION,
    label: 'Spellbook Spells',
    curve: acquisition.curve,
    showInTable: false,
  }
}

function compileChoiceProgressions(
  spellcasting: Spellcasting,
): CompiledSpellcastingChoiceProgression[] {
  const progressions: CompiledSpellcastingChoiceProgression[] = []
  const cantrip = compileCantripProgression(spellcasting.progression)
  if (cantrip) progressions.push(cantrip)
  progressions.push(
    ...compileSelectionProgressions(spellcasting.spellSelection, spellcasting.progression),
  )
  return progressions
}

function compileDisplayColumns(
  choiceProgressions: readonly CompiledSpellcastingChoiceProgression[],
): ResolvedClassSpellcastingDisplayColumn[] {
  return choiceProgressions
    .filter((progression) => progression.showInTable)
    .map((progression) => ({
      suffix: progression.suffix,
      label: progression.label,
      kind: progression.kind,
      extension: progression.extension,
      curve: progression.curve,
    }))
}

/** Resolves class spellcasting: slots, compiled choice progressions, and display columns. */
export function resolveClassSpellcasting(
  characterClass: Pick<CharacterClass, 'spellcasting'>,
  config: ResolvedSpellcastingProgressionConfig,
): ResolvedClassSpellcasting | null {
  const spellcasting = characterClass.spellcasting
  if (!spellcasting) return null

  const slotProgression = resolveSlotProgressionForClass(characterClass, config)
  if (!slotProgression) return null

  const choiceProgressions = compileChoiceProgressions(spellcasting)

  return {
    slotProgression,
    spellSelection: spellcasting.spellSelection,
    progression: spellcasting.progression,
    choiceProgressions,
    displayColumns: compileDisplayColumns(choiceProgressions),
  }
}

export function resolveClassSpellcastingForSpellcasting(
  spellcasting: Spellcasting,
  config: ResolvedSpellcastingProgressionConfig,
): ResolvedClassSpellcasting | null {
  return resolveClassSpellcasting({ spellcasting }, config)
}

export function resolveCompiledChoiceProgressionQuotaAtLevel(
  progression: CompiledSpellcastingChoiceProgression,
  level: number,
): number {
  if (progression.kind === 'gain') {
    return resolveGainQuotaThroughLevel({
      rows: progression.curve.rows,
      level,
      extension: progression.extension,
    }).count
  }

  return resolveProgressionValueAtLevel({
    kind: 'capacity',
    rows: progression.curve.rows,
    level,
    extension: progression.extension,
  }).count
}

export function findCompiledChoiceProgressionBySuffix(
  resolved: ResolvedClassSpellcasting,
  suffix: ClassSpellcastingChoiceSuffix,
  kind?: CompiledSpellcastingChoiceProgression['kind'],
): CompiledSpellcastingChoiceProgression | undefined {
  return resolved.choiceProgressions.find(
    (progression) =>
      progression.suffix === suffix && (kind === undefined || progression.kind === kind),
  )
}

/**
 * Builder-facing spell quota — prepared capacity first, else repertoire capacity.
 */
export function resolveSpellsAvailableFromClass(
  resolved: ResolvedClassSpellcasting,
  level: number,
): number {
  const prepared = findCompiledChoiceProgressionBySuffix(
    resolved,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
    'capacity',
  )
  if (prepared) return resolveCompiledChoiceProgressionQuotaAtLevel(prepared, level)

  const repertoire = findCompiledChoiceProgressionBySuffix(
    resolved,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire,
    'capacity',
  )
  if (repertoire) return resolveCompiledChoiceProgressionQuotaAtLevel(repertoire, level)

  return 0
}

export function resolveMaxSelectableSpellLevelFromClass(
  resolved: ResolvedClassSpellcasting,
  level: number,
): number {
  return maxSelectableSpellLevelFromSlotProgression(resolved.slotProgression, level)
}

export function spellcastingFeatureLabelFromClass(resolved: ResolvedClassSpellcasting): string {
  return spellcastingFeatureLabelForSlotProgression(resolved.slotProgression)
}

/** Whether class uses pact slot progression. */
export function isPactClassSpellcasting(resolved: ResolvedClassSpellcasting): boolean {
  return resolved.slotProgression.kind === 'pact'
}

/** Table columns for class progression display. */
export function resolveClassDisplayChoiceColumns(
  resolved: ResolvedClassSpellcasting,
): ResolvedClassSpellcastingDisplayColumn[] {
  return resolved.displayColumns
}

/** @deprecated Use CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips */
export { CLASS_CANTRIP_CHOICE_SET_PROGRESSION_ID }

/** Default L1+ column label when spellSelection omits columnLabel. */
export { DEFAULT_SPELL_SELECTION_COLUMN_LABEL }
