import { createRequire } from 'node:module'
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Browser } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  fieldAnatomyHeaderBodyGapClasses,
  fieldAnatomyStackVariants,
  fieldSetInFlowLegendClasses,
} from './field.variants'
import { launchHeadlessChromium } from '../../test-utils/launch-headless-chromium.lib'

const globalsPath = join(dirname(fileURLToPath(import.meta.url)), '../../styles/globals.css')

const STACK_MD = fieldAnatomyStackVariants({ size: 'md' })
const STACK_SM = fieldAnatomyStackVariants({ size: 'sm' })
const LEGEND_CONTENTS = fieldSetInFlowLegendClasses

const PROBE_HTML = `<!doctype html>
<html>
  <body>
    <fieldset id="array-labeled-md" class="border-0 p-0 m-0 ${STACK_MD}">
      <legend class="${LEGEND_CONTENTS} w-full min-w-0">
        <div class="text-style-field-label-md"><span>Traits</span></div>
      </legend>
      <div id="array-labeled-md-body" class="flex flex-col gap-3">body</div>
    </fieldset>

    <fieldset id="array-labeled-sm" class="border-0 p-0 m-0 ${STACK_SM}">
      <legend class="${LEGEND_CONTENTS} w-full min-w-0">
        <div class="text-style-field-label-sm"><span>Traits</span></div>
      </legend>
      <div id="array-labeled-sm-body" class="flex flex-col gap-3">body</div>
    </fieldset>

    <fieldset id="composite-md" class="border-0 p-0 ${STACK_MD} min-w-0">
      <legend class="${LEGEND_CONTENTS}">
        <div class="text-style-field-label-md"><span>Block</span></div>
      </legend>
      <div id="composite-md-body">content</div>
    </fieldset>

    <fieldset id="fieldgroup-array-md" class="border-0 p-0 m-0 min-w-0 ${STACK_MD}">
      <legend class="w-full min-w-0">
        <span class="text-style-field-label-md">Grants</span>
      </legend>
      <div id="fieldgroup-array-md-body" class="flex flex-col gap-6">field</div>
    </fieldset>

    <fieldset id="fieldgroup-section-md" class="border-0 p-0 m-0 min-w-0">
      <legend class="w-full min-w-0 text-style-field-legend">Section</legend>
      <div id="fieldgroup-section-md-body" class="mt-5 flex flex-col gap-6">field</div>
    </fieldset>

    <fieldset id="array-sronly-only" class="border-0 p-0 m-0">
      <legend class="sr-only">Hidden</legend>
      <div id="array-sronly-only-body">body</div>
    </fieldset>

    <fieldset id="array-sronly-hint" class="border-0 p-0 m-0 ${STACK_MD}">
      <legend class="sr-only">Hidden</legend>
      <div class="w-full min-w-0">
        <p class="text-style-caption">Visible hint</p>
      </div>
      <div id="array-sronly-hint-body">body</div>
    </fieldset>
  </body>
</html>`

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

function px(value: string): number {
  return Number.parseFloat(value)
}

describe('field anatomy header→body spacing', () => {
  let browser: Browser
  let css: string

  beforeAll(async () => {
    const tailwind = loadTailwindNode()
    const compiler = await tailwind.compile(readFileSync(globalsPath, 'utf8'), {
      base: dirname(globalsPath),
      from: globalsPath,
      onDependency() {},
    })
    css = compiler.build([
      ...STACK_MD.split(' '),
      ...STACK_SM.split(' '),
      ...LEGEND_CONTENTS.split(' '),
      'sr-only',
      'text-style-field-label-md',
      'text-style-field-label-sm',
      'text-style-field-legend',
      'text-style-caption',
      'gap-3',
      'gap-6',
      'mt-5',
      'flex',
      'flex-col',
      'border-0',
      'p-0',
      'm-0',
      'min-w-0',
      'w-full',
    ])
    browser = await launchHeadlessChromium()
  }, 180_000)

  afterAll(async () => {
    await browser?.close()
  })

  it('maps md/sm row gaps to the canonical header→body steps', async () => {
    const page = await browser.newPage()
    await page.setContent(PROBE_HTML)
    await page.addStyleTag({ content: css })

    const gaps = await page.evaluate(() => {
      const readGap = (id: string) => getComputedStyle(document.getElementById(id)!).rowGap
      return {
        md: readGap('array-labeled-md'),
        sm: readGap('array-labeled-sm'),
        fieldGroupArray: readGap('fieldgroup-array-md'),
        sronlyOnly: readGap('array-sronly-only'),
        sronlyHint: readGap('array-sronly-hint'),
      }
    })

    await page.close()

    expect(px(gaps.md)).toBe(6)
    expect(px(gaps.sm)).toBe(4)
    expect(px(gaps.fieldGroupArray)).toBe(6)
    expect(gaps.sronlyOnly).toBe('normal')
    expect(px(gaps.sronlyHint)).toBe(6)
  })

  it('measures header-bottom to body-top distance for labeled arrays and FieldGroup tiers', async () => {
    const page = await browser.newPage()
    await page.setContent(PROBE_HTML)
    await page.addStyleTag({ content: css })

    const distances = await page.evaluate(() => {
      const distance = (headerSelector: string, bodyId: string) => {
        const header = document.querySelector(headerSelector)!
        const body = document.getElementById(bodyId)!
        return body.getBoundingClientRect().top - header.getBoundingClientRect().bottom
      }
      return {
        arrayMd: distance('#array-labeled-md .text-style-field-label-md', 'array-labeled-md-body'),
        arraySm: distance('#array-labeled-sm .text-style-field-label-sm', 'array-labeled-sm-body'),
        compositeMd: distance('#composite-md .text-style-field-label-md', 'composite-md-body'),
        fieldGroupSection: distance('#fieldgroup-section-md legend', 'fieldgroup-section-md-body'),
        sronlyOnly: distance('#array-sronly-only legend', 'array-sronly-only-body'),
        sronlyHintBand: distance(
          '#array-sronly-hint .text-style-caption',
          'array-sronly-hint-body',
        ),
      }
    })

    await page.close()

    expect(distances.arrayMd).toBeCloseTo(6, 0)
    expect(distances.arraySm).toBeCloseTo(4, 0)
    expect(distances.compositeMd).toBeCloseTo(6, 0)
    expect(distances.fieldGroupSection).toBeGreaterThanOrEqual(18)
    expect(distances.sronlyOnly).toBeLessThan(2)
    expect(distances.sronlyHintBand).toBeCloseTo(6, 0)
  })

  it('keeps stack and label-region tokens on fieldAnatomyHeaderBodyGapClasses', () => {
    expect(fieldAnatomyHeaderBodyGapClasses.md.stack).toBe('gap-y-1.5')
    expect(fieldAnatomyHeaderBodyGapClasses.sm.stack).toBe('gap-y-1')
    expect(fieldAnatomyHeaderBodyGapClasses.md.labelRegionBottom).toBe('has-[*]:pb-1.5')
    expect(fieldAnatomyHeaderBodyGapClasses.sm.labelRegionBottom).toBe('has-[*]:pb-1')
  })
})
