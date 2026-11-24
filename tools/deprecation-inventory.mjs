#!/usr/bin/env node
/**
 * Walk TypeScript sources for `@deprecated` markers and print a TSV inventory.
 *
 * Usage (from repo root):
 *   node tools/deprecation-inventory.mjs
 *   node tools/deprecation-inventory.mjs > .tmp/deprecation-inventory.tsv
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SCAN_ROOTS = ['apps', 'packages']
const SKIP_DIR_NAMES = new Set(['node_modules', 'dist', '.next', 'coverage', 'storybook-static'])

const EXPORT_LINE =
  /^\s*export\s+(?:async\s+)?(?:function|const|type|interface|class|enum)\s+([A-Za-z0-9_$]+)/

function walkTsFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkTsFiles(full, out)
      continue
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue
    out.push(full)
  }
}

function countWordRefs(symbol, definitionFile) {
  try {
    const raw = execFileSync(
      'rg',
      ['-w', symbol, '--glob', '*.{ts,tsx}', '--glob', '!node_modules', repoRoot],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    )
    const lines = raw.split('\n').filter(Boolean)
    const external = lines.filter((line) => {
      const file = line.split(':')[0]
      return path.resolve(file) !== path.resolve(definitionFile)
    })
    return external.length
  } catch {
    return 0
  }
}

function parseReplacement(commentLines) {
  const text = commentLines.join(' ')
  const prefer = text.match(/Prefer [`'"]?([^`'".]+)/i)
  if (prefer) return prefer[1].trim()
  const use = text.match(/Use [`'"]?([^`'".]+)/i)
  if (use) return use[1].trim()
  return ''
}

const files = []
for (const root of SCAN_ROOTS) {
  const abs = path.join(repoRoot, root)
  if (fs.existsSync(abs)) walkTsFiles(abs, files)
}

const rows = []

for (const file of files.sort()) {
  const rel = path.relative(repoRoot, file)
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes('@deprecated')) continue

    const commentStart = lines[i].trimStart().startsWith('*') ? i : Math.max(0, i - 3)
    const commentEnd = Math.min(lines.length - 1, i + 2)
    const commentBlock = lines.slice(commentStart, commentEnd + 1)

    let symbol = ''
    for (let j = i; j < Math.min(i + 6, lines.length); j++) {
      const match = lines[j].match(EXPORT_LINE)
      if (match) {
        symbol = match[1]
        break
      }
      const prop = lines[j].match(/^\s+([A-Za-z0-9_$]+)\??\s*:/)
      if (prop && lines[i].includes('/**')) {
        symbol = prop[1]
        break
      }
    }

    const replacement = parseReplacement(commentBlock)
    const refs = symbol ? countWordRefs(symbol, file) : -1
    rows.push({
      symbol: symbol || '(field)',
      file: rel,
      line: i + 1,
      externalRefs: refs,
      replacement,
    })
  }
}

process.stdout.write('symbol\tfile\tline\texternal_refs\treplacement\n')
for (const row of rows) {
  process.stdout.write(
    `${row.symbol}\t${row.file}\t${row.line}\t${row.externalRefs}\t${row.replacement}\n`,
  )
}

process.stderr.write(`Deprecation markers: ${rows.length}\n`)
