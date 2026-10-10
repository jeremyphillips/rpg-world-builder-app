type SemanticClassOptionSpec = {
  value: string
  className: string
}

/**
 * Build Storybook `argTypes` option descriptions from style specs
 * (e.g. `sm → ui-button--sm`).
 */
export function semanticClassArgTypeDescription(
  specs: readonly SemanticClassOptionSpec[],
  propLabel: string,
): string {
  return specs.map((spec) => `${spec.value} → ${spec.className}`).join('; ')
}

export function semanticClassSelectArgType(
  specs: readonly SemanticClassOptionSpec[],
  propLabel: string,
) {
  return {
    description: semanticClassArgTypeDescription(specs, propLabel),
  }
}
