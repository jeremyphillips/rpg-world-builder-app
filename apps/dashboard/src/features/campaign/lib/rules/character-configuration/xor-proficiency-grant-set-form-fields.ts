import { type FieldOption, type FieldVisibility, type FormItem, toOptions } from '@rpg/ui/form'

export const XOR_GRANT_SET_MODES = ['none', 'category', 'specific'] as const

export type XorGrantSetMode = (typeof XOR_GRANT_SET_MODES)[number]

const XOR_GRANT_SET_MODE_LABELS: Record<XorGrantSetMode, string> = {
  none: 'None',
  category: 'Category',
  specific: 'Specific',
}

export type XorProficiencyGrantSetFieldOptions = {
  modeFieldName: string
  categoriesPath: string
  itemsPath: string
  label: string
  hint?: string
  categoryOptions: FieldOption[]
  itemOptions: FieldOption[]
  categoriesLabel?: string
  itemsLabel?: string
  separator?: 'subtle'
}

function visibleWhenGrantMode(modeFieldName: string, mode: XorGrantSetMode): FieldVisibility {
  return {
    dependsOn: [modeFieldName],
    visibleWhen: (watched) => watched[modeFieldName] === mode,
  }
}

/** Shared none | category | specific grant-set field anatomy for level 0 armor and weapons. */
export function xorProficiencyGrantSetFields(
  options: XorProficiencyGrantSetFieldOptions,
): FormItem[] {
  const {
    modeFieldName,
    categoriesPath,
    itemsPath,
    label,
    hint,
    categoryOptions,
    itemOptions,
    categoriesLabel = 'Categories',
    itemsLabel = 'Specific items',
    separator,
  } = options

  return [
    {
      type: 'radio',
      name: modeFieldName,
      label,
      hint,
      orientation: 'horizontal',
      options: toOptions(XOR_GRANT_SET_MODES, XOR_GRANT_SET_MODE_LABELS),
      ...(separator ? { separator } : {}),
    },
    {
      type: 'chips',
      name: categoriesPath,
      label: categoriesLabel,
      chrome: { variant: 'panel' },
      options: categoryOptions,
      visibility: visibleWhenGrantMode(modeFieldName, 'category'),
    },
    {
      type: 'combobox',
      name: itemsPath,
      label: itemsLabel,
      multiple: true,
      options: itemOptions,
      placeholder: 'Choose items…',
      width: 'xl',
      visibility: visibleWhenGrantMode(modeFieldName, 'specific'),
    },
  ]
}

export function xorGrantSetModeFromGrantSet(grant: {
  categories: readonly string[]
  items: readonly string[]
}): XorGrantSetMode {
  if (grant.items.length > 0) return 'specific'
  if (grant.categories.length > 0) return 'category'
  return 'none'
}

export function xorGrantSetFromForm(
  mode: XorGrantSetMode,
  categories: readonly string[],
  items: readonly string[],
): { categories: string[]; items: string[] } {
  switch (mode) {
    case 'none':
      return { categories: [], items: [] }
    case 'category':
      return { categories: [...categories], items: [] }
    case 'specific':
      return { categories: [], items: [...items] }
  }
}
