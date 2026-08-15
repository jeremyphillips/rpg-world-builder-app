import {
  type FieldConfig,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
  toOptions,
} from '@rpg/ui/form'

export const XOR_GRANT_SET_MODES = ['none', 'category', 'specific'] as const

export type XorGrantSetMode = (typeof XOR_GRANT_SET_MODES)[number]

const XOR_GRANT_SET_MODE_LABELS: Record<XorGrantSetMode, string> = {
  none: 'None',
  category: 'Category',
  specific: 'Specific',
}

export type ModeDependentGrantSetFieldOptions = {
  modeFieldName: string
  modes: readonly string[]
  modeLabels: Record<string, string>
  categoriesPath: string
  itemsPath: string
  label: string
  hint?: FieldConfig['hint']
  categoryOptions: FieldOption[]
  itemOptions: FieldOption[]
  categoriesLabel?: string
  itemsLabel?: string
  categoriesHint?: FieldConfig['hint']
  itemsHint?: FieldConfig['hint']
  categoryMode: string
  specificMode: string
  /** When set, the dependents region hides when the mode equals this value (e.g. `none`). */
  emptyMode?: string
  /** When true, hides the mode radio label while keeping it for accessibility. */
  labelVisibility?: 'visible' | 'srOnly'
  /** Trailing divider after this grant-set block within parent rhythm. */
  separator?: FieldConfig['separator']
}

function visibleWhenGrantMode(modeFieldName: string, mode: string): FieldVisibility {
  return {
    dependsOn: [modeFieldName],
    visibleWhen: (watched) => watched[modeFieldName] === mode,
  }
}

/** Shared mode radio + dependent grant-set editors — decoration is owned by parent composition. */
export function modeDependentGrantSetField(options: ModeDependentGrantSetFieldOptions): FormItem {
  const {
    modeFieldName,
    modes,
    modeLabels,
    categoriesPath,
    itemsPath,
    label,
    hint,
    categoryOptions,
    itemOptions,
    categoriesLabel = 'Categories',
    itemsLabel = 'Specific items',
    categoriesHint,
    itemsHint,
    categoryMode,
    specificMode,
    emptyMode,
    labelVisibility,
    separator,
  } = options

  return {
    kind: 'dependent',
    ...(separator ? { separator } : {}),
    controller: {
      type: 'radio',
      name: modeFieldName,
      label,
      hint,
      orientation: 'horizontal',
      options: toOptions(modes, modeLabels),
      ...(labelVisibility === 'srOnly' ? { labelVisibility } : {}),
    },
    dependents: {
      ...(emptyMode
        ? {
            visibility: {
              dependsOn: [modeFieldName],
              visibleWhen: (watched) => watched[modeFieldName] !== emptyMode,
            },
          }
        : {}),
      chrome: 'none',
      fields: [
        {
          type: 'chips',
          name: categoriesPath,
          label: categoriesLabel,
          ...(categoriesHint ? { hint: categoriesHint } : {}),
          options: categoryOptions,
          visibility: visibleWhenGrantMode(modeFieldName, categoryMode),
        },
        {
          type: 'combobox',
          name: itemsPath,
          label: itemsLabel,
          ...(itemsHint ? { hint: itemsHint } : {}),
          multiple: true,
          options: itemOptions,
          placeholder: 'Choose items…',
          width: 'xl',
          visibility: visibleWhenGrantMode(modeFieldName, specificMode),
        },
      ],
    },
  }
}

export type XorProficiencyGrantSetFieldOptions = Omit<
  ModeDependentGrantSetFieldOptions,
  'modes' | 'modeLabels' | 'categoryMode' | 'specificMode' | 'emptyMode'
>

/** None | category | specific grant-set field anatomy for campaign and class authoring. */
export function xorProficiencyGrantSetField(options: XorProficiencyGrantSetFieldOptions): FormItem {
  return modeDependentGrantSetField({
    ...options,
    modes: XOR_GRANT_SET_MODES,
    modeLabels: XOR_GRANT_SET_MODE_LABELS,
    categoryMode: 'category',
    specificMode: 'specific',
    emptyMode: 'none',
  })
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
