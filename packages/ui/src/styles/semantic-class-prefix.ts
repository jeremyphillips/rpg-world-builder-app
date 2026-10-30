/** Component-block prefixes (`ui-`, `dash-`). BEM `--` modifiers are not limited to these prefixes. */
export const SEMANTIC_CLASS_PREFIXES = ['ui-', 'dash-'] as const

export type SemanticClassPrefix = 'ui' | 'dash'

/** Custom properties owned by a semantic block, e.g. `--ui-button-bg`. */
export function semanticCustomPropertyPrefix(classPrefix: SemanticClassPrefix): string {
  return `--${classPrefix}-`
}
