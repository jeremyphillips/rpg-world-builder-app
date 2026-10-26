import { createRequire } from 'node:module'
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Browser } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { launchHeadlessChromium } from '../../test-utils/launch-headless-chromium.lib'

const globalsPath = join(dirname(fileURLToPath(import.meta.url)), '../../styles/globals.css')

const REPLACEMENT =
  'rounded-lg border p-4 bg-semantic-neutral-soft text-semantic-neutral-soft-foreground font-medium ui-border--default'
const LEGACY_SHELL = 'rounded-lg border p-4 ui-border--default callout-legacy'

const PROBE_HTML = `<!doctype html>
<html>
  <body>
    <div id="light">
      <div id="light-replacement" class="${REPLACEMENT}">Neutral</div>
      <div id="light-legacy" class="${LEGACY_SHELL}">Neutral</div>
      <div id="light-plain">Neutral</div>
    </div>
    <div class="dark">
      <div id="dark-replacement" class="${REPLACEMENT}">Neutral</div>
      <div id="dark-legacy" class="${LEGACY_SHELL}">Neutral</div>
      <div id="dark-plain">Neutral</div>
    </div>
    <div style="--surface-current: oklch(0.3 0.02 250)">
      <div id="nested-replacement" class="${REPLACEMENT}">Neutral</div>
      <div id="nested-legacy" class="${LEGACY_SHELL}">Neutral</div>
    </div>
  </body>
</html>`

/**
 * Soft-neutral tokens that `.dark` overrides. `@theme` `--color-semantic-*` aliases are
 * computed on `:root`, so they stay on the light value inside `.dark`.
 */
const LEGACY_SURFACE = `
@layer components {
  .callout-legacy {
    background-color: var(--semantic-neutral-soft-bg);
    color: var(--semantic-neutral-soft-foreground);
    font-weight: var(--font-weight-medium);
    border-color: var(--ui-border-color);
  }
}
`

type TailwindNode = {
  compile: (
    css: string,
    options: { base: string; from: string; onDependency: () => void },
  ) => Promise<{ build: (candidates: string[]) => string }>
}

function loadTailwindNode(): TailwindNode {
  const fromUi = createRequire(import.meta.url)
  const viteEntry = realpathSync(fromUi.resolve('@tailwindcss/vite'))
  const vitePackage = join(dirname(viteEntry), '..', 'package.json')
  return createRequire(vitePackage)('@tailwindcss/node') as TailwindNode
}

const PAINT = [
  'backgroundColor',
  'color',
  'fontWeight',
  'fontSize',
  'lineHeight',
  'borderTopWidth',
  'borderTopColor',
] as const

describe('neutral callout parity', () => {
  let browser: Browser
  let css: string

  beforeAll(async () => {
    const tailwind = loadTailwindNode()
    const compiler = await tailwind.compile(readFileSync(globalsPath, 'utf8'), {
      base: dirname(globalsPath),
      from: globalsPath,
      onDependency() {},
    })
    css = compiler.build([...REPLACEMENT.split(' '), 'callout-legacy', 'dark'])
    browser = await launchHeadlessChromium()
  }, 180_000)

  afterAll(async () => {
    await browser?.close()
  })

  it('matches the previous soft-neutral shell in light, dark, and nested surfaces', async () => {
    const page = await browser.newPage()
    await page.setContent(PROBE_HTML)
    await page.addStyleTag({ content: css })
    await page.addStyleTag({ content: LEGACY_SURFACE })

    const styles = await page.evaluate((paint) => {
      const read = (id: string) => {
        const computed = getComputedStyle(document.getElementById(id)!)
        return Object.fromEntries(paint.map((key) => [key, computed[key]]))
      }
      return {
        lightReplacement: read('light-replacement'),
        lightLegacy: read('light-legacy'),
        lightPlain: read('light-plain'),
        darkReplacement: read('dark-replacement'),
        darkLegacy: read('dark-legacy'),
        darkPlain: read('dark-plain'),
        nestedReplacement: read('nested-replacement'),
        nestedLegacy: read('nested-legacy'),
      }
    }, PAINT)

    await page.close()

    expect(styles.lightReplacement).toEqual(styles.lightLegacy)
    expect(styles.darkReplacement).toEqual(styles.darkLegacy)
    expect(styles.nestedReplacement).toEqual(styles.nestedLegacy)
    expect(styles.lightReplacement.fontSize).toBe(styles.lightPlain.fontSize)
    expect(styles.lightReplacement.lineHeight).toBe(styles.lightPlain.lineHeight)
    expect(styles.darkReplacement.fontSize).toBe(styles.darkPlain.fontSize)
    expect(styles.darkReplacement.lineHeight).toBe(styles.darkPlain.lineHeight)
    expect(styles.lightReplacement.fontWeight).toBe('500')
    expect(styles.lightReplacement.borderTopWidth).toBe('1px')
    expect(styles.darkReplacement.backgroundColor).not.toBe(styles.lightReplacement.backgroundColor)
  })
})
