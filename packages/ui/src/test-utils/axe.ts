import { expect, it } from 'vitest'
import axe from 'axe-core'

/** Vitest axe runs in CI by default; set FORCE_AXE=1 locally to opt in. */
export function shouldRunAxe(): boolean {
  return process.env.CI === 'true' || process.env.FORCE_AXE === '1'
}

/** Dedicated axe test blocks — skipped locally (no render cost). Use for axe-only `it` cases. */
export function itAxe(name: string, fn: () => void | Promise<void>, timeout?: number): void {
  ;(shouldRunAxe() ? it : it.skip)(name, fn, timeout)
}

/**
 * Runs axe against a rendered node and asserts zero violations.
 *
 * Skipped locally unless `CI=true` or `FORCE_AXE=1`. Use inside mixed tests that
 * also assert behavior, or inside `itAxe` blocks for axe-only coverage.
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
  if (!shouldRunAxe()) return

  const results = await axe.run(node as axe.ElementContext, {
    ...options,
    rules: { 'color-contrast': { enabled: false }, ...options.rules },
  })
  expect(results.violations).toEqual([])
}
