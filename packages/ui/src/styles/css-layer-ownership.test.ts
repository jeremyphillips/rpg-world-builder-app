import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Browser } from 'playwright'
import { launchHeadlessChromium } from '../test-utils/launch-headless-chromium.lib'
import ts from 'typescript'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const architectureDoc = join(repoRoot, 'packages/ui/docs/ui-architecture.md')

const LAYER_STATEMENT = '@layer theme, base, components, utilities;'
const CANONICAL_LAYER_ORDER = ['properties', 'theme', 'base', 'components', 'utilities']

/** JS/TS modules allowed to import CSS, and the one specifier each may import. */
const ENTRY_CSS_IMPORTS: Record<string, string> = {
  'apps/dashboard/src/main.tsx': './index.css',
  'apps/bench/src/main.tsx': './index.css',
  'apps/public/src/app/layout.tsx': './globals.css',
  'apps/dashboard/.storybook/preview.tsx': './preview.css',
  'packages/ui/.storybook/preview.tsx': './preview.css',
}

/** Stylesheet entries. Each starts with LAYER_STATEMENT and is a CSS import root. */
const STYLESHEET_ENTRIES = [
  'packages/ui/src/styles/globals.css',
  'apps/dashboard/src/index.css',
  'apps/bench/src/index.css',
  'apps/public/src/app/globals.css',
  'apps/dashboard/.storybook/preview.css',
  'packages/ui/.storybook/preview.css',
]

const SCAN_ROOTS = ['apps/dashboard', 'apps/bench', 'apps/public', 'packages/ui']
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'storybook-static',
  'coverage',
  '.turbo',
  '.next',
])

const THIRD_PARTY_CSS = ['tailwindcss', 'tw-animate-css', '@fontsource-variable/inter']
const UI_STYLES = '@rpg/ui/styles.css'
const NEXT_FONT = 'next/font'
const FONTSOURCE = '@fontsource-variable/inter'

/**
 * Unlayered selectors that set real properties. Anything else that sets a
 * non-custom property fails. Custom-property-only rules (tokens) are allowed.
 */
const UNLAYERED_CHROME: Record<string, readonly string[]> = {
  'packages/ui/src/styles/globals.css .prose.prose-sm': ['font-size', 'line-height'],
  'packages/ui/src/styles/globals.css .prose.prose-md': ['font-size', 'line-height'],
}

const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts'])

type TailwindNode = {
  compile: (
    css: string,
    options: { base: string; from?: string; onDependency: (path: string) => void },
  ) => Promise<{ build: (candidates: string[]) => string }>
  optimize: (input: string, options?: { minify?: boolean }) => { code: string }
}

type BuiltSheet = { name: string; dev: string; prod: string }
type ProbeStyles = {
  outlinePad: string
  outlineBorder: string
  utilityPad: string
  utilityBorder: string
  badgePad: string
  prose: string
  proseOnly: string
  xs: string
}

function posix(abs: string) {
  return relative(repoRoot, abs).split(sep).join('/')
}

function walkFiles(dir: string, acc: string[]) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) walkFiles(abs, acc)
    else acc.push(abs)
  }
}

function sourceFiles() {
  const files: string[] = []
  for (const root of SCAN_ROOTS) walkFiles(join(repoRoot, root), files)
  return files.filter((file) => SOURCE_EXT.has(extname(file)))
}

function extname(file: string) {
  const dot = file.lastIndexOf('.')
  return dot === -1 ? '' : file.slice(dot)
}

function scriptKind(file: string) {
  if (file.endsWith('.tsx')) return ts.ScriptKind.TSX
  if (file.endsWith('.jsx')) return ts.ScriptKind.JSX
  if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'))
    return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}

function isRuntimeImport(node: ts.ImportDeclaration) {
  if (!node.importClause) return true
  if (node.importClause.isTypeOnly) return false
  if (node.importClause.name) return true
  const named = node.importClause.namedBindings
  if (named && ts.isNamespaceImport(named)) return true
  if (named && ts.isNamedImports(named))
    return named.elements.some((element) => !element.isTypeOnly)
  return true
}

function specifierText(node: ts.Expression | undefined) {
  return node && ts.isStringLiteral(node) ? node.text : null
}

function cssSideImports(file: string) {
  const source = readFileSync(file, 'utf8')
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file))
  const runtime: string[] = []
  const css: string[] = []
  const fontsource: string[] = []
  const nextFont: string[] = []

  const note = (spec: string | null) => {
    if (!spec) return
    if (spec.endsWith('.css') || spec.includes('.css?')) css.push(spec)
    if (spec === FONTSOURCE || spec.startsWith(`${FONTSOURCE}/`)) fontsource.push(spec)
    if (spec === NEXT_FONT || spec.startsWith(`${NEXT_FONT}/`)) nextFont.push(spec)
  }

  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      note(specifierText(node.moduleSpecifier))
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      const dynamic =
        callee.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(callee) && callee.text === 'require')
      if (dynamic) note(specifierText(node.arguments[0]))
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !isRuntimeImport(statement)) continue
    const spec = specifierText(statement.moduleSpecifier)
    if (spec) runtime.push(spec)
  }

  return { runtime, css, fontsource, nextFont }
}

function stripCssComments(css: string) {
  let out = ''
  let i = 0
  while (i < css.length) {
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2)
      if (end === -1) break
      out += ' '
      i = end + 2
      continue
    }
    const quote = css[i]
    if (quote === '"' || quote === "'") {
      out += quote
      i += 1
      while (i < css.length) {
        out += css[i]
        if (css[i] === '\\') {
          i += 1
          if (i < css.length) out += css[i]
          i += 1
          continue
        }
        if (css[i] === quote) {
          i += 1
          break
        }
        i += 1
      }
      continue
    }
    out += css[i]
    i += 1
  }
  return out
}

function firstStatement(css: string) {
  let i = 0
  while (i < css.length) {
    if (/\s/.test(css[i] ?? '')) {
      i += 1
      continue
    }
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2)
      if (end === -1) return ''
      i = end + 2
      continue
    }
    break
  }
  const semi = css.indexOf(';', i)
  if (semi === -1) return ''
  return css
    .slice(i, semi + 1)
    .replace(/\s+/g, ' ')
    .trim()
}

function isThirdPartyCss(spec: string) {
  return THIRD_PARTY_CSS.some((name) => spec === name || spec.startsWith(`${name}/`))
}

function cssImportSpecs(css: string) {
  const stripped = stripCssComments(css)
  const specs: string[] = []
  const pattern = /@import\s+(?:url\(\s*)?['"]([^'"]+)['"]/g
  for (const match of stripped.matchAll(pattern)) {
    const spec = match[1]
    if (spec) specs.push(spec)
  }
  return specs
}

function resolveCssSpecifier(fromAbs: string, spec: string) {
  if (spec === UI_STYLES) return join(repoRoot, 'packages/ui/src/styles/globals.css')
  if (isThirdPartyCss(spec)) return null
  if (spec.startsWith('.')) {
    const abs = resolve(dirname(fromAbs), spec.split('?')[0] ?? spec)
    return abs
  }
  return undefined
}

function stylesheetGraph() {
  const reachable = new Set<string>()
  const unknown: string[] = []
  const missing: string[] = []

  const visit = (abs: string) => {
    const key = realpathSync(abs)
    if (reachable.has(key)) return
    reachable.add(key)
    for (const spec of cssImportSpecs(readFileSync(abs, 'utf8'))) {
      const resolved = resolveCssSpecifier(abs, spec)
      if (resolved === null) continue
      if (resolved === undefined) {
        unknown.push(`${posix(abs)} imports ${spec}`)
        continue
      }
      if (!existsSync(resolved)) {
        missing.push(`${posix(abs)} imports missing ${spec}`)
        continue
      }
      visit(resolved)
    }
  }

  for (const entry of STYLESHEET_ENTRIES) visit(join(repoRoot, entry))
  return { reachable, unknown, missing }
}

const LAYERED_AT = new Set(['layer', 'utility', 'theme', 'variant', 'custom-variant'])
const SKIP_AT = new Set(['keyframes', 'font-face', 'property', 'page', 'counter-style'])

type CssCursor = { css: string; i: number }

function skipSpace(cursor: CssCursor) {
  while (cursor.i < cursor.css.length && /\s/.test(cursor.css[cursor.i] ?? '')) cursor.i += 1
}

function readPrelude(cursor: CssCursor) {
  const start = cursor.i
  let quote: string | null = null
  let parens = 0
  while (cursor.i < cursor.css.length) {
    const ch = cursor.css[cursor.i] ?? ''
    if (quote) {
      if (ch === '\\') {
        cursor.i += 2
        continue
      }
      if (ch === quote) quote = null
      cursor.i += 1
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      cursor.i += 1
      continue
    }
    if (ch === '(') parens += 1
    else if (ch === ')') parens -= 1
    else if (parens === 0 && (ch === '{' || ch === ';')) break
    cursor.i += 1
  }
  return cursor.css.slice(start, cursor.i).trim()
}

function readBlock(cursor: CssCursor) {
  const start = cursor.i
  let depth = 1
  let quote: string | null = null
  while (cursor.i < cursor.css.length && depth > 0) {
    const ch = cursor.css[cursor.i] ?? ''
    if (quote) {
      if (ch === '\\') {
        cursor.i += 2
        continue
      }
      if (ch === quote) quote = null
      cursor.i += 1
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      cursor.i += 1
      continue
    }
    if (ch === '{') depth += 1
    else if (ch === '}') depth -= 1
    cursor.i += 1
  }
  return cursor.css.slice(start, cursor.i - 1)
}

function normalizeSelector(selector: string) {
  return selector.replace(/\s+/g, ' ').trim()
}

function chromeInBlock(
  body: string,
  selector: string,
  found: Array<{ selector: string; properties: string[] }>,
) {
  const cursor: CssCursor = { css: body, i: 0 }
  const properties: string[] = []
  while (cursor.i < cursor.css.length) {
    skipSpace(cursor)
    if (cursor.i >= cursor.css.length) break
    if (cursor.css[cursor.i] === '}') {
      cursor.i += 1
      continue
    }
    const prelude = readPrelude(cursor)
    const term = cursor.css[cursor.i]
    cursor.i += 1
    if (!prelude || (term !== '{' && term !== ';')) continue
    if (term === ';') {
      if (prelude.startsWith('@')) {
        properties.push(prelude.split(/\s+/)[0] ?? prelude)
        continue
      }
      const colon = prelude.indexOf(':')
      if (colon === -1) continue
      const prop = prelude.slice(0, colon).trim().toLowerCase()
      if (prop && !prop.startsWith('--')) properties.push(prop)
      continue
    }
    const nested = readBlock(cursor)
    if (!prelude.startsWith('@')) chromeInBlock(nested, normalizeSelector(prelude), found)
  }
  if (properties.length > 0) found.push({ selector: normalizeSelector(selector), properties })
}

function unlayeredChrome(css: string) {
  const stripped = stripCssComments(css)
  const cursor: CssCursor = { css: stripped, i: 0 }
  const context: Array<'open' | 'layered' | 'skip'> = ['open']
  const found: Array<{ selector: string; properties: string[] }> = []

  while (cursor.i < stripped.length) {
    skipSpace(cursor)
    if (cursor.i >= stripped.length) break
    if (stripped[cursor.i] === '}') {
      if (context.length > 1) context.pop()
      cursor.i += 1
      continue
    }
    const prelude = readPrelude(cursor)
    const term = stripped[cursor.i]
    cursor.i += 1
    if (!prelude || (term !== '{' && term !== ';')) continue
    if (term === ';') continue

    const parent = context[context.length - 1] ?? 'open'
    if (prelude.startsWith('@')) {
      const name = (prelude.slice(1).match(/^[a-zA-Z-]+/)?.[0] ?? '').toLowerCase()
      if (LAYERED_AT.has(name)) context.push('layered')
      else if (SKIP_AT.has(name)) context.push('skip')
      else context.push(parent)
      continue
    }

    if (parent === 'open') {
      const body = readBlock(cursor)
      chromeInBlock(body, normalizeSelector(prelude), found)
      continue
    }
    context.push(parent)
  }

  return found
}

function layerRegistrationOrder(css: string) {
  const seen = new Set<string>()
  const order: string[] = []
  for (const match of css.matchAll(/@layer\s*([^{;]+)/g)) {
    const body = match[1] ?? ''
    for (const part of body.split(',')) {
      const name = part.trim().split(/\s+/)[0]
      if (!name || seen.has(name)) continue
      seen.add(name)
      order.push(name)
    }
  }
  return order
}

function loadTailwindNode(): TailwindNode {
  const fromUi = createRequire(import.meta.url)
  const viteEntry = realpathSync(fromUi.resolve('@tailwindcss/vite'))
  const vitePackage = join(dirname(viteEntry), '..', 'package.json')
  return createRequire(vitePackage)('@tailwindcss/node') as TailwindNode
}

const PROBE_HTML = `<!doctype html>
<html>
  <body>
    <button id="outline" class="ui-button ui-button--outline ui-button--sm">Import</button>
    <button id="utility" class="ui-button ui-button--outline ui-button--sm p-0 border-0">Reset</button>
    <span id="badge" class="ui-compact-label ui-compact-label--sm">Active</span>
    <div id="prose-only" class="prose prose-sm">Size</div>
    <div id="prose" class="prose prose-sm text-xs">Size</div>
    <div id="xs" class="text-xs">Size</div>
    <div id="probe">Probe</div>
  </body>
</html>`

async function readProbe(page: Awaited<ReturnType<Browser['newPage']>>): Promise<ProbeStyles> {
  return page.evaluate(() => {
    const styleOf = (id: string) => getComputedStyle(document.getElementById(id)!)
    const outline = styleOf('outline')
    const utility = styleOf('utility')
    const badge = styleOf('badge')
    return {
      outlinePad: outline.paddingLeft,
      outlineBorder: outline.borderTopWidth,
      utilityPad: utility.paddingLeft,
      utilityBorder: utility.borderTopWidth,
      badgePad: badge.paddingLeft,
      prose: styleOf('prose').fontSize,
      proseOnly: styleOf('prose-only').fontSize,
      xs: styleOf('xs').fontSize,
    }
  })
}

function expectSemanticCascade(styles: ProbeStyles) {
  expect(styles.outlinePad).toBe('12px')
  expect(styles.outlineBorder).toBe('1px')
  expect(styles.utilityPad).toBe('0px')
  expect(styles.utilityBorder).toBe('0px')
  expect(styles.badgePad).toBe('8px')
  expect(styles.prose).toBe(styles.proseOnly)
  expect(Number.parseFloat(styles.xs)).toBeLessThan(Number.parseFloat(styles.prose))
}

describe('css layer ownership', () => {
  const doc = readFileSync(architectureDoc, 'utf8')

  it('documents the canonical order, entries, and exceptions', () => {
    expect(doc).toContain(LAYER_STATEMENT)
    expect(doc).toContain('properties')
    for (const [entry, specifier] of Object.entries(ENTRY_CSS_IMPORTS)) {
      expect(doc).toContain(entry)
      expect(doc).toContain(specifier.replace('./', ''))
    }
    for (const sheet of STYLESHEET_ENTRIES) expect(doc).toContain(sheet)
    for (const key of Object.keys(UNLAYERED_CHROME)) {
      expect(doc).toContain(key.slice(key.lastIndexOf(' ') + 1))
    }
    for (const pkg of THIRD_PARTY_CSS) expect(doc).toContain(pkg)
    expect(doc).toContain(NEXT_FONT)
  })

  it('imports each designated stylesheet before the app graph', () => {
    const violations: string[] = []
    for (const file of sourceFiles()) {
      const rel = posix(file)
      const imports = cssSideImports(file)
      const allowed = ENTRY_CSS_IMPORTS[rel]
      if (imports.css.length > 0) {
        if (!allowed || imports.css.some((spec) => spec !== allowed)) {
          violations.push(`${rel} imports CSS: ${imports.css.join(', ')}`)
        }
      }
      if (imports.fontsource.length > 0) {
        violations.push(`${rel} imports ${imports.fontsource.join(', ')} from JS`)
      }
      if (imports.nextFont.length > 0 && rel !== 'apps/public/src/app/layout.tsx') {
        violations.push(`${rel} imports ${imports.nextFont.join(', ')}`)
      }
      if (allowed) {
        expect(imports.runtime[0], rel).toBe(allowed)
        if (rel === 'apps/public/src/app/layout.tsx') {
          const fontAt = imports.runtime.findIndex((spec) => spec.startsWith(NEXT_FONT))
          expect(fontAt).toBeGreaterThan(0)
        }
      }
    }
    expect(violations).toEqual([])
  }, 15_000)

  it('keeps semantic CSS inside the entry graph and named layers', () => {
    const graph = stylesheetGraph()
    expect(graph.unknown).toEqual([])
    expect(graph.missing).toEqual([])

    const violations: string[] = []
    const cssFiles: string[] = []
    for (const root of SCAN_ROOTS) walkFiles(join(repoRoot, root), cssFiles)

    for (const file of cssFiles.filter((item) => item.endsWith('.css'))) {
      const rel = posix(file)
      const css = readFileSync(file, 'utf8')
      const real = realpathSync(file)
      const inGraph = graph.reachable.has(real)
      if (STYLESHEET_ENTRIES.includes(rel)) {
        expect(firstStatement(css), rel).toBe(LAYER_STATEMENT)
      }
      if (/@layer\b/.test(stripCssComments(css)) && !inGraph) {
        violations.push(`${rel} uses @layer outside the stylesheet entries`)
      }
      if (!inGraph) continue
      for (const rule of unlayeredChrome(css)) {
        const key = `${rel} ${rule.selector}`
        const allowed = UNLAYERED_CHROME[key]
        if (!allowed) {
          violations.push(`${key} sets unlayered ${rule.properties.join(', ')}`)
          continue
        }
        const extra = rule.properties.filter((prop) => !allowed.includes(prop))
        if (extra.length > 0) violations.push(`${key} adds unlayered ${extra.join(', ')}`)
      }
    }
    expect(violations).toEqual([])
  })
})

describe('css cascade in a browser', () => {
  let browser: Browser
  let built: BuiltSheet[]

  beforeAll(async () => {
    const tailwind = loadTailwindNode()
    built = []
    for (const sheet of STYLESHEET_ENTRIES) {
      const abs = join(repoRoot, sheet)
      const compiler = await tailwind.compile(readFileSync(abs, 'utf8'), {
        base: dirname(abs),
        from: abs,
        onDependency() {},
      })
      const dev = compiler.build(['p-0', 'border-0', 'text-xs'])
      built.push({ name: sheet, dev, prod: tailwind.optimize(dev, { minify: true }).code })
    }
    browser = await launchHeadlessChromium()
  }, 180_000)

  afterAll(async () => {
    await browser?.close()
  })

  it('detects a premature components layer', async () => {
    const page = await browser.newPage()
    await page.setContent(PROBE_HTML)
    await page.addStyleTag({
      content: '@layer components { #probe { padding-left: 12px; } }',
    })
    await page.addStyleTag({
      content:
        '@layer theme, base, components, utilities; @layer base { #probe { padding-left: 0px; } }',
    })
    const padding = await page.evaluate(
      () => getComputedStyle(document.getElementById('probe')!).paddingLeft,
    )
    await page.close()
    expect(padding).toBe('0px')
  })

  it('lets components beat base when the order statement comes first', async () => {
    const page = await browser.newPage()
    await page.setContent(PROBE_HTML)
    await page.addStyleTag({
      content:
        '@layer theme, base, components, utilities; @layer base { #probe { padding-left: 0px; } } @layer components { #probe { padding-left: 12px; } }',
    })
    const padding = await page.evaluate(
      () => getComputedStyle(document.getElementById('probe')!).paddingLeft,
    )
    await page.close()
    expect(padding).toBe('12px')
  })

  it.each(STYLESHEET_ENTRIES)('%s dev and production builds agree', async (name) => {
    const sheet = built.find((item) => item.name === name)
    expect(sheet).toBeDefined()
    expect(layerRegistrationOrder(sheet!.dev)).toEqual(CANONICAL_LAYER_ORDER)
    expect(layerRegistrationOrder(sheet!.prod)).toEqual(CANONICAL_LAYER_ORDER)

    const devPage = await browser.newPage()
    await devPage.setContent(PROBE_HTML)
    await devPage.addStyleTag({ content: sheet!.dev })
    const devStyles = await readProbe(devPage)
    await devPage.close()

    const prodPage = await browser.newPage()
    await prodPage.setContent(PROBE_HTML)
    await prodPage.addStyleTag({ content: sheet!.prod })
    const prodStyles = await readProbe(prodPage)
    await prodPage.close()

    expectSemanticCascade(devStyles)
    expect(prodStyles).toEqual(devStyles)
  })
})
