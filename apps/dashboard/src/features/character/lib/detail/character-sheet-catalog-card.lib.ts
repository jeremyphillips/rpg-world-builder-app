import type { CatalogMetadataLine } from '@/features/content/components/catalog'

export type CharacterSheetItemSource = {
  label: string
}

export type CharacterSheetCatalogCardStatus = 'resolved' | 'missing'

export type CharacterSheetCatalogCardBase = {
  id: string
  displayName: string
  referenceId: string
  sources: readonly CharacterSheetItemSource[]
}

export type CharacterSheetCatalogCardResolved<
  TEntity,
  TEntry,
  TExtra extends object = Record<string, never>,
  TEntityKey extends string = 'entity',
> = CharacterSheetCatalogCardBase &
  TExtra & {
    status: 'resolved'
    entry: TEntry
  } & Record<TEntityKey, TEntity>

export type CharacterSheetCatalogCardMissing<
  TEntry,
  TExtra extends object = Record<string, never>,
> = CharacterSheetCatalogCardBase &
  TExtra & {
    status: 'missing'
    entry: TEntry
  }

export type CharacterSheetCatalogCard<
  TEntity,
  TEntry,
  TExtra extends object = Record<string, never>,
  TEntityKey extends string = 'entity',
> =
  | CharacterSheetCatalogCardResolved<TEntity, TEntry, TExtra, TEntityKey>
  | CharacterSheetCatalogCardMissing<TEntry, TExtra>

export type CatalogHeaderModelBase<TTone extends string = string> = {
  name: string
  metadataLines: readonly CatalogMetadataLine[]
  tone: TTone
  unavailableMessage?: string
}

export const CHARACTER_SHEET_CATALOG_UNAVAILABLE_MESSAGES = {
  equipment: 'Equipment reference unavailable',
  spell: 'Spell reference unavailable',
} as const

export type CharacterSheetCatalogContentKind =
  keyof typeof CHARACTER_SHEET_CATALOG_UNAVAILABLE_MESSAGES

export function catalogHeaderAvailability(
  status: CharacterSheetCatalogCardStatus,
  contentKind: CharacterSheetCatalogContentKind,
): { tone: 'default' | 'unavailable'; unavailableMessage?: string } {
  if (status === 'missing') {
    return {
      tone: 'unavailable',
      unavailableMessage: CHARACTER_SHEET_CATALOG_UNAVAILABLE_MESSAGES[contentKind],
    }
  }

  return { tone: 'default' }
}

export function buildResolvedCatalogCard<
  TEntity,
  TEntry,
  TExtra extends object,
  TEntityKey extends string,
>(
  base: CharacterSheetCatalogCardBase & TExtra,
  entry: TEntry,
  entity: TEntity,
  entityKey: TEntityKey,
): CharacterSheetCatalogCardResolved<TEntity, TEntry, TExtra, TEntityKey> {
  return {
    ...base,
    status: 'resolved',
    entry,
    [entityKey]: entity,
  } as CharacterSheetCatalogCardResolved<TEntity, TEntry, TExtra, TEntityKey>
}

export function buildMissingCatalogCard<TEntry, TExtra extends object>(
  base: CharacterSheetCatalogCardBase & TExtra,
  entry: TEntry,
  overrides: Partial<CharacterSheetCatalogCardBase> = {},
): CharacterSheetCatalogCardMissing<TEntry, TExtra> {
  return {
    ...base,
    ...overrides,
    status: 'missing',
    entry,
  }
}
