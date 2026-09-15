import type { FieldConfig, FormItem, RowConfig, RowFieldItem } from '../../field-config'

export type NormalizedArrayItemContent = {
  contentLayout: 'inline' | 'stacked'
  /** Leaf fields for a single inline row — set when `contentLayout` is `inline`. */
  inlineFields?: RowFieldItem[]
  /** Source row config when authors wrapped inline fields in `kind: 'row'`. */
  inlineRow?: RowConfig
}

function isInlineEligibleLeafField(item: RowFieldItem): item is FieldConfig {
  return !('kind' in item)
}

function isBareInlineField(item: FormItem): item is FieldConfig {
  return !('kind' in item)
}

/**
 * Normalizes raw array item `fields` into semantic content groups before presentation
 * resolves layout. Equivalent semantic rows (bare leaf, `kind: 'row'`, `inlineSentence`)
 * produce the same `contentLayout`.
 */
export function normalizeArrayItemContent(fields: FormItem[]): NormalizedArrayItemContent {
  if (fields.length === 1) {
    const only = fields[0]
    if (only === undefined) {
      return { contentLayout: 'stacked' }
    }

    if ('kind' in only && only.kind === 'row' && only.fields.every(isInlineEligibleLeafField)) {
      return {
        contentLayout: 'inline',
        inlineFields: only.fields,
        inlineRow: only,
      }
    }

    if (isBareInlineField(only)) {
      return {
        contentLayout: 'inline',
        inlineFields: [only],
      }
    }
  }

  return { contentLayout: 'stacked' }
}
