import { expect } from 'vitest'
import axe from 'axe-core'

/**
 * Runs axe against a rendered node and asserts zero violations.
 *
 * `color-contrast` is disabled by default: it needs canvas, which jsdom does
 * not implement, and contrast is covered by Storybook's addon-a11y in a real
 * browser. Pass `options.rules` to override or extend the axe run config.
 *
 * @example
 * const { container } = render(<Button>Save</Button>)
 * await expectNoAxeViolations(container)
 */
export async function expectNoAxeViolations(
  node: Element | Document,
  options: axe.RunOptions = {},
): Promise<void> {
  const results = await axe.run(node as axe.ElementContext, {
    ...options,
    rules: { 'color-contrast': { enabled: false }, ...options.rules },
  })
  expect(results.violations).toEqual([])
}
