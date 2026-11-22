import {
  formatMonsterQualifiedHeading,
  limitedUseSchema,
  resolveMonsterEntryHeading,
  type Monster,
} from '@rpg/contracts'

function headingSource(row: unknown): {
  limitedUse: unknown
  onlyInFormIds: readonly string[] | undefined
} {
  if (!row || typeof row !== 'object') return { limitedUse: undefined, onlyInFormIds: undefined }
  const source = row as { limitedUse?: unknown; onlyInFormIds?: unknown }
  const ids = Array.isArray(source.onlyInFormIds)
    ? source.onlyInFormIds.filter((id): id is string => typeof id === 'string')
    : undefined
  return { limitedUse: source.limitedUse, onlyInFormIds: ids }
}

/** Stat-block heading qualifiers shared by detail view models and rules previews. */
export function applyMonsterEntryHeadingQualifiers(
  monster: Pick<Monster, 'name' | 'forms'>,
  name: string,
  row: unknown,
): string {
  const source = headingSource(row)
  const parsed = limitedUseSchema.safeParse(source.limitedUse)
  const heading = resolveMonsterEntryHeading({
    name,
    onlyInFormIds: source.onlyInFormIds,
    forms: monster.forms,
    creatureName: monster.name,
  })
  return formatMonsterQualifiedHeading(heading.name, {
    limitedUse: parsed.success ? parsed.data : undefined,
    formQualifier: heading.formQualifier,
  })
}
