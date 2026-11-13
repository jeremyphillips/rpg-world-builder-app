/**
 * Pure helpers for `ArrayConfig.addActionMenu` presentation and append resolution.
 *
 * Evaluates duplicate-policy states against current row values and maps
 * configured menu items to `ButtonDropdown` item props at render time.
 */
import type { ButtonDropdownItem } from '../../../components/ui/button-dropdown.types'
import type { PickerSearchOptions } from '../../../lib/picker-search.types'

export type ArrayAddMenuDuplicatePolicy = 'allow' | 'warn' | 'block'

export type ArrayAddMenuItemConfig = {
  id: string
  label: string
  /** Supporting line shown beneath the label in the add menu. */
  description?: string
  groupId?: string
  searchTerms?: readonly string[]
  aliases?: readonly string[]
  search?: PickerSearchOptions
  appendDefaults: Record<string, unknown> | (() => Record<string, unknown>)
  isDuplicate?: (items: unknown[]) => boolean
  duplicatePolicy?: ArrayAddMenuDuplicatePolicy
}

export type ArrayAddMenuPresentationMap = Partial<
  Record<string, { disabled?: boolean; note?: string }>
>

export type ArrayAddMenuConfig = {
  groups: { id: string; label: string }[]
  items: ArrayAddMenuItemConfig[]
  enableSearch?: boolean
  /** Watched form paths used to refresh menu item presentation. */
  contextDependsOn?: readonly string[]
  presentationWhen?: (
    watched: Record<string, unknown>,
    items: unknown[],
  ) => ArrayAddMenuPresentationMap | undefined
}

export function resolveArrayAddMenuAppendDefaults(
  appendDefaults: Record<string, unknown> | (() => Record<string, unknown>),
): Record<string, unknown> {
  return typeof appendDefaults === 'function' ? appendDefaults() : appendDefaults
}

export function resolveArrayAddMenuItemPresentation(
  item: ArrayAddMenuItemConfig,
  currentItems: unknown[],
): { disabled: boolean; note?: string } {
  const isDuplicate = item.isDuplicate?.(currentItems) ?? false
  const policy = item.duplicatePolicy ?? 'allow'
  if (!isDuplicate || policy === 'allow') {
    return { disabled: false }
  }
  const note = 'Already added'
  if (policy === 'block') {
    return { disabled: true, note }
  }
  return { disabled: false, note }
}

export function buildArrayAddMenuItems(
  addActionMenu: ArrayAddMenuConfig,
  currentItems: unknown[],
  context?: {
    presentation?: ArrayAddMenuPresentationMap
  },
): ButtonDropdownItem[] {
  return addActionMenu.items.map((item) => {
    const presentation = resolveArrayAddMenuItemPresentation(item, currentItems)
    const dynamic = context?.presentation?.[item.id]
    const disabled = presentation.disabled || Boolean(dynamic?.disabled)
    const note = presentation.disabled ? presentation.note : (dynamic?.note ?? presentation.note)
    return {
      id: item.id,
      label: item.label,
      ...(item.description !== undefined ? { metadata: item.description } : {}),
      groupId: item.groupId,
      searchTerms: item.searchTerms,
      aliases: item.aliases,
      search: item.search,
      disabled,
      ...(note !== undefined ? { note } : {}),
    }
  })
}
