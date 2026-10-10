/** BEM class prefixes for shared UI (`ui-`) and dashboard compositions (`dash-`). */
export const SEMANTIC_CLASS_PREFIXES = ['ui-', 'dash-'] as const

export type SemanticClassPrefix = 'ui' | 'dash'

/** Custom properties owned by a semantic block, e.g. `--ui-button-bg`. */
export function semanticCustomPropertyPrefix(classPrefix: SemanticClassPrefix): string {
  return `--${classPrefix}-`
}
