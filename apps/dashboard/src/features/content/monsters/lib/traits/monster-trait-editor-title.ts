import {
  formatCreatureTrait,
  formatMonsterStatBlockSubject,
  resolveTraitName,
  type ContentTrait,
} from '@rpg/contracts'

function isRecord(row: unknown): row is Record<string, unknown> {
  return typeof row === 'object' && row !== null
}

function isTemplateRow(row: unknown): row is {
  id?: string
  templateId: string
  config?: unknown
  nameOverride?: string
} {
  return isRecord(row) && typeof row.templateId === 'string'
}

function isPresetRow(row: unknown): row is { preset: string } & Record<string, unknown> {
  return isRecord(row) && typeof row.preset === 'string' && !isTemplateRow(row)
}

function storedText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function traitOrdinalLabel(ordinal: number): string {
  return `Trait ${ordinal}`
}

export function rowId(row: unknown, index: number): string {
  if (isRecord(row) && typeof row.id === 'string' && row.id) return row.id
  return `index:${index}`
}

/** Numbered labels for custom traits whose stored name is empty. */
export function monsterCustomTraitFallbacks(
  rows: readonly unknown[],
  monsterName: string,
): Map<string, string> {
  const taken = new Set<string>()
  const emptyIds: string[] = []
  rows.forEach((row, index) => {
    const title = monsterTraitResolvedTitle(row, monsterName)
    if (title) {
      taken.add(title)
      return
    }
    if (!isPresetRow(row) && !isTemplateRow(row)) emptyIds.push(rowId(row, index))
  })

  const fallbacks = new Map<string, string>()
  let ordinal = 1
  for (const id of emptyIds) {
    let label = traitOrdinalLabel(ordinal)
    while (taken.has(label)) {
      ordinal += 1
      label = traitOrdinalLabel(ordinal)
    }
    fallbacks.set(id, label)
    taken.add(label)
    ordinal += 1
  }
  return fallbacks
}

export function templateDerivedName(row: {
  id?: string
  templateId: string
  config?: unknown
}): string {
  return resolveTraitName({
    kind: 'template',
    id: row.id ?? 'row',
    templateId: row.templateId,
    config: row.config,
  } as ContentTrait)
}

export function monsterTraitResolvedTitle(row: unknown, monsterName: string): string {
  if (isTemplateRow(row)) {
    const override = storedText(row.nameOverride)
    return override || templateDerivedName(row)
  }
  if (isPresetRow(row)) {
    const formatted = formatCreatureTrait({
      subject: formatMonsterStatBlockSubject(monsterName),
      trait: row as Parameters<typeof formatCreatureTrait>[0]['trait'],
    })
    return formatted?.name ?? (typeof row.preset === 'string' ? row.preset : '')
  }
  return storedText(isRecord(row) ? row.name : undefined)
}
