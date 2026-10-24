import { readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { VIEWPORT_MD_MIN_QUERY } from '../hooks/use-media-min-width.client'

const stylesDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(stylesDir, '../../../..')
const breakpointFile = join(stylesDir, 'breakpoints.css')
const globalsFile = join(stylesDir, 'globals.css')

const SCAN_ROOTS = [
  join(repoRoot, 'packages/ui/src'),
  join(repoRoot, 'apps/dashboard/src'),
  join(repoRoot, 'apps/bench/src'),
  join(repoRoot, 'apps/public/src'),
]

const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.next', 'storybook-static'])
const SOURCE_EXT = new Set(['.css', '.ts', '.tsx'])

type TailwindNode = {
  compile: (
    css: string,
    options: { base: string; onDependency: (path: string) => void },
  ) => Promise<{ build: (candidates: string[]) => string }>
}

function loadTailwindNode(): TailwindNode {
  const fromUi = createRequire(import.meta.url)
  const viteEntry = fromUi.resolve('@tailwindcss/vite')
  const vitePackage = join(dirname(viteEntry), '..', 'package.json')
  return createRequire(vitePackage)('@tailwindcss/node') as TailwindNode
}

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      collectSourceFiles(fullPath, files)
      continue
    }
    const ext = entry.slice(entry.lastIndexOf('.'))
    if (!SOURCE_EXT.has(ext)) continue
    if (fullPath.endsWith(`${sep}breakpoint-contract.test.ts`)) continue
    files.push(fullPath)
  }
  return files
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** Viewport width features only. Container queries and other media features are ignored. */
function viewportWidthMedia(css: string): string[] {
  const found: string[] = []
  const source = stripComments(css)
  for (const match of source.matchAll(/@media\b([^{]*)\{/g)) {
    const condition = match[1] ?? ''
    if (/(?:^|[\s,(])(?:min-width|max-width|width)\s*(?:[<>]=?|:)/.test(condition)) {
      found.push(condition.trim())
    }
  }
  return found
}

const ARBITRARY_VIEWPORT_VARIANT = new RegExp(
  String.raw`(?<![\w@-])(?:min|max)-${String.raw`\[`}[^\]]+${String.raw`\]:`}`,
  'g',
)

const FIXTURE = `
@import 'tailwindcss';
@import './breakpoints.css';

@utility probe-utility {
  display: none;
  @variant md {
    display: block;
  }
}

@layer components {
  .probe-component {
    display: none;
    @variant xl {
      display: flex;
    }
  }
}

@layer base {
  .probe-base {
    display: none;
    @variant sm {
      display: inline;
    }
  }
}

.probe-root {
  display: none;
  @variant xl {
    display: grid;
  }
}
`

/** Tailwind nests `@media` / `@container` inside the variant class. */
function expectCompiled(css: string, selector: string, atRule: string) {
  const start = css.indexOf(selector)
  expect(start, `missing selector ${selector}`).toBeGreaterThanOrEqual(0)
  expect(css.slice(start, start + 240), selector).toContain(atRule)
}

function authoredBreakpointMd(): string {
  const source = readFileSync(breakpointFile, 'utf8')
  const value = source.match(/--breakpoint-md:\s*([^;]+);/)?.[1]?.trim()
  expect(value, 'breakpoints.css must declare --breakpoint-md').toBeTruthy()
  return value ?? ''
}

/** Condition inside the generated `md:` rule. The length comes from `breakpoints.css`. */
function compiledMdMediaCondition(css: string): string {
  const selector = '.md\\:flex'
  const start = css.indexOf(selector)
  expect(start, `missing selector ${selector}`).toBeGreaterThanOrEqual(0)
  const condition = css.slice(start, start + 240).match(/@media\s*(\([^)]+\))/)?.[1]
  expect(condition, 'compiled md: rule must include a media condition').toBeTruthy()
  return condition ?? ''
}

const APPROVED_RUNTIME_QUERY_FILE = join(stylesDir, '../hooks/use-media-min-width.client.ts')

/** Parenthesized width queries with a length, such as `(width >= 48rem)`. */
const RUNTIME_WIDTH_QUERY =
  /\(\s*(?:min-width|max-width|width)\s*(?:[<>]=?|:)\s*[\d.]+(?:px|rem|em)\s*\)/g

function stripSourceComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^\\])\/\/.*$/gm, '$1')
}

describe('breakpoint contract', () => {
  it('compiles viewport and container variants from breakpoints.css', async () => {
    const tailwind = loadTailwindNode()
    const compiled = await tailwind.compile(FIXTURE, {
      base: stylesDir,
      onDependency() {},
    })
    const css = compiled.build(['md:flex', 'xl:grid', '@lg:block', '@3xl:inline', 'probe-utility'])

    const compiledMdMediaConditionText = compiledMdMediaCondition(css)
    expect(compiledMdMediaConditionText).toContain(authoredBreakpointMd())
    expect(VIEWPORT_MD_MIN_QUERY).toBe(compiledMdMediaConditionText)
    expectCompiled(css, '.md\\:flex', `@media ${compiledMdMediaConditionText}`)
    expectCompiled(css, '.probe-utility', `@media ${compiledMdMediaConditionText}`)

    expectCompiled(css, '.xl\\:grid', '@media (width >= 80rem)')
    expectCompiled(css, '.\\@lg\\:block', '@container (width >= 32rem)')
    expectCompiled(css, '.\\@3xl\\:inline', '@container (width >= 48rem)')
    expectCompiled(css, '.probe-component', '@media (width >= 80rem)')
    expectCompiled(css, '.probe-base', '@media (width >= 40rem)')
    expectCompiled(css, '.probe-root', '@media (width >= 80rem)')
  })

  it('imports breakpoints.css from globals.css immediately after tailwindcss', () => {
    const source = readFileSync(globalsFile, 'utf8')
    expect(source).toMatch(/@import 'tailwindcss';\s*@import '\.\/breakpoints\.css';/)
  })

  it('resets only the viewport breakpoint namespace', () => {
    const source = readFileSync(breakpointFile, 'utf8')
    expect(source).toContain('--breakpoint-*: initial;')
    expect(source).toContain('--breakpoint-sm: 40rem;')
    expect(source).toContain('--breakpoint-md: 48rem;')
    expect(source).toContain('--breakpoint-lg: 64rem;')
    expect(source).toContain('--breakpoint-xl: 80rem;')
    expect(source).toContain('--breakpoint-2xl: 96rem;')
    const theme = stripSourceComments(source).match(/@theme\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(theme).not.toContain('--container-')
  })

  it('allows --breakpoint-* only in breakpoints.css', () => {
    const declaration = `--breakpoint${'-'}`
    const violations: string[] = []
    for (const file of SCAN_ROOTS.flatMap((root) => collectSourceFiles(root))) {
      if (file === breakpointFile) continue
      const text = readFileSync(file, 'utf8')
      if (!text.includes(declaration)) continue
      violations.push(relative(repoRoot, file))
    }
    expect(violations, violations.join('\n')).toEqual([])
  })

  it('rejects authored viewport-width media queries', () => {
    const violations: string[] = []
    for (const file of SCAN_ROOTS.flatMap((root) => collectSourceFiles(root))) {
      if (!file.endsWith('.css')) continue
      const queries = viewportWidthMedia(readFileSync(file, 'utf8'))
      if (queries.length === 0) continue
      violations.push(`${relative(repoRoot, file)}: ${queries.join(' | ')}`)
    }
    expect(violations, violations.join('\n')).toEqual([])
  })

  it('rejects runtime breakpoint queries outside VIEWPORT_MD_MIN_QUERY', () => {
    const violations: string[] = []
    for (const file of SCAN_ROOTS.flatMap((root) => collectSourceFiles(root))) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue
      const text = stripSourceComments(readFileSync(file, 'utf8'))
      const queries = [...text.matchAll(RUNTIME_WIDTH_QUERY)].map((match) => match[0])
      if (queries.length === 0) continue

      if (file === APPROVED_RUNTIME_QUERY_FILE) {
        const approved = text.match(/VIEWPORT_MD_MIN_QUERY\s*=\s*(['"`])(\([^'"`]+\))\1/)?.[2]
        const extras = queries.filter((query) => query !== approved)
        if (approved && queries.length === 1 && extras.length === 0) continue
        violations.push(
          `${relative(repoRoot, file)}: ${queries.join(', ')} (approved definition ${approved ?? 'missing'})`,
        )
        continue
      }

      violations.push(`${relative(repoRoot, file)}: ${queries.join(', ')}`)
    }
    expect(violations, violations.join('\n')).toEqual([])
  })

  it('rejects arbitrary viewport variants', () => {
    const violations: string[] = []
    for (const file of SCAN_ROOTS.flatMap((root) => collectSourceFiles(root))) {
      const text = readFileSync(file, 'utf8')
      const matches = text.match(ARBITRARY_VIEWPORT_VARIANT)
      if (!matches) continue
      violations.push(`${relative(repoRoot, file)}: ${matches.join(', ')}`)
    }
    expect(violations, violations.join('\n')).toEqual([])
  })
})
