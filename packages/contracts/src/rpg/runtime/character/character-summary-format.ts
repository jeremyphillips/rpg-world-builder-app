export const CHARACTER_SUMMARY_SEPARATOR = ' · ' as const

export type CharacterSummaryParts = {
  species?: {
    name: string
    heritageName?: string
  }
  /** When set with empty classes, renders a classless level segment (e.g. Level 0). */
  classlessLevel?: number
  classes: readonly {
    name: string
    level: number
    subclassName?: string
  }[]
}

export function formatCharacterSpeciesSegment(
  species: NonNullable<CharacterSummaryParts['species']>,
): string {
  return species.heritageName ? `${species.name} (${species.heritageName})` : species.name
}

export function formatCharacterClassSegment(
  entry: CharacterSummaryParts['classes'][number],
  options: { includeLevel: boolean },
): string {
  const subclassPart = entry.subclassName ? ` (${entry.subclassName})` : ''
  if (options.includeLevel) {
    return `${entry.name} ${entry.level}${subclassPart}`
  }

  return `${entry.name}${subclassPart}`
}

/** Display segments for species and advancement — not a mutation of domain parts. */
export function formatCharacterSummarySegments(parts: CharacterSummaryParts): string[] {
  const segments: string[] = []

  if (parts.species?.name) {
    segments.push(formatCharacterSpeciesSegment(parts.species))
  }

  const classes = parts.classes.filter((entry) => entry.name.trim().length > 0)
  if (classes.length === 0) {
    if (parts.classlessLevel !== undefined) {
      segments.push(`Level ${parts.classlessLevel}`)
    }
    return segments
  }

  const totalLevel = classes.reduce((total, entry) => total + entry.level, 0)

  if (classes.length === 1) {
    const classSegment = formatCharacterClassSegment(classes[0]!, { includeLevel: false })
    segments.push(`Level ${totalLevel} ${classSegment}`)
  } else {
    segments.push(`Level ${totalLevel}`)
    segments.push(
      classes
        .map((entry) => formatCharacterClassSegment(entry, { includeLevel: true }))
        .join(' / '),
    )
  }

  return segments
}

export function formatCharacterSummary(parts: CharacterSummaryParts): string {
  return formatCharacterSummarySegments(parts).join(CHARACTER_SUMMARY_SEPARATOR)
}
