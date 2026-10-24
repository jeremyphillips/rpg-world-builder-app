import { readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser, type Page } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const dashboardCss = join(repoRoot, 'apps/dashboard/src/index.css')

const CONTENT_CAP_PX = 536
const APP_CHROME_PX = 80
const PAGE_HEADING_PX = 64
const FORM_CHROME_PX = 208
const BOTTOM_INSET_PX = 85
const FLOOR_GAP_PX = 16
const WIDE_TOP_PX = APP_CHROME_PX + PAGE_HEADING_PX + FORM_CHROME_PX
const CLIP_PX = 400

type TailwindNode = {
  compile: (
    css: string,
    options: { base: string; from?: string; onDependency: (path: string) => void },
  ) => Promise<{ build: (candidates: string[]) => string }>
}

type Measured = {
  clientHeight: number
  topPx: number
  bottomPx: number
  formChromePx: number
  pageHeadingPx: number
  ancestorTop: string
  shellTop: string
  maxHeight: string
  height: number
}

function loadTailwindNode(): TailwindNode {
  const fromDashboard = createRequire(import.meta.url)
  const viteEntry = realpathSync(fromDashboard.resolve('@tailwindcss/vite'))
  const vitePackage = join(dirname(viteEntry), '..', 'package.json')
  return createRequire(vitePackage)('@tailwindcss/node') as TailwindNode
}

function list(id = 'list') {
  return `<div class="master-detail-grid"><nav id="${id}" class="master-detail-list-shell-viewport-cap" style="overflow:hidden"><div style="height:2400px"></div></nav></div>`
}

function appShell(inner: string) {
  return `<div class="dash-app-shell"><main class="dash-app-shell__main">${inner}</main></div>`
}

const fixtures = {
  appOnly: appShell(list()),
  narrow: appShell(list()),
  wideInsideContainer: appShell(`
    <div class="dash-content-form-page">
      <div id="shell" class="ui-form-docked-shell" style="height:500px">
        <div id="clip" class="form-scroll-body-container" style="height:${CLIP_PX}px;overflow-y:auto;padding:0">
          <div id="tabs" class="ui-form-sticky-tabs" style="height:48px">Tabs</div>
          ${list()}
          <div style="height:800px"></div>
          <div id="last-row">Last row</div>
        </div>
        <div id="bar" class="ui-form-actions-bar ui-form-actions-bar--docked">Save</div>
      </div>
    </div>
  `),
  dockedOutsideApp: `
    <div class="ui-form-docked-shell">
      ${list()}
    </div>
  `,
  nested: appShell(`
    <div class="dash-content-form-page">
      <div class="ui-form-docked-shell">
        <div id="shell" class="ui-form-docked-shell">
          <div class="form-scroll-body-container" style="height:${CLIP_PX}px;padding:0">
            ${list()}
          </div>
        </div>
      </div>
    </div>
  `),
}

async function measure(page: Page): Promise<Measured> {
  return page.evaluate(() => {
    const listEl = document.getElementById('list')!
    const style = getComputedStyle(listEl)
    const used = (name: string) => {
      const probe = document.createElement('div')
      probe.style.height = `var(${name}, 0px)`
      listEl.appendChild(probe)
      const height = getComputedStyle(probe).height
      probe.remove()
      return height
    }
    const ancestor = listEl.closest(
      '.dash-content-form-page, .dash-app-shell__main, .ui-form-docked-shell',
    )
    const shell = document.getElementById('shell')
    return {
      clientHeight: document.documentElement.clientHeight,
      topPx: Number.parseFloat(used('--rpg-content-top-inset')),
      bottomPx: Number.parseFloat(used('--rpg-content-bottom-inset')),
      formChromePx: Number.parseFloat(used('--rpg-form-docked-scroll-top-chrome-inset')),
      pageHeadingPx: Number.parseFloat(used('--rpg-page-heading-inset')),
      ancestorTop: ancestor
        ? getComputedStyle(ancestor).getPropertyValue('--rpg-content-top-inset').trim()
        : '',
      shellTop: shell
        ? getComputedStyle(shell).getPropertyValue('--rpg-content-top-inset').trim()
        : '',
      maxHeight: style.maxHeight,
      height: Math.round(listEl.getBoundingClientRect().height),
    }
  })
}

describe('master-detail content top inset', () => {
  let browser: Browser
  let css: string

  beforeAll(async () => {
    const tailwind = loadTailwindNode()
    const compiler = await tailwind.compile(readFileSync(dashboardCss, 'utf8'), {
      base: dirname(dashboardCss),
      from: dashboardCss,
      onDependency() {},
    })
    css = compiler.build([
      'master-detail-list-shell-viewport-cap',
      'master-detail-grid',
      'form-scroll-body-container',
    ])
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true })
    } catch (chromeError) {
      try {
        browser = await chromium.launch({ headless: true })
      } catch (bundledError) {
        throw new Error(
          `Inset contract checks need Chrome or Playwright's Chromium.\n${String(chromeError)}\n${String(bundledError)}`,
          { cause: bundledError },
        )
      }
    }
  }, 180_000)

  afterAll(async () => {
    await browser?.close()
  })

  async function open(html: string, height: number) {
    const page = await browser.newPage({ viewport: { width: 1280, height } })
    await page.setContent(`<!doctype html><html><body>${html}</body></html>`)
    await page.addStyleTag({ content: css })
    return page
  }

  it('caps an app-only list with the 28rem content length at 900px', async () => {
    const page = await open(fixtures.appOnly, 900)
    const measured = await measure(page)
    await page.close()
    expect(measured.clientHeight).toBe(900)
    expect(measured.topPx).toBe(APP_CHROME_PX)
    expect(measured.bottomPx).toBe(0)
    expect(measured.maxHeight).toBe(`${CONTENT_CAP_PX}px`)
    expect(measured.height).toBe(CONTENT_CAP_PX)
    expect(measured.ancestorTop).toBe('')
  })

  it('lets the dvh cap control an app-only list at 480px', async () => {
    const page = await open(fixtures.appOnly, 480)
    const measured = await measure(page)
    await page.close()
    expect(measured.clientHeight).toBe(480)
    expect(measured.topPx).toBe(APP_CHROME_PX)
    expect(measured.maxHeight).toBe(`${480 - APP_CHROME_PX}px`)
    expect(measured.height).toBe(480 - APP_CHROME_PX)
  })

  it('resolves a narrow document shell the same way as app chrome alone', async () => {
    const page = await open(fixtures.narrow, 900)
    const measured = await measure(page)
    await page.close()
    expect(measured.topPx).toBe(APP_CHROME_PX)
    expect(measured.pageHeadingPx).toBe(0)
    expect(measured.formChromePx).toBe(0)
    expect(measured.maxHeight).toBe(`${CONTENT_CAP_PX}px`)
    expect(measured.height).toBe(CONTENT_CAP_PX)
  })

  it('resolves the wide-form viewport total and caps the list against the clip', async () => {
    const page = await open(fixtures.wideInsideContainer, 900)
    const measured = await measure(page)
    const scroll = await page.evaluate(() => {
      const clip = document.getElementById('clip')!
      const bar = document.getElementById('bar')!
      const tabs = document.getElementById('tabs')!
      const last = document.getElementById('last-row')!
      const before = bar.getBoundingClientRect().top
      const canScroll = clip.scrollHeight > clip.clientHeight
      clip.scrollTop = clip.scrollHeight
      const clipBox = clip.getBoundingClientRect()
      const tabsBox = tabs.getBoundingClientRect()
      const lastBox = last.getBoundingClientRect()
      const barBox = bar.getBoundingClientRect()
      return {
        canScroll,
        barMoved: Math.round(barBox.top - before),
        barBelowClip: barBox.top >= clipBox.bottom - 1,
        tabsPinned: Math.abs(tabsBox.top - clipBox.top) <= 1,
        lastReached: lastBox.bottom <= clipBox.bottom + 1 && lastBox.top >= clipBox.top - 1,
      }
    })
    await page.close()

    expect(measured.topPx).toBe(WIDE_TOP_PX)
    expect(measured.bottomPx).toBe(BOTTOM_INSET_PX)
    expect(measured.formChromePx).toBe(FORM_CHROME_PX)
    expect(measured.pageHeadingPx).toBe(PAGE_HEADING_PX)
    expect(measured.shellTop).toBe('')
    expect(measured.ancestorTop).toBe('')
    expect(measured.maxHeight).toBe(`${CLIP_PX - FORM_CHROME_PX - FLOOR_GAP_PX}px`)
    expect(measured.height).toBe(CLIP_PX - FORM_CHROME_PX - FLOOR_GAP_PX)
    expect(scroll).toEqual({
      canScroll: true,
      barMoved: 0,
      barBelowClip: true,
      tabsPinned: true,
      lastReached: true,
    })
  })

  it('lets the dvh cap control a docked list outside the app and the container', async () => {
    const page = await open(fixtures.dockedOutsideApp, 480)
    const measured = await measure(page)
    await page.close()
    const expected = 480 - FORM_CHROME_PX - BOTTOM_INSET_PX
    expect(measured.clientHeight).toBe(480)
    expect(measured.topPx).toBe(FORM_CHROME_PX)
    expect(measured.bottomPx).toBe(BOTTOM_INSET_PX)
    expect(measured.pageHeadingPx).toBe(0)
    expect(expected).toBeLessThan(CONTENT_CAP_PX)
    expect(measured.maxHeight).toBe(`${expected}px`)
    expect(measured.height).toBe(expected)
  })

  it('counts form chrome once when docked shells are nested inside the wide form', async () => {
    const page = await open(fixtures.nested, 900)
    const measured = await measure(page)
    await page.close()
    expect(measured.topPx).toBe(WIDE_TOP_PX)
    expect(measured.formChromePx).toBe(FORM_CHROME_PX)
    expect(measured.shellTop).toBe('')
    expect(measured.maxHeight).toBe(`${CLIP_PX - FORM_CHROME_PX - FLOOR_GAP_PX}px`)
  })
})
