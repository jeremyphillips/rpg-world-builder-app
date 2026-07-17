import type {
  ArrayConfig,
  ComboboxFieldConfig,
  DependentConfig,
  DiceFormulaFieldConfig,
  FormItem,
  GroupConfig,
  InlineSentenceFieldConfig,
  SelectFieldConfig,
} from './field-config'

/**
 * Authoring helpers for schema-driven form configs.
 *
 * Three complementary layers:
 * - **`defineForm` / `defineFormItems`** — form-level structure and reusable field groups
 * - **`define*Field`** — variant-specific completion for complex field types
 *   (`defineArrayField`, `defineDiceFormulaField`, …)
 * - **JSDoc on `field-config.ts`** — inline reference for defaults and allowed values
 *
 * Plain object literals remain fully valid; helpers are optional identity wrappers that
 * preserve literal types for editor completion. See `packages/ui/docs/forms.md`.
 */

/** Top-level field tree passed to `<Form fields={…}>` or a tab's `fields` array. */
export function defineForm<const T extends readonly FormItem[]>(fields: T): T {
  return fields
}

/** Reusable partial trees — tab panels, exported builders, composable sections. */
export function defineFormItems<const T extends readonly FormItem[]>(items: T): T {
  return items
}

/** Repeatable list section (`kind: 'array'`). */
export function defineArrayField<const T extends ArrayConfig>(config: T): T {
  return config
}

/** Dropdown bound to a string value (`type: 'select'`). */
export function defineSelectField<const T extends SelectFieldConfig>(config: T): T {
  return config
}

/** Controller + dependent fields column (`kind: 'dependent'`). */
export function defineDependentField<const T extends DependentConfig>(config: T): T {
  return config
}

/** Named fieldset subsection (`kind: 'group'`). */
export function defineGroupField<const T extends GroupConfig>(config: T): T {
  return config
}

/** Searchable option picker (`type: 'combobox'`). */
export function defineComboboxField<const T extends ComboboxFieldConfig>(config: T): T {
  return config
}

/** XdY dice notation with optional tail operand (`type: 'diceFormula'`). */
export function defineDiceFormulaField<const T extends DiceFormulaFieldConfig>(config: T): T {
  return config
}

/** Inline prose + bound controls (`type: 'inlineSentence'`). */
export function defineInlineSentenceField<const T extends InlineSentenceFieldConfig>(config: T): T {
  return config
}
