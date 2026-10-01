import type {
  Ability,
  Character,
  CharacterEquipment,
  CharacterFeatEntry,
  CharacterNarrative,
  CharacterProficiencies,
  CharacterSpellEntry,
  CharacterVitalState,
} from '@rpg/contracts'

export type CharacterDetailSourceClassEntry = {
  classId?: string
  subclassId?: string
  level: number
}

/** Presentation input for the character detail view model — persisted sheet or tolerant draft projection. */
export type CharacterDetailSource = {
  id: string
  name: string
  gender?: Character['gender']
  /** Omit on draft preview; `null` is a persisted “no XP tracked” value. */
  xp?: number | null
  species?: { id: string; heritageId?: string }
  classes: readonly CharacterDetailSourceClassEntry[]
  abilityScores?: Partial<Record<Ability, number>>
  hitPoints?: {
    current?: number
    base?: number
    temporary?: number
  }
  proficiencies: CharacterProficiencies
  spells: readonly CharacterSpellEntry[]
  equipment: CharacterEquipment
  wealth?: Character['wealth']
  feats: readonly CharacterFeatEntry[]
  narrative?: CharacterNarrative
  vital?: CharacterVitalState
  alignment?: Character['alignment']
  /** When set (draft preview), overrides catalog summary formatting. */
  identitySummary?: string
}

export type CharacterDetailProjectionCompleteness = {
  /** When true, preview surfaces show the quiet completeness line. */
  showPreviewNotice: boolean
}

export function toCharacterDetailSource(character: Character): CharacterDetailSource {
  return {
    id: character.id,
    name: character.name,
    gender: character.gender,
    xp: character.xp,
    species: character.species,
    classes: character.classes,
    abilityScores: character.abilityScores,
    hitPoints: character.hitPoints,
    proficiencies: character.proficiencies,
    spells: character.spells,
    equipment: character.equipment,
    wealth: character.wealth,
    feats: character.feats,
    narrative: character.narrative,
    vital: character.vital,
    alignment: character.alignment,
  }
}

export function characterDetailSourceSummaryInput(
  source: CharacterDetailSource,
): Pick<Character, 'classes' | 'species'> | undefined {
  if (!source.species?.id) return undefined

  const classes = source.classes.flatMap((entry) =>
    entry.classId
      ? [
          {
            classId: entry.classId,
            level: entry.level,
            ...(entry.subclassId ? { subclassId: entry.subclassId } : {}),
          },
        ]
      : [],
  )

  return {
    species: { id: source.species.id, heritageId: source.species.heritageId },
    classes,
  }
}
